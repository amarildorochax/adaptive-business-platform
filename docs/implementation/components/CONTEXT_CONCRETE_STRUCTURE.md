# Component 15 — Context — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos onze artefatos de Context. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm), em novo pacote `platform/packages/ai/`, primeiro pacote do agrupamento AI.*

---

## Context Layer

`ContextLayer` (union de 9 literais): `"Global"`, `"Organization"`, `"Business"`, `"Tenant"`, `"User"`, `"Session"`, `"Conversation"`, `"Task"`, `"Execution"` — Capítulo 5.

## Context Source

`ContextSource` (union de 10 literais): `"Business Hubs"`, `"Knowledge Hub"`, `"Identity"`, `"Analytics"`, `"Communication"`, `"Automation"`, `"Policies"`, `"Events"`, `"Queries"`, `"External Systems"` — Capítulo 6.

## Context

| Propriedade | Descrição | Fonte |
|---|---|---|
| `contextId` | Identificador do Contexto | Capítulo 4 |
| `tenantId` | Tenant ao qual o Contexto pertence | Capítulo 5 |
| `layer` | Camada (`ContextLayer`) | Capítulo 5 |
| `sources` | Origens que compõem este Contexto | Capítulo 6 |
| `createdAt` | Momento da criação | Capítulo 7 |

## Context Quality

| Propriedade | Descrição | Fonte |
|---|---|---|
| `contextId` | Contexto ao qual esta qualidade se refere | Capítulo 9 |
| `relevance`, `freshness`, `confidence`, `consistency`, `completeness`, `sensitivity`, `priority`, `businessValue` | Oito atributos numéricos de qualidade | Capítulo 9 |
| `ownership` | Origem responsável (`ContextSource`) | Capítulo 9, 14 |
| `traceability` | Referência rastreável até a origem exata | Capítulo 9 |

## Context Validation Result

| Propriedade | Descrição | Fonte |
|---|---|---|
| `contextId` | Contexto validado | Capítulo 8 |
| `validated`, `consistent`, `ownershipRespected`, `intact`, `trustworthy` | Cinco verificações booleanas | Capítulo 8 |

## Context Budget

| Propriedade | Descrição | Fonte |
|---|---|---|
| `contextId` | Contexto orçado | Capítulo 11 |
| `weight`, `cost`, `priority`, `value`, `risk` | Cinco fatores numéricos | Capítulo 11 |
| `expiresAt` | Momento de expiração | Capítulo 11 |
| `dependencies` | Identificadores de informação dependente | Capítulo 11 |

## Context Compression Record

`ContextCompressionTechnique` (union de 5 literais): `"Resumo"`, `"Redução"`, `"Agrupamento"`, `"Remoção"`, `"Preservação"` — Capítulo 12.

| Propriedade | Descrição | Fonte |
|---|---|---|
| `contextId` | Contexto comprimido | Capítulo 12 |
| `technique` | Técnica aplicada (`ContextCompressionTechnique`) | Capítulo 12 |
| `appliedAt` | Momento da aplicação | Capítulo 12 |
| `acceptableLoss` | Se a perda envolvida foi comunicada como aceitável | Capítulo 12 (No Silent Loss) |

## Context Distribution

| Propriedade | Descrição | Fonte |
|---|---|---|
| `contextId` | Contexto distribuído | Capítulo 13 |
| `recipientId` | Destinatário do subconjunto distribuído | Capítulo 13 |
| `scope` | Escopo do subconjunto entregue | Capítulo 13 |
| `distributedAt` | Momento da distribuição | Capítulo 13 |

## Context Ownership

`ContextCategory` (union de 8 literais): `"Customer Context"`, `"Financial Context"`, `"Campaign Context"`, `"Metrics Context"`, `"Knowledge Context"`, `"Identity Context"`, `"Communication Context"`, `"Automation Context"` — Capítulo 14.

| Propriedade | Descrição | Fonte |
|---|---|---|
| `category` | Categoria de Contexto (`ContextCategory`) | Capítulo 14 |
| `owner` | Módulo proprietário oficial | Capítulo 14 |

## Context Lifecycle State

`ContextLifecycleStage` (union de 13 literais): `"Create"`, `"Collect"`, `"Normalize"`, `"Validate"`, `"Score"`, `"Prioritize"`, `"Compress"`, `"Distribute"`, `"Consume"`, `"Observe"`, `"Update"`, `"Expire"`, `"Archive"` — Capítulo 15.

| Propriedade | Descrição | Fonte |
|---|---|---|
| `contextId` | Contexto ao qual este estado se refere | Capítulo 15 |
| `stage` | Estágio atual (`ContextLifecycleStage`) | Capítulo 15 |
| `enteredAt` | Momento em que o Contexto entrou neste estágio | Capítulo 15 |

## Context Version

| Propriedade | Descrição | Fonte |
|---|---|---|
| `contextId` | Contexto versionado | Capítulo 16 |
| `version` | Número da versão | Capítulo 16 |
| `supersededAt?` | Momento em que esta versão foi substituída, quando aplicável | Capítulo 16 |

---

## Convenções

**Nomenclatura**: `ContextLayer`, `ContextSource`, `Context`, `ContextQuality`, `ContextValidationResult`, `ContextBudget`, `ContextCompressionRecord` (com `ContextCompressionTechnique`), `ContextDistribution`, `ContextOwnership` (com `ContextCategory`), `ContextLifecycleState` (com `ContextLifecycleStage`), `ContextVersion`.

**Localização**: `platform/packages/ai/src/ContextLayer.ts`, `ContextSource.ts`, `Context.ts`, `ContextQuality.ts`, `ContextValidationResult.ts`, `ContextBudget.ts`, `ContextCompressionRecord.ts`, `ContextDistribution.ts`, `ContextOwnership.ts`, `ContextLifecycleState.ts`, `ContextVersion.ts` — novo pacote `@abp/ai`, seguindo exatamente a mesma convenção de `package.json`/`tsconfig.json` já usada em `@abp/infrastructure` e `@abp/platform-services`.

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos demais artefatos.

**Compatibilidade**: nenhum vocabulário novo além do já citado em `CONTEXT_FRAMEWORK.md`; nenhuma duplicação de `Event`, `PlatformError`, `Role`, `Permission`, `KnowledgeAsset`, ou de qualquer artefato já implementado em Infrastructure ou Platform Services; nenhuma dependência real de outro pacote.

---

## Validação

✓ Compatível com `CONTEXT_SPECIFICATION.md`, `CONTEXT_FRAMEWORK.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de artefato já existente.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_15_CONTEXT_ARTIFACT_IDENTIFICATION.md`; `CONTEXT_FRAMEWORK.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
