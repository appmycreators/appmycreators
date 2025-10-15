import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage } from './usePage';
import { PageSettingsService } from '@/services/supabaseService';
import { StorageService } from '@/services/storageService';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type HeaderMediaAspectRatio = '1:1' | '4:5' | '16:9' | '9:16';

interface UseHeaderSyncReturn {
  profileName: string;
  bio: string;
  avatarUrl: string;
  avatarBorderColor: string;
  headerMediaUrl: string;
  headerMediaType: string;
  headerMediaAspectRatio: HeaderMediaAspectRatio | null;
  showBadge: boolean;
  nitroAnimationUrl: string;
  loading: boolean;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  saveError: string | null;
  updateProfileName: (name: string) => Promise<void>;
  updateBio: (bio: string) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  updateAvatarBorderColor: (color: string) => Promise<void>;
  updateHeaderMedia: (file: File, aspectRatio?: HeaderMediaAspectRatio) => Promise<void>;
  removeHeaderMedia: () => Promise<void>;
  updateShowBadge: (show: boolean) => Promise<void>;
  updateNitroAnimation: (url: string) => Promise<void>;
}

export const useHeaderSync = (): UseHeaderSyncReturn => {
  const { pageData, loading: pageLoading } = usePage();
  const [profileName, setProfileName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarBorderColor, setAvatarBorderColor] = useState<string>('#ffffff');
  const [headerMediaUrl, setHeaderMediaUrl] = useState<string>('');
  const [headerMediaType, setHeaderMediaType] = useState<string>('');
  const [headerMediaAspectRatio, setHeaderMediaAspectRatio] = useState<HeaderMediaAspectRatio | null>(null);
  const [showBadge, setShowBadge] = useState<boolean>(false);
  const [nitroAnimationUrl, setNitroAnimationUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  // Carregar informações do header usando dados já carregados do usePage
  useEffect(() => {
    if (!pageData.settings || pageLoading || loadedRef.current) return;

    loadedRef.current = true;
    const settings = pageData.settings;

    setProfileName(settings.profile_name || '');
    setBio(settings.bio || '');
    setAvatarUrl(settings.avatar_url || '');
    setAvatarBorderColor(settings.avatar_border_color || '#ffffff');
    setHeaderMediaUrl(settings.header_media_url || '');
    setHeaderMediaType(settings.header_media_type || '');
    setHeaderMediaAspectRatio(settings.header_media_aspect_ratio || null);
    setShowBadge(settings.show_badge_check ?? false);
    setNitroAnimationUrl(settings.nitro_animation_url || '');
  }, [pageData.settings, pageLoading]);

  const updateProfileName = useCallback(
    async (name: string) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          profile_name: name,
        });

        if (!success) {
          throw new Error('Falha ao salvar nome do perfil');
        }

        setProfileName(name);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating profile name:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar nome');
      }
    },
    [pageData.page]
  );

  const updateBio = useCallback(
    async (newBio: string) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          bio: newBio,
        });

        if (!success) {
          throw new Error('Falha ao salvar bio');
        }

        setBio(newBio);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating bio:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar bio');
      }
    },
    [pageData.page]
  );

  const updateAvatar = useCallback(
    async (file: File) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        // Upload da imagem para o Storage
        const uploadResult = await StorageService.uploadAvatar(
          pageData.page.user_id,
          file
        );

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || 'Erro ao fazer upload do avatar');
        }

        // Salvar URL no banco
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          avatar_url: uploadResult.url,
        });

        if (!success) {
          throw new Error('Falha ao salvar avatar');
        }

        setAvatarUrl(uploadResult.url);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating avatar:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao fazer upload do avatar');
      }
    },
    [pageData.page]
  );

  const updateHeaderMedia = useCallback(
    async (file: File, aspectRatio?: HeaderMediaAspectRatio) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        // Detectar tipo de arquivo
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        let mediaType: 'image' | 'video' | 'gif' = 'image';
        
        if (['png', 'jpg', 'jpeg'].includes(fileExtension)) {
          mediaType = 'image';
        } else if (['gif'].includes(fileExtension)) {
          mediaType = 'gif';
        } else if (['mp4', 'mov', 'mpg', 'mpeg'].includes(fileExtension)) {
          mediaType = 'video';
        }

        // Upload da mídia para o Storage
        const uploadResult = await StorageService.uploadHeaderMedia(
          pageData.page.user_id,
          file
        );

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || 'Erro ao fazer upload da mídia');
        }

        // Salvar URL, tipo e proporção no banco
        const updateData: any = {
          header_media_url: uploadResult.url,
          header_media_type: mediaType,
        };
        
        if (aspectRatio) {
          updateData.header_media_aspect_ratio = aspectRatio;
        }

        const success = await PageSettingsService.updateSettings(pageData.page.id, updateData);

        if (!success) {
          throw new Error('Falha ao salvar mídia de topo');
        }

        setHeaderMediaUrl(uploadResult.url);
        setHeaderMediaType(mediaType);
        if (aspectRatio) {
          setHeaderMediaAspectRatio(aspectRatio);
        }
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating header media:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao fazer upload da mídia');
      }
    },
    [pageData.page]
  );

  const removeHeaderMedia = useCallback(
    async () => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        // Limpar campos no banco
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          header_media_url: null,
          header_media_type: null,
          header_media_aspect_ratio: null,
        });

        if (!success) {
          throw new Error('Falha ao remover mídia de topo');
        }

        setHeaderMediaUrl('');
        setHeaderMediaType('');
        setHeaderMediaAspectRatio(null);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error removing header media:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao remover mídia');
      }
    },
    [pageData.page]
  );

  const updateShowBadge = useCallback(
    async (show: boolean) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          show_badge_check: show,
        });

        if (!success) {
          throw new Error('Falha ao salvar configuração do badge');
        }

        setShowBadge(show);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating show badge:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar badge');
      }
    },
    [pageData.page]
  );

  const updateAvatarBorderColor = useCallback(
    async (color: string) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          avatar_border_color: color,
        });

        if (!success) {
          throw new Error('Falha ao salvar cor da borda do avatar');
        }

        setAvatarBorderColor(color);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating avatar border color:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar cor da borda');
      }
    },
    [pageData.page]
  );

  const updateNitroAnimation = useCallback(
    async (url: string) => {
      if (!pageData.page) {
        console.error('pageData.page não disponível');
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      try {
        const success = await PageSettingsService.updateSettings(pageData.page.id, {
          nitro_animation_url: url || null,
        });

        if (!success) {
          throw new Error('Falha ao salvar animação Nitro');
        }

        setNitroAnimationUrl(url);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating nitro animation:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar animação Nitro');
      }
    },
    [pageData.page]
  );

  return {
    profileName,
    bio,
    avatarUrl,
    avatarBorderColor,
    headerMediaUrl,
    headerMediaType,
    headerMediaAspectRatio,
    showBadge,
    nitroAnimationUrl,
    loading: pageLoading || loading,
    saveStatus,
    lastSaved,
    saveError,
    updateProfileName,
    updateBio,
    updateAvatar,
    updateAvatarBorderColor,
    updateHeaderMedia,
    removeHeaderMedia,
    updateShowBadge,
    updateNitroAnimation,
  };
};
