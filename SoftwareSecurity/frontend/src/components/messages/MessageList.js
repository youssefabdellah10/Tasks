// src/components/Messages/MessageList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function MessageList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/messages/user',
        { withCredentials: true });
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      setError(`Error loading messages: ${error.message}`);
      setLoading(false);
    }
  };

  const searchMessages = async (e) => {
    e.preventDefault();
    try {
      // Vulnerable to NoSQL injection
      const response = await axios.get(`http://localhost:5000/api/messages/search?term=${searchTerm}`,
        { withCredentials: true });
      setMessages(response.data);
    } catch (error) {
      setError(`Error searching messages: ${error.message}`);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container">
      <h2 className="mb-4">My Messages</h2>
      
      <div className="card mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            Messages
            <Link to="/messages" className="btn btn-sm btn-primary">New Message</Link>
          </div>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={searchMessages} className="mb-4">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search messages..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="submit">Search</button>
            </div>
            {/* Vulnerable to NoSQL injection with the search term */}
          </form>
          
          {messages.length === 0 ? (
            <p>No messages found.</p>
          ) : (
            <div className="list-group">
              {messages.map(msg => (
                <div key={msg._id} className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    {/* Vulnerable to XSS - no sanitization of user input */}
                    <h5 className="mb-1" dangerouslySetInnerHTML={{ __html: msg.subject }}></h5>
                    <small>{new Date(msg.createdAt).toLocaleString()}</small>
                  </div>
                  <p className="mb-1" dangerouslySetInnerHTML={{ __html: msg.content }}></p>
                  <small>Status: {msg.isRead ? 'Read' : 'Unread'}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageList;