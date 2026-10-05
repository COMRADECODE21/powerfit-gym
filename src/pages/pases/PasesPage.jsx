import React, { useState, useEffect } from 'react';
import { Ticket, Plus, User, Calendar, CheckCircle2, AlertTriangle, Gift } from 'lucide-react';
import { pasesService } from '../../api/pasesService';
import { sociosService } from '../../api/sociosService';
import { membresiasService } from '../../api/membresiasService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import {
  calcularLimitePases,
  validarMembresiaVigente,
  validarEmisionPase
} from '../../utils/businessRules';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function PasesPage() {
  const { addToast } = useToast();
  const [pases, setPases] = useState([]);
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal Emisión de Pase (RF17)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSocioId, setSelectedSocioId] = useState('');
  const [nombreInv, setNombreInv] = useState('');
  const [fechaUso, setFechaUso] = useState(new Date().toISOString().split('T')[0]);
  const [evaluacionPase, setEvaluacionPase] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pasesData, socData] = await Promise.all([
        pasesService.getAll(),
        sociosService.getAll(),
      ]);
      setPases(pasesData);
      setSocios(socData);
    } catch {
      setError('Error al consultar pases de invitado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEmitModal = () => {
    setSelectedSocioId('');
    setNombreInv('');
    setFechaUso(new Date().toISOString().split('T')[0]);
    setEvaluacionPase(null);
    setIsModalOpen(true);
  };

  // Al elegir socio en el modal, evaluar membresía activa, pases previos y límite (R1 y R5)
  const handleSocioSelect = async (socioId) => {
    setSelectedSocioId(socioId);
    if (!socioId) {
      setEvaluacionPase(null);
      return;
    }

    try {
      setEvaluating(true);
      const socio = socios.find((s) => s.id === Number(socioId));
      const [membresias, pasesSocio] = await Promise.all([
        membresiasService.getBySocioId(socioId),
        pasesService.getBySocioId(socioId),
      ]);

      // 1. Validar membresía vigente
      const checkVigencia = validarMembresiaVigente(membresias);

      if (!checkVigencia.vigente) {
        setEvaluacionPase({
          permitido: false,
          mensaje: 'El socio no cuenta con ninguna membresía activa y vigente a la fecha.',
          limiteTotal: 0,
          usados: pasesSocio.length,
        });
        return;
      }

      // 2. Obtener productos de la membresía activa para calcular R1
      const prodsEnMembresia = await membresiasService.getProductosByMembresiaId(checkVigencia.membresiaActiva.id);
      
      // 3. Evaluar R1 y R5
      const { limiteTotal, desglose } = calcularLimitePases(prodsEnMembresia, checkVigencia.membresiaActiva.es_primera);

      // 4. Validar si ya superó el límite
      const validacion = validarEmisionPase({
        socio,
        membresiaVigente: checkVigencia.membresiaActiva,
        limitePases: limiteTotal,
        pasesUsados: pasesSocio.length,
      });

      setEvaluacionPase({
        ...validacion,
        limiteTotal,
        desglose,
        usados: pasesSocio.length,
      });
    } catch {
      setEvaluacionPase({
        permitido: false,
        mensaje: 'Error al evaluar reglas de negocio del socio.',
      });
    } finally {
      setEvaluating(false);
    }
  };

  const handleEmitirPase = async (e) => {
    e.preventDefault();
    if (!selectedSocioId || !nombreInv.trim()) {
      addToast('Complete el nombre del invitado.', 'error');
      return;
    }
    if (!evaluacionPase?.permitido) {
      addToast(evaluacionPase?.mensaje || 'No se puede emitir el pase.', 'error');
      return;
    }

    try {
      setSaving(true);
      // RF17: Registrar pase de invitado
      await pasesService.create({
        socioId: selectedSocioId,
        nombreInv: nombreInv.trim(),
        fechaUso,
      });

      addToast(`Pase de invitado emitido para "${nombreInv}".`, 'success');
      setIsModalOpen(false);
      loadData();
    } catch {
      addToast('Error al emitir el pase de invitado.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const sociosMap = Object.fromEntries(socios.map((s) => [s.id, s]));

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cellClass: 'font-mono text-slate-500 w-16',
      render: (p) => <span className="font-mono text-slate-400">#{p.id}</span>,
    },
    {
      header: 'Nombre del Invitado',
      accessor: 'nombre_inv',
      render: (p) => <span className="font-semibold text-white">{p.nombre_inv}</span>,
    },
    {
      header: 'Socio Anfitrión',
      accessor: 'socio_id',
      render: (p) => {
        const s = sociosMap[p.socio_id];
        return (
          <div>
            <span className="text-slate-200 block font-medium">
              {s ? s.nombre : `Socio #${p.socio_id}`}
            </span>
            <span className="text-[11px] text-slate-400">
              {s ? `DNI: ${s.documento}` : ''}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Fecha de Uso',
      accessor: 'fecha_uso',
      render: (p) => formatDate(p.fecha_uso),
    },
    {
      header: 'Estado',
      accessor: 'activo',
      render: (p) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            p.activo
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {p.activo ? 'Emitido / Válido' : 'Utilizado'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Pases de Invitado</h1>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
              RF17 • Reglas R1 & R5
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Emisión controlada de pases de cortesía según servicios contratados y bono de primera membresía.
          </p>
        </div>

        <Button icon={Plus} onClick={handleOpenEmitModal}>
          Emitir Pase de Invitado (RF17)
        </Button>
      </div>

      {loading ? (
        <Loader message="Cargando pases de invitado..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : (
        <Table
          columns={columns}
          data={pases}
          searchPlaceholder="Buscar por invitado o socio..."
          searchFields={['nombre_inv']}
        />
      )}

      {/* Modal Emisión RF17 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Emitir Pase de Invitado (RF17)"
        subtitle="Verifica automáticamente la membresía activa y límites bajo reglas R1 y R5"
      >
        <form onSubmit={handleEmitirPase} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Socio Titular Solicitante *
            </label>
            <select
              value={selectedSocioId}
              onChange={(e) => handleSocioSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            >
              <option value="">-- Seleccionar socio --</option>
              {socios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} - DNI: {s.documento} {s.activo ? '' : '(Inactivo)'}
                </option>
              ))}
            </select>
          </div>

          {/* Tarjeta de Evaluación de Reglas de Negocio R1 y R5 */}
          {evaluating ? (
            <Loader message="Evaluando membresía y límites de pases..." />
          ) : evaluacionPase ? (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                evaluacionPase.permitido
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/30 border-red-500/40 text-red-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {evaluacionPase.permitido ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <AlertTriangle size={16} className="text-red-400" />
                )}
                <span>{evaluacionPase.mensaje}</span>
              </div>

              {evaluacionPase.desglose && (
                <p className="text-[11px] text-slate-300">
                  <strong>Cálculo:</strong> {evaluacionPase.desglose}
                </p>
              )}

              {evaluacionPase.permitido && (
                <div className="flex justify-between pt-1 border-t border-emerald-500/20 text-[11px]">
                  <span>Pases usados: <strong>{evaluacionPase.usados}</strong></span>
                  <span>Restantes disponibles: <strong className="text-white">{evaluacionPase.pasesRestantes}</strong></span>
                </div>
              )}
            </div>
          ) : null}

          <FormField
            label="Nombre Completo del Invitado"
            name="nombre_inv"
            placeholder="Ej: Marcos Alarcón"
            value={nombreInv}
            onChange={(e) => setNombreInv(e.target.value)}
            disabled={!evaluacionPase?.permitido}
            required
          />

          <FormField
            label="Fecha de Ingreso del Invitado"
            name="fecha_uso"
            type="date"
            value={fechaUso}
            onChange={(e) => setFechaUso(e.target.value)}
            disabled={!evaluacionPase?.permitido}
            required
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!evaluacionPase?.permitido}
              loading={saving}
            >
              Emitir Pase (RF17)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
