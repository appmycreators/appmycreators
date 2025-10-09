# 🔄 Guia de Sincronização em Tempo Real

## 📋 Visão Geral

Sistema completo de sincronização automática entre o editor (MainContent) e o banco de dados Supabase, com auto-save inteligente e feedback visual.

---

## ✨ Componentes Criados

### 1. **SaveIndicator.tsx** - Feedback Visual
Componente que mostra o status de salvamento:
- 🔵 **Salvando...** (loading spinner)
- ✅ **Salvo há Xs** (check verde com timestamp)
- ❌ **Erro ao salvar** (ícone de alerta vermelho)

```typescript
<SaveIndicator 
  status="saving" | "saved" | "error" | "idle"
  lastSaved={new Date()}
  error="Mensagem de erro"
/>
```

### 2. **usePageSync.ts** - Hook de Sincronização
Hook especializado para gerenciar links com auto-save:

```typescript
const {
  links,           // Links carregados do Supabase
  loading,         // Estado de carregamento
  saveStatus,      // Status atual: idle | saving | saved | error
  lastSaved,       // Timestamp do último save
  saveError,       // Mensagem de erro (se houver)
  addLink,         // Adicionar novo link
  updateLink,      // Atualizar link existente
  deleteLink,      // Deletar link
  reorderLinks,    // Reordenar links (drag & drop)
} = usePageSync();
```

**Funcionalidades:**
- ✅ Carrega links automaticamente do banco
- ✅ Salva no Supabase ao adicionar/editar/deletar
- ✅ Atualiza display_order ao reordenar
- ✅ Feedback de status em tempo real
- ✅ Tratamento de erros

### 3. **MainContentWithSync.tsx** - Editor Integrado
Versão do MainContent totalmente integrada com Supabase:
- Usa `usePage()` para dados gerais
- Usa `usePageSync()` para links
- Auto-save em todas as operações
- Feedback visual com SaveIndicator
- Drag & drop com persistência

---

## 🚀 Como Integrar

### Opção 1: Substituir MainContent Completo

```bash
# 1. Fazer backup do atual
mv src/components/MainContent.tsx src/components/MainContent.backup.tsx

# 2. Renomear o novo
mv src/components/MainContentWithSync.tsx src/components/MainContent.tsx

# 3. Testar
npm run dev
```

### Opção 2: Integração Gradual no MainContent Existente

#### Passo 1: Adicionar imports

```typescript
// No topo do MainContent.tsx
import { usePage } from "@/hooks/usePage";
import { usePageSync } from "@/hooks/usePageSync";
import SaveIndicator from "./SaveIndicator";
```

#### Passo 2: Substituir estados locais

```typescript
const MainContent = () => {
  // REMOVER estados locais de links
  // const [links, setLinks] = useState<Link[]>([]);
  
  // ADICIONAR hooks do Supabase
  const { pageData, loading: pageLoading } = usePage();
  const {
    links,
    saveStatus,
    lastSaved,
    saveError,
    addLink,
    updateLink,
    deleteLink,
    reorderLinks,
  } = usePageSync();
  
  // ... resto do código
};
```

#### Passo 3: Atualizar funções de manipulação

```typescript
// ANTES:
const handleAddLink = (linkData) => {
  const newLink = { id: Date.now().toString(), ...linkData };
  setLinks(prev => [...prev, newLink]);
};

// DEPOIS:
const handleAddLink = async (linkData) => {
  await addLink(linkData); // Salva automaticamente no Supabase
};

// ANTES:
const handleDeleteLink = (id) => {
  setLinks(prev => prev.filter(l => l.id !== id));
};

// DEPOIS:
const handleDeleteLink = async (id) => {
  await deleteLink(id); // Remove do Supabase
};

// ANTES (drag & drop):
const handleDragEnd = (event) => {
  // ... reordenação local
  setLinks(reorderedLinks);
};

// DEPOIS:
const handleDragEnd = async (event) => {
  // ... calcular nova ordem
  await reorderLinks(reorderedLinks); // Persiste no banco
};
```

#### Passo 4: Adicionar SaveIndicator no header

```typescript
return (
  <div className="flex-1 overflow-hidden flex flex-col">
    {/* Header */}
    <div className="bg-white border-b p-4">
      <div className="flex items-center justify-between">
        <h2>Editar Página</h2>
        
        <div className="flex items-center gap-4">
          {/* Indicador de salvamento */}
          <SaveIndicator 
            status={saveStatus}
            lastSaved={lastSaved}
            error={saveError}
          />
          
          <Button>Preview</Button>
        </div>
      </div>
    </div>
    
    {/* Resto do conteúdo */}
  </div>
);
```

---

## 📚 Exemplos de Uso

### Adicionar Link com Auto-Save

```typescript
const handleAddNewLink = async () => {
  const linkData = {
    title: "Meu Site",
    url: "https://meusite.com",
    icon: "🌐",
    bgColor: "#3B82F6",
  };
  
  await addLink(linkData);
  // Salvo automaticamente no Supabase ✓
};
```

### Editar Link Existente

```typescript
const handleEditLink = async (linkId: string) => {
  await updateLink(linkId, {
    title: "Novo Título",
    url: "https://novosite.com",
  });
  // Atualizado no banco ✓
};
```

### Reordenar com Drag & Drop

```typescript
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  
  // Calcular nova ordem
  const oldIndex = links.findIndex(l => l.id === active.id);
  const newIndex = links.findIndex(l => l.id === over.id);
  const reordered = arrayMove(links, oldIndex, newIndex);
  
  // Salvar nova ordem
  await reorderLinks(reordered);
  // display_order atualizado no banco ✓
};
```

