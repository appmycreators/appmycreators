-- =====================================================
-- SCHEMA: Campos de Prova Social para Gallery Items
-- =====================================================
-- Adiciona campos customizáveis para prova social
-- (curtidas, compartilhamentos, comentários)
-- =====================================================

-- 1. ADICIONAR CAMPOS NA TABELA gallery_items
-- =====================================================

-- Verificar se os campos já existem antes de adicionar
DO $$ 
BEGIN
  -- Campo: ativar/desativar prova social
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gallery_items' AND column_name = 'enable_social_proof'
  ) THEN
    ALTER TABLE gallery_items 
    ADD COLUMN enable_social_proof BOOLEAN DEFAULT false;
  END IF;

  -- Campo: número customizado de curtidas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gallery_items' AND column_name = 'custom_likes_count'
  ) THEN
    ALTER TABLE gallery_items 
    ADD COLUMN custom_likes_count INTEGER DEFAULT 0 CHECK (custom_likes_count >= 0);
  END IF;

  -- Campo: número customizado de compartilhamentos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gallery_items' AND column_name = 'custom_shares_count'
  ) THEN
    ALTER TABLE gallery_items 
    ADD COLUMN custom_shares_count INTEGER DEFAULT 0 CHECK (custom_shares_count >= 0);
  END IF;

  -- Campo: usar números customizados ou números reais de comentários
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gallery_items' AND column_name = 'use_custom_counts'
  ) THEN
    ALTER TABLE gallery_items 
    ADD COLUMN use_custom_counts BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 2. CRIAR ÍNDICE PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_gallery_items_social_proof 
ON gallery_items(enable_social_proof) 
WHERE enable_social_proof = true;

-- 3. FUNÇÃO PARA OBTER ESTATÍSTICAS DE PROVA SOCIAL
-- =====================================================

CREATE OR REPLACE FUNCTION get_gallery_item_social_stats(p_gallery_item_id UUID)
RETURNS TABLE (
  likes_count INTEGER,
  shares_count INTEGER,
  comments_count INTEGER,
  is_custom BOOLEAN
) AS $$
DECLARE
  v_enable_social_proof BOOLEAN;
  v_use_custom_counts BOOLEAN;
  v_custom_likes INTEGER;
  v_custom_shares INTEGER;
  v_real_comments INTEGER;
BEGIN
  -- Buscar configurações do item
  SELECT 
    gi.enable_social_proof,
    gi.use_custom_counts,
    gi.custom_likes_count,
    gi.custom_shares_count
  INTO 
    v_enable_social_proof,
    v_use_custom_counts,
    v_custom_likes,
    v_custom_shares
  FROM gallery_items gi
  WHERE gi.id = p_gallery_item_id;

  -- Se prova social não está ativada, retornar zeros
  IF NOT v_enable_social_proof THEN
    RETURN QUERY SELECT 0, 0, 0, false;
    RETURN;
  END IF;

  -- Contar comentários reais
  SELECT COUNT(*) INTO v_real_comments
  FROM gallery_item_comments
  WHERE gallery_item_id = p_gallery_item_id
    AND is_approved = true;

  -- Se usar números customizados
  IF v_use_custom_counts THEN
    RETURN QUERY SELECT v_custom_likes, v_custom_shares, v_real_comments, true;
  ELSE
    -- Usar números reais (comentários + cálculos)
    RETURN QUERY SELECT v_real_comments, v_real_comments, v_real_comments, false;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. ATUALIZAR FUNÇÃO get_public_page_data (se existir)
-- =====================================================
-- Esta função precisará incluir os novos campos ao retornar gallery_items

-- Exemplo de como buscar com os novos campos:
/*
SELECT 
  gi.id,
  gi.name,
  gi.description,
  gi.price,
  gi.image_url,
  gi.link_url,
  gi.button_text,
  gi.destaque,
  gi.lottie_animation,
  gi.enable_social_proof,
  gi.custom_likes_count,
  gi.custom_shares_count,
  gi.use_custom_counts
FROM gallery_items gi
WHERE gi.gallery_id = 'GALLERY_ID';
*/

-- 5. COMENTÁRIOS DO SCHEMA
-- =====================================================

COMMENT ON COLUMN gallery_items.enable_social_proof IS 'Ativar/desativar exibição de prova social (curtidas, shares, comentários)';
COMMENT ON COLUMN gallery_items.custom_likes_count IS 'Número customizado de curtidas para exibir';
COMMENT ON COLUMN gallery_items.custom_shares_count IS 'Número customizado de compartilhamentos para exibir';
COMMENT ON COLUMN gallery_items.use_custom_counts IS 'Se true, usa números customizados; se false, calcula baseado em comentários reais';

-- =====================================================
-- 6. EXEMPLO DE USO
-- =====================================================

-- Ativar prova social com números customizados
/*
UPDATE gallery_items 
SET 
  enable_social_proof = true,
  custom_likes_count = 234,
  custom_shares_count = 45,
  use_custom_counts = true
WHERE id = 'UUID_DO_PRODUTO';
*/

-- Buscar estatísticas de prova social
/*
SELECT * FROM get_gallery_item_social_stats('UUID_DO_PRODUTO');
*/

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
