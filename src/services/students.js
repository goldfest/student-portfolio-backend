import api from './api';

export const studentService = {
  getAll: () => api.get('/students').then(res => res.data),
  
  getById: (id) => api.get(`/students/${id}`).then(res => res.data),
  
  getByEmail: (email) => api.get(`/students/email/${email}`).then(res => res.data),
  
  create: (data) => api.post('/students', data).then(res => res.data),
  
  update: (id, data) => api.put(`/students/${id}`, data).then(res => res.data),
  
  delete: (id) => api.delete(`/students/${id}`),
  
  updateProfile: (id, data) => api.put(`/students/${id}`, data).then(res => res.data),
};