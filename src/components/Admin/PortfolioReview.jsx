import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  Modal,
  Form,
  Alert,
  InputGroup,
  FormControl,
  Dropdown,
  Tab,
  Tabs,
  ListGroup,
} from 'react-bootstrap';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  Person,
  Folder,
  Filter,
} from 'react-bootstrap-icons';
import { portfolioService } from '../../services/portfolio';
import { studentService } from '../../services/students';
import { useApi } from '../../hooks/useApi';
import {
  formatDate,
  truncateText,
  getVerificationBadgeVariant,
} from '../../utils/helpers';

const PortfolioReview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentFilter, setStudentFilter] = useState('all');

  const { data: portfolioItems = [], loading, error, execute: loadPortfolioItems } = 
    useApi(portfolioService.getAll, []);

  useEffect(() => {
    loadPortfolioItems();
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err) {
      console.error('Ошибка загрузки студентов:', err);
    }
  };

  const handleVerify = async (id, isVerified) => {
    try {
      await portfolioService.verify(id, isVerified);
      await loadPortfolioItems();
    } catch (err) {
      console.error('Ошибка верификации:', err);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const filteredItems = portfolioItems.filter(item => {
    // Фильтр по поиску
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student?.idName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.workType?.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Фильтр по статусу верификации
    const matchesVerification = 
      verificationFilter === 'all' || 
      (verificationFilter === 'verified' && item.isVerified) ||
      (verificationFilter === 'unverified' && !item.isVerified);

    // Фильтр по студенту
    const matchesStudent = 
      studentFilter === 'all' || 
      item.student?.id === parseInt(studentFilter);

    return matchesSearch && matchesVerification && matchesStudent;
  });

  const stats = {
    total: portfolioItems.length,
    verified: portfolioItems.filter(item => item.isVerified).length,
    unverified: portfolioItems.filter(item => !item.isVerified).length,
    byWorkType: portfolioItems.reduce((acc, item) => {
      const type = item.workType?.name || 'Не указано';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Проверка портфолио</h2>
        <div className="d-flex align-items-center gap-2">
          <Badge bg="success" className="fs-6">
            <CheckCircle className="me-1" /> {stats.verified} проверено
          </Badge>
          <Badge bg="warning" className="fs-6">
            <XCircle className="me-1" /> {stats.unverified} ожидает
          </Badge>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Фильтры и поиск */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Поиск работ</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <Search />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="По названию, описанию или студенту..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group>
                <Form.Label>Статус проверки</Form.Label>
                <Form.Select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                >
                  <option value="all">Все работы</option>
                  <option value="verified">Только проверенные</option>
                  <option value="unverified">Только непроверенные</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group>
                <Form.Label>Студент</Form.Label>
                <Form.Select
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                >
                  <option value="all">Все студенты</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.idName} ({student.email})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center">Загрузка...</div>
      ) : (
        <>
          {/* Статистика */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title className="text-primary">{stats.total}</Card.Title>
                  <Card.Text>Всего работ</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title className="text-success">{stats.verified}</Card.Title>
                  <Card.Text>Проверено работ</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title className="text-warning">{stats.unverified}</Card.Title>
                  <Card.Text>Ожидает проверки</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title className="text-info">
                    {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%
                  </Card.Title>
                  <Card.Text>Процент проверки</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Список работ */}
          <Row>
            {filteredItems.length === 0 ? (
              <Col>
                <Alert variant="info" className="text-center">
                  <Folder className="me-2" />
                  Работ не найдено
                </Alert>
              </Col>
            ) : (
              filteredItems.map((item) => (
                <Col key={item.id} lg={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Badge bg="info">
                          {item.workType?.name}
                        </Badge>
                        <Badge bg={getVerificationBadgeVariant(item.isVerified)}>
                          {item.isVerified ? (
                            <>
                              <CheckCircle className="me-1" /> Проверено
                            </>
                          ) : (
                            <>
                              <XCircle className="me-1" /> Ожидает
                            </>
                          )}
                        </Badge>
                      </div>
                      
                      <Card.Title>{item.title}</Card.Title>
                      
                      <div className="mb-3">
                        <div className="d-flex align-items-center text-muted mb-2">
                          <Person className="me-2" />
                          <strong>Студент:</strong> {item.student?.idName}
                        </div>
                        
                        <div className="d-flex align-items-center text-muted mb-2">
                          <Calendar className="me-2" />
                          <strong>Дата:</strong> {formatDate(item.completionDate)}
                        </div>
                      </div>
                      
                      <Card.Text>
                        {truncateText(item.description || 'Нет описания', 150)}
                      </Card.Text>
                      
                      <div className="mb-3">
                        <strong>Навыки:</strong>
                        <div className="mt-2">
                          {item.skills?.map(skill => (
                            <Badge key={skill.id} bg="secondary" className="me-1 mb-1">
                              {skill.name}
                            </Badge>
                          )) || <span className="text-muted">Не указаны</span>}
                        </div>
                      </div>
                    </Card.Body>
                    
                    <Card.Footer className="bg-transparent">
                      <div className="d-flex justify-content-between">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetails(item)}
                        >
                          <Eye className="me-1" /> Подробнее
                        </Button>
                        
                        <div className="d-flex gap-2">
                          {!item.isVerified && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleVerify(item.id, true)}
                            >
                              <CheckCircle className="me-1" /> Принять
                            </Button>
                          )}
                          
                          {item.isVerified && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleVerify(item.id, false)}
                            >
                              <XCircle className="me-1" /> Отозвать
                            </Button>
                          )}
                          
                          {item.fileUrl && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              href={`/api${item.fileUrl}`}
                              target="_blank"
                              title="Скачать файл"
                            >
                              <Download />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </>
      )}

      {/* Модальное окно деталей */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        {selectedItem && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedItem.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Tabs defaultActiveKey="details" className="mb-3">
                <Tab eventKey="details" title="Детали работы">
                  <Row>
                    <Col md={6}>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>Студент:</strong> {selectedItem.student?.idName}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Email:</strong> {selectedItem.student?.email}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Тип работы:</strong> {selectedItem.workType?.name}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Дата выполнения:</strong> {formatDate(selectedItem.completionDate)}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Дата создания:</strong> {formatDate(selectedItem.createdAt, 'dd.MM.yyyy HH:mm')}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Статус:</strong>{' '}
                          <Badge bg={getVerificationBadgeVariant(selectedItem.isVerified)}>
                            {selectedItem.isVerified ? 'Проверено' : 'Ожидает проверки'}
                          </Badge>
                        </ListGroup.Item>
                      </ListGroup>
                    </Col>
                    
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>Навыки и технологии:</strong>
                        <div className="mt-2">
                          {selectedItem.skills?.map(skill => (
                            <Badge key={skill.id} bg="info" className="me-1 mb-1">
                              {skill.name}
                            </Badge>
                          )) || <span className="text-muted">Не указаны</span>}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <strong>Ссылка на проект:</strong>
                        <div className="mt-1">
                          {selectedItem.projectUrl ? (
                            <a href={selectedItem.projectUrl} target="_blank" rel="noopener noreferrer">
                              {selectedItem.projectUrl}
                            </a>
                          ) : (
                            <span className="text-muted">Не указана</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <strong>Прикрепленный файл:</strong>
                        <div className="mt-1">
                          {selectedItem.fileUrl ? (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              href={`/api${selectedItem.fileUrl}`}
                              target="_blank"
                            >
                              <Download className="me-1" />
                              Скачать файл
                            </Button>
                          ) : (
                            <span className="text-muted">Нет файла</span>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                  
                  <div className="mt-3">
                    <strong>Описание:</strong>
                    <div className="mt-2 p-3 bg-light rounded">
                      {selectedItem.description || 'Описание отсутствует'}
                    </div>
                  </div>
                </Tab>
                
                <Tab eventKey="student" title="Информация о студенте">
                  {selectedItem.student && (
                    <div>
                      <div className="mb-3">
                        <strong>ID Name:</strong> {selectedItem.student.idName}
                      </div>
                      <div className="mb-3">
                        <strong>Email:</strong> {selectedItem.student.email}
                      </div>
                      <div className="mb-3">
                        <strong>Группа:</strong> {selectedItem.student.group?.name || 'Не назначена'}
                      </div>
                      <div className="mb-3">
                        <strong>Биография:</strong>
                        <div className="mt-2 p-3 bg-light rounded">
                          {selectedItem.student.bio || 'Биография отсутствует'}
                        </div>
                      </div>
                      <div className="mb-3">
                        <strong>Статус:</strong>{' '}
                        <Badge bg={selectedItem.student.isActive ? 'success' : 'secondary'}>
                          {selectedItem.student.isActive ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </Tab>
              </Tabs>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Закрыть
              </Button>
              
              <div className="d-flex gap-2">
                {!selectedItem.isVerified && (
                  <Button
                    variant="success"
                    onClick={() => {
                      handleVerify(selectedItem.id, true);
                      setShowDetailsModal(false);
                    }}
                  >
                    <CheckCircle className="me-1" /> Принять работу
                  </Button>
                )}
                
                {selectedItem.isVerified && (
                  <Button
                    variant="warning"
                    onClick={() => {
                      handleVerify(selectedItem.id, false);
                      setShowDetailsModal(false);
                    }}
                  >
                    <XCircle className="me-1" /> Отозвать проверку
                  </Button>
                )}
              </div>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PortfolioReview;