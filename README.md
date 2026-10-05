# PowerFit GYM - Sistema Web de Gestión Administrativa (Avance 1)

Sistema web Front-End desarrollado con **React + Vite**, **JavaScript**, **Tailwind CSS**, **React Router DOM v7**, **Axios** y persistencia dummy con **json-server**. Diseñado para el personal administrativo y operativo de un gimnasio bajo un modelo de suscripción mensual de **servicios individuales**.

---

## 1. Instrucciones de Instalación y Ejecución

### Requisitos Previos
- **Node.js** v18 o superior.
- **npm** v9 o superior.

### Paso 1: Instalación de Dependencias
Abre una terminal en la raíz del proyecto (`powerfit-gym`):
```bash
npm install
```

### Paso 2: Iniciar la API Dummy (json-server en puerto 3001)
En una primera terminal, levanta el servidor dummy:
```bash
npm run api
```
> Esto iniciará `json-server --watch db.json --port 3001` exponiendo las 8 colecciones del sistema.

### Paso 3: Iniciar el Entorno de Desarrollo (Vite)
En una segunda terminal, ejecuta:
```bash
npm run dev
```
> Abre tu navegador en la URL indicada por Vite (habitualmente `http://localhost:5173`).

### Credenciales de Acceso para Pruebas (Sustentación Oral)
El sistema incluye botones de **acceso rápido con 1-clic** en la pantalla de Login:
- **Administrador**: `admin@powerfit.com` | Contraseña: `admin` (Acceso completo a todos los módulos).
- **Staff / Recepción**: `staff@powerfit.com` | Contraseña: `staff` (Gestión operativa de socios, membresías, asistencias y pases).

---

## 2. Estructura de Carpetas y Responsabilidades

```
src/
 ├─ api/
 │   ├─ axiosInstance.js       # Instancia centralizada de Axios con interceptores de auditoría
 │   ├─ sociosService.js       # CRUD de socios (RF01 - RF04)
 │   ├─ categoriasService.js   # CRUD de categorías (RF07 - RF09)
 │   ├─ productosService.js    # CRUD de productos y servicios (RF10 - RF13)
 │   ├─ usuariosService.js     # Gestión de usuarios del sistema (RF05 - RF06)
 │   ├─ membresiasService.js   # Contratación, historial y cancelación de membresías (RF14 - RF16)
 │   ├─ pasesService.js        # Emisión y consulta de pases de invitado (RF17)
 │   └─ asistenciasService.js  # Control y validación de asistencias (RF18 - RF21)
 ├─ components/
 │   ├─ common/                # Componentes atómicos y moleculares reutilizables
 │   │   ├─ Button.jsx         # Botones polimórficos con estados loading y variantes
 │   │   ├─ FormField.jsx      # Campos de formulario (input, select, textarea) con errores
 │   │   ├─ Modal.jsx          # Diálogo flotante con soporte para tecla Escape
 │   │   ├─ Table.jsx          # Tabla con buscador dinámico, paginación y empty state
 │   │   ├─ Loader.jsx         # Spinner accesible con mensaje
 │   │   ├─ ErrorMessage.jsx   # Alerta de error con botón de reintento
 │   │   └─ ConfirmDialog.jsx  # Diálogo de confirmación para acciones destructivas
 │   └─ layout/
 │       ├─ Navbar.jsx         # Barra superior con datos de sesión, badge de rol y logout
 │       ├─ Sidebar.jsx        # Menú lateral responsive con control visual por rol
 │       └─ MainLayout.jsx     # Shell contenedor principal
 ├─ context/
 │   ├─ AuthContext.jsx        # Estado global de usuario, login simulado y persistencia en localStorage
 │   └─ ToastContext.jsx       # Sistema global de notificaciones flotantes (éxito, error, info)
 ├─ routes/
 │   ├─ AppRoutes.jsx          # Configuración declarativa de rutas públicas, protegidas y 404
 │   ├─ ProtectedRoute.jsx     # Bloqueo de accesos anónimos (redirige a /login)
 │   └─ RoleRoute.jsx          # Control de acceso basado en roles RBAC (redirige a /403)
 ├─ utils/
 │   ├─ businessRules.js       # Funciones puras con reglas de negocio R1, R4 y R5 con JSDoc
 │   ├─ logger.js              # Sistema de logs (INFO, WARN, ERROR) con persistencia en localStorage
 │   └─ formatters.js          # Formateadores de moneda (PEN S/.) y fechas (DD/MM/YYYY)
 ├─ constants/
 │   └─ roles.js               # Constantes de roles ('admin', 'staff')
 └─ pages/                     # Vistas organizadas por módulo funcional
     ├─ auth/Login.jsx
     ├─ dashboard/Dashboard.jsx
     ├─ socios/SociosPage.jsx
     ├─ categorias/CategoriasPage.jsx
     ├─ productos/ProductosPage.jsx
     ├─ usuarios/UsuariosPage.jsx
     ├─ membresias/
     │   ├─ MembresiasPage.jsx
     │   └─ NuevaMembresiaPage.jsx
     ├─ asistencias/
     │   ├─ AsistenciasPage.jsx
     │   └─ NuevaAsistenciaPage.jsx
     ├─ pases/PasesPage.jsx
     ├─ logs/LogsPage.jsx
     ├─ unauthorized/Unauthorized403.jsx
     └─ notfound/NotFound404.jsx
```

