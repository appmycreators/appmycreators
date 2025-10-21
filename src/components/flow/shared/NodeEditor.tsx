import { useState, useEffect, useRef } from 'react';
import { X, Check, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { mediaUploadService } from '@/services/mediaUploadService';
import { useToast } from '@/hooks/use-toast';
import type { 
  ReactFlowNode, 
  NodeData, 
  StartNodeData, 
  MessageNodeData, 
  MediaNodeData, 
  InputNodeData, 
  DelayNodeData,
  EndNodeData 
} from '@/types/flow.types';

interface NodeEditorProps {
  node: ReactFlowNode;
  flowId?: string;
  onClose: () => void;
  onUpdate: (nodeId: string, data: NodeData) => void;
  onDelete: (nodeId: string) => void;
}

export function NodeEditor({ node, flowId, onClose, onUpdate, onDelete }: NodeEditorProps) {
  const [localData, setLocalData] = useState<NodeData>(node.data);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // Sincronizar estado local quando o node mudar
  useEffect(() => {
    setLocalData(node.data);
    setShowSavedFeedback(false); // Resetar feedback ao trocar de node
  }, [node.id, node.data]);

  const handleSave = () => {
    onUpdate(node.id, localData);
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
    }, 2000);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(node.id);
    onClose();
  };

  const updateField = (field: string, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const getNodeTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      start: 'Iniciar',
      message: 'Mensagem',
      media: 'Mídia',
      input: 'Entrada',
      delay: 'Delay',
      end: 'Finalizar',
    };
    return labels[type] || type;
  };

  const renderEditor = () => {
    switch (node.type) {
      case 'start':
        return <StartNodeEditor data={localData as StartNodeData} updateField={updateField} flowId={flowId} />;
      case 'message':
        return <MessageNodeEditor data={localData as MessageNodeData} updateField={updateField} />;
      case 'media':
        return <MediaNodeEditor data={localData as MediaNodeData} updateField={updateField} flowId={flowId} />;
      case 'input':
        return <InputNodeEditor data={localData as InputNodeData} updateField={updateField} />;
      case 'delay':
        return <DelayNodeEditor data={localData as DelayNodeData} updateField={updateField} />;
      case 'end':
        return <EndNodeEditor data={localData as EndNodeData} updateField={updateField} />;
      default:
        return <div>Editor não encontrado para este tipo de node</div>;
    }
  };

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Editar Componente</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Node Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Tipo</p>
          <p className="text-sm font-medium text-gray-900">{getNodeTypeLabel(node.type)}</p>
        </div>

        {/* Dynamic Editor */}
        <div className="mb-6">
          {renderEditor()}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleSave} className="w-full" disabled={showSavedFeedback}>
            {showSavedFeedback ? (
              <>
                <Check size={16} className="mr-2" />
                Salvo!
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>

          <Button variant="destructive" onClick={handleDelete} className="w-full">
            Deletar Componente
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Deletar Componente"
        description={`Tem certeza que deseja deletar este componente "${node.type}"? Esta ação não pode ser desfeita e todas as conexões serão perdidas.`}
        confirmText="Sim, deletar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </aside>
  );
}

