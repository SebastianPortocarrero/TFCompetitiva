# Referencia Completa de APIs
## Sistema Forense de Identificación por ADN

**Base URL:** `http://localhost:5000/api`

---

## ¿Son APIs RESTful?

**SÍ**, el sistema sigue principios REST:

✅ **Recursos** identificados por URLs (`/api/busquedas`, `/api/sospechosos`)
✅ **Métodos HTTP** semánticos (GET, POST, PUT, PATCH, DELETE)
✅ **Stateless** (cada petición incluye JWT, no se guarda sesión en servidor)
✅ **JSON** como formato de datos
✅ **Códigos de estado HTTP** apropiados (200, 201, 400, 401, 404, 500)

---

## MongoDB vs API REST

| MongoDB (Colecciones) | API REST (Endpoints) |
|----------------------|---------------------|
| `busquedas` | `/api/busquedas/ejecutar` |
| `busquedas` | `/api/busquedas/historial` |
| `sospechosos` | `/api/sospechosos` |
| `usuarios` | `/api/admin/usuarios` |

**Las colecciones de MongoDB NO tienen por qué llamarse igual que los endpoints REST.**

---

## 1. Autenticación (`/api/auth`)

### POST `/api/auth/login`
**Descripción:** Iniciar sesión con credenciales
**Autenticación:** NO requerida
**Body:**
```json
{
  "email": "admin@pnp.gob.pe",
  "password": "Admin123!Temp"
}
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "usuario": {
      "id": "507f1f77bcf86cd799439011",
      "nombre": "Administrador del Sistema",
      "email": "admin@pnp.gob.pe",
      "rol": "admin",
      "activo": true,
      "creadoEn": "2025-01-09T10:30:00Z"
    }
  }
}
```

### GET `/api/auth/me`
**Descripción:** Obtener perfil del usuario autenticado
**Autenticación:** JWT requerido
**Headers:**
```
Authorization: Bearer <token>
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "nombre": "Administrador del Sistema",
    "email": "admin@pnp.gob.pe",
    "rol": "admin"
  }
}
```

---

## 2. Administración (`/api/admin`)

**Todos estos endpoints requieren rol `admin`**

