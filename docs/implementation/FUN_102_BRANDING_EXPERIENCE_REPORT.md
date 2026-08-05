# FUN-102 — Branding Experience — Relatório

**Status:** Concluída. **Natureza:** oitava Sprint funcional — nenhuma arquitetura, ADR, Manager, Repository Interface, Service, Command, Event ou Entity foi alterada. Todo trabalho aconteceu exclusivamente em `apps/web`, consumindo somente endpoints já existentes de `apps/api` (FUN-004/005).

---

## 1. Auditoria do `BrandingManager` — Passo Obrigatório Antes de Qualquer Código

Leitura integral de `docs/architecture/BRANDING_HUB.md` (23 capítulos, dezenove Componentes Internos: Brand Manager, Logo Manager, Color Engine, Typography Engine, Iconography Manager, Illustration Manager, Asset Library, Design Token Engine, Theme Generator, Theme Manager, Layout Engine, Template Manager, Document/Dashboard/Email/Landing Page Branding, AI Brand Context, Brand Validator, Accessibility Validator, Brand Versioning/History/Preview, Brand Export) contra `docs/implementation/BRANDING_HUB_CORE_MIGRATION_REPORT.md` (IMP-019, o que foi de fato implementado) — o mesmo padrão de distância entre visão e escopo curto-prazo já observado em toda Sprint desta série (IAM, Business Profile).

**`BrandingManager` real expõe exatamente sete métodos públicos:**

| Método | Assinatura | Natureza |
|---|---|---|
| `businessContext` | `(profileId) => {classification, maturity}` | Leitura — integração unidirecional com Business Profile |
| `submitLogo` | `(tenantId, assetReference) => Logo` | Escrita — referência opaca de ativo |
| `currentLogo` | `(tenantId) => Logo \| undefined` | Leitura |
| `generateInitialBrandIdentity` | `(payload) => {theme, tokens}` | Escrita — primeira geração, sem Command (precondição de Theme inexistente) |
| `regenerateTheme` | `(payload) => {theme, tokens}` | Escrita — Command `UpdateTheme` → Evento `ThemeUpdated` |
| `updatePalette` | `(payload) => tokens[]` | Escrita — Command `UpdatePalette` → Evento `BrandPaletteUpdated` |
| `currentTheme` | `(tenantId) => BrandTheme \| undefined` | Leitura |

Quatro Services sustentam esses métodos: `LogoService`, `DesignTokenService` (consolida "Color Engine" + "Typography Engine" + "Design Token Engine" — sem sub-estrutura própria a justificar Services distintos, mesmo raciocínio já registrado para `BusinessClassificationService` no Business Profile Engine), `BrandThemeService`, `AccessibilityValidatorService`. **Nenhum outro componente nomeado no Capítulo 7 tem Service produtor**: Iconography Manager, Illustration Manager, Asset Library, Theme Manager (distinto de `BrandThemeService`), Layout/Template Manager, Document/Email/Landing Page Branding, AI Brand Context, Brand Validator, Brand Versioning/History/Preview, Brand Export — nenhum implementado, nenhum citado em nenhuma camada do Roadmap (`BRANDING_HUB.md`, Capítulo 20), exceto Logo Manager/Color Engine/Typography Engine/Design Token Engine (os quatro do curto prazo, todos já cobertos pelos quatro Services acima).

**Achados de domínio relevantes para o desenho desta Sprint:**

- `DesignToken.category` é um union fechado de sete literais (`TokenCategory`): `"Cor" | "Tipografia" | "Espaçamento" | "Borda" | "Sombra" | "Ícone" | "Estado"`. Apenas **duas** são de fato populadas por algum Service (`generateColorTokens`/`generateTypographyTokens`) — as outras cinco existem só como estrutura de domínio, nunca geradas por nenhum Service desta Sprint.
- `Logo` é restrito a uma referência opaca (`assetReference: string`) — "nenhuma geração, edição, ou processamento de imagem acontece nesta Sprint" (comentário do próprio Core). Nenhum campo de variação (clara/escura/ícone/favicon) jamais existiu.
- `BrandTheme` tem apenas `themeId`/`tenantId`/`version`/`generatedAt` — nenhum campo de cor/fonte embutido; a identidade visual em si vive inteiramente nos `DesignToken` associados ao `themeId`.
- `regenerateTheme` é regeneração **completa** (ADR-012: "nunca incremental sobre o estado anterior") — novo `themeId`, nova versão, todos os Tokens recriados do zero.
- `updatePalette` regenera **apenas** os Tokens de categoria "Cor" do Theme vigente (mesmo `themeId`) — precondição "paleta anterior existente", rejeitada com erro caso contrário.
- `AccessibilityValidatorService` é uma implementação real de contraste WCAG (luminância relativa, `MINIMUM_CONTRAST_RATIO = 4.5`, busca preservando matiz/saturação por até 20 passos, fallback preto/branco) — usada internamente por `generateColorTokens` para ajustar `cor-texto-primaria` contra o fundo antes de qualquer paleta ser distribuída a um Theme (Capítulo 14).

