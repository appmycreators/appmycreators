import { supabase } from '@/lib/supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export const StorageService = {
  /**
   * Upload de avatar do usuário
   */
  async uploadAvatar(userId: string, file: File): Promise<UploadResult> {
    try {
      // Validar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Tipo de arquivo inválido. Use JPEG, PNG, GIF ou WebP',
        };
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: 'Arquivo muito grande. Máximo 5MB',
        };
      }

      // Gerar nome único
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true, // Sobrescrever se já existir
          contentType: file.type,
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return {
        success: true,
        url: urlData.publicUrl,
        path: fileName,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'Erro ao fazer upload',
      };
    }
  },

  /**
   * Upload de mídia de cabeçalho (imagem ou vídeo de topo)
   */
  async uploadHeaderMedia(userId: string, file: File): Promise<UploadResult> {
    try {
      // Validar tipo de arquivo
      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/quicktime', // MOV
        'video/mpeg', // MPG
      ];
      if (!validTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Tipo de arquivo inválido. Use PNG, JPG, MP4, MOV ou MPG',
        };
      }

      // Validar tamanho (50MB para vídeo, 10MB para imagem)
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      
      if (file.size > maxSize) {
        return {
          success: false,
          error: `Arquivo muito grande. Máximo ${isVideo ? '50MB para vídeo' : '10MB para imagem'}`,
        };
      }

      // Gerar nome único
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${userId}/header_media_${timestamp}.${fileExt}`;

      // Upload
      const { data, error } = await supabase.storage
        .from('banners')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);

      return {
        success: true,
        url: urlData.publicUrl,
        path: fileName,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'Erro ao fazer upload',
      };
    }
  },

  /**
   * Upload de banner/header
   */
  async uploadBanner(userId: string, file: File): Promise<UploadResult> {
    try {
      // Validar tipo de arquivo
      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
      ];
      if (!validTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Tipo de arquivo inválido',
        };
      }

      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return {
          success: false,
          error: 'Arquivo muito grande. Máximo 10MB',
        };
      }

      // Gerar nome único
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${userId}/header_${timestamp}.${fileExt}`;

      // Upload
      const { data, error } = await supabase.storage
        .from('banners')
        .upload(fileName, file, {
          contentType: file.type,
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);

      return {
        success: true,
        url: urlData.publicUrl,
        path: fileName,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'Erro ao fazer upload',
      };
    }
  },

  /**
   * Upload de imagem de galeria/produto
   */
  async uploadGalleryImage(userId: string, pageId: string, file: File): Promise<UploadResult> {
    try {
      // Validar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Tipo de arquivo inválido. Use JPEG, PNG, GIF ou WebP',
        };
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: 'Arquivo muito grande. Máximo 5MB',
        };
      }

      // Gerar nome único
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${userId}/${pageId}/item_${timestamp}.${fileExt}`;

      // Upload
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(fileName, file, {
          contentType: file.type,
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      return {
        success: true,
        url: urlData.publicUrl,
        path: fileName,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'Erro ao fazer upload',
      };
    }
  },

  /**
   * Deletar arquivo
   */
  async deleteFile(bucket: 'avatars' | 'banners' | 'gallery', path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  },

  /**
   * Listar arquivos de um usuário
   */
  async listUserFiles(
    bucket: 'avatars' | 'banners' | 'gallery',
    userId: string
  ): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(userId);

      if (error) {
        console.error('List error:', error);
        return [];
      }

      return data?.map((file) => `${userId}/${file.name}`) || [];
    } catch (error) {
      console.error('List error:', error);
      return [];
    }
  },

  /**
   * Obter URL pública
   */
  getPublicUrl(bucket: 'avatars' | 'banners' | 'gallery', path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Comprimir imagem antes do upload (opcional)
   */
  async compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Redimensionar se necessário
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Erro ao comprimir imagem'));
              }
            },
            file.type,
            quality
          );
        };
        
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    });
  },
};
