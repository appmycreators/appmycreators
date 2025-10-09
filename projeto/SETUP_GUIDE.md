# 🚀 MyCreator - Guia de Configuração Completo

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Supabase](#configuração-do-supabase)
3. [Configuração do Projeto](#configuração-do-projeto)
4. [Executar o Projeto](#executar-o-projeto)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Próximos Passos](#próximos-passos)

---

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v18 ou superior)
- **npm** ou **yarn** ou **bun**
- Conta no **Supabase** (gratuita)

---

## 🗄️ Configuração do Supabase

### Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha os dados do projeto:
   - **Nome**: MyCreator
   - **Database Password**: Escolha uma senha forte
   - **Region**: Escolha a mais próxima de você
5. Aguarde a criação do projeto (~2 minutos)

### Passo 2: Executar Migração SQL

1. No painel do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase_migration.sql`
4. Cole no editor SQL
5. Clique em **Run** para executar
6. ✅ Verifique se todas as tabelas foram criadas com sucesso

**Tabelas criadas:**
- `users`
- `pages`
- `page_settings`
- `social_networks`
- `resources`
- `links`
- `whatsapp_links`
- `spotify_embeds`
- `youtube_embeds`
- `image_banners`
- `galleries`
- `gallery_items`

### Passo 3: Obter Credenciais

1. Vá em **Project Settings** > **API** (menu lateral)
2. Copie as seguintes informações:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Passo 4: Configurar Autenticação por Email

1. Vá em **Authentication** > **Providers** (menu lateral)
2. Habilite **Email** provider
3. Configure:
   - ✅ Enable Email provider
   - ✅ Confirm email (recomendado para produção)
   - Para testes locais, pode desabilitar "Confirm email"

### Passo 5: Configurar Storage (Opcional - para upload de imagens)

1. Vá em **Storage** (menu lateral)
2. Clique em **Create a new bucket**
3. Nome do bucket: `avatars`
4. Configurar como **Public bucket**
5. Repita para criar bucket `media` (para banners e galerias)

**Políticas de Storage:**
```sql
-- Bucket: avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

## ⚙️ Configuração do Projeto

### Passo 1: Instalar Dependências

```bash
npm install
```

Ou se estiver usando Yarn:
```bash
yarn install
```

Ou Bun:
```bash
bun install
```

### Passo 2: Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.local.example .env.local
```

2. Abra `.env.local` e adicione suas credenciais do Supabase:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://eosivjvgfexoxakftbcl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2l2anZnZmV4b3hha2Z0YmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDk0OTAsImV4cCI6MjA3NDU4NTQ5MH0.CN6Lj62M48iLDFp7hUFuvmMrFCLAXyqwfesHi7gRp8U
```

⚠️ **IMPORTANTE**: 
- Substitua pelos valores reais do seu projeto Supabase
- Nunca commit o arquivo `.env.local` (já está no .gitignore)

---

## 🚀 Executar o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em: `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

### Preview do Build

```bash
npm run preview
```

---

## 📁 Estrutura do Projeto

```
PROJETO-V3/
├── public/                      # Arquivos públicos estáticos
│   ├── images/                  # Imagens e ícones
│   └── manifest.json            # PWA manifest
├── src/
│   ├── assets/                  # Assets da aplicação
│   │   ├── icones/              # Ícones gerais
│   │   └── icones-redes-sociais/# Ícones de redes sociais
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes UI (shadcn)
│   │   ├── MainContent.tsx      # Editor principal de página
│   │   ├── PublicPage.tsx       # Visualização pública
│   │   ├── Sidebar.tsx          # Menu lateral
│   │   └── ...                  # Outros componentes
│   ├── contexts/                # React Contexts
│   │   └── AuthContext.tsx      # Contexto de autenticação
│   ├── hooks/                   # Custom Hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/                     # Bibliotecas e configs
│   │   └── supabase.ts          # Cliente Supabase
│   ├── pages/                   # Páginas da aplicação
│   │   ├── Index.tsx            # Página principal (dashboard)
│   │   ├── Login.tsx            # Página de login
│   │   ├── Signup.tsx           # Página de cadastro
│   │   ├── ForgotPassword.tsx   # Recuperação de senha
│   │   ├── Preview.tsx          # Preview da página pública
│   │   └── NotFound.tsx         # Página 404
│   ├── services/                # Serviços e APIs
│   │   └── supabaseService.ts   # Funções CRUD Supabase
│   ├── App.tsx                  # Componente raiz
│   └── main.tsx                 # Entry point
├── .env.local                   # Variáveis de ambiente (local)
├── .env.local.example           # Exemplo de env vars
├── DATABASE_SCHEMA.md           # Documentação do banco
├── supabase_migration.sql       # Script de migração SQL
├── SETUP_GUIDE.md               # Este arquivo
└── package.json                 # Dependências do projeto
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- [x] Sistema de login com email/senha
- [x] Cadastro de novos usuários
- [x] Recuperação de senha
- [x] Proteção de rotas privadas
- [x] Logout
- [x] Persistência de sessão

### ✅ Banco de Dados
- [x] Schema completo documentado
- [x] Tabelas criadas com RLS habilitado
- [x] Triggers automáticos
- [x] Políticas de segurança configuradas

### ✅ Interface
- [x] Páginas de autenticação modernas e responsivas
- [x] Editor de página (MainContent)
- [x] Preview da página pública
- [x] Sidebar com perfil do usuário

### ✅ Serviços
- [x] Service layer completo para CRUD
- [x] Integração com Supabase
- [x] Gestão de recursos (links, galerias, etc.)

---

## 🔜 Próximos Passos

### Fase 1: Integração Completa do Editor

**O que falta fazer:**

1. **Conectar MainContent ao Supabase**
   - Carregar dados da página do usuário
   - Salvar alterações em tempo real
   - Sincronizar estado local com o banco

2. **Implementar Preview Dinâmico**
   - Carregar página por slug
   - Exibir recursos salvos
   - Suporte para página pública

### Fase 2: Upload de Arquivos

1. **Integração com Supabase Storage**
   - Upload de avatar
   - Upload de imagens de banner
   - Upload de imagens de galeria
   - Otimização de imagens

### Fase 3: Funcionalidades Avançadas

1. **Analytics**
   - Rastreamento de cliques
   - Visualizações da página
   - Estatísticas de recursos

2. **Customização Avançada**
   - Temas personalizados
   - Cores e gradientes
   - Fontes customizadas

3. **Recursos Premium**
   - Múltiplas páginas
   - Domínio customizado
   - Remoção de branding

---

## 🧪 Testando a Aplicação

### 1. Criar Primeira Conta

1. Acesse `http://localhost:5173/signup`
2. Preencha:
   - Username: `testeuser`
   - Email: `teste@exemplo.com`
   - Senha: `Teste123`
3. Clique em "Criar conta grátis"
4. Verifique o email (se confirmação estiver habilitada)

### 2. Fazer Login

1. Acesse `http://localhost:5173/login`
2. Use as credenciais criadas
3. Você será redirecionado para o dashboard

### 3. Testar Logout

1. Clique no seu perfil no sidebar
2. Selecione "Sair"
3. Você será redirecionado para a página de login

---

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"

**Solução**: Verifique se o arquivo `.env.local` existe e contém as variáveis corretas.

### Erro ao executar SQL migration

**Solução**: 
1. Verifique se está usando o SQL Editor do Supabase
2. Execute o script em partes se houver timeout
3. Verifique se não há erros de sintaxe

### Erro: "Row Level Security policy violation"

**Solução**:
1. Verifique se as políticas RLS foram criadas corretamente
2. No Supabase, vá em **Database** > **Policies**
3. Confirme que as políticas estão ativas

### Página não carrega após login

**Solução**:
1. Abra o console do navegador (F12)
2. Verifique se há erros de rede ou JavaScript
3. Limpe o cache e cookies
4. Tente fazer logout e login novamente

---

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação React](https://react.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)

---

## 🤝 Suporte

Se encontrar problemas:

1. Verifique a documentação acima
2. Consulte o console do navegador para erros
3. Verifique os logs do Supabase
4. Revise o arquivo `DATABASE_SCHEMA.md` para entender a estrutura

---

## 📝 Notas Importantes

⚠️ **Ambiente de Desenvolvimento Local**:
- Este setup é para desenvolvimento local com `.env.local`
- Para produção, use variáveis de ambiente do seu provedor de hosting

⚠️ **Segurança**:
- Nunca exponha suas chaves privadas
- Use apenas a `anon public key` no frontend
- As políticas RLS protegem seus dados

⚠️ **Performance**:
- Em produção, habilite caching
- Otimize imagens antes do upload
- Use CDN para assets estáticos

---

✨ **Pronto!** Seu ambiente está configurado e pronto para desenvolvimento!
