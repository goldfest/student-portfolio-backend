import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { registerStudentSchema } from '../../utils/validators';
import { PersonPlus } from 'react-bootstrap-icons';

const Register = () => {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    resolver: yupResolver(registerStudentSchema)
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      
      // Удаляем confirmPassword перед отправкой
      const { confirmPassword, ...studentData } = data;
      
      await registerStudent(studentData);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <Card className="w-100" style={{ maxWidth: '600px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">
            <PersonPlus size={32} className="me-2" />
            Регистрация студента
          </Card.Title>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Name *</Form.Label>
                  <Form.Control
                    {...register('idName')}
                    placeholder="Например: ivanov_i"
                    isInvalid={!!errors.idName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.idName?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Уникальный идентификатор для вашего профиля
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    {...register('email')}
                    placeholder="example@email.com"
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Пароль *</Form.Label>
                  <Form.Control
                    type="password"
                    {...register('password')}
                    isInvalid={!!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Подтвердите пароль *</Form.Label>
                  <Form.Control
                    type="password"
                    {...register('confirmPassword')}
                    isInvalid={!!errors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Биография</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register('bio')}
                placeholder="Расскажите о себе, своих интересах и целях..."
                isInvalid={!!errors.bio}
              />
              <Form.Control.Feedback type="invalid">
                {errors.bio?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Максимум 500 символов
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Аватар URL</Form.Label>
              <Form.Control
                type="url"
                {...register('avatarUrl')}
                placeholder="https://example.com/avatar.jpg"
                isInvalid={!!errors.avatarUrl}
              />
              <Form.Control.Feedback type="invalid">
                {errors.avatarUrl?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid gap-2">
              <Button
                variant="primary"
                type="submit"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
              
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/login')}
              >
                Уже есть аккаунт? Войти
              </Button>
            </div>
          </Form>

          <div className="mt-4">
            <small className="text-muted">
              Регистрируясь, вы соглашаетесь с условиями использования сервиса и политикой конфиденциальности.
              После регистрации вы сможете начать создавать свое портфолио.
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;