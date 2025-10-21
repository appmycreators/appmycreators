import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Loader2, MoreVertical, Heart, Send, MessageCircle, X } from "lucide-react";
import ResponsiveImage from "@/components/ResponsiveImage";
import { FormResource } from "@/components/FormResource";
import LottieAnimation from "./LottieAnimation";
import { useGalleryItemComments } from "@/hooks/useGalleryComments";
import { useToast } from "@/hooks/use-toast";

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
  
  // WhatsApp Block
  if (item.type === 'whatsapp') {
    const bgColor = item.bgColor || cardBgColor || '#25D366'; // Verde WhatsApp
    const textColor = cardTextColor || '#ffffff';
    
    return (
      <div
        className="group cursor-pointer rounded-full px-4 h-14 flex items-center gap-3 shadow-md hover:opacity-90 transition-all uppercase font-semibold tracking-wide"
        style={{ backgroundColor: bgColor, color: textColor }}
        onClick={() => onItemClick?.(item)}
      >
        {/* Imagem do WhatsApp */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
          {item.image ? (
            <ResponsiveImage
              src={item.image}
              alt=""
              className="w-full h-full object-cover"
              widths={[32, 48, 64]}
              sizes="32px"
              height={32}
            />
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
  
  // Spotify Block
  if (item.type === 'spotify' || (item.type === 'link' && item.url?.includes('open.spotify.com'))) {
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

  // YouTube Block
  if (item.type === 'youtube' || (item.type === 'link' && (item.url?.includes('youtube.com') || item.url?.includes('youtu.be')))) {
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

  // Twitch Block
  if (item.type === 'twitch' || (item.type === 'link' && (item.url?.includes('twitch.tv') || item.url?.includes('player.twitch.tv')))) {
    // Extrai o canal da URL
    let channel = "";
    try {
      const u = new URL(item.url);
      if (u.hostname === "player.twitch.tv") {
        channel = u.searchParams.get("channel") || "";
      } else if (u.hostname === "twitch.tv" || u.hostname === "www.twitch.tv") {
        const pathParts = u.pathname.split("/").filter(Boolean);
        channel = pathParts[0] || "";
      }
    } catch {
      // ignore
    }

    if (!channel) return null;

    // Constrói URL do embed com parent correto
    const embedUrl = `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(window.location.hostname)}`;

    return (
      <div className="w-full">
        <iframe
          src={embedUrl}
          width="100%"
          height="300"
          frameBorder="0"
          allowFullScreen
          scrolling="no"
          allow="autoplay; fullscreen"
          loading="lazy"
          className="rounded-xl"
        />
      </div>
    );
  }
  
  // Link Block
  if (item.type === 'link') {
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
        {item.title && item.visibleTitle !== false && (
          <div 
            className="px-4 py-2 text-center" 
            style={{ 
              backgroundColor: item.bgColor || '#ffffff',
              color: item.textColor || '#FFFFFF'
            }}
          >
            <p className="text-sm font-medium">
              {item.title}
            </p>
          </div>
        )}
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

    // Estado para controlar o modal de comentários
    const [showComments, setShowComments] = useState(false);
    const { toast } = useToast();

    // OTIMIZAÇÃO: Só buscar comentários se prova social estiver ativada
    const shouldFetchComments = item.enableSocialProof === true;
    
    // Hook para buscar comentários reais (apenas se necessário)
    const { data: commentsData } = useGalleryItemComments(
      shouldFetchComments ? (item.id || null) : null
    );

    // Determinar números de prova social
    const stats = React.useMemo(() => {
      // Se prova social não está ativa, não exibir
      if (!item.enableSocialProof) {
        return { likes: 0, shares: 0, comments: 0, enabled: false };
      }

      // Usar números customizados se fornecidos
      return {
        likes: item.customLikesCount || 0,
        shares: item.customSharesCount || 0,
        comments: commentsData?.total || 0,
        enabled: true
      };
    }, [item.enableSocialProof, item.customLikesCount, item.customSharesCount, commentsData?.total]);

    const comments = commentsData?.comments || [];

    // Função para compartilhar (Web Share API)
    const handleShare = async (e: React.MouseEvent) => {
      e.stopPropagation();
      
      const shareData = {
        title: item.name || 'Confira este produto!',
        text: item.description || 'Olha que interessante!',
        url: item.link || window.location.href,
      };

      try {
        // Verificar se Web Share API está disponível
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          
          // Opcional: incrementar contador de shares
          // Você pode adicionar uma chamada à API aqui se quiser rastrear
          
          toast({
            title: "Compartilhado!",
            description: "Obrigado por compartilhar!",
          });
        } else {
          // Fallback: copiar link
          await navigator.clipboard.writeText(item.link || window.location.href);
          toast({
            title: "Link copiado!",
            description: "Cole em qualquer lugar para compartilhar.",
          });
        }
      } catch (error) {
        // Usuário cancelou ou erro
        if ((error as Error).name !== 'AbortError') {
          console.error('Erro ao compartilhar:', error);
          // Fallback final: copiar link
          try {
            await navigator.clipboard.writeText(item.link || window.location.href);
            toast({
              title: "Link copiado!",
              description: "Cole em qualquer lugar para compartilhar.",
            });
          } catch {
            toast({
              title: "Erro ao compartilhar",
              description: "Não foi possível compartilhar.",
              variant: "destructive"
            });
          }
        }
      }
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
                '--neon-color': galleryHighlightBgColor || '#fbbf24',
              } as React.CSSProperties & { '--neon-color': string }}
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
            
            {/* Elementos de interação social - canto inferior direito */}
            {stats.enabled && (
              <div className="absolute bottom-2 right-2 flex flex-col gap-1 z-10">
                {/* Curtidas */}
                {stats.likes > 0 && (
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                    <Heart className="w-3 h-3 text-white fill-red-500 text-red-500" />
                    <span className="text-[10px] text-white font-medium">{stats.likes}</span>
                  </div>
                )}
                
                {/* Compartilhamentos */}
                {stats.shares > 0 && (
                  <div 
                    className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 cursor-pointer hover:bg-black/70 transition-colors active:scale-95"
                    onClick={handleShare}
                    title="Compartilhar"
                  >
                    <Send className="w-3 h-3 text-white" />
                    <span className="text-[10px] text-white font-medium">{stats.shares}</span>
                  </div>
                )}
                
                {/* Comentários */}
                {stats.comments > 0 && (
                  <div 
                    className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 cursor-pointer hover:bg-black/70 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowComments(true);
                    }}
                  >
                    <MessageCircle className="w-3 h-3 text-white" />
                    <span className="text-[10px] text-white font-medium">{stats.comments}</span>
                  </div>
                )}
              </div>
            )}
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

        {/* Modal de Comentários */}
        <Dialog open={showComments} onOpenChange={setShowComments}>
          <DialogContent className="max-w-lg max-h-[80vh] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Comentários ({stats.comments})
              </DialogTitle>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[60vh] p-6 space-y-4">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div key={comment.id || index} className="flex gap-3 pb-4 border-b last:border-b-0">
                    <img 
                      src={comment.author_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author_name)}&size=40`} 
                      alt={comment.author_name}
                      className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.author_name}</span>
                        <span className="text-xs text-muted-foreground">{comment.time_ago}</span>
                        {comment.is_highlighted && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                            ⭐ Destaque
                          </span>
                        )}
                      </div>
                      {comment.rating && (
                        <div className="flex gap-0.5 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < comment.rating! ? 'text-yellow-400 text-xs' : 'text-gray-300 text-xs'}>
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-foreground leading-relaxed">{comment.comment_text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhum comentário ainda.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  return null;
};

export default PublicContentBlock;
