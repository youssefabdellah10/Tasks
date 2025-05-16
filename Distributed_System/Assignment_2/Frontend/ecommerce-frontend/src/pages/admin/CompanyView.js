import React, { useState, useEffect } from 'react';
import { Table, Card, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../../layouts/MainLayout';
import AdminService from '../../services/admin.service';
import { Link } from 'react-router-dom';

const CompanyView = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchCompanies();
  }, []);
  
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllCompanies();
      setCompanies(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch companies. Please try again later.');
      setLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Companies</h1>
        <Link to="/admin/sellers/create" className="btn btn-primary">
          Create Seller Account
        </Link>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="shadow-sm">
        <Card.Header>
          <FontAwesomeIcon icon={faBuilding} className="me-2" />
          Registered Companies
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : companies.length === 0 ? (
            <Alert variant="info">
              No companies found in the system.
            </Alert>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Company Name</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company, index) => (
                  <tr key={company.id}>
                    <td>{index + 1}</td>
                    <td>{company.name}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      <div className="mt-3">
        <p className="text-muted small">
          <em>Note: This is a read-only view of companies in the system. To create a seller for any of these companies, use the "Create Seller Account" button.</em>
        </p>
      </div>
    </MainLayout>
  );
};

export default CompanyView;
