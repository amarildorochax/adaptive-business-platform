# FUN-002 — Multi-Route Functional Application — Relatório

**Status:** Concluída. **Natureza:** segunda Sprint funcional — nenhuma arquitetura foi alterada.

---

## 1. Auditoria — Arquitetura Encontrada (Estado ao Final do FUN-001)

`platform/apps/web/src` continha 30 arquivos. Rotas: uma única (`/`, `createBrowserRouter`), sem
layout dedicado — `ApplicationRouter.tsx` renderizava `DashboardPage` diretamente. Providers:
`AppProviders.tsx` já compunha `QueryClientProvider` + `ManagerProvider` (Composition Root). Menu e
navegação: nenhum existia — não havia Sidebar, Topbar nem Breadcrumb. Composição do FUN-001:
`buildManagers.ts` já construía sete Managers (`BusinessProfileManager`, `BrandingManager`,
`CRMManager`, `CommunicationManager`, `AnalyticsManager`, `AutomationManager`, `KnowledgeManager`)
sobre Fakes em memória; `seedDemoData.ts` os populava via Commands reais; `useDashboardBootstrap`
(TanStack Query, `staleTime`/`gcTime: Infinity`) cacheava o resultado sob a chave
`['dashboard','bootstrap']`. Sete Widgets já existiam em `pages/dashboard/*Widget.tsx`, cada um
consumindo exclusivamente o snapshot do bootstrap ou, nos dois casos com leitura própria de Manager
(`BusinessProfileWidget`, `BrandingWidget`), um hook de `useQuery` dedicado. Componentes
compartilhados já existentes: `AsyncState` (loading/erro/vazio/retry) e `WidgetCard`. Nenhum teste de
rota, de navegação ou de layout existia — os quatro testes do FUN-001 cobriam apenas Composition
Root, dado de demonstração e a página única.

## 2. Estrutura Final das Rotas

Dezoito rotas — oito ativas (Dashboard + os sete domínios já conectados no FUN-001) e dez "Em breve"
(os dez Managers já mapeados no relatório do FUN-001, Seção 2, ainda não conectados) — todas filhas
de um único `AppLayout` (Topbar + Sidebar + Breadcrumb + área principal), definidas uma única vez em
`apps/web/src/app/router/routes.tsx` e nunca duplicadas:

| Rota | Página | Manager consumido | Status |
|---|---|---|---|
| `/` | `DashboardPage` | Todos os sete (visão geral) | Ativa |
| `/business-profile` | `BusinessProfilePage` | `BusinessProfileManager` | Ativa |
| `/branding` | `BrandingPage` | `BrandingManager` | Ativa |
| `/crm` | `CRMPage` | `CRMManager` | Ativa |
| `/communication` | `CommunicationPage` | `CommunicationManager` | Ativa |
| `/analytics` | `AnalyticsPage` | `AnalyticsManager` | Ativa |
| `/automation` | `AutomationPage` | `AutomationManager` | Ativa |
| `/knowledge` | `KnowledgePage` | `KnowledgeManager` | Ativa |
| `/content`, `/growth`, `/commerce`, `/finance`, `/ai`, `/iam`, `/integration`, `/runtime`, `/ai-agents`, `/platform-operations` | `ComingSoonPage` (parametrizada) | — | Em breve |

`apps/web/src/app/navigation/navEntries.ts` é a fonte única de verdade — `Sidebar`, `Breadcrumb` e
`routes.tsx` leem exclusivamente dela; nenhum dos três mantém sua própria lista de módulos.

## 3. Layout Principal

`AppLayout` (reescrito) compõe, pela primeira vez: `Topbar` (chrome estático — nome da aplicação e
identificador do Tenant de demonstração; nenhuma identidade visual do Branding Hub é aplicada como
CSS aqui, per a instrução desta Sprint — o Branding continua sendo consumido apenas como dado, já
integralmente exibido em `/branding`), `Sidebar` (`NavLink` do React Router para as dezoito rotas,
com selo "Em breve" nas dez planejadas) e `Breadcrumb` (deriva o rótulo do módulo atual a partir da
mesma `NAV_ENTRIES`, nunca uma segunda fonte de nome).

## 4. Páginas Criadas — Reaproveitamento Direto do FUN-001

Nenhuma das sete páginas de domínio duplica a lógica de nenhum Widget já existente — cada uma
importa e renderiza o Widget correspondente do FUN-001 (`CRMWidget`, `BrandingWidget`, etc.),
acrescentando apenas `PageHeader`/`PageContainer` (chrome de página) e, em dois casos, detalhe
adicional já disponível no mesmo snapshot de bootstrap:

- **`/branding`** acrescenta a lista completa de Design Tokens gerados (`brandTokens`, um campo novo
  adicionado a `DemoSnapshot` — captura o retorno já existente de
  `BrandingManager.generateInitialBrandIdentity`, nunca uma chamada nova de Command).
- **`/crm`** acrescenta a única demonstração de mutação real desta Sprint: um botão "Marcar como
  Ganha" invoca `CRMManager.moveOpportunity` de verdade (`useMoveOpportunity`, um `useMutation` do
  TanStack Query) e atualiza o cache da chave `['dashboard','bootstrap']` via `setQueryData`, sem
  refazer `seedDemoData` — refazê-lo duplicaria o Business Profile do Tenant, rejeitado por ADR-001.
  Todas as demais páginas permanecem somente-leitura, decisão deliberada: demonstrar o padrão de
  mutação uma vez, com cobertura de teste completa, é mais valioso do que replicá-lo em sete telas
  sem necessidade real.

`DashboardPage` foi levemente ajustada para reutilizar os mesmos `PageHeader`/`PageContainer` — nenhuma
lógica de dado foi alterada; ela continua o resumo dos sete Widgets, cada um agora também acessível
em sua própria página dedicada.

## 5. Componentes Reutilizáveis Extraídos

| Componente | Papel | Reuso |
|---|---|---|
| `PageHeader` | Título + descrição de topo de página | 8 páginas |
| `PageContainer` | Envelope de espaçamento único | 8 páginas |
| `StatCard` | Card de estatística isolada | `/crm`, `/analytics` |
| `Sidebar`, `Topbar`, `Breadcrumb` | Chrome de navegação | `AppLayout` (toda página) |
| `AsyncState`, `WidgetCard` (já existentes, FUN-001) | Loading/erro/vazio/retry; card de domínio | Reaproveitados sem alteração em todas as oito páginas ativas |

Nenhum componente novo duplica a responsabilidade de outro já existente — `ComingSoonPage` reutiliza
`PageHeader`/`PageContainer`/`WidgetCard` exatamente como qualquer página ativa.

## 6. Managers Utilizados

Nenhum Manager novo foi conectado nesta Sprint — os mesmos sete do FUN-001
(`BusinessProfileManager`, `BrandingManager`, `CRMManager`, `CommunicationManager`,
`AnalyticsManager`, `AutomationManager`, `KnowledgeManager`) permanecem os únicos com dado real
exibido; os dez restantes (Content, Growth, Commerce, Finance, AI, IAM, Integration, Runtime, AI
Agents, Platform Operations) têm rota e item de menu preparados, mas `ComingSoonPage` nunca invoca
nenhum deles. Nenhum componente ou hook desta Sprint acessa um Repository ou um Service diretamente —
confirmado por leitura de cada arquivo novo: toda chamada passa por um método público de Manager
já existente (a única exceção sendo `useMoveOpportunity`, que também chama exclusivamente
`CRMManager.moveOpportunity`).

## 7. Rotas Protegidas — Não Implementadas, Registrado Explicitamente

A Sprint pediu rotas protegidas "caso já suportadas pelo IAM". `IAMManager` não está conectado ao
Composition Root (permanece "Em breve", Seção 2) — não existe sessão, login ou identidade real no
Frontend hoje. Implementar proteção de rota exigiria, portanto, ou conectar o IAM agora (fora de
escopo — nenhuma tela de login foi pedida nem construída) ou fabricar um estado de autenticação falso
(expressamente proibido: "não criar autenticação nova"). Nenhuma rota desta Sprint é protegida — a
pendência é nomeada aqui, não preenchida artificialmente.

## 8. Estado

Nenhuma biblioteca de estado nova foi introduzida — `TanStack Query` (QueryClient único, já do
FUN-001) e o `ManagerRegistry` memoizado (`ManagerProvider`) continuam a única fonte de estado. A
navegação entre as oito páginas ativas reaproveita a mesma chave de cache
(`['dashboard','bootstrap']`) — trocar de rota nunca refaz o bootstrap, apenas lê o mesmo cache já
populado, o que também prova que nenhuma segunda instância de Composition Root é criada por
navegação (verificado pelo teste da Seção 10 que navega para `/crm` e `/branding` sem reexecutar
`seedDemoData`).

## 9. Performance

**Lazy loading e code splitting** — cada uma das oito páginas ativas e o `ComingSoonPage` são
carregados via `React.lazy(() => import(...))`, dentro de um único `<Suspense>` em `AppLayout`
(nunca duplicado por página). Confirmado pelo `vite build`: cada página compila para um chunk JS
próprio (`CRMPage-*.js` 4.46 kB, `BrandingPage-*.js` 0.69 kB, etc.), carregado sob demanda — o bundle
principal (`index-*.js`) não cresceu de forma proporcional às sete novas páginas. **Memoização** —
`ManagerRegistry` já era memoizado desde o FUN-001 (`useMemo` em `ManagerProvider`); nenhuma nova
necessidade de memoização foi identificada nesta Sprint (nenhum cálculo custoso é refeito a cada
render). **Eliminação de render redundante** — a navegação entre páginas nunca dispara um novo
bootstrap (Seção 8); os dois hooks de leitura real (`useBusinessProfileSummary`, `useBrandIdentity`)
continuam independentes e cacheados por `queryKey` próprio, reexecutados apenas quando a página que
os usa é visitada, nunca antecipadamente.

## 10. Testes

12 testes novos (319 → 331), cobrindo exatamente os itens exigidos pela Sprint:

- `navEntries.test.ts` — nenhum caminho duplicado; contagem exata de módulos ativos/planejados;
  `findNavEntry` resolve corretamente.
- `Sidebar.test.tsx` — um link de navegação por `NAV_ENTRIES`, com selo "Em breve" apenas nos
  planejados.
- `Breadcrumb.test.tsx` — rótulo do módulo correto por rota, ausente na raiz.
- `routes.test.tsx` — navegação real via `createMemoryRouter`: `/` renderiza o Dashboard; `/crm`
  renderiza a página dedicada com o mesmo dado do bootstrap (prova de reuso de cache entre rotas);
  `/branding` inclui os Design Tokens; `/finance` renderiza `ComingSoonPage` identificando
  corretamente `FinanceManager`/`@abp/finance-hub`.
- `CRMPage.test.tsx` — a mutação `moveOpportunity` é executada de ponta a ponta via clique real
  (`@testing-library/user-event`), o estado exibido muda de "Open" para "Won", e o botão é
  desabilitado após a conclusão.
- `ComingSoonPage.test.tsx` — identifica o Manager e o pacote mapeados sem exibir dado inventado.

**Correção de infraestrutura de teste encontrada e corrigida nesta Sprint:** dois testes de rota
falhavam por elemento duplicado no DOM — `@testing-library/react` não estava configurado com
limpeza automática entre testes (`vitest.config.ts` não usa `test.globals`, então o hook de
`afterEach` automático da biblioteca nunca era registrado), e dois testes que renderizam o mesmo
`CRMWidget` (Dashboard e `/crm`) deixavam duas árvores sobrepostas no `document.body`. Corrigido com
`apps/web/vitest.setup.ts` (`afterEach(() => cleanup())`, guardado por `typeof document !== 'undefined'`
para nunca afetar os 313 testes de `packages/*`, que rodam em ambiente `node` sem DOM), registrado em
`platform/vitest.config.ts`, `test.setupFiles`. Esta era uma lacuna real da infraestrutura de teste
introduzida no FUN-001 (mascarada até agora porque nenhum teste anterior renderizava o mesmo
componente duas vezes em arquivos diferentes) — não uma regressão desta Sprint.

```
pnpm typecheck   → 19/19 pacotes + apps/web, sucesso
pnpm build       → 19/19 pacotes + apps/web (vite build, 462 módulos, 8 chunks de página via lazy loading), sucesso
pnpm lint        → sucesso, zero warning
pnpm test        → 331/331 testes, 101/101 arquivos de teste (319 já existentes + 12 desta Sprint)
```

## 11. Pendências para Próximas Sprints

- **Rotas protegidas** — bloqueado até uma futura Sprint conectar `IAMManager` e construir um fluxo
  de login real (Seção 7).
- **Dez Managers ainda "Em breve"** — cada `ComingSoonPage` já identifica exatamente qual Manager e
  qual pacote conectar; o padrão de página (Widget + `PageHeader`/`PageContainer`) já está prontamente
  reaproveitável assim que cada um for priorizado.
- **Mutação real em outras seis páginas** — apenas CRM demonstra o ciclo completo Command →
  invalidação de cache nesta Sprint (Seção 4); estender o mesmo padrão (`useMutation` +
  `setQueryData`) às demais é direto, mas não fez parte do escopo mínimo desta Sprint.
- **Persistência real** — segue como a lacuna mais significativa, já registrada pelo FUN-001,
  inalterada por esta Sprint.
- **CSS/design system** — nenhuma folha de estilo real foi introduzida; os nomes de classe
  semânticos já usados desde o FUN-001 (`widget-card`, `async-state`) foram estendidos
  (`sidebar`, `breadcrumb`, `page-header`, `stat-card`) com a mesma disciplina — a identidade visual
  em si permanece fora do escopo de qualquer Sprint funcional até uma Sprint de UI dedicada.
- **Verificação visual em navegador** — esta Sprint foi validada por `pnpm build`/`pnpm test`
  (incluindo testes de navegação real via `createMemoryRouter`), mas não por inspeção manual em
  navegador; nenhuma ferramenta de captura de tela esteve disponível nesta sessão.

## 12. Regras Respeitadas

Nenhuma arquitetura, ADR, Manager ou contrato público foi alterado. Nenhum componente ou hook acessa
um Repository ou um Service diretamente. Toda infraestrutura do FUN-001 (Composition Root, TanStack
Query, Providers, os sete Widgets) foi integralmente reutilizada, nunca duplicada. Nenhuma nova
biblioteca de estado foi introduzida. Nenhuma autenticação nova foi criada.