### POST `/api/admin/usuarios/crear`
**Descripción:** Crear nuevo usuario
**Autenticación:** JWT + Rol Admin
**Body:**
```json
{
  "nombre": "Juan Investigador",
  "email": "juan@pnp.gob.pe",
  "password": "Password123!",
  "rol": "investigador"
}
```
**Roles disponibles:** `"admin"`, `"perito"`, `"investigador"`
**Response 201:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "507f1f77bcf86cd799439012",
      "nombre": "Juan Investigador",
      "email": "juan@pnp.gob.pe",
      "rol": "investigador",
      "activo": true
    }
  },
  "message": "Usuario creado exitosamente"
}
```

### GET `/api/admin/usuarios`
**Descripción:** Listar todos los usuarios
**Autenticación:** JWT + Rol Admin
**Query params:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Registros por página (default: 20, máx: 100)
- `rol` (opcional): Filtrar por rol
- `activo` (opcional): `true` o `false`

**Ejemplo:** `/api/admin/usuarios?page=1&limit=50&rol=perito`
**Response 200:**
```json
{
  "success": true,
  "data": {
    "usuarios": [
      {
        "id": "507f1f77bcf86cd799439011",
        "nombre": "Admin Sistema",
        "email": "admin@pnp.gob.pe",
        "rol": "admin",
        "activo": true,
        "creadoEn": "2025-01-09T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 10,
      "pages": 1
    }
  }
}
```

### GET `/api/admin/usuarios/:id`
**Descripción:** Obtener detalles de un usuario específico
**Autenticación:** JWT + Rol Admin
**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "nombre": "Admin Sistema",
    "email": "admin@pnp.gob.pe",
    "rol": "admin",
    "activo": true,
    "ultimoAcceso": "2025-01-10T15:30:00Z"
  }
}
```

### PATCH `/api/admin/usuarios/:id`
**Descripción:** Actualizar datos de un usuario
**Autenticación:** JWT + Rol Admin
**Body:**
```json
{
  "nombre": "Juan Pablo Investigador",
  "email": "juanp@pnp.gob.pe",
  "rol": "perito"
}
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "507f1f77bcf86cd799439012",
      "nombre": "Juan Pablo Investigador",
      "email": "juanp@pnp.gob.pe",
      "rol": "perito"
    }
  },
  "message": "Usuario actualizado"
}
```

### PATCH `/api/admin/usuarios/:id/activar`
**Descripción:** Activar cuenta de usuario
**Autenticación:** JWT + Rol Admin
**Response 200:**
```json
{
  "success": true,
  "message": "Usuario activado exitosamente"
}
```

### PATCH `/api/admin/usuarios/:id/desactivar`
**Descripción:** Desactivar cuenta de usuario
**Autenticación:** JWT + Rol Admin
**Response 200:**
```json
{
  "success": true,
  "message": "Usuario desactivado exitosamente"
}
```

---

## 3. Sospechosos (`/api/sospechosos`)

### GET `/api/sospechosos`
**Descripción:** Listar sospechosos
**Autenticación:** JWT + Rol (Admin o Perito)
**Query params:**
- `page` (opcional): Número de página
- `limit` (opcional): Registros por página (máx: 100)
- `activo` (opcional): Filtrar por estado

**Response 200:**
```json
{
  "success": true,
  "data": {
    "sospechosos": [
      {
        "id": "507f1f77bcf86cd799439011",
        "nombreCompleto": "Juan Pérez García",
        "cedula": "12345678",
        "longitudCadena": 1500,
        "activo": true,
        "fechaRegistro": "2025-01-08T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "limit": 100
    }
  }
}
```

**NOTA:** Por seguridad, **NO se devuelve la cadena ADN completa**, solo su longitud.

### GET `/api/sospechosos/:id`
**Descripción:** Obtener detalles de un sospechoso
**Autenticación:** JWT + Rol (Admin o Perito)
**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "nombreCompleto": "Juan Pérez García",
    "cedula": "12345678",
    "longitudCadena": 1500,
    "activo": true,
    "fechaRegistro": "2025-01-08T10:30:00Z"
  }
}
```

### POST `/api/sospechosos`
**Descripción:** Crear sospechoso individualmente
**Autenticación:** JWT + Rol Admin
**Body:**
```json
{
  "nombreCompleto": "María López",
  "cedula": "87654321",
  "cadenaADN": "ATCGATCGATCG..."
}
```
**Response 201:**
```json
{
  "success": true,
  "data": {
    "sospechoso": {
      "id": "507f1f77bcf86cd799439013",
      "nombreCompleto": "María López",
      "cedula": "87654321",
      "longitudCadena": 1200
    }
  },
  "message": "Sospechoso creado exitosamente"
}
```

### PUT `/api/sospechosos/:id`
**Descripción:** Actualizar datos de un sospechoso
**Autenticación:** JWT + Rol Admin
**Body:**
```json
{
  "nombreCompleto": "María Elena López",
  "cedula": "87654321",
  "cadenaADN": "ATCGATCGATCG...",
  "activo": true
}
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "sospechoso": {
      "id": "507f1f77bcf86cd799439013",
      "nombreCompleto": "María Elena López",
      "cedula": "87654321",
      "longitudCadena": 1200
    }
  },
  "message": "Sospechoso actualizado"
}
```

### DELETE `/api/sospechosos/:id`
**Descripción:** Eliminar (desactivar) sospechoso
**Autenticación:** JWT + Rol Admin
**Response 200:**
```json
{
  "success": true,
  "message": "Sospechoso eliminado"
}
```

### POST `/api/sospechosos/carga-masiva`
**Descripción:** Importar sospechosos desde CSV
**Autenticación:** JWT + Rol Admin
**Content-Type:** `multipart/form-data`
**Body:**
- `csv`: Archivo CSV

**Formato CSV esperado:**
```csv
nombre_completo,cedula,cadena_adn
Juan Perez,12345678,ATCGATCGATCG...
Maria Lopez,87654321,GCTAGCTAGCTA...
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "insertados": 2,
    "actualizados": 0,
    "errores": 0
  },
  "message": "Carga masiva completada: 2 insertados, 0 actualizados, 0 errores"
}
```

---

## 4. Búsquedas (`/api/busquedas`)

### POST `/api/busquedas/ejecutar`
**Descripción:** Ejecutar búsqueda de patrones ADN
**Autenticación:** JWT + Rol (Admin o Perito)
**Body:**
```json
{
  "patrones": ["ATCGATCG", "GCTAGCTA"],
  "casoNumero": "CASO-2024-001",
  "descripcionCaso": "Análisis forense de evidencia"
}
```

**Validaciones:**
- Cada patrón: 5-100 caracteres, solo ATCG
- `casoNumero`: Requerido
- `descripcionCaso`: Opcional, máx 500 caracteres

**Response 200:**
```json
{
  "success": true,
  "data": {
    "idBusqueda": "507f1f77bcf86cd799439014",
    "casoNumero": "CASO-2024-001",
    "patrones": ["ATCGATCG", "GCTAGCTA"],
    "algoritmoUsado": "aho-corasick",
    "totalSospechososProcesados": 3,
    "totalCoincidencias": 4,
    "coincidencias": [
      {
        "nombre": "Juan Pérez García",
        "cedula": "12345678",
        "patronId": 0,
        "patron": "ATCGATCG",
        "posicion": 42
      },
      {
        "nombre": "Juan Pérez García",
        "cedula": "12345678",
        "patronId": 0,
        "patron": "ATCGATCG",
        "posicion": 156
      },
      {
        "nombre": "María López",
        "cedula": "87654321",
        "patronId": 1,
        "patron": "GCTAGCTA",
        "posicion": 89
      },
      {
        "nombre": "María López",
        "cedula": "87654321",
        "patronId": 1,
        "patron": "GCTAGCTA",
        "posicion": 234
      }
    ],
    "tiempoEjecucionMs": 234,
    "fecha": "2025-01-10T10:30:00Z",
    "hashSha256Archivo": "4eadf0b9a87e7834c783d95831c4166cd..."
  }
}
```

**Algoritmo Automático:**
- **1 patrón:** KMP o Rabin-Karp (según longitud y complejidad)
- **2+ patrones:** Aho-Corasick (búsqueda simultánea)

### GET `/api/busquedas/historial`
**Descripción:** Obtener historial de búsquedas
**Autenticación:** JWT + Rol (Admin, Perito o Investigador)
**Query params:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Registros por página (default: 20, **máx: 100**)
- `usuarioId` (opcional): Filtrar por usuario (solo admin)
- `casoNumero` (opcional): Filtrar por número de caso
- `fechaDesde` (opcional): Fecha inicio (ISO 8601)
- `fechaHasta` (opcional): Fecha fin (ISO 8601)

**Ejemplo:** `/api/busquedas/historial?limit=50&casoNumero=CASO-2024-001`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "busquedas": [
      {
        "id": "507f1f77bcf86cd799439014",
        "casoNumero": "CASO-2024-001",
        "patrones": ["ATCGATCG", "GCTAGCTA"],
        "totalCoincidencias": 4,
        "algoritmoUsado": "aho-corasick",
        "fecha": "2025-01-10T10:30:00Z",
        "tiempoEjecucionMs": 234
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 156,
      "totalPages": 4
    }
  }
}
```

