import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import NotificationService from '../services/notification.service';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewedNotifications, setViewedNotifications] = useState(() => {
    // Initialize from localStorage if available
    if (!currentUser) return [];
    
    try {
      const key = `viewedNotifications_${currentUser.userId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error parsing viewed notifications from localStorage', e);
      return [];
    }
  });

  const fetchNotifications = useCallback(async () => {
    if (!currentUser || currentUser.userType !== 'customer') {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await NotificationService.getAllNotifications();
      
      // Sort notifications by timestamp in descending order (newest first)
      const sortedNotifications = data.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      setNotifications(sortedNotifications);
      
      // Calculate unread count (notifications that aren't in viewedNotifications)
      const newUnreadCount = sortedNotifications.filter(
        notification => !viewedNotifications.includes(notification.id)
      ).length;
      
      setUnreadCount(newUnreadCount);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      setLoading(false);
    }
  }, [currentUser, viewedNotifications]);

  // Re-initialize viewedNotifications when user changes
  useEffect(() => {
    if (!currentUser) {
      setViewedNotifications([]);
      return;
    }
    
    try {
      const key = `viewedNotifications_${currentUser.userId}`;
      const stored = localStorage.getItem(key);
      setViewedNotifications(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.error('Error loading viewed notifications', e);
      setViewedNotifications([]);
    }
  }, [currentUser]);

  // Save viewedNotifications to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      const key = `viewedNotifications_${currentUser.userId}`;
      localStorage.setItem(key, JSON.stringify(viewedNotifications));
    }
  }, [viewedNotifications, currentUser]);

  // Fetch notifications when user logs in and periodically
  useEffect(() => {
    if (currentUser && currentUser.userType === 'customer') {
      fetchNotifications();
      
      // Set up interval to refresh notifications every minute
      const intervalId = setInterval(fetchNotifications, 60000);
      
      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [currentUser, fetchNotifications]);

  // Mark notifications as read (placeholder for future implementation)
  const markAsRead = (notificationId) => {
    // This would call an API endpoint to mark notification as read
    // For now, we'll just update the local state
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true } 
        : notification
    ));
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as viewed
  const markAllAsViewed = useCallback(() => {
    if (notifications.length === 0) return;
    
    // Add all notification IDs to viewedNotifications
    const notificationIds = notifications.map(notification => notification.id);
    setViewedNotifications(prev => [...new Set([...prev, ...notificationIds])]);
    setUnreadCount(0);
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      error,
      fetchNotifications,
      markAsRead,
      markAllAsViewed
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
