import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../constants/roles';

export default function Unauthorized403() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <ShieldAlert size={36} />
        </div>

        <span className="text-xs font-bold tracking-widest text-red-400 uppercase bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
          Código 403 - Acceso Restringido
        </span>

        <h1 className="text-2xl font-bold text-white mt-4 mb-2">
          Área No Autorizada
        </h1>

        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Tu rol actual es{' '}
          <strong className="text-emerald-400">
            {ROLE_LABELS[user?.rol] || user?.rol || 'No identificado'}
          </strong>
          . Esta sección está reservada exclusivamente para usuarios con privilegios de Administrador.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-900/30"
          >
            <Home size={16} />
            Volver al Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm border border-slate-700 transition-all"
          >
            <ArrowLeft size={16} />
            Regresar
          </button>
        </div>
      </div>
    </div>
  );
}
