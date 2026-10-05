/**
 * Módulo centralizado de Auditoría y Logs - PowerFit GYM
 * Registra eventos en consola y persiste los últimos 100 registros en localStorage.
 * Niveles soportados: INFO, WARN, ERROR.
 * 
 * Se utiliza para registrar:
 * - Peticiones y respuestas de la API (Axios interceptors)
 * - Inicio y cierre de sesión (AuthContext)
 * - Intentos bloqueados por permisos de rol (RoleRoute / ProtectedRoute)
 * - Validaciones y violaciones de reglas de negocio (businessRules)
 * - Excepciones y errores de red
 */

const STORAGE_KEY = 'powerfit_logs';
const MAX_LOGS = 100;

export const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

/**
 * Obtiene los logs almacenados en localStorage.
 * @returns {Array} Lista de objetos de log
 */
export function getStoredLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error al leer logs de localStorage:', err);
    return [];
  }
}

/**
 * Agrega un nuevo evento al registro persistente de auditoría.
 */
function addLog(level, modulo, accion, detalles = {}) {
  const logEntry = {
    id: Date.now() + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    level,
    modulo,
    accion,
    detalles: typeof detalles === 'string' ? { mensaje: detalles } : detalles,
  };

  // Formato para consola de desarrollo
  const color = level === LOG_LEVELS.ERROR ? '#ef4444' : level === LOG_LEVELS.WARN ? '#f59e0b' : '#10b981';
  console.log(
    `%c[${logEntry.level}] [${logEntry.modulo}] ${logEntry.accion}`,
    `color: ${color}; font-weight: bold;`,
    logEntry.detalles
  );

  try {
    const current = getStoredLogs();
    const updated = [logEntry, ...current].slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('No se pudo guardar el log en localStorage:', err);
  }

  return logEntry;
}

export const logger = {
  info: (modulo, accion, detalles) => addLog(LOG_LEVELS.INFO, modulo, accion, detalles),
  warn: (modulo, accion, detalles) => addLog(LOG_LEVELS.WARN, modulo, accion, detalles),
  error: (modulo, accion, detalles) => addLog(LOG_LEVELS.ERROR, modulo, accion, detalles),
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
    console.log('%c[AUDITORÍA] Registro de logs reiniciado.', 'color: #3b82f6;');
  },
  getAll: getStoredLogs,
};
