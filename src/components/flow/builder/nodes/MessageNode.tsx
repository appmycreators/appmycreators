import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { MessageSquare, Settings } from 'lucide-react';
import type { MessageNodeData } from '@/types/flow.types';

interface MessageNodeProps extends NodeProps {
  data: MessageNodeData & {
    onEdit?: () => void;
  };
}

export const MessageNode = memo(({ data, selected }: MessageNodeProps) => {
  return (
    <div
      className={`
        relative bg-white rounded-lg border-2 shadow-lg min-w-[280px] max-w-[280px]
        transition-all duration-200
        ${selected ? 'border-purple-500 ring-4 ring-purple-100' : 'border-gray-300'}
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-md">
        <div className="flex items-center gap-2 text-white">
          <MessageSquare size={18} />
          <span className="font-semibold text-sm">Mensagem</span>
        </div>
        
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

      <div className="px-4 py-3">
        <div className="text-sm text-gray-700 line-clamp-4 whitespace-pre-wrap">
          {data.content || 'Clique para editar mensagem...'}
        </div>
      </div>

      <div className="px-4 py-2 bg-gray-50 rounded-b-md border-t border-gray-200">
        <span className="text-xs text-gray-500 font-medium">
          {data.format === 'markdown' ? 'MARKDOWN' : 'TEXTO'}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500" />
    </div>
  );
});

MessageNode.displayName = 'MessageNode';
