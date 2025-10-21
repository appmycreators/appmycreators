import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import twitchIcon from "@/assets/icones/twitch.svg";

interface TwitchFormProps {
  open: boolean;
  onClose: () => void;
  onAddLink: (link: { title: string; url: string; icon?: string; image?: string; hideUrl?: boolean }) => void;
  onUpdateLink: (id: string, link: { title: string; url: string; icon?: string; image?: string; hideUrl?: boolean }) => void;
  initialLink?: { id?: string; title: string; url: string; icon?: string; image?: string; hideUrl?: boolean };
}

// Valida se é uma URL do Twitch válida
const isTwitchUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    return u.hostname === "player.twitch.tv" || u.hostname === "www.twitch.tv" || u.hostname === "twitch.tv";
  } catch {
    return false;
  }
};

// Extrai o nome do canal da URL do Twitch
const extractChannelFromUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    
    // Se for URL do player: https://player.twitch.tv/?channel=CANAL&parent=...
    if (u.hostname === "player.twitch.tv") {
      return u.searchParams.get("channel");
    }
    
    // Se for URL normal: https://twitch.tv/CANAL ou https://www.twitch.tv/CANAL
    if (u.hostname === "twitch.tv" || u.hostname === "www.twitch.tv") {
      const pathParts = u.pathname.split("/").filter(Boolean);
      return pathParts[0] || null;
    }
    
    return null;
  } catch {
    return null;
  }
};

const TwitchForm = ({ open, onClose, onAddLink, onUpdateLink, initialLink }: TwitchFormProps) => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setUrl(initialLink?.url || "");
    }
  }, [open, initialLink]);

  const isValid = isTwitchUrl(url.trim()) && extractChannelFromUrl(url.trim()) !== null;

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
      toast({ 
        title: "Link inválido", 
        description: "O link deve ser do Twitch (twitch.tv ou player.twitch.tv)", 
        variant: "destructive" 
      });
      return;
    }
    setSaving(true);

    const payload = {
      title: "Twitch",
      url: url.trim(),
      image: twitchIcon,
      hideUrl: true,
    };

    if (initialLink?.id) {
      onUpdateLink(initialLink.id, payload);
      toast({ title: "Twitch atualizado!" });
    } else {
      onAddLink(payload);
      toast({ title: "Twitch adicionado!" });
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
              <img src={twitchIcon} alt="Twitch" className="w-8 h-8" />
              <DialogTitle className="text-2xl font-semibold text-foreground">Twitch</DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Adicione sua live da Twitch para transmitir ao vivo na sua página.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Link da Twitch*</label>
              <div className="relative">
                <Input
                  type="url"
                  placeholder="https://twitch.tv/seu_canal ou https://player.twitch.tv/?channel=seu_canal&parent=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-12 rounded-xl pr-20"
                />
                <button 
                  type="button" 
                  onClick={handlePaste} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20"
                >
                  Colar
                </button>
              </div>
              {!isValid && url.trim() !== "" && (
                <p className="mt-2 text-sm text-red-500">
                  O link deve ser do Twitch (twitch.tv ou player.twitch.tv)
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Cole o link do seu canal ou o código embed do player da Twitch
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={!isValid || saving} 
              className="w-full h-12 text-base bg-[#00c6a9] hover:bg-[#03816e]"
            >
              Salvar
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TwitchForm;
