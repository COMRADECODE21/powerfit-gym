# Guía de Preparación para la Sustentación Oral - PowerFit GYM (Avance 1)

Documento de entrenamiento técnico personalizado para la defensa oral del proyecto. Todas las respuestas están estrictamente fundamentadas en el código real implementado en el repositorio (`C:\Users\Admin\.gemini\antigravity\scratch\powerfit-gym`).

---

## 🎯 Resumen Ejecutivo de 1 Minuto (Pitch de Apertura)

> *"Buenas tardes profesora. 'PowerFit GYM' es el front-end de un sistema web de gestión administrativa para un gimnasio cuyo modelo de negocio no vende planes fijos, sino servicios individuales (como musculación, spinning o sauna) empaquetados bajo suscripciones mensuales personalizadas.*
> 
> *El sistema está diseñado exclusivamente para el personal del gimnasio con dos roles: Administrador y Staff de recepción; los socios no inician sesión, sino que son atendidos en el mostrador. Está construido con React 19, Vite y Tailwind CSS, consume una API dummy en json-server mediante una instancia centralizada de Axios con interceptores automáticos, y cuenta con un sistema de auditoría que persiste logs en localStorage.*
> 
> *Implementamos 21 requerimientos funcionales y 5 reglas de negocio encapsuladas como funciones puras en un módulo independiente, destacando el control de vigencia para el ingreso y el cálculo automatizado de descuentos y pases de invitado."*

---

## 🗺️ Tabla Rápida: "Pregunta de la Docente → Archivos que Debes Abrir en Pantalla"

| Si la docente pregunta sobre... | Abre inmediatamente estos archivos: |
| :--- | :--- |
| **Redirecciones y Protección de Rutas** | `src/routes/AppRoutes.jsx`, `src/routes/ProtectedRoute.jsx`, `src/routes/RoleRoute.jsx` |
| **Sesión, Login y Roles** | `src/context/AuthContext.jsx`, `src/pages/auth/Login.jsx` |
| **Petición a la API y Ciclo Async** | `src/api/axiosInstance.js`, `src/api/sociosService.js`, `src/pages/socios/SociosPage.jsx` |
| **Sistema de Auditoría y Logs** | `src/utils/logger.js`, `src/api/axiosInstance.js`, `src/pages/logs/LogsPage.jsx` |
| **Arquitectura de Carpetas y Flujo de Datos** | Árbol de carpetas en el explorador + `src/App.jsx` + `src/components/layout/MainLayout.jsx` |
| **Pantalla Macro: Contratar Membresía** | `src/pages/membresias/NuevaMembresiaPage.jsx`, `src/api/membresiasService.js` |
| **Pantalla Macro: Registrar Asistencia** | `src/pages/asistencias/NuevaAsistenciaPage.jsx`, `src/api/asistenciasService.js` |
| **Reglas de Negocio Puras (R1 a R5)** | `src/utils/businessRules.js` |
| **Borrado Lógico vs Físico (R2)** | `src/pages/socios/SociosPage.jsx` vs `src/api/asistenciasService.js` |

---

## 1. Redireccionamiento y Control de Rutas

### (a) Respuesta corta para decir en voz alta (1-2 minutos)
*"El redireccionamiento en nuestro front-end se gestiona de forma declarativa con React Router DOM v7 en `src/routes/AppRoutes.jsx`. 
Tenemos tres niveles de protección:*
1. *Cualquier ruta protegida pasa por `ProtectedRoute.jsx`. Si el usuario no tiene sesión en el `AuthContext`, se captura la ruta intentada y se usa el componente `<Navigate to="/login" replace state={{ from: location }} />` para mandarlo al login y luego regresarlo donde quería.*
2. *Si el usuario ya está autenticado e intenta volver a entrar a `/login`, el componente `Login.jsx` detecta la sesión activa y lo redirige automáticamente al `/dashboard`.*
3. *Para las rutas sensibles de administración (`/categorias`, `/productos`, `/usuarios`, `/logs`), utilizamos `RoleRoute.jsx`. Si un usuario con rol `staff` intenta ingresar, el sistema no solo bloquea el acceso redirigiéndolo a una página personalizada `/403` (Área No Autorizada), sino que además registra una advertencia tipo WARN en el módulo de auditoría.*
4. *Finalmente, si se escribe una URL inexistente, el comodín `<Route path="*" element={<NotFound404 />} />` renderiza nuestra vista 404."*

