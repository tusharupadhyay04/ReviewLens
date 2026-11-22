import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage       from './pages/AuthPage.jsx';
import Dashboard      from './pages/Dashboard.jsx';
import ProductDetail  from './pages/ProductDetail.jsx';
import ProductsPage   from './pages/ProductsPage.jsx';
import AppLayout      from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      {/* Protected – wrapped in sidebar layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/products" element={
        <ProtectedRoute>
          <AppLayout><ProductsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/product/:productName" element={
        <ProtectedRoute>
          <AppLayout><ProductDetail /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
