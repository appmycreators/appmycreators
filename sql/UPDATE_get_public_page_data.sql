-- =====================================================
-- ATUALIZAÇÃO: Função get_public_page_data
-- =====================================================
-- Adiciona os campos de prova social aos itens da galeria
-- na função que retorna dados para a página pública
-- =====================================================

-- IMPORTANTE: Esta função provavelmente já existe no seu banco.
-- Você precisa ADICIONAR os campos destacados abaixo no SELECT
-- dos gallery_items dentro da função existente.

-- =====================================================
-- PASSO 1: Verificar se a função existe
-- =====================================================

SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'get_public_page_data';

-- =====================================================
-- PASSO 2: Localizar o SELECT de gallery_items
-- =====================================================

-- Dentro da função get_public_page_data, procure por algo como:

/*
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
FROM gallery_items gi
WHERE gi.gallery_id = ...
*/

-- =====================================================
-- PASSO 3: ADICIONAR os campos de prova social
-- =====================================================

-- Adicione estas 3 linhas ao SELECT acima:

/*
  gi.enable_social_proof,
  gi.custom_likes_count,
  gi.custom_shares_count
*/

-- O SELECT completo deve ficar assim:

/*
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
  gi.enable_social_proof,      -- ✅ NOVO
  gi.custom_likes_count,        -- ✅ NOVO
  gi.custom_shares_count        -- ✅ NOVO
FROM gallery_items gi
WHERE gi.gallery_id = ...
*/

-- =====================================================
-- EXEMPLO COMPLETO (GENÉRICO)
-- =====================================================

-- Se você não tem a função criada, aqui está um exemplo básico
-- (ATENÇÃO: Adapte para sua estrutura real)

/*
CREATE OR REPLACE FUNCTION get_public_page_data(p_username TEXT)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'page', (SELECT json_build_object(
      'id', p.id,
      'user_id', p.user_id,
      'slug', p.slug,
      'title', p.title
    ) FROM pages p
    INNER JOIN usernames u ON p.user_id = u.user_id
    WHERE u.username = p_username AND p.is_active = true AND p.is_primary = true
    LIMIT 1),
    
    'settings', (SELECT row_to_json(ps.*) FROM page_settings ps 
                 WHERE ps.page_id = (
                   SELECT p.id FROM pages p
                   INNER JOIN usernames u ON p.user_id = u.user_id
                   WHERE u.username = p_username AND p.is_active = true
                   LIMIT 1
                 )),
    
    'resources', (
      SELECT json_agg(json_build_object(
        'id', r.id,
        'type', r.type,
        'title', r.title,
        'display_order', r.display_order,
        'gallery_data', CASE 
          WHEN r.type = 'gallery' THEN (
            SELECT json_build_object(
              'gallery', (SELECT row_to_json(g.*) FROM galleries g WHERE g.resource_id = r.id),
              'items', (
                SELECT json_agg(json_build_object(
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
                  'enable_social_proof', gi.enable_social_proof,        -- ✅ ADICIONAR
                  'custom_likes_count', gi.custom_likes_count,          -- ✅ ADICIONAR
                  'custom_shares_count', gi.custom_shares_count         -- ✅ ADICIONAR
                ) ORDER BY gi.display_order)
                FROM gallery_items gi
                WHERE gi.gallery_id = (SELECT g.id FROM galleries g WHERE g.resource_id = r.id)
              )
            )
          )
          ELSE NULL
        END
      ) ORDER BY r.display_order)
      FROM resources r
      WHERE r.page_id = (
        SELECT p.id FROM pages p
        INNER JOIN usernames u ON p.user_id = u.user_id
        WHERE u.username = p_username AND p.is_active = true
        LIMIT 1
      )
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;
*/

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================

-- 1. No Supabase SQL Editor, execute:
--    SELECT prosrc FROM pg_proc WHERE proname = 'get_public_page_data';
--
-- 2. Copie o código da função que apareceu
--
-- 3. Cole em um editor de texto
--
-- 4. Procure por todos os SELECT de gallery_items
--
-- 5. Adicione as 3 linhas dos campos de prova social
--
-- 6. Execute CREATE OR REPLACE FUNCTION... com o código atualizado
--
-- 7. Teste com: SELECT get_public_page_data('seu_username');

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Após atualizar, teste se os campos aparecem:

/*
SELECT 
  json_extract_path(
    get_public_page_data('SEU_USERNAME'), 
    'resources', 
    '0', 
    'gallery_data', 
    'items', 
    '0'
  ) AS first_gallery_item;
*/

-- Você deve ver: enable_social_proof, custom_likes_count, custom_shares_count

-- =====================================================
-- FIM
-- =====================================================
