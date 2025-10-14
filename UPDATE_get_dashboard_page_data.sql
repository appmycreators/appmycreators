-- ============================================
-- ATUALIZAÇÃO: Corrigir get_dashboard_page_data
-- ============================================
-- Adiciona image_banner_data e whatsapp_data que estavam faltando
-- ============================================

CREATE OR REPLACE FUNCTION public.get_dashboard_page_data(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_page_id UUID;
    v_username TEXT;
    v_result JSON;
BEGIN
    -- Validar user_id
    IF p_user_id IS NULL THEN
        RETURN json_build_object('error', 'Usuário não autenticado');
    END IF;
    
    -- Buscar username do usuário
    SELECT username INTO v_username
    FROM usernames
    WHERE user_id = p_user_id;
    
    -- Buscar página primária ou primeira página
    SELECT id INTO v_page_id
    FROM pages
    WHERE user_id = p_user_id
    ORDER BY is_primary DESC, created_at ASC
    LIMIT 1;
    
    -- Se não tem página, retornar dados mínimos
    IF v_page_id IS NULL THEN
        RETURN json_build_object(
            'username', v_username,
            'page', NULL,
            'settings', NULL,
            'resources', '[]'::json,
            'social_networks', '[]'::json
        );
    END IF;
    
    -- Construir resposta completa em JSON
    SELECT json_build_object(
        'username', v_username,
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
                    'link_data', CASE 
                        WHEN r.type IN ('link', 'youtube', 'spotify') THEN (
                            SELECT row_to_json(l.*)
                            FROM links l
                            WHERE l.resource_id = r.id
                        )
                        ELSE NULL
                    END,
                    'image_banner_data', CASE 
                        WHEN r.type = 'image_banner' THEN (
                            SELECT row_to_json(ib.*)
                            FROM image_banners ib
                            WHERE ib.resource_id = r.id
                        )
                        ELSE NULL
                    END,
                    'whatsapp_data', CASE
                        WHEN r.type = 'whatsapp' THEN (
                            SELECT row_to_json(w.*)
                            FROM whatsapp_links w
                            WHERE w.resource_id = r.id
                        )
                        ELSE NULL
                    END,
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
        ), '[]'::json),
        'social_networks', COALESCE((
            SELECT json_agg(row_to_json(sn.*) ORDER BY sn.display_order)
            FROM social_networks sn
            WHERE sn.page_id = v_page_id
        ), '[]'::json)
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;
