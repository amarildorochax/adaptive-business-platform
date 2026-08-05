# FUN-103 — CRM Workspace — Relatório

**Status:** Concluída. **Natureza:** nona Sprint funcional — nenhuma arquitetura, ADR, Manager, Repository Interface, Service, Command, Event ou Entity foi alterada. Todo trabalho aconteceu exclusivamente em `apps/web`, consumindo somente endpoints já existentes de `apps/api` (FUN-004/005).

---

## 1. Auditoria do `CRMManager` — Passo Obrigatório Antes de Qualquer Código

Leitura integral de `docs/architecture/CRM_HUB.md` (33 Componentes Internos catalogados — CRM Manager, Lead/Customer/Contact/Organization/Supplier/Partner/Relationship/Pipeline/Opportunity/Stage/Activity/Task/Timeline/Consent/Segment/Tag/Custom Field/Ownership Manager, Validation/Deduplication/Merge Engine, Import/Export/Search Manager, CRM Analytics, History/Audit/Lifecycle/Configuration Manager, Notification Publisher, Event Publisher, Reporting Adapter) contra `docs/implementation/CRM_CORE_MIGRATION_REPORT.md` (o arquivo real — a leitura obrigatória desta Sprint citava `CRM_HUB_CORE_MIGRATION_REPORT.md`, que não existe; o nome real, já usado desde a IMP-002, é `CRM_CORE_MIGRATION_REPORT.md`, registrado aqui pelo mesmo motivo que toda Sprint anterior desta série documenta divergências entre o texto do prompt e o estado real do repositório). Mesmo padrão de distância entre visão e escopo curto-prazo já visto em toda auditoria anterior (Business Profile, Branding) — aqui, porém, mais extremo: **dos 33 componentes catalogados, apenas sete Services têm alguma implementação real, e nenhuma Query jamais foi implementada.**

**`CRMManager` real expõe exatamente oito métodos públicos, todos de escrita:**

| Método | Assinatura (resumida) | Command Frozen? |
|---|---|---|
| `createLead` | `(input) => Lead` | `CreateLead` |
| `convertLead` | `(leadId, accountManagerId) => {customer, relationship}` | `ConvertLead` |
| `createCustomer` | `(input, accountManagerId) => {customer, relationship}` | `CreateCustomer` |
| `updateCustomer` | `(customerId, input) => Customer` | `UpdateCustomer` |
| `createOrganization` | `(input, accountManagerId) => {organization, relationship}` | Nenhum (não catalogado) |
| `createContact` | `(input, associationType, associationId) => Contact` | Nenhum (não catalogado) |
| `createOpportunity` | `(input, relationshipId) => Opportunity` | `CreateOpportunity` |
| `moveOpportunity` | `(opportunityId, stageId, outcome?, lostReason?) => Opportunity` | `MoveOpportunity` |

**Nenhum método de leitura em lista existe** — nenhum `listOpportunities`, nenhum `customer360`, nenhum `pipelineSummary`, nenhum `getTimeline`, nenhum `activeLeads`. As onze Queries catalogadas em `CRM_HUB.md`, Capítulo 11 (Customer 360, Timeline, Open Opportunities, Active Leads, Pipeline Summary, Segment Search, Customer History, Activity History, Relationship View) **não têm nenhuma implementação** — confirmado por leitura completa de `CRMManager.ts` (304 linhas) e das sete rotas HTTP correspondentes de `apps/api/src/routes/crm.ts` (nenhuma rota `GET` de listagem existe; apenas `GET /crm/logos/:tenantId`-like nunca existiu para CRM). Isso já era um achado documentado desde a FUN-001 (`CRMWidget.tsx`: *"CRMManager não expõe nenhum método de leitura em lista"*) — esta Sprint é a primeira a construir uma experiência inteira em cima dessa limitação, tornando-a a decisão de arquitetura central de todo o trabalho (Seção 3).

**Entidades com contrato de tipo definido, mas sem nenhum Service/Manager que as popule:** `Activity`, `Task`, `Pipeline`, `Stage`, `Segment`, `Tag`, `CustomField`, `Consent`, `Address`, `Partner`, `Supplier` — todas existem como arquivo `.ts` em `packages/crm-hub/src/`, mas nenhuma é referenciada por `CRMManager.ts`. `pipelineId`/`stageId` em `Opportunity` são texto livre, sem nenhum Pipeline/Stage real por trás — confirmado por `CRM_CORE_MIGRATION_REPORT.md`, "Componentes Ainda Pendentes".

