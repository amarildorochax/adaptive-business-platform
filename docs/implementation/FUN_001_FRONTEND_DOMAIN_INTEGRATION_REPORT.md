# FUN-001 — Frontend ↔ Domain Integration Foundation — Relatório

**Status:** Concluída. **Natureza:** primeira Sprint funcional da plataforma — nenhuma arquitetura foi alterada.

---

## 1. Auditoria — Estado Encontrado em `apps/web`

`platform/apps/web/src` continha exatamente 5 arquivos: `App.tsx`, `main.tsx`, `vite-env.d.ts`,
`app/Application.tsx`, `app/router/ApplicationRouter.tsx`. Nenhum diretório `pages/`, `components/`,
`layouts/`, `providers/`, `hooks/`, `services/`, `api/` existia. Uma única rota (`/`) renderizava
`FoundationHome`, um componente inline com dois textos fixos ("Adaptive Business Platform" /
"Fundação técnica operacional — nenhum domínio de negócio migrado ainda"), auto-documentado como
deliberadamente honesto sobre o estado da IMP-001. `package.json` já declarava treze dependências
`@abp/*`, mas nenhum arquivo importava qualquer uma delas — confirmado por leitura direta dos cinco
arquivos. Nenhum teste, nenhuma biblioteca de data-fetching (React Query/SWR/Apollo) ou de estado
(Zustand/Redux) existia. `react-router-dom` já estava presente e configurado via
`createBrowserRouter`/`RouterProvider`. `tsconfig.json`/`vite.config.ts` já continham os aliases
`@`/`@app`/`@core`/`@shared`/`@modules`, apontando para diretórios (`core`, `shared`, `modules`) que
ainda não existiam em disco.

## 2. Auditoria — Mapeamento dos Dezessete Managers

Todos os dezessete Managers de domínio já implementados (IMP-002 → IMP-019) foram localizados e
mapeados: assinatura de construtor, método público, formato de retorno (`{Domain}OperationResult<T>`),
e disponibilidade de Fake Repository em `src/testing/InMemoryFakes.ts`. Achado central: a maioria dos
Managers (`CRMManager`, `CommunicationManager`, `ContentManager`, `GrowthManager`, `CommerceManager`,
`FinanceManager` parcialmente, `AutomationManager`, `AIManager`, `IAMManager`, `AIAgentsManager`,
`RuntimeManager`, `PlatformOperationsManager`) é orientada a Command — cada método público cria ou
altera uma Entidade e a retorna, mas nenhum expõe um método de listagem em lote. Apenas os Managers
cujo próprio Blueprint já cataloga uma noção de "estado corrente" (`BusinessProfileManager.current*`,
`BrandingManager.current*`) ou de consulta formal (`IntegrationManager.findConnector/listConnectors`,
`FinanceManager.getBalance/listLedgerEntries`, `KnowledgeManager.search/currentStage`) expõem
métodos de leitura reais — reflexo direto de `COMMAND_CATALOG.md`/`QUERY_CATALOG.md` serem catálogos
formalmente distintos, e nenhum Manager de domínio ainda implementar o lado de Query em forma de
listagem. Esta constatação decidiu o desenho do Dashboard (Seção 5).

## 3. Arquitetura de Integração Adotada

Nenhuma Facade, Application Service ou API Layer nova foi criada. Cada `{Domain}Manager` **já é**, por
desenho de toda a série IMP, o Application Service do seu domínio — orquestra Services, aplica regra
de fronteira, produz Command/Event. Introduzir uma segunda camada de Facade sobre um Manager já
orquestrador duplicaria exatamente a responsabilidade que o próprio Manager já cumpre — a mesma
disciplina "Consumer Never Owns"/"No Duplicate Models" já registrada em `DOMAIN_OWNERSHIP_MATRIX.md`
foi aplicada aqui à camada de integração, não apenas ao dado. A única camada nova, portanto, é:

