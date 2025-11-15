import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { FaUsers, FaMoneyBillWave, FaExclamationTriangle, FaCheckCircle, FaWallet } from 'react-icons/fa';
import StatCard from '../components/StatCard';
import { useData } from '../contexts/DataContext';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const { students, payments, walletBalance, loadStudents, loadPayments, loadWalletData, getStudentStatistics } = useData();
  const [stats, setStats] = useState({ total: 0, paid: 0, partial: 0, unpaid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data when component mounts
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadStudents(),
        loadPayments(),
        loadWalletData(),
      ]);
      
      // Load statistics
      const statistics = await getStudentStatistics();
      setStats({
        total: statistics.total_students ?? statistics.total ?? 0,
        paid: statistics.fully_paid ?? statistics.paid ?? 0,
        partial: statistics.partially_paid ?? statistics.partial ?? 0,
        unpaid: statistics.unpaid ?? 0,
      });
      setLoading(false);
    };
    
    loadData();
  }, []);

  const totalStudents = stats.total || students.length;
  const paidStudents = stats.paid || students.filter(s => (s.status || s.payment_status) === 'Paid').length;
  const pendingStudents = stats.unpaid || students.filter(s => (s.status || s.payment_status) === 'Unpaid').length;
  const partialStudents = stats.partial || students.filter(s => (s.status || s.payment_status) === 'Partial').length;
  
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpected = students.reduce((sum, s) => sum + (s.total_fees ?? s.totalFees ?? 0), 0);
  const totalOutstanding = students.reduce((sum, s) => sum + (s.balance ?? 0), 0);

  const recentPayments = payments.slice(0, 5);
  const recentStudents = students.slice(0, 5);

  if (loading) {
    return (
      <Container fluid className="py-4 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading dashboard data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-2">
      <h4 className="mb-3 brand-gradient">Dashboard Overview</h4>

  <Row className="g-2 mb-3">
        <Col md={6} lg={3}>
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon={FaUsers}
            bgColor="bg-primary bg-opacity-10"
            textColor="text-primary"
            subtitle={`${paidStudents} fully paid`}
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            title="Total Collected"
            value={`GHS ${totalCollected.toLocaleString()}`}
            icon={FaMoneyBillWave}
            bgColor="bg-success bg-opacity-10"
            textColor="text-success"
            subtitle={`Out of GHS ${totalExpected.toLocaleString()}`}
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            title="Outstanding Balance"
            value={`GHS ${totalOutstanding.toLocaleString()}`}
            icon={FaExclamationTriangle}
            bgColor="bg-warning bg-opacity-10"
            textColor="text-warning"
            subtitle={`${pendingStudents + partialStudents} students`}
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            title="School Wallet"
            value={`GHS ${Number(walletBalance || 0).toLocaleString()}`}
            icon={FaWallet}
            bgColor="bg-info bg-opacity-10"
            textColor="text-info"
            subtitle="Available balance"
          />
        </Col>
      </Row>

      <Row className="g-2 mb-3">
        <Col lg={4}>
          <Card className="shadow-sm elevated h-100">
            <Card.Body className="p-3">
              <h6 className="mb-2">Payment Status</h6>
              <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-success bg-opacity-10 rounded">
                <div className="d-flex align-items-center">
                  <FaCheckCircle className="text-success me-2" size={16} />
                  <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>Fully Paid</span>
                </div>
                <span className="badge bg-success" style={{ fontSize: '0.75rem' }}>{paidStudents}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-warning bg-opacity-10 rounded">
                <div className="d-flex align-items-center">
                  <FaExclamationTriangle className="text-warning me-2" size={16} />
                  <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>Partial Payment</span>
                </div>
                <span className="badge bg-warning" style={{ fontSize: '0.75rem' }}>{partialStudents}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center p-2 bg-danger bg-opacity-10 rounded">
                <div className="d-flex align-items-center">
                  <FaExclamationTriangle className="text-danger me-2" size={16} />
                  <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>Pending Payment</span>
                </div>
                <span className="badge bg-danger" style={{ fontSize: '0.75rem' }}>{pendingStudents}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm elevated h-100">
            <Card.Body className="p-3">
              <h6 className="mb-2">Recent Payments</h6>
              <div className="table-responsive">
                <table className="table table-hover table-sm table-mobile-stack">
                  <thead>
                    <tr>
                      <th style={{ fontSize: '0.8rem' }}>Student Name</th>
                      <th style={{ fontSize: '0.8rem' }}>Class</th>
                      <th style={{ fontSize: '0.8rem' }}>Fee Type</th>
                      <th style={{ fontSize: '0.8rem' }}>Amount Paid</th>
                      <th style={{ fontSize: '0.8rem' }}>Term</th>
                      <th style={{ fontSize: '0.8rem' }}>Payment Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment) => {
                      const student = students.find(s => s.id === (payment.student_id ?? payment.studentId));
                      return (
                        <tr key={payment.id}>
                          <td className="fw-semibold" style={{ fontSize: '0.8rem' }} data-label="Student">
                            {payment.student_name || payment.studentName || student?.name}
                          </td>
                          <td data-label="Class">
                            <span className="badge" style={{ 
                              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                              color: 'white',
                              fontSize: '0.7rem'
                            }}>
                              {payment.student_class || payment.studentClass || student?.student_class || student?.class}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem' }} data-label="Fee Type">
                            {payment.fee_type || payment.type}
                          </td>
                          <td className="fw-bold text-success" style={{ fontSize: '0.8rem' }} data-label="Amount">
                            GHS {payment.amount.toLocaleString()}
                          </td>
                          <td data-label="Term">
                            <span className="badge" style={{ 
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                              color: 'white',
                              fontSize: '0.7rem'
                            }}>
                              {payment.term || 'Term 1'}
                            </span>
                          </td>
                          <td data-label="Method">
                            <span className="badge" style={{ 
                              background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                              color: 'white',
                              fontSize: '0.7rem'
                            }}>
                              {payment.payment_method || payment.method}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="p-3">
              <h6 className="mb-2">Students Overview</h6>
              <div className="table-responsive">
                <table className="table table-hover table-sm table-mobile-stack">
                  <thead>
                    <tr>
                      <th style={{ fontSize: '0.8rem' }}>Student Name</th>
                      <th style={{ fontSize: '0.8rem' }}>Class</th>
                      <th style={{ fontSize: '0.8rem' }}>Total Fees</th>
                      <th style={{ fontSize: '0.8rem' }}>Paid Amount</th>
                      <th style={{ fontSize: '0.8rem' }}>Balance</th>
                      <th style={{ fontSize: '0.8rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="fw-semibold" style={{ fontSize: '0.8rem' }} data-label="Student">
                          {student.name}
                        </td>
                        <td style={{ fontSize: '0.8rem' }} data-label="Class">
                          {student.student_class || student.class}
                        </td>
                        <td style={{ fontSize: '0.8rem' }} data-label="Total Fees">
                          GHS {(student.total_fees ?? student.totalFees ?? 0).toLocaleString()}
                        </td>
                        <td style={{ fontSize: '0.8rem' }} data-label="Paid">
                          GHS {(student.paid_amount ?? student.paidAmount ?? 0).toLocaleString()}
                        </td>
                        <td style={{ fontSize: '0.8rem' }} data-label="Balance">
                          GHS {(student.balance ?? 0).toLocaleString()}
                        </td>
                        <td data-label="Status">
                          <span className={`badge ${
                            student.status === 'Paid' ? 'bg-success' :
                            student.status === 'Partial' ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {student.status || student.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
