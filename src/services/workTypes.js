import api from './api';

export const workTypeService = {
  getAll: () => api.get('/work-types').then(res => res.data),
  
  getById: (id) => api.get(`/work-types/${id}`).then(res => res.data),
  
  create: (data) => api.post('/work-types', data).then(res => res.data),
  
  update: (id, data) => api.put(`/work-types/${id}`, data).then(res => res.data),
  
  delete: (id) => api.delete(`/work-types/${id}`)
};