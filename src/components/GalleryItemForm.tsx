import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { X, Image as ImageIcon, Trash2, Sparkles, Heart, Send, MessageCircle, Plus, Pencil, Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Lottie from "lottie-react";
import { StorageService } from "@/services/storageService";
import LottieAnimationPicker from "./LottieAnimationPicker";
import AddCommentModal from "./AddCommentModal";
import EditCommentModal from "./EditCommentModal";
import { useGalleryItemComments, useDeleteGalleryComment, useToggleCommentHighlight, type GalleryComment } from "@/hooks/useGalleryComments";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Carregar todos os arquivos .json da pasta lotties
const lottieFiles = import.meta.glob("@/assets/lotties/*.json", {
  eager: true,
  import: "default",
}) as Record<string, any>;

export interface GalleryItem {
  id: string;
  link: string;
  name: string;
  description?: string;
  price?: number; // guardado em centavos
  buttonText?: string;
  imageUrl?: string; // preview/base64 simples por enquanto
  destaque?: boolean;
  lottieAnimation?: string; // nome do arquivo lottie (ex: 'discount')
  enableSocialProof?: boolean; // ativar prova social
  customLikesCount?: number; // número customizado de curtidas
  customSharesCount?: number; // número customizado de compartilhamentos
}

interface GalleryItemFormProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: GalleryItem, imageFile?: File) => void;
  onUpdateItem?: (item: GalleryItem, imageFile?: File) => void;
  initialItem?: GalleryItem;
  onDeleteItem?: (id: string) => void;
}

const formatBRL = (cents: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    (cents || 0) / 100
  );
};

const parseToCents = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return Number(digits || "0");
};