- **Composition Root** (`apps/web/src/core/managers/buildManagers.ts`) — constrói cada Manager
  conectado, injetando seus Services e Repositories, exatamente como todo `*Manager.test.ts` já faz
  desde a IMP-002. `ManagerContext`/`useManagers` (React Context) expõem essa instância única à árvore
  de componentes.
- **Query Layer** (`@tanstack/react-query`, adicionado nesta Sprint — nenhuma biblioteca de estado
  concorrente foi introduzida) — cada hook em `apps/web/src/core/query/` envolve uma chamada real a um
  método de Manager em um `useQuery`, nunca contorna o Manager.

Nenhum Repository nem Service é acessado por nenhum componente ou hook — toda leitura e escrita
passam exclusivamente pelos sete Managers conectados.

### 3.1 Decisão Arquitetural Central — Persistência desta Fase

Nenhuma Sprint anterior construiu um banco de dados ou uma API HTTP — a Fase de Infrastructure
(IMP-012) cobriu exclusivamente log/métrica/alerta/incidente (`NON_FUNCTIONAL_REQUIREMENTS.md`),
nunca uma camada de persistência para os Repositories de domínio. A única implementação concreta de
qualquer Repository, em toda a série IMP, são as classes `Fake*Repository` de
`src/testing/InMemoryFakes.ts` — usadas por 313 testes desde a IMP-002.

Esta Sprint reutiliza exatamente essas classes como a persistência do Frontend nesta fase —
session-scoped (perdida ao recarregar a página), honestamente documentada como tal em todo
doc-comment relevante, nunca apresentada como persistência real. É a única escolha consistente com
"nunca inventar uma arquitetura paralela": construir um novo conjunto de Repositories em memória
dentro de `apps/web`, duplicando lógica já existente e testada, teria sido a violação real dessa
regra.

A única mudança necessária para tornar essa reutilização possível foi ampliar o mapa `exports` de
quinze `package.json` (todo pacote com um Manager conectado ou mapeado) com uma nova entrada
`"./testing"`, apontando para o mesmo `src/testing/InMemoryFakes.ts` que já existia — uma mudança de
empacotamento, nunca de arquitetura: nenhum Manager, Service, Repository, Command, Event ou ADR foi
alterado; os Fakes continuam nunca exportados pelo barrel principal (`"."`), preservando o comentário
já presente em cada um ("nunca referenciados por nenhum Service em produção" continua verdadeiro — o
Frontend os referencia na composição, nunca dentro de um Service).

Construir a camada de persistência real (banco de dados, API HTTP) permanece fora do escopo desta
Sprint — é, precisamente, um dos itens de evolução funcional que esta Sprint torna visível e
prioritário (Seção 8).

## 4. Placeholders Removidos

- `FoundationHome` (rota `/`, texto fixo "nenhum domínio de negócio migrado ainda") — removido;
  substituído pelo Dashboard real.
- `Application.tsx` — deixou de renderizar `ApplicationRouter` isoladamente; agora o envolve em
  `AppProviders` (`QueryClientProvider` + `ManagerProvider`).

Nenhum outro placeholder, mock, array fixo ou estatística fictícia existia em `apps/web` antes desta
Sprint — a auditoria da Seção 1 confirma que o estado anterior era um app-shell vazio, não um app com
dado fake espalhado por múltiplas telas.

## 5. Managers Conectados e Dashboard

Sete Managers foram conectados ao Composition Root — exatamente os que alimentam a primeira
integração completa exigida por esta Sprint:

| Manager | Pacote | Papel no Dashboard |
|---|---|---|
| `BusinessProfileManager` | `@abp/business-profile` | Widget "Perfil Empresarial" — leitura real via `currentClassification`/`currentMaturity`/`currentStage` |
| `BrandingManager` | `@abp/branding` | Widget "Identidade de Marca" — leitura real via `currentTheme`/`currentLogo` |
| `CRMManager` | `@abp/crm-hub` | Widget "CRM — Relacionamentos" |
| `CommunicationManager` | `@abp/communication-hub` | Widget "Comunicação — Conversas Recentes" |
| `AnalyticsManager` | `@abp/analytics-hub` | Widget "Analytics — Métricas" |
| `AutomationManager` | `@abp/automation-engine` | Widget "Automação — Execuções" |
| `KnowledgeManager` | `@abp/platform-services` | Widget "Conhecimento" |

