import { useState, useEffect, useCallback } from 'react';
import { usePage } from './usePage';
import { ResourceService, LinkService } from '@/services/supabaseService';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string;
  image?: string;
  bgColor?: string;
  hideUrl?: boolean;
}

interface UsePageSyncReturn {
  links: Link[];
  loading: boolean;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  saveError: string | null;
  addLink: (linkData: Omit<Link, 'id'>) => Promise<void>;
  updateLink: (id: string, data: Partial<Link>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  reorderLinks: (links: Link[]) => Promise<void>;
  toggleResourceVisibility: (resourceId: string, isVisible: boolean) => Promise<void>;
}

export const usePageSync = (): UsePageSyncReturn => {
  const { pageData, loading: pageLoading, refreshPage } = usePage();
  const [links, setLinks] = useState<Link[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Processar links dos resources já carregados pela RPC
  useEffect(() => {
    if (!pageData.resources || pageLoading) return;

    const processedLinks: Link[] = pageData.resources
      .filter(r => {
        // Filtrar apenas resources do tipo link e que tenham link_data
        return (r.type === 'link' || r.type === 'spotify' || r.type === 'youtube' || r.type === 'image_banner') 
          && r.link_data;
      })
      .map(r => ({
        id: r.id,
        title: r.title,
        url: r.link_data.url,
        icon: r.link_data.icon || undefined,
        image: r.link_data.image_url || undefined,
        bgColor: r.link_data.bg_color || undefined,
        hideUrl: r.link_data.hide_url || false,
      }));

    setLinks(processedLinks);
  }, [pageData.resources, pageLoading]);

  const addLink = useCallback(
    async (linkData: Omit<Link, 'id'>) => {
      if (!pageData.page) return;

      setSaveStatus('saving');
      setSaveError(null);

      try {
        // 1. Criar resource com display_order baseado no total de resources
        const totalResources = pageData.resources?.length || 0;
        const resource = await ResourceService.createResource(
          pageData.page.id,
          'link',
          linkData.title,
          totalResources
        );

        if (!resource) {
          throw new Error('Falha ao criar resource');
        }

        // 2. Criar link
        const link = await LinkService.createLink(resource.id, {
          url: linkData.url,
          icon: linkData.icon || null,
          image_url: linkData.image || null,
          bg_color: linkData.bgColor || null,
          hide_url: linkData.hideUrl || false,
        });

        if (!link) {
          throw new Error('Falha ao criar link');
        }

        // 3. Atualizar estado local
        setLinks((prev) => [
          ...prev,
          {
            id: resource.id,
            ...linkData,
          },
        ]);

        setSaveStatus('saved');
        setLastSaved(new Date());

        await refreshPage();
      } catch (error) {
        console.error('Error adding link:', error);
        setSaveStatus('error');
        setSaveError('Erro ao adicionar link');
      }
    },
    [pageData.page, pageData.resources, refreshPage]
  );

  const updateLink = useCallback(
    async (id: string, data: Partial<Link>) => {
      setSaveStatus('saving');
      setSaveError(null);

      try {
        // 1. Atualizar resource (título)
        if (data.title) {
          await ResourceService.updateResource(id, { title: data.title });
        }

        // 2. Atualizar link
        await LinkService.updateLink(id, {
          url: data.url,
          icon: data.icon || null,
          image_url: data.image || null,
          bg_color: data.bgColor || null,
          hide_url: data.hideUrl,
        });

        // 3. Atualizar estado local
        setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));

        setSaveStatus('saved');
        setLastSaved(new Date());

        await refreshPage();
      } catch (error) {
        console.error('Error updating link:', error);
        setSaveStatus('error');
        setSaveError('Erro ao atualizar link');
      }
    },
    [refreshPage]
  );

  const deleteLink = useCallback(async (id: string) => {
    setSaveStatus('saving');
    setSaveError(null);

    try {
      // Deletar resource (cascade deleta link)
      await ResourceService.deleteResource(id);

      // Atualizar estado local
      setLinks((prev) => prev.filter((l) => l.id !== id));

      setSaveStatus('saved');
      setLastSaved(new Date());

      await refreshPage();
    } catch (error) {
      console.error('Error deleting link:', error);
      setSaveStatus('error');
      setSaveError('Erro ao deletar link');
    }
  }, [refreshPage]);

  const reorderLinks = useCallback(async (reorderedLinks: Link[]) => {
    setSaveStatus('saving');
    setSaveError(null);

    try {
      // Atualizar display_order de cada resource
      const updates = reorderedLinks.map((link, index) => ({
        id: link.id,
        display_order: index,
      }));

      await ResourceService.reorderResources(updates);

      // Atualizar estado local
      setLinks(reorderedLinks);

      setSaveStatus('saved');
      setLastSaved(new Date());

      await refreshPage();
    } catch (error) {
      console.error('Error reordering links:', error);
      setSaveStatus('error');
      setSaveError('Erro ao reordenar links');
    }
  }, [refreshPage]);

  const toggleResourceVisibility = useCallback(async (resourceId: string, isVisible: boolean) => {
    setSaveStatus('saving');
    setSaveError(null);

    try {
      await ResourceService.updateResource(resourceId, { is_visible: isVisible });

      setSaveStatus('saved');
      setLastSaved(new Date());

      await refreshPage();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      setSaveStatus('error');
      setSaveError('Erro ao atualizar visibilidade');
    }
  }, [refreshPage]);

  return {
    links,
    loading: pageLoading,
    saveStatus,
    lastSaved,
    saveError,
    addLink,
    updateLink,
    deleteLink,
    reorderLinks,
    toggleResourceVisibility,
  };
};