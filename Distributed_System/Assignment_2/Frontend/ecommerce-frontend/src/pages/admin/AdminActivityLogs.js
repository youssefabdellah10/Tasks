import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Pagination, Badge, Form, Row, Col, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faTrash, faFilter, faDownload, faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../../layouts/MainLayout';
import AdminService from '../../services/admin.service';

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    action: '',
    user: '',
    dateFrom: '',
    dateTo: ''
  });

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      // For demo purposes, we'll use the getActivityLogs without filters
      // In a real app, you would pass the filters as query parameters
      const response = await AdminService.getActivityLogs(page);
      setLogs(response.logs || []);
      setTotalPages(response.totalPages || 1);
      setLoading(false);
    } catch (err) {
      setError('Failed to load activity logs. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would apply the filters and refresh the data
    fetchLogs(1);
  };

  const handleClearFilters = () => {
    setFilter({
      action: '',
      user: '',
      dateFrom: '',
      dateTo: ''
    });
    fetchLogs(1);
  };

  const handleExportLogs = () => {
    // In a real application, this would generate a CSV or PDF export
    alert('Logs export functionality would be implemented here.');
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'danger';
      case 'LOGIN':
        return 'primary';
      case 'LOGOUT':
        return 'secondary';
      default:
        return 'warning';
    }
  };

  // Sample data for demonstration
  const sampleLogs = [
    {
      id: 1,
      timestamp: '2025-05-15T08:30:00',
      user: 'admin@example.com',
      action: 'LOGIN',
      details: 'Admin logged in',
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      timestamp: '2025-05-15T09:15:20',
      user: 'admin@example.com',
      action: 'CREATE',
      details: 'Created company account: Pizza Palace',
      ipAddress: '192.168.1.100'
    },
    {
      id: 3,
      timestamp: '2025-05-15T10:22:30',
      user: 'admin@example.com',
      action: 'UPDATE',
      details: 'Updated system settings',
      ipAddress: '192.168.1.100'
    },
    {
      id: 4,
      timestamp: '2025-05-15T11:05:15',
      user: 'admin@example.com',
      action: 'DELETE',
      details: 'Deactivated user: user123@example.com',
      ipAddress: '192.168.1.100'
    },
    {
      id: 5,
      timestamp: '2025-05-15T12:30:45',
      user: 'admin@example.com',
      action: 'LOGOUT',
      details: 'Admin logged out',
      ipAddress: '192.168.1.100'
    }
  ];

  const displayLogs = logs.length > 0 ? logs : sampleLogs;

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FontAwesomeIcon icon={faHistory} className="me-2" />
          Activity Logs
        </h2>
        <Button variant="outline-primary" onClick={handleExportLogs}>
          <FontAwesomeIcon icon={faDownload} className="me-2" />
          Export Logs
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Filter Logs</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleFilterSubmit}>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Action Type</Form.Label>
                  <Form.Select
                    name="action"
                    value={filter.action}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Actions</option>
                    <option value="CREATE">Create</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                    <option value="LOGIN">Login</option>
                    <option value="LOGOUT">Logout</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>User</Form.Label>
                  <Form.Control
                    type="text"
                    name="user"
                    value={filter.user}
                    onChange={handleFilterChange}
                    placeholder="User email or ID"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date From</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateFrom"
                    value={filter.dateFrom}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date To</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateTo"
                    value={filter.dateTo}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleClearFilters}>
                <FontAwesomeIcon icon={faRedoAlt} className="me-2" />
                Clear Filters
              </Button>
              <Button variant="primary" type="submit">
                <FontAwesomeIcon icon={faFilter} className="me-2" />
                Apply Filters
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {displayLogs.map(log => (
                    <tr key={log.id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.user}</td>
                      <td>
                        <Badge bg={getActionBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td>{log.details}</td>
                      <td>{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show 5 pages around current page
                    let pageToShow;
                    if (totalPages <= 5) {
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i;
                    } else {
                      pageToShow = currentPage - 2 + i;
                    }
                    
                    return (
                      <Pagination.Item
                        key={pageToShow}
                        active={pageToShow === currentPage}
                        onClick={() => handlePageChange(pageToShow)}
                      >
                        {pageToShow}
                      </Pagination.Item>
                    );
                  })}
                  
                  <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                  <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </MainLayout>
  );
};

export default AdminActivityLogs;
