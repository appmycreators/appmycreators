-- ============================================
-- FIX: Adicionar Políticas RLS para Galleries
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para corrigir o erro de criação de galerias
-- ============================================

-- ============================================
-- ADICIONAR CAMPOS FALTANTES EM GALLERY_ITEMS
-- ============================================
-- Adicionar description e price se não existirem
ALTER TABLE public.gallery_items 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS price TEXT;

-- ============================================
-- RLS POLICIES - GALLERIES
-- ============================================

-- Dropar políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own galleries" ON public.galleries;
DROP POLICY IF EXISTS "Anyone can view active page galleries" ON public.galleries;
DROP POLICY IF EXISTS "Users can manage own galleries" ON public.galleries;

-- Visualizar próprias galerias
CREATE POLICY "Users can view own galleries"
  ON public.galleries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON p.id = r.page_id
      WHERE r.id = galleries.resource_id
      AND p.user_id = auth.uid()
    )
  );

-- Qualquer um pode visualizar galerias de páginas ativas
CREATE POLICY "Anyone can view active page galleries"
  ON public.galleries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON p.id = r.page_id
      WHERE r.id = galleries.resource_id
      AND p.is_active = TRUE
    )
  );

-- Usuários podem gerenciar suas próprias galerias
CREATE POLICY "Users can manage own galleries"
  ON public.galleries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON p.id = r.page_id
      WHERE r.id = galleries.resource_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON p.id = r.page_id
      WHERE r.id = galleries.resource_id
      AND p.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - GALLERY ITEMS
-- ============================================

-- Dropar políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own gallery items" ON public.gallery_items;
DROP POLICY IF EXISTS "Anyone can view active page gallery items" ON public.gallery_items;
DROP POLICY IF EXISTS "Users can manage own gallery items" ON public.gallery_items;

-- Visualizar próprios items
CREATE POLICY "Users can view own gallery items"
  ON public.gallery_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.galleries g
      JOIN public.resources r ON r.id = g.resource_id
      JOIN public.pages p ON p.id = r.page_id
      WHERE g.id = gallery_items.gallery_id
      AND p.user_id = auth.uid()
    )
  );

-- Qualquer um pode visualizar items de páginas ativas
CREATE POLICY "Anyone can view active page gallery items"
  ON public.gallery_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.galleries g
      JOIN public.resources r ON r.id = g.resource_id
      JOIN public.pages p ON p.id = r.page_id
      WHERE g.id = gallery_items.gallery_id
      AND p.is_active = TRUE
    )
  );

-- Usuários podem gerenciar seus próprios items
CREATE POLICY "Users can manage own gallery items"
  ON public.gallery_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.galleries g
      JOIN public.resources r ON r.id = g.resource_id
      JOIN public.pages p ON p.id = r.page_id
      WHERE g.id = gallery_items.gallery_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.galleries g
      JOIN public.resources r ON r.id = g.resource_id
      JOIN public.pages p ON p.id = r.page_id
      WHERE g.id = gallery_items.gallery_id
      AND p.user_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICAR SE TUDO ESTÁ CORRETO
-- ============================================

-- Verificar políticas criadas para galleries
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'galleries';

-- Verificar políticas criadas para gallery_items
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'gallery_items';

-- Verificar estrutura da tabela gallery_items
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gallery_items'
ORDER BY ordinal_position;

-- ============================================
-- FIX COMPLETO! ✅
-- ============================================
-- Agora você pode criar galerias sem erro
-- ============================================
