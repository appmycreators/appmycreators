import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import imageSectionIcon from "@/assets/ui/image_section_icon.svg";

interface ImageBannerCardProps {
  title: string;
  image: string; // data URL (base64) or http(s) URL
  url?: string; // optional click-through link
  textColor?: string; // cor do texto (opcional)
  bgColor?: string; // cor de fundo (opcional)
  visibleTitle?: boolean; // mostrar/esconder título
  onEdit?: () => void;
  onDelete?: () => void;
}

const ImageBannerCard = ({ title, image, url, textColor, bgColor, visibleTitle = true, onEdit, onDelete }: ImageBannerCardProps) => {
  const imgEl = (
    <div className="relative w-full overflow-hidden rounded-xl">
      <img src={image} alt={title || "Imagem"} className="w-full h-auto object-cover" />
    </div>
  );

  return (
    <Card className="p-4 bg-white shadow-card border-0 rounded-3xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img src={imageSectionIcon} alt="Imagem ou Banner" className="w-5 h-5" />
          <span className="font-medium text-foreground">Imagem ou Banner</span>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      {title && visibleTitle && (
        <div 
          className="mb-2 px-3 py-2 rounded-lg text-sm text-center font-medium" 
          style={{ 
            color: textColor || '#FFFFFF',
            backgroundColor: bgColor || 'transparent'
          }}
        >
          {title}
        </div>
      )}

      {url ? (
        <a href={url} target="_blank" rel="noreferrer noopener">
          {imgEl}
        </a>
      ) : (
        imgEl
      )}
    </Card>
  );
};

export default ImageBannerCard;
