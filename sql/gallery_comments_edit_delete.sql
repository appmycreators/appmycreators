-- =====================================================
-- FUNÇÕES: Editar e Excluir Comentários
-- =====================================================

-- 1. FUNÇÃO PARA EDITAR COMENTÁRIO
-- =====================================================

CREATE OR REPLACE FUNCTION update_gallery_item_comment(
  p_comment_id UUID,
  p_author_name TEXT DEFAULT NULL,
  p_comment_text TEXT DEFAULT NULL,
  p_author_avatar_url TEXT DEFAULT NULL,
  p_rating INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE gallery_item_comments
  SET
    author_name = COALESCE(p_author_name, author_name),
    comment_text = COALESCE(p_comment_text, comment_text),
    author_avatar_url = COALESCE(p_author_avatar_url, author_avatar_url),
    rating = COALESCE(p_rating, rating),
    updated_at = NOW()
  WHERE id = p_comment_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 2. FUNÇÃO PARA EXCLUIR COMENTÁRIO
-- =====================================================

CREATE OR REPLACE FUNCTION delete_gallery_item_comment(
  p_comment_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM gallery_item_comments
  WHERE id = p_comment_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 3. FUNÇÃO PARA DESTACAR/REMOVER DESTAQUE DO COMENTÁRIO
-- =====================================================

CREATE OR REPLACE FUNCTION toggle_comment_highlight(
  p_comment_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE gallery_item_comments
  SET
    is_highlighted = NOT is_highlighted,
    updated_at = NOW()
  WHERE id = p_comment_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERMISSÕES (se usar RLS)
-- =====================================================

-- Permitir que qualquer usuário autenticado edite comentários
-- NOTA: Ajuste conforme suas regras de segurança

-- Se quiser que apenas o criador do comentário possa editar:
/*
CREATE POLICY "Users can update their own comments"
ON gallery_item_comments
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
ON gallery_item_comments
FOR DELETE
USING (user_id = auth.uid());
*/

-- =====================================================
-- TESTES
-- =====================================================

-- Testar edição:
/*
SELECT update_gallery_item_comment(
  'COMMENT_ID_AQUI',
  'Novo Nome',
  'Novo texto do comentário',
  NULL,
  5
);
*/

-- Testar exclusão:
/*
SELECT delete_gallery_item_comment('COMMENT_ID_AQUI');
*/

-- Testar toggle destaque:
/*
SELECT toggle_comment_highlight('COMMENT_ID_AQUI');
*/

-- =====================================================
-- FIM
-- =====================================================
