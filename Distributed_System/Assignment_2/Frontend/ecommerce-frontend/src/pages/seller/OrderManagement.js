import React, { useState, useEffect, useContext } from 'react';
import { Table, Badge, Button, Card, Alert, Container, Row, Col, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import OrderService from '../../services/order.service';
import AuthContext from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';

const SellerOrders = () => {
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await OrderService.getSellerOrders(currentUser.userId);
        setOrders(response);
        setLoading(false);
      } catch (err) {
        setError('Failed to load orders');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const filteredOrders = statusFilter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleUpdateStatusClick = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowUpdateStatus(true);
  };

  const handleUpdateOrderStatus = async () => {
    try {
      await OrderService.updateOrderStatus(selectedOrder.id, newStatus);
      
      // Update the local state to reflect the change
      setOrders(orders.map(order => 
        order.id === selectedOrder.id ? { ...order, status: newStatus } : order
      ));
      
      setShowUpdateStatus(false);
    } catch (err) {
      setError('Failed to update order status');
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
        <h2 className="mb-4">Manage Orders</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {/* Filter controls */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Filter by Status</Form.Label>
              <Form.Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6} className="d-flex align-items-end">
            {statusFilter !== 'ALL' && (
              <Badge bg={getBadgeVariant(statusFilter)} className="p-2 mb-2">
                {filteredOrders.length} {statusFilter.toLowerCase()} order(s)
              </Badge>
            )}
          </Col>
        </Row>
        
        {orders.length === 0 ? (
          <Card className="text-center p-5 shadow-sm">
            <Card.Body>
              <h4>No orders found</h4>
              <p className="text-muted">You don't have any orders to manage yet.</p>
            </Card.Body>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="text-center p-5 shadow-sm">
            <Card.Body>
              <h4>No {statusFilter.toLowerCase()} orders found</h4>
              <p className="text-muted">Try selecting a different filter.</p>
            </Card.Body>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    // Filter items for this seller only
                    const sellerItems = order.items.filter(item => item.sellerId === currentUser.userId);
                    const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    
                    return (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customerName}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          {sellerItems.slice(0, 2).map((item, idx) => (
                            <div key={idx}>{item.dishName} x{item.quantity}</div>
                          ))}
                          {sellerItems.length > 2 && <div>+{sellerItems.length - 2} more</div>}
                        </td>
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
                          
                          {(order.status !== 'CANCELLED' && order.status !== 'COMPLETED') && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleUpdateStatusClick(order)}
                            >
                              <FontAwesomeIcon icon={faEdit} /> Update
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
        
        {/* Order Details Modal */}
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
                    <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    <p><strong>Status:</strong> <Badge bg={getBadgeVariant(selectedOrder.status)}>{selectedOrder.status}</Badge></p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Delivery Address:</strong> {selectedOrder.deliveryAddress}</p>
                    <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                  </Col>
                </Row>
                
                <h5 className="mb-3">Your Items in This Order</h5>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items
                      .filter(item => item.sellerId === currentUser.userId)
                      .map((item, index) => (
                        <tr key={index}>
                          <td>{item.dishName}</td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))
                    }
                    <tr className="table-light">
                      <td colSpan="3" className="text-end"><strong>Total for your items:</strong></td>
                      <td>
                        <strong>
                          ${selectedOrder.items
                            .filter(item => item.sellerId === currentUser.userId)
                            .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                            .toFixed(2)
                          }
                        </strong>
                      </td>
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
            {selectedOrder && selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && (
              <Button 
                variant="primary" 
                onClick={() => {
                  setShowOrderDetails(false);
                  handleUpdateStatusClick(selectedOrder);
                }}
              >
                Update Status
              </Button>
            )}
          </Modal.Footer>
        </Modal>
        
        {/* Update Status Modal */}
        <Modal 
          show={showUpdateStatus} 
          onHide={() => setShowUpdateStatus(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Update Order Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Current Status</Form.Label>
                  <h5>
                    <Badge bg={getBadgeVariant(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </h5>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>New Status</Form.Label>
                  <Form.Select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </Form.Select>
                </Form.Group>
                
                {newStatus === 'CANCELLED' && (
                  <Alert variant="warning">
                    <FontAwesomeIcon icon={faExclamationTriangle} /> Cancelling an order cannot be undone.
                  </Alert>
                )}
                
                {newStatus === 'COMPLETED' && (
                  <Alert variant="success">
                    <FontAwesomeIcon icon={faCheckCircle} /> Marking an order as completed indicates that it has been prepared and delivered.
                  </Alert>
                )}
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUpdateStatus(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpdateOrderStatus}
            >
              Update Status
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </MainLayout>
  );
};

export default SellerOrders;
