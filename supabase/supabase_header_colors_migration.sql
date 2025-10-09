-- Migration: Add header color customization fields to page_settings table
-- Description: Adds header_name_color and header_bio_color columns to allow users to customize 
--              the text colors of profile name and bio in the header section

-- Add header_name_color column (stores hex color for profile name text)
ALTER TABLE page_settings 
ADD COLUMN IF NOT EXISTS header_name_color TEXT;

-- Add header_bio_color column (stores hex color for bio/description text)
ALTER TABLE page_settings 
ADD COLUMN IF NOT EXISTS header_bio_color TEXT;

-- Add comments for documentation
COMMENT ON COLUMN page_settings.header_name_color IS 'Text color for profile name in header (hex format, e.g., #ffffff)';
COMMENT ON COLUMN page_settings.header_bio_color IS 'Text color for bio/description in header (hex format, e.g., #000000)';
