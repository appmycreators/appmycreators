This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

# MyCreators 

MyCreators é um construtor de páginas “link-in-bio” para criadores e marcas, inspirado 
em plataformas como a Sandwiche.me. O foco é permitir que qualquer criador crie 
uma bio profissional com blocos de conteúdo (links, galerias de produtos, 
contato via WhatsApp), personalize o visual, e ative monetização nativa de forma simples.

## Inspiração e referência
- Sandwiche.me: página de referência para “link in bio”, personalização, métricas e foco em conversão. Ver: https://sandwiche.me/en
- Outras referências do mercado: Beacons, Linktree, Squarespace Bio Sites.

## Stack técnica
- Front-end: React 18 + TypeScript (Vite)
- UI: Tailwind CSS + shadcn/ui + Radix (componentes em `src/components/ui/`)
- Estado/Network: React Query (já configurado em `src/App.tsx`), React Router 6 (rotas em `src/App.tsx` e `src/pages/`)
- DnD: `@dnd-kit` para ordenar blocos (ver `src/components/MainContent.tsx`)
- Charts: `recharts` (base para futura área de analytics)
- Build: Vite com alias `@` para `src` (`vite.config.ts`)
- Estilos globais e tokens: `tailwind.config.ts` e `src/index.css`
- Deploy alvo: Netlify (arquivo `netlify.toml` com SPA redirect e build para `dist/`)
- PWA: `public/manifest.json`; o `index.html` referencia `sw.js` (ainda não criado), ver seção PWA/TODOs

## Arquitetura e estrutura relevante
- `src/pages/`
  - `Index.tsx`: shell principal com `Sidebar` + `Topbar` + `MainContent`
  - `Preview.tsx`: página pública de preview que usa `PublicPage`
  - `EditHeader.tsx`: fluxo alternativo de edição de cabeçalho
- `src/components/`
  - `Sidebar.tsx`: menu lateral (fonte para os recursos do roadmap)
  - `MainContent.tsx`: editor visual, seleção de recursos, DnD, modais e ordem de blocos
  - `ResourceSelector.tsx`: catálogo de blocos (Galeria, Link, WhatsApp, etc.)
  - `CustomizationModal.tsx`: customização (cores, fonte, botões)
  - `EditHeaderForm.tsx`: edição de avatar, nome, bio e mídia de topo
  - `GalleryItemForm.tsx` + `ProfileSection.tsx`: criação/edição de cards de produto
  - `LinkForm.tsx`: criação/edição de links com ícone/imagem
  - `WhatsAppForm.tsx`: criação de botão de WhatsApp (com mensagem pré-preenchida)
  - `PublicPage.tsx`: renderização pública da página do criador
  - `ui/*`: biblioteca de componentes (buttons, dialogs, sidebar, topbar, etc.)

## Recursos atuais (MVP já no código)
- Editor com blocos:
  - Botões de link simples (`LinkForm.tsx`)
  - Galeria de produtos com imagem, título, preço e CTA (`GalleryItemForm.tsx`, `ProfileSection.tsx`)
  - Botão de WhatsApp com mensagem (`WhatsAppForm.tsx`)
  - Ordenação via arrastar-e-soltar (`MainContent.tsx` com `@dnd-kit`)
- Customização visual de base: cores e fontes (`CustomizationModal.tsx`)
- Edição de cabeçalho: avatar, nome, bio e mídia de topo (`EditHeaderForm.tsx`)
- Preview público: rota `/preview` usando `PublicPage.tsx`

## Recursos derivados do menu lateral (roadmap)
A partir de `src/components/Sidebar.tsx`, os itens devem virar áreas/recurso no produto:
- Início (Dashboard):
  - Sumário do perfil, atalhos para editar, status de publicação, checklist de onboarding
- Editar página:
  - É o editor atual (blocos, DnD, modais)
- Customizar:
  - Paletas de cores, fontes, temas, estilos de botões, espaçamentos e bordas
- Analytics:
  - Visualização de visitas, CTR por botão, origem do tráfego, funis, período customizável (usar `recharts`)
- Adicionar página (Multi-páginas):
  - Suporte a múltiplas páginas por criador (por campanha/produto)
- Ver minha página:
  - Ação para abrir a página pública (ex.: `/u/:slug`)
- Ajustes:
  - Domínio customizado, SEO, integrações (Pixel, GA4), preferências de privacidade/cookies

## Planos e monetização (da proposta-projeto.md)
- Plano Grátis (Creator Free)
  - Criador monta a bio, adiciona links, personaliza layout
  - MyCreators exibe 1–2 anúncios nativos automáticos (vitrine)
  - Receita para MyCreators via anúncios
- Plano Pro (Creator Pro)
  - Desliga anúncios (bio 100% clean)
  - Comissão por cliques/vendas/leads (receita compartilhada)
  - Acesso a: analytics avançado, CRM/contatos, vendas diretas (checkout integrado), temas premium, links dinâmicos
  - Monetização via assinatura mensal
