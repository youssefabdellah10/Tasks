import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';

const UserProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // User profile data
  const [profileData, setProfileData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    userType: ''
  });

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
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load profile information. Please try again.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

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
        
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="mb-0">Profile Information</h3>
            </div>
            
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
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
            )}
          </Card.Body>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
