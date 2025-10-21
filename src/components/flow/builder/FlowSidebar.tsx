import { PlayCircle, MessageSquare, Image, Type, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { NodeType, NodeData } from '@/types/flow.types';

interface NodeTemplate {
  type: NodeType;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  defaultData: Partial<NodeData>;
}

interface FlowSidebarProps {
  onAddNode?: (type: NodeType, data: Partial<NodeData>) => void;
}

const nodeTemplates: NodeTemplate[] = [
  {
    type: 'start',
    label: 'Iniciar',
    icon: <PlayCircle size={20} />,
    description: 'Mensagem inicial do fluxo',
    color: 'bg-blue-500',
    defaultData: {
      type: 'start',
      welcomeMessage: 'Olá! Bem-vindo ao nosso fluxo.',
      showStartButton: true,
      buttonText: 'Conversar agora...',
      buttonColor: '#3b82f6',
      waitForInteraction: true,
    },
  },
  {
    type: 'message',
    label: 'Mensagem',
    icon: <MessageSquare size={20} />,
    description: 'Enviar mensagem de texto',
    color: 'bg-purple-500',
    defaultData: {
      type: 'message',
      content: 'Digite sua mensagem aqui...',
      format: 'text',
      waitForInteraction: true,
    },
  },
  {
    type: 'media',
    label: 'Mídia',
    icon: <Image size={20} />,
    description: 'Imagem, vídeo ou áudio',
    color: 'bg-green-500',
    defaultData: {
      type: 'media',
      mediaType: 'image',
      mediaUrl: '',
      autoPlay: false,
      controls: true,
      waitForInteraction: true,
    },
  },
  {
    type: 'input',
    label: 'Entrada',
    icon: <Type size={20} />,
    description: 'Coletar resposta do usuário',
    color: 'bg-orange-500',
    defaultData: {
      type: 'input',
      inputType: 'text',
      placeholder: 'Digite aqui...',
      required: true,
      variable: 'resposta',
    },
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: <Clock size={20} />,
    description: 'Adicionar pausa no fluxo',
    color: 'bg-amber-500',
    defaultData: {
      type: 'delay',
      duration: 2000,
      showTyping: true,
      label: 'Aguardando...',
    },
  },
  {
    type: 'end',
    label: 'Finalizar',
    icon: <CheckCircle size={20} />,
    description: 'Mensagem final do fluxo',
    color: 'bg-emerald-500',
    defaultData: {
      type: 'end',
      thankYouMessage: 'Obrigado por completar o fluxo!',
      showRestartButton: true,
      restartButtonText: 'Recomeçar',
    },
  },
];

export function FlowSidebar({ onAddNode }: FlowSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Iniciar colapsado em mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsCollapsed(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDragStart = (event: React.DragEvent, nodeType: NodeType, defaultData: Partial<NodeData>) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeData', JSON.stringify(defaultData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = (nodeType: NodeType, defaultData: Partial<NodeData>) => {
    if (onAddNode) {
      onAddNode(nodeType, defaultData);
    }
  };

  return (
    <div className="relative flex-shrink-0">
      {/* Toggle Button - Sempre visível */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          absolute top-4 z-20 h-8 w-8 rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50
          transition-all duration-300 text-gray-900
          ${isCollapsed ? 'left-2' : 'left-60'}
        `}
        title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
      >
        {isCollapsed ? <ChevronRight size={16} className="text-gray-900" /> : <ChevronLeft size={16} className="text-gray-900" />}
      </Button>

      <aside 
        className={`
          bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300
          ${isCollapsed ? 'w-0' : 'w-64'}
        `}
      >
        <div className={`space-y-4 p-4 ${isCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Componentes</h3>
          <p className="text-xs text-gray-500">
            Arraste para o canvas ou clique para adicionar
          </p>
        </div>

        <div className="space-y-2">
          {nodeTemplates.map((template) => (
            <div
              key={template.type}
              draggable
              onDragStart={(e) => handleDragStart(e, template.type, template.defaultData)}
              onClick={() => handleClick(template.type, template.defaultData)}
              className="
                group cursor-move p-3 rounded-lg border-2 border-gray-200 
                hover:border-gray-300 hover:bg-gray-50 transition-all
                active:scale-95
              "
            >
              <div className="flex items-start gap-3">
                <div className={`${template.color} p-2 rounded-md text-white flex-shrink-0`}>
                  {template.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 mb-0.5">
                    {template.label}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Dica:</strong> Conecte os componentes para criar o fluxo de conversação.
            </p>
          </div>
        </div>
        </div>
      </aside>
    </div>
  );
}
