This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

# MyCreators — README do Projeto

MyCreators é um construtor de páginas “link-in-bio” para criadores e marcas, inspirado em plataformas como a Sandwiche.me. O foco é permitir que qualquer criador crie uma bio profissional com blocos de conteúdo (links, galerias de produtos, contato via WhatsApp), personalize o visual, e ative monetização nativa de forma simples.

Este README cobre visão do produto, recursos, planos, monetização, domínios customizados, pagamentos, arquitetura, stack, instruções de execução, além de um planejamento por etapas com sprints e skills necessárias.

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

Diferencial: vitrine dupla — a do criador (links/produtos) e a de marcas (anúncios comissionados). O criador decide ligar/desligar a vitrine (Pro/VIP).

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

1) MVP Editor e Página Pública (2 semanas)
- Entregas:
  - Blocos: Link, Galeria, WhatsApp, DnD estável, Preview público
  - Customização básica de cores/fontes e cabeçalho
  - Build/Deploy automático (Netlify)
- Critérios de aceite:
  - Criador consegue montar uma bio funcional e visualizar em `/preview`

2) Autenticação, Persistência e Domínios (2–3 semanas)
- Entregas:
  - Auth (Clerk/Auth0/Supabase Auth)
  - Persistência de página do criador (Supabase/Firebase/Postgres)
  - Slug público `/u/:slug`; reserva/checagem de disponibilidade
  - Início da conexão de domínio customizado (UI + instruções DNS)
- Critérios de aceite:
  - Página persiste entre sessões e é acessível por slug

3) Pagamentos e Planos (2–3 semanas)
- Entregas:
  - Checkout (Stripe/Mercado Pago) para assinatura do Pro/VIP
  - Webhooks e atualização de status de plano
  - Remoção de anúncios para Pro/VIP; vitrine dupla para Free
- Critérios de aceite:
  - Troca de plano reflete imediatamente nas features

4) Analytics e CRM (2–3 semanas)
- Entregas:
  - Coleta de métricas (cliques, visitas, origem)
  - Dashboards (recharts), filtros por período
  - Captura de contatos/leads (form + export CSV)
- Critérios de aceite:
  - Dados confiáveis e exportáveis

5) Explorar/Descoberta e Afiliados (3–4 semanas)
- Entregas:
  - Diretório “Explorar creators” com ranking/destaques
  - Sub-links/IDs de afiliados por criador e tracking de atribuição
- Critérios de aceite:
  - Tráfego gerado pelo diretório e tracking consistente

6) Admin e Operação (2 semanas)
- Entregas:
  - Painel admin (moderação, billing, suporte)
  - Observabilidade (logs, alertas) e políticas de privacidade/termos

## Skills por sprint
- Front-end: React+TS, shadcn/ui, Tailwind, DnD (`@dnd-kit`), acessibilidade
- Back-end/Serverless: Netlify Functions, Node/Express, integração Stripe/Mercado Pago, webhooks
- Dados/Analytics: modelagem de eventos, dashboards, exportações
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

---

Próximas ações sugeridas

Criar um service worker mínimo em public/sw.js para remover o erro no console e habilitar PWA básico.
Definir provedor de pagamentos: Stripe e/ou Mercado Pago, e começar pelos webhooks (Netlify Functions).
Modelar o slug público e persistência das páginas (ex.: Supabase/Firebase) e publicar a página pública em /u/:slug.
Escolher provedor de autenticação (Clerk/Auth0/Supabase Auth) para persistir dados do criador.
Definir provedores e UX de domínio customizado (DNS via Netlify/Cloudflare), com tela em Ajustes.
Especificar o modelo de anúncios/vitrine para o plano Free (critérios de exibição, categorias e split de receita).
Perguntas rápidas para avançar

Preferência de pagamento: Stripe, Mercado Pago ou ambos?
Preferência de autenticação: Clerk, Auth0, Supabase Auth?
Banco de dados: Supabase (Postgres) atende para o MVP?
Domínio/próxy: Netlify + DNS (Cloudflare) está ok?
Podemos já criar o public/sw.js para o PWA mínimo?