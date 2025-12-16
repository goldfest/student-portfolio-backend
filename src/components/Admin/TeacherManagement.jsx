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
} from 'react-bootstrap';
import { 
  Pencil, 
  Trash, 
  Search, 
  Plus, 
  Folder,
  ListCheck 
} from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { workTypeSchema } from '../../utils/validators';
import { workTypeService } from '../../services/workTypes';
import { useApi } from '../../hooks/useApi';
import { WORK_TYPE_CATEGORIES } from '../../utils/constants';

const WorkTypesManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingWorkType, setEditingWorkType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: workTypes = [], loading, error, execute: loadWorkTypes } = useApi(workTypeService.getAll, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(workTypeSchema),
  });

  useEffect(() => {
    loadWorkTypes();
  }, []);

  const handleCreate = () => {
    setEditingWorkType(null);
    reset({
      name: '',
      description: '',
    });
    setShowModal(true);
  };

  const handleEdit = (workType) => {
    setEditingWorkType(workType);
    reset({
      name: workType.name,
      description: workType.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тип работы?')) {
      try {
        await workTypeService.delete(id);
        await loadWorkTypes();
      } catch (err) {
        console.error('Ошибка удаления типа работы:', err);
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingWorkType) {
        await workTypeService.update(editingWorkType.id, data);
      } else {
        await workTypeService.create(data);
      }

      setShowModal(false);
      await loadWorkTypes();
    } catch (err) {
      console.error('Ошибка сохранения типа работы:', err);
    }
  };

  const filteredWorkTypes = workTypes.filter(workType =>
    workType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workType.description && workType.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Управление типами работ</h2>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="me-2" /> Добавить тип работы
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <InputGroup className="mb-3">
        <InputGroup.Text>
          <Search />
        </InputGroup.Text>
        <FormControl
          placeholder="Поиск типов работ..."
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
              <th>Название</th>
              <th>Описание</th>
              <th>Работ в портфолио</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkTypes.map((workType) => (
              <tr key={workType.id}>
                <td>{workType.id}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <Folder className="me-2 text-primary" />
                    {workType.name}
                  </div>
                </td>
                <td>{workType.description || <span className="text-muted">Нет описания</span>}</td>
                <td>
                  <Badge bg="info">
                    {workType.portfolioItems?.length || 0}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(workType)}
                    className="me-2"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(workType.id)}
                    disabled={workType.portfolioItems?.length > 0}
                    title={workType.portfolioItems?.length > 0 ? 'Нельзя удалить: есть связанные работы' : ''}
                  >
                    <Trash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Модальное окно */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingWorkType ? 'Редактировать тип работы' : 'Добавить тип работы'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Название *</Form.Label>
              <Form.Control
                {...register('name')}
                placeholder="Например: Курсовая работа"
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register('description')}
                placeholder="Краткое описание типа работы..."
                isInvalid={!!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="mb-3">
              <small className="text-muted">
                <ListCheck className="me-1" />
                Примеры типов работ: {WORK_TYPE_CATEGORIES.join(', ')}
              </small>
            </div>
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

export default WorkTypesManagement;