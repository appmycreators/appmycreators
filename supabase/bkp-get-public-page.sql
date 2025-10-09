-- Criar função RPC para buscar todos os dados da página pública em uma query
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
                    'display_order', r.display_order,
                    'is_visible', r.is_visible,
                    'link_data', CASE 
                        WHEN r.type IN ('link', 'youtube', 'spotify', 'image_banner') THEN (
                            SELECT row_to_json(l.*)
                            FROM links l
                            WHERE l.resource_id = r.id
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
                    END
                ) ORDER BY r.display_order
            )
            FROM resources r
            WHERE r.page_id = v_page_id
            AND r.is_visible = true
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

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_username_lookup 
ON usernames(username) 
WHERE username IS NOT NULL;