import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ message = 'Cargando datos desde la API...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 size={36} className="text-emerald-500 animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-300">{message}</p>
      <span className="text-xs text-slate-500 mt-1">Conectando con json-server :3001</span>
    </div>
  );
}
