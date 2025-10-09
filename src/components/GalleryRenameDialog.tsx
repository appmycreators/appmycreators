import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface GalleryRenameDialogProps {
  open: boolean;
  initialTitle: string;
  onClose: () => void;
  onSave: (newTitle: string) => void;
  onDelete?: () => void;
}

const GalleryRenameDialog = ({ open, initialTitle, onClose, onSave, onDelete }: GalleryRenameDialogProps) => {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onSave(t);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar Galeria</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gallery-title">Nome da galeria</Label>
            <Input
              id="gallery-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Galeria de Produtos"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-[#00c6a9] hover:bg-[#03816e]">Salvar</Button>
            <Button type="button" variant="outline" onClick={onClose} className="px-6 hover:bg-muted/50 hover:text-foreground">Cancelar</Button>
          </div>

          {onDelete && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onDelete?.();
                onClose();
              }}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir galeria
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryRenameDialog;
