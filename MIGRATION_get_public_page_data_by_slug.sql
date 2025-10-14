-- ============================================
-- MIGRATION: Criar RPC get_public_page_data_by_slug
-- ============================================
-- 
-- MOTIVO: Agora um usuário pode ter múltiplas páginas.
-- Antes: get_public_page_data buscava por username (1 página por usuário)
-- Agora: get_public_page_data_by_slug busca por slug da página (N páginas por usuário)
--
-- EXECUTAR ESTE SQL NO SUPABASE SQL EDITOR
-- ============================================

CREATE OR REPLACE FUNCTION public.get_public_page_data_by_slug(p_slug TEXT)
RETURNS JSON
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_page_id UUID;
  v_result JSON;
BEGIN
  -- Buscar a página pelo slug
  SELECT id INTO v_page_id
  FROM pages
  WHERE slug = p_slug
    AND is_active = true
  LIMIT 1;

  -- Se página não encontrada, retornar erro
  IF v_page_id IS NULL THEN
    RETURN json_build_object('error', 'Página não encontrada');
  END IF;

  -- Construir resposta completa em JSON (MESMA ESTRUTURA que get_public_page_data)
  SELECT json_build_object(
    'page', (
      SELECT row_to_json(p.*)
      FROM pages p
      WHERE p.id = v_page_id
    ),
    'settings', (
      SELECT row_to_json(ps.*)
      FROM page_settings ps
      WHERE ps.page_id = v_page_id
    ),
    'resources', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', r.id,
          'type', r.type,
          'title', r.title,
          'display_order', r.display_order,
          'is_visible', r.is_visible,
          
          -- link_data (igual ao original)
          'link_data', CASE 
            WHEN r.type IN ('link', 'youtube', 'spotify') THEN (
              SELECT row_to_json(l.*)
              FROM links l
              WHERE l.resource_id = r.id
            )
            ELSE NULL
          END,
          
          -- image_banner_data (igual ao original)
          'image_banner_data', CASE 
            WHEN r.type = 'image_banner' THEN (
              SELECT row_to_json(ib.*)
              FROM image_banners ib
              WHERE ib.resource_id = r.id
            )
            ELSE NULL
          END,
          
          -- whatsapp_data (busca de links como no original)
          'whatsapp_data', CASE
            WHEN r.type = 'whatsapp' THEN (
              SELECT json_build_object(
                'phone_number', SUBSTRING(l.url FROM 'wa\.me/([0-9]+)'),
                'message', NULL,
                'image_url', l.image_url,
                'bg_color', l.bg_color
              )
              FROM links l
              WHERE l.resource_id = r.id
            )
            ELSE NULL
          END,
          
          -- gallery_data (igual ao original)
          'gallery_data', CASE
            WHEN r.type = 'gallery' THEN (
              SELECT json_build_object(
                'gallery', row_to_json(g.*),
                'items', COALESCE((
                  SELECT json_agg(row_to_json(gi.*) ORDER BY gi.display_order)
                  FROM gallery_items gi
                  WHERE gi.gallery_id = g.id
                ), '[]'::json)
              )
              FROM galleries g
              WHERE g.resource_id = r.id
            )
            ELSE NULL
          END,
          
          -- form_data (igual ao original)
          'form_data', CASE
            WHEN r.type = 'form' THEN (
              SELECT row_to_json(f.*)
              FROM forms f
              WHERE f.resource_id = r.id
            )
            ELSE NULL
          END
        ) ORDER BY r.display_order
      )
      FROM resources r
      WHERE r.page_id = v_page_id
        AND r.is_visible = true
    ), '[]'::json),
    
    -- social_networks (igual ao original)
    'social_networks', COALESCE((
      SELECT json_agg(row_to_json(sn.*) ORDER BY sn.display_order)
      FROM social_networks sn
      WHERE sn.page_id = v_page_id
    ), '[]'::json)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Conceder permissão de execução para usuários anônimos (páginas públicas)
GRANT EXECUTE ON FUNCTION public.get_public_page_data_by_slug(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_page_data_by_slug(TEXT) TO authenticated;
