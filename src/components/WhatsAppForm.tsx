import { useEffect, useState } from "react";
import whatsIcon from "@/assets/icones/whatsapp.svg";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppFormProps {
  open: boolean;
  onClose: () => void;
  onAddLink: (link: { title: string; url: string; icon?: string; image?: string; bgColor?: string }) => void;
  initialLink?: { id?: string; title: string; url: string; icon?: string; image?: string; bgColor?: string };
  onUpdateLink?: (id: string, link: { title: string; url: string; icon?: string; image?: string; bgColor?: string }) => void;
  onSaveFloatingButton?: (config: { enabled: boolean; phone: string; message: string }) => void;
  floatingButtonConfig?: { enabled: boolean; phone: string; message: string };
  onToggleVisibility?: (resourceId: string, isVisible: boolean) => void;
}

const WhatsAppForm = ({ open, onClose, onAddLink, initialLink, onUpdateLink, onSaveFloatingButton, floatingButtonConfig, onToggleVisibility }: WhatsAppFormProps) => {
  const { toast } = useToast();
  const [countryCode, setCountryCode] = useState("+55");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("Fale comigo");
  const [message, setMessage] = useState("");
  const [enableFloating, setEnableFloating] = useState(false);

  useEffect(() => {
    if (open && initialLink) {
      // Prefill from initialLink
      setTitle(initialLink.title || "Fale comigo");
      const url = initialLink.url || "";
      
      // Carregar estado do botão flutuante
      setEnableFloating(floatingButtonConfig?.enabled || false);
      
      try {
        const u = new URL(url);
        if (u.hostname.includes("wa.me")) {
          const digits = (u.pathname.replace("/", "").match(/\d+/g)?.join("") || "");
          const text = u.searchParams.get("text") || "";
          setMessage(text);
          // Try to detect known country codes
          if (digits.startsWith("55")) {
            setCountryCode("+55");
            setPhone(digits.slice(2));
          } else if (digits.startsWith("1")) {
            setCountryCode("+1");
            setPhone(digits.slice(1));
          } else if (digits.startsWith("351")) {
            setCountryCode("+351");
            setPhone(digits.slice(3));
          } else if (digits.startsWith("34")) {
            setCountryCode("+34");
            setPhone(digits.slice(2));
          } else if (digits) {
            // Fallback: keep entire number in phone
            setCountryCode("+55");
            setPhone(digits);
          }
        }
      } catch {}
    }
    if (open && !initialLink) {
      // reset when opening for a new link
      setCountryCode("+55");
      setPhone("");
      setTitle("Fale comigo");
      setMessage("");
      setEnableFloating(false); // Sempre false para novo botão
    }
  }, [open, initialLink, floatingButtonConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const digits = phone.replace(/\D/g, "");
    const cc = countryCode.replace(/\D/g, "");

    if (!digits) {
      toast({
        title: "Telefone obrigatório",
        description: "Por favor, informe seu número de WhatsApp.",
        variant: "destructive",
      });
      return;
    }

    const number = `${cc}${digits}`;
    let url = `https://wa.me/${number}`;
    if (message.trim()) {
      url += `?text=${encodeURIComponent(message.trim())}`;
    }

    const payload = {
      title: title.trim() || "Fale comigo",
      url,
      image: whatsIcon,
    };

    if (initialLink?.id && onUpdateLink) {
      onUpdateLink(initialLink.id, payload);
    } else {
      onAddLink(payload);
    }

    toast({ title: initialLink?.id ? "Botão do WhatsApp atualizado!" : "Botão do WhatsApp adicionado!" });

    // Salvar configuração do botão flutuante
    if (onSaveFloatingButton) {
      const floatingConfig = {
        enabled: enableFloating,
        phone: enableFloating ? number : "",
        message: enableFloating ? message.trim() : "",
      };
      onSaveFloatingButton(floatingConfig);
    }

    // Esconder/mostrar resource do WhatsApp quando o botão flutuante for ativado/desativado
    if (initialLink?.id && onToggleVisibility) {
      onToggleVisibility(initialLink.id, !enableFloating);
    }

    // Reset
    setPhone("");
    setMessage("");
    setCountryCode("+55");
    setTitle("Fale comigo");
    setEnableFloating(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img src={whatsIcon} alt="WhatsApp" className="w-8 h-8" />
            Whatsapp
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Facilite contato direto e personalizado com você.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Seu Telefone</Label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Código" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+55">🇧🇷 +55</SelectItem>
                  <SelectItem value="+1">🇺🇸 +1</SelectItem>
                  <SelectItem value="+351">🇵🇹 +351</SelectItem>
                  <SelectItem value="+34">🇪🇸 +34</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="tel"
                inputMode="tel"
                placeholder="Inserir seu WhatsApp"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">
              Título do Botão
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-foreground">
              Mensagem
            </Label>
            <Textarea
              id="message"
              placeholder="Adicionar texto predefinido"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          {/* Switch para Botão Flutuante */}
          <div className="pt-4 pb-2 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-foreground">
                  Botão Flutuante
                </Label>
                <p className="text-xs text-muted-foreground">
                  Exibir botão do WhatsApp flutuando na página pública
                </p>
              </div>
              <Switch
                checked={enableFloating}
                onCheckedChange={setEnableFloating}
              />
            </div>
            
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 bg-[#00c6a9] hover:bg-[#03816e]">
              {initialLink?.id ? "Salvar alterações" : "Adicionar Botão"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="px-6 hover:bg-muted/50 hover:text-foreground">Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppForm;
