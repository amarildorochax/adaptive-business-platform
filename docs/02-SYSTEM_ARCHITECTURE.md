# 02 — SYSTEM ARCHITECTURE

**Andreia AI Platform**
Referência oficial da arquitetura técnica.

Este documento complementa `docs/PLATFORM_VISION.md` (visão de produto/negócio) com o **como**: como as camadas conversam entre si, o que já existe em código e o que ainda é intenção de design.

**Legenda usada em todo o documento:**
- 🟢 **Implementado** — existe em código hoje, em `src/core`, `src/modules` ou `src/shared`. Onde não for dito o contrário, "implementado" significa *estrutura e contrato implementados*, não regra de negócio.
- ⚪ **Planejado** — não existe nenhum código ainda; é direção de design.

Nenhum item é documentado como pronto se não existir. Onde um componente é parcialmente real (estrutura sim, comportamento não), isso é dito explicitamente.

---

## 1. Introdução

**O que é:** a Andreia AI Platform é um Sistema Operacional para Empresas baseado em IA — um ambiente que hospeda módulos de negócio, conectores externos e agentes de IA, coordenados por um runtime único, em vez de um produto fechado com um conjunto fixo de funcionalidades.

**Objetivo:** permitir que uma empresa ligue somente os módulos de que precisa (CRM, Blog, Ads, Financeiro...) sem carregar o peso dos que não usa, com agentes de IA operando sobre esses módulos.

**Missão** (herdada de `docs/MASTER_ROADMAP.md`): automatizar tarefas, apoiar decisões, gerar conteúdo, gerenciar campanhas, organizar clientes, acompanhar resultados e aprender continuamente — validado primeiro em um cliente piloto real (JardFlores Decor) antes de expandir.

### Princípios arquiteturais

- **Arquitetura modular** — cada módulo de negócio (`src/modules/*`) é uma unidade independente, ativável/desativável, que implementa o mesmo contrato (`IModule`) para que o núcleo da plataforma não precise conhecer sua lógica interna.
- **Escalabilidade por contrato, não por acoplamento** — novos módulos, conectores e (no futuro) agentes se somam à plataforma implementando uma interface conhecida (`IModule`/`IConnector`/`IAutomation`, em `src/shared/interfaces`), nunca sendo referenciados por nome dentro do núcleo. Isso é o que torna, em tese, possível adicionar um módulo novo sem alterar `PlatformRuntime`, `Pipeline` ou qualquer Registry — ver §12 para o estado real disso hoje.
- **Baixo acoplamento entre camadas** — cada camada (§3) só conhece a camada imediatamente abaixo dela através de um contrato, nunca da implementação concreta de outra camada. Hoje isso é reforçado por um limite físico ainda mais forte: a camada de aplicação atual (escritório virtual) e a fundação da nova plataforma (`src/core/platform`, `src/core/pipeline` etc.) **não se importam uma à outra** — dependência zero, verificada a cada Sprint via `git status` e `tsc --noEmit`.
- **Um único barramento de eventos** — `EventBus` (`src/core/events/EventBus.ts`) é, por decisão explícita mantida desde a Sprint 7.2, o único mecanismo de comunicação assíncrona da plataforma. Nenhum componente novo cria seu próprio barramento (ver §10).

---

## 2. Visão Geral

Diagrama de camadas, do cliente até a IA:

```
Cliente
  ↓
Dashboard                    🟢 estrutura (src/components/dashboard/) · ⚪ Dashboard V2 (docs/PLATFORM_VISION.md §5)
  ↓
Platform Runtime             🟢 PlatformRuntime — ciclo de vida real, não é chamado por nenhuma UI ainda
  ↓
Core Services                🟢 Pipeline, Registries, Loaders, Managers — estrutura; maior parte sem lógica
  ↓
Hubs                         ⚪ agrupamento de negócio (docs/PLATFORM_VISION.md §3) — não é uma camada de código
  ↓
Modules                      🟢 estrutura (src/modules/*) · ⚪ lógica de negócio
  ↓
Automation                   🟢 estrutura (src/core/automation/*) · ⚪ execução real
  ↓
Connectors                   🟢 estrutura (src/core/connectors/*) · ⚪ integrações reais
  ↓
AI Runtime                   ⚪ Planejado
  ↓
Agents                       ⚪ Planejado
```

