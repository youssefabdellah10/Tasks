// src/components/Dashboard/TransferForm.js
import React, { useState } from 'react';
import axios from 'axios';

function TransferForm({ accounts, onTransferComplete }) {
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      // Vulnerable to CSRF - no CSRF token
      // Vulnerable to Broken Access Control - no validation if user owns the account
      const response = await axios.post('http://localhost:5000/api/accounts/transfer', {
        fromAccountId: fromAccount,
        toAccountId: toAccount,
        amount: amount
      }, { withCredentials: true });
      
      setMessage('Transfer successful!');
      setAmount('');
      
      // Refresh accounts after transfer
      if (onTransferComplete) onTransferComplete();
    } catch (err) {
      // Vulnerable - displaying raw error message
      setError(`Transfer failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">Transfer Money</div>
      <div className="card-body">
        {/* Vulnerable to XSS: Using dangerouslySetInnerHTML */}
        {message && <div className="alert alert-success" dangerouslySetInnerHTML={{ __html: message }}></div>}
        {error && <div className="alert alert-danger" dangerouslySetInnerHTML={{ __html: error }}></div>}
        
        <form onSubmit={handleTransfer}>
          <div className="form-group mb-3">
            <label>From Account</label>
            <select 
              className="form-control" 
              value={fromAccount} 
              onChange={(e) => setFromAccount(e.target.value)}
              required
            >
              <option value="">Select account</option>
              {accounts.map(account => (
                <option key={account._id} value={account._id}>
                  {account.accountNumber} (Balance: ${account.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group mb-3">
            <label>To Account</label>
            {/* Vulnerable: allows direct input of account ID rather than selection */}
            <input 
              type="text" 
              className="form-control" 
              value={toAccount} 
              onChange={(e) => setToAccount(e.target.value)}
              placeholder="Enter account number"
              required 
            />
          </div>
          
          <div className="form-group mb-3">
            <label>Amount</label>
            <input 
              type="text" 
              className="form-control" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount to transfer"
              required 
            />
            {/* Vulnerable: No input validation for negative amounts */}
          </div>
          
          <button type="submit" className="btn btn-primary">Transfer</button>
        </form>
      </div>
    </div>
  );
}

export default TransferForm;