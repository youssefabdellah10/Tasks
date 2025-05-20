import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Badge, Button, Alert, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate } from 'react-router-dom';
import DishService from '../../services/dish.service';
import AuthContext from '../../contexts/AuthContext';
import CartContext from '../../contexts/CartContext';
import MainLayout from '../../layouts/MainLayout';

const CompanyDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companies, setCompanies] = useState([]);
  const [stockSummary, setStockSummary] = useState({
    totalDishes: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });
  
  const { companyUsername } = useParams();
  const { currentUser } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      console.log('No user detected in CompanyDishes, redirecting to login');
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  useEffect(() => {
    const fetchCompanyDishes = async () => {
      try {
        setLoading(true);
        setCompanyName(companyUsername); // Set company name from URL parameter
        
        // Fetch all dishes to get companies list
        const allDishesResponse = await DishService.getAllDishes();
        const allDishes = Array.isArray(allDishesResponse) ? allDishesResponse : [];
        
        // Extract unique companies
        const uniqueCompanies = [...new Set(allDishes
          .filter(dish => dish.companyUsername)
          .map(dish => dish.companyUsername))];
        setCompanies(uniqueCompanies);
        
        // Fetch dishes for the selected company
        const response = await DishService.getCompanyDishes(companyUsername);
        const fetchedDishes = Array.isArray(response) ? response : [];
        
        setDishes(fetchedDishes);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching company dishes:', err);
        setError(`Failed to fetch dishes for ${companyUsername}. Please try again later.`);
        setDishes([]);
        setLoading(false);
      }
    };
    
    if (companyUsername) {
      fetchCompanyDishes();
    } else {
      setError('No company specified');
      setLoading(false);
    }
  }, [companyUsername]);
  
  useEffect(() => {
    // Calculate stock summary whenever dishes are loaded
    if (dishes && dishes.length > 0) {
      const summary = {
        totalDishes: dishes.length,
        inStock: dishes.filter(dish => dish.stock > 10).length,
        lowStock: dishes.filter(dish => dish.stock > 0 && dish.stock <= 10).length,
        outOfStock: dishes.filter(dish => !dish.stock || dish.stock <= 0).length
      };
      setStockSummary(summary);
    }
  }, [dishes]);
  
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{companyName}'s Dishes</h2>
        <Button variant="outline-primary" onClick={() => navigate('/customer/dishes')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to All Dishes
        </Button>
      </div>
      
      {/* Stock Summary */}
      {dishes.length > 0 && (
        <div className="mb-4 p-3 border rounded bg-light">
          <h5>Stock Summary:</h5>
          <Row className="text-center g-2">
            <Col>
              <div className="p-2 border rounded bg-white">
                <div className="h4">{stockSummary.totalDishes}</div>
                <div className="small text-muted">Total Dishes</div>
              </div>
            </Col>
            <Col>
              <div className="p-2 border rounded bg-white">
                <div className="h4 text-success">{stockSummary.inStock}</div>
                <div className="small text-muted">In Stock</div>
              </div>
            </Col>
            <Col>
              <div className="p-2 border rounded bg-white">
                <div className="h4 text-warning">{stockSummary.lowStock}</div>
                <div className="small text-muted">Low Stock</div>
              </div>
            </Col>
            <Col>
              <div className="p-2 border rounded bg-white">
                <div className="h4 text-danger">{stockSummary.outOfStock}</div>
                <div className="small text-muted">Out of Stock</div>
              </div>
            </Col>
          </Row>
        </div>
      )}
      
      {companies.length > 0 && (
        <div className="mb-4">
          <Form.Label>Switch to another company:</Form.Label>
          <Form.Select 
            value={companyUsername}
            onChange={(e) => {
              if (e.target.value) {
                navigate(`/customer/company/${e.target.value}`);
              } else {
                navigate('/customer/dishes');
              }
            }}
          >
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </Form.Select>
        </div>
      )}
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {dishes.length === 0 ? (
        <Alert variant="info">No dishes found for this company.</Alert>
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
                    <Badge bg="info" className="mb-2">{dish.category}</Badge>
                  )}
                  <Card.Text>
                    {dish.description}
                  </Card.Text>
                  <div className="mt-3 border-top pt-2">
                    <Card.Text className="text-muted mb-1">
                      <small><strong>Seller:</strong> {dish.sellerusername || 'N/A'}</small>
                    </Card.Text>                    <Card.Text className="text-muted">
                      <small><strong>Company:</strong> {dish.companyUsername || 'N/A'}</small>
                    </Card.Text>
                    <Card.Text className="text-muted mt-2">
                      <small><strong>Stock:</strong> {' '}
                        <Badge bg={dish.stock > 10 ? "success" : dish.stock > 0 ? "warning" : "danger"}>
                          {dish.stock > 0 ? `${dish.stock} available` : 'Out of stock'}
                        </Badge>
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

export default CompanyDishes;
