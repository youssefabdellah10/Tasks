const { User, ActivityLog } = require('../models/models');

// A9:2021 – Security Logging and Monitoring Failures
const adminController = {
  // Poor logging implementation
  getActivityLogs: async (req, res) => {
    try {
      // No proper authentication or authorization check for admin-only endpoint
      const logs = await ActivityLog.find()
        .populate('userId', 'username')
        .sort({ timestamp: -1 });
      
      // No sanitization of logs before sending to client
      res.json(logs);
    } catch (error) {
      // Poor error handling - exposes stack trace
      console.error(error);
      res.status(500).json({ message: 'Server error', stack: error.stack });
    }
  },
  
  // A1:2021 – Broken Access Control
  // A2:2021 – Cryptographic Failures
  getAllUsers: async (req, res) => {
    try {
      // No proper role check
      // Only checks presence of role but not its value
      if (!req.session.role) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      // No pagination, returns all users at once
      const users = await User.find().select('+password'); // Includes passwords in response
      
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // A1:2021 – Broken Access Control
  // A3:2021 – Injection
  updateUserRole: async (req, res) => {
    try {
      const { userId, newRole } = req.body;
      
      // Insufficient role validation
      if (req.session.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      // Direct assignment of user-provided data without validation
      // Vulnerable to NoSQL injection
      const user = await User.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = adminController;