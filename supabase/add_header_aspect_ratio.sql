-- Adicionar campo para armazenar a proporção do header media
ALTER TABLE page_settings 
ADD COLUMN IF NOT EXISTS header_media_aspect_ratio TEXT 
CHECK (header_media_aspect_ratio IN ('1:1', '4:5', '16:9', '9:16'));

-- Adicionar comentário explicativo
COMMENT ON COLUMN page_settings.header_media_aspect_ratio IS 'Proporção da imagem/vídeo do header (1:1, 4:5, 16:9, 9:16)';

-- Atualizar registros existentes com proporção padrão 16:9
UPDATE page_settings 
SET header_media_aspect_ratio = '16:9' 
WHERE header_media_url IS NOT NULL 
AND header_media_aspect_ratio IS NULL;
