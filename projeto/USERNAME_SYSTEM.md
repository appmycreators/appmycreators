# 🔐 Sistema de Username - Documentação Completa

## 📋 Visão Geral

O sistema de username garante que cada usuário tenha um identificador único e imutável após o cadastro. O username não pode ser editado depois de criado, garantindo consistência para URLs públicas e menções.

---

## 🏗️ Arquitetura

### Tabela `usernames`

```sql
CREATE TABLE usernames (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Características:**
- ✅ Username único no sistema
- ✅ Um username por usuário
- ✅ Apenas leitura após criação
- ✅ Formato: `[a-z0-9_]{3,30}`
- ✅ Sempre lowercase

---

## 🔒 Regras de Negócio

### 1. Formato Válido
```
✅ joaosilva
✅ maria_123
✅ user_name_2024
❌ JoaoSilva (maiúsculas)
❌ joão-silva (caracteres especiais)
❌ jo (menos de 3 caracteres)
```

### 2. Usernames Reservados

A tabela `reserved_usernames` contém nomes proibidos:
- `admin`, `root`, `api`
- `login`, `signup`, `logout`
- `mycreator`, `mycreators`
- `support`, `help`, `contact`
- Rotas do sistema

### 3. Verificação em Tempo Real

Durante o cadastro:
1. Validação de formato (frontend)
2. Verificação de disponibilidade (backend)
3. Feedback visual instantâneo

---

## 🎯 Fluxo de Cadastro

```
1. Usuário digita username
   ↓
2. Validação local (formato)
   ↓
3. Debounce 500ms
   ↓
4. Consulta RPC: rpc_check_username()
   ↓
5. Feedback visual (✓ ou ✗)
   ↓
6. Usuário completa formulário
   ↓
7. Submit → Supabase Auth
   ↓
8. Trigger: handle_new_user()
   ↓
9. Insere em usernames + users
   ↓
10. Username registrado! ✓
```

---

## 🛠️ Implementação

### Backend (Supabase)

#### Função RPC: Verificar Disponibilidade

```sql
SELECT public.rpc_check_username('meuusuario');

-- Retorna:
{
  "available": true,
  "message": "Username disponível! ✓",
  "username": "meuusuario"
}
```

#### Trigger Automático

Quando um usuário se registra no Supabase Auth:
1. Função `handle_new_user()` é executada
2. Extrai username do metadata
3. Normaliza para lowercase
4. Verifica disponibilidade
5. Adiciona sufixo se necessário (ex: `user123`)
6. Insere em `usernames` e `users`

### Frontend (React)

#### Hook de Verificação

```typescript
import { UsernameService } from '@/services/supabaseService';

// Verificar disponibilidade
const result = await UsernameService.checkAvailability('meuuser');
console.log(result.available); // true ou false
console.log(result.message); // Mensagem amigável

// Validar formato localmente
const validation = UsernameService.validateFormat('meuuser');
console.log(validation.valid); // true ou false
```

#### Componente Signup

- Campo com validação em tempo real
- Debounce de 500ms para evitar muitas requisições
- Ícones de status: Loading, Check, X
- Mensagens descritivas
- Bloqueio de submit se username inválido

---

## 🔐 Segurança (RLS)

### Políticas de Acesso

```sql
-- Usuário pode ver apenas seu próprio username
CREATE POLICY "Users can view own username"
  ON usernames FOR SELECT
  USING (auth.uid() = user_id);

-- Qualquer um pode verificar disponibilidade
CREATE POLICY "Check availability"
  ON usernames FOR SELECT
  TO authenticated
  USING (true);

-- Ninguém pode inserir/atualizar/deletar diretamente
CREATE POLICY "No manual changes"
  ON usernames FOR ALL
  USING (false);
