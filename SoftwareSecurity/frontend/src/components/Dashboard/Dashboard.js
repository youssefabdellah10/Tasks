// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccountList from './AccountList';
import TransferForm from './TransferForm';

function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const userId = localStorage.getItem('userId');
      // Vulnerable to broken access control - no proper session validation on backend
      const response = await axios.get(`http://localhost:5000/api/accounts/user/${userId}`, 
        { withCredentials: true });
      setAccounts(response.data);
      setLoading(false);
    } catch (error) {
      setError(`Error loading accounts: ${error.message}`);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container">
      <h2 className="mb-4">My Dashboard</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row">
        <div className="col-md-6">
          <AccountList accounts={accounts} />
        </div>
        <div className="col-md-6">
          <TransferForm accounts={accounts} onTransferComplete={fetchAccounts} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;