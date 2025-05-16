const Dish = require('../models/dish.model');
const { sendNumberToQueue } = require('../services/rabbitmq.service');

exports.getAllDishes = async(req, res) => {
  try {
    const dishes = await Dish.findAll();
    res.status(200).json({message: 'All dishes retrieved successfully', dishes });
  } catch (error) {
    console.error('Error retrieving dishes:', error);
    res.status(500).json({message: 'Error retrieving dishes', error: error.message });
  }
};

exports.getDishesByCompany = async(req, res) => {
  const { companyUsername } = req.params;

  if (!companyUsername) {
    return res.status(400).json({message: 'Company username is required'});
  }
  
  try {
    const dishes = await Dish.findAll({ where: { companyUsername } });
    
    if (dishes.length === 0) {
      return res.status(404).json({message: 'No dishes found for this company'});
    }
    
    res.status(200).json({message: 'Dishes retrieved successfully', dishes });
  } catch (error) {
    console.error('Error retrieving company dishes:', error);
    res.status(500).json({message: 'Error retrieving company dishes', error: error.message });
  }
};

exports.getDishById = async(req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({message: 'Dish ID is required'});
  }
  
  try {
    const dish = await Dish.findByPk(id);
    
    if (!dish) {
      return res.status(404).json({message: 'Dish not found'});
    }
    
    res.status(200).json({message: 'Dish retrieved successfully', dish });
  } catch (error) {
    console.error('Error retrieving dish:', error);
    res.status(500).json({message: 'Error retrieving dish', error: error.message });
  }
};

exports.createDish = async(req, res) => {
  const { name, description, price, stock} = req.body;

  if (!name || !price || !stock || !description) {
    return res.status(400).json({message: 'Name, price, stock, and description are required'});
  }
  
  const { sellerusername, companyUsername } = req.user;
  if (!sellerusername || !companyUsername) {
    return res.status(403).json({message: 'Authentication required to create dishes'});
  }
  
  try {
    const newDish = await Dish.create({ 
      name, 
      description, 
      price, 
      stock, 
      companyUsername, 
      sellerusername
    });
    
    res.status(201).json({message: 'Dish created successfully', dish: newDish });
  } catch (error) {
    console.error('Error creating dish:', error);
    res.status(500).json({message: 'Error creating dish', error: error.message });
  }
};

exports.updateDish = async(req, res) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;

  if (!id) {
    return res.status(400).json({message: 'Dish ID is required'});
  }
  
  const {companyUsername, sellerusername} = req.user;
  if (!companyUsername || !sellerusername) {
    return res.status(403).json({message: 'Authentication required to update dishes'});
  }
  
  try {
    const dish = await Dish.findByPk(id);
    
    if (!dish) {
      return res.status(404).json({message: 'Dish not found'});
    }
    
    if (dish.companyUsername !== companyUsername) {
      return res.status(403).json({message: 'You can only update dishes from your own company'});
    }
    const [updated] = await Dish.update(
      { name, description, price, stock },
      { where: { id } }
    );
    
    if (updated) {
      const updatedDish = await Dish.findByPk(id);
      res.status(200).json({message: 'Dish updated successfully', dish: updatedDish });
    } else {
      res.status(500).json({message: 'Could not update the dish'});
    }
  } catch (error) {
    console.error('Error updating dish:', error);
    res.status(500).json({message: 'Error updating dish', error: error.message });
  }
};

exports.checkDishStock = async(req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({message: 'Items are required'});
  }
  
  try {
    const stockResults = [];
    let allAvailable = true;
    
    for (const item of items) {
      const { dishId, quantity } = item;
      
      if (!dishId || !quantity) {
        return res.status(400).json({message: 'Dish ID and quantity are required'});
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
    
    return res.status(200).json({
      message: 'Stock check completed',
      allAvailable,
      stockResults
    });
  } catch (error) {
    console.error('Error checking stock:', error);
    return res.status(500).json({message: 'Error checking stock', error: error.message });
  }
};

exports.viewMyDishes = async(req, res) => {
  const { sellerusername, companyUsername } = req.user;
  
  try {
    const dishes = await Dish.findAll({ where: { sellerusername } });
    
    if (dishes.length === 0) {
      return res.status(404).json({message: 'No dishes found for this seller'});
    }
    
    res.status(200).json({message: 'Your dishes retrieved successfully', dishes });
  } catch (error) {
    console.error('Error retrieving your dishes:', error);
    res.status(500).json({message: 'Error retrieving your dishes', error: error.message });
  }
};