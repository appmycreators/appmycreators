import { supabase } from '@/lib/supabase';

// ============================================
// INTERFACES
// ============================================

export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: 'business' | 'personal' | 'creative' | 'ecommerce' | 'portfolio' | 'general' | 'marketing';
  preview_image_url: string | null;
  creator_user_id: string;
  creator_username: string;
  is_public: boolean;
  is_featured: boolean;
  usage_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TemplatePreview {
  template: Template;
  settings: any;
  resources_count: number;
  has_galleries: boolean;
  has_forms: boolean;
  social_networks_count: number;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  category?: 'business' | 'personal' | 'creative' | 'ecommerce' | 'portfolio' | 'general' | 'marketing';
  tags?: string[];
}

export interface CreatePageFromTemplateData {
  page_title?: string;
  page_slug?: string;
}

// ============================================
// TEMPLATE SERVICE
// ============================================

export const TemplateService = {
  /**
   * Exporta uma página como template
   * @param pageId - ID da página a ser exportada
   * @param templateData - Dados do template (nome, descrição, categoria, tags)
   * @returns ID do template criado
   */
  async exportPageAsTemplate(
    pageId: string,
    templateData: CreateTemplateData
  ): Promise<{ data: string | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc('export_page_as_template', {
        p_page_id: pageId,
        p_template_name: templateData.name,
        p_template_description: templateData.description || null,
        p_category: templateData.category || 'general',
        p_tags: templateData.tags || [],
      });

      if (error) {
        console.error('Error exporting page as template:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error exporting page as template:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Cria uma NOVA página a partir de um template
   * @param templateId - ID do template
   * @param pageData - Dados da nova página (título e slug opcionais)
   * @returns ID da página criada
   */
  async createPageFromTemplate(
    templateId: string,
    pageData?: CreatePageFromTemplateData
  ): Promise<{ data: string | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc('create_page_from_template', {
        p_template_id: templateId,
        p_page_title: pageData?.page_title || null,
        p_page_slug: pageData?.page_slug || null,
      });

      if (error) {
        console.error('Error creating page from template:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error creating page from template:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Lista todos os templates públicos
   * @param filters - Filtros opcionais (categoria, tags, busca)
   * @returns Lista de templates
   */
  async getPublicTemplates(filters?: {
    category?: string;
    tags?: string[];
    search?: string;
    featured?: boolean;
  }): Promise<{ data: Template[] | null; error: Error | null }> {
    try {
      let query = supabase
        .from('templates')
        .select('*')
        .eq('is_public', true);

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.featured !== undefined) {
        query = query.eq('is_featured', filters.featured);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      query = query.order('usage_count', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching public templates:', error);
        return { data: null, error };
      }

      return { data: data as Template[], error: null };
    } catch (error) {
      console.error('Error fetching public templates:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Busca templates do usuário logado
   * @returns Lista de templates do usuário
   */
  async getMyTemplates(): Promise<{ data: Template[] | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('creator_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my templates:', error);
        return { data: null, error };
      }

      return { data: data as Template[], error: null };
    } catch (error) {
      console.error('Error fetching my templates:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Busca um template por ID
   * @param templateId - ID do template
   * @returns Template encontrado
   */
  async getTemplateById(templateId: string): Promise<{ data: Template | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        console.error('Error fetching template by ID:', error);
        return { data: null, error };
      }

      return { data: data as Template, error: null };
    } catch (error) {
      console.error('Error fetching template by ID:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Busca preview do template (informações resumidas)
   * @param templateId - ID do template
   * @returns Preview do template
   */
  async getTemplatePreview(templateId: string): Promise<{ data: TemplatePreview | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc('get_template_preview', {
        p_template_id: templateId,
      });

      if (error) {
        console.error('Error fetching template preview:', error);
        return { data: null, error };
      }

      return { data: data as TemplatePreview, error: null };
    } catch (error) {
      console.error('Error fetching template preview:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Atualiza um template
   * @param templateId - ID do template
   * @param updates - Dados a serem atualizados
   * @returns Sucesso da operação
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<Pick<Template, 'name' | 'description' | 'category' | 'tags' | 'is_public' | 'preview_image_url'>>
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', templateId);

      if (error) {
        console.error('Error updating template:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating template:', error);
      return { success: false, error: error as Error };
    }
  },

  /**
   * Deleta um template
   * @param templateId - ID do template
   * @returns Sucesso da operação
   */
  async deleteTemplate(templateId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting template:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting template:', error);
      return { success: false, error: error as Error };
    }
  },

  /**
   * Busca templates por categoria
   * @param category - Categoria do template
   * @returns Lista de templates da categoria
   */
  async getTemplatesByCategory(category: Template['category']): Promise<{ data: Template[] | null; error: Error | null }> {
    return this.getPublicTemplates({ category });
  },

  /**
   * Busca templates em destaque
   * @returns Lista de templates em destaque
   */
  async getFeaturedTemplates(): Promise<{ data: Template[] | null; error: Error | null }> {
    return this.getPublicTemplates({ featured: true });
  },

  /**
   * Busca templates mais populares
   * @param limit - Quantidade de templates a retornar
   * @returns Lista de templates mais usados
   */
  async getPopularTemplates(limit: number = 10): Promise<{ data: Template[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching popular templates:', error);
        return { data: null, error };
      }

      return { data: data as Template[], error: null };
    } catch (error) {
      console.error('Error fetching popular templates:', error);
      return { data: null, error: error as Error };
    }
  },
};
