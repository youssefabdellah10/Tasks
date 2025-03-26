// src/components/Dashboard/AccountList.js
import React from 'react';
import { Link } from 'react-router-dom';

function AccountList({ accounts }) {
  return (
    <div className="card mb-4">
      <div className="card-header">My Accounts</div>
      <div className="card-body">
        {accounts.length === 0 ? (
          <p>No accounts found.</p>
        ) : (
          <div className="list-group">
            {accounts.map(account => (
              <div key={account._id} className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">Account: {account.accountNumber}</h5>
                  {/* Vulnerable: Displaying account balance in HTML source */}
                  <small>Balance: <strong>${account.balance.toFixed(2)}</strong></small>
                </div>
                <p className="mb-1">Account Type: {account.accountType}</p>
                <div className="mt-2">
                  {/* Vulnerable: ID exposed in URL */}
                  <Link to={`/statements?id=${account._id}`} className="btn btn-sm btn-outline-primary me-2">
                    View Statements
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountList;