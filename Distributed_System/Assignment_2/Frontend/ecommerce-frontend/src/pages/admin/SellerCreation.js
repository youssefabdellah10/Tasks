import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Table, Alert, Spinner, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBuilding, faUser, faEnvelope, faPhone, faKey, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../../layouts/MainLayout';
import AdminService from '../../services/admin.service';

const SellerCreation = () => {
  // State for companies list
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdSeller, setCreatedSeller] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    companyId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: ''
  });

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);
  
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllCompanies();
      setCompanies(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch companies. Please try again later.');
      setLoading(false);
    }
  };
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!formData.companyId) {
      setError('Please select a company');
      return;
    }
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Call API to create seller account
      const result = await AdminService.createSellerForCompany(formData);
      
      setCreatedSeller(result);
      setSuccess('Successfully created seller account');
      // Reset form
      setFormData({
        companyId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        username: '',
        password: ''
      });
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to create seller account. Please try again.');
      setLoading(false);
    }
  };
  
  // Copy credentials to clipboard
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedId(field);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  return (
    <MainLayout>
      <h1 className="mb-4">Create Seller Account</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              New Seller Information
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Company <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select a company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Auto-generated if left blank"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Auto-generated if left blank"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                  className="mt-3"
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Create Seller Account
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        {createdSeller && (
          <Col md={4}>
            <Card className="border-success">
              <Card.Header className="bg-success text-white">
                <FontAwesomeIcon icon={faCheck} className="me-2" />
                Account Created Successfully
              </Card.Header>
              <Card.Body>
                <h5>{createdSeller.firstName} {createdSeller.lastName}</h5>
                <p className="text-muted mb-3">
                  <FontAwesomeIcon icon={faBuilding} className="me-2" />
                  {createdSeller.companyName}
                </p>
                
                <Table bordered size="sm" className="mt-3">
                  <tbody>
                    <tr>
                      <th>Username</th>
                      <td>
                        {createdSeller.username}
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="ms-2 p-0" 
                          onClick={() => copyToClipboard(createdSeller.username, 'username')}
                        >
                          <FontAwesomeIcon 
                            icon={copiedId === 'username' ? faCheck : faCopy} 
                            className={copiedId === 'username' ? 'text-success' : ''} 
                          />
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <th>Password</th>
                      <td>
                        {createdSeller.password}
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="ms-2 p-0" 
                          onClick={() => copyToClipboard(createdSeller.password, 'password')}
                        >
                          <FontAwesomeIcon 
                            icon={copiedId === 'password' ? faCheck : faCopy} 
                            className={copiedId === 'password' ? 'text-success' : ''} 
                          />
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{createdSeller.email}</td>
                    </tr>
                    {createdSeller.phone && (
                      <tr>
                        <th>Phone</th>
                        <td>{createdSeller.phone}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                
                <Alert variant="info" className="mt-3 mb-0">
                  <small>
                    Remember to share these credentials with the seller. They'll need these details to log in.
                  </small>
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </MainLayout>
  );
};

export default SellerCreation;
