import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Table, Button, Modal, Form, Alert, Badge, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faSync } from '@fortawesome/free-solid-svg-icons';
import DishService from '../../services/dish.service';
import AuthContext from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';

const SellerDishes = () => {
  const { currentUser } = useContext(AuthContext);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Store userId in a ref to prevent unnecessary re-renders
  const userIdRef = React.useRef(currentUser?.userId);
  const requestInProgressRef = React.useRef(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentDish, setCurrentDish] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('100');
  const [image, setImage] = useState('');
  const [formError, setFormError] = useState('');
  
  const [quickStockEdit, setQuickStockEdit] = useState({ dishId: null, stock: '' });
  
  // Extract fetchDishes as a separate named function with useCallback
  const fetchDishes = useCallback(async () => {
    if (!currentUser?.userId || requestInProgressRef.current) {
      console.log("Skipping fetch - no userId or request in progress");
      return;
    }
    
    try {
      console.log("Fetching dishes for user:", currentUser.userId);
      requestInProgressRef.current = true;
      setLoading(true);
      
      const response = await DishService.getSellerDishes();
      console.log("Dishes response:", response);
      
      setDishes(response || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dishes:", err);
      setError('Failed to fetch dishes. Please try again later.');
      setLoading(false);
    } finally {
      requestInProgressRef.current = false;
    }
  }, [currentUser?.userId]);
  
  // Effect to monitor user changes 
  useEffect(() => {
    // Only fetch if user ID has actually changed from what we've already fetched
    if (currentUser?.userId && currentUser.userId !== userIdRef.current) {
      // Update ref with current userId
      userIdRef.current = currentUser.userId;
      fetchDishes();
    }
  }, [currentUser, fetchDishes]);
  
  // Initial load effect - always fetch on component mount
  useEffect(() => {
    console.log("Component mounted, currentUser:", currentUser);
    if (currentUser?.userId) {
      fetchDishes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const openAddModal = () => {
    setModalTitle('Add New Dish');
    setCurrentDish(null);
    resetForm();
    setShowModal(true);
  };
  
  const openEditModal = (dish) => {
    setModalTitle('Edit Dish');
    setCurrentDish(dish);
    // Populate form with dish data
    setName(dish.name);
    setDescription(dish.description);
    setPrice(dish.price.toString());
    setStock(dish.stock ? dish.stock.toString() : '100');
    setImage(dish.image || '');
    setShowModal(true);
  };
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStock('100');
    setImage('');
    setFormError('');
  };
  
  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };
  
  const validateForm = () => {
    if (!name.trim()) return 'Name is required';
    if (!description.trim()) return 'Description is required';
    if (!price) return 'Price is required';
    if (!stock) return 'Stock quantity is required';
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      return 'Price must be a positive number';
    }
    
    const stockValue = parseInt(stock, 10);
    if (isNaN(stockValue) || stockValue <= 0) {
      return 'Stock must be a positive number';
    }
    
    return null;
  };
  
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    
    try {
      const dishData = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        image,
        sellerId: currentUser.userId,
        companyId: currentUser.companyId
      };
      
      if (currentDish) {
        // Update existing dish
        await DishService.updateDish(currentDish.id, dishData);
      } else {
        // Create new dish
        await DishService.createDish(dishData);
      }
      
      handleClose();
      // Refresh dishes list
      fetchDishes();
    } catch (err) {      setFormError(err.response?.data?.message || 'Failed to save dish');
    }
  };
  
  const handleQuickStockUpdate = (dish) => {
    setQuickStockEdit({ dishId: dish.id, stock: dish.stock.toString() });
  };

  const saveStockUpdate = async () => {
    if (!quickStockEdit.dishId) return;
    
    const stockValue = parseInt(quickStockEdit.stock, 10);
    if (isNaN(stockValue) || stockValue < 0) {
      setError('Stock must be a non-negative number');
      return;
    }
    
    try {
      await DishService.updateStock(quickStockEdit.dishId, stockValue);
      setQuickStockEdit({ dishId: null, stock: '' });
      fetchDishes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock');
    }
  };
  
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
      <div className="mb-4">
        <h2 className="mb-1">Seller Portal</h2>
        <p className="text-muted">Manage your menu items and dish inventory</p>
      </div>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={fetchDishes}
            className="me-2"
          >
            <FontAwesomeIcon icon={faSync} className="me-1" /> Refresh
          </Button>
          {dishes.length > 0 && (
            <span className="text-muted small">{dishes.length} dish{dishes.length !== 1 ? 'es' : ''} in your menu</span>
          )}
        </div>
        <Button variant="success" onClick={openAddModal}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add New Dish
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {dishes.length === 0 ? (        <Alert variant="info">
          <div className="text-center py-4">
            <h4>Welcome to your Seller Portal!</h4>
            <p>You haven't added any dishes yet. Click the "Add New Dish" button to get started.</p>
            <Button 
              variant="success" 
              onClick={openAddModal}
              className="mt-2"
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Your First Dish
            </Button>
          </div>
        </Alert>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, index) => (
              <tr key={dish.id}>
                <td>{index + 1}</td>
                <td>{dish.name}</td>
                <td>
                  {dish.description.length > 50
                    ? `${dish.description.substring(0, 50)}...`
                    : dish.description}
                </td>                <td>${dish.price.toFixed(2)}</td>                <td>
                  <Badge bg={dish.stock > 10 ? "success" : dish.stock > 0 ? "warning" : "danger"}>
                    {dish.stock > 0 ? dish.stock : 'Out of stock'}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => openEditModal(dish)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleQuickStockUpdate(dish)}
                  >
                    <FontAwesomeIcon icon={faSync} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      {/* Add/Edit Dish Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          
          <Form>
            <Form.Group className="mb-3" controlId="dishName">
              <Form.Label>Dish Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter dish name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="dishDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter dish description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="dishPrice">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="dishStock">
              <Form.Label>Stock Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                placeholder="Enter available stock quantity"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="dishImage">
              <Form.Label>Image URL (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter image URL"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Stock Update Modal */}
      <Modal show={quickStockEdit.dishId !== null} onHide={() => setQuickStockEdit({ dishId: null, stock: '' })}>
        <Modal.Header closeButton>
          <Modal.Title>Update Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="stockUpdate">
              <Form.Label>Stock Quantity</Form.Label>
              <Form.Control
                type="number"
                min="0"
                placeholder="Enter available stock quantity"
                value={quickStockEdit.stock}
                onChange={(e) => setQuickStockEdit({...quickStockEdit, stock: e.target.value})}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setQuickStockEdit({ dishId: null, stock: '' })}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveStockUpdate}>
            Update Stock
          </Button>
        </Modal.Footer>
      </Modal>
    </MainLayout>
  );
};

export default SellerDishes;
