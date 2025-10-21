import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { PlayCircle, Settings, User } from 'lucide-react';
import type { StartNodeData } from '@/types/flow.types';

interface StartNodeProps extends NodeProps {
  data: StartNodeData & {
    onEdit?: () => void;
    onDelete?: () => void;
  };
}

export const StartNode = memo(({ data, selected }: StartNodeProps) => {
  return (
    <div
      className={`
        relative bg-white rounded-lg border-2 shadow-lg min-w-[280px] max-w-[280px]
        transition-all duration-200
        ${selected ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-300'}
      `}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-md">
        <div className="flex items-center gap-2 text-white flex-1">
          {/* Avatar do Bot */}
          {data.avatar ? (
            <img 
              src={data.avatar} 
              alt={data.avatarName || 'Bot'}
              className="w-6 h-6 rounded-full object-cover border border-white/30"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
              <User size={14} className="text-white" />
            </div>
          )}
          <span className="font-semibold text-sm">
            {data.avatarName || 'Iniciar Fluxo'}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {data.onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onEdit?.();
              }}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Settings size={14} className="text-white" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-3 space-y-2">
        <div className="text-sm text-gray-700 line-clamp-3">
          {data.welcomeMessage || 'Clique para adicionar mensagem...'}
        </div>
        
        {data.showStartButton && (
          <div className="flex justify-center pt-2">
            <div className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500">
              {data.buttonText || 'Conversar agora...'}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-gray-50 rounded-b-md border-t border-gray-200">
        <span className="text-xs text-gray-500 font-medium">INÍCIO</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
});

StartNode.displayName = 'StartNode';