**Limitação crítica, a mais consequente para o desenho desta Sprint:** `DesignTokenService.listByTheme(themeId)` existe no Service, mas **nunca foi exposto por `BrandingManager` nem por nenhuma rota de `apps/api/src/routes/branding.ts`** (confirmadas as sete rotas — nenhuma lista Tokens de forma independente). Os únicos Tokens que o Frontend pode conhecer são os que já vieram embutidos numa resposta de escrita (`generateInitialBrandIdentity`/`regenerateTheme`/`updatePalette`). Isso significa que a aba "Tokens"/"Paleta" **nunca pode fazer uma consulta fresca ao servidor** — depende inteiramente do que já foi recebido nesta sessão do navegador (o mesmo `brandTokens` já carregado no bootstrap, FUN-005). Documentado explicitamente na Seção 6.

---

## 2. Endpoints Utilizados (Nenhum Novo, Nenhum Contrato Alterado)

| Endpoint | Já existia desde | Consumido por |
|---|---|---|
| `POST /branding/identity` | FUN-004 | `seedDemoData` (inalterado) |
| `GET /branding/theme/:tenantId` | FUN-004 | `useBrandIdentity` (já existente, FUN-001/005) |
| `GET /branding/logos/:tenantId` | FUN-004 | `useBrandIdentity` (já existente, FUN-001/005) |
| `POST /branding/logos` | FUN-004 | **Novo uso nesta Sprint** — `useSubmitLogo` (hook novo) |
| `POST /branding/theme` (regenerar) | FUN-004 | **Novo uso nesta Sprint** — `useRegenerateTheme` (hook novo) |
| `POST /branding/palette` | FUN-004 | **Novo uso nesta Sprint** — `useUpdatePalette` (hook novo) |
| `GET /branding/context/:profileId` | FUN-004 | **Novo uso nesta Sprint** — `useBusinessContext` (hook novo) |

Quatro dos sete métodos de `BrandingManager` (`submitLogo`, `regenerateTheme`, `updatePalette`, `businessContext`) nunca haviam sido consumidos por nenhuma tela antes desta Sprint — apenas por `seedDemoData` (`generateInitialBrandIdentity`) e `useBrandIdentity` (`currentTheme`/`currentLogo`). Nenhuma rota nova foi criada em `apps/api`; nenhum DTO foi alterado.

---

## 3. Achados Reais Durante a Implementação

### 3.1. Mock de teste com formato de Token inventado, nunca correspondente ao Backend real

`createDemoApiFetchMock`'s resposta de `POST /branding/identity` simulava apenas **dois** Tokens com `category: "color"` (inglês, minúsculo) e nomes `"primary"`/`"background"` — nem a categoria nem os nomes jamais existiram no domínio real (`DesignTokenService` sempre gera **quatro** Tokens juntos: dois de categoria `"Cor"` — `cor-destaque-primaria`/`cor-texto-primaria` — e dois de `"Tipografia"` — `fonte-titulo`/`fonte-corpo`). Isso nunca quebrou nenhum teste anterior porque nenhum teste existente até esta Sprint agrupava/filtrava Tokens por categoria ou nome (`BrandingPage.tsx`, antes desta Sprint, apenas listava `token.name`/`token.category`/`token.value` cruamente, sem nenhuma lógica que dependesse do valor exato). A aba Tokens desta Sprint (Seção 6) foi a primeira consumidora a de fato depender da categoria real — expondo a lacuna. Corrigido: o mock agora devolve os quatro Tokens reais, com categoria/nome idênticos aos que `DesignTokenService` de fato produz, e as respostas de `POST /branding/theme` (regenerar) e `POST /branding/palette` (antes inexistentes no mock) foram adicionadas seguindo o mesmo formato real. `seedDemoData.test.ts` (`expect(snapshot.brandTokens).toHaveLength(2))`) foi atualizado para `toHaveLength(4)`, refletindo o comportamento real do Backend — benefício retroativo para qualquer teste futuro que também precise de Tokens corretos.