- Plano VIP (Creator Business)
  - Foco em criadores grandes e agências
  - Monetização extra (marca fechada direto)
  - Destaque no “Explorar creators” (ganho de tráfego)
  - Suporte premium
  - Sub-links para afiliados (ex.: equipe de vendas do creator)

Diferencial: vitrine dupla — a do criador (links/produtos) e a de 
marcas (anúncios comissionados). O criador decide ligar/desligar a vitrine (Pro/VIP).

## Domínio customizado
- MVP: publicar a página pública em rota própria (ex.: `/u/:slug`)
- Próximo passo: conectar domínio próprio por projeto/usuário (CNAME/ALIAS, validação DNS) via Netlify/Cloudflare
- UI em Ajustes para conectar domínio e estado da verificação

## Pagamentos/Checkout e Planos
- Provedores sugeridos: Stripe (global) e/ou Mercado Pago (BR)
- Fluxos:
  - Assinatura do plano (Pro/VIP)
  - Checkout de produto do criador (one-off) com webhooks
- Infra proposta (serverless): Netlify Functions para webhooks de pagamento, emissão de sessão de checkout e gestão de assinatura
- Controle de features por plano no front-end (feature flags) e back-end (claims/entitlements)

## Roadmap por etapas e sprints

1) MVP Editor e Página Pública 
  - Blocos: Link, Galeria Produtos, WhatsApp, DnD estável, Preview público
  - Customização básica de cores/fontes e cabeçalho
  - Build/Deploy automático (Netlify)
  - Criador consegue montar uma bio funcional e visualizar em `/preview`
  - Vídeos em BG convertido para GIF
  - Templates de página pré-prontos (link simples, galeria de produtos, etc.).

2) Autenticação, Persistência e Domínios
  - Auth (Clerk/Auth0/Supabase Auth)
  - Persistência de página do criador (Supabase/Firebase/Postgres)
  - Slug público `/u/:slug`; reserva/checagem de disponibilidade
  - Início da conexão de domínio customizado (UI + instruções DNS)

3) Pagamentos e Planos 
  - Checkout (Stripe/Mercado Pago) para assinatura do Pro/VIP
  - Webhooks e atualização de status de plano
  - Remoção de anúncios para Pro/VIP; vitrine dupla para Free

4) Analytics e CRM 
  - Coleta de métricas (cliques, visitas, origem)
  - Dashboards (recharts), filtros por período
  - Captura de contatos/leads (form + export CSV)

5) Explorar/Descoberta e Afiliados
  - Diretório “Explorar creators” com ranking/destaques
  - Sub-links/IDs de afiliados por criador e tracking de atribuição

6) Admin, Operação, Infra, Experiência e Quotas & Limites
  - Painel admin (moderação, billing, suporte)
  - Observabilidade (logs, alertas) e políticas de privacidade/termos
  - Gestão de usuários, páginas, denúncias.
  - Ferramentas de suporte (reset de senha, upgrade/downgrade manual de plano).
  - Painel de billing (quantos ativos em Free/Pro/VIP).
  - Webhooks de pagamento (Stripe / Mercado Pago).  
  - Geração de links de checkout.  
  - Feature flags e validação de recursos por plano.  
  - Sanitização de dados antes de salvar no banco.  
  - Funções de analytics (tracking de eventos, conversões, cliques).
   
- Definição de limites por plano:
  - Free: 1 página, X blocos, Y imagens.  
  - Pro: múltiplas páginas, mais blocos/imagens.  
  - VIP: ilimitado.  

  - Redimensionamento automático de imagens (thumbnails, webp).  
  - Compressão de imagens para reduzir banda.  
  - Uso de CDN (via Supabase Storage ou Netlify).  
  
## Banco de dados (Supabase)

A camada de dados será provida pelo **Supabase**, que combina Postgres gerenciado, 
autenticação, storage e APIs REST/GraphQL automáticas. 
Ele servirá como **backend principal** do MyCreators.  

### Estrutura inicial de tabelas (proposta MVP)

- **users**  
  - `id` (uuid, pk) — fornecido pelo Supabase Auth  
  - `email`  
  - `name`  
  - `avatar_url`  
  - `plan` (enum: free, pro, vip)  
  - `created_at`, `updated_at`

- **pages** (cada criador pode ter 1+ páginas “link in bio”)  
  - `id` (uuid, pk)  
  - `user_id` (fk → users.id)  
  - `slug` (unique, usado em `/u/:slug`)  
  - `title` (nome da página, ex.: “Bio Principal”)  
  - `theme` (jsonb: cores, fontes, espaçamento)  
  - `published` (boolean)  
  - `created_at`, `updated_at`

- **blocks** (cada elemento editável: link, galeria, whatsapp, etc.)  
  - `id` (uuid, pk)  
  - `page_id` (fk → pages.id)  
  - `type` (enum: link, gallery, whatsapp, header, etc.)  
  - `content` (jsonb: dados específicos, ex.: `{ "url": "...", "title": "...", "price": ... }`)  
  - `order` (int, posição para drag-and-drop)  
  - `created_at`, `updated_at`

