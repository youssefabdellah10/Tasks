import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Alert, Button, ProgressBar, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faUtensils, faShoppingCart, 
  faUserPlus, faChartBar, faCog, faTachometerAlt,
  faHistory, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import AdminService from '../../services/admin.service';
import MainLayout from '../../layouts/MainLayout';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDishes: 0,
    totalOrders: 0,
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await AdminService.getDashboardStats();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      <h2 className="mb-4">Admin Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="mb-2">
                <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary" />
              </div>
              <h3>{stats.totalUsers}</h3>
              <Card.Text>Total Users</Card.Text>
              {stats.userGrowth && (
                <small className={`text-${stats.userGrowth > 0 ? 'success' : 'danger'}`}>
                  {stats.userGrowth > 0 ? '+' : ''}{stats.userGrowth}% from last month
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="mb-2">
                <FontAwesomeIcon icon={faUtensils} size="2x" className="text-info" />
              </div>
              <h3>{stats.totalDishes}</h3>
              <Card.Text>Total Dishes</Card.Text>
              {stats.dishGrowth && (
                <small className={`text-${stats.dishGrowth > 0 ? 'success' : 'danger'}`}>
                  {stats.dishGrowth > 0 ? '+' : ''}{stats.dishGrowth}% from last month
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="mb-2">
                <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-warning" />
              </div>
              <h3>{stats.totalOrders}</h3>
              <Card.Text>Total Orders</Card.Text>
              {stats.orderGrowth && (
                <small className={`text-${stats.orderGrowth > 0 ? 'success' : 'danger'}`}>
                  {stats.orderGrowth > 0 ? '+' : ''}{stats.orderGrowth}% from last month
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Admin Activity Summary */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
            System Overview
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4} className="mb-3">
              <div className="mb-1 d-flex justify-content-between">
                <small>User Registrations (Last 7 days)</small>
                <small>{stats.weeklyRegistrations || 0}</small>
              </div>
              <ProgressBar 
                now={stats.weeklyRegistrations ? Math.min((stats.weeklyRegistrations / 100) * 100, 100) : 0}
                variant="primary" 
                className="mb-3"
              />
              
              <div className="mb-1 d-flex justify-content-between">
                <small>Order Conversion Rate</small>
                <small>{stats.conversionRate || 0}%</small>
              </div>
              <ProgressBar 
                now={stats.conversionRate || 0} 
                variant="success" 
                className="mb-3"
              />
              
              <div className="mb-1 d-flex justify-content-between">
                <small>System Uptime</small>
                <small>{stats.systemUptime || '99.9'}%</small>
              </div>
              <ProgressBar 
                now={stats.systemUptime || 99.9} 
                variant="info" 
              />
            </Col>
            
            <Col md={8}>
              <h6>Category Distribution</h6>
              <Table size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Dishes</th>
                    <th>% of Total</th>
                    <th>Popularity</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.categoryDistribution || [
                    { name: 'Main Dishes', count: 45, percentage: 30, popular: 'High' },
                    { name: 'Desserts', count: 30, percentage: 20, popular: 'Medium' },
                    { name: 'Appetizers', count: 25, percentage: 16.7, popular: 'Medium' },
                    { name: 'Beverages', count: 15, percentage: 10, popular: 'Low' }
                  ]).map((category, index) => (
                    <tr key={index}>
                      <td>{category.name}</td>
                      <td>{category.count}</td>
                      <td>{category.percentage}%</td>
                      <td>
                        <Badge 
                          bg={
                            category.popular === 'High' ? 'success' : 
                            category.popular === 'Medium' ? 'warning' : 'secondary'
                          }
                        >
                          {category.popular}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Quick Links */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            Quick Actions
          </h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={3} className="mb-3 mb-md-0">
              <Link to="/admin/users" className="btn btn-outline-primary w-100">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Manage Users
              </Link>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Link to="/admin/reports" className="btn btn-outline-warning w-100">
                <FontAwesomeIcon icon={faChartBar} className="me-2" />
                View Reports
              </Link>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Link to="/admin/settings" className="btn btn-outline-secondary w-100">
                <FontAwesomeIcon icon={faCog} className="me-2" />
                System Settings
              </Link>
            </Col>
            <Col md={3}>
              <Link to="/admin/activity-logs" className="btn btn-outline-primary w-100">
                <FontAwesomeIcon icon={faHistory} className="me-2" />
                Activity Logs
              </Link>
            </Col>
          </Row>
          
          <Row>
            <Col md={3} className="mb-3 mb-md-0">
              <Link to="/admin/dishes" className="btn btn-outline-danger w-100">
                <FontAwesomeIcon icon={faUtensils} className="me-2" />
                Manage Dishes
              </Link>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Link to="/admin/orders" className="btn btn-outline-dark w-100">
                <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                Manage Orders
              </Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* System Health */}
      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          System Health Alerts
        </Card.Header>
        <Card.Body>
          {(stats.systemAlerts && stats.systemAlerts.length > 0) ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Issue</th>
                  <th>Affected</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(stats.systemAlerts || [
                  { id: 1, severity: 'warning', issue: 'Disk space running low', affected: 'Image upload service', time: '2025-05-15T10:30:00' },
                  { id: 2, severity: 'info', issue: 'System backup completed', affected: 'Database', time: '2025-05-15T05:00:00' },
                  { id: 3, severity: 'danger', issue: 'Failed login attempts detected', affected: 'Authentication system', time: '2025-05-15T08:45:00' }
                ]).map((alert, index) => (
                  <tr key={alert.id || index}>
                    <td>
                      <Badge bg={alert.severity}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </Badge>
                    </td>
                    <td>{alert.issue}</td>
                    <td>{alert.affected}</td>
                    <td>{new Date(alert.time).toLocaleString()}</td>
                    <td>
                      <Button variant="outline-secondary" size="sm">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="success">No system alerts at this time. Everything is running smoothly.</Alert>
          )}
        </Card.Body>
      </Card>
      
      {/* Recent Users */}
      <Card className="shadow-sm">
        <Card.Header as="h5">Recent Users</Card.Header>
        <Card.Body>
          {stats.recentUsers && stats.recentUsers.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>User Type</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge bg-${
                        user.userType === 'admin' ? 'danger' :
                        user.userType === 'seller' ? 'success' : 'info'
                      }`}>
                        {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No users registered yet.</p>
          )}
        </Card.Body>
      </Card>
    </MainLayout>
  );
};

export default AdminDashboard;