### 3.2. `profileId` quase descartado — Visão Geral ganhou o Contexto de Negócio real

O desenho inicial da Visão Geral não usava `profileId` (recebido como prop desde `BrandingPage`, mas sem consumidor). Em vez de descartá-lo, a seção passou a consumir `useBusinessContext(profileId)` — o único dos sete métodos de `BrandingManager` que nenhuma tela desta plataforma ainda usava (`businessContext`, a integração unidirecional real com o Business Profile, Capítulo 12). Resultado: a Visão Geral do Brand Center agora mostra Segmento/Subsegmento/Maturidade — dado genuinamente real, e mais um endpoint dos sete efetivamente coberto por esta Sprint.

---

## 4. Estrutura — Nove Seções, Mesma Navegação Contextual do Perfil Empresarial

`BrandingPage` foi reconstruída como um módulo de nove seções (`brandingSections.ts`, fonte única), navegáveis pela **mesma barra lateral contextual genérica** (`SectionSubNav`, ver Seção 7) já usada pelo Perfil Empresarial. A seção ativa é refletida em `?section=` via `useSearchParams`, sem introduzir nenhuma sub-rota nova.

| Seção | Dado real | Fonte |
|---|---|---|
| Visão Geral | Sim (exceto "Nome da marca") | `useBrandIdentity` + `useBusinessContext` + `brandTokens` |
| Logo | Parcial (referência do ativo, real; variações, não) | `useBrandIdentity` + `useSubmitLogo` |
| Paleta | Parcial (cor primária/texto, real e editável; secundária/feedback são do Design System, não do Tenant) | `brandTokens` + `useUpdatePalette` |
| Tipografia | Parcial (fontes, reais; escala/pesos são do Design System, não do Tenant) | `brandTokens` |
| Tokens | Parcial (Cor/Tipografia reais; 5 categorias sempre vazias) | `brandTokens` (cache de sessão, sem endpoint de listagem) |
| Tema | Sim (versão/data + regeneração real); Dark/Light real, Contraste não existe | `useBrandIdentity` + `useRegenerateTheme` + `core/theme` |
| Componentes | Não (galeria pura do Design System) | Nenhuma |
| Manual | Não (síntese somente leitura dos Tokens já carregados) | `brandTokens` |
| Exportação | Não oficialmente (exportação client-side real dos Tokens já carregados) | `brandTokens` |

Cada limitação é nomeada por `NotConnectedNotice` (generalizado nesta Sprint, ver Seção 7) — nunca escondida, nunca um formulário que finge persistir.

---

## 5. Decisões de Desenho por Seção

### 5.1. Visão Geral

Quatro `StatCard` (Tema ativo, Cores geradas, Tokens no total, Última atualização — todos derivados de `useBrandIdentity`/`brandTokens`, sem nova chamada de rede além da já existente), um resumo de Status (`Badge` indicando se a identidade já foi gerada e se um Logo já foi enviado), um "Resumo visual" com swatches das cores já carregadas, e o Contexto de Negócio (Seção 3.2). "Nome da marca", pedido pela Sprint, não existe em nenhum campo de `Logo`/`BrandTheme`/`DesignToken` — o Branding Hub nunca modelou um nome textual de marca — marcado com `NotConnectedNotice`.

### 5.2. Logo

`submitLogo` é real e foi conectado (`useSubmitLogo`): um campo de texto para a referência do ativo (nunca um upload de arquivo — `Logo.assetReference` é uma string opaca, "nenhum processamento de imagem acontece nesta Sprint", per o próprio comentário do Core) e um botão que envia o Command real, refletido imediatamente no cache de `useBrandIdentity` (mesmo padrão de patch de cache já usado por `useMoveOpportunity`, FUN-002). Per a instrução explícita da Sprint, o texto "Upload de arquivo ainda não disponível." é mostrado sempre, de forma permanente — nunca escondido mesmo após um envio bem-sucedido, porque a limitação (nenhum upload binário) continua real independentemente do estado. Versão clara, versão escura, Ícone e FavIcon nunca existiram como campo de `Logo` — `NotConnectedNotice`.

