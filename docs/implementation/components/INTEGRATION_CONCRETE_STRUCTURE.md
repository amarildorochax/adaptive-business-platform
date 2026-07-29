# Component 14 — Integration Hub — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos seis artefatos de Integration Hub. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm), no pacote `platform/packages/platform-services/` já criado pelo Component 12.*

---

## Protocol

| Propriedade | Descrição | Fonte |
|---|---|---|
| `Protocol` (type alias de `string`) | Identificador opaco de protocolo, nenhum valor concreto nomeado | Seção 9 |

---

## Connector

| Propriedade | Descrição | Fonte |
|---|---|---|
| `connectorId` | Identificador do Connector | Seção 8 |
| `name` | Nome do Connector | Seção 7, 8 |
| `protocol` | Protocolo utilizado (`Protocol`) | Seção 9 |
| `version` | Versão vigente | Seção 7, 8 |
| `capabilities` | Capacidades declaradas | Seção 7 |

---

## Connector Configuration

| Propriedade | Descrição | Fonte |
|---|---|---|
| `connectorId` | Connector ao qual esta Configuration se aplica | Seção 8 |
| `tenantId` | Tenant ao qual esta Configuration pertence | Seção 5 (Tenant Awareness) |
| `parameters` | Parâmetros específicos da instância | Seção 8 |

---

## Connector Contract

| Propriedade | Descrição | Fonte |
|---|---|---|
| `connectorId` | Connector ao qual este Contract se aplica | Seção 8 |
| `contractVersion` | Versão do Contract | Seção 8; ADR-005 |

---

## Webhook Registration

| Propriedade | Descrição | Fonte |
|---|---|---|
| `connectorId` | Connector ao qual este endpoint pertence | Seção 7 |
| `tenantId` | Tenant ao qual este endpoint pertence | Seção 7 |
| `endpoint` | Endpoint de recebimento registrado | Seção 7 |

---

## Webhook Delivery

| Propriedade | Descrição | Fonte |
|---|---|---|
| `connectorId` | Connector que recebeu a notificação | Seção 8 |
| `tenantId` | Tenant ao qual a notificação pertence | Seção 5, 8 |
| `receivedAt` | Momento do recebimento | Seção 8 |

---

## Convenções

**Nomenclatura**: `Protocol`, `Connector`, `ConnectorConfiguration`, `ConnectorContract`, `WebhookRegistration`, `WebhookDelivery`.

**Localização**: `platform/packages/platform-services/src/Protocol.ts`, `Connector.ts`, `ConnectorConfiguration.ts`, `ConnectorContract.ts`, `WebhookRegistration.ts`, `WebhookDelivery.ts` — mesmo pacote `@abp/platform-services` já criado para Identity Hub (Component 12) e Knowledge Hub (Component 13).

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos demais artefatos.

**Compatibilidade**: nenhum vocabulário novo além do já citado em `INTEGRATION_HUB.md`; nenhuma duplicação de `Event`, `Role`, `Permission`, `KnowledgeAsset`, ou de `WebhookValidation`/`ConnectorProtection`/`QueuedMessage` (`platform/packages/infrastructure/src/`, Component 11); nenhuma dependência de `@abp/infrastructure`.

---

## Validação

✓ Compatível com `INTEGRATION_SPECIFICATION.md`, `INTEGRATION_HUB.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de artefato já existente.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_14_INTEGRATION_ARTIFACT_IDENTIFICATION.md`; `INTEGRATION_HUB.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
