import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (dateString, formatStr = 'dd.MM.yyyy') => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), formatStr, { locale: ru });
  } catch (error) {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  return formatDate(dateString, 'dd.MM.yyyy HH:mm');
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const icons = {
    pdf: 'file-pdf',
    doc: 'file-word',
    docx: 'file-word',
    xls: 'file-excel',
    xlsx: 'file-excel',
    ppt: 'file-powerpoint',
    pptx: 'file-powerpoint',
    jpg: 'file-image',
    jpeg: 'file-image',
    png: 'file-image',
    gif: 'file-image',
    zip: 'file-zip',
    rar: 'file-zip',
    '7z': 'file-zip',
    txt: 'file-text',
    default: 'file'
  };
  return icons[extension] || icons.default;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFile = (file, allowedTypes = '*', maxSize = 10485760) => {
  const errors = [];

  // Проверка размера
  if (file.size > maxSize) {
    errors.push(`Файл слишком большой. Максимальный размер: ${formatFileSize(maxSize)}`);
  }

  // Проверка типа
  if (allowedTypes !== '*') {
    const allowedExtensions = allowedTypes.split(',').map(ext => ext.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`Недопустимый формат файла. Разрешены: ${allowedExtensions.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getRoleBadgeVariant = (role) => {
  switch (role) {
    case 'ADMIN': return 'danger';
    case 'TEACHER': return 'warning';
    case 'STUDENT': return 'info';
    default: return 'secondary';
  }
};

export const getStatusBadgeVariant = (isActive) => {
  return isActive ? 'success' : 'secondary';
};

export const getVerificationBadgeVariant = (isVerified) => {
  return isVerified ? 'success' : 'warning';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};