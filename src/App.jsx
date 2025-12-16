import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Common/Layout';
import Login from './components/Common/Login';
import Register from './components/Common/Register';

// Admin components
import AdminDashboard from './components/Admin/Dashboard';
import StudentsManagement from './components/Admin/StudentsManagement';
import TeacherManagement from './components/Admin/TeacherManagement';
//import WorkTypesManagement from './components/Admin/WorkTypesManagement';
import SkillsManagement from './components/Admin/SkillsManagement';
import GroupsManagement from './components/Admin/GroupsManagement';
import PortfolioReview from './components/Admin/PortfolioReview';

// Student components
import StudentDashboard from './components/Student/Dashboard';
import StudentPortfolio from './components/Student/Portfolio';
import AddWork from './components/Student/AddWork';
import EditProfile from './components/Student/EditProfile';
//import PublicPortfolioView from './components/Public/PortfolioView';

// Common components
import Home from './components/Common/Home';

const PrivateRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  if (roles.length > 0 && user?.role && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    {/* <Route path="/portfolio/:studentId" element={<PublicPortfolioView />} /> */}
      
      {/* Protected routes with layout */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout><Home /></Layout>
        </PrivateRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <PrivateRoute roles={['ADMIN']}>
          <Layout><AdminDashboard /></Layout>
        </PrivateRoute>
      } />
      
      <Route path="/admin/students" element={
        <PrivateRoute roles={['ADMIN', 'TEACHER']}>
          <Layout><StudentsManagement /></Layout>
        </PrivateRoute>
      } />
      
      <Route path="/admin/teachers" element={
        <PrivateRoute roles={['ADMIN']}>
          <Layout><TeacherManagement /></Layout>
        </PrivateRoute>
      } />
      {/* 
      <Route path="/admin/work-types" element={
        <PrivateRoute roles={['ADMIN', 'TEACHER']}>
          <Layout><WorkTypesManagement /></Layout>
        </PrivateRoute>
      } />
      */}
      <Route path="/admin/skills" element={
        <PrivateRoute roles={['ADMIN', 'TEACHER']}>
          <Layout><SkillsManagement /></Layout>
        </PrivateRoute>
      } />
      
      <Route path="/admin/groups" element={
        <PrivateRoute roles={['ADMIN', 'TEACHER']}>
          <Layout><GroupsManagement /></Layout>
        </PrivateRoute>
      } />
      
      <Route path="/admin/portfolio" element={
        <PrivateRoute roles={['ADMIN', 'TEACHER']}>
          <Layout><PortfolioReview /></Layout>
        </PrivateRoute>
      } />
      
      {/* Student routes */}
      <Route path="/student/dashboard" element={
        <PrivateRoute roles={['STUDENT']}>
          <Layout><StudentDashboard /></Layout>
        </PrivateRoute>
      } />
      
      <Route path="/student/portfolio" element={
        <PrivateRoute roles={['STUDENT']}>
          <Layout><StudentPortfolio /></Layout>
        </PrivateRoute>
      } />
      
      <Route path="/student/add-work" element={
        <PrivateRoute roles={['STUDENT']}>
          <Layout><AddWork /></Layout>
        </PrivateRoute>
      } />
      
      <Route path="/student/edit-profile" element={
        <PrivateRoute roles={['STUDENT']}>
          <Layout><EditProfile /></Layout>
        </PrivateRoute>
      } />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;