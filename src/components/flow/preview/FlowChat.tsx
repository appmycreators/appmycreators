import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WhatsAppAudioPlayer } from './WhatsAppAudioPlayer';
import { flowLeadService } from '@/services/flowLeadService';
import type { Flow, FlowNode, FlowEdge } from '@/types/flow.types';

// Componente para renderizar texto com URLs clicáveis
function MessageContent({ content }: { content: string }) {
  // Regex para detectar URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  return (
    <>
      {parts.map((part, index) => {
        // Se for uma URL, renderizar como link
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              {part}
            </a>
          );
        }
        // Caso contrário, renderizar como texto normal
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

// Componente para renderizar formulário InputNode (estilo Flowise)
interface InputFormRendererProps {
  data: {
    nodeId: string;
    inputType: string;
    placeholder?: string;
    required?: boolean;
    variable?: string;
    options?: string;
  };
  onSubmit: (nodeId: string, value: string, variable?: string) => void;
  primaryColor?: string;
}

function InputFormRenderer({ data, onSubmit, primaryColor }: InputFormRendererProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.required && !value.trim()) return;
    onSubmit(data.nodeId, value, data.variable);
  };

  // Determinar tipo de input HTML
  const getInputType = () => {
    switch (data.inputType) {
      case 'email': return 'email';
      case 'phone': return 'tel';
      case 'number': return 'number';
      default: return 'text';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <Input
        type={getInputType()}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={data.placeholder || 'Digite sua resposta...'}
        required={data.required}
        autoFocus
      />
      <Button
        type="submit"
        disabled={data.required && !value.trim()}
        style={{ backgroundColor: primaryColor || '#3b82f6' }}
        className="w-full text-white"
      >
        Enviar
      </Button>
    </form>
  );
}

interface FlowChatProps {
  flow: Flow;
  nodes: FlowNode[];
  edges: FlowEdge[];
  isPreview?: boolean;
}

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  nodeType?: string;
  timestamp: Date;
  isTyping?: boolean;
  mediaData?: {
    mediaType: 'image' | 'video' | 'audio';
    mediaUrl: string;
    caption?: string;
    thumbnail?: string;
    autoPlay?: boolean;
    controls?: boolean;
  };
}

