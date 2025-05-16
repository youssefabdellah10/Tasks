import { dishApi } from './api';

const DishService = {
  getAllDishes: async () => {
    try {
      const response = await dishApi.get('/dishes/getalldishes');
      return response.data.dishes || [];
    } catch (error) {
      console.error('Error in getAllDishes:', error);
      throw error;
    }
  },
  getCompanyDishes: async (companyId) => {
    try {
      const response = await dishApi.get(`/dishes/company/${companyId}`);
      return response.data.dishes || [];
    } catch (error) {
      throw error;
    }
  },
  getSellerDishes: async () => {
    try {
      const response = await dishApi.get('/dishes/mydishes');
      return response.data.dishes || response.data || [];
    } catch (error) {
      throw error;
    }
  },
  getDishById: async (dishId) => {
    try {
      const response = await dishApi.get(`/dishes/dish/${dishId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createDish: async (dishData) => {
    try {
      const response = await dishApi.post('/dishes/create', dishData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateDish: async (dishId, dishData) => {
    try {
      const response = await dishApi.put(`/dishes/update/${dishId}`, dishData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  searchDishes: async (searchTerm) => {
    try {
      const dishes = await DishService.getAllDishes();
      if (!searchTerm) return dishes;
      
      searchTerm = searchTerm.toLowerCase();
      return dishes.filter(dish => {
        return (
          (dish.name && dish.name.toLowerCase().includes(searchTerm)) ||
          (dish.description && dish.description.toLowerCase().includes(searchTerm)) ||
          (dish.category && dish.category.toLowerCase().includes(searchTerm)) ||
          (dish.tags && dish.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
      });
    } catch (error) {
      console.error('Error in searchDishes:', error);
      throw error;
    }
  }
};

export default DishService;
