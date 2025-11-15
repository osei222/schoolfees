import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Button, Nav, Card } from 'react-bootstrap'

const Home = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ padding: '1rem 0' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="brand-badge me-3">
                <i className="bi bi-building" style={{ fontSize: 20 }}></i>
              </div>
              <div>
                <div className="brand-gradient" style={{ fontSize: '1.125rem' }}>School Fee Manager</div>
                <small className="muted">Payments • SMS • Reports</small>
              </div>
            </div>

            <Nav className="align-items-center" variant="pills">
              <Nav.Item>
                <Nav.Link as={Link} to="/login" eventKey="login" style={{ color: '#0f172a' }}>Login</Nav.Link>
              </Nav.Item>
              <Nav.Item className="ms-2">
                <Nav.Link as={Link} to="/signup" eventKey="signup" className="cta-pill">Sign Up</Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        </Container>
      </header>

      <Container className="py-5">
        <Row className="g-4 align-items-center">
          <Col md={7} lg={7}>
            <Card className="elevated" style={{ borderRadius: 16 }}>
              <Card.Body>
                <h1 className="fw-bold" style={{ fontSize: '2rem' }}>Welcome to School Fee Manager</h1>
                <p className="muted" style={{ fontSize: '1.05rem' }}>A professional SaaS platform for managing school fees, receipts and communications. Get started in three simple steps.</p>

                <Row className="mt-4">
                  <Col md={4} className="text-center">
                    <div className="mb-2 brand-badge" style={{ margin: '0 auto' }}><i className="bi bi-person-plus" /></div>
                    <h6 className="fw-semibold">1. Create your school</h6>
                    <p className="muted small">Register your school, set billing details and invite administrators.</p>
                  </Col>

                  <Col md={4} className="text-center">
                    <div className="mb-2 brand-badge" style={{ margin: '0 auto' }}><i className="bi bi-people" /></div>
                    <h6 className="fw-semibold">2. Add students & fees</h6>
                    <p className="muted small">Import students or add them individually; configure fee structures per class/term.</p>
                  </Col>

                  <Col md={4} className="text-center">
                    <div className="mb-2 brand-badge" style={{ margin: '0 auto' }}><i className="bi bi-credit-card-2-front-fill" /></div>
                    <h6 className="fw-semibold">3. Collect payments & send receipts</h6>
                    <p className="muted small">Record payments, issue receipts via SMS and track wallet credits.</p>
                  </Col>
                </Row>

                <div className="mt-4">
                  <Link to="/signup"><Button className="cta-pill me-3">Create School Account</Button></Link>
                  <Link to="/login"><Button variant="outline-primary">Sign In</Button></Link>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={5} lg={5}>
            <div style={{ position: 'sticky', top: 96 }}>
              <Card style={{ borderRadius: 12 }}>
                <Card.Body>
                  <h5 className="fw-bold">Getting started — checklist</h5>
                  <ol className="mt-3" style={{ color: '#475569' }}>
                    <li>Create your school account</li>
                    <li>Set up your term and fee structure</li>
                    <li>Import students or add them one-by-one</li>
                    <li>Top up SMS wallet and test sending receipts</li>
                    <li>Run a sample payment and verify receipts</li>
                  </ol>

                  <hr />
                  <p className="muted small">Need help? Visit the user guide or contact support for personalized onboarding.</p>
                  <div className="d-flex mt-2">
                    <a className="me-2" href="#" style={{ color: 'var(--elite-primary-1)', fontWeight: 700 }}>User Guide</a>
                    <a href="#" style={{ color: 'var(--elite-primary-1)', fontWeight: 700 }}>Contact Support</a>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Home
