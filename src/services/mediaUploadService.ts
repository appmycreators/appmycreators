// ============================================
// MEDIA UPLOAD SERVICE - Upload de mídias para Flows
// ============================================

import { supabase } from '@/lib/supabase';

export type MediaType = 'image' | 'video' | 'audio';

interface UploadResult {
  url: string;
  path: string;
}

export const mediaUploadService = {
  /**
   * Upload de arquivo de mídia para o bucket media_flow
   */
  async uploadMedia(file: File, mediaType: MediaType, flowId: string): Promise<UploadResult> {
    try {
      // Validar tipo de arquivo
      const allowedTypes = this.getAllowedTypes(mediaType);
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`);
      }

      // Validar tamanho (50MB para vídeo, 10MB para outros)
      const maxSize = mediaType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`);
      }

      // Gerar nome único do arquivo
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${flowId}/${mediaType}/${timestamp}.${extension}`;

      // Upload para o Storage
      const { data, error } = await supabase.storage
        .from('media_flow')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('media_flow')
        .getPublicUrl(data.path);

      return {
        url: publicUrl,
        path: data.path,
      };
    } catch (error: any) {
      console.error('Erro ao fazer upload de mídia:', error);
      throw new Error(error.message || 'Erro ao fazer upload');
    }
  },

  /**
   * Deletar mídia do storage
   */
  async deleteMedia(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('media_flow')
        .remove([path]);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao deletar mídia:', error);
      throw new Error(error.message || 'Erro ao deletar mídia');
    }
  },

  /**
   * Tipos MIME permitidos por tipo de mídia
   */
  getAllowedTypes(mediaType: MediaType): string[] {
    switch (mediaType) {
      case 'image':
        return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      case 'video':
        return ['video/mp4', 'video/webm', 'video/ogg'];
      case 'audio':
        return ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
      default:
        return [];
    }
  },

  /**
   * Formatar extensões permitidas para exibição
   */
  getAllowedExtensions(mediaType: MediaType): string {
    switch (mediaType) {
      case 'image':
        return '.jpg,.jpeg,.png,.gif,.webp';
      case 'video':
        return '.mp4,.webm,.ogv';
      case 'audio':
        return '.mp3,.wav,.ogg';
      default:
        return '';
    }
  },
};
