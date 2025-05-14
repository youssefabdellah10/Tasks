const express = require('express');
const dishController = require('../controllers/dish.controller');
const router = express.Router();

router.get('/getalldishes', dishController.getAllDishes);


router.get('/:id', dishController.getDishById);


router.get('/company/:companyUsername',dishController.getDishesByCompany);


router.post('/create', dishController.createDish);
router.put('update/:id', dishController.updateDish);


router.post('/check-stock',dishController.checkDishStock);

module.exports = router;
