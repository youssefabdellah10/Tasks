import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { 
  getMessaging, 
  onMessage, 
  getToken
} from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyxAW2bCOjBbxRTrT8PR02TMr429OYHBM",
  authDomain: "lab-project-4325e.firebaseapp.com",
  projectId: "lab-project-4325e",
  storageBucket: "lab-project-4325e.firebasestorage.app",
  messagingSenderId: "14870600503",
  appId: "1:14870600503:web:a1f43b35fce9975a8ad8b2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore
const db = getFirestore(app);
const messaging = getMessaging(app);
const baseURl ='http://localhost:3000/';

// Updated subscription and unsubscription functions
const subscribeToTopic = async (token, topic) => {
  try {
    const response = await fetch('/api/messaging/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, topic })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Subscription failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    throw error;
  }
};

const unsubscribeFromTopic = async (token, topic) => {
  try {
    const response = await fetch(baseURl +'/api/messaging/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, topic })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unsubscription failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    throw error;
  }
};

const sendTopicMessage = async (topic, title, body, data = {}) => {
  try {
    const response = await fetch(baseURl+'/api/messaging/send-topic-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, title, body, data })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Message sending failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending topic message:', error);
    throw error;
  }
};

const saveNotification = async (data, notification) => {
  try {
    const response = await fetch(baseURl+'/api/messaging/save-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, notification })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Notification saving failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving notification:', error);
    throw error;
  }
};

const getNotifications = async (limit = 50, offset = 0) => {
  try {
    const response = await fetch(baseURl+ `/api/messaging/notifications?limit=${limit}&offset=${offset}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Retrieving notifications failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error retrieving notifications:', error);
    throw error;
  }
};

export { 
  db, 
  messaging, 
  getToken, 
  onMessage,
  subscribeToTopic,
  unsubscribeFromTopic,
  sendTopicMessage,
  saveNotification,
  getNotifications
};