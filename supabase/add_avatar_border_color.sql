-- Adicionar campo avatar_border_color na tabela page_settings
ALTER TABLE page_settings 
ADD COLUMN IF NOT EXISTS avatar_border_color TEXT DEFAULT '#ffffff';

-- Comentário da coluna
COMMENT ON COLUMN page_settings.avatar_border_color IS 'Cor da borda do avatar em formato hexadecimal';
