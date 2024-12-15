import React, { useEffect } from 'react';
import { messaging, getToken, onMessage } from "./firebaseConfig";

const MsgComponent = () => {
  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      } else {
        console.log('Unable to get permission to notify.');
      }
    });

    getToken(messaging, { vapidKey: "BEY05QN2X2l_7deZkUPxoASg4Au3zC32XmYv1O9KYtI9gduoX2Qc-S9X_QQC9CCysfscoCSiH0kAA5wDXv0eWIQ" }).then((currentToken) => {
      if (currentToken) {
        console.log('Token received: ', currentToken);
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });

    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png'
      };
      if (Notification.permission === 'granted') {
        new Notification(notificationTitle, notificationOptions);
      }
    });
  }, []);

  return (
    <div>
      <h2>Messaging Component</h2>
    </div>
  );
};

export default MsgComponent;