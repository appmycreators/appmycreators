import { useMemo, useRef, useState, useEffect } from "react";
import { Plus, Link, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface LinkFormProps {
  open: boolean;
  onClose: () => void;
  onAddLink: (link: { title: string; url: string; icon?: string; image?: string; hideUrl?: boolean }) => void;
  initialLink?: { id?: string; title: string; url: string; icon?: string; image?: string; hideUrl?: boolean };
  onUpdateLink?: (id: string, link: { title: string; url: string; icon?: string; image?: string; hideUrl?: boolean }) => void;
}

const LinkForm = ({ open, onClose, onAddLink, initialLink, onUpdateLink }: LinkFormProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"icon" | "image">("icon");
  const [icon, setIcon] = useState("🔗");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Carrega todas as imagens da pasta src/assets/icones como URLs prontas para uso
  const galleryIcons = useMemo(() => {
    // Vite: importa todos os arquivos de imagem como caminho (url) resolvido
    const modules = import.meta.glob("../assets/icones/*.{png,jpg,jpeg,svg,webp}", {
      eager: true,
      import: "default",
    }) as Record<string, string>;
    return Object.values(modules);
  }, []);

  useEffect(() => {
    if (open && initialLink) {
      setTitle(initialLink.title || "");
      setUrl(initialLink.url || "");
      if (initialLink.image) {
        setMode("image");
        setImageUrl(initialLink.image);
      } else {
        setMode("icon");
        setIcon(initialLink.icon || "🔗");
      }
    }
    if (open && !initialLink) {
      // reset when opening for a new link
      setTitle("");
      setUrl("");
      setIcon("🔗");
      setImageUrl(undefined);
      setMode("icon");
    }
  }, [open, initialLink]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !url.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e a URL do link.",
        variant: "destructive",
      });
      return;
    }

    // aceitar URL sem https e normalizar
    let preparedUrl = url.trim();
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(preparedUrl)) {
      preparedUrl = `https://${preparedUrl}`;
    }

    const payload = {
      title: title.trim(),
      url: preparedUrl,
      // Se selecionou um ícone da galeria (imageUrl está definido no modo icon), salvar como image
      icon: mode === "icon" && !imageUrl ? icon : undefined,
      image: imageUrl || undefined,
      hideUrl: true,
    };

    if (initialLink?.id && onUpdateLink) {
      onUpdateLink(initialLink.id, payload);
    } else {
      onAddLink(payload);
    }

    // Reset form
    setTitle("");
    setUrl("");
    setIcon("🔗");
    setImageUrl(undefined);
    setMode("icon");
    onClose();

    toast({
      title: initialLink?.id ? "Link atualizado!" : "Link adicionado!",
      description: initialLink?.id ? "As alterações foram salvas." : "Seu link foi criado com sucesso.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-400 flex items-center justify-center">
              <Link className="w-4 h-4 text-white" />
            </div>
            {initialLink?.id ? "Editar link" : "Botão com link"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                Título do link
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Ex: Meu Instagram"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="url" className="text-sm font-medium text-foreground">
                URL do link
              </Label>
              <Input
                id="url"
                type="text"
                placeholder="https://instagram.com/seuusuario"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Ícone / Imagem */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Ícone</Label>
              <div className="flex gap-2">
                <Button type="button" variant={mode === "icon" ? "secondary" : "outline"} onClick={() => setMode("icon")}>Galeria de ícones</Button>
                <Button type="button" variant={mode === "image" ? "secondary" : "outline"} onClick={() => setMode("image")}>Selecionar imagem</Button>
              </div>

              {mode === "icon" ? (
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 mt-2">
                  {galleryIcons.length === 0 && (
                    <p className="col-span-full text-sm text-muted-foreground">Nenhum ícone encontrado em src/assets/icones</p>
                  )}
                  {galleryIcons.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => {
                        setImageUrl(src);
                        // Manter no modo icon, não mudar para image
                      }}
                      className={`h-12 w-12 rounded-md border flex items-center justify-center bg-white hover:bg-muted ${
                        imageUrl === src ? 'ring-2 ring-primary' : ''
                      }`}
                      aria-label="Selecionar ícone da galeria"
                    >
                      <img src={src} alt="Ícone" className="w-8 h-8 object-contain" />
                    </button>
                  ))}
                </div>
              ) : (
                <Card className="mt-2 p-3 flex items-center gap-3">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Pré-visualização" className="w-12 h-12 object-cover rounded-md" />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 flex items-center justify-end gap-2">
                    {imageUrl && (
                      <Button type="button" variant="secondary" onClick={() => setImageUrl(undefined)}>
                        Remover
                      </Button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setImageUrl(String(reader.result));
                        reader.readAsDataURL(file);
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Selecionar</Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-[#00c6a9] hover:bg-[#03816e]">
              <Plus className="w-4 h-4 mr-2" />
              {initialLink?.id ? "Salvar alterações" : "Adicionar Link"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-6 hover:bg-muted/50 hover:text-foreground"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LinkForm;