**Sobre os onze Commands já Frozen** (`CRMCommand.ts`): `AssignOwner`, `MergeCustomer`, `ArchiveCustomer`, `CreateTask`, `CompleteTask` estão catalogados mas **nunca implementados** por nenhum método de `CRMManager`. `CreateOrganization`/`CreateContact`, embora reais no Manager, não têm Command Frozen correspondente — `command` é literalmente `undefined` nesses dois retornos, per o próprio comentário do Core.

**Confirmado por leitura de `apps/api/src/routes/crm.ts`:** exatamente oito rotas HTTP, um espelho 1:1 dos oito métodos do Manager — nenhuma rota adicional, nenhuma rota `GET` de listagem. E, criticamente: **cada rota devolve apenas `result` — `command`/`events` são descartados na fronteira HTTP** (`const { result } = await fastify.managers.crm.createLead(...)`). Mesmo que `CRMManager` retorne `CRMEvent[]` reais em processo (incluindo `TimelineUpdated`, gravado a cada Command via `TimelineEventService.record(...)`), **nada disso jamais atravessa a rede** — o Frontend, consumindo exclusivamente via HTTP desde a FUN-005, nunca recebe um `CRMEvent`, e muito menos um `TimelineEvent` real.

---

## 2. A Limitação Central Desta Sprint — Zero Capacidade de Leitura

Esta é a descoberta mais consequente de toda a auditoria, e a que mais moldou o desenho: **o CRM Hub, hoje, não tem absolutamente nenhuma forma de o Frontend perguntar "o que já existe?"** — nem uma lista de Oportunidades, nem um Cliente 360, nem a Timeline real de um Relationship. Tudo que o navegador pode saber sobre CRM é exatamente o que ele mesmo recebeu como resposta de um Command que ele próprio executou nesta sessão.

Diferente da Branding Hub (FUN-102), onde a limitação era "nenhuma listagem *independente* de Tokens" (mas ao menos toda operação de escrita devolvia os Tokens atualizados), aqui a limitação é total: não existe nenhuma Query, para nenhuma Entidade, em nenhuma circunstância.

**Decisão de arquitetura tomada nesta Sprint:** um **CRM Workspace** — um Read Model inteiramente construído e mantido no navegador (`core/crm/crmWorkspace.ts` + `core/query/useCrmWorkspace.ts`), semeado uma única vez a partir dos três registros já criados pelo bootstrap da sessão (`seedDemoData`) e, a partir daí, mantido exclusivamente por *cache patch* de cada uma das oito mutações reais — o mesmo padrão de patch de cache já estabelecido por `useMoveOpportunity` (FUN-002) e generalizado nesta Sprint para `useCreateLead`/`useConvertLead`/`useCreateCustomer`/`useUpdateCustomer`/`useCreateOrganization`/`useCreateContact`/`useCreateOpportunity`. Nunca uma Query real, nunca dado inventado — apenas a acumulação honesta do que este navegador, nesta sessão, já viu.

Consequência necessária: **toda lista, todo Kanban, toda Timeline desta experiência reflete apenas a sessão atual do navegador** — fechar a aba e reabrir perde tudo que não veio do bootstrap original. Isso é nomeado explicitamente em cada seção (Seção 4) e não é um bug — é a única forma honesta de construir esta experiência sem inventar um endpoint que `CRMManager` não tem.

---

## 3. Endpoints Utilizados (Nenhum Novo, Nenhum Contrato Alterado)

| Endpoint | Já existia desde | Consumido por |
|---|---|---|
| `POST /crm/leads` | FUN-004 | `seedDemoData` (inalterado) + **novo uso**: `useCreateLead` |
| `POST /crm/leads/:leadId/convert` | FUN-004 | **Novo uso nesta Sprint** — `useConvertLead` |
| `POST /crm/customers` | FUN-004 | **Novo uso nesta Sprint** — `useCreateCustomer` |
| `PATCH /crm/customers/:customerId` | FUN-004 | **Novo uso nesta Sprint** — `useUpdateCustomer` |
| `POST /crm/organizations` | FUN-004 | `seedDemoData` (inalterado) + **novo uso**: `useCreateOrganization` |
| `POST /crm/contacts` | FUN-004 | **Novo uso nesta Sprint** — `useCreateContact` |
| `POST /crm/opportunities` | FUN-004 | `seedDemoData` (inalterado) + **novo uso**: `useCreateOpportunity` |
| `POST /crm/opportunities/:id/move` | FUN-002/005 | `useMoveOpportunity` (já existente, generalizado nesta Sprint para o CRM Workspace) |

