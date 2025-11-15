import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import api from '../utils/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Reset password
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.auth.forgotPassword(email);
      
      setSuccess('Reset code sent! Check your email (or see console in development mode).');
      console.log('Reset Code:', response.reset_code); // For development only
      setStep(2);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetCode || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await api.auth.resetPassword(email, resetCode, newPassword);
      
      setSuccess('Password reset successfully! You can now login with your new password.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to reset password. Please check your reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 0'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'fixed',
        width: '400px',
        height: '400px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        top: '-100px',
        right: '-100px',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        width: '300px',
        height: '300px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        bottom: '-50px',
        left: '-50px',
        animation: 'float 8s ease-in-out infinite reverse',
        zIndex: 0
      }} />
      
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card style={{
              border: 'none',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.95)'
            }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: '0 10px 30px rgba(79, 70, 229, 0.3)'
                  }}>
                    <FaKey size={40} color="white" />
                  </div>
                  <h2 className="fw-bold mb-2" style={{ 
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>Reset Password</h2>
                  <p className="text-muted">
                    {step === 1 
                      ? 'Enter your email to receive a reset code' 
                      : 'Enter the reset code and your new password'}
                  </p>
                </div>

                {error && <Alert variant="danger" style={{ borderRadius: '12px' }}>{error}</Alert>}
                {success && <Alert variant="success" style={{ borderRadius: '12px' }}>{success}</Alert>}

                {step === 1 ? (
                  <Form onSubmit={handleRequestReset}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Email Address</Form.Label>
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
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '0 12px 12px 0',
                            padding: '0.75rem 1rem'
                          }}
                        />
                      </div>
                    </Form.Group>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 py-3 mb-3"
                      disabled={isLoading}
                      style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
                        transition: 'all 0.3s'
                      }}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Code'}
                    </Button>
                  </Form>
                ) : (
                  <Form onSubmit={handleResetPassword}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Reset Code</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text" style={{ 
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px 0 0 12px'
                        }}>
                          <FaKey color="#64748b" />
                        </span>
                        <Form.Control
                          type="text"
                          placeholder="Enter reset code"
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '0 12px 12px 0',
                            padding: '0.75rem 1rem'
                          }}
                        />
                      </div>
                      <Form.Text className="text-muted">
                        Check your email for the reset code
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">New Password</Form.Label>
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
                          placeholder="Min. 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '0 12px 12px 0',
                            padding: '0.75rem 1rem'
                          }}
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Confirm New Password</Form.Label>
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
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '0 12px 12px 0',
                            padding: '0.75rem 1rem'
                          }}
                        />
                      </div>
                    </Form.Group>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 py-3 mb-3"
                      disabled={isLoading}
                      style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
                        transition: 'all 0.3s'
                      }}
                    >
                      {isLoading ? 'Resetting...' : 'Reset Password'}
                    </Button>

                    <div className="text-center">
                      <Button 
                        variant="link" 
                        onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                        style={{ 
                          color: '#4f46e5',
                          textDecoration: 'none',
                          fontWeight: '600'
                        }}
                      >
                        ← Back to email entry
                      </Button>
                    </div>
                  </Form>
                )}

                <div className="text-center mt-3">
                  <p className="text-muted mb-0">
                    Remember your password?{' '}
                    <Link to="/login" style={{ 
                      color: '#4f46e5',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}>
                      Sign In
                    </Link>
                  </p>
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

export default ForgotPassword;
