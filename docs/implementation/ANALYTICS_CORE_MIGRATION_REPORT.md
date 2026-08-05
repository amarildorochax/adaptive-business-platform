# Analytics Core Migration Report

**Adaptive Business Platform · Documento de Implementação**

Status: Approved · Sprint: IMP-008 — Analytics Hub Migration (Core)

---

## Nota de Posicionamento Documental

Como em toda Sprint desta série, o contexto e o texto da própria Sprint divergem do estado real do repositório em pontos que precisam ser registrados antes de qualquer decisão técnica.

**O par de documentos é `ANALYTICS_DOMAIN_BLUEPRINT.md`/`ANALYTICS_HUB.md`** — o primeiro é o proprietário exclusivo do domínio (fronteira, vinte e seis Entidades conceituais, dezoito Capacidades de Negócio, catorze Eventos, doze Regras de negócio); o segundo é o par técnico que descreve como o Hub é arquitetado para operar sobre esse modelo (os trinta e dois componentes internos, os dezesseis Commands, as Queries). Mesmo padrão de par Blueprint/Hub já usado por CRM, Communication, Finance e Growth.

**`platform/packages/analytics-hub/` já existia, com 26 Entidades/Value Objects e os catálogos completos de Commands (dezesseis) e Events (catorze) já declarados** — mesma situação de CRM/Communication/Growth/Finance Hub (IMP-002/003/005/007): um pacote de contratos rico, esperando sua primeira implementação de execução real, não um domínio a construir do zero (diferente de Content/Commerce Hub).

**Três módulos legados reais e diretamente relevantes foram encontrados** — diferente de toda Sprint anterior desta série, que só encontrou legado tangencial (Growth) ou nenhum legado (Content, Commerce) ou legado de granularidade diferente (Finance). `src/core/analytics/` (`Analytics`/`AnalyticsManager`/`AnalyticsMetric`/`AnalyticsSnapshot`/`AnalyticsReport`), `src/core/business-intelligence/` (`BusinessIntelligence`/`Insight`/`Recommendation`/`Trend`) e `src/core/dashboard/` (`Dashboard`/`DashboardWidget`) mapeiam, por nome e por intenção, quase diretamente ao vocabulário já aprovado pelo Blueprint (`Metric`, `Snapshot`, `Report`, `Insight`, `Analytical Recommendation`, `Trend`, `Dashboard`, `Widget`). Cada um foi lido integralmente antes de qualquer decisão de Extração — ver Inventário abaixo.

**`src/core/dashboard/` é um falso parente parcial — real precedente estrutural, nunca precedente de dado.** Seu `Dashboard`/`DashboardWidget` são a interface do dashboard interno de observabilidade da plataforma de Agentes de IA (Runtime, Event Bus, Memory, Workflow, Agent, Knowledge, AI Gateway) — o padrão container+Widget é genuinamente equivalente ao já aprovado pelo Blueprint, mas o conteúdo de cada Widget (`data: Record<string, unknown>`, deliberadamente opaco) nunca é Metric/KPI de negócio. Apenas o padrão estrutural (Widget com título, Dashboard com lista de Widget) foi reutilizado — nunca o dado.

**`src/app/features/dashboard/` é uma feature de UI real e substancial** (`DashboardHome.tsx`, componentes, controllers, hooks, `DashboardMockService.ts`, widgets de apresentação como `OverviewMetrics`/`Pipeline`/`TopDealsTable`) — mas é inteiramente camada de apresentação com dado mockado, nunca domínio; consistente com `SOURCE_TREE_STRATEGY.md`, não portável a este pacote.

---

## Resumo Executivo

