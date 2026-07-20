# PLATFORM VISION 1.0

**Andreia AI Platform**
Documento oficial de visão arquitetural.

---

## Como ler este documento

Este documento tem dois tipos de conteúdo, marcados explicitamente ao longo do texto:

- 🟢 **Implementado** — já existe como estrutura no código (`src/core`, `src/modules`, `src/shared`), construído nas Sprints 7.1 a B.3. Em todos os casos é *apenas infraestrutura*: contratos, classes vazias e execução de pipeline genérica — nenhuma regra de negócio real ainda, nenhuma integração com o Runtime atual da aplicação.
- ⚪ **Visão** — ainda não existe nenhum código. É a direção que orienta o que será construído a partir daqui.

O objetivo é que este seja um documento honesto: ele não descreve um produto acabado, descreve para onde a arquitetura já construída está apontando.

---

## 1. Objetivo da Plataforma

A **Andreia AI Platform** não é um escritório virtual.

O escritório virtual (a cena 3D com os agentes andando entre mesas, hoje implementada em `src/game/`) é **apenas uma interface** — a forma visual de acompanhar o que a plataforma está fazendo. A plataforma em si é maior do que essa interface.

> **A Andreia AI Platform é um Sistema Operacional para Empresas baseado em IA.**

Assim como um sistema operacional não é nenhum aplicativo específico, mas o ambiente que permite instalar, executar e coordenar aplicativos, a Andreia AI Platform não é nenhum módulo específico (CRM, Blog, Ads...), mas o ambiente que permite a uma empresa ligar os módulos de que precisa, coordenados por agentes de IA.

**Princípio de modularidade:** cada empresa usa somente os módulos que quiser. Nenhum módulo é obrigatório além do núcleo da plataforma (`Platform`, `PlatformRuntime`, os Registries). Ativar um módulo não deve exigir ativar nenhum outro.

**Critério de entrada de qualquer funcionalidade** (herdado de `docs/MASTER_ROADMAP.md`, mantido como principal filtro de priorização): toda funcionalidade precisa **aumentar faturamento**, **reduzir trabalho operacional**, **melhorar a tomada de decisão** ou **aumentar a produtividade da IA**. O que não atende a nenhum desses critérios não entra em desenvolvimento.

**Cliente piloto:** JardFlores Decor é o ambiente real onde a plataforma é validada antes de expandir para outras empresas. Todo o roadmap abaixo é lido com esse filtro: o que ainda não serve à JardFlores Decor não é prioridade, mesmo que esteja no mapa de longo prazo.

---

## 2. Arquitetura

### 2.1 Duas camadas, hoje desconectadas de propósito

A plataforma tem, neste momento, duas camadas de código que **coexistem sem se integrar** — isso é intencional, não um descuido:

| Camada | Onde vive | O que faz hoje |
|---|---|---|
| **Aplicação atual** | `src/game/`, `src/core/agents`, `src/core/events`, `src/core/queue`, `src/core/dispatcher`, `src/core/store`, `src/core/bootstrap` | O escritório virtual funcional: `OfficeScene`, `OfficeBrain`, `Scheduler`, `Navigator`, `AgentWorker`, `EventBus`, `AgentRegistry`, `TaskQueue`, `AgentSimulator`. É real, roda, e **não deve ser alterada** enquanto a nova plataforma não estiver pronta para assumir seu lugar. |
| **Fundação da nova plataforma** | `src/core/platform`, `src/core/pipeline`, `src/core/connectors`, `src/core/automation`, `src/modules`, `src/shared` | 🟢 A infraestrutura construída nas Sprints 7.1–B.3: contratos, runtime, pipeline de boot. Compila, mas **nenhum ponto de entrada real da aplicação a chama ainda**. |

A junção dessas duas camadas — o momento em que `PlatformRuntime` passa a ser o que efetivamente inicializa a aplicação, e o escritório vira uma interface *sobre* a plataforma em vez de a própria aplicação — é um marco de roadmap explícito (ver Épico C), não um efeito colateral de nenhuma Sprint futura "pequena".

### 2.2 A fundação já construída (🟢 Implementado)

