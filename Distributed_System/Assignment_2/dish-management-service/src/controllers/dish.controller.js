const Dish = require('../models/dish.model');
const jwt = require('jsonwebtoken');

const extractUserFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided or invalid format. Please provide a Bearer token.' };
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return { error: 'No token provided' };
    }
    
    // Use the environment variable with a fallback
    const JWT_SECRET = process.env.JWT_SECRET ;
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token payload:', decoded);
    
    // Handle different possible field names that might come from another microservice
    const sellerusername = decoded.sub ;
    const companyUsername = decoded.companyUsername ;
    
    if (!sellerusername || !companyUsername) {
      console.log(sellerusername, companyUsername);
      return { error: 'Token is missing required user information' };
    }
    
    return { 
      sellerusername,
      companyUsername
    };
  } catch (error) {
    console.error('Token verification error:', error.message);
    return { error: `Invalid token: ${error.message}` };
  }
};

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
  
  // Extract user info from token
  const userInfo = extractUserFromToken(req);
  if (userInfo.error) {
    return res.status(403).json({message: userInfo.error});
  }
    const { sellerusername, companyUsername } = userInfo;
  
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
  
  // Extract user info from token
  const userInfo = extractUserFromToken(req);
  if (userInfo.error) {
    return res.status(403).json({message: userInfo.error});
  }
    const { sellerusername, companyUsername } = userInfo;
  
  if (!sellerusername || !companyUsername) {
    return res.status(403).json({message: 'Authentication required to update dishes'});
  }
  
  try {
    // Check if the dish exists and belongs to the company
    const dish = await Dish.findByPk(id);
    
    if (!dish) {
      return res.status(404).json({message: 'Dish not found'});
    }
    
    if (dish.companyUsername !== companyUsername) {
      return res.status(403).json({message: 'You can only update dishes from your own company'});
    }
    
    // Update the dish
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

// Check dish stock
exports.checkDishStock = async(req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({message: 'Items are required'});
  }
  
  try {
    // Check stock for each item
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

