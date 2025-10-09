-- Atualizar função RPC get_public_page para buscar image_banners da tabela correta
CREATE OR REPLACE FUNCTION get_public_page_data(p_username TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_page_id UUID;
    v_result JSON;
BEGIN
    -- Buscar user_id pelo username
    SELECT user_id INTO v_user_id
    FROM usernames
    WHERE username = p_username;
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object('error', 'Página não encontrada');
    END IF;
    
    -- Buscar page_id primária
    SELECT id INTO v_page_id
    FROM pages
    WHERE user_id = v_user_id 
    AND is_primary = true
    AND is_active = true
    LIMIT 1;
    
    IF v_page_id IS NULL THEN
        RETURN json_build_object('error', 'Página não encontrada');
    END IF;
    
    -- Construir resposta completa em JSON
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
                    'url', CASE 
                        WHEN r.type IN ('link', 'youtube', 'spotify') THEN (
                            SELECT l.url
                            FROM links l
                            WHERE l.resource_id = r.id
                        )
                        WHEN r.type = 'image_banner' THEN (
                            SELECT ib.link_url
                            FROM image_banners ib
                            WHERE ib.resource_id = r.id
                        )
                        ELSE NULL
                    END,
                    'image', CASE 
                        WHEN r.type = 'image_banner' THEN (
                            SELECT ib.image_url
                            FROM image_banners ib
                            WHERE ib.resource_id = r.id
                        )
                        ELSE NULL
                    END,
                    'display_order', r.display_order,
                    'is_visible', r.is_visible,
                    'hideUrl', CASE 
                        WHEN r.type IN ('link', 'youtube', 'spotify') THEN (
                            SELECT l.hide_url
                            FROM links l
                            WHERE l.resource_id = r.id
                        )
                        ELSE true
                    END
                ) ORDER BY r.display_order
            )
            FROM resources r
            WHERE r.page_id = v_page_id
            AND r.is_visible = true
        ), '[]'::json),
        'galleries', COALESCE((
            SELECT json_agg(
                json_build_object(
                    'id', r.id,
                    'title', r.title,
                    'items', COALESCE((
                        SELECT json_agg(row_to_json(gi.*) ORDER BY gi.display_order)
                        FROM gallery_items gi
                        WHERE gi.gallery_id = g.id
                    ), '[]'::json)
                ) ORDER BY r.display_order
            )
            FROM resources r
            INNER JOIN galleries g ON g.resource_id = r.id
            WHERE r.page_id = v_page_id
            AND r.type = 'gallery'
            AND r.is_visible = true
        ), '[]'::json),
        'socials', COALESCE((
            SELECT json_object_agg(sn.platform, sn.url)
            FROM social_networks sn
            WHERE sn.page_id = v_page_id
        ), '{}'::json),
        'socialsDisplayMode', COALESCE((
            SELECT sn.display_mode
            FROM social_networks sn
            WHERE sn.page_id = v_page_id
            LIMIT 1
        ), 'bottom')
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;

-- Conceder permissões apropriadas
GRANT EXECUTE ON FUNCTION get_public_page_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_page_data TO anon;
