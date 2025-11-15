import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Table, Badge, Alert } from 'react-bootstrap';
import { FaPlus, FaSearch, FaReceipt, FaPrint, FaUser, FaPhone, FaEnvelope, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useData } from '../contexts/DataContext';

const Payments = () => {
  const { students, payments, addPayment, feeStructure, studentFeeRecords, useSMS, smsBalance } = useData();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFeeType, setSelectedFeeType] = useState(null);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    method: 'Cash',
    type: '',
    term: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Filter students based on search
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toString().includes(searchQuery)
  );

  // Get student's payment history
  const studentPayments = selectedStudent 
    ? payments.filter(p => p.studentId === selectedStudent.id)
    : [];

  // Get available fee types for selected student
  const availableFeeTypes = selectedStudent && newPayment.term
    ? feeStructure.filter(
        fee => fee.academicYear === selectedStudent.academicYear && 
               fee.term === newPayment.term
      )
    : [];

  // Calculate fee details when fee type and term selected
  useEffect(() => {
    if (selectedStudent && newPayment.type && newPayment.term) {
      const fee = feeStructure.find(
        f => f.feeType === newPayment.type && 
             f.term === newPayment.term && 
             f.academicYear === selectedStudent.academicYear
      );
      
      if (fee) {
        // Find existing payments for this fee type and term
        const paidForThisFee = payments
          .filter(p => 
            p.studentId === selectedStudent.id && 
            p.type === newPayment.type && 
            p.term === newPayment.term
          )
          .reduce((sum, p) => sum + p.amount, 0);
        
        setSelectedFeeType({
          ...fee,
          paidAmount: paidForThisFee,
          balance: fee.amount - paidForThisFee
        });
      }
    } else {
      setSelectedFeeType(null);
    }
  }, [selectedStudent, newPayment.type, newPayment.term, feeStructure, payments]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchQuery('');
    setNewPayment({
      ...newPayment,
      term: student.term || 'Term 1',
      type: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      alert('Please select a student first');
      return;
    }

    if (!selectedFeeType) {
      alert('Please select fee type and term');
      return;
    }

    const amount = parseFloat(newPayment.amount);
    
    if (amount > selectedFeeType.balance) {
      alert(`Amount cannot exceed balance of GHS ${selectedFeeType.balance.toFixed(2)}`);
      return;
    }

    const paymentData = {
      ...newPayment,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentClass: selectedStudent.class,
      amount: amount,
      reference: `${newPayment.method.substring(0, 2).toUpperCase()}${Date.now()}`,
      feeTypeId: selectedFeeType.id
    };

    addPayment(paymentData);
    
    // Send SMS receipt if balance available
    if (smsBalance > 0) {
      const smsMessage = `Payment Receipt: ${selectedStudent.name} paid GHS ${amount} for ${newPayment.type} - ${newPayment.term}. Balance: GHS ${(selectedFeeType.balance - amount).toFixed(2)}. Ref: ${paymentData.reference}`;
      useSMS(1, `SMS receipt sent to ${selectedStudent.parentName}`);
    }
    
    // Reset form and show success
    setNewPayment({
      amount: '',
      method: 'Cash',
      type: '',
      term: selectedStudent.term || 'Term 1',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedFeeType(null);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <Container fluid className="py-2">
      {/* Header */}
      <Row className="mb-3">
        <Col>
          <h4 className="mb-0">Fee Payment Panel</h4>
        </Col>
      </Row>

      {/* Success Alert */}
      {showSuccess && (
        <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
          <FaCheckCircle className="me-2" />
          Payment Successful — SMS Receipt Sent to Guardian
        </Alert>
      )}

      {/* Student Search Section */}
      <Card className="shadow-sm elevated mb-3">
        <Card.Body className="p-3">
          <h6 className="mb-2">🔍 Student Search</h6>
          <Form.Group>
            <div className="input-group input-group-sm">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <Form.Control
                type="text"
                placeholder="Search by Student ID or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </Form.Group>
          
          {/* Search Results Dropdown */}
          {searchQuery && filteredStudents.length > 0 && (
            <div className="mt-2 border rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  className="p-2 border-bottom hover-bg-light"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelectStudent(student)}
                >
                  <strong>{student.name}</strong> - {student.class} (ID: {student.id})
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      <Row className="g-3">
        {/* Left Column - Student Info & Payment Form */}
        <Col lg={7}>
          {/* Student Information Card */}
          {selectedStudent ? (
            <Card className="shadow-sm mb-3">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="mb-0">Student Information</h6>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setSelectedStudent(null)}
                  >
                    Change Student
                  </Button>
                </div>
                <Row className="mt-2">
                  <Col md={6}>
                    <p className="mb-1"><FaUser className="me-2 text-primary" /><strong>Name:</strong> {selectedStudent.name}</p>
                    <p className="mb-1"><strong>Class:</strong> {selectedStudent.class}</p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1"><FaUser className="me-2 text-secondary" /><strong>Guardian:</strong> {selectedStudent.parentName}</p>
                    <p className="mb-1"><FaPhone className="me-2 text-success" />{selectedStudent.parentPhone}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ) : (
            <Alert variant="info">
              <FaExclamationTriangle className="me-2" />
              Please search and select a student to continue with payment
            </Alert>
          )}

          {/* Fee Summary Card - Readonly */}
          {selectedStudent && (
            <Card className="shadow-sm mb-3" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
              <Card.Body className="p-3">
                <h6 className="mb-3">Fee Summary (Academic Year 2024/2025)</h6>
                <Row>
                  <Col xs={6}>
                    <div className="mb-2">
                      <small className="text-muted">Total Fees</small>
                      <h5 className="mb-0">GHS {selectedStudent.totalFees.toLocaleString()}</h5>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="mb-2">
                      <small className="text-muted">Paid So Far</small>
                      <h5 className="mb-0 text-success">GHS {selectedStudent.paidAmount.toLocaleString()}</h5>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="mt-2 p-2 rounded" style={{ background: selectedStudent.balance > 0 ? '#fee2e2' : '#dcfce7' }}>
                      <small className="text-muted">Balance Remaining</small>
                      <h4 className={`mb-0 fw-bold ${selectedStudent.balance > 0 ? 'text-danger' : 'text-success'}`}>
                        GHS {selectedStudent.balance.toLocaleString()}
                      </h4>
                      {selectedStudent.balance === 0 && (
                        <Badge bg="success" className="mt-1">
                          <FaCheckCircle className="me-1" /> FULLY PAID
                        </Badge>
                      )}
                      {selectedStudent.balance > 0 && (
                        <Badge bg="danger" className="mt-1">
                          <FaExclamationTriangle className="me-1" /> OUTSTANDING
                        </Badge>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Payment Entry Form */}
          {selectedStudent && (
            <Card className="shadow-sm">
              <Card.Body className="p-3">
                <h6 className="mb-3">Make Payment</h6>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: '0.85rem' }}>Academic Term</Form.Label>
                        <Form.Select
                          size="sm"
                          value={newPayment.term}
                          onChange={(e) => setNewPayment({...newPayment, term: e.target.value, type: ''})}
                          required
                        >
                          <option value="">Select Term</option>
                          <option value="Term 1">Term 1</option>
                          <option value="Term 2">Term 2</option>
                          <option value="Term 3">Term 3</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: '0.85rem' }}>Fee Type</Form.Label>
                        <Form.Select
                          size="sm"
                          value={newPayment.type}
                          onChange={(e) => setNewPayment({...newPayment, type: e.target.value})}
                          required
                          disabled={!newPayment.term}
                        >
                          <option value="">Select Fee Type</option>
                          {availableFeeTypes.map(fee => (
                            <option key={fee.id} value={fee.feeType}>{fee.feeType}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Fee Details Display */}
                  {selectedFeeType && (
                    <Card className="mb-2" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
                      <Card.Body className="p-2">
                        <Row>
                          <Col xs={4}>
                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>Total Fee</small>
                            <div className="fw-bold" style={{ fontSize: '0.85rem' }}>GHS {selectedFeeType.amount.toLocaleString()}</div>
                          </Col>
                          <Col xs={4}>
                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>Paid</small>
                            <div className="fw-bold text-success" style={{ fontSize: '0.85rem' }}>GHS {selectedFeeType.paidAmount.toLocaleString()}</div>
                          </Col>
                          <Col xs={4}>
                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>Balance</small>
                            <div className="fw-bold text-danger" style={{ fontSize: '0.85rem' }}>GHS {selectedFeeType.balance.toLocaleString()}</div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  )}

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: '0.85rem' }}>Amount Paying Now <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="number"
                          size="sm"
                          placeholder="0.00"
                          value={newPayment.amount}
                          onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: '0.85rem' }}>Payment Mode</Form.Label>
                        <Form.Select
                          size="sm"
                          value={newPayment.method}
                          onChange={(e) => setNewPayment({...newPayment, method: e.target.value})}
                        >
                          <option>Cash</option>
                          <option>Mobile Money</option>
                          <option>Bank Transfer</option>
                          <option>Card</option>
                          <option>Cheque</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: '0.85rem' }}>Payment Date</Form.Label>
                        <Form.Control
                          type="date"
                          size="sm"
                          value={newPayment.date}
                          onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button type="submit" className="cta-pill w-100" size="sm">
                    <FaCheckCircle className="me-2" /> Submit Payment
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Right Column - Transaction History */}
        <Col lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-3">
              <h6 className="mb-2">Transaction History</h6>
              {selectedStudent ? (
                studentPayments.length > 0 ? (
                  <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <Table hover size="sm">
                      <thead className="table-light" style={{ position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ fontSize: '0.75rem' }}>Date</th>
                          <th style={{ fontSize: '0.75rem' }}>Fee Type</th>
                          <th style={{ fontSize: '0.75rem' }}>Amount</th>
                          <th style={{ fontSize: '0.75rem' }}>Mode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td style={{ fontSize: '0.75rem' }}>{new Date(payment.date).toLocaleDateString()}</td>
                            <td style={{ fontSize: '0.75rem' }}>{payment.type}</td>
                            <td style={{ fontSize: '0.75rem' }} className="text-success fw-bold">GHS {payment.amount.toLocaleString()}</td>
                            <td>
                              <Badge bg="secondary" style={{ fontSize: '0.65rem' }}>{payment.method}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <div className="mt-2 p-2 bg-light rounded text-center">
                      <strong>Total Paid:</strong> GHS {studentPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <Alert variant="warning" className="mb-0">
                    No payment history found for this student
                  </Alert>
                )
              ) : (
                <Alert variant="info" className="mb-0">
                  Select a student to view transaction history
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Payments;

