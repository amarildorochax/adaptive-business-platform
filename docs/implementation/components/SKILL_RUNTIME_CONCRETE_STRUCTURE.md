# Component 21 — Skill Runtime — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos oito artefatos de Skill Runtime. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm), no pacote `platform/packages/ai/` já criado pelos Components 15–20.*

---

## Skill Definition

| Propriedade | Descrição | Fonte |
|---|---|---|
| `skillId` | Identificador da Skill | Capítulo 8 |
| `name` | Nome da Skill | Capítulo 8 |

## Skill State

`SkillLifecycleStage` (union de 3 literais): `"Implemented"`, `"Registered"`, `"Deprecated"` — Capítulo 8.

| Propriedade | Descrição | Fonte |
|---|---|---|
| `skillId` | Skill à qual este estado se refere | Capítulo 8 |
| `stage` | Estágio atual (`SkillLifecycleStage`) | Capítulo 8 |
| `enteredAt` | Momento em que a Skill entrou neste estágio | Capítulo 8 |

## Skill Metadata

| Propriedade | Descrição | Fonte |
|---|---|---|
| `skillId` | Identificador da Skill | Padrão estrutural |
| `createdAt` | Momento de criação | Padrão estrutural |
| `version` | Versão da Skill | Capítulo 8 |

## Skill Capability

| Propriedade | Descrição | Fonte |
|---|---|---|
| `skillId` | Skill associada | `AGENT_FRAMEWORK.md`, Capítulo 13 |
| `capabilityIds` | Capabilities às quais a Skill é relevante | `AGENT_FRAMEWORK.md`, Capítulo 13 |

## Skill Requirement

| Propriedade | Descrição | Fonte |
|---|---|---|
| `skillId` | Skill à qual este requisito se aplica | Capítulo 8 |
| `permissionScope` | Escopo de Permission exigido do Agente solicitante | Capítulo 8 |
| `executionPolicyRequired` | Se uma Execution Policy é aplicável antes da invocação | `AGENT_FRAMEWORK.md`, Capítulo 13 |

## Skill Constraint

| Propriedade | Descrição | Fonte |
|---|---|---|
| `skillId` | Skill à qual esta restrição se aplica | Capítulo 8 |
| `description` | Descrição da restrição arquitetural (ex.: Isolamento) | Capítulo 8 |

## Skill Compatibility

| Propriedade | Descrição | Fonte |
|---|---|---|
| `skillId` | Skill à qual esta compatibilidade se aplica | Capítulo 8 |
| `compatibleVersions` | Versões com as quais a Skill permanece compatível | Capítulo 8 |

## Skill Result

| Propriedade | Descrição | Fonte |
|---|---|---|
| `skillId` | Skill à qual este formato de resultado se aplica | `AGENT_FRAMEWORK.md`, Capítulo 13 |
| `resultFormat` | Descrição do formato estruturado e previsível esperado | `AGENT_FRAMEWORK.md`, Capítulo 13 |

---

## Convenções

**Nomenclatura**: `SkillDefinition`, `SkillState` (com `SkillLifecycleStage`), `SkillMetadata`, `SkillCapability`, `SkillRequirement`, `SkillConstraint`, `SkillCompatibility`, `SkillResult`.

**Localização**: `platform/packages/ai/src/SkillDefinition.ts`, `SkillState.ts`, `SkillMetadata.ts`, `SkillCapability.ts`, `SkillRequirement.ts`, `SkillConstraint.ts`, `SkillCompatibility.ts`, `SkillResult.ts` — mesmo pacote `@abp/ai` já criado para os Components 15–20.

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos demais artefatos.

**Compatibilidade**: nenhum vocabulário novo além do já citado nas fontes autorizadas; nenhuma duplicação de artefato já existente; nenhuma importação cruzada de tipo — toda referência é feita por identificador opaco.

---

## Validação

✓ Compatível com `SKILL_RUNTIME_SPECIFICATION.md`, `AI_ARCHITECTURE.md`, `AGENT_FRAMEWORK.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de artefato já existente.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_21_SKILL_RUNTIME_ARTIFACT_IDENTIFICATION.md`; `AI_ARCHITECTURE.md`; `AGENT_FRAMEWORK.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