**Leitura importante:** esta é a cadeia de dependência *pretendida*, não o fluxo de chamadas *real* de hoje. Na prática atual, cada seta acima representa uma fronteira de contrato ainda não conectada — por exemplo, nada no `Dashboard` hoje instancia um `PlatformRuntime`, e nenhum `Module` é carregado por um `Loader` de verdade. O valor do diagrama é mostrar a ordem de dependência que a arquitetura vai seguir quando cada camada for ligada à seguinte — trabalho que corresponde ao Épico C do roadmap (§14).

Camada a camada:

- **Cliente** — quem usa a plataforma (usuário humano na empresa cliente).
- **Dashboard** — interface visual; hoje o escritório virtual (`src/game/`) e os componentes em `src/components/dashboard/`.
- **Platform Runtime** — `PlatformRuntime`, o controlador único do ciclo de vida da aplicação (quando ligado).
- **Core Services** — a infraestrutura compartilhada: Pipeline, Registries, Loaders, Managers.
- **Hubs** — agrupamento de propósito de negócio (Business, Growth, Operations, Integration, AI) — organiza Modules, não é uma camada técnica própria.
- **Modules** — as unidades de negócio ativáveis por empresa.
- **Automation** — motores que orquestram lógica entre módulos (workflows, regras, triggers).
- **Connectors** — a única porta de saída para sistemas externos.
- **AI Runtime / Agents** — a camada de inteligência que vai operar sobre tudo isso — inteiramente planejada.

---

## 3. Camadas da Plataforma

### UI Layer
**Componentes:** Dashboard, Office, Widgets, Painéis.
**Estado:** 🟢 estrutura visual existente (`src/components/dashboard/{sidebar,center,rightpanel,footer,header,history,logs,cards}`, `src/game/scenes/OfficeScene.ts` e afins) — mas pertence hoje à aplicação atual, não à nova plataforma. Widgets por módulo e o layout completo do Dashboard V2 são ⚪ Planejado (`docs/PLATFORM_VISION.md` §5).

### Application Layer
**Componentes:** Runtime, Pipelines, Registries.
**Estado:** 🟢 `PlatformRuntime`, `Pipeline`/`BootPipeline`, `PlatformRegistry`/`ModuleRegistry`/`ServiceRegistry`/`ConnectorRegistry` — todos existem, e o ciclo de vida e a execução de pipeline já funcionam de verdade (não são só estrutura — ver §4). É a camada mais madura da nova plataforma.

### Business Layer
**Componentes:** Modules, Services.
**Estado:** 🟢 estrutura (`src/modules/{crm,business,agenda,marketing,communication,analytics,fiscal,hr,projects,documents,academy,marketplace}`, cada um com `Manager`/`Events`/`Models`/`Types`) · ⚪ nenhuma lógica de negócio, nenhum "Service" concreto além do contrato `IService`.

### Integration Layer
**Componentes:** Connectors.
**Estado:** 🟢 estrutura (`BaseConnector`, `ConnectorManager`, `ConnectorRegistry`) · ⚪ nenhum conector real, nenhuma chamada de API externa.

### Automation Layer
**Componentes:** Workflows.
**Estado:** 🟢 estrutura (`WorkflowEngine`, `RuleEngine`, `TriggerManager`, `HookManager`, `PolicyManager`) · ⚪ nenhuma orquestração real.

### AI Layer
**Estado:** ⚪ Planejada por completo — ver §9.

---

## 4. Core

Para cada componente: Objetivo · Responsabilidade · Estado atual · Evolução futura.

### PlatformRuntime 🟢
*Arquivo:* `src/core/platform/PlatformRuntime.ts`
- **Objetivo:** ser o ponto único que controla o ciclo de vida de toda a aplicação.
- **Responsabilidade:** manter o `RuntimeState` atual; compor (sem executar) `BootManager`, `LifecycleManager`, `ModuleLoader`, `ConnectorLoader`, `AutomationLoader`; expor `getBootPipeline()`.
- **Estado atual:** `init()`, `start()`, `stop()` implementados e funcionais — `init()` transiciona `CREATED → INITIALIZING`, chama `bootPipeline.execute()` e decide `INITIALIZED` ou `ERROR`; `start()` só age a partir de `INITIALIZED` (`→ STARTING → RUNNING`); `stop()` só age a partir de `RUNNING` (`→ STOPPING → STOPPED`); `dispose()` existe e está vazio de propósito. Nenhuma classe externa instancia `PlatformRuntime` hoje.
- **Evolução futura:** tornar-se o ponto de entrada real da aplicação (Épico C), passando a coexistir com ou substituir `src/core/bootstrap/startPlatform.ts`.

