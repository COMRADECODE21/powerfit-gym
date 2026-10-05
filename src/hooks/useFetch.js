import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para ejecutar llamadas asíncronas con manejo de estados
 * reactivos: data, loading, error, y función de refetch/reintento.
 * 
 * @param {Function} asyncFunction - Función asíncrona que retorna datos (ej. un servicio API).
 * @param {Array} dependencies - Lista de dependencias para volver a disparar el efecto.
 */
export function useFetch(asyncFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err?.message || 'Error desconocido al procesar la petición.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: execute };
}

export default useFetch;
