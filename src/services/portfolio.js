import api from './api';

export const portfolioService = {
  getAll: () => api.get('/portfolio-items').then(res => res.data),
  
  getById: (id) => api.get(`/portfolio-items/${id}`).then(res => res.data),
  
  getByStudentId: (studentId) => 
    api.get(`/portfolio-items/student/${studentId}`).then(res => res.data),
  
  getVerified: () => api.get('/portfolio-items/verified').then(res => res.data),
  
  create: (data) => api.post('/portfolio-items', data).then(res => res.data),
  
  update: (id, data) => api.put(`/portfolio-items/${id}`, data).then(res => res.data),
  
  delete: (id) => api.delete(`/portfolio-items/${id}`),
  
  verify: (id, isVerified) => 
    api.patch(`/portfolio-items/${id}/verify?isVerified=${isVerified}`).then(res => res.data),
  
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  }
};