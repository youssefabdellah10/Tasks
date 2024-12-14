// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD6i7WqvOME5zJJQbSnjggnE2_tIEX5OuM",
    authDomain: "hosting-notification-2682b.firebaseapp.com",
    projectId: "hosting-notification-2682b",
    storageBucket: "hosting-notification-2682b.firebasestorage.app",
    messagingSenderId: "30868739423",
    appId: "1:30868739423:web:916b38b7a2fe87479112ea",
    measurementId: "G-HY1YG2DB1G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
