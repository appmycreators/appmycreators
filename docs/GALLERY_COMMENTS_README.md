# 📝 Sistema de Comentários para Gallery Items

## 📋 Sumário
- [Visão Geral](#visão-geral)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Funcionalidades](#funcionalidades)
- [Exemplos de Uso](#exemplos-de-uso)
- [Moderação](#moderação)
- [Performance](#performance)

---

## 🎯 Visão Geral

Sistema completo de comentários para produtos da galeria, incluindo:
- ✅ Comentários reais vinculados a produtos
- ✅ Sistema de avaliação (1-5 estrelas)
- ✅ Moderação de comentários
- ✅ Comentários destacados
- ✅ Timestamps humanizados ("2h atrás")
- ✅ Avatares personalizados
- ✅ Row Level Security (RLS)
- ✅ Performance otimizada com índices

---

## 🗄️ Estrutura do Banco de Dados

### Tabela Principal: `gallery_item_comments`

```sql
gallery_item_comments
├── id (UUID, PK)
├── gallery_item_id (UUID, FK → gallery_items)
├── user_id (UUID, FK → auth.users, nullable)
├── author_name (VARCHAR(100))
├── author_avatar_url (TEXT, nullable)
├── comment_text (TEXT, 3-500 chars)
├── rating (INTEGER, 1-5, nullable)
├── is_approved (BOOLEAN, default: false)
├── is_highlighted (BOOLEAN, default: false)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

### Índices Criados
- `idx_comments_gallery_item` - Busca por produto
- `idx_comments_approved` - Filtro de aprovados
- `idx_comments_highlighted` - Comentários destacados
- `idx_comments_user` - Busca por usuário

---

## 📦 Instalação

### 1. Aplicar Schema SQL

```bash
# No Supabase Dashboard:
1. Vá em SQL Editor
2. Cole o conteúdo de: sql/gallery_comments_schema.sql
3. Execute (Run)
```

### 2. Verificar Permissões

```sql
-- Testar se as policies foram criadas
SELECT * FROM pg_policies 
WHERE tablename = 'gallery_item_comments';
```

### 3. Inserir Comentários de Exemplo (Opcional)

```sql
-- Substituir UUID_DO_PRODUTO pelos IDs reais
INSERT INTO gallery_item_comments (
  gallery_item_id,
  author_name,
  author_avatar_url,
  comment_text,
  rating,
  is_approved,
  is_highlighted
) VALUES 
  (
    'UUID_DO_PRODUTO_1',
    'Ana Silva',
    'https://i.pravatar.cc/150?img=1',
    'Produto incrível! Superou minhas expectativas. Recomendo muito! ✨',
    5,
    true,
    false
  ),
  (
    'UUID_DO_PRODUTO_1',
    'Carlos Santos',
    'https://i.pravatar.cc/150?img=12',
    'Já é a segunda vez que compro. Qualidade excelente! 👏',
    5,
    true,
    true -- Comentário destacado
  );
```

---

## 🚀 Como Usar

### 1. Buscar Comentários de um Produto

```typescript
// Usando o hook customizado
import { useGalleryItemComments } from '@/hooks/useGalleryItemComments';

function ProductComments({ productId }: { productId: string }) {
  const { comments, totalComments, loading, error } = useGalleryItemComments(productId);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h3>Comentários ({totalComments})</h3>
      {comments.map(comment => (
        <div key={comment.id}>
          <img src={comment.author_avatar_url} alt={comment.author_name} />
          <h4>{comment.author_name}</h4>
          <p>{comment.comment_text}</p>
          <span>{comment.time_ago}</span>
        </div>
      ))}
    </div>
  );
}
```

### 2. Adicionar Comentário

```typescript
import { useAddComment } from '@/hooks/useAddComment';

function AddCommentForm({ productId }: { productId: string }) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const { addComment, adding } = useAddComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addComment(productId, name, text, rating);
    
    if (result.success) {
      alert('Comentário enviado! Aguardando aprovação.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <textarea value={text} onChange={e => setText(e.target.value)} />
      <button disabled={adding}>Enviar</button>
    </form>
  );
}
```

### 3. Integração no PublicContentBlock.tsx

```typescript
// Substituir comentários falsos por reais
const { comments, totalComments, loading: loadingComments } = 
  useGalleryItemComments(item.id);

// No ícone de comentários
<MessageCircle onClick={() => setShowComments(true)} />
<span>{totalComments}</span>

// No modal
<Dialog open={showComments} onOpenChange={setShowComments}>
  <DialogContent>
    <DialogTitle>Comentários ({totalComments})</DialogTitle>
    {loadingComments ? (
      <LoadingState />
    ) : (
      <CommentsList comments={comments} />
    )}
  </DialogContent>
</Dialog>
```

---

## ✨ Funcionalidades

### 1. Sistema de Avaliação (Rating)
```typescript
// Exibir estrelas
{comment.rating && (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < comment.rating! ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ))}
  </div>
)}
```

### 2. Comentários Destacados
```sql
-- Destacar um comentário específico
UPDATE gallery_item_comments 
SET is_highlighted = true 
WHERE id = 'UUID_DO_COMENTARIO';
```

### 3. Timestamps Humanizados
```typescript
// Já vem processado do banco
comment.time_ago // "2h atrás", "3d atrás", etc.
```

### 4. Avatar Fallback
```typescript
// Se não tiver avatar customizado
const avatarUrl = comment.author_avatar_url || 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author_name)}`;
```

