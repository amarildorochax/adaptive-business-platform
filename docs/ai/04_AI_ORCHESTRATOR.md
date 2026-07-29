# 04 — AI Orchestrator

**Adaptive Business Platform · AI Handbook · Documento Técnico Oficial**

Status: Draft
Category: AI Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este capítulo não implementa o Orchestrator, não define API, não especifica tecnologia, e não cria algoritmo. Ele organiza, dentro da estrutura modular do Volume II, as responsabilidades e relações arquiteturais já estabelecidas — de forma completa e Official — em `AI_ORCHESTRATOR.md`. Onde necessário, referencia apenas `AI_MANIFESTO.md`, `AI_GOVERNANCE.md`, `01_AI_VISION.md`, `02_AI_PRINCIPLES.md`, `03_AI_ARCHITECTURE.md` e `AI_ARCHITECTURE.md` (Official).*

---

## 1. Purpose

Este capítulo existe para posicionar o AI Orchestrator dentro da sequência modular do Volume II, conectando-o à visão (`01_AI_VISION.md`), aos princípios (`02_AI_PRINCIPLES.md`) e à topologia (`03_AI_ARCHITECTURE.md`) já estabelecidos — sem introduzir uma segunda especificação do componente. `AI_ORCHESTRATOR.md`, já Official, permanece a única autoridade técnica sobre seus nove componentes internos e seu pipeline de decisão completo.

---

## 2. Responsibilities

O Orchestrator existe para seis capacidades, e nunca para as seis correspondentes, já fixadas em `AI_ORCHESTRATOR.md`, Capítulo 2:

```
              O QUE O ORCHESTRATOR FAZ, O QUE ELE NUNCA FAZ
   ┌───────────────────────────────────────────────────────────┐
   │  Faz:                              Nunca faz:                   │
   │    Coordena                          Executa Regra de negócio        │
   │    Distribui                         Substitui Business Hub                │
   │    Supervisiona                      Altera estado diretamente                  │
   │    Consolida                         Ignora Execution Policy                        │
   │    Protege                           Contorna confirmação humana                          │
   │    Governa                           Oculta seu próprio raciocínio                             │
   └───────────────────────────────────────────────────────────┘
```

Estas seis capacidades são, em suas próprias palavras de origem, "de natureza epistêmica e organizacional, nunca de natureza executiva sobre o domínio de negócio em si" (`AI_ORCHESTRATOR.md`, Cap. 2) — o Orchestrator coordena, encaminha, supervisiona e consolida o *fluxo* de raciocínio (incluindo o gerenciamento de contexto e a aplicação de Execution Policy), nunca o *conteúdo* de negócio sobre o qual esse raciocínio opera.

---

## 3. Position in the Architecture

Dentro da topologia já referenciada em `03_AI_ARCHITECTURE.md`, Seção 2, o Orchestrator ocupa a segunda camada — imediatamente após a Experience Layer, que lhe entrega a solicitação já estruturada, e imediatamente antes da Capability Layer, para a qual ele delega o processamento identificado. Nenhuma solicitação de Usuário chega a qualquer Agente, Skill ou Tool sem primeiro atravessar o Orchestrator; nenhum resultado retorna ao Usuário sem primeiro ser consolidado por ele.

---

## 4. Interactions

Em nível estritamente conceitual — sem protocolo, sem contrato técnico, sem API:

| Interação | Natureza conceitual |
|---|---|
| **Dashboard** | Origem de toda solicitação (via Experience Layer) e destino de toda resposta consolidada (via Response Builder), conforme `AI_ORCHESTRATOR.md`, Cap. 5. |
| **Agent Registry** (Agent Coordinator) | Componente interno do Orchestrator responsável por delegar cada subtarefa já planejada ao Agente mais apropriado — detalhado em `05_AGENT_REGISTRY.md`. |
| **Shared Memory** (Memory Manager) | Componente interno responsável por recuperar e persistir memória relevante, respeitando isolamento absoluto entre Empresas — detalhado em `06_SHARED_MEMORY.md`; aprofundamento técnico dedicado ainda pendente em `MEMORY_OS.md`. |
| **Planning** (Planning Engine) | Componente interno responsável por decompor a Capability selecionada em subtarefas executáveis — detalhado em `07_PLANNING_ENGINE.md`. |
| **Reasoning** | Não é um componente interno do Orchestrator — o raciocínio propriamente dito é sempre delegado ao Agente já selecionado, conforme `AGENT_FRAMEWORK.md`; o Orchestrator coordena *quando* e *qual* Agente raciocina, nunca raciocina em seu próprio lugar. Detalhado em `08_REASONING_ENGINE.md`. |
| **Skill Runtime** | Consumido indiretamente — o Orchestrator delega ao Agente, e é o Agente, nunca o Orchestrator diretamente, quem invoca a Skill (`AGENT_FRAMEWORK.md`, Cap. 13). Detalhado em `09_SKILL_RUNTIME.md`. |
| **Tool System** | Consumido indiretamente através da Skill invocada pelo Agente, nunca diretamente pelo Orchestrator. Detalhado em `10_TOOL_RUNTIME.md`. |
| **Business Hubs** | Alcançados apenas depois que o Execution Policy Engine já aprovou a ação, sempre através do Command Bus já catalogado em `COMMAND_CATALOG.md` — o Orchestrator nunca interage com um Business Hub além desse único ponto de convergência já definido pelo Volume I. |

