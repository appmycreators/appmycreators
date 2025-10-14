# 🔧 Correção: Prova Social Não Salva/Não Aparece

## 🎯 Problemas Identificados

### 1. ❌ Toggle não fica ativo ao reabrir produto
### 2. ❌ Números de curtidas/shares não aparecem
### 3. ❌ Não exibe na página pública

---

## ✅ Solução Completa - Siga Esta Ordem

### **PASSO 1: Aplicar Schema SQL** (5 min)

No **Supabase SQL Editor**, execute:

```sql
-- Arquivo: sql/gallery_social_proof_fields.sql
-- Copie TODO o conteúdo e execute
```

**Verificação:**
```sql
-- Execute isto para confirmar:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gallery_items' 
  AND column_name IN ('enable_social_proof', 'custom_likes_count', 'custom_shares_count');

-- Deve retornar 3 linhas ✅
```

---

### **PASSO 2: Atualizar Função get_public_page_data** (10 min)

#### 2.1 - Localizar a função existente

No **Supabase SQL Editor**:

```sql
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'get_public_page_data';
```

#### 2.2 - Copiar o código retornado

Copie TODO o código que apareceu.

#### 2.3 - Procurar por SELECT de gallery_items

Dentro do código, procure por algo como:

```sql
SELECT json_agg(json_build_object(
  'id', gi.id,
  'name', gi.name,
  'description', gi.description,
  'price', gi.price,
  'image_url', gi.image_url,
  'link_url', gi.link_url,
  'button_text', gi.button_text,
  'display_order', gi.display_order,
  'destaque', gi.destaque,
  'lottie_animation', gi.lottie_animation
  -- ADICIONAR OS 3 CAMPOS ABAIXO AQUI ⬇️
))
FROM gallery_items gi
```

#### 2.4 - Adicionar os 3 campos

Adicione ANTES do `))`:

```sql
  'enable_social_proof', COALESCE(gi.enable_social_proof, false),
  'custom_likes_count', COALESCE(gi.custom_likes_count, 0),
  'custom_shares_count', COALESCE(gi.custom_shares_count, 0)
```

**Resultado final deve ser:**

```sql
SELECT json_agg(json_build_object(
  'id', gi.id,
  'name', gi.name,
  'description', gi.description,
  'price', gi.price,
  'image_url', gi.image_url,
  'link_url', gi.link_url,
  'button_text', gi.button_text,
  'display_order', gi.display_order,
  'destaque', gi.destaque,
  'lottie_animation', gi.lottie_animation,
  'enable_social_proof', COALESCE(gi.enable_social_proof, false),      -- ✅ NOVO
  'custom_likes_count', COALESCE(gi.custom_likes_count, 0),            -- ✅ NOVO
  'custom_shares_count', COALESCE(gi.custom_shares_count, 0)           -- ✅ NOVO
))
FROM gallery_items gi
```

#### 2.5 - Executar CREATE OR REPLACE

Cole o código completo atualizado no SQL Editor e execute.

---

### **PASSO 3: Atualizar Função do Dashboard (se existir)** (10 min)

#### 3.1 - Identificar funções

```sql
SELECT proname 
FROM pg_proc 
WHERE prosrc LIKE '%gallery_items%'
  AND proname NOT LIKE 'pg_%';
```

Procure por nomes como:
- `get_page_data`
- `get_dashboard_data`
- `get_user_page`

#### 3.2 - Para CADA função encontrada

Repita o processo do PASSO 2:
- Pegue o código com `SELECT prosrc FROM pg_proc WHERE proname = 'NOME_DA_FUNCAO';`
- Localize os SELECT de `gallery_items`
- Adicione os 3 campos
- Execute `CREATE OR REPLACE FUNCTION...`

---

### **PASSO 4: Verificações no Frontend** ✅

Os arquivos TypeScript já foram atualizados:

- ✅ `src/hooks/useGallerySync.ts` - Carrega campos do banco
- ✅ `src/hooks/usePublicPage.ts` - Transforma dados para público
- ✅ `src/services/supabaseService.ts` - Interface GalleryItem
- ✅ `src/components/GalleryItemForm.tsx` - Formulário completo
- ✅ `src/components/public/PublicContentBlock.tsx` - Exibição pública

**Nada mais precisa ser alterado no código!**

---

## 🧪 Testes Passo a Passo

### Teste 1: Verificar Salvamento

1. **Abrir produto existente** ou criar novo
2. **Ativar toggle** "Prova Social"
3. **Definir valores:**
   - Curtidas: `234`
   - Compartilhamentos: `45`
4. **Salvar**
5. **Verificar no banco:**

```sql
SELECT 
  id,
  name,
  enable_social_proof,
  custom_likes_count,
  custom_shares_count
FROM gallery_items
WHERE name = 'NOME_DO_SEU_PRODUTO'
ORDER BY created_at DESC
LIMIT 1;
```

**Esperado:** Valores devem aparecer ✅

---

