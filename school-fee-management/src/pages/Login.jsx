import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaLock, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="py-5" style={{ minHeight: '100vh' }}>
      {/* Animated background elements */}
      {/* Decorative background elements removed for a cleaner elite look */}
      
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="elevated" style={{ borderRadius: '20px' }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="brand-badge mx-auto mb-3"><FaLock size={28} /></div>
                  <h2 className="fw-bold mb-2 brand-gradient">Welcome Back</h2>
                  <p className="text-muted">School Fee Management System</p>
                </div>

                {error && <Alert variant="danger" style={{ borderRadius: '12px' }}>{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Username</Form.Label>
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
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '0 12px 12px 0',
                          padding: '0.75rem 1rem'
                        }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Password</Form.Label>
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
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '0 12px 12px 0',
                          padding: '0.75rem 1rem'
                        }}
                      />
                    </div>
                  </Form.Group>

                  <Button type="submit" className="cta-pill w-100 py-3 mb-3" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Link to="/forgot-password" className="brand-gradient" style={{ textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                      Forgot Password?
                    </Link>
                    <Link 
                      to="/signup" className="brand-gradient" style={{ textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                      Create Account
                    </Link>
                  </div>
                </Form>

                <div className="text-center">
                  <small className="text-muted" style={{ 
                    padding: '0.5rem 1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    display: 'inline-block'
                  }}>
                    <i className="bi bi-info-circle me-2"></i>
                    Connected to Backend API
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

export default Login;
