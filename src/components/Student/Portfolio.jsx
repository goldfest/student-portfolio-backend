import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  Modal,
  Form,
  Alert,
  Dropdown,
} from 'react-bootstrap';
import {
  Plus,
  Pencil,
  Trash,
  Eye,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
} from 'react-bootstrap-icons';
import { portfolioService } from '../../services/portfolio';
import { workTypeService } from '../../services/workTypes';
import { skillService } from '../../services/skills';
import { useAuth } from '../../context/AuthContext';
import FileUpload from '../Common/FileUpload.jsx';

const Portfolio = () => {
  const { user } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [skills, setSkills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [items, types, allSkills] = await Promise.all([
        portfolioService.getByStudentId(user.id),
        workTypeService.getAll(),
        skillService.getAll()
      ]);
      setPortfolioItems(items);
      setWorkTypes(types);
      setSkills(allSkills);
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setSelectedSkills([]);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setSelectedSkills(item.skills?.map(s => s.id) || []);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить эту работу из портфолио?')) {
      try {
        await portfolioService.delete(id);
        await loadData();
      } catch (err) {
        setError('Ошибка удаления');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      projectUrl: formData.get('projectUrl'),
      completionDate: formData.get('completionDate'),
      workTypeId: parseInt(formData.get('workTypeId')),
      studentId: user.id,
      skillIds: selectedSkills,
    };

    try {
      setError('');
      
      // Загрузка файла если есть
      if (selectedFile) {
        const fileUrl = await portfolioService.uploadFile(selectedFile);
        data.fileUrl = fileUrl;
      }

      if (editingItem) {
        await portfolioService.update(editingItem.id, data);
      } else {
        await portfolioService.create(data);
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data || 'Ошибка сохранения');
    }
  };

  const handleSkillToggle = (skillId) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  if (loading) {
    return <div className="text-center">Загрузка портфолио...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Мое портфолио</h2>
        <Button variant="primary" onClick={handleAdd}>
          <Plus className="me-2" /> Добавить работу
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {portfolioItems.map((item) => (
          <Col key={item.id} md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <Badge bg="info" className="mb-2">
                    {item.workType?.name}
                  </Badge>
                  <div>
                    {item.isVerified ? (
                      <CheckCircle color="green" size={20} title="Проверено" />
                    ) : (
                      <XCircle color="orange" size={20} title="Ожидает проверки" />
                    )}
                  </div>
                </div>
                
                <Card.Title>{item.title}</Card.Title>
                <Card.Text className="text-muted small mb-2">
                  <Calendar className="me-1" />
                  {new Date(item.completionDate).toLocaleDateString('ru-RU')}
                </Card.Text>
                <Card.Text>{item.description}</Card.Text>

                <div className="mb-3">
                  {item.skills?.map(skill => (
                    <Badge key={skill.id} bg="secondary" className="me-1">
                      {skill.name}
                    </Badge>
                  ))}
                </div>

                <div className="d-flex gap-2">
                  {item.fileUrl && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      href={`/api${item.fileUrl}`}
                      target="_blank"
                    >
                      <Download className="me-1" /> Файл
                    </Button>
                  )}
                  {item.projectUrl && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      href={item.projectUrl}
                      target="_blank"
                    >
                      <Eye className="me-1" /> Проект
                    </Button>
                  )}
                </div>
              </Card.Body>
              <Card.Footer className="bg-transparent">
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash />
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}

        {portfolioItems.length === 0 && (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <Card.Title>Портфолио пусто</Card.Title>
                <Card.Text className="text-muted">
                  Добавьте свои первые работы, чтобы показать свои навыки!
                </Card.Text>
                <Button variant="primary" onClick={handleAdd}>
                  <Plus className="me-2" /> Добавить первую работу
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Модальное окно добавления/редактирования */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? 'Редактировать работу' : 'Добавить работу в портфолио'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Название работы *</Form.Label>
              <Form.Control
                name="title"
                defaultValue={editingItem?.title}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                defaultValue={editingItem?.description}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Тип работы *</Form.Label>
                  <Form.Select
                    name="workTypeId"
                    value={editingItem?.workType?.id || ''}
                    required
                  >
                    <option value="">Выберите тип...</option>
                    {workTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата завершения</Form.Label>
                  <Form.Control
                    type="date"
                    name="completionDate"
                    defaultValue={editingItem?.completionDate}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>URL проекта</Form.Label>
              <Form.Control
                type="url"
                name="projectUrl"
                placeholder="https://github.com/username/project"
                defaultValue={editingItem?.projectUrl}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Файл работы</Form.Label>
              <FileUpload onFileSelect={handleFileSelect} />
              {editingItem?.fileUrl && (
                <div className="mt-2">
                  <small className="text-muted">
                    Текущий файл:{' '}
                    <a href={`/api${editingItem.fileUrl}`} target="_blank">
                      {editingItem.fileUrl.split('/').pop()}
                    </a>
                  </small>
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Навыки и технологии</Form.Label>
              <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {skills.map(skill => (
                  <Form.Check
                    key={skill.id}
                    type="checkbox"
                    label={skill.name}
                    checked={selectedSkills.includes(skill.id)}
                    onChange={() => handleSkillToggle(skill.id)}
                    className="mb-2"
                  />
                ))}
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              {editingItem ? 'Сохранить изменения' : 'Добавить работу'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Portfolio;