### (b) Recorrido paso a paso por el código
1. El usuario digita en el navegador `http://localhost:5173/socios`.
2. React Router evalúa las rutas en `src/routes/AppRoutes.jsx`. Encuentra la ruta `/socios` anidada dentro del layout principal, envuelto por `<ProtectedRoute>`.
3. Se ejecuta `ProtectedRoute.jsx` (líneas 14-20): invoca `const { isAuthenticated } = useAuth()`.
4. Como `user` es `null`, `isAuthenticated` es `false`.
5. Se ejecuta el logger: `logger.warn('ROUTER_PROTECTION', 'Acceso denegado: intento de acceso no autenticado', { rutaIntentada: '/socios' })`.
6. Retorna `<Navigate to="/login" state={{ from: location }} replace />`.
7. El navegador aterriza en `/login`. Una vez que el usuario ingresa sus credenciales válidas en `Login.jsx` (líneas 37-41), se usa `navigate(location.state?.from?.pathname || '/dashboard', { replace: true })`, redirigiéndolo directamente a la pantalla que solicitó originalmente (`/socios`).

### (c) Fragmento mínimo de código para mostrar en pantalla

```jsx
// src/routes/ProtectedRoute.jsx (Líneas 14-22)
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    logger.warn('ROUTER_PROTECTION', 'Acceso denegado: intento de acceso no autenticado', {
      rutaIntentada: location.pathname,
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

### (d) Posible pregunta de seguimiento de la docente
**Docente:** *"¿Por qué usas `<Navigate>` en `ProtectedRoute` pero usas el hook `useNavigate()` dentro de la función de login?"*
**Tu respuesta:** *"Porque `<Navigate>` es un componente declarativo ideal para el renderizado condicional de rutas: si una condición no se cumple durante el render, retornamos `<Navigate>` inmediatamente. En cambio, `useNavigate()` es imperativo y se ejecuta dentro de un manejador de eventos o callback asíncrono, como cuando esperamos la respuesta del método `login()` antes de redirigir al usuario."*

---

## 2. Petición a la API y Ciclo de Vida Asíncrono

### (a) Respuesta corta para decir en voz alta (1-2 minutos)
*"Para el consumo de la API usamos Axios con una instancia centralizada en `src/api/axiosInstance.js`. Esta instancia define la URL base (`http://localhost:3001`) y tiene dos interceptores: uno de petición que registra en el logger el método y la URL que salen, y uno de respuesta que captura el status HTTP o intercepta errores de red.*

*No hacemos llamadas directas a Axios dentro de los componentes. Aplicamos el patrón Service Layer: cada entidad tiene su archivo en `src/api/` (como `sociosService.js` o `membresiasService.js`). En las pantallas, usamos funciones con `async/await` estructuradas estrictamente en `try/catch/finally`. Manejamos tres estados en el componente:*
- *`loading`: mientras espera la respuesta, renderiza nuestro componente `<Loader />`.*
- *`error`: si el bloque `catch` atrapa un fallo, mostramos `<ErrorMessage />` con un botón interactivo para reintentar la llamada.*
- *`success`: si la promesa se resuelve con éxito, actualizamos el estado con `setSocios()` y el componente `<Table />` renderiza la información."*

### (b) Recorrido paso a paso por el código

#### Ejemplo 1: Listar Socios (Lectura GET)
1. El componente `SociosPage.jsx` se monta y ejecuta su `useEffect(() => { loadSocios(); }, [])`.
2. Dentro de `loadSocios()`, en el bloque `try`, se activa `setLoading(true)` y se limpia `setError(null)`.
3. Se invoca `sociosService.getAll()`.
4. `sociosService.js` ejecuta `api.get('/socios')`.
5. El interceptor de solicitud de `axiosInstance.js` registra `[INFO] [API_REQUEST] GET /socios`.
6. `json-server` responde código 200 con la lista de socios.
7. El interceptor de respuesta registra `[INFO] [API_RESPONSE] GET /socios [200]`.
8. La promesa se resuelve, `SociosPage.jsx` recibe los datos y ejecuta `setSocios(data)`.
9. En el bloque `finally`, se ejecuta `setLoading(false)`, desmontando el spinner y mostrando la tabla con los socios.

