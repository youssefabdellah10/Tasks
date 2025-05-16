import { orderApi } from './api';

const OrderService = {
  getMyOrders: async () => {
    try {
      const response = await orderApi.get(`/orders/myorders`);
      return response.data.orders || response.data || [];
    } catch (error) {
      console.error('Error in getMyOrders:', error);
      return [];
    }
  },
  
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await orderApi.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },
  
  placeOrder: async (orderItems) => {
    try {
      const response = await orderApi.post('/orders/placeOrder', orderItems);
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  },
  
  getSellerOrders: async (sellerId) => {
    try {
      const response = await orderApi.get(`/orders/seller/${sellerId}`);
      return response.data.orders || response.data || [];
    } catch (error) {
      console.error('Error in getSellerOrders:', error);
      return [];
    }
  }
};

export default OrderService;
