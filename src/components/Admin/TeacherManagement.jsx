import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Badge,
  InputGroup,
  FormControl,
  Row,
  Col,
  Card,
  Dropdown,
  ButtonGroup,
} from 'react-bootstrap';
import {
  Pencil,
  Trash,
  Search,
  Plus,
  Person,
  PersonCheck,
  PersonX,
  Eye,
  Shield,
  Building,
  Envelope,
  Calendar,
  Filter,
  SortAlphaDown,
  SortAlphaUp,
} from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { teacherSchema } from '../../utils/validators';
import { teacherService } from '../../services/teachers';
import { groupService } from '../../services/groups';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getRoleBadgeVariant, getStatusBadgeVariant } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import GroupAssignmentManager from './GroupAssigmentManager';

const TeachersManagement = () => {
  const { isAdmin } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [groups, setGroups] = useState([]);
  const [showGroupManagementModal, setShowGroupManagementModal] = useState(false);
  const [teacherGroups, setTeacherGroups] = useState([]);

  const { data: teachers = [], loading, error, execute: loadTeachers } = useApi(teacherService.getAll, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(teacherSchema),
  });

  useEffect(() => {
    if (isAdmin()) {
      loadTeachers();
      loadGroups();
    }
  }, []);

  const loadGroups = async () => {
    try {
      const groupsData = await groupService.getAll();
      setGroups(groupsData);
    } catch (err) {
      console.error('Ошибка загрузки групп:', err);
    }
  };

  const handleCreate = () => {
    setEditingTeacher(null);
    setPassword('');
    setShowPassword(false);
    reset({
      idName: '',
      email: '',
      bio: '',
      avatarUrl: '',
      role: 'TEACHER',
      isActive: true,
    });
    setShowModal(true);
  };

const handleEdit = async (teacher) => {
  setEditingTeacher(teacher);
  setPassword('');
  setShowPassword(false);
  reset({
    idName: teacher.idName,
    email: teacher.email,
    bio: teacher.bio || '',
    avatarUrl: teacher.avatarUrl || '',
    role: teacher.role,
    isActive: teacher.isActive,
  });
  
  // Временное решение: используем фильтрацию из уже загруженных групп
  const teacherGroups = groups.filter(group => group.teacher?.id === teacher.id);
  setTeacherGroups(teacherGroups);
  
  setShowModal(true);
};

const handleDelete = async (id) => {
  const teacher = teachers.find(t => t.id === id);
  
  // Проверяем группы через API, а не из teacher.groups
  try {
    const teacherGroups = await groupService.getByTeacherId(id);
    
    if (teacherGroups && teacherGroups.length > 0) {
      alert(`Нельзя удалить преподавателя ${teacher?.idName}! У него ${teacherGroups.length} групп(а). Сначала удалите преподавателя из групп.`);
      return;
    }
  } catch (err) {
    console.warn('Не удалось проверить группы преподавателя:', err);
  }
  
  if (window.confirm(`Вы уверены, что хотите удалить преподавателя ${teacher?.idName}?`)) {
    try {
      await teacherService.delete(id);
      await loadTeachers();
      alert('Преподаватель успешно удален');
    } catch (err) {
      console.error('Ошибка удаления преподавателя:', err);
      const errorMessage = err.response?.data?.message || 
                          (err.response?.status === 500 ? 
                           'Не удалось удалить преподавателя. Проверьте, что у него нет назначенных групп.' : 
                           err.message);
      alert(`Ошибка: ${errorMessage}`);
    }
  }
};

const handleToggleStatus = async (teacher) => {
  const newStatus = !teacher.isActive;
  if (window.confirm(`Изменить статус преподавателя ${teacher.idName} на ${newStatus ? 'активный' : 'неактивный'}?`)) {
    try {
      await teacherService.update(teacher.id, { 
        ...teacher, 
        isActive: newStatus 
      });
      await loadTeachers();
    } catch (err) {
      console.error('Ошибка изменения статуса:', err);
      alert(`Ошибка: ${err.response?.data?.message || err.message}`);
    }
  }
};

