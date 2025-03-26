// src/components/Statements/StatementView.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function StatementView() {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [statement, setStatement] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchAccounts();
    
    // Check for account ID in query params
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    if (id) {
      setAccountId(id);
    }
  }, [location]);

  const fetchAccounts = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`http://localhost:5000/api/accounts/user/${userId}`, 
        { withCredentials: true });
      setAccounts(response.data);
    } catch (error) {
      setError(`Error loading accounts: ${error.message}`);
    }
  };

  const viewStatement = async (e) => {
    e.preventDefault();
    setStatement('');
    setError('');
    
    try {
      // Vulnerable to command injection - direct parameter concatenation in backend
      const response = await axios.get(
        `http://localhost:5000/api/accounts/statement/${accountId}/${month}/${year}`,
        { withCredentials: true }
      );
      
      setStatement(response.data.statement);
    } catch (error) {
      setError(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">Account Statements</h2>
      
      <div className="card">
        <div className="card-header">View Statement</div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={viewStatement}>
            <div className="form-group mb-3">
              <label>Select Account</label>
              <select 
                className="form-control" 
                value={accountId} 
                onChange={(e) => setAccountId(e.target.value)}
                required 
              >
                <option value="">Select account</option>
                {accounts.map(account => (
                  <option key={account._id} value={account._id}>
                    {account.accountNumber} ({account.accountType})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group mb-3">
              <label>Month (1-12)</label>
              <input 
                type="text" 
                className="form-control" 
                value={month} 
                onChange={(e) => setMonth(e.target.value)}
                placeholder="Enter month (1-12)"
                required 
              />
            </div>
            
            <div className="form-group mb-3">
              <label>Year</label>
              <input 
                type="text" 
                className="form-control" 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                required 
              />
              {/* Vulnerable: No input validation for command injection */}
            </div>
            
            <button type="submit" className="btn btn-primary">View Statement</button>
          </form>
          
          {statement && (
            <div className="mt-4">
              <h5>Statement:</h5>
              {/* Vulnerable to XSS */}
              <pre dangerouslySetInnerHTML={{ __html: statement }}></pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatementView;