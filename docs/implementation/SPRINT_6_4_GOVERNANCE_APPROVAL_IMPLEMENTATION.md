# Sprint 6.4 — Governance & Approval Implementation

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação da estrutura arquitetural declarativa da camada Governance & Approval do Automation Engine — AUTO-04 de `PHASE_6_IMPLEMENTATION_BACKLOG.md`, a quarta Sprint de implementação da Phase 6. Nenhuma outra Sprint é iniciada por este documento.*

---

## 1. Objetivo

Implementar a estrutura arquitetural declarativa dos quatro componentes pertencentes à Sprint AUTO-04 — Approval Engine, Notification Engine, Template Engine, Audit Engine —, formalizando o checkpoint humano exigido pelo princípio Human Approval When Needed sobre a Execution já modelada na Sprint 6.3.

---

## 2. Estrutura Concreta

| Elemento | Decisão |
|---|---|
| Pacote | `@abp/automation-engine` — mesmo pacote já criado nas Sprints 6.1 a 6.3 |
| Import de qualquer outro pacote (`@abp/ai`, `@abp/platform-services`, ou qualquer dos cinco pacotes de Business Hub) | Nenhum — confirmado por inspeção direta |

---

## 3. Artefatos Criados (5 arquivos)

| Arquivo | Conceito | Fonte |
|---|---|---|
| `AutomationGovernanceApprovalComponent.ts` | Catálogo dos 4 componentes desta Sprint | `AUTOMATION_ENGINE.md`, Capítulo 7 |
| `ApprovalCheckpoint.ts` | Checkpoint humano (+ `ApprovalStatus`) — pausa e retomada de Execution, nunca prosseguindo silenciosamente | `AUTOMATION_ENGINE.md`, Capítulo 5 e 7, ADR-005 |
| `NotificationRequest.ts` | Notificação (+ `NotificationPurpose`) — solicitação de aprovação ou resultado de execução | `AUTOMATION_ENGINE.md`, Capítulo 7 |
| `TemplateResolution.ts` | Resolução de Template para Action de comunicação | `AUTOMATION_ENGINE.md`, Capítulos 7 e 14 |
| `AuditRecord.ts` | Registro imutável (+ `AuditedOperation`) — mudança de Workflow e decisão de aprovação | `AUTOMATION_ENGINE.md`, Capítulo 16 |

---

## 4. Decisão de Design — Pausa de Execution sem Modificação Retroativa

`Execution.status` (Sprint 6.3) permanece `"Running" | "Succeeded" | "Failed"`, sem nenhuma alteração retroativa. Uma Execution é considerada pausada para aprovação quando referenciada por um `ApprovalCheckpoint` de `status = "Pending"` — a informação de pausa vive inteiramente no novo artefato desta Sprint, nunca exigindo modificação do artefato já aprovado na Sprint anterior. Mesmo critério de não modificação retroativa já aplicado entre todas as Sprints do Automation Engine até aqui.

---

## 5. Elementos Explicitamente Não Elevados a Artefato

- Integration Connector, Metrics Engine, Automation Analytics, Automation Preview, Simulation Engine, Rollback Manager, Dead Letter Queue — todos pertencentes à Sprint 6.5, não implementados aqui.
- Nenhuma lógica real de notificação, de resolução de Template, ou de decisão de aprovação é implementada — apenas a estrutura de dado que a representará.
- `NotificationRequest.recipientDescription` e `TemplateResolution.templateReferenceId` permanecem opacos — nenhum tipo de `@abp/communication-hub` ou do Branding Hub é importado.

---

## 6. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| Import de `@abp/ai`? | Não |
| Import de `@abp/platform-services`? | Não — `resolvedByIdentityId`/`performedByIdentityId` permanecem `string` opacos |
| Import de `@abp/infrastructure`, `@abp/core`, ou `@abp/shared`? | Não |
| Import de qualquer um dos cinco pacotes de Business Hub, incluindo `@abp/communication-hub`? | Não |
| Import entre os 26 arquivos do próprio `@abp/automation-engine` (21 já existentes + 5 novos)? | Não — toda referência é por identificador opaco |
| `Execution.ts` (Sprint 6.3) modificado retroativamente? | Não |
| Advanced Integration (componentes da Sprint 6.5) implementado? | Não |
| Mecanismo de execução, Runtime, fila, persistência, Dashboard, ou AI Agent? | Não — 5 arquivos novos, todos interfaces/tipos, zero função, zero classe |

---

## 7. Critérios de Aceitação

✓ Apenas os componentes da Sprint AUTO-04 implementados — Approval Engine, Notification Engine, Template Engine, Audit Engine.
✓ Todos os artefatos exclusivamente declarativos.
✓ Human Approval When Needed preservado estruturalmente via `ApprovalCheckpoint`, sem modificar `Execution.ts` retroativamente.
✓ Nenhuma dependência estrutural para Business Hubs.
✓ Nenhum acesso a componente interno do AI Core.

---

## Approval

| Campo | Valor |
|---|---|
| Status | SPRINT 6.4 — GOVERNANCE & APPROVAL IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
