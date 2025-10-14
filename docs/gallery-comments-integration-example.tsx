/**
 * =====================================================
 * EXEMPLO DE INTEGRAÇÃO - Comentários Reais
 * =====================================================
 * 
 * Este arquivo mostra como integrar comentários reais
 * do banco de dados no PublicContentBlock.tsx
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// =====================================================
// 1. HOOK CUSTOMIZADO PARA BUSCAR COMENTÁRIOS
// =====================================================

interface Comment {
  id: string;
  author_name: string;
  author_avatar_url: string | null;
  comment_text: string;
  rating: number | null;
  is_highlighted: boolean;
  created_at: string;
  time_ago: string;
}

export function useGalleryItemComments(galleryItemId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalComments, setTotalComments] = useState(0);

  useEffect(() => {
    if (!galleryItemId) return;

    const fetchComments = async () => {
      setLoading(true);
      setError(null);

      try {
        // Buscar comentários usando a função SQL
        const { data, error: fetchError } = await supabase
          .rpc('get_gallery_item_comments', {
            p_gallery_item_id: galleryItemId,
            p_limit: 10,
            p_offset: 0
          });

        if (fetchError) throw fetchError;

        setComments(data || []);

        // Buscar contagem total
        const { data: countData, error: countError } = await supabase
          .rpc('count_gallery_item_comments', {
            p_gallery_item_id: galleryItemId
          });

        if (countError) throw countError;

        setTotalComments(countData || 0);

      } catch (err) {
        console.error('Erro ao buscar comentários:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [galleryItemId]);

  return { comments, loading, error, totalComments };
}

// =====================================================
// 2. HOOK PARA ADICIONAR COMENTÁRIO
// =====================================================

export function useAddComment() {
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
      const { data, error: addError } = await supabase
        .rpc('add_gallery_item_comment', {
          p_gallery_item_id: galleryItemId,
          p_author_name: authorName,
          p_comment_text: commentText,
          p_rating: rating,
          p_author_avatar_url: avatarUrl
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
// 3. EXEMPLO DE USO NO PublicContentBlock.tsx
// =====================================================

/*
// No arquivo PublicContentBlock.tsx, SUBSTITUA:

// ❌ COMENTÁRIOS FALSOS
const SAMPLE_COMMENTS = [
  { name: "Ana Silva", avatar: "https://i.pravatar.cc/150?img=1", ... }
];
const comments = generateComments(item.id || 'default', stats.comments > 10 ? 7 : 5);

// ✅ COMENTÁRIOS REAIS DO BANCO
const { comments, totalComments, loading: loadingComments } = useGalleryItemComments(item.id);

// No modal, use:
<DialogTitle className="text-lg font-semibold flex items-center gap-2">
  <MessageCircle className="w-5 h-5" />
  Comentários ({totalComments})
</DialogTitle>

{loadingComments ? (
  <div className="p-6">
    <Skeleton className="h-20 w-full mb-3" />
    <Skeleton className="h-20 w-full mb-3" />
    <Skeleton className="h-20 w-full" />
  </div>
) : (
  <div className="overflow-y-auto max-h-[60vh] p-6 space-y-4">
    {comments.map((comment) => (
      <div key={comment.id} className="flex gap-3 pb-4 border-b last:border-b-0">
        <img 
          src={comment.author_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author_name)}`}
          alt={comment.author_name}
          className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{comment.author_name}</span>
            <span className="text-xs text-muted-foreground">{comment.time_ago}</span>
            {comment.is_highlighted && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                ⭐ Destaque
              </span>
            )}
          </div>
          {comment.rating && (
            <div className="flex gap-0.5 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < comment.rating! ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-foreground leading-relaxed">{comment.comment_text}</p>
        </div>
      </div>
    ))}
    
    {comments.length === 0 && (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>Nenhum comentário ainda.</p>
        <p className="text-xs mt-1">Seja o primeiro a avaliar!</p>
      </div>
    )}
  </div>
)}
*/

// =====================================================
// 4. EXEMPLO DE FORMULÁRIO PARA ADICIONAR COMENTÁRIO
// =====================================================

/*
function CommentForm({ galleryItemId }: { galleryItemId: string }) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const { addComment, adding, error } = useAddComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await addComment(galleryItemId, name, comment, rating);
    
    if (result.success) {
      alert('Comentário enviado! Aguardando aprovação.');
      setName('');
      setComment('');
      setRating(5);
    } else {
      alert(`Erro: ${result.error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t space-y-3">
      <h4 className="font-semibold">Deixe seu comentário</h4>
      
      <input
        type="text"
        placeholder="Seu nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full px-3 py-2 border rounded-lg"
      />
      
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="text-2xl focus:outline-none"
          >
            <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
              ★
            </span>
          </button>
        ))}
      </div>
      
      <textarea
        placeholder="Escreva seu comentário..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        minLength={3}
        maxLength={500}
        rows={3}
        className="w-full px-3 py-2 border rounded-lg resize-none"
      />
      
      <button
        type="submit"
        disabled={adding}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {adding ? 'Enviando...' : 'Enviar Comentário'}
      </button>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}
*/

// =====================================================
// 5. CACHE COM REACT QUERY (OPCIONAL - MELHOR PERFORMANCE)
// =====================================================

/*
// Instalar: npm install @tanstack/react-query

import { useQuery } from '@tanstack/react-query';

export function useGalleryItemCommentsQuery(galleryItemId: string | null) {
  return useQuery({
    queryKey: ['gallery-comments', galleryItemId],
    queryFn: async () => {
      if (!galleryItemId) return { comments: [], total: 0 };
      
      const [commentsRes, countRes] = await Promise.all([
        supabase.rpc('get_gallery_item_comments', {
          p_gallery_item_id: galleryItemId,
          p_limit: 10,
          p_offset: 0
        }),
        supabase.rpc('count_gallery_item_comments', {
          p_gallery_item_id: galleryItemId
        })
      ]);

      return {
        comments: commentsRes.data || [],
        total: countRes.data || 0
      };
    },
    enabled: !!galleryItemId,
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  });
}
*/

// =====================================================
// 6. MIGRAÇÃO GRADUAL (FALLBACK)
// =====================================================

/*
// Para fazer transição suave dos comentários falsos para reais:

function useCommentsWithFallback(galleryItemId: string) {
  const { comments: realComments, totalComments, loading } = useGalleryItemComments(galleryItemId);
  
  // Se tiver comentários reais, use-os
  if (realComments.length > 0) {
    return { comments: realComments, total: totalComments, loading, isFallback: false };
  }
  
  // Senão, use comentários falsos como fallback
  const fakeComments = generateComments(galleryItemId, 5);
  return { 
    comments: fakeComments.map(c => ({
      id: Math.random().toString(),
      author_name: c.name,
      author_avatar_url: c.avatar,
      comment_text: c.comment,
      rating: 5,
      is_highlighted: false,
      created_at: new Date().toISOString(),
      time_ago: c.time
    })),
    total: fakeComments.length,
    loading: false,
    isFallback: true
  };
}
*/
