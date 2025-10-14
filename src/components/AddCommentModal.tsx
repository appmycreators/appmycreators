import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface AddCommentModalProps {
  open: boolean;
  onClose: () => void;
  galleryItemId: string;
  onCommentAdded: () => void;
}

export default function AddCommentModal({ 
  open, 
  onClose, 
  galleryItemId,
  onCommentAdded 
}: AddCommentModalProps) {
  const [authorName, setAuthorName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "Imagem muito grande. Máximo 2MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `comment-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast({
        title: "Sucesso",
        description: "Foto carregada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível carregar a imagem.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!authorName.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o nome do autor.",
        variant: "destructive"
      });
      return;
    }

    if (!commentText.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, escreva o comentário.",
        variant: "destructive"
      });
      return;
    }

    if (commentText.trim().length < 3) {
      toast({
        title: "Comentário muito curto",
        description: "O comentário deve ter no mínimo 3 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('gallery_item_comments')
        .insert({
          gallery_item_id: galleryItemId,
          author_name: authorName.trim(),
          comment_text: commentText.trim(),
          author_avatar_url: avatarUrl || null,
          rating: 5, // Fixo em 5 estrelas
          is_approved: true, // Auto-aprovado
          is_highlighted: false
        });

      if (error) throw error;

      toast({
        title: "Comentário adicionado!",
        description: "O comentário foi salvo com sucesso.",
      });

      // Limpar formulário
      setAuthorName("");
      setCommentText("");
      setAvatarUrl("");
      
      // Notificar parent component
      onCommentAdded();
      onClose();

    } catch (error) {
      console.error('Erro ao salvar comentário:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setAuthorName("");
      setCommentText("");
      setAvatarUrl("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Comentário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto do Avatar */}
          <div>
            <Label htmlFor="avatar">Foto do Autor (Opcional)</Label>
            <div className="mt-2">
              {avatarUrl ? (
                <div className="relative inline-block">
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-gray-400" />
                  )}
                </label>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Recomendado: 150x150px, máx. 2MB
              </p>
            </div>
          </div>

          {/* Nome do Autor */}
          <div>
            <Label htmlFor="author-name">Nome do Autor*</Label>
            <Input
              id="author-name"
              placeholder="Ex: Maria Silva"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={100}
              required
              className="mt-1"
            />
          </div>

          {/* Comentário */}
          <div>
            <Label htmlFor="comment-text">Comentário*</Label>
            <Textarea
              id="comment-text"
              placeholder="Escreva um comentário positivo sobre o produto..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              maxLength={500}
              required
              className="mt-1 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {commentText.length}/500 caracteres
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={saving}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || uploading}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Adicionar Comentário"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
