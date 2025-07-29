from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.auth import verify_password, get_password_hash, create_access_token
from backend.model import (
    analyze_sentiment, SentimentEntry, User, LoginEvent,
    Base, current_ist_time
)
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from backend.auth import SECRET_KEY, ALGORITHM
import os
import logging
from fastapi import Form


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
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:local19@localhost:5432/sentimentdb")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logger.error(f"DB Table creation failed: {e}")

# -------------------- FastAPI App --------------------
app = FastAPI()
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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------- Register --------------------
@app.post("/register")
def register(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        logger.info(f"Registration failed - Username exists: {username}")
        raise HTTPException(status_code=400, detail="Username already exists")
    
    try:
        hashed_password = get_password_hash(password)
        user = User(username=username, hashed_password=hashed_password)
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"User registered: {username}")
        return {"msg": "User registered", "registered_at": user.registered_at.isoformat()}
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")
# -------------------- Login --------------------
@app.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.username == form.username).first()
        if user is None or not verify_password(form.password, user.hashed_password):
            logger.warning(f"Login failed for user: {form.username}")
            raise HTTPException(status_code=401, detail="Invalid credentials")

        now = current_ist_time()
        user.last_login = now
        db.add(LoginEvent(user_id=user.id, login_time=now))
        db.commit()

        token = create_access_token(data={"sub": user.username})
        logger.info(f"User logged in: {user.username}")
        return {
            "access_token": token,
            "token_type": "bearer",
            "last_login": now.isoformat()
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
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        sentiment = analyze_sentiment(input.text)
        entry = SentimentEntry(user_id=user.id, text=input.text, sentiment=sentiment)
        db.add(entry)
        db.commit()
        logger.info(f"Sentiment entry added for {username}")
        return {
            "sentiment": sentiment,
            "timestamp": entry.timestamp.isoformat()
        }
    except JWTError:
        logger.error("Token decoding failed")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail="Sentiment analysis failed")

# -------------------- Login History --------------------
@app.get("/login-history/{username}")
def login_history(username: str, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        history = db.query(LoginEvent).filter(LoginEvent.user_id == user.id).order_by(LoginEvent.login_time.desc()).all()
        return [{"login_time": e.login_time.isoformat()} for e in history]
    except Exception as e:
        logger.error(f"Login history error for {username}: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch login history")

# -------------------- Chat History --------------------
@app.get("/chat-history/{username}")
def chat_history(username: str, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.username == username).first()
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
        logger.error(f"Chat history error for {username}: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch chat history")