### RuntimeState 🟢
*Arquivo:* `src/core/platform/RuntimeState.ts`
- **Objetivo:** vocabulário fechado dos estados possíveis do runtime.
- **Responsabilidade:** enumerar `CREATED`, `INITIALIZING`, `INITIALIZED`, `STARTING`, `RUNNING`, `STOPPING`, `STOPPED`, `ERROR` — sem nenhuma regra de transição própria (as transições vivem em `PlatformRuntime`).
- **Estado atual:** completo e em uso real por `PlatformRuntime`.
- **Evolução futura:** nenhuma mudança prevista — é intencionalmente um vocabulário fechado ("não adicionar estados extras" foi regra explícita desde a criação).

### Pipeline 🟢
*Arquivo:* `src/core/pipeline/Pipeline.ts` (com `PipelineStep.ts`, `PipelineContext.ts`, `PipelineResult.ts`)
- **Objetivo:** infraestrutura genérica e reutilizável para qualquer sequência de etapas da plataforma — não só o boot.
- **Responsabilidade:** `register(step)`, `list()`, `clear()`, e `execute()` real: cria um `PipelineContext`, percorre as `PipelineStep` registradas em ordem, captura exceção (parando imediatamente, sem rollback ainda), mede duração, devolve um `PipelineResult` (`success`, `errors[]`, `warnings[]`, `duration`).
- **Estado atual:** único componente do Core com **execução real e testada** (não só estrutura) — validado em runtime nas Sprints B.1–B.3, não só por type-check.
- **Evolução futura:** rollback automático em caso de falha; outras especializações (`LifecyclePipeline`, `ShutdownPipeline`, `UpdatePipeline`, `MigrationPipeline`, `PluginPipeline`, `InstallPipeline` — todas ⚪ Planejado).

### BootPipeline 🟢
*Arquivo:* `src/core/platform/BootPipeline.ts`
- **Objetivo:** especialização de `Pipeline` dedicada ao processo de boot.
- **Responsabilidade:** herdar todo o comportamento de `Pipeline` (`extends Pipeline`, sem redefinir nada) e, no construtor, registrar automaticamente as três Boot Steps (abaixo), nesta ordem.
- **Estado atual:** funcional — é o `BootPipeline` que `PlatformRuntime.init()` executa de verdade.
- **Evolução futura:** validações e ordenação específicas de boot, se algum dia divergirem do comportamento genérico de `Pipeline`.

### BootSteps 🟢 (estrutura) / ⚪ (lógica)
*Arquivos:* `src/core/platform/steps/{BaseBootStep,InitializeRuntimeStep,ValidateRuntimeStep,FinalizeRuntimeStep}.ts`
- **Objetivo:** as primeiras etapas concretas do boot, provando o fluxo `PlatformRuntime → BootPipeline → BootSteps → PipelineResult` de ponta a ponta.
- **Responsabilidade:** `BaseBootStep` dá identidade ao conjunto (`extends PipelineStep`, sem adicionar nada); as três concretas (`initialize-runtime`, `validate-runtime`, `finalize-runtime`) implementam `name`/`execute`/`rollback`.
- **Estado atual:** `execute()`/`rollback()` das três etapas estão **vazios de propósito** — nenhuma lógica de negócio, nenhum acesso a Runtime/Registry/Loaders/EventBus/Connectors/Modules/Automation.
- **Evolução futura:** cada etapa ganha comportamento real conforme o Épico C avançar (ex.: `InitializeRuntimeStep` de fato preparando o `PipelineContext`).

### ModuleRegistry 🟢
*Arquivo:* `src/core/platform/ModuleRegistry.ts`
- **Objetivo:** futuro catálogo central dos módulos de negócio (`IModule`).
- **Responsabilidade:** permitir ao `PlatformRegistry` localizar/listar módulos de forma genérica.
- **Estado atual:** classe vazia; referenciada (não instanciada) por `PlatformRegistry.moduleRegistry?: ModuleRegistry`.
- **Evolução futura:** registro real, alimentado pelo `ModuleLoader` quando este passar a descobrir módulos de verdade.

### ServiceRegistry 🟢
*Arquivo:* `src/core/platform/ServiceRegistry.ts`
- **Objetivo:** futuro catálogo de serviços transversais (`IService`) que não são módulo de negócio nem conector.
- **Responsabilidade:** análoga ao `ModuleRegistry`, para o contrato `IService`.
- **Estado atual:** classe vazia; mesma situação do `ModuleRegistry`.
- **Evolução futura:** em aberto — depende de que tipo de serviço transversal surgir primeiro.

