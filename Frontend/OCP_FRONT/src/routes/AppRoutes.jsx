import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import MainLayout from '../components/Layout/MainLayout';
import LoginForm from '../components/Auth/LoginForm';
import TwoFactorVerification from '../components/Auth/TwoFactorVerification';
import ForgotPassword from '../components/Auth/ForgotPassword';
import Dashboard from '../components/Dashboard/Dashboard';
import Profile from '../components/Profile/UserProfile';
import UserManagement from '../components/Actors/ADMIN/UserManagement';
import InterventionManagement from '../components/Actors/ADMIN/InterventionManagement';
import CreateIntervention from '../components/Actors/USER/CreateIntervention';
import AdminDashboard from '../components/Actors/ADMIN/AdminDashboard';
import RoleBasedRedirect from './RoleBasedRedirect';
import { useAuth } from '../Contexts/AuthContext';
import AssignedInterventions from '../components/Actors/TECHNICIAN/AssignedInterventions';
import TechnicianDashboard from '../components/Actors/TECHNICIAN/TechnicianDashboard';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const handleReturn = () => {
    if (!user) {
      navigate('/login');
    } else {
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'USER':
          navigate('/user/dashboard');
          break;
        case 'TECHNICIAN':
          navigate('/technician/dashboard');
          break;
        default:
          navigate('/login');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Page not found</p>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <button 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={handleReturn}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/verify-2fa" element={<TwoFactorVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected Profile Route - Available to all authenticated users */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
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
              <Route path="interventions" element={<InterventionManagement />} />
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
              <Route path="create-intervention" element={<CreateIntervention />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Technician Routes (if needed) */}
      <Route path="/technician/*" element={
        <ProtectedRoute requiredRole="TECHNICIAN">
          <MainLayout>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="intervention" element={<AssignedInterventions />} />
              {/* Add more technician-specific routes here */}
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Root redirect - uses RoleBasedRedirect component */}
      <Route path="/" element={<RoleBasedRedirect />} />
      
      
      {/* 404 Route - Must be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