```
src/core/
├── platform/
│   ├── Platform.ts, Core.ts               → composição raiz (ILifecycle)
│   ├── PlatformConfig.ts                  → configuração (dado passivo)
│   ├── PlatformRegistry.ts                → composição de registries (não instanciados)
│   ├── ModuleRegistry.ts, ServiceRegistry.ts
│   ├── PlatformModules.ts, PlatformEvents.ts
│   ├── RuntimeState.ts                    → CREATED..ERROR
│   ├── PlatformRuntime.ts                 → controla o ciclo de vida real (init/start/stop/dispose)
│   ├── BootManager.ts, LifecycleManager.ts
│   ├── ModuleLoader.ts, ConnectorLoader.ts, AutomationLoader.ts
│   ├── BootPipeline.ts                    → especialização de Pipeline para o boot
│   └── steps/                             → InitializeRuntimeStep, ValidateRuntimeStep, FinalizeRuntimeStep
├── pipeline/
│   ├── Pipeline.ts                        → executa etapas de verdade (síncrono)
│   ├── PipelineStep.ts, PipelineContext.ts, PipelineResult.ts
├── connectors/
│   ├── BaseConnector.ts, ConnectorManager.ts, ConnectorRegistry.ts
├── automation/
│   ├── WorkflowEngine.ts, RuleEngine.ts, TriggerManager.ts, HookManager.ts, PolicyManager.ts
└── (departments/, memory/, metrics/, scheduler/, logs/, types/ — placeholders vazios pré-existentes)

src/modules/
└── crm/ business/ agenda/ marketing/ communication/ analytics/ fiscal/ hr/
    projects/ documents/ academy/ marketplace/   (cada um: Manager, Events, Models, Types)

src/shared/
└── interfaces/  → ILifecycle, IService, IModule, IConnector, IAutomation
```

**O que já funciona de verdade** (não é só estrutura vazia): `Pipeline.execute()` percorre etapas registradas, em ordem, de forma síncrona, trata exceções parando a execução e populando `errors[]`, e devolve um `PipelineResult` com `success`/`duration`. `PlatformRuntime` já implementa a máquina de estados completa (`CREATED → INITIALIZING → INITIALIZED → STARTING → RUNNING → STOPPING → STOPPED`, com desvio para `ERROR`), e seu `init()` já chama `BootPipeline.execute()`, que já roda três etapas reais (`InitializeRuntimeStep`, `ValidateRuntimeStep`, `FinalizeRuntimeStep`) — hoje sem nenhuma lógica dentro delas.

**O que ainda é só contrato:** todo o conteúdo de `src/modules/*` (nenhum módulo de negócio tem uma linha de lógica), `src/core/connectors/*` (nenhum conector real), `src/core/automation/*` (nenhum workflow real), e os três Loaders (`ModuleLoader`, `ConnectorLoader`, `AutomationLoader` retornam sempre lista vazia).

### 2.3 Os cinco contratos que amarram tudo

Toda peça futura da plataforma — módulo, conector, motor de automação — vai implementar um destes cinco contratos (`src/shared/interfaces`), para que o `PlatformRegistry` e os Loaders consigam tratá-las de forma genérica:

- **`ILifecycle`** (`init/start/stop`) — qualquer coisa com ciclo de vida gerenciado.
- **`IService`** (`id`) — qualquer coisa registrável.
- **`IModule`** (`IService + ILifecycle + name`) — todo módulo de negócio.
- **`IConnector`** (`IService + ILifecycle + isConnected()`) — todo conector externo.
- **`IAutomation`** (`IService + ILifecycle`) — todo motor de automação.

---

## 3. Hubs

A plataforma é organizada em **cinco Hubs**. Um Hub não é uma pasta de código — é um agrupamento de propósito de negócio que reúne vários módulos. Um módulo pertence a exatamente um Hub.

### 3.1 Business Hub ⚪

Tudo que uma empresa precisa para operar no dia a dia.

| Módulo do Hub | Módulo já escaffoldado (`src/modules`) |
|---|---|
| CRM | 🟢 `crm` |
| Financeiro | 🟡 `fiscal` cobre a parte fiscal; falta o módulo financeiro/caixa em si |
| Vendas | ⚪ ainda sem scaffold — candidato à próxima leva de módulos |
| Agenda | 🟢 `agenda` |
| Projetos | 🟢 `projects` |
| Documentos | 🟢 `documents` |
| Equipe | 🟢 `hr` |

O módulo `business` (já escaffoldado) não é um dos sete acima — ele é o módulo de **dados gerais da empresa** (perfil, cadastro, configuração) que sustenta o Hub inteiro por baixo.

### 3.2 Growth Hub ⚪

Responsável por todo o crescimento da empresa: aquisição, conteúdo, tráfego e conversão.

