import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import MainLayout from '../components/layout/MainLayout';
import { ROLES } from '../constants/roles';

import Login from '../pages/auth/Login';
import Unauthorized403 from '../pages/unauthorized/Unauthorized403';
import NotFound404 from '../pages/notfound/NotFound404';

import Dashboard from '../pages/dashboard/Dashboard';
import SociosPage from '../pages/socios/SociosPage';
import CategoriasPage from '../pages/categorias/CategoriasPage';
import ProductosPage from '../pages/productos/ProductosPage';
import UsuariosPage from '../pages/usuarios/UsuariosPage';
import MembresiasPage from '../pages/membresias/MembresiasPage';
import NuevaMembresiaPage from '../pages/membresias/NuevaMembresiaPage';
import AsistenciasPage from '../pages/asistencias/AsistenciasPage';
import NuevaAsistenciaPage from '../pages/asistencias/NuevaAsistenciaPage';
import PasesPage from '../pages/pases/PasesPage';
import LogsPage from '../pages/logs/LogsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Unauthorized403 />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Socios (RF01 - RF04) */}
        <Route path="socios" element={<SociosPage />} />
        <Route path="socios/nuevo" element={<SociosPage openCreateModal={true} />} />

        {/* Membresías (RF14 - RF16) */}
        <Route path="membresias" element={<MembresiasPage />} />
        <Route path="membresias/nueva" element={<NuevaMembresiaPage />} />

        {/* Asistencias (RF18 - RF21) */}
        <Route path="asistencias" element={<AsistenciasPage />} />
        <Route path="asistencias/nueva" element={<NuevaAsistenciaPage />} />

        {/* Pases (RF17) */}
        <Route path="pases" element={<PasesPage />} />

        {/* Módulos solo Admin */}
        <Route
          path="categorias"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <CategoriasPage />
            </RoleRoute>
          }
        />
        <Route
          path="productos"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <ProductosPage />
            </RoleRoute>
          }
        />
        <Route
          path="usuarios"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <UsuariosPage />
            </RoleRoute>
          }
        />
        <Route
          path="logs"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <LogsPage />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}
