import { useParams } from "react-router-dom";
import { usePublicPageOptimized } from "@/hooks/usePublicPage";
import { Skeleton } from "@/components/ui/skeleton";
import PublicHeader from "./public/PublicHeader";
import PublicSocialSection from "./public/PublicSocialSection";
import PublicContentList from "./public/PublicContentList";
import FontProvider from "./FontProvider";
import { Button } from "@/components/ui/button";
import FloatingWhatsAppButton from "./FloatingWhatsAppButton";


/**
 * PublicPage - Página pública do usuário
 * Responsabilidade única: Orquestrar componentes da página pública
 */

const PublicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { page, resources, galleries, socials, socialsDisplayMode, settings, loading, error } = usePublicPageOptimized(slug || '');
  
  const handleLinkClick = (url: string) => {
    if (!url) return;
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
  };
  
  const handleItemClick = (item: any) => {
    if (item.url || item.linkUrl) {
      handleLinkClick(item.url || item.linkUrl);
    } else if (item.link) {
      handleLinkClick(item.link);
    }
  };
  
  // Error state - apenas para erro, não para loading
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">😕</div>
          <h1 className="text-2xl font-bold text-gray-800">Página não encontrada</h1>
          <p className="text-gray-600">A página @{slug} não foi encontrada.</p>
        </div>
      </div>
    );
  }
  const backgroundStyle = settings.backgroundColor 
    ? { backgroundColor: settings.backgroundColor }
    : { background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' };
  
  // Processar conteúdo - incluindo galerias com items
  const processedContent = resources
    ?.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    .map((resource: any) => {
      // Se for galeria, incluir os items da galeria
      if (resource.type === 'gallery') {
        const gallery = galleries?.find(g => g.id === resource.id);
        return {
          ...resource,
          items: gallery?.items || [],
          title: gallery?.title || resource.title
        };
      }
      
      return {
        ...resource,
        type: resource.type || 'link'
      };
    }) || [];
  
  return (
    <FontProvider fontFamily={settings.fontFamily}>
      <div 
        className="min-h-screen"
        style={backgroundStyle}
      >
        {/* Background Animation */}
        {!loading && settings.backgroundAnimation && (
          <div className="fixed inset-0 -z-10 opacity-10">
            <div style={{ width: '100%', height: '100%' }} />
          </div>
        )}
        
        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Header - Progressive Loading */}
          {loading ? (
            <div className="text-center space-y-4">
              <Skeleton className="w-24 h-24 rounded-full mx-auto" />
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          ) : page ? (
            <PublicHeader
              profileImageUrl={settings.avatarUrl || page.profile_image}
              name={settings.profileName || page.name}
              bio={settings.bio || page.bio}
              isVerified={settings.showBadge || page.verified}
              backgroundAnimation={settings.backgroundAnimation}
              headerNameColor={settings.headerNameColor}
              headerBioColor={settings.headerBioColor}
              headerMediaUrl={settings.headerMediaUrl}
              headerMediaType={settings.headerMediaType}
              avatarBorderColor={settings.avatarBorderColor}
              nitroAnimationUrl={settings.nitroAnimationUrl}
            />
          ) : null}
          
          {/* Social Icons - Top */}
          {loading ? (
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-10 h-10 rounded-full" />
              ))}
            </div>
          ) : socials && socialsDisplayMode === 'top' ? (
            <PublicSocialSection
              socials={socials}
              socialIconBgColor={settings.socialIconBgColor}
              socialIconColor={settings.socialIconColor}
              displayMode="top"
            />
          ) : null}
          
          {/* Content - Progressive Loading */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
              ))}
              {/* Gallery Skeleton */}
              <div className="space-y-3 mt-6">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <PublicContentList
              content={processedContent}
              cardBgColor={settings.cardBgColor}
              cardTextColor={settings.cardTextColor}
              onItemClick={handleItemClick}
              galleryContainerColor={settings.galleryContainerColor}
              galleryTitleColor={settings.galleryTitleColor}
              galleryCardBgColor={settings.galleryCardBgColor}
              galleryProductNameColor={settings.galleryProductNameColor}
              galleryProductDescriptionColor={settings.galleryProductDescriptionColor}
              galleryPriceColor={settings.galleryPriceColor}
              galleryButtonBgColor={settings.galleryButtonBgColor}
              galleryButtonTextColor={settings.galleryButtonTextColor}
              galleryHighlightBgColor={settings.galleryHighlightBgColor}
              galleryHighlightTextColor={settings.galleryHighlightTextColor}
            />
          )}
          
          {/* Social Icons - Bottom */}
          {!loading && socials && socialsDisplayMode === 'bottom' && (
            <PublicSocialSection
              socials={socials}
              socialIconBgColor={settings.socialIconBgColor}
              socialIconColor={settings.socialIconColor}
              displayMode="bottom"
            />
          )}
          
          <div className="flex justify-center pt-6">
            <Button 
              variant="outline" 
              className="h-12 rounded-full px-6 bg-white"
              onClick={() => window.location.href = '/'}
            >
              Crie seu MyCreator Grátis
            </Button>
          </div>
        </div>
        
        {/* Botão Flutuante do WhatsApp */}
        {!loading && settings.whatsappFloatingEnabled && settings.whatsappFloatingPhone && (
          <FloatingWhatsAppButton
            phone={settings.whatsappFloatingPhone}
            message={settings.whatsappFloatingMessage || ''}
            position="bottom-right"
          />
        )}
      </div>
    </FontProvider>
  );
};

export default PublicPage;
