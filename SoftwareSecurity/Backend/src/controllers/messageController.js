const { Message, User } = require('../models/models');

// A3:2021 – Injection
// A7:2021 – Identification and Authentication Failures
const messageController = {
  sendMessage: async (req, res) => {
    try {
      const { content } = req.body;
      
      // No input sanitization - vulnerable to XSS
      const message = new Message({
        from: req.session.userId,
        content
      });
      
      await message.save();
      
      res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  getMessages: async (req, res) => {
    try {
      // SQL Injection vulnerability example (using NoSQL equivalent)
      const searchTerm = req.query.search;
      let query = {};
      
      if (searchTerm) {
        // Constructing query with string concatenation (vulnerable to NoSQL injection)
        // In a SQL context, this would be a SQL injection vulnerability
        query = { content: { $regex: searchTerm, $options: 'i' } };
      }
      
      // Vulnerable pagination that can cause DoS by requesting a huge page size
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const messages = await Message.find(query)
        .populate('from', 'username')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ timestamp: -1 });
      
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // A6:2021 – Vulnerable and Outdated Components
  // Intentionally using a "vulnerable" function (for demonstration)
  deleteMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      
      // Using an insecure method to delete (demonstration only)
      // In a real app, this might represent using an outdated library with vulnerabilities
      await unsafeDeleteOperation(messageId);
      
      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// A mock "unsafe" function representing a vulnerable component
async function unsafeDeleteOperation(id) {
  // This is just a placeholder - in a real application, this would
  // be an actual outdated/vulnerable component
  return await Message.findByIdAndDelete(id);
}

module.exports = messageController;