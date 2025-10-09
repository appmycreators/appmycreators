import { useState } from "react";
import { Plus, Link, Type, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AddLinkFormProps {
  onAddLink: (link: { title: string; url: string; icon?: string }) => void;
}

const AddLinkForm = ({ onAddLink }: AddLinkFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("🔗");
  const { toast } = useToast();

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

    onAddLink({
      title: title.trim(),
      url: url.trim(),
      icon,
    });

    // Reset form
    setTitle("");
    setUrl("");
    setIcon("🔗");
    setIsOpen(false);

    toast({
      title: "Link adicionado!",
      description: "Seu link foi criado com sucesso.",
    });
  };

  if (!isOpen) {
    return (
      <Button 
        variant="add" 
        onClick={() => setIsOpen(true)}
        className="w-full h-14 gap-2 text-base"
      >
        <Plus className="w-5 h-5" />
        Adicionar +
      </Button>
    );
  }

  return (
    <Card className="p-6 bg-white shadow-card border-0">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Adicionar novo link</h3>
          <Button 
            type="button"
            variant="ghost" 
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
        </div>

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
              type="url"
              placeholder="https://instagram.com/seuusuario"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="icon" className="text-sm font-medium text-foreground">
              Ícone (emoji)
            </Label>
            <Input
              id="icon"
              type="text"
              placeholder="🔗"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="mt-1"
              maxLength={2}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Link
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="px-6"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AddLinkForm;