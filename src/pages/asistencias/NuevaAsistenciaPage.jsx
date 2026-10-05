import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  MapPin,
  Clock,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { sociosService } from '../../api/sociosService';
import { membresiasService } from '../../api/membresiasService';
import { asistenciasService } from '../../api/asistenciasService';
import { useToast } from '../../context/ToastContext';
import { validarMembresiaVigente } from '../../utils/businessRules';
import { formatDateTime } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function NuevaAsistenciaPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Búsqueda y Validación
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);

  // Formulario de registro
  const [sede, setSede] = useState('Sede Central');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSocios() {
      try {
        setLoading(true);
        const data = await sociosService.getAll();
        setSocios(data);
      } catch {
        addToast('Error al conectar con el padrón de socios.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSocios();
  }, [addToast]);

  // Validación de vigencia (RF18 Macro)
  const handleCheckSocio = async (socio) => {
    if (!socio) return;
    setSelectedSocio(socio);
    setValidating(true);

    try {
      if (!socio.activo) {
        setValidationResult({
          permitido: false,
          razon: 'El socio se encuentra INACTIVO en recepción. Debe reactivarse antes de registrar acceso (Regla R2).',
          membresia: null,
        });
        setValidating(false);
        return;
      }

      // Consultar membresías del socio
      const membresias = await membresiasService.getBySocioId(socio.id);
      const res = validarMembresiaVigente(membresias);

      if (res.vigente) {
        setValidationResult({
          permitido: true,
          razon: `Membresía activa vigente hasta el ${res.membresiaActiva.fecha_fin}.`,
          membresia: res.membresiaActiva,
        });
      } else {
        setValidationResult({
          permitido: false,
          razon: 'Acceso Denegado: El socio no cuenta con ninguna membresía activa y vigente a la fecha.',
          membresia: null,
        });
      }
    } catch {
      setValidationResult({
        permitido: false,
        razon: 'Error al verificar membresías con la API.',
        membresia: null,
      });
    } finally {
      setValidating(false);
    }
  };

  const handleSearchByDoc = (e) => {
    e.preventDefault();
    if (!searchDoc.trim()) return;

    const found = socios.find(
      (s) => s.documento.trim() === searchDoc.trim() || s.nombre.toLowerCase().includes(searchDoc.toLowerCase())
    );

    if (found) {
      handleCheckSocio(found);
    } else {
      setSelectedSocio(null);
      setValidationResult({
        permitido: false,
        razon: `No se encontró ningún socio registrado con el criterio "${searchDoc}".`,
        membresia: null,
      });
    }
  };

  const handleRegistrarIngreso = async () => {
    if (!selectedSocio || !validationResult?.permitido) return;

    try {
      setSaving(true);
      // Fecha y hora actual formateada YYYY-MM-DD HH:mm
      const now = new Date();
      const fechaHora = now.toISOString().replace('T', ' ').substring(0, 16);

      await asistenciasService.create({
        socioId: selectedSocio.id,
        fechaHora,
        sede,
      });

      addToast(`¡Ingreso registrado para ${selectedSocio.nombre} en ${sede}!`, 'success', 3500);
      navigate('/asistencias');
    } catch {
      addToast('Error al registrar la asistencia en el servidor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Cargando padrón para control de accesos..." />;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Registrar Asistencia en Recepción</h1>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
            Macro RF18
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Valida en tiempo real la vigencia de la suscripción del socio antes de permitir el ingreso por molinete.
        </p>
      </div>

      {/* Buscador Rápido de Socio */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Search size={18} className="text-emerald-400" />
          Búsqueda de Socio por Documento o Nombre
        </h2>

        <form onSubmit={handleSearchByDoc} className="flex gap-2">
          <input
            type="text"
            value={searchDoc}
            onChange={(e) => setSearchDoc(e.target.value)}
            placeholder="Ingrese DNI o nombre completo del socio..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <Button type="submit" size="md">
            Consultar
          </Button>
        </form>

        {/* Selector rápido alternativo */}
        <div className="pt-2">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            O seleccione directamente de la lista:
          </label>
          <select
            value={selectedSocio?.id || ''}
            onChange={(e) => {
              const s = socios.find((x) => x.id === Number(e.target.value));
              if (s) handleCheckSocio(s);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">-- Seleccionar socio --</option>
            {socios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} - DNI: {s.documento} {s.activo ? '(Activo)' : '(Inactivo)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjeta de Validación en Vivo */}
      {validating ? (
        <Loader message="Verificando vigencia de membresía..." />
      ) : validationResult ? (
        <div
          className={`p-6 rounded-3xl border shadow-xl transition-all space-y-4 ${
            validationResult.permitido
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/30 border-red-500/40 text-red-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  validationResult.permitido
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {validationResult.permitido ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
              </div>
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                    validationResult.permitido
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {validationResult.permitido ? 'Acceso Autorizado' : 'Acceso Denegado'}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedSocio?.nombre || 'Socio No Identificado'}
                </h3>
                <p className="text-xs text-slate-300">
                  Documento: {selectedSocio?.documento} • Teléfono: {selectedSocio?.telefono}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs leading-relaxed font-medium bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800">
            {validationResult.razon}
          </p>

          {/* Formulario de Confirmación si está permitido */}
          {validationResult.permitido && (
            <div className="pt-4 border-t border-emerald-500/20 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Sede de Ingreso
                  </label>
                  <select
                    value={sede}
                    onChange={(e) => setSede(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Sede Central">Sede Central</option>
                    <option value="Sede Miraflores">Sede Miraflores</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Hora del Registro
                  </label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 font-mono flex items-center gap-2">
                    <Clock size={14} className="text-emerald-400" />
                    <span>En tiempo real (Automático)</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRegistrarIngreso}
                loading={saving}
                className="w-full py-3"
              >
                Confirmar Registro de Asistencia (RF18)
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
