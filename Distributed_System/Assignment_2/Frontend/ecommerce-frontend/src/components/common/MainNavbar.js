import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../../contexts/AuthContext';
import CartContext from '../../contexts/CartContext';

const MainNavbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
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
          <Nav className="me-auto">            {/* Admin Navigation Links */}
            {currentUser && currentUser.userType === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/sellers/create">Create Seller</Nav.Link>
                <Nav.Link as={Link} to="/admin/companies/view">View Companies</Nav.Link>
              </>
            )}

            {/* Seller Navigation Links */}
            {currentUser && currentUser.userType === 'seller' && (
              <>
                <Nav.Link as={Link} to="/seller/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/seller/dishes">My Dishes</Nav.Link>
                <Nav.Link as={Link} to="/seller/orders">Orders</Nav.Link>
              </>
            )}            {/* Customer Navigation Links */}
            {currentUser && currentUser.userType === 'customer' && (
              <>
                <Nav.Link as={Link} to="/customer/dishes">Menu</Nav.Link>
                <Nav.Link as={Link} to="/customer/cart">
                  <FontAwesomeIcon icon={faShoppingCart} /> Cart
                  {cartCount > 0 && (
                    <Badge pill bg="danger" className="ms-1">{cartCount}</Badge>
                  )}
                </Nav.Link>
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
