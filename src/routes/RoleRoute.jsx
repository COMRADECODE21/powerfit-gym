import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

/**
 * Componente de Control de Acceso Basado en Roles (RBAC).
 * Valida si el rol del usuario autenticado se encuentra dentro de los roles permitidos.
 * Si no cuenta con autorización, registra una advertencia en los logs y redirige a la página 403.
 */
export default function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.rol)) {
    logger.warn('RBAC_FORBIDDEN', 'Acceso denegado por rol insuficiente', {
      usuario: user?.nombre,
      rolUsuario: user?.rol,
      rolesRequeridos: allowedRoles,
    });
    return <Navigate to="/403" replace />;
  }

  return children;
}
