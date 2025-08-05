from transformers import pipeline
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
import pytz

# Global variable for sentiment pipeline
sentiment_pipeline = None

# Mapping model labels to human-readable sentiments
label_map = {
    'LABEL_0': 'NEGATIVE',
    'LABEL_1': 'NEUTRAL',
    'LABEL_2': 'POSITIVE'
}

def load_sentiment_model():
    """Load the sentiment analysis model"""
    global sentiment_pipeline
    if sentiment_pipeline is None:
        try:
            sentiment_pipeline = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment")
            print("Sentiment model loaded successfully.")
        except Exception as e:
            print(f"Error loading sentiment model: {e}")
            raise

# Analyze sentiment using the model
def analyze_sentiment(text: str) -> str:
    global sentiment_pipeline
    if sentiment_pipeline is None:
        load_sentiment_model()
    
    try:
        result = sentiment_pipeline(text)[0]
        return label_map[result['label']]
    except Exception as e:
        print(f"Error analyzing sentiment: {e}")
        return "NEUTRAL"  # Fallback to neutral

# Get current time in IST
def current_ist_time():
    ist = pytz.timezone('Asia/Kolkata')
    return datetime.now(ist)

# SQLAlchemy base
Base = declarative_base()

# SentimentEntry model - stores each sentiment analysis entry
class SentimentEntry(Base):
    __tablename__ = 'sentiments'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))  # track which user did the analysis
    text = Column(String, nullable=False)
    sentiment = Column(String, nullable=False)
    timestamp = Column(DateTime, default=current_ist_time)

# User model - stores user credentials and metadata
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default='USER', nullable=False)  # default role is 'user'
    hashed_password = Column(String, nullable=False)
    registered_at = Column(DateTime, default=current_ist_time)
    last_login = Column(DateTime, nullable=True)

# LoginEvent model - tracks each login time per user
class LoginEvent(Base):
    __tablename__ = 'login_events'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    login_time = Column(DateTime, default=current_ist_time)
