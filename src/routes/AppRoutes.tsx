import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage.js';
import SignupPage from '../pages/auth/SignupPage.js';
import DashboardPage from '../pages/DashboardPage.js';
import MapPage from '../pages/MapPage.js';
import ProtectedRoute from '../components/auth/ProtectedRoute.js';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/trip/:id" element={<MapPage />} />
      </Route>

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
