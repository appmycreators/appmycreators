import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage } from './usePage';
import { PageSettingsService } from '@/services/supabaseService';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseFontSettingsReturn {
  fontFamily: string;
  saveStatus: SaveStatus;
  saveError: string | null;
  updateFontFamily: (fontFamily: string) => Promise<void>;
}

export const useFontSettings = (): UseFontSettingsReturn => {
  const { pageData, loading: pageLoading } = usePage();
  const [fontFamily, setFontFamily] = useState<string>('Poppins'); // Fonte padrão
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Carrega a fonte atual quando os dados da página são carregados
  useEffect(() => {
    if (!pageLoading && pageData?.settings) {
      setFontFamily(pageData.settings.font_family || 'Poppins');
    }
  }, [pageData, pageLoading]);

  // Função para atualizar a fonte com debounce
  const updateFontFamily = useCallback(
    async (newFontFamily: string) => {
      if (!pageData?.page) return;

      // Limpa o timeout anterior
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Atualiza o estado local imediatamente
      setFontFamily(newFontFamily);
      setSaveStatus('saving');
      setSaveError(null);

      // Debounce de 300ms para salvar no banco
      debounceRef.current = setTimeout(async () => {
        try {
          const success = await PageSettingsService.updateSettings(pageData.page.id, {
            font_family: newFontFamily,
          });

          if (success) {
            setSaveStatus('saved');
            // Volta para idle após 2 segundos
            setTimeout(() => setSaveStatus('idle'), 2000);
          } else {
            throw new Error('Falha ao salvar fonte');
          }
        } catch (error) {
          console.error('Erro ao salvar fonte:', error);
          setSaveStatus('error');
          setSaveError(error instanceof Error ? error.message : 'Erro desconhecido');
        }
      }, 300);
    },
    [pageData]
  );

  // Cleanup do debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    fontFamily,
    saveStatus,
    saveError,
    updateFontFamily,
  };
};
