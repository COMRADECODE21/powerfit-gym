import api from './axiosInstance';

export const productosService = {
  // RF11: Listar productos
  getAll: async () => {
    const res = await api.get('/productos');
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/productos/${id}`);
    return res.data;
  },

  // RF10: Registrar producto
  create: async (productoData) => {
    const payload = {
      ...productoData,
      precio_base: Number(productoData.precio_base) || 0,
      categoria_id: Number(productoData.categoria_id),
      activo: true,
    };
    const res = await api.post('/productos', payload);
    return res.data;
  },

  // RF12: Editar producto
  update: async (id, productoData) => {
    const payload = {
      ...productoData,
      precio_base: Number(productoData.precio_base) || 0,
      categoria_id: Number(productoData.categoria_id),
    };
    const res = await api.patch(`/productos/${id}`, payload);
    return res.data;
  },

  // RF13: Desactivar producto (Borrado Lógico)
  deactivate: async (id) => {
    const res = await api.patch(`/productos/${id}`, { activo: false });
    return res.data;
  },

  reactivate: async (id) => {
    const res = await api.patch(`/productos/${id}`, { activo: true });
    return res.data;
  },
};
