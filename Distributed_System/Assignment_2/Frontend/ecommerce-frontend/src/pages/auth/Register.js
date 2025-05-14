import React, { useState, useContext } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customer_name, setCustomerName] = useState('');
  const [mobile_number, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    // Additional validation
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    try {
      setError('');
      setLoading(true);
      
      await register(username, password, customer_name, address, mobile_number);
      
      setSuccessMessage('Registration successful! You can now login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="d-flex justify-content-center align-items-center">
        <Card className="w-100" style={{ maxWidth: '600px' }}>
          <Card.Body>
            <h2 className="text-center mb-4">Register</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formCustomerName">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter your full name" 
                      value={customer_name}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Choose a username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formConfirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="Confirm password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="formMobileNumber">
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control 
                  type="tel" 
                  placeholder="Enter mobile number" 
                  value={mobile_number}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formAddress">
                <Form.Label>Address</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2} 
                  placeholder="Enter your address" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </Form.Group>

              <div className="d-grid mt-4">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </div>
            </Form>

            <div className="text-center mt-3">
              <p>
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Register;
