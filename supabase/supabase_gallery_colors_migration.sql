-- Migration: Add gallery product customization colors to page_settings table
-- This allows users to customize the appearance of product gallery items

-- Add gallery color columns
ALTER TABLE page_settings
ADD COLUMN IF NOT EXISTS gallery_title_color TEXT,
ADD COLUMN IF NOT EXISTS gallery_card_bg_color TEXT,
ADD COLUMN IF NOT EXISTS gallery_product_name_color TEXT,
ADD COLUMN IF NOT EXISTS gallery_product_description_color TEXT,
ADD COLUMN IF NOT EXISTS gallery_button_bg_color TEXT,
ADD COLUMN IF NOT EXISTS gallery_button_text_color TEXT,
ADD COLUMN IF NOT EXISTS gallery_price_color TEXT,
ADD COLUMN IF NOT EXISTS gallery_highlight_bg_color TEXT,
ADD COLUMN IF NOT EXISTS gallery_highlight_text_color TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN page_settings.gallery_title_color IS 'Text color for gallery title';
COMMENT ON COLUMN page_settings.gallery_card_bg_color IS 'Background color for gallery product cards';
COMMENT ON COLUMN page_settings.gallery_product_name_color IS 'Text color for product names in gallery';
COMMENT ON COLUMN page_settings.gallery_product_description_color IS 'Text color for product descriptions in gallery';
COMMENT ON COLUMN page_settings.gallery_button_bg_color IS 'Background color for gallery product buttons';
COMMENT ON COLUMN page_settings.gallery_button_text_color IS 'Text color for gallery product buttons';
COMMENT ON COLUMN page_settings.gallery_price_color IS 'Text color for product prices in gallery';
COMMENT ON COLUMN page_settings.gallery_highlight_bg_color IS 'Background color for highlighted product badge';
COMMENT ON COLUMN page_settings.gallery_highlight_text_color IS 'Text color for highlighted product badge';
