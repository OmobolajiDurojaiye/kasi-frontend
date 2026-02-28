import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin RBAC Check
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user.is_admin) {
        return <Navigate to="/" replace />; // Non-admins kicked to dashboard
    }
    const userRole = user.admin_role || 'Super Admin'; // Fallback for early users
    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/admin" replace />; // Admins kicked back to admin dashboard
    }
  }

  return children;
};

export default ProtectedRoute;
