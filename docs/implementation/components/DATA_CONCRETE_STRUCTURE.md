# Component 10 — Data — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos seis artefatos de Data. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm, `platform/packages/infrastructure/`).*

---

## Consistency

| Elemento | Descrição | Fonte |
|---|---|---|
| `ConsistencyLevel` | `"strong" \| "eventual"` | Capítulo 10 |

---

## Reconciliation

| Propriedade | Descrição | Fonte |
|---|---|---|
| `dataSetName` | Nome do conjunto de dado verificado | Capítulo 10 |
| `checkedAt` | Momento da verificação | Capítulo 10 |
| `discrepanciesFound` | Se divergência foi encontrada entre Read Model e histórico de Evento | Capítulo 10 |

---

## Backup / Restore

| Elemento | Propriedade | Descrição | Fonte |
|---|---|---|---|
| `BackupRecord` | `id`, `dataSetName`, `createdAt`, `verifiedAt?` | Registro de cópia recuperável; `verifiedAt` reflete o teste de restauração real exigido | Capítulo 10 |
| `RestoreRecord` | `backupId`, `restoredAt` | Registro de recuperação a partir de um `BackupRecord` já existente | Capítulo 10 |

### Regras Obrigatórias
`RestoreRecord.backupId` referencia um `BackupRecord.id` já existente.

---

## Data Lifecycle (Retention / Archival)

| Elemento | Propriedade | Descrição | Fonte |
|---|---|---|---|
| `RetentionPolicy` | `dataSetName`, `minimumRetentionDays` | Prazo mínimo de retenção, genérico (sem campo de Empresa/Tenant) | Capítulo 10 |
| `ArchivalRecord` | `dataSetName`, `archivedAt` | Registro de que um conjunto de dado foi arquivado | Capítulo 10 |

---

## Data Version

| Propriedade | Descrição | Fonte |
|---|---|---|
| `recordId` | Identificador do dado versionado | Capítulo 10 |
| `version` | Número da versão | Capítulo 10 |
| `changedAt` | Momento da mudança registrada | Capítulo 10 |

---

## Migration Plan

| Propriedade | Descrição | Fonte |
|---|---|---|
| `id` | Identificador do plano de migração | Capítulo 10 |
| `description` | Descrição da migração | Capítulo 10 |
| `startedAt` | Início da execução | Capítulo 10 |
| `completedAt?` | Conclusão, quando já finalizada | Capítulo 10 |

---

## Convenções

**Nomenclatura**: `ConsistencyLevel`, `ReconciliationReport`, `BackupRecord`/`RestoreRecord`, `RetentionPolicy`/`ArchivalRecord`, `DataVersion`, `MigrationPlan`.

**Localização**: `platform/packages/infrastructure/src/Consistency.ts`, `Reconciliation.ts`, `Backup.ts`, `DataLifecycle.ts`, `DataVersion.ts`, `MigrationPlan.ts` — mesmo pacote `@abp/infrastructure` já criado para Observability.

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos demais artefatos.

**Compatibilidade**: nenhum vocabulário novo além do já citado em `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 10; `DataVersion` é explicitamente distinto de `contractVersion` já existente em Command/Event/Query.

---

## Validação

✓ Compatível com `DATA_SPECIFICATION.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de artefato já existente.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_10_DATA_ARTIFACT_IDENTIFICATION.md`; `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 10 |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
