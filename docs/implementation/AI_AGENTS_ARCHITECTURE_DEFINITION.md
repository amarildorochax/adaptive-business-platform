# AI Agents Architecture Definition

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento define a arquitetura oficial do subsistema AI Agents da Adaptive Business Platform. Nenhum código foi criado. Nenhum arquivo TypeScript foi criado. Nenhuma arquitetura já aprovada foi alterada.*

---

## 0. Enquadramento

### 0.1 Nota sobre a Base Obrigatória

Mesma situação já resolvida durante a Phase 6 e reaplicada na Runtime Architecture Definition: três dos dez nomes citados não correspondem a arquivo existente. Mesmas substituições já registradas, reaplicadas aqui sem nova aprovação:

| Nome citado | Fonte real usada |
|---|---|
| `FOUNDATION_ARCHITECTURE.md` | Os quatro catálogos de Volume I (`EVENT_CATALOG.md`, `COMMAND_CATALOG.md`, `QUERY_CATALOG.md`, `DOMAIN_OWNERSHIP_MATRIX.md`) e `SPRINT_01_CORE_FOUNDATION_PLAN.md` |
| `INFRASTRUCTURE_ARCHITECTURE.md` | `docs/implementation/INFRASTRUCTURE_ARCHITECTURE_DEFINITION.md` |
| `PLATFORM_SERVICES_ARCHITECTURE.md` | `docs/implementation/PLATFORM_SERVICES_ARCHITECTURE_DEFINITION.md` |
| `AI_CORE_ARCHITECTURE_DEFINITION.md`, `BUSINESS_HUB_ARCHITECTURE.md`, `AUTOMATION_ENGINE.md`, `PHASE_6_FINAL_VALIDATION.md`, `RUNTIME_ARCHITECTURE_DEFINITION.md`, `RUNTIME_FINAL_VALIDATION.md`, `VOLUME_II_FOUNDATIONAL_DECISIONS.md` | Já correspondiam exatamente |

### 0.2 Este Documento Não Redefine o Agent Framework, Nem o Multi-Agent System

