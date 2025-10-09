# 🚀 Recomendações de Índices para Otimização e Escalabilidade

## 📊 Resumo Executivo

Analisando o projeto atual e os padrões de query identificados no código, foram identificados **12 novos índices** necessários para otimização, além dos 23 índices já existentes.

**Impacto estimado:** +30-50% de melhoria em performance para queries públicas.

**Nota:** Índices em `storage.objects` são gerenciados automaticamente pelo Supabase e não podem ser criados manualmente.

---

## ✅ Índices Já Existentes (Bem Otimizados)

### Tabela: `users`
- ✅ `idx_users_username` - Busca por username
- ✅ `idx_users_email` - Busca por email
- ✅ PRIMARY KEY on `id` - Auth lookups

### Tabela: `usernames`
- ✅ `idx_usernames_username` - **CRÍTICO** para páginas públicas
- ✅ `idx_usernames_user_id` - Relação com users

### Tabela: `pages`
- ✅ `idx_pages_user_id` - Buscar páginas do usuário
- ✅ `idx_pages_slug` - Buscar página por slug
- ✅ `idx_pages_user_active` - Páginas ativas do usuário
- ✅ `unique_primary_page` - Garantir única página primária

### Tabela: `resources`
- ✅ `idx_resources_page_id` - Recursos da página
- ✅ `idx_resources_page_order` - Recursos ordenados
- ✅ `idx_resources_type` - Filtro por tipo

### Tabelas de Recursos (links, galleries, etc.)
- ✅ Todas possuem índices em `resource_id` (UNIQUE)
- ✅ `idx_gallery_items_order` - Items ordenados

### Tabela: `social_networks`
- ✅ `idx_social_networks_page_id` - Redes da página
- ✅ `idx_social_networks_page_platform` - Busca por plataforma

---

## 🎯 Novos Índices CRÍTICOS (Prioridade Alta)

### 1. **pages.slug + is_active** ⭐⭐⭐
```sql
CREATE INDEX idx_pages_slug_active 
ON pages(slug, is_active) WHERE is_active = true;
```
**Motivo:** Query mais frequente do sistema (páginas públicas)  
**Query:** `SELECT * FROM pages WHERE slug = ? AND is_active = true`  
**Uso:** Hook `usePublicPage.ts` linha 141-146

### 2. **resources.page_id + is_visible + display_order** ⭐⭐⭐
```sql
CREATE INDEX idx_resources_page_visible_order 
ON resources(page_id, is_visible, display_order) WHERE is_visible = true;
```
**Motivo:** Carregamento de recursos em páginas públicas  
**Query:** `SELECT * FROM resources WHERE page_id = ? AND is_visible = true ORDER BY display_order`  
**Uso:** `supabaseService.ts` linha 267-271

### 3. **pages.user_id + is_primary** ⭐⭐
```sql
CREATE INDEX idx_pages_user_primary 
ON pages(user_id, is_primary) WHERE is_primary = true;
```
**Motivo:** Buscar página primária do usuário (dashboard)  
**Query:** `SELECT * FROM pages WHERE user_id = ? AND is_primary = true`  
**Uso:** `supabaseService.ts` linha 133-141

### ~~4. storage.objects~~ ✅ GERENCIADO PELO SUPABASE
**Nota:** A tabela `storage.objects` é gerenciada internamente pelo Supabase e já possui índices otimizados. Não é possível criar índices customizados nesta tabela.

---

## ⚠️ Novos Índices IMPORTANTES (Prioridade Média)

### 5. **gallery_items.destaque**
```sql
CREATE INDEX idx_gallery_items_destaque 
ON gallery_items(gallery_id, destaque, display_order) WHERE destaque = true;
```
**Motivo:** Feature de produtos em destaque  
**Uso:** Se houver filtros por destaque no frontend

### 6. **social_networks.display_mode**
```sql
CREATE INDEX idx_social_networks_page_mode 
ON social_networks(page_id, display_mode, display_order);
```
**Motivo:** Separar redes sociais top/bottom  
**Uso:** Se houver muitas redes sociais por página

### 7. **links.click_count** (Analytics)
```sql
CREATE INDEX idx_links_clicks 
ON links(click_count DESC) WHERE click_count > 0;
```
**Motivo:** Análise de links mais populares  
**Uso:** Dashboard de analytics (feature futura)

### 8. **reserved_usernames.username**
```sql
CREATE INDEX idx_reserved_usernames_username 
ON reserved_usernames(username);
```
**Motivo:** Verificação rápida de usernames reservados  
**Uso:** `rpc_check_username` função

---

## 📈 Índices para Analytics e Sincronização (Prioridade Baixa)

### 9-11. **Campos created_at**
```sql
CREATE INDEX idx_pages_created_at ON pages(created_at DESC);
CREATE INDEX idx_resources_created_at ON resources(created_at DESC);
CREATE INDEX idx_usernames_created_at ON usernames(created_at DESC);
```
**Motivo:** Auditoria e análise temporal  
**Uso:** Relatórios administrativos, detecção de padrões

### 12-14. **Campos updated_at**
```sql
CREATE INDEX idx_pages_updated_at ON pages(updated_at DESC);
CREATE INDEX idx_page_settings_updated_at ON page_settings(updated_at DESC);
CREATE INDEX idx_resources_updated_at ON resources(updated_at DESC);
```
**Motivo:** Cache invalidation e sincronização  
**Uso:** Features de sync em tempo real

---

## 🔍 Análise por Padrão de Query

### Query Pública (Mais Frequente)
**Fluxo:** username → user_id → page → resources → details

```sql
-- 1. Buscar user_id por username (✅ já otimizado)
SELECT user_id FROM usernames WHERE username = ?

-- 2. Buscar página ativa (⭐ NOVO ÍNDICE)
SELECT * FROM pages WHERE user_id = ? AND is_primary = true

-- 3. Buscar recursos visíveis (⭐ NOVO ÍNDICE)
SELECT * FROM resources 
WHERE page_id = ? AND is_visible = true 
ORDER BY display_order

-- 4. Buscar detalhes (✅ já otimizado com UNIQUE em resource_id)
SELECT * FROM links WHERE resource_id = ?
SELECT * FROM galleries WHERE resource_id = ?
```

### Query Privada (Dashboard do Usuário)
```sql
-- 1. Auth lookup (✅ otimizado)
SELECT * FROM users WHERE id = auth.uid()

-- 2. Buscar página (⭐ NOVO ÍNDICE)
SELECT * FROM pages WHERE user_id = ? AND is_primary = true

-- 3. Buscar todos os recursos (✅ já otimizado)
SELECT * FROM resources WHERE page_id = ? ORDER BY display_order
```

### Queries de RLS (Background)
As policies fazem JOINs frequentes:
```sql
-- Exemplo: Verificar acesso a gallery_items
EXISTS (
  SELECT 1 FROM galleries g
  JOIN resources r ON r.id = g.resource_id
  JOIN pages p ON p.id = r.page_id  -- ✅ idx_resources_page_id
  WHERE g.id = gallery_items.gallery_id
  AND p.user_id = auth.uid()  -- ✅ idx_pages_user_id
)
```
**Status:** ✅ Já otimizado pelos índices existentes

---

## 📊 Impacto Estimado de Performance

| Tabela | Índices Existentes | Novos Índices | Impacto Estimado |
|--------|-------------------|---------------|------------------|
| `usernames` | 2 | 0 | ✅ Já otimizado |
| `pages` | 4 | 3 | 🔥 +40% em queries públicas |
| `resources` | 3 | 2 | 🔥 +50% em carregamento |
| `gallery_items` | 2 | 1 | ⚡ +20% com destaque |
| `social_networks` | 2 | 2 | ⚡ +15% com filtros |
| `storage.objects` | N/A | 0 | ✅ Gerenciado pelo Supabase |
| `links` | 1 | 1 | 📊 Analytics |
| Outros | - | 6 | 📊 Sync e audit |

