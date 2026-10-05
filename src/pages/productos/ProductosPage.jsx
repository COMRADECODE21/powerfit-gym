import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, CheckCircle2, MapPin } from 'lucide-react';
import { productosService } from '../../api/productosService';
import { categoriasService } from '../../api/categoriasService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function ProductosPage() {
  const { addToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    categoria_id: '',
    precio_base: '',
    sede: 'Sede Central',
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Confirm dialog para desactivación (RF13)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    producto: null,
    loading: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodData, catData] = await Promise.all([
        productosService.getAll(),
        categoriasService.getAll(),
      ]);
      setProductos(prodData);
      setCategorias(catData);
    } catch {
      setError('Error al cargar la lista de productos y categorías.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProducto(null);
    setFormData({
      nombre: '',
      categoria_id: categorias[0]?.id || '',
      precio_base: '',
      sede: 'Sede Central',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProducto(prod);
    setFormData({
      nombre: prod.nombre,
      categoria_id: prod.categoria_id,
      precio_base: prod.precio_base,
      sede: prod.sede,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.nombre.trim()) errs.nombre = 'El nombre del producto es obligatorio';
    if (!formData.categoria_id) errs.categoria_id = 'Debe seleccionar una categoría';
    if (!formData.precio_base || Number(formData.precio_base) <= 0) {
      errs.precio_base = 'Ingrese un precio base válido mayor a 0';
    }
    if (!formData.sede.trim()) errs.sede = 'La sede es obligatoria';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      if (editingProducto) {
        // RF12: Editar producto
        await productosService.update(editingProducto.id, formData);
        addToast(`Producto "${formData.nombre}" actualizado.`, 'success');
      } else {
        // RF10: Registrar producto
        await productosService.create(formData);
        addToast(`Producto "${formData.nombre}" registrado exitosamente.`, 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      addToast('Error al procesar el producto.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    const prod = confirmDialog.producto;
    if (!prod) return;

    try {
      setConfirmDialog((prev) => ({ ...prev, loading: true }));
      // RF13: Desactivar producto
      await productosService.deactivate(prod.id);
      addToast(`Producto "${prod.nombre}" desactivado con éxito.`, 'warning');
      setConfirmDialog({ isOpen: false, producto: null, loading: false });
      loadData();
    } catch {
      addToast('Error al desactivar el producto.', 'error');
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleReactivate = async (prod) => {
    try {
      await productosService.reactivate(prod.id);
      addToast(`Producto "${prod.nombre}" reactivado con éxito.`, 'success');
      loadData();
    } catch {
      addToast('Error al reactivar el producto.', 'error');
    }
  };

  const catMap = Object.fromEntries(categorias.map((c) => [c.id, c.nombre]));

  const columns = [
    {
      header: 'Producto / Servicio',
      accessor: 'nombre',
      render: (p) => (
        <div>
          <span className="font-semibold text-white block">{p.nombre}</span>
          <span className="text-[11px] text-slate-400">
            Categoría: {catMap[p.categoria_id] || `Cat #${p.categoria_id}`}
          </span>
        </div>
      ),
    },
    {
      header: 'Precio Mensual',
      accessor: 'precio_base',
      render: (p) => (
        <span className="font-mono font-bold text-emerald-400 text-sm">
          {formatCurrency(p.precio_base)}
        </span>
      ),
    },
    {
      header: 'Sede Permitida',
      accessor: 'sede',
      render: (p) => (
        <span className="inline-flex items-center gap-1 text-slate-300">
          <MapPin size={13} className="text-slate-500" />
          {p.sede}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessor: 'activo',
      render: (p) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            p.activo
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {p.activo ? 'Disponible' : 'Desactivado (RF13)'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Catálogo de Productos y Servicios</h1>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
              RF10–RF13
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Servicios individuales bajo suscripción mensual seleccionables para armar membresías personalizadas.
          </p>
        </div>

        <Button icon={Plus} onClick={handleOpenCreate}>
          Registrar Producto (RF10)
        </Button>
      </div>

      {loading ? (
        <Loader message="Cargando productos..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : (
        <Table
          columns={columns}
          data={productos}
          searchPlaceholder="Buscar por nombre, categoría o sede..."
          searchFields={['nombre', 'sede']}
          actions={(prod) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleOpenEdit(prod)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Editar producto (RF12)"
              >
                <Edit2 size={14} />
              </button>
              {prod.activo ? (
                <button
                  onClick={() => setConfirmDialog({ isOpen: true, producto: prod, loading: false })}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                  title="Desactivar producto (RF13)"
                >
                  <Trash2 size={14} />
                </button>
              ) : (
                <button
                  onClick={() => handleReactivate(prod)}
                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                  title="Reactivar producto"
                >
                  <CheckCircle2 size={14} />
                </button>
              )}
            </div>
          )}
        />
      )}

      {/* Modal Crear / Editar Producto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProducto ? 'Editar Producto (RF12)' : 'Registrar Producto (RF10)'}
        subtitle="Configura el servicio individual para las suscripciones del gimnasio"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nombre del Servicio / Producto"
            name="nombre"
            placeholder="Ej: Acceso a Zona Crossfit"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            error={formErrors.nombre}
            required
          />

          <FormField
            label="Categoría"
            name="categoria_id"
            type="select"
            value={formData.categoria_id}
            onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
            options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
            error={formErrors.categoria_id}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Precio Base Mensual (S/.)"
              name="precio_base"
              type="number"
              step="0.01"
              placeholder="Ej: 95.00"
              value={formData.precio_base}
              onChange={(e) => setFormData({ ...formData, precio_base: e.target.value })}
              error={formErrors.precio_base}
              required
            />

            <FormField
              label="Sede Asignada"
              name="sede"
              type="select"
              value={formData.sede}
              onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
              options={[
                { value: 'Sede Central', label: 'Sede Central' },
                { value: 'Sede Miraflores', label: 'Sede Miraflores' },
                { value: 'Todas las Sedes', label: 'Todas las Sedes' },
              ]}
              error={formErrors.sede}
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {editingProducto ? 'Actualizar Producto' : 'Guardar Producto'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo Confirmación Desactivación RF13 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, producto: null, loading: false })}
        onConfirm={handleConfirmDeactivate}
        title="¿Desactivar Producto?"
        message={`¿Desea desactivar "${confirmDialog.producto?.nombre}"? Dejará de estar disponible para nuevas contrataciones de membresía.`}
        confirmText="Desactivar Producto"
        loading={confirmDialog.loading}
      />
    </div>
  );
}
