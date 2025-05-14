import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../../contexts/AuthContext';

const MainNavbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Food Ordering System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            
            {/* Admin Navigation Links */}
            {currentUser && currentUser.userType === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/companies">Companies</Nav.Link>
                <Nav.Link as={Link} to="/admin/users">Users</Nav.Link>
              </>
            )}

            {/* Company Navigation Links */}
            {currentUser && currentUser.userType === 'company' && (
              <>
                <Nav.Link as={Link} to="/company/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/company/sellers">Manage Sellers</Nav.Link>
              </>
            )}

            {/* Seller Navigation Links */}
            {currentUser && currentUser.userType === 'seller' && (
              <>
                <Nav.Link as={Link} to="/seller/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/seller/dishes">My Dishes</Nav.Link>
                <Nav.Link as={Link} to="/seller/orders">Orders</Nav.Link>
              </>
            )}

            {/* Customer Navigation Links */}
            {currentUser && currentUser.userType === 'customer' && (
              <>
                <Nav.Link as={Link} to="/customer/dishes">Menu</Nav.Link>
                <Nav.Link as={Link} to="/customer/orders">My Orders</Nav.Link>
              </>
            )}
          </Nav>

          {/* Right-aligned navigation items */}
          <Nav>
            {currentUser ? (
              <>
                {/* Cart functionality removed */}
                <NavDropdown 
                  title={<><FontAwesomeIcon icon={faUser} /> Account</>} 
                  id="account-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;
