// GroupAssignmentManager.jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Form,
  Alert,
  Badge,
  InputGroup,
  FormControl,
  Row,
  Col,
  Card,
  ListGroup,
} from 'react-bootstrap';
import {
  Search,
  Plus,
  X,
  Check,
  Building,
  People,
} from 'react-bootstrap-icons';
import { groupService } from '../../services/groups';

const GroupAssignmentManager = ({ teacher, onClose, onUpdate }) => {
  const [allGroups, setAllGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [currentTeacherGroups, setCurrentTeacherGroups] = useState([]);

  useEffect(() => {
    loadGroups();
  }, [teacher]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Загружаем все группы
      const groupsData = await groupService.getAll();
      setAllGroups(groupsData);
      
      // Загружаем текущие группы преподавателя
      const teacherGroups = await groupService.getByTeacherId(teacher.id);
      setCurrentTeacherGroups(teacherGroups || []);
      
      // Устанавливаем начальный список выбранных групп
      const currentGroupIds = teacherGroups.map(g => g.id);
      setSelectedGroups(currentGroupIds);
      
    } catch (err) {
      console.error('Ошибка загрузки групп:', err);
      setError('Не удалось загрузить группы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Фильтрация групп по поиску
    const filtered = allGroups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.teacher?.idName && group.teacher.idName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredGroups(filtered);
  }, [searchTerm, allGroups]);

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleSaveAssignments = async () => {
    try {
      setError('');
      
      // Определяем группы для добавления и удаления
      const currentGroupIds = currentTeacherGroups.map(g => g.id);
      const groupsToAdd = selectedGroups.filter(id => !currentGroupIds.includes(id));
      const groupsToRemove = currentGroupIds.filter(id => !selectedGroups.includes(id));
      
      // Выполняем операции с группами
      const updatePromises = [];
      
      // Назначаем преподавателя на новые группы
      for (const groupId of groupsToAdd) {
        updatePromises.push(
          groupService.assignTeacher(groupId, teacher.id)
        );
      }
      
      // Удаляем преподавателя из старых групп
      for (const groupId of groupsToRemove) {
        updatePromises.push(
          groupService.removeTeacherFromGroup(groupId)
        );
      }
      
      await Promise.all(updatePromises);
      
      // Обновляем родительские компоненты
      if (onUpdate) {
        onUpdate();
      }
      
      alert('Изменения успешно сохранены!');
      onClose();
      
    } catch (err) {
      console.error('Ошибка сохранения назначений:', err);
      setError('Не удалось сохранить изменения');
    }
  };

  const getGroupStats = () => {
    const assignedGroups = allGroups.filter(g => g.teacher?.id === teacher.id);
    const availableGroups = allGroups.filter(g => !g.teacher || g.teacher.id === teacher.id);
    
    return {
      total: allGroups.length,
      assigned: assignedGroups.length,
      available: availableGroups.length,
      students: assignedGroups.reduce((total, group) => total + (group.students?.length || 0), 0)
    };
  };

  const stats = getGroupStats();

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-3">Загрузка групп...</p>
      </div>
    );
  }

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Статистика */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-primary">{stats.total}</Card.Title>
              <Card.Text>Всего групп</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-success">{stats.assigned}</Card.Title>
              <Card.Text>Назначено</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-info">{stats.available}</Card.Title>
              <Card.Text>Доступно</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-warning">{stats.students}</Card.Title>
              <Card.Text>Студентов</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Поиск */}
      <div className="mb-3">
        <InputGroup>
          <InputGroup.Text>
            <Search />
          </InputGroup.Text>
          <FormControl
            placeholder="Поиск групп по названию или коду..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Form.Text className="text-muted">
          Найдено: {filteredGroups.length} из {allGroups.length} групп
        </Form.Text>
      </div>
      
      {/* Список групп */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="mb-4">
        {filteredGroups.length === 0 ? (
          <Alert variant="info" className="text-center">
            Группы не найдены
          </Alert>
        ) : (
          <ListGroup variant="flush">
            {filteredGroups.map(group => {
              const isSelected = selectedGroups.includes(group.id);
              const isAssigned = group.teacher?.id === teacher.id;
              
              return (
                <ListGroup.Item key={group.id} className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <Form.Check
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleGroupToggle(group.id)}
                        label={
                          <div>
                            <strong>{group.name}</strong>
                            <code className="ms-2">{group.code}</code>
                          </div>
                        }
                      />
                    </div>
                    
                    <div className="d-flex align-items-center text-muted small">
                      <Building className="me-1" size={12} />
                      {group.teacher ? (
                        <span>
                          Преподаватель: <strong>{group.teacher.idName}</strong>
                          {isAssigned && (
                            <Badge bg="success" className="ms-2">Текущий</Badge>
                          )}
                        </span>
                      ) : (
                        <span className="text-success">Свободная группа</span>
                      )}
                      
                      <span className="ms-3">
                        <People className="me-1" size={12} />
                        Студентов: {group.students?.length || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    {isSelected && !isAssigned && (
                      <Badge bg="warning" className="me-2">
                        Будет назначена
                      </Badge>
                    )}
                    {isAssigned && !isSelected && (
                      <Badge bg="danger" className="me-2">
                        Будет удалена
                      </Badge>
                    )}
                    {isAssigned && isSelected && (
                      <Badge bg="success" className="me-2">
                        Назначена
                      </Badge>
                    )}
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </div>
      
      {/* Сводка изменений */}
      {selectedGroups.length !== currentTeacherGroups.length && (
        <Alert variant="info" className="mb-4">
          <strong>Сводка изменений:</strong>
          <div className="mt-2">
            <div>
              <Check className="me-2 text-success" />
              Будет назначено новых групп: {selectedGroups.filter(id => 
                !currentTeacherGroups.map(g => g.id).includes(id)
              ).length}
            </div>
            <div>
              <X className="me-2 text-danger" />
              Будет удалено групп: {currentTeacherGroups.filter(g => 
                !selectedGroups.includes(g.id)
              ).length}
            </div>
          </div>
        </Alert>
      )}
      
      {/* Кнопки */}
      <div className="d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={onClose}>
          Отмена
        </Button>
        
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={() => {
              // Выбрать все свободные группы
              const availableGroups = allGroups.filter(g => !g.teacher || g.teacher.id === teacher.id);
              setSelectedGroups(availableGroups.map(g => g.id));
            }}
          >
            Выбрать все доступные
          </Button>
          
          <Button
            variant="outline-danger"
            onClick={() => {
              // Очистить все выборы
              setSelectedGroups([]);
            }}
          >
            Очистить все
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSaveAssignments}
            disabled={selectedGroups.length === currentTeacherGroups.length && 
              selectedGroups.every(id => 
                currentTeacherGroups.map(g => g.id).includes(id)
              )}
          >
            Сохранить изменения
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupAssignmentManager;