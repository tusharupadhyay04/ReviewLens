import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">Loading ReviewLens…</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}
