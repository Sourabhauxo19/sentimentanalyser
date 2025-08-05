# Sentiment Analyzer Backend

A FastAPI-based backend service for sentiment analysis with user authentication and database storage.

## Features

- User registration and authentication with JWT tokens
- Sentiment analysis using Hugging Face transformers
- PostgreSQL database for data persistence
- Login history tracking
- Chat history for sentiment analysis entries
- Admin endpoints for user management

## Prerequisites

- Python 3.13+
- PostgreSQL database
- Docker (optional, for containerized deployment)

## Setup Instructions

### 1. Install Dependencies

```bash
# Using pip
pip install -r requirements.txt

# Or using Poetry
poetry install
```

### 2. Database Setup

1. Create a PostgreSQL database named `sentimentdb`
2. Update the database credentials in `Secrets.py`:
   ```python
   email="your_postgres_user"
   PASSWORD="your_postgres_password"
   DBNAME="sentimentdb"
   PORT=5432
   ```

3. Initialize the database tables:
   ```bash
   python init_db.py
   ```

### 3. Environment Variables (Optional)

- `DOCKER_ENV`: Set to any value when running in Docker
- `DATABASE_URL`: Override the database connection URL

### 4. Run the Application

```bash
# Development
uvicorn check:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn check:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Login and get JWT token

### Sentiment Analysis
- `POST /analyze` - Analyze text sentiment (requires authentication)

### History
- `GET /login-history/{email}` - Get user login history
- `GET /chat-history/{email}` - Get user sentiment analysis history

### Admin
- `GET /admin/all-users-sentiments` - Get all users' sentiments (admin only)

### Health Check
- `GET /health` - Check application and database health

## Docker Deployment

```bash
# Build the image
docker build -t sentiment-analyzer-backend .

# Run the container
docker run -p 8000:8000 sentiment-analyzer-backend
```

## Troubleshooting

### Database Connection Issues

1. **Connection timeout**: Ensure PostgreSQL is running and accessible
2. **Authentication failed**: Verify credentials in `Secrets.py`
3. **Database does not exist**: Create the database first
4. **Permission denied**: Check PostgreSQL user permissions

### Model Loading Issues

1. **Transformers model download**: Ensure internet connection for first run
2. **Memory issues**: The sentiment model requires significant RAM
3. **CUDA issues**: The model will fall back to CPU if GPU is unavailable

### Common Error Solutions

1. **"column users.email does not exist"**: Run `python init_db.py` to recreate tables
2. **"Invalid token"**: Check JWT secret key configuration
3. **"Database connection failed"**: Verify PostgreSQL is running and credentials are correct

## Security Notes

- Change the JWT secret key in `auth.py` for production
- Use environment variables for sensitive configuration
- Consider using HTTPS in production
- Implement rate limiting for production use

## Logging

Logs are stored in the `logs/` directory and include:
- Application startup/shutdown
- User registration and login events
- Sentiment analysis requests
- Database connection issues
- Error details for debugging 