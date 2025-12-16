import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user:', error);
          // Если не удалось загрузить пользователя, разлогиниваем
          authService.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return response;
    } catch (err) {
      setError(err.response?.data || 'Ошибка входа');
      throw err;
    }
  };

  const registerStudent = async (studentData) => {
    try {
      setError(null);
      const response = await authService.registerStudent(studentData);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return response;
    } catch (err) {
      setError(err.response?.data || 'Ошибка регистрации');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = () => authService.isAuthenticated();
  const isAdmin = () => user?.role === 'ADMIN';
  const isTeacher = () => user?.role === 'TEACHER';
  const isStudent = () => user?.role === 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        registerStudent,
        logout,
        isAuthenticated,
        isAdmin,
        isTeacher,
        isStudent
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};