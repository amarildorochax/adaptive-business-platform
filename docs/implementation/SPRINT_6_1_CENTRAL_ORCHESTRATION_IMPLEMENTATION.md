# Sprint 6.1 — Central Orchestration Implementation

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação da estrutura arquitetural declarativa da camada de Orquestração Central do Automation Engine — AUTO-01 de `PHASE_6_IMPLEMENTATION_BACKLOG.md`, a primeira Sprint de implementação da Phase 6. Nenhuma outra Sprint é iniciada por este documento.*

---

## 1. Objetivo

Implementar a estrutura arquitetural declarativa dos seis componentes pertencentes à Sprint AUTO-01 — Automation Manager, Workflow Engine, Workflow Builder, Workflow Validator, Workflow Versioning, Workflow Library —, e o modelo estrutural de Workflow em si (Trigger e Action referenciados apenas por identificador opaco, seus modelos completos pertencentes às Sprints 6.2 e 6.3), mesma disciplina puramente declarativa já aplicada aos cinco Business Hubs da Phase 5.

---

## 2. Estrutura Concreta — Pacote

| Elemento | Decisão |
|---|---|
| Pacote | `@abp/automation-engine`, novo — `platform/packages/automation-engine/` |
| `package.json` / `tsconfig.json` | Espelham exatamente os pacotes já criados nas Phases 4 e 5 |
| Referência em `platform/tsconfig.json` | Adicionada: `{ "path": "./packages/automation-engine" }` |
| Import de qualquer outro pacote (`@abp/core`, `@abp/shared`, `@abp/infrastructure`, `@abp/platform-services`, `@abp/ai`, ou qualquer dos cinco pacotes de Business Hub) | Nenhum — confirmado por inspeção direta dos 7 arquivos |

---

## 3. Artefatos Criados (7 arquivos, `platform/packages/automation-engine/src/`)

| Arquivo | Conceito | Fonte |
|---|---|---|
| `AutomationOrchestrationComponent.ts` | Catálogo dos 6 componentes desta Sprint — subconjunto dos 25 totais já corrigidos em `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md` | `AUTOMATION_ENGINE.md`, Capítulo 7 |
| `Workflow.ts` | Workflow (+ `WorkflowStatus`) — dado estruturado, nunca código compilado (Workflow as Configuration, ADR-002) | `AUTOMATION_ENGINE.md`, Capítulo 8 |
| `WorkflowBranch.ts` | Branch — caminho alternativo, apenas um seguido por execução | `AUTOMATION_ENGINE.md`, Capítulo 8 |
| `WorkflowBuilderResult.ts` | Resultado do Workflow Builder | `AUTOMATION_ENGINE.md`, Capítulo 7 |
| `WorkflowValidationResult.ts` | Resultado do Workflow Validator — três verificações nomeadas (Conditions resolvidas, Actions resolvidas, ausência de ciclo) | `AUTOMATION_ENGINE.md`, Capítulos 7 e 16 |
| `WorkflowVersion.ts` | Registro de versão do Workflow Versioning | `AUTOMATION_ENGINE.md`, Capítulo 7 |
| `WorkflowLibraryEntry.ts` | Entrada no catálogo do Workflow Library — nativo vs. específico de Empresa | `AUTOMATION_ENGINE.md`, Capítulo 7 |

**Automation Manager** não recebeu artefato de dado próprio — mesmo critério já aplicado a cada Manager orquestrador central de Business Hub (CRM Manager, Communication Manager, etc.): ele "não contém lógica de negócio... apenas direciona" (`AUTOMATION_ENGINE.md`, Capítulo 7), catalogado apenas como identificador em `AutomationOrchestrationComponent.ts`.

---

## 4. Decisão de Design — Referência Antecipada por Identificador Opaco

Diferente da Phase 5, onde cada Business Hub era implementado em uma única Sprint autocontida, o Automation Engine é um único domínio decomposto em cinco Sprints sequenciais com dependência real entre si (`PHASE_6_IMPLEMENTATION_BACKLOG.md`, Seção 3). O modelo de Workflow (Capítulo 8 de `AUTOMATION_ENGINE.md`) já exige, em sua própria definição, referência a Trigger e a Action — mas ambos os modelos completos pertencem a Sprints futuras (6.2 e 6.3), explicitamente fora do escopo e das Restrições desta Sprint ("Não implementar Trigger Engine", "Não implementar Action Engine").

A resolução aplicada é a mesma disciplina de identificador opaco já usada para fronteiras entre pacotes distintos, agora aplicada dentro do próprio pacote `@abp/automation-engine` entre Sprints ainda não realizadas: `Workflow.triggerId`, `Workflow.actionIds`, e `WorkflowBranch.conditionId`/`actionIds` são todos `string`/`readonly string[]`, nunca um tipo `Trigger`, `Condition`, ou `Action` importado ou antecipado. Nenhum desses tipos existe ainda em nenhum arquivo do pacote — sua definição completa é responsabilidade exclusiva das Sprints 6.2 e 6.3.

---

## 5. Elementos Explicitamente Não Elevados a Artefato

- Trigger Engine, Condition Engine, Action Engine, Execution Engine, Approval Engine — nenhum dos cinco é implementado ou catalogado nesta Sprint, conforme Restrição explícita.
- Nenhuma lógica de roteamento do Automation Manager, de construção do Workflow Builder, ou de verificação do Workflow Validator é implementada — cada um produz apenas o resultado declarativo já modelado (`WorkflowBuilderResult`, `WorkflowValidationResult`), nunca a lógica que o produziria.
- Nenhum Runtime, fila, ou persistência real.

---

## 6. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| Import de `@abp/ai` (qualquer componente interno do AI Core)? | Não |
| Import de `@abp/platform-services`? | Não |
| Import de `@abp/infrastructure`, `@abp/core`, ou `@abp/shared`? | Não |
| Import de qualquer um dos cinco pacotes de Business Hub? | Não — zero dependência estrutural, conforme Restrição explícita |
| Import entre os 7 arquivos do próprio `@abp/automation-engine`? | Não — toda referência é por identificador opaco (`workflowId`, `triggerId`, `actionIds`) |
| Trigger Engine, Condition Engine, Action Engine, Execution Engine, ou Approval Engine implementados? | Não |
| Mecanismo de execução, Runtime, fila, persistência, Dashboard, ou AI Agent? | Não — 7 arquivos, todos interfaces/tipos, zero função, zero classe |
| Acesso a componente interno do AI Core? | Não |

---

## 7. Critérios de Aceitação

✓ Apenas os componentes da Sprint AUTO-01 implementados — Automation Manager, Workflow Engine, Workflow Builder, Workflow Validator, Workflow Versioning, Workflow Library.
✓ Todos os artefatos exclusivamente declarativos — interfaces, tipos e contratos, sem lógica operacional.
✓ Nenhuma dependência estrutural para Business Hubs.
✓ Nenhum acesso a componente interno do AI Core.
✓ Nenhum Trigger Engine, Condition Engine, Action Engine, Execution Engine, ou Approval Engine implementado.

---

## Approval

| Campo | Valor |
|---|---|
| Status | SPRINT 6.1 — CENTRAL ORCHESTRATION IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
