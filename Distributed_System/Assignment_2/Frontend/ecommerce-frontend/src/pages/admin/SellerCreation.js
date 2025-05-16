import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Table, Alert, Spinner, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBuilding, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../../layouts/MainLayout';
import AdminService from '../../services/admin.service';

const SellerCreation = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdSeller, setCreatedSeller] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [formData, setFormData] = useState({
    companyId: '',
    sellerName: ''
  });
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyId) {
      setError('Please select a company');
      return;
    }
    
    if (!formData.sellerName) {
      setError('Please enter a name for the seller');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const result = await AdminService.createSellerForCompany(formData);
      
      setCreatedSeller(result);
      setSuccess('Successfully created seller account');
      setFormData({
        companyId: '',
        sellerName: ''
      });
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to create seller account. Please try again.');
      setLoading(false);
    }
  };
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
              New Seller Account
            </Card.Header>
            <Card.Body>
              <p className="mb-3">
                Select a company to generate a seller account. The system will automatically create a username and password.
              </p>
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
                
                <Form.Group className="mb-3">
                  <Form.Label>Seller Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="sellerName"
                    value={formData.sellerName}
                    onChange={handleChange}
                    placeholder="Enter seller name (e.g., John Smith)"
                    required
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    This name will be used to generate the seller's account.
                  </Form.Text>
                </Form.Group>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading} 
                  className="mt-3"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Generating...
                    </>
                  ) : (
                    'Generate Seller Account'
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
                <h5>New Seller</h5>
                <p className="text-muted mb-3">
                  <FontAwesomeIcon icon={faBuilding} className="me-2" />
                  {formData.companyId}
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
