import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Home } from 'lucide-react';

export default function NotFound404() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Dumbbell size={32} />
        </div>

        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          Error 404
        </span>

        <h1 className="text-2xl font-bold text-white mt-4 mb-2">
          Página No Encontrada
        </h1>

        <p className="text-slate-400 text-sm mb-6">
          La ruta que intentas consultar no existe o ha sido reubicada dentro del sistema PowerFit GYM.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-900/30"
        >
          <Home size={16} />
          Ir al Dashboard
        </Link>
      </div>
    </div>
  );
}