- **analytics_events** (para métricas de cliques/visitas)  
  - `id` (uuid, pk)  
  - `page_id` (fk → pages.id)  
  - `block_id` (nullable, fk → blocks.id)  
  - `type` (enum: view, click, conversion)  
  - `origin` (string, referrer/UTM)  
  - `created_at`

- **subscriptions** (status da assinatura do criador)  
  - `id` (uuid, pk)  
  - `user_id` (fk → users.id)  
  - `provider` (enum: stripe, mercadopago)  
  - `status` (active, canceled, trial, past_due)  
  - `current_period_end` (timestamp)  
  - `created_at`, `updated_at`

- **storage** (gerenciado nativamente pelo Supabase Storage)  
  - Pastas: `avatars/`, `media/` (imagens da galeria, cabeçalhos, etc.)

### Integrações com Supabase
- **Auth**: login de criadores via e-mail/password, social (Google, etc.)  
- **RLS (Row Level Security)**:  
  - Criadores só podem acessar/editar suas próprias páginas e blocos  
  - Páginas públicas (`/u/:slug`) liberadas para leitura anônima  
- **APIs**: o Supabase gera REST/GraphQL para todas as tabelas; o front usa **React Query** para consumo  
- **Realtime**: opcional para preview colaborativo no editor  
- **Functions (Edge)**: para lógica extra, ex. tracking de analytics ou sincronização de planos via webhooks de pagamento  

### Benefícios do Supabase no projeto
- Postgres robusto sem precisar administrar infra  
- APIs automáticas para CRUD dos dados  
- Storage nativo para mídia  
- Autenticação integrada  
- Suporte a RLS para segurança de dados


## Skills por sprint
- Front-end: React+TS, shadcn/ui, Tailwind, DnD (`@dnd-kit`), acessibilidade
- Back-end/Serverless: Netlify Functions, Node/Express, integração Stripe/Mercado Pago, webhooks
- Dados/Analytics: modelagem de eventos, dashboards, exportações
- Data Base Postgres
- Infra/DevOps: Netlify, DNS/domínios, CI/CD
- Produto/UX: design de editor, onboarding, copy de conversão

## Execução local
- Requisitos: Node.js 18+ e npm
- Instalação: `npm i`
- Desenvolvimento: `npm run dev` (Vite)
- Lint: `npm run lint`
- Build: `npm run build` (saída em `dist/`)
- Preview local: `npm run preview`

## PWA e TODOs
- Manifesto PWA já configurado em `public/manifest.json`
- `index.html` referencia `sw.js`, mas o arquivo ainda não existe — criar service worker básico para cache estático
- Considerar estratégia Workbox no futuro

## Variáveis de ambiente (propostas)
- `VITE_API_BASE_URL`
- `VITE_STRIPE_PUBLIC_KEY` / secrets em funções serverless
- `VITE_GA4_ID` e/ou `VITE_META_PIXEL_ID`
- `VITE_APP_URL` (para gerar links públicos)

## Segurança e conformidade
- Consentimento de cookies/trackers (GA4, Pixel)
- Termos de uso e Política de Privacidade
- Proteção contra spam no formulário de leads (hCaptcha/Turnstile)
- Chamadas API via serveless

---


Plano Grátis (Creator Free)

Criador monta sua bio, coloca links, personaliza layout.

O MyCreators exibe 1 ou 2 anúncios nativos automáticos (vitrine).

MyCreators ganha Com anuncios  


🔹 Plano Pro (Creator Pro)

Criador pode desligar anúncios (bio 100% clean).
Porém deixando ligado / O MyCreators exibe 1 ou 2 anúncios nativos automáticos (vitrine).

O criador ganha comissão por cliques/vendas/leads.

MyCreators ganha uma parte → receita compartilhada.
Ganha acesso a:
✅ analytics avançado
✅ CRM/contatos captados
✅ vendas diretas (checkout integrado)
✅ temas premium e links dinâmicos

Aqui você monetiza via assinatura mensal.

🔹 Plano VIP (Creator Business)

Pensado para criadores grandes e agências.

Benefícios:
✅ monetização extra (marca fechada direto)
✅ destaque no “explorar creators” (ganha tráfego novo)
✅ suporte premium
✅ possibilidade de criar sub-links para afiliados (ex.: equipe de vendas do creator).

🎯 O que você ganha com isso:

Diferencial matador: nenhum concorrente deixa o criador ganhar dinheiro só por existir na bio.

O modelo vira vitrine dupla:

A vitrine do criador (seus links/produtos).

A vitrine de marcas (anúncios relevantes, comissionados).

Criador não precisa escolher entre monetizar ou estética: ele mesmo decide se liga ou desliga a opção.

 É quase como dar ao usuário um mini AdSense + Linktree no mesmo lugar.