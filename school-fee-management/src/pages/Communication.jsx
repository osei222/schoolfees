import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Table, Badge, Tabs, Tab, ListGroup } from 'react-bootstrap';
import { FaPaperPlane, FaEnvelope, FaUsers, FaFileAlt, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useData } from '../contexts/DataContext';

const Communication = () => {
  const { students, messages, addMessage, templates, addTemplate } = useData();
  const [activeTab, setActiveTab] = useState('direct');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Direct Message State
  const [directMessage, setDirectMessage] = useState({
    recipient: '',
    recipientPhone: '',
    subject: '',
    message: ''
  });

  // Template Message State
  const [templateMessage, setTemplateMessage] = useState({
    templateId: '',
    recipients: 'all',
    customRecipients: []
  });

  // New Template State
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    code: '',
    subject: '',
    content: ''
  });

  // Handle Direct Message
  const handleShowDirectMessage = () => {
    setDirectMessage({
      recipient: '',
      recipientPhone: '',
      subject: '',
      message: ''
    });
    setShowMessageModal(true);
  };

  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s.id === parseInt(studentId));
    if (student) {
      setDirectMessage({
        ...directMessage,
        recipient: student.parentName,
        recipientPhone: student.parentPhone
      });
    }
  };

  const handleSendDirectMessage = (e) => {
    e.preventDefault();
    const messageData = {
      type: 'direct',
      recipient: directMessage.recipient,
      recipientPhone: directMessage.recipientPhone,
      subject: directMessage.subject,
      message: directMessage.message,
      status: 'sent'
    };
    addMessage(messageData);
    setShowMessageModal(false);
    alert('Message sent successfully!');
  };

  // Handle Template Message
  const handleSendTemplateMessage = (e) => {
    e.preventDefault();
    const template = templates.find(t => t.id === parseInt(templateMessage.templateId));
    
    let recipientCount = 0;
    let recipients = [];

    if (templateMessage.recipients === 'all') {
      recipients = students;
      recipientCount = students.length;
    } else if (templateMessage.recipients === 'pending') {
      recipients = students.filter(s => s.status === 'Pending' || s.status === 'Partial');
      recipientCount = recipients.length;
    } else {
      recipients = students.filter(s => templateMessage.customRecipients.includes(s.id.toString()));
      recipientCount = recipients.length;
    }

    const messageData = {
      type: 'template',
      template: template.code,
      recipientCount: recipientCount,
      subject: template.subject,
      status: 'sent'
    };

    addMessage(messageData);
    setShowMessageModal(false);
    alert(`Template message sent to ${recipientCount} recipient(s)!`);
  };

  // Handle New Template
  const handleSaveTemplate = (e) => {
    e.preventDefault();
    addTemplate(newTemplate);
    setShowTemplateModal(false);
    alert('Template saved successfully!');
  };

  const handleToggleRecipient = (studentId) => {
    const studentIdStr = studentId.toString();
    if (selectedStudents.includes(studentIdStr)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentIdStr));
      setTemplateMessage({
        ...templateMessage,
        customRecipients: templateMessage.customRecipients.filter(id => id !== studentIdStr)
      });
    } else {
      setSelectedStudents([...selectedStudents, studentIdStr]);
      setTemplateMessage({
        ...templateMessage,
        customRecipients: [...templateMessage.customRecipients, studentIdStr]
      });
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="brand-gradient">Communication Center</h2>
            <div>
              <Button variant="outline-primary" className="me-2" onClick={() => setShowTemplateModal(true)}>
                <FaPlus className="me-2" /> New Template
              </Button>
              <Button className="cta-pill" onClick={handleShowDirectMessage}>
                <FaPaperPlane className="me-2" /> Send Message
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Statistics */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="shadow-sm elevated border-0 bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 opacity-75">Total Messages Sent</p>
                  <h3 className="fw-bold mb-0">{messages.length}</h3>
                </div>
                <FaEnvelope size={40} className="opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm elevated border-0 bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 opacity-75">Total Recipients</p>
                  <h3 className="fw-bold mb-0">{students.length}</h3>
                </div>
                <FaUsers size={40} className="opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm elevated border-0 bg-info text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 opacity-75">Message Templates</p>
                  <h3 className="fw-bold mb-0">{templates.length}</h3>
                </div>
                <FaFileAlt size={40} className="opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card className="shadow-sm elevated">
        <Card.Body>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
            {/* Message History Tab */}
            <Tab eventKey="direct" title={<><FaEnvelope className="me-2" />Message History</>}>
              <div className="table-responsive">
                <Table hover>
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Recipient(s)</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => (
                      <tr key={msg.id}>
                        <td>{new Date(msg.date).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={msg.type === 'direct' ? 'primary' : 'info'}>
                            {msg.type === 'direct' ? 'Direct' : 'Template'}
                          </Badge>
                        </td>
                        <td>
                          {msg.type === 'direct' ? (
                            <div>
                              <div className="fw-semibold">{msg.recipient}</div>
                              <small className="text-muted">{msg.recipientPhone}</small>
                            </div>
                          ) : (
                            <span className="fw-semibold">{msg.recipientCount} recipients</span>
                          )}
                        </td>
                        <td>{msg.subject}</td>
                        <td>
                          <Badge bg="success">{msg.status}</Badge>
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>

            {/* Templates Tab */}
            <Tab eventKey="templates" title={<><FaFileAlt className="me-2" />Message Templates</>}>
              <Row>
                {templates.map((template) => (
                  <Col md={6} lg={4} key={template.id} className="mb-3">
                    <Card className="h-100 border">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="mb-0">{template.name}</h5>
                          <Badge bg="secondary">{template.code}</Badge>
                        </div>
                        <p className="text-muted small mb-2">{template.subject}</p>
                        <p className="small text-muted mb-3" style={{ height: '60px', overflow: 'hidden' }}>
                          {template.content}
                        </p>
                        <div className="d-flex gap-2">
                          <Button variant="outline-primary" size="sm" className="flex-grow-1">
                            <FaEdit className="me-1" /> Edit
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <FaTrash />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Tab>

            {/* Recipients Tab */}
            <Tab eventKey="recipients" title={<><FaUsers className="me-2" />Recipients</>}>
              <div className="table-responsive">
                <Table hover>
                  <thead className="table-light">
                    <tr>
                      <th>Student Name</th>
                      <th>Class</th>
                      <th>Parent Name</th>
                      <th>Phone Number</th>
                      <th>Email</th>
                      <th>Payment Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="fw-semibold">{student.name}</td>
                        <td>{student.class}</td>
                        <td>{student.parentName}</td>
                        <td>{student.parentPhone}</td>
                        <td>{student.parentEmail}</td>
                        <td>
                          <Badge bg={
                            student.status === 'Paid' ? 'success' :
                            student.status === 'Partial' ? 'warning' : 'danger'
                          }>
                            {student.status}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => {
                              handleStudentSelect(student.id);
                              handleShowDirectMessage();
                            }}
                          >
                            <FaPaperPlane className="me-1" /> Send Message
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Send Message Modal */}
      <Modal show={showMessageModal} onHide={() => setShowMessageModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Send Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="direct" className="mb-3">
            {/* Direct Message Tab */}
            <Tab eventKey="direct" title="Direct Message">
              <Form onSubmit={handleSendDirectMessage}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Student</Form.Label>
                  <Form.Select onChange={(e) => handleStudentSelect(e.target.value)}>
                    <option value="">Choose a student...</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.parentName} ({student.parentPhone})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Recipient Name *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Parent/Guardian name"
                        value={directMessage.recipient}
                        onChange={(e) => setDirectMessage({ ...directMessage, recipient: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="+233 XX XXX XXXX"
                        value={directMessage.recipientPhone}
                        onChange={(e) => setDirectMessage({ ...directMessage, recipientPhone: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Subject *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Message subject"
                    value={directMessage.subject}
                    onChange={(e) => setDirectMessage({ ...directMessage, subject: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Message *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Type your message here..."
                    value={directMessage.message}
                    onChange={(e) => setDirectMessage({ ...directMessage, message: e.target.value })}
                    required
                  />
                  <Form.Text className="text-muted">
                    Character count: {directMessage.message.length}
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={() => setShowMessageModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    <FaPaperPlane className="me-2" /> Send Message
                  </Button>
                </div>
              </Form>
            </Tab>

            {/* Template Message Tab */}
            <Tab eventKey="template" title="Template Message">
              <Form onSubmit={handleSendTemplateMessage}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Template *</Form.Label>
                  <Form.Select
                    value={templateMessage.templateId}
                    onChange={(e) => setTemplateMessage({ ...templateMessage, templateId: e.target.value })}
                    required
                  >
                    <option value="">Choose a template...</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.subject}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {templateMessage.templateId && (
                  <Card className="mb-3 bg-light">
                    <Card.Body>
                      <h6>Template Preview:</h6>
                      <p className="small mb-0">
                        {templates.find(t => t.id === parseInt(templateMessage.templateId))?.content}
                      </p>
                    </Card.Body>
                  </Card>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Recipients *</Form.Label>
                  <Form.Check
                    type="radio"
                    label="All Parents"
                    name="recipients"
                    value="all"
                    checked={templateMessage.recipients === 'all'}
                    onChange={(e) => setTemplateMessage({ ...templateMessage, recipients: e.target.value })}
                  />
                  <Form.Check
                    type="radio"
                    label="Parents with Pending/Partial Payments"
                    name="recipients"
                    value="pending"
                    checked={templateMessage.recipients === 'pending'}
                    onChange={(e) => setTemplateMessage({ ...templateMessage, recipients: e.target.value })}
                  />
                  <Form.Check
                    type="radio"
                    label="Select Specific Recipients"
                    name="recipients"
                    value="custom"
                    checked={templateMessage.recipients === 'custom'}
                    onChange={(e) => setTemplateMessage({ ...templateMessage, recipients: e.target.value })}
                  />
                </Form.Group>

                {templateMessage.recipients === 'custom' && (
                  <Card className="mb-3">
                    <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <h6 className="mb-3">Select Recipients:</h6>
                      <ListGroup>
                        {students.map(student => (
                          <ListGroup.Item key={student.id} className="d-flex align-items-center">
                            <Form.Check
                              type="checkbox"
                              id={`student-${student.id}`}
                              label=""
                              checked={selectedStudents.includes(student.id.toString())}
                              onChange={() => handleToggleRecipient(student.id)}
                              className="me-3"
                            />
                            <div className="flex-grow-1">
                              <div className="fw-semibold">{student.name}</div>
                              <small className="text-muted">{student.parentName} - {student.parentPhone}</small>
                            </div>
                            <Badge bg={student.status === 'Paid' ? 'success' : student.status === 'Partial' ? 'warning' : 'danger'}>
                              {student.status}
                            </Badge>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={() => setShowMessageModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    <FaPaperPlane className="me-2" /> Send Template Message
                  </Button>
                </div>
              </Form>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>

      {/* New Template Modal */}
      <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveTemplate}>
            <Form.Group className="mb-3">
              <Form.Label>Template Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Monthly Fee Reminder"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Template Code *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., monthly_reminder"
                value={newTemplate.code}
                onChange={(e) => setNewTemplate({ ...newTemplate, code: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                Use lowercase with underscores, no spaces
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Subject *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Message subject"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message Content *</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Type your template message here..."
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                Use placeholders: {'{student_name}'}, {'{class}'}, {'{amount}'}, {'{balance}'}, {'{reference}'}
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                <FaPlus className="me-2" /> Save Template
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Communication;
