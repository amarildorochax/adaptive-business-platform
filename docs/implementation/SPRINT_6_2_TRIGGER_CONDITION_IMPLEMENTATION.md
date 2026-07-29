# Sprint 6.2 — Trigger & Condition Implementation

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação da estrutura arquitetural declarativa da camada Trigger & Condition do Automation Engine — AUTO-02 de `PHASE_6_IMPLEMENTATION_BACKLOG.md`, a segunda Sprint de implementação da Phase 6. Nenhuma outra Sprint é iniciada por este documento.*

---

## 1. Objetivo

Implementar a estrutura arquitetural declarativa dos três componentes pertencentes à Sprint AUTO-02 — Trigger Manager, Scheduler, Condition Engine —, e os modelos completos de Trigger e de Condition já fixados em `AUTOMATION_ENGINE.md`, Capítulos 9 e 10, encerrando a referência opaca deixada em aberto por `Workflow.triggerId` e `WorkflowBranch.conditionId` na Sprint 6.1.

---

## 2. Estrutura Concreta

| Elemento | Decisão |
|---|---|
| Pacote | `@abp/automation-engine` — mesmo pacote já criado na Sprint 6.1, nenhum pacote novo |
| Import de qualquer outro pacote (`@abp/ai`, `@abp/platform-services`, ou qualquer dos cinco pacotes de Business Hub) | Nenhum — confirmado por inspeção direta |

---

## 3. Artefatos Criados (5 arquivos)

| Arquivo | Conceito | Fonte |
|---|---|---|
| `AutomationTriggerConditionComponent.ts` | Catálogo dos 3 componentes desta Sprint | `AUTOMATION_ENGINE.md`, Capítulo 7 |
| `Trigger.ts` | Trigger (+ `TriggerCategory`, 8 categorias) — resolve `Workflow.triggerId` já deixado opaco na Sprint 6.1 | `AUTOMATION_ENGINE.md`, Capítulo 9 |
| `ScheduleDefinition.ts` | Agendamento do Scheduler (+ `ScheduleKind`) — Recurring/Delayed/Window, para Trigger de categoria "Time" | `AUTOMATION_ENGINE.md`, Capítulo 7 |
| `Condition.ts` | Condition atômica (+ `ConditionKind`, 7 categorias) — resolve `WorkflowBranch.conditionId` já deixado opaco na Sprint 6.1 | `AUTOMATION_ENGINE.md`, Capítulo 10 |
| `ConditionExpression.ts` | Combinação lógica de Conditions (+ `ConditionOperator`: AND/OR/NOT) | `AUTOMATION_ENGINE.md`, Capítulo 10 |

---

## 4. Decisão de Design — Preservação da Disciplina de Identificador Opaco

Duas das oito categorias de Trigger ("Event" e "DataChange") e três das sete categorias de Condition ("Segment", "Profile", "Permission") referenciam, por natureza, conceito externo ao Automation Engine — um Evento publicado por um Business Hub, uma classificação do Business Profile Engine, ou uma Permissão do Identity Hub. Nenhum desses conceitos é importado: `Trigger.sourceDescription` e `Condition.description` permanecem sempre `string` opaca, nunca um tipo `CRMEventType`, `FinEventType`, ou qualquer outro literal de pacote de Business Hub ou de `@abp/platform-services`.

A categoria "AI" de Trigger, correspondente à Action Executar IA já descrita em `AUTOMATION_ENGINE.md`, Capítulo 12, segue a mesma disciplina — `sourceDescription` nunca referencia um tipo de `@abp/ai`.

A categoria "WorkflowState" de Condition consulta o progresso de uma execução em andamento — o modelo completo de Execution pertence à Sprint 6.3, ainda não realizada; `Condition.description`, sendo `string`, evita qualquer antecipação daquele modelo.

---

## 5. Elementos Explicitamente Não Elevados a Artefato

- Action Engine, Execution Engine, Approval Engine — nenhum implementado, conforme Restrição explícita.
- Nenhuma lógica de avaliação de Condition, de combinação lógica, ou de agendamento real é implementada — apenas a estrutura de dado que a representará.
- Nenhuma tecnologia concreta de agendamento (cron, temporizador) é definida em `ScheduleDefinition.ts` — `description` permanece opaca.

---

## 6. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| Import de `@abp/ai`? | Não |
| Import de `@abp/platform-services`? | Não |
| Import de `@abp/infrastructure`, `@abp/core`, ou `@abp/shared`? | Não |
| Import de qualquer um dos cinco pacotes de Business Hub? | Não |
| Import entre os 12 arquivos do próprio `@abp/automation-engine` (7 da Sprint 6.1 + 5 novos)? | Não — toda referência é por identificador opaco |
| Action Engine, Execution Engine, ou Approval Engine implementados? | Não |
| Mecanismo de execução, Runtime, fila, persistência, Dashboard, ou AI Agent? | Não — 5 arquivos novos, todos interfaces/tipos, zero função, zero classe |
| Acesso a componente interno do AI Core? | Não |

---

## 7. Critérios de Aceitação

✓ Apenas os componentes da Sprint AUTO-02 implementados — Trigger Manager, Scheduler, Condition Engine.
✓ Todos os artefatos exclusivamente declarativos.
✓ Modelo de Trigger (8 categorias) e de Condition (7 categorias + 3 operadores lógicos) completos, conforme `AUTOMATION_ENGINE.md`, Capítulos 9 e 10.
✓ Nenhuma dependência estrutural para Business Hubs.
✓ Nenhum acesso a componente interno do AI Core.

---

## Approval

| Campo | Valor |
|---|---|
| Status | SPRINT 6.2 — TRIGGER & CONDITION IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