#### Ejemplo 2: Contratar Membresía (Escritura POST compuesta)
1. En `NuevaMembresiaPage.jsx`, el recepcionista hace clic en *"Registrar Pago y Activar"*.
2. Se ejecuta `handleConfirmarContratacion()`. Activa `setSaving(true)`.
3. Invoca a `membresiasService.create({ socioId, fechaInicio, fechaFin, montoTotal, esPrimera, productos })`.
4. El servicio primero hace `api.post('/membresias', membresiaPayload)` para registrar la cabecera.
5. Luego, con el ID devuelto, ejecuta en paralelo con `Promise.all()` los registros correspondientes en `/membresia_producto` para asociar cada servicio adquirido.
6. El componente dispara `addToast('¡Membresía contratada exitosamente!', 'success')` y navega a `/membresias`.

### (c) Fragmento mínimo de código para mostrar en pantalla

```javascript
// src/api/axiosInstance.js (Líneas 20-33)
api.interceptors.request.use(
  (config) => {
    const method = (config.method || 'GET').toUpperCase();
    const url = config.url || '';
    logger.info('API_REQUEST', `${method} ${url}`, {
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    logger.error('API_REQUEST_ERROR', 'Error al preparar la solicitud HTTP', { mensaje: error.message });
    return Promise.reject(error);
  }
);
```

```jsx
// src/pages/socios/SociosPage.jsx (Líneas 39-50)
const loadSocios = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await sociosService.getAll();
    setSocios(data);
  } catch (err) {
    setError('No se pudieron cargar los socios desde la API.');
  } finally {
    setLoading(false);
  }
};
```

### (d) Posible pregunta de seguimiento de la docente
**Docente:** *"¿Por qué pusiste `setLoading(false)` en el bloque `finally` y no dentro del `try`?"*
**Tu respuesta:** *"Porque el bloque `finally` garantiza su ejecución tanto si la promesa se resolvió exitosamente como si ocurrió un error en la red. Si lo pusiéramos solo al final del `try`, en caso de que ocurriera una excepción, la aplicación se quedaría pegada en estado de carga infinito."*

---

## 3. Sistema de Auditoría y Trazabilidad (Logs)

### (a) Respuesta corta para decir en voz alta (1-2 minutos)
*"El sistema de logs está centralizado en `src/utils/logger.js`. Maneja tres niveles jerárquicos: `INFO`, `WARN` y `ERROR`. Cada log es un objeto estructurado que contiene un identificador único, un timestamp ISO, el nivel, el módulo emisor, la acción realizada y un payload de detalles en formato JSON.*

*Los logs se registran automáticamente en cinco escenarios:*
1. *En cada solicitud y respuesta HTTP a través de los interceptores de Axios.*
2. *Al iniciar o cerrar sesión en `AuthContext`.*
3. *Cuando un usuario intenta acceder a una ruta sin permisos en `RoleRoute`.*
4. *Cuando se disparan advertencias de reglas de negocio o borrado lógico.*
5. *En excepciones no controladas capturadas en bloques `catch`.*

*Los logs se muestran con colores en la consola del desarrollador y simultáneamente persisten los últimos 100 eventos en `localStorage` bajo la clave `powerfit_logs`. Además, creamos una vista en `/logs` exclusiva para el Administrador que permite filtrar por nivel y módulo, inspeccionar el JSON formateado, exportar el historial a un archivo `.json` y limpiarlo."*

### (b) Recorrido paso a paso por el código: Proceso de Login

Cuando un usuario inicia sesión en el sistema, se produce la siguiente secuencia ordenada de logs:

1. **Log 1 (`INFO - API_REQUEST`)**:
   - *Origen:* `axiosInstance.js` (interceptor).
   - *Acción:* `GET /usuarios`.
   - *Detalles:* `{ params: { email: "admin@powerfit.com" } }`.
