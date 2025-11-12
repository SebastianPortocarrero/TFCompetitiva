import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { sendMessage, clearSession, ChatMessage } from '@/services/aiService';

interface AIChatProps {
  contextId?: string;
  caseData?: any;
  sessionId?: string;
  onClose?: () => void;
}

const AIChat = ({ contextId = 'forensic-dna-general', caseData, sessionId, onClose }: AIChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSessionId = sessionId || 'default';

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Abrir automáticamente si se proporciona un caso
  useEffect(() => {
    if (caseData) {
      setIsOpen(true);
    }
  }, [caseData]);

  // Mensaje de bienvenida
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: caseData
          ? `🔬 **Análisis de Caso: ${caseData.casoNumero || 'N/A'}**\n\nHe cargado los datos del caso. Pregúntame:\n\n• ¿Son confiables estos resultados?\n• ¿Por qué se usó ${caseData.algoritmoUsado || 'este algoritmo'}?\n• ¿Las coincidencias son significativas?\n• ¿Qué recomiendas hacer?`
          : '👋 **Asistente Forense General**\n\nPregúntame sobre:\n• Algoritmos (KMP, Rabin-Karp, Aho-Corasick)\n• Conceptos de ADN forense\n• Mejores prácticas\n\n💡 Para analizar un caso específico, usa el botón 🤖 en el Historial.',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, caseData]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await sendMessage({
        contextId,
        message: inputMessage,
        sessionId: currentSessionId,
        caseData
      });

      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        toast.error(response.error || 'Error al obtener respuesta');
        // Mensaje de error
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: '❌ ' + (response.error || 'No pude procesar tu mensaje. ¿Está Ollama corriendo?'),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error: any) {
      toast.error('Error de conexión con el servicio de IA');
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '❌ Error de conexión. Verifica que el microservicio de IA esté corriendo en el puerto 5001.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = async () => {
    await clearSession(currentSessionId);
    setMessages([]);
    toast.success('Conversación reiniciada');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => isOpen ? handleClose() : setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-primary hover:shadow-xl transition-all"
          title="Asistente de IA"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </motion.div>

      {/* Ventana de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[600px]"
          >
            <Card className="h-full flex flex-col shadow-2xl border-2">
              {/* Header */}
              <div className="p-4 border-b bg-gradient-primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary-foreground" />
                    <div>
                      <h3 className="font-semibold text-primary-foreground">Asistente Forense</h3>
                      <p className="text-xs text-primary-foreground/80">
                        {caseData ? `Caso: ${caseData.casoNumero}` : 'Chat General'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearChat}
                      className="text-primary-foreground hover:bg-primary-foreground/20"
                      title="Limpiar conversación"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {caseData && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="text-primary-foreground hover:bg-primary-foreground/20"
                        title="Cerrar chat"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu pregunta..."
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isSending || !inputMessage.trim()}
                    className="bg-gradient-primary"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Presiona Enter para enviar
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChat;
