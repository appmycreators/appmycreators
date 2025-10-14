import GalleryBlock from "../blocks/GalleryBlock";
import LinkBlock from "../blocks/LinkBlock";
import ImageBannerBlock from "../blocks/ImageBannerBlock";
import FormBlock from "../blocks/FormBlock";
import { BlockOrder } from "@/hooks/content/useDragAndDrop";

/**
 * ContentBlock - Componente coordenador para diferentes tipos de blocos
 * Responsabilidade única: Determinar qual tipo de bloco renderizar
 */

interface ContentBlockProps {
  block: BlockOrder;
  galleryHighlightBgColor?: string;
  galleryHighlightTextColor?: string;
  cardBgColor?: string;
  cardTextColor?: string;
  onOpenGalleryItemForm: (galleryId: string, item?: any) => void;
  onRenameGallery: (galleryId: string) => void;
  onEditLink: (link: any) => void;
  onDeleteLink: (linkId: string) => void;
  onEditBanner: (banner: any) => void;
  onDeleteBanner: (bannerId: string) => void;
  onEditForm: (formResource: any) => void;
  onDeleteForm: (formId: string) => void;
}

const ContentBlock = ({
  block,
  galleryHighlightBgColor,
  galleryHighlightTextColor,
  cardBgColor,
  cardTextColor,
  onOpenGalleryItemForm,
  onRenameGallery,
  onEditLink,
  onDeleteLink,
  onEditBanner,
  onDeleteBanner,
  onEditForm,
  onDeleteForm,
}: ContentBlockProps) => {
  
  switch (block.type) {
    case "gallery":
      return (
        <GalleryBlock
          galleryId={block.id}
          highlightBgColor={galleryHighlightBgColor}
          highlightTextColor={galleryHighlightTextColor}
          onOpenGalleryItemForm={onOpenGalleryItemForm}
          onRenameGallery={onRenameGallery}
        />
      );
      
    case "link":
      return (
        <LinkBlock
          linkId={block.id}
          onEditLink={onEditLink}
          onDeleteLink={onDeleteLink}
        />
      );
      
    case "image_banner":
      return (
        <ImageBannerBlock
          bannerId={block.id}
          onEditBanner={onEditBanner}
          onDeleteBanner={onDeleteBanner}
        />
      );
      
    case "form":
      return (
        <FormBlock
          formId={block.id}
          cardBgColor={cardBgColor}
          cardTextColor={cardTextColor}
          onEditForm={onEditForm}
          onDeleteForm={onDeleteForm}
        />
      );
      
    default:
      return null;
  }
};

export default ContentBlock;