2. **Log 2 (`INFO - API_RESPONSE`)**:
   - *Origen:* `axiosInstance.js` (interceptor).
   - *Acción:* `GET /usuarios [200]`.
   - *Detalles:* `{ status: 200, itemsCount: 1 }`.
3. **Log 3 (`INFO - AUTH_LOGIN`)**:
   - *Origen:* `AuthContext.jsx` (línea 66).
   - *Acción:* `Sesión iniciada exitosamente por Carlos Mendoza (admin)`.
   - *Detalles:* `{ userId: 1, rol: "admin" }`.
*(En caso de contraseña incorrecta, se generaría un log tipo `WARN` en `AuthContext` indicando el intento fallido).*

### (c) Fragmento mínimo de código para mostrar en pantalla

```javascript
// src/utils/logger.js (Líneas 34-60)
function addLog(level, modulo, accion, detalles = {}) {
  const logEntry = {
    id: Date.now() + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    level,
    modulo,
    accion,
    detalles: typeof detalles === 'string' ? { mensaje: detalles } : detalles,
  };

  try {
    const current = getStoredLogs();
    const updated = [logEntry, ...current].slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('No se pudo guardar el log en localStorage:', err);
  }

  return logEntry;
}
```

### (d) Posible pregunta de seguimiento de la docente
**Docente:** *"¿Por qué limitas el almacenamiento a los últimos 100 logs con `.slice(0, MAX_LOGS)`?"*
**Tu respuesta:** *"Porque `localStorage` en los navegadores tiene una cuota de almacenamiento estricta de aproximadamente 5 MB por origen. Limitar a los 100 registros más recientes evita saturar la memoria del navegador y garantiza que la aplicación siga siendo rápida y ligera en un entorno de desarrollo cliente."*

---

## 4. Arquitectura y Estructura del Proyecto

### (a) Respuesta corta para decir en voz alta (1-2 minutos)
*"Nuestra arquitectura separa responsabilidades en capas desacopladas dentro de `src/`:*
- *`api/`: concentra la instancia de Axios y servicios independientes por entidad.*
- *`components/`: dividido en `common/` para componentes reutilizables agnósticos del negocio (botones, modales, tablas, loaders) y `layout/` para el shell visual (Navbar, Sidebar).*
- *`context/`: almacena estados globales que deben persistir entre pantallas (`AuthContext` y `ToastContext`).*
- *`hooks/`: hooks reutilizables como `useFetch`, `useAuth` y `useToast`.*
- *`pages/`: organizadas modularmente por dominio de negocio (socios, membresías, productos, etc.).*
- *`routes/`: maneja la configuración declarativa de rutas y los componentes de guarda (`ProtectedRoute` y `RoleRoute`).*
- *`utils/`: funciones de soporte puro sin JSX (`businessRules.js`, `logger.js`, `formatters.js`).*
- *`constants/`: enumeraciones del sistema como los roles (`admin`, `staff`)."*

### (b) Árbol de Directorios y Diagrama de Flujo

```
src/
 ├── api/             # Capa de Integración HTTP
 ├── components/      # Componentes UI (common y layout)
 ├── constants/       # Constantes y Enums
 ├── context/         # Estados globales
 ├── hooks/           # Custom Hooks
 ├── pages/           # Vistas y pantallas
 ├── routes/          # Enrutamiento y guardas
 └── utils/           # Reglas de negocio y utilidades
```

#### Diagrama del Flujo de Datos:
```
Usuario interactúa en Pantalla (Página en src/pages/)
  │
  ▼
Invoca Función del Servicio de Dominio (src/api/sociosService.js)
  │
  ▼
Ejecuta Instancia Centralizada (src/api/axiosInstance.js)
  ├── Registra petición saliente en el Logger (src/utils/logger.js)
  ▼
Petición HTTP asíncrona hacia json-server (:3001/socios)
  │
  ▼
Respuesta HTTP recibida por Interceptor de Respuesta
  ├── Registra respuesta / error en el Logger
  ▼
Servicio retorna datos puros a la Página
  │
  ▼
Página actualiza su useState y React repinta la UI (<Table />, <Toast />, etc.)
```

### (c) Fragmento mínimo de código para mostrar en pantalla

