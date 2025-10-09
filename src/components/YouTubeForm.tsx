import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import youtubeIcon from "@/assets/youtube/youtube_form_icon.svg";

interface YouTubeFormProps {
  open: boolean;
  onClose: () => void;
  onAddLink: (link: { title: string; url: string; icon?: string; image?: string; hideUrl?: boolean }) => void;
  onUpdateLink: (id: string, link: { title: string; url: string; icon?: string; image?: string; hideUrl?: boolean }) => void;
  initialLink?: { id?: string; title: string; url: string; icon?: string; image?: string; hideUrl?: boolean };
}

const isYouTubeHost = (hostname: string) => /(^|\.)youtube\.com$/i.test(hostname) || /^(www\.)?youtu\.be$/i.test(hostname);

const isYouTubeUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    return isYouTubeHost(u.hostname);
  } catch {
    return false;
  }
};

const YouTubeForm = ({ open, onClose, onAddLink, onUpdateLink, initialLink }: YouTubeFormProps) => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setUrl(initialLink?.url || "");
    }
  }, [open, initialLink]);

  const isValid = isYouTubeUrl(url.trim());

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch {
      // ignore clipboard errors silently
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast({ title: "Link inválido", description: "O link deve ser do site youtube.com ou youtu.be", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      title: "YouTube",
      url: url.trim(),
      image: youtubeIcon,
      hideUrl: true,
    };

    if (initialLink?.id) {
      onUpdateLink(initialLink.id, payload);
      toast({ title: "YouTube atualizado!" });
    } else {
      onAddLink(payload);
      toast({ title: "YouTube adicionado!" });
    }

    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] p-0 overflow-hidden">
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <img src={youtubeIcon} alt="YouTube" className="w-8 h-8" />
              <DialogTitle className="text-2xl font-semibold text-foreground">YouTube</DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground">Adicione o link do seu vídeo no YouTube para mostrar o conteúdo na sua página.</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Link do YouTube*</label>
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
              {!isValid && url.trim() !== "" && (
                <p className="mt-2 text-sm text-red-500">O link deve ser do site youtube.com ou youtu.be</p>
              )}
            </div>

            <Button type="submit" disabled={!isValid || saving} className="w-full h-12 text-base bg-[#00c6a9] hover:bg-[#03816e]">
              Salvar
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeForm;
