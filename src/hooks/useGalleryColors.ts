import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage } from './usePage';
import { PageSettingsService } from '@/services/supabaseService';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseGalleryColorsReturn {
  galleryTitleColor: string | null;
  galleryContainerBgColor: string | null;
  galleryCardBgColor: string | null;
  galleryProductNameColor: string | null;
  galleryProductDescriptionColor: string | null;
  galleryButtonBgColor: string | null;
  galleryButtonTextColor: string | null;
  galleryPriceColor: string | null;
  galleryHighlightBgColor: string | null;
  galleryHighlightTextColor: string | null;
  loading: boolean;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  saveError: string | null;
  updateGalleryTitleColor: (color: string) => Promise<void>;
  updateGalleryContainerBgColor: (color: string) => Promise<void>;
  updateGalleryCardBgColor: (color: string) => Promise<void>;
  updateGalleryProductNameColor: (color: string) => Promise<void>;
  updateGalleryProductDescriptionColor: (color: string) => Promise<void>;
  updateGalleryButtonBgColor: (color: string) => Promise<void>;
  updateGalleryButtonTextColor: (color: string) => Promise<void>;
  updateGalleryPriceColor: (color: string) => Promise<void>;
  updateGalleryHighlightBgColor: (color: string) => Promise<void>;
  updateGalleryHighlightTextColor: (color: string) => Promise<void>;
}

export const useGalleryColors = (): UseGalleryColorsReturn => {
  const { pageData, loading: pageLoading } = usePage();
  const [galleryTitleColor, setGalleryTitleColor] = useState<string | null>(null);
  const [galleryContainerBgColor, setGalleryContainerBgColor] = useState<string | null>(null);
  const [galleryCardBgColor, setGalleryCardBgColor] = useState<string | null>(null);
  const [galleryProductNameColor, setGalleryProductNameColor] = useState<string | null>(null);
  const [galleryProductDescriptionColor, setGalleryProductDescriptionColor] = useState<string | null>(null);
  const [galleryButtonBgColor, setGalleryButtonBgColor] = useState<string | null>(null);
  const [galleryButtonTextColor, setGalleryButtonTextColor] = useState<string | null>(null);
  const [galleryPriceColor, setGalleryPriceColor] = useState<string | null>(null);
  const [galleryHighlightBgColor, setGalleryHighlightBgColor] = useState<string | null>(null);
  const [galleryHighlightTextColor, setGalleryHighlightTextColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  // Carregar configurações da galeria usando dados já carregados do usePage
  useEffect(() => {
    if (!pageData.settings || pageLoading || loadedRef.current) return;

    loadedRef.current = true;
    const settings = pageData.settings;

    setGalleryTitleColor(settings.gallery_title_color || null);
    setGalleryContainerBgColor(settings.gallery_container_bg_color || null);
    setGalleryCardBgColor(settings.gallery_card_bg_color || null);
    setGalleryProductNameColor(settings.gallery_product_name_color || null);
    setGalleryProductDescriptionColor(settings.gallery_product_description_color || null);
    setGalleryButtonBgColor(settings.gallery_button_bg_color || null);
    setGalleryButtonTextColor(settings.gallery_button_text_color || null);
    setGalleryPriceColor(settings.gallery_price_color || null);
    setGalleryHighlightBgColor(settings.gallery_highlight_bg_color || null);
    setGalleryHighlightTextColor(settings.gallery_highlight_text_color || null);
  }, [pageData.settings, pageLoading]);

  const updateGalleryTitleColor = useCallback(
    async (color: string) => {
      if (!pageData.page) return;

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          gallery_title_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor do título');
        }

        setGalleryTitleColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating gallery title color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar');
      }
    },
    [pageData.page]
  );

  const updateGalleryContainerBgColor = useCallback(
    async (color: string) => {
      if (!pageData.page) return;

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          gallery_container_bg_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor de fundo da lista de produtos');
        }

        setGalleryContainerBgColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating gallery container bg color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar');
      }
    },
    [pageData.page]
  );

  const updateGalleryCardBgColor = useCallback(
    async (color: string) => {
      if (!pageData.page) return;

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          gallery_card_bg_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor de fundo do card');
        }

        setGalleryCardBgColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating gallery card bg color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar');
      }
    },
    [pageData.page]
  );

  const updateGalleryProductNameColor = useCallback(
    async (color: string) => {
      if (!pageData.page) return;

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          gallery_product_name_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor do nome do produto');
        }

        setGalleryProductNameColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating product name color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar');
      }
    },
    [pageData.page]
  );

  const updateGalleryProductDescriptionColor = useCallback(
    async (color: string) => {
      if (!pageData.page) return;

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          gallery_product_description_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor da descrição');
        }

        setGalleryProductDescriptionColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating description color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar');
      }
    },
    [pageData.page]
  );

  const updateGalleryButtonBgColor = useCallback(
    async (color: string) => {
      if (!pageData.page) return;

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          gallery_button_bg_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor do botão');
        }

        setGalleryButtonBgColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating button bg color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar');
      }
    },
    [pageData.page]
  );

  const updateGalleryButtonTextColor = useCallback(
    async (color: string) => {
      if (!pageData.page) return;

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          gallery_button_text_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor do texto do botão');
        }

        setGalleryButtonTextColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating button text color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar');
      }
    },
    [pageData.page]
  );

  const updateGalleryPriceColor = useCallback(
    async (color: string) => {
      if (!pageData.page) return;

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          gallery_price_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor do preço');
        }

        setGalleryPriceColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating price color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar');
      }
    },
    [pageData.page]
  );

  const updateGalleryHighlightBgColor = useCallback(
    async (color: string) => {
      if (!pageData.page) return;

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          gallery_highlight_bg_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor de fundo do destaque');
        }

        setGalleryHighlightBgColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating highlight bg color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar');
      }
    },
    [pageData.page]
  );

  const updateGalleryHighlightTextColor = useCallback(
    async (color: string) => {
      if (!pageData.page) return;

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          gallery_highlight_text_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor do texto do destaque');
        }

        setGalleryHighlightTextColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating highlight text color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar');
      }
    },
    [pageData.page]
  );

  return {
    galleryTitleColor,
    galleryContainerBgColor,
    galleryCardBgColor,
    galleryProductNameColor,
    galleryProductDescriptionColor,
    galleryButtonBgColor,
    galleryButtonTextColor,
    galleryPriceColor,
    galleryHighlightBgColor,
    galleryHighlightTextColor,
    loading: pageLoading || loading,
    saveStatus,
    lastSaved,
    saveError,
    updateGalleryTitleColor,
    updateGalleryContainerBgColor,
    updateGalleryCardBgColor,
    updateGalleryProductNameColor,
    updateGalleryProductDescriptionColor,
    updateGalleryButtonBgColor,
    updateGalleryButtonTextColor,
    updateGalleryPriceColor,
    updateGalleryHighlightBgColor,
    updateGalleryHighlightTextColor,
  };
};
