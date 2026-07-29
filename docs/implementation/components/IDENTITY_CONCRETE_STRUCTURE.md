# Component 12 — Identity Hub — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos sete artefatos de Identity Hub. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm), em novo pacote `platform/packages/platform-services/`, primeiro pacote do agrupamento Platform Services.*

---

## Identity

| Propriedade | Descrição | Fonte |
|---|---|---|
| `Identity` (type alias de `string`) | Identificador persistente de quem uma pessoa ou sistema é | Seção 2 |

---

## Authentication Result

| Propriedade | Descrição | Fonte |
|---|---|---|
| `identity` | Identidade confirmada | Seção 2, 6 |
| `authenticatedAt` | Momento da confirmação | Seção 6 |

---

## Authorization Decision

| Propriedade | Descrição | Fonte |
|---|---|---|
| `identity` | Identidade cuja Permissão foi avaliada | Seção 2, 7 |
| `action` | Ação avaliada | Seção 7 |
| `permitted` | Se a ação foi permitida | Seção 2, 7 |
| `decidedAt` | Momento da decisão | Seção 7 |

---

## Session

| Propriedade | Descrição | Fonte |
|---|---|---|
| `sessionId` | Identificador da Sessão | Seção 8 |
| `identity` | Identidade autenticada | Seção 8 |
| `tenantId` | Claim de Tenant, verificado a cada requisição | Seção 13 |
| `createdAt` | Momento da criação | Seção 11 |
| `expiresAt` | Momento de expiração | Seção 11 |
| `revokedAt?` | Momento de revogação, quando revogada | Seção 11 |

---

## Role / Permission

| Elemento | Propriedade | Descrição | Fonte |
|---|---|---|---|
| `Role` (type alias de `string`) | — | Papel — agrupamento reutilizável de Permissões | Seção 8 |
| `Permission` | `name` | Permissão — unidade atômica de autorização | Seção 8 |

---

## Security Context

| Propriedade | Descrição | Fonte |
|---|---|---|
| `identity` | Identidade já resolvida | Seção 10 |
| `tenantId` | Tenant já resolvido | Seção 10, 13 |
| `sessionId` | Sessão à qual este contexto se refere | Seção 10 |
| `roles` | Papéis já resolvidos, consumíveis sem nova consulta | Seção 10 |

---

## Access Audit Record

| Propriedade | Descrição | Fonte |
|---|---|---|
| `identity` | Identidade cuja decisão de acesso foi registrada | Seção 7, 15 |
| `tenantId` | Tenant no qual a decisão ocorreu | Seção 7, 15 |
| `action` | Ação avaliada | Seção 7 |
| `granted` | Se o acesso foi concedido | Seção 7 |
| `recordedAt` | Momento do registro | Seção 15 |

---

## Convenções

**Nomenclatura**: `Identity`, `AuthenticationResult`, `AuthorizationDecision`, `Session`, `Role`/`Permission` (mesmo arquivo `Role.ts`), `SecurityContext`, `AccessAuditRecord`.

**Localização**: `platform/packages/platform-services/src/Identity.ts`, `AuthenticationResult.ts`, `AuthorizationDecision.ts`, `Session.ts`, `Role.ts`, `SecurityContext.ts`, `AccessAuditRecord.ts` — novo pacote `@abp/platform-services`, seguindo exatamente a mesma convenção de `package.json`/`tsconfig.json` já usada em `@abp/infrastructure`.

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos demais artefatos.

**Compatibilidade**: nenhum vocabulário novo além do já citado em `IDENTITY_HUB.md`; nenhuma duplicação de `Event`, `PlatformError`, ou `EventPublisher`/`EventSubscriber` já implementados; nenhuma dependência de `@abp/infrastructure`.

---

## Validação

✓ Compatível com `IDENTITY_SPECIFICATION.md`, `IDENTITY_HUB.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de artefato já existente.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_12_IDENTITY_ARTIFACT_IDENTIFICATION.md`; `IDENTITY_HUB.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
