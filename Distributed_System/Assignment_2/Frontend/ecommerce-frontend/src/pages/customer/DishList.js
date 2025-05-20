import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Form, InputGroup, Badge, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import DishService from '../../services/dish.service';
import AuthContext from '../../contexts/AuthContext';
import CartContext from '../../contexts/CartContext';
import MainLayout from '../../layouts/MainLayout';
import { useNavigate, Link } from 'react-router-dom';

const DishList = () => {
  const [dishes, setDishes] = useState([]);
  const [allDishes, setAllDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  
  const { currentUser } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      console.log('No user detected in DishList, redirecting to login');
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchAllDishes = async () => {
      try {
        setLoading(true);
        const response = await DishService.getAllDishes();
        const fetchedDishes = Array.isArray(response) ? response : [];
        setAllDishes(fetchedDishes);
        setDishes(fetchedDishes);
        
        // Extract unique companies from dishes
        const uniqueCompanies = [...new Set(fetchedDishes
          .filter(dish => dish.companyUsername)
          .map(dish => dish.companyUsername))];
        setCompanies(uniqueCompanies);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dishes:', err);
        setError('Failed to fetch dishes. Please try again later.');
        setAllDishes([]);
        setDishes([]);
        setCompanies([]);
        setLoading(false);
      }
    };
    
    fetchAllDishes();
  }, [currentUser]);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setDishes(allDishes);
        return;
      }
      
      try {
        const results = await DishService.searchDishes(searchTerm);
        setDishes(results);
      } catch (error) {
        console.error('Error searching dishes:', error);
      }
    };
    
    performSearch();
  }, [searchTerm, allDishes]);
  
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
      
      {companies.length > 0 && (
        <div className="mb-4">
          <h5>Browse by Company:</h5>
          <Form.Select 
            className="mb-3" 
            onChange={(e) => e.target.value && navigate(`/customer/company/${e.target.value}`)}
            aria-label="Select a company"
          >
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </Form.Select>
        </div>
      )}

      <Form className="mb-4">
        <InputGroup>
          <InputGroup.Text>
            <FontAwesomeIcon icon={faSearch} />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search dishes by name, description, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                      <Badge bg="success">${dish.price?.toFixed(2) || 'N/A'}</Badge>
                    </h5>
                  </div>
                  {dish.category && (
                    <Badge bg="info" className="mb-2 me-2">{dish.category}</Badge>
                  )}
                  {/* Display stock quantity */}
                  <Badge bg="secondary" className="mb-2">Stock: {dish.stock !== undefined ? dish.stock : 'N/A'}</Badge>
                  <Card.Text>
                    {dish.description}
                  </Card.Text>
                  <div className="mt-3 border-top pt-2">
                    <Card.Text className="text-muted mb-1">
                      <small><strong>Seller:</strong> {dish.sellerusername || 'N/A'}</small>
                    </Card.Text>
                    <Card.Text className="text-muted">
                      <small><strong>Company:</strong> {' '}
                        {dish.companyUsername ? (
                          <Link to={`/customer/company/${dish.companyUsername}`}>
                            {dish.companyUsername}
                          </Link>
                        ) : 'N/A'}
                      </small>
                    </Card.Text>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white border-top-0">
                  <Button 
                    variant="success" 
                    className="w-100"
                    onClick={() => addToCart(dish)}
                    disabled={!dish.stock || dish.stock <= 0}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                    Add to Cart
                  </Button>
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
