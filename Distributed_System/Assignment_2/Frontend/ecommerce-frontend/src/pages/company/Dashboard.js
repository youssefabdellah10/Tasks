import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Table, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUtensils, faShoppingCart, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import CompanyService from '../../services/company.service';
import DishService from '../../services/dish.service';
import OrderService from '../../services/order.service';
import AuthContext from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';

const CompanyDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalSellers: 0,
    totalDishes: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topDishes: []
  });
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get company details
        const companyDetails = await CompanyService.getCompanyDetails(currentUser.companyId);
        setCompanyInfo(companyDetails);
        
        // Get company statistics
        const statsData = await CompanyService.getCompanyStats(currentUser.companyId);
        
        // Get company dishes for count
        const dishes = await DishService.getCompanyDishes(currentUser.companyId);
        
        // Get company orders for count and recent orders
        const orders = await OrderService.getCompanyOrders(currentUser.companyId);
        
        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        // Prepare top dishes (most ordered)
        // This is a simple calculation - in a real app you'd get this from the backend
        const dishMap = {};
        orders.forEach(order => {
          order.items.forEach(item => {
            if (dishMap[item.dishId]) {
              dishMap[item.dishId].orderCount += item.quantity;
              dishMap[item.dishId].revenue += item.price * item.quantity;
            } else {
              const dish = dishes.find(d => d.id === item.dishId);
              if (dish) {
                dishMap[item.dishId] = {
                  id: item.dishId,
                  name: dish.name,
                  orderCount: item.quantity,
                  revenue: item.price * item.quantity
                };
              }
            }
          });
        });
        
        const topDishes = Object.values(dishMap)
          .sort((a, b) => b.orderCount - a.orderCount)
          .slice(0, 5);
        
        setStats({
          totalSellers: statsData.totalSellers || 0,
          totalDishes: dishes.length,
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          recentOrders: orders.slice(0, 5),
          topDishes: topDishes
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    if (currentUser && currentUser.companyId) {
      fetchDashboardData();
    }
  }, [currentUser]);

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
      <h2 className="mb-4">Company Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {companyInfo && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row>
              <Col md={8}>
                <h3>{companyInfo.name}</h3>
                <p className="text-muted">{companyInfo.description}</p>
              </Col>
              <Col md={4} className="text-end">
                <p className="mb-1"><strong>Owner:</strong> {companyInfo.ownerName}</p>
                <p className="mb-1"><strong>Email:</strong> {companyInfo.ownerEmail}</p>
                <p className="mb-0">
                  <span className={`badge bg-${companyInfo.isActive ? 'success' : 'danger'}`}>
                    {companyInfo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="mb-2">
                <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary" />
              </div>
              <h3>{stats.totalSellers}</h3>
              <Card.Text>Total Sellers</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="mb-2">
                <FontAwesomeIcon icon={faUtensils} size="2x" className="text-success" />
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
                <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-info" />
              </div>
              <h3>{stats.totalOrders}</h3>
              <Card.Text>Total Orders</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="mb-2">
                <FontAwesomeIcon icon={faDollarSign} size="2x" className="text-warning" />
              </div>
              <h3>${stats.totalRevenue.toFixed(2)}</h3>
              <Card.Text>Total Revenue</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Top Dishes */}
      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5">Top Selling Dishes</Card.Header>
        <Card.Body>
          {stats.topDishes && stats.topDishes.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Dish Name</th>
                  <th>Total Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topDishes.map((dish, index) => (
                  <tr key={dish.id}>
                    <td>{index + 1}</td>
                    <td>{dish.name}</td>
                    <td>{dish.orderCount}</td>
                    <td>${dish.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No dishes have been ordered yet.</p>
          )}
        </Card.Body>
      </Card>
      
      {/* Recent Orders */}
      <Card className="shadow-sm">
        <Card.Header as="h5">Recent Orders</Card.Header>
        <Card.Body>
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customerName}</td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`badge bg-${
                        order.status === 'COMPLETED' ? 'success' :
                        order.status === 'PROCESSING' ? 'primary' :
                        order.status === 'CANCELLED' ? 'danger' : 'warning'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No orders have been placed yet.</p>
          )}
        </Card.Body>
      </Card>
    </MainLayout>
  );
};

export default CompanyDashboard;
