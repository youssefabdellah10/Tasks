import { userApi } from './api';

const NotificationService = {
  getAllNotifications: async () => {
    try {
      const response = await userApi.get('/notifications/getall');
      // Check if the response data is an array before returning
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Notification data is not an array:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
};

export default NotificationService;
