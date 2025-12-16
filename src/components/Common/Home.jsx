import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h1 className="mb-4">Добро пожаловать в систему портфолио студентов!</h1>
      
      {user ? (
        <Card>
          <Card.Body>
            <Card.Title>Вы вошли как: {user.idName}</Card.Title>
            <Card.Text>
              Роль: {user.role}
            </Card.Text>
            <Card.Text>
              Email: {user.email}
            </Card.Text>
            <Button variant="danger" onClick={() => {
              logout();
              navigate('/login');
            }}>
              Выйти
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title>Платформа для создания портфолио студентов</Card.Title>
                <Card.Text className="mb-4">
                  Создавайте, управляйте и делитесь своими академическими и профессиональными достижениями.
                </Card.Text>
                <div className="d-flex justify-content-center gap-3">
                  <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
                    Войти
                  </Button>
                  <Button variant="outline-primary" size="lg" onClick={() => navigate('/register')}>
                    Регистрация
                  </Button>
                </div>
              </Card.Body>
            </Card>
            
            <Row className="mt-4 g-4">
              <Col md={4}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>Для студентов</Card.Title>
                    <Card.Text>
                      Создавайте цифровое портфолио ваших работ, проектов и достижений
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>Для преподавателей</Card.Title>
                    <Card.Text>
                      Просматривайте и оценивайте работы студентов, управляйте группами
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>Для администраторов</Card.Title>
                    <Card.Text>
                      Полный контроль над системой, пользователями и настройками
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Home;