```javascript
// src/api/sociosService.js
import api from './axiosInstance';

export const sociosService = {
  getAll: async () => {
    const res = await api.get('/socios');
    return res.data;
  },
  create: async (socioData) => {
    const payload = {
      ...socioData,
      fecha_registro: new Date().toISOString().split('T')[0],
      activo: true,
    };
    const res = await api.post('/socios', payload);
    return res.data;
  },
  // Desactivación lógica (Regla R2)
  deactivate: async (id) => {
    const res = await api.patch(`/socios/${id}`, { activo: false });
    return res.data;
  },
};
```

### (d) Posible pregunta de seguimiento de la docente
**Docente:** *"¿Por qué creaste carpetas `api/` separadas en lugar de hacer el `axios.get()` directamente en el `useEffect` de la página?"*
**Tu respuesta:** *"Por mantenibilidad y principio de responsabilidad única. Si mañana la ruta del backend cambia de `/socios` a `/api/v1/members`, solo modifico una línea en `sociosService.js` y no tengo que buscar y cambiar múltiples páginas que consuman ese mismo endpoint."*

---

## 5. Lógica de una Interfaz Macro: "Contratar Membresía" (`NuevaMembresiaPage.jsx`)

### (a) Respuesta corta para decir en voz alta (1-2 minutos)
*"La pantalla 'Contratar Membresía' (`src/pages/membresias/NuevaMembresiaPage.jsx`) es un flujo macro que implementa el requerimiento RF14. 
En el `useEffect` inicial se cargan en paralelo mediante `Promise.all()` los socios activos, el catálogo de productos y las categorías.*

*Consta de tres momentos:*
1. *Selección de Socio: Al elegir un socio, el sistema consulta de inmediato su historial con `membresiasService.getBySocioId()`. Ejecuta la función pura `evaluarPrimeraMembresia()`. Si no tiene membresías previas, activa en pantalla la alerta de la **Regla R5** informando que recibirá un pase de invitado bono.*
2. *Selección de Productos: Los productos se muestran agrupados por categoría. El usuario puede marcar múltiples servicios con casillas de verificación.*
3. *Resumen Financiero en Vivo: En cada cambio de selección, se invocan dos funciones puras de `businessRules.js`: `calcularMontoMembresia()` aplica automáticamente el 15% de descuento si se eligen 4 o más productos (**Regla R4**); y `calcularLimitePases()` recalcula los pases de invitado según la **Regla R1** (2 pases por 1 producto, 5 pases por 2+) sumando el bono de bienvenida de la **Regla R5**.*

*Al hacer clic en 'Registrar Pago y Activar', se crea la membresía activa por 1 mes calendario en `/membresias` y sus productos en `/membresia_producto`, mostrando un Toast de confirmación y redirigiendo al historial."*

### (b) Recorrido paso a paso por el código
1. El usuario entra a `/membresias/nueva`. Se activa `loadData()` que obtiene socios activos (`s.activo === true`), productos y categorías.
2. El usuario selecciona a un socio en el `<select>`. Se dispara `handleSocioChange(socioId)`.
3. Se hace la llamada asíncrona a `membresiasService.getBySocioId(socioId)`. Si `historial.length === 0`, `setIsPrimeraMembresia(true)`.
4. El usuario hace clic en los productos. La función `handleToggleProduct(prodId)` agrega o remueve el ID en el estado `selectedProductIds`.
5. En cada render, se calcula:
   ```javascript
   const selectedProducts = productos.filter((p) => selectedProductIds.includes(p.id));
   const financialSummary = calcularMontoMembresia(selectedProducts);
   const pasesSummary = calcularLimitePases(selectedProducts, isPrimeraMembresia);
   ```
6. En pantalla se actualiza en tiempo real el subtotal, el descuento aplicado (si `aplicaDescuento === true`) y el monto total en Soles (`formatCurrency`).
7. Al hacer clic en el botón de confirmación, se calcula `fechaInicio = hoy` y `fechaFin = hoy + 1 mes`.
8. Se invoca a `membresiasService.create()` que guarda la cabecera en `/membresias` y cada detalle en `/membresia_producto`.

### (c) Fragmento mínimo de código para mostrar en pantalla

