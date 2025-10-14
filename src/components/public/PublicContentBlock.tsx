import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Loader2, MoreVertical } from "lucide-react";
import ResponsiveImage from "@/components/ResponsiveImage";
import { FormResource } from "@/components/FormResource";
import LottieAnimation from "./LottieAnimation";

/**
 * PublicContentBlock - Bloco de conteúdo na página pública
 * Responsabilidade única: Renderizar diferentes tipos de conteúdo público
 */

// Normalização de URL do Spotify para embed
const normalizeSpotifyUrl = (url: string): string => {
  if (!url.includes('open.spotify.com')) return url;
  return url.replace(/\/intl-\w+\//, '/').replace(/\?.*$/, '');
};

// Normalização de URL do YouTube para embed
const normalizeYouTubeUrl = (url: string): string => {
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : url;
};

interface PublicContentBlockProps {
  item: any;
  cardBgColor?: string;
  cardTextColor?: string;
  onItemClick?: (item: any) => void;
  // Configurações específicas de galeria
  galleryCardBgColor?: string;
  galleryProductNameColor?: string;
  galleryProductDescriptionColor?: string;
  galleryPriceColor?: string;
  galleryButtonBgColor?: string;
  galleryButtonTextColor?: string;
  galleryHighlightBgColor?: string;
  galleryHighlightTextColor?: string;
}

const PublicContentBlock = ({ 
  item, 
  cardBgColor, 
  cardTextColor, 
  onItemClick,
  galleryCardBgColor,
  galleryProductNameColor,
  galleryProductDescriptionColor,
  galleryPriceColor,
  galleryButtonBgColor,
  galleryButtonTextColor,
  galleryHighlightBgColor,
  galleryHighlightTextColor,
}: PublicContentBlockProps) => {
  
  // Link Block
  if (item.type === 'link') {
    const isSpotify = item.url?.includes('open.spotify.com');
    const isYouTube = item.url?.includes('youtube.com') || item.url?.includes('youtu.be');
    
    if (isSpotify) {
      return (
        <div className="w-full">
          <iframe
            src={`https://open.spotify.com/embed${new URL(normalizeSpotifyUrl(item.url)).pathname}`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
          />
        </div>
      );
    }
    
    if (isYouTube) {
      return (
        <div className="w-full aspect-video">
          <iframe
            src={normalizeYouTubeUrl(item.url)}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="rounded-xl"
          />
        </div>
      );
    }
    
    // Link padrão (incluindo WhatsApp e outros)
    const bgColor = item.bgColor || cardBgColor || '#171717';
    const textColor = cardTextColor || '#ffffff';
    const hasImage = item.image;
    
    return (
      <div
        className="group cursor-pointer rounded-full px-4 h-14 flex items-center gap-3 shadow-md hover:opacity-90 transition-all uppercase font-semibold tracking-wide"
        style={{ backgroundColor: bgColor, color: textColor }}
        onClick={() => onItemClick?.(item)}
      >
        {/* Imagem ou Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
          {hasImage ? (
            <ResponsiveImage
              src={item.image || ''}
              alt=""
              className="w-full h-full object-cover"
              widths={[32, 48, 64]}
              sizes="32px"
              height={32}
            />
          ) : item.icon ? (
            <div className="w-full h-full flex items-center justify-center text-lg">
              {item.icon}
            </div>
          ) : (
            <div className="w-full h-full bg-white/20 rounded-full" />
          )}
        </div>
        <div className="flex-1 text-left">
          {item.title}
        </div>
        <MoreVertical className="w-5 h-5 opacity-70 group-hover:opacity-100" />
      </div>
    );
  }
  
  // Image Banner Block
  if (item.type === 'image_banner') {
    const imageContent = (
      <ResponsiveImage
        src={item.image || item.imageUrl || ''}
        alt={item.title || ''}
        className="w-full h-auto object-cover rounded-xl"
        widths={[320, 480, 640, 768, 1024]}
        sizes="(min-width: 768px) 672px, 100vw"
      />
    );

    return (
      <div className="w-full rounded-xl overflow-hidden shadow-md">
        {item.url ? (
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block transition-all hover:scale-[1.02]"
          >
            {imageContent}
          </a>
        ) : (
          <div className="transition-all hover:scale-[1.02]">
            {imageContent}
          </div>
        )}
        {item.title && (
          <div className="px-4 py-2 bg-white">
            <p className="text-sm" style={{ color: cardTextColor || '#1f2937' }}>
              {item.title}
            </p>
          </div>
        )}
      </div>
    );
  }
  
  // Form Block
  if (item.type === 'form' && item.form_data) {
    return (
      <FormResource
        formId={item.form_data.id}
        formData={item.form_data}
        title={item.title}
        cardBgColor={cardBgColor}
        cardTextColor={cardTextColor}
        isPublic={true}
      />
    );
  }
  
  // Gallery Item
  if (item.type === 'gallery_item') {
    // Formatação de preço brasileiro
    const formatPrice = (price: string | number) => {
      if (!price) return '';
      const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.')) : price;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(numPrice / 100); // Assumindo que o preço vem em centavos
    };

    return (
      <div 
        className="overflow-hidden rounded-2xl shadow-sm"
        style={{ backgroundColor: galleryCardBgColor || '#ffffff' }}
      >
        <div className="relative">
          {(item.destaque || item.highlight) && (
            <div 
              className="absolute top-2 left-2 z-20 text-[10px] font-extrabold px-2 py-1 rounded-full shadow neon-highlight-badge"
              style={{
                backgroundColor: galleryHighlightBgColor || '#fbbf24',
                color: galleryHighlightTextColor || '#000000',
                boxShadow: '0 0 12px rgba(59, 130, 246, 0.45)',
              }}
            >
              DESTAQUE
            </div>
          )}
          {item.lottieAnimation && (
            <div className="absolute top-2 right-2 z-10 w-12 h-12">
              <LottieAnimation animationName={item.lottieAnimation} />
            </div>
          )}
          <div className="aspect-square relative">
            <ResponsiveImage
              src={item.imageUrl || item.image || ''}
              alt={item.name || ''}
              className="w-full h-full object-cover"
              widths={[320, 480, 640]}
              sizes="(min-width: 640px) 302px, 75vw"
            />
          </div>
        </div>
        <div className="px-3 pt-2 pb-3">
          <div 
            className="text-sm mb-1 truncate font-bold"
            style={{ color: galleryProductNameColor || '#1f2937' }}
          >
            {item.name}
          </div>
          {item.description && (
            <div 
              className="text-[11px] mb-2 line-clamp-2"
              style={{ color: galleryProductDescriptionColor || '#6b7280' }}
            >
              {item.description}
            </div>
          )}
          <div className="flex items-center justify-between">
            {item.price && (
              <div 
                className="text-sm font-bold"
                style={{ color: galleryPriceColor || '#059669' }}
              >
                {formatPrice(item.price)}
              </div>
            )}
          </div>
          {(item.link || item.buttonText) && (
            <div className="mt-2">
              <button
                aria-label={item.buttonText || "Comprar"}
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.link) {
                    window.open(item.link, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="w-full rounded-full transition-all duration-300 shadow-md group relative overflow-hidden py-2 px-3 text-xs font-medium"
                style={{
                  backgroundColor: galleryButtonBgColor || '#059669',
                  color: galleryButtonTextColor || '#ffffff'
                }}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative z-10 flex items-center justify-center gap-2 transition-all duration-300 group-hover:gap-3">
                  <span>{item.buttonText || 'Comprar'}</span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return null;
};

export default PublicContentBlock;