---

## 🛡️ Moderação

### Dashboard de Moderação (Admin)

```sql
-- Ver comentários pendentes de aprovação
SELECT 
  c.id,
  c.author_name,
  c.comment_text,
  gi.name as product_name,
  c.created_at
FROM gallery_item_comments c
JOIN gallery_items gi ON c.gallery_item_id = gi.id
WHERE c.is_approved = false
ORDER BY c.created_at DESC;

-- Aprovar comentário
UPDATE gallery_item_comments 
SET is_approved = true 
WHERE id = 'UUID_DO_COMENTARIO';

-- Rejeitar/Deletar comentário
DELETE FROM gallery_item_comments 
WHERE id = 'UUID_DO_COMENTARIO';
```

### Auto-Aprovação (Opcional)

```sql
-- Para permitir comentários sem moderação
ALTER TABLE gallery_item_comments 
ALTER COLUMN is_approved SET DEFAULT true;
```

---

## ⚡ Performance

### Otimizações Implementadas

1. **Índices Compostos**
   ```sql
   CREATE INDEX idx_comments_gallery_item 
   ON gallery_item_comments(gallery_item_id, created_at DESC);
   ```

2. **Query Única**
   - Busca comentários + contagem em 1 call
   - Timestamp humanizado calculado no banco

3. **Cache com React Query** (Recomendado)
   ```typescript
   // Cache de 5 minutos
   staleTime: 1000 * 60 * 5
   ```

4. **Paginação**
   ```typescript
   const { data } = await supabase.rpc('get_gallery_item_comments', {
     p_gallery_item_id: productId,
     p_limit: 10,
     p_offset: 0
   });
   ```

### Benchmark Esperado
- Busca de 10 comentários: **< 50ms**
- Inserção de comentário: **< 100ms**
- Contagem total: **< 30ms**

---

## 📊 Estatísticas

### Ver Produtos com Mais Comentários
```sql
SELECT * FROM gallery_item_comment_stats 
ORDER BY total_comments DESC 
LIMIT 10;
```

### Ver Produtos Melhor Avaliados
```sql
SELECT * FROM gallery_item_comment_stats 
WHERE total_comments >= 5 
ORDER BY average_rating DESC 
LIMIT 10;
```

---

## 🔄 Migração Gradual

### Fallback para Comentários Falsos

```typescript
function useCommentsWithFallback(itemId: string) {
  const { comments: realComments, totalComments } = useGalleryItemComments(itemId);
  
  // Se tiver comentários reais, use-os
  if (realComments.length > 0) {
    return { comments: realComments, total: totalComments, isReal: true };
  }
  
  // Senão, use comentários falsos temporariamente
  const fakeComments = SAMPLE_COMMENTS.slice(0, 5);
  return { comments: fakeComments, total: 5, isReal: false };
}
```

---

## 🐛 Troubleshooting

### Comentários não aparecem?
```sql
-- Verificar se existem comentários aprovados
SELECT COUNT(*) FROM gallery_item_comments 
WHERE gallery_item_id = 'UUID_DO_PRODUTO' 
AND is_approved = true;
```

### Erro de permissão?
```sql
-- Verificar policies RLS
SELECT * FROM pg_policies 
WHERE tablename = 'gallery_item_comments';
```

### Performance lenta?
```sql
-- Verificar se índices foram criados
SELECT indexname FROM pg_indexes 
WHERE tablename = 'gallery_item_comments';
```

---

## 📝 Próximos Passos

1. ✅ Aplicar schema SQL
2. ✅ Criar hooks customizados
3. ✅ Integrar no PublicContentBlock.tsx
4. ⏳ Criar dashboard de moderação
5. ⏳ Adicionar notificações de novos comentários
6. ⏳ Implementar respostas a comentários
7. ⏳ Sistema de denúncia de comentários

---

## 📚 Referências

- **Schema SQL:** `sql/gallery_comments_schema.sql`
- **Exemplo de Integração:** `docs/gallery-comments-integration-example.tsx`
- **Hooks Customizados:** Criar em `src/hooks/`

---

## 💡 Dicas

1. **Sempre modere comentários** para evitar spam
2. **Use cache** para reduzir chamadas ao banco
3. **Destaque bons comentários** para aumentar confiança
4. **Exiba média de avaliação** próximo ao produto
5. **Permita ordenação** (mais recentes, melhor avaliação, etc.)

---

**Desenvolvido para MyCreators** 🚀
