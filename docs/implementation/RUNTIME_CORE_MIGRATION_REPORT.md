# IMP-013 — Runtime Core — Relatório de Migração

**Status:** Concluída. **Pacote:** `@abp/runtime` (`platform/packages/runtime`). **Padrão:** Extrair → Adaptar → Portar.

---

## 1. Nota de Posicionamento Documental

Diferente de todo domínio de negócio desta série, o Runtime **não é um Business Hub nem um Platform
Service** — é uma camada transversal de hospedagem de execução, sem autoridade própria de domínio.
A fonte de verdade é `docs/implementation/RUNTIME_ARCHITECTURE_DEFINITION.md` ("Runtime Architecture
Definition", Status: Draft, Version 1.0, Approval "RUNTIME ARCHITECTURE DEFINED"), já citada pelos
sete contratos que o pacote `@abp/runtime` continha desde a IMP-001 — confirmado diretamente durante
a investigação da IMP-012, quando este pacote foi examinado e excluído do escopo daquela Sprint por
tratar de uma camada distinta.

O próprio documento é explícito sobre sua própria natureza (Seção 0.3): "Não Existe Autoridade
Pré-Existente para 'Runtime'... este documento, portanto, não decompõe uma arquitetura-mãe já
aprovada — define, de forma original e restrita ao Escopo desta Sprint, uma camada nova." E também
(Seção 0.1): não é a Phase 7 (Dashboard) do Roadmap — é uma camada transversal consumida por, mas
nunca substituta de, Foundation/Infrastructure/Platform Services/AI Core/Business Hubs/Automation
Engine, todos já aprovados.

**Distinção crítica, repetida ao longo de todo o documento:** o Runtime responde "como uma
solicitação é recebida, contextualizada, encaminhada e observada" — nunca "o que fazer com ela". Essa
segunda pergunta permanece, em todos os casos, respondida pelo domínio de destino (Automation Engine,
um Business Hub, ou o AI Hub). Nenhuma linha de código desta Sprint decide Workflow, aplica Regra de
negócio, ou implementa raciocínio de IA.

## 2. Auditoria de Legado (`src/`)

Busca exaustiva pelas quatorze palavras-chave desta Sprint (runtime, execution, dispatcher, executor,
scheduler, runtime-engine, runtime-context, runtime-state, worker, queue, processor, lifecycle,
execution-context, execution-runtime). Resultado: **nenhum legado extraível** — segunda Sprint
consecutiva (após IMP-012) com esse resultado. Toda ocorrência relevante pertence a um de três
grupos:

### 2.1 Falso amigo confirmado: `src/app/integrations/context/ExecutionContext.ts`

Colisão de nome exata com a Entity-alvo desta Sprint, mas conceito completamente distinto: o
`ExecutionContext` legado carrega `{moduleId, attempt, startedAt}` — estado de retry do Integration
Pipeline ("tentativa atual, ainda sem laço de retry real"), nunca correlação/Tenant/Identidade. Mesmo
padrão de colisão de nome puro já visto entre `Metric` (Observability, IMP-012) e `Metric`
(Analytics Hub, `DOMAIN_OWNERSHIP_MATRIX.md`) — bounded contexts distintos, mesmo termo.

### 2.2 Falso amigo confirmado: pipeline de execução da orquestração de Agentes de IA

- `src/core/execution/{Execution,ExecutionManager,ExecutionService,ExecutionStore,ExecutionStatus,ExecutionRequest,ExecutionPlan}.ts`
  — autodocumentado como o precursor do que hoje é o Execution/Workflow do Automation Engine
  (`@abp/automation-engine`, já migrado na IMP-009): "nunca executa Workflows, IA, notificações,
  scheduler ou integrações externas" e explicitamente excluído do barrel `core/index.ts` por colidir
  de nome com `@/core/orchestrator/ExecutionStatus.ts`. Confirma literalmente o Blueprint desta
  Sprint (Seção 3, "Não pertence ao Runtime"): "Execution (nível de Workflow)... já de propriedade
  exclusiva do Automation Engine."
- `src/core/execution-engine/*` (`ExecutionEngine`, `WorkflowExecutorProvider`,
  `AgentExecutorProvider`, `NotificationExecutorProvider`) e `src/core/execution-scheduling/*`
  (`ExecutionScheduling`, `SchedulerProvider`, `ApprovalProvider`) — mesma classificação já registrada
  no relatório da IMP-009: pertencem à orquestração de execução de Agentes de IA, não ao Runtime
  genérico de hospedagem desta Sprint.
- `src/core/dispatcher/AgentDispatcher.ts` — roteador `agentId → AgentExecutor`, emite
  `AGENT_EXECUTION_STARTED/COMPLETED/FAILED` no EventBus legado. Mesmo nome ("Dispatcher") do
  componente-alvo desta Sprint, mas opera em nível de abstração completamente diferente: encaminha
  uma Task já resolvida a um executor de Agent específico, nunca uma solicitação genérica a
  Automation Engine, Business Hub, ou AI Hub (Blueprint, Seção 4).
- `src/core/queue/{Task,TaskQueue,TaskStatus}.ts` — fila de Tasks de Agent, mesma família do
  `AgentDispatcher` acima. O próprio Blueprint desta Sprint nunca cataloga um componente "Queue" ou
  "Worker" entre os seis Componentes Internos (Seção 4) — a auditoria incluiu essas palavras-chave por
  instrução da Sprint, mas sua ausência no Blueprint confirma que não fazem parte deste domínio.

### 2.3 Placeholder inerte confirmado

`src/core/platform/LifecycleManager.ts` — autodocumentado como "a futura máquina de transição de
estados do runtime (init -> start -> stop -> dispose)", mas as quatro implementações são no-ops
vazios e a classe "nunca foi referenciada por nenhum outro ponto do código além de sua instanciação".
Mesmo quando o nome e a intenção soam adjacentes ao Runtime desta Sprint, o conceito é distinto: ciclo
de vida de *processo* (bootstrap da aplicação), nunca o Execution Lifecycle State *por solicitação*
definido na Seção 6 do Blueprint. Zero lógica real a portar.

**Conclusão da auditoria:** nenhuma linha de lógica de negócio foi portada de `src/legado`. A forma
de campo de nenhum arquivo legado foi sequer reaproveitada como precedente — diferente da IMP-012
(onde `LogEntry` legado influenciou o formato de `LogRecord`), aqui todo candidato encontrado é uma
colisão de nome com um conceito genuinamente distinto, nunca uma variante mais simples do mesmo
conceito.

## 3. Escopo Confirmado

O pacote `@abp/runtime` já continha, desde a IMP-001 (Sprints 7.1 e 7.2 do próprio
`RUNTIME_ARCHITECTURE_DEFINITION.md`), os sete contratos públicos previstos pela Seção 5 e pela
Seção 4 do Blueprint — nenhuma Entity nova foi criada nesta Sprint:

| Contrato | Situação |
|---|---|
| `ExecutionContext` | Reaproveitado sem alteração |
| `ExecutionLifecycleState` | Reaproveitado sem alteração |
| `DispatchTarget` | Reaproveitado sem alteração |
| `DispatchResult` | Reaproveitado sem alteração |
| `DispatchRetryAttempt` | Reaproveitado sem alteração |
| `ExecutionIsolationBoundary` | Reaproveitado sem alteração |
| `DispatchMetric` | Reaproveitado sem alteração |
| `RuntimeCoreDispatchComponent` (catálogo fechado, Sprint 7.1) | Reaproveitado sem alteração |
| `RuntimeResilienceObservabilityComponent` (catálogo fechado, Sprint 7.2) | Reaproveitado sem alteração |

Os dois últimos são tipos-catálogo (união de string fechada nomeando os seis Componentes Internos),
nunca Entities — não receberam Repository nem Service próprios, mesmo tratamento já dado a
`DispatchTargetKind`/`DispatchMetricKind`.

**Exemplos do próprio prompt desta Sprint não usados por ausência de fundamento no Blueprint:**
`RuntimeSession`, `RuntimeWorker`, `RuntimeSnapshot` nunca aparecem em
`RUNTIME_ARCHITECTURE_DEFINITION.md` — mesma disciplina já aplicada em toda Sprint anterior desta
série (os exemplos do prompt são ilustrativos, nunca normativos). `RuntimeContext`/`RuntimeState`/
`RuntimeLifecycle` também não aparecem sob esse nome exato — os conceitos reais e já aprovados são
`ExecutionContext` e `ExecutionLifecycleState`, nomes que este relatório preserva integralmente.

## 4. Componentes Implementados

### 4.1 Repository Interfaces (7)

`ExecutionContextRepository`, `ExecutionLifecycleStateRepository`, `DispatchTargetRepository`,
`DispatchResultRepository`, `DispatchRetryAttemptRepository`, `ExecutionIsolationBoundaryRepository`,
`DispatchMetricRepository`. Todos os sete são fatos observacionais imutáveis — **nenhum tem
`update` nem `remove`** (mesma disciplina já aplicada a Ledger Entry, IMP-007, e a todo fato
observacional de Observability, IMP-012). `ExecutionLifecycleState` não possui identificador próprio
(apenas `executionContextId` + `stage` + `enteredAt`) — cada transição de estágio é um novo registro
imutável, nunca uma atualização in-place; o estágio atual é sempre o último em ordem de inserção.

### 4.2 Services (6) — um por Componente Interno já catalogado na Seção 4

| Service | Componente implementado |
|---|---|
| `ExecutionContextService` | Execution Context Manager |
| `DispatcherService` | Dispatcher |
| `RuntimeRetryCoordinatorService` | Runtime Retry Coordinator |
| `ExecutionIsolationBoundaryService` | Runtime Isolation Boundary |
| `RuntimeObservabilityCollectorService` | Runtime Observability Collector |
| `ExecutionLifecycleService` | Administra o Public Contract "Execution Lifecycle State" (Seção 5), threaded pelo RuntimeManager através de todos os demais Services — não é, ele mesmo, um dos seis Componentes Internos nomeados, mas é necessário para operacionalizar o ciclo de vida que a Seção 6 descreve literalmente |

`ExecutionLifecycleService` aplica a sequência exata da Seção 6 (`Received → ContextEstablished →
Dispatched → Running → Completed | Failed`) como uma máquina de estados com transições permitidas
explícitas — nunca pula nem reordena um estágio; `Completed` e `Failed` são terminais. `Failed` é
alcançável tanto a partir de `Dispatched` (falha definitiva de Dispatch, Seção 13) quanto de `Running`
(falha de domínio) — as duas camadas de falha que a Seção 13 trata como "deliberadamente distintas e
nunca confundidas".

`RuntimeRetryCoordinatorService.recordAttempt` calcula `attemptNumber` a partir do próprio histórico
já registrado — nunca aceita um número informado pelo chamador, evitando lacuna ou duplicidade na
sequência (mesmo cuidado de "nunca ordenar por timestamp para decidir o mais recente" já aplicado em
`CredentialService`, IMP-011, aqui aplicado à contagem de tentativas).

`DispatcherService.dispatch` recebe `succeeded: boolean` já resolvido pelo chamador — a tecnologia
concreta de transporte (como uma solicitação de fato alcança seu destino) nunca é decidida por esta
Sprint (Blueprint, Seção 16: "Nenhuma decisão de tecnologia concreta de hospedagem, de transporte, ou
de observabilidade é tomada por este documento"); o Service apenas registra o fato do encaminhamento.

### 4.3 RuntimeManager

Implementa o componente "Runtime Manager" (Seção 4): "Ponto de entrada único de toda solicitação de
execução... não contém lógica de negócio nem de automação." `dispatch()` pode ser chamado mais de uma
vez para o mesmo Execution Context — cada chamada após a primeira é uma nova tentativa de transporte;
a transição `ContextEstablished → Dispatched` ocorre apenas na primeira chamada. O Manager nunca
decide quantas tentativas realizar nem qual estratégia de backoff aplicar — essa decisão permanece do
chamador, mesma disciplina de "nenhuma tecnologia concreta" já respeitada em todo o pacote.

## 5. Separação entre Runtime e AI Agents

Verificada em três frentes, todas confirmadas sem exceção:

1. **Nenhum import de `@abp/ai`** — o Dispatcher encaminha exclusivamente ao contrato externo do AI
   Hub (via `DispatchTarget{kind: "AIHub"}`, `targetDescription` sempre opaco), nunca a nenhum dos
   onze componentes internos do AI Core (Blueprint, Seção 9).
2. **Nenhum import de `@abp/automation-engine`** além do já previsto por identificador opaco —
   `DispatchTarget{kind: "AutomationEngine"}` nunca referencia `Workflow`/`Trigger`/`Condition`/
   `Action`/`Execution` por tipo importado.
3. **Nenhum import de pacote de Business Hub** (`@abp/crm-hub`, `@abp/communication-hub`,
   `@abp/finance-hub`, `@abp/analytics-hub`, `@abp/growth-hub`) — `DispatchTarget{kind: "BusinessHub"}`
   segue a mesma disciplina de opacidade.

A auditoria de legado (Seção 2) confirma a mesma separação do lado oposto: todo o código de
orquestração de Agentes de IA (`AgentDispatcher`, `execution-engine`, `execution-scheduling`, `queue`)
foi identificado e mantido fora do escopo desta Sprint — o Runtime aqui implementado nunca absorve
nenhuma dessas responsabilidades.

## 6. Commands e Events

**Nenhum catálogo de Commands nem de Events existe para este domínio** — confirmado diretamente pelo
próprio Blueprint, Seção 20 (Conformidade com as Phases 1–6), linha "Phase 1 — Foundation": "Nenhum
novo Command, Evento, ou Query definido; Execution Context nunca substitui Ownership já catalogado."
Coerente com a natureza do Runtime como camada transversal de hospedagem, nunca um Hub com Event Map
próprio — mesma ausência já confirmada para AI Hub (IMP-010), IAM (IMP-011) e Observability (IMP-012).

`RuntimeOperationResult<TEntity> = { result: TEntity }` — mesma forma mínima já usada nas três
Sprints anteriores, pela mesma ausência de catálogo aprovado.

## 7. Lacunas Arquiteturais Registradas (nunca preenchidas unilateralmente)

- **Contratos de Volume II do Runtime** (`RuntimeCoreDispatchComponent`/
  `RuntimeResilienceObservabilityComponent`, Sprints 7.1/7.2): já existiam como catálogos fechados,
  reaproveitados sem alteração — nenhuma implementação de Service própria para eles além de servirem
  como referência de nomenclatura dos seis Componentes Internos já mapeados 1:1 aos Services desta
  Sprint.
- **Estratégia concreta de retry (número máximo de tentativas, backoff)**: o Blueprint nunca define
  quantas tentativas o Runtime Retry Coordinator deve aplicar antes de declarar falha definitiva —
  apenas que a tentativa é "de nível de transporte" e "antes de a solicitação alcançar qualquer
  lógica de domínio" (Seção 13). Implementar um número fixo exigiria inventar uma política ausente do
  Blueprint; `RuntimeManager` deixa essa decisão inteiramente ao chamador (`dispatch()` pode ser
  chamado quantas vezes forem necessárias; `failExecution()` é a decisão explícita de desistir).
- **Tecnologia concreta de transporte/hospedagem**: explicitamente fora de escopo pela própria Seção
  16 do Blueprint — `DispatcherService.dispatch` recebe o resultado já resolvido (`succeeded`),
  nunca implementa a chamada real de rede/processo.
- **Skill Runtime / Tool Runtime** (Components 21–22 do AI Core, `AI_CORE_ARCHITECTURE_DEFINITION.md`,
  Seção 7.7–7.8): o próprio Blueprint desta Sprint já esclarece (Seção 0.3) que são um conceito
  distinto, interno ao AI Core, nunca redefinido aqui — confirmado, não implementado.
- **AI Agents, Agent Runtime, Planner, Reasoner, Tool Registry, MCP, Multi-Agent, Memory
  Orchestration**: explicitamente fora do escopo desta Sprint por instrução direta; nenhuma menção a
  eles existe no Blueprint além da distinção da Seção 0.3 acima — registrados aqui como roadmap
  futuro do AI Core, nunca desta camada.

## 8. Validação

```
pnpm typecheck   → 17/17 pacotes, sucesso
pnpm build       → 17/17 pacotes + apps/web (vite build), sucesso
pnpm lint        → sucesso
pnpm test        → 225/225 testes, 64/64 arquivos de teste (suíte inteira do monorepo)
```

**Testes desta Sprint:** 20 testes em 7 arquivos (`ExecutionContextService`, `ExecutionLifecycleService`,
`DispatcherService`, `RuntimeRetryCoordinatorService`, `ExecutionIsolationBoundaryService`,
`RuntimeObservabilityCollectorService`, `RuntimeManager`), cobrindo: criação de Execution Context com
correlação/Tenant/Identidade opacos, sequência literal do ciclo de vida (inclusive rejeição de
estágio pulado e de transição a partir de estágio terminal), registro do fato de Dispatch sem
interpretar o resultado do processamento, numeração sequencial de tentativas de retry a partir do
histórico, unicidade do Isolation Boundary por Execution Context, e ausência de `command`/`events` no
resultado do Manager — além do fluxo completo bem-sucedido (`receive → dispatch → markRunning →
completeExecution`) e do fluxo de falha definitiva de Dispatch (`dispatch falho → failExecution`).

## 9. Resumo

| Item | Contagem |
|---|---|
| Entities novas | 0 (todas as sete já existiam desde a IMP-001) |
| Entities reaproveitadas sem alteração | 7 (`ExecutionContext`, `ExecutionLifecycleState`, `DispatchTarget`, `DispatchResult`, `DispatchRetryAttempt`, `ExecutionIsolationBoundary`, `DispatchMetric`) |
| Catálogos fechados reaproveitados | 2 (`RuntimeCoreDispatchComponent`, `RuntimeResilienceObservabilityComponent`) |
| Repository interfaces | 7 |
| Services | 6 |
| Manager | 1 (`RuntimeManager`) |
| Commands | 0 (nenhum catálogo aprovado) |
| Events | 0 (nenhum catálogo aprovado) |
| Testes novos | 20 |
| Arquivos de legado (`src/`) extraídos | 0 (todo legado é falso amigo de nome ou placeholder inerte) |
