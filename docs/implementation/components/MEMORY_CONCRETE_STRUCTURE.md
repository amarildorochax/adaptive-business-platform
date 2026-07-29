# Component 16 — Memory — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos onze artefatos de Memory. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm), no pacote `platform/packages/ai/` já criado pelo Component 15.*

---

## MemoryType

`MemoryType` (union de 2 literais): `"ShortDuration"`, `"LongDuration"` — Capítulo 11 (`AI_HUB.md`).

## MemoryScope

`MemoryScope` (union de 5 literais): `"Efêmera"`, `"Persistente"`, `"Compartilhada"`, `"Contextual"`, `"Organizacional"` — Capítulo 11 (`AI_ARCHITECTURE.md`).

## MemoryOwnership

`MemoryOwnership` (union de 3 literais): `"Empresa"`, `"Usuário"`, `"IA"` — Capítulo 11 (`AI_HUB.md`).

## MemoryEntry

| Propriedade | Descrição | Fonte |
|---|---|---|
| `memoryId` | Identificador da entrada de memória | Cap. 11 (`AI_HUB.md`) |
| `tenantId` | Tenant ao qual a entrada pertence — isolamento absoluto | Cap. 11 (`AI_ARCHITECTURE.md`) |
| `type` | Natureza (`MemoryType`) | Cap. 11 (`AI_HUB.md`) |
| `scope` | Categoria de alcance (`MemoryScope`) | Cap. 11 (`AI_ARCHITECTURE.md`) |
| `ownership` | Titularidade (`MemoryOwnership`) | Cap. 11 (`AI_HUB.md`) |
| `createdAt` | Momento da criação | Cap. 9 (`AGENT_FRAMEWORK.md`) |

## MemoryLifecycle

| Propriedade | Descrição | Fonte |
|---|---|---|
| `memoryId` | Entrada à qual este estado se refere | Cap. 9 (`AGENT_FRAMEWORK.md`) |
| `writtenAt` | Momento da Escrita autorizada | Cap. 9 (`AGENT_FRAMEWORK.md`) |
| `lastAccessedAt?` | Momento do último acesso de Leitura | Cap. 9 (`AGENT_FRAMEWORK.md`) |
| `expiresAt?` | Momento de expiração, quando aplicável | Cap. 11 (`AI_HUB.md`) |

## MemoryRetention

| Propriedade | Descrição | Fonte |
|---|---|---|
| `scope` | Escopo ao qual esta política se aplica | Cap. 11 (`AI_HUB.md`) |
| `type` | Tipo ao qual esta política se aplica | Cap. 11 (`AI_HUB.md`) |
| `minimumRetentionDays` | Prazo mínimo de retenção, em dias | Cap. 11 (`AI_HUB.md`) |

## MemoryPolicy

| Propriedade | Descrição | Fonte |
|---|---|---|
| `scope` | Escopo ao qual esta política se aplica | Cap. 9 (`AGENT_FRAMEWORK.md`) |
| `type` | Tipo ao qual esta política se aplica | Cap. 9 (`AGENT_FRAMEWORK.md`) |
| `readable` | Se este compartimento é legível | Cap. 9 (`AGENT_FRAMEWORK.md`) |
| `writable` | Se este compartimento é gravável | Cap. 9 (`AGENT_FRAMEWORK.md`) |

## MemoryVersion

| Propriedade | Descrição | Fonte |
|---|---|---|
| `memoryId` | Entrada versionada | Cap. 11 (`AI_ARCHITECTURE.md`) |
| `version` | Número da versão | Cap. 11 (`AI_ARCHITECTURE.md`) |
| `recordedAt` | Momento em que esta versão foi registrada | Cap. 11 (`AI_ARCHITECTURE.md`) |

## MemoryReference

`MemorySourceKind` (union de 3 literais): `"Event"`, `"Read Model"`, `"Knowledge"` — Cap. 11 (`AI_ARCHITECTURE.md`).

| Propriedade | Descrição | Fonte |
|---|---|---|
| `memoryId` | Entrada referenciada | Cap. 11 (`AI_ARCHITECTURE.md`) |
| `sourceKind` | Natureza da origem (`MemorySourceKind`) | Cap. 11 (`AI_ARCHITECTURE.md`) |
| `sourceId` | Identificador da origem exata | Cap. 11 (`AI_ARCHITECTURE.md`) |

## MemoryValidation

| Propriedade | Descrição | Fonte |
|---|---|---|
| `memoryId` | Entrada validada | Cap. 11 (`AI_ARCHITECTURE.md`) |
| `reconstructable` | Se a entrada é reconstruível a partir de sua `MemoryReference` | Cap. 11 (`AI_ARCHITECTURE.md`) |
| `sourceOfTruthRespected` | Se a entrada não se tornou, ela mesma, fonte de verdade paralela | Cap. 11 (`AI_ARCHITECTURE.md`) |
| `validatedAt` | Momento da validação | Cap. 11 (`AI_ARCHITECTURE.md`) |

## MemoryQuality

| Propriedade | Descrição | Fonte |
|---|---|---|
| `memoryId` | Entrada qualificada | Cap. 11 (`AI_ARCHITECTURE.md`), por analogia |
| `relevance` | Relevância da entrada | `CONTEXT_FRAMEWORK.md`, Cap. 9, por analogia |
| `confidence` | Confiança associada à entrada | `CONTEXT_FRAMEWORK.md`, Cap. 9, por analogia |

---

## Convenções

**Nomenclatura**: `MemoryType`, `MemoryScope`, `MemoryOwnership`, `MemoryEntry`, `MemoryLifecycle`, `MemoryRetention`, `MemoryPolicy`, `MemoryVersion`, `MemoryReference` (com `MemorySourceKind`), `MemoryValidation`, `MemoryQuality`.

**Localização**: `platform/packages/ai/src/MemoryType.ts`, `MemoryScope.ts`, `MemoryOwnership.ts`, `MemoryEntry.ts`, `MemoryLifecycle.ts`, `MemoryRetention.ts`, `MemoryPolicy.ts`, `MemoryVersion.ts`, `MemoryReference.ts`, `MemoryValidation.ts`, `MemoryQuality.ts` — mesmo pacote `@abp/ai` já criado para Context (Component 15).

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos demais artefatos.

**Compatibilidade**: nenhum vocabulário novo além do já citado nas fontes autorizadas; nenhuma duplicação de `Event`, `PlatformError`, ou de qualquer artefato já implementado em Context, Infrastructure, ou Platform Services; nenhuma dependência real de outro pacote.

---

## Validação

✓ Compatível com `MEMORY_SPECIFICATION.md`, `AI_HUB.md`, `AI_ARCHITECTURE.md`, `AGENT_FRAMEWORK.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de artefato já existente.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_16_MEMORY_ARTIFACT_IDENTIFICATION.md`; `AI_HUB.md`; `AI_ARCHITECTURE.md`; `AGENT_FRAMEWORK.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
