import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { HeartFill, Github, Envelope, CodeSlash } from 'react-bootstrap-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white mt-5 py-4">
      <Container>
        <Row className="align-items-center">
          <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
            <h5 className="mb-2">🎓 Портфолио Студентов</h5>
            <p className="mb-0 text-muted">
              Платформа для создания и управления электронными портфолио
            </p>
          </Col>
          
          <Col md={4} className="text-center mb-3 mb-md-0">
            <div className="d-flex justify-content-center gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white">
                <Github size={24} />
              </a>
              <a href="mailto:support@portfolio.edu" className="text-white">
                <Envelope size={24} />
              </a>
              <a href="#" className="text-white">
                <CodeSlash size={24} />
              </a>
            </div>
          </Col>
          
          <Col md={4} className="text-center text-md-end">
            <p className="mb-0">
              <small className="text-muted">
                © {currentYear} Сделано с <HeartFill color="#e74a3b" size={12} /> для студентов
              </small>
            </p>
            <p className="mb-0">
              <small className="text-muted">
                v1.0.0 • Spring Boot + React
              </small>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;