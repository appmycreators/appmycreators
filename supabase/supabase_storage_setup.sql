-- ============================================
-- SUPABASE STORAGE - Configuração de Buckets
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- APÓS executar supabase_migration.sql e supabase_username_table.sql
-- ============================================

-- ============================================
-- CRIAR BUCKETS
-- ============================================

-- Bucket para avatares de usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens de banner/header
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens de galeria/produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLÍTICAS DE STORAGE - AVATARS
-- ============================================

-- Permitir upload de avatar (apenas no próprio diretório do usuário)
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir atualização de avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir deleção de avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir leitura pública de avatares
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================
-- POLÍTICAS DE STORAGE - BANNERS
-- ============================================

-- Permitir upload de banner
CREATE POLICY "Users can upload own banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir atualização de banner
CREATE POLICY "Users can update own banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir deleção de banner
CREATE POLICY "Users can delete own banners"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir leitura pública de banners
CREATE POLICY "Banners are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'banners');

-- ============================================
-- POLÍTICAS DE STORAGE - GALLERY
-- ============================================

-- Permitir upload de imagens de galeria
CREATE POLICY "Users can upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir atualização de imagens de galeria
CREATE POLICY "Users can update gallery images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gallery' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir deleção de imagens de galeria
CREATE POLICY "Users can delete gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir leitura pública de galeria
CREATE POLICY "Gallery images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery');

-- ============================================
-- FUNÇÕES HELPER PARA STORAGE
-- ============================================

-- Função para obter URL pública de um arquivo
CREATE OR REPLACE FUNCTION public.get_public_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_url TEXT;
BEGIN
  -- Obter URL base do projeto
  SELECT 
    CONCAT(
      current_setting('app.settings.base_url', true),
      '/storage/v1/object/public/',
      bucket_name,
      '/',
      file_path
    ) INTO base_url;
  
  RETURN base_url;
END;
$$;

-- Função para deletar arquivo antigo ao fazer upload de novo
CREATE OR REPLACE FUNCTION public.delete_old_file(bucket_name TEXT, old_path TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF old_path IS NOT NULL AND old_path != '' THEN
    DELETE FROM storage.objects
    WHERE bucket_id = bucket_name
    AND name = old_path;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- ============================================
-- ESTRUTURA DE PASTAS RECOMENDADA
-- ============================================

-- avatars/
--   {user_id}/
--     avatar.jpg
--     avatar_thumb.jpg

-- banners/
--   {user_id}/
--     header.jpg
--     header.gif
--     header.mp4

-- gallery/
--   {user_id}/
--     {page_id}/
--       product1.jpg
--       product2.jpg

-- ============================================
-- VALIDAÇÕES E CONSTRAINTS
-- ============================================

-- Limitar quantidade de arquivos por usuário
CREATE OR REPLACE FUNCTION public.check_storage_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  file_count INTEGER;
  user_folder TEXT;
BEGIN
  -- Extrair pasta do usuário
  user_folder := (storage.foldername(NEW.name))[1];
  
  -- Contar arquivos do usuário no bucket
  SELECT COUNT(*) INTO file_count
  FROM storage.objects
  WHERE bucket_id = NEW.bucket_id
  AND (storage.foldername(name))[1] = user_folder;
  
  -- Limite de 100 arquivos por bucket por usuário
  IF file_count >= 100 THEN
    RAISE EXCEPTION 'Limite de arquivos atingido para este bucket';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger de quota
CREATE TRIGGER check_storage_quota_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.check_storage_quota();

-- ============================================
-- QUERIES ÚTEIS PARA MONITORAMENTO
-- ============================================

-- Ver todos os arquivos de um usuário
-- SELECT * FROM storage.objects 
-- WHERE (storage.foldername(name))[1] = 'user-id-aqui';

-- Ver tamanho total usado por um usuário
-- SELECT 
--   (storage.foldername(name))[1] as user_id,
--   bucket_id,
--   COUNT(*) as file_count,
--   SUM(metadata->>'size')::bigint as total_bytes,
--   pg_size_pretty(SUM(metadata->>'size')::bigint) as total_size
-- FROM storage.objects
-- GROUP BY (storage.foldername(name))[1], bucket_id;

-- ============================================
-- GRANTS DE PERMISSÃO
-- ============================================

GRANT EXECUTE ON FUNCTION public.get_public_url TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_old_file TO authenticated;

-- ============================================
-- CONFIGURAÇÃO COMPLETA
-- ============================================
-- Buckets criados: avatars, banners, gallery
-- Políticas RLS configuradas para acesso controlado
-- Limites de tamanho e tipo de arquivo definidos
-- Funções helper disponíveis
-- ============================================