---

## 3. Mecanismo de Redireccionamiento y Autenticación

1. **Rutas Públicas vs Protegidas**:
   - `/login` es la única ruta pública. Si un usuario ya autenticado intenta navegar a `/login`, el componente lo redirige de inmediato a `/dashboard` mediante `<Navigate to="/dashboard" replace />`.
   - Cualquier intento de acceder a rutas internas sin una sesión válida es interceptado por `ProtectedRoute.jsx`, el cual guarda la ubicación intentada en `state.from` y redirige a `/login`.
2. **Control de Acceso Basado en Roles (RBAC)**:
   - Las rutas administrativas (`/categorias`, `/productos`, `/usuarios`, `/logs`) están envueltas en `<RoleRoute allowedRoles={['admin']}>`.
   - Si un usuario con rol `staff` intenta ingresar manualmente a una de estas URLs, `RoleRoute` registra un log `WARN` de seguridad y lo redirige a la vista especial `/403` (Área No Autorizada) con opción de retorno al Dashboard.
3. **Manejo de Rutas Desconocidas (404)**:
   - Toda ruta no registrada coincide con `<Route path="*" element={<NotFound404 />} />`.

---

## 4. Consumo de API y Manejo de Interceptores (Axios)

Todas las llamadas HTTP se canalizan a través de `src/api/axiosInstance.js`:
- **BaseURL**: `http://localhost:3001`
- **Interceptor de Solicitud (Request)**: Intercepta cada petición saliente antes de emitirse y registra un log `INFO` con el método HTTP, la URL y el cuerpo enviado.
- **Interceptor de Respuesta (Response)**: 
  - Para respuestas exitosas (`2xx`), registra un log `INFO` con el código de estado y conteo de elementos.
  - Para respuestas de error (`4xx`, `5xx` o pérdida de conexión `ERR_NETWORK`), captura la excepción, registra un log `ERROR` con la traza completa y rechaza la promesa para ser manejada en el bloque `catch`.
- **Patrón en Pantallas**: Cada vista implementa el ciclo `try / catch / finally` controlando tres estados reactivos:
  1. `loading`: Renderiza `<Loader />` con mensaje contextual.
  2. `error`: Renderiza `<ErrorMessage />` con botón de reintento en vivo.
  3. `success`: Renderiza los datos en `<Table />` y dispara notificaciones mediante `useToast()`.

---

## 5. Sistema de Auditoría y Logs (`utils/logger.js`)

Diseñado para responder a la pregunta de la docente sobre trazabilidad:
- **Niveles Soportados**:
  - `INFO`: Peticiones exitosas, inicio/cierre de sesión, altas de registros.
  - `WARN`: Intentos de navegación a rutas 403, contraseñas erróneas, desactivación de socios.
  - `ERROR`: Caída de conexión con json-server, excepciones capturadas en peticiones.
- **Persistencia**: Se almacena en `localStorage` bajo la clave `powerfit_logs` manteniendo los últimos 100 registros cronológicos.
- **Interfaz Visual (`/logs`)**: Exclusiva para el Administrador, permite filtrar por nivel y módulo, buscar texto, inspeccionar el JSON formateado de cada log, exportar un archivo `.json` descargable y limpiar el historial.

---

## 6. Lógica de Construcción de las Pantallas Macro

