# 📖 GUÍA DE LECTURA DEL CÓDIGO - Sistema Forense de ADN

## 🎯 Objetivo de esta guía

Esta guía te ayudará a entender **la ilación completa del sistema** siguiendo un orden lógico que facilita la comprensión del flujo de datos y la arquitectura.

---

## 🗺️ MAPA MENTAL DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO DE UNA PETICIÓN                       │
└─────────────────────────────────────────────────────────────────┘

1. CLIENTE hace request → http://localhost:3000/api/busquedas/ejecutar

2. SERVER.JS recibe y arranca Express

3. APP.JS configura middlewares y rutas
   ├─ CORS, Helmet, Rate Limiting
   ├─ Parsea JSON
   └─ Enruta a /api/busquedas → busquedasRoutes.js

4. ROUTES define el endpoint
   ├─ POST /ejecutar
   ├─ Aplica middlewares: proteger, validarBusqueda
   └─ Llama al controlador: ejecutarBusqueda

5. MIDDLEWARES validan
   ├─ auth.js → ¿Token válido? ¿Usuario existe?
   ├─ validacion.js → ¿Datos correctos?
   └─ Si OK → next(), si ERROR → errorHandler

6. CONTROLLER procesa
   ├─ Consulta MODELS (Usuario, Sospechoso, Busqueda)
   ├─ Ejecuta lógica de negocio (motor C++)
   ├─ Guarda en BD
   └─ Retorna respuesta JSON

7. MODELS interactúan con MongoDB
   ├─ Define schemas
   ├─ Valida datos
   └─ Métodos de instancia

8. RESPONSE vuelve al cliente
```

---

## 📚 ORDEN DE LECTURA RECOMENDADO

### 🎯 FASE 1: ENTENDER LA BASE DE DATOS (30 min)

**¿Por qué empezar aquí?**
Los modelos definen **QUÉ datos maneja el sistema**. Sin entender esto, el resto no tiene contexto.

#### 1.1 Leer Modelos en este orden:

```
✅ 1. backend/src/models/Usuario.js
   ├─ Campos: nombre, email, password, rol, activo
   ├─ Métodos: compararPassword(), pre-save (hashear password)
   └─ Roles: admin, perito, investigador

✅ 2. backend/src/models/Sospechoso.js
   ├─ Campos: nombre_completo, cedula, cadena_adn
   ├─ Validaciones: cadena solo ATCG
   └─ Base de datos permanente de sospechosos

✅ 3. backend/src/models/Busqueda.js
   ├─ Campos: usuario_id, patron, coincidencias[], tiempo_ms
   ├─ Relación: pertenece a un Usuario
   └─ Auditoría: registra cada búsqueda

✅ 4. backend/src/models/Reporte.js
   ├─ Campos: busqueda_id, ruta_archivo, hash_pdf
   ├─ Relación: pertenece a una Búsqueda
   └─ Cadena de custodia digital
```

**📝 Pregúntate al leer cada modelo:**
- ¿Qué datos almacena?
- ¿Qué validaciones tiene?
- ¿Qué relaciones tiene con otros modelos?
- ¿Tiene métodos especiales? (hooks, métodos de instancia)

---

### 🎯 FASE 2: ENTENDER LA ESTRUCTURA (20 min)

#### 2.1 Leer la configuración principal:

```
✅ 5. backend/src/server.js
   ├─ Punto de entrada del backend
   ├─ Conecta a MongoDB
   ├─ Importa app.js
   └─ Inicia servidor en puerto 3000

✅ 6. backend/src/app.js
   ├─ Configura Express
   ├─ Middlewares globales: helmet, cors, rate-limit
   ├─ Registra todas las rutas
   └─ Error handler global
```

**🔍 Enfócate en:**
```javascript
// app.js - Esta es la ilación de rutas
app.use('/api/auth', authRoutes);           // → Autenticación
app.use('/api/admin', adminRoutes);         // → Administración
app.use('/api/sospechosos', sospechososRoutes); // → Sospechosos
app.use('/api/busquedas', busquedasRoutes); // → Búsquedas
app.use('/api/reportes', reportesRoutes);   // → Reportes
app.use('/api/estadisticas', estadisticasRoutes); // → Estadísticas
```

---

### 🎯 FASE 3: ENTENDER LOS MIDDLEWARES (30 min)

**¿Por qué ahora?**
Los middlewares son el "filtro" que pasan todas las peticiones. Entenderlos te ayuda a saber qué validaciones hay.

```
✅ 7. backend/src/middlewares/errorHandler.js
   ├─ Clase ErrorAPI personalizada
   ├─ Manejo centralizado de errores
   └─ Formato estándar de respuestas de error

✅ 8. backend/src/middlewares/auth.js ⭐ CRÍTICO
   ├─ proteger(): Verifica JWT, carga usuario en req.usuario
   ├─ autorizar(...roles): Verifica rol del usuario
   └─ generarToken(): Crea JWT

   💡 Este middleware es CLAVE para la seguridad forense

✅ 9. backend/src/middlewares/validacion.js
   ├─ validarRegistro: Valida datos de nuevo usuario
   ├─ validarLogin: Valida credenciales
   ├─ validarBusqueda: Valida patrón de ADN
   └─ manejarErrores: Procesa errores de validación

✅ 10. backend/src/middlewares/upload.js
    ├─ Configuración de Multer
    ├─ Validación de archivos CSV
    └─ Límites de tamaño
```

**💡 Tip importante:**
Los middlewares se ejecutan en ORDEN. Por ejemplo:
```javascript
router.post('/ejecutar',
  proteger,           // 1º: ¿Usuario autenticado?
  validarBusqueda,    // 2º: ¿Datos válidos?
  manejarErrores,     // 3º: ¿Hubo errores de validación?
  ejecutarBusqueda    // 4º: Ejecutar controlador
);
```

---

### 🎯 FASE 4: ENTENDER LAS RUTAS Y CONTROLADORES (60 min)

**¿Por qué juntos?**
Las rutas definen **QUÉ endpoints existen** y los controladores **CÓMO se procesan**.

#### 4.1 Módulo de Autenticación (SEGURIDAD FORENSE)

```
✅ 11. backend/src/routes/authRoutes.js
    ├─ POST /api/auth/login
    ├─ GET  /api/auth/me
    └─ ⚠️ /register ELIMINADO (seguridad forense)

✅ 12. backend/src/controllers/authController.js
    ├─ iniciarSesion(): Valida credenciales, retorna JWT
    ├─ obtenerPerfil(): Retorna usuario actual
    └─ ⚠️ registrarUsuario ELIMINADO
```

**📝 Flujo de Login:**
```
1. Cliente envía: { email, password }
2. Controller busca usuario en BD
3. Compara password hasheado
4. Genera JWT
5. Retorna: { token, usuario }
```

#### 4.2 Módulo de Administración (NUEVO - FORENSE)

```
✅ 13. backend/src/routes/adminRoutes.js ⭐ CRÍTICO
    ├─ POST   /api/admin/usuarios/crear
    ├─ GET    /api/admin/usuarios
    ├─ GET    /api/admin/usuarios/:id
    ├─ PATCH  /api/admin/usuarios/:id
    ├─ PATCH  /api/admin/usuarios/:id/activar
    └─ PATCH  /api/admin/usuarios/:id/desactivar

    💡 Todos requieren: proteger + autorizar('admin')

✅ 14. backend/src/controllers/adminController.js ⭐ CRÍTICO
    ├─ crearUsuario(): Solo admin puede crear usuarios
    ├─ listarUsuarios(): Con filtros y paginación
    ├─ activarUsuario() / desactivarUsuario()
    └─ Auditoría completa en logs