Blog · SEO · Keyword Research · Google Search Console · Google Analytics · Google Ads · Meta Ads · Pinterest · Pinterest Ads · Google AdSense · Bing Webmaster Tools · Google Business Profile · Social Media · Email Marketing · Landing Pages · Web Stories · YouTube · Conversão · Performance · Indexação

Nenhum desses vinte itens é hoje um módulo em `src/modules` — são todos ⚪ visão. Os módulos escaffoldados `marketing`, `communication` e `analytics` são os pontos de entrada mais prováveis para agrupar esses vinte itens quando a implementação começar (ex.: `marketing` absorve Ads/Landing Pages/Web Stories, `communication` absorve Social Media/Email Marketing/YouTube, `analytics` absorve Analytics/Performance/Indexação/Conversão) — mas isso é uma decisão de implementação, não deste documento.

O único pedaço do Growth Hub que já tem uma semente de código é o **Blog**: `src/core/agents/blog/` (`BlogAgent`, `BlogAgentExecutor`, `BlogOutputService`) já existe na camada da aplicação atual — é o precedente real mais próximo de como um módulo de Growth deve se comportar quando ganhar lógica de verdade.

### 3.3 AI Hub ⚪

O hub responsável pelos agentes de IA em si — ainda **não implementar nada aqui**, é vocabulário para orientar o design futuro:

- **AI Runtime** — camada que abstrai qual provedor de IA está sendo usado (continuação natural do `AIProviderFactory` que já existe em `src/core/ai/`).
- **Agent Runtime** — executa agentes (planejamento, execução de ferramentas, resposta).
- **Agent Registry** — catálogo de agentes disponíveis na plataforma.
- **Agent Factory** — cria instâncias de agente a partir de uma definição/configuração.
- **Agent Memory** — memória de curto e longo prazo por agente.
- **Agent Scheduler** — decide quando/com que frequência um agente roda.
- **Agent Communication** — troca de mensagens entre agentes.
- **Agent Skills** — capacidades reutilizáveis que um agente pode ter.
- **Agent Capabilities** — o que um agente tem permissão de fazer.

⚠️ **Nota de nomenclatura importante — dívida arquitetural TECH-001:** já existe um `AgentRegistry` funcional hoje, em `src/core/agents/registry/AgentRegistry.ts` — mas ele pertence à camada da **aplicação atual** (o escritório virtual: agentes visuais andando pela cena). O **Agent Registry do AI Hub** descrito acima é um conceito diferente e maior (catálogo de agentes de IA reais, não personagens 3D). A decisão já está registrada formalmente como **TECH-001** em `docs/02-SYSTEM_ARCHITECTURE.md` §15: o `AgentRegistry` atual será renomeado para `OfficeAgentRegistry`, e o nome `AIAgentRegistry` fica reservado para este componente do AI Hub — execução prevista para o início do Épico I, não antes.

### 3.4 Integration Hub ⚪

Responsável por toda comunicação com sistemas externos: WordPress, WhatsApp, Meta, Google, Pinterest, OpenAI, Claude, Gemini, Microsoft, n8n, Zapier.

Toda integração futura implementa `IConnector` e é gerenciada pelo `ConnectorManager`/`ConnectorRegistry` (`src/core/connectors/`, hoje vazios). Dois pontos de continuidade já existem na aplicação atual: `src/core/ai/AIProviderFactory.ts` já antecipa provedores `openai` e `claude` (hoje comentados, caindo em `MockAIProvider`), e a pasta `src/providers/{openai,claude,gemini,mock}` já reserva o lugar para cada um. O Integration Hub é a generalização desse padrão para além de provedores de IA — cobrindo também WordPress, WhatsApp, redes de Ads etc.

### 3.5 Operations Hub ⚪

A espinha dorsal operacional, invisível para o usuário final: Automações, Workflows, Aprovações, Monitoramento, Auditoria, Logs, Filas, Eventos.

Continuidade direta com o que já existe:

| Item do Hub | Fundação já existente |
|---|---|
| Automações / Workflows | 🟢 `src/core/automation/` (`WorkflowEngine`, `RuleEngine`, `TriggerManager`, `HookManager`, `PolicyManager`) |
| Filas | `src/core/queue/` (`TaskQueue`, já funcional na aplicação atual) |
| Eventos | `src/core/events/` (`EventBus`, já funcional — continuará sendo o único barramento oficial) |
| Logs / Monitoramento | `src/core/logs/`, `src/core/metrics/` (placeholders vazios pré-existentes) |
| Auditoria | `src/core/history/` (`ExecutionHistory`, já existe na aplicação atual) |
| Aprovações | ⚪ sem fundação ainda — item novo |

