const Dish = require('../models/dish.model');
const { publishMessage } = require('../services/rabbitmq.service');
const { successResponse, errorResponse} = require('../utils/response.utils');

exports.getAllDishes = async(res) => {
  const dishes = await Dish.findAll();
  res.status(200).json(successResponse('All dishes retrieved successfully', dishes));
}


exports.getDishesByCompany = async(req, res) => {
  const { companyId } = req.params;

  if (!companyId) {
    return res.status(400).json(errorResponse('Company ID is required'));
  }
  
  const dishes = await Dish.findAll({ where: { companyId } });
  
  if (dishes.length === 0) {
    return res.status(404).json(errorResponse('No dishes found for this company'));
  }
  
  res.status(200).json(successResponse('Dishes retrieved successfully', dishes));
}


exports.getDishById =async(req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json(errorResponse('Dish ID is required'));
  }
  
  const dish = await Dish.findByPk(id);
  
  if (!dish) {
    return res.status(404).json(errorResponse('Dish not found'));
  }
  
  res.status(200).json(successResponse('Dish retrieved successfully', dish));
}


exports.createDish = async(req, res) => {
  const { name, description, price, stock, companyId } = req.body;

  if (!name || !price || !stock || !companyId) {
    return res.status(400).json(errorResponse('Name, price, stock, and company ID are required'));
  }
  
  if (!req.user || !req.user.id) {
    return res.status(403).json(errorResponse('Authentication required to create dishes'));
  }
  const dishCompanyId = companyId || req.user.id;
  
  const newDish = await Dish.create({ 
    name, 
    description, 
    price, 
    stock, 
    companyId: dishCompanyId 
  });
  
  res.status(201).json(successResponse('Dish created successfully', newDish));
}

exports.updateDish = async(req, res) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;

  if (!id) {
    return res.status(400).json(errorResponse('Dish ID is required'));
  }
  
  // Check if the user is a company representative
  if (!req.user || !req.user.id) {
    return res.status(403).json(errorResponse('Authentication required to update dishes'));
  }
  
  // Check if the dish exists and belongs to the company
  const dish = await Dish.findByPk(id);
  
  if (!dish) {
    return res.status(404).json(errorResponse('Dish not found'));
  }
  
  if (dish.companyId.toString() !== req.user.id) {
    return res.status(403).json(errorResponse('You can only update dishes from your own company'));
  }
  
  // Update the dish
  const updatedDish = await Dish.update(
    { name, description, price, stock },
    { where: { id }, returning: true }
  );
  
  res.status(200).json(successResponse('Dish updated successfully', updatedDish[1][0]));
} 

// Check dish stock
exports.checkDishStock = async(req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json(errorResponse('Items array is required'));
  }
  
  try {
    // Check stock for each item
    const stockResults = [];
    let allAvailable = true;
    
    for (const item of items) {
      const { dishId, quantity } = item;
      
      if (!dishId || !quantity) {
        return res.status(400).json(errorResponse('Each item must have dishId and quantity'));
      }
      
      const dish = await Dish.findByPk(dishId);
      
      if (!dish) {
        stockResults.push({
          dishId,
          available: false,
          message: 'Dish not found',
          requestedQuantity: quantity,
          availableQuantity: 0
        });
        allAvailable = false;
        continue;
      }
      
      const isAvailable = dish.stock >= quantity;
      
      stockResults.push({
        dishId,
        name: dish.name,
        available: isAvailable,
        message: isAvailable ? 'In stock' : 'Insufficient stock',
        requestedQuantity: quantity,
        availableQuantity: dish.stock
      });
      
      if (!isAvailable) {
        allAvailable = false;
      }
    }
    
    return res.status(200).json(successResponse(
      allAvailable ? 'All items available' : 'Some items are not available',
      {
        allAvailable,
        items: stockResults
      }
    ));
  } catch (error) {
    console.error('Error checking stock:', error);
    return res.status(500).json(errorResponse('Error checking stock'));
  }
}