### A. "Contratar Membresía" (`NuevaMembresiaPage.jsx` - RF14)
1. **Paso 1 (Selección de Socio)**: El staff selecciona un socio activo. El sistema consulta su historial en `/membresias?socio_id=X` y ejecuta la función pura `evaluarPrimeraMembresia()`. Si no tiene membresías previas, activa el indicador **Regla R5** (+1 pase bono de bienvenida).
2. **Paso 2 (Catálogo por Categoría)**: Muestra los servicios individuales disponibles agrupados por categoría (`Acceso y Musculación`, `Clases Dirigidas`, `Zona Húmeda`, `Servicios Complementarios`).
3. **Paso 3 (Cálculo Dinámico en Tiempo Real)**:
   - Ejecuta `calcularMontoMembresia(productos)` (**Regla R4**): si el usuario selecciona 4 o más productos, descuenta automáticamente el 15% del total (`monto_total = subtotal * 0.85`).
   - Ejecuta `calcularLimitePases(productos, esPrimera)` (**Reglas R1 y R5**): calcula 2 o 5 pases base más el pase adicional si aplica.
4. **Paso 4 (Registro y Facturación)**: Crea el registro en `/membresias` con vigencia de 1 mes y genera las entradas en `/membresia_producto`.

### B. "Registrar Asistencia" (`NuevaAsistenciaPage.jsx` - RF18)
1. **Búsqueda**: El personal busca al socio por DNI o nombre completo.
2. **Validación Automática de Vigencia**: Ejecuta `validarMembresiaVigente()`:
   - Verifica si el socio está activo (Regla R2).
   - Busca si posee alguna membresía con `estado === 'activa'` y `fecha_fin >= hoy`.
3. **Feedback Visual Bloqueante**:
   - Si está vigente: Tarjeta verde con **"ACCESO AUTORIZADO"**, mostrando la fecha de caducidad.
   - Si está vencida o sin membresía: Tarjeta roja con **"ACCESO DENEGADO"**, inhabilitando el botón de ingreso.
4. **Confirmación**: Registra la asistencia en `/asistencias` con fecha/hora actual y sede seleccionada.

---

## 7. Mapeo Integral: Funcionalidad (RF01 - RF21) vs Interfaz, Ruta y Archivo

| Requisito | Nombre de la Funcionalidad | Interfaz / Ruta | Componente / Archivo | Rol | Operación HTTP |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RF01** | Registrar socio | `/socios` (Modal) | `src/pages/socios/SociosPage.jsx` | admin, staff | POST `/socios` |
| **RF02** | Listar / consultar socios | `/socios` | `src/pages/socios/SociosPage.jsx` | admin, staff | GET `/socios` |
| **RF03** | Editar socio | `/socios` (Modal) | `src/pages/socios/SociosPage.jsx` | admin, staff | PATCH `/socios/:id` |
| **RF04** | Desactivar socio (borrado lógico R2) | `/socios` (ConfirmDialog) | `src/pages/socios/SociosPage.jsx` | admin, staff | PATCH `/socios/:id` |
| **RF05** | Registrar usuario | `/usuarios` (Modal) | `src/pages/usuarios/UsuariosPage.jsx` | admin | POST `/usuarios` |
| **RF06** | Editar usuario | `/usuarios` (Modal) | `src/pages/usuarios/UsuariosPage.jsx` | admin | PATCH `/usuarios/:id` |
| **RF07** | Registrar categoría | `/categorias` (Modal) | `src/pages/categorias/CategoriasPage.jsx` | admin | POST `/categorias` |
| **RF08** | Listar categorías | `/categorias` | `src/pages/categorias/CategoriasPage.jsx` | admin | GET `/categorias` |
| **RF09** | Editar categoría | `/categorias` (Modal) | `src/pages/categorias/CategoriasPage.jsx` | admin | PATCH `/categorias/:id` |
| **RF10** | Registrar producto | `/productos` (Modal) | `src/pages/productos/ProductosPage.jsx` | admin | POST `/productos` |
| **RF11** | Listar productos | `/productos` | `src/pages/productos/ProductosPage.jsx` | admin | GET `/productos` |
| **RF12** | Editar producto | `/productos` (Modal) | `src/pages/productos/ProductosPage.jsx` | admin | PATCH `/productos/:id` |
| **RF13** | Desactivar producto (borrado lógico) | `/productos` (ConfirmDialog) | `src/pages/productos/ProductosPage.jsx` | admin | PATCH `/productos/:id` |
| **RF14** | Contratar membresía (macro flujo) | `/membresias/nueva` | `src/pages/membresias/NuevaMembresiaPage.jsx` | admin, staff | POST `/membresias` + `/membresia_producto` |
| **RF15** | Historial de membresías | `/membresias` | `src/pages/membresias/MembresiasPage.jsx` | admin, staff | GET `/membresias` |
| **RF16** | Cancelar membresía (lógico) | `/membresias` (ConfirmDialog) | `src/pages/membresias/MembresiasPage.jsx` | admin, staff | PATCH `/membresias/:id` |
| **RF17** | Generar pase de invitado (macro flujo)| `/pases` (Modal) | `src/pages/pases/PasesPage.jsx` | admin, staff | POST `/pases_invitado` |
| **RF18** | Registrar asistencia (macro flujo) | `/asistencias/nueva` | `src/pages/asistencias/NuevaAsistenciaPage.jsx` | admin, staff | POST `/asistencias` |
| **RF19** | Listar y filtrar asistencias | `/asistencias` | `src/pages/asistencias/AsistenciasPage.jsx` | admin, staff | GET `/asistencias` |
| **RF20** | Editar / corregir asistencia | `/asistencias` (Modal) | `src/pages/asistencias/AsistenciasPage.jsx` | admin, staff | PATCH `/asistencias/:id` |
| **RF21** | Eliminar asistencia (físico) | `/asistencias` (ConfirmDialog) | `src/pages/asistencias/AsistenciasPage.jsx` | admin, staff | DELETE `/asistencias/:id` |