```

**📝 Flujo de Creación de Usuario:**
```
1. Admin hace POST /api/admin/usuarios/crear
2. Middleware proteger() verifica JWT
3. Middleware autorizar('admin') verifica rol
4. Controller valida datos
5. Crea usuario en BD
6. ⚠️ Registra auditoría (quién creó a quién)
7. Retorna usuario creado (SIN token)
```

#### 4.3 Módulo de Sospechosos

```
✅ 15. backend/src/routes/sospechososRoutes.js
    ├─ POST  /api/sospechosos/carga-masiva
    ├─ GET   /api/sospechosos
    └─ GET   /api/sospechosos/:id

✅ 16. backend/src/controllers/sospechososController.js
    ├─ cargaMasiva(): Sube CSV, parsea, inserta en BD
    ├─ listarSospechosos(): Con paginación
    └─ obtenerSospechoso(): Detalles de uno
```

**📝 Flujo de Carga Masiva:**
```
1. Usuario sube CSV con multer
2. Backend parsea CSV línea por línea
3. Valida: nombre, cedula, cadena_adn (solo ATCG)
4. Inserta/actualiza en BD
5. Retorna: { insertados, actualizados, errores }
```

#### 4.4 Módulo de Búsquedas ⭐ CORE DEL SISTEMA

```
✅ 17. backend/src/routes/busquedasRoutes.js
    ├─ POST  /api/busquedas/ejecutar
    ├─ GET   /api/busquedas/historial
    └─ GET   /api/busquedas/:id

✅ 18. backend/src/controllers/busquedasController.js ⭐ MÁS IMPORTANTE
    ├─ ejecutarBusqueda():
    │   ├─ Valida patrón ADN
    │   ├─ Consulta sospechosos de BD
    │   ├─ Crea CSV temporal
    │   ├─ Ejecuta motor C++ (child_process)
    │   ├─ Parsea resultado JSON
    │   ├─ Guarda búsqueda en BD
    │   └─ Retorna coincidencias
    ├─ obtenerHistorial(): Búsquedas del usuario
    └─ obtenerBusqueda(): Detalles de búsqueda específica
```

**📝 Flujo de Búsqueda (EL MÁS COMPLEJO):**
```
1. Usuario envía: { patron: "ATCG...", caso_numero: "2025-001" }
2. Backend valida patrón (solo ATCG)
3. Consulta TODOS los sospechosos activos
4. Crea CSV temporal en /uploads/temp_xxxxx.csv
5. Ejecuta: ./busqueda_adn.exe "ATCG..." "./temp_xxxxx.csv"
6. Motor C++ procesa y retorna JSON a stdout
7. Backend parsea JSON
8. Guarda búsqueda en BD con:
   - patron
   - usuario_id (quien buscó)
   - coincidencias[]
   - tiempo_ejecucion_ms
   - algoritmo_usado
9. Retorna coincidencias al frontend
10. Elimina CSV temporal
```

#### 4.5 Módulo de Reportes

```
✅ 19. backend/src/routes/reportesRoutes.js
    ├─ POST  /api/reportes/generar/:busqueda_id
    └─ GET   /api/reportes/descargar/:id

✅ 20. backend/src/controllers/reportesController.js
    ├─ generarReporte(): Crea PDF con PDFKit
    └─ descargarReporte(): Envía archivo PDF
```

#### 4.6 Módulo de Estadísticas

```
✅ 21. backend/src/routes/estadisticasRoutes.js
    └─ GET   /api/estadisticas/resumen

✅ 22. backend/src/controllers/estadisticasController.js
    └─ obtenerResumen(): Agregaciones de MongoDB
```

---

### 🎯 FASE 5: SCRIPTS Y UTILIDADES (15 min)

```
✅ 23. backend/src/scripts/crearAdminInicial.js
    ├─ Script one-time para crear primer admin
    ├─ Lee variables de entorno
    └─ Valida que no exista admin previo
```

---

## 🔄 FLUJOS COMPLETOS DE EJEMPLO

### Flujo 1: Usuario hace LOGIN

```
📱 CLIENTE
   │
   └─> POST /api/auth/login
       Body: { email, password }
       │
       ▼
