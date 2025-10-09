import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DashboardService,
  PageSettingsService,
  SocialNetworkService,
} from '@/services/supabaseService';
import type { Page, PageSettings } from '@/services/supabaseService';

export interface PageData {
  page: Page | null;
  settings: PageSettings | null;
  resources: any[];
  socials: Record<string, string>;
  socialsDisplayMode: 'top' | 'bottom';
  username: string | null;
}

export interface UsePageReturn {
  pageData: PageData;
  loading: boolean;
  error: string | null;
  refreshPage: () => Promise<void>;
  updateSettings: (settings: Partial<PageSettings>) => Promise<boolean>;
  saveSocials: (socials: Record<string, string>, displayMode: 'top' | 'bottom') => Promise<boolean>;
}

const PageContext = createContext<UsePageReturn | undefined>(undefined);

const useProvidePage = (): UsePageReturn => {
  const { user } = useAuth();
  const [pageData, setPageData] = useState<PageData>({
    page: null,
    settings: null,
    resources: [],
    socials: {},
    socialsDisplayMode: 'bottom',
    username: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const loadPage = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Uma única chamada para buscar todos os dados
      const dashboardData = await DashboardService.getDashboardData(user.id);

      if (!dashboardData) {
        throw new Error('Não foi possível carregar os dados');
      }

      // Processar redes sociais
      const socials: Record<string, string> = {};
      let displayMode: 'top' | 'bottom' = 'bottom';

      dashboardData.social_networks?.forEach((sn) => {
        socials[sn.platform] = sn.url;
        displayMode = sn.display_mode;
      });

      setPageData({
        page: dashboardData.page,
        settings: dashboardData.settings,
        resources: dashboardData.resources || [],
        socials,
        socialsDisplayMode: displayMode,
        username: dashboardData.username,
      });
    } catch (err) {
      console.error('Error loading page:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar página');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Evitar chamadas duplicadas: só carrega se user mudou e ainda não carregou para este user
    if (user?.id && user.id !== lastUserIdRef.current) {
      lastUserIdRef.current = user.id;
      loadedRef.current = false;
    }
    
    if (user && !loadedRef.current) {
      loadedRef.current = true;
      loadPage();
    } else if (!user) {
      // Reset quando user faz logout
      loadedRef.current = false;
      lastUserIdRef.current = null;
      setLoading(false);
    }
  }, [user?.id, loadPage]);

  const refreshPage = useCallback(async () => {
    await loadPage();
  }, [loadPage]);

  const updateSettings = useCallback(
    async (updates: Partial<PageSettings>): Promise<boolean> => {
      if (!pageData.page) return false;

      const success = await PageSettingsService.updateSettings(pageData.page.id, updates);

      if (success) {
        setPageData((prev) => ({
          ...prev,
          settings: prev.settings ? { ...prev.settings, ...updates } : null,
        }));
      }

      return success;
    },
    [pageData.page]
  );

  const saveSocials = useCallback(
    async (socials: Record<string, string>, displayMode: 'top' | 'bottom'): Promise<boolean> => {
      if (!pageData.page) return false;

      const networks = Object.entries(socials)
        .filter(([_, url]) => url.trim())
        .map(([platform, url]) => ({ platform, url }));

      const success = await SocialNetworkService.upsertSocialNetworks(
        pageData.page.id,
        networks,
        displayMode
      );

      if (success) {
        setPageData((prev) => ({
          ...prev,
          socials,
          socialsDisplayMode: displayMode,
        }));
      }

      return success;
    },
    [pageData.page]
  );

  return useMemo(
    () => ({
      pageData,
      loading,
      error,
      refreshPage,
      updateSettings,
      saveSocials,
    }),
    [pageData, loading, error, refreshPage, updateSettings, saveSocials]
  );
};

export const PageProvider = ({ children }: { children: ReactNode }) => {
  const value = useProvidePage();
  return createElement(PageContext.Provider, { value }, children as ReactNode);
};

export const usePage = (): UsePageReturn => {
  const context = useContext(PageContext);

  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }

  return context;
};