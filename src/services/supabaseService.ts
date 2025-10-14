import { supabase } from '@/lib/supabase';

// ============================================
// USERNAME SERVICE
// ============================================

export interface UsernameCheckResult {
  available: boolean;
  message: string;
  username?: string;
}

export const UsernameService = {
  // Verificar se username está disponível
  async checkAvailability(username: string): Promise<UsernameCheckResult> {
    try {
      const { data, error } = await supabase
        .rpc('rpc_check_username', { p_username: username });

      if (error) {
        console.error('Error checking username:', error);
        return {
          available: false,
          message: 'Erro ao verificar username',
        };
      }

      return data as UsernameCheckResult;
    } catch (error) {
      console.error('Error checking username:', error);
      return {
        available: false,
        message: 'Erro ao verificar username',
      };
    }
  },

  // Obter username do usuário logado
  async getUserUsername(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('usernames')
      .select('username')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching username:', error);
      return null;
    }

    return data?.username || null;
  },

  // Validar formato de username localmente (antes de enviar ao servidor)
  validateFormat(username: string): { valid: boolean; message?: string } {
    const trimmed = username.trim().toLowerCase();

    if (trimmed.length < 3) {
      return { valid: false, message: 'Username deve ter pelo menos 3 caracteres' };
    }

    if (trimmed.length > 30) {
      return { valid: false, message: 'Username deve ter no máximo 30 caracteres' };
    }

    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      return {
        valid: false,
        message: 'Username só pode conter letras minúsculas, números e underscore',
      };
    }

    return { valid: true };
  },
};

// ============================================
// PAGES SERVICE
// ============================================

export interface Page {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageSettings {
  id: string;
  page_id: string;
  profile_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  header_media_url: string | null;
  header_media_type: 'image' | 'video' | 'gif' | null;
  header_media_aspect_ratio: '1:1' | '4:5' | '16:9' | '9:16' | null;
  background_color: string | null;
  background_gradient: string | null;
  theme: string;
  card_bg_color: string | null;
  card_text_color: string | null;
  header_name_color: string | null;
  header_bio_color: string | null;
  avatar_border_color: string | null;
  show_badge_check: boolean | null;
  gallery_container_bg_color: string | null;
  gallery_title_color: string | null;
  gallery_card_bg_color: string | null;
  gallery_product_name_color: string | null;
  gallery_product_description_color: string | null;
  gallery_button_bg_color: string | null;
  gallery_button_text_color: string | null;
  gallery_price_color: string | null;
  gallery_highlight_bg_color: string | null;
  gallery_highlight_text_color: string | null;
  social_icon_bg_color: string | null;
  social_icon_color: string | null;
  font_family: string | null;
}

export interface Resource {
  id: string;
  page_id: string;
  type: 'link' | 'gallery' | 'whatsapp' | 'spotify' | 'youtube' | 'image_banner';
  title: string;
  display_order: number;
  is_visible: boolean;
}

export const PageService = {
  // Get user's primary page or first page
  async getUserPrimaryPage(userId: string): Promise<Page | null> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching primary page:', error);
      return null;
    }

