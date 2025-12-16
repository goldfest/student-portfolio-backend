import api from './api';

export const skillService = {
  getAll: () => api.get('/skills').then(res => res.data),
  
  getById: (id) => api.get(`/skills/${id}`).then(res => res.data),
  
  getByCategory: (category) => api.get(`/skills/category/${category}`).then(res => res.data),
  
  create: (data) => api.post('/skills', data).then(res => res.data),
  
  update: (id, data) => api.put(`/skills/${id}`, data).then(res => res.data),
  
  delete: (id) => api.delete(`/skills/${id}`)
};