🌐 SERVER.JS → APP.JS
       │
       ▼
📍 authRoutes.js
   ├─ router.post('/login', validarLogin, manejarErrores, iniciarSesion)
   │
   ▼
🔍 validacion.js → validarLogin
   ├─ ¿Email válido?
   ├─ ¿Password presente?
   └─ Si OK → next()
       │
       ▼
🎮 authController.js → iniciarSesion()
   ├─ Busca usuario en BD (Usuario.findOne)
   ├─ Compara password (bcrypt)
   ├─ Actualiza ultimoLogin
   ├─ Genera JWT (auth.generarToken)
   └─ Retorna: { success: true, data: { token, usuario } }
       │
       ▼
📱 CLIENTE recibe token
   └─> Guarda en localStorage
   └─> Usa en futuras peticiones: Authorization: Bearer {token}
```

### Flujo 2: Admin CREA un usuario

```
📱 CLIENTE (Admin)
   │
   └─> POST /api/admin/usuarios/crear
       Headers: Authorization: Bearer {admin_token}
       Body: { nombre, email, password, rol }
       │
       ▼
🌐 SERVER.JS → APP.JS
       │
       ▼
📍 adminRoutes.js
   ├─ router.post('/usuarios/crear', proteger, autorizar('admin'), ...)
   │
   ▼
🔐 auth.js → proteger()
   ├─ Extrae token del header
   ├─ Verifica JWT con jwt.verify()
   ├─ Busca usuario en BD
   ├─ Adjunta en req.usuario
   └─> next()
       │
       ▼
🔐 auth.js → autorizar('admin')
   ├─ Verifica req.usuario.rol === 'admin'
   ├─ Si NO → 403 Forbidden
   └─ Si SÍ → next()
       │
       ▼
🔍 validacion.js → validarRegistro
       │
       ▼
🎮 adminController.js → crearUsuario()
   ├─ Valida rol permitido
   ├─ Verifica email único
   ├─ Crea usuario: Usuario.create(...)
   ├─ 📝 AUDITORÍA: Log de quién creó a quién
   └─> Retorna: { success: true, data: usuario }
       │
       ▼
📱 CLIENTE recibe confirmación
```

### Flujo 3: Perito hace BÚSQUEDA de ADN

```
📱 CLIENTE (Perito)
   │
   └─> POST /api/busquedas/ejecutar
       Headers: Authorization: Bearer {perito_token}
       Body: { patron: "ATCGATCG", caso_numero: "2025-001" }
       │
       ▼
🌐 SERVER.JS → APP.JS
       │
       ▼
📍 busquedasRoutes.js
   ├─ router.post('/ejecutar', proteger, validarBusqueda, ejecutarBusqueda)
   │
   ▼
🔐 auth.js → proteger()
   └─> Valida token, carga req.usuario
       │
       ▼
🔍 validacion.js → validarBusqueda
   ├─ Valida: patron solo ATCG
   ├─ Valida: caso_numero presente
   └─> next()
       │
       ▼
🎮 busquedasController.js → ejecutarBusqueda()
   │
   ├─1️⃣ Consulta sospechosos activos (Sospechoso.find)
   │     └─> 1000 sospechosos
   │
   ├─2️⃣ Crea CSV temporal
   │     └─> /uploads/temp_1234567.csv
   │
   ├─3️⃣ Ejecuta motor C++
   │     ├─> spawn('./busqueda_adn.exe', [patron, csvPath])
   │     ├─> C++ procesa y retorna JSON a stdout
   │     └─> { coincidencias: [...], algoritmo: "kmp", tiempo: 145 }
   │
   ├─4️⃣ Parsea resultado JSON
   │
   ├─5️⃣ Guarda en BD
   │     └─> Busqueda.create({
   │           usuario_id: req.usuario.id,
   │           patron,
   │           coincidencias,
   │           tiempo_ms,
   │           algoritmo_usado
   │         })
   │
   ├─6️⃣ Elimina CSV temporal
   │
   └─7️⃣ Retorna resultado
       │
       ▼
