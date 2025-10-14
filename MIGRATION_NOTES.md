# 🔄 Migration: Suporte a Múltiplas Páginas por Usuário

## 📋 Contexto

**Antes:** Um usuário tinha apenas 1 página, identificada por `username`
**Agora:** Um usuário pode ter múltiplas páginas, cada uma com seu próprio `slug`

## 🎯 Mudanças Implementadas

### 1. Frontend (✅ Completo)

#### Arquivos Modificados:
- `src/App.tsx` - Rota alterada de `/:username` para `/:slug`
- `src/components/PublicPage.tsx` - useParams agora pega `slug` ao invés de `username`
- `src/hooks/usePublicPage.ts` - Chamada RPC agora usa `get_public_page_data_by_slug` com parâmetro `p_slug`
- `src/services/supabaseService.ts` - Adicionado método `getDashboardDataByPageId()`
- `src/hooks/usePage.ts` - Adicionado suporte a query param `?pageId=`
- `src/pages/MyPages.tsx` - Botão "Editar" agora navega com `?pageId=` específico
- `src/components/ui/topbar.tsx` - Botão "Compartilhar" usa `slug` da página atual
- `src/components/layout/ViewPageButton.tsx` - Botão "Ver minha página" usa `slug` da página atual
- `src/components/ShareModal.tsx` - Modal de compartilhamento usa `slug` ao invés de `username`
- `src/components/MainContent.tsx` - Passa `slug` da página atual para componentes filhos

### 2. Backend - Supabase (❌ PENDENTE - AÇÃO NECESSÁRIA)

#### ⚠️ IMPORTANTE: Você precisa executar 2 migrations no Supabase

**Arquivos:**
1. `MIGRATION_get_public_page_data_by_slug.sql` - Para páginas públicas
2. `MIGRATION_get_dashboard_page_data_by_page_id.sql` - Para dashboard/editor

**Passos:**
1. Abra o Supabase Dashboard → SQL Editor
2. Execute primeiro: `MIGRATION_get_public_page_data_by_slug.sql`
3. Execute depois: `MIGRATION_get_dashboard_page_data_by_page_id.sql`

**O que as funções fazem:**

**`get_public_page_data_by_slug`:**
- Busca a página pelo `slug` (tabela `pages.slug`)
- Retorna todos os dados da página (settings, resources, galleries, social_networks)
- Permite acesso público (anon + authenticated)
- **Uso:** Páginas públicas `mycreators.me/slug`

**`get_dashboard_page_data_by_page_id`:**
- Busca a página pelo `page_id` e valida que pertence ao `user_id`
- Retorna todos os dados em uma única query otimizada
- **Antes:** Fazia 5+ queries separadas no TypeScript
- **Agora:** 1 única query SQL otimizada
- **Uso:** Dashboard/Editor quando edita página específica `/?pageId=abc123`

## 🔍 Como Funciona Agora

### Fluxo de Acesso Público:
```
URL: mycreators.me/daniel
         ↓
Route: /:slug (slug = "daniel")
         ↓
usePublicPage(slug)
         ↓
RPC: get_public_page_data_by_slug({ p_slug: "daniel" })
         ↓
SQL: SELECT * FROM pages WHERE slug = 'daniel'
         ↓
Retorna dados da página específica
```

### Fluxo de Edição:
```
MyPages → Clica "Editar" em página ID = abc123
         ↓
navigate("/?pageId=abc123")
         ↓
usePage detecta pageId nos query params
         ↓
getDashboardDataByPageId(userId, "abc123")
         ↓
RPC: get_dashboard_page_data_by_page_id({ p_user_id, p_page_id })
         ↓
SQL: SELECT * com validação de ownership
         ↓
Carrega dados da página específica para edição (1 query otimizada)
```

## 🚀 Benefícios

1. ✅ **Múltiplas páginas por usuário** - Cada usuário pode criar várias páginas
2. ✅ **Slugs únicos** - Cada página tem seu próprio slug personalizado
3. ✅ **Edição específica** - Pode editar qualquer página sem confusão
4. ✅ **URLs limpas** - `mycreators.me/nomepagina` ao invés de `mycreators.me/username`
5. ✅ **Performance otimizada** - 1 query RPC ao invés de 5+ queries separadas no TypeScript
6. ✅ **Segurança** - Validação de ownership no servidor (usuário só acessa suas páginas)

## ⚡ Próximos Passos

1. **EXECUTAR** migrations SQL no Supabase:
   - `MIGRATION_get_public_page_data_by_slug.sql`
   - `MIGRATION_get_dashboard_page_data_by_page_id.sql`
2. **TESTAR** acesso a páginas públicas por slug
3. **TESTAR** edição de páginas específicas com `?pageId=`
4. **TESTAR** criação de novas páginas e verificar se aparecem corretamente
5. **VALIDAR** que múltiplas páginas do mesmo usuário funcionam independentemente
6. **VERIFICAR** performance melhorada no carregamento do editor

## 🔧 Possíveis Problemas

### Se a página não carregar:
- Verifique se o RPC `get_public_page_data_by_slug` foi criado no Supabase
- Verifique permissões (deve ter GRANT para `anon` e `authenticated`)
- Verifique se o slug existe na tabela `pages` e `is_active = true`

### Se aparecer erro de "função não existe":
- A migration SQL não foi executada
- Execute o arquivo `MIGRATION_get_public_page_data_by_slug.sql` no Supabase

## 📝 Notas Técnicas

- A função antiga `get_public_page_data` (que busca por username) pode ser mantida para compatibilidade
- Podemos migrar gradualmente URLs antigas se necessário
- O slug é definido ao criar a página e pode ser editado depois (requer validação de unicidade)
