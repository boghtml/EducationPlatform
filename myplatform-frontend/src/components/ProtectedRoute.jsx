import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';


function ProtectedRoute({ element, allowedRoles = [] }) {
  const location = useLocation();
  const isAuthenticated = sessionStorage.getItem('userId') !== null;
  const userRole = sessionStorage.getItem('userRole');

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    if (userRole === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />;
    } else if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return element;
}

export default ProtectedRoute;