Esta é a decisão de design mais importante deste documento, resolvida explicitamente antes de qualquer conteúdo ser escrito: `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seções 7.4 e 7.9, já formaliza **Agent Framework (Component 18)** e **Multi-Agent System (Component 23)** como parte integrante e já aprovada do AI Core, ambos implementados em `@abp/ai`. Aqueles componentes já possuem, internamente: `AgentContract` (dezessete elementos), `AgentLifecycleState` (nove estágios), o ciclo de Reasoning (Component 19), o modelo de Planning (Component 20), a Memória de Agente (Component 16), e a coordenação Multi-Agente mediada exclusivamente pelo Orchestrator (`MultiAgentRelationship`, nunca referência direta entre Agentes — auditado sem violação em `AI_CORE_INTEGRATION_ARCHITECTURAL_AUDIT.md`, Seção 5).

Este documento **não redefine, não duplica, e não substitui** nenhum desses conceitos. Ele define, em vez disso, exclusivamente a **camada de consumo externo** — como Runtime, Automation Engine, e Business Hubs solicitam uma capacidade apoiada por Agente ao AI Core, exclusivamente através do contrato externo já publicado (AI Hub), e como o resultado dessa solicitação é representado do lado de fora do AI Core. É a mesma relação já formalizada entre `AUTOMATION_ENGINE.md` e o AI Hub (Capítulo 12: "o Automation Engine... trata o resultado retornado como um valor estruturado... nunca reinterpretado"), e entre `RUNTIME_ARCHITECTURE_DEFINITION.md` e o AI Hub (Seção 9), agora formalizada como um domínio de consumo próprio, dado seu peso crescente na plataforma.

Cada seção deste documento que trata de "ciclo de vida do agente", "planejamento", "tomada de decisão", "memória operacional", ou "coordenação entre agentes" — todos itens do Escopo desta Sprint — responde explicitamente **onde aquele conceito já vive** (sempre dentro do AI Core, Componentes 16, 18, 19, 20 ou 23) e **o que este documento acrescenta** (sempre uma representação externa e opaca daquele conceito, nunca uma segunda implementação).

---

## 1. Propósito Arquitetural dos AI Agents

AI Agents é a camada que representa, para o restante da plataforma, a capacidade de delegar uma tarefa a um Agente já definido pelo Agent Framework do AI Core, e de rastrear essa delegação do início ao resultado — sem jamais implementar, ela mesma, a lógica de raciocínio, de planejamento, de memória, ou de coordenação que já pertence ao AI Core. Runtime, Automation Engine, e Business Hubs não precisam conhecer `AgentContract`, `AgentLifecycleState`, ou `MultiAgentRelationship` para solicitar uma capacidade apoiada por Agente — eles consomem AI Agents, que por sua vez consome exclusivamente o contrato externo do AI Hub.

---

## 2. Bounded Context

**Pertence a AI Agents**: Agent Capability Request, Agent Delegation Record, Agent Task Result, Agent Oversight Checkpoint — todos artefatos de representação externa, nunca a implementação interna do que representam.

**Não pertence a AI Agents, e permanece exclusivamente do AI Core**: Agent (Component 18, `AgentContract`, `AgentLifecycleState`), Reasoning (Component 19), Planning (Component 20), Memory (Component 16), Multi-Agent System (Component 23, `MultiAgentRelationship`, `MultiAgentDefinition`). Nenhum desses onze — na verdade, cinco — componentes é acessado diretamente por este documento ou pela camada que ele define.

**Não pertence a AI Agents, e permanece exclusivamente de cada domínio de destino**: Regra de negócio de qualquer Business Hub; Workflow, Trigger, Condition, Action do Automation Engine; Execution Context e Dispatch do Runtime.

---

## 3. Responsabilidades

- Representar, para Runtime, Automation Engine, e Business Hubs, a capacidade de solicitar uma tarefa apoiada por Agente, sem que nenhum desses domínios precise conhecer a estrutura interna do Agent Framework.
- Registrar a delegação de uma tarefa — quando foi solicitada, a qual finalidade, e qual foi seu resultado — como um Fato externo, nunca como a execução do Agente em si.
- Aplicar um checkpoint de Human Oversight sobre todo resultado de delegação antes que ele produza qualquer efeito em outro domínio, mesmo princípio já central a `AI_MANIFESTO.md` e já aplicado em `AUTOMATION_ENGINE.md` (Human Approval When Needed) e em `PHASE_5_BUSINESS_HUBS_ARCHITECTURE_DEFINITION.md` (campo `confirmed` em cada `*AIAssist.ts`).
- Nunca decidir, planejar, raciocinar, coordenar, ou manter memória por conta própria — cada uma dessas capacidades é sempre solicitada ao AI Core, nunca reimplementada.

---

## 4. Componentes Internos

Conjunto deliberadamente pequeno, proporcional ao fato de AI Agents ser uma camada de representação externa, nunca um domínio de execução ou de inteligência próprio — mesmo critério de restrição já aplicado ao Runtime (6 componentes) e justificado pela ausência de autoridade Volume I pré-existente para este conceito específico:

| Componente | Responsabilidade |
|---|---|
| **Agent Capability Manager** | Ponto de entrada único de toda solicitação de capacidade apoiada por Agente, equivalente em função a cada Manager central já descrito nos documentos anteriores — não contém lógica de negócio, de automação, ou de inteligência. |
| **Delegation Coordinator** | Cria e mantém o Agent Delegation Record de uma solicitação, encaminhando-a ao contrato externo do AI Hub e associando-a ao domínio solicitante (Runtime, Automation Engine, ou um Business Hub), sempre por identificador opaco. |
| **Task Result Handler** | Recebe o resultado estruturado retornado pelo AI Hub e o expõe ao domínio solicitante como Agent Task Result — nunca reinterpretando, expandindo, ou validando semanticamente esse resultado, mesma disciplina já exigida de `ActionAIInvocation.ts` no Automation Engine. |
| **Oversight Gate** | Aplica o checkpoint de Human Oversight sobre todo Agent Task Result antes de sua liberação ao domínio solicitante, quando a finalidade da delegação já exige confirmação — nunca liberando silenciosamente um resultado de alto impacto. |

Nenhum destes componentes é implementado por este documento — permanecem, nesta etapa, exclusivamente conceituais.

---

## 5. Contratos Públicos (Conceituais)

Nenhum contrato TypeScript é criado por este documento. Descritos apenas em nível conceitual:

- **Agent Capability Request** — identificador do domínio solicitante (Runtime, Automation Engine, ou um Business Hub, sempre opaco), finalidade da solicitação, e momento do pedido.
- **Agent Delegation Record** — o registro de que uma solicitação foi encaminhada ao AI Hub, com identificador de correlação (propagável ao Execution Context do Runtime, quando aplicável) e estado da delegação.
- **Agent Task Result** — o resultado estruturado retornado, o grau de confiança associado, e se já foi liberado pelo Oversight Gate.

---

## 6. Ciclo de Vida do Agente

**Onde já vive**: `AgentLifecycleState` (Component 18, `@abp/ai`) já define os nove estágios completos do ciclo de vida técnico de um Agente — Criação, Registro, Inicialização, Execução, Pausa, Retomada, Atualização, Desativação, Aposentadoria. Este documento não redefine nenhum desses estágios.

**O que este documento acrescenta**: uma visão externa e muito mais simples — o ciclo de vida de uma *delegação* (Requested → Delegated → InProgress → Completed | Failed), nunca do Agente em si. Uma delegação pode estar "Completed" enquanto o Agente que a processou permanece, do ponto de vista do AI Core, em seu próprio estágio "Execução" atendendo a outras solicitações — os dois ciclos de vida existem em níveis de abstração completamente distintos, mesma relação já estabelecida entre o Execution Lifecycle do Runtime e o Execution do Automation Engine.

---

## 7. Planejamento

**Onde já vive**: Planning (Component 20, `@abp/ai`) já define `PlanningState`, `PlanningGoal`, e `PlanningStep` — a decomposição de um objetivo em subtarefas executáveis. Este documento não redefine, e não invoca diretamente, nenhum desses tipos.

**O que este documento acrescenta**: quando uma Agent Capability Request exige planejamento, essa exigência é apenas mais uma finalidade possível dentro do `purposeDescription` opaco de `Agent Capability Request` — o AI Hub decide, internamente, se e como acionar o Planning já existente. AI Agents nunca vê, nunca lê, e nunca representa um `PlanningStep` individual.

---

## 8. Tomada de Decisão

**Onde já vive**: Reasoning (Component 19, `@abp/ai`) já define o ciclo de cinco etapas (Análise, Síntese, Inferência, Validação, Explicabilidade) e produz `ReasoningConclusion`, sempre com confiança probabilística, nunca certeza absoluta. Este documento não redefine esse ciclo.

**O que este documento acrescenta**: `Agent Task Result.confidence` é a única representação externa do grau de certeza de uma conclusão — um valor numérico opaco, nunca uma reconstrução da lógica de Reasoning que o produziu. AI Agents nunca decide por conta própria; ele apenas representa que uma decisão já foi produzida em outro lugar.

---

## 9. Memória Operacional do Agente

**Onde já vive**: Memory (Component 16, `@abp/ai`) já define `MemoryEntry`, `MemoryScope`, e `MemoryOwnership` — memória de curta e de longa duração, sempre derivada de Evento, de Read Model, ou de Conhecimento já catalogados, nunca uma fonte de verdade paralela. Este documento não redefine, e não acessa diretamente, nenhum `MemoryEntry`.

**O que este documento acrescenta**: nada de estrutural. AI Agents não mantém nenhuma memória própria — cada Agent Delegation Record é autocontido, e qualquer continuidade de contexto entre solicitações sucessivas é responsabilidade exclusiva da Memória já gerida internamente pelo AI Core.

---

## 10. Coordenação entre Múltiplos Agentes

**Onde já vive**: Multi-Agent System (Component 23, `@abp/ai`) já define `MultiAgentDefinition`, `MultiAgentRelationship` (mediada exclusivamente por `"MediatedByOrchestrator"`, `"SharedWorkflow"`, ou `"SharedRecord"` — nunca referência direta entre Agentes), e `MultiAgentSharedContext`. Este princípio — "Agents Never Coordinate Themselves" — já foi auditado sem violação em `AI_CORE_INTEGRATION_ARCHITECTURAL_AUDIT.md`, Seção 5, e permanece, sem exceção, o mais rigoroso desta plataforma.

**O que este documento acrescenta**: **nada**. AI Agents nunca coordena Agente algum, nunca cria ou lê um `groupId`, e nunca modela relação entre dois Agentes. Quando uma Agent Capability Request envolve múltiplos Agentes colaborando, essa colaboração é decidida e mediada inteiramente pelo Orchestrator dentro do AI Core — AI Agents apenas recebe, ao final, um único Agent Task Result consolidado, exatamente como qualquer outro consumidor externo do AI Hub.

---

## 11. Comunicação entre Agentes

**Nunca existe fora do AI Core.** Nenhum Agente se comunica com outro através de nenhum artefato definido por este documento — toda comunicação entre Agentes, quando existe, acontece inteiramente dentro do AI Core, mediada pelo Orchestrator, conforme já fixado em `AGENT_FRAMEWORK.md`, Capítulo 15, e em `AI_CORE_ARCHITECTURE_DEFINITION.md`. AI Agents não define, e nunca definirá, nenhum protocolo de comunicação entre Agentes — essa é, inclusive, uma Restrição explícita desta Sprint.

---

## 12. Delegação de Tarefas

Esta é a função central e genuinamente nova deste documento: formalizar como Runtime, Automation Engine, ou um Business Hub delega uma tarefa a uma capacidade apoiada por Agente. O fluxo é sempre: **Agent Capability Request → Delegation Coordinator → contrato externo do AI Hub → Task Result Handler → Oversight Gate (quando aplicável) → Agent Task Result devolvido ao solicitante.** Em nenhum ponto deste fluxo o solicitante original obtém acesso a `AgentContract`, a `AgentLifecycleState`, ou a qualquer outro tipo interno do AI Core — a delegação é, do início ao fim, mediada por identificador opaco.

---

## 13. Uso do AI Core

Mesma regra já fixada em `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md`, Seção 7, e em `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 9, agora formalizada para AI Agents: **toda solicitação é encaminhada exclusivamente ao contrato externo do AI Hub — nunca a nenhum dos onze componentes internos do AI Core.** Nenhum arquivo desta camada, quando futuramente implementada, importará `@abp/ai`. Consistente com `VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decision 007: AI Agents consome o AI Hub no nível de altitude "contrato externo", nunca no nível "como o subsistema funciona por dentro".

---

## 14. Uso do Automation Engine

AI Agents pode solicitar uma automação ao Automation Engine — por exemplo, quando um Agent Task Result já aprovado pelo Oversight Gate justifica o disparo de um Workflow —, sempre através do contrato já publicado (`GrowthCommand`, `FinCommand`, ou o Evento correspondente que o Automation Engine já está inscrito para consumir), nunca por import de `@abp/automation-engine` além do identificador opaco, e nunca redefinindo Workflow, Trigger, Condition, ou Action. Simetricamente, o Automation Engine já pode invocar AI Agents através de sua própria Action "ExecuteAI" (Sprint 6.3) — a relação entre os dois domínios é bidirecional em uso, mas nunca em propriedade de conceito: nenhum dos dois redefine o outro.

---

## 15. Uso do Runtime

AI Agents é hospedado pelo Runtime da mesma forma que Automation Engine e cada Business Hub já são — uma Agent Capability Request é uma solicitação como qualquer outra, contextualizada pelo Execution Context Manager e encaminhada pelo Dispatcher (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seções 4 e 11). Nenhuma extensão ao `DispatchTargetKind` já fixado em `@abp/runtime` (`"AutomationEngine" | "BusinessHub" | "AIHub"`) é necessária ou proposta por este documento — uma solicitação a AI Agents é, do ponto de vista do Runtime, uma solicitação à categoria já existente `"AIHub"`, já que AI Agents é, em si, um consumidor externo do AI Hub, nunca um quarto tipo de destino.

---

## 16. Uso dos Business Hubs

AI Agents nunca executa Regra de negócio de nenhum Business Hub. Quando um Agent Task Result já aprovado justifica uma mudança de estado em um domínio de negócio — por exemplo, criar uma Opportunity a partir de uma recomendação já confirmada —, essa mudança é sempre solicitada através do Command já publicado daquele Hub (`CRMCommand`, `FinCommand`, etc.), nunca por import de `@abp/crm-hub`, `@abp/communication-hub`, `@abp/finance-hub`, `@abp/analytics-hub`, ou `@abp/growth-hub` além do identificador opaco, e nunca por acesso direto à Entidade interna do Hub.

---

## 17. Human Oversight

O Oversight Gate (Seção 4) é o mecanismo estrutural que preserva, nesta camada, o mesmo princípio Human Oversight já central a `AI_MANIFESTO.md`, já aplicado em `AI_HUB.md`, Capítulo 5, em `AUTOMATION_ENGINE.md` (Human Approval When Needed, ADR-005), e em cada `*AIAssistSuggestion.confirmed` já implementado nos cinco Business Hubs. Todo `Agent Task Result` cuja finalidade já é classificada como de alto impacto — financeiro, jurídico, reputacional, ou qualquer outra já classificada pela política da plataforma — permanece retido pelo Oversight Gate até confirmação humana explícita, nunca liberado silenciosamente ao domínio solicitante.

---

## 18. Limites Arquiteturais

- AI Agents nunca redefine `AgentContract`, `AgentLifecycleState`, Reasoning, Planning, Memory, ou `MultiAgentRelationship` já publicados pelo AI Core.
- AI Agents nunca executa Regra de negócio de nenhum Business Hub.
- AI Agents nunca redefine Workflow, Trigger, Condition, ou Action do Automation Engine.
- AI Agents nunca redefine Execution Context ou Dispatch do Runtime.
- AI Agents nunca define protocolo de comunicação concreto entre Agentes, nem entre si e nenhum outro domínio.
- AI Agents nunca introduz nova dependência entre domínios já existentes.

---

## 19. Governança

Toda mudança estrutural a esta arquitetura segue o mesmo Architecture Decision Flow já fixado em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 11. Nenhuma decisão de tecnologia concreta de comunicação, de hospedagem, ou de persistência é tomada por este documento. Consistente com `VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decision 008 (aprofundamento adiado, não bloqueante): esta arquitetura já opera sobre a base declarativa mínima já aprovada de Agent Framework, Reasoning, Planning, e Multi-Agent System, sem aguardar os aprofundamentos técnicos ainda adiados (`REASONING_ENGINE.md`, `PLANNING_ENGINE.md`, `MULTI_AGENT_SYSTEM.md` prosa).

