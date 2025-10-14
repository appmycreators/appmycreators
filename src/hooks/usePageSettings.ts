import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage } from './usePage';
import { PageSettingsService } from '@/services/supabaseService';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface PageSettings {
  backgroundColor?: string;
  backgroundGradient?: string;
  theme?: string;
  whatsapp_floating_enabled?: boolean;
  whatsapp_floating_phone?: string;
  whatsapp_floating_message?: string;
}

interface UsePageSettingsReturn {
  backgroundColor: string;
  backgroundGradient: string | null;
  theme: string;
  cardBgColor: string | null;
  cardTextColor: string | null;
  headerNameColor: string | null;
  headerBioColor: string | null;
  socialIconBgColor: string | null;
  socialIconColor: string | null;
  whatsappFloatingEnabled: boolean;
  whatsappFloatingPhone: string | null;
  whatsappFloatingMessage: string | null;
  loading: boolean;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  saveError: string | null;
  updateBackgroundColor: (color: string) => Promise<void>;
  updateTheme: (theme: string) => Promise<void>;
  updateCardBgColor: (color: string) => Promise<void>;
  updateCardTextColor: (color: string) => Promise<void>;
  updateHeaderNameColor: (color: string) => Promise<void>;
  updateHeaderBioColor: (color: string) => Promise<void>;
  updateSocialIconBgColor: (color: string) => Promise<void>;
  updateSocialIconColor: (color: string) => Promise<void>;
  updateWhatsAppFloating: (config: { enabled: boolean; phone: string; message: string }) => Promise<void>;
}

export const usePageSettings = (): UsePageSettingsReturn => {
  const { pageData, loading: pageLoading } = usePage();
  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [backgroundGradient, setBackgroundGradient] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>('light');
  const [cardBgColor, setCardBgColor] = useState<string | null>(null);
  const [cardTextColor, setCardTextColor] = useState<string | null>(null);
  const [headerNameColor, setHeaderNameColor] = useState<string | null>(null);
  const [headerBioColor, setHeaderBioColor] = useState<string | null>(null);
  const [socialIconBgColor, setSocialIconBgColor] = useState<string | null>(null);
  const [socialIconColor, setSocialIconColor] = useState<string | null>(null);
  const [whatsappFloatingEnabled, setWhatsappFloatingEnabled] = useState<boolean>(false);
  const [whatsappFloatingPhone, setWhatsappFloatingPhone] = useState<string | null>(null);
  const [whatsappFloatingMessage, setWhatsappFloatingMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  // Carregar configurações da página usando dados já carregados do usePage
  useEffect(() => {
    if (!pageData.settings || pageLoading || loadedRef.current) return;

    loadedRef.current = true;
    const settings = pageData.settings;

    setBackgroundColor(settings.background_color || '');
    setBackgroundGradient(settings.background_gradient || null);
    setTheme(settings.theme || 'light');
    setCardBgColor(settings.card_bg_color || null);
    setCardTextColor(settings.card_text_color || null);
    setHeaderNameColor(settings.header_name_color || null);
    setHeaderBioColor(settings.header_bio_color || null);
    setSocialIconBgColor(settings.social_icon_bg_color || null);
    setSocialIconColor(settings.social_icon_color || null);
    setWhatsappFloatingEnabled((settings as any).whatsapp_floating_enabled || false);
    setWhatsappFloatingPhone((settings as any).whatsapp_floating_phone || null);
    setWhatsappFloatingMessage((settings as any).whatsapp_floating_message || null);
  }, [pageData.settings, pageLoading]);

  const updateBackgroundColor = useCallback(
    async (color: string) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          background_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor de fundo');
        }

        setBackgroundColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating background color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar cor de fundo');
      }
    },
    [pageData.page]
  );

  const updateTheme = useCallback(
    async (newTheme: string) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          theme: newTheme,
        });

        if (!success) {
          throw new Error('Falha ao salvar tema');
        }

        setTheme(newTheme);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating theme:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar tema');
      }
    },
    [pageData.page]
  );

  const updateCardBgColor = useCallback(
    async (color: string) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          card_bg_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor de fundo dos cards');
        }

        setCardBgColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating card bg color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar cor dos cards');
      }
    },
    [pageData.page]
  );

  const updateCardTextColor = useCallback(
    async (color: string) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          card_text_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor do texto dos cards');
        }

        setCardTextColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating card text color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar cor do texto');
      }
    },
    [pageData.page]
  );

  const updateHeaderNameColor = useCallback(
    async (color: string) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          header_name_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor do nome do cabeçalho');
        }

        setHeaderNameColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating header name color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar cor do nome');
      }
    },
    [pageData.page]
  );

  const updateHeaderBioColor = useCallback(
    async (color: string) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          header_bio_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor da bio do cabeçalho');
        }

        setHeaderBioColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating header bio color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar cor da bio');
      }
    },
    [pageData.page]
  );

  const updateSocialIconBgColor = useCallback(
    async (color: string) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          social_icon_bg_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor de fundo dos ícones sociais');
        }

        setSocialIconBgColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating social icon bg color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar cor de fundo');
      }
    },
    [pageData.page]
  );

  const updateSocialIconColor = useCallback(
    async (color: string) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          social_icon_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor dos ícones sociais');
        }

        setSocialIconColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating social icon color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar cor dos ícones');
      }
    },
    [pageData.page]
  );

  const updateWhatsAppFloating = useCallback(
    async (config: { enabled: boolean; phone: string; message: string }) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          whatsapp_floating_enabled: config.enabled,
          whatsapp_floating_phone: config.phone,
          whatsapp_floating_message: config.message,
        } as any);

        if (!success) {
          throw new Error('Falha ao salvar configurações do WhatsApp');
        }

        setWhatsappFloatingEnabled(config.enabled);
        setWhatsappFloatingPhone(config.phone);
        setWhatsappFloatingMessage(config.message);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating WhatsApp floating button:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar WhatsApp');
      }
    },
    [pageData.page]
  );

  return {
    backgroundColor,
    backgroundGradient,
    theme,
    cardBgColor,
    cardTextColor,
    headerNameColor,
    headerBioColor,
    socialIconBgColor,
    socialIconColor,
    whatsappFloatingEnabled,
    whatsappFloatingPhone,
    whatsappFloatingMessage,
    loading: pageLoading || loading,
    saveStatus,
    lastSaved,
    saveError,
    updateBackgroundColor,
    updateTheme,
    updateCardBgColor,
    updateCardTextColor,
    updateHeaderNameColor,
    updateHeaderBioColor,
    updateSocialIconBgColor,
    updateSocialIconColor,
    updateWhatsAppFloating,
  };
};
