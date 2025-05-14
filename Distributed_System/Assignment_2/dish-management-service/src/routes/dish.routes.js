const express = require('express');
const dishController = require('../controllers/dish.controller');
const router = express.Router();

router.get('/getalldishes', dishController.getAllDishes);

// Get a dish by ID (public access)
router.get('/:id', dishController.getDishById);

// Get dishes by company ID
router.get('/company/:companyUsername',dishController.getDishesByCompany);

// Create, update and delete dishes (only company representatives)
router.post('/create', dishController.createDish);
router.put('/:id', dishController.updateDish);

// Check dish stock
router.post('/check-stock',dishController.checkDishStock);

module.exports = router;
