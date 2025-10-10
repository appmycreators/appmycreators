import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BadgeCheck, MoreVertical, MoreHorizontal, ChevronUp, Instagram, ShoppingCart, Loader2 } from "lucide-react";
// Carousel será carregado dinamicamente dentro de GalleryCarousel para reduzir JS inicial
import { usePublicPageOptimized } from "@/hooks/usePublicPage";
import profileImage from "@/assets/avatar.png";
import { lazy, Suspense, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useState } from "react";
import ResponsiveImage from "@/components/ResponsiveImage";
import { FormResource } from "@/components/FormResource";

// Lazy load do Lottie apenas quando necessário
const Lottie = lazy(() => import("lottie-react"));

// Lazy load de animações Lottie individualmente (suporta nome interno ou URL absoluta)
const loadLottieAnimation = async (animationName: string) => {
  try {
    // URL externa (Supabase Storage ou CDN)
    if (/^https?:\/\//.test(animationName) || animationName.startsWith('/')) {
      const res = await fetch(animationName, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }

    // Asset local (src/assets/lotties)
    const module = await import(`@/assets/lotties/${animationName}.json`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load animation: ${animationName}`, error);
    return null;
  }
};

// Componente para renderizar Lottie com lazy loading
const LottieAnimation = ({ animationName }: { animationName: string }) => {
  const [animationData, setAnimationData] = useState(null);
  
  useEffect(() => {
    loadLottieAnimation(animationName).then(setAnimationData);
  }, [animationName]);
  
  if (!animationData) return null;
  
  return (
    <Suspense fallback={null}>
      <Lottie 
        animationData={animationData} 
        loop={true} 
        style={{ width: '100%', height: '100%' }}
      />
    </Suspense>
  );
};

// Lazy load de ícones sociais individualmente
const getSocialIcon = async (platform: string): Promise<string | null> => {
  try {
    const module = await import(`@/assets/icones-redes-sociais/${platform.toLowerCase()}.svg`);
    return module.default;
  } catch (error) {
    return null;
  }
};

// Componente para ícone social com lazy loading
const SocialIcon = ({ platform, url, bgColor, iconColor }: any) => {
  const [iconSrc, setIconSrc] = useState<string | null>(null);
  
  useEffect(() => {
    getSocialIcon(platform).then(setIconSrc);
  }, [platform]);
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110"
      style={{ backgroundColor: bgColor || '#e5e7eb' }}
    >
      {iconSrc ? (
        <img
          src={iconSrc}
          alt={platform}
          className="w-5 h-5"
          style={{
            filter: iconColor ? 'brightness(0) saturate(100%)' : undefined,
            opacity: iconColor ? 1 : undefined,
          }}
        />
      ) : (
        <Instagram className="w-5 h-5" style={{ color: iconColor || undefined }} />
      )}
    </a>
  );
};

// Normalização de URL do Spotify para embed (aceita URLs com locale como intl-pt)
const toSpotifyEmbedUrl = (input: string): string | null => {
  try {
    const u = new URL(input);
    if (!/^(www\.)?open\.spotify\.com$/i.test(u.hostname)) return null;
    let segments = u.pathname.split("/").filter(Boolean);
    // Remove prefixo opcional de locale: intl-pt, intl-en, etc.
    if (segments[0] && /^intl-[a-z]{2,}/i.test(segments[0])) {
      segments = segments.slice(1);
    }
    // Remove 'embed' caso venha na URL original
    if (segments[0] === "embed") {
      segments = segments.slice(1);
    }
    const allowed = new Set(["track", "album", "playlist", "artist", "episode", "show"]);
    const type = segments[0];
    if (!type || !allowed.has(type)) return null;
    let idRaw = segments[1] || "";
    idRaw = idRaw.split("?")[0].split(":")[0];
    const match = idRaw.match(/[A-Za-z0-9]{22}/);
    const id = match ? match[0] : "";
    if (!id) return null;
    return `https://open.spotify.com/embed/${type}/${id}`;
  } catch {
    return null;
  }
};

// Embed de mídia preguiçoso (YouTube/Spotify) para melhorar FCP
const LazyEmbed = ({ type, url, title }: { type: 'youtube' | 'spotify'; url: string; title?: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [shouldMount, setShouldMount] = useState(false);
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setShouldMount(true);
          io.disconnect();
        }
      });
    }, { threshold: 0.2 });
    io.observe(node);
  }, []);

  // YouTube thumbnail
  const videoId = type === 'youtube' ? url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?\s]+)/)?.[1] : null;
  const ytThumb = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;

  return (
    <div ref={ref} className="rounded-2xl overflow-hidden shadow-md border border-border/60 relative group">
      {!shouldMount && (
        <button
          type="button"
          onClick={() => setShouldMount(true)}
          className="relative w-full h-[180px] sm:h-[220px] bg-neutral-100 flex items-center justify-center"
          aria-label={`Carregar ${type}`}
        >
          {type === 'youtube' && ytThumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ytThumb} alt={title || 'YouTube'} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="text-sm text-muted-foreground">{type === 'spotify' ? 'Spotify' : 'YouTube'}</div>
          )}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-white/90 shadow-md">
            <div className="w-0 h-0 border-l-8 border-y-8 border-y-transparent border-l-black ml-1" />
          </div>
        </button>
      )}
      {shouldMount && (
        <div className="w-full">
          {type === 'youtube' && videoId ? (
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className="w-full"
            />
          ) : type === 'spotify' ? (
            (() => {
              const embed = toSpotifyEmbedUrl(url);
              return embed ? (
                <iframe
                  src={embed}
                  width="100%"
                  height="152"
                  frameBorder={0}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  title={title}
                  loading="lazy"
                  onLoad={() => setLoaded(true)}
                  className="w-full"
                />
              ) : (
                <div className="p-4 bg-neutral-100 text-center">
                  <p className="text-sm text-muted-foreground">Spotify</p>
                </div>
              );
            })()
          ) : (
            <div className="p-4 bg-neutral-100 text-center">
              <p className="text-sm text-muted-foreground">Conteúdo</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Carousel dinâmico para galerias (reduz bundle inicial da página pública)
const GalleryCarousel = ({
  gallery,
  settings,
  parseBRL,
  formatBRL,
  handleLinkClick,
}: any) => {
  const [mod, setMod] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    import("@/components/ui/carousel").then((m) => {
      if (mounted) setMod(m);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const CarouselComp = mod?.Carousel;
  const CarouselContentComp = mod?.CarouselContent;
  const CarouselItemComp = mod?.CarouselItem;

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
        {!CarouselComp ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        ) : (
          <CarouselComp className="w-full" opts={{ align: "start" }}>
            <CarouselContentComp>
              {gallery.items.map((p: any) => (
                <CarouselItemComp key={p.id} className="basis-[75%] sm:basis-[45%]">
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
                      {p.lottieAnimation && (
                        <div className="absolute top-2 right-2 z-10 w-12 h-12">
                          <LottieAnimation animationName={p.lottieAnimation} />
                        </div>
                      )}
                      <ResponsiveImage
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-40 object-cover"
                        widths={[320, 480, 640]}
                        sizes="(min-width: 640px) 302px, 75vw"
                        height={160}
                        loading="lazy"
                        decoding="async"
                      />
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
                </CarouselItemComp>
              ))}
            </CarouselContentComp>
          </CarouselComp>
        )}
      </div>
    </div>
  );
};

const PublicPageOptimized = () => {
  const { username } = useParams<{ username: string }>();
  const { resources, galleries, socials, socialsDisplayMode, settings, loading, error } = usePublicPageOptimized(username || '');
  
  // Função para evitar cache de avatar
  const getAvatarUrl = useCallback((avatarUrl: string | null) => {
    if (!avatarUrl) return profileImage;
    // Se a URL já tem timestamp, não adicionar outro
    if (avatarUrl.includes('avatar_') && avatarUrl.includes('?')) return avatarUrl;
    // Adicionar timestamp para evitar cache
    const separator = avatarUrl.includes('?') ? '&' : '?';
    return `${avatarUrl}${separator}t=${Date.now()}`;
  }, []);
  
  // Memoizar funções para evitar re-criações
  const handleLinkClick = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const parseBRL = useCallback((price: string | number | null) => {
    if (!price) return 0;
    if (typeof price === 'number') return price / 100;
    const numericValue = Number(price);
    if (!isNaN(numericValue)) return numericValue / 100;
    const n = Number(price.replace(/\./g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }, []);

  const formatBRL = useCallback((value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), []);

  // Debug: verificar se avatarBorderColor está chegando
  console.log('Settings avatarBorderColor:', settings.avatarBorderColor);

  const header = useMemo(() => (
    <>
      {settings.headerMediaUrl && (
        <div className="-mx-4 sm:-mx-6 -mt-4">
          <div className="relative rounded-3xl overflow-hidden w-full">
            {settings.headerMediaType === 'video' ? (
              <video
                src={settings.headerMediaUrl}
                className="w-full h-auto block"
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
              <ResponsiveImage
                src={settings.headerMediaUrl}
                alt="Header"
                className="w-full h-auto block"
                widths={[480, 720, 960, 1440]}
                sizes="(min-width: 640px) 672px, 100vw"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                style={{
                  maskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 15%, black 30%)',
                  WebkitMaskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 15%, black 30%)'
                }}
              />
            )}

            <div className="absolute left-0 right-0 bottom-6 z-10 flex flex-col items-center text-center px-4">
              <div 
                className="w-16 h-16 rounded-full overflow-hidden border-2 bg-white shadow-md"
                style={{ borderColor: settings.avatarBorderColor || '#ffffff' }}
              >
                <img 
                  src={getAvatarUrl(settings.avatarUrl)} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
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

              <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white z-10">
                <MoreVertical className="w-5 h-5" />
              </button>
          </div>
        </div>
      )}
      
      {!settings.headerMediaUrl && (
        <div className="flex flex-col items-center text-center space-y-3">
          <div 
            className="w-20 h-20 rounded-full overflow-hidden border-2 bg-white shadow-md"
            style={{ borderColor: settings.avatarBorderColor || '#ffffff' }}
          >
            <img
              src={getAvatarUrl(settings.avatarUrl)}
              alt="Profile"
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
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
    </>
  ), [settings, username]);

  // Loading state with skeletons for better FCP
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Header skeleton */}
          <div className="flex flex-col items-center text-center space-y-3">
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <div className="space-y-2 w-full max-w-xl px-8">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>

          {/* Resource button skeletons */}
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-full" />
            <Skeleton className="h-14 w-full rounded-full" />
            <Skeleton className="h-14 w-full rounded-full" />
            <Skeleton className="h-14 w-full rounded-full" />
          </div>

          {/* Social icons skeleton */}
          <div className="flex justify-center gap-3 py-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
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
        {header}
        
        {/* Recursos */}
        <div className="space-y-3">
          {resources.map((resource) => {
            // Galeria
            if (resource.type === 'gallery') {
              const gallery = galleries.find(g => g.id === resource.id);
              if (!gallery) return null;
              
              return (
                <GalleryCarousel
                  key={gallery.id}
                  gallery={gallery}
                  settings={settings}
                  parseBRL={parseBRL}
                  formatBRL={formatBRL}
                  handleLinkClick={handleLinkClick}
                />
              );
            }

            // Image Banner - exibir imagem completa
            if (resource.type === 'image_banner' && resource.image) {
              const imgContent = (
                <ResponsiveImage
                  src={resource.image}
                  alt={resource.title || ''}
                  className="w-full h-auto object-cover rounded-xl"
                  widths={[480, 672, 960, 1344]}
                  sizes="(min-width: 640px) 672px, 100vw"
                  loading="lazy"
                  decoding="async"
                />
              );

              return (
                <div key={resource.id} className="rounded-2xl overflow-hidden shadow-md">
                  {resource.url ? (
                    <a href={resource.url} target="_blank" rel="noreferrer noopener" className="block">
                      {imgContent}
                    </a>
                  ) : (
                    imgContent
                  )}
                  {resource.title && (
                    <div className="px-4 py-2 bg-white">
                      <p className="text-sm text-foreground">{resource.title}</p>
                    </div>
                  )}
                </div>
              );
            }

            // YouTube embed
            if (resource.type === 'youtube') {
              return (
                <div key={resource.id}>
                  <LazyEmbed type="youtube" url={resource.url} title={resource.title} />
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
              return (
                <div key={resource.id}>
                  <LazyEmbed type="spotify" url={resource.url} title={resource.title} />
                </div>
              );
            }

            // Form Resource
            if (resource.type === 'form' && resource.form_data) {
              return (
                <FormResource
                  key={resource.id}
                  formId={resource.form_data.id}
                  formData={resource.form_data}
                  title={resource.title}
                  cardBgColor={settings.cardBgColor || '#ffffff'}
                  cardTextColor={settings.cardTextColor || '#000000'}
                />
              );
            }

            // WhatsApp, Links normais e outros
            const bgColor = resource.bgColor || settings.cardBgColor || '#171717';
            const textColor = settings.cardTextColor || '#ffffff';
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
                    <ResponsiveImage
                      src={resource.image}
                      alt=""
                      className="w-full h-full object-cover"
                      widths={[32, 48, 64]}
                      sizes="32px"
                      height={32}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : resource.icon ? (
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      {resource.icon}
                    </div>
                  ) : (
                    <img
                      src={getAvatarUrl(settings.avatarUrl)}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
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
              {Object.entries(socials).map(([platform, url]) => (
                <SocialIcon 
                  key={platform}
                  platform={platform}
                  url={url}
                  bgColor={settings.socialIconBgColor}
                  iconColor={settings.socialIconColor}
                />
              ))}
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

export default PublicPageOptimized;