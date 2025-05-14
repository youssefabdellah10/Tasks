import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Card, Alert, Container, Modal, Form, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUserTimes, faEdit, faUserEdit } from '@fortawesome/free-solid-svg-icons';
import CompanyService from '../../services/company.service';
import AuthContext from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';

const SellerManagement = () => {
  const { currentUser } = useContext(AuthContext);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddSeller, setShowAddSeller] = useState(false);
  const [showEditSeller, setShowEditSeller] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  
  // Form states for adding a new seller
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  
  // Form states for editing a seller
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true);
        const response = await CompanyService.getCompanySellers(currentUser.userId);
        setSellers(response);
        setLoading(false);
      } catch (err) {
        setError('Failed to load sellers');
        setLoading(false);
      }
    };

    if (currentUser && currentUser.userId) {
      fetchSellers();
    }
  }, [currentUser]);

  const handleAddSeller = async (e) => {
    e.preventDefault();
    try {
      const sellerData = {
        username: newUsername,
        password: newPassword,
        name: newName,
        email: newEmail,
        phone: newPhone,
        role: 'SELLER'
      };

      const response = await CompanyService.addSellerToCompany(currentUser.userId, sellerData);
      setSellers([...sellers, response]);
      
      // Reset form
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      
      setShowAddSeller(false);
    } catch (err) {
      setError('Failed to add seller. ' + (err.response?.data?.message || ''));
    }
  };

  const handleEditSeller = async (e) => {
    e.preventDefault();
    try {
      const sellerData = {
        name: editName,
        email: editEmail,
        phone: editPhone
      };

      if (changePassword && editPassword) {
        sellerData.password = editPassword;
      }

      // Assuming there's an endpoint to update a seller
      await CompanyService.updateSellerDetails(currentUser.userId, selectedSeller.id, sellerData);
      
      // Update the sellers list
      setSellers(sellers.map(seller => 
        seller.id === selectedSeller.id 
          ? { ...seller, name: editName, email: editEmail, phone: editPhone }
          : seller
      ));
      
      setShowEditSeller(false);
    } catch (err) {
      setError('Failed to update seller. ' + (err.response?.data?.message || ''));
    }
  };

  const handleRemoveSeller = async (sellerId) => {
    if (window.confirm('Are you sure you want to remove this seller?')) {
      try {
        await CompanyService.removeSellerFromCompany(currentUser.userId, sellerId);
        setSellers(sellers.filter(seller => seller.id !== sellerId));
      } catch (err) {
        setError('Failed to remove seller');
      }
    }
  };

  const handleEditClick = (seller) => {
    setSelectedSeller(seller);
    setEditName(seller.name);
    setEditEmail(seller.email);
    setEditPhone(seller.phone || '');
    setEditPassword('');
    setChangePassword(false);
    setShowEditSeller(true);
  };

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <div className="text-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Seller Management</h2>
          <Button 
            variant="primary" 
            onClick={() => setShowAddSeller(true)}
          >
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            Add New Seller
          </Button>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Card className="shadow-sm">
          <Card.Body>
            {sellers.length === 0 ? (
              <div className="text-center p-5">
                <h4>No sellers found</h4>
                <p className="text-muted">Add sellers to your company to manage your dishes and orders.</p>
                <Button 
                  variant="primary" 
                  onClick={() => setShowAddSeller(true)}
                >
                  <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                  Add Your First Seller
                </Button>
              </div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller, index) => (
                    <tr key={seller.id}>
                      <td>{index + 1}</td>
                      <td>{seller.name}</td>
                      <td>{seller.username}</td>
                      <td>{seller.email}</td>
                      <td>{seller.phone || 'N/A'}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleEditClick(seller)}
                        >
                          <FontAwesomeIcon icon={faEdit} /> Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleRemoveSeller(seller.id)}
                        >
                          <FontAwesomeIcon icon={faUserTimes} /> Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
        
        {/* Add Seller Modal */}
        <Modal
          show={showAddSeller}
          onHide={() => setShowAddSeller(false)}
          backdrop="static"
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Seller</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddSeller}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter username" 
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="Enter password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Full Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter full name" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                      type="email" 
                      placeholder="Enter email" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formPhone">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control 
                      type="tel" 
                      placeholder="Enter phone number" 
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end">
                <Button 
                  variant="secondary" 
                  className="me-2"
                  onClick={() => setShowAddSeller(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                >
                  Add Seller
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
        
        {/* Edit Seller Modal */}
        <Modal
          show={showEditSeller}
          onHide={() => setShowEditSeller(false)}
          backdrop="static"
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FontAwesomeIcon icon={faUserEdit} className="me-2" />
              Edit Seller
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedSeller && (
              <Form onSubmit={handleEditSeller}>
                <Form.Group className="mb-3" controlId="formEditName">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter full name" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formEditEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control 
                        type="email" 
                        placeholder="Enter email" 
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formEditPhone">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control 
                        type="tel" 
                        placeholder="Enter phone number" 
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3" controlId="formChangePassword">
                  <Form.Check 
                    type="checkbox" 
                    label="Change Password" 
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                  />
                </Form.Group>
                
                {changePassword && (
                  <Form.Group className="mb-3" controlId="formEditPassword">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="Enter new password" 
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      required={changePassword}
                    />
                  </Form.Group>
                )}
                
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="secondary" 
                    className="me-2"
                    onClick={() => setShowEditSeller(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                  >
                    Save Changes
                  </Button>
                </div>
              </Form>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </MainLayout>
  );
};

export default SellerManagement;
