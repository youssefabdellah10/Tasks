// src/components/Admin/ActivityLogs.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      // Vulnerable endpoint - no proper authorization
      const url = filter === 'all' 
        ? 'http://localhost:5000/api/admin/logs' 
        : `http://localhost:5000/api/admin/logs?type=${filter}`;
      
      const response = await axios.get(url, { withCredentials: true });
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      setError(`Error loading logs: ${error.message}`);
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all logs?')) {
      return;
    }
    
    try {
      // Vulnerable: No CSRF protection
      await axios.delete('http://localhost:5000/api/admin/logs', 
        { withCredentials: true });
      setLogs([]);
      alert('Logs cleared successfully');
    } catch (error) {
      setError(`Error clearing logs: ${error.message}`);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container">
      <h2 className="mb-4">Activity Logs</h2>
      
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <select 
                className="form-select" 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Activities</option>
                <option value="login">Login Activities</option>
                <option value="transfer">Transfer Activities</option>
                <option value="admin">Admin Activities</option>
              </select>
            </div>
            <button className="btn btn-danger" onClick={clearLogs}>Clear Logs</button>
          </div>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          {logs.length === 0 ? (
            <p>No logs found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>IP Address</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log._id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.userId}</td>
                      <td>{log.action}</td>
                      <td>{log.ipAddress}</td>
                      <td>
                        {/* Vulnerable to XSS */}
                        <span dangerouslySetInnerHTML={{ __html: log.details }}></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityLogs;