import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { People, Folder, CheckCircle, Clock } from 'react-bootstrap-icons';
import { studentService } from '../../services/students';
import { portfolioService } from '../../services/portfolio';
import { teacherService } from '../../services/teachers';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    portfolioItems: 0,
    verifiedItems: 0,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [students, teachers, items, verified] = await Promise.all([
        studentService.getAll(),
        teacherService.getAll(),
        portfolioService.getAll(),
        portfolioService.getVerified(),
      ]);

      setStats({
        students: students.length,
        teachers: teachers.length,
        portfolioItems: items.length,
        verifiedItems: verified.length,
      });

      // Берем последние 5 работ
      const sortedItems = items
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentItems(sortedItems);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Загрузка дашборда...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Панель администратора</h2>
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <People size={40} className="text-primary mb-2" />
              <Card.Title>{stats.students}</Card.Title>
              <Card.Text className="text-muted">Студентов</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <People size={40} className="text-success mb-2" />
              <Card.Title>{stats.teachers}</Card.Title>
              <Card.Text className="text-muted">Преподавателей</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Folder size={40} className="text-warning mb-2" />
              <Card.Title>{stats.portfolioItems}</Card.Title>
              <Card.Text className="text-muted">Работ в портфолио</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <CheckCircle size={40} className="text-info mb-2" />
              <Card.Title>{stats.verifiedItems}</Card.Title>
              <Card.Text className="text-muted">Проверено работ</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Последние работы</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {recentItems.map((item) => (
                  <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{item.title}</strong>
                      <div className="text-muted small">
                        {item.student?.idName} • {item.workType?.name}
                      </div>
                    </div>
                    <div>
                      {item.isVerified ? (
                        <Badge bg="success">Проверено</Badge>
                      ) : (
                        <Badge bg="warning">Ожидает</Badge>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Быстрые действия</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item action href="/admin/portfolio">
                  Проверить работы
                </ListGroup.Item>
                <ListGroup.Item action href="/admin/students">
                  Управление студентами
                </ListGroup.Item>
                <ListGroup.Item action href="/admin/teachers">
                  Управление преподавателями
                </ListGroup.Item>
                <ListGroup.Item action href="/admin/work-types">
                  Настроить типы работ
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;