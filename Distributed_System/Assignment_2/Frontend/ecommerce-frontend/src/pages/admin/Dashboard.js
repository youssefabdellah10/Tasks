import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faBuilding } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../../layouts/MainLayout';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <MainLayout>
      <h1 className="mb-4">Admin Dashboard</h1>
      <p className="lead mb-4">Welcome to the Admin Panel. You can manage seller accounts for companies here.</p>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="text-center mb-3">
                <FontAwesomeIcon icon={faUserPlus} size="3x" className="text-primary mb-3" />
                <h3>Create Seller Account</h3>
              </div>
              <p className="flex-grow-1">
                Create new seller accounts for existing companies in the system. Sellers will be able to manage dishes
                and process orders for their respective companies.
              </p>
              <Link to="/admin/sellers/create" className="btn btn-primary mt-auto">
                Create Seller
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="text-center mb-3">
                <FontAwesomeIcon icon={faBuilding} size="3x" className="text-secondary mb-3" />
                <h3>View Companies</h3>
              </div>
              <p className="flex-grow-1">
                View a list of all companies in the system to which you can assign seller accounts.
                This view is read-only as company management is handled by the system.
              </p>
              <Link to="/admin/companies/view" className="btn btn-secondary mt-auto">
                View Companies
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
};

export default AdminDashboard;