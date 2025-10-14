import ProfileSection from "../ProfileSection";
import { useGallerySync } from "@/hooks/useGallerySync";

/**
 * GalleryBlock - Componente específico para renderizar galerias
 * Responsabilidade única: Renderizar e gerenciar uma galeria específica
 */

interface GalleryBlockProps {
  galleryId: string;
  highlightBgColor?: string;
  highlightTextColor?: string;
  onOpenGalleryItemForm: (galleryId: string, item?: any) => void;
  onRenameGallery: (galleryId: string) => void;
}

const GalleryBlock = ({ 
  galleryId, 
  highlightBgColor, 
  highlightTextColor, 
  onOpenGalleryItemForm, 
  onRenameGallery 
}: GalleryBlockProps) => {
  const { galleries, toggleCollapse } = useGallerySync();
  
  const gallery = galleries.find((g) => g.id === galleryId);
  
  if (!gallery) return null;

  return (
    <ProfileSection
      title={gallery.title}
      items={gallery.items}
      collapsed={!!gallery.collapsed}
      onToggleCollapse={() => toggleCollapse(gallery.id)}
      highlightBgColor={highlightBgColor}
      highlightTextColor={highlightTextColor}
      onAdd={() => onOpenGalleryItemForm(gallery.id)}
      onEdit={(item) => onOpenGalleryItemForm(gallery.id, item)}
      onRename={() => onRenameGallery(gallery.id)}
    />
  );
};

export default GalleryBlock;
