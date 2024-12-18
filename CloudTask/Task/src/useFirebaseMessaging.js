import { useState, useEffect } from 'react';
import { messaging, getToken, onMessage, saveNotification } from './configuration';

export const useFirebaseMessaging = () => {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const currentToken = await getToken(messaging, {
          vapidKey: 'BJ053rLnc9yV-M_M8OBHuC0wj2TE3RLe-Ga1hB_ldKMhUkQIdrlAVHfpev6JJPHPiCowBVuen5lYXuu4tq258ug'  
        });
        console.log('Token:', currentToken);

        if (currentToken) {
          setToken(currentToken);
          
          // Optionally save the token to your backend or perform additional setup
          try {
            await saveNotification(
              { token: currentToken }, 
              { title: 'New Device Registered', body: 'Device ready for notifications' }
            );
          } catch (saveError) {
            console.error('Error saving notification token:', saveError);
          }
        } else {
          setError('No registration token available.');
        }
      } else {
        setError('Notification permission denied.');
      }
    } catch (err) {
      setError(`Permission error: ${err.message}`);
    }
  };

  // ... rest of the hook remains similar, 
  // but use the imported subscribeToTopic and unsubscribeFromTopic from configuration
  
  useEffect(() => {
    const unsubscribe = onMessage(messaging, async (payload) => {
      console.log('Message received', payload);
      setMessages(prev => [...prev, payload]);

      // Save received notification to backend
      try {
        await saveNotification(payload.data || {}, payload.notification);
      } catch (saveError) {
        console.error('Error saving received notification:', saveError);
      }

      // Optional: Show system notification
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'New Message', {
          body: payload.notification?.body || '',
          icon: payload.notification?.icon || ''
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    token,
    error,
    messages,
    requestNotificationPermission,
   
  };
};