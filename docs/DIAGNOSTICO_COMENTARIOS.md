# 🔍 Diagnóstico: Comentários Não Salvam/Excluem

## ⚠️ Problema Comum: Funções SQL Não Aplicadas

A causa mais comum é que as funções SQL não foram executadas no Supabase.

---

## 🎯 Diagnóstico Rápido (3 Passos)

### **PASSO 1: Verificar Funções no Supabase**

No **Supabase SQL Editor**, execute:

```sql
-- Verificar se as funções existem
SELECT 
  proname AS function_name
FROM pg_proc 
WHERE proname IN (
  'update_gallery_item_comment',
  'delete_gallery_item_comment',
  'toggle_comment_highlight'
);
```

**Resultado Esperado:**
```
function_name
─────────────────────────────
update_gallery_item_comment
delete_gallery_item_comment
toggle_comment_highlight
```

**Se retornar VAZIO:**
❌ **Funções não existem** → Execute `sql/gallery_comments_edit_delete.sql`

**Se retornar 3 linhas:**
✅ **Funções existem** → Vá para PASSO 2

---

### **PASSO 2: Ver Erros no Console do Navegador**

1. Abra a aplicação
2. Pressione **F12** (DevTools)
3. Vá na aba **Console**
4. Tente editar ou excluir um comentário
5. **Procure por mensagens:**

#### **Mensagens que você deve ver:**

✅ **Sucesso:**
```
🔧 Atualizando comentário: {commentId: "...", ...}
✅ Comentário atualizado com sucesso: true
🔄 Invalidando cache para: ...
```

❌ **Erro de função não existe:**
```
❌ Erro ao atualizar comentário: 
{
  message: "function update_gallery_item_comment does not exist",
  code: "42883"
}
```
**Solução:** Execute `sql/gallery_comments_edit_delete.sql`

❌ **Erro de permissão:**
```
❌ Erro ao atualizar comentário:
{
  message: "permission denied for function...",
  code: "42501"
}
```
**Solução:** Veja PASSO 3 (Permissões RLS)

---

### **PASSO 3: Verificar Permissões RLS**

Se as funções existem mas dá erro de permissão:

```sql
-- Verificar RLS na tabela
SELECT 
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'gallery_item_comments';
```

**Se `rowsecurity = true`:**

Você precisa adicionar policies ou desabilitar RLS temporariamente:

```sql
-- OPÇÃO 1: Desabilitar RLS (TEMPORÁRIO PARA TESTE)
ALTER TABLE gallery_item_comments DISABLE ROW LEVEL SECURITY;

-- OPÇÃO 2: Criar policy que permite tudo (TEMPORÁRIO)
CREATE POLICY "Allow all operations for now"
ON gallery_item_comments
FOR ALL
USING (true)
WITH CHECK (true);
```

⚠️ **IMPORTANTE:** Em produção, crie policies adequadas!

---

## 🧪 Teste Manual das Funções

### **1. Listar Comentários Existentes**

```sql
SELECT 
  id,
  author_name,
  comment_text,
  is_highlighted
FROM gallery_item_comments
ORDER BY created_at DESC
LIMIT 5;
```

**Copie um `id` para os testes abaixo.**

---

### **2. Testar Atualização (Editar)**

```sql
-- Substitua 'SEU_COMMENT_ID' por um ID real
SELECT update_gallery_item_comment(
  'SEU_COMMENT_ID'::uuid,
  'Nome Teste Editado'::text,
  'Texto teste editado'::text,
  NULL,
  5
);
```

**Resultado Esperado:** `true`

**Se retornar `false`:**
- Comentário não foi encontrado
- Verifique se o ID está correto

**Se der erro:**
- Função não existe → Execute SQL
- Erro de permissão → Veja PASSO 3

---

### **3. Testar Exclusão**

```sql
-- ⚠️ CUIDADO: Isso vai excluir permanentemente!
SELECT delete_gallery_item_comment('SEU_COMMENT_ID'::uuid);
```

**Resultado Esperado:** `true`

---

### **4. Testar Toggle Destaque**

```sql
SELECT toggle_comment_highlight('SEU_COMMENT_ID'::uuid);
```

**Resultado Esperado:** `true`

---

## 📊 Checklist de Verificação

Use esta lista para identificar o problema:

- [ ] **Funções SQL aplicadas?** (query do PASSO 1)
- [ ] **Console mostra erros?** (F12 → Console)
- [ ] **Mensagem "function does not exist"?** → Aplicar SQL
- [ ] **Mensagem "permission denied"?** → Verificar RLS
- [ ] **Teste manual funciona?** (queries acima)
- [ ] **IDs dos comentários corretos?** (UUIDs válidos)
- [ ] **Navegador atualizado?** (Ctrl+Shift+R)

---

## 🔧 Soluções por Tipo de Erro

### **Erro: "function ... does not exist"**

