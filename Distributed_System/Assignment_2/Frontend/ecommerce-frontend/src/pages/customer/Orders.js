import React, { useState, useEffect, useContext } from 'react';
import { Table, Badge, Button, Card, Container, Row, Col, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import OrderService from '../../services/order.service';
import AuthContext from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';

const CustomerOrders = () => {  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await OrderService.getMyOrders();
        setOrders(response);
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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  const handleCancelOrder = async (orderId) => {
    try {
      await OrderService.updateOrderStatus(orderId, 'CANCELLED');
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'CANCELLED' } : order
      ));
    } catch (err) {
      console.error('Error cancelling order:', err);
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
    <MainLayout>      <Container>
        <h2 className="mb-4">My Orders</h2>
        
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
                    <th>Items</th>
                    <th>Total</th>
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
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx}>{item.dishName} x{item.quantity}</div>
                        ))}
                        {order.items.length > 2 && <div>+{order.items.length - 2} more</div>}
                      </td>
                      <td>${order.totalAmount.toFixed(2)}</td>
                      <td>
                        <Badge bg={getBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleViewOrder(order)}
                        >
                          <FontAwesomeIcon icon={faEye} /> View
                        </Button>
                        
                        {(order.status === 'PENDING') && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <FontAwesomeIcon icon={faTimesCircle} /> Cancel
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
        <Modal 
          show={showOrderDetails} 
          onHide={() => setShowOrderDetails(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Order Details #{selectedOrder?.id}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <Row className="mb-3">
                  <Col md={6}>
                    <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    <p><strong>Status:</strong> <Badge bg={getBadgeVariant(selectedOrder.status)}>{selectedOrder.status}</Badge></p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Delivery Address:</strong> {selectedOrder.deliveryAddress}</p>
                    <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                  </Col>
                </Row>
                
                <h5 className="mb-3">Order Items</h5>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Seller</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.dishName}</td>
                        <td>{item.sellerName}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="table-light">
                      <td colSpan="4" className="text-end"><strong>Total:</strong></td>
                      <td><strong>${selectedOrder.totalAmount.toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </Table>
                
                {selectedOrder.notes && (
                  <>
                    <h5 className="mb-2">Order Notes</h5>
                    <p>{selectedOrder.notes}</p>
                  </>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowOrderDetails(false)}>
              Close
            </Button>
            {selectedOrder && selectedOrder.status === 'PENDING' && (
              <Button 
                variant="danger" 
                onClick={() => {
                  handleCancelOrder(selectedOrder.id);
                  setShowOrderDetails(false);
                }}
              >
                Cancel Order
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
    </MainLayout>
  );
};

export default CustomerOrders;
