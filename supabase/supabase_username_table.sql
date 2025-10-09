-- ============================================
-- TABELA USERNAMES - Sistema de Reserva de Username
-- ============================================
-- Esta tabela garante unicidade de usernames e impede edição
-- Execute este SQL APÓS o supabase_migration.sql principal
-- ============================================

-- Criar tabela de usernames
CREATE TABLE IF NOT EXISTS public.usernames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT username_lowercase CHECK (username = LOWER(username)),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]{3,30}$')
);

-- Índices para performance
CREATE INDEX idx_usernames_username ON public.usernames(username);
CREATE INDEX idx_usernames_user_id ON public.usernames(user_id);

-- Comentários para documentação
COMMENT ON TABLE public.usernames IS 'Tabela de reserva de usernames - não editável após criação';
COMMENT ON COLUMN public.usernames.username IS 'Username único do usuário - apenas minúsculas, números e underscore';
COMMENT ON COLUMN public.usernames.user_id IS 'Referência ao usuário autenticado';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.usernames ENABLE ROW LEVEL SECURITY;

-- Política: Usuário pode ver APENAS seu próprio username
CREATE POLICY "Users can view own username"
  ON public.usernames FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Qualquer pessoa autenticada pode ver todos os usernames (para verificar disponibilidade)
CREATE POLICY "Authenticated users can check username availability"
  ON public.usernames FOR SELECT
  TO authenticated
  USING (true);

-- Política: Apenas o sistema pode inserir (via trigger)
CREATE POLICY "Only system can insert usernames"
  ON public.usernames FOR INSERT
  WITH CHECK (false); -- Usuários não podem inserir diretamente

-- Política: Ninguém pode atualizar usernames
CREATE POLICY "Usernames cannot be updated"
  ON public.usernames FOR UPDATE
  USING (false);

-- Política: Apenas o sistema pode deletar (cascade)
CREATE POLICY "Only system can delete usernames"
  ON public.usernames FOR DELETE
  USING (false);

-- ============================================
-- FUNÇÃO: Verificar disponibilidade de username
-- ============================================

CREATE OR REPLACE FUNCTION public.check_username_available(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Normalizar username para lowercase
  username_to_check := LOWER(TRIM(username_to_check));
  
  -- Verificar formato
  IF NOT (username_to_check ~ '^[a-z0-9_]{3,30}$') THEN
    RAISE EXCEPTION 'Username inválido. Use apenas letras minúsculas, números e underscore (3-30 caracteres).';
  END IF;
  
  -- Verificar se já existe
  RETURN NOT EXISTS (
    SELECT 1 FROM public.usernames WHERE username = username_to_check
  );
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION public.check_username_available IS 'Verifica se um username está disponível para uso';

-- ============================================
-- FUNÇÃO: Obter username por user_id
-- ============================================

CREATE OR REPLACE FUNCTION public.get_username_by_user_id(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_username TEXT;
BEGIN
  SELECT username INTO v_username
  FROM public.usernames
  WHERE user_id = p_user_id;
  
  RETURN v_username;
END;
$$;

-- ============================================
-- ATUALIZAR TRIGGER: Criar username ao criar usuário
-- ============================================

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Nova função que cria user E username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Extrair username do metadata ou gerar a partir do email
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  -- Normalizar para lowercase
  v_username := LOWER(TRIM(v_username));
  
  -- Validar formato
  IF NOT (v_username ~ '^[a-z0-9_]{3,30}$') THEN
    RAISE EXCEPTION 'Username inválido: %', v_username;
  END IF;
  
  -- Verificar se username já existe (adicionar sufixo se necessário)
  WHILE EXISTS (SELECT 1 FROM public.usernames WHERE username = v_username) LOOP
    v_username := v_username || floor(random() * 1000)::TEXT;
  END LOOP;
  
  -- Inserir na tabela usernames PRIMEIRO (para garantir unicidade)
  INSERT INTO public.usernames (username, user_id)
  VALUES (v_username, NEW.id);
  
  -- Depois inserir na tabela users
  INSERT INTO public.users (id, username, email, avatar_url)
  VALUES (
    NEW.id,
    v_username,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Username já está em uso';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao criar perfil: %', SQLERRM;
END;
$$;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNÇÃO RPC: Verificar username (para frontend)
-- ============================================

CREATE OR REPLACE FUNCTION public.rpc_check_username(p_username TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available BOOLEAN;
  v_message TEXT;
BEGIN
  -- Normalizar
  p_username := LOWER(TRIM(p_username));
  
  -- Validar formato
  IF length(p_username) < 3 THEN
    RETURN json_build_object(
      'available', false,
      'message', 'Username deve ter pelo menos 3 caracteres'
    );
  END IF;
  
  IF length(p_username) > 30 THEN
    RETURN json_build_object(
      'available', false,
      'message', 'Username deve ter no máximo 30 caracteres'
    );
  END IF;
  
  IF NOT (p_username ~ '^[a-z0-9_]+$') THEN
    RETURN json_build_object(
      'available', false,
      'message', 'Username só pode conter letras minúsculas, números e underscore'
    );
  END IF;
  
  -- Verificar disponibilidade
  v_available := NOT EXISTS (
    SELECT 1 FROM public.usernames WHERE username = p_username
  );
  
  IF v_available THEN
    v_message := 'Username disponível! ✓';
  ELSE
    v_message := 'Username já está em uso';
  END IF;
  
  RETURN json_build_object(
    'available', v_available,
    'message', v_message,
    'username', p_username
  );
END;
$$;

-- ============================================
-- GRANTS DE PERMISSÃO
-- ============================================

GRANT SELECT ON public.usernames TO authenticated;
GRANT SELECT ON public.usernames TO anon;
GRANT EXECUTE ON FUNCTION public.check_username_available TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_username_available TO anon;
GRANT EXECUTE ON FUNCTION public.rpc_check_username TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_check_username TO anon;

-- ============================================
-- DADOS DE TESTE (OPCIONAL - REMOVER EM PRODUÇÃO)
-- ============================================

-- Exemplo de como testar:
-- SELECT public.rpc_check_username('meuuser');
-- SELECT public.rpc_check_username('user_123');
-- SELECT public.rpc_check_username('UPPERCASE'); -- será normalizado

-- ============================================
-- VALIDAÇÕES ADICIONAIS
-- ============================================

-- Lista de usernames reservados/proibidos
CREATE TABLE IF NOT EXISTS public.reserved_usernames (
  username TEXT PRIMARY KEY,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.reserved_usernames (username, reason)
VALUES
  ('admin', 'Sistema'),
  ('root', 'Sistema'),
  ('api', 'Sistema'),
  ('app', 'Sistema'),
  ('login', 'Rota'),
  ('signup', 'Rota'),
  ('logout', 'Rota'),
  ('preview', 'Rota'),
  ('settings', 'Rota'),
  ('profile', 'Rota'),
  ('dashboard', 'Rota'),
  ('mycreator', 'Marca'),
  ('mycreators', 'Marca'),
  ('support', 'Sistema'),
  ('help', 'Sistema'),
  ('contact', 'Sistema'),
  ('abuse', 'Sistema'),
  ('terms', 'Sistema'),
  ('privacy', 'Sistema')
ON CONFLICT (username) DO NOTHING;

-- Atualizar função de verificação para incluir reservados
CREATE OR REPLACE FUNCTION public.rpc_check_username(p_username TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available BOOLEAN;
  v_message TEXT;
BEGIN
  -- Normalizar
  p_username := LOWER(TRIM(p_username));
  
  -- Validar formato
  IF length(p_username) < 3 THEN
    RETURN json_build_object(
      'available', false,
      'message', 'Username deve ter pelo menos 3 caracteres'
    );
  END IF;
  
  IF length(p_username) > 30 THEN
    RETURN json_build_object(
      'available', false,
      'message', 'Username deve ter no máximo 30 caracteres'
    );
  END IF;
  
  IF NOT (p_username ~ '^[a-z0-9_]+$') THEN
    RETURN json_build_object(
      'available', false,
      'message', 'Username só pode conter letras minúsculas, números e underscore'
    );
  END IF;
  
  -- Verificar se é reservado
  IF EXISTS (SELECT 1 FROM public.reserved_usernames WHERE username = p_username) THEN
    RETURN json_build_object(
      'available', false,
      'message', 'Este username está reservado'
    );
  END IF;
  
  -- Verificar disponibilidade
  v_available := NOT EXISTS (
    SELECT 1 FROM public.usernames WHERE username = p_username
  );
  
  IF v_available THEN
    v_message := 'Username disponível! ✓';
  ELSE
    v_message := 'Username já está em uso';
  END IF;
  
  RETURN json_build_object(
    'available', v_available,
    'message', v_message,
    'username', p_username
  );
END;
$$;

-- ============================================
-- MIGRATION COMPLETA
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Depois de executar o supabase_migration.sql principal
-- ============================================
