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
  ListGroup,
} from 'react-bootstrap';
import { 
  Pencil, 
  Trash, 
  Search, 
  Plus, 
  People,
  Person,
  Clipboard,
  ClipboardCheck,
  ArrowRepeat
} from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { groupSchema } from '../../utils/validators';
import { groupService } from '../../services/groups';
import { teacherService } from '../../services/teachers';
import { useApi } from '../../hooks/useApi';
import { formatDate } from '../../utils/helpers';

const GroupsManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStudents, setShowStudents] = useState(null);
  const [teachers, setTeachers] = useState([]);

  const { data: groups = [], loading, error, execute: loadGroups } = useApi(groupService.getAll, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(groupSchema),
  });

  useEffect(() => {
    loadGroups();
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getAll();
      setTeachers(data);
    } catch (err) {
      console.error('Ошибка загрузки преподавателей:', err);
    }
  };

  const handleCreate = () => {
    setEditingGroup(null);
    reset({
      name: '',
      teacherId: '',
    });
    setShowModal(true);
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    reset({
      name: group.name,
      teacherId: group.teacher?.id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту группу?')) {
      try {
        await groupService.delete(id);
        await loadGroups();
      } catch (err) {
        console.error('Ошибка удаления группы:', err);
      }
    }
  };

  const handleRegenerateCode = async (id) => {
    if (window.confirm('Сгенерировать новый код для группы?')) {
      try {
        await groupService.regenerateCode(id);
        await loadGroups();
      } catch (err) {
        console.error('Ошибка генерации кода:', err);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const onSubmit = async (data) => {
    try {
      if (editingGroup) {
        await groupService.update(editingGroup.id, data);
      } else {
        await groupService.create(data);
      }

      setShowModal(false);
      await loadGroups();
    } catch (err) {
      console.error('Ошибка сохранения группы:', err);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.teacher?.idName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Управление группами</h2>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="me-2" /> Создать группу
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <InputGroup className="mb-3">
        <InputGroup.Text>
          <Search />
        </InputGroup.Text>
        <FormControl
          placeholder="Поиск групп по названию, коду или преподавателю..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {loading ? (
        <div className="text-center">Загрузка...</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название группы</th>
              <th>Код группы</th>
              <th>Преподаватель</th>
              <th>Студентов</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((group) => (
              <React.Fragment key={group.id}>
                <tr>
                  <td>{group.id}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <People className="me-2 text-primary" />
                      {group.name}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <code>{group.code}</code>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => copyToClipboard(group.code)}
                        title="Скопировать код"
                      >
                        <Clipboard className="ms-2" />
                      </Button>
                    </div>
                  </td>
                  <td>
                    {group.teacher ? (
                      <div className="d-flex align-items-center">
                        <Person className="me-2 text-success" />
                        {group.teacher.idName}
                      </div>
                    ) : (
                      <span className="text-muted">Не назначен</span>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => setShowStudents(showStudents === group.id ? null : group.id)}
                    >
                      <People className="me-1" />
                      {group.students?.length || 0}
                    </Button>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(group)}
                        title="Редактировать"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleRegenerateCode(group.id)}
                        title="Сгенерировать новый код"
                      >
                        <ArrowRepeat />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(group.id)}
                        disabled={group.students?.length > 0}
                        title={group.students?.length > 0 ? 'Нельзя удалить: есть студенты' : ''}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </td>
                </tr>
                
                {showStudents === group.id && group.students && group.students.length > 0 && (
                  <tr>
                    <td colSpan="6" className="p-0">
                      <div className="p-3 bg-light">
                        <h6>Студенты в группе:</h6>
                        <ListGroup>
                          {group.students.map(student => (
                            <ListGroup.Item key={student.id} className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{student.idName}</strong>
                                <div className="text-muted small">{student.email}</div>
                              </div>
                              <Badge bg={student.isActive ? 'success' : 'secondary'}>
                                {student.isActive ? 'Активен' : 'Неактивен'}
                              </Badge>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      )}

      {/* Модальное окно */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingGroup ? 'Редактировать группу' : 'Создать группу'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Название группы *</Form.Label>
              <Form.Control
                {...register('name')}
                placeholder="Например: ПИ-201, ИВТ-302"
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
            </Form.Group>
            {editingGroup && (
              <input
                type="hidden"
                {...register('teacherId')}
                value={editingGroup.teacher?.id || ''}
              />
            )}
            {editingGroup && (
              <Form.Group className="mb-3">
                <Form.Label>Код группы</Form.Label>
                <div className="d-flex align-items-center">
                  <code className="me-3">{editingGroup.code}</code>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => copyToClipboard(editingGroup.code)}
                  >
                    <ClipboardCheck className="me-1" />
                    Скопировать
                  </Button>
                </div>
                <Form.Text className="text-muted">
                  Студенты используют этот код для вступления в группу
                </Form.Text>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Сохранить
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupsManagement;