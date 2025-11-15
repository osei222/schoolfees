import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { FaHome, FaUsers, FaMoneyBillWave, FaWallet, FaComments, FaChartBar, FaCog } from 'react-icons/fa';

const Sidebar = ({ onNavigate = () => {} }) => {
  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/students', icon: FaUsers, label: 'Students' },
    { path: '/payments', icon: FaMoneyBillWave, label: 'Payments' },
    { path: '/wallet', icon: FaWallet, label: 'Wallet' },
    { path: '/communication', icon: FaComments, label: 'Communication' },
    { path: '/reports', icon: FaChartBar, label: 'Reports' },
    { path: '/settings', icon: FaCog, label: 'Settings' }
  ];

  return (
    <div className="app-sidebar" style={{ minHeight: 'calc(100vh - 56px)', position: 'sticky', top: '56px' }}>
      <Nav className="flex-column p-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center py-3 px-3 rounded-3 mb-2 ${isActive ? 'active' : ''}`
            }
            onClick={onNavigate}
            style={{ textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden' }}
          >
            <item.icon className="me-3" size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;