Dois dos sete widgets (Perfil Empresarial, Identidade de Marca) executam uma consulta de leitura real
a cada render através do respectivo Manager — o ciclo completo Command (bootstrap) → Query
(`useBusinessProfileSummary`/`useBrandIdentity`), porque `BusinessProfileManager` e `BrandingManager`
são os dois únicos, entre os sete, cujo Blueprint já cataloga métodos de leitura de estado corrente.
Os outros cinco widgets exibem o resultado já devolvido pelo próprio Command executado no bootstrap da
sessão (`seedDemoData.ts`) — não uma listagem, porque nenhum dos cinco Managers correspondentes expõe
uma (Seção 2); mostrar o resultado de um Command real, através de um Manager real, permanece uma
integração genuína, apenas não uma "tela de busca" que o backend ainda não suporta.

**Duas substituições nomeadas honestamente, nunca inventadas silenciosamente:**
- "Notificações" (exemplo do escopo da Sprint) → widget "Comunicação — Conversas Recentes": nenhuma
  Entidade `Notification` tem Command próprio em `CommunicationManager`; a Conversa/Mensagem mais
  recente é o dado real mais próximo já disponível.
- "Tarefas" (exemplo do escopo da Sprint) → widget "Automação — Execuções": `AutomationManager` não
  cataloga uma Entidade "Task"; a Execução de Workflow mais recente é o dado real mais próximo.

Ambas as substituições estão documentadas inline no código-fonte do respectivo widget, não apenas
neste relatório.

`seedDemoData.ts` popula os sete Managers exclusivamente através de seus próprios métodos públicos
(`createBusinessProfile`, `generateInitialBrandIdentity`, `createOrganization`, `createOpportunity`,
`createLead`, `startConversation`, `sendMessage`, `createDataset`, `calculateMetric`, `calculateKPI`,
`createDashboard`, `registerTrigger`, `defineAction`, `createWorkflow`, `activateWorkflow`,
`startExecution`, `completeExecution`, `createKnowledge`, `submitForReview`, `approve`, `publish`) —
nenhuma regra de negócio nova, equivalente em espírito ao `buildManager()`/dado de fixture que abre
cada arquivo de teste de Manager já existente na série IMP.

## 6. Estado da Aplicação

`@tanstack/react-query` foi adicionado (nenhuma solução de data-fetching existia antes desta Sprint).
Nenhuma biblioteca de gerenciamento de estado genérico (Zustand/Redux) foi introduzida — o próprio
`ManagerRegistry`, memoizado uma única vez por `ManagerProvider` via `useMemo`, e o cache do
`QueryClient` cobrem toda a necessidade de estado desta Sprint. `staleTime: Infinity` no bootstrap
evita recriar dado duplicado no mesmo Fake Repository a cada re-render (ex.: um segundo Business
Profile para o mesmo Tenant seria rejeitado por ADR-001).

## 7. Tratamento de Erros e Performance

`AsyncState` (`apps/web/src/shared/components/AsyncState.tsx`) padroniza loading/erro/vazio/retry para
todo widget — único componente onde esses quatro estados são desenhados. `retry: 1` no `QueryClient`
(Seção 6) reflete que toda chamada desta Sprint é local (Manager em memória, sem rede): uma falha é
sempre um erro de domínio real (precondição de Command violada), nunca uma falha transitória de rede
que justifique múltiplas tentativas automáticas — `refetchOnWindowFocus` também desabilitado pelo
mesmo motivo. Nenhum carregamento duplicado existe: o bootstrap roda exatamente uma vez por sessão
(`staleTime`/`gcTime: Infinity`), e os dois hooks de leitura real (`useBusinessProfileSummary`,
`useBrandIdentity`) são independentes e só disparam depois que o bootstrap resolve (`enabled`). Lazy
loading de rota não foi aplicado — uma única página existe nesta Sprint; introduzi-lo agora seria
otimização prematura sem uma segunda rota para justificá-la.

