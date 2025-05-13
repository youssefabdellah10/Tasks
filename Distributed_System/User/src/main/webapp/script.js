// Base URL for API calls
const API_BASE_URL = '/users/api';  // This includes the context path 'users' + the API path 'api'

// DOM elements
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const mainNav = document.getElementById('main-nav');

// Authentication state
let isAuthenticated = false;
let userRole = null; // Can be 'admin', 'customer', or 'seller'

// Authentication toggle
document.getElementById('show-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('show-login').classList.add('active');
    document.getElementById('show-signup').classList.remove('active');
});

document.getElementById('show-signup').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('show-login').classList.remove('active');
    document.getElementById('show-signup').classList.add('active');
});

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the page to show
        const targetPageId = this.getAttribute('data-page');
        
        // If logout link is clicked
        if (this.id === 'logout-link') {
            logout();
            return;
        }
        
        // Access control for pages based on user role
        if (!isAuthenticated) {
            alert('You need to log in first.');
            return;
        }
          // Role-based page access control
        if (targetPageId === 'seller' && userRole !== 'admin') {
            alert('Only admin users can access the Seller Management page.');
            return;
        }
        
        if (targetPageId === 'customer' && userRole !== 'admin') {
            alert('Only admin users can access the Customer Management page.');
            return;
        }
        
        if (targetPageId === 'company' && userRole !== 'admin') {
            alert('Only admin users can access the Company Management page.');
            return;
        }
        
        // Remove active class from all links and pages
        navLinks.forEach(link => link.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));
        
        // Add active class to clicked link and corresponding page
        this.classList.add('active');
        document.getElementById(targetPageId).classList.add('active');
        
        // Special handling for certain pages
        if (targetPageId === 'seller') {
            loadCompaniesForSellerDropdown();
        } else if (targetPageId === 'customer') {
            // Load customers automatically when navigating to the customer page
            loadAllCustomers();
        } else if (targetPageId === 'company') {
            // No special handling needed on page load
        }
    });
});

// Logout function
function logout() {
    // Reset authentication state
    isAuthenticated = false;
    userRole = null;
    
    // Hide navigation
    mainNav.style.display = 'none';    // Hide admin-only menu items
    document.querySelectorAll('.nav-link.admin-only').forEach(link => {
        link.style.display = 'none';
    });
    document.querySelector('.admin-buttons').style.display = 'none';
    
    // Show login page
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById('login').classList.add('active');
    
    // Clear login form
    document.getElementById('login-form').reset();
    document.getElementById('login-message').className = 'message';
    document.getElementById('login-message').textContent = '';
    
    // Show login form, hide signup form
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('show-login').classList.add('active');
    document.getElementById('show-signup').classList.remove('active');
}

// Login Form
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    loginUser(username, password);
});

// Signup Form
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('signup-username').value,
        password: document.getElementById('signup-password').value,
        customer_name: document.getElementById('signup-name').value,
        address: document.getElementById('signup-address').value,
        mobile_number: document.getElementById('signup-mobile').value
    };
    
    registerCustomer(formData);
});

// We've removed the customer registration form from the customer page
// and moved it to the login page as the signup form

// Load Customers Button
document.getElementById('load-customers').addEventListener('click', function() {
    loadAllCustomers();
});

// Company With Unique Names Form
document.getElementById('company-unique-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('unique-company-name').value;
    const address = document.getElementById('unique-company-address').value;
    const uniqueCount = document.getElementById('unique-count').value;
    
    createCompanyWithUniqueNames(name, address, uniqueCount);
});

// Seller Form
document.getElementById('seller-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const companyName = document.getElementById('seller-company').value;
    const name = document.getElementById('seller-name').value;
    
    createSeller(companyName, name);
});

// Refresh Companies Button
document.getElementById('refresh-companies').addEventListener('click', function() {
    loadCompaniesForSellerDropdown();
});

/**
 * API Functions
 */