```jsx
// src/pages/membresias/NuevaMembresiaPage.jsx (Líneas 69-95)
// Productos seleccionados actualmente
const selectedProducts = productos.filter((p) => selectedProductIds.includes(p.id));

// Cálculo financiero puro (Regla R4)
const financialSummary = calcularMontoMembresia(selectedProducts);

// Cálculo de pases puro (Reglas R1 & R5)
const pasesSummary = calcularLimitePases(selectedProducts, isPrimeraMembresia);
```

```jsx
// Resumen visible en pantalla con desglose de la Regla R4
{financialSummary.aplicaDescuento && (
  <div className="flex justify-between text-emerald-400 font-semibold">
    <span>Descuento 15% (R4)</span>
    <span className="font-mono">-{formatCurrency(financialSummary.montoDescuento)}</span>
  </div>
)}
```

### (d) Posible pregunta de seguimiento de la docente
**Docente:** *"¿Cómo aseguras que el usuario no contrate una membresía sin seleccionar socio o sin seleccionar productos?"*
**Tu respuesta:** *"Lo aseguramos en dos niveles: en la interfaz deshabilitamos el botón de confirmación con la propiedad `disabled={!selectedSocioId || selectedProducts.length === 0}`, y adicionalmente, dentro de la función `handleConfirmarContratacion()`, tenemos cláusulas de guarda (`early return`) que disparan alertas mediante `addToast('Debe elegir al menos un producto', 'error')` en caso de que se intente forzar el envío."*

---

## 6. Regla de Negocio: Regla R4 (Descuento del 15% por Volumen de Productos)

### (a) Respuesta corta para decir en voz alta (1-2 minutos)
*"La Regla R4 establece que si una membresía contrata 4 o más productos individuales, el monto total equivale a la suma de sus precios base con un 15% de descuento (`monto_total = suma × 0.85`). Si tiene entre 1 y 3 productos, se cobra la suma completa sin descuento.*

*La implementamos en `src/utils/businessRules.js` mediante la función pura `calcularMontoMembresia(productos)`. Esta función no muta variables externas ni llama a ninguna API: recibe un arreglo de productos y retorna un objeto estructurado con el subtotal, el porcentaje, el monto descontado, el total final, un flag booleano y un mensaje descriptivo.*

*Esta regla es utilizada directamente en la pantalla de 'Contratar Membresía' (`NuevaMembresiaPage.jsx`), permitiendo que el recepcionista y el socio vean el desglose transparente antes de confirmar el pago."*

### (b) Recorrido paso a paso por el código
1. Se abre `src/utils/businessRules.js`.
2. Se localiza la función `calcularMontoMembresia(productos)`.
3. Calcula el subtotal acumulando `precio_base` mediante `.reduce()`.
4. Evalúa la condición booleana: `const aplicaDescuento = cantidad >= 4;`.
5. Si es verdadero, calcula `montoDescuento = subtotal * 0.15` y `montoTotal = subtotal - montoDescuento`.
6. Si es falso, `montoDescuento = 0` y `montoTotal = subtotal`.
7. Construye el mensaje amigable: si tiene 2 productos, le dice *"Agrega 2 producto(s) más para acceder al 15% de descuento por volumen (Regla R4)"*. Al alcanzar el cuarto producto, el mensaje cambia a *"¡Descuento del 15% aplicado por contratar 4 productos! (Regla R4)"*.

### (c) Fragmento mínimo de código para mostrar en pantalla

```javascript
// src/utils/businessRules.js (Líneas 59-86)
/**
 * REGLA R4: Descuento por Volumen de Productos en Membresía
 * @rule R4: Si la membresía tiene 4 o más productos contratados,
 *           monto_total = suma * 0.85 (15% de descuento automático).
 */
export function calcularMontoMembresia(productos = []) {
  const subtotal = productos.reduce((acc, p) => acc + (Number(p.precio_base) || 0), 0);
  const cantidad = productos.length;
  const aplicaDescuento = cantidad >= 4;
  const porcentajeDescuento = aplicaDescuento ? 15 : 0;
  const montoDescuento = aplicaDescuento ? subtotal * 0.15 : 0;
  const montoTotal = subtotal - montoDescuento;

  const mensaje = aplicaDescuento
    ? `¡Descuento del 15% aplicado por contratar ${cantidad} productos! (Regla R4)`
    : cantidad > 0
    ? `Agrega ${4 - cantidad} producto(s) más para acceder al 15% de descuento por volumen (Regla R4).`
    : 'Seleccione productos para calcular el monto.';

  return {
    subtotal: Number(subtotal.toFixed(2)),
    porcentajeDescuento,
    montoDescuento: Number(montoDescuento.toFixed(2)),
    montoTotal: Number(montoTotal.toFixed(2)),
    aplicaDescuento,
    mensaje,
  };
}
```

