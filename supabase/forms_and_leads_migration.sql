-- ============================================
-- MIGRATION: Forms and Leads Feature
-- Description: Creates tables for form capture and lead management
-- ============================================

-- 1. Create 'forms' table (form resources)
-- Each form is associated with a resource (similar to gallery, link, etc.)
CREATE TABLE IF NOT EXISTS public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL UNIQUE,
  form_name TEXT NOT NULL,
  description TEXT,
  fields_config JSONB DEFAULT '{"name": true, "email": true, "phone": true}'::jsonb,
  submit_button_text TEXT DEFAULT 'Enviar',
  submit_button_color TEXT DEFAULT '#000000',
  success_message TEXT DEFAULT 'Obrigado! Seus dados foram enviados com sucesso.',
  success_button_text TEXT DEFAULT 'Enviar outro',
  success_button_color TEXT DEFAULT '#000000',
  success_bg_color TEXT DEFAULT '#f0f9ff',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT forms_resource_id_fkey FOREIGN KEY (resource_id) 
    REFERENCES public.resources(id) ON DELETE CASCADE
);

-- 2. Create 'form_leads' table
-- Stores captured leads for each form
CREATE TABLE IF NOT EXISTS public.form_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  additional_data JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT form_leads_form_id_fkey FOREIGN KEY (form_id) 
    REFERENCES public.forms(id) ON DELETE CASCADE
);

-- 3. Add 'form' to resources type constraint
-- Update the CHECK constraint to include 'form' type
ALTER TABLE public.resources 
  DROP CONSTRAINT IF EXISTS resources_type_check;

ALTER TABLE public.resources 
  ADD CONSTRAINT resources_type_check 
  CHECK (type = ANY (ARRAY['link'::text, 'gallery'::text, 'whatsapp'::text, 'spotify'::text, 'youtube'::text, 'image_banner'::text, 'form'::text]));

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forms_resource_id ON public.forms(resource_id);
CREATE INDEX IF NOT EXISTS idx_form_leads_form_id ON public.form_leads(form_id);
CREATE INDEX IF NOT EXISTS idx_form_leads_created_at ON public.form_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_leads_email ON public.form_leads(email);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_leads ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for 'forms'

-- Users can view their own forms (via resource -> page -> user ownership)
CREATE POLICY "Users can view own forms"
  ON public.forms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON r.page_id = p.id
      WHERE r.id = forms.resource_id
        AND p.user_id = auth.uid()
    )
  );

-- Anyone can view forms from active pages (for public form submission)
CREATE POLICY "Anyone can view forms from active pages"
  ON public.forms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON r.page_id = p.id
      WHERE r.id = forms.resource_id
        AND p.is_active = TRUE
        AND r.is_visible = TRUE
    )
  );

-- Users can insert forms on their own pages
CREATE POLICY "Users can create own forms"
  ON public.forms FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON r.page_id = p.id
      WHERE r.id = forms.resource_id
        AND p.user_id = auth.uid()
    )
  );

-- Users can update their own forms
CREATE POLICY "Users can update own forms"
  ON public.forms FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON r.page_id = p.id
      WHERE r.id = forms.resource_id
        AND p.user_id = auth.uid()
    )
  );

-- Users can delete their own forms
CREATE POLICY "Users can delete own forms"
  ON public.forms FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON r.page_id = p.id
      WHERE r.id = forms.resource_id
        AND p.user_id = auth.uid()
    )
  );

-- 7. Create RLS Policies for 'form_leads'

-- Users can view leads from their own forms
CREATE POLICY "Users can view own form leads"
  ON public.form_leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forms f
      JOIN public.resources r ON f.resource_id = r.id
      JOIN public.pages p ON r.page_id = p.id
      WHERE f.id = form_leads.form_id
        AND p.user_id = auth.uid()
    )
  );

-- Anyone can insert leads (public form submission)
CREATE POLICY "Anyone can submit form leads"
  ON public.form_leads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms f
      JOIN public.resources r ON f.resource_id = r.id
      JOIN public.pages p ON r.page_id = p.id
      WHERE f.id = form_leads.form_id
        AND p.is_active = TRUE
        AND r.is_visible = TRUE
    )
  );

-- Users can delete leads from their own forms
CREATE POLICY "Users can delete own form leads"
  ON public.form_leads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.forms f
      JOIN public.resources r ON f.resource_id = r.id
      JOIN public.pages p ON r.page_id = p.id
      WHERE f.id = form_leads.form_id
        AND p.user_id = auth.uid()
    )
  );

-- 8. Create function to get form leads with stats
CREATE OR REPLACE FUNCTION get_form_leads_with_stats(p_form_id UUID)
RETURNS TABLE (
  lead_id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  additional_data JSONB,
  created_at TIMESTAMPTZ,
  total_leads BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fl.id as lead_id,
    fl.name,
    fl.email,
    fl.phone,
    fl.additional_data,
    fl.created_at,
    COUNT(*) OVER() as total_leads
  FROM public.form_leads fl
  WHERE fl.form_id = p_form_id
  ORDER BY fl.created_at DESC;
END;
$$;

-- 9. Create function to get all forms with lead counts for a user
CREATE OR REPLACE FUNCTION get_user_forms_with_lead_counts(p_user_id UUID)
RETURNS TABLE (
  form_id UUID,
  resource_id UUID,
  page_id UUID,
  form_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ,
  lead_count BIGINT,
  last_lead_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as form_id,
    f.resource_id,
    r.page_id,
    f.form_name,
    f.description,
    f.created_at,
    COUNT(fl.id) as lead_count,
    MAX(fl.created_at) as last_lead_at
  FROM public.forms f
  JOIN public.resources r ON f.resource_id = r.id
  JOIN public.pages p ON r.page_id = p.id
  LEFT JOIN public.form_leads fl ON f.id = fl.form_id
  WHERE p.user_id = p_user_id
  GROUP BY f.id, f.resource_id, r.page_id, f.form_name, f.description, f.created_at
  ORDER BY f.created_at DESC;
END;
$$;

-- 10. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create triggers for updated_at
CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETED
-- ============================================
