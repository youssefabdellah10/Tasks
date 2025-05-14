import { dishApi } from './api';

const DishService = {
  // Get all dishes
  getAllDishes: async () => {
    try {
      const response = await dishApi.get('/dishes/getalldishes');
      // The response structure is { message: string, dishes: array }
      return response.data.dishes || [];
    } catch (error) {
      console.error('Error in getAllDishes:', error);
      throw error;
    }
  },
  
  // Get all dishes for a company
  getCompanyDishes: async (companyId) => {
    try {
      const response = await dishApi.get(`/dishes/company/${companyId}`);
      return response.data.dishes || [];
    } catch (error) {
      throw error;
    }
  },

  // Get dishes by seller
  getSellerDishes: async (sellerId) => {
    try {
      const response = await dishApi.get(`/dishes/seller/${sellerId}`);
      return response.data.dishes || [];
    } catch (error) {
      throw error;
    }
  },

  // Get dish by ID
  getDishById: async (dishId) => {
    try {
      const response = await dishApi.get(`/dishes/${dishId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new dish
  createDish: async (dishData) => {
    try {
      const response = await dishApi.post('/dishes', dishData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a dish
  updateDish: async (dishId, dishData) => {
    try {
      const response = await dishApi.put(`/dishes/${dishId}`, dishData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a dish
  deleteDish: async (dishId) => {
    try {
      const response = await dishApi.delete(`/dishes/${dishId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search dishes
  searchDishes: async (searchTerm, companyId = null) => {
    try {
      let url = `/dishes/search?term=${searchTerm}`;
      if (companyId) {
        url += `&companyId=${companyId}`;
      }
      const response = await dishApi.get(url);
      return response.data.dishes || [];
    } catch (error) {
      throw error;
    }
  }
};

export default DishService;
