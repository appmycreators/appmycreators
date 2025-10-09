-- Migration: Add card color customization fields to page_settings table
-- Description: Adds card_bg_color and card_text_color columns to allow users to customize 
--              the background and text colors of gallery product cards

-- Add card_bg_color column (stores hex color for card background)
ALTER TABLE page_settings 
ADD COLUMN IF NOT EXISTS card_bg_color TEXT;

-- Add card_text_color column (stores hex color for card text)
ALTER TABLE page_settings 
ADD COLUMN IF NOT EXISTS card_text_color TEXT;

-- Add comments for documentation
COMMENT ON COLUMN page_settings.card_bg_color IS 'Background color for gallery product cards (hex format, e.g., #ffffff)';
COMMENT ON COLUMN page_settings.card_text_color IS 'Text color for gallery product cards (hex format, e.g., #000000)';