### 5.3. Paleta

A única seção com uma genuína decisão de UX sobre uma limitação de contrato: `updatePalette` devolve **apenas os dois novos Tokens de cor recém-criados**, nunca a lista completa — porque o Repository de Design Tokens é imutável (sem update/remove, ver `DesignTokenRepository`), o Backend nunca descarta os Tokens de cor anteriores, mas também não existe nenhum endpoint para listar o histórico completo (Seção 1). A decisão tomada nesta Sprint, documentada em `useUpdatePalette.ts`: os dois Tokens devolvidos **substituem localmente** os Tokens de categoria "Cor" já em cache — uma simplificação honesta do ponto de vista do Frontend, nunca apresentada como um reflexo perfeito do estado do servidor (que, na realidade, mantém todas as versões antigas, apenas inacessíveis a partir desta UI). Os campos digitados (`hex`) atualizam o swatch de preview em tempo real antes de qualquer envio, per a instrução "Mostrar preview em tempo real". Secundária e as quatro cores de Feedback (Sucesso/Erro/Aviso/Informação), pedidas pela Sprint, não são geradas pelo Branding Hub por Tenant — são as cores fixas do próprio Design System (`styles/tokens.css`, UX-001), mostradas claramente rotuladas como tal, nunca confundidas com dado gerado pelo `BrandingManager`. Terciária e Neutras não existem em nenhuma das duas fontes — `NotConnectedNotice`.

### 5.4. Tipografia

`fonte-titulo`/`fonte-corpo` (nomes reais e literais do domínio — nunca renomeados para "Fonte principal/secundária" como a Sprint sugeriu, para não confundir o nome exibido com o nome real do Token) são exibidos com preview real (`fontFamily` aplicado diretamente ao texto de exemplo). "Escalas, Pesos, Hierarquia", pedidos pela Sprint, não existem em nenhum Token gerado por Tenant (`TokenCategory` não tem um literal de escala/peso) — a escala tipográfica real (H1–Legenda, com tamanho/peso reais) é a do próprio Design System, mostrada claramente rotulada como tal.

### 5.5. Tokens

Organiza as sete categorias reais e fechadas de `TokenCategory` via `Tabs` — "Cor" e "Tipografia" mostram os Tokens já carregados; as outras cinco mostram um `EmptyState` explicando explicitamente que nenhum Service desta Sprint as popula (nunca um erro, nunca uma tabela vazia sem explicação). O `NotConnectedNotice` no topo da seção nomeia a limitação central já registrada na Seção 1: nenhuma listagem independente de Tokens existe — esta tabela é sempre o retrato do que já chegou nesta sessão do navegador.

### 5.6. Tema

Versão e data de geração são reais (`useBrandIdentity`). "Regenerar Tema" aciona o Command real `UpdateTheme` (`useRegenerateTheme`) através de um pequeno formulário (cor de destaque, cor de fundo, fonte de título, fonte de corpo) — regeneração completa, nunca incremental, exatamente como o domínio já define (ADR-012); o sucesso substitui integralmente `brandTokens` em cache (nunca um merge parcial, ao contrário de `updatePalette`) e também o Theme em cache de `useBrandIdentity`. O par Dark/Light pedido pela Sprint já existe de verdade na aplicação (`core/theme/`, o mesmo hook já reutilizado por Configurações do Perfil Empresarial, FUN-101) — alternável aqui com o mesmo `useTheme()`. "Contraste" nunca existiu como um terceiro modo (`ThemeName` é um union fechado de dois literais) — `NotConnectedNotice`.

### 5.7. Componentes

Galeria pura dos componentes já existentes do Design System (Botões, Badges, Alertas, Inputs/Select, Cards, Tabela, Abas, Drawer, Dropdown, Skeleton, Progresso, Toast, Spinner) — cada um lê exclusivamente `var(--color-*)`/`var(--space-*)`, então já reage ao Tema carregado sem nenhum código específico desta seção. Nenhum dado de Branding é consumido aqui — nenhuma seção desta Sprint precisou de um componente novo exclusivo, per a regra explícita da FUN-102.

