# // Root: sentiment-analysis-app

# // ---------------------
# // 1. BACKEND (FastAPI + Poetry + PostgreSQL)
# // ---------------------
# // File: backend/pyproject.toml
# [tool.poetry]
name = "sentiment_api"
version = "0.1.0"
description = "FastAPI sentiment analysis backend"
authors = ["Your Name <you@example.com>"]

[tool.poetry.dependencies]
python = "^3.9"
fastapi = "^0.111.0"
uvicorn = "^0.30.1"
textblob = "^0.18.0"
psycopg2-binary = "^2.9.9"
sqlalchemy = "^2.0.30"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

// File: backend/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from textblob import TextBlob
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/sentimentdb")

Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class SentimentEntry(Base):
    __tablename__ = 'sentiments'
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    sentiment = Column(String)

Base.metadata.create_all(bind=engine)

class TextInput(BaseModel):
    text: str

app = FastAPI()

@app.post("/analyze")
def analyze_sentiment(input: TextInput):
    blob = TextBlob(input.text)
    polarity = blob.sentiment.polarity
    sentiment = "positive" if polarity > 0 else "negative" if polarity < 0 else "neutral"

    db = SessionLocal()
    entry = SentimentEntry(text=input.text, sentiment=sentiment)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    db.close()

    return {"sentiment": sentiment}

// ---------------------
// 2. FRONTEND (Next.js + npm)
// ---------------------
// File: frontend/package.json
{
  "name": "sentiment-frontend",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "axios": "^1.6.7",
    "next": "^14.2.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}

// File: frontend/pages/index.js
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [text, setText] = useState('');
  const [sentiment, setSentiment] = useState('');

  const handleAnalyze = async () => {
    const res = await axios.post('http://localhost:8000/analyze', { text });
    setSentiment(res.data.sentiment);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">Sentiment Analysis App</h1>
      <textarea
        className="border p-2 w-full max-w-lg"
        rows="5"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your text here"
      />
      <button
        onClick={handleAnalyze}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Analyze
      </button>
      {sentiment && (
        <div className="mt-4 text-xl">Sentiment: <strong>{sentiment}</strong></div>
      )}
    </div>
  );
}

// ---------------------
// 3. DOCKER SETUP
// ---------------------
// File: docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db/sentimentdb
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: sentimentdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:

// File: backend/Dockerfile
FROM python:3.9
WORKDIR /app
COPY pyproject.toml .
RUN pip install poetry && poetry config virtualenvs.create false && poetry install
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

// File: frontend/Dockerfile
FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

// ---------------------
// 4. DATABASE ACCESS (DBeaver)
// ---------------------
// Use DBeaver to connect to localhost:5432 with user `postgres`, password `password`, and DB `sentimentdb`

// ---------------------
// 5. GITHUB INTEGRATION
// ---------------------
// CLI Commands:
// gh repo create sentiment-analysis-app --public --source=. --remote=origin
// git add .
// git commit -m "Initial PoC commit"
// git push origin main
