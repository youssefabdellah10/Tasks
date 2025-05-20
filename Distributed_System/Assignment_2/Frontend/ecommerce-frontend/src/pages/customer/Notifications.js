import React, { useContext, useState } from 'react';
import { Container, Card, Badge, Row, Col, Button, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faArrowLeft, faExclamationTriangle, faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../../layouts/MainLayout';
import NotificationContext from '../../contexts/NotificationContext';

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'processing':
      return 'primary';
    case 'rejected':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return faCheckCircle;
    case 'rejected':
      return faExclamationTriangle;
    default:
      return faInfoCircle;
  }
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const CustomerNotifications = () => {
  const { notifications, loading, markAllAsViewed } = useContext(NotificationContext);
  const navigate = useNavigate();
  
  // Mark all as viewed when this page is opened
  React.useEffect(() => {
    markAllAsViewed();
  }, [markAllAsViewed]);

  return (
    <MainLayout>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <FontAwesomeIcon icon={faBell} className="me-2" />
            My Notifications
          </h2>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => navigate(-1)}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="text-center p-5 shadow-sm">
            <Card.Body>
              <h4>No Notifications</h4>
              <p className="text-muted">You don't have any notifications yet.</p>
            </Card.Body>
          </Card>
        ) : (
          <ListGroup>
            {notifications.map((notification) => (
              <ListGroup.Item key={notification.id} className="mb-3 border shadow-sm">
                <Row>
                  <Col xs={12} className="mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <FontAwesomeIcon 
                          icon={getStatusIcon(notification.status)} 
                          className={`text-${getStatusVariant(notification.status)} me-2`}
                        />
                        Order #{notification.orderId}
                      </h5>
                      <Badge bg={getStatusVariant(notification.status)}>
                        {notification.status}
                      </Badge>
                    </div>
                    <small className="text-muted">
                      {formatTimestamp(notification.timestamp)}
                    </small>
                  </Col>
                  
                  <Col xs={12}>
                    <Card.Text>
                      Your order #{notification.orderId} status has been updated to {notification.status}.
                    </Card.Text>
                    
                    {notification.reason && (
                      <Card className="mt-2 bg-light">
                        <Card.Body className="p-3">
                          <strong>Reason:</strong> {notification.reason}
                        </Card.Body>
                      </Card>
                    )}
                    
                    {notification.status.toLowerCase() === 'rejected' && (
                      <div className="mt-3">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => navigate('/customer/dishes')}
                        >
                          Browse Dishes
                        </Button>
                      </div>
                    )}
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Container>
    </MainLayout>
  );
};

export default CustomerNotifications;
