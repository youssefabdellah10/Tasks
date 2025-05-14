import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Table, Badge, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faShoppingCart, faDollarSign, faClock } from '@fortawesome/free-solid-svg-icons';
import DishService from '../../services/dish.service';
import OrderService from '../../services/order.service';
import AuthContext from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';

const SellerDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalDishes: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: [],
    topDishes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get seller dishes
        const dishes = await DishService.getSellerDishes(currentUser.userId);
        
        // Get seller orders
        const orders = await OrderService.getSellerOrders(currentUser.userId);
        
        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => {
          // Filter items for this seller
          const sellerItems = order.items.filter(item => {
            const dish = dishes.find(d => d.id === item.dishId);
            return dish !== undefined;
          });
          
          // Sum up revenue for seller items
          return sum + sellerItems.reduce((itemSum, item) => 
            itemSum + (item.price * item.quantity), 0);
        }, 0);
        
        // Count pending orders
        const pendingOrders = orders.filter(order => 
          order.status === 'PENDING' || order.status === 'PROCESSING'
        ).length;
        
        // Prepare top dishes (most ordered)
        const dishMap = {};
        orders.forEach(order => {
          order.items.forEach(item => {
            // Only count dishes from this seller
            const dish = dishes.find(d => d.id === item.dishId);
            if (dish) {
              if (dishMap[item.dishId]) {
                dishMap[item.dishId].orderCount += item.quantity;
                dishMap[item.dishId].revenue += item.price * item.quantity;
              } else {
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
          totalDishes: dishes.length,
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          pendingOrders: pendingOrders,
          recentOrders: orders.slice(0, 5),
          topDishes: topDishes
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    if (currentUser && currentUser.userId) {
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
      <h2 className="mb-4">Seller Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="mb-2">
                <FontAwesomeIcon icon={faUtensils} size="2x" className="text-primary" />
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
                <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-success" />
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
                <FontAwesomeIcon icon={faClock} size="2x" className="text-warning" />
              </div>
              <h3>{stats.pendingOrders}</h3>
              <Card.Text>Pending Orders</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="mb-2">
                <FontAwesomeIcon icon={faDollarSign} size="2x" className="text-info" />
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
                  <th>Items</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customerName}</td>
                    <td>
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx}>{item.dishName} x{item.quantity}</div>
                      ))}
                      {order.items.length > 2 && <div>+{order.items.length - 2} more</div>}
                    </td>
                    <td>
                      <Badge bg={
                        order.status === 'COMPLETED' ? 'success' :
                        order.status === 'PROCESSING' ? 'primary' :
                        order.status === 'CANCELLED' ? 'danger' : 'warning'
                      }>
                        {order.status}
                      </Badge>
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

export default SellerDashboard;
