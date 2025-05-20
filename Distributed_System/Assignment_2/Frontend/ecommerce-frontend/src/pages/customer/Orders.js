import React, { useState, useEffect, useContext } from 'react';
import { Table, Badge, Button, Card, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import OrderService from '../../services/order.service';
import AuthContext from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';

const CustomerOrders = () => {  
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [customerBalance, setCustomerBalance] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await OrderService.getMyOrders();
        
        // Process orders to ensure they have the necessary information
        const processedOrders = response.map(order => {
          return order;
        });
        
        setOrders(processedOrders);
        
        // Fetch customer balance
        try {
          const balanceResponse = await OrderService.getCustomerBalance();
          setCustomerBalance(balanceResponse);
        } catch (balanceErr) {
          console.error('Error fetching balance:', balanceErr);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);
  const handlePayOrder = async (orderId) => {
    try {
      setPaymentLoading(true);
      setPaymentError('');
      setPaymentSuccess('');
      
      // Call the payment API endpoint
      await OrderService.payOrder(orderId);
      
      // Update the order in the list to show it's paid
      setOrders(orders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = { 
            ...order, 
            status: 'PROCESSING' 
          };
          
          return updatedOrder;
        }
        return order;
      }));
      
      // Refresh the customer balance
      try {
        const balanceResponse = await OrderService.getCustomerBalance();
        setCustomerBalance(balanceResponse);
      } catch (balanceErr) {
        console.error('Error refreshing balance after payment:', balanceErr);
      }
      
      setPaymentSuccess('Payment successful!');
    } catch (err) {
      console.error('Error processing payment:', err);
      setPaymentError('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PROCESSING':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <div className="text-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Orders</h2>
          {customerBalance !== null && (
            <Card className="text-center shadow-sm" style={{ width: '250px' }}>
              <Card.Body>
                <h5 className="mb-0">My Balance</h5>
                <h3 className="text-primary">${customerBalance.toFixed(2)}</h3>
              </Card.Body>
            </Card>
          )}
        </div>
        
        {paymentError && (
          <Alert variant="danger" dismissible onClose={() => setPaymentError('')}>
            {paymentError}
          </Alert>
        )}
        
        {paymentSuccess && (
          <Alert variant="success" dismissible onClose={() => setPaymentSuccess('')}>
            {paymentSuccess}
          </Alert>
        )}
        
        {orders.length === 0 ? (
          <Card className="text-center p-5 shadow-sm">
            <Card.Body>
              <h4>You haven't placed any orders yet</h4>
              <p className="text-muted">Browse dishes and place your first order!</p>
              <Button variant="primary" onClick={() => navigate('/customer/dishes')}>
                Browse Dishes
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Badge bg={getBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td>
                        {(order.status === 'PENDING') && (
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            className="me-2"
                            onClick={() => handlePayOrder(order.id)}
                            disabled={paymentLoading}
                          >
                            {paymentLoading ? 'Processing...' : 'Pay Now'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Container>
    </MainLayout>
  );
};

export default CustomerOrders;
