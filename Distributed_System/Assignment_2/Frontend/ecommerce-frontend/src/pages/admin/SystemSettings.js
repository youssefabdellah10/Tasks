import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, Accordion } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSave, faServer, faEnvelope, faLock, faTag, faGlobe } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../../layouts/MainLayout';
import AdminService from '../../services/admin.service';

const SystemSettings = () => {
  // We'll use a simpler approach for settings without creating a new API endpoint
  // In a real application, you would have a proper API endpoint for this
  const [settings, setSettings] = useState({
    general: {
      siteName: 'E-Commerce Food Platform',
      siteDescription: 'Your one-stop shop for delicious food',
      supportEmail: 'support@foodplatform.example',
      allowPublicRegistration: true
    },
    email: {
      smtpServer: 'smtp.example.com',
      smtpPort: '587',
      smtpUsername: 'notifications@foodplatform.example',
      smtpPassword: '********',
      fromEmail: 'noreply@foodplatform.example',
      fromName: 'Food Platform'
    },
    security: {
      passwordMinLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      sessionTimeout: 30
    },
    payment: {
      currencyCode: 'USD',
      taxRate: 8.5,
      paymentGateways: {
        stripe: true,
        paypal: true,
        creditCard: true
      }
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // For demo purposes, we'll simulate loading settings
  useEffect(() => {
    // In a real app, you would fetch these from the backend
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const handleChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  const handleNestedChange = (section, parent, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [parent]: {
          ...settings[section][parent],
          [field]: value
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // This would be an API call in a real application
      // await AdminService.updateSystemSettings(settings);
      
      // For demo, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('System settings updated successfully');
      setLoading(false);
    } catch (err) {
      setError('Failed to update system settings. Please try again.');
      setLoading(false);
    }
  };

  if (loading && !settings) {
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
        <h2>
          <FontAwesomeIcon icon={faCog} className="me-2" />
          System Settings
        </h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Accordion defaultActiveKey="0" className="mb-4">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <FontAwesomeIcon icon={faGlobe} className="me-2" />
              General Settings
            </Accordion.Header>
            <Accordion.Body>
              <Card className="border-0">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Site Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={settings.general.siteName}
                          onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Support Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={settings.general.supportEmail}
                          onChange={(e) => handleChange('general', 'supportEmail', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Site Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={settings.general.siteDescription}
                      onChange={(e) => handleChange('general', 'siteDescription', e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="allow-registration"
                      label="Allow Public Registration"
                      checked={settings.general.allowPublicRegistration}
                      onChange={(e) => handleChange('general', 'allowPublicRegistration', e.target.checked)}
                    />
                    <Form.Text className="text-muted">
                      When disabled, only administrators can create new accounts.
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Accordion.Body>
          </Accordion.Item>
          
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              <FontAwesomeIcon icon={faEnvelope} className="me-2" />
              Email Settings
            </Accordion.Header>
            <Accordion.Body>
              <Card className="border-0">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>SMTP Server</Form.Label>
                        <Form.Control
                          type="text"
                          value={settings.email.smtpServer}
                          onChange={(e) => handleChange('email', 'smtpServer', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>SMTP Port</Form.Label>
                        <Form.Control
                          type="text"
                          value={settings.email.smtpPort}
                          onChange={(e) => handleChange('email', 'smtpPort', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>SMTP Username</Form.Label>
                        <Form.Control
                          type="text"
                          value={settings.email.smtpUsername}
                          onChange={(e) => handleChange('email', 'smtpUsername', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>SMTP Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={settings.email.smtpPassword}
                          onChange={(e) => handleChange('email', 'smtpPassword', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>From Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={settings.email.fromEmail}
                          onChange={(e) => handleChange('email', 'fromEmail', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>From Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={settings.email.fromName}
                          onChange={(e) => handleChange('email', 'fromName', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Accordion.Body>
          </Accordion.Item>
          
          <Accordion.Item eventKey="2">
            <Accordion.Header>
              <FontAwesomeIcon icon={faLock} className="me-2" />
              Security Settings
            </Accordion.Header>
            <Accordion.Body>
              <Card className="border-0">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Minimum Password Length</Form.Label>
                        <Form.Control
                          type="number"
                          min="6"
                          max="32"
                          value={settings.security.passwordMinLength}
                          onChange={(e) => handleChange('security', 'passwordMinLength', parseInt(e.target.value, 10))}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Session Timeout (minutes)</Form.Label>
                        <Form.Control
                          type="number"
                          min="5"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value, 10))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Password Requirements</Form.Label>
                        <div className="mt-2">
                          <Form.Check
                            type="switch"
                            id="require-uppercase"
                            label="Require Uppercase Letters"
                            checked={settings.security.requireUppercase}
                            onChange={(e) => handleChange('security', 'requireUppercase', e.target.checked)}
                            className="mb-2"
                          />
                          <Form.Check
                            type="switch"
                            id="require-numbers"
                            label="Require Numbers"
                            checked={settings.security.requireNumbers}
                            onChange={(e) => handleChange('security', 'requireNumbers', e.target.checked)}
                            className="mb-2"
                          />
                          <Form.Check
                            type="switch"
                            id="require-special"
                            label="Require Special Characters"
                            checked={settings.security.requireSpecialChars}
                            onChange={(e) => handleChange('security', 'requireSpecialChars', e.target.checked)}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="3">
            <Accordion.Header>
              <FontAwesomeIcon icon={faTag} className="me-2" />
              Payment Settings
            </Accordion.Header>
            <Accordion.Body>
              <Card className="border-0">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Currency Code</Form.Label>
                        <Form.Select
                          value={settings.payment.currencyCode}
                          onChange={(e) => handleChange('payment', 'currencyCode', e.target.value)}
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tax Rate (%)</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={settings.payment.taxRate}
                          onChange={(e) => handleChange('payment', 'taxRate', parseFloat(e.target.value))}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Gateways</Form.Label>
                    <div className="mt-2">
                      <Form.Check
                        type="switch"
                        id="gateway-stripe"
                        label="Enable Stripe"
                        checked={settings.payment.paymentGateways.stripe}
                        onChange={(e) => handleNestedChange('payment', 'paymentGateways', 'stripe', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="switch"
                        id="gateway-paypal"
                        label="Enable PayPal"
                        checked={settings.payment.paymentGateways.paypal}
                        onChange={(e) => handleNestedChange('payment', 'paymentGateways', 'paypal', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="switch"
                        id="gateway-credit-card"
                        label="Enable Direct Credit Card"
                        checked={settings.payment.paymentGateways.creditCard}
                        onChange={(e) => handleNestedChange('payment', 'paymentGateways', 'creditCard', e.target.checked)}
                      />
                    </div>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-4">
          <Button variant="primary" type="submit" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Saving...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </Form>
    </MainLayout>
  );
};

export default SystemSettings;
