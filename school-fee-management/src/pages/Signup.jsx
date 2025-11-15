import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaSchool, FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../utils/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    school_name: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.school_name) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.auth.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        school_name: formData.school_name,
        phone: formData.phone || null,
        address: formData.address || null
      });

      if (response.access_token) {
        // Store token and user info
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      console.error('Signup error:', err);
      console.error('Error type:', typeof err);
      console.error('Error keys:', Object.keys(err || {}));
      
      let errorMessage = 'Registration failed. Please try again.';
      
      try {
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (err?.message && typeof err.message === 'string') {
          errorMessage = err.message;
        } else if (err?.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err?.detail) {
          errorMessage = err.detail;
        } else if (err?.error) {
          errorMessage = err.error;
        } else {
          // Convert object to string for debugging
          errorMessage = `Error: ${JSON.stringify(err)}`;
        }
      } catch (stringifyError) {
        errorMessage = 'An unexpected error occurred during registration.';
        console.error('Error stringifying error:', stringifyError);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-5" style={{ minHeight: '100vh' }}>
      {/* Animated background elements */}
      {/* Decorative background elements kept minimal for performance */}
      
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="elevated" style={{ borderRadius: '20px', marginBottom: '2rem' }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="brand-badge mx-auto mb-3">
                    <FaSchool size={28} />
                  </div>
                  <h2 className="fw-bold mb-2 brand-gradient">Create Account</h2>
                  <p className="text-muted">Start managing your school fees today</p>
                </div>

                {error && <Alert variant="danger" style={{ borderRadius: '12px' }}>{error}</Alert>}
                {success && <Alert variant="success" style={{ borderRadius: '12px' }}>{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Username <span className="text-danger">*</span></Form.Label>
                        <div className="input-group">
                          <span className="input-group-text" style={{ 
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px 0 0 12px'
                          }}>
                            <FaUser color="#64748b" />
                          </span>
                          <Form.Control
                            type="text"
                            name="username"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '0 12px 12px 0',
                              padding: '0.75rem 1rem'
                            }}
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Email <span className="text-danger">*</span></Form.Label>
                        <div className="input-group">
                          <span className="input-group-text" style={{ 
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px 0 0 12px'
                          }}>
                            <FaEnvelope color="#64748b" />
                          </span>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '0 12px 12px 0',
                              padding: '0.75rem 1rem'
                            }}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">School Name <span className="text-danger">*</span></Form.Label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ 
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px 0 0 12px'
                      }}>
                        <FaSchool color="#64748b" />
                      </span>
                      <Form.Control
                        type="text"
                        name="school_name"
                        placeholder="Enter your school name"
                        value={formData.school_name}
                        onChange={handleChange}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '0 12px 12px 0',
                          padding: '0.75rem 1rem'
                        }}
                      />
                    </div>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Phone (Optional)</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text" style={{ 
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px 0 0 12px'
                          }}>
                            <FaPhone color="#64748b" />
                          </span>
                          <Form.Control
                            type="tel"
                            name="phone"
                            placeholder="+233 XX XXX XXXX"
                            value={formData.phone}
                            onChange={handleChange}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '0 12px 12px 0',
                              padding: '0.75rem 1rem'
                            }}
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Address (Optional)</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text" style={{ 
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px 0 0 12px'
                          }}>
                            <FaMapMarkerAlt color="#64748b" />
                          </span>
                          <Form.Control
                            type="text"
                            name="address"
                            placeholder="School address"
                            value={formData.address}
                            onChange={handleChange}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '0 12px 12px 0',
                              padding: '0.75rem 1rem'
                            }}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Password <span className="text-danger">*</span></Form.Label>
                        <div className="input-group">
                          <span className="input-group-text" style={{ 
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px 0 0 12px'
                          }}>
                            <FaLock color="#64748b" />
                          </span>
                          <Form.Control
                            type="password"
                            name="password"
                            placeholder="Min. 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '0 12px 12px 0',
                              padding: '0.75rem 1rem'
                            }}
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Confirm Password <span className="text-danger">*</span></Form.Label>
                        <div className="input-group">
                          <span className="input-group-text" style={{ 
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px 0 0 12px'
                          }}>
                            <FaLock color="#64748b" />
                          </span>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            placeholder="Re-enter password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '0 12px 12px 0',
                              padding: '0.75rem 1rem'
                            }}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button type="submit" className="cta-pill w-100 py-3 mb-3" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  <div className="text-center">
                    <p className="text-muted mb-0">
                      Already have an account?{' '}
                      <Link to="/login" className="brand-gradient" style={{ textDecoration: 'none' }}>
                        Sign In
                      </Link>
                    </p>
                  </div>
                </Form>

                <div className="text-center mt-4">
                  <small className="text-muted" style={{ 
                    padding: '0.5rem 1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    display: 'inline-block'
                  }}>
                    <i className="bi bi-gift me-2"></i>
                    Get 50 free SMS on signup!
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Signup;
