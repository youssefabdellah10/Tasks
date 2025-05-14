const jwt = require('jsonwebtoken');
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({message: 'No token provided or invalid format. Please provide a Bearer token.'});
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({message: 'No token provided'});
    }
    const JWT_SECRET = process.env.JWT_SECRET;

    const decoded = jwt.verify(token, JWT_SECRET);
    const sellerusername = decoded.sub;
    const companyUsername = decoded.companyUsername;
    
    if (!sellerusername || !companyUsername) {
      return res.status(401).json({message: 'Token is missing required user information'});
    }
    req.user = { 
      sellerusername,
      companyUsername
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({message: `Invalid token: ${error.message}`});
  }
};

module.exports = { authenticateToken };
