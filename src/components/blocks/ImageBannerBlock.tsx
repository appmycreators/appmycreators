import { useImageBannerSync } from "@/hooks/useImageBannerSync";
import ImageBannerCard from "../ImageBannerCard";

/**
 * ImageBannerBlock - Componente específico para renderizar banners de imagem
 * Responsabilidade única: Renderizar e gerenciar um banner específico
 */

interface ImageBannerBlockProps {
  bannerId: string;
  onEditBanner: (banner: any) => void;
  onDeleteBanner: (bannerId: string) => void;
}

const ImageBannerBlock = ({ bannerId, onEditBanner, onDeleteBanner }: ImageBannerBlockProps) => {
  const { imageBanners } = useImageBannerSync();
  
  const banner = imageBanners.find((b) => b.id === bannerId);
  
  if (!banner) return null;

  return (
    <ImageBannerCard
      title={banner.title}
      image={banner.imageUrl}
      url={banner.linkUrl}
      textColor={banner.textColor}
      bgColor={banner.bgColor}
      visibleTitle={banner.visibleTitle}
      onEdit={() => onEditBanner(banner)}
      onDelete={() => onDeleteBanner(banner.id)}
    />
  );
};

export default ImageBannerBlock;
