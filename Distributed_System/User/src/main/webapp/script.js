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
        }        // Role-based page access control
        if (targetPageId === 'seller' && userRole !== 'ADMIN' && userRole !== 'admin') {
            alert('Only admin users can access the Seller Management page.');
            return;
        }
        
        if (targetPageId === 'customer' && userRole !== 'ADMIN' && userRole !== 'admin') {
            alert('Only admin users can access the Customer Management page.');
            return;
        }
        
        if (targetPageId === 'company' && userRole !== 'ADMIN' && userRole !== 'admin') {
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
    
    // Clear JWT token from localStorage
    localStorage.removeItem('authToken');
    console.log('JWT token removed from localStorage');
    
    // Hide navigation
    mainNav.style.display = 'none';    // Hide admin-only menu items
    document.querySelectorAll('.nav-link.admin-only').forEach(link => {
        link.style.display = 'none';
        link.style.visibility = 'hidden';
    });
    
    const adminButtons = document.querySelector('.admin-buttons');
    if (adminButtons) {
        adminButtons.style.display = 'none';
        adminButtons.style.visibility = 'hidden';
    }
    
    // Also hide admin-menu-container
    const adminMenuContainer = document.querySelector('.admin-menu-container');
    if (adminMenuContainer) {
        adminMenuContainer.style.display = 'flex'; // Keep flex but hide items
    }
    
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
            
            // Store the JWT token in localStorage for future API calls
            if (responseData.token) {
                localStorage.setItem('authToken', responseData.token);
                console.log('JWT token saved to localStorage');
            }
            
            // Update UI with success message
            messageElement.className = 'message success';
            messageElement.textContent = 'Login successful!';
            isAuthenticated = true;
            
            // Show navigation for all authenticated users
            mainNav.style.display = 'block';
              // Handle specific user roles
            if (userRole === 'ADMIN' || userRole === 'admin') {
                console.log('Admin role detected - showing admin menu items');
                
                // Show admin menu items
                const adminLinks = document.querySelectorAll('.nav-link.admin-only');
                console.log('Found admin links:', adminLinks.length);
                
                // Debug each admin link element
                adminLinks.forEach((link, index) => {
                    console.log(`Admin link ${index}:`, link);
                    link.style.display = 'inline-block';
                    link.style.visibility = 'visible';
                    console.log('Making visible:', link.getAttribute('data-page'));
                });
                
                // Get and display admin buttons container
                const adminButtons = document.querySelector('.admin-buttons');
                console.log('Admin buttons container:', adminButtons);
                
                if (adminButtons) {
                    console.log('Before applying styles - adminButtons display:', getComputedStyle(adminButtons).display);
                    adminButtons.style.display = 'flex';
                    adminButtons.style.visibility = 'visible';
                    console.log('Admin buttons container made visible');
                    console.log('After applying styles - adminButtons display:', adminButtons.style.display);
                } else {
                    console.error('Could not find .admin-buttons element');
                }
                
                // Make admin-menu-container visible too
                const adminMenuContainer = document.querySelector('.admin-menu-container');
                if (adminMenuContainer) {
                    adminMenuContainer.style.display = 'flex';
                    adminMenuContainer.style.visibility = 'visible';
                    console.log('Admin menu container made visible');
                }
                  // Explicitly show navigation
                mainNav.style.display = 'block';
                  // Default to a customer management view for admin
                setTimeout(() => {                // Navigate to customer page by default
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
                    link.style.visibility = 'hidden';
                });
                
                const adminButtons = document.querySelector('.admin-buttons');
                if (adminButtons) {
                    adminButtons.style.display = 'none';
                    adminButtons.style.visibility = 'hidden';
                }
                
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
        // Get JWT token from localStorage
        const token = localStorage.getItem('authToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`${API_BASE_URL}/customer/all`, {
            headers: headers
        });
        
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
        
        // Get JWT token from localStorage
        const token = localStorage.getItem('authToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers
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
        
        // Get JWT token from localStorage
        const token = localStorage.getItem('authToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`${API_BASE_URL}/company/all`, {
            headers: headers
        });
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
        
        // Get JWT token from localStorage
        const token = localStorage.getItem('authToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers
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

// Function to check if user has a valid token and auto-login
async function checkExistingToken() {
    const token = localStorage.getItem('authToken');
    if (token) {
        console.log('Found existing token, validating...');
        try {
            const response = await fetch(`${API_BASE_URL}/user/validate-token?token=${encodeURIComponent(token)}`, {
                method: 'POST'
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Token validation successful:', data);
                
                // Set authentication state
                isAuthenticated = true;
                userRole = data.role;
                
                // Show navigation
                mainNav.style.display = 'block';
                
                // Handle specific user roles
                if (userRole === 'ADMIN' || userRole === 'admin') {
                    console.log('Admin role detected from token');
                    
                    // Show admin menu items
                    const adminLinks = document.querySelectorAll('.nav-link.admin-only');
                    adminLinks.forEach(link => {
                        link.style.display = 'inline-block';
                        link.style.visibility = 'visible';
                    });
                    
                    // Show admin buttons container
                    const adminButtons = document.querySelector('.admin-buttons');
                    if (adminButtons) {
                        adminButtons.style.display = 'flex';
                        adminButtons.style.visibility = 'visible';
                    }
                    
                    // Show admin menu container
                    const adminMenuContainer = document.querySelector('.admin-menu-container');
                    if (adminMenuContainer) {
                        adminMenuContainer.style.display = 'flex';
                        adminMenuContainer.style.visibility = 'visible';
                    }
                    
                    // Navigate to customer page by default
                    navLinks.forEach(link => link.classList.remove('active'));
                    pages.forEach(page => page.classList.remove('active'));
                    
                    const customerNavLink = document.querySelector('.nav-link[data-page="customer"]');
                    if (customerNavLink) {
                        customerNavLink.classList.add('active');
                        document.getElementById('customer').classList.add('active');
                        loadAllCustomers();
                    }
                }
                
                return true;
            } else {
                console.log('Token validation failed, clearing token');
                localStorage.removeItem('authToken');
                return false;
            }
        } catch (error) {
            console.error('Error validating token:', error);
            localStorage.removeItem('authToken');
            return false;
        }
    }
    return false;
}

// Debug function to test admin menu visibility
function checkAdminMenuVisibility() {
    console.log("=== ADMIN MENU VISIBILITY CHECK ===");
    
    // Check user role
    console.log("Current user role:", userRole);
    console.log("Is authenticated:", isAuthenticated);
    
    // Check main nav visibility
    const mainNav = document.getElementById('main-nav');
    console.log("Main nav display:", getComputedStyle(mainNav).display);
    
    // Check admin elements
    const adminLinks = document.querySelectorAll('.nav-link.admin-only');
    console.log("Admin links count:", adminLinks.length);
    
    adminLinks.forEach((link, index) => {
        console.log(`Admin link ${index} [${link.getAttribute('data-page')}]:`, {
            display: getComputedStyle(link).display, 
            visibility: getComputedStyle(link).visibility
        });
    });
    
    // Check admin containers
    const adminButtons = document.querySelector('.admin-buttons');
    const adminMenuContainer = document.querySelector('.admin-menu-container');
    
    console.log("Admin buttons container:", {
        element: adminButtons,
        display: adminButtons ? getComputedStyle(adminButtons).display : 'N/A',
        visibility: adminButtons ? getComputedStyle(adminButtons).visibility : 'N/A'
    });
    
    console.log("Admin menu container:", {
        element: adminMenuContainer,
        display: adminMenuContainer ? getComputedStyle(adminMenuContainer).display : 'N/A',
        visibility: adminMenuContainer ? getComputedStyle(adminMenuContainer).visibility : 'N/A'
    });
    
    console.log("=== END VISIBILITY CHECK ===");
}

// Add a special debug button for testing
document.addEventListener('keydown', function(event) {
    // Press Ctrl+Shift+A to check admin menu visibility
    if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        checkAdminMenuVisibility();
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    console.log('App initializing...');
    
    // Hide main navigation until login
    document.getElementById('main-nav').style.display = 'none';
    
    // Check for existing token and auto-login if valid
    const tokenValid = await checkExistingToken();    if (!tokenValid) {
        console.log('No valid token found, showing login page');
        // Only show login page initially
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById('login').classList.add('active');
    } else {
        console.log('Auto-login successful with existing token');
    }
});

// Force visibility check after page fully loads
window.addEventListener('load', function() {
    // Add 3-second delay to ensure all elements are loaded
    setTimeout(() => {
        console.log("Running visibility check 3 seconds after page load...");
        
        // Check if .admin-buttons exists and log its style properties
        const adminButtons = document.querySelector('.admin-buttons');
        if (adminButtons) {
            console.log(".admin-buttons found in DOM with styles:", {
                display: getComputedStyle(adminButtons).display,
                visibility: getComputedStyle(adminButtons).visibility,
                width: getComputedStyle(adminButtons).width,
                height: getComputedStyle(adminButtons).height
            });
        } else {
            console.error(".admin-buttons element not found in DOM!");
        }
    }, 3000);
});
