import api from './api';

export const teacherService = {
  getAll: () => api.get('/teachers').then(res => res.data),
  
  getById: (id) => api.get(`/teachers/${id}`).then(res => res.data),
  
  getByEmail: (email) => api.get(`/teachers/email/${email}`).then(res => res.data),
  
  create: (data) => api.post('/teachers', data).then(res => res.data),
  
  update: (id, data) => api.put(`/teachers/${id}`, data).then(res => res.data),
  
  delete: (id) => api.delete(`/teachers/${id}`),
  
  getGroups: (teacherId) => api.get(`/groups/teacher/${teacherId}`).then(res => res.data)
};