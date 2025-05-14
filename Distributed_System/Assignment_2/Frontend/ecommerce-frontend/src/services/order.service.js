import { orderApi } from './api';

const OrderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await orderApi.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get orders by customer
  getCustomerOrders: async (customerId) => {
    try {
      const response = await orderApi.get(`/orders/customer/${customerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get orders by company
  getCompanyOrders: async (companyId) => {
    try {
      const response = await orderApi.get(`/orders/company/${companyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get orders by seller
  getSellerOrders: async (sellerId) => {
    try {
      const response = await orderApi.get(`/orders/seller/${sellerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await orderApi.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await orderApi.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default OrderService;
