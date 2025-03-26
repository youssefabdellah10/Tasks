const { User } = require('../models/models');

// A1:2021 – Broken Access Control
// A2:2021 – Cryptographic Failures
// A7:2021 – Identification and Authentication Failures
const authController = {
  // Vulnerable login that doesn't use proper authentication
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Vulnerable query - directly comparing plaintext passwords
      const user = await User.findOne({ 
        username: username, 
        password: password // Plaintext password comparison
      });
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // No proper session management or token validation
      // Simply storing user ID in session without encryption
      req.session.userId = user._id;
      req.session.role = user.role;
      
      // Send user data including sensitive info
      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        accounts: user.accounts
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  register: async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      // No input validation or sanitization
      const user = new User({
        username,
        password, // Storing password in plaintext
        email
      });
      
      await user.save();
      
      res.status(201).json({
        id: user._id,
        username: user.username,
        email: user.email
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  logout: (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
  }
};

module.exports = authController;