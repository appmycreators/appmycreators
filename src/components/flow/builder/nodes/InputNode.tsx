import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Type, Mail, Phone, Calendar, Settings } from 'lucide-react';
import type { InputNodeData } from '@/types/flow.types';

interface InputNodeProps extends NodeProps {
  data: InputNodeData & {
    onEdit?: () => void;
  };
}

export const InputNode = memo(({ data, selected }: InputNodeProps) => {
  const getIcon = () => {
    switch (data.inputType) {
      case 'email': return <Mail size={18} />;
      case 'phone': return <Phone size={18} />;
      case 'date': return <Calendar size={18} />;
      default: return <Type size={18} />;
    }
  };

  const getTypeLabel = () => {
    const labels = {
      text: 'TEXTO',
      email: 'EMAIL',
      phone: 'TELEFONE',
      number: 'NÚMERO',
      textarea: 'TEXTO LONGO',
      select: 'SELEÇÃO',
      multiselect: 'MÚLTIPLA ESCOLHA',
      date: 'DATA',
      time: 'HORA',
    };
    return labels[data.inputType] || 'INPUT';
  };

  return (
    <div
      className={`
        relative bg-white rounded-lg border-2 shadow-lg min-w-[280px] max-w-[280px]
        transition-all duration-200
        ${selected ? 'border-orange-500 ring-4 ring-orange-100' : 'border-gray-300'}
      `}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-orange-500 !border-2 !border-white"
        style={{ top: -6 }}
      />
      
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-md">
        <div className="flex items-center gap-2 text-white">
          {getIcon()}
          <span className="font-semibold text-sm">Entrada</span>
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

      <div className="px-4 py-3 space-y-2">
        {data.label && (
          <div className="text-sm font-medium text-gray-700">{data.label}</div>
        )}
        
        <div className="bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
          <span className="text-sm text-gray-400">
            {data.placeholder || 'Digite sua resposta...'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {data.required && <span className="text-red-500">* Obrigatório</span>}
          </span>
          {data.variable && (
            <span className="text-gray-400 font-mono">{data.variable}</span>
          )}
        </div>
      </div>

      <div className="px-4 py-2 bg-gray-50 rounded-b-md border-t border-gray-200">
        <span className="text-xs text-gray-500 font-medium">{getTypeLabel()}</span>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-orange-500 !border-2 !border-white"
        style={{ bottom: -6 }}
      />
    </div>
  );
});

InputNode.displayName = 'InputNode';
