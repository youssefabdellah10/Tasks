const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const complaintRoutes = require('./routes/complaint');
const messageRoutes = require('./routes/message');
const adminRoutes = require('./routes/admin');

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend origin
  credentials: true // Allow cookies to be sent with requests
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// A5:2021 – Security Misconfiguration
// Insecure session configuration
app.use(session({
  secret: 'insecure_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Not using HTTPS
    httpOnly: false // Allows JavaScript to access cookies
  }
}));

// A8:2021 – Software and Data Integrity Failures
// Insecure file upload configuration
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  abortOnLimit: false,
  responseOnLimit: 'File size limit has been reached',
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Static files directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// A2:2021 – Cryptographic Failures
// Exposing too much information in errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
    stack: err.stack // Exposing stack trace to clients
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;