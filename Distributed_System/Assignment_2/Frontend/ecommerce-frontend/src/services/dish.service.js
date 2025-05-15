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
  getSellerDishes: async () => {
    try {
      // Debug the token that will be used
      const token = localStorage.getItem('token');
      console.log('JWT Token available:', !!token);
      console.log('User ID:', localStorage.getItem('userId'));
      console.log('Company ID:', localStorage.getItem('companyId'));
      
      console.log('Calling API: /dishes/mydishes');
      const response = await dishApi.get('/dishes/mydishes');
      console.log("API response:", response.data);
      // Ensure we always return an array even if the backend doesn't include dishes property
      return response.data.dishes || response.data || [];
    } catch (error) {
      console.error("Error in getSellerDishes:", error);
      console.error("Error details:", error.message);
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
      throw error;
    }
  },

  // Get dish by ID
  getDishById: async (dishId) => {
    try {
      console.log(`Fetching dish with ID: ${dishId}`);
      const response = await dishApi.get(`/dishes/dish/${dishId}`);
      console.log("Dish details response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getDishById:", error);
      console.error("Error details:", error.message);
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
      throw error;
    }
  },

  // Create a new dish
  createDish: async (dishData) => {
    try {
      // Debug the token that will be used
      const token = localStorage.getItem('token');
      console.log('JWT Token available for create:', !!token);
      console.log('User ID for create:', localStorage.getItem('userId'));
      console.log('Company ID for create:', localStorage.getItem('companyId'));
      
      console.log('Calling API: /dishes/create with data:', JSON.stringify(dishData));
      const response = await dishApi.post('/dishes/create', dishData);
      console.log("Create API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in createDish:", error);
      console.error("Error details:", error.message);
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
      throw error;
    }
  },

  // Update a dish
  updateDish: async (dishId, dishData) => {
    try {
      // Debug the token that will be used
      const token = localStorage.getItem('token');
      console.log('JWT Token available for update:', !!token);
      console.log('User ID for update:', localStorage.getItem('userId'));
      console.log('Company ID for update:', localStorage.getItem('companyId'));
      
      console.log(`Calling API: /dishes/update/${dishId}`);
      const response = await dishApi.put(`/dishes/update/${dishId}`, dishData);
      console.log("Update API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in updateDish:", error);
      console.error("Error details:", error.message);
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
      throw error;
    }
  },

  // Delete a dish
  deleteDish: async (dishId) => {
    try {
      // Debug the token that will be used
      const token = localStorage.getItem('token');
      console.log('JWT Token available for delete:', !!token);
      console.log('User ID for delete:', localStorage.getItem('userId'));
      console.log('Company ID for delete:', localStorage.getItem('companyId'));
      
      // Based on the route patterns, the delete endpoint is likely to be /dishes/delete/:id
      console.log(`Calling API: /dishes/delete/${dishId}`);
      const response = await dishApi.delete(`/dishes/delete/${dishId}`);
      console.log("Delete API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in deleteDish:", error);
      console.error("Error details:", error.message);
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
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
