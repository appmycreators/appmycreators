import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UsernameService } from "@/services/supabaseService";
import { TemplateService } from "@/services/templateService";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UseTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (pageId: string) => void;
  templateId: string;
  templateName: string;
}

const UseTemplateModal = ({ 
  open, 
  onClose, 
  onSuccess, 
  templateId, 
  templateName 
}: UseTemplateModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pageTitle, setPageTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugMessage, setSlugMessage] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setPageTitle("");
      setSlug("");
      setSlugAvailable(null);
      setSlugMessage("");
    } else {
      // Sugerir título baseado no template
      setPageTitle(`Minha página - ${templateName}`);
    }
  }, [open, templateName]);

  // Debounce para verificação de slug
  useEffect(() => {
    if (slug.length < 3) {
      setSlugAvailable(null);
      setSlugMessage("");
      return;
    }

    // Validar formato localmente primeiro
    const formatValidation = UsernameService.validateFormat(slug);
    if (!formatValidation.valid) {
      setSlugAvailable(false);
      setSlugMessage(formatValidation.message || "");
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      const result = await UsernameService.checkAvailability(slug);
      setSlugAvailable(result.available);
      setSlugMessage(result.message);
      setCheckingSlug(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para usar um template",
        variant: "destructive",
      });
      return;
    }

    // Validações
    if (!pageTitle.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um título para a página",
        variant: "destructive",
      });
      return;
    }

    if (slug.length < 3) {
      toast({
        title: "Erro",
        description: "O slug deve ter pelo menos 3 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (!slugAvailable) {
      toast({
        title: "Slug indisponível",
        description: slugMessage || "Este slug já está em uso",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Criar página a partir do template
      const { data: newPageId, error } = await TemplateService.createPageFromTemplate(
        templateId,
        {
          page_title: pageTitle.trim(),
          page_slug: slug.toLowerCase(),
        }
      );

      if (error) {
        throw error;
      }

      if (!newPageId) {
        throw new Error("Falha ao criar página do template");
      }

      // Criar entrada na tabela usernames
      const { error: usernameError } = await supabase
        .from('usernames')
        .insert({
          user_id: user.id,
          username: slug.toLowerCase(),
          page_id: newPageId,
        });

      if (usernameError) {
        console.error("Erro ao criar username:", usernameError);
        toast({
          title: "Atenção",
          description: "Página criada, mas pode não estar acessível publicamente. Contate o suporte.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Página criada com sucesso! 🎉",
          description: `Sua página "${pageTitle}" foi criada a partir do template "${templateName}".`,
        });
      }

      onSuccess(newPageId);
      onClose();
    } catch (error: any) {
      console.error("Error creating page from template:", error);
      toast({
        title: "Erro ao criar página",
        description: error.message || "Não foi possível criar a página. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Usar Template
          </DialogTitle>
          <DialogDescription>
            Configure sua página baseada no template <strong>"{templateName}"</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Título da Página */}
          <div className="space-y-2">
            <Label htmlFor="pageTitle">Título da Página</Label>
            <Input
              id="pageTitle"
              placeholder="Ex: Meus Links"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Este será o nome exibido no topo da sua página
            </p>
          </div>

          {/* Slug/Username */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL da Página (Slug)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                mycreators.me/
              </div>
              <Input
                id="slug"
                placeholder="meu-link"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                className="pl-[140px]"
                disabled={loading}
              />
              {checkingSlug && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!checkingSlug && slug.length >= 3 && slugAvailable !== null && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  {slugAvailable ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                </div>
              )}
            </div>
            {slug.length >= 3 && slugMessage && (
              <div className={`flex items-center gap-1 text-xs ${slugAvailable ? "text-green-600" : "text-red-600"}`}>
                <AlertCircle className="w-3 h-3" />
                <span>{slugMessage}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Apenas letras, números e hífens. Mínimo 3 caracteres.
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !pageTitle.trim() || !slugAvailable}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando página...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Criar Página
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UseTemplateModal;
