-- Migration: Add social media icons customization colors to page_settings table
-- This allows users to customize the appearance of social media icons

-- Add social media color columns
ALTER TABLE page_settings
ADD COLUMN IF NOT EXISTS social_icon_bg_color TEXT,
ADD COLUMN IF NOT EXISTS social_icon_color TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN page_settings.social_icon_bg_color IS 'Background color for social media icon circles';
COMMENT ON COLUMN page_settings.social_icon_color IS 'Icon color for social media icons';
