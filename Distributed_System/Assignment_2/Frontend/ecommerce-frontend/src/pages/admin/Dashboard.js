import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBuilding, faUtensils, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import AdminService from '../../services/admin.service';
import MainLayout from '../../layouts/MainLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalDishes: 0,
    totalOrders: 0,
    recentCompanies: [],
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
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="mb-2">
                <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary" />
              </div>
              <h3>{stats.totalUsers}</h3>
              <Card.Text>Total Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="mb-2">
                <FontAwesomeIcon icon={faBuilding} size="2x" className="text-success" />
              </div>
              <h3>{stats.totalCompanies}</h3>
              <Card.Text>Total Companies</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="mb-2">
                <FontAwesomeIcon icon={faUtensils} size="2x" className="text-info" />
              </div>
              <h3>{stats.totalDishes}</h3>
              <Card.Text>Total Dishes</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="mb-2">
                <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-warning" />
              </div>
              <h3>{stats.totalOrders}</h3>
              <Card.Text>Total Orders</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Recent Companies */}
      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5">Recent Companies</Card.Header>
        <Card.Body>
          {stats.recentCompanies && stats.recentCompanies.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Company Name</th>
                  <th>Owner</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentCompanies.map((company, index) => (
                  <tr key={company.id}>
                    <td>{index + 1}</td>
                    <td>{company.name}</td>
                    <td>{company.ownerName}</td>
                    <td>{new Date(company.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge bg-${company.isActive ? 'success' : 'danger'}`}>
                        {company.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No companies registered yet.</p>
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
                        user.userType === 'company' ? 'primary' :
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