### ConnectorRegistry 🟢
*Arquivo:* `src/core/connectors/ConnectorRegistry.ts`
- **Objetivo:** catálogo central de conectores (`IConnector`) disponíveis.
- **Responsabilidade:** localizar/resolver conectores por identificador.
- **Estado atual:** classe vazia.
- **Evolução futura:** populado pelo `ConnectorLoader` e consultado pelo `ConnectorManager`.

### ConnectorManager 🟢
*Arquivo:* `src/core/connectors/ConnectorManager.ts`
- **Objetivo:** gerenciar o ciclo de vida coletivo dos conectores.
- **Responsabilidade:** `init()`/`start()`/`stop()` (implementa `ILifecycle`) para o conjunto de conectores, não para um conector individual (isso é papel de cada `BaseConnector`).
- **Estado atual:** `init()`/`start()`/`stop()` vazios.
- **Evolução futura:** orquestrar health-check e reconexão de conectores reais.

### Automation 🟢
*Arquivos:* `src/core/automation/{WorkflowEngine,RuleEngine,TriggerManager,HookManager,PolicyManager}.ts`
- **Objetivo:** motores que vão orquestrar lógica condicional e sequencial entre módulos.
- **Responsabilidade:** cada um implementa `IAutomation` (`id` + `ILifecycle`) — `WorkflowEngine` (fluxos de várias etapas), `RuleEngine` (regras configuráveis), `TriggerManager` (gatilhos a partir de eventos), `HookManager` (extensões em pontos do ciclo), `PolicyManager` (restrições sobre execução).
- **Estado atual:** todos com `init()`/`start()`/`stop()` vazios; nenhuma automação real existe.
- **Evolução futura:** Épico H (Operations Hub).

### EventBus 🟢
*Arquivo:* `src/core/events/EventBus.ts` (com `Event.ts`, `EventTypes.ts`)
- **Objetivo:** único barramento de eventos assíncronos da plataforma inteira — decisão arquitetural fixa, reafirmada em toda Sprint desde a 7.2 ("Não criar um novo EventBus").
- **Responsabilidade:** `subscribe(type, listener)` (retorna função de unsubscribe), `emit(event)`, `clear()`.
- **Estado atual:** 🟢 real e funcional, mas pertence hoje à **aplicação atual** — é consumido por `TaskQueue`/agentes do escritório virtual. Nenhum componente da nova plataforma (`platform/`, `pipeline/`, `modules/`, `connectors/`, `automation/`) publica ou consome eventos dele ainda — ver §10.
- **Evolução futura:** tornar-se o canal real de comunicação entre Modules, Automation e Connectors, quando essas camadas ganharem lógica.

---

## 5. Hubs

Hubs são agrupamento arquitetural de propósito de negócio — não uma pasta nem uma classe. Documentado em detalhe (com lista de módulos) em `docs/PLATFORM_VISION.md` §3; aqui, só a responsabilidade de cada um:

| Hub | Responsabilidade | Estado |
|---|---|---|
| **Business Hub** | Operação do dia a dia da empresa (CRM, Financeiro, Vendas, Agenda, Projetos, Documentos, Equipe) | ⚪ agrupamento planejado sobre módulos parcialmente 🟢 escaffoldados |
| **Growth Hub** | Aquisição, conteúdo, tráfego e conversão (Blog, SEO, Ads, Social, Email...) | ⚪ Planejado |
| **Operations Hub** | Espinha dorsal operacional invisível ao usuário (Automação, Aprovações, Auditoria, Logs, Filas, Eventos) | ⚪ agrupamento planejado sobre `automation`/`queue`/`events`/`history` parcialmente 🟢 |
| **Integration Hub** | Toda comunicação com sistemas externos, exclusivamente via Connectors | ⚪ agrupamento planejado sobre `connectors` 🟢 (estrutura) |
| **AI Hub** | Agentes de IA e tudo que os sustenta (Runtime, Memory, Skills...) | ⚪ Planejado — ver §9 |
| **Marketplace Hub** | Ecossistema de plugins/extensões de terceiros | ⚪ Planejado |
| **Academy Hub** | Treinamento e conteúdo educacional para usuários da plataforma | ⚪ Planejado |

---

## 6. Módulos

Como um módulo de negócio (`src/modules/*`) deverá funcionar quando ganhar comportamento — hoje, tudo abaixo é ⚪ Planejado, exceto onde marcado:

