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
} from 'react-bootstrap';
import { 
  Pencil, 
  Trash, 
  Search, 
  Plus, 
  CodeSlash,
  Tag 
} from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { skillSchema } from '../../utils/validators';
import { skillService } from '../../services/skills';
import { useApi } from '../../hooks/useApi';
import { SKILL_CATEGORIES } from '../../utils/constants';

const SkillsManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: skills = [], loading, error, execute: loadSkills } = useApi(skillService.getAll, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(skillSchema),
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const handleCreate = () => {
    setEditingSkill(null);
    reset({
      name: '',
      category: '',
    });
    setShowModal(true);
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    reset({
      name: skill.name,
      category: skill.category || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот навык?')) {
      try {
        await skillService.delete(id);
        await loadSkills();
      } catch (err) {
        console.error('Ошибка удаления навыка:', err);
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingSkill) {
        await skillService.update(editingSkill.id, data);
      } else {
        await skillService.create(data);
      }

      setShowModal(false);
      await loadSkills();
    } catch (err) {
      console.error('Ошибка сохранения навыка:', err);
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (skill.category && skill.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !categoryFilter || skill.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(skills.map(s => s.category).filter(Boolean))];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Управление навыками</h2>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="me-2" /> Добавить навык
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <Search />
            </InputGroup.Text>
            <FormControl
              placeholder="Поиск навыков..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Все категории</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
            <option value="uncategorized">Без категории</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center">Загрузка...</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Используется в работах</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredSkills.map((skill) => (
              <tr key={skill.id}>
                <td>{skill.id}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <CodeSlash className="me-2 text-success" />
                    {skill.name}
                  </div>
                </td>
                <td>
                  {skill.category ? (
                    <Badge bg="info">
                      {skill.category}
                    </Badge>
                  ) : (
                    <span className="text-muted">Без категории</span>
                  )}
                </td>
                <td>
                  <Badge bg="secondary">
                    {skill.portfolioItems?.length || 0}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(skill)}
                    className="me-2"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(skill.id)}
                    disabled={skill.portfolioItems?.length > 0}
                    title={skill.portfolioItems?.length > 0 ? 'Нельзя удалить: используется в работах' : ''}
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
            {editingSkill ? 'Редактировать навык' : 'Добавить навык'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Название *</Form.Label>
              <Form.Control
                {...register('name')}
                placeholder="Например: React, Python, Git"
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Категория</Form.Label>
              <Form.Control
                {...register('category')}
                placeholder="Например: Фреймворки"
                list="categories"
                isInvalid={!!errors.category}
              />
              <datalist id="categories">
                {SKILL_CATEGORIES.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              <Form.Control.Feedback type="invalid">
                {errors.category?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Примеры категорий: {SKILL_CATEGORIES.join(', ')}
              </Form.Text>
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

export default SkillsManagement;