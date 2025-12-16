import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  ProgressBar,
  Alert,
  ListGroup,
  Badge,
  Button,
} from 'react-bootstrap';
import {
  Award,
  Trophy,
  CheckCircle,
  Clock,
  FileEarmarkText,
  BarChart,
  Person,
  Calendar,
} from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';
import { portfolioService } from '../../services/portfolio';
import { studentService } from '../../services/students';
import { formatDate } from '../../utils/helpers';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, isStudent } = useAuth();
  const [portfolioStats, setPortfolioStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
    byWorkType: {},
    recentItems: []
  });
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id && isStudent()) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Загружаем портфолио студента
      const items = await portfolioService.getByStudentId(user.id);

      const verified = items.filter(item => item.isVerified).length;
      const unverified = items.filter(item => !item.isVerified).length;
      
      // Группировка по типам работ
      const byWorkType = items.reduce((acc, item) => {
        const type = item.workType?.name || 'Не указано';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Последние 3 работы
      const recentItems = items
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

      setPortfolioStats({
        total: items.length,
        verified,
        unverified,
        byWorkType,
        recentItems
      });

      // 2. Пробуем загрузить данные студента по email (новый эндпоинт)
      try {
        const studentData = await studentService.getByEmail(user.email);
        setStudentInfo(studentData);
      } catch (studentError) {
        console.warn('Не удалось загрузить детали студента:', studentError);
        // Используем данные из user как fallback
        setStudentInfo({
          id: user.id,
          idName: user.idName,
          email: user.email,
          bio: user.bio || '',
          avatarUrl: user.avatarUrl || '',
          group: user.group || null,
          isActive: user.isActive,
          createdAt: user.createdAt
        });
      }

    } catch (error) {
      console.error('Ошибка загрузки данных дашборда:', error);
      setError('Не удалось загрузить данные. Попробуйте обновить страницу.');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    const { total } = portfolioStats;
    if (total === 0) return 0;
    return Math.min(Math.round((total / 10) * 100), 100);
  };

  const getLevel = () => {
    const { total } = portfolioStats;
    if (total >= 10) return { level: 'Эксперт', color: 'danger', icon: <Trophy /> };
    if (total >= 5) return { level: 'Продвинутый', color: 'warning', icon: <Award /> };
    if (total >= 2) return { level: 'Начинающий', color: 'info', icon: <Award /> };
    return { level: 'Новичок', color: 'secondary', icon: <Award /> };
  };

  if (!isStudent()) {
    return (
      <Alert variant="danger">
        <h4>Доступ запрещен</h4>
        <p>Эта страница доступна только для студентов.</p>
        <Button as={Link} to="/" variant="primary">
          На главную
        </Button>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-3">Загрузка дашборда...</p>
      </div>
    );
  }

  const { level, color, icon } = getLevel();
  const progressPercentage = getProgressPercentage();

  return (
    <div>
      <Row className="mb-4">
        <Col md={8}>
          <h2>Мой дашборд</h2>
          <p className="text-muted">
            Добро пожаловать, {user?.idName}! Здесь вы видите обзор вашего портфолио.
          </p>
        </Col>
        <Col md={4} className="text-end">
          <Button as={Link} to="/student/add-work" variant="primary" size="lg">
            <FileEarmarkText className="me-2" />
            Добавить работу
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="warning" className="mb-4">
          {error}
          <Button variant="outline-warning" size="sm" className="ms-3" onClick={loadDashboardData}>
            Попробовать снова
          </Button>
        </Alert>
      )}

      {/* Статистика */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-primary">{portfolioStats.total}</Card.Title>
              <Card.Text>Всего работ</Card.Text>
              <small className="text-muted">
                {portfolioStats.verified} проверено, {portfolioStats.unverified} ожидает
              </small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-success">
                {portfolioStats.verified}
              </Card.Title>
              <Card.Text>Проверено</Card.Text>
              <CheckCircle className="text-success" />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-warning">
                {portfolioStats.unverified}
              </Card.Title>
              <Card.Text>Ожидает проверки</Card.Text>
              <Clock className="text-warning" />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title>
                <Badge bg={color} className="fs-6">
                  {icon} {level}
                </Badge>
              </Card.Title>
              <Card.Text>Уровень</Card.Text>
              <small className="text-muted">
                На основе количества работ
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Прогресс и информация */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title className="d-flex align-items-center mb-3">
                <BarChart className="me-2" />
                Прогресс заполнения портфолио
              </Card.Title>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Заполнение портфолио</span>
                  <span className="fw-bold">{progressPercentage}%</span>
                </div>
                <ProgressBar 
                  now={progressPercentage} 
                  variant={progressPercentage >= 100 ? 'success' : 
                         progressPercentage >= 70 ? 'info' : 
                         progressPercentage >= 40 ? 'warning' : 'primary'}
                  animated={progressPercentage < 100}
                  className="mb-2"
                />
                <div className="d-flex justify-content-between">
                  <small className="text-muted">
                    {portfolioStats.total} из 10 работ
                  </small>
                  <small className="text-muted">
                    {10 - portfolioStats.total} осталось до цели
                  </small>
                </div>
              </div>
              
              <div className="mt-4">
                <h6>Распределение по типам работ:</h6>
                {Object.entries(portfolioStats.byWorkType).map(([type, count]) => (
                  <div key={type} className="d-flex justify-content-between align-items-center mb-2">
                    <span>{type}</span>
                    <div>
                      <Badge bg="info" className="me-2">{count}</Badge>
                      <small className="text-muted">
                        {Math.round((count / portfolioStats.total) * 100)}%
                      </small>
                    </div>
                  </div>
                ))}
                
                {Object.keys(portfolioStats.byWorkType).length === 0 && (
                  <Alert variant="info" className="mb-0">
                    <FileEarmarkText className="me-2" />
                    Добавьте первую работу, чтобы увидеть статистику
                  </Alert>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title className="d-flex align-items-center mb-3">
                <Person className="me-2" />
                Моя информация
              </Card.Title>
              
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>ID Name:</span>
                  <strong className="text-primary">{user?.idName}</strong>
                </ListGroup.Item>
                
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Email:</span>
                  <strong>{user?.email}</strong>
                </ListGroup.Item>
                
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Группа:</span>
                  <Badge bg="info">
                    {studentInfo?.group?.name || 'Не назначена'}
                  </Badge>
                </ListGroup.Item>
                
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Статус:</span>
                  <Badge bg={user?.isActive ? 'success' : 'secondary'}>
                    {user?.isActive ? 'Активен' : 'Неактивен'}
                  </Badge>
                </ListGroup.Item>
                
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>
                    <Calendar className="me-1" />
                    Зарегистрирован:
                  </span>
                  <strong>{formatDate(user?.createdAt)}</strong>
                </ListGroup.Item>
              </ListGroup>
              
              <div className="mt-3">
                <Button 
                  as={Link} 
                  to="/student/edit-profile" 
                  variant="outline-primary" 
                  className="w-100 mb-2"
                >
                  Редактировать профиль
                </Button>
                <Button 
                  as={Link} 
                  to={`/portfolio/${user?.idName}`} 
                  variant="outline-success" 
                  className="w-100"
                >
                  Публичное портфолио
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Последние работы */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <Clock className="me-2" />
                  Последние работы
                </div>
                <Button as={Link} to="/student/portfolio" variant="outline-primary" size="sm">
                  Все работы →
                </Button>
              </Card.Title>
              
              {portfolioStats.recentItems.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <FileEarmarkText className="me-2" />
                  У вас пока нет работ в портфолио.
                  <div className="mt-2">
                    <Button as={Link} to="/student/add-work" variant="success" size="sm">
                      Добавить первую работу
                    </Button>
                  </div>
                </Alert>
              ) : (
                <ListGroup variant="flush">
                  {portfolioStats.recentItems.map((item) => (
                    <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center py-3">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <strong className="me-2">{item.title}</strong>
                          <Badge bg="info" className="fs-7">
                            {item.workType?.name}
                          </Badge>
                        </div>
                        <div className="text-muted small">
                          <Calendar className="me-1" />
                          {formatDate(item.completionDate)}
                          {item.description && (
                            <>
                              <span className="mx-2">•</span>
                              {item.description.substring(0, 60)}...
                            </>
                          )}
                        </div>
                        <div className="mt-2">
                          {item.skills?.slice(0, 3).map(skill => (
                            <Badge key={skill.id} bg="secondary" className="me-1 fs-7">
                              {skill.name}
                            </Badge>
                          ))}
                          {item.skills?.length > 3 && (
                            <Badge bg="light" text="dark" className="fs-7">
                              +{item.skills.length - 3} еще
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-2">
                        <Badge bg={item.isVerified ? 'success' : 'warning'} className="fs-6">
                          {item.isVerified ? (
                            <>
                              <CheckCircle className="me-1" /> Проверено
                            </>
                          ) : (
                            <>
                              <Clock className="me-1" /> Ожидает
                            </>
                          )}
                        </Badge>
                        <div className="d-flex gap-2">
                          <Button 
                            as={Link} 
                            to={`/student/portfolio`} 
                            variant="outline-primary" 
                            size="sm"
                          >
                            Подробнее
                          </Button>
                          {item.fileUrl && (
                            <Button 
                              href={`/api${item.fileUrl}`}
                              target="_blank"
                              variant="outline-secondary" 
                              size="sm"
                            >
                              Файл
                            </Button>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Рекомендации */}
      {portfolioStats.total < 10 && (
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title className="d-flex align-items-center">
                  <Award className="me-2 text-warning" />
                  Рекомендации для улучшения портфолио
                </Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <CheckCircle className="me-2 text-success" />
                    <strong>Добавьте разнообразные типы работ</strong> - курсовые, личные проекты, сертификаты
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <CheckCircle className="me-2 text-success" />
                    <strong>Детально описывайте проекты</strong> - цели, технологии, результаты
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <CheckCircle className="me-2 text-success" />
                    <strong>Прикрепляйте файлы и ссылки</strong> - код, документация, демо
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <CheckCircle className="me-2 text-success" />
                    <strong>Отмечайте все навыки</strong> - это поможет в поиске работы
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <CheckCircle className="me-2 text-success" />
                    <strong>Регулярно обновляйте</strong> - добавляйте новые достижения
                  </ListGroup.Item>
                </ListGroup>
                {portfolioStats.total < 3 && (
                  <Alert variant="warning" className="mt-3 mb-0">
                    <strong>Быстрый старт:</strong> Добавьте 3 первые работы разного типа чтобы показать разнообразие навыков.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default StudentDashboard;