### Teste 2: Verificar Carregamento no Dashboard

1. **Fechar** o modal do produto
2. **Reabrir** o mesmo produto
3. **Verificar:**
   - Toggle deve estar ATIVO ✅
   - Curtidas deve mostrar `234` ✅
   - Compartilhamentos deve mostrar `45` ✅

**Se NÃO aparecer:**
- Abra o console do navegador (F12)
- Veja se há erros
- Verifique se executou os PASSOS 2 e 3

---

### Teste 3: Verificar Página Pública

1. **Acesse** sua página pública: `seusite.com/@seuusername`
2. **Localize o produto** com prova social ativada
3. **Verificar badges** no canto inferior direito da imagem:
   - ❤️ 234 (curtidas)
   - ➤ 45 (compartilhamentos)

**Se NÃO aparecer:**
- Certifique-se que o toggle está ativo
- Valores devem ser > 0 para aparecer
- Execute o PASSO 2 se ainda não fez

---

## 📊 Fluxo Completo (Referência)

```
┌─────────────────────────────────────┐
│ 1. SQL: Adicionar colunas           │
│    gallery_social_proof_fields.sql  │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│ 2. SQL: Atualizar get_public_page   │
│    (Adicionar campos no SELECT)     │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│ 3. SQL: Atualizar funções dashboard │
│    (Se existirem)                   │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│ 4. Frontend: Já atualizado! ✅      │
│    - GalleryItemForm salva          │
│    - useGallerySync carrega         │
│    - PublicContentBlock exibe       │
└─────────────────────────────────────┘
```

---

## ❓ Troubleshooting

### Problema: "column does not exist"

**Causa:** Colunas não foram criadas no banco  
**Solução:** Execute `sql/gallery_social_proof_fields.sql`

---

### Problema: Toggle não fica ativo ao reabrir

**Causa:** Função do dashboard não está retornando os campos  
**Solução:** 
1. Execute PASSO 3 (atualizar funções dashboard)
2. Ou verifique se `useGallerySync.ts` está mapeando corretamente
3. Abra console do navegador e veja o que está vindo da API

---

### Problema: Não aparece na página pública

**Causa:** Função `get_public_page_data` não retorna os campos  
**Solução:**
1. Execute PASSO 2 completamente
2. Limpe cache do navegador (Ctrl+Shift+R)
3. Verifique se toggle está realmente ativo

---

### Problema: Salvamento funciona mas não carrega

**Causa:** Hook `useGallerySync` não está mapeando campos  
**Verificar:**

```typescript
// Arquivo: src/hooks/useGallerySync.ts
// Linha ~86-88 deve ter:
enableSocialProof: item.enable_social_proof || false,
customLikesCount: item.custom_likes_count || 0,
customSharesCount: item.custom_shares_count || 0,
```

**Se não tiver:** Arquivo não foi atualizado corretamente

---

## 📋 Checklist Final

Execute esta lista na ordem:

- [ ] **SQL**: Aplicar `gallery_social_proof_fields.sql`
- [ ] **SQL**: Verificar colunas criadas (query de verificação)
- [ ] **SQL**: Localizar função `get_public_page_data`
- [ ] **SQL**: Adicionar 3 campos no SELECT de gallery_items
- [ ] **SQL**: Executar CREATE OR REPLACE da função atualizada
- [ ] **SQL**: Identificar funções do dashboard (se existirem)
- [ ] **SQL**: Atualizar funções do dashboard com 3 campos
- [ ] **Teste**: Criar/editar produto com prova social
- [ ] **Teste**: Salvar e verificar no banco
- [ ] **Teste**: Reabrir produto - toggle deve estar ativo
- [ ] **Teste**: Acessar página pública - badges devem aparecer
- [ ] **Teste**: Adicionar comentário (opcional)
- [ ] **Teste**: Verificar comentários na página pública

---

## 🎉 Resultado Esperado

### No Dashboard (Admin):
```
✅ Toggle "Prova Social" funciona
✅ Campos de curtidas/shares salvam
✅ Valores persistem ao reabrir
✅ Botão adicionar comentários aparece (se produto salvo)
✅ Preview de comentários inline
```

### Na Página Pública:
```
✅ Badges flutuantes no canto inferior direito
✅ ❤️ Curtidas (se > 0)
✅ ➤ Compartilhamentos (se > 0)
✅ 💬 Comentários (se > 0, clicável)
✅ Modal de comentários com dados reais
```

---

## 📞 Suporte

Se após seguir TODOS os passos ainda não funcionar:

1. Abra o **console do navegador** (F12)
2. Vá na aba **Network**
3. Filtre por "supabase"
4. Salve um produto
5. Veja a requisição POST/PATCH
6. Verifique se os campos estão sendo enviados
7. Copie o erro (se houver) e reporte

---

**Implementado para MyCreators** 🚀  
**Tempo estimado de correção:** 20-30 minutos  
**Arquivos SQL de referência:** `sql/` folder