### 5.8. Manual

Página somente leitura, per instrução explícita da Sprint ("Caso não exista backend: Página somente leitura") — nenhum "Brand Validator"/gerador de manual existe em `BrandingManager`. Sintetiza os mesmos Tokens de Cor/Tipografia já carregados (nunca uma segunda fonte de dado) e reaproveita Button/Badge como exemplos de "boas práticas".

### 5.9. Exportação

`PublishBrandAssets`/`BrandAssetChanged` estão catalogados em `BrandingCommand`/`BrandingEvent`, mas nenhum Service os implementa — a Asset Library não é citada em nenhuma camada do Roadmap. A única exportação real possível é inteiramente client-side: baixar como arquivo `.json` os Tokens já carregados nesta sessão (`Blob` + `URL.createObjectURL`, sem nenhuma chamada de rede) — nunca fingida como uma Command real, nunca persistida/rastreada pelo servidor. "Exportação oficial disponível em versão futura." é mostrado permanentemente.

---

## 6. A Limitação Central Desta Sprint — Nenhuma Listagem Independente de Tokens

Vale repetir isoladamente, por ser a decisão de arquitetura de Frontend mais consequente desta Sprint: como nenhum endpoint lista os Tokens de um Theme de forma independente (Seção 1), **todas** as seções que exibem Tokens (Visão Geral, Paleta, Tipografia, Tokens, Manual, Exportação) dependem do mesmo `brandTokens`, uma única fonte já carregada no bootstrap da sessão (`useDashboardBootstrap`) e mantida atualizada em cache pelas mutações desta própria Sprint (`useUpdatePalette`/`useRegenerateTheme`) — nunca uma consulta fresca ao servidor, nunca uma segunda fonte de verdade duplicada entre seções.

---

## 7. Componentes Generalizados e Criados (Reutilizáveis, Design System UX-001)

Per a instrução explícita da Sprint ("Reutilizar tudo possível do UX-001... Nunca criar componentes exclusivos deste módulo"), o primeiro trabalho desta Sprint foi generalizar os primitivos módulo-específicos criados na FUN-101, antes de escrever qualquer tela de Branding:

| Componente | Origem | Generalização nesta Sprint |
|---|---|---|
| `SectionSubNav` | `ProfileSubNav` (FUN-101) | Parametrizado por `TId extends string` — mesmo componente agora usado por Perfil Empresarial e Branding |
| `DraftSavedIndicator` | `pages/business-profile/DraftSavedIndicator.tsx` (FUN-101) | Movido para `shared/components/ui/` — já era module-agnostic, apenas mal localizado |
| `NotConnectedNotice` | FUN-101 | Novo prop opcional `context` (default `"Business Profile Engine"`) — Branding passa `context="Branding Hub"` |
| `useLocalDraft`/`localDraftStorage` | `useProfileDraft`/`profileDraftStorage` (FUN-101) | Generalizados por `module` — `useProfileDraft` agora é um wrapper fino de `useLocalDraft("businessProfile", ...)`, preservando a mesma chave de `localStorage` (nenhuma migração de dado necessária). Não usado por nenhuma seção de Branding (todas as suas lacunas reais têm mutação de escrita própria — `submitLogo`/`updatePalette`/`regenerateTheme` — nunca precisaram de rascunho local), mas já disponível para a próxima Sprint que precisar do mesmo padrão. |

`ProfileSubNav.tsx` (módulo-específico) e `profileDraftStorage.ts` foram deletados após a migração — nenhum consumidor restante, confirmado por busca antes da remoção. Nenhum componente novo exclusivo de Branding foi criado — Logo/Paleta/Tipografia/Tokens/Tema/Componentes/Manual/Exportação usam exclusivamente `WidgetCard`/`StatCard`/`Badge`/`Alert`/`Field`/`Select`/`Button`/`Tabs`/`Table`/`Drawer`/`DropdownMenu`/`Skeleton`/`ProgressBar`/`Spinner`/`Toast`/`AsyncState`/`EmptyState`, todos já existentes.

Hooks novos (todos em `core/query/`, mesmo padrão de `useMoveOpportunity`): `useBusinessContext`, `useSubmitLogo`, `useUpdatePalette`, `useRegenerateTheme`.

