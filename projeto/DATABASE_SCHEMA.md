# 🗄️ Database Schema - MyCreator Platform

## Overview
This document outlines the complete database structure for the MyCreator platform on Supabase.

---

## 📋 Tables Structure

### 1. **users** (extends Supabase Auth)
Stores additional user profile information beyond Supabase auth.users

```sql
users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `idx_users_username` on `username`
- `idx_users_email` on `email`

---

### 2. **pages**
Stores user pages (each user can have multiple pages)

```sql
pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Page',
  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `idx_pages_user_id` on `user_id`
- `idx_pages_slug` on `slug`
- `idx_pages_user_active` on `(user_id, is_active)`

**Constraints:**
- Only one primary page per user: `UNIQUE(user_id, is_primary) WHERE is_primary = TRUE`

---

### 3. **page_settings**
Stores page customization and header information

```sql
page_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL UNIQUE REFERENCES pages(id) ON DELETE CASCADE,
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
)
```

**Indexes:**
- `idx_page_settings_page_id` on `page_id`

---

### 4. **social_networks**
Stores social media links for each page

```sql
social_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter', 'tiktok', 'youtube', 'spotify', 'threads', 'telegram', 'email')),
  url TEXT NOT NULL,
  display_mode TEXT DEFAULT 'bottom' CHECK (display_mode IN ('top', 'bottom')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `idx_social_networks_page_id` on `page_id`
- `idx_social_networks_page_platform` on `(page_id, platform)`

**Constraints:**
- `UNIQUE(page_id, platform)` - One platform per page

---

### 5. **resources**
Generic table for all page resources (links, embeds, galleries, etc.)

```sql
resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('link', 'gallery', 'whatsapp', 'spotify', 'youtube', 'image_banner')),
  title TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `idx_resources_page_id` on `page_id`
- `idx_resources_page_order` on `(page_id, display_order)`
- `idx_resources_type` on `type`

---

### 6. **links**
Stores link button details (1:1 with resources where type='link')

```sql
links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL UNIQUE REFERENCES resources(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  icon TEXT,
  image_url TEXT,
  bg_color TEXT,
  hide_url BOOLEAN DEFAULT FALSE,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `idx_links_resource_id` on `resource_id`

---

### 7. **whatsapp_links**
Stores WhatsApp specific links (1:1 with resources where type='whatsapp')

```sql
whatsapp_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL UNIQUE REFERENCES resources(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message TEXT,
  image_url TEXT,
  bg_color TEXT,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `idx_whatsapp_links_resource_id` on `resource_id`

---

### 8. **spotify_embeds**
Stores Spotify embed details (1:1 with resources where type='spotify')

```sql
spotify_embeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL UNIQUE REFERENCES resources(id) ON DELETE CASCADE,
  spotify_url TEXT NOT NULL,
  embed_type TEXT CHECK (embed_type IN ('track', 'album', 'playlist', 'artist')),
  hide_url BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `idx_spotify_embeds_resource_id` on `resource_id`

---

### 9. **youtube_embeds**
Stores YouTube embed details (1:1 with resources where type='youtube')

```sql
youtube_embeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL UNIQUE REFERENCES resources(id) ON DELETE CASCADE,
  youtube_url TEXT NOT NULL,
  video_id TEXT NOT NULL,
  hide_url BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `idx_youtube_embeds_resource_id` on `resource_id`

---

### 10. **image_banners**
Stores image banner details (1:1 with resources where type='image_banner')

```sql
image_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL UNIQUE REFERENCES resources(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  link_url TEXT,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `idx_image_banners_resource_id` on `resource_id`

---

### 11. **galleries**
Stores gallery containers (1:1 with resources where type='gallery')

```sql
galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL UNIQUE REFERENCES resources(id) ON DELETE CASCADE,
  is_collapsed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `idx_galleries_resource_id` on `resource_id`

---

### 12. **gallery_items**
Stores individual items within galleries

```sql
gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  button_text TEXT DEFAULT 'Saiba Mais',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `idx_gallery_items_gallery_id` on `gallery_id`
- `idx_gallery_items_order` on `(gallery_id, display_order)`

---

## 🔐 Row Level Security (RLS) Policies

### Users Table
```sql
-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### Pages Table
```sql
-- Users can view their own pages
CREATE POLICY "Users can view own pages"
  ON pages FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view active pages by slug (public preview)
CREATE POLICY "Anyone can view active pages"
  ON pages FOR SELECT
  USING (is_active = TRUE);

-- Users can create their own pages
CREATE POLICY "Users can create own pages"
  ON pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pages
CREATE POLICY "Users can update own pages"
  ON pages FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own pages
CREATE POLICY "Users can delete own pages"
  ON pages FOR DELETE
  USING (auth.uid() = user_id);
```

### Page Settings, Resources, and Related Tables
Similar policies for:
- `page_settings`
- `social_networks`
- `resources`
- `links`
- `whatsapp_links`
- `spotify_embeds`
- `youtube_embeds`
- `image_banners`
- `galleries`
- `gallery_items`

**Pattern:** Users can CRUD their own data via page ownership, public can READ active pages

---

## 🔄 Relationships Summary

```
users (1) ──→ (N) pages
pages (1) ──→ (1) page_settings
pages (1) ──→ (N) social_networks
pages (1) ──→ (N) resources
resources (1) ──→ (1) [links | whatsapp_links | spotify_embeds | youtube_embeds | image_banners | galleries]
galleries (1) ──→ (N) gallery_items
```

---

## 📊 Migration Order

1. Enable UUID extension
2. Create `users` table (extends auth.users)
3. Create `pages` table
4. Create `page_settings` table
5. Create `social_networks` table
6. Create `resources` table
7. Create specific resource tables: `links`, `whatsapp_links`, `spotify_embeds`, `youtube_embeds`, `image_banners`, `galleries`
8. Create `gallery_items` table
9. Create all indexes
10. Enable RLS on all tables
11. Create RLS policies

---

## 🎯 Key Features

- ✅ Multi-page support per user
- ✅ Public page access via slug
- ✅ Flexible resource ordering
- ✅ Click tracking for links
- ✅ Full customization options
- ✅ Row-level security
- ✅ Cascading deletes
- ✅ Timestamp tracking

---

## 🚀 Next Steps

1. Run SQL migrations in Supabase
2. Set up Supabase client in React app
3. Create API service layer
4. Implement authentication flow
5. Build data sync functionality