    return data;
  },

  // Get all user's pages
  async getUserPages(userId: string): Promise<Page[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching user pages:', error);
      return [];
    }

    return data || [];
  },

  // Generate a unique slug based on baseSlug
  async generateUniqueSlug(baseSlug: string): Promise<string> {
    const normalizedBase = baseSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'pagina';

    let attempt = 0;
    let candidate = normalizedBase;

    while (attempt < 10) {
      const { data } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', candidate)
        .maybeSingle();

      if (!data) {
        return candidate;
      }

      attempt += 1;
      candidate = `${normalizedBase}-${attempt}`;
    }

    // fallback aleatório
    return `${normalizedBase}-${Math.random().toString(36).slice(2, 8)}`;
  },

  // Create a new page for user
  async createPage(userId: string, slug: string, title: string, isPrimary: boolean = false): Promise<Page | null> {
    const { data, error } = await supabase
      .from('pages')
      .insert({
        user_id: userId,
        slug,
        title,
        is_primary: isPrimary,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Slug already exists (possibly created concurrently). Return existing page.
        const { data: existing } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (existing) {
          if (existing.user_id === userId) {
            return existing;
          }

          const uniqueSlug = await this.generateUniqueSlug(slug);
          if (uniqueSlug !== slug) {
            return await this.createPage(userId, uniqueSlug, title, isPrimary);
          }

          return existing;
        }

        const uniqueSlug = await this.generateUniqueSlug(slug);
        if (uniqueSlug !== slug) {
          return await this.createPage(userId, uniqueSlug, title, isPrimary);
        }
      }

      console.error('Error creating page:', error);
      return null;
    }

    // Create default page settings
    await this.createPageSettings(data.id);

    return data;
  },

  // Create page settings
  async createPageSettings(pageId: string): Promise<PageSettings | null> {
    const { data, error } = await supabase
      .from('page_settings')
      .insert({
        page_id: pageId,
        theme: 'light',
        background_color: '#000000',
        background_gradient: null,
        card_bg_color: '#282c34',
        card_text_color: '#ffffff',
        header_name_color: '#ffffff',
        header_bio_color: '#ffffff',
        gallery_container_bg_color: '#282c34',
        gallery_card_bg_color: '#ffffff',
        gallery_product_name_color: '#000000',
        gallery_product_description_color: '#000000',
        gallery_button_bg_color: '#282c34',
        gallery_button_text_color: '#ffffff',
        gallery_price_color: '#282c34',
        gallery_highlight_bg_color: '#282c34',
        gallery_highlight_text_color: '#ffffff',
        gallery_title_color: '#ffffff',
        social_icon_bg_color: '#ffffff',
        social_icon_color: '#282c34',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('page_settings')
          .select('*')
          .eq('page_id', pageId)
          .maybeSingle();

        if (existing) {
          return existing as PageSettings;
        }
      }

      console.error('Error creating page settings:', error);
      return null;
    }

    return data as PageSettings;
  },

  // Get page by slug (for public preview)
  async getPageBySlug(slug: string): Promise<Page | null> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching page by slug:', error);
      return null;
    }

    return data;
  },

  // Update page
  async updatePage(pageId: string, updates: Partial<Page>): Promise<boolean> {
    const { error } = await supabase
      .from('pages')
      .update(updates)
      .eq('id', pageId);

    if (error) {
      console.error('Error updating page:', error);
      return false;
    }

    return true;
  },

  // Delete a page and all related data
  async deletePage(pageId: string): Promise<boolean> {
    try {
      // Delete page (cascade will handle related data: settings, resources, social_links, etc)
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) {
        console.error('Error deleting page:', error);
        return false;
      }

      // Delete usernames entries for this page
      await supabase
        .from('usernames')
        .delete()
        .eq('page_id', pageId);

      return true;
    } catch (error) {
      console.error('Error in deletePage:', error);
      return false;
    }
  },
};

// ============================================
// PAGE SETTINGS SERVICE
// ============================================

export const PageSettingsService = {
  // Get page settings
  async getSettings(pageId: string): Promise<PageSettings | null> {
    const { data, error } = await supabase
      .from('page_settings')
      .select('*')
      .eq('page_id', pageId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching page settings:', error);
      return null;
    }

    if (!data) {
      return PageService.createPageSettings(pageId);
    }

    return data as PageSettings;
  },

  // Update page settings
  async updateSettings(pageId: string, updates: Partial<PageSettings>): Promise<boolean> {
    const { error } = await supabase
      .from('page_settings')
      .update(updates)
      .eq('page_id', pageId);

    if (error) {
      console.error('Error updating page settings:', error);
      return false;
    }

    return true;
  },
};

// ============================================
// RESOURCES SERVICE
// ============================================