---

## 20. Observabilidade

Vinculante ao padrão já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 13, e complementar — nunca duplicado — ao já produzido pelo AI Observability (Component 25) internamente ao AI Core, e pelo Runtime Observability Collector já implementado em `@abp/runtime`: volume de Agent Capability Request, latência de delegação, taxa de liberação pelo Oversight Gate versus taxa de retenção para confirmação humana. Nenhum destes sinais duplica o já produzido internamente pelo AI Core — AI Agents observa a delegação; o AI Core observa o raciocínio em si.

---

## 21. Princípios de Escalabilidade

Vinculante aos princípios já fixados em `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 15, e em `AUTOMATION_ENGINE.md`, Capítulo 17 — não redefinidos aqui: escalabilidade horizontal por volume de delegação concorrente; isolamento entre delegações de Tenants distintos; nenhum estado retido localmente entre uma delegação e a próxima (Stateless, mesma disciplina já aplicada a toda a plataforma).

---

## 22. Dependências Permitidas

- Sequenciamento: Foundation → Infrastructure → Platform Services → AI Core → Business Hubs → Automation Engine → Runtime → **AI Agents** (camada de consumo, posicionada após o Runtime, cuja hospedagem é seu caso de uso imediato).
- Consumo do contrato externo do AI Hub, nunca dos onze componentes internos.
- Consumo dos contratos de Command/Event já publicados por qualquer Business Hub, sempre por identificador opaco.
- Consumo dos contratos de Workflow/Command já publicados pelo Automation Engine, sempre por identificador opaco.
- Hospedagem pelo Runtime, através da categoria já existente `"AIHub"` do `DispatchTargetKind`, sem exigir nenhuma extensão àquele tipo.

## 23. Dependências Proibidas

- Import de tipo de qualquer um dos onze componentes internos do AI Core (`@abp/ai`).
- Import de tipo de qualquer um dos cinco pacotes de Business Hub além do identificador opaco.
- Import de tipo de `@abp/automation-engine` além do identificador opaco.
- Import de tipo de `@abp/runtime` além do identificador opaco.
- Implementação de Regra de negócio de domínio.
- Implementação de lógica de raciocínio, de planejamento, de memória, ou de coordenação própria — todas já pertencem ao AI Core.
- Definição de protocolo de comunicação concreto entre Agentes.
- Qualquer tecnologia concreta de hospedagem, transporte, ou persistência.

---

## 24. Conformidade com as Phases Anteriores

| Fase / Arquitetura | Verificação |
|---|---|
| Phase 1 — Foundation | Nenhum novo Command, Evento, ou Query definido |
| Phase 2 — Infrastructure | Observabilidade e escalabilidade vinculadas, não redefinidas |
| Phase 3 — Platform Services | Identity Hub consumido exclusivamente por contrato externo, quando aplicável a autorização de delegação |
| Phase 4 — AI Core | Agent Framework, Reasoning, Planning, Memory, e Multi-Agent System nunca redefinidos — apenas consumidos pelo contrato externo do AI Hub (Seções 0.2, 6–11, 13) |
| Phase 5 — Business Hubs | Nenhuma regra de negócio de nenhum dos cinco Hubs é absorvida |
| Phase 6 — Automation Engine | Nenhum modelo (Workflow, Trigger, Condition, Action, Execution, Retry, Approval) é redefinido |
| Runtime | Hospedagem consumida através da categoria já existente `"AIHub"`, sem exigir extensão |

---

## Approval

| Campo | Valor |
|---|---|
| Status | AI AGENTS ARCHITECTURE DEFINED |
| Version | 1.0 |
| Author | Claude |