---

## 4. Módulos

Um módulo é a unidade de negócio ativável/desativável por empresa. Hoje, 12 módulos já têm scaffold estrutural em `src/modules/` (🟢): `crm`, `business`, `agenda`, `marketing`, `communication`, `analytics`, `fiscal`, `hr`, `projects`, `documents`, `academy`, `marketplace`.

Cada um segue o mesmo contrato: `Manager.ts` (implementa `IModule`), `Events.ts` (definição de tipos de evento, nunca um barramento próprio — eventos reais passam pelo `EventBus`), `Models.ts`, `Types.ts`, `index.ts`.

`academy` e `marketplace` não pertencem a nenhum dos cinco Hubs definidos acima da forma como estão hoje:
- **Academy** aponta para um futuro hub de treinamento/conteúdo educacional para os usuários da plataforma — candidato a virar hub próprio se crescer.
- **Marketplace** aponta para um ecossistema de plugins/extensões de terceiros — e já tem fundação técnica prevista: a generalização do Pipeline feita para suportar múltiplos pipelines (`LifecyclePipeline`, `ShutdownPipeline`, `UpdatePipeline`, `MigrationPipeline`, **`PluginPipeline`**, **`InstallPipeline`**) foi desenhada de propósito pensando nesse cenário.

---

## 5. Dashboard V2

O escritório virtual (`src/game/`) deixa de ser a aplicação inteira e passa a ser **o centro do Dashboard** — o widget principal, não a tela inteira.

A base visual já existe, parcialmente, em `src/components/dashboard/` (`sidebar/`, `center/`, `rightpanel/`, `footer/`, `header/`, `history/`, `logs/`, `cards/`) — o Dashboard V2 é a evolução dirigida dessa estrutura, não uma reconstrução do zero:

- **Barra lateral** — navegação entre Hubs e módulos ativos da empresa (não fixa: só aparece o que está ativado).
- **Escritório maior** — a cena 3D (`OfficeScene`) ocupa mais espaço de tela, deixa de dividir atenção com painéis desnecessários quando não há nada relevante a mostrar.
- **Painel direito** — contexto do que está selecionado no momento: um agente, uma tarefa, um módulo.
- **Barra inferior** — status rápido: quantos agentes ativos, quantas tarefas na fila, saúde geral do runtime.
- **Widgets** — blocos plugáveis por módulo (ex.: um widget de "últimos leads" para o CRM, um widget de "posts agendados" para o Blog) — cada módulo pode declarar os seus.
- **Indicadores** — KPIs do negócio em tempo real (ligados ao critério de priorização do §1: faturamento, produtividade).
- **Tarefas** — fila de trabalho dos agentes, visível e priorizável por humanos.
- **Notificações** — eventos que exigem atenção humana (aprovações pendentes, erros, marcos atingidos).

---

## 6. Agentes ⚪

Visão de agentes especializados — nenhum código nesta etapa. Cada agente abaixo é primariamente do Hub indicado, mas pode consumir dados de outros:

| Agente | Hub principal |
|---|---|
| CEO Agent | transversal — visão consolidada de todos os Hubs |
| Marketing Agent | Growth |
| SEO Agent | Growth |
| Copywriter Agent | Growth |
| Designer Agent | Growth |
| Publisher Agent | Growth / Operations (publica e depende de aprovação) |
| CRM Agent | Business |
| Finance Agent | Business |
| Analytics Agent | Growth / Operations |
| Support Agent | Business |
| Developer Agent | Operations (manutenção da própria plataforma) |

Todo agente futuro roda sobre o **AI Hub** (§3.3) — nenhum agente concreto é implementado enquanto `Agent Runtime`/`Agent Factory` não existirem.

---

## 7. Blog — visão completa do módulo

O fluxo completo, do zero à monetização:

