# Component 20 — Planning — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos cinco artefatos de Planning. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm), no pacote `platform/packages/ai/` já criado pelos Components 15–19.*

---

## Planning State

`PlanningStage` (union de 3 literais): `"GoalIdentified"`, `"Decomposed"`, `"DependenciesIdentified"` — Capítulo 8.

| Propriedade | Descrição | Fonte |
|---|---|---|
| `planId` | Plano ao qual este estado se refere | Capítulo 8 |
| `stage` | Etapa atual (`PlanningStage`) | Capítulo 8 |
| `enteredAt` | Momento em que o plano entrou nesta etapa | Capítulo 8 |

## Planning Goal

| Propriedade | Descrição | Fonte |
|---|---|---|
| `planId` | Plano ao qual este objetivo pertence | Capítulo 8 |
| `goalId` | Identificador do objetivo | Capítulo 8 |
| `description` | Descrição do que o objetivo deseja alcançar | Capítulo 8; Capítulo 10 |

## Planning Step

| Propriedade | Descrição | Fonte |
|---|---|---|
| `planId` | Plano ao qual esta etapa pertence | Capítulo 8 |
| `stepId` | Identificador da etapa | Capítulo 8 |
| `dependsOn` | Identificadores de etapa dos quais esta depende | Capítulo 8 |
| `priority` | Prioridade de processamento | Capítulo 10 |
| `preconditions` | Condições que devem estar satisfeitas antes desta etapa | Capítulo 8, extensão estrutural |
| `postconditions` | Condições produzidas pela conclusão desta etapa | Capítulo 8, extensão estrutural |
| `completionCriteria` | Critérios que determinam a conclusão desta etapa | Capítulo 8, extensão estrutural |

## Planning Constraint

| Propriedade | Descrição | Fonte |
|---|---|---|
| `planId` | Plano ao qual esta restrição se aplica | Capítulo 5 |
| `description` | Descrição da restrição arquitetural | Capítulo 5 |

## Planning Metadata

| Propriedade | Descrição | Fonte |
|---|---|---|
| `planId` | Identificador do plano | Padrão estrutural |
| `createdAt` | Momento de criação do plano | Padrão estrutural |
| `version` | Versão do plano | Padrão estrutural |

---

## Convenções

**Nomenclatura**: `PlanningState` (com `PlanningStage`), `PlanningGoal`, `PlanningStep`, `PlanningConstraint`, `PlanningMetadata`.

**Localização**: `platform/packages/ai/src/PlanningState.ts`, `PlanningGoal.ts`, `PlanningStep.ts`, `PlanningConstraint.ts`, `PlanningMetadata.ts` — mesmo pacote `@abp/ai` já criado para Context, Memory, Orchestrator, Agent Framework e Reasoning (Components 15–19).

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos demais artefatos.

**Compatibilidade**: nenhum vocabulário novo além do já citado nas fontes autorizadas; nenhuma duplicação de artefato já existente; nenhuma importação cruzada de tipo — toda referência é feita por identificador opaco.

---

## Validação

✓ Compatível com `PLANNING_SPECIFICATION.md`, `AI_ORCHESTRATOR.md`, `AGENT_FRAMEWORK.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de artefato já existente.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_20_PLANNING_ARTIFACT_IDENTIFICATION.md`; `AI_ORCHESTRATOR.md`; `AGENT_FRAMEWORK.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
