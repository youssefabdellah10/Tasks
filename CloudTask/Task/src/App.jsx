import { useState, useEffect } from 'react'

import './App.css'
import { useFirebaseMessaging } from './useFirebaseMessaging'

function App() {
  const [count, setCount] = useState(0)
  const { 
    token, 
    error, 
    messages,
    requestNotificationPermission
  } = useFirebaseMessaging();

  useEffect(() => {
    // Request notification permission on component mount
    requestNotificationPermission();
  }, []);

  return (
    <>
            
      {/* Messaging Section */}
      <div className="card messaging-section">
        <h2>Firebase Cloud Messaging</h2>
        {error && <p style={{color: 'red'}}>Error: {error}</p>}
        {token && <p>Token: {token}</p>}

        {/* Display received messages */}
        <h3>Received Messages:</h3>
        {messages.length > 0 ? (
          <ul>
            {messages.map((msg, index) => (
              <li key={index}>{msg.notification?.title}: {msg.notification?.body}</li>
            ))}
          </ul>
        ) : (
          <p>No messages received.</p>
        )}
      </div>

      
    </>
  )
}

export default App