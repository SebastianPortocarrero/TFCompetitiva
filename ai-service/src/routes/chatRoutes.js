const express = require('express');
const router = express.Router();
const ollamaService = require('../services/ollamaService');

/**
 * POST /api/chat
 * Envía un mensaje al asistente de IA
 *
 * Body:
 * {
 *   "contextId": "forensic-dna",
 *   "message": "Explícame este caso",
 *   "sessionId": "user123_case456",  // opcional
 *   "caseData": { ... }               // opcional
 * }
 */
router.post('/chat', async (req, res) => {
  try {
    const { contextId, message, sessionId, caseData } = req.body;

    // Validaciones
    if (!contextId) {
      return res.status(400).json({
        success: false,
        error: 'contextId es requerido'
      });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'message es requerido'
      });
    }

    // Generar respuesta
    const result = await ollamaService.chat(
      contextId,
      message,
      sessionId || 'default',
      caseData
    );

    res.json({
      success: true,
      data: {
        response: result.response,
        model: result.model,
        responseTime: result.responseTime,
        sessionId: result.sessionId
      }
    });

  } catch (error) {
    console.error('Error en /chat:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/chat/session/:sessionId
 * Limpia el historial de una sesión
 */
router.delete('/chat/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    ollamaService.clearSession(sessionId);

    res.json({
      success: true,
      message: `Sesión ${sessionId} limpiada`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/contexts
 * Lista todos los contextos disponibles
 */
router.get('/contexts', async (req, res) => {
  try {
    const contexts = await ollamaService.listContexts();

    res.json({
      success: true,
      data: { contexts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/health
 * Verifica el estado del servicio
 */
router.get('/health', async (req, res) => {
  try {
    const health = await ollamaService.healthCheck();

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
