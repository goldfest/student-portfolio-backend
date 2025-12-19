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
  Building,
  People,
} from 'react-bootstrap-icons';
import { portfolioService } from '../../services/portfolio';
import { studentService } from '../../services/students';
import { groupService } from '../../services/groups';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import {
  formatDate,
  truncateText,
  getVerificationBadgeVariant,
} from '../../utils/helpers';

const PortfolioReview = () => {
  const { user, isAdmin, isTeacher } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [myStudents, setMyStudents] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [studentFilter, setStudentFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [workTypes, setWorkTypes] = useState([]);

  // Загружаем все работы
  const { data: allPortfolioItems = [], loading, error, execute: loadPortfolioItems } = 
    useApi(portfolioService.getAll, []);

  useEffect(() => {
    if (user) {
      loadPortfolioItems();
      loadMyData();
    }
  }, [user]);

  const loadMyData = async () => {
    if (isTeacher()) {
      // Загружаем студентов преподавателя напрямую
      const studentsData = await studentService.getByTeacherId(user.id);
      setMyStudents(studentsData);
      
      const teacherGroups = await groupService.getByTeacherId(user.id);
      setMyGroups(teacherGroups);
    }
  };

  // Фильтруем работы в зависимости от роли
  const getFilteredPortfolioItems = () => {
    let items = allPortfolioItems;
    
    // Если это преподаватель, показываем только работы студентов из его групп
    if (isTeacher() && !isAdmin()) {
      const myStudentIds = myStudents.map(student => student.id);
      items = items.filter(item => myStudentIds.includes(item.student?.id));
    }
    
    return items;
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

  const filteredItems = getFilteredPortfolioItems().filter(item => {
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

    // Фильтр по группе
    const matchesGroup = 
      groupFilter === 'all' || 
      item.student?.group?.id === parseInt(groupFilter);

    // Фильтр по типу работы
    const matchesWorkType = 
      workTypeFilter === 'all' || 
      item.workType?.id === parseInt(workTypeFilter);

    return matchesSearch && matchesVerification && matchesStudent && matchesGroup && matchesWorkType;
  });

  const stats = {
    total: getFilteredPortfolioItems().length,
    verified: getFilteredPortfolioItems().filter(item => item.isVerified).length,
    unverified: getFilteredPortfolioItems().filter(item => !item.isVerified).length,
    byWorkType: getFilteredPortfolioItems().reduce((acc, item) => {
      const type = item.workType?.name || 'Не указано';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  };

  // Получаем уникальные типы работ для фильтра
  const uniqueWorkTypes = Array.from(
    new Set(
      getFilteredPortfolioItems()
        .map(item => item.workType)
        .filter(Boolean)
    )
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Проверка портфолио</h2>
          <p className="text-muted mb-0">
            {isTeacher() && !isAdmin() 
              ? "Работы студентов из ваших групп" 
              : "Все работы студентов"}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Badge bg="success" className="fs-6">
            <CheckCircle className="me-1" /> {stats.verified} проверено
          </Badge>
          <Badge bg="warning" className="fs-6">
            <XCircle className="me-1" /> {stats.unverified} ожидает
          </Badge>
          {isTeacher() && !isAdmin() && (
            <Badge bg="info" className="fs-6">
              <People className="me-1" /> {myStudents.length} студентов
            </Badge>
          )}
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Информация для преподавателя */}
      {isTeacher() && !isAdmin() && myStudents.length === 0 && (
        <Alert variant="info" className="mb-4">
          <Building className="me-2" />
          <strong>У вас пока нет групп студентов.</strong> 
          {myGroups.length === 0 
            ? " Создайте группы или попросите администратора назначить вас куратором групп."
            : " В ваших группах пока нет студентов."}
        </Alert>
      )}

      {/* Фильтры и поиск */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            {/* Поиск */}
            <Col md={12} lg={4}>
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
            
            {/* Статус проверки */}
            <Col md={6} lg={2}>
              <Form.Group>
                <Form.Label>Статус</Form.Label>
                <Form.Select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                >
                  <option value="all">Все работы</option>
                  <option value="verified">Проверенные</option>
                  <option value="unverified">Непроверенные</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            {/* Фильтр по студенту */}
            <Col md={6} lg={2}>
              <Form.Group>
                <Form.Label>Студент</Form.Label>
                <Form.Select
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  disabled={myStudents.length === 0}
                >
                  <option value="all">Все студенты</option>
                  {myStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.idName}
                    </option>
                  ))}
                </Form.Select>
                {myStudents.length === 0 && (
                  <Form.Text className="text-muted">
                    Нет доступных студентов
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
            
            {/* Фильтр по группе (только если есть группы) */}
            <Col md={6} lg={2}>
              <Form.Group>
                <Form.Label>Группа</Form.Label>
                <Form.Select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  disabled={myGroups.length === 0}
                >
                  <option value="all">Все группы</option>
                  {myGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Form.Select>
                {myGroups.length === 0 && (
                  <Form.Text className="text-muted">
                    Нет доступных групп
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
            
            {/* Фильтр по типу работы */}
            <Col md={6} lg={2}>
              <Form.Group>
                <Form.Label>Тип работы</Form.Label>
                <Form.Select
                  value={workTypeFilter}
                  onChange={(e) => setWorkTypeFilter(e.target.value)}
                >
                  <option value="all">Все типы</option>
                  {uniqueWorkTypes.map((workType, index) => (
                    <option key={index} value={workType.id}>
                      {workType.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          {/* Быстрые действия */}
          <div className="mt-3 d-flex justify-content-between">
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setVerificationFilter('all');
                  setStudentFilter('all');
                  setGroupFilter('all');
                  setWorkTypeFilter('all');
                }}
              >
                <Filter className="me-1" />
                Сбросить фильтры
              </Button>
              
              {isTeacher() && !isAdmin() && myGroups.length > 0 && (
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => setVerificationFilter('unverified')}
                >
                  <XCircle className="me-1" />
                  Показать только непроверенные
                </Button>
              )}
            </div>
            
            <div className="text-muted small">
              Найдено: {filteredItems.length} из {getFilteredPortfolioItems().length} работ
            </div>
          </div>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-3">Загрузка работ для проверки...</p>
        </div>
      ) : (
        <>
          {/* Статистика */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title className="text-primary">{stats.total}</Card.Title>
                  <Card.Text>Всего работ</Card.Text>
                  <small className="text-muted">
                    {isTeacher() && !isAdmin() ? 'в ваших группах' : 'в системе'}
                  </small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title className="text-success">{stats.verified}</Card.Title>
                  <Card.Text>Проверено работ</Card.Text>
                  <small className="text-muted">
                    {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% от общего
                  </small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title className="text-warning">{stats.unverified}</Card.Title>
                  <Card.Text>Ожидает проверки</Card.Text>
                  {stats.unverified > 0 && (
                    <small className="text-muted d-block">
                      Приоритетная задача
                    </small>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title className="text-info">
                    {myGroups.length}
                  </Card.Title>
                  <Card.Text>Мои группы</Card.Text>
                  <small className="text-muted">
                    {myStudents.length} студентов
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Список работ */}
          {filteredItems.length === 0 ? (
            <Alert variant="info" className="text-center">
              <Folder className="me-2" />
              {searchTerm || verificationFilter !== 'all' || studentFilter !== 'all' || groupFilter !== 'all'
                ? "Работ по заданным фильтрам не найдено"
                : isTeacher() && !isAdmin()
                  ? "У студентов из ваших групп пока нет работ в портфолио"
                  : "Работ в портфолио пока нет"}
              
              {(searchTerm || verificationFilter !== 'all' || studentFilter !== 'all' || groupFilter !== 'all') && (
                <div className="mt-2">
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setSearchTerm('');
                      setVerificationFilter('all');
                      setStudentFilter('all');
                      setGroupFilter('all');
                      setWorkTypeFilter('all');
                    }}
                  >
                    Показать все работы
                  </Button>
                </div>
              )}
            </Alert>
          ) : (
            <Row>
              {filteredItems.map((item) => (
                <Col key={item.id} lg={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <Badge bg="info">
                            {item.workType?.name}
                          </Badge>
                          {item.student?.group && (
                            <Badge bg="secondary" className="ms-2">
                              <Building className="me-1" size={12} />
                              {item.student.group.name}
                            </Badge>
                          )}
                        </div>
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
                          <div>
                            <strong>Студент:</strong> {item.student?.idName}
                            <div className="small">
                              {item.student?.email}
                            </div>
                          </div>
                        </div>
                        
                        <div className="d-flex align-items-center text-muted mb-2">
                          <Calendar className="me-2" />
                          <strong>Дата выполнения:</strong> {formatDate(item.completionDate)}
                        </div>
                        
                        <div className="d-flex align-items-center text-muted">
                          <Calendar className="me-2" />
                          <strong>Добавлено:</strong> {formatDate(item.createdAt)}
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
                      <div className="d-flex justify-content-between align-items-center">
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
                              title="Принять работу"
                            >
                              <CheckCircle className="me-1" /> Принять
                            </Button>
                          )}
                          
                          {item.isVerified && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleVerify(item.id, false)}
                              title="Отозвать проверку"
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
                          
                          {item.projectUrl && (
                            <Button
                              variant="outline-info"
                              size="sm"
                              href={item.projectUrl}
                              target="_blank"
                              title="Открыть проект"
                            >
                              <Eye />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
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
                          <strong>Группа:</strong> {selectedItem.student?.group?.name || 'Не назначена'}
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
                        <strong>Статус группы:</strong>{' '}
                        <Badge bg={selectedItem.student.group ? 'info' : 'secondary'}>
                          {selectedItem.student.group ? 'Назначена' : 'Не назначена'}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <strong>Биография:</strong>
                        <div className="mt-2 p-3 bg-light rounded">
                          {selectedItem.student.bio || 'Биография отсутствует'}
                        </div>
                      </div>
                      <div className="mb-3">
                        <strong>Статус аккаунта:</strong>{' '}
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