Esta Sprint implementou a primeira execução real sobre o pacote `platform/packages/analytics-hub` — até então composto exclusivamente de contratos de tipo. Dezesseis Entidades entraram em escopo, cobrindo os dois fluxos centrais já descritos no Blueprint (Capítulo 9): `Dataset → Aggregation → Metric → KPI → Dashboard` e `TimeSeries → Trend → Forecast → Insight → Recommendation`, mais `Report → Visualization` e a Anti-Corruption Layer de ingestão de Evento (`AnalyticsEventIngestion`). Diferente de toda Sprint anterior, três módulos legados reais (`src/core/analytics/`, `src/core/business-intelligence/`, `src/core/dashboard/`) foram efetivamente adaptados — não apenas para campos práticos, mas para lógica de negócio determinística inteira (detecção de tendência, classificação de severidade, resumo de relatório). `pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro em todo o workspace (18 projetos), com 23 testes novos (123 no total).

---

## Inventário e Classificação

| Conceito | Origem | Classificação | Evidência |
|---|---|---|---|
| `platform/packages/analytics-hub/` (26 Entidades, 16 Commands, 14 Events, 12 Business Rules) | — | Já existente, Frozen em espírito | Confirmado por leitura integral de `AnalyticsCommand.ts`, `AnalyticsEvent.ts`, `AnalyticsBusinessRule.ts` e das 26 Entidades já declaradas desde a IMP-001 |
| `AnalyticsMetric` (id, name, value, source, collectedAt, metadata) | `src/core/analytics/AnalyticsMetric.ts` | Adaptar | `name` portado como extensão aditiva de `Metric.ts`; `formula`/`windowStart`/`windowEnd` (exigidos pelo Blueprint, ADR-012) não existem no legado — nunca relaxados para acomodá-lo |
| `AnalyticsSnapshot` (bundle cumulativo de todas as Metric) | `src/core/analytics/AnalyticsSnapshot.ts` | Granularidade distinta — não portado | O `Snapshot` já aprovado é o valor de um único indicador em um único ponto no tempo; o legado é um retrato cumulativo de múltiplas métricas — conceitos diferentes, nenhum campo transferido |
| `AnalyticsReport`/`AnalyticsService.buildSummary()` | `src/core/analytics/{AnalyticsReport.ts, AnalyticsService.ts}` | Adaptar (dado + lógica) | `title`/`summary` portados como extensão de `Report.ts`; `buildSummary()` (contagem/média/mínimo/máximo, determinístico, nunca IA) portado quase literalmente para `ReportService.buildSummary()` |
| `Trend` (metricName, direction, confidence, detectedAt) | `src/core/business-intelligence/Trend.ts` | Adaptar (tipo + lógica) | `TrendDirection` (`up`/`down`/`stable`) portado, fechando o `direction: string` solto do Blueprint; `confidence` portado como extensão; `detectTrends()` (comparação primeiro/último Snapshot) portado para `TrendService.identify()` |
| `Insight` (title, description, severity, createdAt) | `src/core/business-intelligence/Insight.ts` | Adaptar (tipo + lógica) | `title`/`severity` (`InsightSeverity`) portados como extensão de `Insight.ts`; `classifySeverity()` (limiares 0.5/0.2) portado para `InsightService.classifySeverity()` |
| `Recommendation` (title, description, priority, createdAt) | `src/core/business-intelligence/Recommendation.ts` | Adaptar (tipo + lógica) | `title`/`priority` (`AnalyticalRecommendationPriority`) portados como extensão de `AnalyticalRecommendation.ts`; regra "todo Insight com severity !== low gera uma Recommendation" portada para `AnalyticalRecommendationService.formulate()` |
| `ForecastProvider`/`MLProvider`/`AIInsightProvider` | `src/core/business-intelligence/*` | Nunca implementado, mesmo no legado | Contratos futuros explicitamente reservados para previsão estatística avançada/ML — "fora do escopo desta Sprint" já no próprio legado; nada a portar |
| `Dashboard`/`DashboardWidget`/`DashboardManager` (observabilidade de plataforma) | `src/core/dashboard/*` | Reutilizar apenas o padrão estrutural | Conteúdo (Runtime/EventBus/Agent/Knowledge) nunca é Metric/KPI de negócio; apenas o padrão "container + Widget com título" foi reutilizado — `Widget.title` portado |
| Feature de Dashboard na UI (`DashboardMockService`, widgets de apresentação) | `src/app/features/dashboard/*` | Fora de escopo — camada de apresentação | Dado mockado, não domínio; consistente com `SOURCE_TREE_STRATEGY.md` |
| `AnalyticsProvider.ts` (coletor automático de seis domínios legados) | `src/core/analytics/` | Não portado — papel substituído pela arquitetura nova | Cumpria o mesmo papel de Anti-Corruption Layer que `AnalyticsEventIngestion` cumpre na arquitetura aprovada, mas por chamada direta a fachada pública de outro domínio (padrão pré-Evento); a nova arquitetura já exige consumo exclusivamente por Evento (Blueprint, Capítulo 4) |
| Commands do Analytics Hub (16) | `AnalyticsCommand.ts` | Já aprovado, reutilizado parcialmente | Quatorze de dezesseis exercidos nesta Sprint — apenas `UpdateBenchmark`/`UpdateScorecard` sem produtor (Benchmark/Scorecard adiados) |
| Events do Analytics Hub (14) | `AnalyticsEvent.ts` | Já aprovado, reutilizado parcialmente | Doze de quatorze exercidos — apenas `BenchmarkUpdated`/`ScorecardUpdated` sem produtor, mesma causa |
| `Benchmark`, `Scorecard`, `Analytical Model`/`View`/`Dimension`/`Measure`, `Business`/`Executive`/`Operational`/`Strategic Indicator`, `Decision Support` | `platform/packages/analytics-hub/*` | Adiado, não requisitado por necessidade imediata | Dez das vinte e seis Entidades do Blueprint — capacidades de Comparação, Modelagem e os quatro tipos quase idênticos de Indicator, mais a composição de mais alto nível (`Decision Support`); nenhum invented, nenhum descartado (ver Componentes Ausentes) |
| Customer/Conversation/Invoice/Campaign (CRM/Communication/Finance/Growth Hub) | `@abp/crm-hub`, `@abp/communication-hub`, `@abp/finance-hub`, `@abp/growth-hub` | Nunca acessado, nem por referência de tipo | `AnalyticsEventIngestion.sourceHub`/`sourceEventType` são sempre `string` opacos — nenhum tipo de nenhum outro Business Hub é importado por nenhum arquivo desta Sprint (Blueprint, Capítulo 4, ADR-007/008/009) |

---

## Componentes Criados

**Entidades estendidas** (nunca redefinidas): `Metric.ts` (`name?`), `Trend.ts` (`TrendDirection` fechando `direction`, `confidence?`), `Insight.ts` (`title?`, `InsightSeverity`), `AnalyticalRecommendation.ts` (`title?`, `AnalyticalRecommendationPriority`), `Report.ts` (`title?`, `summary?`), `Widget.ts` (`title?`), `Dashboard.ts` (`archived: boolean`, necessidade estrutural do Command `ArchiveDashboard`, sem precedente legado).

**Repositórios** (contratos apenas): um por Entidade em escopo (16 no total) — `SnapshotRepository` nunca declara `update`/`remove` (Snapshots Are Immutable); `ForecastRepository`/`InsightRepository` nunca declaram `update` (Forecast Never Alters State / Insights Never Execute); `AnalyticsEventIngestionRepository` nunca declara `update`/`remove` (histórico imutável, sustenta Dataset Is Reconstructible).

**Serviços**: um por Entidade (16 no total). `TrendService.identify()`, `InsightService.identify()`/`classifySeverity()`, `AnalyticalRecommendationService.formulate()` e `ReportService.buildSummary()` portam lógica de negócio determinística inteira do legado — não apenas forma de dado, mesma disciplina de "regra de negócio permanece no domínio, nunca no Manager" já exigida por esta Sprint.

**Orquestrador**: `AnalyticsManager.ts` — expõe `createDataset`/`refreshDataset`/`refreshAnalytics`, `processAggregation`, `calculateMetric`, `calculateKPI`, `createDashboard`/`updateDashboard`/`archiveDashboard`, `createSnapshot`, `generateTrend`, `generateForecast`, `generateInsight`, `generateRecommendation`, `createReportTemplate`/`generateReport`, `publishVisualization`.

## Componentes Reutilizados

O padrão `{result, command?, events}` de retorno de operação, já em uso por `CRMManager`/`CommunicationManager`/`GrowthManager`/`FinanceManager`, foi reutilizado sem alteração — Analytics Hub, como Growth e Finance Hub, já chega com catálogo de Commands completo, diferente de Content/Commerce Hub. A disciplina de coleta de Domain Events (nenhum publicado em Event Bus real) também se repete sem alteração.

O padrão de Anti-Corruption Layer por referência opaca (`sourceHub`/`sourceEventType: string`, nunca um tipo importado), já demonstrado por `Audience.memberReferenceIds` (Growth Hub) e `FinancialAccount.relationshipId` (Finance Hub), é aqui elevado a Entidade própria (`AnalyticsEventIngestion`) — o Blueprint já havia antecipado essa necessidade central ("Analytics é o primeiro domínio cuja razão de existir é consumir Evento de todos [os demais] simultaneamente"), e o arquivo já chegava com essa disciplina documentada desde a IMP-001.

## Componentes Ausentes

Benchmark (comparação versionada de referência), Scorecard (composição de indicador consolidado), Analytical Model/View/Dimension/Measure (modelagem e segmentação de Dataset), Business/Executive/Operational/Strategic Indicator (quatro variações de wrapper sobre Metric, quase idênticas em forma) e Decision Support (composição de mais alto nível, o terceiro fluxo do Capítulo 9 — `Report → Visualization → Decision Support`) — todas já contratadas em `analytics-hub` desde a IMP-001, nenhuma implementada nesta Sprint. Nenhuma corresponde a uma exclusão explícita desta Sprint (o texto da Sprint não lista um "Fora do Escopo" tão detalhado quanto Commerce/Finance) — a decisão de adiá-las segue o mesmo critério de proporcionalidade já aplicado por toda Sprint anterior desta série (CRM/Growth/Commerce/Finance também deixaram, cada uma, entre 30% e 55% do catálogo total de Entidades para uma fase futura).

---

## Lacunas Arquiteturais

**`UpdateBenchmark` e `UpdateScorecard` — dois dos dezesseis Commands aprovados — não têm produtor nesta Sprint**, e os Events correspondentes (`BenchmarkUpdated`, `ScorecardUpdated`) também não. Nenhuma lacuna real do Blueprint: cada um corresponde a uma Entidade explicitamente adiada, nunca implementada porque não fazia parte do escopo desta Sprint.

**`ArchiveDashboard` não tem nenhum Evento dedicado no catálogo de catorze já aprovados.** `Dashboard` só tem dois Eventos cobertos (`Created`, `Updated`) — nenhum `DashboardArchived`. `AnalyticsManager.archiveDashboard()` reutiliza `DashboardUpdated`, tratando arquivamento como uma forma de atualização de estado — nunca um Evento inventado, mesmo tratamento já dado a `transferConversation` reutilizando `ConversationAssigned` em IMP-003.

**`CreateDashboard`/`CreateReportTemplate` não têm um Command equivalente para `Dataset` e para `Report Template`.** Nenhum dos dezesseis Commands cobre a criação inicial de um Dataset (apenas `RefreshDataset`, que já pressupõe um Dataset existente) nem de um Report Template. `AnalyticsManager.createDataset()`/`createReportTemplate()` retornam `command: undefined`, `events: []` — mesmo tratamento já dado a Organization/Contact em `CRMOperationResult` (IMP-002).

**Nenhum Evento aprovado cobre `Aggregation`, `TimeSeries` ou `Widget` isoladamente.** `Aggregation` não aparece no catálogo de Eventos; a criação de `TimeSeries`/`Widget` é sempre parte do resultado de uma operação de `Snapshot`/`Dashboard`, nunca produz Evento próprio.

**`CalculateKPI` (Command) produz `KPIUpdated` (Event) — nomenclatura assimétrica, já aprovada.** Mesma assimetria já registrada para `GenerateTrend`→`TrendIdentified` em Growth Hub (IMP-005) — o vocabulário aprovado nunca é corrigido por esta Sprint, apenas usado como está.

---

## Riscos

Mesmo risco estrutural já registrado pelos seis relatórios anteriores: nenhum Event Bus real existe, então todo `AnalyticsEvent` retornado é coletado, nunca publicado.

Risco específico desta Sprint: o Analytics Hub é, por design do próprio Blueprint, o domínio mais dependente da maturidade e da consistência do Evento publicado pelos demais Hubs — "um Evento mal formado ou ausente em qualquer domínio operacional se propaga diretamente como uma lacuna ou uma distorção em algum indicador consolidado". Nenhuma Sprint anterior implementou um Event Bus real; até que isso ocorra, `refreshDataset()`/`AnalyticsEventIngestion` permanecem chamados manualmente pelo consumidor, nunca acionados automaticamente por um Evento real de CRM/Communication/Finance/Growth Hub — o mesmo risco de "operação de domínio livremente chamável sem garantia de causalidade externa" já registrado para `CommerceManager.markOrderPaid()` (IMP-006) e `FinanceManager.capturePayment()` (IMP-007) se aplica aqui a toda a superfície de ingestão.

Risco secundário: a detecção de Trend portada do legado (`src/core/business-intelligence/BusinessIntelligenceService.detectTrends()`) é determinística e simples por design — compara apenas o primeiro e o último Snapshot de uma Time Series, nunca análise estatística de série completa. Isso é fiel ao legado e ao próprio Blueprint (que nunca especifica um algoritmo de detecção mais sofisticado nesta fase), mas significa que uma Time Series com múltiplos pontos intermediários de reversão de direção não é capturada corretamente por este primeiro Core.

---

## Recomendações

Ao planejar a Sprint que conectar CRM/Communication/Finance/Growth Hub ao Analytics Hub via Event Bus real, tratar `refreshDataset()` como candidato à substituição por um handler real reagindo a Evento publicado por cada Hub de origem — nunca uma operação livremente invocável, mesma recomendação já registrada para Commerce↔Finance em `FINANCE_CORE_MIGRATION_REPORT.md`.

Priorizar Business/Executive/Operational/Strategic Indicator como próxima extensão, já que os quatro têm forma quase idêntica (todos apenas `{indicatorId, tenantId, metricId}`) e nenhuma dependência de infraestrutura externa — baixo custo de implementação, alto valor de completude do Capítulo 9 ("Business Indicators → Executive Dashboard → Decision Support").

Revisitar a detecção de Trend (Time Series completa, não apenas primeiro/último ponto) apenas quando o Blueprint ou uma Sprint futura de Analytics Avançado explicitamente exigir — nunca substituir a versão determinística atual por conta própria desta Sprint.

---

## Resultados da Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro em todo o workspace (18 projetos). 123 testes no total (100 antes desta Sprint, 23 novos): `MetricService.test.ts`, `KPIService.test.ts`, `TrendService.test.ts`, `InsightService.test.ts`, `AnalyticalRecommendationService.test.ts` e `AnalyticsManager.test.ts` (nove cenários, cobrindo os dois fluxos centrais do Blueprint de ponta a ponta, mais os Commands sem produtor de Evento e as duas lacunas de Command ausente).

---

## Conclusão

Esta foi a primeira Sprint desta série a encontrar legado real, funcional e diretamente portável em múltiplos módulos simultaneamente — não apenas forma de dado, mas lógica de negócio inteira (detecção de tendência, classificação de severidade, geração de recomendação, resumo de relatório), cada uma já determinística e já explicitamente "nunca gerada por IA" no próprio legado, antes mesmo de esta Sprint excluir IA de seu escopo. Isso tornou esta Sprint, ao mesmo tempo, a mais rica em Extração genuína de toda a série, e a que exigiu mais disciplina para não confundir "meu legado tem um conceito parecido" com "meu legado é o legado certo" — `src/core/dashboard/`, por exemplo, tinha o nome exato do domínio, e ainda assim seu dado nunca foi portado, apenas seu padrão estrutural. O Analytics Hub agora sabe consolidar, medir e projetar exatamente como o Blueprint exige — e continua, com o mesmo rigor de toda Sprint anterior, sem jamais alterar Customer, Campaign, Invoice ou Conversation, e sem jamais executar uma ação por conta própria.