---

## 8. Cumplimiento de Reglas de Negocio (`src/utils/businessRules.js`)

- **Regla R1**: Membresía con 1 producto (acceso) otorga 2 pases; membresía con 2 o más productos otorga 5 pases.
- **Regla R2**: Al desactivar un socio no se eliminan sus asistencias ni membresías; la vista filtra activos por defecto y dispone de una pestaña dedicada a **"Historial Inactivos"** para consulta forense.
- **Regla R3**: Solo los roles `admin` y `staff` pueden operar el sistema mediante rutas protegidas y validación en la UI. Adicionalmente, la administración de usuarios, categorías y productos está reservada exclusivamente para `admin`.
- **Regla R4**: Si se contratan 4 o más productos en la membresía, se aplica automáticamente un **15% de descuento** sobre la suma total de los precios base.
- **Regla R5**: Si el socio no tiene membresías previas (`es_primera = true`), se le otorga **+1 pase de invitado adicional de bienvenida** (se suma al límite calculado en R1).

---

## 9. Despliegue en la Nube (Vercel + Render)

El proyecto está preparado para desplegarse de manera desacoplada y gratuita en la nube:

### A. Despliegue de la API Dummy en Render (Backend / json-server)
1. Sube tu código a un repositorio en **GitHub**.
2. Ingresa a [Render.com](https://render.com) y crea un nuevo **Web Service**.
3. Conecta tu repositorio de GitHub.
4. Configura los siguientes parámetros en Render:
   - **Name**: `powerfit-gym-api` (o el nombre que elijas).
   - **Environment**: `Node`.
   - **Build Command**: `npm install`
   - **Start Command**: `npm run api` *(ejecuta `json-server --watch db.json --host 0.0.0.0 --port $PORT` utilizando el puerto dinámico de Render)*.
5. Selecciona el plan gratuito (**Free**) y haz clic en **Create Web Service**.
6. Una vez desplegado, copia la URL pública generada (ej. `https://powerfit-gym-api.onrender.com`).

---

### B. Despliegue del Front-End en Vercel
1. Ingresa a [Vercel.com](https://vercel.com) y selecciona **Add New... -> Project**.
2. Conecta tu repositorio de GitHub e importa el proyecto `powerfit-gym`.
3. Vercel detectará automáticamente **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. En la sección **Environment Variables**, añade:
   - **Key / Name**: `VITE_API_URL`
   - **Value**: La URL pública de tu API en Render (ej. `https://powerfit-gym-api.onrender.com`).
5. Haz clic en **Deploy**.
6. El archivo `vercel.json` incluido en el proyecto aplicará automáticamente las reglas de reescritura hacia `/index.html`, permitiendo que React Router DOM maneje las rutas protegidas, el login y la navegación sin errores 404 al recargar el navegador.

