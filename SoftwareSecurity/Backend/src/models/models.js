const mongoose = require('mongoose');

// User model
const userSchema = new mongoose.Schema({
  username: String, // No validation for username
  password: String, // Password stored in plaintext
  email: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  accounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }]
});

// Account model
const accountSchema = new mongoose.Schema({
  accountNumber: String,
  balance: Number,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
});

// Transaction model
const transactionSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  amount: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Message model
const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Complaint model
const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: String,
  filePath: String,
  status: {
    type: String, 
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Activity log model
const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: String,
  ip: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Message = mongoose.model('Message', messageSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = {
  User,
  Account,
  Transaction,
  Message,
  Complaint,
  ActivityLog
};