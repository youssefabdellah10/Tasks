importScripts('https://www.gstatic.com/firebasejs/9.17.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.17.2/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4Lz8EiN3VS1WxLQSR65voYyaCQd8pwEo",
  authDomain: "fir-app-2decf.firebaseapp.com",
  databaseURL: "https://fir-app-2decf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fir-app-2decf",
  storageBucket: "fir-app-2decf.appspot.com",
  messagingSenderId: "727647863772",
  appId: "1:727647863772:web:28efd54cf1eb14a52a0519",
  measurementId: "G-JVDDP9B637"
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  // Send the message to the main page via postMessage
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'background-message',
        message: payload.notification.body || 'No message body',
      });
    });
  });

  const notificationTitle = payload.notification?.title || 'Background Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'Background message body',
    icon: '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
