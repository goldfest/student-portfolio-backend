import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Badge,
  Dropdown,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import { Pencil, Trash, Eye, Search, Plus } from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { studentService } from '../../services/students';
import { groupService } from '../../services/groups';

const studentSchema = yup.object({
  idName: yup.string().required('ID Name обязателен'),
  email: yup.string().email('Неверный формат email').required('Email обязателен'),
  password: yup.string().min(6, 'Минимум 6 символов'),
  bio: yup.string(),
  avatarUrl: yup.string().url('Неверный URL'),
  isActive: yup.boolean().default(true),
  groupId: yup.number().nullable(), // или .required(), если группа обязательна
});

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(studentSchema),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, groupsData] = await Promise.all([
        studentService.getAll(),
        groupService.getAll()
      ]);
      setStudents(studentsData);
      setGroups(groupsData);
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStudent(null);
    reset();
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    reset({
      idName: student.idName,
      email: student.email,
      bio: student.bio || '',
      avatarUrl: student.avatarUrl || '',
      isActive: student.isActive,
      groupId: student.group?.id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить студента?')) {
      try {
        await studentService.delete(id);
        await loadData();
      } catch (err) {
        setError('Ошибка удаления студента');
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      setError('');

      if (editingStudent) {
        await studentService.update(editingStudent.id, data);
      } else {
        await studentService.create(data);
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      // Обрабатываем ошибку как строку, а не объект
      let errorMessage = 'Ошибка сохранения';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object' && errorData !== null) {
          // Например: { password: "must not be blank" } → объединяем в строку
          errorMessage = Object.values(errorData).join(' ');
        } else {
          errorMessage = String(errorData);
        }
      }
      setError(errorMessage);
    }
  };

  const filteredStudents = students.filter(student =>
    student.idName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Управление студентами</h2>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="me-2" /> Добавить студента
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <InputGroup className="mb-3">
        <InputGroup.Text>
          <Search />
        </InputGroup.Text>
        <FormControl
          placeholder="Поиск по имени или email..."
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
              <th>ID Name</th>
              <th>Email</th>
              <th>Группа</th>
              <th>Статус</th>
              <th>Работы</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.idName}</td>
                <td>{student.email}</td>
                <td>{student.group?.name || 'Не назначено'}</td>
                <td>
                  <Badge bg={student.isActive ? 'success' : 'secondary'}>
                    {student.isActive ? 'Активен' : 'Неактивен'}
                  </Badge>
                </td>
                <td>{student.portfolioItems?.length || 0}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(student)}
                    className="me-2"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(student.id)}
                  >
                    <Trash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingStudent ? 'Редактировать студента' : 'Добавить студента'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>ID Name *</Form.Label>
              <Form.Control
                {...register('idName')}
                isInvalid={!!errors.idName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.idName?.message}
              </Form.Control.Feedback>
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

            {!editingStudent && (
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
            )}

            <Form.Group className="mb-3">
              <Form.Label>Биография</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register('bio')}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Аватар URL</Form.Label>
              <Form.Control
                type="url"
                {...register('avatarUrl')}
                isInvalid={!!errors.avatarUrl}
              />
              <Form.Control.Feedback type="invalid">
                {errors.avatarUrl?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Активный"
                {...register('isActive')}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Группа</Form.Label>
              <Form.Select {...register('groupId')}>
                <option value="">Не назначено</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
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

export default StudentsManagement;