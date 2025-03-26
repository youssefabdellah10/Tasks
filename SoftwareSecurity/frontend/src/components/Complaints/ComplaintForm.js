// src/components/Complaints/ComplaintForm.js
import React, { useState } from 'react';
import axios from 'axios';

function ComplaintForm() {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    const formData = new FormData();
    formData.append('description', description);
    if (file) {
      formData.append('file', file);
    }
    
    try {
      // Vulnerable to SSRF and file upload vulnerabilities
      const response = await axios.post(
        'http://localhost:5000/api/complaints/submit',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );
      
      setMessage('Complaint submitted successfully!');
      setDescription('');
      setFile(null);
      document.getElementById('fileInput').value = '';
    } catch (error) {
      setError(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">Submit a Complaint</h2>
      
      <div className="card">
        <div className="card-header">Complaint Form</div>
        <div className="card-body">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Description</label>
              <textarea 
                className="form-control" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                required 
              ></textarea>
            </div>
            
            <div className="form-group mb-3">
              <label>Attachment (Optional)</label>
              <input 
                id="fileInput"
                type="file" 
                className="form-control" 
                onChange={(e) => setFile(e.target.files[0])}
              />
              {/* Vulnerable: No file type validation */}
            </div>
            
            <button type="submit" className="btn btn-primary">Submit Complaint</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ComplaintForm;