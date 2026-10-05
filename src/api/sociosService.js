import api from './axiosInstance';

export const sociosService = {
  // RF02: Listar socios
  getAll: async () => {
    const res = await api.get('/socios');
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/socios/${id}`);
    return res.data;
  },

  // RF01: Registrar socio
  create: async (socioData) => {
    const payload = {
      ...socioData,
      fecha_registro: new Date().toISOString().split('T')[0],
      activo: true,
    };
    const res = await api.post('/socios', payload);
    return res.data;
  },

  // RF03: Editar socio
  update: async (id, socioData) => {
    const res = await api.patch(`/socios/${id}`, socioData);
    return res.data;
  },

  // RF04: Desactivar socio (Borrado Lógico - R2)
  deactivate: async (id) => {
    const res = await api.patch(`/socios/${id}`, { activo: false });
    return res.data;
  },

  // Reactivar socio
  reactivate: async (id) => {
    const res = await api.patch(`/socios/${id}`, { activo: true });
    return res.data;
  },
};
