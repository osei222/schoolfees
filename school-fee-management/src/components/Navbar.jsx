import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { FaBell } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ onToggleSidebar = () => {} }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BSNavbar expand="lg" className="app-navbar sticky-top">
      <Container fluid>
        <div className="d-flex align-items-center">
          <button
            type="button"
            className="btn btn-link text-decoration-none d-lg-none me-2 p-0"
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
          >
            <i className="bi bi-list" style={{ fontSize: '1.5rem', color: '#0f172a' }}></i>
          </button>
          <BSNavbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
            <div className="brand-badge me-2">
              <i className="bi bi-cash-coin"></i>
            </div>
            <span className="brand-gradient">School Fee Manager</span>
          </BSNavbar.Brand>
        </div>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link className="position-relative me-3 p-2 rounded-circle" style={{ transition: 'all 0.3s' }}>
              <FaBell size={20} style={{ color: 'var(--elite-muted)' }} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                fontSize: '0.6rem',
                padding: '0.25rem 0.5rem'
              }}>
                3
              </span>
            </Nav.Link>
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" className="text-decoration-none d-flex align-items-center user-toggle">
                <div className="brand-badge d-flex align-items-center justify-content-center me-2" style={{ width: '36px', height: '36px', fontSize: '1.1rem' }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="text-start d-none d-md-block">
                  <div className="fw-semibold small" style={{ color: '#0f172a' }}>{user?.name || 'Admin User'}</div>
                  <div className="muted" style={{ fontSize: '0.75rem' }}>{user?.role || 'Administrator'}</div>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ 
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                minWidth: '200px'
              }}>
                <Dropdown.Item className="rounded" style={{ padding: '0.75rem 1rem' }}>
                  <i className="bi bi-person me-2"></i>Profile
                </Dropdown.Item>
                <Dropdown.Item className="rounded" style={{ padding: '0.75rem 1rem' }}>
                  <i className="bi bi-gear me-2"></i>Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="rounded text-danger" style={{ padding: '0.75rem 1rem' }}>
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
