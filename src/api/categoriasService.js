import api from './axiosInstance';

export const categoriasService = {
  // RF08: Listar categorías
  getAll: async () => {
    const res = await api.get('/categorias');
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/categorias/${id}`);
    return res.data;
  },

  // RF07: Registrar categoría
  create: async (categoriaData) => {
    const payload = {
      ...categoriaData,
      activo: true,
    };
    const res = await api.post('/categorias', payload);
    return res.data;
  },

  // RF09: Editar categoría
  update: async (id, categoriaData) => {
    const res = await api.patch(`/categorias/${id}`, categoriaData);
    return res.data;
  },

  toggleActive: async (id, currentStatus) => {
    const res = await api.patch(`/categorias/${id}`, { activo: !currentStatus });
    return res.data;
  },
};
