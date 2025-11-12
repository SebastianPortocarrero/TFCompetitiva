const { Ollama } = require('ollama');
const fs = require('fs').promises;
const path = require('path');

class OllamaService {
  constructor() {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_HOST || 'http://localhost:11434'
    });
    this.contexts = null;
    this.conversationHistory = new Map(); // Almacena historial por sessionId
  }

  /**
   * Carga los contextos desde el archivo JSON
   */
  async loadContexts() {
    if (this.contexts) return this.contexts;

    try {
      const contextsPath = path.join(__dirname, '../../config/contexts.json');
      const data = await fs.readFile(contextsPath, 'utf8');
      this.contexts = JSON.parse(data);
      console.log('✅ Contextos cargados:', Object.keys(this.contexts));
      return this.contexts;
    } catch (error) {
      console.error('❌ Error cargando contextos:', error.message);
      throw new Error('No se pudieron cargar los contextos');
    }
  }

  /**
   * Obtiene la configuración de un contexto específico
   */
  async getContext(contextId) {
    await this.loadContexts();

    if (!this.contexts[contextId]) {
      throw new Error(`Contexto "${contextId}" no encontrado. Contextos disponibles: ${Object.keys(this.contexts).join(', ')}`);
    }

    return this.contexts[contextId];
  }

  /**
   * Genera una respuesta usando Ollama
   *
   * @param {string} contextId - ID del contexto (ej: 'forensic-dna')
   * @param {string} userMessage - Mensaje del usuario
   * @param {string} sessionId - ID de sesión para mantener historial
   * @param {object} caseData - Datos del caso (opcional)
   */
  async chat(contextId, userMessage, sessionId = 'default', caseData = null) {
    try {
      const context = await this.getContext(contextId);

      // Obtener o crear historial de conversación
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, []);
      }
      const history = this.conversationHistory.get(sessionId);

      // Construir prompt con contexto del caso si existe
      let systemPrompt = context.systemPrompt;

      if (caseData) {
        systemPrompt += `\n\nDATOS DEL CASO ACTUAL:\n${JSON.stringify(caseData, null, 2)}`;
      }

      // Construir mensajes para Ollama
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...history,
        {
          role: 'user',
          content: userMessage
        }
      ];

      console.log(`💬 Chat [${contextId}] - Sesión: ${sessionId}`);
      console.log(`   Usuario: ${userMessage.substring(0, 100)}...`);

      // Llamar a Ollama
      const startTime = Date.now();
      const response = await this.ollama.chat({
        model: context.model || 'llama3.2',
        messages: messages,
        options: {
          temperature: context.temperature || 0.7,
          num_predict: context.maxTokens || 500
        }
      });

      const responseTime = Date.now() - startTime;
      const assistantMessage = response.message.content;

      console.log(`   IA: ${assistantMessage.substring(0, 100)}...`);
      console.log(`   ⏱️ Tiempo: ${responseTime}ms`);

      // Guardar en historial (limitado a últimos 10 mensajes)
      history.push({ role: 'user', content: userMessage });
      history.push({ role: 'assistant', content: assistantMessage });

      if (history.length > 20) { // 10 pares de mensajes
        history.splice(0, 2); // Eliminar el par más antiguo
      }

      return {
        response: assistantMessage,
        model: context.model,
        responseTime: responseTime,
        sessionId: sessionId
      };

    } catch (error) {
      console.error('❌ Error en chat:', error.message);
      throw error;
    }
  }

  /**
   * Limpia el historial de una sesión
   */
  clearSession(sessionId) {
    this.conversationHistory.delete(sessionId);
    console.log(`🗑️ Historial limpiado para sesión: ${sessionId}`);
  }

  /**
   * Lista todos los contextos disponibles
   */
  async listContexts() {
    await this.loadContexts();
    return Object.keys(this.contexts).map(id => ({
      id,
      name: this.contexts[id].name,
      description: this.contexts[id].description
    }));
  }

  /**
   * Verifica que Ollama esté corriendo y el modelo disponible
   */
  async healthCheck() {
    try {
      const models = await this.ollama.list();
      const llama32Available = models.models.some(m => m.name.includes('llama3.2'));

      return {
        status: 'ok',
        ollamaRunning: true,
        llama32Available,
        availableModels: models.models.map(m => m.name)
      };
    } catch (error) {
      return {
        status: 'error',
        ollamaRunning: false,
        error: error.message
      };
    }
  }
}

module.exports = new OllamaService();
