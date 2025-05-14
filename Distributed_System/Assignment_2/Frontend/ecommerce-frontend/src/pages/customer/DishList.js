import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import DishService from '../../services/dish.service';
import AuthContext from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';

const DishList = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Extra check to ensure authentication
  useEffect(() => {
    if (!currentUser) {
      console.log('No user detected in DishList, redirecting to login');
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        let response;
        
        if (searchTerm) {
          // If there's a search term, use search functionality
          response = await DishService.searchDishes(searchTerm);
        } else if (currentUser && currentUser.companyId) {
          // If user belongs to a company, show company dishes
          response = await DishService.getCompanyDishes(currentUser.companyId);
        } else {
          // Otherwise, get all dishes
          response = await DishService.getAllDishes();
        }
        
        console.log('API Response:', response);
        
        // Ensure dishes is always an array
        setDishes(Array.isArray(response) ? response : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dishes:', err);
        setError('Failed to fetch dishes. Please try again later.');
        setDishes([]); // Set to empty array in case of error
        setLoading(false);
      }
    };
    
    fetchDishes();
  }, [currentUser, searchTerm]);
  
  const handleSearch = (e) => {
    e.preventDefault();
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
      <h2 className="mb-4">Available Dishes</h2>
      
      <Form onSubmit={handleSearch} className="mb-4">
        <InputGroup>
          <Form.Control
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" variant="outline-primary">
            <FontAwesomeIcon icon={faSearch} />
          </Button>
        </InputGroup>
      </Form>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {dishes.length === 0 ? (
        <div className="alert alert-info">No dishes found.</div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {dishes.map((dish, index) => (
            <Col key={dish.id || index}>
              <Card className="h-100 shadow-sm">
                {dish.image && (
                  <Card.Img 
                    variant="top" 
                    src={dish.image} 
                    alt={dish.name} 
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <Card.Title>{dish.name}</Card.Title>
                    <h5>
                      <Badge bg="success">${dish.price.toFixed(2)}</Badge>
                    </h5>
                  </div>
                  <Card.Text>
                    {dish.description}
                  </Card.Text>
                  <div className="mt-3 border-top pt-2">
                    <Card.Text className="text-muted mb-1">
                      <small><strong>Seller:</strong> {dish.sellerusername || 'N/A'}</small>
                    </Card.Text>
                    <Card.Text className="text-muted">
                      <small><strong>Company:</strong> {dish.companyUsername || 'N/A'}</small>
                    </Card.Text>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white border-top-0">
                  {/* Cart functionality removed */}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </MainLayout>
  );
};

export default DishList;