- **Lifecycle** 🟢 (contrato) / ⚪ (uso real) — todo módulo implementa `IModule` (`IService + ILifecycle + name`), ou seja, tem `id`, `name`, `init()`, `start()`, `stop()`. Hoje cada `Manager.ts` já implementa esse contrato (ex.: `CrmManager`), mas nada chama `init()/start()/stop()` de um módulo.
- **Registro** 🟢 (contrato) / ⚪ (uso real) — um módulo se registra no `ModuleRegistry` para ficar visível ao resto da plataforma. `ModuleRegistry` existe, mas está vazio — nenhum módulo se registra hoje.
- **Inicialização** ⚪ — planejada via `ModuleLoader.load(): IModule[]`, que hoje sempre retorna `[]` (nenhum import dinâmico, nenhum módulo concreto referenciado, por decisão explícita da Sprint 7.3).
- **Comunicação** ⚪ — entre módulos, planejada exclusivamente via `EventBus` (nunca chamada direta de um módulo para outro) — reforça baixo acoplamento.
- **Eventos** 🟢 (contrato) / ⚪ (uso real) — cada módulo já tem um `Events.ts` com `<Módulo>EventTypes`/`<Módulo>EventType` (ex.: `CrmEventTypes`) — apenas definição de tipos, nunca um barramento próprio; nenhum nome de evento de negócio foi definido ainda em nenhum módulo.
- **Dependências** ⚪ — ainda não há mecanismo para um módulo declarar que depende de outro (ex.: "Vendas" pode depender de "CRM"). Não existe hoje.
- **Versionamento** ⚪ — não existe hoje nenhum campo de versão em `IModule` nem em `Manager.ts`.
- **Permissões** ⚪ — não existe hoje nenhum controle de quem pode ativar/usar um módulo — ver §11 (Segurança).

---

## 7. Connectors

**Regra arquitetural fixa:** nenhum módulo pode acessar uma API externa diretamente. Todo acesso externo passa por um Connector.

```
Módulo
  ↓
Connector      (implementa IConnector: id, init/start/stop, isConnected())
  ↓
API Externa
```

Todo conector concreto futuro estende `BaseConnector` (`src/core/connectors/BaseConnector.ts`, `abstract class implements IConnector`, hoje com `id` abstrato e `init/start/stop/isConnected()` como stubs neutros) e é gerenciado pelo `ConnectorManager`, localizável via `ConnectorRegistry`.

**Exemplos de conectores previstos (todos ⚪ Planejado, zero implementação hoje):** Google, Meta, WordPress, Pinterest, WhatsApp, Claude, OpenAI, Gemini, Microsoft, n8n, Zapier.

Continuidade já existente na aplicação atual (fora da nova plataforma, mas relevante como precedente): `src/core/ai/AIProviderFactory.ts` já antecipa `openai` e `claude` como opções (hoje sempre caindo em `MockAIProvider`), e `src/providers/{openai,claude,gemini,mock}` já reserva a pasta de cada provedor.

---

## 8. Automação

| Conceito | Estado | Onde |
|---|---|---|
| **Workflows** | 🟢 estrutura / ⚪ execução | `WorkflowEngine` (`src/core/automation/WorkflowEngine.ts`) |
| **Triggers** | 🟢 estrutura / ⚪ execução | `TriggerManager` |
| **Queues** | 🟢 **funcional**, mas na aplicação atual | `TaskQueue` (`src/core/queue/TaskQueue.ts`) — fila real, com `add/next/start/complete/fail/cancel` |
| **Execution** | ⚪ Planejado | não existe um "executor" de automação hoje — `Pipeline.execute()` (§4) é o único mecanismo de execução real da nova plataforma, e ainda não foi ligado a `WorkflowEngine` |
| **History** | 🟢 **funcional**, mas na aplicação atual | `ExecutionHistory` (`src/core/history/ExecutionHistory.ts`) |
| **Retry** | ⚪ Planejado | nenhuma tentativa automática de repetição existe em nenhuma camada |
| **Logs** | ⚪ Planejado | `src/core/logs/` é uma pasta vazia reservada desde antes da nova plataforma existir |
| **Monitoramento** | ⚪ Planejado | `src/core/metrics/` é uma pasta vazia reservada, mesma situação |

---

## 9. IA — ⚪ Planejado

Nenhum item desta seção tem qualquer implementação na nova plataforma. É vocabulário para orientar design futuro (Épico I):

- **AI Runtime** — abstração sobre qual provedor de IA está em uso.
- **Agent Runtime** — execução de agentes (planejamento, uso de ferramentas, resposta).
- **Memory** — memória de curto/longo prazo por agente.
- **Planning** — decomposição de objetivos em passos executáveis.
- **Communication** — troca de mensagens entre agentes.
- **Scheduler** — cadência/frequência de execução de cada agente.
- **Skills** — capacidades reutilizáveis entre agentes.
- **Capabilities** — o que um agente tem permissão de fazer.

