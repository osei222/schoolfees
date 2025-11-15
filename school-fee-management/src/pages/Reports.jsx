import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge } from 'react-bootstrap';
import { FaFileDownload, FaPrint, FaChartBar, FaCalendar, FaMoneyBillWave } from 'react-icons/fa';
import { useData } from '../contexts/DataContext';

const Reports = () => {
  const { students, payments, walletBalance } = useData();
  const [reportType, setReportType] = useState('summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterClass, setFilterClass] = useState('All');

  // Get unique classes
  const classes = ['All', ...new Set(students.map(s => s.class))];

  // Filter data based on date range and class
  const filterData = () => {
    let filtered = payments;

    if (startDate) {
      filtered = filtered.filter(p => new Date(p.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(p => new Date(p.date) <= new Date(endDate));
    }

    return filtered;
  };

  const filteredPayments = filterData();
  const filteredStudents = filterClass === 'All' 
    ? students 
    : students.filter(s => s.class === filterClass);

  // Calculate statistics
  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpected = filteredStudents.reduce((sum, s) => sum + s.totalFees, 0);
  const totalOutstanding = filteredStudents.reduce((sum, s) => sum + s.balance, 0);
  const paidCount = filteredStudents.filter(s => s.status === 'Paid').length;
  const partialCount = filteredStudents.filter(s => s.status === 'Partial').length;
  const pendingCount = filteredStudents.filter(s => s.status === 'Pending').length;

  // Payment method breakdown
  const paymentByMethod = {};
  filteredPayments.forEach(p => {
    paymentByMethod[p.method] = (paymentByMethod[p.method] || 0) + p.amount;
  });

  // Payment type breakdown
  const paymentByType = {};
  filteredPayments.forEach(p => {
    paymentByType[p.type] = (paymentByType[p.type] || 0) + p.amount;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Create CSV content
    let csv = 'School Fee Management System - Report\n\n';
    csv += `Generated: ${new Date().toLocaleString()}\n`;
    csv += `Period: ${startDate || 'All time'} to ${endDate || 'Present'}\n\n`;
    
    csv += 'Summary Statistics\n';
    csv += `Total Students,${filteredStudents.length}\n`;
    csv += `Total Expected,GHS ${totalExpected}\n`;
    csv += `Total Collected,GHS ${totalCollected}\n`;
    csv += `Outstanding Balance,GHS ${totalOutstanding}\n`;
    csv += `Collection Rate,${((totalCollected / totalExpected) * 100).toFixed(2)}%\n\n`;

    csv += 'Student Details\n';
    csv += 'Name,Class,Total Fees,Paid,Balance,Status\n';
    filteredStudents.forEach(s => {
      csv += `${s.name},${s.class},${s.totalFees},${s.paidAmount},${s.balance},${s.status}\n`;
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school-fees-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="brand-gradient">Reports & Analytics</h2>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={handlePrint}>
                <FaPrint className="me-2" /> Print
              </Button>
              <Button variant="success" onClick={handleExport} className="cta-pill">
                <FaFileDownload className="me-2" /> Export CSV
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Report Type</Form.Label>
                <Form.Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="summary">Summary Report</option>
                  <option value="detailed">Detailed Report</option>
                  <option value="payment_methods">Payment Methods</option>
                  <option value="outstanding">Outstanding Fees</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Class Filter</Form.Label>
                <Form.Select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Button variant="primary" className="w-100">
                <FaChartBar className="me-2" /> Generate Report
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Summary Statistics */}
      {(reportType === 'summary' || reportType === 'detailed') && (
        <>
          <Row className="g-4 mb-4">
            <Col md={3}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1">Total Students</p>
                      <h3 className="fw-bold">{filteredStudents.length}</h3>
                    </div>
                    <FaChartBar className="text-primary" size={30} />
                  </div>
                  <div className="mt-2">
                    <small className="text-success">✓ {paidCount} Paid</small><br />
                    <small className="text-warning">⚠ {partialCount} Partial</small><br />
                    <small className="text-danger">✗ {pendingCount} Pending</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1">Total Expected</p>
                      <h3 className="fw-bold text-primary">GHS {totalExpected.toLocaleString()}</h3>
                    </div>
                    <FaMoneyBillWave className="text-primary" size={30} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1">Total Collected</p>
                      <h3 className="fw-bold text-success">GHS {totalCollected.toLocaleString()}</h3>
                    </div>
                    <FaMoneyBillWave className="text-success" size={30} />
                  </div>
                  <small className="text-muted">
                    {((totalCollected / totalExpected) * 100).toFixed(1)}% collection rate
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1">Outstanding</p>
                      <h3 className="fw-bold text-danger">GHS {totalOutstanding.toLocaleString()}</h3>
                    </div>
                    <FaMoneyBillWave className="text-danger" size={30} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Payment Methods Breakdown */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Payment Methods Breakdown</h5>
                </Card.Header>
                <Card.Body>
                  <Table>
                    <thead className="table-light">
                      <tr>
                        <th>Payment Method</th>
                        <th className="text-end">Amount</th>
                        <th className="text-end">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(paymentByMethod).map(([method, amount]) => (
                        <tr key={method}>
                          <td>{method}</td>
                          <td className="text-end fw-bold">GHS {amount.toLocaleString()}</td>
                          <td className="text-end">
                            <Badge bg="primary">{((amount / totalCollected) * 100).toFixed(1)}%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <th>Total</th>
                        <th className="text-end">GHS {totalCollected.toLocaleString()}</th>
                        <th className="text-end">100%</th>
                      </tr>
                    </tfoot>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Payment Types Breakdown</h5>
                </Card.Header>
                <Card.Body>
                  <Table>
                    <thead className="table-light">
                      <tr>
                        <th>Payment Type</th>
                        <th className="text-end">Amount</th>
                        <th className="text-end">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(paymentByType).map(([type, amount]) => (
                        <tr key={type}>
                          <td>{type}</td>
                          <td className="text-end fw-bold">GHS {amount.toLocaleString()}</td>
                          <td className="text-end">
                            <Badge bg="info">{((amount / totalCollected) * 100).toFixed(1)}%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <th>Total</th>
                        <th className="text-end">GHS {totalCollected.toLocaleString()}</th>
                        <th className="text-end">100%</th>
                      </tr>
                    </tfoot>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Detailed Student Report */}
      {reportType === 'detailed' && (
        <Card className="shadow-sm">
          <Card.Header className="bg-white">
            <h5 className="mb-0">Detailed Student Fee Report</h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Parent Info</th>
                    <th className="text-end">Total Fees</th>
                    <th className="text-end">Paid Amount</th>
                    <th className="text-end">Balance</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{student.name}</td>
                      <td>{student.class}</td>
                      <td>
                        <div className="small">
                          <div>{student.parentName}</div>
                          <div className="text-muted">{student.parentPhone}</div>
                        </div>
                      </td>
                      <td className="text-end">GHS {student.totalFees.toLocaleString()}</td>
                      <td className="text-end text-success">GHS {student.paidAmount.toLocaleString()}</td>
                      <td className="text-end text-danger">GHS {student.balance.toLocaleString()}</td>
                      <td className="text-center">
                        <Badge bg={
                          student.status === 'Paid' ? 'success' :
                          student.status === 'Partial' ? 'warning' : 'danger'
                        }>
                          {student.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light fw-bold">
                  <tr>
                    <td colSpan="4" className="text-end">TOTALS:</td>
                    <td className="text-end">GHS {totalExpected.toLocaleString()}</td>
                    <td className="text-end text-success">GHS {totalCollected.toLocaleString()}</td>
                    <td className="text-end text-danger">GHS {totalOutstanding.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Payment Methods Report */}
      {reportType === 'payment_methods' && (
        <Card className="shadow-sm">
          <Card.Header className="bg-white">
            <h5 className="mb-0">Payment Methods Analysis</h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Student Name</th>
                    <th>Payment Method</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td className="font-monospace">{payment.reference}</td>
                      <td>{payment.studentName}</td>
                      <td>
                        <Badge bg="secondary">{payment.method}</Badge>
                      </td>
                      <td className="text-end fw-bold">GHS {payment.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light fw-bold">
                  <tr>
                    <td colSpan="4" className="text-end">TOTAL:</td>
                    <td className="text-end">GHS {totalCollected.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Outstanding Fees Report */}
      {reportType === 'outstanding' && (
        <Card className="shadow-sm">
          <Card.Header className="bg-white">
            <h5 className="mb-0">Outstanding Fees Report</h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Parent Contact</th>
                    <th className="text-end">Total Fees</th>
                    <th className="text-end">Paid</th>
                    <th className="text-end">Outstanding</th>
                    <th className="text-center">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents
                    .filter(s => s.balance > 0)
                    .sort((a, b) => b.balance - a.balance)
                    .map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td className="fw-semibold">{student.name}</td>
                        <td>{student.class}</td>
                        <td>
                          <div className="small">
                            <div>{student.parentName}</div>
                            <div className="text-muted">{student.parentPhone}</div>
                          </div>
                        </td>
                        <td className="text-end">GHS {student.totalFees.toLocaleString()}</td>
                        <td className="text-end text-success">GHS {student.paidAmount.toLocaleString()}</td>
                        <td className="text-end text-danger fw-bold">GHS {student.balance.toLocaleString()}</td>
                        <td className="text-center">
                          <Badge bg={student.paidAmount === 0 ? 'danger' : 'warning'}>
                            {student.paidAmount === 0 ? 'High' : 'Medium'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot className="table-light fw-bold">
                  <tr>
                    <td colSpan="6" className="text-end">TOTAL OUTSTANDING:</td>
                    <td className="text-end text-danger">GHS {totalOutstanding.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Print Footer */}
      <div className="d-none d-print-block mt-5">
        <hr />
        <Row>
          <Col className="text-center">
            <p className="mb-1">School Fee Management System</p>
            <p className="small text-muted mb-0">
              Generated: {new Date().toLocaleString()} | Current Wallet Balance: GHS {walletBalance.toLocaleString()}
            </p>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default Reports;
