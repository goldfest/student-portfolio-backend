import api from './api';

export const teacherService = {
  getAll: () => api.get('/teachers').then(res => res.data),
  
  getById: (id) => api.get(`/teachers/${id}`).then(res => res.data),
  
  getByEmail: (email) => api.get(`/teachers/email/${email}`).then(res => res.data),
  
  create: (data) => {
    console.log('Creating teacher with data:', data);
    return api.post('/teachers', data)
      .then(res => {
        console.log('Teacher created:', res.data);
        return res.data;
      })
      .catch(err => {
        console.error('Error creating teacher:', err.response?.data);
        throw err;
      });
  },
  
  update: (id, data) => {
    console.log(`Updating teacher ${id} with data:`, data);
    return api.put(`/teachers/${id}`, data)
      .then(res => {
        console.log('Teacher updated:', res.data);
        return res.data;
      })
      .catch(err => {
        console.error('Error updating teacher:', err.response?.data);
        throw err;
      });
  },
  
  delete: (id) => {
    console.log(`Deleting teacher ${id}`);
    return api.delete(`/teachers/${id}`)
      .catch(err => {
        console.error('Error deleting teacher:', err.response?.data);
        throw err;
      });
  },
  
  getGroups: (teacherId) => api.get(`/groups/teacher/${teacherId}`).then(res => res.data)
};