# Vulnerable Banking Application

This is a deliberately vulnerable web application that demonstrates all OWASP Top 10 vulnerabilities in a simple banking system. **DO NOT USE IN PRODUCTION OR EXPOSE TO THE INTERNET**.

## Features

- User authentication (intentionally vulnerable)
- Account management for 4 pre-configured users with 2 accounts each
- Money transfer functionality
- Statement viewing
- File upload for complaints
- Messaging to admin
- Admin dashboard with action logging

## Vulnerabilities Included

This application intentionally includes all OWASP Top 10 vulnerabilities:

1. Injection (SQL, Command)
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities (XXE)
5. Broken Access Control
6. Security Misconfiguration
7. Cross-Site Scripting (XSS)
8. Insecure Deserialization
9. Using Components with Known Vulnerabilities
10. Insufficient Logging & Monitoring

## Project Structure

```
/
├── backend/              # Express.js server
│   ├── config/           # Database and server configuration
│   ├── controllers/      # Route handlers
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── server.js         # Main server file
├── frontend/             # HTML/CSS frontend
│   ├── admin/            # Admin dashboard
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── index.html        # Main entry point
└── package.json          # Project dependencies
```

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Access the application at http://localhost:3000

## Warning

This application is intentionally vulnerable for educational purposes. Never deploy it in a production environment or expose it to the internet.