import { useState, useEffect } from 'react';
import { 
  messaging, 
  getToken, 
  onMessage
} from './configuration';

// Firebase Cloud Messaging setup
const VAPID_KEY = 'BJ053rLnc9yV-M_M8OBHuC0wj2TE3RLe-Ga1hB_ldKMhUkQIdrlAVHfpev6JJPHPiCowBVuen5lYXuu4tq258ug';

export const useFirebaseMessaging = () => {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]); 

  // Request notification permission and get token
  const requestNotificationPermission = async () => {
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Get token
        const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (currentToken) {
          setToken(currentToken);
          console.log('FCM Token:', currentToken);
        } else {
          console.log('No registration token available.');
          setError('No registration token available');
        }
      } else {
        console.log('Notification permission denied');
        setError('Notification permission denied');
      }
    } catch (err) {
      console.error('Error getting token:', err);
      setError(err.message);
    }
  };

  // Listen for messages in foreground
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Setup message listener for foreground messages
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        
        // Check for topic subscription/unsubscription messages
        if (payload.data) {
          console.log('Received data:', payload.data);
          
          // Handle topic-related messages
          if (payload.data.subscribeToTopic) {
            console.log('Subscribe to topic:', payload.data.subscribeToTopic);
          }
          
          if (payload.data.unsubscribeToTopic) {
            console.log('Unsubscribe from topic:', payload.data.unsubscribeToTopic);
          }
        }

        // Optional: Show desktop notification
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'New Message', {
            body: payload.notification?.body || 'You have a new message',
            icon: payload.notification?.image
          });
        }

        // Add received message to state
        setMessages((prevMessages) => [...prevMessages, payload]);
      });

      return () => {
        unsubscribe(); 
      };
    }
  }, []);

  return {
    token,
    error,
    messages, 
    requestNotificationPermission
  };
};