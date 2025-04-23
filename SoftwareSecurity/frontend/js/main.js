// Main JavaScript for Vulnerable Banking Application

// Global variables
let currentUser = null;
let userAccounts = [];
let allAccounts = [];

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const accountsContainer = document.getElementById('accounts-container');
const transferForm = document.getElementById('transfer-form');
const transferMessage = document.getElementById('transfer-message');
const fromAccountSelect = document.getElementById('from-account');
const toAccountSelect = document.getElementById('to-account');
const statementAccountSelect = document.getElementById('statement-account');
const viewStatementBtn = document.getElementById('view-statement-btn');
const statementContainer = document.getElementById('statement-container');
const complaintForm = document.getElementById('complaint-form');
const complaintMessage = document.getElementById('complaint-message');
const messageForm = document.getElementById('message-form');
const messageStatus = document.getElementById('message-status');
const logoutBtn = document.getElementById('logout-btn');
const importForm = document.getElementById('import-form');
const importXmlForm = document.getElementById('import-xml-form');

// VULNERABILITY: XSS via URL parameter
function checkForLoginMessage() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message) {
        // VULNERABILITY: XSS - Direct insertion of URL parameter without sanitization
        loginMessage.innerHTML = message;
    }
}

// Initialize the application
function init() {
    checkForLoginMessage();
    setupEventListeners();
    
    // Check if user is already logged in (from session)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showDashboard();
    }
}

// Set up event listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    transferForm.addEventListener('submit', handleTransfer);
    viewStatementBtn.addEventListener('click', viewStatement);
    complaintForm.addEventListener('submit', submitComplaint);
    messageForm.addEventListener('submit', sendMessage);
    logoutBtn.addEventListener('click', logout);
    importForm.addEventListener('submit', importData);
    importXmlForm.addEventListener('submit', importXml);
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // VULNERABILITY: Storing sensitive data in localStorage
            localStorage.setItem('currentUser', JSON.stringify(data));
            currentUser = data;
            showDashboard();
        } else {
            loginMessage.textContent = data.error || 'Login failed';
            loginMessage.className = 'error-message';
        }
    } catch (error) {
        loginMessage.textContent = 'An error occurred. Please try again.';
        loginMessage.className = 'error-message';
        console.error('Login error:', error);
    }
}

// Show dashboard after successful login
async function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    userInfo.classList.remove('hidden');
    usernameDisplay.textContent = `Welcome, ${currentUser.username}!`;
    
    // Load user accounts
    await loadAccounts();
    
    // Load all accounts for transfer (VULNERABILITY: Access to all accounts)
    await loadAllAccounts();
}

// Load user accounts
async function loadAccounts() {
    try {
        // VULNERABILITY: Using user ID from client side without verification
        const response = await fetch(`/api/accounts?userId=${currentUser.id}`);
        const accounts = await response.json();
        
        userAccounts = accounts;
        displayAccounts(accounts);
        populateAccountSelects(accounts);
    } catch (error) {
        console.error('Error loading accounts:', error);
    }
}

// VULNERABILITY: Loading all accounts (broken access control)
async function loadAllAccounts() {
    try {
        // This should be restricted but isn't (VULNERABILITY)
        const response = await fetch('/api/accounts');
        allAccounts = await response.json();
    } catch (error) {
        console.error('Error loading all accounts:', error);
    }
}

// Display user accounts
function displayAccounts(accounts) {
    accountsContainer.innerHTML = '';
    
    accounts.forEach(account => {
        const accountCard = document.createElement('div');
        accountCard.className = 'account-card';
        accountCard.innerHTML = `
            <h3>${account.account_type} Account</h3>
            <p>Account Number: ${account.account_number}</p>
            <p class="account-balance">$${account.balance.toFixed(2)}</p>
        `;
        
        accountsContainer.appendChild(accountCard);
    });
}

// Populate account select dropdowns
function populateAccountSelects(accounts) {
    // Clear existing options
    fromAccountSelect.innerHTML = '';
    toAccountSelect.innerHTML = '';
    statementAccountSelect.innerHTML = '';
    
    // Add user accounts to selects
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.account_type} (${account.account_number}) - $${account.balance.toFixed(2)}`;
        
        const optionClone1 = option.cloneNode(true);
        const optionClone2 = option.cloneNode(true);
        
        fromAccountSelect.appendChild(option);
        statementAccountSelect.appendChild(optionClone1);
    });
    
    // VULNERABILITY: Allowing transfers to any account in the system
    allAccounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.account_type} (${account.account_number})`;
        toAccountSelect.appendChild(option);
    });
}

