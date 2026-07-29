# Component 17 — Orchestrator — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos oito artefatos de Orchestrator. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm), no pacote `platform/packages/ai/` já criado pelos Components 15 e 16.*

---

## Orchestrator Component

`OrchestratorComponent` (union de 9 literais): `"Intent Analyzer"`, `"Context Builder"`, `"Memory Manager"`, `"Capability Selector"`, `"Planning Engine"`, `"Execution Policy Engine"`, `"Agent Coordinator"`, `"Result Consolidator"`, `"Response Builder"` — Capítulo 5.

## Decision Pipeline State

`DecisionPipelineStage` (union de 12 literais): `"Request"`, `"Intent Analysis"`, `"Context Assembly"`, `"Memory Retrieval"`, `"Capability Resolution"`, `"Planning"`, `"Execution Policy"`, `"Agent Delegation"`, `"Execution"`, `"Consolidation"`, `"Human Approval"`, `"Response"` — Capítulo 6.

| Propriedade | Descrição | Fonte |
|---|---|---|
| `requestId` | Solicitação em processamento | Capítulo 6 |
| `stage` | Etapa atual (`DecisionPipelineStage`) | Capítulo 6 |
| `enteredAt` | Momento em que a solicitação entrou nesta etapa | Capítulo 6 |

## Coordination Task

`CoordinationState` (union de 4 literais): `"Pending"`, `"InProgress"`, `"Completed"`, `"Cancelled"` — Capítulo 7.

| Propriedade | Descrição | Fonte |
|---|---|---|
| `subtaskId` | Subtarefa coordenada | Capítulo 7 |
| `agentId` | Agente ao qual a subtarefa foi distribuída (identificador opaco) | Capítulo 7 |
| `dependsOn` | Identificadores de subtarefa da qual esta depende | Capítulo 7 |
| `state` | Estado atual (`CoordinationState`) | Capítulo 7 |

## Capability Selection

| Propriedade | Descrição | Fonte |
|---|---|---|
| `requestId` | Solicitação para a qual a seleção foi feita | Capítulo 11 |
| `capabilityIds` | Identificadores das Capabilities selecionadas | Capítulo 11 |
| `resolvedAt` | Momento da resolução | Capítulo 11 |

## Agent Selection

| Propriedade | Descrição | Fonte |
|---|---|---|
| `subtaskId` | Subtarefa para a qual a seleção foi feita | Capítulo 12 |
| `agentId` | Agente selecionado (identificador opaco) | Capítulo 12 |
| `selectedAt` | Momento da seleção | Capítulo 12 |

## Execution Policy

`ExecutionPolicyKind` (union de 6 literais): `"Read Only"`, `"Recommendation Only"`, `"Human Approval"`, `"Automatic Execution"`, `"Simulation"`, `"Dry Run"` — Capítulo 13.

| Propriedade | Descrição | Fonte |
|---|---|---|
| `subtaskId` | Subtarefa à qual esta política se aplica | Capítulo 13 |
| `policy` | Política determinada (`ExecutionPolicyKind`) | Capítulo 13 |
| `determinedAt` | Momento da determinação | Capítulo 13 |

## Consolidation Result

| Propriedade | Descrição | Fonte |
|---|---|---|
| `requestId` | Solicitação consolidada | Capítulo 14 |
| `contributingAgentIds` | Agentes que contribuíram ao resultado | Capítulo 14 |
| `conflictResolved` | Se houve conflito entre resultados parciais, já resolvido | Capítulo 14 |
| `consolidatedAt` | Momento da consolidação | Capítulo 14 |

## Failure Handling

`FailureResolution` (union de 4 literais): `"Retry"`, `"Fallback"`, `"DegradedContinuation"`, `"EscalatedToHuman"` — Capítulo 15.

| Propriedade | Descrição | Fonte |
|---|---|---|
| `requestId` | Solicitação na qual a falha ocorreu | Capítulo 15 |
| `resolution` | Resolução aplicada (`FailureResolution`) | Capítulo 15 |
| `handledAt` | Momento em que a falha foi tratada | Capítulo 15 |

---

## Convenções

**Nomenclatura**: `OrchestratorComponent`, `DecisionPipelineState` (com `DecisionPipelineStage`), `CoordinationTask` (com `CoordinationState`), `CapabilitySelection`, `AgentSelection`, `ExecutionPolicy` (com `ExecutionPolicyKind`), `ConsolidationResult`, `FailureHandling` (com `FailureResolution`).

**Localização**: `platform/packages/ai/src/OrchestratorComponent.ts`, `DecisionPipelineState.ts`, `CoordinationTask.ts`, `CapabilitySelection.ts`, `AgentSelection.ts`, `ExecutionPolicy.ts`, `ConsolidationResult.ts`, `FailureHandling.ts` — mesmo pacote `@abp/ai` já criado para Context (Component 15) e Memory (Component 16).

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos demais artefatos.

**Compatibilidade**: nenhum vocabulário novo além do já citado em `AI_ORCHESTRATOR.md`; nenhuma duplicação de `Event`, `PlatformError`, ou de qualquer artefato já implementado em Context ou em Memory; nenhuma importação cruzada de tipo entre componentes do pacote `@abp/ai` — toda referência a Contexto, Memória ou Agente é feita por identificador opaco (`string`).

---

## Validação

✓ Compatível com `ORCHESTRATOR_SPECIFICATION.md`, `AI_ORCHESTRATOR.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de artefato já existente.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_17_ORCHESTRATOR_ARTIFACT_IDENTIFICATION.md`; `AI_ORCHESTRATOR.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
