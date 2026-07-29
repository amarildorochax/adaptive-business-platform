# Component 22 — Tool Runtime — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos onze artefatos de Tool Runtime. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm), no pacote `platform/packages/ai/` já criado pelos Components 15–21.*

---

## Tool Identity

| Propriedade | Descrição | Fonte |
|---|---|---|
| `toolId` | Identificador da Ferramenta | Capítulo 9 |
| `name` | Nome da Ferramenta | Capítulo 9 |

## Tool Definition

`ToolCategory` (union de 4 literais): `"Integration"`, `"Knowledge"`, `"Query"`, `"ExternalResource"` — Capítulo 9 (diagrama Tool Abstraction).

| Propriedade | Descrição | Fonte |
|---|---|---|
| `toolId` | Ferramenta definida | Capítulo 9 |
| `category` | Categoria de mediação (`ToolCategory`) | Capítulo 9 |

## Tool Lifecycle

`ToolLifecycleStage` (union de 3 literais): `"Implemented"`, `"Registered"`, `"Deprecated"` — por analogia a `SkillLifecycleStage` (Component 21).

## Tool State

| Propriedade | Descrição | Fonte |
|---|---|---|
| `toolId` | Ferramenta à qual este estado se refere | Padrão estrutural |
| `stage` | Estágio atual (`ToolLifecycleStage`) | Padrão estrutural |
| `enteredAt` | Momento em que a Ferramenta entrou neste estágio | Padrão estrutural |

## Tool Capability

| Propriedade | Descrição | Fonte |
|---|---|---|
| `toolId` | Ferramenta associada | `AGENT_FRAMEWORK.md`, Capítulo 14 |
| `capabilityIds` | Capabilities às quais a Ferramenta é relevante | `AGENT_FRAMEWORK.md`, Capítulo 14 |

## Tool Requirement

| Propriedade | Descrição | Fonte |
|---|---|---|
| `toolId` | Ferramenta à qual este requisito se aplica | Capítulo 14 |
| `permissionScope` | Escopo de Permission exigido, herdado da solicitação original | Capítulo 14 |

## Tool Constraint

| Propriedade | Descrição | Fonte |
|---|---|---|
| `toolId` | Ferramenta à qual esta restrição se aplica | Capítulo 9 |
| `description` | Descrição da restrição arquitetural (ex.: Isolamento tecnológico) | Capítulo 9 |

## Tool Compatibility

| Propriedade | Descrição | Fonte |
|---|---|---|
| `toolId` | Ferramenta à qual esta compatibilidade se aplica | Capítulo 14 |
| `compatibleVersions` | Versões com as quais a Ferramenta permanece compatível | Capítulo 14 |

## Tool Parameter

| Propriedade | Descrição | Fonte |
|---|---|---|
| `toolId` | Ferramenta à qual este parâmetro pertence | Capítulo 14 |
| `parameterName` | Nome do parâmetro do contrato estável | Capítulo 14 |
| `required` | Se o parâmetro é obrigatório | Capítulo 14 |

## Tool Result

| Propriedade | Descrição | Fonte |
|---|---|---|
| `toolId` | Ferramenta à qual este formato de resultado se aplica | Padrão estrutural, por analogia |
| `resultFormat` | Descrição do formato esperado do resultado | Padrão estrutural, por analogia |

## Tool Metadata

| Propriedade | Descrição | Fonte |
|---|---|---|
| `toolId` | Identificador da Ferramenta | Padrão estrutural |
| `createdAt` | Momento de criação | Padrão estrutural |
| `version` | Versão da Ferramenta | Padrão estrutural |

---

## Convenções

**Nomenclatura**: `ToolIdentity`, `ToolDefinition` (com `ToolCategory`), `ToolLifecycle` (com `ToolLifecycleStage`), `ToolState`, `ToolCapability`, `ToolRequirement`, `ToolConstraint`, `ToolCompatibility`, `ToolParameter`, `ToolResult`, `ToolMetadata`.

**Localização**: `platform/packages/ai/src/ToolIdentity.ts`, `ToolDefinition.ts`, `ToolLifecycle.ts`, `ToolState.ts`, `ToolCapability.ts`, `ToolRequirement.ts`, `ToolConstraint.ts`, `ToolCompatibility.ts`, `ToolParameter.ts`, `ToolResult.ts`, `ToolMetadata.ts` — mesmo pacote `@abp/ai` já criado para os Components 15–21.

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos demais artefatos.

**Compatibilidade**: nenhum vocabulário novo além do já citado nas fontes autorizadas; nenhuma duplicação de artefato já existente; nenhuma importação cruzada de tipo — toda referência é feita por identificador opaco, exceto `ToolState`, que importa `ToolLifecycleStage` de `ToolLifecycle.ts`, ambos deste mesmo componente.

---

## Validação

✓ Compatível com `TOOL_RUNTIME_SPECIFICATION.md`, `AI_ARCHITECTURE.md`, `AGENT_FRAMEWORK.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de artefato já existente.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_22_TOOL_RUNTIME_ARTIFACT_IDENTIFICATION.md`; `AI_ARCHITECTURE.md`; `AGENT_FRAMEWORK.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
