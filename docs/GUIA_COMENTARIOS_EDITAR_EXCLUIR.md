# 📝 Guia: Editar e Excluir Comentários

## ✨ Funcionalidades Implementadas

### **No GalleryItemForm (Dashboard Admin):**

✅ **Destacar comentário** - Marcar comentário com estrela dourada  
✅ **Editar comentário** - Alterar nome, texto e foto  
✅ **Excluir comentário** - Remover permanentemente  
✅ **Hover actions** - Botões aparecem ao passar o mouse  

---

## 🚀 Como Usar

### **PASSO 1: Aplicar SQL (Obrigatório)**

No **Supabase SQL Editor**, execute:

```sql
-- Arquivo: sql/gallery_comments_edit_delete.sql
-- Copie e execute TODO o conteúdo
```

Isso criará as funções:
- `update_gallery_item_comment()`
- `delete_gallery_item_comment()`
- `toggle_comment_highlight()`

---

### **PASSO 2: Gerenciar Comentários**

#### **2.1 - Acessar Comentários**

1. Abrir produto existente no dashboard
2. Ativar "Prova Social" (se ainda não estiver)
3. Ver lista de comentários na seção

#### **2.2 - Destacar Comentário (Estrela)**

1. **Passar o mouse** sobre um comentário
2. Clicar no botão **⭐** (estrela)
3. Comentário recebe destaque visual
4. Clicar novamente para remover destaque

**Efeito:**
- Estrela dourada no canto superior esquerdo
- Comentário destacado aparece em destaque na página pública

#### **2.3 - Editar Comentário**

1. **Passar o mouse** sobre um comentário
2. Clicar no botão **✏️** (lápis azul)
3. Modal de edição abre
4. Alterar:
   - Nome do autor
   - Texto do comentário
   - Foto do avatar (opcional)
5. Clicar **"Salvar Alterações"**

#### **2.4 - Excluir Comentário**

1. **Passar o mouse** sobre um comentário
2. Clicar no botão **🗑️** (lixeira vermelha)
3. Dialog de confirmação aparece
4. Confirmar exclusão
5. Comentário é removido permanentemente

---

## 🎨 Interface Visual

### **Lista de Comentários:**

```
┌──────────────────────────────────────────────┐
│ 💬 Comentários (3 comentários)  [+ Adicionar]│
├──────────────────────────────────────────────┤
│ ⭐                                            │ ← Destaque
│ 👤 Ana Silva                    [⭐][✏️][🗑️] │ ← Botões ao hover
│    Produto incrível!...                      │
├──────────────────────────────────────────────┤
│ 👤 João Costa                   [⭐][✏️][🗑️] │
│    Melhor compra...                          │
├──────────────────────────────────────────────┤
│ 👤 Maria Lima                   [⭐][✏️][🗑️] │
│    Adorei!                                   │
└──────────────────────────────────────────────┘
```

**Botões (aparecem ao hover):**
- ⭐ **Estrela** (cinza/dourada) - Destacar/remover destaque
- ✏️ **Lápis** (azul) - Editar
- 🗑️ **Lixeira** (vermelha) - Excluir

---

## 📋 Fluxo Completo

### **Adicionar → Editar → Destacar → Excluir**

```
1. Adicionar comentário
   ↓
2. Comentário aparece na lista
   ↓
3. Passar mouse → botões aparecem
   ↓
4. Clicar ⭐ → Destacar
   ↓
5. Clicar ✏️ → Editar texto
   ↓
6. Clicar 🗑️ → Excluir (com confirmação)
```

---

## 🔄 Atualizações Automáticas

### **React Query gerencia cache automaticamente:**

- ✅ Ao editar → Lista atualiza instantaneamente
- ✅ Ao excluir → Contador diminui automaticamente
- ✅ Ao destacar → Estrela aparece/desaparece

### **Invalidação de Cache:**

Todas as ações invalidam o cache do React Query:

```typescript
queryClient.invalidateQueries({ 
  queryKey: ['gallery-comments', galleryItemId] 
});
```

---

## 🧪 Casos de Teste

### **Teste 1: Destacar Comentário**

1. Adicionar 2 comentários
2. Passar mouse no primeiro
3. Clicar na estrela (cinza)
4. ✅ Estrela fica dourada
5. ✅ Aparece estrela no canto superior esquerdo
6. Clicar novamente
7. ✅ Destaque removido

### **Teste 2: Editar Comentário**

1. Passar mouse em um comentário
2. Clicar no lápis azul
3. Modal abre com dados atuais
4. Alterar nome: "Novo Nome"
5. Alterar texto: "Novo comentário"
6. Clicar "Salvar Alterações"
7. ✅ Modal fecha
8. ✅ Comentário atualizado na lista

