import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Hook para buscar comentários de um produto da galeria
 * Usa React Query para cache automático
 */

export interface GalleryComment {
  id: string;
  author_name: string;
  author_avatar_url: string | null;
  comment_text: string;
  rating: number | null;
  is_highlighted: boolean;
  created_at: string;
  time_ago: string;
}

// =====================================================
// 1. HOOK PARA BUSCAR COMENTÁRIOS (COM CACHE)
// =====================================================

export function useGalleryItemComments(galleryItemId: string | null, limit: number = 10) {
  return useQuery({
    queryKey: ['gallery-comments', galleryItemId, limit],
    queryFn: async () => {
      if (!galleryItemId) {
        return { comments: [], total: 0 };
      }

      console.log('🔍 Buscando comentários para:', galleryItemId);

      // Buscar comentários e contagem em paralelo
      const [commentsRes, countRes] = await Promise.all([
        supabase.rpc('get_gallery_item_comments', {
          p_gallery_item_id: galleryItemId,
          p_limit: limit,
          p_offset: 0
        }),
        supabase.rpc('count_gallery_item_comments', {
          p_gallery_item_id: galleryItemId
        })
      ]);

      if (commentsRes.error) throw commentsRes.error;
      if (countRes.error) throw countRes.error;

      console.log('✅ Comentários carregados:', {
        total: countRes.data,
        exibindo: (commentsRes.data || []).length
      });

      return {
        comments: (commentsRes.data || []) as GalleryComment[],
        total: (countRes.data || 0) as number
      };
    },
    enabled: !!galleryItemId,
    staleTime: 1000 * 60 * 10, // Cache de 10 minutos (aumentado)
    gcTime: 1000 * 60 * 15, // Garbage collection após 15 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Não refetch ao montar se já tem cache
    refetchOnReconnect: false, // Não refetch ao reconectar
  });
}

// =====================================================
// 2. HOOK PARA ADICIONAR COMENTÁRIO
// =====================================================

interface AddCommentParams {
  galleryItemId: string;
  authorName: string;
  commentText: string;
  rating?: number;
  avatarUrl?: string;
}

export function useAddGalleryComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddCommentParams) => {
      const { data, error } = await supabase.rpc('add_gallery_item_comment', {
        p_gallery_item_id: params.galleryItemId,
        p_author_name: params.authorName,
        p_comment_text: params.commentText,
        p_rating: params.rating || null,
        p_author_avatar_url: params.avatarUrl || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidar cache para recarregar comentários
      queryClient.invalidateQueries({ 
        queryKey: ['gallery-comments', variables.galleryItemId] 
      });
    },
  });
}

// =====================================================
// 3. HOOK SIMPLES (SEM REACT QUERY) - ALTERNATIVA
// =====================================================

