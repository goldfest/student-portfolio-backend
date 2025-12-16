import api from './api';
import { jwtDecode } from 'jwt-decode';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  registerStudent: async (studentData) => {
    try {
      const response = await api.post('/auth/register/student', studentData);
      const { token, ...userData } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Можно также вызвать API логаута если нужно
    // return api.post('/auth/logout');
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/user/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      // Если не удалось получить пользователя, очищаем localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  getToken: () => localStorage.getItem('token'),

  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      // Проверяем, не истек ли токен
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Token decode error:', error);
      return false;
    }
  },

  getRole: () => {
    const user = authService.getUser();
    return user?.role || null;
  }
};