export const ResourceService = {
  // Get all resources for a page
  async getPageResources(pageId: string): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('page_id', pageId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching resources:', error);
      return [];
    }

    return data || [];
  },

  // Create a resource
  async createResource(
    pageId: string,
    type: Resource['type'],
    title: string,
    displayOrder: number
  ): Promise<Resource | null> {
    const { data, error } = await supabase
      .from('resources')
      .insert({
        page_id: pageId,
        type,
        title,
        display_order: displayOrder,
        is_visible: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating resource:', error);
      return null;
    }

    return data;
  },

  // Update resource
  async updateResource(resourceId: string, updates: Partial<Resource>): Promise<boolean> {
    const { error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', resourceId);

    if (error) {
      console.error('Error updating resource:', error);
      return false;
    }

    return true;
  },

  // Delete resource
  async deleteResource(resourceId: string): Promise<boolean> {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId);

    if (error) {
      console.error('Error deleting resource:', error);
      return false;
    }

    return true;
  },

  // Reorder resources
  async reorderResources(resources: { id: string; display_order: number }[]): Promise<boolean> {
    const updates = resources.map((r) =>
      supabase.from('resources').update({ display_order: r.display_order }).eq('id', r.id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      console.error('Error reordering resources');
      return false;
    }

    return true;
  },
};

// ============================================
// LINKS SERVICE
// ============================================

export interface Link {
  id: string;
  resource_id: string;
  url: string;
  icon: string | null;
  image_url: string | null;
  bg_color: string | null;
  hide_url: boolean;
  click_count: number;
}

export const LinkService = {
  // Get link by resource_id
  async getLink(resourceId: string): Promise<Link | null> {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('resource_id', resourceId)
      .single();

    if (error) {
      console.error('Error fetching link:', error);
      return null;
    }

    return data;
  },

  // Create link
  async createLink(resourceId: string, linkData: Partial<Link>): Promise<Link | null> {
    const { data, error } = await supabase
      .from('links')
      .insert({
        resource_id: resourceId,
        ...linkData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating link:', error);
      return null;
    }

    return data;
  },

  // Update link
  async updateLink(resourceId: string, updates: Partial<Link>): Promise<boolean> {
    const { error } = await supabase
      .from('links')
      .update(updates)
      .eq('resource_id', resourceId);

    if (error) {
      console.error('Error updating link:', error);
      return false;
    }

    return true;
  },
};

// ============================================
// GALLERIES SERVICE
// ============================================

export interface Gallery {
  id: string;
  resource_id: string;
  is_collapsed: boolean;
}

export interface GalleryItem {
  id: string;
  gallery_id: string;
  name: string;
  description: string | null;
  price: string | null;
  image_url: string;
  link_url: string;
  button_text: string;
  display_order: number;
  destaque: boolean;
  lottie_animation: string | null;
  enable_social_proof?: boolean;
  custom_likes_count?: number;
  custom_shares_count?: number;
}

export const GalleryService = {
  // Get gallery by resource_id
  async getGallery(resourceId: string): Promise<Gallery | null> {
    const { data, error } = await supabase
      .from('galleries')
      .select('*')
      .eq('resource_id', resourceId)
      .single();

    if (error) {
      console.error('Error fetching gallery:', error);
      return null;
    }

    return data;
  },

  // Create gallery
  async createGallery(resourceId: string): Promise<Gallery | null> {
    const { data, error } = await supabase
      .from('galleries')
      .insert({
        resource_id: resourceId,
        is_collapsed: false,
      })
      .select();

    if (error) {
      console.error('Error creating gallery:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.error('No gallery data returned after insert');
      return null;
    }

    return data[0];
  },
};

export const GalleryItemService = {
  // Get gallery items
  async getGalleryItems(galleryId: string): Promise<GalleryItem[]> {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('gallery_id', galleryId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching gallery items:', error);
      return [];
    }

    return data || [];
  },

  // Create gallery item
  async createGalleryItem(galleryId: string, itemData: Partial<GalleryItem>): Promise<GalleryItem | null> {
    const { data, error } = await supabase
      .from('gallery_items')
      .insert({
        gallery_id: galleryId,
        ...itemData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating gallery item:', error);
      return null;
    }

    return data;
  },

  // Update gallery item
  async updateGalleryItem(itemId: string, updates: Partial<GalleryItem>): Promise<boolean> {
    const { error } = await supabase
      .from('gallery_items')
      .update(updates)
      .eq('id', itemId);

    if (error) {
      console.error('Error updating gallery item:', error);
      return false;
    }

    return true;
  },

  // Delete gallery item
  async deleteGalleryItem(itemId: string): Promise<boolean> {
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting gallery item:', error);
      return false;
    }

    return true;
  },
};

// ============================================
// SOCIAL NETWORKS SERVICE
// ============================================

export interface SocialNetwork {
  id: string;
  page_id: string;
  platform: string;
  url: string;
  display_mode: 'top' | 'bottom';
  display_order: number;
}

export const SocialNetworkService = {
  // Get social networks for a page
  async getSocialNetworks(pageId: string): Promise<SocialNetwork[]> {
    const { data, error } = await supabase
      .from('social_networks')
      .select('*')
      .eq('page_id', pageId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching social networks:', error);
      return [];
    }

    return data || [];
  },

  // Upsert social networks (replace all)
  async upsertSocialNetworks(
    pageId: string,
    networks: { platform: string; url: string }[],
    displayMode: 'top' | 'bottom'
  ): Promise<boolean> {
    // Delete existing networks
    await supabase.from('social_networks').delete().eq('page_id', pageId);

    if (networks.length === 0) return true;

    // Insert new networks
    const { error } = await supabase.from('social_networks').insert(
      networks.map((n, index) => ({
        page_id: pageId,
        platform: n.platform,
        url: n.url,
        display_mode: displayMode,
        display_order: index,
      }))
    );

    if (error) {
      console.error('Error upserting social networks:', error);
      return false;
    }

    return true;
  },

  // Delete all social networks for a page
  async deleteAllSocialNetworks(pageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('social_networks')
      .delete()
      .eq('page_id', pageId);

    if (error) {
      console.error('Error deleting social networks:', error);
      return false;
    }

    return true;
  },
};

// ============================================
// IMAGE BANNERS SERVICE
// ============================================

export interface ImageBanner {
  id: string;
  resource_id: string;
  image_url: string;
  link_url: string | null;
  alt_text: string | null;
  color_text: string | null;
  color_bg: string | null;
  visible_title: boolean | null;
}

export const ImageBannerService = {
  async getImageBanner(resourceId: string): Promise<ImageBanner | null> {
    const { data, error } = await supabase
      .from('image_banners')
      .select('*')
      .eq('resource_id', resourceId)
      .single();

    if (error) {
      console.error('Error fetching image banner:', error);
      return null;
    }

    return data;
  },

  async createImageBanner(resourceId: string, bannerData: Partial<ImageBanner>): Promise<ImageBanner | null> {
    const { data, error } = await supabase
      .from('image_banners')
      .insert({
        resource_id: resourceId,
        ...bannerData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating image banner:', error);
      return null;
    }

    return data;
  },

  async updateImageBanner(resourceId: string, updates: Partial<ImageBanner>): Promise<boolean> {
    const { error } = await supabase
      .from('image_banners')
      .update(updates)
      .eq('resource_id', resourceId);

    if (error) {
      console.error('Error updating image banner:', error);
      return false;
    }

    return true;
  },
};

// ============================================
// DASHBOARD SERVICE
// ============================================

export interface DashboardPageData {
  username: string | null;
  page: Page | null;
  settings: PageSettings | null;
  resources: Array<{
    id: string;
    type: 'link' | 'gallery' | 'whatsapp' | 'spotify' | 'youtube' | 'image_banner';
    title: string;
    display_order: number;
    is_visible: boolean;
    link_data?: any;
    whatsapp_data?: any;
    gallery_data?: {
      gallery: Gallery;
      items: GalleryItem[];
    };
  }>;
  social_networks: SocialNetwork[];
}

export const DashboardService = {
  async getDashboardData(userId: string): Promise<DashboardPageData | null> {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_page_data', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error fetching dashboard data:', error);
        return null;
      }

      return data as DashboardPageData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return null;
    }
  },

  async getDashboardDataByPageId(userId: string, pageId: string): Promise<DashboardPageData | null> {
    try {
      // Usar RPC otimizado para buscar todos os dados em uma única query
      const { data, error } = await supabase.rpc('get_dashboard_page_data_by_page_id', {
        p_user_id: userId,
        p_page_id: pageId,
      });

      if (error) {
        console.error('Error fetching dashboard data by page:', error);
        return null;
      }

      return data as DashboardPageData;
    } catch (error) {
      console.error('Error fetching dashboard data by page:', error);
      return null;
    }
  },
};

// ============================================
// WHATSAPP SERVICE
// ============================================

export interface WhatsAppLink {
  id: string;
  resource_id: string;
  phone_number: string;
  message: string | null;
  image_url: string | null;
  bg_color: string | null;
  click_count: number;
}

export const WhatsAppService = {
  async getWhatsAppLink(resourceId: string): Promise<WhatsAppLink | null> {
    const { data, error } = await supabase
      .from('whatsapp_links')
      .select('*')
      .eq('resource_id', resourceId)
      .single();

    if (error) {
      console.error('Error fetching WhatsApp link:', error);
      return null;
    }

    return data;
  },

  async createWhatsAppLink(resourceId: string, linkData: Partial<WhatsAppLink>): Promise<WhatsAppLink | null> {
    const { data, error } = await supabase
      .from('whatsapp_links')
      .insert({
        resource_id: resourceId,
        ...linkData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating WhatsApp link:', error);
      return null;
    }

    return data;
  },

  async updateWhatsAppLink(resourceId: string, updates: Partial<WhatsAppLink>): Promise<boolean> {
    const { error } = await supabase
      .from('whatsapp_links')
      .update(updates)
      .eq('resource_id', resourceId);

    if (error) {
      console.error('Error updating WhatsApp link:', error);
      return false;
    }

    return true;
  },
};

// ============================================
// FORMS SERVICE
// ============================================

export interface FormWithStats {
  form_id: string;
  resource_id: string;
  page_id: string;
  form_name: string;
  description: string | null;
  created_at: string;
  lead_count: number;
  last_lead_at: string | null;
}

export interface FormLead {
  id: string;
  form_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  additional_data: any;
  created_at: string;
}

export interface FormData {
  form_name: string;
  description?: string;
  fields_config?: {
    name: boolean;
    email: boolean;
    phone: boolean;
  };
  submit_button_text?: string;
  submit_button_color?: string;
  success_message?: string;
}

export const FormService = {
  async getForm(resourceId: string): Promise<any> {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('resource_id', resourceId)
      .single();

    if (error) {
      console.error('Error fetching form:', error);
      return null;
    }

    return data;
  },

  async createFormResource(userId: string, title: string, formData: FormData): Promise<boolean> {
    try {
      // First create the resource
      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .insert({
          page_id: (await supabase.from('pages').select('id').eq('user_id', userId).eq('is_primary', true).single()).data?.id,
          type: 'form',
          title: title,
          is_visible: true,
        })
        .select()
        .single();

      if (resourceError) {
        console.error('Error creating resource:', resourceError);
        return false;
      }

      // Then create the form
      const { error: formError } = await supabase
        .from('forms')
        .insert({
          resource_id: resourceData.id,
          form_name: formData.form_name,
          description: formData.description,
          fields_config: formData.fields_config || { name: true, email: true, phone: true },
          submit_button_text: formData.submit_button_text || 'Enviar',
          submit_button_color: formData.submit_button_color || '#000000',
          success_message: formData.success_message || 'Obrigado! Seus dados foram enviados com sucesso.',
        });

      if (formError) {
        console.error('Error creating form:', formError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating form resource:', error);
      return false;
    }
  },

  async updateForm(resourceId: string, updates: Partial<FormData>): Promise<boolean> {
    const { error } = await supabase
      .from('forms')
      .update(updates)
      .eq('resource_id', resourceId);

    if (error) {
      console.error('Error updating form:', error);
      return false;
    }

    return true;
  },

  async updateResourceTitle(resourceId: string, title: string): Promise<boolean> {
    const { error } = await supabase
      .from('resources')
      .update({ title })
      .eq('id', resourceId);

    if (error) {
      console.error('Error updating resource title:', error);
      return false;
    }

    return true;
  },

  async getUserFormsWithStats(userId: string): Promise<FormWithStats[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_forms_with_lead_counts', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error fetching forms with stats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching forms with stats:', error);
      return [];
    }
  },

  async deleteForm(resourceId: string): Promise<boolean> {
    try {
      // First delete the form record
      const { error: formError } = await supabase
        .from('forms')
        .delete()
        .eq('resource_id', resourceId);

      if (formError) {
        console.error('Error deleting form:', formError);
        return false;
      }

      // Then delete the resource record
      const { error: resourceError } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (resourceError) {
        console.error('Error deleting resource:', resourceError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteForm:', error);
      return false;
    }
  },
};

// ============================================
// FORM LEADS SERVICE
// ============================================

export const FormLeadService = {
  async submitLead(formId: string, leadData: { name?: string; email?: string; phone?: string }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('form_leads')
        .insert({
          form_id: formId,
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
        });

      if (error) {
        console.error('Error submitting lead:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error submitting lead:', error);
      return false;
    }
  },

  async getFormLeads(formId: string): Promise<FormLead[]> {
    const { data, error } = await supabase
      .from('form_leads')
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching form leads:', error);
      return [];
    }

    return data || [];
  },

  async getFormLeadsWithStats(formId: string): Promise<{ leads: FormLead[]; total: number }> {
    try {
      const { data, error } = await supabase.rpc('get_form_leads_with_stats', {
        p_form_id: formId,
      });

      if (error) {
        console.error('Error fetching form leads with stats:', error);
        return { leads: [], total: 0 };
      }

      const leads = data?.map((item: any) => ({
        id: item.lead_id,
        form_id: formId,
        name: item.name,
        email: item.email,
        phone: item.phone,
        additional_data: item.additional_data,
        created_at: item.created_at,
      })) || [];

      const total = data?.[0]?.total_leads || 0;

      return { leads, total };
    } catch (error) {
      console.error('Error fetching form leads with stats:', error);
      return { leads: [], total: 0 };
    }
  },

  async deleteLead(leadId: string): Promise<boolean> {
    const { error } = await supabase
      .from('form_leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      console.error('Error deleting lead:', error);
      return false;
    }

    return true;
  },

  exportLeadsToCSV(leads: FormLead[], formName: string): void {
    const headers = ['Nome', 'Email', 'Telefone', 'Data'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        new Date(lead.created_at).toLocaleDateString('pt-BR')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${formName}_leads.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
