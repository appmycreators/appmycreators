-- Migration: Add show_badge_check column to page_settings table
-- This column controls whether the verified badge is displayed next to the profile name

-- Add the show_badge_check column
ALTER TABLE page_settings
ADD COLUMN IF NOT EXISTS show_badge_check BOOLEAN DEFAULT false;

-- Update existing records to have the default value
UPDATE page_settings
SET show_badge_check = false
WHERE show_badge_check IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN page_settings.show_badge_check IS 'Controls whether the verified badge (BadgeCheck) is displayed next to the profile name on the public page';
