import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, InputGroup, Alert, Badge, Card, Nav, Tab, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faToggleOn, faToggleOff, faUsers, faBuilding, faUserTie, faPlus } from '@fortawesome/free-solid-svg-icons';
import AdminService from '../../services/admin.service';
import MainLayout from '../../layouts/MainLayout';
import { Link } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUserType, setFilterUserType] = useState('all');
  const [activeTab, setActiveTab] = useState('customer');
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAllUsers();
      setUsers(response);
      setFilteredUsers(response);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users. Please try again later.');
      setLoading(false);
    }
  };
  
  const applyFilters = useCallback(() => {
    let result = users;
    
    // Filter by user type if not 'all'
    if (filterUserType !== 'all') {
      result = result.filter(user => user.userType === filterUserType);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        user => 
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(result);
  }, [users, filterUserType, searchTerm]);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    // Apply filters whenever the callback changes
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    // Update filter when tab changes
    if (activeTab !== 'all') {
      setFilterUserType(activeTab);
    }
  }, [activeTab]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };
  
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await AdminService.updateUserStatus(userId, !currentStatus);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ));
    } catch (err) {
      setError('Failed to update user status');
    }
  };
  
  const getUserTypeBadgeColor = (userType) => {
    switch (userType) {
      case 'admin':
        return 'danger';
      case 'company':
        return 'primary';
      case 'seller':
        return 'success';
      case 'customer':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const renderUserTable = (usersToDisplay) => {
    if (usersToDisplay.length === 0) {
      return (
        <Alert variant="info">
          No users found matching your criteria.
        </Alert>
      );
    }

    return (
      <Table responsive striped hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>User Type</th>
            <th>Company</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {usersToDisplay.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <Badge bg={getUserTypeBadgeColor(user.userType)}>
                  {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                </Badge>
              </td>
              <td>
                {user.companyName ? user.companyName : 
                  (user.userType === 'company' ? 'Self' : '-')}
              </td>
              <td>
                <Badge bg={user.isActive ? 'success' : 'danger'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td>
                <Button
                  variant={user.isActive ? 'outline-danger' : 'outline-success'}
                  size="sm"
                  onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                  disabled={user.userType === 'admin'} // Prevent toggling admin accounts
                >
                  <FontAwesomeIcon 
                    icon={user.isActive ? faToggleOff : faToggleOn} 
                    className="me-1"
                  />
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
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
        <h2>User Management</h2>
        <Link to="/admin/company-accounts" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Create Company Accounts
        </Link>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Search and Filter Section */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={6}>
                <InputGroup className="mb-3">
                  <Form.Control
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-secondary" type="submit">
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                </InputGroup>
              </Col>
              <Col md={6}>
                <Form.Select 
                  value={filterUserType}
                  onChange={(e) => setFilterUserType(e.target.value)}
                  className="mb-3"
                >
                  <option value="all">All User Types</option>
                  <option value="admin">Administrators</option>
                  <option value="company">Company Representatives</option>
                  <option value="seller">Sellers</option>
                  <option value="customer">Customers</option>
                </Form.Select>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Tabbed Interface */}
      <Tab.Container id="user-types-tabs" defaultActiveKey="customer" onSelect={setActiveTab}>
        <Card>
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="customer">
                  <FontAwesomeIcon icon={faUsers} className="me-2" />
                  Customers
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="company">
                  <FontAwesomeIcon icon={faBuilding} className="me-2" />
                  Company Representatives
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="seller">
                  <FontAwesomeIcon icon={faUserTie} className="me-2" />
                  Sellers
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="all">All Users</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="customer">
                <h4 className="mb-3">Customer Accounts</h4>
                {renderUserTable(filteredUsers.filter(user => user.userType === 'customer'))}
              </Tab.Pane>
              <Tab.Pane eventKey="company">
                <h4 className="mb-3">Company Representative Accounts</h4>
                {renderUserTable(filteredUsers.filter(user => user.userType === 'company'))}
              </Tab.Pane>
              <Tab.Pane eventKey="seller">
                <h4 className="mb-3">Seller Accounts</h4>
                {renderUserTable(filteredUsers.filter(user => user.userType === 'seller'))}
              </Tab.Pane>
              <Tab.Pane eventKey="all">
                <h4 className="mb-3">All User Accounts</h4>
                {renderUserTable(filteredUsers)}
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </MainLayout>
  );
};

export default UserManagement;
