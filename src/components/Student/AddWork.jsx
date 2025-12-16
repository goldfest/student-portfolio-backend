import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Badge,
  ListGroup,
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { portfolioItemSchema } from '../../utils/validators';
import { portfolioService } from '../../services/portfolio';
import { workTypeService } from '../../services/workTypes';
import { skillService } from '../../services/skills';
import FileUpload from '../Common/FileUpload';
import {
  ArrowLeft,
  CheckCircle,
  FileEarmarkPlus,
  Lightbulb,
} from 'react-bootstrap-icons';

const AddWork = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [workTypes, setWorkTypes] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formStep, setFormStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(portfolioItemSchema),
    defaultValues: {
      completionDate: new Date().toISOString().split('T')[0],
    },
  });

  const watchTitle = watch('title');
  const watchWorkType = watch('workTypeId');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [typesData, skillsData] = await Promise.all([
        workTypeService.getAll(),
        skillService.getAll()
      ]);
      setWorkTypes(typesData);
      setSkills(skillsData);
    } catch (err) {
      setError('Ошибка загрузки данных');
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

  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const formData = {
        ...data,
        studentId: user.id,
        skillIds: selectedSkills,
        workTypeId: parseInt(data.workTypeId),
      };

      // Загрузка файла если есть
      if (selectedFile) {
        const fileUrl = await portfolioService.uploadFile(selectedFile);
        formData.fileUrl = fileUrl;
      }

      await portfolioService.create(formData);
      
      setSuccess('Работа успешно добавлена в портфолио!');
      
      // Очистка формы
      setTimeout(() => {
        navigate('/student/portfolio');
      }, 2000);

    } catch (err) {
      setError(err.response?.data || 'Ошибка сохранения работы');
    } finally {
      setLoading(false);
    }
  };

  const getWorkTypeDescription = () => {
    const workType = workTypes.find(wt => wt.id === parseInt(watchWorkType));
    return workType?.description || '';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/student/portfolio')}
            className="mb-2"
          >
            <ArrowLeft className="me-2" />
            Назад к портфолио
          </Button>
          <h2 className="mb-0">Добавить новую работу</h2>
        </div>
        <div className="text-muted">
          Шаг {formStep} из 2
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Шаг 1: Основная информация */}
            {formStep === 1 && (
              <div className="fade-in">
                <h4 className="mb-4">
                  <FileEarmarkPlus className="me-2" />
                  Основная информация о работе
                </h4>
                
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Название работы *</Form.Label>
                      <Form.Control
                        {...register('title')}
                        placeholder="Например: Веб-приложение для учета книг"
                        isInvalid={!!errors.title}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.title?.message}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Кратко и понятно опишите суть работы
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Дата завершения</Form.Label>
                      <Form.Control
                        type="date"
                        {...register('completionDate')}
                        isInvalid={!!errors.completionDate}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.completionDate?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Тип работы *</Form.Label>
                  <Form.Select
                    {...register('workTypeId')}
                    isInvalid={!!errors.workTypeId}
                  >
                    <option value="">Выберите тип работы...</option>
                    {workTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.workTypeId?.message}
                  </Form.Control.Feedback>
                  
                  {watchWorkType && getWorkTypeDescription() && (
                    <Form.Text className="text-muted mt-2 d-block">
                      {getWorkTypeDescription()}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Описание работы</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    {...register('description')}
                    placeholder="Опишите вашу работу: цели, задачи, процесс реализации, результаты..."
                    isInvalid={!!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Максимум 1000 символов. Опишите ключевые аспекты работы.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ссылка на проект (если есть)</Form.Label>
                  <Form.Control
                    type="url"
                    {...register('projectUrl')}
                    placeholder="https://github.com/username/project"
                    isInvalid={!!errors.projectUrl}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.projectUrl?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Ссылка на репозиторий GitHub, веб-сайт проекта и т.д.
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/student/portfolio')}
                  >
                    Отмена
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setFormStep(2)}
                    disabled={!watchTitle || !watchWorkType}
                  >
                    Далее: Навыки и файлы →
                  </Button>
                </div>
              </div>
            )}

            {/* Шаг 2: Навыки и файлы */}
            {formStep === 2 && (
              <div className="fade-in">
                <h4 className="mb-4">
                  <Lightbulb className="me-2" />
                  Навыки и дополнительные материалы
                </h4>

                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-4">
                      <Form.Label>Навыки и технологии</Form.Label>
                      <div className="border rounded p-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {skills.length === 0 ? (
                          <div className="text-center text-muted">Загрузка навыков...</div>
                        ) : (
                          skills.map(skill => (
                            <Form.Check
                              key={skill.id}
                              type="checkbox"
                              label={
                                <div className="d-flex justify-content-between align-items-center">
                                  <span>{skill.name}</span>
                                  {skill.category && (
                                    <Badge bg="info" className="ms-2">
                                      {skill.category}
                                    </Badge>
                                  )}
                                </div>
                              }
                              checked={selectedSkills.includes(skill.id)}
                              onChange={() => handleSkillToggle(skill.id)}
                              className="mb-2"
                            />
                          ))
                        )}
                      </div>
                      <Form.Text className="text-muted">
                        Отметьте все навыки и технологии, которые вы использовали в работе
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-4">
                      <Form.Label>Прикрепить файл</Form.Label>
                      <FileUpload onFileSelect={handleFileSelect} accept=".pdf,.zip,.rar,.7z,.doc,.docx" />
                      <Form.Text className="text-muted">
                        Вы можете прикрепить архив с кодом, PDF-документ или презентацию (до 10MB)
                      </Form.Text>
                    </Form.Group>

                    {selectedFile && (
                      <Alert variant="info">
                        <strong>Выбран файл:</strong> {selectedFile.name}
                        <div className="text-muted small">
                          Размер: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </Alert>
                    )}
                  </Col>
                </Row>

                {selectedSkills.length > 0 && (
                  <Alert variant="info" className="mb-4">
                    <strong>Выбранные навыки:</strong>
                    <div className="mt-2">
                      {selectedSkills.map(skillId => {
                        const skill = skills.find(s => s.id === skillId);
                        return skill ? (
                          <Badge key={skill.id} bg="primary" className="me-2 mb-2">
                            {skill.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </Alert>
                )}

                <div className="mb-4">
                  <h5>Советы по заполнению:</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <CheckCircle className="me-2 text-success" />
                      Отметьте все ключевые навыки, использованные в работе
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <CheckCircle className="me-2 text-success" />
                      Прикрепите файлы, демонстрирующие вашу работу
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <CheckCircle className="me-2 text-success" />
                      Укажите ссылку на проект для демонстрации
                    </ListGroup.Item>
                  </ListGroup>
                </div>

                <div className="d-flex justify-content-between">
                  <Button
                    variant="outline-primary"
                    onClick={() => setFormStep(1)}
                  >
                    ← Назад к информации
                  </Button>
                  
                  <div className="d-flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/student/portfolio')}
                    >
                      Отмена
                    </Button>
                    <Button
                      variant="success"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Добавление...' : (
                        <>
                          <FileEarmarkPlus className="me-2" />
                          Добавить работу в портфолио
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* Подсказки */}
      <Card className="mt-4">
        <Card.Body>
          <Card.Title>
            <Lightbulb className="me-2" />
            Как создать хорошее описание работы?
          </Card.Title>
          <ul className="mb-0">
            <li>Опишите цели и задачи проекта</li>
            <li>Перечислите использованные технологии и инструменты</li>
            <li>Расскажите о вашей роли в проекте</li>
            <li>Опишите ключевые результаты и достижения</li>
            <li>Укажите сложности, с которыми столкнулись, и как их преодолели</li>
            <li>Добавьте ссылки на демонстрацию работы</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddWork;