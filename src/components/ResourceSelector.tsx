import { useState } from "react";
import { Plus, ChevronRight, X, Youtube, MessageCircle, Grid3X3, Link, Users, Music, Bot, Hash, Instagram, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import youtubeFormIcon from "@/assets/youtube/youtube_form_icon.svg";
import imageSectionIcon from "@/assets/ui/image_section_icon.svg";

interface ResourceSelectorProps {
  onSelectResource: (resource: Resource) => void;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  image?: string;
  badge?: string;
}

const platformIcons = [
  { name: "YouTube", icon: Youtube, color: "bg-red-500" },
  { name: "Spotify", icon: Music, color: "bg-green-500" },
  { name: "WhatsApp", icon: MessageCircle, color: "bg-green-600" },
  { name: "Grid", icon: Grid3X3, color: "bg-yellow-500" },
  { name: "Link", icon: Link, color: "bg-purple-400" },
  { name: "Gallery", icon: Grid3X3, color: "bg-orange-500" },
  { name: "Social", icon: Users, color: "bg-yellow-600" },
  { name: "Assistant", icon: Bot, color: "bg-blue-400" },
];

const resources: Resource[] = [
  {
    id: "gallery",
    title: "Galeria de itens",
    description: "Destaque múltiplos itens ou produtos.",
    icon: Grid3X3,
    color: "bg-orange-500",
  },
  {
    id: "link-button", 
    title: "Botão com link",
    description: "Inclua seus links essenciais.",
    icon: Link,
    color: "bg-purple-400",
  },
  {
    id: "whatsapp-button",
    title: "Botão do Whatsapp",
    description: "Facilite contato direto e personalizado com você.",
    icon: MessageCircle,
    image: "/images/download.png",
    color: "bg-green-600",
  },
  {
    id: "social-networks",
    title: "Redes sociais",
    description: "Conecte suas redes sociais ao seu MyCreators.",
    icon: Instagram,
    color: "bg-orange-400",
  },
  {
    id: "spotify",
    title: "Spotify", 
    description: "Adicione músicas à sua página.",
    icon: Music,
    image: "/images/icones/spotify.svg",
    color: "bg-green-500",
  },
  {
    id: "youtube",
    title: "YouTube",
    description: "Adicione vídeos do YouTube à sua página.",
    icon: Youtube,
    image: youtubeFormIcon,
    color: "bg-red-500",
  },
  {
    id: "image-section",
    title: "Imagem ou Banner",
    description: "Adicione uma seção de imagem ou banner.",
    icon: Grid3X3,
    image: imageSectionIcon,
    color: "bg-blue-500",
  },
  {
    id: "form",
    title: "Formulário de Captura",
    description: "Capture leads com formulários personalizados.",
    icon: FileText,
    color: "bg-indigo-500",
  },
];

const ResourceSelector = ({ onSelectResource }: ResourceSelectorProps) => {
  const [open, setOpen] = useState(false);

  const handleResourceSelect = (resource: Resource) => {
    onSelectResource(resource);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="add" 
          className="w-full h-14 gap-2 text-base rounded-full"
        >
          <Plus className="w-5 h-5" />
          Adicionar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg max-h-[80vh] p-0 overflow-hidden">
        <div className="max-h-[80vh] overflow-y-auto p-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl font-semibold text-center">
            Adicionar no Creator
          </DialogTitle>
          
         
        </DialogHeader>

        <div className="space-y-4 mt-6">
        

          <div className="space-y-2">
            {resources.map((resource) => (
              <Card 
                key={resource.id}
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors border-0 shadow-sm"
                onClick={() => handleResourceSelect(resource)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${
                      resource.image
                        ? "overflow-hidden"
                        : `${resource.color} flex items-center justify-center`
                    }`}
                  >
                    {resource.image ? (
                      <img
                        src={resource.image}
                        alt={resource.title}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <resource.icon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{resource.title}</h4>
                      {resource.badge && (
                        <Badge variant="secondary" className="text-xs bg-primary text-primary-foreground">
                          {resource.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {resource.description}
                    </p>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceSelector;