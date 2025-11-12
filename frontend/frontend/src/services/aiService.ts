const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  contextId: string;
  message: string;
  sessionId?: string;
  caseData?: any;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    response: string;
    model: string;
    responseTime: number;
    sessionId: string;
  };
  error?: string;
}

/**
 * Envía un mensaje al asistente de IA
 */
export const sendMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al comunicarse con el servicio de IA');
    }

    return data;
  } catch (error: any) {
    console.error('Error en aiService.sendMessage:', error);
    return {
      success: false,
      error: error.message || 'Error de conexión con el servicio de IA'
    };
  }
};

/**
 * Limpia el historial de una sesión
 */
export const clearSession = async (sessionId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/chat/session/${sessionId}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error al limpiar sesión:', error);
    return false;
  }
};

/**
 * Obtiene la lista de contextos disponibles
 */
export const getContexts = async () => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/contexts`);
    const data = await response.json();
    return data.data?.contexts || [];
  } catch (error) {
    console.error('Error al obtener contextos:', error);
    return [];
  }
};

/**
 * Verifica el estado del servicio de IA
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/health`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error al verificar estado:', error);
    return { status: 'error', ollamaRunning: false };
  }
};
