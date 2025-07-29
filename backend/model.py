from transformers import pipeline
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
import pytz

# Load sentiment-analysis model
sentiment_pipeline = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment")

# Mapping model labels to human-readable sentiments
label_map = {
    'LABEL_0': 'NEGATIVE',
    'LABEL_1': 'NEUTRAL',
    'LABEL_2': 'POSITIVE'
}

# Analyze sentiment using the model
def analyze_sentiment(text: str) -> str:
    result = sentiment_pipeline(text)[0]
    return label_map[result['label']]

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
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    registered_at = Column(DateTime, default=current_ist_time)
    last_login = Column(DateTime, nullable=True)

# LoginEvent model - tracks each login time per user
class LoginEvent(Base):
    __tablename__ = 'login_events'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    login_time = Column(DateTime, default=current_ist_time)