### **Teste 3: Excluir Comentário**

1. Ter 3 comentários (contador mostra "3")
2. Passar mouse no segundo comentário
3. Clicar na lixeira vermelha
4. Dialog aparece: "Excluir comentário?"
5. Clicar "Excluir"
6. ✅ Comentário removido
7. ✅ Contador atualiza para "2"

### **Teste 4: Editar Foto do Avatar**

1. Editar comentário (lápis)
2. Clicar no círculo de upload
3. Selecionar nova imagem
4. ✅ Preview aparece
5. Salvar
6. ✅ Nova foto aparece na lista

---

## ⚠️ Validações e Segurança

### **Validações do Frontend:**

- ✅ Nome obrigatório (mínimo 1 char)
- ✅ Comentário obrigatório (mínimo 3 chars)
- ✅ Máximo 500 caracteres no comentário
- ✅ Imagem: máximo 2MB
- ✅ Confirmação antes de excluir

### **Segurança do Backend:**

```sql
-- Funções RPC com validação
CREATE OR REPLACE FUNCTION delete_gallery_item_comment(
  p_comment_id UUID
)
RETURNS BOOLEAN;
```

**Adicione RLS (Row Level Security) se necessário:**

```sql
-- Apenas donos podem editar/excluir
CREATE POLICY "Users can update own comments"
ON gallery_item_comments
FOR UPDATE
USING (user_id = auth.uid());
```

---

## 🎯 Recursos Adicionais

### **Toggle Destaque:**

- Comentários destacados aparecem primeiro na página pública
- Máximo recomendado: 2-3 comentários destacados
- Visual diferenciado com estrela dourada

### **Edição Completa:**

- Nome do autor
- Texto do comentário  
- Foto do avatar
- Rating (fixo em 5 estrelas)

### **Exclusão Segura:**

- Confirmação obrigatória
- Ação irreversível
- Atualização instantânea do contador

---

## 📊 Arquivos Criados/Modificados

```
projeto/
├── sql/
│   └── gallery_comments_edit_delete.sql    ← APLICAR NO SUPABASE
├── src/
│   ├── components/
│   │   ├── GalleryItemForm.tsx             ← Atualizado (botões + modais)
│   │   ├── AddCommentModal.tsx             ← Existente
│   │   └── EditCommentModal.tsx            ← NOVO
│   └── hooks/
│       └── useGalleryComments.ts           ← Atualizado (3 novos hooks)
└── docs/
    └── GUIA_COMENTARIOS_EDITAR_EXCLUIR.md  ← Este arquivo
```

---

## 🐛 Troubleshooting

### **Problema: Botões não aparecem ao hover**

**Causa:** CSS do Tailwind  
**Solução:** Certifique-se que `group` e `group-hover:` estão funcionando

### **Problema: "function does not exist"**

**Causa:** SQL não foi aplicado  
**Solução:** Execute `sql/gallery_comments_edit_delete.sql`

### **Problema: Exclusão não remove da lista**

**Causa:** Cache não foi invalidado  
**Verificar:** Console do navegador por erros

### **Problema: Edição não salva**

**Causa:** Função RPC com erro  
**Debug:**
```sql
SELECT update_gallery_item_comment(
  'COMMENT_ID',
  'Novo nome',
  'Novo texto',
  NULL,
  5
);
```

---

## ✅ Checklist de Implementação

- [ ] Aplicar `sql/gallery_comments_edit_delete.sql`
- [ ] Verificar funções criadas no Supabase
- [ ] Adicionar comentário de teste
- [ ] Testar hover (botões aparecem?)
- [ ] Testar destacar (estrela muda?)
- [ ] Testar editar (dados salvam?)
- [ ] Testar excluir (confirmação aparece?)
- [ ] Verificar contador atualiza
- [ ] Verificar na página pública

---

## 🎉 Resultado Final

### **Dashboard Admin:**
```
✅ Hover actions com 3 botões
✅ Destacar/remover destaque
✅ Editar nome, texto e foto
✅ Excluir com confirmação
✅ Atualizações em tempo real
✅ Estrela visual para destacados
```

### **Página Pública:**
```
✅ Comentários destacados aparecem primeiro
✅ Estrela dourada nos destacados
✅ Ordenação: destacados → recentes
```

---

**Implementado para MyCreators** 🚀  
**Tempo de desenvolvimento:** ~45 minutos  
**Funcionalidades:** Editar, Excluir, Destacar comentários
