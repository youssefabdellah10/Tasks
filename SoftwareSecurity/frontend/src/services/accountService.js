// src/services/accountService.js
import api from './api';

// Get user accounts
export const getUserAccounts = async () => {
  const userId = localStorage.getItem('userId');
  // Vulnerable: No proper validation of user ID
  return await api.get(`/accounts/user/${userId}`);
};

// Transfer money
export const transferMoney = async (fromAccountId, toAccountId, amount) => {
  return await api.post('/accounts/transfer', { fromAccountId, toAccountId, amount });
};

// Get account statement
export const getAccountStatement = async (accountId, month, year) => {
  // Vulnerable to command injection in backend
  return await api.get(`/accounts/statement/${accountId}/${month}/${year}`);
};