---

## 🎬 Plano de Implementação

### Fase 1: CRÍTICO (Implementar AGORA)
Execute imediatamente antes de lançar:
```bash
# 1. Executar script de otimização
psql < supabase/supabase_indexes_optimization.sql
```

Índices incluídos:
- ✅ `idx_pages_slug_active`
- ✅ `idx_resources_page_visible_order`
- ✅ `idx_pages_user_primary`

**Tempo estimado:** 5-10 segundos em BD pequeno, 1-2 minutos em 100k registros

### Fase 2: IMPORTANTE (Antes de 10k usuários)
- ⚠️ `idx_gallery_items_destaque`
- ⚠️ `idx_social_networks_page_mode`
- ⚠️ `idx_reserved_usernames_username`

### Fase 3: ANALYTICS (Sob demanda)
- 📊 Índices de `created_at`
- 📊 Índices de `updated_at`
- 📊 `idx_links_clicks`

---

## 🔧 Comandos de Monitoramento

### Verificar índices não utilizados
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Verificar índices mais usados
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC
LIMIT 20;
```

### Verificar tamanho total de índices
```sql
SELECT
  pg_size_pretty(SUM(pg_relation_size(indexrelid))) as total_index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public';
```

### Analisar queries lentas (Supabase Dashboard)
```
Settings → Database → Query Performance
```

---

## 🚀 Estratégias de Escalabilidade Futuras

### 10k - 100k Usuários
1. ✅ Implementar todos os índices críticos
2. 🔄 Configurar **connection pooling** (PgBouncer)
3. 🔄 Implementar **caching** com Redis para páginas públicas
4. 🔄 CDN para storage (Cloudflare/CloudFront)

### 100k - 1M Usuários
1. 🔄 **Réplicas de leitura** para queries públicas
2. 🔄 **Particionamento** de tabelas grandes (resources, gallery_items)
3. 🔄 **Materialized views** para analytics
4. 🔄 **Full-text search** (pg_trgm) para busca de páginas

### 1M+ Usuários
1. 🔄 **Sharding** por região geográfica
2. 🔄 **Multi-region** deployment
3. 🔄 **Event sourcing** para auditoria
4. 🔄 Considerar **microservices** para storage

---

## ⚡ Quick Wins Adicionais

### 1. Configurar Postgres
```sql
-- Aumentar shared_buffers (Supabase gerencia automaticamente)
-- Ajustar work_mem para queries complexas
-- Configurar effective_cache_size
```

### 2. Otimizar Queries no Código
```typescript
// ✅ BOM: Select apenas campos necessários
.select('id, title, display_order')

// ❌ RUIM: Select *
.select('*')

// ✅ BOM: Usar limit em lists
.limit(100)

// ✅ BOM: Usar single() quando espera 1 resultado
.single()
```

### 3. Implementar Caching
```typescript
// Cache de páginas públicas (5 minutos)
const CACHE_TTL = 300;
const cacheKey = `page:${username}`;
```

### 4. Lazy Loading
```typescript
// Carregar gallery items sob demanda
// Não carregar todos os items de todas as galerias
```

---

## 📝 Conclusão

O projeto possui uma base sólida de índices, mas **4 índices críticos** devem ser implementados imediatamente para garantir performance em produção:

1. ⭐ `idx_pages_slug_active` - Query mais frequente
2. ⭐ `idx_resources_page_visible_order` - Carregamento de página
3. ⭐ `idx_pages_user_primary` - Dashboard do usuário  
4. ⭐ `idx_storage_objects_bucket_name` - Storage policies

**Próximo passo:** Executar `supabase/supabase_indexes_optimization.sql` no SQL Editor do Supabase.

---

**Arquivo SQL:** [`supabase_indexes_optimization.sql`](./supabase_indexes_optimization.sql)  
**Documentação do Schema:** [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md)
