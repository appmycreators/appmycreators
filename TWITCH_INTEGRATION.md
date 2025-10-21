# Integração Twitch - MyCreators

## Resumo
Foi implementado um novo recurso de embed de stream Twitch para o MyCreators, seguindo o mesmo padrão dos recursos YouTube e Spotify.

## Componentes Criados

### Frontend

1. **TwitchForm.tsx** - Formulário modal para inserção da URL da Twitch
   - Valida URLs do tipo `twitch.tv/canal` ou `player.twitch.tv/?channel=canal&parent=...`
   - Extrai automaticamente o nome do canal
   - Interface consistente com outros formulários
   - Usa ícone SVG oficial da Twitch

2. **TwitchEmbedCard.tsx** - Card de visualização do embed no dashboard
   - Renderiza o player da Twitch com altura fixa de 300px (evita expansão excessiva)
   - Botões de edição e exclusão
   - Gerencia automaticamente o parâmetro `parent` necessário para embeds da Twitch
   - Usa ícone SVG oficial da Twitch

3. **TwitchBlock.tsx** - Componente block para integração com drag-and-drop
   - Conecta com o sistema de sincronização de links
   - Filtra links da Twitch

### Integrações

4. **ResourceSelector** - Adicionado recurso Twitch com ícone SVG oficial (`/assets/icones/twitch.svg`)
5. **ModalsContainer** - Integrado TwitchForm
6. **useModals** - Adicionado estado `twitch` e lógica de abertura
7. **useContentHandlers** - Adicionado handler para seleção de recurso Twitch
8. **LinkBlock** - Adicionado roteamento para TwitchBlock
9. **PublicContentBlock** - Adicionada renderização pública do embed Twitch

## Banco de Dados

### Estrutura Atual (baseada nas memórias)

O projeto já utiliza a tabela `links` para armazenar YouTube e Spotify:
- **Table: links** (title, url, icon, image_url, bg_color)

### Como Funciona

A Twitch **não precisa de uma tabela separada** (como `youtube_embeds` ou `spotify_embeds` que podem existir). 
O recurso Twitch funciona através da tabela `links` da mesma forma que YouTube e Spotify atualmente funcionam.

Quando um usuário adiciona uma Twitch:
1. É criado um registro na tabela `links` com `url` contendo `twitch.tv`
2. O tipo é identificado pela URL (não por tipo de recurso separado)
3. O frontend renderiza o componente apropriado baseado na URL

### Arquivos SQL que Precisam ser Atualizados

Você mencionou os arquivos:
- `MIGRATION_get_public_page_data_by_slug.sql`
- `MIGRATION_get_dashboard_page_data_by_page_id.sql`

**Não são necessárias alterações nesses arquivos** porque:
1. A Twitch usa a mesma tabela `links` que já está sendo retornada
2. O frontend já identifica automaticamente URLs da Twitch
3. Não há tabela relacional específica como `twitch_embeds`

Se você quiser adicionar uma tabela específica (não recomendado para simplicidade), seria:

```sql
-- OPCIONAL: Tabela específica para embeds Twitch (não implementado no frontend atual)
CREATE TABLE twitch_embeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE twitch_embeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own twitch embeds"
  ON twitch_embeds FOR SELECT
  USING (
    resource_id IN (
      SELECT r.id FROM resources r
      JOIN pages p ON r.page_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own twitch embeds"
  ON twitch_embeds FOR ALL
  USING (
    resource_id IN (
      SELECT r.id FROM resources r
      JOIN pages p ON r.page_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );
```

## Como Usar

1. No dashboard, clique em "Adicionar"
2. Selecione "Twitch"
3. Cole a URL do canal: `https://twitch.tv/seu_canal` ou a URL do player embed
4. O sistema extrai automaticamente o nome do canal
5. O embed é renderizado com dimensões 16:9 (mesmo do YouTube)

## Parâmetro Parent

A Twitch requer o parâmetro `parent` no embed para segurança. O sistema adiciona automaticamente:
- No dashboard: `window.location.hostname`
- Na página pública: domínio da página pública

## Exemplo de URL Aceita

```
https://twitch.tv/alicegobbibr
https://www.twitch.tv/alicegobbibr
https://player.twitch.tv/?channel=alicegobbibr&parent=pilatesasiatico.com.br
```

## Dimensões do Player

O player Twitch usa altura fixa de 300px para evitar expansão excessiva no layout, mantendo um tamanho compacto e consistente tanto no dashboard quanto na página pública.

## Próximos Passos (Opcional)

Se quiser implementar funcionalidades adicionais:
1. Suporte para embeds de vídeos específicos (além de canais ao vivo)
2. Opção de chat lado a lado
3. Configurações de player (mute, autoplay)

## Arquivos Modificados/Criados

```
src/components/
├── TwitchForm.tsx (novo)
├── TwitchEmbedCard.tsx (novo)
├── blocks/
│   ├── TwitchBlock.tsx (novo)
│   └── LinkBlock.tsx (modificado)
├── modals/
│   └── ModalsContainer.tsx (modificado)
├── public/
│   └── PublicContentBlock.tsx (modificado)
└── ResourceSelector.tsx (modificado)

src/hooks/
├── modals/
│   └── useModals.ts (modificado)
└── content/
    └── useContentHandlers.ts (modificado)
```