Seis dos oito métodos do `CRMManager` nunca haviam sido consumidos por nenhuma tela antes desta Sprint (`convertLead`, `createCustomer`, `updateCustomer`, `createContact`, mais os dois já usados só pelo bootstrap: `createLead`, `createOrganization`, `createOpportunity`). Nenhuma rota nova foi criada em `apps/api`; nenhum DTO foi alterado. Único ajuste em `apps/web`: `seedDemoData.ts` passou a capturar `relationship` (já devolvido por `crmClient.createOrganization` desde a FUN-005, mas descartado até agora) — necessário porque o CRM Workspace precisa de Status/Lifecycle Stage/Account Manager reais, e `CRMManager` não expõe nenhuma forma de buscá-lo de volta depois.

---

## 4. Estrutura — Nove Seções

| Seção | Dado real | Fonte |
|---|---|---|
| Visão Geral | Sim (KPIs derivados do Workspace + integração somente leitura) | CRM Workspace + `useBusinessProfileSummary`/`useBrandIdentity` |
| Pipeline | Sim (Kanban por `outcome`, mover é o Command real `MoveOpportunity`) | CRM Workspace |
| Oportunidades | Parcial (Empresa/Contato/Valor/Status/Responsável reais; Produtos/Origem/Probabilidade não existem) | CRM Workspace |
| Clientes | Parcial (Organization/Customer/Relationship reais; Segmentação/Última interação não existem) | CRM Workspace |
| Atividades | Não (nenhum Service implementa Activity/Task) | — |
| Timeline | Log local real desta sessão (nunca a Timeline real do Relationship, inacessível via HTTP) | CRM Workspace (`activityLog`) |
| Insights | Sim (agregados reais sobre a amostra desta sessão) | CRM Workspace |
| Relatórios | Sim (mesmos agregados) + exportação client-side real | CRM Workspace |
| Configurações | Parcial (tema claro/escuro, real) | `core/theme` (UX-001) |

Navegação pela mesma barra lateral contextual genérica (`SectionSubNav`, generalizada na FUN-102) já usada por Perfil Empresarial e Branding; seção ativa refletida em `?section=`.

---

## 5. Decisões de Desenho por Seção

### 5.1. Visão Geral

Cinco KPIs (`KPIGrid`/`MetricCard`, novos componentes — Seção 7), todos derivados aritmeticamente do CRM Workspace: quantidade de Oportunidades, Negócios ganhos/perdidos (filtro por `outcome`), Valor em negociação (soma das `Open`), Conversão (`won / (won + lost)`, com guarda contra divisão por zero). "Integração" (per instrução explícita da Sprint): Segmento do Business Profile e Tema do Branding Hub, ambos somente leitura, reaproveitando exatamente os hooks já reais desde a FUN-101/FUN-102 (`useBusinessProfileSummary`, `useBrandIdentity`) — nenhuma dependência nova criada.

### 5.2. Pipeline

O único agrupamento real e fechado que `Opportunity` oferece é `outcome: "Open" | "Won" | "Lost"` — as três colunas do Kanban (`KanbanColumn`/`PipelineCard`, novos componentes) são exatamente essas três, nunca um conjunto fixo de Estágios de negócio ("Prospecção → Proposta → Fechamento"), porque `Pipeline`/`Stage` não têm nenhuma implementação real por trás (Seção 1) — `stageId` é texto livre. "Mover entre etapas" (pedido pela Sprint) é o Command real `MoveOpportunity`, exposto tanto para o texto livre de Etapa quanto para o Outcome (Ganha/Perdida/Reabrir) — nunca uma reordenação de colunas fixas que não existem de verdade. Prioridade e Próxima ação, pedidos pela Sprint, não existem em `Opportunity` — `NotConnectedNotice`.

