from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from auth import verify_password, get_password_hash, create_access_token
from model import (
    analyze_sentiment, SentimentEntry, User, LoginEvent,
    Base, current_ist_time
)
from fastapi import Request
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
import os
import logging
from fastapi import Form
from auth import SECRET_KEY, ALGORITHM
# -------------------- Logging Setup --------------------
LOG_DIR = "logs"
LOG_FILE = "app.log"
os.makedirs(LOG_DIR, exist_ok=True)
log_path = os.path.join(LOG_DIR, LOG_FILE)

logger = logging.getLogger("sentiment-app")
logger.setLevel(logging.INFO)
logger.handlers.clear()

# Handlers
console_handler = logging.StreamHandler()
file_handler = logging.FileHandler(log_path)

# Formatter
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
console_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

# Add handlers
logger.addHandler(console_handler)
logger.addHandler(file_handler)

# -------------------- Database Setup --------------------
from Secrets import email, PASSWORD, DBNAME, PORT
host = "host.docker.internal" if os.getenv("DOCKER_ENV") else "localhost"
URL = f"postgresql://{email}:{PASSWORD}@{host}:{PORT}/{DBNAME}"
DATABASE_URL = os.getenv("DATABASE_URL", URL)
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)

def init_db():
    """Initialize database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"DB Table creation failed: {e}")
        # Try to create tables individually
        try:
            from model import User, SentimentEntry, LoginEvent
            User.__table__.create(bind=engine, checkfirst=True)
            SentimentEntry.__table__.create(bind=engine, checkfirst=True)
            LoginEvent.__table__.create(bind=engine, checkfirst=True)
            logger.info("Database tables created individually")
        except Exception as e2:
            logger.error(f"Individual table creation failed: {e2}")

# Initialize database
init_db()

# -------------------- FastAPI App --------------------
app = FastAPI(title="Sentiment Analyzer API", version="1.0.0")
def log_request_info(request: Request, context: str):
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "unknown")
    logger.info(f"{context} | IP: {client_ip} | User-Agent: {user_agent}")

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("Starting Sentiment Analyzer API...")
    try:
        # Test database connection
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Database connection failed on startup: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class TextInput(BaseModel):
    text: str

class LoginRequest(BaseModel):
    email: str
    password: str

# -------------------- Health Check --------------------
@app.get("/health")
def health_check():
    """Health check endpoint to test database connectivity"""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

def get_db():
    db = SessionLocal()
    try:
        # Test the connection
        db.execute(text("SELECT 1"))
        yield db
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        db.close()
        raise HTTPException(status_code=500, detail="Database connection failed")
    finally:
        db.close()

# -------------------- Register --------------------
@app.post("/register")
def register(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
    request: Request = None
):
    log_request_info(request, "Register attempt")

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    if not password or len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        logger.info(f"Registration failed - email exists: {email}")
        raise HTTPException(status_code=400, detail="email already exists")
    
    try:
        hashed_password = get_password_hash(password)
        user = User(email=email, hashed_password=hashed_password)
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"User registered: {email}")
        return {"msg": "User registered", "registered_at": user.registered_at.isoformat()}
    except Exception as e:
        logger.error(f"Registration error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Registration failed")

# -------------------- Login --------------------
@app.post("/login")
def login(
    form: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db),
    request: Request = None
):
    log_request_info(request, "Login attempt")

    try:
        email = form.username
        password = form.password
        
        logger.info(f"Login attempt for email: {email}")
        
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            logger.warning(f"Login failed - user not found: {email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not verify_password(password, user.hashed_password):
            logger.warning(f"Login failed - invalid password for user: {email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")

        now = current_ist_time()
        user.last_login = now
        db.add(LoginEvent(user_id=user.id, login_time=now))
        db.commit()

        token = create_access_token(data={"sub": user.email})
        logger.info(f"User logged in: {user.email}")
        return {
            "access_token": token,
            "token_type": "bearer",
            "last_login": now.isoformat(),
            "role": user.role
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed due to server error")

# -------------------- Alternative Login (JSON) --------------------
@app.post("/login-json")
def login_json(
    request_data: LoginRequest,
    db: Session = Depends(get_db),
    request: Request = None
):
    log_request_info(request, "Login JSON attempt")

    try:
        user = db.query(User).filter(User.email == request_data.email).first()
        if user is None or not verify_password(request_data.password, user.hashed_password):
            logger.warning(f"Login failed for user: {request_data.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")

        now = current_ist_time()
        user.last_login = now
        db.add(LoginEvent(user_id=user.id, login_time=now))
        db.commit()

        token = create_access_token(data={"sub": user.email})
        logger.info(f"User logged in: {user.email}")
        return {
            "access_token": token,
            "token_type": "bearer",
            "last_login": now.isoformat(),
            "role": user.role
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed due to server error")

# -------------------- Analyze Sentiment --------------------
@app.post("/analyze")
def analyze(input: TextInput, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Validate input text
        if not input.text or len(input.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        sentiment = analyze_sentiment(input.text)
        entry = SentimentEntry(user_id=user.id, text=input.text, sentiment=sentiment)
        db.add(entry)
        db.commit()
        logger.info(f"Sentiment entry added for {email}")
        return {
            "sentiment": sentiment,
            "timestamp": entry.timestamp.isoformat()
        }
    except JWTError:
        logger.error("Token decoding failed")
        raise HTTPException(status_code=401, detail="Invalid token")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail="Sentiment analysis failed")

# -------------------- Login History --------------------
@app.get("/login-history/{email}")
def login_history(email: str, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        history = db.query(LoginEvent).filter(LoginEvent.user_id == user.id).order_by(LoginEvent.login_time.desc()).all()
        return [{"login_time": e.login_time.isoformat()} for e in history]
    except Exception as e:
        logger.error(f"Login history error for {email}: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch login history")

# -------------------- Chat History --------------------
@app.get("/chat-history/{email}")
def chat_history(email: str, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        entries = db.query(SentimentEntry).filter(SentimentEntry.user_id == user.id).order_by(SentimentEntry.timestamp.desc()).all()
        return [
            {
                "text": entry.text,
                "sentiment": entry.sentiment,
                "timestamp": entry.timestamp.isoformat()
            } for entry in entries
        ]
    except Exception as e:
        logger.error(f"Chat history error for {email}: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch chat history")

@app.get("/admin/all-users-sentiments")
def all_users_sentiments(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Check if the requester is admin
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user or user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")

    # Get all users
    users = db.query(User).all()
    result = {}
    for u in users:
        sentiments = db.query(SentimentEntry).filter(SentimentEntry.user_id == u.id).all()
        result[u.email] = {
            s.text: s.sentiment for s in sentiments
        }
    return result