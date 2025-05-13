// Response utility functions for consistent API responses

// Success response format
exports.successResponse = (message, data = null) => {
  return {
    success: true,
    message,
    data
  };
};

// Error response format
exports.errorResponse = (message, errors = null) => {
  return {
    success: false,
    message,
    errors
  };
};

// Async handler to avoid try-catch blocks in controllers
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler middleware
exports.errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Determine status code based on error type
  const statusCode = err.statusCode || 500;
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    errors: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
