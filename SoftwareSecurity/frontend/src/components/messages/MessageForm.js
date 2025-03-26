// src/components/Messages/MessageForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function MessageForm() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      // Vulnerable to XSS and CSRF
      const response = await axios.post(
        'http://localhost:5000/api/messages/send',
        {
          subject,
          content
        },
        { withCredentials: true }
      );
      
      setMessage('Message sent successfully!');
      setSubject('');
      setContent('');
    } catch (error) {
      setError(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">Send Message to Admin</h2>
      
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            New Message
            <Link to="/messages/list" className="btn btn-sm btn-outline-secondary">View My Messages</Link>
          </div>
        </div>
        <div className="card-body">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Subject</label>
              <input 
                type="text" 
                className="form-control" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group mb-3">
              <label>Message</label>
              <textarea 
                className="form-control" 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                rows="5"
                required 
              ></textarea>
              {/* Vulnerable to XSS - no sanitization on backend */}
            </div>
            
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MessageForm;