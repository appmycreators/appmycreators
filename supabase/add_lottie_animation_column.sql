-- Adicionar coluna lottie_animation na tabela gallery_items
ALTER TABLE gallery_items
ADD COLUMN IF NOT EXISTS lottie_animation TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN gallery_items.lottie_animation IS 'Nome da animação Lottie para exibir no card do produto (ex: discount)';