### (d) Ejemplos numéricos y Mensajes al Usuario

- **Ejemplo 1 (Cumplimiento de R4 - 4 productos contratados):**
  - Productos seleccionados: Musculación (S/. 120), Spinning (S/. 80), Sauna (S/. 65), Casillero (S/. 35).
  - Suma / Subtotal: **S/. 300.00**.
  - Cantidad: 4 productos (cumple `cantidad >= 4`).
  - Descuento aplicado (15%): **S/. 45.00**.
  - Total a pagar: **S/. 255.00**.
  - Mensaje que ve el usuario en verde: *"¡Descuento del 15% aplicado por contratar 4 productos! (Regla R4)"*.

- **Ejemplo 2 (Sin descuento - 3 productos contratados):**
  - Productos seleccionados: Musculación (S/. 120), Spinning (S/. 80), Sauna (S/. 65).
  - Suma / Subtotal: **S/. 265.00**.
  - Cantidad: 3 productos (no alcanza el umbral de 4).
  - Descuento aplicado (0%): **S/. 0.00**.
  - Total a pagar: **S/. 265.00**.
  - Mensaje orientativo al usuario: *"Agrega 1 producto(s) más para acceder al 15% de descuento por volumen (Regla R4)"*.

---

## 7. Diez Preguntas Extra que Podría Hacer la Docente

### P1: "¿Por qué utilizas Context API en lugar de una librería como Redux o Zustand?"
**Respuesta:** *"Porque para el alcance de este Avance 1, los únicos estados verdaderamente globales son la sesión del usuario (`AuthContext`) y las notificaciones flotantes (`ToastContext`). Utilizar Redux o Zustand agregaría dependencias y complejidad ('boilerplate') innecesaria para un estado que se resuelve limpiamente con las herramientas nativas de React."*

### P2: "¿Qué sucede en el front-end si el servidor `json-server` se cae o no está corriendo?"
**Respuesta:** *"El interceptor de error en `axiosInstance.js` captura el fallo de red (`ERR_NETWORK`), genera automáticamente un log de nivel `ERROR` en el sistema de auditoría, y las páginas atrapan la excepción en su bloque `catch`, mostrando nuestro componente `<ErrorMessage />` con un mensaje amigable y un botón para reintentar la conexión sin romper la aplicación."*

### P3: "¿Por qué los socios tienen borrado lógico (`activo: false`) pero las asistencias tienen borrado físico (`DELETE`)?"
**Respuesta:** *"Porque el socio es una entidad maestra de negocio sujeta a la **Regla R2**: si elimináramos físicamente a un socio, romperíamos la integridad referencial histórica de sus membresías pasadas y asistencias. En cambio, en asistencias se permite el borrado físico (RF21) para corregir registros duplicados o lecturas erróneas de molinete cometidas por el personal de recepción."*

### P4: "¿Por qué definiste las reglas de negocio como funciones puras en un archivo separado (`businessRules.js`)?"
**Respuesta:** *"Porque las funciones puras dependen únicamente de sus argumentos de entrada y no tienen efectos secundarios. Esto permite testearlas de manera aislada (como hicimos con nuestro script de pruebas unitarias), reutilizarlas en múltiples componentes sin acoplarlas al ciclo de vida de React y explicarlas fácilmente ante una auditoría."*

### P5: "¿Dónde se guardan los datos si el usuario recarga la página (F5)?"
**Respuesta:** *"La sesión del usuario se recupera de `localStorage` bajo la clave `powerfit_user`, los logs se recuperan de `powerfit_logs`, y los datos del gimnasio (socios, membresías, productos) se vuelven a solicitar a la API dummy (`json-server`), la cual persiste en el archivo físico `db.json`."*