// User Login
async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
            method: 'POST'
        });
        
        const messageElement = document.getElementById('login-message');
        
        if (response.ok) {            // Get role from server response
            const responseData = await response.json();
            userRole = responseData.role || 'customer';
            
            console.log('Login successful. User role:', userRole);
            
            // Update UI with success message
            messageElement.className = 'message success';
            messageElement.textContent = 'Login successful!';
            isAuthenticated = true;
            
            // Show navigation for all authenticated users
            mainNav.style.display = 'block';
            
            // Handle specific user roles
            if (userRole === 'admin') {
                console.log('Admin role detected - showing admin menu items');                // Show admin menu items
                const adminLinks = document.querySelectorAll('.nav-link.admin-only');
                console.log('Found admin links:', adminLinks.length);
                adminLinks.forEach(link => {
                    link.style.display = 'inline-block';
                    console.log('Making visible:', link.getAttribute('data-page'));
                });
                
                const adminButtons = document.querySelector('.admin-buttons');
                console.log('Admin buttons container:', adminButtons);
                if (adminButtons) {
                    adminButtons.style.display = 'flex';
                } else {
                    console.error('Could not find .admin-buttons element');
                }
                  // Explicitly show navigation
                mainNav.style.display = 'block';
                  // Default to a customer management view for admin
                setTimeout(() => {
                    // Navigate to customer page by default
                    navLinks.forEach(link => link.classList.remove('active'));
                    pages.forEach(page => page.classList.remove('active'));
                    
                    const customerNavLink = document.querySelector('.nav-link[data-page="customer"]');
                    customerNavLink.classList.add('active');
                    document.getElementById('customer').classList.add('active');
                    
                    // Load customers in the table
                    loadAllCustomers();
                }, 300); // Quick delay before showing dashboard
            } else {
                // For regular users (customer or seller)
                // Hide the admin-only menu items
                document.querySelectorAll('.nav-link.admin-only').forEach(link => {
                    link.style.display = 'none';
                });
                document.querySelector('.admin-buttons').style.display = 'none';
                
                // Show success message
                messageElement.className = 'message success';
                messageElement.textContent = `Login successful! Welcome, ${userRole}.`;
                
                // Reset the form
                document.getElementById('login-form').reset();
                
                // For customer, default to showing a welcome page
                if (userRole === 'customer') {
                    // Navigate to a welcome page or dashboard
                    navLinks.forEach(link => link.classList.remove('active'));
                    pages.forEach(page => page.classList.remove('active'));
                    
                    // Show login page as active since we have no specific customer dashboard
                    document.getElementById('login').classList.add('active');
                }
            }
        } else {
            const errorMsg = await response.text();
            messageElement.className = 'message error';
            messageElement.textContent = 'Invalid credentials. Please try again.';
            isAuthenticated = false;
            userRole = null;
        }
    } catch (error) {
        console.error('Error during login:', error);
        const messageElement = document.getElementById('login-message');
        messageElement.className = 'message error';
        messageElement.textContent = 'Error connecting to server. Please try again later.';
        isAuthenticated = false;
        userRole = null;
    }
}

