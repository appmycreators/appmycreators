-- =====================================================
-- SCHEMA: Sistema de Comentários para Gallery Items
-- =====================================================
-- Descrição: Estrutura completa para comentários de produtos
-- Autor: MyCreators
-- Data: 2025-01-14
-- =====================================================

-- 1. TABELA DE COMENTÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS gallery_item_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamento com o produto
  gallery_item_id UUID NOT NULL REFERENCES gallery_items(id) ON DELETE CASCADE,
  
  -- Dados do usuário que comentou
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name VARCHAR(100) NOT NULL,
  author_avatar_url TEXT,
  
  -- Conteúdo do comentário
  comment_text TEXT NOT NULL CHECK (char_length(comment_text) >= 3 AND char_length(comment_text) <= 500),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Opcional: avaliação de 1-5 estrelas
  
  -- Metadados
  is_approved BOOLEAN DEFAULT true, -- Auto-aprovação (sem moderação)
  is_highlighted BOOLEAN DEFAULT false, -- Destacar comentário especial
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices para performance
  CONSTRAINT valid_comment_length CHECK (char_length(comment_text) > 0)
);

-- =====================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para buscar comentários por produto (query mais comum)
CREATE INDEX IF NOT EXISTS idx_comments_gallery_item 
ON gallery_item_comments(gallery_item_id, created_at DESC);

-- Índice para comentários aprovados
CREATE INDEX IF NOT EXISTS idx_comments_approved 
ON gallery_item_comments(gallery_item_id, is_approved) 
WHERE is_approved = true;

-- Índice para comentários destacados
CREATE INDEX IF NOT EXISTS idx_comments_highlighted 
ON gallery_item_comments(is_highlighted) 
WHERE is_highlighted = true;

-- Índice para buscar por usuário
CREATE INDEX IF NOT EXISTS idx_comments_user 
ON gallery_item_comments(user_id, created_at DESC);

-- =====================================================
-- 3. TRIGGER PARA ATUALIZAR TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION update_gallery_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gallery_comment_timestamp
  BEFORE UPDATE ON gallery_item_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_gallery_comment_timestamp();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE gallery_item_comments ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode VER comentários aprovados
CREATE POLICY "Comentários aprovados são públicos"
  ON gallery_item_comments
  FOR SELECT
  USING (is_approved = true);

-- Apenas usuários autenticados podem CRIAR comentários
CREATE POLICY "Usuários autenticados podem criar comentários"
  ON gallery_item_comments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Usuários podem EDITAR apenas seus próprios comentários
CREATE POLICY "Usuários podem editar seus comentários"
  ON gallery_item_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem DELETAR apenas seus próprios comentários
CREATE POLICY "Usuários podem deletar seus comentários"
  ON gallery_item_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. FUNÇÃO PARA BUSCAR COMENTÁRIOS DE UM PRODUTO
-- =====================================================