```

**Proteções:**
- ✅ Apenas triggers do sistema podem inserir
- ✅ Nenhuma edição manual permitida
- ✅ Usuários podem apenas consultar
- ✅ Verificação de disponibilidade pública

---

## 📝 Exemplos de Uso

### 1. Cadastro de Novo Usuário

```typescript
// Em Signup.tsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validar formato
  const validation = UsernameService.validateFormat(username);
  if (!validation.valid) {
    toast.error(validation.message);
    return;
  }
  
  // Verificar disponibilidade
  const check = await UsernameService.checkAvailability(username);
  if (!check.available) {
    toast.error(check.message);
    return;
  }
  
  // Cadastrar no Supabase Auth
  await signUp(email, password, username);
};
```

### 2. Obter Username do Usuário Logado

```typescript
// Em qualquer componente
import { UsernameService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';

const { user } = useAuth();
const username = await UsernameService.getUserUsername(user.id);
console.log(username); // "joaosilva"
```

### 3. Verificar Disponibilidade

```typescript
const checkUsername = async (username: string) => {
  const result = await UsernameService.checkAvailability(username);
  
  if (result.available) {
    console.log('✓ Disponível!');
  } else {
    console.log('✗ Já existe:', result.message);
  }
};
```

---

## 🧪 Testes

### Testar no SQL Editor

```sql
-- 1. Verificar usernames existentes
SELECT * FROM public.usernames;

-- 2. Testar função de verificação
SELECT public.rpc_check_username('testuser');
SELECT public.rpc_check_username('admin'); -- Deve retornar reservado

-- 3. Ver usernames reservados
SELECT * FROM public.reserved_usernames;

-- 4. Buscar por user_id
SELECT username FROM public.usernames WHERE user_id = 'uuid-do-usuario';
```

### Testar no Frontend

1. Acesse `/signup`
2. Digite um username válido → deve mostrar ✓ verde
3. Digite um username existente → deve mostrar ✗ vermelho
4. Digite username reservado (`admin`) → mensagem de reservado
5. Digite caracteres inválidos → validação local
6. Complete o cadastro → username salvo automaticamente

---

## 🚨 Solução de Problemas

### Problema: Username não está sendo salvo

**Causa**: Trigger não executado ou erro na função

**Solução**:
```sql
-- Verificar se trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Problema: Erro "Username já está em uso" mas não existe

**Causa**: Cache ou inconsistência de dados

**Solução**:
```sql
-- Verificar duplicatas
SELECT username, COUNT(*) 
FROM public.usernames 
GROUP BY username 
HAVING COUNT(*) > 1;

-- Limpar se necessário (CUIDADO!)
DELETE FROM public.usernames 
WHERE id NOT IN (
  SELECT MIN(id) FROM public.usernames GROUP BY username
);
```

### Problema: Verificação de username não funciona

**Causa**: Função RPC não existe ou sem permissões

**Solução**:
```sql
-- Verificar se função existe
SELECT * FROM pg_proc WHERE proname = 'rpc_check_username';

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.rpc_check_username TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_check_username TO anon;
```

---

## 📊 Consultas Úteis

```sql
-- Total de usernames cadastrados
SELECT COUNT(*) FROM public.usernames;

-- Usernames mais recentes
SELECT username, created_at 
FROM public.usernames 
ORDER BY created_at DESC 
LIMIT 10;

-- Buscar username por padrão
SELECT * FROM public.usernames 
WHERE username LIKE 'user%';

-- Ver usuários sem username (erro!)
SELECT u.id, u.email 
FROM auth.users u 
LEFT JOIN public.usernames un ON u.id = un.user_id 
WHERE un.id IS NULL;
```

---

## 🎨 Customização

### Adicionar Novos Usernames Reservados

```sql
INSERT INTO public.reserved_usernames (username, reason)
VALUES 
  ('vip', 'Plano VIP'),
  ('pro', 'Plano Pro'),
  ('premium', 'Plano Premium')
ON CONFLICT (username) DO NOTHING;
```

### Mudar Comprimento Mínimo

```sql
-- Alterar constraint
ALTER TABLE public.usernames 
DROP CONSTRAINT IF EXISTS username_format;

ALTER TABLE public.usernames 
ADD CONSTRAINT username_format 
CHECK (username ~ '^[a-z0-9_]{5,30}$'); -- Agora 5-30 caracteres
```

### Permitir Pontos (.)

```sql
-- Atualizar regex
ALTER TABLE public.usernames 
DROP CONSTRAINT IF EXISTS username_format;

ALTER TABLE public.usernames 
ADD CONSTRAINT username_format 
CHECK (username ~ '^[a-z0-9_.]{3,30}$'); -- Agora permite ponto
```

---

## 📈 Métricas e Monitoramento

### Dashboard de Usernames

```sql
-- Estatísticas gerais
SELECT 
  COUNT(*) as total_usernames,
  COUNT(DISTINCT user_id) as total_users,
  MIN(created_at) as first_username,
  MAX(created_at) as last_username
FROM public.usernames;

-- Usernames por dia (últimos 7 dias)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as count
FROM public.usernames
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Comprimento médio de usernames
SELECT AVG(LENGTH(username)) as avg_length
FROM public.usernames;
```

---

## ✅ Checklist de Implementação

- [x] Criar tabela `usernames`
- [x] Criar tabela `reserved_usernames`
- [x] Implementar função `rpc_check_username`
- [x] Criar trigger `handle_new_user`
- [x] Configurar RLS policies
- [x] Implementar `UsernameService` no frontend
- [x] Adicionar validação em tempo real no Signup
- [x] Testar fluxo completo de cadastro
- [ ] Adicionar testes automatizados
- [ ] Documentar API pública

---

## 🔮 Próximos Passos

1. **URLs Públicas**: Usar username para páginas públicas (`/u/:username`)
2. **Sistema de Menções**: `@username` em comentários
3. **Busca de Usuários**: Autocomplete por username
4. **Vanity URLs**: Permitir slug customizado (além do username)
5. **Username History**: Log de tentativas de uso (analytics)

---

## 📚 Referências

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/triggers.html)
- [Regex PostgreSQL](https://www.postgresql.org/docs/current/functions-matching.html)
