# IMP-012 — Observability & Platform Operations Core — Relatório de Migração

**Status:** Concluída. **Pacote:** `@abp/infrastructure` (`platform/packages/infrastructure`). **Padrão:** Extrair → Adaptar → Portar.

---

## 1. Nota de Posicionamento Documental

Diferente de todo domínio anterior desta série, **não existe um `OBSERVABILITY_HUB.md` nem um
`PLATFORM_OPERATIONS.md`** — nenhum documento com esse nome existe no repositório (confirmado por
`Glob` em `**/*OBSERVABILITY*.md` e `**/*PLATFORM*.md`, que retornaram apenas documentos de
implementação/auditoria, nunca um Blueprint de Hub). A fonte de verdade real para este domínio é
**`docs/architecture/NON_FUNCTIONAL_REQUIREMENTS.md`**, especificamente:

- **Capítulo 5 (Disponibilidade)** — Health Check, Heartbeat.
- **Capítulo 9 (Observabilidade)** — Logs, Metrics, Tracing, Correlation ID, Distributed Trace,
  Dashboards, Alertas, SLI, SLO.
- **Capítulo 13 (Operação)** — Resposta a Incidentes (processo formal de cinco etapas), Runbooks,
  Playbooks.
- **Capítulo 15 (Requisitos Obrigatórios)** — NFR-020, NFR-033 a NFR-038, os requisitos que
  formalizam cada um dos conceitos acima como obrigação de plataforma.

Isso é arquiteturalmente coerente: `SYSTEM_BLUEPRINT.md`, Capítulo 3, já classifica Observability
como parte da **Infrastructure Layer** ("Event Bus · Queues · Cache · Workers · Observability"),
nunca um Business Hub — e `DOMAIN_OWNERSHIP_MATRIX.md` (Capítulo 4) confirma essa leitura: nenhuma
linha da Ownership Matrix atribui um conceito a "Observability" ou "Platform Operations". Por isso
este domínio nunca teve, nem deveria ter, um documento de Hub próprio — sua especificação sempre
esteve nos Non-Functional Requirements, transversal a todos os Hubs.

O pacote-alvo (`@abp/infrastructure`) já continha, desde a IMP-001, cinco contratos rasos citando
`OBSERVABILITY_CONCRETE_STRUCTURE.md` como estrutura de origem (`Metric`, `Span`, `AlertRule`,
`CorrelationId`, `ServiceLevel`) — mesmo padrão de scaffolding fundacional já visto em
`platform-services` (IMP-011) e em `ai` (IMP-010). `OBSERVABILITY_CONCRETE_STRUCTURE.md` em si não
existe como arquivo no repositório (mesma situação de `OBSERVABILITY_SPECIFICATION.md`) — apenas
citado em comentário de origem; a estrutura desses cinco contratos foi tratada como já aprovada e
nunca alterada, apenas estendida com Repository, Service e Manager.

## 2. Auditoria de Legado (`src/`)

Busca exaustiva por todas as dezoito palavras-chave do escopo desta Sprint (observability,
monitoring, telemetry, metrics, tracing, logging, health, heartbeat, diagnostics, runtime, eventbus,
queue, worker, scheduler, platform, operations, status, alert, incident). Resultado: **nenhum legado
extraível**. Toda ocorrência relevante pertence a um de dois grupos:

### 2.1 Falso amigo confirmado: pipeline de Observability da orquestração de Agentes de IA

- `src/core/events/Observability.ts` (`startObservability()`) — assina o EventBus legado e produz
  `console.log` estruturado para eventos de Boot/Runtime/Agents/Workflow/AI Gateway/Business
  Memory/Prompt Manager/Dashboard/CRM/Campaign/Finance/Automation/Analytics — é lógica real e
  funcional, mas é **wiring de log da orquestração de Agentes de IA**, nunca o domínio de
  Observability da Plataforma de Negócio definido em `NON_FUNCTIONAL_REQUIREMENTS.md`. Mesmo padrão
  de falso amigo já confirmado para `src/core/automation/` (IMP-009) e para `src/core/catalog/`
  (IMP-006): nome idêntico ao domínio-alvo, conteúdo pertencente à AI Agent Runtime.
