import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useHeaderSync } from "@/hooks/useHeaderSync";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlarmClock, Plus } from "lucide-react";
import VideoEditorModal from "@/components/VideoEditorModal";
import ImageEditorModal from "@/components/ImageEditorModal";
import { getVideoDuration, videoToGif } from "@/utils/videoToGif";
import { cropImageFromFile } from "@/utils/imageCrop";
import { StorageService } from "@/services/storageService";
import customizeAddIcon from "@/assets/customize_add_icon.png";
import type { GifOptions } from "@/utils/videoToGif";
import type { ImageCropOptions } from "@/components/ImageEditorModal";

// Carregar automaticamente todos os nitros da pasta
const nitroModules = import.meta.glob('@/assets/nitros/*.png', { eager: true, import: 'default' });
const NITRO_ANIMATIONS = Object.entries(nitroModules).map(([path, url]) => ({
  id: path.split('/').pop()?.replace('.png', '') || '',
  url: url as string,
  name: path.split('/').pop()?.replace('.png', '') || ''
}));

interface EditHeaderFormProps {
  open: boolean;
  onClose: () => void;
}

const AVATAR_BORDER_COLORS = [
  "#ffffff", // Branco
  "#000000", // Preto
  "#f59e0b", // Amarelo
  "#ef4444", // Vermelho
  "#3b82f6", // Azul
  "#10b981", // Verde
  "#8b5cf6", // Roxo
  "#f97316", // Laranja
];

