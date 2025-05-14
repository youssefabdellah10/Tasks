import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Alert, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import AdminService from '../../services/admin.service';
import MainLayout from '../../layouts/MainLayout';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUserType, setFilterUserType] = useState('all');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    // Apply filters whenever searchTerm or filterUserType changes
    applyFilters();
  }, [searchTerm, filterUserType, users]);
  
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
  
  const applyFilters = () => {
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
  };
  
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
      <h2 className="mb-4">User Management</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="mb-4">
        <Form onSubmit={handleSearch}>
          <div className="d-flex">
            <Form.Group className="me-3" style={{ width: '200px' }}>
              <Form.Select 
                value={filterUserType}
                onChange={(e) => setFilterUserType(e.target.value)}
              >
                <option value="all">All User Types</option>
                <option value="admin">Admin</option>
                <option value="company">Company</option>
                <option value="seller">Seller</option>
                <option value="customer">Customer</option>
              </Form.Select>
            </Form.Group>
            
            <InputGroup>
              <Form.Control
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" variant="outline-primary">
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </InputGroup>
          </div>
        </Form>
      </div>
      
      {filteredUsers.length === 0 ? (
        <Alert variant="info">
          No users found matching your criteria.
        </Alert>
      ) : (
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
            {filteredUsers.map((user, index) => (
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
      )}
    </MainLayout>
  );
};

export default UserManagement;

// Note: The updateUserStatus function is missing in AdminService
// You would need to add this function to admin.service.js:
