import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Offcanvas } from 'react-bootstrap';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Payments from './pages/Payments';
import Wallet from './pages/Wallet';
import Communication from './pages/Communication';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
                    <Navbar onToggleSidebar={openSidebar} />
                    <div className="d-flex flex-grow-1">
                      <div className="d-none d-lg-block app-sidebar-wrapper">
                        <Sidebar />
                      </div>
                      <Offcanvas
                        show={isSidebarOpen}
                        onHide={closeSidebar}
                        placement="start"
                        className="d-lg-none"
                      >
                        <Offcanvas.Header closeButton>
                          <Offcanvas.Title>Menu</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body className="p-0">
                          <Sidebar onNavigate={closeSidebar} />
                        </Offcanvas.Body>
                      </Offcanvas>
                      <main className="flex-grow-1 main-content">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/students" element={<Students />} />
                          <Route path="/payments" element={<Payments />} />
                          <Route path="/wallet" element={<Wallet />} />
                          <Route path="/communication" element={<Communication />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