const EditHeaderForm = ({ open, onClose }: EditHeaderFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerMediaInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Debug: verificar se a imagem está sendo importada
  console.log('customizeAddIcon:', customizeAddIcon);
  
  // Função para evitar cache de avatar
  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return null;
    // Se a URL já tem timestamp, não adicionar outro
    if (avatarUrl.includes('avatar_') && avatarUrl.includes('?')) return avatarUrl;
    // Adicionar timestamp para evitar cache
    const separator = avatarUrl.includes('?') ? '&' : '?';
    return `${avatarUrl}${separator}t=${Date.now()}`;
  };
  const { 
    profileName, 
    bio: savedBio, 
    avatarUrl: savedAvatar,
    avatarBorderColor: savedAvatarBorderColor,
    headerMediaUrl: savedHeaderMedia,
    headerMediaType: savedHeaderMediaType,
    showBadge: savedShowBadge,
    nitroAnimationUrl: savedNitroAnimationUrl,
    updateProfileName, 
    updateBio, 
    updateAvatar,
    updateAvatarBorderColor,
    updateHeaderMedia,
    removeHeaderMedia,
    updateShowBadge,
    updateNitroAnimation
  } = useHeaderSync();
  
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [showBadge, setShowBadge] = useState<boolean>(false);
  const [nitroEnabled, setNitroEnabled] = useState<boolean>(false);
  const [selectedNitro, setSelectedNitro] = useState<string>("");
  const [avatarBorderColor, setAvatarBorderColor] = useState<string>('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [headerMediaPreview, setHeaderMediaPreview] = useState<string | null>(null);
  const [headerMediaType, setHeaderMediaType] = useState<string>('');
  const [pendingHeaderMediaFile, setPendingHeaderMediaFile] = useState<File | null>(null);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [gifOptions, setGifOptions] = useState<GifOptions | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [tempVideoFile, setTempVideoFile] = useState<File | null>(null);
  const [previousPreview, setPreviousPreview] = useState<string | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [imageCropOptions, setImageCropOptions] = useState<ImageCropOptions | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Sincronizar com dados carregados
  useEffect(() => {
    if (profileName) setName(profileName);
    if (savedBio) setBio(savedBio);
    setShowBadge(savedShowBadge);
    setAvatarBorderColor(savedAvatarBorderColor);
    if (savedAvatar) setAvatarPreview(getAvatarUrl(savedAvatar));
    if (savedHeaderMedia) setHeaderMediaPreview(savedHeaderMedia);
    if (savedHeaderMediaType) setHeaderMediaType(savedHeaderMediaType);
    if (savedNitroAnimationUrl) {
      setNitroEnabled(true);
      setSelectedNitro(savedNitroAnimationUrl);
    }
  }, [profileName, savedBio, savedShowBadge, savedAvatarBorderColor, savedAvatar, savedHeaderMedia, savedHeaderMediaType, savedNitroAnimationUrl]);

  const onPickImage = () => fileInputRef.current?.click();
  
  const onRemoveImage = () => {
    setAvatarPreview(null);
    setPendingFile(null);
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    setIsProcessingImage(true);
    
    try {
      // Otimizar imagem do avatar (função específica)
      const optimizedFile = await StorageService.optimizeAvatar(f);
      const url = URL.createObjectURL(optimizedFile);
      setAvatarPreview(url);
      setPendingFile(optimizedFile);
    } catch (error) {
      console.error('Erro ao otimizar avatar:', error);
      // Fallback: usar arquivo original
      const url = URL.createObjectURL(f);
      setAvatarPreview(url);
      setPendingFile(f);
      toast({
        title: 'Aviso',
        description: 'Não foi possível otimizar a imagem, mas ela foi carregada normalmente.',
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const onPickHeaderMedia = () => headerMediaInputRef.current?.click();
  
  const onRemoveHeaderMedia = async () => {
    // Se já tem mídia salva no banco, remover
    if (savedHeaderMedia) {
      await removeHeaderMedia();
      toast({
        title: "Mídia removida!",
        description: "A mídia de topo foi excluída.",
      });
    }
    
    // Limpar preview local
    setHeaderMediaPreview(null);
    setHeaderMediaType('');
    setPendingHeaderMediaFile(null);
  };

  const onHeaderMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Detectar tipo
    if (f.type.startsWith('video/')) {
      // Apenas MP4 ou MOV
      const validVideoTypes = ['video/mp4', 'video/quicktime'];
      if (!validVideoTypes.includes(f.type)) {
        toast({
          title: "Formato de vídeo não suportado",
          description: "Aceitamos apenas MP4 ou MOV.",
        });
        // Limpar input para permitir selecionar novamente
        if (headerMediaInputRef.current) headerMediaInputRef.current.value = '';
        return;
      }

      // Validar tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (f.size > maxSize) {
        toast({
          title: "Vídeo muito grande",
          description: "O vídeo pode ter no máximo 10MB.",
        });
        // Limpar input para permitir selecionar novamente
        if (headerMediaInputRef.current) headerMediaInputRef.current.value = '';
        return;
      }

      try {
        const dur = await getVideoDuration(f);
        if (dur > 4 * 60) {
          toast({
            title: "Vídeo muito longo",
            description: "O vídeo pode ter no máximo 4 minutos.",
          });
          // Limpar input para permitir selecionar novamente
          if (headerMediaInputRef.current) headerMediaInputRef.current.value = '';
          return;
        }
        setVideoDuration(dur);
      } catch (err) {
        toast({ title: "Erro ao ler vídeo", description: "Não foi possível ler a duração do vídeo." });
        // Limpar input para permitir selecionar novamente
        if (headerMediaInputRef.current) headerMediaInputRef.current.value = '';
        return;
      }

      // Salvar preview anterior antes de abrir o editor
      setPreviousPreview(headerMediaPreview);
      setTempVideoFile(f);
      setShowVideoEditor(true);
    } else if (f.type.startsWith('image/')) {
      // Para imagens, abrir o editor
      setTempImageFile(f);
      setShowImageEditor(true);
    }
  };

  const handleSave = async () => {
    let updated = false;

    // Salvar nome se mudou
    if (name !== profileName && name.trim()) {
      await updateProfileName(name);
      updated = true;
    }

    // Salvar bio se mudou
    if (bio !== savedBio) {
      await updateBio(bio);
      updated = true;
    }

    // Salvar showBadge se mudou
    if (showBadge !== savedShowBadge) {
      await updateShowBadge(showBadge);
      updated = true;
    }

    // Salvar cor da borda do avatar se mudou
    if (avatarBorderColor !== savedAvatarBorderColor) {
      await updateAvatarBorderColor(avatarBorderColor);
      updated = true;
    }

    // Salvar animação Nitro se mudou
    const nitroUrl = nitroEnabled ? selectedNitro : '';
    if (nitroUrl !== savedNitroAnimationUrl) {
      await updateNitroAnimation(nitroUrl);
      updated = true;
    }

    // Fazer upload do avatar se há arquivo pendente
    if (pendingFile) {
      try {
        await updateAvatar(pendingFile);
        setPendingFile(null);
        updated = true;
      } catch (error) {
        console.error(error);
        toast({ title: 'Erro ao processar imagem', description: 'Tente novamente com outro arquivo.' });
      }
    }

    // Fazer upload da mídia de cabeçalho se há arquivo pendente
    if (pendingHeaderMediaFile) {
      try {
        if (headerMediaType === 'video') {
          setIsProcessingVideo(true);
          const opts: GifOptions =
            gifOptions || { start: 0, duration: Math.min(8, videoDuration || 8), aspectRatio: '1:1' };
          // Converter para GIF com limite de 4MB
          const gifFile = await videoToGif(pendingHeaderMediaFile, opts, 4 * 1024 * 1024);
          if (gifFile.size > 4 * 1024 * 1024) {
            toast({
              title: 'Arquivo grande',
              description: 'O GIF gerado ultrapassou 4MB. Tente reduzir a duração ou a resolução.',
            });
            setIsProcessingVideo(false);
            return;
          }
          await updateHeaderMedia(gifFile, gifOptions.aspectRatio as any);
          setIsProcessingVideo(false);
        } else {
          // Processar imagem com crop
          if (imageCropOptions) {
            setIsProcessingImage(true);
            // Se já temos o arquivo cropado, usar ele diretamente
            const fileToUpload = imageCropOptions.croppedFile || await cropImageFromFile(pendingHeaderMediaFile, imageCropOptions, 2048);
            await updateHeaderMedia(fileToUpload, imageCropOptions.aspectRatio as any);
            setIsProcessingImage(false);
          } else {
            await updateHeaderMedia(pendingHeaderMediaFile);
          }
        }

        setPendingHeaderMediaFile(null);
        updated = true;
      } catch (error) {
        console.error(error);
        toast({ title: 'Erro ao processar mídia', description: 'Tente novamente com outro arquivo.' });
      } finally {
        setIsProcessingVideo(false);
        setIsProcessingImage(false);
      }
    }

    if (updated) {
      toast({
        title: "Cabeçalho atualizado!",
        description: "Suas alterações foram salvas.",
      });
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden">
        <div className="max-h-[80vh] overflow-y-auto p-6">
        <DialogHeader className="text-center space-y-2 pb-2">
          <DialogTitle className="text-2xl font-semibold text-foreground">Editar Cabeçalho</DialogTitle>
        </DialogHeader>

        <div className="bg-white rounded-3xl p-6 shadow-card border border-border/60">
          {/* Foto de perfil */}
          <div className="mb-6">
            <div className="text-sm font-medium text-foreground mb-3">Foto de perfil</div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Button 
                  onClick={onPickImage} 
                  disabled={isProcessingImage}
                  className="w-full h-10 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  {isProcessingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Otimizando...
                    </>
                  ) : (
                    'Carregar Imagem'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onRemoveImage} 
                  disabled={isProcessingImage}
                  className="w-full h-10 rounded-full text-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  Remover Imagem
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </div>
            </div>
          </div>

          {/* Nome do perfil */}
          <div className="mb-6">
            <div className="text-sm font-medium text-foreground mb-2">Nome do perfil</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl" />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <div className="text-sm font-medium text-foreground mb-2">Bio</div>
            <Textarea placeholder="Adicionar descrição" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[120px] rounded-xl" />
          </div>

          {/* Badge Verificado */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">Badge Verificado</div>
                <div className="text-xs text-muted-foreground mt-1">Exibir badge azul ao lado do nome</div>
              </div>
              <Switch
                checked={showBadge}
                onCheckedChange={setShowBadge}
              />
            </div>
          </div>

          {/* Cor da borda do avatar */}
          <div className="mb-6">
            <div className="text-sm font-medium text-foreground mb-3">Cor da borda do avatar</div>
            <div className="flex flex-wrap gap-3">
              {AVATAR_BORDER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setAvatarBorderColor(color);
                    setShowColorPicker(false);
                  }}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    avatarBorderColor === color 
                      ? "ring-2 ring-[#25a3b1] border-[#25a3b1]" 
                      : "border-muted hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Selecionar cor da borda ${color}`}
                />
              ))}
              
              {/* Botão para abrir color picker customizado */}
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`w-10 h-10 rounded-full transition-all relative ${
                  showColorPicker || (!AVATAR_BORDER_COLORS.includes(avatarBorderColor) && avatarBorderColor !== '#ffffff') 
                    ? "ring-2 ring-[#25a3b1]" 
                    : ""
                }`}
                style={{
                  backgroundColor: !AVATAR_BORDER_COLORS.includes(avatarBorderColor) && avatarBorderColor !== '#ffffff' 
                    ? avatarBorderColor 
                    : 'transparent'
                }}
                aria-label="Escolher cor personalizada"
              >
                <img 
                  src={customizeAddIcon} 
                  alt="Personalizar cor" 
                  className="w-10 h-10 rounded-full"
                />
              </button>
            </div>
            
            {/* Color Picker */}
            {(showColorPicker || (!AVATAR_BORDER_COLORS.includes(avatarBorderColor) && avatarBorderColor !== '#ffffff')) && (
              <div className="mt-3 p-4 bg-muted/30 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-3">Escolha uma cor personalizada:</div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={avatarBorderColor}
                    onChange={(e) => setAvatarBorderColor(e.target.value)}
                    className="w-12 h-8 rounded border border-muted cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={avatarBorderColor}
                      onChange={(e) => setAvatarBorderColor(e.target.value)}
                      placeholder="#ffffff"
                      className="w-full px-3 py-1 text-sm border border-muted rounded focus:outline-none focus:ring-2 focus:ring-[#25a3b1]"
                    />
                  </div>
                  <div 
                    className="w-8 h-8 rounded border-2 border-muted"
                    style={{ backgroundColor: avatarBorderColor }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Vídeo ou imagem de topo */}
          <div className="mb-6">
            <div className="text-sm font-medium text-foreground mb-3">Vídeo ou imagem de topo</div>
            
            {headerMediaPreview && (
              <div className="mb-3 rounded-xl overflow-hidden border border-border/60 bg-muted/30">
                {headerMediaType === 'video' ? (
                  <video src={headerMediaPreview} className="w-full h-48 object-contain" controls />
                ) : (
                  <img src={headerMediaPreview} alt="Header media" className="w-full h-48 object-contain" />
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="flex-1 rounded-full"
                onClick={onPickHeaderMedia}
              >
                {headerMediaPreview ? 'Alterar' : 'Upload'}
              </Button>
              {headerMediaPreview && (
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={onRemoveHeaderMedia}
                >
                  Remover
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">PNG, JPG, MP4 ou MOV</p>
            <input 
              ref={headerMediaInputRef} 
              type="file" 
              accept="image/png,image/jpeg,image/jpg,video/mp4,video/quicktime" 
              className="hidden" 
              onChange={onHeaderMediaFileChange} 
            />
          </div>

          {/* Nitro MC */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-foreground">Nitro MC</div>
                <div className="text-xs text-muted-foreground mt-1">Adicionar animação no avatar</div>
              </div>
              <Switch
                checked={nitroEnabled}
                onCheckedChange={setNitroEnabled}
              />
            </div>
            
            {nitroEnabled && (
              <div className="mt-3 p-4 bg-muted/30 rounded-lg border space-y-3">
                <div className="text-xs font-medium text-muted-foreground">Escolha uma animação:</div>
                <div className="grid grid-cols-3 gap-3">
                  {NITRO_ANIMATIONS.map((nitro) => (
                    <button
                      key={nitro.id}
                      type="button"
                      onClick={() => setSelectedNitro(nitro.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedNitro === nitro.url
                          ? "ring-2 ring-[#25a3b1] border-[#25a3b1]"
                          : "border-muted hover:border-muted-foreground"
                      }`}
                    >
                      <img src={nitro.url} alt={`Nitro ${nitro.name}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-12 rounded-full hover:bg-muted/50 hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 h-12 rounded-full bg-[#00c6a9] hover:bg-[#03816e]"
            >
              Salvar
            </Button>
          </div>
        </div>
        </div>
        {/* Overlay de processamento de vídeo */}
        {isProcessingVideo && (
          <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center text-white p-4">
            <div className="bg-white text-black rounded-xl px-4 py-3 mb-8 shadow">
              <div className="flex items-center gap-2 text-sm">
                <AlarmClock className="w-4 h-4" />
                <span>Aguarde enquanto seu vídeo é processado. Não feche esta tela.</span>
              </div>
            </div>
            <Loader2 className="w-10 h-10 animate-spin mb-2" />
            <div className="font-semibold">Processando vídeo</div>
          </div>
        )}
        {/* Overlay de processamento de imagem */}
        {isProcessingImage && (
          <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center text-white p-4">
            <div className="bg-white text-black rounded-xl px-4 py-3 mb-8 shadow">
              <div className="flex items-center gap-2 text-sm">
                <AlarmClock className="w-4 h-4" />
                <span>Aguarde enquanto a imagem é processada.</span>
              </div>
            </div>
            <Loader2 className="w-10 h-10 animate-spin mb-2" />
            <div className="font-semibold">Processando imagem</div>
          </div>
        )}
        {/* Editor de vídeo */}
        {showVideoEditor && tempVideoFile && (
          <VideoEditorModal
            open={showVideoEditor}
            file={tempVideoFile}
            duration={videoDuration}
            onCancel={() => {
              // Restaurar preview anterior e não alterar nada
              setShowVideoEditor(false);
              setTempVideoFile(null);
              // Limpar input para permitir selecionar novamente
              if (headerMediaInputRef.current) headerMediaInputRef.current.value = '';
            }}
            onConfirm={(opts) => {
              // Confirmar: atualizar preview e preparar para upload
              const url = URL.createObjectURL(tempVideoFile);
              setHeaderMediaPreview(url);
              setHeaderMediaType('video');
              setPendingHeaderMediaFile(tempVideoFile);
              setGifOptions(opts);
              setShowVideoEditor(false);
              setTempVideoFile(null);
            }}
          />
        )}
        {/* Editor de imagem para header media */}
        {showImageEditor && tempImageFile && (
          <ImageEditorModal
            open={showImageEditor}
            file={tempImageFile}
            initialRatio="1:1"
            onCancel={() => {
              setShowImageEditor(false);
              setTempImageFile(null);
              // Limpar input para permitir selecionar novamente
              if (headerMediaInputRef.current) headerMediaInputRef.current.value = '';
            }}
            onConfirm={(opts) => {
              // Confirmar: atualizar preview e preparar para upload
              const url = URL.createObjectURL(tempImageFile);
              setHeaderMediaPreview(url);
              setHeaderMediaType('image');
              setPendingHeaderMediaFile(tempImageFile);
              setImageCropOptions(opts);
              setShowImageEditor(false);
              setTempImageFile(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditHeaderForm;
