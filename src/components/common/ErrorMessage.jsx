import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorMessage({
  message = 'Ocurrió un error al cargar la información.',
  onRetry,
}) {
  return (
    <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center max-w-lg mx-auto">
      <div className="w-12 h-12 mx-auto rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 mb-3">
        <AlertCircle size={24} />
      </div>
      <h4 className="text-base font-bold text-white mb-1">Error de Comunicación</h4>
      <p className="text-xs text-red-300 mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
          Reintentar Petición
        </Button>
      )}
    </div>
  );
}
