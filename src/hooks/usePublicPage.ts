import { useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface PublicPageData {
  page: any;
  resources: any[];
  galleries: any[];
  socials: Record<string, string>;
  socialsDisplayMode: 'top' | 'bottom';
  settings: any;
  loading: boolean;
  error: string | null;
}

export const usePublicPageOptimized = (username: string): PublicPageData => {
  const initialSettings = useMemo(() => ({
    profileName: username || '',
    bio: '',
    avatarUrl: '',
    avatarBorderColor: '#ffffff',
    backgroundColor: '',
    headerMediaUrl: '',
    headerMediaType: '',
    headerMediaAspectRatio: null,
    cardBgColor: null,
    cardTextColor: null,
    headerNameColor: null,
    headerBioColor: null,
    showBadge: false,
    galleryTitleColor: null,
    galleryCardBgColor: null,
    galleryProductNameColor: null,
    galleryProductDescriptionColor: null,
    galleryButtonBgColor: null,
    galleryButtonTextColor: null,
    galleryPriceColor: null,
    galleryHighlightBgColor: null,
    galleryHighlightTextColor: null,
    socialIconBgColor: null,
    socialIconColor: null,
  }), [username]);

  const query = useQuery({
    queryKey: ['publicPage', username],
    enabled: !!username,
    queryFn: async () => {
      if (!username) throw new Error('Username não fornecido');
      const { data: pageData, error } = await supabase.rpc('get_public_page_data', { p_username: username });
      if (error) throw error;
      if (!pageData || (pageData as any).error) {
        const msg = (pageData as any)?.error || 'Página não encontrada';
        throw new Error(msg);
      }
      return pageData as any;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const base: PublicPageData = {
    page: null,
    resources: [],
    galleries: [],
    socials: {},
    socialsDisplayMode: 'bottom',
    settings: initialSettings,
    loading: query.isPending,
    error: null,
  };

  if (query.isError) {
    return { ...base, loading: false, error: (query.error as Error).message };
  }

  if (!query.data) {
    return base;
  }

  const processed = transformPageData(query.data, username);
  return { ...processed, loading: false, error: null };
};

function transformPageData(pageData: any, username: string) {
  const resources: any[] = [];
  const galleries: any[] = [];

  pageData.resources?.forEach((resource: any) => {
    if (resource.type === 'gallery' && resource.gallery_data) {
      galleries.push({
        id: resource.id,
        title: resource.title,
        items: resource.gallery_data.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.image_url,
          link: item.link_url,
          buttonText: item.button_text,
          destaque: item.destaque || false,
          lottieAnimation: item.lottie_animation || undefined,
        })),
        collapsed: resource.gallery_data.gallery?.is_collapsed || false,
      });

      resources.push({
        id: resource.id,
        type: 'gallery',
        title: resource.title,
        url: '',
        displayOrder: resource.display_order,
      });
    } else if (resource.image_banner_data) {
      resources.push({
        id: resource.id,
        type: 'image_banner',
        title: resource.title,
        url: resource.image_banner_data.link_url || '',
        image: resource.image_banner_data.image_url || undefined,
        hideUrl: true,
        displayOrder: resource.display_order,
      });
    } else if (resource.link_data) {
      let resourceType = 'link';
      const url = resource.link_data.url;
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        resourceType = 'youtube';
      } else if (url.includes('open.spotify.com')) {
        resourceType = 'spotify';
      } else if (url.includes('wa.me')) {
        resourceType = 'whatsapp';
      }

      resources.push({
        id: resource.id,
        type: resourceType,
        title: resource.title,
        url: resource.link_data.url,
        icon: resource.link_data.icon || undefined,
        image: resource.link_data.image_url || undefined,
        bgColor: resource.link_data.bg_color || undefined,
        hideUrl: resource.link_data.hide_url,
        displayOrder: resource.display_order,
      });
    } else if (resource.whatsapp_data) {
      const phone = resource.whatsapp_data.phone_number;
      const message = resource.whatsapp_data.message;
      const url = `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
      resources.push({
        id: resource.id,
        type: 'whatsapp',
        title: resource.title,
        url,
        image: resource.whatsapp_data.image_url || undefined,
        bgColor: resource.whatsapp_data.bg_color || undefined,
        displayOrder: resource.display_order,
      });
    } else if (resource.form_data) {
      resources.push({
        id: resource.id,
        type: 'form',
        title: resource.title,
        form_data: resource.form_data,
        displayOrder: resource.display_order,
      });
    }
  });

  const socialsObj: Record<string, string> = {};
  let socialsMode: 'top' | 'bottom' = 'bottom';
  if (pageData.social_networks?.length > 0) {
    pageData.social_networks.forEach((network: any) => {
      socialsObj[network.platform] = network.url;
    });
    socialsMode = pageData.social_networks[0].display_mode || 'bottom';
  }

  const settings = pageData.settings || {};

  return {
    page: pageData.page,
    resources: resources.sort((a, b) => a.displayOrder - b.displayOrder),
    galleries,
    socials: socialsObj,
    socialsDisplayMode: socialsMode,
    settings: {
      profileName: settings.profile_name || username,
      bio: settings.bio || '',
      avatarUrl: settings.avatar_url || '',
      avatarBorderColor: settings.avatar_border_color || '#ffffff',
      backgroundColor: settings.background_color || '',
      headerMediaUrl: settings.header_media_url || '',
      headerMediaType: settings.header_media_type || '',
      headerMediaAspectRatio: settings.header_media_aspect_ratio || null,
      cardBgColor: settings.card_bg_color || null,
      cardTextColor: settings.card_text_color || null,
      headerNameColor: settings.header_name_color || null,
      headerBioColor: settings.header_bio_color || null,
      showBadge: settings.show_badge_check ?? false,
      galleryTitleColor: settings.gallery_title_color || null,
      galleryCardBgColor: settings.gallery_card_bg_color || null,
      galleryProductNameColor: settings.gallery_product_name_color || null,
      galleryProductDescriptionColor: settings.gallery_product_description_color || null,
      galleryButtonBgColor: settings.gallery_button_bg_color || null,
      galleryButtonTextColor: settings.gallery_button_text_color || null,
      galleryPriceColor: settings.gallery_price_color || null,
      galleryHighlightBgColor: settings.gallery_highlight_bg_color || null,
      galleryHighlightTextColor: settings.gallery_highlight_text_color || null,
      socialIconBgColor: settings.social_icon_bg_color || null,
      socialIconColor: settings.social_icon_color || null,
    },
  } as Omit<PublicPageData, 'loading' | 'error'>;
}