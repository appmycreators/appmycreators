import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Clock, Settings } from 'lucide-react';
import type { DelayNodeData } from '@/types/flow.types';

interface DelayNodeProps extends NodeProps {
  data: DelayNodeData & {
    onEdit?: () => void;
    onDelete?: () => void;
  };
}

export const DelayNode = memo(({ data, selected }: DelayNodeProps) => {
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  return (
    <div
      className={`
        relative bg-white rounded-lg border-2 shadow-lg min-w-[280px] max-w-[280px]
        transition-all duration-200
        ${selected ? 'border-orange-500 ring-4 ring-orange-100' : 'border-gray-300'}
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500" />

      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-md">
        <div className="flex items-center gap-2 text-white">
          <Clock size={18} />
          <span className="font-semibold text-sm">Delay</span>
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
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Duração:</span>
          <span className="text-sm font-semibold text-orange-600">
            {formatDuration(data.duration || 1000)}
          </span>
        </div>

        {data.showTyping && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Indicador de digitação</span>
          </div>
        )}

        {data.label && (
          <div className="text-xs text-gray-500 italic mt-2">
            "{data.label}"
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-gray-50 rounded-b-md border-t border-gray-200">
        <span className="text-xs text-gray-500 font-medium">PAUSA</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-500" />
    </div>
  );
});

DelayNode.displayName = 'DelayNode';
