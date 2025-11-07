# 🔍 Mejoras en el Sistema de Búsqueda de ADN

## 📅 Fecha: Noviembre 2025

---

## ✨ RESUMEN DE MEJORAS

Se han implementado mejoras significativas en la página de **Búsqueda de ADN** para proporcionar:
1. **Mejor manejo de errores** con alertas visuales amigables
2. **Más campos para reportes completos** (descripción y ubicación de evidencia)
3. **Selector de casos recientes** para facilitar el seguimiento de casos
4. **Explicación clara** del comportamiento de almacenamiento de búsquedas

---

## 🎯 MEJORAS IMPLEMENTADAS

### 1. Manejo de Errores Mejorado

#### ❌ Antes:
- Errores solo en toast (desaparecen en 3-5 segundos)
- Mensajes técnicos poco claros
- Sin información contextual

#### ✅ Ahora:
- **Alert Component Visible**: Muestra errores en una alerta roja permanente con icono de advertencia
- **Mensajes Amigables**: Errores explicados en lenguaje claro
- **Botón de Cierre**: Usuario puede cerrar el error manualmente
- **Validaciones Previas**: Detecta errores antes de enviar al backend

#### Ejemplos de Errores Mejorados:

| Código Error | Mensaje Antiguo | Mensaje Nuevo |
|--------------|-----------------|---------------|
| 400 | Bad Request | Los datos enviados no son válidos. Por favor, verifique los patrones de ADN. |
| 401 | Unauthorized | Su sesión ha expirado. Por favor, inicie sesión nuevamente. |
| 403 | Forbidden | No tiene permisos para realizar búsquedas. Contacte al administrador. |
| 500 | Internal Server Error | Error en el servidor. Por favor, intente nuevamente más tarde. |
| Sin sospechosos | - | No hay sospechosos registrados en la base de datos. Por favor, cargue sospechosos primero desde la página 'Sospechosos'. |
| Patrón corto | - | Cada patrón debe tener entre 5 y 100 caracteres. Patrones inválidos: ATCG |
| Caracteres inválidos | - | El patrón solo puede contener las bases nitrogenadas: A (Adenina), T (Timina), C (Citosina), G (Guanina) |

---

### 2. Campos Adicionales para Reportes Completos

#### Nuevos Campos en el Formulario:

**a) Descripción del Caso** (Opcional - 500 caracteres máx)
- Campo de texto multilínea
- Contador de caracteres en tiempo real
- Ejemplo: *"Análisis de evidencia encontrada en escena del crimen"*
- **Propósito**: Proporcionar contexto detallado para el reporte final

**b) Ubicación de Evidencia** (Opcional - 500 caracteres máx)
- Campo de texto simple
- Ejemplo: *"Laboratorio Forense - Sala 3"*
- **Propósito**: Rastrear la procedencia física de las muestras

**c) Número de Caso** (ya existía, mejorado)
- Ahora incluye selector de casos recientes
- Ejemplo: *"2025-0001"*

#### Beneficios para Reportes:
```
ANTES:
- Solo: Número de caso + Patrones
- Reporte mínimo sin contexto

AHORA:
- Número de caso
- Descripción del caso
- Ubicación de evidencia
- Patrones buscados
- Usuario que realizó la búsqueda
- Fecha y hora
- Algoritmo utilizado
- Resultados detallados

= REPORTE COMPLETO Y PROFESIONAL
```

---

### 3. Selector de Casos Recientes

#### Funcionalidad:
- **Carga automática** de los últimos 10 casos únicos del historial
- **Botón desplegable**: "Ver casos recientes" / "Ocultar"
- **Selección rápida**: Click en un caso para autocompletar el campo
- **Sincronización**: Funciona en ambas pestañas (Patrón Individual y Múltiples Patrones)

#### Cómo Usar:
```
1. Haga click en "Ver casos recientes" (icono de carpeta)
2. Aparecerá un panel con botones de casos anteriores
3. Click en un caso para seleccionarlo automáticamente
4. Los campos de descripción y ubicación permanecen vacíos para nueva búsqueda
```