const onSubmit = async (data) => {
  try {
    const teacherData = { 
      idName: data.idName,
      email: data.email,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      role: data.role,
      isActive: data.isActive
    };
    
    // Если указан новый пароль, добавляем его
    if (password && password.trim() !== '') {
      teacherData.password = password;
    }

    if (editingTeacher) {
      await teacherService.update(editingTeacher.id, teacherData);
    } else {
      // При создании пароль обязателен
      if (!password || password.trim() === '') {
        alert('Пароль обязателен для создания преподавателя');
        return;
      }
      teacherData.password = password;
      await teacherService.create(teacherData);
    }

    setShowModal(false);
    await loadTeachers();
  } catch (err) {
    console.error('Ошибка сохранения преподавателя:', err);
    console.error('Response data:', err.response?.data);
    alert(`Ошибка сохранения: ${err.response?.data?.message || err.message}`);
  }
};

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getTeacherGroups = (teacherId) => {
    return groups.filter(group => group.teacher?.id === teacherId);
  };

  const filteredTeachers = teachers
    .filter(teacher => {
      // Фильтр по поиску
      const matchesSearch = 
        teacher.idName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.bio && teacher.bio.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Фильтр по роли
      const matchesRole = 
        roleFilter === 'all' || teacher.role === roleFilter;
      
      // Фильтр по статусу
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && teacher.isActive) ||
        (statusFilter === 'inactive' && !teacher.isActive);
      
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'name') {
        aValue = a.idName.toLowerCase();
        bValue = b.idName.toLowerCase();
      } else if (sortBy === 'email') {
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
      } else if (sortBy === 'role') {
        aValue = a.role;
        bValue = b.role;
      } else if (sortBy === 'groups') {
        aValue = getTeacherGroups(a.id).length;
        bValue = getTeacherGroups(b.id).length;
      } else {
        aValue = a.id;
        bValue = b.id;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.isActive).length,
    admins: teachers.filter(t => t.role === 'ADMIN').length,
    teachers: teachers.filter(t => t.role === 'TEACHER').length,
    withGroups: teachers.filter(t => t.groups?.length > 0).length,
  };

  if (!isAdmin()) {
    return (
      <Alert variant="danger">
        <h4>Доступ запрещен</h4>
        <p>Эта страница доступна только для администраторов.</p>
        <Button as={Link} to="/" variant="primary">
          На главную
        </Button>
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Управление преподавателями</h2>
          <p className="text-muted mb-0">
            Создание, редактирование и управление учетными записями преподавателей и администраторов
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="me-2" /> Добавить преподавателя
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Статистика */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-primary">{stats.total}</Card.Title>
              <Card.Text>Всего</Card.Text>
              <Person className="text-primary" size={20} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={2}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-success">{stats.active}</Card.Title>
              <Card.Text>Активных</Card.Text>
              <PersonCheck className="text-success" size={20} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={2}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-danger">{stats.admins}</Card.Title>
              <Card.Text>Администраторов</Card.Text>
              <Shield className="text-danger" size={20} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={2}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-warning">{stats.teachers}</Card.Title>
              <Card.Text>Преподавателей</Card.Text>
              <Person className="text-warning" size={20} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={2}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-info">{stats.withGroups}</Card.Title>
              <Card.Text>С группами</Card.Text>
              <Building className="text-info" size={20} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={2}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-secondary">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
              </Card.Title>
              <Card.Text>Активность</Card.Text>
              <div className="small text-muted">
                {stats.active} из {stats.total}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Фильтры и поиск */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <FormControl
                  placeholder="Поиск по имени, email или биографии..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            
            <Col md={3}>
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Все роли</option>
                <option value="ADMIN">Только администраторы</option>
                <option value="TEACHER">Только преподаватели</option>
              </Form.Select>
            </Col>
            
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Все статусы</option>
                <option value="active">Только активные</option>
                <option value="inactive">Только неактивные</option>
              </Form.Select>
            </Col>
          </Row>
          
          {/* Сортировка */}
          <div className="mt-3">
            <small className="text-muted me-3">Сортировка:</small>
            <ButtonGroup size="sm">
              <Button
                variant={sortBy === 'id' ? 'primary' : 'outline-secondary'}
                onClick={() => toggleSort('id')}
              >
                ID {sortBy === 'id' && (sortOrder === 'asc' ? <SortAlphaDown /> : <SortAlphaUp />)}
              </Button>
              <Button
                variant={sortBy === 'name' ? 'primary' : 'outline-secondary'}
                onClick={() => toggleSort('name')}
              >
                Имя {sortBy === 'name' && (sortOrder === 'asc' ? <SortAlphaDown /> : <SortAlphaUp />)}
              </Button>
              <Button
                variant={sortBy === 'email' ? 'primary' : 'outline-secondary'}
                onClick={() => toggleSort('email')}
              >
                Email {sortBy === 'email' && (sortOrder === 'asc' ? <SortAlphaDown /> : <SortAlphaUp />)}
              </Button>
              <Button
                variant={sortBy === 'role' ? 'primary' : 'outline-secondary'}
                onClick={() => toggleSort('role')}
              >
                Роль {sortBy === 'role' && (sortOrder === 'asc' ? <SortAlphaDown /> : <SortAlphaUp />)}
              </Button>
              <Button
                variant={sortBy === 'groups' ? 'primary' : 'outline-secondary'}
                onClick={() => toggleSort('groups')}
              >
                Группы {sortBy === 'groups' && (sortOrder === 'asc' ? <SortAlphaDown /> : <SortAlphaUp />)}
              </Button>
            </ButtonGroup>
          </div>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-3">Загрузка преподавателей...</p>
        </div>
      ) : (
        <>
          {/* Таблица преподавателей */}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th>Преподаватель</th>
                <th>Контакт</th>
                <th>Роль</th>
                <th>Группы</th>
                <th>Статус</th>
                <th>Дата регистрации</th>
                <th style={{ width: '150px' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => {
                const teacherGroups = getTeacherGroups(teacher.id);
                
                return (
                  <tr key={teacher.id}>
                    <td>{teacher.id}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        {teacher.avatarUrl ? (
                          <img 
                            src={teacher.avatarUrl} 
                            alt={teacher.idName}
                            className="avatar me-2"
                            style={{ width: '32px', height: '32px' }}
                          />
                        ) : (
                          <div className="avatar-placeholder me-2">
                            <Person className="text-muted" />
                          </div>
                        )}
                        <div>
                          <div className="fw-bold">{teacher.idName}</div>
                          {teacher.bio && (
                            <small className="text-muted d-block" style={{ maxWidth: '200px' }}>
                              {teacher.bio.length > 50 ? teacher.bio.substring(0, 50) + '...' : teacher.bio}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Envelope className="me-2 text-muted" size={14} />
                        {teacher.email}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getRoleBadgeVariant(teacher.role)} className="fs-7">
                        {teacher.role === 'ADMIN' ? (
                          <>
                            <Shield className="me-1" />
                            Администратор
                          </>
                        ) : (
                          <>
                            <Person className="me-1" />
                            Преподаватель
                          </>
                        )}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '150px' }}>
                        {teacherGroups.slice(0, 3).map(group => (
                          <Badge key={group.id} bg="info" className="fs-7">
                            {group.name}
                          </Badge>
                        ))}
                        {teacherGroups.length > 3 && (
                          <Badge bg="secondary" className="fs-7">
                            +{teacherGroups.length - 3}
                          </Badge>
                        )}
                        {teacherGroups.length === 0 && (
                          <span className="text-muted small">Нет групп</span>
                        )}
                      </div>
                      <div className="text-muted small mt-1">
                        Всего: {teacherGroups.length}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Badge bg={getStatusBadgeVariant(teacher.isActive)}>
                          {teacher.isActive ? (
                            <>
                              <PersonCheck className="me-1" />
                              Активен
                            </>
                          ) : (
                            <>
                              <PersonX className="me-1" />
                              Неактивен
                            </>
                          )}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Calendar className="me-2 text-muted" size={14} />
                        {formatDate(teacher.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(teacher)}
                          title="Редактировать"
                        >
                          <Pencil />
                        </Button>
                        
                        <Button
                          variant={teacher.isActive ? "outline-warning" : "outline-success"}
                          size="sm"
                          onClick={() => handleToggleStatus(teacher)}
                          title={teacher.isActive ? "Деактивировать" : "Активировать"}
                        >
                          {teacher.isActive ? <PersonX /> : <PersonCheck />}
                        </Button>
                        
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(teacher.id)}
                          disabled={teacher.groups?.length > 0 || teacher.role === 'ADMIN'}
                          title={
                            teacher.groups?.length > 0 ? 
                              'Нельзя удалить: есть группы' :
                              teacher.role === 'ADMIN' ?
                              'Нельзя удалить администратора' :
                              'Удалить'
                          }
                        >
                          <Trash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {filteredTeachers.length === 0 && (
            <Alert variant="info" className="text-center">
              <Person className="me-2" />
              Преподаватели не найдены
              {searchTerm && (
                <div className="mt-2">
                  По запросу "{searchTerm}" ничего не найдено
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                      setStatusFilter('all');
                    }}
                    className="ms-2"
                  >
                    Очистить фильтры
                  </Button>
                </div>
              )}
            </Alert>
          )}

          {/* Сводная информация */}
          {filteredTeachers.length > 0 && (
            <Card className="mt-4">
              <Card.Body>
                <Card.Title className="d-flex align-items-center">
                  <Filter className="me-2" />
                  Сводная информация
                </Card.Title>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Распределение по ролям:</small>
                      <div className="d-flex gap-2">
                        <Badge bg="danger" className="p-2">
                          <Shield className="me-1" />
                          Администраторов: {filteredTeachers.filter(t => t.role === 'ADMIN').length}
                        </Badge>
                        <Badge bg="warning" className="p-2">
                          <Person className="me-1" />
                          Преподавателей: {filteredTeachers.filter(t => t.role === 'TEACHER').length}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Статус активности:</small>
                      <div className="d-flex gap-2">
                        <Badge bg="success" className="p-2">
                          <PersonCheck className="me-1" />
                          Активных: {filteredTeachers.filter(t => t.isActive).length}
                        </Badge>
                        <Badge bg="secondary" className="p-2">
                          <PersonX className="me-1" />
                          Неактивных: {filteredTeachers.filter(t => !t.isActive).length}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {/* Модальное окно создания/редактирования */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTeacher ? 'Редактировать преподавателя' : 'Добавить нового преподавателя'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Name *</Form.Label>
                  <Form.Control
                    {...register('idName')}
                    placeholder="Например: ivanov_ii, petrova_ap"
                    isInvalid={!!errors.idName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.idName?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Уникальный идентификатор пользователя
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    {...register('email')}
                    placeholder="example@portfolio.ru"
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                {editingTeacher ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль *'}
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingTeacher}
                  placeholder={editingTeacher ? "Новый пароль..." : "Введите пароль..."}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Скрыть' : 'Показать'}
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                Минимум 6 символов. Рекомендуем использовать буквы, цифры и специальные символы
              </Form.Text>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Роль *</Form.Label>
                  <Form.Select
                    {...register('role')}
                    isInvalid={!!errors.role}
                  >
                    <option value="TEACHER">Преподаватель</option>
                    <option value="ADMIN">Администратор</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.role?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Администраторы имеют полный доступ ко всем функциям системы
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Статус</Form.Label>
                  <div className="mt-2">
                    <Form.Check
                      type="switch"
                      label="Активный аккаунт"
                      {...register('isActive')}
                    />
                  </div>
                  <Form.Text className="text-muted">
                    Неактивные пользователи не могут входить в систему
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Биография</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register('bio')}
                placeholder="Опыт работы, научные интересы, достижения..."
                isInvalid={!!errors.bio}
              />
              <Form.Control.Feedback type="invalid">
                {errors.bio?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Максимум 500 символов. Поможет студентам узнать больше о преподавателе
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
              <Form.Text className="text-muted">
                Ссылка на изображение профиля. Рекомендуемый размер: 200x200 пикселей
              </Form.Text>
            </Form.Group>

        {editingTeacher && (
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Управление группами</h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => {
                    // Открываем модальное окно для выбора групп
                    setShowGroupManagementModal(true);
                  }}
                >
                  <Plus className="me-1" /> Назначить группы
                </Button>
              </div>
              
                {teacherGroups.length > 0 ? (
                  <div className="border rounded p-3 bg-light">
                    <h6 className="mb-3">Назначенные группы:</h6>
                    <div className="row">
                      {teacherGroups.map(group => (
                        <div key={group.id} className="col-md-6 mb-2">
                          <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                            <div>
                              <strong>{group.name}</strong>
                              <div className="text-muted small">{group.code}</div>
                            </div>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={async () => {
                                if (window.confirm(`Удалить преподавателя из группы "${group.name}"?`)) {
                                  try {
                                    // Вызываем метод для удаления преподавателя из группы
                                    await groupService.removeTeacherFromGroup(group.id);
                                    // Обновляем список групп
                                    loadGroups();
                                    // Перезагружаем данные преподавателя
                                    await loadTeachers();
                                    
                                    // Обновляем список групп преподавателя
                                    const updatedGroups = await groupService.getByTeacherId(editingTeacher.id);
                                    setTeacherGroups(updatedGroups || []);
                                    
                                    alert('Преподаватель удален из группы');
                                  } catch (error) {
                                    console.error('Ошибка удаления из группы:', error);
                                    alert('Не удалось удалить преподавателя из группы');
                                  }
                                }
                              }}
                            >
                              <Trash size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-muted small">
                      Всего групп: {teacherGroups.length} | 
                      Студентов: {teacherGroups.reduce((total, group) => total + (group.students?.length || 0), 0)}
                    </div>
                  </div>
                ) : (
                  <Alert variant="info">
                    <Building className="me-2" />
                    Преподавателю не назначены группы
                  </Alert>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              {editingTeacher ? 'Сохранить изменения' : 'Создать преподавателя'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <Modal show={showGroupManagementModal} onHide={() => setShowGroupManagementModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Назначение групп преподавателю</Modal.Title>
          <div className="text-muted ms-3">
            {editingTeacher?.idName}
          </div>
        </Modal.Header>
        <Modal.Body>
          {showGroupManagementModal && editingTeacher && (
            <GroupAssignmentManager 
              teacher={editingTeacher} 
              onClose={() => setShowGroupManagementModal(false)}
              onUpdate={() => {
                loadGroups();
                loadTeachers();
              }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TeachersManagement;