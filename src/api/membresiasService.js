import api from './axiosInstance';

export const membresiasService = {
  // RF15: Listar historial general o por socio
  getAll: async () => {
    const res = await api.get('/membresias');
    return res.data;
  },

  getBySocioId: async (socioId) => {
    const res = await api.get('/membresias', {
      params: { socio_id: Number(socioId) },
    });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/membresias/${id}`);
    return res.data;
  },

  // Obtener productos contratados en una membresía
  getProductosByMembresiaId: async (membresiaId) => {
    const res = await api.get('/membresia_producto', {
      params: { membresia_id: Number(membresiaId) },
    });
    return res.data;
  },

  // RF14: Contratar membresía (macro flujo con registro de productos)
  create: async ({ socioId, fechaInicio, fechaFin, montoTotal, esPrimera, productos }) => {
    // 1. Guardar la membresía principal
    const membresiaPayload = {
      socio_id: Number(socioId),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      monto_total: Number(montoTotal),
      estado: 'activa',
      es_primera: Boolean(esPrimera),
    };

    const resMembresia = await api.post('/membresias', membresiaPayload);
    const nuevaMembresia = resMembresia.data;

    // 2. Registrar los productos asociados en membresia_producto
    const promesasProductos = productos.map((prod) =>
      api.post('/membresia_producto', {
        membresia_id: nuevaMembresia.id,
        producto_id: prod.id,
        precio_unitario: prod.precio_base,
        cantidad_disponible: 1,
      })
    );
    await Promise.all(promesasProductos);

    return nuevaMembresia;
  },

  // RF16: Cancelar membresía (ocultamiento / cancelación lógica)
  cancel: async (id) => {
    const res = await api.patch(`/membresias/${id}`, { estado: 'cancelada' });
    return res.data;
  },
};