### 5.3. Oportunidades

Empresa (resolvida via `relationshipId` → Organization/Customer no Workspace), Contato (resolvido via Organization/Customer → Contact, já que `Contact.associationId` referencia o `organizationId`/`customerId`, nunca o `relationshipId` diretamente), Valor, Status (`outcome` real) e Responsável (`accountManagerId` real, um identificador opaco — nenhuma resolução de nome existe, `IDENTITY_HUB` não é consumido por CRM) são reais. Produtos, Origem e Probabilidade não existem em `Opportunity` — `NotConnectedNotice`. Observações usa rascunho local (`useLocalDraft`, generalizado na FUN-102) por Oportunidade, já que `updateCustomer` é o único Command de atualização existente e não cobre Opportunity. "Nova Oportunidade" invoca o Command real `CreateOpportunity`.

### 5.4. Clientes

Lista real (Organization + Customer já acumulados no Workspace) com busca/paginação client-side reutilizando `Table` (UX-001) — nenhuma busca server-side existe. Status/Estágio vêm do `Relationship` real (`status`/`lifecycleStage`). Segmentação (Segment Manager nunca implementado) e Última interação (nenhum campo desse tipo existe em `Relationship`/`Customer`) — `NotConnectedNotice`. Formulários reais para Organization/Customer/Contact.

### 5.5. Atividades

Inteiramente placeholder. `Activity`/`Task` existem como contrato de tipo, mas nenhum `ActivityManager`/`TaskManager` foi implementado — nenhum dos oito métodos de `CRMManager` cria, lê ou conclui um Task ou uma Activity. `NotConnectedNotice` + `EmptyState`, nenhuma persistência inventada.

### 5.6. Timeline Comercial

A decisão mais delicada desta Sprint. Reutiliza o componente `Timeline` do Design System (primeiro uso: Jornada de Construção do Perfil, FUN-101) — mas **nunca a Timeline real do Relationship**: `CRMManager` grava um `TimelineEvent` real a cada Command (`timeline.record(...)`, visível em `CRMManager.ts`), porém não expõe nenhuma Query para lê-lo de volta, e mesmo se expusesse, `apps/api` nunca devolve `CRMEvent[]`/`TimelineEvent[]` pela HTTP (Seção 1). O que esta seção mostra é um **log de atividade construído inteiramente no navegador** (`activityLog` do CRM Workspace) — uma entrada honesta por Command que o próprio usuário disparou nesta sessão, nunca apresentado como histórico persistido no servidor; `NotConnectedNotice` no topo nomeia essa limitação explicitamente. Um segundo bloco, "Detalhe por evento", usa o novo `ActivityBadge` (Seção 7) para classificar cada entrada (Criação/Mudança/Ganho/Perda) por um classificador de texto simples sobre o próprio rótulo já real — nunca uma categoria inventada além do que a própria label já diz.

### 5.7. Insights

Apenas dado real, per instrução explícita ("Nunca gerar IA fictícia"): contagem de Oportunidades, distribuição por `outcome`, tempo médio até encerrar (`closedAt - createdAt`, ambos reais em `Opportunity`, calculado apenas sobre as Oportunidades já encerradas nesta sessão). Nenhuma tendência histórica entre sessões, nenhum benchmark de mercado — `NotConnectedNotice` (o componente `CRM Analytics`, catalogado em `CRM_HUB.md` Capítulo 7, não tem nenhum Service produtor).

### 5.8. Relatórios

Mesmos agregados de Insights, reapresentados como Cards/Indicadores de resumo. "Exportação somente se existir endpoint" (instrução explícita): nenhum `Export Manager` real existe — a única exportação real possível é um download client-side (`Blob`/`URL.createObjectURL`) de todo o CRM Workspace já carregado, mesmo padrão já usado pela Exportação do Brand Center (FUN-102). `NotConnectedNotice` para relatório oficial/exportação agendada.

### 5.9. Configurações

`Configuration Manager` (Pipeline/Stage/campo customizado por Empresa) nunca foi implementado; a única preferência genuinamente real é o tema claro/escuro da aplicação (`core/theme/`, UX-001) — mesmo padrão honesto já usado por Perfil Empresarial (FUN-101) e Branding (FUN-102) em vez de inventar uma preferência de CRM nova.

---

