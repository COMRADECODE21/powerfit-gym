import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { logger } from '../utils/logger';
import { ROLES } from '../constants/roles';

const AuthContext = createContext(null);
const USER_STORAGE_KEY = 'powerfit_user';

/**
 * Proveedor de Autenticación de PowerFit GYM.
 * Simula el inicio de sesión consultando la tabla de usuarios en json-server.
 * Si las credenciales coinciden, almacena la sesión en localStorage y registra
 * los eventos en el sistema de auditoría.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  /**
   * Inicia sesión con email y contraseña contra la API dummy.
   */
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);

    try {
      // Búsqueda del usuario por email en json-server
      const response = await api.get('/usuarios', {
        params: { email: email.trim().toLowerCase() },
      });

      const usuarios = response.data;
      const foundUser = usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

      if (!foundUser) {
        const msg = 'El correo electrónico no se encuentra registrado en el sistema.';
        setAuthError(msg);
        logger.warn('AUTH_LOGIN', 'Intento de inicio de sesión con email no registrado', { email });
        return { success: false, message: msg };
      }

      if (foundUser.password !== password) {
        const msg = 'Contraseña incorrecta. Verifique sus credenciales.';
        setAuthError(msg);
        logger.warn('AUTH_LOGIN', 'Contraseña incorrecta', { email });
        return { success: false, message: msg };
      }

      // Sesión exitosa
      const sessionUser = {
        id: foundUser.id,
        nombre: foundUser.nombre,
        email: foundUser.email,
        rol: foundUser.rol,
      };

      setUser(sessionUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));

      logger.info('AUTH_LOGIN', `Sesión iniciada exitosamente por ${sessionUser.nombre} (${sessionUser.rol})`, {
        userId: sessionUser.id,
        rol: sessionUser.rol,
      });

      return { success: true, user: sessionUser };
    } catch (err) {
      const errorMsg = 'Error al conectar con el servidor de autenticación. ¿Está corriendo json-server?';
      setAuthError(errorMsg);
      logger.error('AUTH_LOGIN', 'Fallo de conexión en inicio de sesión', { error: err.message });
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra la sesión activa y limpia localStorage.
   */
  const logout = () => {
    if (user) {
      logger.info('AUTH_LOGOUT', `Cierre de sesión de ${user.nombre}`, { userId: user.id });
    }
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const isAdmin = user?.rol === ROLES.ADMIN;
  const isStaff = user?.rol === ROLES.STAFF;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isStaff,
        loading,
        authError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
