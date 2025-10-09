import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BadgeCheck, MoreVertical, MoreHorizontal, ChevronUp, Instagram, ShoppingCart, Loader2 } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { usePublicPage } from "@/hooks/usePublicPage";
import profileImage from "@/assets/avatar.png";
import Lottie from "lottie-react";

// Carregar todas as animações Lottie dinamicamente
const lottieAnimations = import.meta.glob("@/assets/lotties/*.json", {
  eager: true,
  import: "default",
}) as Record<string, any>;

// Social icons map
const socialIconModules = import.meta.glob("@/assets/icones-redes-sociais/*.svg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const socialIconsMap: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const p in socialIconModules) {
    const name = p.split("/").pop()?.replace(".svg", "");
    if (name) m[name.toLowerCase()] = socialIconModules[p];
  }
  return m;
})();

const PublicPage = () => {
  const { username } = useParams<{ username: string }>();
  const { resources, galleries, socials, socialsDisplayMode, settings, loading, error } = usePublicPage(username || '');
  
  
  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  const parseBRL = (price: string | number | null) => {
    if (!price) return 0;
    
    // Se for número, assume que vem em centavos do banco e converte para reais
    if (typeof price === 'number') return price / 100;
    
    // Se for string numérica pura (ex: "2000"), converte e divide por 100
    const numericValue = Number(price);
    if (!isNaN(numericValue)) return numericValue / 100;
    
    // Se for string formatada (ex: "20,00"), faz o parse
    const n = Number(price.replace(/\./g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  const formatBRL = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <Loader2 className="w-10 h-10 text-black animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold text-foreground">{error}</p>
          <Button onClick={() => window.location.href = '/'}>Voltar para o início</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={settings.backgroundColor ? { backgroundColor: settings.backgroundColor } : undefined}
    >
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header com mídia de fundo + overlay de informações */}
        {settings.headerMediaUrl && (
          <div className="-mx-4 sm:-mx-6 -mt-4">
            <div
              className="relative rounded-3xl overflow-hidden h-72 sm:h-80"
              style={{ ["--page-background-color" as any]: "rgb(var(--background))" }}
            >
              {settings.headerMediaType === 'video' ? (
                <video
                  src={settings.headerMediaUrl}
                  className="w-full h-full object-cover"
                  style={{
                    maskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 15%, black 30%)',
                    WebkitMaskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 15%, black 30%)'
                  }}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={settings.headerMediaUrl}
                  alt="Header"
                  className="w-full h-full object-cover"
                  style={{
                    maskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 15%, black 30%)',
                    WebkitMaskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 15%, black 30%)'
                  }}
                />
              )}

              {/* Conteúdo sobre a mídia: avatar, nome e descrição */}
              <div className="absolute left-0 right-0 bottom-6 z-10 flex flex-col items-center text-center px-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white bg-white shadow-md">
                  <img src={settings.avatarUrl || profileImage} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <h1 
                    className="text-xl sm:text-2xl font-extrabold"
                    style={{ color: settings.headerNameColor || undefined }}
                  >
                    {settings.profileName || username}
                  </h1>
                  {settings.showBadge && <BadgeCheck className="w-5 h-5 text-sky-500" />}
                </div>
                <p 
                  className="mt-1 text-[13px] sm:text-sm whitespace-pre-line max-w-xl"
                  style={{ color: settings.headerBioColor || undefined }}
                >
                  {settings.bio || 'Criador de conteúdo'}
                </p>
              </div>

              {/* Botão menu */}
              <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white z-10">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        
        {/* Header simplificado sem mídia de fundo */}
        {!settings.headerMediaUrl && (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-white shadow-md">
              <img src={settings.avatarUrl || profileImage} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2">
              <h1 
                className="text-2xl font-extrabold"
                style={{ color: settings.headerNameColor || undefined }}
              >
                {settings.profileName || username}
              </h1>
              {settings.showBadge && <BadgeCheck className="w-5 h-5 text-sky-500" />}
            </div>
            <p 
              className="text-sm whitespace-pre-line max-w-xl"
              style={{ color: settings.headerBioColor || undefined }}
            >
              {settings.bio || ''}
            </p>
          </div>
        )}
        
        {/* Recursos (links, YouTube, Spotify, WhatsApp, banners, galerias) - ordenados por display_order */}
        <div className="space-y-3">
          {resources.map((resource) => {
            // Galeria - renderizar galeria completa
            if (resource.type === 'gallery') {
              const gallery = galleries.find(g => g.id === resource.id);
              if (!gallery) return null;
              
              return (
                <div key={gallery.id} className="pt-2">
                  <div className="flex items-center justify-between px-2">
                    <div 
                      className="text-sm font-semibold uppercase"
                      style={{ color: settings.galleryTitleColor || undefined }}
                    >
                      {gallery.title}
                    </div>
                    
                  </div>
              
                  <div className="relative mt-3">
                    <Carousel className="w-full" opts={{ align: "start" }}>
                      <CarouselContent>
                        {gallery.items.map((p, idx) => (
                          <CarouselItem key={p.id} className="basis-[75%] sm:basis-[45%]">
                            <Card 
                              className="overflow-hidden rounded-2xl"
                              style={{ backgroundColor: settings.galleryCardBgColor || undefined }}
                            >
                              <div className="relative">
                                {p.destaque && (
                                  <div 
                                    className="absolute top-2 left-2 z-20 text-[10px] font-extrabold px-2 py-1 rounded-full shadow neon-highlight-badge"
                                    style={{
                                      backgroundColor: settings.galleryHighlightBgColor || '#fbbf24',
                                      color: settings.galleryHighlightTextColor || '#000000',
                                      boxShadow: '0 0 12px rgba(59, 130, 246, 0.45)',
                                    }}
                                  >
                                    DESTAQUE
                                  </div>
                                )}
                                {p.lottieAnimation && (() => {
                                  const animationPath = `/src/assets/lotties/${p.lottieAnimation}.json`;
                                  const animationData = lottieAnimations[animationPath];
                                  
                                  return animationData ? (
                                    <div className="absolute top-2 right-2 z-10 w-12 h-12">
                                      <Lottie 
                                        animationData={animationData} 
                                        loop={true} 
                                        style={{ width: '100%', height: '100%' }}
                                      />
                                    </div>
                                  ) : null;
                                })()}
                                <img src={p.imageUrl} alt={p.name} className="w-full h-40 object-cover" />
                            
                              </div>
                              <div className="px-3 pt-2 pb-3">
                                <div 
                                  className="text-sm mb-1 truncate font-bold"
                                  style={{ color: settings.galleryProductNameColor || undefined }}
                                >
                                  {p.name}
                                </div>
                                {p.description && (
                                  <div 
                                    className="text-[10px] mb-2 line-clamp-2"
                                    style={{ color: settings.galleryProductDescriptionColor || undefined }}
                                  >
                                    {p.description}
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  {p.price && (
                                    <div 
                                      className="text-sm font-bold"
                                      style={{ color: settings.galleryPriceColor || undefined }}
                                    >
                                      {formatBRL(parseBRL(p.price))}
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2">
                                  <Button
                                    aria-label={p.buttonText || "Comprar"}
                                    onClick={() => handleLinkClick(p.link)}
                                    className="w-full rounded-full transition-all duration-300 shadow-md group relative overflow-hidden"
                                    style={{
                                      backgroundColor: settings.galleryButtonBgColor || '#059669',
                                      color: settings.galleryButtonTextColor || '#ffffff'
                                    }}
                                  >
                                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                    <span className="relative z-10 flex items-center justify-center gap-2 transition-all duration-300 group-hover:gap-3">
                                      
                                      <span>{p.buttonText || 'Comprar'}</span>
                                    </span>
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>
                </div>
              );
            }
            // Image Banner - exibir imagem completa
            if (resource.type === 'image_banner' && resource.image) {
              return (
                <div
                  key={resource.id}
                  onClick={() => resource.url && handleLinkClick(resource.url)}
                  className={`group rounded-2xl overflow-hidden shadow-md ${resource.url ? 'cursor-pointer' : ''}`}
                >
                  <img 
                    src={resource.image} 
                    alt={resource.title} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              );
            }

            // YouTube embed
            if (resource.type === 'youtube') {
              const videoId = resource.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?\s]+)/)?.[1];
              return (
                <div key={resource.id} className="rounded-2xl overflow-hidden shadow-md border border-border/60">
                  {videoId ? (
                    <iframe
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={resource.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full"
                    />
                  ) : (
                    <div className="p-4 bg-neutral-100 text-center">
                      <p className="text-sm text-muted-foreground">Vídeo do YouTube</p>
                    </div>
                  )}
                  {!resource.hideUrl && (
                    <div className="px-4 py-2 bg-white">
                      <p className="text-xs text-muted-foreground truncate">{resource.title}</p>
                    </div>
                  )}
                </div>
              );
            }

            // Spotify embed
            if (resource.type === 'spotify') {
              const spotifyId = resource.url.match(/(?:track|album|playlist|artist)\/([a-zA-Z0-9]+)/)?.[0];
              return (
                <div key={resource.id} className="rounded-2xl overflow-hidden shadow-md border border-border/60">
                  {spotifyId ? (
                    <iframe
                      src={`https://open.spotify.com/embed/${spotifyId}`}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="encrypted-media"
                      title={resource.title}
                      className="w-full"
                    />
                  ) : (
                    <div className="p-4 bg-neutral-100 text-center">
                      <p className="text-sm text-muted-foreground">Spotify</p>
                    </div>
                  )}
                </div>
              );
            }

            // WhatsApp, Links normais e outros
            const bgColor = resource.bgColor || settings.cardBgColor || '#171717';
            const textColor = settings.cardTextColor || '#ffffff';
            // Aceitar qualquer imagem (incluindo base64) para exibir como ícone circular
            const hasImage = resource.image;
            
            return (
              <div
                key={resource.id}
                onClick={() => handleLinkClick(resource.url)}
                className="group cursor-pointer rounded-full px-4 h-14 flex items-center gap-3 shadow-md hover:opacity-90 transition-all uppercase"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                {/* Imagem ou Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                  {hasImage ? (
                    <img src={resource.image} alt="" className="w-full h-full object-cover" />
                  ) : resource.icon ? (
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      {resource.icon}
                    </div>
                  ) : (
                    <img src={settings.avatarUrl || profileImage} alt="avatar" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 text-left font-semibold tracking-wide">
                  {resource.title}
                </div>
                <MoreVertical className="w-5 h-5 opacity-70 group-hover:opacity-100" />
              </div>
            );
          })}
        </div>
        
        {/* Social + CTA */}
        <div className="flex flex-col items-center gap-4 py-4">
          {Object.keys(socials).length > 0 && (
            <div className="flex gap-3">
              {Object.entries(socials).map(([platform, url]) => {
                const iconSrc = socialIconsMap[platform.toLowerCase()];
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110"
                    style={{
                      backgroundColor: settings.socialIconBgColor || '#e5e7eb',
                    }}
                  >
                    {iconSrc ? (
                      <img
                        src={iconSrc}
                        alt={platform}
                        className="w-5 h-5"
                        style={{
                          filter: settings.socialIconColor ? 'brightness(0) saturate(100%)' : undefined,
                          opacity: settings.socialIconColor ? 1 : undefined,
                        }}
                      />
                    ) : (
                      <Instagram 
                        className="w-5 h-5" 
                        style={{ color: settings.socialIconColor || undefined }}
                      />
                    )}
                  </a>
                );
              })}
            </div>
          )}
          <Button 
            variant="outline" 
            className="h-12 rounded-full px-6 bg-white"
            onClick={() => window.location.href = '/'}
          >
            Crie seu MyCreator Grátis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublicPage;