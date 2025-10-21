import { useEffect } from 'react';
import { X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlowChat } from './FlowChat';
import type { Flow, FlowNode, FlowEdge } from '@/types/flow.types';

interface FlowPreviewModalProps {
  flow: Flow | null;
  nodes: FlowNode[];
  edges: FlowEdge[];
  onClose: () => void;
}

export function FlowPreviewModal({ flow, nodes, edges, onClose }: FlowPreviewModalProps) {
  // Impedir scroll do body quando modal está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!flow) return null;

  // Buscar informações do bot no node "start"
  const startNode = nodes.find(node => node.node_type === 'start');
  const startData = startNode?.data && typeof startNode.data === 'object' ? startNode.data as any : {};
  const botAvatar = startData.avatar as string | undefined;
  const botName = startData.avatarName as string | undefined;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3 flex-1">
            {/* Avatar do Bot */}
            {botAvatar ? (
              <img 
                src={botAvatar} 
                alt={botName || flow.flow_name}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <User size={20} className="text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900" style={{ lineHeight: '1.00rem' }}>
                {botName || flow.flow_name}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-600">Online</span>
              </div>
              
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <FlowChat
            flow={flow}
            nodes={nodes}
            edges={edges}
            isPreview={true}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Modo Preview - Respostas não serão salvas</span>
            <span>{nodes.length} componentes no fluxo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
