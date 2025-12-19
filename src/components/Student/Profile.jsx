import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Image,
  Badge,
  ListGroup,
  Tabs,
  Tab,
  ProgressBar,
  Modal,
} from 'react-bootstrap';
import { 
  Person,
  Camera,
  Envelope,
  Calendar,
  ShieldCheck,
  Building,
  Pencil,
  CheckCircle,
  Key,
  Link45deg,
  FileText,
  Award,
  CodeSlash,
  People,
} from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/students';
import { teacherService } from '../../services/teachers';
import { portfolioService } from '../../services/portfolio';
import { groupService } from '../../services/groups';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { formatDate, getRoleBadgeVariant } from '../../utils/helpers';
import FileUpload from '../Common/FileUpload';

// Схемы валидации
const profileSchema = yup.object({
  bio: yup.string().max(500, 'Максимум 500 символов'),
  avatarUrl: yup.string().url('Некорректный URL'),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Текущий пароль обязателен'),
  newPassword: yup.string()
    .min(6, 'Минимум 6 символов')
    .required('Новый пароль обязателен'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword'), null], 'Пароли должны совпадать')
    .required('Подтвердите пароль'),
});

const ProfilePage = () => {
  const { user, isStudent, isTeacher, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState({
    total: 0,
    verified: 0,
    lastUpdate: null,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Формы
  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, reset: resetProfile } = useForm({
    resolver: yupResolver(profileSchema),
  });
  
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      
      let userData = { ...user };
      let groups = [];
      let stats = { total: 0, verified: 0, lastUpdate: null };

      // Загружаем дополнительные данные в зависимости от роли
      if (isStudent()) {
        try {
          // Пытаемся получить полные данные студента
          const studentData = await studentService.getByEmail(user.email);
          userData = { ...userData, ...studentData };
          
          // Загружаем портфолио студента
          const portfolioItems = await portfolioService.getByStudentId(user.id);
          stats = {
            total: portfolioItems.length,
            verified: portfolioItems.filter(item => item.isVerified).length,
            lastUpdate: portfolioItems.length > 0 
              ? new Date(Math.max(...portfolioItems.map(item => new Date(item.createdAt))))
              : null
          };
        } catch (err) {
          console.warn('Не удалось загрузить данные студента:', err);
        }
      }
      
      if (isTeacher() || isAdmin()) {
        try {
          // Загружаем группы преподавателя
          const teacherGroups = await groupService.getByTeacherId(user.id);
          groups = teacherGroups;
          
          // Для преподавателей и админов загружаем все работы для проверки
          const allWorks = await portfolioService.getAll();
          const pendingWorks = allWorks.filter(work => !work.isVerified);
          stats = {
            total: allWorks.length,
            verified: allWorks.filter(work => work.isVerified).length,
            pending: pendingWorks.length,
            lastUpdate: allWorks.length > 0 
              ? new Date(Math.max(...allWorks.map(item => new Date(item.createdAt))))
              : null
          };
        } catch (err) {
          console.warn('Не удалось загрузить данные преподавателя:', err);
        }
      }

      setProfileData(userData);
      setUserGroups(groups);
      setPortfolioStats(stats);
      
      // Заполняем форму данными профиля
      resetProfile({
        bio: userData.bio || '',
        avatarUrl: userData.avatarUrl || '',
      });

    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      setError('Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (file) => {
    setAvatarFile(file);
    // Предпросмотр аватара
    const reader = new FileReader();
    reader.onload = (e) => {
      // Временно показываем локальный файл
      // В реальном приложении нужно загрузить файл на сервер
      setProfileData(prev => ({
        ...prev,
        avatarUrl: e.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const onProfileSubmit = async (data) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // В реальном приложении здесь будет загрузка аватара на сервер
      let updatedData = { ...data };
      
      if (avatarFile) {
        // TODO: Реализовать загрузку файла
        // const avatarUrl = await uploadFile(avatarFile);
        // updatedData.avatarUrl = avatarUrl;
      }

      // Обновляем профиль в зависимости от роли
      if (isStudent()) {
        await studentService.updateProfile(user.id, updatedData);
      } else if (isTeacher() || isAdmin()) {
        await teacherService.update(user.id, updatedData);
      }

      // Обновляем данные в контексте
      setProfileData(prev => ({ ...prev, ...updatedData }));
      
      setSuccess('Профиль успешно обновлен!');
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
      setError('Ошибка сохранения профиля');
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setSaving(true);
      setError('');
      
      // TODO: Реализовать изменение пароля через API
      // Временная заглушка
      console.log('Смена пароля:', data);
      
      setSuccess('Пароль успешно изменен!');
      resetPassword();
      setShowPasswordModal(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Ошибка изменения пароля');
    } finally {
      setSaving(false);
    }
  };

  const calculateProfileCompleteness = () => {
    if (!profileData) return 0;
    
    const fields = [
      profileData.bio?.length > 10,
      profileData.avatarUrl?.length > 0,
      profileData.group?.id || (isTeacher() && userGroups.length > 0),
    ];
    
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const getPublicProfileLink = () => {
    if (!profileData?.idName) return '';
    return `${window.location.origin}/portfolio/${profileData.idName}`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-3">Загрузка профиля...</p>
      </div>
    );
  }

  const profileCompleteness = calculateProfileCompleteness();
  const publicProfileLink = getPublicProfileLink();

  return (
    <div className="profile-page">
      <Row className="mb-4">
        <Col md={8}>
          <h2>Мой профиль</h2>
          <p className="text-muted">
            Управляйте вашей личной информацией и настройками
          </p>
        </Col>
        <Col md={4} className="text-end">
          <Button 
            variant="outline-primary" 
            onClick={() => navigate(-1)}
          >
            ← Назад
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        {/* Левая колонка - информация о профиле */}
        <Col md={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Body className="text-center">
              {/* Аватар */}
              <div className="mb-3 position-relative">
                {profileData?.avatarUrl ? (
                  <Image
                    src={profileData.avatarUrl}
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
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="position-absolute bottom-0 end-0"
                  onClick={() => document.getElementById('avatar-upload').click()}
                >
                  <Camera />
                </Button>
                <FileUpload
                  onFileSelect={handleAvatarSelect}
                  accept="image/*"
                  hidden
                  id="avatar-upload"
                />
              </div>
              
              {/* Основная информация */}
              <h4 className="mb-1">{profileData?.idName}</h4>
              <p className="text-muted mb-2">
                <Envelope className="me-1" />
                {profileData?.email}
              </p>
              
              <Badge bg={getRoleBadgeVariant(profileData?.role)} className="fs-6 mb-3">
                {profileData?.role === 'ADMIN' ? 'Администратор' : 
                 profileData?.role === 'TEACHER' ? 'Преподаватель' : 'Студент'}
              </Badge>
              
              {/* Статус */}
              <div className="mb-3">
                <Badge bg={profileData?.isActive ? 'success' : 'secondary'}>
                  {profileData?.isActive ? 'Активен' : 'Неактивен'}
                </Badge>
                <div className="text-muted small mt-1">
                  <Calendar className="me-1" />
                  Зарегистрирован: {formatDate(profileData?.createdAt)}
                </div>
              </div>
              
              {/* Заполненность профиля */}
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Заполненность профиля</small>
                <ProgressBar 
                  now={profileCompleteness} 
                  variant={
                    profileCompleteness >= 80 ? 'success' : 
                    profileCompleteness >= 50 ? 'warning' : 'danger'
                  }
                  className="mb-1"
                />
                <small>{profileCompleteness}%</small>
              </div>
              
              {/* Быстрые действия */}
              <div className="d-grid gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => setActiveTab('edit')}
                >
                  <Pencil className="me-2" />
                  Редактировать профиль
                </Button>
                
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <Key className="me-2" />
                  Сменить пароль
                </Button>
                
                {publicProfileLink && (
                  <Button
                    variant="outline-success"
                    href={publicProfileLink}
                    target="_blank"
                  >
                    <Link45deg className="me-2" />
                    Публичный профиль
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Статистика */}
          <Card className="mt-4">
            <Card.Body>
              <Card.Title>Статистика</Card.Title>
              <ListGroup variant="flush">
                {isStudent() && (
                  <>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Работ в портфолио:</span>
                      <Badge bg="primary">{portfolioStats.total}</Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Проверено работ:</span>
                      <Badge bg="success">{portfolioStats.verified}</Badge>
                    </ListGroup.Item>
                    {portfolioStats.lastUpdate && (
                      <ListGroup.Item>
                        <small className="text-muted">
                          Последнее обновление: {formatDate(portfolioStats.lastUpdate)}
                        </small>
                      </ListGroup.Item>
                    )}
                  </>
                )}
                
                {(isTeacher() || isAdmin()) && (
                  <>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Группы:</span>
                      <Badge bg="info">{userGroups.length}</Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Работ на проверке:</span>
                      <Badge bg="warning">{portfolioStats.pending || 0}</Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Всего работ:</span>
                      <Badge bg="primary">{portfolioStats.total}</Badge>
                    </ListGroup.Item>
                  </>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Правая колонка - вкладки */}
        <Col md={8}>
          <Tabs
            activeKey={activeTab}
            onSelect={setActiveTab}
            className="mb-4"
          >
            <Tab eventKey="profile" title="Информация">
              <Card>
                <Card.Body>
                  <Card.Title className="d-flex align-items-center mb-4">
                    <Person className="me-2" />
                    Личная информация
                  </Card.Title>
                  
                  <Row>
                    <Col md={6}>
                      <ListGroup variant="flush" className="mb-4">
                        <ListGroup.Item className="d-flex justify-content-between">
                          <span className="fw-bold">ID Name:</span>
                          <span>{profileData?.idName}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between">
                          <span className="fw-bold">Email:</span>
                          <span>{profileData?.email}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between">
                          <span className="fw-bold">Роль:</span>
                          <Badge bg={getRoleBadgeVariant(profileData?.role)}>
                            {profileData?.role === 'ADMIN' ? 'Администратор' : 
                             profileData?.role === 'TEACHER' ? 'Преподаватель' : 'Студент'}
                          </Badge>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between">
                          <span className="fw-bold">Статус:</span>
                          <Badge bg={profileData?.isActive ? 'success' : 'secondary'}>
                            {profileData?.isActive ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </ListGroup.Item>
                      </ListGroup>
                    </Col>
                    
                    <Col md={6}>
                      <ListGroup variant="flush" className="mb-4">
                        {isStudent() && profileData?.group && (
                          <ListGroup.Item className="d-flex justify-content-between">
                            <span className="fw-bold">Группа:</span>
                            <Badge bg="info">
                              {profileData.group.name}
                              <small className="ms-1">({profileData.group.code})</small>
                            </Badge>
                          </ListGroup.Item>
                        )}
                        
                        {(isTeacher() || isAdmin()) && userGroups.length > 0 && (
                          <ListGroup.Item>
                            <span className="fw-bold d-block mb-2">Мои группы:</span>
                            <div className="d-flex flex-wrap gap-2">
                              {userGroups.map(group => (
                                <Badge key={group.id} bg="info">
                                  {group.name}
                                </Badge>
                              ))}
                            </div>
                          </ListGroup.Item>
                        )}
                        
                        <ListGroup.Item className="d-flex justify-content-between">
                          <span className="fw-bold">Дата регистрации:</span>
                          <span>{formatDate(profileData?.createdAt)}</span>
                        </ListGroup.Item>
                      </ListGroup>
                    </Col>
                  </Row>
                  
                  {/* Биография */}
                  <div className="mt-4">
                    <h5 className="d-flex align-items-center mb-3">
                      <FileText className="me-2" />
                      Биография
                    </h5>
                    <div className="p-3 bg-light rounded">
                      {profileData?.bio ? (
                        <p className="mb-0">{profileData.bio}</p>
                      ) : (
                        <p className="text-muted mb-0">
                          Биография не заполнена. Расскажите о себе, своих интересах и достижениях.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Публичная ссылка */}
                  {publicProfileLink && (
                    <div className="mt-4">
                      <h5 className="d-flex align-items-center mb-3">
                        <Link45deg className="me-2" />
                        Публичная ссылка на профиль
                      </h5>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          value={publicProfileLink}
                          readOnly
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => navigator.clipboard.writeText(publicProfileLink)}
                        >
                          Копировать
                        </Button>
                      </div>
                      <small className="text-muted">
                        Поделитесь этой ссылкой с преподавателями или работодателями
                      </small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="edit" title="Редактирование">
              <Card>
                <Card.Body>
                  <Card.Title className="d-flex align-items-center mb-4">
                    <Pencil className="me-2" />
                    Редактирование профиля
                  </Card.Title>
                  
                  <Form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                    {/* Аватар */}
                    <Form.Group className="mb-4">
                      <Form.Label>Аватар профиля</Form.Label>
                      <div className="d-flex align-items-center gap-3">
                        {profileData?.avatarUrl && (
                          <Image
                            src={profileData.avatarUrl}
                            roundedCircle
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          />
                        )}
                        <div className="flex-grow-1">
                          <Form.Control
                            type="url"
                            {...registerProfile('avatarUrl')}
                            placeholder="URL вашего аватара"
                            isInvalid={!!profileErrors.avatarUrl}
                          />
                          <Form.Control.Feedback type="invalid">
                            {profileErrors.avatarUrl?.message}
                          </Form.Control.Feedback>
                          <div className="mt-2">
                            <FileUpload
                              onFileSelect={handleAvatarSelect}
                              accept="image/*"
                              buttonText="Загрузить с компьютера"
                            />
                          </div>
                        </div>
                      </div>
                    </Form.Group>

                    {/* Биография */}
                    <Form.Group className="mb-4">
                      <Form.Label>Биография</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        {...registerProfile('bio')}
                        placeholder="Расскажите о себе: ваши интересы, достижения, цели, увлечения..."
                        isInvalid={!!profileErrors.bio}
                      />
                      <Form.Control.Feedback type="invalid">
                        {profileErrors.bio?.message}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Максимум 500 символов. Хорошая биография помогает преподавателям и работодателям лучше понять вас.
                        Сейчас: {profileData?.bio?.length || 0}/500
                      </Form.Text>
                    </Form.Group>

                    {/* Информация о группе (только для студентов) */}
                    {isStudent() && profileData?.group && (
                      <Form.Group className="mb-4">
                        <Form.Label>Группа</Form.Label>
                        <Form.Control
                          type="text"
                          value={`${profileData.group.name} (${profileData.group.code})`}
                          disabled
                          readOnly
                        />
                        <Form.Text className="text-muted">
                          Для изменения группы обратитесь к администратору или преподавателю
                        </Form.Text>
                      </Form.Group>
                    )}

                    <div className="d-flex justify-content-between">
                      <Button
                        variant="outline-secondary"
                        onClick={() => setActiveTab('profile')}
                      >
                        Отмена
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={saving}
                      >
                        {saving ? 'Сохранение...' : 'Сохранить изменения'}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>
            
            {/* Дополнительные вкладки для разных ролей */}
            {isStudent() && (
              <Tab eventKey="portfolio" title="Портфолио">
                <Card>
                  <Card.Body>
                    <Card.Title className="d-flex align-items-center mb-4">
                      <FolderOpen className="me-2" />
                      Мое портфолио
                    </Card.Title>
                    
                    <Row className="mb-4">
                      <Col md={4}>
                        <Card className="text-center">
                          <Card.Body>
                            <Card.Title className="text-primary">{portfolioStats.total}</Card.Title>
                            <Card.Text>Всего работ</Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="text-center">
                          <Card.Body>
                            <Card.Title className="text-success">{portfolioStats.verified}</Card.Title>
                            <Card.Text>Проверено</Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="text-center">
                          <Card.Body>
                            <Card.Title className="text-warning">{portfolioStats.total - portfolioStats.verified}</Card.Title>
                            <Card.Text>Ожидает проверки</Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    
                    <div className="d-grid gap-2">
                      <Button
                        variant="primary"
                        onClick={() => navigate('/student/portfolio')}
                      >
                        Перейти к моему портфолио
                      </Button>
                      <Button
                        variant="outline-primary"
                        onClick={() => navigate('/student/add-work')}
                      >
                        Добавить новую работу
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Tab>
            )}
            
            {(isTeacher() || isAdmin()) && (
              <Tab eventKey="groups" title="Группы">
                <Card>
                  <Card.Body>
                    <Card.Title className="d-flex align-items-center mb-4">
                      <People className="me-2" />
                      Мои группы
                    </Card.Title>
                    
                    {userGroups.length === 0 ? (
                      <Alert variant="info">
                        У вас пока нет групп. Создайте первую группу в панели управления.
                      </Alert>
                    ) : (
                      <Row>
                        {userGroups.map(group => (
                          <Col key={group.id} md={6} className="mb-3">
                            <Card className="h-100">
                              <Card.Body>
                                <Card.Title className="d-flex justify-content-between align-items-center">
                                  {group.name}
                                  <Badge bg="info">{group.students?.length || 0} студентов</Badge>
                                </Card.Title>
                                <Card.Text className="text-muted small mb-2">
                                  Код группы: <code>{group.code}</code>
                                </Card.Text>
                                <div className="mt-3">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => navigate(`/admin/groups?groupId=${group.id}`)}
                                    className="w-100"
                                  >
                                    Управление группой
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                    
                    <div className="mt-3">
                      <Button
                        variant="primary"
                        onClick={() => navigate('/admin/groups')}
                      >
                        Управление всеми группами
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Tab>
            )}
          </Tabs>
        </Col>
      </Row>

      {/* Модальное окно смены пароля */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Смена пароля</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
          <Modal.Body>
            <Alert variant="info" className="mb-3">
              <ShieldCheck className="me-2" />
              Для безопасности рекомендуем использовать сложный пароль из 8+ символов
            </Alert>
            
            <Form.Group className="mb-3">
              <Form.Label>Текущий пароль *</Form.Label>
              <Form.Control
                type="password"
                {...registerPassword('currentPassword')}
                isInvalid={!!passwordErrors.currentPassword}
              />
              <Form.Control.Feedback type="invalid">
                {passwordErrors.currentPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Новый пароль *</Form.Label>
              <Form.Control
                type="password"
                {...registerPassword('newPassword')}
                isInvalid={!!passwordErrors.newPassword}
              />
              <Form.Control.Feedback type="invalid">
                {passwordErrors.newPassword?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Минимум 6 символов. Рекомендуем использовать буквы, цифры и специальные символы
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Подтвердите новый пароль *</Form.Label>
              <Form.Control
                type="password"
                {...registerPassword('confirmPassword')}
                isInvalid={!!passwordErrors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {passwordErrors.confirmPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Отмена
            </Button>
            <Button variant="warning" type="submit" disabled={saving}>
              {saving ? 'Изменение...' : 'Изменить пароль'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;