---

## 8. Validação

```
pnpm typecheck   → 21/21 pacotes + apps, sucesso
pnpm build       → sucesso (apps/web: BrandingPage seu próprio chunk, 28.9 kB/8.2 kB gzip)
pnpm lint        → sucesso, zero warning
pnpm test        → 507/507 testes, 139/139 arquivos (500/138 antes desta Sprint + 7 novos em BrandingPage.test.tsx)
```

Testes cobrindo exatamente a lista exigida pela Sprint: Tema (versão vigente, regeneração real, Dark/Light real, Contraste ausente), Paleta (preview em tempo real, Command `UpdatePalette` real), Tokens (categorias populadas vs. `EmptyState` para categorias nunca geradas), Estados vazios (`EmptyState` de Tokens), `NotConnectedNotice` (contexto "Branding Hub" nas várias seções), Componentes compartilhados (galeria completa, incluindo Toast disparado). Além disso, a suíte de regressão completa do Perfil Empresarial (FUN-101) foi reexecutada após cada generalização de componente (`SectionSubNav`, `NotConnectedNotice`, `useLocalDraft`), permanecendo 100% verde durante todo o processo.

---

## 9. Limitações

- **Nenhuma listagem independente de Design Tokens** — a limitação mais consequente desta Sprint (Seção 6); toda seção que exibe Tokens depende do cache de sessão, nunca de uma consulta fresca.
- **`updatePalette` não reflete o histórico real do servidor** — o Backend nunca descarta Tokens de cor antigos (Repository imutável), mas esta UI, por não ter como listá-los, os substitui localmente (Seção 5.3) — uma simplificação de Frontend, documentada, nunca um espelho perfeito do estado real do servidor.
- **Logo restrito a uma referência opaca** — nenhum upload de arquivo, nenhuma variação (clara/escura/ícone/favicon) existe no domínio.
- **Secundária, Terciária, Neutras (paleta) e Escala/Pesos (tipografia) não são geradas por Tenant** — apenas os valores fixos do Design System da própria aplicação, claramente rotulados como tal para nunca serem confundidos com dado do `BrandingManager`.
- **Cinco das sete categorias de Design Token nunca são populadas** — "Espaçamento", "Borda", "Sombra", "Ícone", "Estado" existem apenas como estrutura de domínio.
- **Nenhum modo de Contraste** — apenas Dark/Light existem como preferência real da aplicação.
- **Nenhuma exportação oficial** — a única exportação real é um download client-side dos Tokens já carregados, sem nenhuma Command/rastreamento no servidor.
- **Nenhuma validação visual em navegador real** — mesma limitação já registrada na UX-001/FUN-101 (nenhuma ferramenta de automação de navegador disponível neste ambiente); validação limitada a build bem-sucedido e à suíte de testes (`@testing-library/react` + jsdom).

## 10. Pendências Futuras

- Um endpoint `GET /branding/theme/:themeId/tokens` (ou equivalente) expondo `DesignTokenService.listByTheme`, já implementado no Service mas nunca roteado — resolveria a limitação central desta Sprint (Seção 6) sem exigir nenhuma mudança de domínio, apenas uma nova rota HTTP fina.
- Services reais para as cinco categorias de Token hoje sempre vazias ("Espaçamento", "Borda", "Sombra", "Ícone", "Estado") — um "Spacing/Radius/Elevation/Motion Engine" nomeado em `BRANDING_HUB.md` mas nunca implementado.
- Suporte real de upload de arquivo de Logo (e variações clara/escura/ícone/favicon) — exige um Logo Manager com processamento de imagem, hoje inteiramente fora de escopo do Core.
- Um "Brand Validator" real, permitindo gerar o Manual de Marca (Seção 5.8) a partir de regras de negócio, não apenas de uma síntese client-side dos Tokens já carregados.
- Exportação oficial (`PublishBrandAssets`/`BrandAssetChanged`, já catalogados mas nunca implementados) — um pacote de marca real (PDF, Figma, W3C Design Tokens) rastreado pelo servidor.
- Um método de listagem de histórico de paleta, permitindo à UI mostrar de fato todos os Tokens de cor já gerados por um Theme (não apenas os últimos dois recebidos nesta sessão) — resolveria a simplificação documentada na Seção 5.3.
