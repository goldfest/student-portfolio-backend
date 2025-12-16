import React from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PersonCircle } from 'react-bootstrap-icons';

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🎓 Портфолио Студентов
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated() && (
              <>
                {/* Админ видит ВСЕ */}
                {isAdmin() && (
                  <>
                    <Nav.Link as={Link} to="/admin">Админ панель</Nav.Link>
                    <Nav.Link as={Link} to="/admin/students">Студенты</Nav.Link>
                    <Nav.Link as={Link} to="/admin/teachers">Преподаватели</Nav.Link>
                    <Nav.Link as={Link} to="/admin/portfolio">Портфолио</Nav.Link>
                    <Nav.Link as={Link} to="/admin/work-types">Типы работ</Nav.Link>
                    <Nav.Link as={Link} to="/admin/skills">Навыки</Nav.Link>
                    <Nav.Link as={Link} to="/admin/groups">Группы</Nav.Link>
                  </>
                )}
                
                {/* Преподаватель видит только некоторые разделы */}
                {isTeacher() && !isAdmin() && (
                  <>
                    <Nav.Link as={Link} to="/admin">Панель преподавателя</Nav.Link>
                    <Nav.Link as={Link} to="/admin/students">Мои студенты</Nav.Link>
                    <Nav.Link as={Link} to="/admin/portfolio">Проверка работ</Nav.Link>
                    <Nav.Link as={Link} to="/admin/groups">Мои группы</Nav.Link>
                    <Nav.Link as={Link} to="/admin/work-types">Типы работ</Nav.Link>
                    <Nav.Link as={Link} to="/admin/skills">Навыки</Nav.Link>
                  </>
                )}
                
                {/* Студент видит только свои разделы */}
                {isStudent() && (
                  <>
                    <Nav.Link as={Link} to="/student/dashboard">Мое портфолио</Nav.Link>
                    <Nav.Link as={Link} to="/student/add-work">Добавить работу</Nav.Link>
                    <Nav.Link as={Link} to={`/portfolio/${user?.idName}`}>Публичное view</Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated() ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                  <PersonCircle className="me-2" />
                  {user?.idName}
                  {user?.role && (
                    <span className="ms-2 badge bg-secondary">
                      {user.role === 'ADMIN' ? 'Админ' : 
                       user.role === 'TEACHER' ? 'Преподаватель' : 'Студент'}
                    </span>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={
                    isStudent() ? "/student/edit-profile" : 
                    isTeacher() || isAdmin() ? "/profile" : "/"
                  }>
                    Профиль
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    Выйти
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Button variant="outline-light" as={Link} to="/login" className="me-2">
                  Войти
                </Button>
                <Button variant="light" as={Link} to="/register">
                  Регистрация
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;