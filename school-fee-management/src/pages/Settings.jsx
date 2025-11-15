import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Table, Badge, Tabs, Tab, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSave, FaUniversity, FaLock, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import { useData } from '../contexts/DataContext';

const Settings = () => {
  const { feeStructure, addFeeType, updateFeeType, deleteFeeType } = useData();
  const [activeTab, setActiveTab] = useState('fees');
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedYear, setSelectedYear] = useState('2024/2025');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  const [feeData, setFeeData] = useState({
    academicYear: '2024/2025',
    term: 'Term 1',
    feeType: '',
    amount: '',
    level: 'All'
  });

  const [schoolInfo, setSchoolInfo] = useState({
    name: 'Excellence High School',
    address: 'P.O. Box 123, Accra, Ghana',
    phone: '+233 24 000 0000',
    email: 'info@excellencehigh.edu.gh',
    motto: 'Knowledge is Power'
  });

  const [accountData, setAccountData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const academicYears = ['2024/2025', '2025/2026', '2026/2027'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];

  const handleShowFeeModal = (fee = null) => {
    if (fee) {
      setEditingFee(fee);
      setFeeData(fee);
    } else {
      setEditingFee(null);
      setFeeData({
        academicYear: selectedYear,
        term: selectedTerm,
        feeType: '',
        amount: '',
        level: 'All'
      });
    }
    setShowFeeModal(true);
  };

  const handleSaveFee = (e) => {
    e.preventDefault();
    
    if (editingFee) {
      updateFeeType(editingFee.id, feeData);
      setSuccessMessage('Fee type updated successfully!');
    } else {
      addFeeType({
        ...feeData,
        amount: parseFloat(feeData.amount)
      });
      setSuccessMessage('Fee type added successfully!');
    }
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setShowFeeModal(false);
  };

  const handleDeleteFee = (id) => {
    if (window.confirm('Are you sure you want to delete this fee type?')) {
      deleteFeeType(id);
      setSuccessMessage('Fee type deleted successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const filteredFees = feeStructure.filter(
    fee => fee.academicYear === selectedYear && fee.term === selectedTerm
  );

  const totalFees = filteredFees.reduce((sum, fee) => sum + fee.amount, 0);

  const handleSaveSchoolInfo = (e) => {
    e.preventDefault();
    setSuccessMessage('School information updated successfully!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (accountData.newPassword !== accountData.confirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }
    setSuccessMessage('Password changed successfully!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setAccountData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <Container fluid className="py-2">
      {/* Header */}
      <Row className="mb-3">
        <Col>
          <h4 className="mb-0 brand-gradient">System Settings</h4>
        </Col>
      </Row>

      {/* Success Alert */}
      {showSuccess && (
        <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
          <FaCheckCircle className="me-2" />
          {successMessage}
        </Alert>
      )}

      {/* Tabs */}
      <Card className="shadow-sm elevated">
        <Card.Body className="p-3">
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
            {/* Fees Structure Tab */}
            <Tab eventKey="fees" title={<span><FaMoneyBillWave className="me-1" /> Fees Structure</span>}>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Label style={{ fontSize: '0.85rem' }}>Academic Year</Form.Label>
                  <Form.Select
                    size="sm"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Label style={{ fontSize: '0.85rem' }}>Term</Form.Label>
                  <Form.Select
                    size="sm"
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                  >
                    {terms.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <Button className="cta-pill" size="sm" onClick={() => handleShowFeeModal()}>
                    <FaPlus className="me-1" /> Add Fee Type
                  </Button>
                </Col>
              </Row>

              {/* Fee Summary Card */}
              <Card className="mb-3 elevated" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                <Card.Body className="p-3">
                  <Row>
                    <Col md={6}>
                      <h6 className="mb-1">Total Fees for {selectedYear} - {selectedTerm}</h6>
                      <h4 className="text-primary mb-0">GHS {totalFees.toLocaleString()}</h4>
                    </Col>
                    <Col md={6} className="text-end">
                      <small className="text-muted">{filteredFees.length} Fee Types</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Fees Table */}
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th style={{ fontSize: '0.85rem' }}>Fee Type</th>
                      <th style={{ fontSize: '0.85rem' }}>Amount (GHS)</th>
                      <th style={{ fontSize: '0.85rem' }}>Level</th>
                      <th style={{ fontSize: '0.85rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFees.length > 0 ? (
                      filteredFees.map((fee) => (
                        <tr key={fee.id}>
                          <td style={{ fontSize: '0.85rem' }} className="fw-semibold">{fee.feeType}</td>
                          <td style={{ fontSize: '0.85rem' }} className="text-success fw-bold">
                            GHS {fee.amount.toLocaleString()}
                          </td>
                          <td>
                            <Badge bg="info" style={{ fontSize: '0.7rem' }}>{fee.level}</Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleShowFeeModal(fee)}
                            >
                              <FaEdit style={{ fontSize: '0.75rem' }} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteFee(fee.id)}
                            >
                              <FaTrash style={{ fontSize: '0.75rem' }} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No fees configured for {selectedYear} - {selectedTerm}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Tab>

            {/* Account Management Tab */}
            <Tab eventKey="account" title={<span><FaLock className="me-1" /> Account Management</span>}>
              <Card>
                <Card.Body className="p-3">
                  <h6 className="mb-3">Change Password</h6>
                  <Form onSubmit={handleChangePassword}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontSize: '0.85rem' }}>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        size="sm"
                        value={accountData.currentPassword}
                        onChange={(e) => setAccountData({ ...accountData, currentPassword: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontSize: '0.85rem' }}>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        size="sm"
                        value={accountData.newPassword}
                        onChange={(e) => setAccountData({ ...accountData, newPassword: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontSize: '0.85rem' }}>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        size="sm"
                        value={accountData.confirmPassword}
                        onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Button variant="primary" size="sm" type="submit">
                      <FaSave className="me-1" /> Change Password
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            {/* School Information Tab */}
            <Tab eventKey="school" title={<span><FaUniversity className="me-1" /> School Information</span>}>
              <Card>
                <Card.Body className="p-3">
                  <Form onSubmit={handleSaveSchoolInfo}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: '0.85rem' }}>School Name</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={schoolInfo.name}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: '0.85rem' }}>Motto</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={schoolInfo.motto}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, motto: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: '0.85rem' }}>Address</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={schoolInfo.address}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: '0.85rem' }}>Phone</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={schoolInfo.phone}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: '0.85rem' }}>Email</Form.Label>
                          <Form.Control
                            type="email"
                            size="sm"
                            value={schoolInfo.email}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button variant="primary" size="sm" type="submit">
                      <FaSave className="me-1" /> Save Changes
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Add/Edit Fee Modal */}
      <Modal show={showFeeModal} onHide={() => setShowFeeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1rem' }}>
            {editingFee ? 'Edit Fee Type' : 'Add New Fee Type'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveFee}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.85rem' }}>Academic Year</Form.Label>
              <Form.Select
                size="sm"
                value={feeData.academicYear}
                onChange={(e) => setFeeData({ ...feeData, academicYear: e.target.value })}
                required
              >
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.85rem' }}>Term</Form.Label>
              <Form.Select
                size="sm"
                value={feeData.term}
                onChange={(e) => setFeeData({ ...feeData, term: e.target.value })}
                required
              >
                {terms.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.85rem' }}>Fee Type <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder="e.g., Tuition Fee, PTA Dues, Examination Fee"
                value={feeData.feeType}
                onChange={(e) => setFeeData({ ...feeData, feeType: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.85rem' }}>Amount (GHS) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                size="sm"
                step="0.01"
                placeholder="0.00"
                value={feeData.amount}
                onChange={(e) => setFeeData({ ...feeData, amount: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.85rem' }}>Level</Form.Label>
              <Form.Select
                size="sm"
                value={feeData.level}
                onChange={(e) => setFeeData({ ...feeData, level: e.target.value })}
              >
                <option value="All">All Levels</option>
                <option value="Kindergarten">Kindergarten</option>
                <option value="Primary">Primary</option>
                <option value="JHS">JHS</option>
                <option value="SHS">SHS</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowFeeModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                {editingFee ? 'Update' : 'Add'} Fee
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Settings;