### Deletar Link

```typescript
const handleDelete = async (linkId: string) => {
  if (confirm("Deletar este link?")) {
    await deleteLink(linkId);
    // Removido do banco ✓
  }
};
```

---

## 🎨 Feedback Visual

### Estados de Salvamento

```typescript
{saveStatus === 'saving' && (
  <div className="text-blue-500">
    <Loader2 className="animate-spin" />
    Salvando...
  </div>
)}

{saveStatus === 'saved' && lastSaved && (
  <div className="text-green-500">
    <Check />
    Salvo há {formatTimeAgo(lastSaved)}
  </div>
)}

{saveStatus === 'error' && (
  <div className="text-red-500">
    <AlertCircle />
    {saveError}
  </div>
)}
```

### Loading State

```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin" />
        <p>Carregando página...</p>
      </div>
    </div>
  );
}
```

---

## 🔧 Recursos Avançados

### Auto-Save com Debounce para Campos de Texto

Para campos que são editados constantemente (nome, bio):

```typescript
import { useAutoSave } from "@/hooks/useAutoSave";

const ProfileEditor = () => {
  const { updateSettings } = usePage();
  const [name, setName] = useState("");
  
  const { saving, lastSaved } = useAutoSave({
    data: { profile_name: name },
    onSave: async (data) => {
      return await updateSettings(data);
    },
    delay: 1000, // 1 segundo após parar de digitar
  });
  
  return (
    <div>
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {saving && <span>Salvando...</span>}
    </div>
  );
};
```

### Sincronizar Outros Recursos

O mesmo padrão pode ser usado para galerias, WhatsApp, etc:

```typescript
// Criar useGallerySync.ts similar ao usePageSync.ts
export const useGallerySync = () => {
  const { pageData } = usePage();
  const [galleries, setGalleries] = useState([]);
  
  const addGallery = async (galleryData) => {
    const resource = await ResourceService.createResource(...);
    const gallery = await GalleryService.createGallery(resource.id);
    // ...
  };
  
  return { galleries, addGallery, updateGallery, deleteGallery };
};
```

---

## 🧪 Testando

### 1. Testar Criação de Link

```
1. Abra o editor
2. Clique "Adicionar Link"
3. Preencha os campos
4. Salve
5. Verifique:
   - ✅ "Salvando..." aparece
   - ✅ "Salvo há Xs" aparece
   - ✅ Link aparece na lista
6. Recarregue a página
7. Verifique:
   - ✅ Link permanece salvo
```

### 2. Testar Drag & Drop

```
1. Crie 3 links
2. Arraste o terceiro para o primeiro
3. Verifique:
   - ✅ "Salvando..." durante o arraste
   - ✅ Ordem persiste após reload
```

### 3. Testar Edição

```
1. Clique "Editar" em um link
2. Mude o título
3. Salve
4. Verifique:
   - ✅ Mudança é salva
   - ✅ Timestamp atualiza
```

### 4. Verificar no Supabase

```sql
-- Ver todos os resources
SELECT * FROM resources ORDER BY display_order;

-- Ver links
SELECT r.title, l.url, r.display_order
FROM resources r
JOIN links l ON l.resource_id = r.id
ORDER BY r.display_order;
```

---

## 🐛 Troubleshooting

### Problema: "Salvando..." fica travado

**Causa**: Erro não tratado na operação do banco

**Solução**:
1. Abrir DevTools Console
2. Verificar mensagens de erro
3. Verificar permissões RLS no Supabase
4. Testar query no SQL Editor

### Problema: Links não carregam

**Causa**: Página ainda não foi criada

**Solução**:
```typescript
// usePage.ts cria página automaticamente
// Verificar se trigger handle_new_user() foi executado
SELECT * FROM pages WHERE user_id = 'seu-user-id';
```

### Problema: Reordenação não persiste

**Causa**: ResourceService.reorderResources() pode ter erro

**Solução**:
```sql
-- Verificar display_order no banco
SELECT id, title, display_order FROM resources
WHERE page_id = 'page-id'
ORDER BY display_order;
```

---

## 📊 Fluxo Completo

```
Usuário adiciona link
    ↓
addLink() chamado
    ↓
setSaveStatus('saving') → UI mostra "Salvando..."
    ↓
ResourceService.createResource()
    ↓
LinkService.createLink()
    ↓
Atualiza estado local setLinks()
    ↓
setSaveStatus('saved') → UI mostra "Salvo ✓"
    ↓
setLastSaved(new Date())
    ↓
Após 5s: "Salvo há 5s"
```

---

## ✅ Checklist de Implementação

- [x] Criar SaveIndicator component
- [x] Criar usePageSync hook
- [x] Criar MainContentWithSync exemplo
- [x] Documentar integração
- [ ] Integrar no MainContent.tsx original
- [ ] Adicionar suporte para galerias
- [ ] Adicionar suporte para WhatsApp
- [ ] Adicionar suporte para redes sociais
- [ ] Testes end-to-end

---

## 🎯 Resultado Esperado

Depois da integração completa:

1. ✅ Usuário adiciona link → Salvo automaticamente
2. ✅ Usuário reordena links → Nova ordem salva
3. ✅ Usuário edita link → Mudanças persistem
4. ✅ Feedback visual em todas as operações
5. ✅ Dados carregam ao abrir o editor
6. ✅ Reload da página mantém tudo salvo

**O editor se torna uma aplicação real time com persistência total!** 🎉
