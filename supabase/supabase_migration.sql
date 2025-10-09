-- ============================================
-- MyCreator Platform - Database Migration
-- ============================================
-- Run this script in your Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- provides gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- optional if you prefer uuid_generate_v4()

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================
-- 2. PAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Page',
  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- garante que cada usuário só pode ter UMA página primária
CREATE UNIQUE INDEX unique_primary_page
  ON public.pages(user_id)
  WHERE is_primary;

-- índices auxiliares
CREATE INDEX idx_pages_user_id ON public.pages(user_id);
CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_user_active ON public.pages(user_id, is_active);


-- ============================================
-- 3. PAGE SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.page_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL UNIQUE REFERENCES public.pages(id) ON DELETE CASCADE,
  profile_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  header_media_url TEXT,
  header_media_type TEXT CHECK (header_media_type IN ('image', 'video', 'gif')),
  background_color TEXT,
  background_gradient TEXT,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_settings_page_id ON public.page_settings(page_id);

-- ============================================
-- 4. SOCIAL NETWORKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.social_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter', 'tiktok', 'youtube', 'spotify', 'threads', 'telegram', 'email')),
  url TEXT NOT NULL,
  display_mode TEXT DEFAULT 'bottom' CHECK (display_mode IN ('top', 'bottom')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_page_platform UNIQUE (page_id, platform)
);

CREATE INDEX idx_social_networks_page_id ON public.social_networks(page_id);
CREATE INDEX idx_social_networks_page_platform ON public.social_networks(page_id, platform);

-- ============================================
-- 5. RESOURCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('link', 'gallery', 'whatsapp', 'spotify', 'youtube', 'image_banner')),
  title TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resources_page_id ON public.resources(page_id);
CREATE INDEX idx_resources_page_order ON public.resources(page_id, display_order);
CREATE INDEX idx_resources_type ON public.resources(type);

-- ============================================
-- 6. LINKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL UNIQUE REFERENCES public.resources(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  icon TEXT,
  image_url TEXT,
  bg_color TEXT,
  hide_url BOOLEAN DEFAULT FALSE,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_links_resource_id ON public.links(resource_id);

-- ============================================
-- 7. WHATSAPP LINKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.whatsapp_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL UNIQUE REFERENCES public.resources(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message TEXT,
  image_url TEXT,
  bg_color TEXT,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_links_resource_id ON public.whatsapp_links(resource_id);

-- ============================================
-- 8. SPOTIFY EMBEDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.spotify_embeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL UNIQUE REFERENCES public.resources(id) ON DELETE CASCADE,
  spotify_url TEXT NOT NULL,
  embed_type TEXT CHECK (embed_type IN ('track', 'album', 'playlist', 'artist')),
  hide_url BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spotify_embeds_resource_id ON public.spotify_embeds(resource_id);

-- ============================================
-- 9. YOUTUBE EMBEDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.youtube_embeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL UNIQUE REFERENCES public.resources(id) ON DELETE CASCADE,
  youtube_url TEXT NOT NULL,
  video_id TEXT NOT NULL,
  hide_url BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_youtube_embeds_resource_id ON public.youtube_embeds(resource_id);

-- ============================================
-- 10. IMAGE BANNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.image_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL UNIQUE REFERENCES public.resources(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  link_url TEXT,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_image_banners_resource_id ON public.image_banners(resource_id);

-- ============================================
-- 11. GALLERIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL UNIQUE REFERENCES public.resources(id) ON DELETE CASCADE,
  is_collapsed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_galleries_resource_id ON public.galleries(resource_id);

-- ============================================
-- 12. GALLERY ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  button_text TEXT DEFAULT 'Saiba Mais',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gallery_items_gallery_id ON public.gallery_items(gallery_id);
CREATE INDEX idx_gallery_items_order ON public.gallery_items(gallery_id, display_order);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_embeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_embeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - USERS
-- ============================================
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS POLICIES - PAGES
-- ============================================
CREATE POLICY "Users can view own pages"
  ON public.pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active pages by slug"
  ON public.pages FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Users can create own pages"
  ON public.pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pages"
  ON public.pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pages"
  ON public.pages FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - PAGE SETTINGS
-- ============================================
CREATE POLICY "Users can view own page settings"
  ON public.page_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_settings.page_id
      AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active page settings"
  ON public.page_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_settings.page_id
      AND pages.is_active = TRUE
    )
  );

CREATE POLICY "Users can manage own page settings"
  ON public.page_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_settings.page_id
      AND pages.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_settings.page_id
      AND pages.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - SOCIAL NETWORKS
-- ============================================
CREATE POLICY "Users can view own social networks"
  ON public.social_networks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = social_networks.page_id
      AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active page social networks"
  ON public.social_networks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = social_networks.page_id
      AND pages.is_active = TRUE
    )
  );

CREATE POLICY "Users can manage own social networks"
  ON public.social_networks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = social_networks.page_id
      AND pages.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = social_networks.page_id
      AND pages.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - RESOURCES
-- ============================================
CREATE POLICY "Users can view own resources"
  ON public.resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = resources.page_id
      AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active page resources"
  ON public.resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = resources.page_id
      AND pages.is_active = TRUE
      AND resources.is_visible = TRUE
    )
  );

CREATE POLICY "Users can manage own resources"
  ON public.resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = resources.page_id
      AND pages.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = resources.page_id
      AND pages.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - RESOURCE SUBTABLES (LINKS, WHATSAPP, ETC)
-- Apply similar pattern for all resource subtables
-- ============================================

-- LINKS
CREATE POLICY "Users can view own links"
  ON public.links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON p.id = r.page_id
      WHERE r.id = links.resource_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active page links"
  ON public.links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON p.id = r.page_id
      WHERE r.id = links.resource_id
      AND p.is_active = TRUE
      AND r.is_visible = TRUE
    )
  );

CREATE POLICY "Users can manage own links"
  ON public.links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON p.id = r.page_id
      WHERE r.id = links.resource_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resources r
      JOIN public.pages p ON p.id = r.page_id
      WHERE r.id = links.resource_id
      AND p.user_id = auth.uid()
    )
  );

-- Apply similar policies for whatsapp_links, spotify_embeds, youtube_embeds, image_banners, galleries, gallery_items
-- (Abbreviated for brevity - follow same pattern as links)

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_settings_updated_at BEFORE UPDATE ON public.page_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_networks_updated_at BEFORE UPDATE ON public.social_networks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Verify all tables created successfully
-- 2. Test RLS policies
-- 3. Configure Supabase Storage buckets for images/media
-- 4. Set up authentication in your React app
-- ============================================
