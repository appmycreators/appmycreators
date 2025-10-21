import { Save, Eye, Play, Settings, Undo, Redo, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlowToolbarProps {
  flowName?: string;
  isSaving?: boolean;
  lastSaved?: Date;
  isPublished?: boolean;
  onSave?: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
  onSettings?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  onBack?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function FlowToolbar({
  flowName = 'Sem título',
  isSaving = false,
  lastSaved,
  isPublished = false,
  onSave,
  onPreview,
  onPublish,
  onSettings,
  onUndo,
  onRedo,
  onClear,
  onBack,
  canUndo = false,
  canRedo = false,
}: FlowToolbarProps) {
  const formatLastSaved = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Salvo agora';
    if (diff < 3600) return `Salvo há ${Math.floor(diff / 60)}min`;
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Left: Back button, Flow name and status */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{flowName}</h1>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Salvando...
              </span>
            ) : (
              lastSaved && (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  {formatLastSaved(lastSaved)}
                </span>
              )
            )}
            {isPublished && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Publicado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center: Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Desfazer"
          >
            <Undo size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Refazer"
          >
            <Redo size={16} />
          </Button>
        </div>

        {/* Clear */}
        {onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            title="Limpar canvas"
          >
            <Trash2 size={16} />
          </Button>
        )}

        {/* Settings */}
        {onSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            title="Configurações"
          >
            <Settings size={16} />
          </Button>
        )}
      </div>

      {/* Right: Main actions */}
      <div className="flex items-center gap-2">
        {/* Save */}
        {onSave && (
          <Button
            variant="outline"
            onClick={onSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save size={16} />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        )}

        {/* Preview */}
        {onPreview && (
          <Button
            variant="outline"
            onClick={onPreview}
            className="gap-2"
          >
            <Eye size={16} />
            Preview
          </Button>
        )}

        {/* Publish */}
        {onPublish && (
          <Button
            onClick={onPublish}
            className="gap-2"
          >
            <Play size={16} />
            {isPublished ? 'Despublicar' : 'Publicar'}
          </Button>
        )}
      </div>
    </div>
  );
}
