# Component 13 — Knowledge Hub — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos sete artefatos de Knowledge Hub. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm), no pacote `platform/packages/platform-services/` já criado pelo Component 12.*

---

## Knowledge Type

| Propriedade | Descrição | Fonte |
|---|---|---|
| `KnowledgeType` (union de 12 literais: `"Documento"`, `"Artigo"`, `"Procedimento"`, `"Manual"`, `"FAQ"`, `"Política"`, `"Contrato"`, `"Catálogo"`, `"Produto"`, `"Serviço"`, `"Template"`, `"Fluxo"`) | Doze tipos nomeados do Modelo de Conhecimento | Seção 8 |

---

## Knowledge Asset

| Propriedade | Descrição | Fonte |
|---|---|---|
| `assetId` | Identificador do ativo de conhecimento | Seção 8 |
| `tenantId` | Tenant ao qual o ativo pertence — isolamento absoluto | ADR-011 |
| `type` | Tipo do ativo (`KnowledgeType`) | Seção 8 |
| `category?` | Categoria, quando atribuída | Seção 7, 8 |
| `tags` | Tags associadas | Seção 7, 8 |

---

## Knowledge Version

| Propriedade | Descrição | Fonte |
|---|---|---|
| `assetId` | Ativo ao qual esta versão pertence | Seção 9 |
| `version` | Número da versão | Seção 7, 9 |
| `recordedAt` | Momento em que esta versão foi registrada | Seção 9 |

---

## Knowledge Lifecycle State

| Propriedade | Descrição | Fonte |
|---|---|---|
| `KnowledgeLifecycleStage` (union de 9 literais: `"Criação"`, `"Revisão"`, `"Aprovação"`, `"Publicação"`, `"Indexação"`, `"Uso"`, `"Atualização"`, `"Arquivamento"`, `"Recuperação"`) | Nove estágios do Ciclo de Vida | Seção 9 |
| `assetId` | Ativo ao qual este estado se refere | Seção 9 |
| `stage` | Estágio atual (`KnowledgeLifecycleStage`) | Seção 9 |
| `enteredAt` | Momento em que o ativo entrou neste estágio | Seção 9 |

---

## Index Entry

| Propriedade | Descrição | Fonte |
|---|---|---|
| `assetId` | Ativo indexado | Seção 7 |
| `indexedAt` | Momento em que o ativo foi indexado | Seção 7 |

---

## Search Query / Search Result

| Elemento | Propriedade | Descrição | Fonte |
|---|---|---|---|
| `SearchQuery` | `tenantId`, `text` | Consulta de busca, restrita ao Tenant | Seção 7, 10; ADR-011 |
| `SearchResult` | `assetId`, `rank` | Resultado ranqueado de uma consulta | Seção 7, 10 |

---

## Knowledge Updated Payload

| Propriedade | Descrição | Fonte |
|---|---|---|
| `assetId` | Ativo atualizado | Seção 9 |
| `tenantId` | Tenant ao qual o ativo pertence | ADR-011 |
| `version` | Versão resultante da atualização | Seção 9 |

---

## Convenções

**Nomenclatura**: `KnowledgeType`, `KnowledgeAsset`, `KnowledgeVersion`, `KnowledgeLifecycleStage`/`KnowledgeLifecycleState` (mesmo arquivo `KnowledgeLifecycleState.ts`), `IndexEntry`, `SearchQuery`/`SearchResult` (mesmo arquivo `Search.ts`), `KnowledgeUpdatedPayload`.

**Localização**: `platform/packages/platform-services/src/KnowledgeType.ts`, `KnowledgeAsset.ts`, `KnowledgeVersion.ts`, `KnowledgeLifecycleState.ts`, `IndexEntry.ts`, `Search.ts`, `KnowledgeUpdatedPayload.ts` — mesmo pacote `@abp/platform-services` já criado para Identity Hub (Component 12).

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos demais artefatos.

**Compatibilidade**: nenhum vocabulário novo além do já citado em `KNOWLEDGE_HUB.md`; nenhuma duplicação de `Event`, `Role`, `Permission`, ou qualquer artefato já implementado no Component 12; nenhuma dependência de `@abp/infrastructure`.

---

## Validação

✓ Compatível com `KNOWLEDGE_SPECIFICATION.md`, `KNOWLEDGE_HUB.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de artefato já existente.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_13_KNOWLEDGE_ARTIFACT_IDENTIFICATION.md`; `KNOWLEDGE_HUB.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
