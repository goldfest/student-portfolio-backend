import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Row,
  Col,
  Badge,
  Button,
  Tab,
  Tabs,
  ListGroup,
  Image,
  Alert,
} from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import {
  Person,
  Calendar,
  Envelope,
  Building,
  Award,
  Download,
  Link45deg,
  CheckCircle,
  FileEarmarkText,
  CodeSlash,
} from 'react-bootstrap-icons';
import { studentService } from '../../services/students';
import { portfolioService } from '../../services/portfolio';
import { formatDate, truncateText } from '../../utils/helpers';

const PublicView = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('portfolio');

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      setError('');

      // Сначала пытаемся найти студента по idName
      let studentData;
      try {
        studentData = await studentService.getByEmail(studentId + '@example.com'); // Временное решение
      } catch (e) {
        // Если не нашли по email, ищем в списке всех студентов
        const allStudents = await studentService.getAll();
        studentData = allStudents.find(s => s.idName === studentId);
      }

      if (!studentData) {
        setError('Студент не найден');
        return;
      }

      setStudent(studentData);

      // Загружаем портфолио студента
      const items = await portfolioService.getByStudentId(studentData.id);
      setPortfolioItems(items);

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Ошибка загрузки данных студента');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = portfolioItems.length;
    const verified = portfolioItems.filter(item => item.isVerified).length;
    const skills = new Set();
    portfolioItems.forEach(item => {
      item.skills?.forEach(skill => skills.add(skill.name));
    });

    return {
      total,
      verified,
      skillsCount: skills.size,
      lastUpdate: portfolioItems.length > 0
        ? new Date(Math.max(...portfolioItems.map(item => new Date(item.createdAt))))
        : null
    };
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-3">Загрузка портфолио студента...</p>
      </Container>
    );
  }

  if (error || !student) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Портфолио не найдено</h4>
          <p>{error || 'Студент с таким ID не найден.'}</p>
          <Button as={Link} to="/" variant="primary">
            Вернуться на главную
          </Button>
        </Alert>
      </Container>
    );
  }

  const stats = getStats();

  return (
    <Container className="py-5">
      {/* Шапка профиля */}
      <Card className="mb-4 shadow">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3} className="text-center mb-4 mb-md-0">
              {student.avatarUrl ? (
                <Image
                  src={student.avatarUrl}
                  roundedCircle
                  fluid
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto"
                  style={{ width: '150px', height: '150px' }}
                >
                  <Person size={64} className="text-white" />
                </div>
              )}
            </Col>
            
            <Col md={9}>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="mb-1">{student.idName}</h1>
                  <p className="lead text-muted mb-0">
                    {student.bio || 'Студент'}
                  </p>
                </div>
                <Badge bg={student.isActive ? 'success' : 'secondary'}>
                  {student.isActive ? 'Активен' : 'Неактивен'}
                </Badge>
              </div>
              
              <Row className="mb-3">
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0 px-0 py-1">
                      <Envelope className="me-2 text-primary" />
                      <strong>Email:</strong> {student.email}
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0 py-1">
                      <Building className="me-2 text-primary" />
                      <strong>Группа:</strong> {student.group?.name || 'Не указана'}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0 px-0 py-1">
                      <Award className="me-2 text-primary" />
                      <strong>Всего работ:</strong> {stats.total}
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0 py-1">
                      <CheckCircle className="me-2 text-primary" />
                      <strong>Проверено:</strong> {stats.verified}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
              
              {stats.lastUpdate && (
                <div className="text-muted small">
                  <Calendar className="me-1" />
                  Последнее обновление: {formatDate(stats.lastUpdate, 'dd.MM.yyyy')}
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Статистика */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-primary">{stats.total}</Card.Title>
              <Card.Text>Работ в портфолио</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-success">{stats.verified}</Card.Title>
              <Card.Text>Проверенных работ</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-warning">{stats.skillsCount}</Card.Title>
              <Card.Text>Различных навыков</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Вкладки */}
      <Tabs
        activeKey={activeTab}
        onSelect={setActiveTab}
        className="mb-4"
      >
        <Tab eventKey="portfolio" title="Портфолио">
          {portfolioItems.length === 0 ? (
            <Alert variant="info">
              <FileEarmarkText className="me-2" />
              У студента пока нет работ в портфолио.
            </Alert>
          ) : (
            <Row>
              {portfolioItems.map((item) => (
                <Col key={item.id} lg={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Badge bg="info">
                          {item.workType?.name}
                        </Badge>
                        {item.isVerified && (
                          <Badge bg="success">
                            <CheckCircle className="me-1" />
                            Проверено
                          </Badge>
                        )}
                      </div>
                      
                      <Card.Title>{item.title}</Card.Title>
                      
                      <div className="mb-3">
                        <div className="text-muted small mb-2">
                          <Calendar className="me-1" />
                          {formatDate(item.completionDate)}
                        </div>
                        
                        <Card.Text>
                          {truncateText(item.description || 'Нет описания', 150)}
                        </Card.Text>
                      </div>
                      
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
                        {item.projectUrl && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            href={item.projectUrl}
                            target="_blank"
                          >
                            <Link45deg className="me-1" />
                            Проект
                          </Button>
                        )}
                        
                        {item.fileUrl && (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            href={`/api${item.fileUrl}`}
                            target="_blank"
                          >
                            <Download className="me-1" />
                            Файл
                          </Button>
                        )}
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Tab>
        
        <Tab eventKey="skills" title="Навыки">
          <Card>
            <Card.Body>
              <h4 className="mb-4">
                <CodeSlash className="me-2" />
                Навыки и технологии
              </h4>
              
              {portfolioItems.length === 0 ? (
                <Alert variant="info">Нет данных о навыках</Alert>
              ) : (
                <div>
                  <h5>Все навыки:</h5>
                  <div className="mb-4">
                    {(() => {
                      const allSkills = new Map();
                      portfolioItems.forEach(item => {
                        item.skills?.forEach(skill => {
                          const count = allSkills.get(skill.name) || 0;
                          allSkills.set(skill.name, count + 1);
                        });
                      });
                      
                      const sortedSkills = Array.from(allSkills.entries())
                        .sort((a, b) => b[1] - a[1]);
                      
                      return (
                        <div className="d-flex flex-wrap gap-2">
                          {sortedSkills.map(([skillName, count]) => (
                            <Badge key={skillName} bg="primary" className="p-2 fs-6">
                              {skillName} <Badge bg="light" text="dark">{count}</Badge>
                            </Badge>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  
                  <h5>Распределение по проектам:</h5>
                  <ListGroup variant="flush">
                    {portfolioItems.map(item => (
                      <ListGroup.Item key={item.id}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{item.title}</strong>
                            <div className="text-muted small">{item.workType?.name}</div>
                          </div>
                          <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '300px' }}>
                            {item.skills?.map(skill => (
                              <Badge key={skill.id} bg="info" className="fs-7">
                                {skill.name}
                              </Badge>
                            )) || <span className="text-muted">Нет навыков</span>}
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="about" title="О студенте">
          <Card>
            <Card.Body>
              <h4 className="mb-4">Информация о студенте</h4>
              
              <Row>
                <Col md={6}>
                  <ListGroup variant="flush" className="mb-4">
                    <ListGroup.Item>
                      <strong>ID Name:</strong> {student.idName}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Email:</strong> {student.email}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Группа:</strong> {student.group?.name || 'Не указана'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Статус:</strong>{' '}
                      <Badge bg={student.isActive ? 'success' : 'secondary'}>
                        {student.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Дата регистрации:</strong> {formatDate(student.createdAt)}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                
                <Col md={6}>
                  <h5>Биография:</h5>
                  <div className="p-3 bg-light rounded">
                    {student.bio || 'Биография не заполнена'}
                  </div>
                </Col>
              </Row>
              
              <div className="mt-4">
                <h5>Достижения:</h5>
                <Row>
                  <Col md={4}>
                    <div className="text-center p-3 border rounded">
                      <div className="display-6 text-primary">{stats.total}</div>
                      <div className="text-muted">Всего работ</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-3 border rounded">
                      <div className="display-6 text-success">{stats.verified}</div>
                      <div className="text-muted">Проверено</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-3 border rounded">
                      <div className="display-6 text-warning">{stats.skillsCount}</div>
                      <div className="text-muted">Навыков</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Кнопка возврата */}
      <div className="text-center mt-5">
        <Button as={Link} to="/" variant="outline-primary">
          Вернуться на главную
        </Button>
      </div>
    </Container>
  );
};

export default PublicView;