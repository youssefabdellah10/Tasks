// Main server file for the vulnerable banking application
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan');
const serialize = require('serialize-javascript');
const { exec } = require('child_process');

// Create Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // VULNERABILITY: Misconfigured CORS (allows any origin)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // VULNERABILITY: Large file size limit
  abortOnLimit: false,
  responseOnLimit: "File size limit has been reached"
}));

// VULNERABILITY: Weak session configuration
app.use(session({
  secret: 'banking-app-secret', // VULNERABILITY: Hardcoded secret
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false } // VULNERABILITY: Insecure cookies
}));

// VULNERABILITY: Insufficient logging
app.use(morgan('dev'));

// Database setup
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Initialize database with sample data
function initializeDatabase() {
  db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      email TEXT,
      role TEXT
    )`);

    // Create accounts table
    db.run(`CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      account_number TEXT UNIQUE,
      account_type TEXT,
      balance REAL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Create transactions table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_account INTEGER,
      to_account INTEGER,
      amount REAL,
      description TEXT,
      date TEXT,
      FOREIGN KEY (from_account) REFERENCES accounts(id),
      FOREIGN KEY (to_account) REFERENCES accounts(id)
    )`);

    // Create messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT,
      date TEXT,
      is_read INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Create admin_logs table
    db.run(`CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT,
      user_id INTEGER,
      details TEXT,
      date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Create complaints table
    db.run(`CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      subject TEXT,
      description TEXT,
      file_path TEXT,
      date TEXT,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Insert sample users (VULNERABILITY: Plaintext passwords)
    db.run(`INSERT OR IGNORE INTO users (username, password, email, role) VALUES ('user1', 'password1', 'user1@example.com', 'user')`);
    db.run(`INSERT OR IGNORE INTO users (username, password, email, role) VALUES ('user2', 'password2', 'user2@example.com', 'user')`);
    db.run(`INSERT OR IGNORE INTO users (username, password, email, role) VALUES ('user3', 'password3', 'user3@example.com', 'user')`);
    db.run(`INSERT OR IGNORE INTO users (username, password, email, role) VALUES ('user4', 'password4', 'user4@example.com', 'user')`);
    db.run(`INSERT OR IGNORE INTO users (username, password, email, role) VALUES ('admin', 'admin123', 'admin@example.com', 'admin')`);

    // Insert sample accounts for each user (2 accounts per user)
    db.run(`INSERT OR IGNORE INTO accounts (user_id, account_number, account_type, balance) VALUES (1, '1001-001', 'Checking', 5000.00)`);
    db.run(`INSERT OR IGNORE INTO accounts (user_id, account_number, account_type, balance) VALUES (1, '1001-002', 'Savings', 10000.00)`);
    db.run(`INSERT OR IGNORE INTO accounts (user_id, account_number, account_type, balance) VALUES (2, '1002-001', 'Checking', 3500.00)`);
    db.run(`INSERT OR IGNORE INTO accounts (user_id, account_number, account_type, balance) VALUES (2, '1002-002', 'Savings', 7500.00)`);
    db.run(`INSERT OR IGNORE INTO accounts (user_id, account_number, account_type, balance) VALUES (3, '1003-001', 'Checking', 2800.00)`);
    db.run(`INSERT OR IGNORE INTO accounts (user_id, account_number, account_type, balance) VALUES (3, '1003-002', 'Savings', 15000.00)`);
    db.run(`INSERT OR IGNORE INTO accounts (user_id, account_number, account_type, balance) VALUES (4, '1004-001', 'Checking', 4200.00)`);
    db.run(`INSERT OR IGNORE INTO accounts (user_id, account_number, account_type, balance) VALUES (4, '1004-002', 'Savings', 9000.00)`);
  });
}

initializeDatabase();

// Routes

// VULNERABILITY: SQL Injection in login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // VULNERABILITY: SQL Injection
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  db.get(query, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // VULNERABILITY: Sensitive data exposure
    req.session.user = user;
    res.json(user);
  });
});

// Get user accounts
app.get('/api/accounts', (req, res) => {
  // VULNERABILITY: Missing authentication check
  const userId = req.query.userId;
  
  // VULNERABILITY: SQL Injection
  const query = `SELECT * FROM accounts WHERE user_id = ${userId}`;
  
  db.all(query, (err, accounts) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json(accounts);
  });
});

// Get account transactions (statement)
app.get('/api/transactions', (req, res) => {
  const accountId = req.query.accountId;
  
  // VULNERABILITY: SQL Injection
  const query = `
    SELECT t.*, a1.account_number as from_account_number, a2.account_number as to_account_number 
    FROM transactions t
    LEFT JOIN accounts a1 ON t.from_account = a1.id
    LEFT JOIN accounts a2 ON t.to_account = a2.id
    WHERE t.from_account = ${accountId} OR t.to_account = ${accountId}
    ORDER BY t.date DESC
  `;
  
  db.all(query, (err, transactions) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json(transactions);
  });
});

// Transfer money
app.post('/api/transfer', (req, res) => {
  const { fromAccount, toAccount, amount, description } = req.body;
  
  // VULNERABILITY: No proper validation
  if (!fromAccount || !toAccount || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // VULNERABILITY: No transaction or proper error handling
  db.get(`SELECT balance FROM accounts WHERE id = ${fromAccount}`, (err, account) => {
    if (err || !account) {
      return res.status(500).json({ error: err ? err.message : 'Account not found' });
    }
    
    if (account.balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    // Deduct from source account
    db.run(`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${fromAccount}`);
    
    // Add to destination account
    db.run(`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${toAccount}`);
    
    // Record transaction
    const date = new Date().toISOString();
    db.run(
      `INSERT INTO transactions (from_account, to_account, amount, description, date) 
       VALUES (${fromAccount}, ${toAccount}, ${amount}, '${description}', '${date}')`
    );
    
    res.json({ success: true, message: 'Transfer completed successfully' });
  });
});

// Upload complaint file
app.post('/api/complaints/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'No files were uploaded' });
  }
  
  const { userId, subject, description } = req.body;
  const complaintFile = req.files.file;
  const uploadPath = path.join(__dirname, '../uploads/', complaintFile.name);
  
  // VULNERABILITY: No file type validation
  complaintFile.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const date = new Date().toISOString();
    
    // VULNERABILITY: SQL Injection
    db.run(
      `INSERT INTO complaints (user_id, subject, description, file_path, date) 
       VALUES (${userId}, '${subject}', '${description}', '${uploadPath}', '${date}')`
    );
    
    res.json({ success: true, message: 'Complaint submitted successfully' });
  });
});

// Send message to admin
app.post('/api/messages', (req, res) => {
  const { userId, message } = req.body;
  
  if (!userId || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const date = new Date().toISOString();
  
  // VULNERABILITY: XSS in message (no sanitization)
  db.run(
    `INSERT INTO messages (user_id, message, date) VALUES (${userId}, '${message}', '${date}')`
  );
  
  res.json({ success: true, message: 'Message sent successfully' });
});

// Get admin messages
app.get('/api/admin/messages', (req, res) => {
  // VULNERABILITY: No role check
  db.all(
    `SELECT m.*, u.username FROM messages m JOIN users u ON m.user_id = u.id ORDER BY m.date DESC`,
    (err, messages) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json(messages);
    }
  );
});

// Get admin logs
app.get('/api/admin/logs', (req, res) => {
  // VULNERABILITY: No role check
  db.all(
    `SELECT l.*, u.username FROM admin_logs l JOIN users u ON l.user_id = u.id ORDER BY l.date DESC`,
    (err, logs) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json(logs);
    }
  );
});

// VULNERABILITY: Command Injection
app.post('/api/admin/system-check', (req, res) => {
  const { command } = req.body;
  
  // VULNERABILITY: Command Injection
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ output: stdout });
  });
});

// VULNERABILITY: Insecure Deserialization
app.post('/api/import-data', (req, res) => {
  const { data } = req.body;
  
  try {
    // VULNERABILITY: Insecure Deserialization
    const deserializedData = eval('(' + data + ')');
    
    res.json({ success: true, data: deserializedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABILITY: XXE
app.post('/api/import-xml', (req, res) => {
  const { xml } = req.body;
  
  // VULNERABILITY: XXE
  const parser = new require('xml2js').Parser({
    explicitArray: false,
    normalizeTags: true
  });
  
  parser.parseString(xml, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json(result);
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Vulnerable Banking App running on http://localhost:${PORT}`);
  console.log('WARNING: This application is intentionally vulnerable. DO NOT use in production!');
});