import React, { useState, useEffect } from 'react';
import { Tags, Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { categoriasService } from '../../api/categoriasService';
import { useToast } from '../../context/ToastContext';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function CategoriasPage() {
  const { addToast } = useToast();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [nombre, setNombre] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriasService.getAll();
      setCategorias(data);
    } catch {
      setError('Error al conectar con la API de categorías.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategoria(null);
    setNombre('');
    setNombreError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategoria(cat);
    setNombre(cat.nombre);
    setNombreError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setNombreError('El nombre de la categoría es requerido');
      return;
    }

    try {
      setSaving(true);
      if (editingCategoria) {
        // RF09: Editar categoría
        await categoriasService.update(editingCategoria.id, { nombre: nombre.trim() });
        addToast(`Categoría "${nombre}" actualizada con éxito.`, 'success');
      } else {
        // RF07: Registrar categoría
        await categoriasService.create({ nombre: nombre.trim() });
        addToast(`Categoría "${nombre}" registrada con éxito.`, 'success');
      }
      setIsModalOpen(false);
      loadCategorias();
    } catch {
      addToast('Error al guardar categoría.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cellClass: 'font-mono text-slate-500 w-16',
    },
    {
      header: 'Nombre de la Categoría',
      accessor: 'nombre',
      render: (cat) => <span className="font-semibold text-white">{cat.nombre}</span>,
    },
    {
      header: 'Estado',
      accessor: 'activo',
      render: (cat) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            cat.activo
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {cat.activo ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Categorías de Servicios</h1>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
              RF07–RF09
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Agrupación de servicios individuales y productos disponibles en suscripción mensual.
          </p>
        </div>

        <Button icon={Plus} onClick={handleOpenCreate}>
          Nueva Categoría (RF07)
        </Button>
      </div>

      {loading ? (
        <Loader message="Cargando catálogo de categorías..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadCategorias} />
      ) : (
        <Table
          columns={columns}
          data={categorias}
          searchPlaceholder="Buscar categoría..."
          searchFields={['nombre']}
          actions={(cat) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Editar categoría (RF09)"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        />
      )}

      {/* Modal Crear / Editar Categoría */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategoria ? 'Editar Categoría (RF09)' : 'Nueva Categoría (RF07)'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nombre de Categoría"
            name="nombre"
            placeholder="Ej: Clases Dirigidas"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={nombreError}
            required
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {editingCategoria ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