📱 CLIENTE recibe coincidencias
   └─> Muestra tabla de resultados
```

---

## 🎯 RESUMEN: ORDEN ÓPTIMO DE LECTURA

### Para entender el SISTEMA COMPLETO:

```
1. 📊 MODELOS (30 min)
   └─> Usuario, Sospechoso, Busqueda, Reporte

2. 🏗️ ESTRUCTURA (20 min)
   └─> server.js, app.js

3. 🔒 MIDDLEWARES (30 min)
   └─> auth.js ⭐, validacion.js, errorHandler.js

4. 🛣️ RUTAS + CONTROLADORES (60 min)
   ├─> Auth (login)
   ├─> Admin ⭐ (crear usuarios - forense)
   ├─> Sospechosos (carga masiva)
   ├─> Búsquedas ⭐⭐ (core del sistema)
   ├─> Reportes (PDF)
   └─> Estadísticas (dashboard)

5. 🛠️ SCRIPTS (15 min)
   └─> crearAdminInicial.js

TOTAL: ~2.5 horas de lectura enfocada
```

---

## 📌 CONSEJOS FINALES

### ✅ Mientras lees cada archivo:

1. **Identifica las responsabilidades**
   - ¿Qué hace este archivo?
   - ¿Con quién se comunica?

2. **Busca los imports**
   - ¿Qué dependencias usa?
   - ¿Qué otros módulos del sistema usa?

3. **Entiende el flujo de datos**
   - ¿Qué recibe? (req.body, req.params)
   - ¿Qué valida?
   - ¿Qué consulta en BD?
   - ¿Qué retorna?

4. **Nota los patrones**
   - Try-catch con next(error)
   - Middleware proteger antes de operaciones sensibles
   - Formato de respuesta: { success, data/error }

### ✅ Usa herramientas:

```bash
# Ver estructura de archivos
tree backend/src

# Buscar dónde se usa una función
grep -r "ejecutarBusqueda" backend/src

# Ver imports de un archivo
head -20 backend/src/controllers/busquedasController.js
```

---

## 🔗 RELACIONES ENTRE MÓDULOS

```
Usuario (Model)
   ├─> authController (login, perfil)
   ├─> adminController (crear usuarios) ⭐ NUEVO
   └─> Búsqueda (relación: usuario_id)

Sospechoso (Model)
   ├─> sospechososController (CRUD, carga masiva)
   └─> busquedasController (consulta para buscar)

Búsqueda (Model)
   ├─> busquedasController (ejecutar, historial)
   └─> Reporte (relación: busqueda_id)

Reporte (Model)
   └─> reportesController (generar PDF, descargar)
```

---

## ⚠️ PUNTOS CRÍTICOS DEL SISTEMA FORENSE

Mientras lees, presta ESPECIAL atención a:

### 🔴 1. Seguridad Forense
```javascript
// adminController.js - Solo admin puede crear usuarios
exports.crearUsuario = async (req, res, next) => {
  // ⚠️ Este endpoint está protegido por:
  // - proteger() → autenticación JWT
  // - autorizar('admin') → solo rol admin

  // 📝 Auditoría obligatoria
  console.log(`[AUDITORÍA] Usuario creado por admin:`, {...});
}
```

### 🔴 2. Ejecución del Motor C++
```javascript
// busquedasController.js
const { spawn } = require('child_process');
const proceso = spawn('./busqueda_adn.exe', [patron, csvPath]);

// ⚠️ Manejo de errores crítico
// ⚠️ Timeout de 60 segundos
// ⚠️ Parseo seguro de JSON
```

### 🔴 3. Validación de ADN
```javascript
// Sospechoso.js - Schema
cadena_adn: {
  type: String,
  required: true,
  validate: {
    validator: function(v) {
      return /^[ATCG]+$/.test(v); // ⚠️ Solo ATCG
    }
  }
}
```

---

**🎉 Con esta guía deberías poder entender TODO el flujo del sistema en ~2.5 horas!**