export function FlowChat({ flow, nodes, edges, isPreview = false }: FlowChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [waitingForInteraction, setWaitingForInteraction] = useState(false);
  const [pendingNodeId, setPendingNodeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Lead tracking (apenas para fluxos publicados)
  const [sessionId] = useState(() => crypto.randomUUID());
  const [leadCreated, setLeadCreated] = useState(false);
  const shouldTrackLeads = !isPreview && flow.is_published;

  // Debug: Log das condições de tracking
  useEffect(() => {
    console.log('🔍 Condições de tracking de leads:', {
      isPreview,
      isPublished: flow.is_published,
      shouldTrackLeads,
      sessionId
    });
  }, [isPreview, flow.is_published, shouldTrackLeads, sessionId]);

  // Obter dados do avatar do StartNode
  const startNode = nodes.find((n) => n.node_type === 'start');
  const botAvatar = (startNode?.data as any)?.avatar;
  const botName = (startNode?.data as any)?.avatarName || 'Bot';
  const showStartButton = (startNode?.data as any)?.showStartButton !== false;

  // Função para garantir que URL tenha protocolo correto
  const formatUrl = (url: string): string => {
    if (!url) return '';
    
    // Se já tem protocolo, usar como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Se não tem protocolo, adicionar https://
    return `https://${url}`;
  };

  // Scroll automático para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-iniciar fluxo se botão de início estiver desabilitado
  useEffect(() => {
    if (!showStartButton && !isStarted && nodes.length > 0) {
      startFlow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showStartButton, isStarted, nodes.length]);

  // Criar lead inicial ao iniciar conversa (apenas fluxos publicados)
  const createInitialLead = useCallback(async () => {
    console.log('🔄 createInitialLead chamado:', {
      shouldTrackLeads,
      leadCreated,
      willExecute: shouldTrackLeads && !leadCreated
    });

    if (!shouldTrackLeads || leadCreated) {
      console.log('⏭️ Pulando criação de lead:', {
        reason: !shouldTrackLeads ? 'shouldTrackLeads é false' : 'lead já foi criada'
      });
      return;
    }

    try {
      console.log('📊 Criando lead inicial...', {
        flowId: flow.id,
        sessionId,
        isPublished: flow.is_published,
        isPreview
      });

      const ipAddress = await flowLeadService.getUserIP();
      const userAgent = flowLeadService.getUserAgent();

      console.log('📡 Dados para criar lead:', {
        flow_id: flow.id,
        session_id: sessionId,
        ip_address: ipAddress,
        user_agent: userAgent
      });

      const result = await flowLeadService.createLead({
        flow_id: flow.id,
        session_id: sessionId,
        ip_address: ipAddress || undefined,
        user_agent: userAgent
      });

      setLeadCreated(true);
      console.log('✅ Lead criada com sucesso!', result);
    } catch (error: any) {
      console.error('❌ Erro ao criar lead:', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
    }
  }, [shouldTrackLeads, leadCreated, flow.id, sessionId, flow.is_published, isPreview]);

  // Calcular tempo de digitação baseado no conteúdo
  const calculateTypingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const baseTime = (words / wordsPerMinute) * 60 * 1000;
    return Math.max(1000, Math.min(baseTime, 4000));
  };

  // Adicionar mensagem do bot com delay e simulação de digitação
  const addBotMessageWithDelay = (content: string, nodeType: string, delay: number) => {
    // Primeiro, aguardar o delay
    setTimeout(() => {
      // Mostrar indicador de digitação
      setIsTyping(true);
      
      const typingTime = calculateTypingTime(content);
      
      // Após o tempo de digitação, mostrar a mensagem
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            type: 'bot',
            content,
            nodeType,
            timestamp: new Date(),
          },
        ]);
      }, typingTime);
    }, delay);
  };

  // Adicionar mensagem com mídia
  const addBotMessageWithMedia = (content: string, nodeType: string, mediaData: any, delay: number) => {
    console.log('🎬 Adicionando mídia:', {
      mediaType: mediaData.mediaType,
      mediaUrl: mediaData.mediaUrl,
      caption: mediaData.caption,
      delay
    });
    
    setTimeout(() => {
      setIsTyping(true);
      
      const typingTime = calculateTypingTime(content || 'Mídia');
      
      setTimeout(() => {
        setIsTyping(false);
        console.log('📱 Criando mensagem com mídia:', mediaData);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            type: 'bot',
            content,
            nodeType,
            timestamp: new Date(),
            mediaData,
          },
        ]);
      }, typingTime);
    }, delay);
  };

  // Iniciar o fluxo
  const startFlow = async () => {
    const startNode = nodes.find((n) => n.node_type === 'start');
    if (!startNode) return;

    setIsStarted(true);
    
    // Criar lead inicial (apenas fluxos publicados)
    await createInitialLead();
    
    processNode(startNode);
  };

  // Processar resposta do usuário e continuar fluxo
  const handleUserResponse = (message: string) => {
    // Adicionar mensagem do usuário
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        type: 'user',
        content: message,
        timestamp: new Date(),
      },
    ]);

    // Se estava aguardando interação, continuar o fluxo
    if (waitingForInteraction && pendingNodeId) {
      setWaitingForInteraction(false);
      const nextNode = getNextNode(pendingNodeId);
      setPendingNodeId(null);
      if (nextNode) processNode(nextNode);
    }
  };

  // Processar um node
  const processNode = (node: FlowNode) => {
    setCurrentNodeId(node.node_id);

    const data = node.data as any;

    // Adicionar mensagem do bot com delay e typing
    if (node.node_type === 'start') {
      addBotMessageWithDelay(data.welcomeMessage || 'Olá! Bem-vindo.', node.node_type, 0);
      
      // Verificar se deve aguardar interação
      const waitForInteraction = data.waitForInteraction !== false;
      const typingTime = calculateTypingTime(data.welcomeMessage || 'Olá! Bem-vindo.');
      
      if (waitForInteraction) {
        setTimeout(() => {
          setWaitingForInteraction(true);
          setPendingNodeId(node.node_id);
        }, typingTime + 500);
      } else {
        setTimeout(() => {
          const nextNode = getNextNode(node.node_id);
          if (nextNode) processNode(nextNode);
        }, typingTime + 500);
      }
    } else if (node.node_type === 'message') {
      addBotMessageWithDelay(data.content || '', node.node_type, 0);
      
      // Verificar se deve aguardar interação
      const waitForInteraction = data.waitForInteraction !== false;
      const typingTime = calculateTypingTime(data.content || '');
      
      if (waitForInteraction) {
        setTimeout(() => {
          setWaitingForInteraction(true);
          setPendingNodeId(node.node_id);
        }, typingTime + 500);
      } else {
        setTimeout(() => {
          const nextNode = getNextNode(node.node_id);
          if (nextNode) processNode(nextNode);
        }, typingTime + 500);
      }
    } else if (node.node_type === 'media') {
      // Debug: verificar dados do node
      console.log('🔍 Dados do media node:', {
        nodeData: data,
        mediaType: data.mediaType,
        mediaUrl: data.mediaUrl,
        caption: data.caption
      });

      // Debug específico para áudio
      if (data.mediaType === 'audio') {
        console.log('🎵 Processando node de áudio:', {
          url: data.mediaUrl,
          controls: data.controls,
          autoPlay: data.autoPlay,
          caption: data.caption
        });
      }
      
      // Para mídia, passar os dados completos em vez de texto
      addBotMessageWithMedia(
        data.caption || '',
        node.node_type,
        {
          mediaType: data.mediaType,
          mediaUrl: data.mediaUrl,
          caption: data.caption,
          thumbnail: data.thumbnail,
          autoPlay: data.autoPlay,
          controls: data.controls,
        },
        500
      );
      
      // Verificar se deve aguardar interação
      const waitForInteraction = data.waitForInteraction !== false;
      
      if (waitForInteraction) {
        setTimeout(() => {
          setWaitingForInteraction(true);
          setPendingNodeId(node.node_id);
        }, 2000);
      } else {
        setTimeout(() => {
          const nextNode = getNextNode(node.node_id);
          if (nextNode) processNode(nextNode);
        }, 2000);
      }
    } else if (node.node_type === 'delay') {
      // Node de delay - adiciona pausa no fluxo
      const duration = data.duration || 2000;
      const showTyping = data.showTyping !== false;

      // Mostrar indicador de digitação se habilitado
      if (showTyping) {
        setIsTyping(true);
      }

      // Aguardar duração do delay
      setTimeout(() => {
        setIsTyping(false);
        
        // Avançar para próximo node
        const nextNode = getNextNode(node.node_id);
        if (nextNode) processNode(nextNode);
      }, duration);
    } else if (node.node_type === 'input') {
      // Node de entrada - estilo Flowise
      // Renderizar mensagem COM formulário integrado
      console.log('📝 InputNode ativado:', {
        nodeId: node.node_id,
        label: data.label,
        inputType: data.inputType,
        placeholder: data.placeholder,
        required: data.required
      });
      
      // Adicionar mensagem especial com formulário integrado
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          type: 'bot',
          sender: 'bot',
          content: data.label || 'Por favor, digite sua resposta:',
          isInputForm: true, // Flag para renderizar formulário
          inputData: {
            nodeId: node.node_id,
            inputType: data.inputType,
            placeholder: data.placeholder,
            required: data.required,
            variable: data.variable,
            options: data.options, // Para select/multiselect
            dbField: data.dbField // Campo do banco para mapear
          },
          timestamp: new Date()
        } as any
      ]);
      
      // NÃO auto-avançar - aguardar submit do formulário
    } else if (node.node_type === 'end') {
      addBotMessageWithDelay(data.thankYouMessage || 'Obrigado!', node.node_type, 500);
      setTimeout(async () => {
        setIsCompleted(true);
        
        // Marcar conversa como completa (apenas fluxos publicados)
        if (shouldTrackLeads && leadCreated) {
          try {
            await flowLeadService.completeConversation(sessionId);
            console.log('✅ Conversa marcada como completa');
          } catch (error) {
            console.error('❌ Erro ao completar conversa:', error);
          }
        }
        
        // Redirecionar automaticamente se URL configurada
        if (data.redirectUrl && !isPreview) {
          setTimeout(() => {
            const formattedUrl = formatUrl(data.redirectUrl);
            console.log('🔗 Redirecionando para:', formattedUrl);
            window.open(formattedUrl, '_blank');
          }, 2000); // Aguarda 2s após completar para mostrar mensagem
        }
      }, 1000);
    }
  };

  // Adicionar mensagem do bot (método direto para compatibilidade)
  const addBotMessage = (content: string, nodeType: string) => {
    addBotMessageWithDelay(content, nodeType, 0);
  };

  // Adicionar mensagem do usuário
  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        type: 'user',
        content,
        timestamp: new Date(),
      },
    ]);
  };

  // Enviar resposta
  const handleSendResponse = () => {
    if (!inputValue.trim()) return;

    const message = inputValue;
    setInputValue('');

    // Processar resposta do usuário
    handleUserResponse(message);
  };

  // Submit do formulário InputNode (estilo Flowise)
  const handleInputFormSubmit = async (nodeId: string, value: string, variable?: string) => {
    // Adicionar mensagem do usuário
    addUserMessage(value);

    // Buscar tipo de input e dbField para salvar corretamente
    const currentMsg = messages.find((msg: any) => msg.inputData?.nodeId === nodeId);
    const inputType = (currentMsg as any)?.inputData?.inputType || 'text';
    const dbField = (currentMsg as any)?.inputData?.dbField;

    // Salvar dados na lead (apenas fluxos publicados)
    if (shouldTrackLeads && leadCreated && variable) {
      try {
        await flowLeadService.captureInputData(sessionId, variable, value, inputType, dbField);
        console.log(`💾 Dados salvos: ${variable} = ${value} (tipo: ${inputType}, campo: ${dbField || 'auto'})`);
      } catch (error) {
        console.error('❌ Erro ao salvar dados na lead:', error);
      }
    }

    // Remover flag isInputForm da mensagem para não renderizar mais o form
    setMessages((prev) => 
      prev.map((msg: any) => 
        msg.inputData?.nodeId === nodeId 
          ? { ...msg, isInputForm: false, formSubmitted: true }
          : msg
      )
    );

    // Avançar para próximo node
    setTimeout(() => {
      const nextNode = getNextNode(nodeId);
      if (nextNode) {
        processNode(nextNode);
      }
    }, 500);
  };

  // Buscar próximo node
  const getNextNode = (fromNodeId: string): FlowNode | null => {
    const edge = edges.find((e) => e.source_node_id === fromNodeId);
    if (!edge) return null;

    const nextNode = nodes.find((n) => n.node_id === edge.target_node_id);
    return nextNode || null;
  };

  // Recomeçar fluxo
  const restartFlow = () => {
    setMessages([]);
    setCurrentNodeId(null);
    setIsStarted(false);
    setIsCompleted(false);
    setInputValue('');
  };

  // Node atual
  const currentNode = nodes.find((n) => n.node_id === currentNodeId);
  const needsInput = currentNode?.node_type === 'input';
  
  // Verificar se há um inputForm ativo (estilo Flowise)
  const hasActiveInputForm = messages.some((msg: any) => msg.isInputForm === true);
  
  const showInput = isStarted && !isCompleted && !hasActiveInputForm; // Ocultar input quando inputForm está ativo
  
  
  // Dados do EndNode para botão de finalização
  const endNode = nodes.find((n) => n.node_type === 'end');
  const endNodeData = endNode?.data as any;

  // Estado inicial (apenas se botão estiver habilitado)
  if (!isStarted && showStartButton) {
    const startNode = nodes.find((n) => n.node_type === 'start');
    const data = startNode?.data as any;

    return (
      <div
        className="h-full flex flex-col items-center justify-center p-8 text-center"
        style={{ backgroundColor: flow.background_color || '#ffffff' }}
      >
        <div className="max-w-md space-y-6">
          {/* Avatar do Bot ou Ícone Padrão */}
          {data?.avatar ? (
            <img 
              src={data.avatar} 
              alt={data?.avatarName || flow.flow_name}
              className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-gray-200 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
              <Play size={32} className="text-white" />
            </div>
          )}

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {data?.avatarName || flow.flow_name}
            </h3>
            {flow.description && (
              <p className="text-gray-600">{flow.description}</p>
            )}
          </div>

          <Button
            onClick={startFlow}
            size="lg"
            style={{ backgroundColor: data?.buttonColor || flow.primary_color }}
            className="text-white animate-pulse-scale hover:animate-none"
          >
            {data?.buttonText || 'Conversar agora...'}
          </Button>

          {isPreview && (
            <p className="text-sm text-gray-500">
              Modo Preview - Respostas não serão salvas
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: flow.background_color || '#f9fafb' }}
    >
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
          >
            {/* Avatar do bot */}
            {message.type === 'bot' && botAvatar && (
              <div className="flex-shrink-0">
                <img
                  src={botAvatar}
                  alt={botName}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="flex flex-col max-w-[70%]">
              {/* Nome do bot */}
              {message.type === 'bot' && botName && (
                <span className="text-xs text-gray-500 mb-1 ml-1">{botName}</span>
              )}
              
              <div
                className={`rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white px-4 py-2'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                }`}
              >
              {/* Renderizar mídia se existir */}
              {message.mediaData ? (
                <div className={message.type === 'bot' ? 'p-2' : 'px-4 py-2'}>
                  {message.mediaData.mediaType === 'image' && (
                    <div>
                      {message.mediaData.mediaUrl ? (
                        <>
                          <img
                            src={message.mediaData.mediaUrl}
                            alt={message.mediaData.caption || 'Imagem'}
                            className="max-w-full h-auto rounded-lg mb-2 block"
                            style={{ maxHeight: '300px', objectFit: 'cover' }}
                            onLoad={(e) => {
                              console.log('✅ Imagem carregada:', message.mediaData.mediaUrl);
                            }}
                            onError={(e) => {
                              console.error('❌ Erro ao carregar imagem:', message.mediaData.mediaUrl);
                              e.currentTarget.style.display = 'none';
                              const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextEl) nextEl.style.display = 'block';
                            }}
                          />
                          <div style={{ display: 'none' }} className="text-sm text-red-500 italic p-2 bg-red-50 rounded border">
                            ❌ Erro ao carregar imagem: <br />
                            <span className="text-xs break-all">{message.mediaData.mediaUrl}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded border">
                          ⚠️ URL da imagem não configurada
                        </div>
                      )}
                      {message.mediaData.caption && (
                        <p className="text-sm mt-2 text-gray-700">{message.mediaData.caption}</p>
                      )}
                    </div>
                  )}
                  
                  {message.mediaData.mediaType === 'video' && (
                    <div>
                      <video
                        src={message.mediaData.mediaUrl}
                        poster={message.mediaData.thumbnail}
                        controls={message.mediaData.controls !== false}
                        autoPlay={message.mediaData.autoPlay}
                        className="max-w-full h-auto rounded-lg mb-2"
                        style={{ maxHeight: '300px' }}
                      >
                        Seu navegador não suporta vídeos.
                      </video>
                      {message.mediaData.caption && (
                        <p className="text-sm mt-2">{message.mediaData.caption}</p>
                      )}
                    </div>
                  )}
                  
                  {message.mediaData.mediaType === 'audio' && (
                    <div>
                      {message.mediaData.mediaUrl ? (
                        <WhatsAppAudioPlayer 
                          src={message.mediaData.mediaUrl}
                          caption={message.mediaData.caption}
                        />
                      ) : (
                        <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded border">
                          ⚠️ URL do áudio não configurada
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Mensagem de texto normal OU formulário InputNode */
                <div className={message.type === 'bot' ? 'px-4 py-2' : ''}>
                  <MessageContent content={message.content} />
                  
                  {/* Renderizar formulário InputNode (estilo Flowise) */}
                  {(message as any).isInputForm && (message as any).inputData && (
                    <InputFormRenderer
                      data={(message as any).inputData}
                      onSubmit={handleInputFormSubmit}
                      primaryColor={flow.primary_color}
                    />
                  )}
                </div>
              )}
              
                {/* Timestamp */}
                <div
                  className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                  } ${message.mediaData ? 'px-2 pb-2' : message.type === 'bot' ? 'px-4 pb-2' : ''}`}
                >
                  {message.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Indicador de digitação */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 shadow-sm border border-gray-200 rounded-lg px-4 py-2 max-w-[70%]">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">digitando...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Sempre visível quando fluxo está ativo */}
      {showInput && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-3xl mx-auto">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendResponse();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isTyping 
                    ? 'Aguardando resposta...' 
                    : waitingForInteraction 
                      ? 'Digite para continuar...' 
                      : 'Digite uma mensagem...'
                }
                className="flex-1"
                disabled={isTyping || hasActiveInputForm}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendResponse();
                  }
                }}
              />
              <Button
                type="submit"
                onClick={handleSendResponse}
                disabled={!inputValue.trim() || isTyping}
                style={{ backgroundColor: flow.primary_color }}
                className="text-white"
              >
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Completed State */}
      {isCompleted && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            {/* Botão de redirecionamento se configurado */}
            {endNodeData?.redirectUrl && (
              <Button 
                onClick={() => {
                  const formattedUrl = formatUrl(endNodeData.redirectUrl);
                  console.log('🔗 Redirecionando para:', formattedUrl);
                  window.open(formattedUrl, '_blank');
                }}
                className="w-full"
                style={{ backgroundColor: flow.primary_color }}
              >
                Ir para o site
              </Button>
            )}
            
            {/* Botão recomeçar se habilitado */}
            {endNodeData?.showRestartButton !== false && (
              <Button onClick={restartFlow} variant="outline" className="w-full">
                {endNodeData?.restartButtonText || 'Recomeçar Fluxo'}
              </Button>
            )}
            
            {/* Se não tem nenhum botão, mostrar mensagem */}
            {!endNodeData?.redirectUrl && endNodeData?.showRestartButton === false && (
              <p className="text-sm text-gray-500">Fluxo finalizado</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
