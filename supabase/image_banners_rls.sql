-- ============================================
-- RLS POLICIES FOR IMAGE_BANNERS
-- ============================================

-- Enable RLS
ALTER TABLE public.image_banners ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own image banners
CREATE POLICY "Users can view own image banners"
  ON public.image_banners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON p.id = r.page_id
      WHERE r.id = image_banners.resource_id
      AND p.user_id = auth.uid()
    )
  );

-- Policy: Anyone can view active page image banners
CREATE POLICY "Anyone can view active page image banners"
  ON public.image_banners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON p.id = r.page_id
      WHERE r.id = image_banners.resource_id
      AND p.is_active = TRUE
      AND r.is_visible = TRUE
    )
  );

-- Policy: Users can manage (INSERT, UPDATE, DELETE) their own image banners
CREATE POLICY "Users can manage own image banners"
  ON public.image_banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON p.id = r.page_id
      WHERE r.id = image_banners.resource_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON p.id = r.page_id
      WHERE r.id = image_banners.resource_id
      AND p.user_id = auth.uid()
    )
  );
