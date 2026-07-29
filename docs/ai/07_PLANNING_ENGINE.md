# 07 — Planning Engine

**Adaptive Business Platform · AI Handbook · Documento Técnico Oficial**

Status: Draft
Category: AI Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este capítulo não implementa planejamento, não cria algoritmo, não define heurística, e não define modelo de IA. Ele descreve responsabilidades, limites arquiteturais e relações conceituais, organizando material já estabelecido em `AI_ARCHITECTURE.md`, `AI_ORCHESTRATOR.md` e `AGENT_FRAMEWORK.md`. Onde necessário, referencia `AI_MANIFESTO.md`, `AI_GOVERNANCE.md`, `03_AI_ARCHITECTURE.md`, `04_AI_ORCHESTRATOR.md`, `05_AGENT_REGISTRY.md` e `06_SHARED_MEMORY.md`.*

---

## 1. Purpose

Este capítulo existe para dar à decomposição conceitual de objetivos em planos de execução um lugar próprio na estrutura modular do Volume II. A plataforma já nomeia essa função **Planning Engine**, componente interno do Orchestrator descrito em `AI_ORCHESTRATOR.md`, Capítulos 5 e 8, e conceituado estruturalmente em `AI_ARCHITECTURE.md`, Capítulo 13. Diferente dos capítulos anteriores, este tópico ainda não possuía documento técnico dedicado — `PLANNING_ENGINE.md` estava identificado como pendente em `VOLUME_II_CONSOLIDATION_REPORT.md`, Seção 6. Este capítulo preenche essa posição na estrutura modular, mas continua organizando exclusivamente o que já está descrito nos três documentos citados, sem introduzir algoritmo, heurística ou modelo novo.

---

## 2. Responsibilities

O Planning Engine existe para:

- **Decompor** um objetivo já identificado pela Capability resolvida em subtarefas menores, cada uma pequena o suficiente para ser delegada a um único Agente ou a uma única Skill (`AI_ORCHESTRATOR.md`, Cap. 8).
- **Identificar dependências** entre subtarefas antes de sua execução, garantindo que nenhuma subtarefa dependente seja processada fora de ordem (`AI_ARCHITECTURE.md`, Cap. 13).
- **Priorizar e sequenciar** a execução entre subtarefas candidatas ao processamento simultâneo, respeitando toda dependência já identificada.
- **Replanejar** apenas a porção do plano afetada quando uma subtarefa já em execução produz resultado inesperado, nunca reconstruindo subtarefas já concluídas com sucesso.

O Planning Engine nunca:

- **Executa subtarefas** — ele planeja; a execução pertence ao Agente, à Skill, ou ao fluxo de Command já convergido para o Volume I.
- **Toma decisão final sobre qual Agente processa** — ele produz o plano de subtarefas; a resolução de qual Agente específico atende cada uma pertence ao Agent Registry (`05_AGENT_REGISTRY.md`).
- **Altera estado de negócio** — nenhuma Regra, Entidade ou Command é processado por ele.
- **Substitui o Reasoning Engine** — o Planning Engine decompõe *o que* precisa ser feito; o raciocínio sobre *como* uma subtarefa específica é resolvida pertence exclusivamente ao Agente já delegado.

---

## 3. Planning Model

Um plano, em nível estritamente conceitual, é composto por quatro elementos, já descritos em `AI_ARCHITECTURE.md`, Capítulo 13, e `AI_ORCHESTRATOR.md`, Capítulo 8 — nenhuma estrutura de dado ou algoritmo é definida aqui:

- **Objetivo** — a representação explícita do resultado que a solicitação deseja alcançar, sempre identificado antes de qualquer decomposição.
- **Subtarefas** — as unidades menores em que o objetivo é decomposto, cada uma delegável de forma independente.
- **Dependências** — a relação de precedência real entre subtarefas, identificada explicitamente antes da execução.
- **Restrições** — o plano, uma vez construído, é anotado com a política de execução aplicável a cada subtarefa relevante; essa anotação pertence a um componente distinto, o Execution Policy Engine (`AI_ORCHESTRATOR.md`, Cap. 5), nunca ao próprio Planning Engine.

```
              PLANEJAMENTO DE UMA SOLICITAÇÃO COMPLEXA
   ┌───────────────────────────────────────────────────────────┐
   │  Objetivo identificado                                         │
   │       ▼                                                        │
   │  Decomposição em Subtarefas                                        │
   │       ▼                                                        │
   │  Identificação de Dependências                                        │
   │       ▼                                                        │
   │  Priorização e sequenciamento                                              │
   │       ▼                                                        │
   │  (Execution Policy Engine anota restrições — fora do Planning Engine)          │
   │       ▼                                                        │
   │  Execução, com Replanejamento sempre que necessário                                   │
   └───────────────────────────────────────────────────────────┘
```

Um plano nunca existe em duas escalas idênticas: o Planning Engine central decompõe a solicitação inteira; um Agente já delegado pode, dentro de seu próprio escopo, decompor internamente sua subtarefa específica em etapas ainda menores (`AGENT_FRAMEWORK.md`, Cap. 10) — um planejamento interno conceitualmente análogo, mas deliberadamente menor, que nunca substitui nem reconstrói o plano central.

