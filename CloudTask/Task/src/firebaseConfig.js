import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { 
  getMessaging, 
  getToken, 
  onMessage 
} from "firebase/messaging";



// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4Lz8EiN3VS1WxLQSR65voYyaCQd8pwEo",
  authDomain: "fir-app-2decf.firebaseapp.com",
  databaseURL: "https://fir-app-2decf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fir-app-2decf",
  storageBucket: "fir-app-2decf.firebasestorage.app",
  messagingSenderId: "727647863772",
  appId: "1:727647863772:web:28efd54cf1eb14a52a0519",
  measurementId: "G-JVDDP9B637"
};

// Singleton Firebase App Initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const db = getDatabase(app);
const messaging = getMessaging(app);


const subscribeToTopic = async (messaging, token, topic) => {
  try {
    const response = await fetch(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`, {
      method: 'POST',
      headers: {
        'Authorization': 'key=BEY05QN2X2l_7deZkUPxoASg4Au3zC32XmYv1O9KYtI9gduoX2Qc-S9X_QQC9CCysfscoCSiH0kAA5wDXv0eWIQ', // Replace with your actual Firebase Server Key
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe to topic');
    }
    return response;
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    throw error;
  }
};

const unsubscribeFromTopic = async (messaging, token, topic) => {
  try {
    const response = await fetch(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'key=BEY05QN2X2l_7deZkUPxoASg4Au3zC32XmYv1O9KYtI9gduoX2Qc-S9X_QQC9CCysfscoCSiH0kAA5wDXv0eWIQ',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to unsubscribe from topic');
    }
    return response;
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    throw error;
  }
};



export { 
  app, 
  messaging, 
  getToken, 
  onMessage,
  subscribeToTopic,
  unsubscribeFromTopic,
  db
};




