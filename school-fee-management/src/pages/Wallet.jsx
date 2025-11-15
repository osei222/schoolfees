import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Table, Badge, Alert } from 'react-bootstrap';
import { FaWallet, FaPlus, FaSms, FaHistory, FaMoneyBillWave, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useData } from '../contexts/DataContext';

const Wallet = () => {
  const { walletBalance, smsBalance, walletTransactions, topUpWallet, purchaseSMS } = useData();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [filterType, setFilterType] = useState('All');

  const [topUpData, setTopUpData] = useState({
    amount: '',
    method: 'Mobile Money'
  });

  const [smsData, setSmsData] = useState({
    units: ''
  });

  const SMS_COST = 0.10; // GHS 0.10 per SMS

  const handleTopUp = (e) => {
    e.preventDefault();
    const amount = parseFloat(topUpData.amount);
    
    if (amount < 5) {
      alert('Minimum top-up amount is GHS 5.00');
      return;
    }

    topUpWallet(amount, topUpData.method);
    
    setSuccessMessage(`Wallet topped up successfully with GHS ${amount.toFixed(2)}`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
    
    setShowTopUpModal(false);
    setTopUpData({ amount: '', method: 'Mobile Money' });
  };

  const handlePurchaseSMS = (e) => {
    e.preventDefault();
    const units = parseInt(smsData.units);
    const cost = units * SMS_COST;

    if (units < 10) {
      alert('Minimum SMS purchase is 10 units');
      return;
    }

    if (cost > walletBalance) {
      alert(`Insufficient wallet balance. You need GHS ${cost.toFixed(2)} but have GHS ${walletBalance.toFixed(2)}`);
      return;
    }

    purchaseSMS(units, cost);
    
    setSuccessMessage(`Successfully purchased ${units} SMS units for GHS ${cost.toFixed(2)}`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
    
    setShowSMSModal(false);
    setSmsData({ units: '' });
  };

  const filteredTransactions = walletTransactions.filter(transaction => {
    if (filterType === 'All') return true;
    return transaction.type === filterType;
  });

  const calculateSMSCost = () => {
    const units = parseInt(smsData.units) || 0;
    return (units * SMS_COST).toFixed(2);
  };

  return (
    <Container fluid className="py-2">
      {/* Header */}
      <Row className="mb-3">
        <Col>
          <h4 className="mb-0 brand-gradient">SMS Wallet & Transactions</h4>
        </Col>
      </Row>

      {/* Success Alert */}
      {showSuccess && (
        <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
          <FaCheckCircle className="me-2" />
          {successMessage}
        </Alert>
      )}

      {/* Wallet Overview Cards */}
      <Row className="g-2 mb-3">
        <Col md={3}>
          <Card className="shadow-sm elevated border-0" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
            <Card.Body className="p-3 text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 opacity-75" style={{ fontSize: '0.75rem' }}>Wallet Balance</p>
                  <h5 className="fw-bold mb-0">GHS {walletBalance.toFixed(2)}</h5>
                </div>
                <div className="bg-white bg-opacity-25 rounded-circle p-2">
                  <FaWallet size={20} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm elevated border-0" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <Card.Body className="p-3 text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 opacity-75" style={{ fontSize: '0.75rem' }}>SMS Units</p>
                  <h5 className="fw-bold mb-0">{smsBalance} Units</h5>
                </div>
                <div className="bg-white bg-opacity-25 rounded-circle p-2">
                  <FaSms size={20} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm elevated border-0" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <Card.Body className="p-3 text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 opacity-75" style={{ fontSize: '0.75rem' }}>Cost per SMS</p>
                  <h5 className="fw-bold mb-0">GHS {SMS_COST.toFixed(2)}</h5>
                </div>
                <div className="bg-white bg-opacity-25 rounded-circle p-2">
                  <FaMoneyBillWave size={20} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm elevated border-0" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
            <Card.Body className="p-3 text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 opacity-75" style={{ fontSize: '0.75rem' }}>Last Updated</p>
                  <h6 className="fw-bold mb-0" style={{ fontSize: '0.8rem' }}>
                    {new Date().toLocaleDateString()}
                  </h6>
                </div>
                <div className="bg-white bg-opacity-25 rounded-circle p-2">
                  <FaHistory size={20} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex gap-2">
            <Button className="cta-pill" size="sm" onClick={() => setShowTopUpModal(true)}>
              <FaPlus className="me-1" /> Top-Up Wallet
            </Button>
            <Button className="cta-pill" size="sm" onClick={() => setShowSMSModal(true)} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <FaSms className="me-1" /> Purchase SMS
            </Button>
          </div>
        </Col>
      </Row>

      {/* Low Balance Warning */}
      {smsBalance < 50 && (
        <Alert variant="warning">
          <FaExclamationTriangle className="me-2" />
          Low SMS balance! You have {smsBalance} units remaining. Consider purchasing more SMS units.
        </Alert>
      )}

      {/* Transaction History */}
      <Card className="shadow-sm elevated">
        <Card.Body className="p-3">
          <Row className="mb-2">
            <Col md={8}>
              <h6 className="mb-0">Transaction History</h6>
            </Col>
            <Col md={4}>
              <Form.Select
                size="sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">All Transactions</option>
                <option value="topup">Top-ups</option>
                <option value="sms_purchase">SMS Purchases</option>
                <option value="sms_usage">SMS Usage</option>
              </Form.Select>
            </Col>
          </Row>

              <div className="table-responsive">
            <Table hover size="sm">
              <thead className="table-light">
                <tr>
                  <th style={{ fontSize: '0.8rem' }}>Date</th>
                  <th style={{ fontSize: '0.8rem' }}>Description</th>
                  <th style={{ fontSize: '0.8rem' }}>Type</th>
                  <th style={{ fontSize: '0.8rem' }}>SMS Units</th>
                  <th style={{ fontSize: '0.8rem' }}>Amount (GHS)</th>
                  <th style={{ fontSize: '0.8rem' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td style={{ fontSize: '0.75rem' }}>
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td style={{ fontSize: '0.75rem' }}>{transaction.description}</td>
                      <td>
                        <Badge
                          bg={
                            transaction.type === 'topup' ? 'primary' :
                            transaction.type === 'sms_purchase' ? 'success' :
                            'warning'
                          }
                          style={{ fontSize: '0.65rem' }}
                        >
                          {transaction.type === 'topup' ? 'Top-up' :
                           transaction.type === 'sms_purchase' ? 'SMS Purchase' :
                           'SMS Usage'}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '0.75rem' }}>
                        <span className={transaction.smsUnits >= 0 ? 'text-success' : 'text-danger'}>
                          {transaction.smsUnits >= 0 ? '+' : ''}{transaction.smsUnits}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem' }}>
                        <span className={transaction.amount >= 0 ? 'text-success' : 'text-danger'}>
                          {transaction.amount >= 0 ? '+' : ''}GHS {Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem' }}>
                        {transaction.remainingSMS} units
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Top-Up Modal */}
      <Modal show={showTopUpModal} onHide={() => setShowTopUpModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1rem' }}>Top-Up Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleTopUp}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.85rem' }}>Amount (GHS) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="5"
                placeholder="Minimum GHS 5.00"
                value={topUpData.amount}
                onChange={(e) => setTopUpData({ ...topUpData, amount: e.target.value })}
                required
              />
              <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                Minimum top-up amount is GHS 5.00
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.85rem' }}>Payment Method <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={topUpData.method}
                onChange={(e) => setTopUpData({ ...topUpData, method: e.target.value })}
                required
              >
                <option value="Mobile Money">Mobile Money (MOMO)</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card/POS</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowTopUpModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Confirm Top-Up
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Purchase SMS Modal */}
      <Modal show={showSMSModal} onHide={() => setShowSMSModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1rem' }}>Purchase SMS Units</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" style={{ fontSize: '0.8rem' }}>
            <strong>Current Balance:</strong> GHS {walletBalance.toFixed(2)}<br />
            <strong>SMS Rate:</strong> GHS {SMS_COST.toFixed(2)} per unit
          </Alert>

          <Form onSubmit={handlePurchaseSMS}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.85rem' }}>Number of SMS Units <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                min="10"
                placeholder="Minimum 10 units"
                value={smsData.units}
                onChange={(e) => setSmsData({ units: e.target.value })}
                required
              />
              <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                Minimum purchase is 10 units
              </Form.Text>
            </Form.Group>

            {smsData.units && (
              <Alert variant="success" style={{ fontSize: '0.85rem' }}>
                <strong>Cost:</strong> GHS {calculateSMSCost()}<br />
                <strong>You will receive:</strong> {smsData.units} SMS units
              </Alert>
            )}

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowSMSModal(false)}>
                Cancel
              </Button>
              <Button variant="success" size="sm" type="submit">
                Purchase SMS
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Wallet;
