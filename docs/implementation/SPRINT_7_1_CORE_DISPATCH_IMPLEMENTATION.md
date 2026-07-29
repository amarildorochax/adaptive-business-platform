# Sprint 7.1 — Core Dispatch Implementation

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação da estrutura arquitetural declarativa da camada Core Dispatch do Runtime — RT-01 de `RUNTIME_IMPLEMENTATION_BACKLOG.md`, a primeira Sprint de implementação do Runtime. Nenhuma outra Sprint é iniciada por este documento.*

---

## 1. Objetivo

Implementar a estrutura arquitetural declarativa dos três componentes pertencentes à Sprint RT-01 — Runtime Manager, Execution Context Manager, Dispatcher —, e os contratos conceituais de Execution Context, Execution Lifecycle, Dispatch Target e Dispatch Result já fixados em `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seções 5, 6 e 11.

---

## 2. Estrutura Concreta — Pacote

| Elemento | Decisão |
|---|---|
| Pacote | `@abp/runtime`, novo — `platform/packages/runtime/` |
| `package.json` / `tsconfig.json` | Espelham exatamente os pacotes já criados nas Phases 4, 5 e 6 |
| Referência em `platform/tsconfig.json` | Adicionada: `{ "path": "./packages/runtime" }` |
| Import de qualquer outro pacote (`@abp/ai`, `@abp/automation-engine`, `@abp/platform-services`, ou qualquer dos cinco pacotes de Business Hub) | Nenhum — confirmado por inspeção direta dos 5 arquivos |

---

## 3. Artefatos Criados (5 arquivos)

| Arquivo | Conceito | Fonte |
|---|---|---|
| `RuntimeCoreDispatchComponent.ts` | Catálogo dos 3 componentes desta Sprint | `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4 |
| `ExecutionContext.ts` | Contexto propagado por toda a vida de uma execução | `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seções 5 e 11 |
| `ExecutionLifecycleState.ts` | Ciclo de vida técnico (+ `ExecutionLifecycleStage`, 6 estágios) — nível de Runtime, distinto do Execution do Automation Engine | `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 6 |
| `DispatchTarget.ts` | Destino do encaminhamento (+ `DispatchTargetKind`: AutomationEngine/BusinessHub/AIHub) | `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4 |
| `DispatchResult.ts` | Registro de encaminhamento bem-sucedido ou falho | `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 5 |

---

## 4. Verificação — Ausência de Duplicação com o Automation Engine

Restrição explícita desta Sprint: "Não duplicar responsabilidades do Automation Engine." Verificação campo a campo:

- `ExecutionLifecycleState` modela um ciclo de seis estágios genéricos (`Received` a `Failed`), nenhum equivalente ao ciclo de doze etapas específico de Workflow já publicado em `AUTOMATION_ENGINE.md`, Capítulo 8 (Trigger → Conditions → Branches → Actions → Retries → Timeouts → Success/Failure) — os dois ciclos operam em níveis de abstração distintos, já explicitamente reconhecidos como tal em `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 6.
- `DispatchTarget`/`DispatchResult` registram apenas que um encaminhamento ocorreu e seu sucesso ou falha — nenhum campo modela Trigger, Condition, Action, Retry Policy, ou Approval Checkpoint, todos de propriedade exclusiva de `@abp/automation-engine`.
- Nenhum dos 5 arquivos desta Sprint importa `@abp/automation-engine` — toda referência a um Workflow em andamento no Automation Engine, quando aplicável, permanecerá exclusivamente opaca em `DispatchTarget.targetDescription`.

---

## 5. Elementos Explicitamente Não Elevados a Artefato

- Runtime Retry Coordinator, Runtime Isolation Boundary, Runtime Observability Collector — nenhum dos três é implementado ou catalogado nesta Sprint, conforme Restrição explícita.
- Nenhuma lógica real de encaminhamento, de estabelecimento de contexto, ou de roteamento é implementada — cada componente produz apenas a estrutura de dado que o representará.
- Nenhum Runtime executável, fila, ou persistência real.

---

## 6. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| Import de `@abp/ai`? | Não |
| Import de `@abp/automation-engine`? | Não |
| Import de `@abp/platform-services`? | Não |
| Import de `@abp/infrastructure`, `@abp/core`, ou `@abp/shared`? | Não |
| Import de qualquer um dos cinco pacotes de Business Hub? | Não |
| Import entre os 5 arquivos do próprio `@abp/runtime`? | Não — toda referência é por identificador opaco |
| Runtime Retry Coordinator, Runtime Isolation Boundary, ou Runtime Observability Collector implementados? | Não |
| Duplicação de responsabilidade do Automation Engine? | Não — verificado campo a campo (Seção 4) |
| Mecanismo de execução, Runtime real, fila, persistência, Dashboard, ou AI Agent? | Não — 5 arquivos, todos interfaces/tipos, zero função, zero classe |
| Acesso a componente interno do AI Core? | Não |

---

## 7. Critérios de Aceitação

✓ Apenas os componentes da Sprint RT-01 implementados — Runtime Manager, Execution Context Manager, Dispatcher.
✓ Todos os artefatos exclusivamente declarativos.
✓ Nenhuma duplicação de responsabilidade do Automation Engine.
✓ Nenhuma dependência estrutural para Business Hubs.
✓ Nenhum acesso a componente interno do AI Core.

---

## Approval

| Campo | Valor |
|---|---|
| Status | SPRINT 7.1 — CORE DISPATCH IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
