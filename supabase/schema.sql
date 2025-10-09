-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.galleries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL UNIQUE,
  is_collapsed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT galleries_pkey PRIMARY KEY (id),
  CONSTRAINT galleries_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id)
);
CREATE TABLE public.gallery_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL,
  name text NOT NULL,
  image_url text NOT NULL,
  link_url text NOT NULL,
  button_text text DEFAULT 'Saiba Mais'::text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  description text,
  price text,
  destaque boolean DEFAULT false,
  CONSTRAINT gallery_items_pkey PRIMARY KEY (id),
  CONSTRAINT gallery_items_gallery_id_fkey FOREIGN KEY (gallery_id) REFERENCES public.galleries(id)
);
CREATE TABLE public.image_banners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL UNIQUE,
  image_url text NOT NULL,
  link_url text,
  alt_text text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT image_banners_pkey PRIMARY KEY (id),
  CONSTRAINT image_banners_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id)
);
CREATE TABLE public.links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL UNIQUE,
  url text NOT NULL,
  icon text,
  image_url text,
  bg_color text,
  hide_url boolean DEFAULT false,
  click_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT links_pkey PRIMARY KEY (id),
  CONSTRAINT links_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id)
);
CREATE TABLE public.page_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL UNIQUE,
  profile_name text,
  bio text,
  avatar_url text,
  header_media_url text,
  header_media_type text CHECK (header_media_type = ANY (ARRAY['image'::text, 'video'::text, 'gif'::text])),
  background_color text,
  background_gradient text,
  theme text DEFAULT 'light'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  card_bg_color text,
  card_text_color text,
  header_name_color text,
  header_bio_color text,
  show_badge_check boolean DEFAULT false,
  gallery_card_bg_color text,
  gallery_product_name_color text,
  gallery_product_description_color text,
  gallery_button_bg_color text,
  gallery_button_text_color text,
  gallery_price_color text,
  gallery_highlight_bg_color text,
  gallery_highlight_text_color text,
  gallery_title_color text,
  social_icon_bg_color text,
  social_icon_color text,
  CONSTRAINT page_settings_pkey PRIMARY KEY (id),
  CONSTRAINT page_settings_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id)
);
CREATE TABLE public.pages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT 'My Page'::text,
  is_active boolean DEFAULT true,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pages_pkey PRIMARY KEY (id),
  CONSTRAINT pages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.reserved_usernames (
  username text NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reserved_usernames_pkey PRIMARY KEY (username)
);
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['link'::text, 'gallery'::text, 'whatsapp'::text, 'spotify'::text, 'youtube'::text, 'image_banner'::text])),
  title text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT resources_pkey PRIMARY KEY (id),
  CONSTRAINT resources_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id)
);
CREATE TABLE public.social_networks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL,
  platform text NOT NULL CHECK (platform = ANY (ARRAY['instagram'::text, 'facebook'::text, 'twitter'::text, 'tiktok'::text, 'youtube'::text, 'spotify'::text, 'threads'::text, 'telegram'::text, 'email'::text])),
  url text NOT NULL,
  display_mode text DEFAULT 'bottom'::text CHECK (display_mode = ANY (ARRAY['top'::text, 'bottom'::text])),
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT social_networks_pkey PRIMARY KEY (id),
  CONSTRAINT social_networks_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id)
);
CREATE TABLE public.spotify_embeds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL UNIQUE,
  spotify_url text NOT NULL,
  embed_type text CHECK (embed_type = ANY (ARRAY['track'::text, 'album'::text, 'playlist'::text, 'artist'::text])),
  hide_url boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT spotify_embeds_pkey PRIMARY KEY (id),
  CONSTRAINT spotify_embeds_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id)
);
CREATE TABLE public.usernames (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE CHECK (username = lower(username)),
  user_id uuid NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT usernames_pkey PRIMARY KEY (id),
  CONSTRAINT usernames_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.whatsapp_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL UNIQUE,
  phone_number text NOT NULL,
  message text,
  image_url text,
  bg_color text,
  click_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT whatsapp_links_pkey PRIMARY KEY (id),
  CONSTRAINT whatsapp_links_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id)
);
CREATE TABLE public.youtube_embeds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL UNIQUE,
  youtube_url text NOT NULL,
  video_id text NOT NULL,
  hide_url boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT youtube_embeds_pkey PRIMARY KEY (id),
  CONSTRAINT youtube_embeds_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id)
);