CREATE OR REPLACE FUNCTION get_gallery_item_comments(
  p_gallery_item_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  author_name VARCHAR,
  author_avatar_url TEXT,
  comment_text TEXT,
  rating INTEGER,
  is_highlighted BOOLEAN,
  created_at TIMESTAMPTZ,
  time_ago TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gic.id,
    gic.author_name,
    gic.author_avatar_url,
    gic.comment_text,
    gic.rating,
    gic.is_highlighted,
    gic.created_at,
    -- Calcular "tempo atrás" humanizado
    CASE
      WHEN EXTRACT(EPOCH FROM (NOW() - gic.created_at)) < 3600 THEN
        CONCAT(FLOOR(EXTRACT(EPOCH FROM (NOW() - gic.created_at)) / 60), 'min atrás')
      WHEN EXTRACT(EPOCH FROM (NOW() - gic.created_at)) < 86400 THEN
        CONCAT(FLOOR(EXTRACT(EPOCH FROM (NOW() - gic.created_at)) / 3600), 'h atrás')
      WHEN EXTRACT(EPOCH FROM (NOW() - gic.created_at)) < 604800 THEN
        CONCAT(FLOOR(EXTRACT(EPOCH FROM (NOW() - gic.created_at)) / 86400), 'd atrás')
      ELSE
        CONCAT(FLOOR(EXTRACT(EPOCH FROM (NOW() - gic.created_at)) / 604800), 'sem atrás')
    END as time_ago
  FROM gallery_item_comments gic
  WHERE gic.gallery_item_id = p_gallery_item_id
    AND gic.is_approved = true
  ORDER BY 
    gic.is_highlighted DESC, -- Comentários destacados primeiro
    gic.created_at DESC       -- Mais recentes depois
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 6. FUNÇÃO PARA CONTAR COMENTÁRIOS
-- =====================================================

CREATE OR REPLACE FUNCTION count_gallery_item_comments(p_gallery_item_id UUID)
RETURNS INTEGER AS $$
DECLARE
  comment_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO comment_count
  FROM gallery_item_comments
  WHERE gallery_item_id = p_gallery_item_id
    AND is_approved = true;
  
  RETURN comment_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 7. VIEW PARA ESTATÍSTICAS DE COMENTÁRIOS
-- =====================================================

CREATE OR REPLACE VIEW gallery_item_comment_stats AS
SELECT 
  gi.id as gallery_item_id,
  gi.name as product_name,
  COUNT(gic.id) as total_comments,
  AVG(gic.rating)::NUMERIC(3,2) as average_rating,
  COUNT(gic.id) FILTER (WHERE gic.is_highlighted = true) as highlighted_count,
  MAX(gic.created_at) as latest_comment_at
FROM gallery_items gi
LEFT JOIN gallery_item_comments gic ON gi.id = gic.gallery_item_id AND gic.is_approved = true
GROUP BY gi.id, gi.name;

-- =====================================================
-- 8. DADOS DE EXEMPLO (SEED)
-- =====================================================

-- Inserir comentários de exemplo para produtos
-- Substitua os UUIDs pelos IDs reais dos seus produtos

/*
-- Exemplo de inserção
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
    'SEU_GALLERY_ITEM_ID_AQUI',
    'Ana Silva',
    'https://i.pravatar.cc/150?img=1',
    'Produto incrível! Superou minhas expectativas. Recomendo muito! ✨',
    5,
    true,
    false
  ),
  (
    'SEU_GALLERY_ITEM_ID_AQUI',
    'Carlos Santos',
    'https://i.pravatar.cc/150?img=12',
    'Já é a segunda vez que compro. Qualidade excelente e entrega rápida! 👏',
    5,
    true,
    true -- Destacado
  );
*/

-- =====================================================
-- 9. EXEMPLO DE QUERIES ÚTEIS
-- =====================================================

-- Buscar comentários de um produto específico
-- SELECT * FROM get_gallery_item_comments('UUID_DO_PRODUTO', 10, 0);

-- Contar comentários de um produto
-- SELECT count_gallery_item_comments('UUID_DO_PRODUTO');

-- Ver estatísticas de todos os produtos
-- SELECT * FROM gallery_item_comment_stats;

-- Buscar produtos com mais comentários
-- SELECT * FROM gallery_item_comment_stats ORDER BY total_comments DESC LIMIT 10;

-- Buscar produtos com melhor avaliação
-- SELECT * FROM gallery_item_comment_stats WHERE total_comments >= 5 ORDER BY average_rating DESC;

-- =====================================================
-- 10. FUNÇÃO PARA ADICIONAR COMENTÁRIO (COM VALIDAÇÃO)
-- =====================================================

CREATE OR REPLACE FUNCTION add_gallery_item_comment(
  p_gallery_item_id UUID,
  p_author_name VARCHAR,
  p_comment_text TEXT,
  p_rating INTEGER DEFAULT NULL,
  p_author_avatar_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_comment_id UUID;
  current_user_id UUID;
BEGIN
  -- Pegar ID do usuário autenticado
  current_user_id := auth.uid();
  
  -- Validações
  IF p_author_name IS NULL OR trim(p_author_name) = '' THEN
    RAISE EXCEPTION 'Nome do autor é obrigatório';
  END IF;
  
  IF p_comment_text IS NULL OR char_length(trim(p_comment_text)) < 3 THEN
    RAISE EXCEPTION 'Comentário deve ter no mínimo 3 caracteres';
  END IF;
  
  IF p_rating IS NOT NULL AND (p_rating < 1 OR p_rating > 5) THEN
    RAISE EXCEPTION 'Avaliação deve ser entre 1 e 5';
  END IF;
  
  -- Inserir comentário (aguardando aprovação)
  INSERT INTO gallery_item_comments (
    gallery_item_id,
    user_id,
    author_name,
    author_avatar_url,
    comment_text,
    rating,
    is_approved
  ) VALUES (
    p_gallery_item_id,
    current_user_id,
    p_author_name,
    p_author_avatar_url,
    trim(p_comment_text),
    p_rating,
    false -- Requer aprovação por padrão
  )
  RETURNING id INTO new_comment_id;
  
  RETURN new_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

-- Para aplicar este schema:
-- 1. Execute este arquivo no Supabase SQL Editor
-- 2. Verifique se a tabela gallery_items já existe
-- 3. Ajuste os UUIDs nos exemplos conforme necessário
-- 4. Configure permissões adicionais conforme sua necessidade
