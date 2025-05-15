import React, { useState } from 'react';
import { Form, Button, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../../layouts/MainLayout';
import AdminService from '../../services/admin.service';

const CompanyAccountCreation = () => {
  // Form state
  const [companyNames, setCompanyNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdAccounts, setCreatedAccounts] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!companyNames.trim()) {
      setError('Please enter at least one company name');
      return;
    }
    
    // Parse company names (split by newline, comma, or semicolon)
    const names = companyNames
      .split(/[\n,;]+/)
      .map(name => name.trim())
      .filter(name => name !== '');
    
    if (names.length === 0) {
      setError('Please enter at least one valid company name');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Call API to create company accounts with auto-generated passwords
      const result = await AdminService.createCompanyRepresentatives(names);
      
      setCreatedAccounts(result);
      setSuccess(`Successfully created ${result.length} company representative accounts`);
      setCompanyNames(''); // Clear the input
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to create company accounts. Please try again.');
      setLoading(false);
    }
  };
  
  // Copy password to clipboard
  const copyToClipboard = (password, index) => {
    navigator.clipboard.writeText(password);
    setCopiedId(index);
    
    // Reset copy status after 2 seconds
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };
  
  return (
    <MainLayout>
      <h2 className="mb-4">Create Company Representative Accounts</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Batch Create Company Accounts</Card.Title>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Company Names (one per line or comma/semicolon separated)</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={companyNames}
                onChange={(e) => setCompanyNames(e.target.value)}
                placeholder="Enter company names here, e.g.&#10;Company A&#10;Company B&#10;Company C"
                disabled={loading}
              />
              <Form.Text className="text-muted">
                Enter a list of unique company names. A representative account will be created for each with an auto-generated password.
              </Form.Text>
            </Form.Group>
            
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Creating Accounts...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Create Company Accounts
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
      
      {createdAccounts.length > 0 && (
        <Card>
          <Card.Body>
            <Card.Title>Created Accounts</Card.Title>
            <Card.Subtitle className="mb-3 text-muted">
              Important: Save or copy these passwords now. They cannot be retrieved later.
            </Card.Subtitle>
            
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Company Name</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {createdAccounts.map((account, index) => (
                  <tr key={account.id || index}>
                    <td>{index + 1}</td>
                    <td>{account.companyName}</td>
                    <td>{account.username}</td>
                    <td>
                      <code>{account.password}</code>
                    </td>
                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => copyToClipboard(account.password, index)}
                      >
                        {copiedId === index ? (
                          <>
                            <FontAwesomeIcon icon={faCheck} className="me-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCopy} className="me-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </MainLayout>
  );
};

export default CompanyAccountCreation;
