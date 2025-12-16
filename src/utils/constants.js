export const API_BASE_URL = '/api';

export const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT'
};

export const WORK_TYPE_CATEGORIES = [
  'Учебный проект',
  'Курсовая работа',
  'Дипломная работа',
  'Личный проект',
  'Статья',
  'Исследование',
  'Сертификат',
  'Хакатон',
  'Олимпиада',
  'Другое'
];

export const SKILL_CATEGORIES = [
  'Языки программирования',
  'Фреймворки',
  'Базы данных',
  'Инструменты',
  'Дизайн',
  'Тестирование',
  'DevOps',
  'Другое'
];

export const FILE_TYPES = {
  IMAGE: 'image/*',
  PDF: '.pdf',
  ZIP: '.zip,.rar,.7z',
  ALL: '*'
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  PASSWORD_MIN: 6,
  NAME_MIN: 2,
  NAME_MAX: 50,
  BIO_MAX: 500
};