import api from './api';

export const groupService = {
  getAll: () => api.get('/groups').then(res => res.data),
  
  getById: (id) => api.get(`/groups/${id}`).then(res => res.data),
  
  getByCode: (code) => api.get(`/groups/code/${code}`).then(res => res.data),

  getByTeacherId: (teacherId) => api.get(`/groups/teacher/${teacherId}`).then(res => res.data),
  
  create: (data) => api.post('/groups', data).then(res => res.data),
  
  update: (id, data) => api.put(`/groups/${id}`, data).then(res => res.data),
  
  delete: (id) => api.delete(`/groups/${id}`),
  
  regenerateCode: (id) => api.patch(`/groups/${id}/regenerate-code`).then(res => res.data),

  assignTeacher: (groupId, teacherId) => {
    return api.put(`/groups/${groupId}/teacher`, { teacherId });
  },

  removeTeacherFromGroup: (groupId) => {
    return api.delete(`/groups/${groupId}/teacher`);
  },

};