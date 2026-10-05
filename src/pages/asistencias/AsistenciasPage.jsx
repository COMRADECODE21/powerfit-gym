import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Plus, Edit2, Trash2, MapPin, Clock, Calendar } from 'lucide-react';
import { asistenciasService } from '../../api/asistenciasService';
import { sociosService } from '../../api/sociosService';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/formatters';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function AsistenciasPage() {
  const { addToast } = useToast();
  const [asistencias, setAsistencias] = useState([]);
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal Edición (RF20)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsistencia, setEditingAsistencia] = useState(null);
  const [formData, setFormData] = useState({
    fecha_hora: '',
    sede: 'Sede Central',
  });
  const [saving, setSaving] = useState(false);

  // Diálogo Eliminación Física (RF21)
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    asistencia: null,
    loading: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [asistData, socData] = await Promise.all([
        asistenciasService.getAll(),
        sociosService.getAll(),
      ]);
      setAsistencias(asistData);
      setSocios(socData);
    } catch {
      setError('Error al consultar el registro de asistencias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (item) => {
    setEditingAsistencia(item);
    setFormData({
      fecha_hora: item.fecha_hora,
      sede: item.sede,
    });
    setIsModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!formData.fecha_hora.trim()) {
      addToast('La fecha y hora son obligatorias.', 'error');
      return;
    }

    try {
      setSaving(true);
      // RF20: Editar / corregir asistencia
      await asistenciasService.update(editingAsistencia.id, formData);
      addToast('Asistencia corregida exitosamente.', 'success');
      setIsModalOpen(false);
      loadData();
    } catch {
      addToast('Error al corregir asistencia.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    const item = confirmDelete.asistencia;
    if (!item) return;

    try {
      setConfirmDelete((prev) => ({ ...prev, loading: true }));
      // RF21: Eliminación física
      await asistenciasService.delete(item.id);
      addToast('Registro de asistencia eliminado físicamente de la base de datos.', 'info');
      setConfirmDelete({ isOpen: false, asistencia: null, loading: false });
      loadData();
    } catch {
      addToast('Error al eliminar asistencia.', 'error');
      setConfirmDelete((prev) => ({ ...prev, loading: false }));
    }
  };

  const sociosMap = Object.fromEntries(socios.map((s) => [s.id, s]));

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cellClass: 'font-mono text-slate-500 w-16',
      render: (a) => <span className="font-mono text-slate-400">#{a.id}</span>,
    },
    {
      header: 'Socio',
      accessor: 'socio_id',
      render: (a) => {
        const s = sociosMap[a.socio_id];
        return (
          <div>
            <span className="font-semibold text-white block">
              {s ? s.nombre : `Socio #${a.socio_id}`}
            </span>
            <span className="text-[11px] text-slate-400">
              {s ? `DNI: ${s.documento}` : ''}
              {!s?.activo && <span className="text-red-400 ml-1">(Inactivo R2)</span>}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Fecha y Hora',
      accessor: 'fecha_hora',
      render: (a) => (
        <span className="font-mono text-slate-200">
          {a.fecha_hora}
        </span>
      ),
    },
    {
      header: 'Sede de Ingreso',
      accessor: 'sede',
      render: (a) => (
        <span className="inline-flex items-center gap-1.5 text-slate-300">
          <MapPin size={13} className="text-emerald-400" />
          {a.sede}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Control de Asistencias</h1>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
              RF18–RF21
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro, consulta, corrección y eliminación física de accesos a las instalaciones.
          </p>
        </div>

        <Link to="/asistencias/nueva">
          <Button icon={Plus}>
            Registrar Asistencia (RF18)
          </Button>
        </Link>
      </div>

      {loading ? (
        <Loader message="Cargando asistencias..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : (
        <Table
          columns={columns}
          data={asistencias}
          searchPlaceholder="Buscar por fecha, sede o ID..."
          searchFields={['fecha_hora', 'sede']}
          actions={(item) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Editar / corregir asistencia (RF20)"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => setConfirmDelete({ isOpen: true, asistencia: item, loading: false })}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                title="Eliminar asistencia físicamente (RF21)"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        />
      )}

      {/* Modal Corrección RF20 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Corregir Asistencia (RF20)"
        subtitle="Permite corregir fecha/hora o sede por error de registro en recepción"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <FormField
            label="Fecha y Hora (YYYY-MM-DD HH:mm)"
            name="fecha_hora"
            value={formData.fecha_hora}
            onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
            placeholder="2026-10-05 09:30"
            required
          />

          <FormField
            label="Sede de Ingreso"
            name="sede"
            type="select"
            value={formData.sede}
            onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
            options={[
              { value: 'Sede Central', label: 'Sede Central' },
              { value: 'Sede Miraflores', label: 'Sede Miraflores' },
            ]}
            required
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              Guardar Corrección
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo Eliminación Física RF21 */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, asistencia: null, loading: false })}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Asistencia (Físico)?"
        message={`¿Está seguro de eliminar definitivamente el registro de asistencia #${confirmDelete.asistencia?.id}? Esta operación eliminará el registro de la base de datos (RF21).`}
        confirmText="Eliminar Definitivamente"
        variant="danger"
        loading={confirmDelete.loading}
      />
    </div>
  );
}
