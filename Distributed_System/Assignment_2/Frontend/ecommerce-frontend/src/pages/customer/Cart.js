import React, { useContext, useState } from "react";
import {
  Button, Table, Card, Container, Form, InputGroup, Alert, Row, Col
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import CartContext from '../../contexts/CartContext';
import OrderService from '../../services/order.service';
import DishService from '../../services/dish.service';
import AuthContext from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart, getOrderItems } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const handlePlaceOrder = async () => {
    try {
      if (cartItems.length === 0) {
        setError('Your cart is empty');
        return;
      }
      
      setLoading(true);
      setError('');
      
      // Make sure we have a valid auth token
      if (!currentUser || !currentUser.userId) {
        setError('You must be logged in to place an order');
        setLoading(false);
        return;
      }
      
      // Get order items in the correct format
      const orderItems = getOrderItems();
      console.log('Submitting order with items:', orderItems);
      
      try {
        // Check if the user has a valid token before proceeding
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to place an order. Please log in and try again.');
          setLoading(false);
          return;
        }
        
        console.log('Token used for authentication:', token.substring(0, 10) + '...');
        console.log('Sending order request to API endpoint:', OrderService.getBaseUrl() + '/orders/placeorder');
        
        try {
          // Check stock availability before placing the order
          const stockCheckResult = await DishService.checkDishStock(orderItems);
          console.log('Stock check result:', stockCheckResult);
          
          // If not all items are available in stock, show detailed error message and stop
          if (!stockCheckResult.allAvailable) {
            const unavailableItems = stockCheckResult.stockResults.filter(
              (item) => !item.available
            );
            const errorMessages = unavailableItems
              .map(
                (item) => `${item.name || `Dish ${item.dishId}`}: Only ${item.availableQuantity} available`
              )
              .join(', ');
            setError(`Some items are out of stock: ${errorMessages}`);
            setLoading(false);
            return;
          }
          
          // Proceed with order placement if stock is available
          console.log('All items in stock, placing order...');
          console.log('About to call OrderService.placeOrder with items:', JSON.stringify(orderItems));
          const response = await OrderService.placeOrder(orderItems);
          console.log('Order placed successfully:', response);
          
          // Only clear cart if order was successful
          clearCart();
          setSuccess('Order placed successfully! Redirecting to your orders...');
          
          // Redirect to orders page after a short delay
          setTimeout(() => {
            navigate('/customer/orders');
          }, 2000);
        } catch (innerError) {
          console.error('Inner error during order placement:', innerError);
          throw innerError;
        }
      } catch (apiError) {
        console.error('API Error in handlePlaceOrder:', apiError);
        
        // Extract most informative error message
        let errorMsg = 'Failed to place order. Please try again.';
        
        if (apiError.response) {
          console.error('Response error data:', apiError.response.data);
          console.error('Response status:', apiError.response.status);
          
          if (typeof apiError.response.data === 'string') {
            errorMsg = apiError.response.data;
          } else if (apiError.response.data && apiError.response.data.message) {
            errorMsg = apiError.response.data.message;
          } else if (apiError.response.data && apiError.response.data.error) {
            errorMsg = apiError.response.data.error;
          }
        } else if (apiError.request) {
          // The request was made but no response was received
          console.error('No response received:', apiError.request);
          errorMsg = 'Network error: The server is not responding. Please try again later.';
        } else if (apiError.message) {
          errorMsg = apiError.message;
        }
        
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Unexpected error in handlePlaceOrder:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuantityChange = (dishId, newQuantity) => {
    const quantity = parseInt(newQuantity, 10);
    if (!isNaN(quantity)) {
      updateQuantity(dishId, quantity);
    }
  };
  
  return (
    <MainLayout>
      <Container>
        <h2 className="mb-4">
          <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
          Shopping Cart
        </h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        {cartItems.length === 0 ? (
          <Card className="text-center p-5 shadow-sm">
            <Card.Body>
              <h4>Your cart is empty</h4>
              <p className="text-muted">Browse dishes and add some to your cart!</p>
              <Button variant="primary" onClick={() => navigate('/customer/dishes')}>
                Browse Dishes
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Dish</th>
                      <th>Seller</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.dishId}>
                        <td>{item.name}</td>
                        <td>{item.sellerName}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>
                          <InputGroup size="sm" style={{ width: '120px' }}>
                            <Button 
                              variant="outline-secondary"
                              onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                            >
                              <FontAwesomeIcon icon={faMinus} />
                            </Button>
                            <Form.Control
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.dishId, e.target.value)}
                              style={{ textAlign: 'center' }}
                            />
                            <Button 
                              variant="outline-secondary"
                              onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </Button>
                          </InputGroup>
                        </td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                        <td>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => removeFromCart(item.dishId)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" className="text-end">
                        <strong>Total:</strong>
                      </td>
                      <td>
                        <strong>${cartTotal.toFixed(2)}</strong>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </Table>
              </Card.Body>
            </Card>
            
            <Row className="mb-4">
              <Col xs={12} className="d-flex justify-content-between">
                <Button 
                  variant="outline-secondary" 
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
                <Button
                  variant="success"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </MainLayout>
  );
};

export default Cart;