## 6. Componentes Novos (Compartilhados, Design System UX-001)

Per a instrução explícita da Sprint ("Criar novos componentes somente se forem reutilizáveis... todos devem entrar para o Design System compartilhado"), cinco componentes novos, todos em `shared/components/ui/`, nenhum específico deste módulo:

| Componente | Propósito | Reutilização já prevista |
|---|---|---|
| `KPIGrid` | Grade responsiva de indicadores | Qualquer dashboard de domínio futuro |
| `MetricCard` | Indicador com tom semântico (variante de `StatCard` que expressa positivo/negativo/neutro) | Qualquer indicador que precise comunicar sinal, não apenas valor |
| `KanbanColumn` | Coluna de quadro Kanban (cabeçalho + contagem + corpo) | Qualquer quadro Kanban futuro (ex.: Workflow do Automation Engine) |
| `PipelineCard` | Cartão de item de Kanban (título/subtítulo/valor/metadados/ações) | Qualquer quadro Kanban futuro |
| `ActivityBadge` | Rótulo de tipo de evento em um feed cronológico | Qualquer feed de atividade futuro |

Nenhum dos cinco depende de nenhum tipo de CRM — todos recebem `string`/`ReactNode`/`number` genéricos.

Também generalizados nesta Sprint (reuso de infraestrutura já existente, não um componente novo): `useMoveOpportunity` deixou de patchear um único campo (`DemoSnapshot.opportunity`) para substituir a Opportunity correspondente dentro da lista completa do CRM Workspace, mantendo `["dashboard","bootstrap"]` sincronizado só quando a Opportunity movida é a mesma já semeada no bootstrap (preservando `CRMWidget`, inalterado, no Dashboard).

Nenhum componente exclusivo de CRM foi criado além dos cinco acima — todas as nove seções reutilizam `WidgetCard`/`StatCard`/`Badge`/`Alert`/`Field`/`Select`/`Button`/`Table`/`Timeline`/`Tabs`/`Toast`/`AsyncState`/`EmptyState`/`NotConnectedNotice`/`SectionSubNav`/`useLocalDraft`, todos já existentes desde a UX-001/FUN-101/FUN-102.

---

## 7. Achado Real Durante os Testes — `queryClient` é um Singleton Nunca Limpo Entre Testes

Ao escrever `CRMPage.test.tsx`, um teste que move uma Oportunidade para "Ganha" (Pipeline) e um teste seguinte que cria uma nova Oportunidade (Oportunidades) começaram a interferir um no outro de forma intermitente — a segunda Oportunidade criada reaproveitava, silenciosamente, o estado já mutado pelo teste anterior, produzindo `opportunityId` duplicado (`React key` colidindo) e falhas de asserção sem relação aparente com o código exercitado.

**Causa raiz:** `core/query/queryClient.ts` exporta uma única instância de `QueryClient` para toda a aplicação — um singleton de módulo, nunca recriado por teste. Isso nunca havia causado problema visível em nenhuma Sprint anterior porque toda Query já existente (`["dashboard","bootstrap"]`, `["business-profile","summary",id]`, `["branding","identity",tenantId]`) sempre devolve exatamente o mesmo dado de demonstração, para o mesmo Tenant fixo, em qualquer teste — reaproveitar cache "velho" entre testes era, na prática, indistinguível de buscar de novo. O `["crm","workspace"]` desta Sprint é o primeiro cache que **testes diferentes mutam de forma diferente** (mover uma Oportunidade vs. criar uma nova) — expondo a lacuna. Adicionalmente, `["dashboard","bootstrap"]`/`["crm","workspace"]` usam uma chave fixa, **não isolada por Tenant** — um teste usando `"tenant-1"` e outro usando `DEMO_TENANT_ID` (`"tenant-demo"`) ainda assim compartilhariam a mesma entrada de cache.

**Correção:** `queryClient.clear()` adicionado ao `beforeEach`/`afterEach` de `CRMPage.test.tsx` e de `routes.test.tsx` (o outro arquivo que também renderiza `/crm` em sequência com outras rotas) — benefício retroativo para qualquer teste futuro que mute um cache não isolado por Tenant. `BusinessProfilePage.test.tsx`/`BrandingPage.test.tsx` não precisaram do mesmo ajuste porque nenhuma de suas mutações altera uma lista compartilhada da mesma forma — registrado aqui como um risco latente a observar caso uma Sprint futura adicione uma mutação de lista a esses módulos.