// Register Customer
async function registerCustomer(customerData) {
    try {
        const response = await fetch(`${API_BASE_URL}/customer/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });
        
        const messageElement = document.getElementById('login-message');
        
        if (response.ok) {
            // Show success message
            messageElement.className = 'message success';
            messageElement.textContent = 'Customer registration successful! You can now login.';
            
            // Reset form
            document.getElementById('signup-form').reset();
              // Switch to login view
            document.getElementById('show-login').click();
        } else {
            messageElement.className = 'message error';
            messageElement.textContent = `Registration failed: ${result}`;
        }
    } catch (error) {
        console.error('Error registering customer:', error);
        const messageElement = document.getElementById('login-message');
        messageElement.className = 'message error';
        messageElement.textContent = 'Error connecting to server. Please try again later.';
    }
}

// Load All Customers
async function loadAllCustomers() {
    try {
        const response = await fetch(`${API_BASE_URL}/customer/all`);
        
        if (response.ok) {
            const customers = await response.json();
            displayCustomers(customers);
        } else {
            const errorMsg = await response.text();
            alert(`Failed to load customers: ${errorMsg}`);
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        alert('Error connecting to server. Please try again later.');
    }
}

// Display Customers in Table
function displayCustomers(customers) {
    const tableBody = document.querySelector('#customers-table tbody');
    tableBody.innerHTML = '';
    
    if (customers.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.textContent = 'No customers found';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        
        const usernameCell = document.createElement('td');
        usernameCell.textContent = customer.username;
        
        const nameCell = document.createElement('td');
        nameCell.textContent = customer.customer_name;
        
        const addressCell = document.createElement('td');
        addressCell.textContent = customer.address;
        
        const mobileCell = document.createElement('td');
        mobileCell.textContent = customer.mobile_number || 'N/A';
        
        row.appendChild(usernameCell);
        row.appendChild(nameCell);
        row.appendChild(addressCell);
        row.appendChild(mobileCell);
        
        tableBody.appendChild(row);
    });
}

// Create Company with Unique Names
async function createCompanyWithUniqueNames(name, address, uniqueCount) {
    try {
        const url = `${API_BASE_URL}/company/create-with-names?name=${encodeURIComponent(name)}&address=${encodeURIComponent(address)}&uniqueCount=${uniqueCount}`;
        
        const response = await fetch(url, {
            method: 'POST'
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Create more detailed success message showing company with unique names
            let successMsg = `Company "${name}" created successfully with ${uniqueCount} unique name(s)!`;
            
            // Display unique names if available in result
            if (result && result.companyUniqueNames && result.companyUniqueNames.length > 0) {
                successMsg += `\nUnique Names: ${result.companyUniqueNames.join(', ')}`;
            }
            
            alert(successMsg);
            document.getElementById('company-unique-form').reset();
        } else {
            const errorMsg = await response.text();
            alert(`Failed to create company: ${errorMsg}`);
        }
    } catch (error) {
        console.error('Error creating company with unique names:', error);
        alert('Error connecting to server. Please try again later.');
    }
}

// Load Companies for Seller Dropdown (This function is still needed for the Seller page)

// Load Companies for Seller Dropdown
async function loadCompaniesForSellerDropdown() {
    try {
        // Show loading state
        const dropdown = document.getElementById('seller-company');
        dropdown.innerHTML = '<option value="">Loading companies...</option>';
        dropdown.disabled = true;
        
        console.log('Fetching companies from URL:', `${API_BASE_URL}/company/all`);
        
        const response = await fetch(`${API_BASE_URL}/company/all`);
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const responseText = await response.text();
            console.log('Response data:', responseText);
            
            try {
                // Try to parse as JSON
                const companies = JSON.parse(responseText);
                console.log('Parsed companies:', companies);
                
                updateCompanyDropdown(companies);
                
                // Show feedback if no companies are available
                if (companies.length === 0) {
                    alert('No companies found. Please create a company first.');
                }
            } catch (jsonError) {
                console.error('Error parsing JSON:', jsonError);
                alert('Error processing company data. Please try again.');
                dropdown.innerHTML = '<option value="">Error loading companies</option>';
            }
        } else {
            const errorMsg = await response.text();
            console.error(`Failed to load companies: Status ${response.status}, Message: ${errorMsg}`);
            alert(`Failed to load companies: ${response.status} - ${errorMsg}`);
        }
        
        // Re-enable dropdown
        dropdown.disabled = false;
    } catch (error) {
        console.error('Error loading companies for dropdown:', error);
        alert('Error connecting to server. Please try again later.');
        
        // Reset dropdown to default state
        const dropdown = document.getElementById('seller-company');
        dropdown.innerHTML = '<option value="">-- Select Company --</option>';
        dropdown.disabled = false;
    }
}

// Update Company Dropdown
function updateCompanyDropdown(companies) {
    const dropdown = document.getElementById('seller-company');
    // Keep only the first option
    dropdown.innerHTML = '<option value="">-- Select Company --</option>';
    
    // Check if companies is an array
    if (!Array.isArray(companies)) {
        console.error('Companies data is not an array:', companies);
        return;
    }
    
    console.log('Updating dropdown with companies:', companies);
    
    companies.forEach(companyName => {
        if (!companyName || typeof companyName !== 'string') {
            console.warn('Invalid company name:', companyName);
            return;
        }
        
        const option = document.createElement('option');
        option.value = companyName;
        option.textContent = companyName;
        dropdown.appendChild(option);
        console.log('Added company to dropdown:', companyName);
    });
}

// Create Seller
async function createSeller(companyName, name) {
    try {
        const url = `${API_BASE_URL}/seller/create?companyName=${encodeURIComponent(companyName)}&name=${encodeURIComponent(name)}`;
        
        const response = await fetch(url, {
            method: 'POST'
        });
        
        const result = await response.text();
        const resultBox = document.getElementById('seller-result');
        
        if (response.ok) {
            resultBox.innerHTML = `<strong>Success!</strong><br>${result}`;
            resultBox.className = 'result-box show';
            document.getElementById('seller-form').reset();
        } else {
            resultBox.innerHTML = `<strong>Error!</strong><br>${result}`;
            resultBox.className = 'result-box show error';
        }
    } catch (error) {
        console.error('Error creating seller:', error);
        const resultBox = document.getElementById('seller-result');
        resultBox.innerHTML = '<strong>Error!</strong><br>Failed to connect to server. Please try again later.';
        resultBox.className = 'result-box show error';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Hide main navigation until login
    document.getElementById('main-nav').style.display = 'none';
    
    // Only show login page initially
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById('login').classList.add('active');
});
