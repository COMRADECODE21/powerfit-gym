import api from './axiosInstance';

export const pasesService = {
  getAll: async () => {
    const res = await api.get('/pases_invitado');
    return res.data;
  },

  getBySocioId: async (socioId) => {
    const res = await api.get('/pases_invitado', {
      params: { socio_id: Number(socioId) },
    });
    return res.data;
  },

  // RF17: Generar pase de invitado
  create: async ({ socioId, nombreInv, fechaUso }) => {
    const payload = {
      socio_id: Number(socioId),
      nombre_inv: nombreInv.trim(),
      fecha_uso: fechaUso || new Date().toISOString().split('T')[0],
      activo: true,
    };
    const res = await api.post('/pases_invitado', payload);
    return res.data;
  },
};