⚠️ Colisão de nome já registrada formalmente como **TECH-001** (ver §15, Dívidas Arquiteturais): já existe hoje um `AgentRegistry` **funcional**, mas ele pertence à aplicação atual (`src/core/agents/registry/AgentRegistry.ts`, agentes visuais do escritório virtual) — **não é** o mesmo conceito do futuro "Agent Registry" da AI Hub. A decisão já tomada é renomear o atual para `OfficeAgentRegistry` e reservar `AIAgentRegistry` para este componente — execução prevista para o início do Épico I.

---

## 10. Eventos

**Componente:** `EventBus` (`src/core/events/EventBus.ts`), com o formato de evento em `Event.ts` (`id`, `type`, `source`, `target?`, `payload?`, `createdAt`) e o catálogo de tipos em `EventTypes.ts` (`TASK_*`, `AGENT_*`, `SQUAD_*`, `BLOG_*`, `PIN_*`, `LEAD_RECEIVED`/`CUSTOMER_CREATED`/`SALE_COMPLETED`, `META_ANALYZED`/`GOOGLE_ANALYZED`/`PINTEREST_ANALYZED`, `DASHBOARD_REFRESH`, `KPI_UPDATED`, `ERROR_OCCURRED`, `NOTIFICATION_CREATED`).

**Fluxo:**
```
Publicador → eventBus.emit(event) → EventBus (Map<type, Set<listener>>) → cada listener inscrito naquele type
```

**Quem publica hoje:** componentes da aplicação atual (fila de tarefas, agentes do escritório). Nenhum componente de `src/core/platform`, `src/core/pipeline`, `src/modules`, `src/core/connectors` ou `src/core/automation` publica eventos hoje.

**Quem consome hoje:** o mesmo — só a aplicação atual. Existe até um arquivo de demonstração, `src/core/events/EventBusTest.ts`, que assina os eventos de `TASK_*` e imprime no console — é uma ferramenta manual de verificação, não algo chamado em produção.

**Boas práticas (para quando a nova plataforma passar a publicar/consumir):**
- Nunca criar um segundo `EventBus` — todo `*Events.ts` novo (em `platform/`, `connectors/`, `automation/`, cada `modules/*`) já nasceu como **definição de tipos** (`XEventTypes`/`XEventType`, no padrão de `EventTypes.ts`), nunca como classe com `emit`/`subscribe` próprios — essa regra foi seguida rigorosamente desde a Sprint 7.2.
- Sempre guardar e chamar a função de unsubscribe que `subscribe()` retorna, para não vazar listeners.
- Preferir nomes de evento namespaced por domínio (o padrão `EventTypes.ts` já agrupa por comentário de seção — `// CRM`, `// Tasks` etc.) para reduzir colisão quando os `*EventTypes` de cada módulo forem de fato populados.

---

## 11. Segurança — ⚪ Planejado

Nenhuma implementação hoje. Visão para orientar design futuro:

- **Permissões** — controle de quem pode ativar/usar cada módulo (complementa a lacuna já registrada em §6).
- **Roles** — perfis de acesso (ex.: administrador da empresa cliente vs. colaborador).
- **Auditoria** — trilha de quem fez o quê; tem um precedente funcional na aplicação atual (`ExecutionHistory`), mas nada equivalente existe na nova plataforma.
- **Logs** — mesma situação de `src/core/logs/` citada em §8: pasta reservada, vazia.
- **Tokens** — autenticação de chamadas entre camadas e com Connectors.
- **Segredos** — armazenamento seguro de credenciais usadas pelos Connectors (chaves de API do Google, Meta, OpenAI etc.).
- **Criptografia** — proteção de dados sensíveis em repouso e em trânsito.

---

## 12. Escalabilidade

**Como a arquitetura pretende permitir crescer sem alterar código existente:**

- **Novos módulos** — implementar `IModule` em `src/modules/<novo>/Manager.ts` e (no futuro) deixar o `ModuleLoader` descobri-lo, sem que `PlatformRuntime`, `Pipeline` ou `PlatformRegistry` precisem mudar uma linha.
- **Novos conectores** — estender `BaseConnector`, implementando `IConnector`, e registrar no `ConnectorRegistry` via `ConnectorLoader` — mesmo princípio.
- **Novos agentes** (quando a AI Hub existir) — registrados via `Agent Registry`/`Agent Factory` (§9), sem tocar no núcleo.

