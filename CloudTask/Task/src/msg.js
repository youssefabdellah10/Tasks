import React, { useEffect, useState } from "react";
import {
  messaging,
  getToken,
  onMessage,
  subscribeToTopic,
  unsubscribeFromTopic,
} from "./firebaseConfig";

const MsgComponent = () => {
  const [token, setToken] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]); // State for received messages

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Notification permission granted.");

          const currentToken = await getToken(messaging, {
            vapidKey:
              "BEY05QN2X2l_7deZkUPxoASg4Au3zC32XmYv1O9KYtI9gduoX2Qc-S9X_QQC9CCysfscoCSiH0kAA5wDXv0eWIQ",
          });

          if (currentToken) {
            console.log("Token received: ", currentToken);
            setToken(currentToken);
          } else {
            console.log(
              "No registration token available. Request permission to generate one."
            );
          }
        } else {
          console.log("Unable to get permission to notify.");
          setError("Notification permission denied");
        }
      } catch (err) {
        console.error("Error in requesting notification permission:", err);
        setError(err.message);
      }
    };

    const handleIncomingMessages = (payload) => {
      console.log("Message received. ", payload);

      // Update the messages state with the new message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          title: payload.notification?.title || "New Message",
          body: payload.notification?.body || "You have a new notification",
        },
      ]);

      // Display the notification if permission is granted
      if (Notification.permission === "granted") {
        const notificationTitle =
          payload.notification?.title || "New Message";
        const notificationOptions = {
          body: payload.notification?.body || "You have a new notification",
          icon: "/firebase-logo.png",
        };
        new Notification(notificationTitle, notificationOptions);
      }
    };

    const unsubscribe = onMessage(messaging, handleIncomingMessages);

    requestNotificationPermission();

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Firebase Messaging
      </h2>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-semibold text-gray-700">Current Token:</h3>
        <p className="text-sm text-gray-600 break-words">
          {token || "Token not available"}
        </p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-700">Received Messages:</h3>
        {messages.length > 0 ? (
          <ul className="list-disc list-inside">
            {messages.map((message, index) => (
              <li key={index} className="text-sm text-gray-600">
                <strong>{message.title}</strong>: {message.body}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">No messages received</p>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-gray-700">Subscribed Topics:</h3>
        {subscriptions.length > 0 ? (
          <ul className="list-disc list-inside">
            {subscriptions.map((topic, index) => (
              <li key={index} className="text-sm text-gray-600">{topic}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">No active subscriptions</p>
        )}
      </div>
    </div>
  );
};

export default MsgComponent;


