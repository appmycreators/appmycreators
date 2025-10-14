-- =====================================================
-- SCRIPT: Atualizar Gallery Items Existentes
-- =====================================================
-- Este script adiciona valores padrão para os campos
-- de prova social em itens existentes da galeria
-- =====================================================

-- ATENÇÃO: Execute apenas SE já aplicou gallery_social_proof_fields.sql

-- 1. Verificar se os campos existem
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'gallery_items' 
  AND column_name IN ('enable_social_proof', 'custom_likes_count', 'custom_shares_count');

-- 2. Atualizar itens existentes com valores padrão (OPCIONAL)
-- Descomente as linhas abaixo se quiser ativar prova social em produtos existentes

/*
UPDATE gallery_items 
SET 
  enable_social_proof = false,
  custom_likes_count = 0,
  custom_shares_count = 0
WHERE enable_social_proof IS NULL;
*/

-- 3. Exemplo: Ativar prova social em um produto específico
/*
UPDATE gallery_items 
SET 
  enable_social_proof = true,
  custom_likes_count = 150,
  custom_shares_count = 30
WHERE id = 'SEU_GALLERY_ITEM_ID_AQUI';
*/

-- 4. Verificar dados atualizados
SELECT 
  id,
  name,
  enable_social_proof,
  custom_likes_count,
  custom_shares_count
FROM gallery_items
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
