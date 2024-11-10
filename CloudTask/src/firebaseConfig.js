// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export {db};