**Estado real hoje:** essa promessa ainda não é verificável em produção — `ModuleLoader.load()` e `ConnectorLoader.load()` sempre retornam `[]` por decisão explícita (nenhum import dinâmico foi implementado ainda, Sprint 7.3). A promessa de "adicionar sem alterar código" está garantida **no nível do contrato** (`IModule`/`IConnector`/`IAutomation` já existem e já são estáveis), mas o mecanismo de descoberta automática em si (o que tornaria isso verdade na prática) é ⚪ Planejado.

---

## 13. Padrões Arquiteturais

| Padrão | Onde aparece na arquitetura já construída |
|---|---|
| **SOLID — Single Responsibility** | Cada arquivo do Core tem uma única razão para mudar (`RuntimeState` só o vocabulário de estados; `BootPipeline` só a composição das Boot Steps de boot) |
| **SOLID — Open/Closed** | `Pipeline` é fechado para modificação e aberto para extensão: `BootPipeline extends Pipeline {}` reusa 100% do comportamento sem alterar `Pipeline.ts` |
| **SOLID — Liskov Substitution** | Qualquer `PipelineStep` (ou `BaseBootStep`) pode ser registrada em qualquer `Pipeline` sem que este precise saber qual subclasse é |
| **SOLID — Interface Segregation** | `ILifecycle`, `IService`, `IModule`, `IConnector`, `IAutomation` são pequenas e compostas por herança de interface, em vez de uma interface única "faz tudo" |
| **SOLID — Dependency Inversion** | `PlatformRegistry` depende de tipos (`ModuleRegistry`, `ConnectorRegistry`, `AgentRegistry` via `import type`), nunca instanciando o que não precisa — o `AgentRegistry` da aplicação atual é referenciado só por tipo, sem integração real |
| **Inversão de dependência entre camadas** | A nova plataforma nunca importa da aplicação atual, e vice-versa — dependência zero verificada a cada Sprint |
| **Baixo acoplamento** | Nenhum `*Events.ts` cria seu próprio barramento; toda comunicação real futura passa pelo `EventBus` único (§10) |
| **Alta coesão** | Cada módulo (`src/modules/*`) agrupa `Manager`/`Events`/`Models`/`Types` do mesmo domínio, sem vazar para outros módulos |
| **Event-Driven** | `EventBus` já existe e já é funcional na aplicação atual; é o mecanismo formalmente escolhido para toda comunicação assíncrona futura entre Modules/Automation/Connectors |
| **Modularidade** | 12 módulos de negócio já existem como unidades independentes (`src/modules/*`), cada um compilando e existindo sem depender dos outros 11 |

---

## 14. Roadmap da Arquitetura

**Esta tabela é o Roadmap Oficial único da plataforma.** Até a Sprint anterior, `docs/PLATFORM_VISION.md` mantinha sua própria tabela de roadmap, com uma ordem de letras de Épico D–K diferente desta — a divergência foi resolvida nesta Sprint (Documentação 3.0): `docs/PLATFORM_VISION.md` não duplica mais esta tabela, apenas aponta para cá. Qualquer atualização de roadmap a partir de agora é feita **somente aqui**.

| Épico | Nome | Status |
|---|---|---|
| **A** | Fundação | ✅ Concluído |
| **B** | Plataforma Viva | ✅ Concluído |
| **C** | Runtime Operacional | ⚪ Próximo |
| **D** | Dashboard V2 | ⚪ Planejado |
| **E** | Business Hub | ⚪ Planejado |
| **F** | Growth Hub | ⚪ Planejado |
| **G** | Integration Hub | ⚪ Planejado |
| **H** | Operations Hub | ⚪ Planejado |
| **I** | AI Hub | ⚪ Planejado |
| **J** | Marketplace | ⚪ Planejado |
| **K** | Multiempresa | ⚪ Planejado |

---

## 15. Dívidas Arquiteturais

Registro formal de decisões de nomenclatura ou estrutura que já são conhecidas como necessárias, mas cuja execução foi deliberadamente adiada — para que fiquem escritas antes de virarem confusão silenciosa no código. Nenhum item desta seção foi executado; registrar aqui não altera nenhum arquivo TypeScript.

### TECH-001 — Renomear `AgentRegistry` para `OfficeAgentRegistry`; reservar `AIAgentRegistry`

