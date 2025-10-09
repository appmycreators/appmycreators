import { useState, useEffect, useCallback } from 'react';
import { usePage } from './usePage';
import { SocialNetworkService } from '@/services/supabaseService';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SocialNetworks {
  [key: string]: string;
}

interface UseSocialSyncReturn {
  socials: SocialNetworks;
  socialsDisplayMode: 'top' | 'bottom';
  loading: boolean;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  saveError: string | null;
  updateSocials: (socials: SocialNetworks, displayMode: 'top' | 'bottom') => Promise<void>;
  deleteAllSocials: () => Promise<void>;
}

export const useSocialSync = (): UseSocialSyncReturn => {
  const { pageData, loading: pageLoading, refreshPage } = usePage();
  const [socials, setSocials] = useState<SocialNetworks>({});
  const [socialsDisplayMode, setSocialsDisplayMode] = useState<'top' | 'bottom'>('bottom');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  useEffect(() => {
    if (pageLoading) return;

    setSocials({ ...pageData.socials });
    setSocialsDisplayMode(pageData.socialsDisplayMode);
  }, [pageData.socials, pageData.socialsDisplayMode, pageLoading]);

  const updateSocials = useCallback(
    async (newSocials: SocialNetworks, displayMode: 'top' | 'bottom') => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        // Converter objeto para array
        const networksArray = Object.entries(newSocials)
          .filter(([_, url]) => url && url.trim() !== '')
          .map(([platform, url]) => ({ platform, url }));

        // Salvar no Supabase
        const success = await SocialNetworkService.upsertSocialNetworks(
          pageData.page.id,
          networksArray,
          displayMode
        );

        if (!success) {
          throw new Error('Falha ao salvar redes sociais');
        }

        // Atualizar estado local
        setSocials(newSocials);
        setSocialsDisplayMode(displayMode);

        setSaveStatus('saved');
        setLastSaved(new Date());

        await refreshPage();
      } catch (error) {
        console.error('Error updating social networks:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar redes sociais');
      }
    },
    [pageData.page, refreshPage]
  );

  const deleteAllSocials = useCallback(async () => {
    if (!pageData.page) {
      console.error('pageData.page não disponível');
      return;
    }

    setSaveStatus('saving');
    setSaveError(null);

    try {
      const success = await SocialNetworkService.deleteAllSocialNetworks(pageData.page.id);

      if (!success) {
        throw new Error('Falha ao deletar redes sociais');
      }

      // Limpar estado local
      setSocials({});
      setSocialsDisplayMode('bottom');

      setSaveStatus('saved');
      setLastSaved(new Date());

      await refreshPage();
    } catch (error) {
      console.error('Error deleting social networks:', error);
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Erro ao deletar redes sociais');
    }
  }, [pageData.page, refreshPage]);

  return {
    socials,
    socialsDisplayMode,
    loading: pageLoading || loading,
    saveStatus,
    lastSaved,
    saveError,
    updateSocials,
    deleteAllSocials,
  };
};
