import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import AuthService from '../../services/auth.service';

const UserProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);

  // User profile data
  const [profileData, setProfileData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    userType: ''
  });

  // Form data for editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password change state
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError('');

        // For demonstration, we're using the current user data from context
        // In a real app, you would fetch more detailed profile data from an API
        if (currentUser) {
          setProfileData({
            username: currentUser.userId || '',
            name: currentUser.name || 'User',
            email: currentUser.email || 'email@example.com',
            phone: currentUser.phone || '',
            address: currentUser.address || '',
            userType: currentUser.userType || ''
          });

          // Initialize form data with current values
          setFormData({
            name: currentUser.name || 'User',
            email: currentUser.email || 'email@example.com',
            phone: currentUser.phone || '',
            address: currentUser.address || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load profile information. Please try again.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditMode = () => {
    setEditMode(true);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    // Reset form data to current profile values
    setFormData({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      address: profileData.address,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setChangePassword(false);
    setEditMode(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Validate password if changing
      if (changePassword) {
        if (!formData.currentPassword) {
          setError('Current password is required');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          return;
        }
        if (formData.newPassword.length < 6) {
          setError('New password must be at least 6 characters');
          return;
        }
      }

      setLoading(true);

      // In a real app, you would make an API call to update the profile
      // For this example, we'll just update the local state
      setProfileData({
        ...profileData,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      });

      setSuccess('Profile updated successfully');
      setEditMode(false);
      setLoading(false);
      setChangePassword(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const getUserTypeBadgeColor = (userType) => {
    switch (userType.toLowerCase()) {
      case 'admin':
        return 'danger';
      case 'seller':
        return 'success';
      case 'customer':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <MainLayout>
      <div className="profile-container">
        <h2 className="mb-4">
          <FontAwesomeIcon icon={faUser} className="me-2" />
          User Profile
        </h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="mb-0">{editMode ? 'Edit Profile' : 'Profile Information'}</h3>
              
              {!editMode ? (
                <Button 
                  variant="primary" 
                  onClick={handleEditMode}
                >
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Edit Profile
                </Button>
              ) : null}
            </div>
            
            {!editMode ? (
              // View mode
              <Row>
                <Col md={6}>
                  <p><strong>Username:</strong> {profileData.username}</p>
                  <p><strong>Name:</strong> {profileData.name}</p>
                  <p><strong>Email:</strong> {profileData.email}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Phone:</strong> {profileData.phone || 'Not provided'}</p>
                  <p><strong>Address:</strong> {profileData.address || 'Not provided'}</p>
                  <p>
                    <strong>Account Type:</strong> 
                    <span className={`ms-2 badge bg-${getUserTypeBadgeColor(profileData.userType)}`}>
                      {profileData.userType.charAt(0).toUpperCase() + profileData.userType.slice(1)}
                    </span>
                  </p>
                </Col>
              </Row>
            ) : (
              // Edit mode
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.username}
                        disabled
                      />
                      <Form.Text className="text-muted">
                        Username cannot be changed
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Account Type</Form.Label>
                      <div>
                        <span className={`badge bg-${getUserTypeBadgeColor(profileData.userType)}`}>
                          {profileData.userType.charAt(0).toUpperCase() + profileData.userType.slice(1)}
                        </span>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={1}
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="change-password-check"
                    label="Change Password"
                    checked={changePassword}
                    onChange={() => setChangePassword(!changePassword)}
                  />
                </Form.Group>
                
                {changePassword && (
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Current Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          required={changePassword}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          required={changePassword}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required={changePassword}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}
                
                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={handleCancelEdit}
                    className="me-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="success"
                    type="submit"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