// ============================================
// START NODE EDITOR
// ============================================
function StartNodeEditor({ data, updateField, flowId }: { data: StartNodeData; updateField: (field: string, value: any) => void; flowId?: string }) {
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadMethod, setAvatarUploadMethod] = useState<'url' | 'upload'>('url');

  const handleAvatarFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !flowId) return;

    setIsUploadingAvatar(true);
    try {
      const result = await mediaUploadService.uploadMedia(file, 'image', flowId);
      updateField('avatar', result.url);
      toast({
        title: "Avatar enviado!",
        description: "Avatar do bot atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o avatar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Mensagem de Boas-vindas</Label>
        <Textarea
          value={data.welcomeMessage}
          onChange={(e) => updateField('welcomeMessage', e.target.value)}
          rows={4}
          placeholder="Digite a mensagem inicial..."
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Mostrar Botão</Label>
        <Switch
          checked={data.showStartButton}
          onCheckedChange={(checked) => updateField('showStartButton', checked)}
        />
      </div>

      {data.showStartButton && (
        <>
          <div>
            <Label>Texto do Botão</Label>
            <Input
              value={data.buttonText}
              onChange={(e) => updateField('buttonText', e.target.value)}
              placeholder="Conversar agora..."
            />
          </div>

          <div>
            <Label>Cor do Botão</Label>
            <Input
              type="color"
              value={data.buttonColor || '#3b82f6'}
              onChange={(e) => updateField('buttonColor', e.target.value)}
            />
          </div>
        </>
      )}

      {/* Avatar do Bot */}
      <div>
        <Label>Avatar do Bot</Label>
        
        {/* Toggle Upload Method */}
        <div className="flex gap-2 mb-2">
          <Button
            type="button"
            variant={avatarUploadMethod === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAvatarUploadMethod('url')}
            className="flex-1"
          >
            URL
          </Button>
          <Button
            type="button"
            variant={avatarUploadMethod === 'upload' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAvatarUploadMethod('upload')}
            className="flex-1"
          >
            Upload
          </Button>
        </div>

        {/* URL Input */}
        {avatarUploadMethod === 'url' && (
          <div>
            <Input
              value={data.avatar || ''}
              onChange={(e) => updateField('avatar', e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500 mt-1">Cole o link da imagem do avatar</p>
          </div>
        )}

        {/* File Upload */}
        {avatarUploadMethod === 'upload' && (
          <div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar || !flowId}
              className="w-full"
            >
              {isUploadingAvatar ? 'Enviando...' : 'Escolher Imagem'}
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              Formatos aceitos: JPG, PNG, GIF, WEBP
            </p>
          </div>
        )}

        {/* Preview do Avatar */}
        {data.avatar && (
          <div className="mt-2">
            <img 
              src={data.avatar} 
              alt="Avatar preview" 
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
        )}
      </div>

      <div>
        <Label>Nome do Avatar (Opcional)</Label>
        <Input
          value={data.avatarName || ''}
          onChange={(e) => updateField('avatarName', e.target.value)}
          placeholder="Bot, Assistente, etc"
        />
        <p className="text-xs text-gray-500 mt-1">Nome exibido nas mensagens do chat</p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Aguardar Resposta</Label>
          <p className="text-xs text-gray-500">Pausa até usuário enviar mensagem</p>
        </div>
        <Switch
          checked={data.waitForInteraction !== false}
          onCheckedChange={(checked) => updateField('waitForInteraction', checked)}
        />
      </div>
    </div>
  );
}

// ============================================
// MESSAGE NODE EDITOR
// ============================================
function MessageNodeEditor({ data, updateField }: { data: MessageNodeData; updateField: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Conteúdo da Mensagem</Label>
        <Textarea
          value={data.content}
          onChange={(e) => updateField('content', e.target.value)}
          rows={6}
          placeholder="Digite a mensagem..."
        />
      </div>

      <div>
        <Label>Formato</Label>
        <Select value={data.format} onValueChange={(value) => updateField('format', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto Simples</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Aguardar Resposta</Label>
          <p className="text-xs text-gray-500">Pausa até usuário enviar mensagem</p>
        </div>
        <Switch
          checked={data.waitForInteraction !== false}
          onCheckedChange={(checked) => updateField('waitForInteraction', checked)}
        />
      </div>
    </div>
  );
}

// ============================================
// MEDIA NODE EDITOR
// ============================================
function MediaNodeEditor({ data, updateField, flowId }: { data: MediaNodeData; updateField: (field: string, value: any) => void; flowId?: string }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('url');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !flowId) return;

    setIsUploading(true);
    try {
      const result = await mediaUploadService.uploadMedia(file, data.mediaType, flowId);
      updateField('mediaUrl', result.url);
      
      toast({
        title: 'Upload concluído!',
        description: 'Mídia enviada com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Tipo de Mídia</Label>
        <Select value={data.mediaType} onValueChange={(value) => updateField('mediaType', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Imagem</SelectItem>
            <SelectItem value="video">Vídeo</SelectItem>
            <SelectItem value="audio">Áudio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Escolher método: URL ou Upload */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={uploadMethod === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMethod('url')}
          className="flex-1"
        >
          URL
        </Button>
        <Button
          type="button"
          variant={uploadMethod === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMethod('upload')}
          className="flex-1"
        >
          Upload
        </Button>
      </div>

      {uploadMethod === 'url' ? (
        <div>
          <Label>URL da Mídia</Label>
          <Input
            value={data.mediaUrl}
            onChange={(e) => updateField('mediaUrl', e.target.value)}
            placeholder="https://..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {data.mediaType === 'image' && 'JPG, PNG, GIF, WebP'}
            {data.mediaType === 'video' && 'MP4, WebM, OGV'}
            {data.mediaType === 'audio' && 'MP3, WAV, OGG'}
          </p>
        </div>
      ) : (
        <div>
          <Label>Upload de Arquivo</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept={mediaUploadService.getAllowedExtensions(data.mediaType)}
            onChange={handleFileSelect}
            disabled={isUploading || !flowId}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !flowId}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Selecionar Arquivo
              </>
            )}
          </Button>
          {data.mediaUrl && (
            <p className="text-xs text-green-600 mt-2">✓ Arquivo enviado</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {data.mediaType === 'image' && 'JPG, PNG, GIF, WebP (máx 10MB)'}
            {data.mediaType === 'video' && 'MP4, WebM, OGV (máx 50MB)'}
            {data.mediaType === 'audio' && 'MP3, WAV, OGG (máx 10MB)'}
          </p>
        </div>
      )}

      {data.mediaType === 'video' && (
        <div>
          <Label>Thumbnail (Opcional)</Label>
          <Input
            value={data.thumbnail || ''}
            onChange={(e) => updateField('thumbnail', e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}

      <div>
        <Label>Legenda (Opcional)</Label>
        <Input
          value={data.caption || ''}
          onChange={(e) => updateField('caption', e.target.value)}
          placeholder="Descrição da mídia..."
        />
      </div>

      {data.mediaType !== 'image' && (
        <>
          <div className="flex items-center justify-between">
            <Label>Reprodução Automática</Label>
            <Switch
              checked={data.autoPlay || false}
              onCheckedChange={(checked) => updateField('autoPlay', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Mostrar Controles</Label>
            <Switch
              checked={data.controls !== false}
              onCheckedChange={(checked) => updateField('controls', checked)}
            />
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <div>
          <Label>Aguardar Resposta</Label>
          <p className="text-xs text-gray-500">Pausa até usuário enviar mensagem</p>
        </div>
        <Switch
          checked={data.waitForInteraction !== false}
          onCheckedChange={(checked) => updateField('waitForInteraction', checked)}
        />
      </div>
    </div>
  );
}

// ============================================
// INPUT NODE EDITOR
// ============================================
function InputNodeEditor({ data, updateField }: { data: InputNodeData; updateField: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Tipo de Input</Label>
        <Select value={data.inputType} onValueChange={(value) => updateField('inputType', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Telefone</SelectItem>
            <SelectItem value="number">Número</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Label</Label>
        <Input
          value={data.label || ''}
          onChange={(e) => updateField('label', e.target.value)}
          placeholder="Ex: Seu nome completo"
        />
      </div>

      <div>
        <Label>Placeholder</Label>
        <Input
          value={data.placeholder}
          onChange={(e) => updateField('placeholder', e.target.value)}
          placeholder="Digite aqui..."
        />
      </div>

      <div>
        <Label>Nome da Variável</Label>
        <Input
          value={data.variable}
          onChange={(e) => {
            // Validação: apenas letras minúsculas, números e underscore
            const sanitized = e.target.value
              .toLowerCase() // Converter para minúsculas
              .replace(/[^a-z0-9_]/g, '') // Remover caracteres não permitidos
              .replace(/^[0-9]/, ''); // Não pode começar com número
            updateField('variable', sanitized);
          }}
          placeholder="nome_usuario"
          className={data.variable && !/^[a-z_][a-z0-9_]*$/.test(data.variable) ? 'border-red-500' : ''}
        />
        <p className="text-xs text-gray-500 mt-1">
          Apenas letras minúsculas, números e underscore (_). Não pode começar com número.
        </p>
        {data.variable && !/^[a-z_][a-z0-9_]*$/.test(data.variable) && (
          <p className="text-xs text-red-500 mt-1">
            ⚠️ Nome de variável inválido
          </p>
        )}
      </div>

      <div>
        <Label>Mapear para Campo do Banco?</Label>
        <Select 
          value={data.dbField || 'none'} 
          onValueChange={(value) => updateField('dbField', value === 'none' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum (algo personalizado)</SelectItem>
            <SelectItem value="name">Nome (name)</SelectItem>
            <SelectItem value="email">Email (email)</SelectItem>
            <SelectItem value="phone">Telefone (phone)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Escolha um campo específico da tabela para salvar este dado
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Label>Campo Obrigatório</Label>
        <Switch
          checked={data.required}
          onCheckedChange={(checked) => updateField('required', checked)}
        />
      </div>
    </div>
  );
}

// ============================================
// DELAY NODE EDITOR
// ============================================
function DelayNodeEditor({ data, updateField }: { data: DelayNodeData; updateField: (field: string, value: any) => void }) {
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const handleDurationChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateField('duration', numValue);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Duração da Pausa</Label>
        <div className="space-y-2">
          <Input
            type="number"
            value={data.duration || 1000}
            onChange={(e) => handleDurationChange(e.target.value)}
            min={0}
            step={100}
          />
          <p className="text-xs text-gray-500">
            Duração em milissegundos • {formatDuration(data.duration || 1000)}
          </p>
        </div>
      </div>

      <div>
        <Label>Descrição (Opcional)</Label>
        <Input
          value={data.label || ''}
          onChange={(e) => updateField('label', e.target.value)}
          placeholder="Ex: Aguardando resposta..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Texto descritivo para identificar o delay
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Indicador de Digitação</Label>
          <p className="text-xs text-gray-500">Mostrar "..." durante o delay</p>
        </div>
        <Switch
          checked={data.showTyping !== false}
          onCheckedChange={(checked) => updateField('showTyping', checked)}
        />
      </div>

      <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
        <p className="text-xs text-orange-800">
          <strong>Dica:</strong> Use delays para simular tempo de "digitação" do bot e tornar a conversa mais natural.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700">Sugestões de duração:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Curto (1s)', value: 1000 },
            { label: 'Médio (2s)', value: 2000 },
            { label: 'Longo (3s)', value: 3000 },
            { label: 'Customizado', value: data.duration || 1000 },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => option.value !== (data.duration || 1000) && updateField('duration', option.value)}
              className={`px-3 py-2 text-xs rounded border transition-colors ${
                option.value === (data.duration || 1000)
                  ? 'bg-orange-100 border-orange-300 text-orange-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// END NODE EDITOR
// ============================================
function EndNodeEditor({ data, updateField }: { data: EndNodeData; updateField: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Mensagem de Agradecimento</Label>
        <Textarea
          value={data.thankYouMessage}
          onChange={(e) => updateField('thankYouMessage', e.target.value)}
          rows={4}
          placeholder="Obrigado por completar o fluxo!"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Botão "Recomeçar"</Label>
        <Switch
          checked={data.showRestartButton}
          onCheckedChange={(checked) => updateField('showRestartButton', checked)}
        />
      </div>

      {data.showRestartButton && (
        <div>
          <Label>Texto do Botão</Label>
          <Input
            value={data.restartButtonText || 'Recomeçar'}
            onChange={(e) => updateField('restartButtonText', e.target.value)}
          />
        </div>
      )}

      <div>
        <Label>URL de Redirecionamento (Opcional)</Label>
        <Input
          value={data.redirectUrl || ''}
          onChange={(e) => updateField('redirectUrl', e.target.value)}
          placeholder="https://..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Redireciona o usuário após completar o fluxo
        </p>
      </div>
    </div>
  );
}