---

## 8. Validação

```
pnpm typecheck   → 21/21 pacotes + apps, sucesso
pnpm build       → sucesso (apps/web: CRMPage seu próprio chunk, 25.8 kB/7.4 kB gzip)
pnpm lint        → sucesso, zero warning
pnpm test        → 513/513 testes, 139/139 arquivos (500/138 antes desta Sprint + 7 novos em CRMPage.test.tsx + 6 assertions atualizadas em routes.test.tsx/seedDemoData.test.ts para o novo formato), executado duas vezes seguidas para confirmar ausência de flakiness após a correção da Seção 7
```

Testes cobrindo exatamente a lista exigida pela Sprint: Pipeline (Kanban, mover Oportunidade), Cards (KPIs/`MetricCard`), Timeline (`Timeline` real do Design System + log local), KPIs (Visão Geral), Kanban (três colunas reais), `NotConnectedNotice` (Oportunidades/Clientes/Atividades), Loading (estado inicial antes do Workspace resolver), Estados vazios (`EmptyState` de Atividades).

---

## 9. Limitações

- **Zero capacidade de leitura em `CRMManager`** — a limitação mais consequente desta Sprint (Seção 2); todo o CRM Workspace é reconstruído a partir de Commands já executados nesta sessão do navegador, nunca de uma Query real.
- **Nenhuma Timeline real de Relationship acessível** — `TimelineEvent` é gravado server-side a cada Command, mas nunca lido de volta; a "Timeline Comercial" é um log local, explicitamente rotulado como tal.
- **Nenhum Pipeline/Stage estruturado** — `stageId` é texto livre sem catálogo; o Kanban usa `outcome` (o único enum real e fechado) como eixo de agrupamento.
- **Nenhuma Activity/Task** — nenhum Service implementa nenhuma das duas Entidades.
- **Produtos, Origem, Probabilidade, Prioridade, Próxima ação, Segmentação, Última interação** — nenhum campo correspondente existe em `Opportunity`/`Relationship`/`Customer`.
- **Responsável é sempre um identificador opaco** — `accountManagerId` nunca é resolvido a um nome (IAM não é consumido por CRM).
- **Nenhum dado sobrevive ao fechamento da aba** — o CRM Workspace é inteiramente client-side, sem nenhuma persistência própria (o `localStorage` só é usado pelo rascunho de Observações via `useLocalDraft`).
- **Nenhuma validação visual em navegador real** — mesma limitação já registrada na UX-001/FUN-101/FUN-102 (nenhuma ferramenta de automação de navegador disponível neste ambiente); validação limitada a build bem-sucedido e à suíte de testes (`@testing-library/react` + jsdom).

## 10. Pendências Futuras

- Ao menos uma Query real em `CRMManager` — `listOpportunities`/`pipelineSummary`/`customer360`, os candidatos de maior valor imediato per o próprio `CRM_HUB.md`, Capítulo 11 — resolveria a limitação central desta Sprint (Seção 2) sem exigir nenhuma mudança de domínio além de um método de leitura.
- Um endpoint de Timeline real (`GET /crm/relationships/:id/timeline`), expondo o `TimelineEventService` já existente mas nunca roteado.
- `ActivityManager`/`TaskManager` reais, dando suporte à seção Atividades hoje inteiramente placeholder.
- Pipeline/Stage como Entidades reais e configuráveis (per `Configuration-Driven Pipeline`, já um princípio de arquitetura documentado em `CRM_HUB.md`, Capítulo 5, nunca implementado) — permitiria ao Pipeline mostrar Estágios de negócio reais, não apenas os três `outcome`.
- Resolução de `accountManagerId`/identificadores opacos para nomes reais, via integração com o Identity Hub.
- Os cinco Commands já Frozen mas nunca implementados (`AssignOwner`, `MergeCustomer`, `ArchiveCustomer`, `CreateTask`, `CompleteTask`) — cada um desbloquearia uma seção hoje parcial ou placeholder.
- Uma auditoria dedicada a outros usos do `queryClient` singleton (Seção 7) antes que uma Sprint futura adicione uma segunda mutação de lista não isolada por Tenant.
