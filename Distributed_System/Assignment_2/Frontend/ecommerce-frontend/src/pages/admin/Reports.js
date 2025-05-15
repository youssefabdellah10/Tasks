import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert, Tab, Nav, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faFileDownload, faChartLine, faChartPie, faUsers, faStore } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../../layouts/MainLayout';
import AdminService from '../../services/admin.service';

const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [timeRange, setTimeRange] = useState('30days');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportData();
  }, [reportType, timeRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await AdminService.getReports(`${reportType}?timeRange=${timeRange}`);
      setReportData(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load report data. Please try again later.');
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // In a real application, this would generate a CSV or PDF export
    alert('Report export functionality would be implemented here.');
  };

  const renderSalesReport = () => {
    if (!reportData || !reportData.sales) return <Alert variant="info">No sales data available for the selected period.</Alert>;

    return (
      <>
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center shadow-sm h-100">
              <Card.Body>
                <h6 className="text-muted">Total Sales</h6>
                <h3 className="text-primary">${reportData.sales.totalAmount?.toFixed(2)}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm h-100">
              <Card.Body>
                <h6 className="text-muted">Orders</h6>
                <h3 className="text-success">{reportData.sales.totalOrders}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm h-100">
              <Card.Body>
                <h6 className="text-muted">Average Order</h6>
                <h3 className="text-info">${reportData.sales.averageOrderValue?.toFixed(2)}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm h-100">
              <Card.Body>
                <h6 className="text-muted">Best Selling Item</h6>
                <h3 className="text-warning">{reportData.sales.bestSellingItem?.name || 'N/A'}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="shadow-sm mb-4">
          <Card.Header as="h5">Sales by Company</Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Company</th>
                  <th>Orders</th>
                  <th>Sales</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData.sales.byCompany?.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{index + 1}</td>
                    <td>{item.companyName}</td>
                    <td>{item.orders}</td>
                    <td>${item.amount.toFixed(2)}</td>
                    <td>{item.percentage.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </>
    );
  };

  const renderUserReport = () => {
    if (!reportData || !reportData.users) return <Alert variant="info">No user data available for the selected period.</Alert>;

    return (
      <>
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center shadow-sm h-100">
              <Card.Body>
                <h6 className="text-muted">New Users</h6>
                <h3 className="text-primary">{reportData.users.newUsers}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center shadow-sm h-100">
              <Card.Body>
                <h6 className="text-muted">Active Users</h6>
                <h3 className="text-success">{reportData.users.activeUsers}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center shadow-sm h-100">
              <Card.Body>
                <h6 className="text-muted">Conversion Rate</h6>
                <h3 className="text-info">{reportData.users.conversionRate?.toFixed(2)}%</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="shadow-sm mb-4">
          <Card.Header as="h5">User Distribution</Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>User Type</th>
                  <th>Count</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Customers</td>
                  <td>{reportData.users.distribution?.customers}</td>
                  <td>{reportData.users.distribution?.customerPercentage?.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td>Company Representatives</td>
                  <td>{reportData.users.distribution?.companies}</td>
                  <td>{reportData.users.distribution?.companyPercentage?.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td>Sellers</td>
                  <td>{reportData.users.distribution?.sellers}</td>
                  <td>{reportData.users.distribution?.sellerPercentage?.toFixed(2)}%</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </>
    );
  };

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FontAwesomeIcon icon={faChartBar} className="me-2" />
          Admin Reports
        </h2>
        <Button variant="outline-primary" onClick={handleExportReport}>
          <FontAwesomeIcon icon={faFileDownload} className="me-2" />
          Export Report
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Report Type</Form.Label>
                <Form.Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="sales">Sales Report</option>
                  <option value="users">User Analytics</option>
                  <option value="dishes">Dish Analytics</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Time Range</Form.Label>
                <Form.Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="year">This Year</option>
                  <option value="alltime">All Time</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Tab.Container id="report-tabs" defaultActiveKey={reportType}>
          <Card className="shadow-sm">
            <Card.Header>
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link 
                    eventKey="sales" 
                    onClick={() => setReportType('sales')}
                  >
                    <FontAwesomeIcon icon={faChartLine} className="me-2" />
                    Sales Analytics
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="users" 
                    onClick={() => setReportType('users')}
                  >
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    User Analytics
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="dishes" 
                    onClick={() => setReportType('dishes')}
                  >
                    <FontAwesomeIcon icon={faStore} className="me-2" />
                    Dish Analytics
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                <Tab.Pane eventKey="sales">
                  {renderSalesReport()}
                </Tab.Pane>
                <Tab.Pane eventKey="users">
                  {renderUserReport()}
                </Tab.Pane>
                <Tab.Pane eventKey="dishes">
                  <Alert variant="info">Dish analytics reporting feature is under development.</Alert>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
      )}
    </MainLayout>
  );
};

export default Reports;
