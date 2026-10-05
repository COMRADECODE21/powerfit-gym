import api from './axiosInstance';

export const asistenciasService = {
  // RF19: Listar asistencias
  getAll: async () => {
    const res = await api.get('/asistencias');
    return res.data;
  },

  getBySocioId: async (socioId) => {
    const res = await api.get('/asistencias', {
      params: { socio_id: Number(socioId) },
    });
    return res.data;
  },

  // RF18: Registrar asistencia
  create: async ({ socioId, fechaHora, sede }) => {
    const payload = {
      socio_id: Number(socioId),
      fecha_hora: fechaHora,
      sede: sede || 'Sede Central',
    };
    const res = await api.post('/asistencias', payload);
    return res.data;
  },

  // RF20: Editar / corregir asistencia
  update: async (id, asistenciaData) => {
    const res = await api.patch(`/asistencias/${id}`, asistenciaData);
    return res.data;
  },

  // RF21: Eliminar asistencia (eliminación física)
  delete: async (id) => {
    const res = await api.delete(`/asistencias/${id}`);
    return res.data;
  },
};
