const express = require('express');
const dishController = require('../controllers/dish.controller');
const { authenticate, authorizeCompany } = require('../middleware/auth.middleware');
const { 
  validateRequest, 
  dishValidationRules, 
  stockCheckValidationRules,
  dishIdParamValidation,
  companyIdParamValidation
} = require('../middleware/validation.middleware');
const router = express.Router();

// Public routes
// Get all dishes (public access)
router.get('/', dishController.getAllDishes);

// Get a dish by ID (public access)
router.get('/:id', dishIdParamValidation, validateRequest, dishController.getDishById);

// Protected routes (require authentication)
// Get dishes by company ID
router.get('/company/:companyId', authenticate, companyIdParamValidation, validateRequest, dishController.getDishesByCompany);

// Create, update and delete dishes (only company representatives)
router.post('/', authenticate, authorizeCompany, dishValidationRules, validateRequest, dishController.createDish);
router.put('/:id', authenticate, authorizeCompany, dishIdParamValidation, dishValidationRules, validateRequest, dishController.updateDish);

// Check dish stock
router.post('/check-stock', authenticate, stockCheckValidationRules, validateRequest, dishController.checkDishStock);

module.exports = router;