```
❌ Error: function update_gallery_item_comment does not exist
```

**Causa:** SQL não foi executado  
**Solução:**

1. Abra **Supabase SQL Editor**
2. Copie **TODO** o conteúdo de `sql/gallery_comments_edit_delete.sql`
3. Cole no editor
4. Clique **RUN**
5. Verifique se apareceu mensagem de sucesso
6. Teste novamente na aplicação

---

### **Erro: "permission denied"**

```
❌ Error: permission denied for function update_gallery_item_comment
```

**Causa:** Row Level Security bloqueando  
**Solução Temporária:**

```sql
-- Desabilitar RLS para testes
ALTER TABLE gallery_item_comments DISABLE ROW LEVEL SECURITY;
```

**Solução Permanente:**

```sql
-- Criar policy adequada
CREATE POLICY "Admin can manage comments"
ON gallery_item_comments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

---

### **Erro: Não acontece nada (sem erro)**

**Causas Possíveis:**
1. JavaScript com erro antes de chamar a função
2. Cache do navegador
3. Evento onClick não disparando

**Diagnóstico:**

1. Abra **F12 → Console**
2. Digite: `console.log('Teste')`
3. Se não aparecer "Teste" → Console com problema
4. Limpe cache: **Ctrl+Shift+R**
5. Veja se aparecem os logs com emojis (🔧, ✅, ❌)

---

### **Erro: "Cannot read properties of undefined"**

```
❌ TypeError: Cannot read properties of undefined (reading 'id')
```

**Causa:** `initialItem` ou `comment` está undefined  
**Verificar:**

```typescript
// No GalleryItemForm
console.log('initialItem:', initialItem);
console.log('commentsData:', commentsData);

// No EditCommentModal
console.log('comment:', comment);
console.log('galleryItemId:', galleryItemId);
```

---

## 📱 Interface de Logs

Com os logs adicionados, você verá no console:

### **Ao Editar:**
```
🔧 Atualizando comentário: {
  commentId: "abc-123-...",
  galleryItemId: "xyz-456-...",
  authorName: "Novo Nome",
  commentText: "Novo texto"
}
✅ Comentário atualizado com sucesso: true
🔄 Invalidando cache para: xyz-456-...
```

### **Ao Excluir:**
```
🗑️ Excluindo comentário: {
  commentId: "abc-123-...",
  galleryItemId: "xyz-456-..."
}
✅ Comentário excluído com sucesso: true
🔄 Invalidando cache após exclusão para: xyz-456-...
```

### **Ao Destacar:**
```
⭐ Alternando destaque do comentário: {
  commentId: "abc-123-...",
  galleryItemId: "xyz-456-..."
}
✅ Destaque alternado com sucesso: true
🔄 Invalidando cache após toggle para: xyz-456-...
```

**Se NÃO ver esses logs:**
→ Evento onClick não está disparando  
→ Verifique se os botões estão aparecendo (hover funciona?)

---

## 🚀 Fluxo de Teste Completo

### **1. Preparação**

```sql
-- No Supabase SQL Editor
-- Executar: sql/gallery_comments_edit_delete.sql
```

### **2. Verificação**

```sql
-- Verificar se funções existem
SELECT proname FROM pg_proc 
WHERE proname LIKE '%comment%';
```

### **3. Criar Comentário de Teste**

1. Dashboard → Abrir produto
2. Ativar "Prova Social"
3. Clicar "+ Adicionar"
4. Preencher e salvar
5. Ver se aparece na lista

### **4. Testar Edição**

1. Passar mouse sobre comentário
2. Ver se botões aparecem (⭐ ✏️ 🗑️)
3. Clicar no lápis (✏️)
4. Modal abre?
5. Alterar texto
6. Salvar
7. **Abrir F12 Console** → Ver logs

### **5. Testar Exclusão**

1. Passar mouse
2. Clicar na lixeira (🗑️)
3. Dialog aparece?
4. Confirmar
5. **Abrir F12 Console** → Ver logs
6. Comentário sumiu?
7. Contador diminuiu?

---

## 📞 Próximos Passos

**Se ainda não funcionar após todos os testes:**

1. **Copie** os erros do console (F12)
2. **Copie** o resultado da query de verificação
3. **Tire** um print da tela
4. **Informe** qual erro específico aparece

---

## 🎯 Resumo: O Que Fazer Agora

1. ✅ **Aplicar SQL** → `sql/gallery_comments_edit_delete.sql`
2. ✅ **Verificar funções** → Query do PASSO 1
3. ✅ **Abrir F12** → Ver console
4. ✅ **Testar ação** → Ver logs com emojis
5. ✅ **Copiar erros** → Se houver

---

**Arquivo de teste criado:** `sql/TEST_COMMENT_FUNCTIONS.sql`  
**Use para diagnosticar diretamente no banco de dados.**