**IMPORTANTE:**
- Rol `perito`: Solo ve sus propias búsquedas
- Rol `admin` e `investigador`: Ven todas las búsquedas

### GET `/api/busquedas/:id`
**Descripción:** Obtener detalles completos de una búsqueda
**Autenticación:** JWT + Rol (Admin, Perito o Investigador)
**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "usuarioId": {
      "id": "507f1f77bcf86cd799439011",
      "nombre": "Admin Sistema",
      "email": "admin@pnp.gob.pe"
    },
    "casoNumero": "CASO-2024-001",
    "descripcionCaso": "Análisis forense de evidencia",
    "patrones": ["ATCGATCG", "GCTAGCTA"],
    "numPatrones": 2,
    "algoritmoUsado": "aho-corasick",
    "criterioSeleccion": "multiples_patrones_busqueda_simultanea",
    "totalSospechososProcesados": 3,
    "totalCoincidencias": 4,
    "coincidencias": [...],
    "tiempoEjecucionMs": 234,
    "nombreArchivoCsv": "sospechosos_1762829798785_gs3dy.csv",
    "hashSha256Archivo": "4eadf0b9a87e7834c783d95831c4166cd...",
    "fecha": "2025-01-10T10:30:00Z",
    "createdAt": "2025-01-10T10:30:00Z",
    "updatedAt": "2025-01-10T10:30:00Z"
  }
}
```

---

## 5. Reportes (`/api/reportes`)

### POST `/api/reportes/generar/:busquedaId`
**Descripción:** Generar reporte PDF de una búsqueda
**Autenticación:** JWT + Rol (Admin o Perito)
**Response 200:**
```json
{
  "success": true,
  "data": {
    "reporte": {
      "id": "507f1f77bcf86cd799439015",
      "busquedaId": "507f1f77bcf86cd799439014",
      "nombreArchivo": "reporte_CASO-2024-001_20250110.pdf",
      "rutaArchivo": "uploads/reportes/reporte_CASO-2024-001_20250110.pdf",
      "fechaGeneracion": "2025-01-10T10:35:00Z"
    }
  },
  "message": "Reporte generado exitosamente"
}
```

### GET `/api/reportes/descargar/:id`
**Descripción:** Descargar reporte PDF
**Autenticación:** JWT + Rol (Admin, Perito o Investigador)
**Response:** Binary stream (PDF)
**Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="reporte_CASO-2024-001.pdf"
```

---

## 6. Estadísticas (`/api/estadisticas`)

