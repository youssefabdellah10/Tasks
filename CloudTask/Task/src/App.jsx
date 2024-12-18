import { useState, useEffect } from 'react'
import { 
  useFirebaseMessaging 
} from './useFirebaseMessaging'
import { 
  sendTopicMessage, 
  getNotifications 
} from './configuration'
import './App.css'

function App() {
  const [topicInput, setTopicInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [storedNotifications, setStoredNotifications] = useState([]);
  const { token, requestNotificationPermission } = useFirebaseMessaging();
  


  useEffect(() => {
    requestNotificationPermission();
    
    // Fetch stored notifications
    const fetchNotifications = async () => {
      try {
        const result = await getNotifications();
        setStoredNotifications(result.notifications);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    
    fetchNotifications();
  }, []);

  const handleSendTopicMessage = async () => {
    if (topicInput.trim() && messageInput.trim()) {
      try {
        await sendTopicMessage(
          topicInput.trim(), 
          'Custom Topic Message', 
          messageInput.trim()
        );
        setMessageInput('');
      } catch (err) {
        console.error('Message sending error:', err);
      }
    }
  };

  // ... rest of the component remains similar

  return (
    
    <div className="container mx-auto p-4">
      {/* Previous UI components */}
      
      {/* Send Topic Message Section */}
      <div>
      <h1>Notification App</h1>
      {token && <p>Token: {token}</p>}
      <div>
        <ul>
          {storedNotifications.length > 0 ? (
            storedNotifications.map(notification => (
              <li key={notification.id}>
                {notification.message}
              </li>
            ))
          ) : (
            <p className="text-gray-500">No stored notifications.</p>
          )}
        </ul>
      </div>
    </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Send Topic Message</h3>
        <div className="flex space-x-2">
          <input 
            type="text" 
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Topic"
            className="flex-grow border rounded px-2 py-1"
          />
          <input 
            type="text" 
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Message"
            className="flex-grow border rounded px-2 py-1"
          />
          <button 
            onClick={handleSendTopicMessage}
            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
          >
            Send
          </button>
        </div>
      </div>

      {/* Stored Notifications */}
      <div>
        <h3 className="font-semibold mb-2">Stored Notifications</h3>
        {storedNotifications.length > 0 ? (
          <ul className="space-y-2">
            {storedNotifications.map((notification) => (
              <li 
                key={notification.id} 
                className="bg-gray-50 border rounded px-3 py-2"
              >
                <div className="text-sm text-gray-600">
                  {JSON.stringify(notification, null, 2)}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No stored notifications.</p>
        )}
      </div>
    </div>
  )
}

export default App