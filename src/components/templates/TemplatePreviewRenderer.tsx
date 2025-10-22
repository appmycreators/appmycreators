import { useMemo } from 'react';
import PublicHeader from '@/components/public/PublicHeader';
import PublicSocialSection from '@/components/public/PublicSocialSection';
import PublicContentList from '@/components/public/PublicContentList';

interface TemplatePreviewRendererProps {
  templateData: any;
}

export const TemplatePreviewRenderer: React.FC<TemplatePreviewRendererProps> = ({ templateData }) => {
  // Processar settings
  const settings = useMemo(() => {
    const s = templateData.settings || {};
    return {
      profileName: s.profile_name || 'Template Preview',
      bio: s.bio || '',
      avatarUrl: s.avatar_url || '',
      avatarBorderColor: s.avatar_border_color || '#ffffff',
      backgroundColor: s.background_color || '#ffffff',
      headerMediaUrl: s.header_media_url || '',
      headerMediaType: s.header_media_type || '',
      headerMediaAspectRatio: s.header_media_aspect_ratio || null,
      cardBgColor: s.card_bg_color || null,
      cardTextColor: s.card_text_color || null,
      headerNameColor: s.header_name_color || null,
      headerBioColor: s.header_bio_color || null,
      showBadge: s.show_badge_check ?? false,
      nitroAnimationUrl: s.lottie_animation_url || null,
      galleryContainerColor: s.gallery_container_bg_color || null,
      galleryTitleColor: s.gallery_title_color || null,
      galleryCardBgColor: s.gallery_card_bg_color || null,
      galleryProductNameColor: s.gallery_product_name_color || null,
      galleryProductDescriptionColor: s.gallery_product_description_color || null,
      galleryButtonBgColor: s.gallery_button_bg_color || null,
      galleryButtonTextColor: s.gallery_button_text_color || null,
      galleryPriceColor: s.gallery_price_color || null,
      galleryHighlightBgColor: s.gallery_highlight_bg_color || null,
      galleryHighlightTextColor: s.gallery_highlight_text_color || null,
      socialIconBgColor: s.social_icon_bg_color || null,
      socialIconColor: s.social_icon_color || null,
      fontFamily: s.font_family || 'Poppins',
    };
  }, [templateData.settings]);

  // Processar resources
  const processedContent = useMemo(() => {
    const resources = templateData.resources || [];
    const galleries: any[] = [];

    const content = resources.map((resource: any) => {
      if (resource.type === 'gallery' && resource.gallery_data) {
        const galleryItems = resource.gallery_data.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.image_url,
          link: item.link_url,
          buttonText: item.button_text,
          destaque: item.destaque || false,
          lottieAnimation: item.lottie_animation || undefined,
          enableSocialProof: item.enable_social_proof || false,
          customLikesCount: item.custom_likes_count || 0,
          customSharesCount: item.custom_shares_count || 0,
        }));

        galleries.push({
          id: resource.id,
          title: resource.title,
          items: galleryItems,
          collapsed: resource.gallery_data.gallery?.is_collapsed || false,
        });

        return {
          id: resource.id,
          type: 'gallery',
          title: resource.title,
          url: '',
          displayOrder: resource.display_order,
          items: galleryItems,
        };
      } else if (resource.image_banner_data) {
        return {
          id: resource.id,
          type: 'image_banner',
          title: resource.title,
          url: resource.image_banner_data.link_url || '',
          image: resource.image_banner_data.image_url || undefined,
          hideUrl: true,
          displayOrder: resource.display_order,
        };
      } else if (resource.link_data) {
        let resourceType = 'link';
        const url = resource.link_data.url;
        if (url?.includes('youtube.com') || url?.includes('youtu.be')) {
          resourceType = 'youtube';
        } else if (url?.includes('open.spotify.com')) {
          resourceType = 'spotify';
        } else if (url?.includes('wa.me')) {
          resourceType = 'whatsapp';
        }

        return {
          id: resource.id,
          type: resourceType,
          title: resource.title,
          url: resource.link_data.url,
          icon: resource.link_data.icon || undefined,
          image: resource.link_data.image_url || undefined,
          bgColor: resource.link_data.bg_color || undefined,
          hideUrl: resource.link_data.hide_url,
          displayOrder: resource.display_order,
        };
      } else if (resource.whatsapp_data) {
        const phone = resource.whatsapp_data.phone_number;
        const message = resource.whatsapp_data.message;
        const url = `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
        return {
          id: resource.id,
          type: 'whatsapp',
          title: resource.title,
          url,
          image: resource.whatsapp_data.image_url || undefined,
          bgColor: resource.whatsapp_data.bg_color || undefined,
          displayOrder: resource.display_order,
        };
      } else if (resource.form_data) {
        return {
          id: resource.id,
          type: 'form',
          title: resource.title,
          form_data: resource.form_data,
          displayOrder: resource.display_order,
        };
      }

      return null;
    }).filter(Boolean);

    return content.sort((a: any, b: any) => a.displayOrder - b.displayOrder);
  }, [templateData.resources]);

  // Processar social networks
  const socials = useMemo(() => {
    const networks = templateData.social_networks || [];
    const socialsObj: Record<string, string> = {};
    networks.forEach((network: any) => {
      socialsObj[network.platform] = network.url;
    });
    return socialsObj;
  }, [templateData.social_networks]);

  const socialsDisplayMode = templateData.social_networks?.[0]?.display_mode || 'bottom';

  // Estilo de fundo
  const backgroundStyle = settings.backgroundColor
    ? { backgroundColor: settings.backgroundColor }
    : { background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' };

  // Handler vazio para clicks (preview não deve ter ações)
  const handleItemClick = () => {};

  return (
    <div
      className="min-h-full w-full"
      style={backgroundStyle}
    >
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <PublicHeader
          profileImageUrl={settings.avatarUrl}
          name={settings.profileName}
          bio={settings.bio}
          isVerified={settings.showBadge}
          headerNameColor={settings.headerNameColor}
          headerBioColor={settings.headerBioColor}
          headerMediaUrl={settings.headerMediaUrl}
          headerMediaType={settings.headerMediaType}
          avatarBorderColor={settings.avatarBorderColor}
          nitroAnimationUrl={settings.nitroAnimationUrl}
        />

        {/* Social Icons - Top */}
        {socials && socialsDisplayMode === 'top' && (
          <PublicSocialSection
            socials={socials}
            socialIconBgColor={settings.socialIconBgColor}
            socialIconColor={settings.socialIconColor}
            displayMode="top"
          />
        )}

        {/* Content */}
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

        {/* Social Icons - Bottom */}
        {socials && socialsDisplayMode === 'bottom' && (
          <PublicSocialSection
            socials={socials}
            socialIconBgColor={settings.socialIconBgColor}
            socialIconColor={settings.socialIconColor}
            displayMode="bottom"
          />
        )}
      </div>
    </div>
  );
};
