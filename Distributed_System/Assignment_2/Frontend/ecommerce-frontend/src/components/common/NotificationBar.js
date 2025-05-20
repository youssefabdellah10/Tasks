import React, { useContext, useState, useEffect } from 'react';
import { Dropdown, Badge, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import NotificationContext from '../../contexts/NotificationContext';
import './NotificationBar.css';

const NotificationBar = () => {
  const { notifications, unreadCount, loading, markAllAsViewed } = useContext(NotificationContext);
  const [show, setShow] = useState(false);

  // Format timestamp to a readable date/time
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get status badge variant based on notification status
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

  const handleToggle = (isOpen) => {
    setShow(isOpen);
    
    // Mark all notifications as viewed when dropdown is opened
    if (isOpen && unreadCount > 0) {
      markAllAsViewed();
    }
  };

  // Auto-close the dropdown after a few seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 5000); // Close after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [show]);

  // Only show for customers with notifications
  if (notifications.length === 0 && !loading) {
    return null;
  }

  return (
    <Dropdown onToggle={handleToggle} show={show}>
      <Dropdown.Toggle variant="link" id="notification-dropdown" className="notification-toggle">
        <FontAwesomeIcon icon={faBell} className="notification-icon" />
        {unreadCount > 0 && (
          <Badge pill bg="danger" className="notification-badge">
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" className="notification-menu">
        <div className="notification-header">
          <h6 className="m-0">Notifications</h6>
        </div>
        
        <div className="notification-body">
          {loading ? (
            <div className="text-center p-3">
              <Spinner animation="border" size="sm" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-3 text-muted">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <Dropdown.Item key={notification.id} className="notification-item">
                <div className="notification-content">
                  <div className="notification-title">
                    Order #{notification.orderId}
                    <Badge 
                      bg={getStatusVariant(notification.status)}
                      className="ms-2"
                    >
                      {notification.status}
                    </Badge>
                  </div>
                  <div className="notification-time">
                    {formatTimestamp(notification.timestamp)}
                  </div>
                  <div className="notification-message">
                    Your order #{notification.orderId} status has been updated to {notification.status}.
                    {notification.reason && (
                      <div className="notification-reason mt-1">
                        <strong>Reason:</strong> {notification.reason}
                      </div>
                    )}
                  </div>
                </div>
              </Dropdown.Item>
            ))
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBar;