### P6: "¿Cómo validas que un socio no ingrese dos veces con membresía vencida?"
**Respuesta:** *"En la pantalla 'Registrar Asistencia' (`NuevaAsistenciaPage.jsx`), la función pura `validarMembresiaVigente()` revisa que exista al menos una membresía con `estado === 'activa'` y que `fecha_fin >= hoy`. Si está vencida o cancelada, la interfaz muestra una tarjeta roja bloqueante de 'ACCESO DENEGADO' e inhabilita el botón de confirmación."*

### P7: "¿Qué pasa con la Regla R5 si el socio ya tiene membresías en el historial?"
**Respuesta:** *"Al seleccionar el socio, consultamos sus membresías en `/membresias?socio_id=X`. Si la lista tiene longitud mayor a 0, `esPrimera` se establece en `false`, por lo que no se le suma el bono de bienvenida y solo recibe los pases que le corresponden estrictamente según la Regla R1."*

### P8: "¿Cómo garantizas la accesibilidad en los formularios y modales?"
**Respuesta:** *"En `Modal.jsx`, agregamos un `useEffect` que escucha la tecla `Escape` para cerrar la ventana y permitimos el cierre al hacer clic en el backdrop exterior. En `FormField.jsx`, vinculamos cada etiqueta con su input mediante el atributo `htmlFor` e `id`, y los botones tienen estados de foco visibles y atributos de accesibilidad."*

### P9: "¿Cómo organizaste el diseño responsive y los estilos?"
**Respuesta:** *"Utilizamos Tailwind CSS con una paleta personalizada en `tailwind.config.js`. Diseñamos bajo el principio 'mobile-first': en pantallas móviles el menú lateral (`Sidebar.jsx`) se convierte en un cajón desplegable con botón hamburguesa y backdrop, y las tablas cuentan con contenedores `overflow-x-auto` para visualización táctil horizontal."*

### P10: "¿Qué librería de iconos utilizaste y por qué?"
**Respuesta:** *"Utilizamos `lucide-react`. Es una librería moderna basada en SVGs limpios que permite importar únicamente los iconos requeridos mediante tree-shaking, evitando sobrecargar el bundle de producción de Vite."*

---

## 8. Puntos Débiles del Proyecto y Cómo Defenderlos con Honestidad

Si la docente es exigente, podría señalar algunos aspectos del diseño. A continuación tienes la justificación técnica adecuada:

### 1. "Estás guardando la contraseña en texto plano en `db.json` y la sesión en `localStorage`."
- **Cómo responder:** *"Tiene toda la razón, profesora. Para este Avance 1, el requerimiento explícito fue implementar un front-end simulado con `json-server` sin un backend real ni JWT. En un entorno de producción real, las contraseñas jamás viajarían en texto plano ni se almacenarían en un JSON local: estarían hasheadas con bcrypt en una base de datos segura y la autenticación se gestionaría mediante tokens HttpOnly cookies con expiración y protección CSRF."*

### 2. "Si dos recepcionistas abren la aplicación a la vez, no hay sincronización en tiempo real."
- **Cómo responder:** *"Correcto. Como se especificó en las restricciones del proyecto, no se solicitó la implementación de WebSockets ni polling reactivo en este avance. La consistencia se garantiza porque cada acción (como registrar asistencia o crear membresía) realiza una petición HTTP directa que actualiza `db.json` y refresca el estado local mediante llamadas inmediatas a `loadData()`."*

### 3. "La paginación de la tabla se hace en el cliente (en memoria) y no en el servidor."
- **Cómo responder:** *"Efectivamente. En `src/components/common/Table.jsx` aplicamos paginación y búsqueda en memoria porque para un gimnasio mediano con unos cientos de socios activos en un dummy local, el rendimiento en cliente es instantáneo y ahorra latencia de red. Sin embargo, nuestro servicio `sociosService.js` está preparado para que, en un avance posterior con backend real, podamos enviarle los parámetros `?_page=1&_limit=10` de json-server para paginación del lado del servidor."*
