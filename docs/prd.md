# 🎯 PRD COMPLETO - SISTEMA FORENSE DE IDENTIFICACIÓN DE ADN

---

## 📋 EXECUTIVE SUMMARY

**Nombre del Proyecto:** Sistema de Identificación Forense mediante Análisis de ADN

**Objetivo:** Automatizar el proceso de comparación de patrones de ADN encontrados en escenas de crimen contra bases de datos de sospechosos, reduciendo el tiempo de análisis de días a minutos.

**Stakeholders:**
- Peritos criminalistas de la PNP
- Investigadores policiales
- Laboratorio forense
- Sistema judicial (fiscales/jueces)

**Entregables principales:**
1. Aplicación web con formularios de búsqueda
2. API REST que coordina el procesamiento
3. Motor de búsqueda en C++ con múltiples algoritmos
4. Base de datos para usuarios, cadenas ADN y búsquedas
5. Sistema de reportes en PDF

---

## 🎯 PROBLEM STATEMENT

### Situación Actual
Los peritos criminalistas deben comparar manualmente patrones de ADN encontrados en evidencias contra bases de datos de sospechosos. Este proceso:
- Toma días o semanas
- Es propenso a errores humanos
- No tiene trazabilidad
- No permite auditoría
- Dificulta la generación de reportes oficiales

### Impacto
- Retraso en investigaciones criminales
- Posibles errores en identificación
- Falta de documentación para procesos judiciales
- Incapacidad de analizar grandes volúmenes de datos

### Solución Propuesta
Sistema automatizado que:
- Procesa 1000+ sospechosos en segundos
- Garantiza 100% de precisión
- Mantiene registro completo de búsquedas
- Genera reportes oficiales automáticamente
- Requiere cero conocimiento técnico del usuario

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Vista General

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO FINAL                        │
│              (Perito Criminalista)                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  CAPA 1: FRONTEND                       │
│                  (React + Vite)                         │
│                                                         │
│  Componentes:                                           │
│  • Formulario de ingreso de datos                       │
│  • Visualización de resultados                          │
│  • Generación de reportes PDF                           │
│  • Historial de búsquedas                              │
└─────────────────────────────────────────────────────────┘
                           │
                      HTTP/REST
                      (JSON)
                           ▼
┌─────────────────────────────────────────────────────────┐
│               CAPA 2: BACKEND API                       │
│              (Node.js + Express)                        │
│                                                         │
│  Responsabilidades:                                     │
│  • Autenticación y autorización (JWT)                   │
│  • Validación de datos de entrada                       │
│  • Gestión de archivos CSV                              │
│  • Ejecución del motor C++                              │
│  • Persistencia en base de datos                        │
│  • Generación de reportes                               │
└─────────────────────────────────────────────────────────┘
                           │
                  Ejecuta mediante
                  child_process
                           ▼
┌─────────────────────────────────────────────────────────┐
│           CAPA 3: MOTOR DE BÚSQUEDA                     │
│              (C++ compilado a .exe)                     │
│                                                         │
│  Algoritmos implementados:                              │
│  • KMP (Knuth-Morris-Pratt)                            │
│  • Rabin-Karp                                           │
│  • Aho-Corasick                                         │
│                                                         │
│  Funcionalidades:                                       │
│  • Selección automática de algoritmo                    │
│  • Parseo eficiente de CSV                              │
│  • Búsqueda de patrones                                 │
│  • Salida en formato JSON                               │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              CAPA 4: BASE DE DATOS                      │
│              (PostgreSQL / MySQL)                       │
│                                                         │
│  Tablas:                                                │
│  • usuarios (autenticación)                             │
│  • sospechosos (base de datos permanente)              │
│  • busquedas (auditoría y trazabilidad)                │
│  • reportes (histórico de reportes generados)          │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 USER PERSONAS

### Persona 1: Perito Criminalista

**Nombre:** Carlos Ramírez  
**Edad:** 38 años  
**Experiencia:** 12 años en criminalística  
**Conocimiento técnico:** Medio-bajo en sistemas  

**Necesidades:**
- Interfaz simple e intuitiva
- Resultados claros y rápidos
- Capacidad de generar reportes oficiales
- Historial de análisis realizados

**Pain Points:**
- No entiende de algoritmos ni programación
- Necesita documentación legal de cada análisis
- Trabaja bajo presión de tiempo
- Debe presentar evidencia en corte

**Expectativas:**
- "Quiero ingresar el patrón, hacer clic y obtener resultados"
- "Necesito un reporte que pueda presentar al fiscal"
- "Debo poder buscar análisis anteriores"

---

### Persona 2: Investigador Policial

**Nombre:** Laura Mendoza  
**Edad:** 32 años  
**Experiencia:** 8 años en investigación  
**Conocimiento técnico:** Bajo  

**Necesidades:**
- Consultar resultados de análisis
- Verificar coincidencias rápidamente
- Acceso a historial de casos

**Pain Points:**
- No tiene formación técnica
- Necesita respuestas inmediatas
- Debe coordinar con múltiples laboratorios

**Expectativas:**
- "Quiero ver si el sospechoso X está en la base de datos"
- "Necesito confirmar resultados de manera rápida"

---

## 📊 REQUERIMIENTOS FUNCIONALES

### RF-001: Gestión de Usuarios

**Prioridad:** MUST HAVE  
**Complejidad:** Media  

**User Story:**
```
Como perito criminalista,
Quiero crear una cuenta y hacer login,
Para acceder al sistema de forma segura y mantener trazabilidad de mis análisis.
```

**Criterios de Aceptación:**
```gherkin
Given que soy un usuario nuevo
When completo el formulario de registro con email y contraseña
Then se crea mi cuenta con credenciales encriptadas

Given que tengo una cuenta activa
When ingreso mis credenciales correctas
Then recibo un token JWT y accedo al dashboard

Given que mi sesión ha expirado
When intento hacer una operación
Then el sistema me redirige al login
```

**Especificaciones técnicas:**
- Email único por usuario
- Contraseña mínimo 8 caracteres (mayúsculas, minúsculas, números)
- Hash con bcrypt (salt rounds: 10)
- JWT con expiración de 24 horas
- Refresh token opcional

---

### RF-002: Registro de Sospechosos en Base de Datos

**Prioridad:** MUST HAVE  
**Complejidad:** Alta  

**User Story:**
```
Como administrador del sistema,
Quiero cargar masivamente sospechosos con sus cadenas de ADN,
Para mantener una base de datos permanente que pueda ser consultada.
```

**Criterios de Aceptación:**
```gherkin
Given que tengo un archivo CSV válido con sospechosos
When lo cargo mediante el formulario de carga masiva
Then todos los registros se insertan en la tabla 'sospechosos'

Given que un sospechoso ya existe en la BD (por cédula)
When intento cargarlo nuevamente
Then el sistema actualiza su cadena de ADN si es diferente

Given que el CSV contiene errores de formato
When intento cargarlo
Then el sistema me muestra qué líneas tienen errores y por qué
```

**Validaciones:**
- Formato CSV: Nombre, Cedula, CadenaADN
- Cadena ADN solo con caracteres: A, T, C, G
- Cédula única por sospechoso
- Nombre no vacío
- Máximo 50,000 registros por carga

---

### RF-003: Búsqueda de Patrón de ADN

**Prioridad:** MUST HAVE  
**Complejidad:** Alta  

**User Story:**
```
Como perito criminalista,
Quiero ingresar un patrón de ADN encontrado en evidencia,
Para identificar qué sospechosos en la base de datos tienen ese patrón.
```

**Criterios de Aceptación:**
```gherkin
Given que tengo un patrón de ADN válido
When lo ingreso en el formulario y presiono "Buscar"
Then el sistema procesa la búsqueda y me muestra los resultados en menos de 10 segundos

Given que el patrón existe en 3 sospechosos
When completo la búsqueda
Then veo una tabla con los 3 nombres y sus cédulas

Given que el patrón no existe en ningún sospechoso
When completo la búsqueda
Then veo el mensaje "No se encontraron coincidencias"

Given que realizo una búsqueda
When se completa el procesamiento
Then la búsqueda se guarda en la tabla 'busquedas' con timestamp
```

**Especificaciones técnicas:**
- Input: Patrón de ADN (5-100 caracteres, solo A,T,C,G)
- Timeout: 60 segundos máximo
- El sistema selecciona automáticamente el mejor algoritmo
- Output: Array de objetos {nombre, cedula, posicion_coincidencia}

**Flujo de datos:**
```
1. Frontend envía: { patron: "TGTACCTTACAATCG", caso_numero: "2025-1234" }
2. Backend valida el patrón
3. Backend consulta todos los sospechosos activos de la BD
4. Backend crea CSV temporal con los datos
5. Backend ejecuta: ./busqueda_adn.exe "TGTACCTTACAATCG" "./temp/sospechosos_temp.csv"
6. Programa C++ procesa y retorna JSON
7. Backend parsea JSON y guarda en tabla 'busquedas'
8. Backend retorna resultados al frontend
9. Frontend muestra tabla de resultados
```

---

### RF-004: Visualización de Resultados

**Prioridad:** MUST HAVE  
**Complejidad:** Baja  

**User Story:**
```
Como perito criminalista,
Quiero ver los resultados de la búsqueda de forma clara,
Para identificar rápidamente a los sospechosos que coinciden.
```

**Criterios de Aceptación:**
```gherkin
Given que una búsqueda ha finalizado con coincidencias
When veo la pantalla de resultados
Then veo una tabla con: Nombre, Cédula, Posición de coincidencia

Given que una búsqueda ha finalizado sin coincidencias
When veo la pantalla de resultados
Then veo un mensaje claro: "No se encontraron coincidencias en X sospechosos analizados"

Given que estoy en la pantalla de resultados
When veo los datos
Then también veo: Patrón buscado, Fecha/hora, Tiempo de ejecución, Algoritmo usado
```

**Diseño de interfaz:**
```
┌─────────────────────────────────────────────────┐
│  Resultados de Búsqueda                         │
│                                                 │
│  Patrón: TGTACCTTACAATCG                        │
│  Fecha: 29/10/2025 14:30:25                     │
│  Caso: 2025-1234                                │
│  Algoritmo: KMP                                 │
│  Tiempo: 0.145 segundos                         │
│                                                 │
│  ✅ 2 coincidencias de 1,000 analizados         │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Nombre          │ Cédula    │ Posición  │   │
│  ├─────────────────────────────────────────┤   │
│  │ Juan Perez      │ 12345678  │ 45        │   │
│  │ Pedro Garcia    │ 87654321  │ 128       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Generar Reporte PDF]  [Nueva Búsqueda]       │
└─────────────────────────────────────────────────┘
```

---

### RF-005: Generación de Reportes en PDF

**Prioridad:** MUST HAVE  
**Complejidad:** Media  

**User Story:**
```
Como perito criminalista,
Quiero generar un reporte oficial en PDF de cada búsqueda,
Para presentarlo como evidencia en procesos judiciales.
```

**Criterios de Aceptación:**
```gherkin
Given que he completado una búsqueda
When presiono "Generar Reporte PDF"
Then el sistema genera un PDF con formato oficial

Given que el PDF se ha generado
When lo descargo
Then contiene: membrete, datos del caso, patrón, resultados, firma digital, timestamp

Given que genero un reporte
When se completa
Then el sistema guarda el registro en tabla 'reportes' con hash del PDF
```

**Contenido del PDF:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    POLICÍA NACIONAL DEL PERÚ
    DIRECCIÓN DE CRIMINALÍSTICA
    
    REPORTE DE ANÁLISIS DE ADN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATOS DEL CASO
  Número de caso:    2025-1234
  Fecha de análisis: 29 de octubre de 2025, 14:30:25
  Perito responsable: Carlos Ramírez
  
PATRÓN ANALIZADO
  Secuencia: TGTACCTTACAATCG
  Longitud: 15 nucleótidos
  Origen: Cabello encontrado en escena del crimen
  
METODOLOGÍA
  Algoritmo utilizado: KMP (Knuth-Morris-Pratt)
  Base de datos consultada: 1,000 sospechosos activos
  Tiempo de procesamiento: 0.145 segundos
  
RESULTADOS
  Total de coincidencias: 2
  
  1. Juan Perez Martinez
     Cédula: 12345678
     Posición de coincidencia: nucleótido 45-59
     
  2. Pedro Garcia Lopez
     Cédula: 87654321
     Posición de coincidencia: nucleótido 128-142

CONCLUSIÓN
  Se encontraron 2 (dos) coincidencias exactas del patrón
  analizado en la base de datos de sospechosos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Firma Digital: SHA256(abc123...)
ID de Búsqueda: 457
Generado el: 29/10/2025 14:35:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### RF-006: Historial de Búsquedas

**Prioridad:** SHOULD HAVE  
**Complejidad:** Media  

**User Story:**
```
Como perito criminalista,
Quiero ver un historial de todas las búsquedas que he realizado,
Para consultar análisis previos sin tener que repetirlos.
```

**Criterios de Aceptación:**
```gherkin
Given que he realizado búsquedas previamente
When accedo a la sección "Historial"
Then veo una tabla con todas mis búsquedas ordenadas por fecha

Given que estoy en el historial
When filtro por rango de fechas
Then veo solo las búsquedas de ese período

Given que selecciono una búsqueda del historial
When hago clic en ella
Then veo los detalles completos y puedo regenerar el PDF
```

**Campos mostrados:**
- ID de búsqueda
- Número de caso
- Patrón buscado
- Fecha y hora
- Coincidencias encontradas
- Algoritmo usado
- Botón "Ver detalles"
- Botón "Descargar PDF"

---

### RF-007: Dashboard con Estadísticas

**Prioridad:** COULD HAVE  
**Complejidad:** Media  

**User Story:**
```
Como jefe de laboratorio,
Quiero ver estadísticas de uso del sistema,
Para evaluar la productividad y carga de trabajo.
```

**Métricas a mostrar:**
- Total de búsquedas del mes
- Promedio de coincidencias
- Búsquedas por día (gráfica)
- Algoritmo más usado
- Tiempo promedio de procesamiento
- Usuarios más activos

---

## 📊 REQUERIMIENTOS NO FUNCIONALES

### RNF-001: Performance

**Criterios:**
- Búsqueda de 1,000 registros: < 5 segundos
- Búsqueda de 10,000 registros: < 15 segundos
- Carga de página: < 2 segundos
- API response time (sin C++): < 500ms
- Generación de PDF: < 3 segundos

**Estrategias:**
- Índices en columnas de búsqueda frecuente
- Conexión pool para BD
- Caché de resultados para patrones recientes
- Compilación optimizada del C++ (flags -O3)

---

### RNF-002: Seguridad

**Criterios:**
- HTTPS obligatorio en producción
- Contraseñas hasheadas con bcrypt (salt rounds: 10)
- JWT con expiración de 24 horas
- Validación de inputs en frontend Y backend
- Sanitización de archivos CSV
- Rate limiting: 100 requests/hora por usuario
- Logs de todas las operaciones críticas

**Protecciones específicas:**
- SQL Injection: Usar prepared statements
- XSS: Sanitizar outputs
- CSRF: Tokens CSRF en formularios
- File upload: Validar MIME type y extensión
- Timeout del .exe: 60 segundos máximo

---

### RNF-003: Usabilidad

**Criterios:**
- Interfaz 100% en español
- Diseño responsive (mobile, tablet, desktop)
- Mensajes de error claros y accionables
- Máximo 3 clicks para ejecutar búsqueda
- Feedback visual en todas las acciones
- Accesibilidad: WCAG 2.1 nivel AA

**Principios de diseño:**
- Formularios simples con validación en tiempo real
- Indicadores de progreso para operaciones largas
- Confirmaciones antes de operaciones destructivas
- Tooltips explicativos en campos complejos

---

### RNF-004: Escalabilidad

**Criterios:**
- Soportar 50 usuarios concurrentes
- Base de datos preparada para 100,000+ sospechosos
- 500,000+ búsquedas históricas
- Arquitectura modular para agregar algoritmos

**Estrategias:**
- Paginación en listados
- Lazy loading de imágenes
- Compresión de respuestas HTTP (gzip)
- CDN para assets estáticos

---

### RNF-005: Mantenibilidad

**Criterios:**
- Código documentado (JSDoc, Doxygen)
- Tests unitarios: cobertura mínima 60%
- Tests de integración para flujos críticos
- README con setup completo
- Variables de entorno para configuración
- Logs estructurados (formato JSON)

---

### RNF-006: Confiabilidad

**Criterios:**
- Uptime: 99.5%
- MTBF (Mean Time Between Failures): > 720 horas
- MTTR (Mean Time To Recovery): < 30 minutos
- Backups diarios de BD
- 0% de falsos positivos/negativos en búsquedas

**Estrategias:**
- Manejo robusto de errores
- Retry automático en operaciones críticas
- Health checks de API y BD
- Monitoreo con alertas

---

## 🗄️ DISEÑO DE BASE DE DATOS

### Diagrama ERD

```
┌─────────────────────┐
│     usuarios        │
├─────────────────────┤
│ PK  id              │
│     nombre          │
│ UQ  email           │
│     password_hash   │
│     rol             │
│     fecha_creacion  │
│     ultimo_login    │
└─────────────────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────┐         ┌─────────────────────┐
│     busquedas       │         │    sospechosos      │
├─────────────────────┤         ├─────────────────────┤
│ PK  id              │         │ PK  id              │
│ FK  usuario_id      │         │     nombre_completo │
│     caso_numero     │◄────┐   │ UQ  cedula          │
│     patron          │     │   │     cadena_adn      │
│     algoritmo_usado │     │   │     fecha_registro  │
│     total_procesado │     │   │     activo          │
│     coincidencias   │     └───│     observaciones   │
│     tiempo_ms       │         └─────────────────────┘
│     hash_archivo    │
│     fecha           │
└─────────────────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────┐
│     reportes        │
├─────────────────────┤
│ PK  id              │
│ FK  busqueda_id     │
│     ruta_archivo    │
│     hash_pdf        │
│     fecha_generacion│
│     tipo_reporte    │
└─────────────────────┘
```

### Schemas SQL Detallados

```sql
-- =====================================================
-- TABLA: usuarios
-- Almacena credenciales y datos de acceso
-- =====================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'perito' CHECK (rol IN ('perito', 'admin', 'investigador')),
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    ultimo_login TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- =====================================================
-- TABLA: sospechosos
-- Base de datos permanente de sospechosos con ADN
-- =====================================================
CREATE TABLE sospechosos (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    cadena_adn TEXT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    observaciones TEXT,
    
    -- Metadatos
    longitud_cadena INTEGER,
    fuente_muestra VARCHAR(100), -- "Escena crimen", "Archivo previo", etc.
    
    -- Auditoría
    usuario_registro_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_cadena_adn CHECK (cadena_adn ~ '^[ATCG]+$'),
    CONSTRAINT chk_longitud CHECK (LENGTH(cadena_adn) >= 20)
);

CREATE INDEX idx_sospechosos_cedula ON sospechosos(cedula);
CREATE INDEX idx_sospechosos_activo ON sospechosos(activo);
CREATE INDEX idx_sospechosos_cadena_adn ON sospechosos USING gin(to_tsvector('simple', cadena_adn));

-- =====================================================
-- TABLA: busquedas
-- Registro de cada análisis forense realizado
-- =====================================================
CREATE TABLE busquedas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Datos del caso
    caso_numero VARCHAR(50),
    descripcion_caso TEXT,
    ubicacion_evidencia VARCHAR(500),
    
    -- Datos de la búsqueda
    patron VARCHAR(255) NOT NULL,
    algoritmo_usado VARCHAR(50) NOT NULL,
    total_sospechosos_procesados INTEGER NOT NULL,
    total_coincidencias INTEGER NOT NULL,
    
    -- Resultados (JSON)
    coincidencias JSONB, -- [{"nombre": "...", "cedula": "...", "posicion": 45}]
    
    -- Performance
    tiempo_ejecucion_ms INTEGER,
    
    -- Trazabilidad
    nombre_archivo_csv VARCHAR(255),
    hash_sha256_archivo VARCHAR(64),
    
    -- Timestamps
    fecha TIMESTAMP DEFAULT NOW(),
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_patron CHECK (patron ~ '^[ATCG]+$'),
    CONSTRAINT chk_coincidencias_validas CHECK (total_coincidencias >= 0),
    CONSTRAINT chk_total_procesados CHECK (total_sospechosos_procesados > 0)
);

CREATE INDEX idx_busquedas_usuario ON busquedas(usuario_id);
CREATE INDEX idx_busquedas_fecha ON busquedas(fecha DESC);
CREATE INDEX idx_busquedas_caso ON busquedas(caso_numero);
CREATE INDEX idx_busquedas_patron ON busquedas(patron);
CREATE INDEX idx_busquedas_coincidencias ON busquedas USING gin(coincidencias);

-- =====================================================
-- TABLA: reportes
-- Registro de PDFs generados
-- =====================================================
CREATE TABLE reportes (
    id SERIAL PRIMARY KEY,
    busqueda_id INTEGER NOT NULL REFERENCES busquedas(id) ON DELETE CASCADE,
    
    -- Archivo
    ruta_archivo VARCHAR(500) NOT NULL,
    hash_sha256_pdf VARCHAR(64) NOT NULL,
    tamano_bytes BIGINT,
    
    -- Metadata
    tipo_reporte VARCHAR(50) DEFAULT 'analisis_adn',
    formato VARCHAR(10) DEFAULT 'PDF',
    
    -- Auditoría
    generado_por_usuario_id INTEGER REFERENCES usuarios(id),
    fecha_generacion TIMESTAMP DEFAULT NOW(),
    numero_descargas INTEGER DEFAULT 0,
    ultima_descarga TIMESTAMP
);

CREATE INDEX idx_reportes_busqueda ON reportes(busqueda_id);
CREATE INDEX idx_reportes_fecha ON reportes(fecha_generacion DESC);

-- =====================================================
-- TABLA: logs_sistema (Opcional - Auditoría avanzada)
-- =====================================================
CREATE TABLE logs_sistema (
    id SERIAL PRIMARY KEY,
    tipo_evento VARCHAR(50) NOT NULL, -- 'login', 'busqueda', 'error', 'descarga_reporte'
    nivel VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
    descripcion TEXT NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    ip_address INET,
    user_agent TEXT,
    datos_adicionales JSONB,
    fecha TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logs_tipo ON logs_sistema(tipo_evento);
CREATE INDEX idx_logs_fecha ON logs_sistema(fecha DESC);
CREATE INDEX idx_logs_usuario ON logs_sistema(usuario_id);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Estadísticas por usuario
CREATE VIEW vista_estadisticas_usuario AS
SELECT 
    u.id,
    u.nombre,
    u.email,
    COUNT(b.id) as total_busquedas,
    SUM(b.total_coincidencias) as total_coincidencias,
    AVG(b.tiempo_ejecucion_ms) as tiempo_promedio_ms,
    MAX(b.fecha) as ultima_busqueda
FROM usuarios u
LEFT JOIN busquedas b ON u.id = b.usuario_id
GROUP BY u.id, u.nombre, u.email;

-- Vista: Búsquedas recientes con detalles
CREATE VIEW vista_busquedas_recientes AS
SELECT 
    b.id,
    b.caso_numero,
    b.patron,
    b.total_coincidencias,
    b.fecha,
    u.nombre as usuario_nombre,
    u.email as usuario_email,
    CASE 
        WHEN b.total_coincidencias > 0 THEN 'CON_COINCIDENCIAS'
        ELSE 'SIN_COINCIDENCIAS'
    END as estado
FROM busquedas b
JOIN usuarios u ON b.usuario_id = u.id
ORDER BY b.fecha DESC;

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Trigger: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_updated
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_sospechosos_updated
BEFORE UPDATE ON sospechosos
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp();

-- Trigger: Calcular longitud_cadena automáticamente
CREATE OR REPLACE FUNCTION calcular_longitud_cadena()
RETURNS TRIGGER AS $$
BEGIN
    NEW.longitud_cadena = LENGTH(NEW.cadena_adn);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sospechosos_longitud
BEFORE INSERT OR UPDATE ON sospechosos
FOR EACH ROW
EXECUTE FUNCTION calcular_longitud_cadena();

-- =====================================================
-- DATOS DE PRUEBA (SEED)
-- =====================================================

-- Usuario admin por defecto
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador', 'admin@pnp.gob.pe', '$2b$10$rK7zF5vX8qW9yT3pL1mN2Oe5sH6jK9lM0nP4rQ8sT6uV2wX3yZ4', 'admin');

-- Sospechosos de ejemplo
INSERT INTO sospechosos (nombre_completo, cedula, cadena_adn, fuente_muestra, usuario_registro_id) VALUES
('Juan Perez Martinez', '12345678', 'ATCGATCGATCGTGTACCTTACAATCGGGCCTTAGGCCTAA', 'Registro Nacional', 1),
('Maria Lopez Garcia', '23456789', 'GGCCTTAAGGCCTTAAGGCCTTAAGGCCTTAAGGCCTTAA', 'Registro Nacional', 1),
('Pedro Garcia Sanchez', '34567890', 'CCGGAATTCCGGTGTACCTTACAATCGAATTCCGGAATT', 'Registro Nacional', 1),
('Ana Martinez Lopez', '45678901', 'TTAACCGGTTAACCGGTTAACCGGTTAACCGGTTAACCGG', 'Registro Nacional', 1),
('Carlos Rodriguez Diaz', '56789012', 'ATGCATGCATGCATGCATGCATGCATGCATGCATGCATGC', 'Registro Nacional', 1);

```

---

## 🔌 ESPECIFICACIÓN DE API REST

### Autenticación

#### POST /api/auth/register
**Descripción:** Registrar nuevo usuario

**Request Body:**
```json
{
  "nombre": "Carlos Ramirez",
  "email": "carlos.ramirez@pnp.gob.pe",
  "password": "Segura123!",
  "rol": "perito"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 42,
    "nombre": "Carlos Ramirez",
    "email": "carlos.ramirez@pnp.gob.pe",
    "rol": "perito"
  }
}
```

**Errores:**
- 400: Email ya existe
- 400: Contraseña no cumple requisitos
- 500: Error del servidor

---

#### POST /api/auth/login
**Descripción:** Autenticar usuario

**Request Body:**
```json
{
  "email": "carlos.ramirez@pnp.gob.pe",
  "password": "Segura123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 42,
      "nombre": "Carlos Ramirez",
      "email": "carlos.ramirez@pnp.gob.pe",
      "rol": "perito"
    }
  }
}
```

**Errores:**
- 401: Credenciales inválidas
- 404: Usuario no encontrado

---

### Sospechosos

#### POST /api/sospechosos/carga-masiva
**Descripción:** Cargar sospechosos desde CSV

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**
```
csv: <archivo.csv>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Carga masiva completada",
  "data": {
    "total_procesados": 1000,
    "insertados": 950,
    "actualizados": 50,
    "errores": 0,
    "tiempo_ms": 2340
  }
}
```

---

#### GET /api/sospechosos?page=1&limit=50
**Descripción:** Listar sospechosos registrados

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "sospechosos": [
      {
        "id": 1,
        "nombre_completo": "Juan Perez Martinez",
        "cedula": "12345678",
        "longitud_cadena": 150,
        "fecha_registro": "2025-01-15T10:30:00Z",
        "activo": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1000,
      "totalPages": 20
    }
  }
}
```

---

### Búsquedas

#### POST /api/busquedas/ejecutar
**Descripción:** Ejecutar búsqueda de patrón

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "caso_numero": "2025-1234",
  "patron": "TGTACCTTACAATCG",
  "descripcion_caso": "Cabello encontrado en escena del crimen - Av. Larco 1234"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id_busqueda": 457,
    "caso_numero": "2025-1234",
    "patron": "TGTACCTTACAATCG",
    "algoritmo_usado": "kmp",
    "total_sospechosos_procesados": 1000,
    "total_coincidencias": 2,
    "coincidencias": [
      {
        "id": 1,
        "nombre": "Juan Perez Martinez",
        "cedula": "12345678",
        "posicion": 45
      },
      {
        "id": 523,
        "nombre": "Pedro Garcia Sanchez",
        "cedula": "34567890",
        "posicion": 128
      }
    ],
    "tiempo_ejecucion_ms": 145,
    "fecha": "2025-10-29T14:30:25Z"
  }
}
```

**Errores:**
- 400: Patrón inválido
- 500: Error al ejecutar C++
- 504: Timeout (>60 segundos)

---

#### GET /api/busquedas/historial?page=1&limit=20
**Descripción:** Obtener historial de búsquedas del usuario

**Headers:**
```
Authorization: Bearer {token}
```

**Query Params:**
- page: Número de página (default: 1)
- limit: Registros por página (default: 20, max: 100)
- fecha_desde: Filtro fecha inicio (ISO 8601)
- fecha_hasta: Filtro fecha fin (ISO 8601)
- caso_numero: Filtro por caso

**Response 200:**
```json
{
  "success": true,
  "data": {
    "busquedas": [
      {
        "id": 457,
        "caso_numero": "2025-1234",
        "patron": "TGTACCTTACAATCG",
        "total_coincidencias": 2,
        "fecha": "2025-10-29T14:30:25Z",
        "algoritmo_usado": "kmp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "totalPages": 8
    }
  }
}
```

---

#### GET /api/busquedas/:id
**Descripción:** Obtener detalles de una búsqueda específica

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 457,
    "caso_numero": "2025-1234",
    "descripcion_caso": "Cabello encontrado en escena del crimen",
    "patron": "TGTACCTTACAATCG",
    "algoritmo_usado": "kmp",
    "total_sospechosos_procesados": 1000,
    "total_coincidencias": 2,
    "coincidencias": [
      {
        "id": 1,
        "nombre": "Juan Perez Martinez",
        "cedula": "12345678",
        "cadena_adn": "ATCGATCG...TGTACCTTACAATCG...GGCCTTAA",
        "posicion": 45
      }
    ],
    "tiempo_ejecucion_ms": 145,
    "fecha": "2025-10-29T14:30:25Z",
    "usuario": {
      "nombre": "Carlos Ramirez",
      "email": "carlos.ramirez@pnp.gob.pe"
    }
  }
}
```

---

### Reportes

#### POST /api/reportes/generar/:busqueda_id
**Descripción:** Generar reporte PDF de una búsqueda

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id_reporte": 89,
    "busqueda_id": 457,
    "ruta_descarga": "/api/reportes/descargar/89",
    "hash_sha256": "abc123def456...",
    "tamano_bytes": 245678,
    "fecha_generacion": "2025-10-29T14:35:00Z"
  }
}
```

---

#### GET /api/reportes/descargar/:id
**Descripción:** Descargar PDF generado

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="reporte_caso_2025-1234.pdf"

<binary PDF data>
```

---

### Estadísticas (Dashboard)

#### GET /api/estadisticas/resumen
**Descripción:** Obtener resumen de estadísticas del usuario

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_busquedas": 145,
    "busquedas_mes_actual": 23,
    "total_coincidencias": 67,
    "tasa_exito": 46.2,
    "algoritmo_mas_usado": "kmp",
    "tiempo_promedio_ms": 178,
    "busquedas_por_dia": [
      {"fecha": "2025-10-23", "cantidad": 5},
      {"fecha": "2025-10-24", "cantidad": 8},
      {"fecha": "2025-10-25", "cantidad": 3}
    ]
  }
}
```

---

## 💻 ESPECIFICACIÓN DEL PROGRAMA C++

### Compilación

```bash
# CMakeLists.txt
cmake_minimum_required(VERSION 3.15)
project(busqueda_adn)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -Wall")

add_executable(busqueda_adn
    src/main.cpp
    src/algorithms/kmp.cpp
    src/algorithms/rabin_karp.cpp
    src/algorithms/aho_corasick.cpp
    src/utils/csv_parser.cpp
    src/utils/json_output.cpp
    src/utils/algorithm_selector.cpp
)

# Para compilar:
# mkdir build && cd build
# cmake ..
# make
```

### Interfaz de Línea de Comandos

```bash
./busqueda_adn <patron> <ruta_csv>

# Ejemplo:
./busqueda_adn "TGTACCTTACAATCG" "./data/sospechosos.csv"
```

### Formato de Entrada (CSV)

```csv
nombre_completo,cedula,cadena_adn
Juan Perez Martinez,12345678,ATCGATCGTGTACCTTACAATCGGGCCTTAA
Maria Lopez Garcia,23456789,GGCCTTAAGGCCTTAAGGCCTTAAGGCCTTAA
Pedro Garcia Sanchez,34567890,CCGGAATTCCGGTGTACCTTACAATCGAATT
```

### Formato de Salida (JSON a stdout)

```json
{
  "exito": true,
  "patron": "TGTACCTTACAATCG",
  "algoritmo_usado": "kmp",
  "criterio_seleccion": "patron_corto_muchos_textos",
  "total_procesados": 1000,
  "total_coincidencias": 2,
  "coincidencias": [
    {
      "nombre": "Juan Perez Martinez",
      "cedula": "12345678",
      "posicion": 45
    },
    {
      "nombre": "Pedro Garcia Sanchez",
      "cedula": "34567890",
      "posicion": 128
    }
  ],
  "tiempo_ejecucion_ms": 145,
  "estadisticas": {
    "comparaciones_realizadas": 15000,
    "memoria_usada_mb": 12.3
  }
}
```

### En caso de error:

```json
{
  "exito": false,
  "error": "No se pudo abrir el archivo CSV",
  "codigo_error": "FILE_NOT_FOUND",
  "detalles": "./data/sospechosos.csv no existe"
}
```

### Lógica de Selección de Algoritmo

```cpp
string seleccionarAlgoritmo(const string& patron, int numSospechosos) {
    int longitudPatron = patron.length();
    
    // Regla 1: Patrón corto + muchos textos → KMP
    if (longitudPatron <= 15 && numSospechosos > 500) {
        return "kmp";
    }
    
    // Regla 2: Patrón largo → Rabin-Karp
    if (longitudPatron > 30) {
        return "rabin-karp";
    }
    
    // Regla 3: Patrón medio + muchos textos → Aho-Corasick
    if (longitudPatron >= 15 && longitudPatron <= 30 && numSospechosos > 1000) {
        return "aho-corasick";
    }
    
    // Default: KMP (más confiable)
    return "kmp";
}
```

---

## 🎨 WIREFRAMES Y DISEÑO UI/UX

### Pantalla 1: Login

```
┌────────────────────────────────────────────┐
│                                            │
│         🔬 SISTEMA FORENSE PNP             │
│         Análisis de ADN                    │
│                                            │
│    ┌──────────────────────────────────┐   │
│    │  Email                           │   │
│    │  ___________________________     │   │
│    └──────────────────────────────────┘   │
│                                            │
│    ┌──────────────────────────────────┐   │
│    │  Contraseña                      │   │
│    │  ___________________________     │   │
│    └──────────────────────────────────┘   │
│                                            │
│    [ Iniciar Sesión ]                     │
│                                            │
│    ¿No tienes cuenta? Regístrate          │
│                                            │
└────────────────────────────────────────────┘
```

---

### Pantalla 2: Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  🔬 Sistema Forense    [Carlos Ramirez ▼] [Salir]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Dashboard                                              │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐         │
│  │📊 Búsq.   │  │✅ Coincid.│  │⏱️ Promedio│         │
│  │  145      │  │    67     │  │  0.18 seg │         │
│  └───────────┘  └───────────┘  └───────────┘         │
│                                                         │
│  📈 Búsquedas de los últimos 7 días                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │          📊 [Gráfica de barras]                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🔍 Búsquedas Recientes                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Caso 2025-1234 | 2 coinc. | 29/10 14:30        │   │
│  │ Caso 2025-1235 | 0 coinc. | 29/10 10:15        │   │
│  │ Caso 2025-1230 | 5 coinc. | 28/10 16:45        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [➕ Nueva Búsqueda]  [📋 Ver Historial]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Pantalla 3: Nueva Búsqueda

```
┌─────────────────────────────────────────────────────────┐
│  🔬 Sistema Forense    [Carlos Ramirez ▼] [Salir]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔍 Nueva Búsqueda de ADN                              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Número de Caso *                                │   │
│  │ ____________________________                    │   │
│  │ ej: 2025-1234                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Patrón de ADN Encontrado *                      │   │
│  │ ____________________________                    │   │
│  │ Solo caracteres: A, T, C, G                     │   │
│  │ Longitud: 5-100 caracteres                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Descripción del Caso (opcional)                 │   │
│  │ ____________________________                    │   │
│  │ ____________________________                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ℹ️  Se buscará en 1,247 sospechosos registrados       │
│                                                         │
│  [🚫 Cancelar]           [🔍 Iniciar Análisis]         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Pantalla 4: Procesando

```
┌─────────────────────────────────────────────────────────┐
│  🔬 Sistema Forense    [Carlos Ramirez ▼] [Salir]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│            ⏳ Analizando ADN...                         │
│                                                         │
│              [████████░░░░░░] 65%                      │
│                                                         │
│         Procesando 1,247 sospechosos                   │
│         Algoritmo: KMP                                 │
│         Tiempo transcurrido: 1.8 segundos              │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Pantalla 5: Resultados

```
┌─────────────────────────────────────────────────────────┐
│  🔬 Sistema Forense    [Carlos Ramirez ▼] [Salir]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ Resultados de Búsqueda                             │
│                                                         │
│  Caso: 2025-1234                                       │
│  Patrón: TGTACCTTACAATCG                               │
│  Fecha: 29 de octubre de 2025, 14:30:25               │
│  Algoritmo: KMP                                        │
│  Tiempo: 0.145 segundos                                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ✅ 2 coincidencias de 1,247 analizados        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Sospechosos con Coincidencias:                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Nombre             │ Cédula    │ Posición      │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ Juan Perez Martinez│ 12345678  │ Nucleótido 45 │   │
│  │ Pedro Garcia S.    │ 34567890  │ Nucleótido 128│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [📄 Generar Reporte PDF]  [🔍 Nueva Búsqueda]        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Pantalla 6: Resultados - Sin Coincidencias

```
┌─────────────────────────────────────────────────────────┐
│  🔬 Sistema Forense    [Carlos Ramirez ▼] [Salir]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ℹ️  Resultados de Búsqueda                            │
│                                                         │
│  Caso: 2025-1235                                       │
│  Patrón: GGGGCCCCAAAATTTT                              │
│  Fecha: 29 de octubre de 2025, 10:15:42               │
│  Algoritmo: Rabin-Karp                                 │
│  Tiempo: 0.198 segundos                                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ❌ No se encontraron coincidencias             │   │
│  │                                                 │   │
│  │  Total de sospechosos analizados: 1,247        │   │
│  │                                                 │   │
│  │  El patrón no coincide con ninguna cadena      │   │
│  │  de ADN en la base de datos.                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [📄 Generar Reporte]  [🔍 Nueva Búsqueda]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Pantalla 7: Historial

```
┌─────────────────────────────────────────────────────────┐
│  🔬 Sistema Forense    [Carlos Ramirez ▼] [Salir]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📋 Historial de Búsquedas                             │
│                                                         │
│  Filtros: [Desde: __/__/__] [Hasta: __/__/__] [🔍]    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Caso     │Patrón  │Coinc.│Fecha      │Acciones│   │
│  ├─────────────────────────────────────────────────┤   │
│  │2025-1234│TGTACC..│  2   │29/10 14:30│👁 📄   │   │
│  │2025-1235│GGGGCC..│  0   │29/10 10:15│👁 📄   │   │
│  │2025-1230│ATCGAT..│  5   │28/10 16:45│👁 📄   │   │
│  │2025-1229│CCGGAA..│  1   │28/10 11:20│👁 📄   │   │
│  │2025-1228│TTAACC..│  0   │27/10 15:30│👁 📄   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [< Anterior]  Página 1 de 8  [Siguiente >]           │
│                                                         │
│  [🔍 Nueva Búsqueda]                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 MÉTRICAS Y KPIs

### Métricas de Negocio

| Métrica | Valor Objetivo | Frecuencia de Medición |
|---------|---------------|------------------------|
| Tiempo promedio de análisis | < 5 segundos | Diario |
| Búsquedas por día | 50+ | Diario |
| Tasa de éxito (con coincidencias) | N/A (depende de casos) | Mensual |
| Usuarios activos por semana | 20+ | Semanal |
| Reportes generados por mes | 100+ | Mensual |
| Satisfacción del usuario | > 4.5/5 | Trimestral |

### Métricas Técnicas

| Métrica | Valor Objetivo | Herramienta |
|---------|---------------|-------------|
| Uptime del sistema | > 99.5% | Monitoring tool |
| Response time API (p95) | < 500ms | APM tool |
| Tiempo de búsqueda C++ (1000 reg) | < 3 segundos | Logs |
| Tasa de error de API | < 0.1% | Logs |
| Cobertura de tests | > 60% | Jest/PyTest |
| Vulnerabilidades críticas | 0 | Security scanner |

### Métricas de Calidad

| Métrica | Valor Objetivo |
|---------|---------------|
| Falsos positivos | 0% |
| Falsos negativos | 0% |
| Precisión de algoritmos | 100% |
| Tiempo de generación de PDF | < 3 segundos |

---

## 🚀 ROADMAP Y FASES

### Fase 1: MVP (Semanas 1-4)

**Objetivo:** Sistema funcional básico

**Entregables:**
- ✅ Base de datos configurada
- ✅ Backend API con endpoints básicos
- ✅ Programa C++ con algoritmo KMP
- ✅ Frontend con login y formulario de búsqueda
- ✅ Visualización básica de resultados

**Criterios de éxito:**
- Usuario puede registrarse y hacer login
- Usuario puede realizar búsqueda de patrón
- Sistema retorna resultados correctos
- Resultados se guardan en BD

---

### Fase 2: Funcionalidades Core (Semanas 5-6)

**Objetivo:** Completar funcionalidades principales

**Entregables:**
- ✅ Algoritmos Rabin-Karp y Aho-Corasick
- ✅ Selección automática de algoritmo
- ✅ Historial de búsquedas
- ✅ Generación de reportes PDF
- ✅ Carga masiva de sospechosos

**Criterios de éxito:**
- Los 3 algoritmos funcionan correctamente
- Sistema selecciona el óptimo automáticamente
- Usuario puede ver su historial
- Usuario puede generar y descargar PDFs

---

### Fase 3: Mejoras y Optimización (Semanas 7-8)

**Objetivo:** Pulir el sistema

**Entregables:**
- ✅ Dashboard con estadísticas
- ✅ Filtros avanzados en historial
- ✅ Optimización de performance
- ✅ Tests unitarios y de integración
- ✅ Documentación completa

**Criterios de éxito:**
- Dashboard muestra métricas en tiempo real
- Tests cubren >60% del código
- Performance cumple objetivos (< 5 seg)
- Documentación completa y clara

---

### Fase 4: Deployment y Entrega (Semanas 9-10)

**Objetivo:** Sistema en producción

**Entregables:**
- ✅ Deploy en servidor
- ✅ Configuración de HTTPS
- ✅ Monitoreo y logging
- ✅ Backup automático de BD
- ✅ Manual de usuario
- ✅ Informe académico completo
- ✅ Presentación final

**Criterios de éxito:**
- Sistema accesible públicamente
- 99.5% uptime primeros 30 días
- Todos los entregables académicos completos
- Presentación exitosa

---

## 🧪 ESTRATEGIA DE TESTING

### Tests Unitarios

**Backend (Jest/Mocha):**
```javascript
// Ejemplo de test
describe('Algorithm Selector', () => {
  test('Debe seleccionar KMP para patrón corto', () => {
    const algoritmo = seleccionarAlgoritmo('ATCG', 1000);
    expect(algoritmo).toBe('kmp');
  });

  test('Debe seleccionar Rabin-Karp para patrón largo', () => {
    const algoritmo = seleccionarAlgoritmo('A'.repeat(35), 500);
    expect(algoritmo).toBe('rabin-karp');
  });
});
```

**C++ (Google Test):**
```cpp
TEST(KMPTest, EncontrarPatronSimple) {
    string texto = "ATCGATCGTGTACCTTACAATCG";
    string patron = "TGTACCTTACAATCG";
    
    int posicion = buscarKMP(texto, patron);
    
    EXPECT_EQ(posicion, 8);
}

TEST(KMPTest, PatronNoEncontrado) {
    string texto = "ATCGATCGATCGATCG";
    string patron = "GGGGGGGG";
    
    int posicion = buscarKMP(texto, patron);
    
    EXPECT_EQ(posicion, -1);
}
```

---

### Tests de Integración

```javascript
describe('Flujo completo de búsqueda', () => {
  test('Usuario realiza búsqueda exitosa', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@pnp.gob.pe', password: 'Test123!' });
    
    const token = loginRes.body.data.token;
    
    // 2. Ejecutar búsqueda
    const searchRes = await request(app)
      .post('/api/busquedas/ejecutar')
      .set('Authorization', `Bearer ${token}`)
      .send({
        caso_numero: '2025-TEST',
        patron: 'TGTACCTTACAATCG'
      });
    
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.success).toBe(true);
    expect(searchRes.body.data).toHaveProperty('coincidencias');
    
    // 3. Verificar guardado en BD
    const busqueda = await db.query(
      'SELECT * FROM busquedas WHERE caso_numero = $1',
      ['2025-TEST']
    );
    
    expect(busqueda.rows.length).toBe(1);
  });
});
```

---

### Tests de Performance

```javascript
describe('Performance Tests', () => {
  test('Búsqueda de 1000 registros en menos de 5 segundos', async () => {
    const inicio = Date.now();
    
    await ejecutarBusqueda('TGTACCTTACAATCG', './data/1000_sospechosos.csv');
    
    const tiempo = Date.now() - inicio;
    
    expect(tiempo).toBeLessThan(5000);
  });
  
  test('Carga masiva de 10000 registros', async () => {
    const inicio = Date.now();
    
    await cargaMasiva('./data/10000_sospechosos.csv');
    
    const tiempo = Date.now() - inicio;
    
    expect(tiempo).toBeLessThan(30000); // 30 segundos
  });
});
```

---

## 🔐 CONSIDERACIONES DE SEGURIDAD

### Autenticación y Autorización
- ✅ JWT con expiración de 24 horas
- ✅ Refresh tokens para sesiones largas
- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Validación de fuerza de contraseña

### Protección de Datos
- ✅ HTTPS obligatorio en producción
- ✅ Encriptación de datos sensibles en BD
- ✅ Sanitización de inputs
- ✅ Validación de tipos de archivo
- ✅ Rate limiting por IP y por usuario

### Auditoría
- ✅ Logs de todas las operaciones críticas
- ✅ Timestamps en todos los registros
- ✅ Hash SHA256 de archivos CSV y PDFs
- ✅ Trazabilidad completa de búsquedas

### Cumplimiento Legal
- ✅ Privacidad de datos personales
- ✅ Cadena de custodia digital
- ✅ Reportes firmados digitalmente
- ✅ Backup periódico de evidencia digital

---

## 📦 DEPLOYMENT

### Requisitos de Servidor

**Servidor de Aplicación:**
- CPU: 4 cores
- RAM: 8 GB
- Disco: 100 GB SSD
- SO: Ubuntu 22.04 LTS

**Base de Datos:**
- PostgreSQL 15+
- RAM: 4 GB dedicados
- Disco: 50 GB SSD

### Stack de Deployment

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: forense_adn
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/forense_adn
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/executables:/app/executables

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
```

---

## 📝 ENTREGABLES ACADÉMICOS

### 1. Informe Final (Formato Word)

**Estructura:**
- Carátula
- Resumen ejecutivo
- Índice
- Introducción
- Planteamiento del problema
- Objetivos
- Marco teórico (algoritmos)
- Análisis de requerimientos
- Diseño del sistema
- Implementación
- Pruebas y resultados
- Conclusiones
- Recomendaciones
- Referencias bibliográficas
- Anexos

**Extensión:** 40-60 páginas

---

### 2. Presentación (PowerPoint)

**Contenido:**
- Portada
- Problema y motivación
- Objetivos
- Arquitectura del sistema
- Algoritmos implementados
- Demo en vivo
- Resultados y métricas
- Conclusiones
- Q&A

**Duración:** 20 minutos

---

### 3. Código Fuente

**Estructura de entrega:**
```
Equipo_XX.zip
├── README.md
├── frontend/
├── backend/
├── cpp-engine/
├── database/
│   └── schema.sql
├── docs/
│   ├── API_Documentation.md
│   └── User_Manual.md
└── tests/
```

---

## ✅ CRITERIOS DE ACEPTACIÓN FINALES

### Funcionales
- [x] Usuario puede registrarse y hacer login
- [x] Usuario puede realizar búsquedas de patrones
- [x] Sistema retorna resultados en < 5 segundos para 1000 registros
- [x] Sistema muestra 0% de falsos positivos/negativos
- [x] Usuario puede generar reportes PDF
- [x] Usuario puede ver historial de búsquedas
- [x] Sistema guarda todas las búsquedas en BD

### No Funcionales
- [x] Interfaz responsive
- [x] Mensajes de error claros
- [x] Sistema funciona sin internet (post-login)
- [x] Código documentado
- [x] Tests con cobertura > 60%

### Académicos
- [x] Implementación de 3 algoritmos
- [x] Selección automática de algoritmo
- [x] Informe completo entregado
- [x] Presentación exitosa
- [x] Código fuente organizado

---

## 🎯 RESUMEN EJECUTIVO PARA BMAD

**El proyecto consiste en:**

1. **Frontend simple:** Formularios para ingresar datos y mostrar resultados
2. **Backend API:** Coordina todo, valida datos, ejecuta C++, guarda en BD
3. **Motor C++:** Compara patrones usando algoritmos automáticamente
4. **Base de Datos:** Almacena usuarios, sospechosos y búsquedas para reportes
5. **PDFs:** Generación automática de reportes oficiales

**Flujo principal:**
```
Usuario ingresa patrón
   ↓
API consulta BD de sospechosos
   ↓
API ejecuta .exe con los datos
   ↓
.exe compara y retorna coincidencias
   ↓
API guarda búsqueda en BD
   ↓
Frontend muestra resultados + genera PDF
```