### GET `/api/estadisticas/resumen`
**Descripción:** Obtener resumen estadístico del sistema
**Autenticación:** JWT + Rol (Admin, Perito o Investigador)
**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_busquedas": 156,
    "total_coincidencias": 42,
    "tiempo_promedio_ms": 234.5,
    "tasa_exito": 26.9,
    "busquedas_por_dia": [
      { "fecha": "2025-01-07", "cantidad": 12 },
      { "fecha": "2025-01-08", "cantidad": 18 },
      { "fecha": "2025-01-09", "cantidad": 15 },
      { "fecha": "2025-01-10", "cantidad": 8 }
    ]
  }
}
```

**Campos:**
- `total_busquedas`: Total de búsquedas ejecutadas
- `total_coincidencias`: Total de coincidencias encontradas
- `tiempo_promedio_ms`: Tiempo promedio de ejecución en milisegundos
- `tasa_exito`: Porcentaje de búsquedas con al menos 1 coincidencia
- `busquedas_por_dia`: Tendencia de búsquedas por día (últimos 30 días)

---

## Códigos de Estado HTTP

### Exitosos
- **200 OK:** Operación exitosa
- **201 Created:** Recurso creado exitosamente

### Errores del Cliente
- **400 Bad Request:** Datos inválidos o faltantes
- **401 Unauthorized:** Token JWT inválido o expirado
- **403 Forbidden:** No tienes permisos para esta acción
- **404 Not Found:** Recurso no encontrado
- **422 Unprocessable Entity:** Errores de validación

### Errores del Servidor
- **500 Internal Server Error:** Error inesperado del servidor

---

## Formato de Errores

Todas las respuestas de error siguen este formato:

```json
{
  "success": false,
  "error": "Descripción del error",
  "message": "Mensaje adicional",
  "code": "ERROR_CODE"
}
```

**Ejemplo (401 Unauthorized):**
```json
{
  "success": false,
  "error": "No autorizado",
  "message": "Token JWT inválido o expirado"
}
```

**Ejemplo (422 Validación):**
```json
{
  "success": false,
  "error": "Errores de validación",
  "errors": [
    {
      "field": "email",
      "message": "Formato de email inválido"
    },
    {
      "field": "password",
      "message": "La contraseña debe tener al menos 8 caracteres"
    }
  ]
}
```

---

## Autenticación JWT

Todas las rutas (excepto `/api/auth/login`) requieren autenticación JWT.

**Header requerido:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expiración:** 24 horas

**Renovación:** Debes volver a hacer login cuando el token expire

---

## Roles y Permisos

| Endpoint | Admin | Perito | Investigador |
|----------|-------|--------|--------------|
| POST /api/auth/login | ✅ | ✅ | ✅ |
| GET /api/auth/me | ✅ | ✅ | ✅ |
| POST /api/admin/usuarios/crear | ✅ | ❌ | ❌ |
| GET /api/admin/usuarios | ✅ | ❌ | ❌ |
| PATCH /api/admin/usuarios/:id | ✅ | ❌ | ❌ |
| GET /api/sospechosos | ✅ | ✅ | ❌ |
| POST /api/sospechosos | ✅ | ❌ | ❌ |
| POST /api/sospechosos/carga-masiva | ✅ | ❌ | ❌ |
| POST /api/busquedas/ejecutar | ✅ | ✅ | ❌ |
| GET /api/busquedas/historial | ✅ | ✅* | ✅ |
| GET /api/busquedas/:id | ✅ | ✅* | ✅ |
| POST /api/reportes/generar/:busquedaId | ✅ | ✅ | ❌ |
| GET /api/reportes/descargar/:id | ✅ | ✅ | ✅ |
| GET /api/estadisticas/resumen | ✅ | ✅ | ✅ |

**Nota:** *Perito solo ve sus propias búsquedas

---

## Límites y Paginación

- **Máximo `limit` por página:** 100
- **Default `limit`:** 20
- **Default `page`:** 1

**Ejemplo de paginación:**
```
GET /api/busquedas/historial?page=2&limit=50
```

**Response:**
```json
{
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 156,
    "totalPages": 4
  }
}
```

---

## Resumen de Endpoints

**Total de endpoints:** 24

**Por categoría:**
- Autenticación: 2 endpoints
- Administración: 6 endpoints
- Sospechosos: 6 endpoints
- Búsquedas: 3 endpoints
- Reportes: 2 endpoints
- Estadísticas: 1 endpoint

**Por método HTTP:**
- GET: 11 endpoints
- POST: 7 endpoints
- PUT: 1 endpoint
- PATCH: 4 endpoints
- DELETE: 1 endpoint

---

**Última actualización:** 2025-01-11
**Versión de API:** 1.0
