import api from './axiosInstance';

export const usuariosService = {
  // Listar usuarios
  getAll: async () => {
    const res = await api.get('/usuarios');
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/usuarios/${id}`);
    return res.data;
  },

  // RF05: Registrar usuario
  create: async (usuarioData) => {
    const res = await api.post('/usuarios', usuarioData);
    return res.data;
  },

  // RF06: Editar usuario
  update: async (id, usuarioData) => {
    const res = await api.patch(`/usuarios/${id}`, usuarioData);
    return res.data;
  },
};
