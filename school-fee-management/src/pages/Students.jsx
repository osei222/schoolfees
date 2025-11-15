import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Table, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useData } from '../contexts/DataContext';

const Students = () => {
  const { students, addStudent, updateStudent, deleteStudent, feeStructure } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStudent, setCurrentStudent] = useState({
    name: '',
    class: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    academicYear: '2024/2025',
    term: 'Term 1'
  });

  const academicYears = ['2024/2025', '2025/2026', '2026/2027'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];

  const handleShowModal = (student = null) => {
    if (student) {
      setEditMode(true);
      setCurrentStudent(student);
    } else {
      setEditMode(false);
      setCurrentStudent({
        name: '',
        class: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        academicYear: '2024/2025',
        term: 'Term 1'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Calculate total fees from fee structure
    const termFees = feeStructure.filter(
      fee => fee.academicYear === currentStudent.academicYear && fee.term === currentStudent.term
    );
    const totalFees = termFees.reduce((sum, fee) => sum + fee.amount, 0);

    const studentData = {
      ...currentStudent,
      totalFees,
      paidAmount: 0,
      balance: totalFees,
      status: 'Unpaid'
    };

    if (editMode) {
      updateStudent(currentStudent.id, studentData);
    } else {
      addStudent(studentData);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteStudent(id);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-2">
      <Row className="mb-2">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Students Management</h4>
            <Button variant="primary" size="sm" onClick={() => handleShowModal()} className="cta-pill">
              <FaPlus className="me-1" /> Add Student
            </Button>
          </div>
        </Col>
      </Row>

      <Card className="shadow-sm elevated">
        <Card.Body className="p-3">
          <Row className="mb-2 g-2">
            <Col md={8}>
              <Form.Group>
                <div className="input-group input-group-sm">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Search by student name, class, or parent name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={4} className="text-end">
              <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                Total Students: <strong>{filteredStudents.length}</strong>
              </div>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover size="sm">
              <thead className="table-light">
                <tr>
                  <th style={{ fontSize: '0.85rem' }}>Student Name</th>
                  <th style={{ fontSize: '0.85rem' }}>Class</th>
                  <th style={{ fontSize: '0.85rem' }}>Parent Info</th>
                  <th style={{ fontSize: '0.85rem' }}>Total Fees</th>
                  <th style={{ fontSize: '0.85rem' }}>Paid</th>
                  <th style={{ fontSize: '0.85rem' }}>Balance</th>
                  <th style={{ fontSize: '0.85rem' }}>Status</th>
                  <th style={{ fontSize: '0.85rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="fw-semibold" style={{ fontSize: '0.85rem' }}>{student.name}</td>
                    <td style={{ fontSize: '0.85rem' }}>{student.class}</td>
                    <td>
                      <div style={{ fontSize: '0.75rem' }}>
                        <div><FaUser className="me-1" />{student.parentName}</div>
                        <div><FaPhone className="me-1" />{student.parentPhone}</div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>GHS {student.totalFees.toLocaleString()}</td>
                    <td className="text-success" style={{ fontSize: '0.85rem' }}>GHS {student.paidAmount.toLocaleString()}</td>
                    <td className="text-danger" style={{ fontSize: '0.85rem' }}>GHS {student.balance.toLocaleString()}</td>
                    <td>
                      <Badge bg={
                        student.status === 'Paid' ? 'success' :
                        student.status === 'Partial' ? 'warning' : 'danger'
                      } style={{ fontSize: '0.75rem' }}>
                        {student.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleShowModal(student)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(student.id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Student Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Student' : 'Add New Student'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Student Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter student name"
                    value={currentStudent.name}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Class *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter class (e.g., Grade 10A)"
                    value={currentStudent.class}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, class: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Parent/Guardian Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter parent name"
                    value={currentStudent.parentName}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, parentName: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Parent Phone *</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    value={currentStudent.parentPhone}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, parentPhone: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Parent Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="parent@email.com"
                    value={currentStudent.parentEmail}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, parentEmail: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Academic Year *</Form.Label>
                  <Form.Select
                    value={currentStudent.academicYear}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, academicYear: e.target.value })}
                    required
                    disabled={editMode}
                  >
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Fees will be loaded from Settings
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Term *</Form.Label>
                  <Form.Select
                    value={currentStudent.term}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, term: e.target.value })}
                    required
                    disabled={editMode}
                  >
                    {terms.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editMode ? 'Update Student' : 'Add Student'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Students;
