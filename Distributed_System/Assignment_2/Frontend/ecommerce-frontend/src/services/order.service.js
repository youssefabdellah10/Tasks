import { orderApi } from './api';
import axios from 'axios';

const OrderService = {
  getBaseUrl: () => {
    return 'http://localhost:7050/api';
  },
    getMyOrders: async () => {
    try {
      console.log('Fetching orders from:', orderApi.defaults.baseURL + '/orders/myorders');
      const response = await orderApi.get(`/orders/myorders`);
      console.log('Orders API response:', response.data);
      
      // Map the backend response to match the format expected by the frontend
      const orders = (response.data.orders || response.data || []).map(order => ({
        id: order.orderId,
        createdAt: new Date().toISOString(), // Since your API doesn't return a date, use current date
        status: order.orderStatus.toUpperCase(), // Convert to uppercase to match frontend expectations
        totalAmount: order.totalPrice,
        items: order.dishIds ? order.dishIds.map((dishId, index) => ({
          dishId: dishId,
          dishName: `Dish ${dishId}`, // You might want to fetch actual dish names if available
          quantity: 1, // Default to 1 since the API response doesn't specify quantity per dish
          price: order.totalPrice / order.dishIds.length, // Estimate price per dish
          sellerName: order.sellerName || "Unknown Seller" // Default if not available
        })) : [],
        deliveryAddress: order.deliveryAddress || "Not specified",
        phone: order.phoneNumber || "Not specified",
        notes: order.notes || ""
      }));
      
      console.log('Mapped orders for frontend:', orders);
      return orders;
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
  },  placeOrder: async (orderItems) => {
    try {
      // Make sure we're sending exactly what the API expects: an array of {dishId, quantity} objects
      const formattedItems = orderItems.map(item => ({
        dishId: parseInt(item.dishId, 10),
        quantity: parseInt(item.quantity, 10)
      }));
      
      // Print detailed debug information
      console.log('Sending formatted order items to API:', JSON.stringify(formattedItems));
      console.log('Full URL:', orderApi.defaults.baseURL + '/orders/placeorder');
      
      // Create a custom axios instance with increased timeout
      const enhancedOrderApi = axios.create({
        baseURL: 'http://localhost:7050/api',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // Increased timeout to 30 seconds
      });
      
      // Set auth token
      const token = localStorage.getItem('token');
      if (token) {
        enhancedOrderApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set');
      } else {
        console.warn('No token available for authentication');
      }
      
      // Add a retry mechanism with exponential backoff
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          console.log(`Attempt ${retries + 1} to place order`);
          
          const response = await enhancedOrderApi.post('/orders/placeorder', formattedItems);
          console.log('Order API response:', response);
          return response.data;
        } catch (retryError) {
          retries++;
          if (retries === maxRetries) {
            console.error(`Failed after ${maxRetries} attempts:`, retryError);
            throw retryError;
          }
          
          // Exponential backoff delay
          const delay = Math.pow(2, retries) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      if (error.request) {
        console.error('Request details:', error.request);
      }
      if (error.response) {
        console.error('Response details:', error.response);
      }
      throw error;
    }
  },
    payOrder: async (orderId) => {
    try {
      console.log('Processing payment for order:', orderId);
      console.log('Full URL:', orderApi.defaults.baseURL + `/orders/payOrder?orderId=${orderId}`);
      
      const response = await orderApi.post(`/orders/payOrder?orderId=${orderId}`);
      console.log('Payment response:', response);
      return response.data;
    } catch (error) {
      console.error('Error paying for order:', error);
      if (error.request) {
        console.error('Request details:', error.request);
      }
      if (error.response) {
        console.error('Response details:', error.response);
      }
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
  },
  
  getCustomerBalance: async () => {
    try {
      const response = await orderApi.get('/orders/mybalance');
      console.log('Balance API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer balance:', error);
      throw error;
    }
  }
};

export default OrderService;
