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

export { db, messaging, getToken, onMessage };