import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface SocialNetworksFormProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Record<string, string>;
  initialDisplayMode?: "bottom" | "top";
  onSave: (data: { socials: Record<string, string>; displayMode: "bottom" | "top" }) => void;
  onDelete?: () => void;
}

// Build icon map from files in assets/icones-redes-sociais
const socialIconModules = import.meta.glob("@/assets/icones-redes-sociais/*.svg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const ORDER = [
  "instagram",
  "facebook",
  "twitter",
  "tiktok",
  "youtube",
  "spotify",
  "threads",
  "telegram",
  "email",
];

const LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter",
  tiktok: "TikTok",
  youtube: "YouTube",
  spotify: "Spotify",
  threads: "Threads",
  telegram: "Telegram",
  email: "Email",
};

const buildIconMap = (): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const path in socialIconModules) {
    const name = path.split("/").pop()?.replace(".svg", "");
    if (name) map[name.toLowerCase()] = socialIconModules[path];
  }
  return map;
};

const SocialNetworksForm = ({ open, onClose, initialValues, initialDisplayMode = "bottom", onSave, onDelete }: SocialNetworksFormProps) => {
  const icons = useMemo(buildIconMap, []);
  const platforms = useMemo(() => ORDER.filter((p) => icons[p]), [icons]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [displayMode, setDisplayMode] = useState<"bottom" | "top">(initialDisplayMode);

  useEffect(() => {
    if (open) {
      setValues(initialValues || {});
      setDisplayMode(initialDisplayMode);
    }
  }, [open, initialValues, initialDisplayMode]);

  const handleSave = () => {
    const cleaned: Record<string, string> = {};
    for (const key of Object.keys(values)) {
      const v = values[key]?.trim();
      if (v) cleaned[key] = v;
    }
    onSave({ socials: cleaned, displayMode });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir todas as redes sociais?')) {
      onDelete?.();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[80vh] p-0 overflow-hidden">
        <div className="max-h-[80vh] overflow-y-auto p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold">Suas redes sociais</DialogTitle>
          
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <Label className="text-sm text-muted-foreground">Conecte as suas Redes Sociais</Label>
          {platforms.map((id) => (
            <div key={id} className="flex items-center gap-3 rounded-xl border px-4 h-12">
              <img src={icons[id]} alt={LABELS[id] || id} className="w-5 h-5" />
              <Input
                placeholder={LABELS[id] || id}
                value={values[id] || ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [id]: e.target.value }))}
                className="flex-1 border-0 focus-visible:ring-0 shadow-none"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1 bg-[#00c6a9] hover:bg-[#03816e]">Salvar</Button>
          <Button variant="outline" onClick={onClose} className="px-6 hover:bg-muted/50 hover:text-foreground">Cancelar</Button>
          {onDelete && Object.keys(initialValues || {}).length > 0 && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Excluir todas as redes sociais"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialNetworksForm;
