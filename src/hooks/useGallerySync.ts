import { useState, useEffect, useCallback } from 'react';
import { usePage } from './usePage';
import {
  ResourceService,
  GalleryService,
  GalleryItemService,
} from '@/services/supabaseService';
import { StorageService } from '@/services/storageService';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface GalleryItem {
  id: string;
  link: string;
  name: string;
  description?: string;
  price?: number;
  buttonText?: string;
  imageUrl?: string;
  destaque?: boolean;
  lottieAnimation?: string;
  displayOrder?: number;
  enableSocialProof?: boolean;
  customLikesCount?: number;
  customSharesCount?: number;
}

export interface Gallery {
  id: string; // resource id
  title: string;
  galleryId: string | null;
  items: GalleryItem[];
  collapsed?: boolean;
}

interface UseGallerySyncReturn {
  galleries: Gallery[];
  loading: boolean;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  saveError: string | null;
  addGallery: (title: string) => Promise<string | null>;
  updateGallery: (id: string, title: string) => Promise<void>;
  deleteGallery: (id: string) => Promise<void>;
  addGalleryItem: (galleryId: string, item: Omit<GalleryItem, 'id'>, imageFile?: File) => Promise<void>;
  updateGalleryItem: (galleryId: string, itemId: string, item: Partial<GalleryItem>, imageFile?: File) => Promise<void>;
  deleteGalleryItem: (galleryId: string, itemId: string) => Promise<void>;
  reorderGalleries: (galleries: Gallery[]) => Promise<void>;
  toggleCollapse: (galleryId: string) => void;
}

export const useGallerySync = (): UseGallerySyncReturn => {
  const { pageData, loading: pageLoading, refreshPage } = usePage();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pageLoading) return;

    if (!pageData.resources) {
      setGalleries([]);
      return;
    }

    setGalleries((prev) => {
      const prevMap = new Map(prev.map((g) => [g.id, g]));

      return pageData.resources
        .filter((resource) => resource.type === 'gallery' && resource.gallery_data)
        .map((resource) => {
          const galleryData = resource.gallery_data;
          const items = (galleryData?.items || []).map((item: any) => ({
            id: item.id,
            link: item.link_url || '',
            name: item.name || '',
            description: item.description || undefined,
            price: item.price ? Number(item.price) : undefined,
            buttonText: item.button_text || undefined,
            imageUrl: item.image_url || undefined,
            destaque: item.destaque || false,
            lottieAnimation: item.lottie_animation || undefined,
            displayOrder: item.display_order ?? undefined,
            enableSocialProof: item.enable_social_proof || false,
            customLikesCount: item.custom_likes_count || 0,
            customSharesCount: item.custom_shares_count || 0,
          }));

          const existing = prevMap.get(resource.id);

          return {
            id: resource.id,
            title: resource.title,
            galleryId: galleryData?.gallery?.id ?? null,
            items,
            collapsed: existing?.collapsed ?? false,
          };
        });
    });
  }, [pageData.resources, pageLoading]);

  const addGallery = useCallback(
    async (title: string): Promise<string | null> => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return null;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        // 1. Criar resource com display_order baseado no total de resources
        const totalResources = pageData.resources?.length || 0;
        const resource = await ResourceService.createResource(
          pageData.page.id,
          'gallery',
          title,
          totalResources
        );

        if (!resource) {
          throw new Error('Falha ao criar resource');
        }

        // 2. Criar gallery
        const gallery = await GalleryService.createGallery(resource.id);

        if (!gallery) {
          throw new Error('Falha ao criar galeria');
        }

        // 3. Atualizar estado local
        setGalleries((prev) => [
          ...prev,
          {
            id: resource.id,
            title,
            galleryId: gallery.id,
            items: [],
            collapsed: false,
          },
        ]);

        setSaveStatus('saved');
        setLastSaved(new Date());

        await refreshPage();
        return resource.id;
      } catch (error) {
        console.error('Error adding gallery:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao adicionar galeria');
        return null;
      }
    },
    [pageData.page, pageData.resources, refreshPage]
  );

  const updateGallery = useCallback(async (id: string, title: string) => {
    setSaveStatus('saving');
    setSaveError(null);

    try {
      // Atualizar título do resource
      await ResourceService.updateResource(id, { title });

      // Atualizar estado local
      setGalleries((prev) =>
        prev.map((g) => (g.id === id ? { ...g, title } : g))
      );

      setSaveStatus('saved');
      setLastSaved(new Date());

      await refreshPage();
    } catch (error) {
      console.error('Error updating gallery:', error);
      setSaveStatus('error');
      setSaveError('Erro ao atualizar galeria');
    }
  }, [refreshPage]);

  const deleteGallery = useCallback(async (id: string) => {
    setSaveStatus('saving');
    setSaveError(null);

    try {
      // Deletar resource (cascade deleta gallery e items)
      await ResourceService.deleteResource(id);

      // Atualizar estado local
      setGalleries((prev) => prev.filter((g) => g.id !== id));

      setSaveStatus('saved');
      setLastSaved(new Date());

      await refreshPage();
    } catch (error) {
      console.error('Error deleting gallery:', error);
      setSaveStatus('error');
      setSaveError('Erro ao deletar galeria');
    }
  }, [refreshPage]);

  const addGalleryItem = useCallback(
    async (galleryId: string, item: Omit<GalleryItem, 'id'>, imageFile?: File) => {
      if (!pageData.page) return;

      setSaveStatus('saving');
      setSaveError(null);

      try {
        let imageUrl = item.imageUrl || '';

        if (imageFile) {
          const uploadResult = await StorageService.uploadGalleryImage(
            pageData.page.user_id,
            pageData.page.id,
            imageFile
          );

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || 'Erro ao fazer upload da imagem');
          }

          imageUrl = uploadResult.url!;
        }

        const targetGallery = galleries.find((g) => g.id === galleryId);
        const actualGalleryId = targetGallery?.galleryId;

        if (!actualGalleryId) {
          throw new Error('Galeria não encontrada');
        }

        const newItem = await GalleryItemService.createGalleryItem(actualGalleryId, {
          name: item.name,
          image_url: imageUrl,
          link_url: item.link,
          description: item.description || null,
          price: item.price ? item.price.toString() : null,
          button_text: item.buttonText || null,
          display_order: targetGallery.items.length,
          destaque: item.destaque || false,
          lottie_animation: item.lottieAnimation || null,
          enable_social_proof: item.enableSocialProof || false,
          custom_likes_count: item.customLikesCount || 0,
          custom_shares_count: item.customSharesCount || 0,
        });

        if (!newItem) {
          throw new Error('Falha ao criar item da galeria');
        }

        setGalleries((prev) =>
          prev.map((g) =>
            g.id === galleryId
              ? {
                  ...g,
                  items: [
                    ...g.items,
                    {
                      id: newItem.id,
                      link: item.link,
                      name: item.name,
                      description: item.description,
                      price: item.price,
                      buttonText: item.buttonText,
                      imageUrl,
                      destaque: item.destaque,
                      lottieAnimation: item.lottieAnimation,
                      enableSocialProof: item.enableSocialProof,
                      customLikesCount: item.customLikesCount,
                      customSharesCount: item.customSharesCount,
                      displayOrder: targetGallery.items.length,
                    },
                  ],
                }
              : g
          )
        );

        setSaveStatus('saved');
        setLastSaved(new Date());

        await refreshPage();
      } catch (error) {
        console.error('Error adding gallery item:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao adicionar item');
      }
    },
    [pageData.page, galleries, refreshPage]
  );

  const updateGalleryItem = useCallback(
    async (galleryId: string, itemId: string, item: Partial<GalleryItem>, imageFile?: File) => {
      if (!pageData.page) return;

      setSaveStatus('saving');
      setSaveError(null);

      try {
        let imageUrl = item.imageUrl;

        // Se tiver novo arquivo de imagem, fazer upload
        if (imageFile) {
          const uploadResult = await StorageService.uploadGalleryImage(
            pageData.page.user_id,
            pageData.page.id,
            imageFile
          );

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || 'Erro ao fazer upload da imagem');
          }

          imageUrl = uploadResult.url!;
        }

        const targetGallery = galleries.find((g) => g.id === galleryId);
        const currentItem = targetGallery?.items.find((it) => it.id === itemId);
        const currentDisplayOrder = currentItem?.displayOrder ?? 0;
        const actualGalleryId = targetGallery?.galleryId;

        if (!actualGalleryId) {
          throw new Error('Galeria não encontrada');
        }

        const updateData = {
          name: item.name,
          image_url: imageUrl,
          link_url: item.link,
          description: item.description || null,
          price: item.price ? item.price.toString() : null,
          button_text: item.buttonText || null,
          destaque: item.destaque !== undefined ? item.destaque : false,
          display_order: currentDisplayOrder, // Preservar ordem original
          lottie_animation: item.lottieAnimation || null,
          enable_social_proof: item.enableSocialProof !== undefined ? item.enableSocialProof : false,
          custom_likes_count: item.customLikesCount || 0,
          custom_shares_count: item.customSharesCount || 0,
        };
        
        await GalleryItemService.updateGalleryItem(itemId, updateData);

        // Atualizar estado local
        setGalleries((prev) =>
          prev.map((g) =>
            g.id === galleryId
              ? {
                  ...g,
                  items: g.items.map((it) =>
                    it.id === itemId
                      ? {
                          ...it,
                          ...item,
                          imageUrl: imageUrl || it.imageUrl,
                          displayOrder: currentDisplayOrder,
                        }
                      : it
                  ),
                }
              : g
          )
        );

        setSaveStatus('saved');
        setLastSaved(new Date());

        await refreshPage();
      } catch (error) {
        console.error('Error updating gallery item:', error);
        setSaveStatus('error');
        setSaveError('Erro ao atualizar item');
      }
    },
    [pageData.page, galleries, refreshPage]
  );

  const deleteGalleryItem = useCallback(async (galleryId: string, itemId: string) => {
    setSaveStatus('saving');
    setSaveError(null);

    try {
      // Deletar item
      await GalleryItemService.deleteGalleryItem(itemId);

      // Atualizar estado local
      setGalleries((prev) =>
        prev.map((g) =>
          g.id === galleryId
            ? { ...g, items: g.items.filter((it) => it.id !== itemId) }
            : g
        )
      );

      setSaveStatus('saved');
      setLastSaved(new Date());

      await refreshPage();
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      setSaveStatus('error');
      setSaveError('Erro ao deletar item');
    }
  }, [refreshPage]);

  const reorderGalleries = useCallback(
    async (reorderedGalleries: Gallery[]) => {
      setSaveStatus('saving');
      setSaveError(null);

      try {
        // Atualizar display_order no banco
        const updates = reorderedGalleries.map((gallery, index) => ({
          id: gallery.id,
          display_order: index,
        }));

        const success = await ResourceService.reorderResources(updates);

        if (!success) {
          throw new Error('Falha ao reordenar galerias');
        }

        // Atualizar estado local
        setGalleries(reorderedGalleries);
        setSaveStatus('saved');
        setLastSaved(new Date());

        await refreshPage();
      } catch (error) {
        console.error('Error reordering galleries:', error);
        setSaveStatus('error');
        setSaveError('Erro ao reordenar galerias');
      }
    },
    [refreshPage]
  );

  const toggleCollapse = useCallback((galleryId: string) => {
    setGalleries((prev) =>
      prev.map((g) =>
        g.id === galleryId ? { ...g, collapsed: !g.collapsed } : g
      )
    );
  }, []);

  return {
    galleries,
    loading: pageLoading || loading,
    saveStatus,
    lastSaved,
    saveError,
    addGallery,
    updateGallery,
    deleteGallery,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    reorderGalleries,
    toggleCollapse,
  };
};
