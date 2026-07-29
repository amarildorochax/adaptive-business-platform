# Sprint 6.3 — Action & Execution Implementation

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação da estrutura arquitetural declarativa da camada Action & Execution do Automation Engine — AUTO-03 de `PHASE_6_IMPLEMENTATION_BACKLOG.md`, o item explicitamente identificado naquele backlog como "risco mais sensível" da Phase 6. Nenhuma outra Sprint é iniciada por este documento.*

---

## 1. Objetivo

Implementar a estrutura arquitetural declarativa dos cinco componentes pertencentes à Sprint AUTO-03 — Action Engine, Execution Engine, Execution History, Queue Manager, Retry Manager —, resolvendo a referência opaca deixada em aberto por `Workflow.actionIds` e `WorkflowBranch.actionIds` desde a Sprint 6.1, e verificando rigorosamente a fronteira Automation ↔ AI Core já exigida por `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md`, Seção 7.

---

## 2. Estrutura Concreta

| Elemento | Decisão |
|---|---|
| Pacote | `@abp/automation-engine` — mesmo pacote já criado nas Sprints 6.1 e 6.2 |
| Import de qualquer outro pacote (`@abp/ai`, `@abp/platform-services`, ou qualquer dos cinco pacotes de Business Hub) | Nenhum — confirmado por inspeção direta |

---

## 3. Artefatos Criados (9 arquivos)

| Arquivo | Conceito | Fonte |
|---|---|---|
| `AutomationActionExecutionComponent.ts` | Catálogo dos 5 componentes desta Sprint | `AUTOMATION_ENGINE.md`, Capítulo 7 |
| `Action.ts` | Action (+ `ActionCategory`, 10 categorias) — resolve `actionIds` já deixado opaco na Sprint 6.1 | `AUTOMATION_ENGINE.md`, Capítulo 11 |
| `ActionAIInvocation.ts` | Registro declarativo da invocação do AI Hub pela categoria "ExecuteAI" — artefato de maior sensibilidade desta Sprint | `AUTOMATION_ENGINE.md`, Capítulo 12 |
| `RetryPolicy.ts` | Política de nova tentativa (Retry by Design, ADR-007) | `AUTOMATION_ENGINE.md`, Capítulo 5 e 7 |
| `RetryAttempt.ts` | Registro de tentativa individual do Retry Manager | `AUTOMATION_ENGINE.md`, Capítulo 7 |
| `Execution.ts` | Execution (+ `ExecutionStatus`) | `AUTOMATION_ENGINE.md`, Capítulo 7 |
| `ExecutionStep.ts` | Estado de etapa individual dentro de uma Execution | `AUTOMATION_ENGINE.md`, Capítulo 7 |
| `ExecutionHistoryRecord.ts` | Registro do Execution History (+ `ExecutionOutcome`: Success/NoActionTaken/Failure) | `AUTOMATION_ENGINE.md`, Capítulos 7 e 8, ADR-012 |
| `QueuedExecutionStep.ts` | Registro declarativo de enfileiramento pelo Queue Manager | `AUTOMATION_ENGINE.md`, Capítulo 7 |

---

## 4. Verificação Rigorosa da Fronteira Automation ↔ AI Core

Conforme já exigido em `PHASE_6_IMPLEMENTATION_BACKLOG.md`, item AUTO-03: "a fronteira 'Executar IA consome apenas o contrato externo do AI Hub, nunca os onze componentes internos' precisa de verificação arquitetural rigorosa nesta Sprint."

