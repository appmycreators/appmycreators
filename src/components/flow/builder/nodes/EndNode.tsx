import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { CheckCircle, Settings } from 'lucide-react';
import type { EndNodeData } from '@/types/flow.types';

interface EndNodeProps extends NodeProps {
  data: EndNodeData & {
    onEdit?: () => void;
  };
}

export const EndNode = memo(({ data, selected }: EndNodeProps) => {
  return (
    <div
      className={`
        relative bg-white rounded-lg border-2 shadow-lg min-w-[280px] max-w-[280px]
        transition-all duration-200
        ${selected ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-gray-300'}
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-500" />
      
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-md">
        <div className="flex items-center gap-2 text-white">
          <CheckCircle size={18} />
          <span className="font-semibold text-sm">Finalizar</span>
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

      <div className="px-4 py-3 space-y-3">
        <div className="text-sm text-gray-700 line-clamp-3">
          {data.thankYouMessage || 'Obrigado por completar o fluxo!'}
        </div>
        
        {data.showRestartButton && (
          <div className="flex justify-center">
            <div className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white">
              {data.restartButtonText || 'Recomeçar'}
            </div>
          </div>
        )}
        
        {data.redirectUrl && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Redirecionar para: <span className="font-mono text-blue-600">{data.redirectUrl}</span>
            </p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-gray-50 rounded-b-md border-t border-gray-200">
        <span className="text-xs text-gray-500 font-medium">FIM DO FLUXO</span>
      </div>
    </div>
  );
});

EndNode.displayName = 'EndNode';
