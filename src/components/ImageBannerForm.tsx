import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import imageSectionIcon from "@/assets/ui/image_section_icon.svg";

interface ImageBannerFormProps {
  open: boolean;
  onClose: () => void;
  onAddImageBanner: (banner: { title: string; imageUrl: string; linkUrl?: string }) => void;
  onUpdateImageBanner: (id: string, banner: { title: string; imageUrl: string; linkUrl?: string }) => void;
  initialBanner?: { id?: string; title: string; imageUrl: string; linkUrl?: string };
}

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

const isHttpUrl = (value: string) => {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const ImageBannerForm = ({ open, onClose, onAddImageBanner, onUpdateImageBanner, initialBanner }: ImageBannerFormProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined);
  const [enableLink, setEnableLink] = useState(true);
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initialBanner?.title || "");
      setImageDataUrl(initialBanner?.imageUrl);
      setUrl(initialBanner?.linkUrl || "");
      setEnableLink(Boolean(initialBanner?.linkUrl));
    }
  }, [open, initialBanner]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch {
      // ignore
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/image\/(png|jpeg)/i.test(file.type)) {
      toast({ title: "Formato inválido", description: "Envie PNG ou JPG", variant: "destructive" });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({ title: "Arquivo muito grande", description: "Tamanho máximo: 20MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const canSave = Boolean(imageDataUrl) && (!enableLink || isHttpUrl(url.trim()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageDataUrl) return;
    if (enableLink && !isHttpUrl(url.trim())) {
      toast({ title: "Link inválido", description: "Informe uma URL válida (http/https)", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      title: title.trim() || "Imagem ou Banner",
      imageUrl: imageDataUrl,
      linkUrl: enableLink ? url.trim() : undefined,
    };

    if (initialBanner?.id) {
      onUpdateImageBanner(initialBanner.id, payload);
    } else {
      onAddImageBanner(payload);
    }

    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0 overflow-hidden">
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <img src={imageSectionIcon} alt="Imagem ou Banner" className="w-8 h-8" />
              <DialogTitle className="text-2xl font-semibold text-foreground">Imagem ou Banner</DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground">Adicione uma imagem ou transforme-a em um banner.</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Título */}
            <div>
              <Label className="mb-2 block">Título da imagem</Label>
              <Input
                type="text"
                placeholder="Adicionar Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            {/* Upload */}
            <div>
              <Label className="mb-2 block">Sua Imagem</Label>
              <Card className="p-3 flex items-center gap-3">
                {imageDataUrl ? (
                  <img src={imageDataUrl} alt="Pré-visualização" className="w-20 h-20 object-cover rounded-md" />
                ) : (
                  <div className="w-20 h-20 rounded-md bg-muted" />
                )}
                <div className="flex-1 flex items-center justify-end gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-xl">
                    Upload
                  </Button>
                </div>
              </Card>
              <p className="text-xs text-muted-foreground mt-1">JPG ou PNG (Tamanho máximo do arquivo: 20Mb)</p>
            </div>

            {/* Toggle Link */}
            <div className="flex items-center gap-2">
              <Switch checked={enableLink} onCheckedChange={(v) => setEnableLink(Boolean(v))} className="data-[state=checked]:bg-primary" />
              <span className="text-sm">Adicione um link para essa imagem</span>
            </div>

            {/* Link */}
            {enableLink && (
              <div>
                <Label className="mb-2 block">Banner link</Label>
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-12 rounded-xl pr-20"
                  />
                  <button type="button" onClick={handlePaste} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20">
                    Colar
                  </button>
                </div>
                {url.trim() !== "" && !isHttpUrl(url.trim()) && (
                  <p className="mt-2 text-sm text-red-500">Informe uma URL válida iniciando com http:// ou https://</p>
                )}
              </div>
            )}

            <Button type="submit" disabled={!canSave || saving} className="w-full h-12 text-base bg-[#00c6a9] hover:bg-[#03816e]">
              Salvar
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageBannerForm;
