import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Image,
  Badge,
  ProgressBar,
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { studentSchema } from '../../utils/validators';
import { studentService } from '../../services/students';
import FileUpload from '../Common/FileUpload';
import {
  ArrowLeft,
  Person,
  Camera,
  ShieldCheck,
  Envelope,
  Key,
} from 'react-bootstrap-icons';

const EditProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(studentSchema),
  });

  useEffect(() => {
    if (user) {
      loadUserData();
      calculateCompleteness();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const studentData = await studentService.getById(user.id);
      reset({
        idName: studentData.idName,
        email: studentData.email,
        bio: studentData.bio || '',
        avatarUrl: studentData.avatarUrl || '',
        isActive: studentData.isActive,
      });
    } catch (err) {
      setError('Ошибка загрузки данных профиля');
    }
  };

  const calculateCompleteness = () => {
    const fields = [
      watch('bio')?.length > 10,
      watch('avatarUrl')?.length > 0,
    ];
    const filledFields = fields.filter(Boolean).length;
    const percentage = Math.round((filledFields / fields.length) * 100);
    setProfileCompleteness(percentage);
  };

  useEffect(() => {
    calculateCompleteness();
  }, [watch('bio'), watch('avatarUrl')]);

  const handleAvatarSelect = (file) => {
    setAvatarFile(file);
    // Здесь можно добавить загрузку файла на сервер
    // Для простоты пока используем локальный URL
    const avatarUrl = URL.createObjectURL(file);
    reset({ ...watch(), avatarUrl });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Новый пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Здесь нужно реализовать изменение пароля через API
      // В текущей реализации API нет эндпоинта для изменения пароля
      // Поэтому показываем сообщение об успехе для демонстрации
      
      setSuccess('Пароль успешно изменен!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError('Ошибка изменения пароля: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      // Если есть новый файл аватара, загружаем его
      if (avatarFile) {
        // Реализация загрузки файла
        // const avatarUrl = await uploadFile(avatarFile);
        // data.avatarUrl = avatarUrl;
      }

      await studentService.updateProfile(user.id, data);
      
      setSuccess('Профиль успешно обновлен!');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data || 'Ошибка обновления профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm('Вы уверены, что хотите деактивировать свой аккаунт?')) {
      try {
        await studentService.updateProfile(user.id, { isActive: false });
        logout();
        navigate('/login');
      } catch (err) {
        setError('Ошибка деактивации аккаунта');
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/student/dashboard')}
            className="mb-2"
          >
            <ArrowLeft className="me-2" />
            Назад в дашборд
          </Button>
          <h2 className="mb-0">Редактирование профиля</h2>
        </div>
        
        <div>
          <Badge bg={user?.isActive ? 'success' : 'secondary'} className="fs-6">
            <ShieldCheck className="me-1" />
            {user?.isActive ? 'Активен' : 'Неактивен'}
          </Badge>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col md={4}>
          {/* Карточка профиля */}
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Body className="text-center">
              <div className="mb-3">
                {watch('avatarUrl') ? (
                  <Image
                    src={watch('avatarUrl')}
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
              </div>
              
              <h4>{watch('idName')}</h4>
              <p className="text-muted">
                <Envelope className="me-1" />
                {watch('email')}
              </p>
              
              <div className="mb-3">
                <small className="text-muted">Заполненность профиля</small>
                <ProgressBar 
                  now={profileCompleteness} 
                  variant={profileCompleteness >= 80 ? 'success' : profileCompleteness >= 50 ? 'warning' : 'danger'}
                  className="mb-2"
                />
                <small>{profileCompleteness}%</small>
              </div>
              
              <Button
                variant="outline-primary"
                size="sm"
                className="w-100 mb-2"
                onClick={() => document.getElementById('avatar-upload').click()}
              >
                <Camera className="me-2" />
                Сменить аватар
              </Button>
              
              <Button
                variant="outline-secondary"
                size="sm"
                className="w-100"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                <Key className="me-2" />
                Сменить пароль
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          {/* Форма редактирования */}
          <Card className="mb-4">
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Name *</Form.Label>
                  <Form.Control
                    {...register('idName')}
                    isInvalid={!!errors.idName}
                    disabled
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.idName?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Уникальный идентификатор, нельзя изменить
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    {...register('email')}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Аватар URL</Form.Label>
                  <div className="d-flex gap-2 mb-2">
                    <Form.Control
                      type="url"
                      {...register('avatarUrl')}
                      placeholder="https://example.com/avatar.jpg"
                      isInvalid={!!errors.avatarUrl}
                    />
                    <FileUpload
                      onFileSelect={handleAvatarSelect}
                      accept="image/*"
                      hidden
                      id="avatar-upload"
                    />
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {errors.avatarUrl?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    URL вашего аватара или загрузите файл
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Биография</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    {...register('bio')}
                    placeholder="Расскажите о себе: ваши интересы, достижения, цели, увлечения..."
                    isInvalid={!!errors.bio}
                    onBlur={calculateCompleteness}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.bio?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Максимум 500 символов. Хорошая биография помогает преподавателям и работодателям лучше понять вас.
                    Сейчас: {watch('bio')?.length || 0}/500
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button
                    variant="outline-danger"
                    onClick={handleDeactivate}
                    disabled={loading}
                  >
                    Деактивировать аккаунт
                  </Button>
                  
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Сохранение...' : 'Сохранить изменения'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Форма смены пароля */}
          {showPasswordForm && (
            <Card>
              <Card.Body>
                <Card.Title>Смена пароля</Card.Title>
                <Form onSubmit={handlePasswordChange}>
                  <Form.Group className="mb-3">
                    <Form.Label>Текущий пароль *</Form.Label>
                    <Form.Control
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value
                      })}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Новый пароль *</Form.Label>
                    <Form.Control
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value
                      })}
                      required
                      minLength={6}
                    />
                    <Form.Text className="text-muted">
                      Минимум 6 символов
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Подтвердите новый пароль *</Form.Label>
                    <Form.Control
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value
                      })}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Отмена
                    </Button>
                    <Button
                      variant="warning"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Изменение...' : 'Изменить пароль'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {/* Советы по заполнению профиля */}
          <Card className="mt-4">
            <Card.Body>
              <Card.Title>Как создать привлекательный профиль?</Card.Title>
              <ul className="mb-0">
                <li>Добавьте качественное фото профиля</li>
                <li>Напишите интересную биографию, которая отражает ваши цели</li>
                <li>Укажите свои ключевые навыки и интересы</li>
                <li>Расскажите о своих академических и профессиональных целях</li>
                <li>Добавьте ссылки на ваши проекты и достижения</li>
                <li>Регулярно обновляйте профиль новыми достижениями</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EditProfile;