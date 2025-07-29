# Frontend Application for FastAPI Integration

This project is a frontend application built with React that integrates with a FastAPI backend for user registration, login, and sentiment analysis.

## Project Structure

```
frontend-app
├── public
│   └── index.html          # Main HTML file serving as the entry point
├── src
│   ├── api
│   │   └── index.js        # API functions to interact with the FastAPI backend
│   ├── components
│   │   ├── LoginForm.js     # Component for user login
│   │   ├── RegisterForm.js  # Component for user registration
│   │   └── SentimentForm.js # Component for sentiment analysis input
│   ├── pages
│   │   ├── Home.js         # Home page component
│   │   ├── Login.js        # Login page component
│   │   ├── Register.js     # Registration page component
│   │   └── Dashboard.js     # Dashboard for logged-in users
│   ├── App.js              # Main application component
│   └── index.js            # Entry point of the React application
├── package.json             # npm configuration file
├── README.md                # Project documentation
└── .gitignore               # Git ignore file
```

## Setup Instructions

1. **Clone the Repository**
   ```
   git clone <repository-url>
   cd frontend-app
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed. Then run:
   ```
   npm install
   ```

3. **Run the Application**
   Start the development server:
   ```
   npm start
   ```
   The application will be available at `http://localhost:3000`.

## Usage

- **Registration**: Navigate to the registration page to create a new account.
- **Login**: Use the login page to access your account.
- **Sentiment Analysis**: After logging in, you can analyze text sentiment on the dashboard.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.