## 8. Pendências e Melhorias Futuras

- **Persistência real (banco de dados/API HTTP)** — a lacuna mais significativa revelada por esta
  Sprint (Seção 3.1); nenhuma arquitetura aprovada a define ainda.
- **Dez Managers mapeados, ainda não conectados**: Content, Growth, Commerce, Finance, AI, IAM,
  Integration, Runtime, AI Agents, Platform Operations. Cada um segue exatamente o mesmo padrão
  estrutural já demonstrado em `buildManagers.ts` — conectá-los é a extensão natural do Composition
  Root assim que uma página precisar deles, nunca um redesenho.
  `platform-services` já expõe `./testing`; `IAMManager`/`IntegrationManager` compartilham o mesmo
  arquivo de Fakes já usado por `KnowledgeManager` nesta Sprint.
- **Nenhuma segunda rota existe** — Login, CRM, Finance, etc. permanecem fora de escopo; esta Sprint
  entrega exclusivamente a "primeira integração completa" exigida (o Dashboard).
- **Query de listagem genuína** ainda não existe em nenhum Manager de domínio (Seção 2) — depende de
  uma futura extensão de cada Blueprint para o lado de Query do CQRS já formalmente reservado por
  `QUERY_CATALOG.md`, nunca inventável unilateralmente por uma Sprint de Frontend.
- **CSS/design system** — os componentes desta Sprint usam nomes de classe semânticos
  (`widget-card`, `async-state`) sem nenhuma folha de estilo real; a identidade visual em si pertence
  ao Branding Hub (já conectado) e a uma futura Sprint de UI, nunca a esta.

## 9. Testes e Validação

6 testes novos, cobrindo composição, dado de demonstração, hook de bootstrap e o componente de página
principal:

- `buildManagers.test.ts` — os sete Managers se constroem sem exceção; duas chamadas produzem
  instâncias independentes (nenhum estado global compartilhado entre sessões).
- `seedDemoData.test.ts` — os sete domínios são populados corretamente através dos Commands reais;
  Business Profile atinge o estágio "Perfil Inicial"; Branding gera a versão 1 do Theme.
- `useDashboardBootstrap.test.tsx` — o hook expõe a fotografia resultante via TanStack Query
  (`renderHook`).
- `DashboardPage.test.tsx` — o componente mostra o estado de carregamento e, em seguida, os sete
  widgets com dado real (React Testing Library).

```
pnpm typecheck   → 19/19 pacotes + apps/web, sucesso
pnpm build       → 19/19 pacotes + apps/web (vite build, 444 módulos transformados), sucesso
pnpm lint        → sucesso, zero warning
pnpm test        → 319/319 testes, 95/95 arquivos de teste (313 já existentes + 6 desta Sprint)
```

## 10. Regras Respeitadas

Nenhuma arquitetura foi alterada. Nenhum ADR foi alterado. Nenhuma regra de negócio nova foi criada —
toda lógica exibida já existia dentro de um Manager antes desta Sprint. Nenhuma lógica foi movida para
fora de um Manager. Nenhum componente ou hook acessa um Repository ou um Service diretamente — toda
comunicação ocorre pelos métodos públicos já implementados de sete Managers. A única mudança fora de
`apps/web` foi ampliar o `exports` de quinze `package.json` com uma entrada `./testing` (Seção 3.1) —
uma mudança de empacotamento explicitamente registrada e justificada, nunca uma mudança de arquitetura,
de contrato público, de Command, de Event ou de ADR.
