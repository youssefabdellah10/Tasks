const { Account, Transaction, ActivityLog } = require('../models/models');
const { exec } = require('child_process');

const accountController = {
  // A1:2021 – Broken Access Control
  // No proper authorization checks
  getAccounts: async (req, res) => {
    try {
      // The accountId is taken directly from the query without proper validation
      // This enables account enumeration and IDOR attacks
      const accountId = req.query.id;
      
      let accounts;
      if (accountId) {
        // Direct lookup without verifying if the user owns this account
        accounts = await Account.findById(accountId);
      } else if (req.session.userId) {
        // If no specific account requested, get all accounts for the user
        accounts = await Account.find({ userId: req.session.userId });
      } else {
        // Fallback that shouldn't happen but reveals too much information
        accounts = await Account.find();
      }
      
      res.json(accounts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // A3:2021 – Injection
  // Command injection vulnerability
  viewStatement: async (req, res) => {
    try {
      const { accountId, month, year } = req.params;
      
      // Vulnerable to command injection through unsanitized inputs
      const command = `generateStatement ${accountId} ${month} ${year}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return res.status(500).json({ message: 'Error generating statement' });
        }
        
        // Log activity
        const log = new ActivityLog({
          userId: req.session.userId,
          action: `Viewed statement for account ${accountId}`,
          ip: req.ip
        });
        log.save();
        
        res.json({ statement: stdout });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // A5:2021 – Security Misconfiguration
  // A8:2021 – Software and Data Integrity Failures
  transfer: async (req, res) => {
    try {
      // No CSRF protection
      const { fromAccountId, toAccountId, amount } = req.body;
      
      // No validation on account ownership
      const fromAccount = await Account.findById(fromAccountId);
      const toAccount = await Account.findById(toAccountId);
      
      if (!fromAccount || !toAccount) {
        return res.status(404).json({ message: 'Account not found' });
      }
      
      // No validation for negative amounts
      // This allows for negative transfers (stealing money)
      const amountNum = parseFloat(amount);
      
      if (fromAccount.balance < amountNum) {
        return res.status(400).json({ message: 'Insufficient funds' });
      }
      
      // Create transaction
      const transaction = new Transaction({
        fromAccount: fromAccountId,
        toAccount: toAccountId,
        amount: amountNum
      });
      
      // Vulnerable to race conditions - no transaction lock or atomic operations
      fromAccount.balance -= amountNum;
      toAccount.balance += amountNum;
      
      fromAccount.transactions.push(transaction._id);
      toAccount.transactions.push(transaction._id);
      
      await transaction.save();
      await fromAccount.save();
      await toAccount.save();
      
      // Log activity
      const log = new ActivityLog({
        userId: req.session.userId,
        action: `Transferred ${amount} from ${fromAccountId} to ${toAccountId}`,
        ip: req.ip
      });
      log.save();
      
      res.json({ message: 'Transfer successful', transaction });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = accountController;