- `src/core/dashboard/{Dashboard,DashboardManager,DashboardOverview}.ts` — confirma exatamente a
  suspeita já registrada no relatório da IMP-008 ("conteúdo é dado de observabilidade de
  plataforma... nunca Metric/KPI de negócio"): os widgets consolidados são
  Runtime/EventBus/Memory/Workflow/Agent/Knowledge/AIGateway/Analytics — sinais técnicos da
  orquestração de IA, não Health Check/Metric/Alert/Incident do NFR. `DashboardOverview.platformStatus`
  chega mais perto (reflete `RuntimeWidget`, "unknown" até o primeiro evento de boot), mas seu
  `getPlatformStatus()` lê estado interno do EventBus legado, não um Health Check formal — nenhuma
  lógica portável.
- `src/app/integrations/types/Observability.ts` (`ObservabilityHooks`, `noopObservabilityHooks`) —
  pontos de integração deliberadamente vazios: "`noopObservabilityHooks` não faz nada; é o valor
  padrão até uma Sprint futura conectar um coletor real". Autodocumentado como placeholder sem
  nenhuma implementação real — mesma disposição já vista em `src/app/integrations/types/` para IAM
  (IMP-011): útil apenas como evidência de forma de campo, nunca como lógica a portar.
- `src/app/integrations/middlewares/{Logging,Telemetry}Middleware.ts` — consomem exclusivamente
  `noopObservabilityHooks`; nenhum efeito observável real ocorre em nenhum dos dois. Confirmam a
  forma de campo de `LogEntry{level,message,correlationId,timestamp}`, reaproveitada conscientemente
  no `LogRecord` novo desta Sprint (ver Seção 4).
- `src/app/features/dashboard/mocks/systemHealth.mock.ts` — dado simulado do widget "System Health"
  do jogo/UI; autodocumentado: "Não consulta a Observability real do Core — apenas simula". Zero
  lógica real; apenas evidência de forma (`SystemHealthCheck{id,name,status}`).
- `src/design-system/components/Alert/` — componente visual de UI (banner de alerta), não a Entity
  de domínio `Alert`. Falso amigo por nome apenas.

### 2.2 Ausência confirmada

Zero ocorrências para: `heartbeat`, `diagnostics`, `operations`, `monitoring`, `incident`. Nenhum
diretório ou arquivo em `src/` trata de Heartbeat, Diagnostics, Incident Response ou Monitoring como
conceito de domínio — consistente com "nunca assumir ausência de domínio apenas porque um diretório
não existe": a ausência foi confirmada por busca textual completa, não por inspeção de estrutura de
diretório.

**Conclusão da auditoria:** nenhuma linha de lógica de negócio foi portada de `src/legado` — todo o
legado relevante é (a) wiring real mas pertencente a um domínio diferente (AI Agent Runtime), ou (b)
placeholder/mock explicitamente inerte. A forma de campo de `LogEntry`/`SystemHealthCheck` foi
reaproveitada como precedente de shape, nunca como lógica.

## 3. Escopo Confirmado dentro de `@abp/infrastructure`

O pacote já continha catorze contratos desde a IMP-001, citando **dois documentos de Concrete
Structure distintos** — confirmado por grep direto no comentário de origem de cada arquivo:

| Fonte citada | Arquivos | Disposição nesta Sprint |
|---|---|---|
| `OBSERVABILITY_CONCRETE_STRUCTURE.md` | `AlertRule`, `CorrelationId`, `Metric`, `ServiceLevel`, `Span` | **Em escopo** — estendidos com Repository/Service/Manager |
| `DATA_CONCRETE_STRUCTURE.md` | `Backup`, `Consistency`, `DataLifecycle`, `DataVersion`, `MigrationPlan`, `Reconciliation` | Fora de escopo — pertencem a `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 10 (Dados), não ao Capítulo 9 (Observabilidade). Não tocados. |
| `INTEGRATION_RESILIENCE_CONCRETE_STRUCTURE.md` | `ConnectorProtection`, `QueuedMessage`, `WebhookValidation` | Fora de escopo — pertencem aos Capítulos 7 (Resiliência) e 12 (Integrações), território de um futuro Integration Hub. Não tocados. |

Nenhum dos nove arquivos fora de escopo foi modificado.

`platform/packages/runtime` (`RuntimeCoreDispatchComponent`, `RuntimeResilienceObservabilityComponent`,
`DispatchMetric`, `ExecutionLifecycleState` etc.) foi investigado e **confirmado fora de escopo**: seu
próprio comentário de origem declara explicitamente que não duplica "o Metrics Engine nem o Automation
Analytics já implementados em `@abp/automation-engine`" e que mede exclusivamente "o ato de
encaminhar uma solicitação ao seu destino" — é a Observability interna do Runtime de despacho de
Agentes de IA (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Sprints 7.1/7.2), um Volume II distinto,
análogo à distinção Volume I/Volume II já documentada para o AI Hub na IMP-010. Não tocado.

## 4. Componentes Implementados

### 4.1 Entities

| Entity | Situação | Origem |
|---|---|---|
| `Metric` | Reaproveitada sem alteração | `OBSERVABILITY_CONCRETE_STRUCTURE.md` (IMP-001) |
| `Span` | Reaproveitada sem alteração | idem |
| `CorrelationId` | Reaproveitada sem alteração (type alias) | idem |
| `AlertRule` | Reaproveitada sem alteração | idem |
| `ServiceLevelIndicator` / `ServiceLevelObjective` | Reaproveitadas sem alteração | idem |
| `LogRecord` (novo) | Criada | NFR Capítulo 9 ("Logs registram toda execução..."), NFR-033; forma de campo evidenciada por `LogEntry` legado |
| `HealthCheck` (novo) | Criada | NFR Capítulo 5, NFR-020 |
| `Alert` (novo) | Criada — instância disparada, distinta de `AlertRule` (declarativo) | NFR Capítulo 9, NFR-036 |
| `Incident` (novo) | Criada — `IncidentStage` fechado nas cinco etapas literais do Capítulo 13 | NFR Capítulo 13, NFR-037/038 |

**Decisão explícita — Distributed Trace nunca é uma Entity armazenada.** O próprio comentário de
origem de `Span.ts` já afirmava: "Um Distributed Trace é a composição de múltiplos Spans com o mesmo
Correlation ID". `SpanService.getTrace(correlationId)` implementa essa composição como leitura
derivada — nenhuma tabela/Repository `Trace` foi criada. Mesma disciplina de "nunca inventar Entity
para um conceito que o próprio Blueprint já declara como derivado".

**Decisão explícita — `Incident.severity` é opcional, nunca um enum fechado nem um placeholder
sentinela.** O NFR exige que a severidade seja "sempre classificada em função de seu impacto de
negócio real, nunca apenas de sua causa técnica" e nunca enumera um conjunto fechado de níveis
(Sev1–4 ou equivalente) em nenhum capítulo. Um Incident recém-aberto (`stage: "Detected"`) ainda não
foi classificado — `severity` ausente é mais honesto que um valor sentinela inventado (`"unclassified"`
foi considerado e descartado durante a implementação).

**Decisão explícita — `Dashboards` nunca vira Entity nem Repository nesta Sprint.** O NFR Capítulo 9
já delega explicitamente: "Dashboards consolidam Logs, Metrics e Tracing... sempre servidos como
Read Model já otimizado, conforme já detalhado em `QUERY_CATALOG.md`, Capítulo 6" — território de
Read Model/Query, não de Core write-side, mesmo raciocínio já aplicado a Analytics Hub (Dashboard é
ownership de Analytics Hub em `DOMAIN_OWNERSHIP_MATRIX.md`, um conceito de negócio distinto do
Dashboard técnico aqui descartado).

### 4.2 Repository Interfaces (9)

`MetricRepository`, `SpanRepository`, `AlertRuleRepository`, `AlertRepository`,
`ServiceLevelIndicatorRepository`, `ServiceLevelObjectiveRepository`, `LogRecordRepository`,
`HealthCheckRepository`, `IncidentRepository`.

Todos os fatos observacionais imutáveis (`Metric`, `Span`, `Alert`, `LogRecord`, `HealthCheck`) têm
Repository **sem `update` nem `remove`** — mesma disciplina estrutural já aplicada a Ledger Entry
(IMP-007) e Access Audit Record (IMP-011). `IncidentRepository` é o único com `update` (o Incident
evolui por cinco estágios antes de ser encerrado) — nunca `remove`.

### 4.3 Services (8)

`MetricService`, `SpanService` (Tracing — `start`/`finish`/`getTrace`), `AlertRuleService`,
`AlertService` (única regra de negócio real desta Sprint: dispara `Alert` para cada `AlertRule` cujo
`threshold` uma `Metric` já ultrapassou — `>`, nunca `>=`, seguindo literalmente "ultrapassa" do
texto do NFR), `ServiceLevelService`, `LogService`, `HealthCheckService`, `IncidentService`.

### 4.4 Manager

`PlatformOperationsManager` — único ponto de orquestração multi-Service: `recordMetric` sempre avalia
a Metric recém-registrada contra as AlertRule já definidas para seu nome e retorna os Alerts
disparados, dando efeito real ao texto "Alertas são disparados quando uma Metric ultrapassa um
limite configurado". Todo o restante dos dezessete métodos delega a exatamente um Service, sem lógica
própria.

## 5. Commands e Events

**Nenhum catálogo de Commands nem de Events existe para este domínio** — confirmado por:

- `SYSTEM_BLUEPRINT.md`, Capítulo 7 (Event Map): catorze Eventos nomeados, todos de propriedade de
  um Business Hub específico (`LeadCreated`, `PaymentReceived`, `TenantProvisioned` etc.); nenhum de
  propriedade de "Observability".
- `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 4: nenhuma linha atribui um conceito a "Observability" ou
  "Platform Operations" como Owner.
- Coerente com a classificação de Observability como Infrastructure Layer (Capítulo 3), nunca um
  Business Hub — a mesma camada nunca teve, em nenhum documento revisado, um Command/Event Map
  próprio.

`PlatformOperationsResult<TEntity> = { result: TEntity }` — mesma forma mínima já usada para AI Hub
(IMP-010) e IAM (IMP-011), pela mesma ausência de catálogo aprovado.

## 6. Lacunas Arquiteturais Registradas (nunca preenchidas unilateralmente)

- **Runbook / Playbook** (`NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 13): descritos como documentação
  de procedimento de resposta, sem nenhuma indicação textual de que precisem de um Repository próprio
  nesta Sprint — nenhuma linha do NFR ou de `DOMAIN_OWNERSHIP_MATRIX.md` os cataloga como Entity com
  ciclo de vida armazenado. Não implementados; registrados aqui como gap explícito, não como omissão
  silenciosa.
- **Avaliação de conformidade SLI/SLO contra uma Metric real**: `ServiceLevelService` registra SLI e
  SLO, mas nunca avalia se uma Metric observada está dentro do objetivo — ao contrário de `AlertRule`
  ("ultrapassa um limite", direção explícita), o texto do NFR nunca declara se o SLO é um piso ou um
  teto (disponibilidade sobe é bom; taxa de erro sobe é ruim) — implementar essa avaliação exigiria
  inventar uma regra de direção ausente do Blueprint. Documentado, não implementado.
- **Auto Scaling, Load Balancing, Failover, Circuit Breaker, Dead Letter Queue, Backpressure,
  Sharding, Rolling Update/Blue-Green/Canary**: todos descritos em `NON_FUNCTIONAL_REQUIREMENTS.md`
  (Capítulos 5, 6, 7, 13) como mecanismos de infraestrutura de execução — nenhum é um fato de domínio
  a ser modelado como Entity/Repository nesta Sprint (Core), e vários já têm concrete-structure
  própria fora deste escopo (Circuit Breaker/DLQ → `INTEGRATION_RESILIENCE_CONCRETE_STRUCTURE.md`,
  Seção 3). Explicitamente fora de escopo.
- **Distributed monitoring / APM / integrações externas de observabilidade** (Datadog, Grafana,
  OpenTelemetry Collector real, etc.): nenhuma menção no NFR além de "um Correlation ID... mesmo
  quando essa cadeia atravessa múltiplos módulos" — sempre tratado como capacidade interna da
  própria plataforma, nunca como integração de terceiro. Nenhum roadmap explícito de longo prazo foi
  encontrado citando isso; registrado aqui como ausência confirmada, não como item de roadmap.

## 7. Validação

```
pnpm typecheck   → 17/17 pacotes, sucesso
pnpm build       → 17/17 pacotes + apps/web (vite build), sucesso
pnpm lint        → sucesso
pnpm test        → 205/205 testes, 57/57 arquivos de teste (suíte inteira do monorepo)
```

**Testes desta Sprint:** 20 testes em 8 arquivos (`MetricService`, `SpanService`, `AlertService`,
`ServiceLevelService`, `LogService`, `HealthCheckService`, `IncidentService`,
`PlatformOperationsManager`), cobrindo: correlação obrigatória em Metric/LogRecord/Alert, composição
de Distributed Trace por ordem de início, disparo de Alert em `>` estrito (nunca `>=`), guarda de
sequência das cinco etapas de Incident (inclusive rejeição de etapa pulada), "estado mais recente"
por ordem de inserção em HealthCheck (nunca por timestamp, mesma disciplina de
`CredentialService.matches`, IMP-011), e ausência de `command`/`events` no resultado do Manager.

## 8. Resumo

| Item | Contagem |
|---|---|
| Entities novas | 4 (`LogRecord`, `HealthCheck`, `Alert`, `Incident`) |
| Entities reaproveitadas sem alteração | 5 (`Metric`, `Span`, `CorrelationId`, `AlertRule`, `ServiceLevel`) |
| Repository interfaces | 9 |
| Services | 8 |
| Manager | 1 (`PlatformOperationsManager`) |
| Commands | 0 (nenhum catálogo aprovado) |
| Events | 0 (nenhum catálogo aprovado) |
| Testes novos | 20 |
| Arquivos de legado (`src/`) extraídos | 0 (todo legado é falso amigo ou placeholder inerte) |