---

## 5. Decision Boundaries

O critério já fixado em `AI_ORCHESTRATOR.md`, Capítulo 2, permanece a única regra de fronteira: se uma decisão envolve **sequência, prioridade ou consolidação de processamento**, ela pertence ao Orchestrator; se envolve **conteúdo de negócio** — o que uma Invoice deve valer, o que uma Opportunity deve conter —, ela nunca pertence ao Orchestrator.

- **Pertence ao Orchestrator**: qual Capability é acionada, em qual ordem, delegação a qual Agente, consolidação de resultados parciais, aplicação da Execution Policy já vigente.
- **Pertence ao Agente**: o raciocínio específico sobre o contexto delegado, dentro do escopo já concedido — nunca a decisão de *se* deve ser acionado, apenas *como* raciocinar uma vez acionado.
- **Pertence ao Business Hub**: toda verdade de Entidade, toda Regra de negócio, todo estado — o Orchestrator nunca decide o que uma Regra de negócio determina, apenas encaminha a solicitação já aprovada para que o Hub proprietário a processe.
- **Pertence à camada de Governança** (`AI_GOVERNANCE.md`): a definição, aprovação e auditoria de qual Política de execução existe e quando se aplica — o Orchestrator aplica a Política já vigente, mas nunca a define, aprova ou revoga.

---

## 6. Relationship with Volume I

O Orchestrator nunca substitui um Business Hub, nunca altera estado diretamente, e nunca processa Command por conta própria — toda mudança de estado de negócio acontece exclusivamente através do Command Bus, após a Execution Policy e, quando exigida, a confirmação humana já descritas em `03_AI_ARCHITECTURE.md`, Seção 2. A fronteira de Domain Ownership já estabelecida em `DOMAIN_OWNERSHIP_MATRIX.md` permanece absoluta e nunca é atravessada pelo Orchestrator.

---

## 7. Relationship with AI_MANIFESTO

As seis responsabilidades do Orchestrator (Seção 2) derivam diretamente dos princípios já organizados em `02_AI_PRINCIPLES.md` — particularmente `Agents own reasoning` e `Architecture before AI` (Seção 2, Architectural Principles) e `Human oversight is preserved` e `Safety before execution` (Seção 5, Decision-Making Principles). Nenhuma responsabilidade aqui referenciada introduz um princípio que não já exista em `AI_MANIFESTO.md`.

---

## 8. Scope

Este capítulo cobre exclusivamente: o propósito e o posicionamento do Orchestrator dentro da estrutura modular do Volume II, suas responsabilidades em nível conceitual, suas interações conceituais com os demais componentes, e as fronteiras de decisão que o distinguem do Agente, do Business Hub e da Governança.

Este capítulo não cobre, e não tem autoridade para: especificar os nove componentes internos do Orchestrator ou seu pipeline de doze etapas (matéria de `AI_ORCHESTRATOR.md`); definir API, contrato técnico, ou algoritmo de qualquer componente; ou especificar tecnologia.

---

## 9. Future Evolution

Este capítulo é detalhado, em profundidade técnica, pelos capítulos seguintes da estrutura modular, hoje todos já escritos: `05_AGENT_REGISTRY.md` (Agent Coordinator), `06_SHARED_MEMORY.md` (Memory Manager — aprofundamento técnico dedicado ainda pendente em `MEMORY_OS.md`), `07_PLANNING_ENGINE.md` (Planning Engine), `08_REASONING_ENGINE.md` (raciocínio delegado ao Agente), `09_SKILL_RUNTIME.md` e `10_TOOL_RUNTIME.md` (consumidos indiretamente pelo Orchestrator através do Agente), e `11_MULTI_AGENT_SYSTEM.md` (coordenação entre múltiplos Agentes selecionados simultaneamente).

---

## 10. Approval

| Campo | Valor |
|---|---|
| Status | Draft |
| Version | 0.1 |
| Author | Claude |
