import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import MainLayout from '../components/Layout/MainLayout';
import LoginForm from '../components/Auth/LoginForm';
import TwoFactorVerification from '../components/Auth/TwoFactorVerification';
import ForgotPassword from '../components/Auth/ForgotPassword';
import Dashboard from '../components/Dashboard/Dashboard';
import UserProfile from '../components/User/UserProfile';

// Admin Components (you can create these later)
const AdminDashboard = () => <div className="p-4 bg-white rounded-lg shadow">Admin Dashboard</div>;
const UserManagement = () => <div className="p-4 bg-white rounded-lg shadow">User Management</div>;
const CreateUser = () => <div className="p-4 bg-white rounded-lg shadow">Create User Form</div>;


// 404 Component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-4">Page not found</p>
      <p className="text-gray-500">The page you're looking for doesn't exist.</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/verify-2fa" element={<TwoFactorVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected Dashboard Route */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      {/* Protected Profile Route */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <UserProfile />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="ADMIN">
          <MainLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="create-user" element={<CreateUser />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* User Routes */}
      <Route path="/user/*" element={
        <ProtectedRoute requiredRole="USER">
          <MainLayout>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Default Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;