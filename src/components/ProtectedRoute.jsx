import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/auth/login' }) => {
  const { usuario, estaAutenticado, cargando } = useAuth();
  const ubicacion = useLocation();
  const { t } = useTranslation();

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading', { defaultValue: 'Cargando...' })}</p>
        </div>
      </div>
    );
  }

  if (!estaAutenticado) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: ubicacion }} 
        replace 
      />
    );
  }

  if (requiredRole) {
    const tieneRol = usuario?.rol === requiredRole || usuario?.role === requiredRole;
    
    if (!tieneRol) {
      if (requiredRole === 'ADMIN') {
        return <Navigate to="/" replace />;
      }
      return <Navigate to="/auth/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;