export function useGalleryCommentsSimple(galleryItemId: string | null) {
  const [comments, setComments] = useState<GalleryComment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!galleryItemId) {
      setComments([]);
      setTotalComments(0);
      return;
    }

    const fetchComments = async () => {
      setLoading(true);
      setError(null);

      try {
        // Buscar comentários
        const { data: commentsData, error: commentsError } = await supabase
          .rpc('get_gallery_item_comments', {
            p_gallery_item_id: galleryItemId,
            p_limit: 10,
            p_offset: 0
          });

        if (commentsError) throw commentsError;

        // Buscar contagem
        const { data: countData, error: countError } = await supabase
          .rpc('count_gallery_item_comments', {
            p_gallery_item_id: galleryItemId
          });

        if (countError) throw countError;

        setComments((commentsData || []) as GalleryComment[]);
        setTotalComments((countData || 0) as number);

      } catch (err) {
        console.error('Erro ao buscar comentários:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [galleryItemId]);

  return { comments, totalComments, loading, error };
}

// =====================================================
// 4. HOOK PARA ADICIONAR COMENTÁRIO (SEM REACT QUERY)
// =====================================================

export function useAddCommentSimple() {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addComment = async (
    galleryItemId: string,
    authorName: string,
    commentText: string,
    rating?: number,
    avatarUrl?: string
  ) => {
    setAdding(true);
    setError(null);

    try {
      const { data, error: addError } = await supabase.rpc('add_gallery_item_comment', {
        p_gallery_item_id: galleryItemId,
        p_author_name: authorName,
        p_comment_text: commentText,
        p_rating: rating || null,
        p_author_avatar_url: avatarUrl || null
      });

      if (addError) throw addError;

      return { success: true, commentId: data };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao adicionar comentário';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setAdding(false);
    }
  };

  return { addComment, adding, error };
}

// =====================================================
// 5. HOOK COM FALLBACK PARA COMENTÁRIOS FALSOS
// =====================================================

const SAMPLE_COMMENTS: GalleryComment[] = [
  { 
    id: '1',
    author_name: "Ana Silva", 
    author_avatar_url: "https://i.pravatar.cc/150?img=1", 
    comment_text: "Produto incrível! Superou minhas expectativas. Recomendo muito! ✨", 
    rating: 5,
    is_highlighted: false,
    created_at: new Date().toISOString(),
    time_ago: "2h atrás" 
  },
  { 
    id: '2',
    author_name: "Carlos Santos", 
    author_avatar_url: "https://i.pravatar.cc/150?img=12", 
    comment_text: "Já é a segunda vez que compro. Qualidade excelente e entrega rápida! 👏", 
    rating: 5,
    is_highlighted: false,
    created_at: new Date().toISOString(),
    time_ago: "5h atrás" 
  },
  { 
    id: '3',
    author_name: "Maria Oliveira", 
    author_avatar_url: "https://i.pravatar.cc/150?img=5", 
    comment_text: "Adorei! Exatamente como descrito. Vale muito a pena! 💯", 
    rating: 5,
    is_highlighted: false,
    created_at: new Date().toISOString(),
    time_ago: "1d atrás" 
  },
];

export function useGalleryCommentsWithFallback(galleryItemId: string | null) {
  const { data, isLoading, error } = useGalleryItemComments(galleryItemId);

  // Se estiver carregando, retorna estado de loading
  if (isLoading) {
    return {
      comments: [],
      totalComments: 0,
      loading: true,
      error: null,
      isFallback: false
    };
  }

  // Se houver erro ou não houver comentários, usa fallback
  if (error || !data || data.comments.length === 0) {
    // Gerar comentários falsos baseados no ID para consistência
    const seed = galleryItemId?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    const shuffled = [...SAMPLE_COMMENTS].sort(() => {
      const random = Math.sin(seed) * 10000;
      return random - Math.floor(random);
    });
    
    return {
      comments: shuffled.slice(0, 5),
      totalComments: shuffled.length,
      loading: false,
      error: null,
      isFallback: true // Indica que está usando dados falsos
    };
  }

  // Retorna dados reais
  return {
    comments: data.comments,
    totalComments: data.total,
    loading: false,
    error: null,
    isFallback: false
  };
}

// =====================================================
// 6. HOOK PARA EDITAR COMENTÁRIO
// =====================================================

interface UpdateCommentParams {
  commentId: string;
  authorName?: string;
  commentText?: string;
  avatarUrl?: string;
  rating?: number;
  galleryItemId: string; // Necessário para invalidar cache
}

export function useUpdateGalleryComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateCommentParams) => {
      console.log('🔧 Atualizando comentário:', params);
      
      const { data, error } = await supabase.rpc('update_gallery_item_comment', {
        p_comment_id: params.commentId,
        p_author_name: params.authorName || null,
        p_comment_text: params.commentText || null,
        p_author_avatar_url: params.avatarUrl || null,
        p_rating: params.rating || null
      });

      if (error) {
        console.error('❌ Erro ao atualizar comentário:', error);
        throw error;
      }
      
      console.log('✅ Comentário atualizado com sucesso:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      console.log('🔄 Invalidando cache para:', variables.galleryItemId);
      // Invalidar cache para recarregar comentários
      queryClient.invalidateQueries({ 
        queryKey: ['gallery-comments', variables.galleryItemId] 
      });
    },
    onError: (error) => {
      console.error('❌ Erro na mutation de atualização:', error);
    }
  });
}

// =====================================================
// 7. HOOK PARA EXCLUIR COMENTÁRIO
// =====================================================

interface DeleteCommentParams {
  commentId: string;
  galleryItemId: string; // Necessário para invalidar cache
}

export function useDeleteGalleryComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeleteCommentParams) => {
      console.log('🗑️ Excluindo comentário:', params);
      
      const { data, error } = await supabase.rpc('delete_gallery_item_comment', {
        p_comment_id: params.commentId
      });

      if (error) {
        console.error('❌ Erro ao excluir comentário:', error);
        throw error;
      }
      
      console.log('✅ Comentário excluído com sucesso:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      console.log('🔄 Invalidando cache após exclusão para:', variables.galleryItemId);
      // Invalidar cache para recarregar comentários
      queryClient.invalidateQueries({ 
        queryKey: ['gallery-comments', variables.galleryItemId] 
      });
    },
    onError: (error) => {
      console.error('❌ Erro na mutation de exclusão:', error);
    }
  });
}

// =====================================================
// 8. HOOK PARA DESTACAR/REMOVER DESTAQUE
// =====================================================

interface ToggleHighlightParams {
  commentId: string;
  galleryItemId: string;
}

export function useToggleCommentHighlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ToggleHighlightParams) => {
      console.log('⭐ Alternando destaque do comentário:', params);
      
      const { data, error } = await supabase.rpc('toggle_comment_highlight', {
        p_comment_id: params.commentId
      });

      if (error) {
        console.error('❌ Erro ao alternar destaque:', error);
        throw error;
      }
      
      console.log('✅ Destaque alternado com sucesso:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      console.log('🔄 Invalidando cache após toggle para:', variables.galleryItemId);
      queryClient.invalidateQueries({ 
        queryKey: ['gallery-comments', variables.galleryItemId] 
      });
    },
    onError: (error) => {
      console.error('❌ Erro na mutation de toggle:', error);
    }
  });
}

// =====================================================
// 9. HOOK PARA BUSCAR ESTATÍSTICAS DE COMENTÁRIOS
// =====================================================

export function useGalleryCommentStats(galleryItemId: string | null) {
  return useQuery({
    queryKey: ['gallery-comment-stats', galleryItemId],
    queryFn: async () => {
      if (!galleryItemId) return null;

      const { data, error } = await supabase
        .from('gallery_item_comment_stats')
        .select('*')
        .eq('gallery_item_id', galleryItemId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!galleryItemId,
    staleTime: 1000 * 60 * 10, // Cache de 10 minutos
  });
}
