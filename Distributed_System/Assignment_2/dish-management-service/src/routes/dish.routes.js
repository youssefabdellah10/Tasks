const express = require('express');
const dishController = require('../controllers/dish.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const router = express.Router();

// Public routes
router.get('/getalldishes', dishController.getAllDishes);
router.get('/dish/:id', dishController.getDishById);
router.get('/company/:companyUsername',dishController.getDishesByCompany);
router.post('/check-stock',dishController.checkDishStock);

router.post('/create', authenticateToken, dishController.createDish);
router.put('/update/:id', authenticateToken, dishController.updateDish);
router.get('/my-dishes', authenticateToken, dishController.viewMyDishes);

module.exports = router;
