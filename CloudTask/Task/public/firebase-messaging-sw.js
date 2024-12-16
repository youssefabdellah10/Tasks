// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Initialize the Firebase app
firebase.initializeApp({
  apiKey: "AIzaSyDyxAW2bCOjBbxRTrT8PR02TMr429OYHBM",
  authDomain: "lab-project-4325e.firebaseapp.com",
  projectId: "lab-project-4325e",
  storageBucket: "lab-project-4325e.firebasestorage.app",
  messagingSenderId: "14870600503",
  appId: "1:14870600503:web:a1f43b35fce9975a8ad8b2"
});

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message', payload);

  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});