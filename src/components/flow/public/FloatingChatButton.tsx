import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { FlowPublicModal } from '@/components/flow/preview/FlowPublicModal';
import type { Flow, FlowNode, FlowEdge } from '@/types/flow.types';

interface FloatingChatButtonProps {
  flow: Flow;
  nodes: FlowNode[];
  edges: FlowEdge[];
  primaryColor?: string;
}

export function FloatingChatButton({ flow, nodes, edges, primaryColor = '#3b82f6' }: FloatingChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  const handleOpen = () => {
    setIsOpen(true);
    setShowNotification(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Notificação de Badge */}
          {showNotification && (
            <div 
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce shadow-lg"
              style={{ animation: 'bounce 1s infinite' }}
            >
              1
            </div>
          )}

          {/* Botão Principal */}
          <button
            onClick={handleOpen}
            className="group relative bg-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95 border-2"
            style={{ 
              borderColor: primaryColor,
              backgroundColor: 'white'
            }}
            aria-label="Abrir chat"
          >
            {/* Animação de pulso/brilho */}
            <div 
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: primaryColor }}
            ></div>
            
            <MessageCircle 
              size={32} 
              style={{ color: primaryColor }}
              className="transition-transform group-hover:scale-110 relative z-10"
            />
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {flow.flow_name}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </button>
        </div>
      )}

      {/* Modal do Chat */}
      {isOpen && (
        <FlowPublicModal
          flow={flow}
          nodes={nodes}
          edges={edges}
          onClose={handleClose}
        />
      )}
    </>
  );
}
