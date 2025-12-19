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
  Card,
  Row,
  Col,
} from 'react-bootstrap';
import { 
  Pencil, 
  Trash, 
  Search, 
  Plus, 
  Folder,
  ListCheck,
  InfoCircle,
  SortAlphaDown,
  SortAlphaUp 
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
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [stats, setStats] = useState({ total: 0, withProjects: 0 });

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

  useEffect(() => {
    if (workTypes.length > 0) {
      const total = workTypes.length;
      const withProjects = workTypes.filter(wt => wt.portfolioItems?.length > 0).length;
      setStats({ total, withProjects });
    }
  }, [workTypes]);

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
    const workType = workTypes.find(wt => wt.id === id);
    if (workType?.portfolioItems?.length > 0) {
      alert('Нельзя удалить тип работы, к которому привязаны проекты!');
      return;
    }

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

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredWorkTypes = workTypes
    .filter(workType =>
      workType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (workType.description && workType.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortBy === 'projects') {
        aValue = a.portfolioItems?.length || 0;
        bValue = b.portfolioItems?.length || 0;
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Управление типами работ</h2>
          <p className="text-muted mb-0">
            Определите категории работ для портфолио студентов
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="me-2" /> Добавить тип работы
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Статистика */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-primary">{stats.total}</Card.Title>
              <Card.Text>Всего типов работ</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-success">{stats.withProjects}</Card.Title>
              <Card.Text>Типов с привязанными работами</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Поиск и сортировка */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <FormControl
                  placeholder="Поиск по названию или описанию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <div className="d-flex gap-2">
                <Button
                  variant={sortBy === 'name' ? 'primary' : 'outline-primary'}
                  onClick={() => toggleSort('name')}
                  className="w-50"
                >
                  {sortBy === 'name' && sortOrder === 'asc' ? (
                    <SortAlphaDown className="me-1" />
                  ) : (
                    <SortAlphaUp className="me-1" />
                  )}
                  По названию
                </Button>
                <Button
                  variant={sortBy === 'projects' ? 'primary' : 'outline-primary'}
                  onClick={() => toggleSort('projects')}
                  className="w-50"
                >
                  {sortBy === 'projects' && sortOrder === 'asc' ? (
                    <SortAlphaDown className="me-1" />
                  ) : (
                    <SortAlphaUp className="me-1" />
                  )}
                  По проектам
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-3">Загрузка типов работ...</p>
        </div>
      ) : (
        <>
          {/* Список типов работ */}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th>
                  <div className="d-flex align-items-center">
                    Название типа
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? 
                        <SortAlphaDown className="ms-1" /> : 
                        <SortAlphaUp className="ms-1" />
                    )}
                  </div>
                </th>
                <th>Описание</th>
                <th>
                  <div className="d-flex align-items-center">
                    Работ в портфолио
                    {sortBy === 'projects' && (
                      sortOrder === 'asc' ? 
                        <SortAlphaDown className="ms-1" /> : 
                        <SortAlphaUp className="ms-1" />
                    )}
                  </div>
                </th>
                <th style={{ width: '120px' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkTypes.map((workType) => (
                <tr key={workType.id}>
                  <td>{workType.id}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <Folder className="me-2 text-primary" />
                      <strong>{workType.name}</strong>
                    </div>
                  </td>
                  <td>
                    {workType.description ? (
                      <div className="d-flex align-items-center">
                        <InfoCircle className="me-2 text-muted" size={14} />
                        <span>{workType.description}</span>
                      </div>
                    ) : (
                      <span className="text-muted">Нет описания</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <Badge 
                        bg={workType.portfolioItems?.length > 0 ? 'success' : 'secondary'}
                        className="me-2"
                      >
                        {workType.portfolioItems?.length || 0}
                      </Badge>
                      {workType.portfolioItems?.length > 0 && (
                        <small className="text-muted">
                          {workType.portfolioItems?.length === 1 ? 'работа' : 
                           workType.portfolioItems?.length < 5 ? 'работы' : 'работ'}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(workType)}
                        title="Редактировать"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(workType.id)}
                        disabled={workType.portfolioItems?.length > 0}
                        title={workType.portfolioItems?.length > 0 ? 
                          'Нельзя удалить: есть связанные работы' : 'Удалить'}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {filteredWorkTypes.length === 0 && (
            <Alert variant="info" className="text-center">
              <Folder className="me-2" />
              Типы работ не найдены
              {searchTerm && (
                <div className="mt-2">
                  По запросу "{searchTerm}" ничего не найдено
                  <Button 
                    variant="link" 
                    onClick={() => setSearchTerm('')}
                    className="ms-2"
                  >
                    Очистить поиск
                  </Button>
                </div>
              )}
            </Alert>
          )}

          {/* Примеры типов работ */}
          <Card className="mt-4">
            <Card.Body>
              <Card.Title className="d-flex align-items-center">
                <ListCheck className="me-2" />
                Примеры типов работ для вдохновения
              </Card.Title>
              <Row>
                {WORK_TYPE_CATEGORIES.map((category, index) => {
                  const hasCategory = workTypes.some(wt => 
                    wt.name.toLowerCase() === category.toLowerCase()
                  );
                  return (
                    <Col key={index} md={6} lg={4} className="mb-2">
                      <div className={`d-flex align-items-center p-2 border rounded ${hasCategory ? 'bg-light' : ''}`}>
                        <Folder className={`me-2 ${hasCategory ? 'text-success' : 'text-muted'}`} />
                        <span className={hasCategory ? 'fw-bold' : ''}>
                          {category}
                        </span>
                        {hasCategory && (
                          <Badge bg="success" className="ms-2 fs-7">
                            Есть в системе
                          </Badge>
                        )}
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Модальное окно */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingWorkType ? 'Редактировать тип работы' : 'Добавить новый тип работы'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Название типа работы *</Form.Label>
              <Form.Control
                {...register('name')}
                placeholder="Например: Курсовая работа, Учебный проект, Сертификат"
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Краткое и понятное название категории работ
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register('description')}
                placeholder="Краткое описание типа работы, требования, особенности..."
                isInvalid={!!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Необязательное поле. Поможет студентам лучше понять, какие работы подходят под этот тип.
              </Form.Text>
            </Form.Group>

            <Alert variant="info" className="mt-4">
              <InfoCircle className="me-2" />
              <strong>Совет:</strong> Создавайте универсальные типы работ, которые подходят для разных дисциплин и направлений.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              {editingWorkType ? 'Сохранить изменения' : 'Создать тип работы'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkTypesManagement;