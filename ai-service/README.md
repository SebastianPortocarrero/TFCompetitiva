# 🤖 AI Microservice

Microservicio de IA **modular y reutilizable** con Ollama/LLama para integrar chat inteligente en cualquier aplicación.

## 🎯 Características

- ✅ **Totalmente independiente** - Corre en su propio puerto
- ✅ **Modular** - Solo cambias `config/contexts.json` para otro proyecto
- ✅ **Conversacional** - Mantiene historial por sesión
- ✅ **Contextual** - Puedes pasarle datos específicos del caso
- ✅ **Reutilizable** - Usa en forensics, marketplace, blog, etc.

## 📋 Requisitos

1. **Node.js** (v18 o superior)
2. **Ollama** instalado y corriendo

### Instalar Ollama

```bash
# Windows/Mac: Descarga desde https://ollama.com/download
# Linux:
curl -fsSL https://ollama.com/install.sh | sh

# Descargar modelo LLama 3.2
ollama pull llama3.2

# Verificar que esté corriendo
ollama serve
```

## 🚀 Instalación

```bash
cd ai-service
npm install
```

## ⚙️ Configuración

Edita `.env` si necesitas cambiar puertos:

```env
PORT=5001                           # Puerto del servicio
OLLAMA_HOST=http://localhost:11434 # URL de Ollama
FRONTEND_URL=http://localhost:5173 # URL del frontend (CORS)
```

## 🏃 Ejecutar

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

Deberías ver:

```
═══════════════════════════════════════════════════════
  🤖 AI MICROSERVICE
═══════════════════════════════════════════════════════
🚀 Servidor corriendo en puerto 5001
📡 API: http://localhost:5001/api
🏥 Health check: http://localhost:5001/api/health
═══════════════════════════════════════════════════════
```

## 📡 API Endpoints

### 1. Enviar mensaje al chat

```http
POST /api/chat
Content-Type: application/json

{
  "contextId": "forensic-dna",
  "message": "Explícame el caso CASO-2024-018",
  "sessionId": "user123_case456",  // Opcional
  "caseData": {                     // Opcional
    "casoNumero": "CASO-2024-018",
    "patrones": ["ATCG", "GCTA"],
    "coincidencias": 15
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "response": "El caso CASO-2024-018 involucra...",
    "model": "llama3.2",
    "responseTime": 2500,
    "sessionId": "user123_case456"
  }
}
```

### 2. Limpiar historial de sesión

```http
DELETE /api/chat/session/:sessionId
```

### 3. Listar contextos disponibles

```http
GET /api/contexts
```

### 4. Health check

```http
GET /api/health
```

## 🔄 Reutilizar en Otro Proyecto

Para usar este microservicio en un proyecto diferente (ej: marketplace):

### 1. Copia la carpeta completa

```bash
cp -r ai-service ../mi-marketplace/ai-service
```

### 2. Edita solo `config/contexts.json`

```json
{
  "marketplace": {
    "name": "Asistente de Marketplace",
    "description": "Ayuda con productos, ventas y soporte",
    "systemPrompt": "Eres un asistente virtual de marketplace...",
    "model": "llama3.2",
    "temperature": 0.8,
    "maxTokens": 300
  }
}
```

### 3. Listo, úsalo

```javascript
// Desde tu frontend/backend
fetch('http://localhost:5001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contextId: 'marketplace',  // Cambiaste solo esto
    message: '¿Cuánto cuesta este producto?'
  })
});
```

**NO necesitas cambiar:**
- ❌ `src/server.js`
- ❌ `src/services/ollamaService.js`
- ❌ `src/routes/chatRoutes.js`

**Solo cambias:**
- ✅ `config/contexts.json`
- ✅ `.env` (si cambias puertos)

## 🎨 Ejemplo de Uso (Frontend)

```typescript
// Modo General (chat flotante en todas las páginas)
const respuesta = await fetch('http://localhost:5001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contextId: 'forensic-dna',
    message: '¿Qué es el algoritmo Aho-Corasick?',
    sessionId: 'user123'
  })
});

// Modo Contextual (botón "Analizar con IA" en un caso específico)
const respuesta = await fetch('http://localhost:5001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contextId: 'forensic-dna',
    message: '¿Qué tan confiables son estos resultados?',
    sessionId: `user123_${casoId}`,
    caseData: {
      casoNumero: 'CASO-2024-018',
      patrones: ['ATCGATCG', 'GCTAGCTA'],
      totalCoincidencias: 15,
      algoritmoUsado: 'Aho-Corasick',
      tiempoEjecucionMs: 150
    }
  })
});
```

## 🐛 Troubleshooting

### "Error: connect ECONNREFUSED localhost:11434"

**Solución:** Ollama no está corriendo.

```bash
ollama serve
```

### "Error: Model llama3.2 not found"

**Solución:** Descarga el modelo.

```bash
ollama pull llama3.2
```

### Puerto 5001 ya en uso

**Solución:** Cambia el puerto en `.env`:

```env
PORT=5002
```

## 📚 Contextos Incluidos

- `forensic-dna` - Asistente forense de ADN (análisis, comparaciones, insights)

## 🎯 Próximos Pasos

1. **Integración Frontend:** Crea widget de chat flotante
2. **Botón Contextual:** Agrega "Analizar con IA" en historial
3. **Más Contextos:** Agrega contextos para otros módulos

## 📄 Licencia

MIT - Libre para uso en proyectos comerciales y personales