---

## 4. Interactions

Em nível estritamente conceitual — sem protocolo, sem contrato técnico, sem API:

| Interação | Natureza conceitual |
|---|---|
| **AI Orchestrator** | O Planning Engine não é externo ao Orchestrator — é seu componente interno (`04_AI_ORCHESTRATOR.md`, Seção 4). |
| **Shared Memory** | Consome memória Persistente e Organizacional já disponibilizada antes de decompor — aplicação de `Memory before planning` (`06_SHARED_MEMORY.md`, Seção 4). |
| **Agent Registry** | O Planning Engine produz o plano de subtarefas *antes* de o Registry resolver qual Agente atende cada uma (`05_AGENT_REGISTRY.md`, Seção 4) — o Registry consome a saída do Planning Engine, nunca o contrário. |
| **Reasoning Engine** | Cada subtarefa já planejada e já delegada é o que o Reasoning Engine do Agente resolvido processa — o Planning Engine antecede o Raciocínio, nunca o substitui. |
| **Agentes** | Um Agente já delegado pode decompor internamente sua própria subtarefa (Seção 3), reportando progresso ao Agent Coordinator, sem necessariamente acionar o Planning Engine central, salvo quando esse planejamento interno não é suficiente para resolver uma divergência identificada. |

---

## 5. Planning Boundaries

- **Pertence ao Planning Engine**: decompor objetivo em subtarefas, identificar dependências, priorizar e sequenciar, replanejar a porção afetada.
- **Pertence ao Orchestrator** (outros componentes): resolver qual Agente atende cada subtarefa (Agent Registry), anotar política de execução (Execution Policy Engine), consolidar resultados parciais (Result Consolidator) — o Planning Engine é apenas um entre nove componentes internos já descritos em `AI_ORCHESTRATOR.md`, Capítulo 5.
- **Pertence ao Reasoning Engine**: o julgamento e a inferência aplicados dentro de uma subtarefa já delegada.
- **Pertence aos Agentes**: o planejamento interno de escala menor dentro de sua própria subtarefa (Seção 3).
- **Pertence aos Business Hubs**: toda Regra de negócio, todo estado, toda execução de Command — o Planning Engine nunca decide conteúdo de negócio, apenas a sequência abstrata de subtarefas que eventualmente convergem para o Command Bus.
- **Nunca pertence ao Planning Engine**: a lógica de Trigger e de Condition já exigida do Automation Engine (`AUTOMATION_ENGINE.md`) — planejamento de execução determinística (processo já conhecido, configurado antecipadamente) e planejamento de raciocínio assistido (solicitação decomposta dinamicamente) permanecem paralelos e complementares, nunca sobrepostos (`AI_ARCHITECTURE.md`, Cap. 13).

---

## 6. Relationship with Volume I

O Planning Engine nunca invoca Command diretamente e nunca decide o conteúdo de uma Regra de negócio — toda subtarefa planejada só se torna ação real depois de atravessar a Execution Policy Layer e convergir para o Command Bus já governado pelo Volume I (`03_AI_ARCHITECTURE.md`, Seção 2). A distinção entre este planejamento e o já coberto pelo Automation Engine (Seção 5) preserva integralmente a fronteira já estabelecida em `AUTOMATION_ENGINE.md`.

---

## 7. Relationship with AI_MANIFESTO

A exigência de que nenhuma decomposição comece antes que memória e contexto relevantes já estejam disponíveis é aplicação direta de `Memory before planning`, já organizado em `02_AI_PRINCIPLES.md`, Seção 3 (Operational Principles). A distinção entre planejamento de raciocínio assistido e automação determinística reforça `Automation owns execution` e `Architecture before AI`, já organizados na Seção 2 (Architectural Principles) daquele mesmo capítulo.

---

## 8. Scope

Este capítulo cobre exclusivamente: o papel do Planning Engine na decomposição, identificação de dependências, priorização e replanejamento, seu modelo conceitual de plano, suas interações, e suas fronteiras de responsabilidade frente a outros componentes.

Este capítulo não cobre, e não tem autoridade para: definir algoritmo ou heurística de decomposição ou de priorização; especificar modelo de IA; detalhar o planejamento interno de um Agente além do já descrito em `AGENT_FRAMEWORK.md`; ou especificar a anotação de política de execução (matéria do Execution Policy Engine, já coberta por `AI_GOVERNANCE.md`).

---

## 9. Future Evolution

Este componente é complementado pelos capítulos seguintes da estrutura modular, hoje todos já escritos: `08_REASONING_ENGINE.md` detalha o processamento que sucede cada subtarefa já planejada; `09_SKILL_RUNTIME.md` e `10_TOOL_RUNTIME.md` detalham a execução técnica que eventualmente resulta desse raciocínio; e `11_MULTI_AGENT_SYSTEM.md` detalha como dependências entre subtarefas atribuídas a Agentes distintos são coordenadas quando mais de um Agente participa do mesmo plano.

---

## 10. Approval

| Campo | Valor |
|---|---|
| Status | Draft |
| Version | 0.1 |
| Author | Claude |
