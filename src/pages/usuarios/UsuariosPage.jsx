import React, { useState, useEffect } from 'react';
import { UserCog, UserPlus, Edit2, ShieldCheck, UserCheck } from 'lucide-react';
import { usuariosService } from '../../api/usuariosService';
import { useToast } from '../../context/ToastContext';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function UsuariosPage() {
  const { addToast } = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: ROLES.STAFF,
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuariosService.getAll();
      setUsuarios(data);
    } catch {
      setError('Error al consultar usuarios del sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleOpenCreate = () => {
    setEditingUsuario(null);
    setFormData({ nombre: '', email: '', password: '', rol: ROLES.STAFF });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUsuario(u);
    setFormData({
      nombre: u.nombre,
      email: u.email,
      password: u.password,
      rol: u.rol,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Ingrese un correo electrónico válido';
    }
    if (!editingUsuario && (!formData.password || formData.password.length < 4)) {
      errs.password = 'La contraseña debe tener al menos 4 caracteres';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      if (editingUsuario) {
        // RF06: Editar usuario
        await usuariosService.update(editingUsuario.id, formData);
        addToast(`Usuario "${formData.nombre}" actualizado.`, 'success');
      } else {
        // RF05: Registrar usuario
        await usuariosService.create(formData);
        addToast(`Usuario "${formData.nombre}" registrado exitosamente.`, 'success');
      }
      setIsModalOpen(false);
      loadUsuarios();
    } catch {
      addToast('Error al guardar usuario.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Nombre del Personal',
      accessor: 'nombre',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
            {u.rol === ROLES.ADMIN ? (
              <ShieldCheck size={16} className="text-emerald-400" />
            ) : (
              <UserCheck size={16} className="text-blue-400" />
            )}
          </div>
          <span className="font-semibold text-white">{u.nombre}</span>
        </div>
      ),
    },
    {
      header: 'Correo Electrónico',
      accessor: 'email',
      render: (u) => <span className="font-mono text-slate-300">{u.email}</span>,
    },
    {
      header: 'Rol Asignado',
      accessor: 'rol',
      render: (u) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            u.rol === ROLES.ADMIN
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          }`}
        >
          {ROLE_LABELS[u.rol] || u.rol}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Gestión de Personal</h1>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
              RF05–RF06 (Solo Admin)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Control de cuentas de acceso para el personal administrativo y operativo del gimnasio.
          </p>
        </div>

        <Button icon={UserPlus} onClick={handleOpenCreate}>
          Registrar Usuario (RF05)
        </Button>
      </div>

      {loading ? (
        <Loader message="Cargando personal..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadUsuarios} />
      ) : (
        <Table
          columns={columns}
          data={usuarios}
          searchPlaceholder="Buscar por nombre, email o rol..."
          searchFields={['nombre', 'email', 'rol']}
          actions={(u) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleOpenEdit(u)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Editar usuario (RF06)"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        />
      )}

      {/* Modal Crear / Editar Usuario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUsuario ? 'Editar Usuario (RF06)' : 'Registrar Nuevo Usuario (RF05)'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nombre Completo"
            name="nombre"
            placeholder="Ej: Lucía Torres"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            error={formErrors.nombre}
            required
          />

          <FormField
            label="Correo Electrónico"
            name="email"
            type="email"
            placeholder="staff@powerfit.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
            required
          />

          <FormField
            label="Contraseña"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={formErrors.password}
            helperText={editingUsuario ? 'Deje la contraseña actual o ingrese una nueva.' : undefined}
            required={!editingUsuario}
          />

          <FormField
            label="Rol en el Sistema"
            name="rol"
            type="select"
            value={formData.rol}
            onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
            options={[
              { value: ROLES.STAFF, label: 'Staff / Recepción (Operaciones)' },
              { value: ROLES.ADMIN, label: 'Administrador (Control Total)' },
            ]}
            required
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {editingUsuario ? 'Actualizar Usuario' : 'Guardar Usuario'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