1. **Pesquisa** — identificar tema, intenção de busca, concorrência.
2. **Estrutura SEO** — definir palavra-chave alvo, cluster, esqueleto de H1-H2-H3 antes de escrever.
3. **Escrita** — geração do conteúdo pelo Copywriter Agent, com a estrutura SEO como restrição.
4. **Imagens** — geração/curadoria de imagens alinhadas ao conteúdo.
5. **Vídeos** — quando aplicável, geração ou embutimento de vídeo relacionado.
6. **Publicação** — envio ao destino real (ex.: WordPress, via Integration Hub).
7. **Distribuição** — propagação para Social Media, Email Marketing, Pinterest.
8. **Atualização** — revisão periódica de posts antigos (SEO decai; conteúdo precisa de manutenção).
9. **Monetização** — AdSense, afiliados, ou conversão direta, medidos de volta para os Indicadores do Dashboard.

Fundação já existente: `src/core/agents/blog/BlogAgent.ts`, `executor/BlogAgentExecutor.ts`, `output/BlogOutputService.ts` — hoje na camada da aplicação atual, é o protótipo mais próximo de como esse fluxo deve se materializar em código quando o módulo Blog do Growth Hub for implementado de verdade.

---

## 8. Ads ⚪

Google Ads, Meta Ads, Pinterest Ads e Google AdSense — cada um como um módulo do Growth Hub, todos seguindo o mesmo papel para a IA:

- **Google Ads / Meta Ads / Pinterest Ads** — a IA propõe e ajusta campanhas (segmentação, orçamento, criativos), mas a ativação de gasto real de mídia é sempre um ponto de **Aprovação** explícita (Operations Hub) antes de ir ao ar — nenhum agente tem autonomia para gastar dinheiro da empresa sem checkpoint humano.
- **Google AdSense** — o inverso: mede receita gerada pelo conteúdo (ligação direta com a etapa "Monetização" do Blog, §7), sem necessidade de aprovação (é leitura, não gasto).

Todas essas integrações dependem do Integration Hub (§3.4) para autenticação e chamadas às APIs de cada plataforma.

---

## 9. SEO ⚪

Visão para os pilares técnicos e de conteúdo de SEO:

- **Search Console** — dados de indexação e performance de busca real (via Integration Hub, Google).
- **Analytics** — comportamento de tráfego, ligado aos Indicadores do Dashboard.
- **Indexação** — garantir que páginas publicadas sejam encontradas pelos buscadores.
- **Core Web Vitals** — performance técnica do site como fator de ranqueamento.
- **EEAT** (Experience, Expertise, Authoritativeness, Trustworthiness) — sinal de qualidade/confiança de conteúdo que a IA precisa respeitar ao gerar texto.
- **Schema** — dados estruturados para melhorar como o conteúdo aparece na SERP.
- **SERP** — monitoramento de posição e concorrência nos resultados de busca.
- **Backlinks** — construção e monitoramento de links externos.
- **Palavras-chave** — pesquisa e priorização (alimenta a etapa "Pesquisa" do Blog, §7).
- **Clusters** — agrupamento temático de conteúdo para reforçar autoridade em um assunto.
- **NLP** — análise semântica de conteúdo (próprio e da concorrência).
- **Canibalização** — detectar quando dois conteúdos próprios competem pela mesma palavra-chave.

---

## 10. Roadmap de longo prazo

**O roadmap oficial da plataforma vive em um único lugar: `docs/02-SYSTEM_ARCHITECTURE.md` §14.** Até a Sprint anterior, este documento mantinha sua própria tabela de roadmap, com uma ordem de Épicos D–K diferente da usada em `02-SYSTEM_ARCHITECTURE.md` — essa divergência foi identificada e resolvida na Sprint "Documentação 3.0": a partir de agora existe apenas uma tabela de roadmap em toda a documentação, para que as duas nunca mais possam divergir silenciosamente.

Resumo (ver a tabela completa, com descrição de foco de cada Épico, em `docs/02-SYSTEM_ARCHITECTURE.md` §14):

**A** Fundação ✅ · **B** Plataforma Viva ✅ · **C** Runtime Operacional ⚪ Próximo · **D** Dashboard V2 · **E** Business Hub · **F** Growth Hub · **G** Integration Hub · **H** Operations Hub · **I** AI Hub · **J** Marketplace · **K** Multiempresa — todos ⚪ Planejado.

---

## 11. O que este documento não é

Este documento não substitui nenhuma Sprint futura — nenhuma linha de código deve ser escrita só porque está descrita aqui. Cada Hub, módulo ou integração citada acima ainda precisa da sua própria Sprint de implementação, seguindo o mesmo padrão disciplinado usado até aqui: infraestrutura antes de lógica, contratos antes de integração, validação de compilação (e, quando há lógica real, validação de comportamento) a cada etapa.

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