#### Ejemplo Visual:
```
┌─────────────────────────────────────────────────────┐
│ Número de Caso (Opcional)    [Ver casos recientes] │
│ ┌─────────────────────────────────────────────┐     │
│ │ 2025-0001                                   │     │
│ └─────────────────────────────────────────────┘     │
│                                                     │
│ Seleccione un caso existente:                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │2025-0001 │ │2025-0002 │ │2025-0003 │            │
│ └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────┘
```

---

### 4. Comportamiento de Almacenamiento de Búsquedas

#### ⚠️ IMPORTANTE: Cómo Funciona el Sistema

**Pregunta**: *"Si pruebo el mismo patrón dos veces, ¿se almacena dos veces?"*

**Respuesta**: **SÍ**, cada búsqueda se almacena independientemente.

#### Explicación Detallada:

##### Escenario 1: Mismo Caso, Diferentes Patrones
```javascript
// Búsqueda 1
Caso: 2025-0001
Patrón: ATCGATCG
Resultado: 3 coincidencias
→ Se guarda en el historial (ID: 001)

// Búsqueda 2 (mismo caso, otro patrón)
Caso: 2025-0001
Patrón: GCTAGCTA
Resultado: 5 coincidencias
→ Se guarda en el historial (ID: 002)

// En el historial verás:
- 2 búsquedas diferentes
- Mismo número de caso: 2025-0001
- Patrones diferentes
```

##### Escenario 2: Mismo Caso, Mismo Patrón
```javascript
// Búsqueda 1
Caso: 2025-0001
Patrón: ATCGATCG
Fecha: 2025-11-07 10:00
→ Se guarda (ID: 001)

// Búsqueda 2 (mismo caso, mismo patrón)
Caso: 2025-0001
Patrón: ATCGATCG
Fecha: 2025-11-07 10:30
→ Se guarda también (ID: 002)

// En el historial verás:
- 2 búsquedas diferentes
- Mismo número de caso
- Mismo patrón
- Diferentes timestamps
```

#### ¿Por Qué Este Diseño?

**Ventajas:**
1. **Auditoría Completa**: Rastrea todas las ejecuciones del motor
2. **Trazabilidad**: Saber cuándo y quién hizo cada búsqueda
3. **Comparación de Resultados**: Ver si los resultados cambian con el tiempo (si se agregan sospechosos)
4. **Requerimiento Legal**: En casos forenses, cada análisis debe quedar registrado

**Ejemplo Práctico:**
```
Caso: 2025-0001 (Homicidio)

Día 1 - 10:00 AM:
- Búsqueda con patrón ATCG...
- Base de datos: 100 sospechosos
- Resultado: 0 coincidencias

Día 3 - 2:00 PM:
- Búsqueda con el MISMO patrón ATCG...
- Base de datos: 150 sospechosos (se agregaron 50 nuevos)
- Resultado: 2 coincidencias ← ¡NUEVO!

→ Ambas búsquedas quedan registradas
→ Se puede comparar y ver que nuevos sospechosos trajeron coincidencias
```

#### Alerta Informativa

Cuando ingresas un número de caso, verás esta alerta azul:

```
ℹ️ Información del Caso

Cada búsqueda realizada en el caso "2025-0001" se almacenará
de forma independiente en el historial. Esto permite rastrear
múltiples análisis sobre el mismo caso.
```

---

## 📋 CAMPOS COMPLETOS DEL FORMULARIO

### Pestaña: Patrón Individual

| Campo | Tipo | Obligatorio | Caracteres | Descripción |
|-------|------|-------------|------------|-------------|
| Número de Caso | Input | No | 50 máx | Identificador único del caso |
| Descripción del Caso | Textarea | No | 500 máx | Contexto detallado del caso |
| Ubicación de Evidencia | Input | No | 500 máx | Procedencia física de la muestra |
| Secuencia de ADN | Input | **SÍ** | 5-100 | Patrón a buscar (A, T, C, G) |

### Pestaña: Múltiples Patrones

| Campo | Tipo | Obligatorio | Caracteres | Descripción |
|-------|------|-------------|------------|-------------|
| Número de Caso | Input | No | 50 máx | Identificador único del caso |
| Descripción del Caso | Textarea | No | 500 máx | Contexto detallado del caso |
| Ubicación de Evidencia | Input | No | 500 máx | Procedencia física de la muestra |
| Secuencias de ADN | Textarea | **SÍ** | 5-100 c/u | Patrones separados por comas |

---

## 🎨 COMPONENTES UI UTILIZADOS

### Alert Component
```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error en la búsqueda</AlertTitle>
  <AlertDescription>
    {errorMessage}
  </AlertDescription>
</Alert>
```

### Case Selector (Desplegable)
```tsx
<motion.div
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: "auto" }}
>
  {recentCases.map(caso => (
    <Button onClick={() => selectRecentCase(caso)}>
      {caso}
    </Button>
  ))}
</motion.div>
```

---

## 🔄 FLUJO DE TRABAJO COMPLETO

### Flujo Típico de Uso:

```
1. Usuario abre "Búsqueda ADN"
   ↓
2. Sistema carga automáticamente:
   - Total de sospechosos en BD
   - Últimos 10 casos únicos del historial
   ↓
3. Usuario puede:
   a) Crear nuevo caso (escribir número)
   b) Seleccionar caso existente (click en botón)
   ↓
4. Usuario completa campos:
   - Descripción del caso (opcional)
   - Ubicación de evidencia (opcional)
   - Patrón(es) de ADN (obligatorio)
   ↓
5. Sistema valida:
   - Patrones válidos (A, T, C, G)
   - Longitud correcta (5-100 caracteres)
   - Base de datos no vacía
   ↓
6. Si hay error:
   → Muestra Alert rojo con mensaje claro
   → Usuario puede cerrar y corregir
   ↓
7. Si es válido:
   → Ejecuta búsqueda en backend
   → Muestra progreso animado
   → Guarda en historial
   ↓
8. Resultado:
   - Si hay coincidencias: Alert verde con detalles
   - Si no hay coincidencias: Alert azul informativo
   - Cualquier error: Alert rojo con solución
```

---

## 📊 DATOS EN EL HISTORIAL

### Cada búsqueda guarda:

```json
{
  "_id": "673c1234567890abcdef1234",
  "usuarioId": "673c9876543210fedcba9876",
  "casoNumero": "2025-0001",
  "descripcionCaso": "Análisis de evidencia encontrada en escena del crimen",
  "ubicacionEvidencia": "Laboratorio Forense - Sala 3",
  "patrones": ["ATCGATCG"],
  "numPatrones": 1,
  "algoritmoUsado": "kmp",
  "criterioSeleccion": "Patrón individual, longitud < 20",
  "totalSospechososProcesados": 150,
  "totalCoincidencias": 3,
  "coincidencias": [
    {
      "nombre": "Juan Pérez",
      "cedula": "12345678",
      "patron": "ATCGATCG",
      "posicion": 45
    }
  ],
  "tiempoEjecucionMs": 1234,
  "fecha": "2025-11-07T10:30:00.000Z"
}
```

---

## 🧪 EJEMPLOS DE USO

### Ejemplo 1: Caso Nuevo con Descripción Completa
```
Número de Caso: 2025-0045
Descripción: Homicidio en Av. Principal #123. Muestra de sangre
            encontrada en arma blanca. Sospechoso huyó del lugar.
Ubicación: Laboratorio Forense PNP - Área de Genética
Patrón: ATCGATCGTAGCTAGC

→ Búsqueda ejecutada
→ Reporte completo generado con todos los campos
```

### Ejemplo 2: Seguimiento de Caso Existente
```
// Primera búsqueda
Caso: 2025-0001 (click en selector)
Descripción: Primera muestra del sospechoso principal
Ubicación: Sala de Evidencias - Lote A
Patrón: ATCGATCG
Resultado: 0 coincidencias

// Segunda búsqueda (días después)
Caso: 2025-0001 (click en selector - mismo caso)
Descripción: Segunda muestra de evidencia adicional
Ubicación: Sala de Evidencias - Lote B
Patrón: GCTAGCTA
Resultado: 2 coincidencias

→ Ambas búsquedas en el historial
→ Fácil comparación de resultados
→ Trazabilidad completa del caso
```

### Ejemplo 3: Manejo de Errores
```
Caso: 2025-0002
Patrón: ATCG (solo 4 caracteres)

→ Error mostrado:
┌─────────────────────────────────────────────────┐
│ ⚠️ Error en la búsqueda                         │
│                                                 │
│ Cada patrón debe tener entre 5 y 100           │
│ caracteres. Patrones inválidos: ATCG            │
│                                          [×]    │
└─────────────────────────────────────────────────┘

Usuario corrige:
Patrón: ATCGATCG (8 caracteres) ✓

→ Búsqueda exitosa
```

---

## 📈 BENEFICIOS PARA REPORTES FINALES

### Reporte PDF Generado Incluirá:

```
═══════════════════════════════════════════════════
  REPORTE DE ANÁLISIS FORENSE DE ADN
  Sistema Forense ADN - Policía Nacional del Perú
═══════════════════════════════════════════════════

INFORMACIÓN DEL CASO:
  Número de Caso:     2025-0001
  Descripción:        Homicidio en Av. Principal...
  Ubicación:          Laboratorio Forense - Sala 3
  Fecha de Análisis:  07/11/2025 10:30:15
  Analista:           Dr. Juan Pérez (Perito)

PARÁMETROS DE BÚSQUEDA:
  Patrones Analizados: ATCGATCG, GCTAGCTA
  Algoritmo Usado:     Aho-Corasick
  Total Procesados:    150 sospechosos
  Tiempo de Ejecución: 1.234 segundos

RESULTADOS:
  Total Coincidencias: 3

  1. Juan Pérez García
     Cédula:    12345678
     Patrón:    ATCGATCG
     Posición:  45

  2. María López Ruiz
     Cédula:    87654321
     Patrón:    GCTAGCTA
     Posición:  123

  ...

FIRMA DIGITAL: SHA256 Hash
───────────────────────────────────────────────────
```

---

## 🔐 SEGURIDAD Y VALIDACIONES

### Validaciones Frontend:
- ✅ Patrón no vacío
- ✅ Solo caracteres A, T, C, G
- ✅ Longitud 5-100 caracteres
- ✅ Base de datos no vacía
- ✅ Límites de caracteres en descripciones

### Validaciones Backend:
- ✅ JWT token válido
- ✅ Usuario autorizado (perito/admin)
- ✅ Patrones válidos (regex)
- ✅ Sospechosos activos en BD
- ✅ Rate limiting

---

## 🎓 CAPACITACIÓN

### Para Peritos:
1. **Crear Caso Nuevo**: Escribir número de caso único
2. **Continuar Caso**: Click en "Ver casos recientes" y seleccionar
3. **Agregar Contexto**: Completar descripción y ubicación
4. **Validar Errores**: Leer alertas rojas antes de reintentar
5. **Revisar Historial**: Ver todas las búsquedas del caso

### Para Administradores:
- Todas las búsquedas quedan en el historial (no se duplican registros, pero sí se guardan todas las ejecuciones)
- Cada búsqueda tiene timestamp único
- Fácil auditoría por número de caso
- Rastreabilidad completa de qué perito hizo qué búsqueda

---

## ✅ CHECKLIST DE MEJORAS COMPLETADAS

- [x] Alert component para errores visibles y persistentes
- [x] Mensajes de error amigables y contextuales
- [x] Campo "Descripción del Caso" (500 caracteres)
- [x] Campo "Ubicación de Evidencia" (500 caracteres)
- [x] Contador de caracteres en tiempo real
- [x] Selector de casos recientes desplegable
- [x] Carga automática de últimos 10 casos
- [x] Alerta informativa sobre almacenamiento
- [x] Validación de base de datos vacía
- [x] Validación mejorada de patrones
- [x] Sincronización entre pestañas (single/multiple)
- [x] Animaciones suaves (framer-motion)
- [x] Documentación completa

---

## 📞 SOPORTE

Para consultas sobre estas mejoras:
- **Desarrollador**: BMad (Claude Code)
- **Fecha**: Noviembre 2025
- **Versión**: 2.1.0

---

**🔬 Sistema Forense ADN - Policía Nacional del Perú**
