// Authentication middleware
const { errorResponse } = require('../utils/response.utils');

// Simple authentication middleware that uses user ID instead of tokens
exports.authenticate = (req, res, next) => {
  // Get user ID from headers
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json(errorResponse('Authentication required. Please provide a user-id header.'));
  }

  // Attach userId to request object for use in route handlers
  req.user = { id: userId };
  next();
};

// Authorization middleware for company representatives
exports.authorizeCompany = (req, res, next) => {
  // Since we're using simple user IDs, we'll authorize any authenticated user
  // In a real app, you would check if the user belongs to the company
  // For this example, we'll assume the companyId is the same as userId
  
  req.user.companyId = req.user.id; // Using the user ID as the company ID for simplicity

  next();
};