// Handle money transfer
async function handleTransfer(e) {
    e.preventDefault();
    
    const fromAccount = fromAccountSelect.value;
    const toAccount = toAccountSelect.value;
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    
    // VULNERABILITY: No client-side validation
    
    try {
        const response = await fetch('/api/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fromAccount, toAccount, amount, description })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            transferMessage.textContent = 'Transfer completed successfully!';
            transferMessage.className = 'success-message';
            transferForm.reset();
            
            // Reload accounts to show updated balances
            await loadAccounts();
        } else {
            transferMessage.textContent = data.error || 'Transfer failed';
            transferMessage.className = 'error-message';
        }
    } catch (error) {
        transferMessage.textContent = 'An error occurred. Please try again.';
        transferMessage.className = 'error-message';
        console.error('Transfer error:', error);
    }
}

// View account statement
async function viewStatement() {
    const accountId = statementAccountSelect.value;
    
    if (!accountId) {
        statementContainer.innerHTML = '<p class="error-message">Please select an account</p>';
        return;
    }
    
    try {
        // VULNERABILITY: No validation that the user owns this account
        const response = await fetch(`/api/transactions?accountId=${accountId}`);
        const transactions = await response.json();
        
        displayTransactions(transactions);
    } catch (error) {
        statementContainer.innerHTML = '<p class="error-message">Failed to load transactions</p>';
        console.error('Statement error:', error);
    }
}

// Display transactions in a table
function displayTransactions(transactions) {
    if (transactions.length === 0) {
        statementContainer.innerHTML = '<p>No transactions found for this account.</p>';
        return;
    }
    
    let tableHtml = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    transactions.forEach(transaction => {
        const isDebit = transaction.from_account === parseInt(statementAccountSelect.value);
        
        tableHtml += `
            <tr>
                <td>${new Date(transaction.date).toLocaleString()}</td>
                <td>${transaction.description || 'N/A'}</td>
                <td>${transaction.from_account_number || 'N/A'}</td>
                <td>${transaction.to_account_number || 'N/A'}</td>
                <td class="${isDebit ? 'debit' : 'credit'}">
                    ${isDebit ? '-' : '+'}$${transaction.amount.toFixed(2)}
                </td>
            </tr>
        `;
    });
    
    tableHtml += `
            </tbody>
        </table>
    `;
    
    statementContainer.innerHTML = tableHtml;
}

// Submit complaint with file upload
async function submitComplaint(e) {
    e.preventDefault();
    
    const subject = document.getElementById('complaint-subject').value;
    const description = document.getElementById('complaint-description').value;
    const fileInput = document.getElementById('complaint-file');
    
    // VULNERABILITY: No file type validation
    
    const formData = new FormData();
    formData.append('userId', currentUser.id);
    formData.append('subject', subject);
    formData.append('description', description);
    
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }
    
    try {
        const response = await fetch('/api/complaints/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            complaintMessage.textContent = 'Complaint submitted successfully!';
            complaintMessage.className = 'success-message';
            complaintForm.reset();
        } else {
            complaintMessage.textContent = data.error || 'Failed to submit complaint';
            complaintMessage.className = 'error-message';
        }
    } catch (error) {
        complaintMessage.textContent = 'An error occurred. Please try again.';
        complaintMessage.className = 'error-message';
        console.error('Complaint error:', error);
    }
}

// Send message to admin
async function sendMessage(e) {
    e.preventDefault();
    
    const message = document.getElementById('message-text').value;
    
    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: currentUser.id, message })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageStatus.textContent = 'Message sent successfully!';
            messageStatus.className = 'success-message';
            messageForm.reset();
        } else {
            messageStatus.textContent = data.error || 'Failed to send message';
            messageStatus.className = 'error-message';
        }
    } catch (error) {
        messageStatus.textContent = 'An error occurred. Please try again.';
        messageStatus.className = 'error-message';
        console.error('Message error:', error);
    }
}

// VULNERABILITY: Insecure Deserialization
async function importData(e) {
    e.preventDefault();
    
    const data = document.getElementById('import-data').value;
    
    try {
        const response = await fetch('/api/import-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data })
        });
        
        const result = await response.json();
        console.log('Import result:', result);
        alert('Data imported successfully!');
    } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import data: ' + error.message);
    }
}

// VULNERABILITY: XXE
async function importXml(e) {
    e.preventDefault();
    
    const xml = document.getElementById('import-xml').value;
    
    try {
        const response = await fetch('/api/import-xml', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ xml })
        });
        
        const result = await response.json();
        console.log('XML import result:', result);
        alert('XML imported successfully!');
    } catch (error) {
        console.error('XML import error:', error);
        alert('Failed to import XML: ' + error.message);
    }
}

// Logout function
function logout() {
    // VULNERABILITY: Only client-side logout (no server-side session invalidation)
    localStorage.removeItem('currentUser');
    currentUser = null;
    userAccounts = [];
    allAccounts = [];
    
    // Reset and hide sections
    loginForm.reset();
    loginMessage.textContent = '';
    loginMessage.className = '';
    dashboardSection.classList.add('hidden');
    userInfo.classList.add('hidden');
    loginSection.classList.remove('hidden');
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);