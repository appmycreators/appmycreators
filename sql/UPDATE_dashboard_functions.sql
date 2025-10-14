-- =====================================================
-- ATUALIZAÇÃO: Funções do Dashboard
-- =====================================================
-- Adiciona os campos de prova social às queries
-- que retornam dados para o dashboard admin
-- =====================================================

-- =====================================================
-- PASSO 1: Identificar funções que retornam gallery_items
-- =====================================================

-- Liste todas as funções que podem estar retornando gallery_items:
SELECT 
  proname AS function_name,
  prosrc AS source_code
FROM pg_proc 
WHERE prosrc LIKE '%gallery_items%'
  AND proname NOT LIKE 'pg_%'
ORDER BY proname;

-- =====================================================
-- PASSO 2: Funções comuns a verificar/atualizar
-- =====================================================

-- Procure por funções com nomes similares a:
-- - get_page_data
-- - get_dashboard_data
-- - get_user_page
-- - get_page_resources
-- - ou qualquer função custom que seu projeto use

-- =====================================================
-- PASSO 3: Padrão de atualização
-- =====================================================

-- Em TODAS as funções que fazem SELECT de gallery_items,
-- adicione estes 3 campos:

/*
ANTES:
SELECT 
  gi.id,
  gi.name,
  gi.description,
  gi.price,
  gi.image_url,
  gi.link_url,
  gi.button_text,
  gi.display_order,
  gi.destaque,
  gi.lottie_animation
FROM gallery_items gi;

DEPOIS:
SELECT 
  gi.id,
  gi.name,
  gi.description,
  gi.price,
  gi.image_url,
  gi.link_url,
  gi.button_text,
  gi.display_order,
  gi.destaque,
  gi.lottie_animation,
  gi.enable_social_proof,      -- ✅ ADICIONAR
  gi.custom_likes_count,        -- ✅ ADICIONAR
  gi.custom_shares_count        -- ✅ ADICIONAR
FROM gallery_items gi;
*/

-- =====================================================
-- ALTERNATIVA: Se não há funções RPC customizadas
-- =====================================================

-- Se seu app usa apenas .select() direto do Supabase (sem RPC),
-- você NÃO precisa fazer nada aqui!
-- 
-- Os campos já estarão disponíveis porque adicionamos as colunas
-- na tabela gallery_items.
--
-- Verifique em: src/services/supabaseService.ts
-- A função getGalleryItems() usa .select('*') que já pega tudo.

-- =====================================================
-- VERIFICAÇÃO RÁPIDA
-- =====================================================

-- Teste se os campos estão sendo retornados:
SELECT 
  id,
  name,
  enable_social_proof,
  custom_likes_count,
  custom_shares_count
FROM gallery_items
LIMIT 5;

-- Se retornar os dados = ✅ Colunas existem
-- Se der erro "column does not exist" = ❌ Execute gallery_social_proof_fields.sql primeiro

-- =====================================================
-- EXEMPLO: Função get_page_with_resources (GENÉRICA)
-- =====================================================

-- Se você tem uma função similar, atualize assim:

/*
CREATE OR REPLACE FUNCTION get_page_with_resources(p_page_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'page', (SELECT row_to_json(p.*) FROM pages p WHERE p.id = p_page_id),
    'resources', (
      SELECT json_agg(
        json_build_object(
          'id', r.id,
          'type', r.type,
          'title', r.title,
          'gallery_data', CASE WHEN r.type = 'gallery' THEN
            (SELECT json_build_object(
              'gallery', (SELECT row_to_json(g.*) FROM galleries g WHERE g.resource_id = r.id),
              'items', (
                SELECT json_agg(
                  json_build_object(
                    'id', gi.id,
                    'name', gi.name,
                    'description', gi.description,
                    'price', gi.price,
                    'image_url', gi.image_url,
                    'link_url', gi.link_url,
                    'button_text', gi.button_text,
                    'display_order', gi.display_order,
                    'destaque', gi.destaque,
                    'lottie_animation', gi.lottie_animation,
                    'enable_social_proof', COALESCE(gi.enable_social_proof, false),      -- ✅
                    'custom_likes_count', COALESCE(gi.custom_likes_count, 0),            -- ✅
                    'custom_shares_count', COALESCE(gi.custom_shares_count, 0)           -- ✅
                  ) ORDER BY gi.display_order
                )
                FROM gallery_items gi
                WHERE gi.gallery_id = (SELECT g.id FROM galleries g WHERE g.resource_id = r.id)
              )
            ))
          ELSE NULL END
        ) ORDER BY r.display_order
      )
      FROM resources r
      WHERE r.page_id = p_page_id
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;
*/

-- =====================================================
-- NOTA IMPORTANTE
-- =====================================================

-- Use COALESCE() para valores padrão caso o campo seja NULL:
--   COALESCE(gi.enable_social_proof, false)
--   COALESCE(gi.custom_likes_count, 0)
--   COALESCE(gi.custom_shares_count, 0)
--
-- Isso garante que sempre retorne um valor válido.

-- =====================================================
-- TESTE FINAL
-- =====================================================

-- Após atualizar as funções, teste chamando-as:

/*
-- Se tiver get_public_page_data:
SELECT get_public_page_data('seu_username');

-- Se tiver get_page_with_resources:
SELECT get_page_with_resources('SEU_PAGE_ID');

-- Verifique se os campos aparecem no JSON retornado
*/

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- ERRO: "column does not exist"
-- SOLUÇÃO: Execute sql/gallery_social_proof_fields.sql primeiro

-- ERRO: "function does not exist"
-- SOLUÇÃO: Seu app pode não usar funções RPC. Verifique o código TypeScript

-- DADOS NÃO APARECEM no frontend:
-- SOLUÇÃO: 
--   1. Verifique se salvou com os campos preenchidos
--   2. Limpe o cache do React Query (recarregue a página)
--   3. Verifique o console do navegador por erros

-- =====================================================
-- FIM
-- =====================================================
