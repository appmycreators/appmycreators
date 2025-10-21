import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Image, Video, Music, Settings } from 'lucide-react';
import type { MediaNodeData } from '@/types/flow.types';

interface MediaNodeProps extends NodeProps {
  data: MediaNodeData & {
    onEdit?: () => void;
  };
}

export const MediaNode = memo(({ data, selected }: MediaNodeProps) => {
  const getIcon = () => {
    switch (data.mediaType) {
      case 'video': return <Video size={18} />;
      case 'audio': return <Music size={18} />;
      default: return <Image size={18} />;
    }
  };

  const getTypeLabel = () => {
    switch (data.mediaType) {
      case 'video': return 'VÍDEO';
      case 'audio': return 'ÁUDIO';
      default: return 'IMAGEM';
    }
  };

  return (
    <div
      className={`
        relative bg-white rounded-lg border-2 shadow-lg min-w-[280px] max-w-[280px]
        transition-all duration-200
        ${selected ? 'border-green-500 ring-4 ring-green-100' : 'border-gray-300'}
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-500" />
      
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-t-md">
        <div className="flex items-center gap-2 text-white">
          {getIcon()}
          <span className="font-semibold text-sm">Mídia</span>
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
        {data.mediaUrl ? (
          <div className="bg-gray-100 rounded-md overflow-hidden">
            {data.mediaType === 'image' ? (
              <img
                src={data.mediaUrl}
                alt={data.caption || 'Preview'}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextEl) nextEl.style.display = 'flex';
                }}
              />
            ) : data.mediaType === 'video' ? (
              <video
                src={data.mediaUrl}
                poster={data.thumbnail}
                className="w-full h-32 object-cover"
                muted
              />
            ) : (
              <div className="h-32 flex items-center justify-center">
                <div className="text-center">
                  <Music size={24} className="text-green-500 mx-auto mb-1" />
                  <span className="text-xs text-gray-600">Áudio</span>
                </div>
              </div>
            )}
            
            {/* Fallback para erro de carregamento */}
            <div 
              style={{ display: 'none' }} 
              className="h-32 flex items-center justify-center bg-red-50"
            >
              <div className="text-center">
                <span className="text-xs text-red-500">❌ Erro ao carregar</span>
                <p className="text-xs text-gray-400 mt-1 break-all px-2">{data.mediaUrl}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-md p-4 text-center h-32 flex items-center justify-center">
            <div>
              <Image size={24} className="text-gray-400 mx-auto mb-2" />
              <span className="text-sm text-gray-400">Nenhuma mídia selecionada</span>
            </div>
          </div>
        )}
        
        {data.caption && (
          <p className="text-xs text-gray-600 line-clamp-2">{data.caption}</p>
        )}
      </div>

      <div className="px-4 py-2 bg-gray-50 rounded-b-md border-t border-gray-200">
        <span className="text-xs text-gray-500 font-medium">{getTypeLabel()}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
    </div>
  );
});

MediaNode.displayName = 'MediaNode';
