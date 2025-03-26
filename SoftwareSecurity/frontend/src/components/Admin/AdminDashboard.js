// src/components/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [stats, setStats] = useState({
    userCount: 0,
    accountCount: 0,
    transferCount: 0,
    messageCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Vulnerable: Not checking if user is actually admin on backend
    fetchAdminDashboard();
  }, []);

  const fetchAdminDashboard = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/dashboard', 
        { withCredentials: true });
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      setError(`Error loading admin dashboard: ${error.message}`);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Users</h5>
              <h2 className="card-text">{stats.userCount}</h2>
              <Link to="/admin/users" className="text-white">Manage Users</Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Accounts</h5>
              <h2 className="card-text">{stats.accountCount}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-4">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Transfers</h5>
              <h2 className="card-text">{stats.transferCount}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Messages</h5>
              <h2 className="card-text">{stats.messageCount}</h2>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">Quick Actions</div>
            <div className="card-body">
              <div className="list-group">
                <Link to="/admin/users" className="list-group-item list-group-item-action">Manage Users</Link>
                <Link to="/admin/logs" className="list-group-item list-group-item-action">View Activity Logs</Link>
                <a href="/admin/backup" className="list-group-item list-group-item-action">
                  Download Database Backup
                </a>
                {/* Vulnerable: Insecure Direct Object Reference */}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">System Information</div>
            <div className="card-body">
              <div className="mb-2">
                <strong>Server Status:</strong> Running
              </div>
              <div className="mb-2">
                <strong>Database Status:</strong> Connected
              </div>
              <div className="mb-2">
                <strong>Node.js Version:</strong> v14.17.0
              </div>
              <div className="mb-2">
                <strong>MongoDB Version:</strong> 4.4.6
              </div>
              {/* Vulnerable: Revealing system information */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;