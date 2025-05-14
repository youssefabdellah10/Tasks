import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import AdminService from '../../services/admin.service';
import MainLayout from '../../layouts/MainLayout';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentCompany, setCurrentCompany] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  
  useEffect(() => {
    fetchCompanies();
  }, []);
  
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAllCompanies();
      setCompanies(response);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch companies. Please try again later.');
      setLoading(false);
    }
  };
  
  const openAddModal = () => {
    setModalTitle('Add New Company');
    setCurrentCompany(null);
    resetForm();
    setViewMode(false);
    setShowModal(true);
  };
  
  const openEditModal = (company) => {
    setModalTitle('Edit Company');
    setCurrentCompany(company);
    // Populate form with company data
    setName(company.name);
    setDescription(company.description);
    setOwnerName(company.ownerName);
    setOwnerEmail(company.ownerEmail);
    setOwnerPhone(company.ownerPhone || '');
    setAddress(company.address || '');
    setIsActive(company.isActive);
    setViewMode(false);
    setShowModal(true);
  };
  
  const openViewModal = (company) => {
    setModalTitle('Company Details');
    setCurrentCompany(company);
    // Populate form with company data
    setName(company.name);
    setDescription(company.description);
    setOwnerName(company.ownerName);
    setOwnerEmail(company.ownerEmail);
    setOwnerPhone(company.ownerPhone || '');
    setAddress(company.address || '');
    setIsActive(company.isActive);
    setViewMode(true);
    setShowModal(true);
  };
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPhone('');
    setAddress('');
    setIsActive(true);
    setFormError('');
  };
  
  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };
  
  const validateForm = () => {
    if (!name.trim()) return 'Company name is required';
    if (!description.trim()) return 'Description is required';
    if (!ownerName.trim()) return 'Owner name is required';
    if (!ownerEmail.trim()) return 'Owner email is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ownerEmail)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  };
  
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    
    try {
      const companyData = {
        name,
        description,
        ownerName,
        ownerEmail,
        ownerPhone,
        address,
        isActive
      };
      
      if (currentCompany) {
        // Update existing company
        await AdminService.updateCompany(currentCompany.id, companyData);
      } else {
        // Create new company
        await AdminService.createCompany(companyData);
      }
      
      handleClose();
      fetchCompanies();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save company');
    }
  };
  
  const handleDelete = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        await AdminService.deleteCompany(companyId);
        fetchCompanies();
      } catch (err) {
        setError('Failed to delete company');
      }
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Company Management</h2>
        <Button variant="success" onClick={openAddModal}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add New Company
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {companies.length === 0 ? (
        <Alert variant="info">
          No companies registered yet. Click the "Add New Company" button to create one.
        </Alert>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Company Name</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <tr key={company.id}>
                <td>{index + 1}</td>
                <td>{company.name}</td>
                <td>{company.ownerName}</td>
                <td>
                  <span className={`badge bg-${company.isActive ? 'success' : 'danger'}`}>
                    {company.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="me-2"
                    onClick={() => openViewModal(company)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => openEditModal(company)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(company.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      {/* Company Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="companyName">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter company name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={viewMode}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="companyStatus">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={isActive.toString()}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    disabled={viewMode}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3" controlId="companyDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter company description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={viewMode}
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="ownerName">
                  <Form.Label>Owner Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter owner name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    disabled={viewMode}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="ownerEmail">
                  <Form.Label>Owner Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter owner email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    disabled={viewMode}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="ownerPhone">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter phone number"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    disabled={viewMode}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="companyAddress">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    placeholder="Enter company address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={viewMode}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {currentCompany && viewMode && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Creation Date</Form.Label>
                      <Form.Control
                        plaintext
                        readOnly
                        value={new Date(currentCompany.createdAt).toLocaleDateString()}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Updated</Form.Label>
                      <Form.Control
                        plaintext
                        readOnly
                        value={new Date(currentCompany.updatedAt).toLocaleDateString()}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {viewMode ? 'Close' : 'Cancel'}
          </Button>
          {!viewMode && (
            <Button variant="primary" onClick={handleSubmit}>
              {currentCompany ? 'Update Company' : 'Create Company'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </MainLayout>
  );
};

export default CompanyManagement;