- **Status:** ⚪ Planejado — nenhuma mudança de código feita.
- **Situação:** existe hoje um `AgentRegistry` real e funcional em `src/core/agents/registry/AgentRegistry.ts`, pertencente à aplicação atual — gerencia os agentes visuais do escritório virtual (registro, status `online`/`offline`/`busy`/`idle`, contagem).
- **Conflito:** o AI Hub (§9; `docs/PLATFORM_VISION.md` §3.3) prevê um componente também chamado "Agent Registry" — mas conceitualmente maior e diferente: um catálogo de agentes de IA reais (com Memory, Skills, Capabilities), não de personagens 3D com posição na cena.
- **Por que será necessário:** o nome `AgentRegistry` já está ocupado por um conceito mais estreito (agente-personagem do escritório) do que o que o AI Hub vai precisar (agente-de-IA). Se o AI Hub nascer chamando seu próprio catálogo também de `AgentRegistry`, existirão duas classes com o mesmo nome e propósitos diferentes na mesma base de código — ambíguo tanto para quem lê o código quanto para quem lê esta documentação. Resolver isso antes da colisão acontecer é mais barato do que renomear depois que o AI Hub já tiver consumidores do nome.
- **Decisão registrada:**
  - O `AgentRegistry` atual (aplicação/escritório virtual) será renomeado para **`OfficeAgentRegistry`** — o nome deixa claro que é sobre o escritório visual, não sobre IA.
  - O nome **`AIAgentRegistry`** fica reservado para o catálogo de agentes de IA do AI Hub.
- **Quando será executado:** junto com o início do Épico I (AI Hub) — não antes. Esta Sprint (Documentação 3.0) só registra a decisão.
- **Impacto quando executado:** renomear arquivo e classe (`AgentRegistry.ts` → `OfficeAgentRegistry.ts`, `class AgentRegistry` → `class OfficeAgentRegistry`) e atualizar os pontos que já a importam hoje (`src/core/agents/registry/index.ts`, `src/core/agents/registry/registerAgents.ts` e demais consumidores dentro da aplicação atual) — sem alterar nenhum comportamento, só o nome.

---

## Referência rápida — todos os componentes citados neste documento

`PlatformRuntime` · `RuntimeState` · `Pipeline` · `PipelineStep` · `PipelineContext` · `PipelineResult` · `BootPipeline` · `BaseBootStep` · `InitializeRuntimeStep` · `ValidateRuntimeStep` · `FinalizeRuntimeStep` · `PlatformRegistry` · `ModuleRegistry` · `ServiceRegistry` · `ConnectorRegistry` · `ConnectorManager` · `BaseConnector` · `WorkflowEngine` · `RuleEngine` · `TriggerManager` · `HookManager` · `PolicyManager` · `ModuleLoader` · `ConnectorLoader` · `AutomationLoader` · `BootManager` · `LifecycleManager` · `EventBus` · `ILifecycle` · `IService` · `IModule` · `IConnector` · `IAutomation` · `TaskQueue` · `ExecutionHistory` · `AgentRegistry` (aplicação atual) · `AIProviderFactory`

---

## Glossário

- **Hub** — Agrupamento de módulos por propósito de negócio (Business, Growth, Operations, Integration, AI, Marketplace, Academy).
- **Módulo** — Unidade de negócio ativável/desativável por empresa (ex.: CRM, Blog).
- **Serviço** — Funcionalidade transversal da plataforma, não amarrada a um módulo de negócio específico.
- **Connector** — Ponte de acesso a um sistema externo; único ponto de saída autorizado da plataforma para fora.
- **Pipeline** — Sequência ordenada de etapas (Steps) executadas com um resultado único ao final.
- **Runtime** — Processo que controla o ciclo de vida da plataforma em execução.
- **Workspace** — Ambiente isolado de uma empresa dentro da plataforma.
- **Tenant** — A empresa cliente dona de um Workspace (contexto de multiempresa).
- **Automation** — Motor que orquestra lógica condicional/sequencial entre módulos.
- **Workflow** — Sequência de ações de negócio executada por uma Automation.
- **Agent** — Entidade de IA que executa tarefas de forma autônoma ou assistida.
- **Skill** — Capacidade reutilizável que um Agent pode executar.
- **Capability** — Permissão/limite do que um Agent tem autorização de fazer.
- **Event** — Fato ocorrido na plataforma, publicado no EventBus para quem quiser reagir.
- **Registry** — Catálogo central de instâncias registráveis de um mesmo tipo.
- **Provider** — Implementação concreta de acesso a um serviço externo de IA ou de dados.
- **Boot** — Processo de inicialização da plataforma.
- **Lifecycle** — Conjunto de estados/transições que uma entidade gerenciada percorre (criação, execução, encerramento).
