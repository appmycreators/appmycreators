import { useState, useEffect, useCallback } from 'react';
import { usePage } from './usePage';
import { ResourceService, ImageBannerService } from '@/services/supabaseService';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface ImageBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
}

interface UseImageBannerSyncReturn {
  imageBanners: ImageBanner[];
  loading: boolean;
  saveStatus: SaveStatus;
  addImageBanner: (bannerData: Omit<ImageBanner, 'id'>) => Promise<void>;
  updateImageBanner: (id: string, data: Partial<ImageBanner>) => Promise<void>;
  deleteImageBanner: (id: string) => Promise<void>;
}

export const useImageBannerSync = (): UseImageBannerSyncReturn => {
  const { pageData, loading: pageLoading, refreshPage } = usePage();
  const [imageBanners, setImageBanners] = useState<ImageBanner[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Processar image banners dos resources já carregados
  useEffect(() => {
    if (!pageData.resources || pageLoading) return;

    const processedBanners: ImageBanner[] = pageData.resources
      .filter(r => r.type === 'image_banner' && r.image_banner_data)
      .map(r => ({
        id: r.id,
        title: r.title,
        imageUrl: r.image_banner_data.image_url,
        linkUrl: r.image_banner_data.link_url || undefined,
      }));

    setImageBanners(processedBanners);
  }, [pageData.resources, pageLoading]);

  const addImageBanner = useCallback(
    async (bannerData: Omit<ImageBanner, 'id'>) => {
      if (!pageData.page) return;

      setSaveStatus('saving');

      try {
        const totalResources = pageData.resources?.length || 0;
        const resource = await ResourceService.createResource(
          pageData.page.id,
          'image_banner',
          bannerData.title,
          totalResources
        );

        if (!resource) {
          throw new Error('Falha ao criar resource');
        }

        const banner = await ImageBannerService.createImageBanner(resource.id, {
          image_url: bannerData.imageUrl,
          link_url: bannerData.linkUrl || null,
          alt_text: bannerData.title || null,
        });

        if (!banner) {
          throw new Error('Falha ao criar image banner');
        }

        setImageBanners((prev) => [
          ...prev,
          {
            id: resource.id,
            ...bannerData,
          },
        ]);

        setSaveStatus('saved');
        await refreshPage();
      } catch (error) {
        console.error('Error adding image banner:', error);
        setSaveStatus('error');
      }
    },
    [pageData.page, pageData.resources, refreshPage]
  );

  const updateImageBanner = useCallback(
    async (id: string, data: Partial<ImageBanner>) => {
      setSaveStatus('saving');

      try {
        if (data.title) {
          await ResourceService.updateResource(id, { title: data.title });
        }

        await ImageBannerService.updateImageBanner(id, {
          image_url: data.imageUrl,
          link_url: data.linkUrl || null,
          alt_text: data.title || null,
        });

        setImageBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));

        setSaveStatus('saved');
        await refreshPage();
      } catch (error) {
        console.error('Error updating image banner:', error);
        setSaveStatus('error');
      }
    },
    [refreshPage]
  );

  const deleteImageBanner = useCallback(async (id: string) => {
    setSaveStatus('saving');

    try {
      await ResourceService.deleteResource(id);
      setImageBanners((prev) => prev.filter((b) => b.id !== id));
      setSaveStatus('saved');
      await refreshPage();
    } catch (error) {
      console.error('Error deleting image banner:', error);
      setSaveStatus('error');
    }
  }, [refreshPage]);

  return {
    imageBanners,
    loading: pageLoading,
    saveStatus,
    addImageBanner,
    updateImageBanner,
    deleteImageBanner,
  };
};
