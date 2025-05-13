// Validation middleware
const { body, param, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response.utils');

// Validate request middleware
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errorResponse('Validation failed', errors.array()));
  }
  next();
};

// Dish validation rules
exports.dishValidationRules = [
  body('name')
    .notEmpty().withMessage('Dish name is required')
    .isString().withMessage('Dish name must be a string'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock')
    .notEmpty().withMessage('Stock quantity is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
];

// Stock check validation rules
exports.stockCheckValidationRules = [
  body('items')
    .isArray().withMessage('Items must be an array')
    .notEmpty().withMessage('Items array cannot be empty'),
  body('items.*.dishId')
    .notEmpty().withMessage('Dish ID is required for each item')
    .isUUID().withMessage('Dish ID must be a valid UUID'),
  body('items.*.quantity')
    .notEmpty().withMessage('Quantity is required for each item')
    .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
];

// Dish ID parameter validation
exports.dishIdParamValidation = [
  param('id')
    .notEmpty().withMessage('Dish ID is required')
    .isUUID().withMessage('Dish ID must be a valid UUID'),
];

// Company ID parameter validation
exports.companyIdParamValidation = [
  param('companyId')
    .notEmpty().withMessage('Company ID is required')
    .isUUID().withMessage('Company ID must be a valid UUID'),
];