export default function GalleryItemForm({ open, onClose, onAddItem, onUpdateItem, initialItem, onDeleteItem }: GalleryItemFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [link, setLink] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceCents, setPriceCents] = useState(0);
  const [buttonText, setButtonText] = useState("Saiba Mais");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [destaque, setDestaque] = useState(false);
  const [enableLottie, setEnableLottie] = useState(false);
  const [lottieAnimation, setLottieAnimation] = useState<string>("");
  const [showLottiePicker, setShowLottiePicker] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  // Estados para Prova Social
  const [enableSocialProof, setEnableSocialProof] = useState(false);
  const [customLikesCount, setCustomLikesCount] = useState(0);
  const [customSharesCount, setCustomSharesCount] = useState(0);
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [editingComment, setEditingComment] = useState<GalleryComment | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  // Hooks para comentários
  const { data: commentsData, refetch: refetchComments } = useGalleryItemComments(initialItem?.id || null);
  const deleteComment = useDeleteGalleryComment();
  const toggleHighlight = useToggleCommentHighlight();

  // Refetch comentários quando o modal abrir com um produto existente
  useEffect(() => {
    if (open && initialItem?.id) {
      refetchComments();
    }
  }, [open, initialItem?.id, refetchComments]);

  useEffect(() => {
    if (open) {
      if (initialItem) {
        setLink(initialItem.link || "");
        setName(initialItem.name || "");
        setDescription(initialItem.description || "");
        setPriceCents(initialItem.price || 0);
        setButtonText(initialItem.buttonText || "Saiba Mais");
        setImageUrl(initialItem.imageUrl);
        setPendingImageFile(null); // Limpar arquivo pendente ao editar item existente
        setDestaque(initialItem.destaque || false);
        setEnableLottie(!!initialItem.lottieAnimation);
        setLottieAnimation(initialItem.lottieAnimation || "");
        setEnableSocialProof(initialItem.enableSocialProof || false);
        setCustomLikesCount(initialItem.customLikesCount || 0);
        setCustomSharesCount(initialItem.customSharesCount || 0);
      } else {
        setLink("");
        setName("");
        setDescription("");
        setPriceCents(0);
        setButtonText("Saiba Mais");
        setImageUrl(undefined);
        setPendingImageFile(null);
        setDestaque(false);
        setEnableLottie(false);
        setLottieAnimation("");
        setEnableSocialProof(false);
        setCustomLikesCount(0);
        setCustomSharesCount(0);
      }
    }
    // NOTA: Não limpar estados ao fechar modal
    // Os valores devem persistir para quando reabrir
  }, [open, initialItem]);

  const priceDisplay = useMemo(() => formatBRL(priceCents), [priceCents]);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setLink(text.trim());
    } catch (e) {
      toast({
        title: "Não foi possível colar",
        description: "Permita acesso à área de transferência para colar automaticamente.",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessingImage(true);
    
    try {
      // Otimizar imagem da galeria
      const optimizedFile = await StorageService.optimizeGalleryImage(file);
      
      // Armazenar o arquivo otimizado para upload posterior
      setPendingImageFile(optimizedFile);
      
      // Criar preview da imagem otimizada
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(String(reader.result));
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(optimizedFile);
    } catch (error) {
      console.error('Erro ao otimizar imagem:', error);
      // Fallback: usar arquivo original
      setPendingImageFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(String(reader.result));
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
      toast({
        title: 'Aviso',
        description: 'Não foi possível otimizar a imagem, mas ela foi carregada normalmente.',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim() || !name.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o Link e o Nome do produto.",
        variant: "destructive",
      });
      return;
    }

    const payload: GalleryItem = {
      id: initialItem?.id || "",
      link: link.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      price: priceCents,
      buttonText: buttonText.trim() || undefined,
      imageUrl,
      destaque,
      lottieAnimation: enableLottie ? lottieAnimation : undefined,
      enableSocialProof,
      // IMPORTANTE: Sempre salvar os valores, mesmo se prova social desativada
      // Assim, ao reativar, os números não são perdidos
      customLikesCount: customLikesCount,
      customSharesCount: customSharesCount,
    };

    console.log('Payload being sent:', payload);
    console.log('Pending image file:', pendingImageFile);
    console.log('enableLottie:', enableLottie);
    console.log('lottieAnimation state:', lottieAnimation);

    if (initialItem && onUpdateItem) {
      onUpdateItem(payload, pendingImageFile || undefined);
      toast({ title: "Item atualizado!", description: "As alterações foram salvas." });
    } else {
      onAddItem(payload, pendingImageFile || undefined);
      toast({ title: "Item adicionado!", description: "Seu produto foi criado com sucesso." });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{initialItem ? "Editar produto" : "Produto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Link */}
            <div>
              <Label htmlFor="product-link">Link* (Checkout ou Site)</Label>
              <div className="mt-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    id="product-link"
                    placeholder="google.com"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="pr-20 focus:border-[#00c6a9] focus:shadow-sm focus:outline-none"
                  />
                  {link && (
                    <button
                      type="button"
                      onClick={() => setLink("")}
                      className="absolute right-16 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Limpar link"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00c6a9] text-sm px-2 py-1 rounded-md hover:bg-[#00c6a9]/10"
                  >
                    Colar
                  </button>
                </div>
              </div>
            </div>

            {/* Nome */}
            <div>
              <Label htmlFor="product-name">Nome*</Label>
              <Input
                id="product-name"
                placeholder="Meu produto 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 focus:border-[#00c6a9]"
              />
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="product-description">Descrição</Label>
              <Input
                id="product-description"
                placeholder="Descrição do produto"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 focus:ring-2 focus:ring-[#00c6a9] focus:border-[#00c6a9]"
              />
            </div>

            {/* Valor */}
            <div>
              <Label htmlFor="product-price">Valor</Label>
              <Input
                id="product-price"
                placeholder="R$0,00"
                value={priceDisplay}
                onChange={(e) => setPriceCents(parseToCents(e.target.value))}
                className="mt-1 focus:ring-2 focus:ring-[#00c6a9] focus:border-[#00c6a9]"
              />
            </div>

            {/* Texto do botão */}
            <div>
              <Label htmlFor="button-text">Texto do botão</Label>
              <Input
                id="button-text"
                placeholder="Saiba Mais"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="mt-1 focus:ring-2 focus:ring-[#00c6a9] focus:border-[#00c6a9]"
              />
            </div>

            {/* Destaque */}
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="destaque-switch" className="cursor-pointer">Destaque?</Label>
              <Switch
                id="destaque-switch"
                checked={destaque}
                onCheckedChange={setDestaque}
              />
            </div>

            {/* Lottie Animation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="lottie-switch" className="cursor-pointer">Adicionar Sticker?</Label>
                <Switch
                  id="lottie-switch"
                  checked={enableLottie}
                  onCheckedChange={setEnableLottie}
                />
              </div>
              {enableLottie && (
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setShowLottiePicker(true)}
                  >
                    <Sparkles className="w-4 h-4" />
                    {lottieAnimation ? "Alterar animação" : "Escolher animação"}
                  </Button>
                  {lottieAnimation && (() => {
                    const animationData = lottieFiles[`/src/assets/lotties/${lottieAnimation}.json`];
                    return animationData ? (
                      <Card className="p-3 flex items-center gap-3">
                        <div className="w-16 h-16 flex items-center justify-center">
                          <Lottie
                            animationData={animationData}
                            loop={true}
                            style={{ width: 64, height: 64 }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Animação selecionada</div>
                          <div className="text-xs text-muted-foreground capitalize">{lottieAnimation}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setLottieAnimation("")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </Card>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Lottie Picker Modal */}
            <LottieAnimationPicker
              open={showLottiePicker}
              onClose={() => setShowLottiePicker(false)}
              onSelect={(animation) => {
                console.log('Received animation in GalleryItemForm:', animation);
                setLottieAnimation(animation);
                setShowLottiePicker(false);
              }}
              selectedAnimation={lottieAnimation}
            />

            {/* Prova Social */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="enable-social-proof">Ativar Prova Social</Label>
                  <div className="text-xs text-muted-foreground">(Curtidas, Compartilhamentos, Comentários)</div>
                </div>
                <Switch
                  id="enable-social-proof"
                  checked={enableSocialProof}
                  onCheckedChange={setEnableSocialProof}
                />
              </div>

              {enableSocialProof && (
                <Card className="p-4 space-y-4 bg-muted/30">
                  {/* Curtidas */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <Label htmlFor="likes-count" className="text-sm">Curtidas</Label>
                    </div>
                    <Input
                      id="likes-count"
                      type="number"
                      min="0"
                      max="999999"
                      value={customLikesCount}
                      onChange={(e) => setCustomLikesCount(parseInt(e.target.value) || 0)}
                      className="w-24 text-center"
                      placeholder="0"
                    />
                  </div>

                  {/* Compartilhamentos */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Send className="w-4 h-4 text-blue-500" />
                      <Label htmlFor="shares-count" className="text-sm">Compartilhamentos</Label>
                    </div>
                    <Input
                      id="shares-count"
                      type="number"
                      min="0"
                      max="999999"
                      value={customSharesCount}
                      onChange={(e) => setCustomSharesCount(parseInt(e.target.value) || 0)}
                      className="w-24 text-center"
                      placeholder="0"
                    />
                  </div>

                  {/* Comentários */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-green-500" />
                        <Label className="text-sm">Comentários</Label>
                        {initialItem?.id && commentsData && (
                          <span className="text-xs text-muted-foreground">
                            ({commentsData.total} {commentsData.total === 1 ? 'comentário' : 'comentários'})
                          </span>
                        )}
                      </div>
                      {initialItem?.id && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddCommentModal(true)}
                          className="gap-2"
                        >
                          <Plus className="w-3 h-3" />
                          Adicionar
                        </Button>
                      )}
                    </div>
                    
                    {!initialItem?.id && (
                      <p className="text-xs text-muted-foreground italic">
                        Salve o produto primeiro para adicionar comentários
                      </p>
                    )}

                    {/* Lista de comentários */}
                    {initialItem?.id && commentsData?.comments && commentsData.comments.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {commentsData.comments.slice(0, 3).map((comment: any) => (
                          <div key={comment.id} className="flex gap-2 items-start p-2 bg-white rounded-md text-xs group hover:bg-gray-50 transition-colors relative">
                            {comment.is_highlighted && (
                              <div className="absolute -top-1 -left-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              </div>
                            )}
                            <img 
                              src={comment.author_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author_name)}&size=32`} 
                              alt={comment.author_name}
                              className="w-6 h-6 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate">{comment.author_name}</div>
                              <div className="text-muted-foreground line-clamp-2">{comment.comment_text}</div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => {
                                  toggleHighlight.mutate({
                                    commentId: comment.id,
                                    galleryItemId: initialItem.id
                                  });
                                }}
                                title={comment.is_highlighted ? "Remover destaque" : "Destacar comentário"}
                              >
                                <Star className={`w-3 h-3 ${comment.is_highlighted ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => {
                                  setEditingComment(comment);
                                  setShowEditCommentModal(true);
                                }}
                                title="Editar comentário"
                              >
                                <Pencil className="w-3 h-3 text-blue-500" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => setCommentToDelete(comment.id)}
                                title="Excluir comentário"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {commentsData.total > 3 && (
                          <p className="text-xs text-center text-muted-foreground">
                            +{commentsData.total - 3} comentário(s) a mais
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Modal de Adicionar Comentário */}
            {initialItem?.id && (
              <AddCommentModal
                open={showAddCommentModal}
                onClose={() => setShowAddCommentModal(false)}
                galleryItemId={initialItem.id}
                onCommentAdded={() => {
                  // Invalidar cache para forçar refetch
                  queryClient.invalidateQueries({ 
                    queryKey: ['gallery-comments', initialItem.id] 
                  });
                  // Refetch adicional para garantir
                  refetchComments();
                  toast({
                    title: "Comentário adicionado!",
                    description: "O comentário foi salvo com sucesso.",
                  });
                }}
              />
            )}

            {/* Modal de Editar Comentário */}
            {initialItem?.id && editingComment && (
              <EditCommentModal
                open={showEditCommentModal}
                onClose={() => {
                  setShowEditCommentModal(false);
                  setEditingComment(null);
                }}
                comment={editingComment}
                galleryItemId={initialItem.id}
                onCommentUpdated={() => {
                  queryClient.invalidateQueries({ 
                    queryKey: ['gallery-comments', initialItem.id] 
                  });
                  refetchComments();
                }}
              />
            )}

            {/* Dialog de Confirmação de Exclusão */}
            <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir comentário?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O comentário será permanentemente removido.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={async () => {
                      if (commentToDelete && initialItem?.id) {
                        try {
                          await deleteComment.mutateAsync({
                            commentId: commentToDelete,
                            galleryItemId: initialItem.id
                          });
                          toast({
                            title: "Comentário excluído!",
                            description: "O comentário foi removido com sucesso.",
                          });
                          setCommentToDelete(null);
                        } catch (error) {
                          toast({
                            title: "Erro ao excluir",
                            description: "Não foi possível excluir o comentário.",
                            variant: "destructive"
                          });
                        }
                      }
                    }}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Imagem */}
            <div>
              <Label>Imagem do produto</Label>
              <Card className="mt-2 p-3 flex items-center gap-3">
                {imageUrl ? (
                  <img src={imageUrl} alt="Pré-visualização" className="w-16 h-16 object-cover rounded-md" />
                ) : (
                  <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 flex items-center justify-end gap-2">
                  {imageUrl && (
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => {
                        setImageUrl(undefined);
                        setPendingImageFile(null);
                      }}
                      disabled={isProcessingImage}
                    >
                      Excluir
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isProcessingImage}
                    className="hover:bg-[#00c6a9] hover:text-white border-[#00c6a9]"
                  >
                    {isProcessingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Otimizando...
                      </>
                    ) : (
                      'Selecionar'
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Ações */}
            <div className="pt-4">
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/60 px-3 py-2">
                <Button type="submit" className="flex-1 bg-[#00c6a9] hover:bg-[#03816e]">Salvar</Button>
                <Button type="button" variant="outline" onClick={onClose} className="px-6 hover:bg-muted/50 hover:text-foreground">
                  Cancelar
                </Button>
                {initialItem?.id && onDeleteItem && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (!initialItem?.id) return;
                      onDeleteItem(initialItem.id);
                    }}
                    aria-label="Excluir produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
