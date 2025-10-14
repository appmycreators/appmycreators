-- =====================================================
-- TESTE: Verificar e Testar Funções de Comentários
-- =====================================================

-- 1. VERIFICAR SE AS FUNÇÕES EXISTEM
-- =====================================================

SELECT 
  proname AS function_name,
  pg_get_function_arguments(oid) AS arguments
FROM pg_proc 
WHERE proname IN (
  'update_gallery_item_comment',
  'delete_gallery_item_comment',
  'toggle_comment_highlight'
)
ORDER BY proname;

-- Se retornar 3 linhas = ✅ Funções existem
-- Se retornar vazio = ❌ Precisa executar gallery_comments_edit_delete.sql

-- =====================================================
-- 2. LISTAR COMENTÁRIOS EXISTENTES
-- =====================================================

SELECT 
  id,
  gallery_item_id,
  author_name,
  comment_text,
  is_highlighted,
  created_at
FROM gallery_item_comments
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- 3. TESTE MANUAL: Editar Comentário
-- =====================================================

-- Substitua 'COMMENT_ID_AQUI' por um ID real da query acima

/*
SELECT update_gallery_item_comment(
  'COMMENT_ID_AQUI'::uuid,
  'Nome Editado'::text,
  'Texto editado do comentário'::text,
  NULL,
  5
);
*/

-- Se retornar TRUE = ✅ Funcionou
-- Se retornar FALSE ou erro = ❌ Problema na função

-- =====================================================
-- 4. TESTE MANUAL: Toggle Destaque
-- =====================================================

/*
SELECT toggle_comment_highlight('COMMENT_ID_AQUI'::uuid);
*/

-- =====================================================
-- 5. TESTE MANUAL: Excluir Comentário
-- =====================================================

-- ⚠️ CUIDADO: Isso vai excluir permanentemente!

/*
SELECT delete_gallery_item_comment('COMMENT_ID_AQUI'::uuid);
*/

-- =====================================================
-- 6. VERIFICAR ESTRUTURA DA TABELA
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'gallery_item_comments'
ORDER BY ordinal_position;

-- =====================================================
-- 7. CRIAR COMENTÁRIO DE TESTE (Se necessário)
-- =====================================================

/*
INSERT INTO gallery_item_comments (
  gallery_item_id,
  author_name,
  comment_text,
  rating,
  is_approved,
  is_highlighted
) VALUES (
  'SEU_GALLERY_ITEM_ID'::uuid,  -- Substitua por um ID real
  'Teste Admin',
  'Este é um comentário de teste para edição e exclusão',
  5,
  true,
  false
)
RETURNING id, author_name, comment_text;
*/

-- =====================================================
-- FIM DOS TESTES
-- =====================================================
