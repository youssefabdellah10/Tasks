const { initializeApp } = require('firebase/app');
const admin = require('firebase-admin');
require('dotenv').config();

// Web Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
};

// Initialize Firebase for client-side
const clientApp = initializeApp(firebaseConfig);

// Parse service account from environment variable
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (error) {
  console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
  throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT configuration');
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //databaseURL: process.env.FIREBASE_DATABASE_URL
});

module.exports = {
  clientApp,
  admin,
  firebaseConfig,
  messaging: admin.messaging(),
  firestore: admin.firestore()
};