- `Action.ts` modela a categoria `"ExecuteAI"` como um valor de `ActionCategory` igual a qualquer outra categoria — nenhum tratamento especial que sugerisse acesso privilegiado a `@abp/ai`.
- `ActionAIInvocation.ts`, o artefato dedicado a essa categoria, contém exclusivamente `actionId`, `purposeDescription`, `resultDescription` e `invokedAt` — todos `string`/`Date`. Nenhum campo referencia `Context`, `Memory`, `Orchestrator`, `Agent Framework`, `Reasoning`, `Planning`, `Skill Runtime`, `Tool Runtime`, `Multi-Agent System`, `AI Governance`, ou `AI Observability`.
- `resultDescription` é deliberadamente `string`, nunca um tipo estruturado importado — preservando, ao nível de artefato, a mesma regra já fixada em `AUTOMATION_ENGINE.md`, Capítulo 12: o resultado é "tratado como um valor estruturado... nunca reinterpretado por uma lógica adicional".
- Grep de `^import` em `ActionAIInvocation.ts`, e em todos os 9 arquivos desta Sprint, confirma zero ocorrência.

---

## 5. Distinção "Sem Ação" vs. "Falha" (ADR-012)

`ExecutionHistoryRecord.outcome` modela explicitamente três valores — `"Success"`, `"NoActionTaken"`, `"Failure"` — nunca apenas dois, preservando a distinção já exigida em `AUTOMATION_ENGINE.md`, ADR-012: um Branch não satisfeito (nenhuma Condition da Sprint 6.2 se aplicou) é registrado como `"NoActionTaken"`, um resultado válido e esperado, nunca confundido com `"Failure"` (falha real na execução de uma Action).

---

## 6. Elementos Explicitamente Não Elevados a Artefato

- Approval Engine — não implementado, conforme Restrição explícita; `Execution.status` permanece limitado a `"Running" | "Succeeded" | "Failed"`, sem nenhum estado de aprovação pendente, que pertence exclusivamente à Sprint 6.4.
- Dead Letter Queue — pertence à Sprint 6.5 (`PHASE_6_IMPLEMENTATION_BACKLOG.md`, item AUTO-05), não catalogado nem referenciado estruturalmente aqui, ainda que `ExecutionStep.status = "Failed"` já represente o gatilho conceitual para seu futuro encaminhamento.
- Nenhuma tecnologia concreta de fila (`QueuedExecutionStep.ts`) ou de espera progressiva (`RetryPolicy.backoffDescription`) é definida — ambas permanecem descritivas.
- Nenhuma lógica real de execução, de retry, ou de enfileiramento é implementada — apenas a estrutura de dado que a representará.

---

## 7. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| Import de `@abp/ai` (qualquer componente interno do AI Core)? | Não — verificado com atenção redobrada em `ActionAIInvocation.ts` |
| Import de `@abp/platform-services`? | Não |
| Import de `@abp/infrastructure`, `@abp/core`, ou `@abp/shared`? | Não |
| Import de qualquer um dos cinco pacotes de Business Hub? | Não |
| Import entre os 21 arquivos do próprio `@abp/automation-engine` (12 já existentes + 9 novos)? | Não — toda referência é por identificador opaco |
| Approval Engine implementado? | Não |
| Mecanismo de execução, Runtime, fila, persistência, Dashboard, ou AI Agent? | Não — 9 arquivos novos, todos interfaces/tipos, zero função, zero classe |
| Distinção "sem ação" vs. "falha" preservada (ADR-012)? | Sim — `ExecutionOutcome` com três valores |

---

## 8. Critérios de Aceitação

✓ Apenas os componentes da Sprint AUTO-03 implementados — Action Engine, Execution Engine, Execution History, Queue Manager, Retry Manager.
✓ Todos os artefatos exclusivamente declarativos.
✓ Modelo de Action (10 categorias), incluindo verificação rigorosa da categoria "ExecuteAI".
✓ Modelo de Execution, Execution Step, e distinção de três resultados (ADR-012).
✓ Nenhuma dependência estrutural para Business Hubs.
✓ Nenhum acesso a componente interno do AI Core.

---

## Approval

| Campo | Valor |
|---|---|
| Status | SPRINT 6.3 — ACTION & EXECUTION IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
