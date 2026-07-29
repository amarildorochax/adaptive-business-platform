# Identity Hub Specification

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento especifica, em nível exclusivamente documental, o contrato conceitual dos sete artefatos já identificados em `COMPONENT_12_IDENTITY_ARTIFACT_IDENTIFICATION.md`.*

---

## Objective

Definir propósito, responsabilidade e restrições de Identity, Authentication Result, Authorization Decision, Session, Role/Permission, Security Context e Access Audit Record.

---

## Covered Artifacts

- Identity
- Authentication Result
- Authorization Decision
- Session
- Role / Permission
- Security Context
- Access Audit Record

---

## Identity

**Architectural Purpose**: representar o identificador persistente de quem uma pessoa ou um sistema é dentro da plataforma, através do tempo.

**Conceptual Objective**: sustentar, como base compartilhada pelos demais artefatos, a noção de identidade já exigida por `IDENTITY_HUB.md`, Seção 2.

**Architectural Responsibility**: apenas identificar — nenhum dado de perfil, nenhum modelo de Usuário/Tenant/Organização (pertencentes a `SAAS_ARCHITECTURE.md`, fora das fontes autorizadas).

**Explicitly Out of Scope**: modelo completo de Usuário, Tenant, Organização; qualquer campo pessoal.

---

## Authentication Result

**Architectural Purpose**: registrar que uma identidade foi confirmada como estando por trás de uma requisição.

**Conceptual Objective**: sustentar a etapa de Authentication já exigida em `IDENTITY_HUB.md`, Seção 6.

**Architectural Responsibility**: apenas registrar o resultado — nenhum mecanismo de verificação de credencial.

**Explicitly Out of Scope**: senha, Passkey, OAuth, OIDC, SAML, MFA, ou qualquer mecanismo concreto de autenticação.

---

## Authorization Decision

**Architectural Purpose**: registrar o resultado de uma decisão sobre o que uma identidade já autenticada tem permissão de fazer.

**Conceptual Objective**: sustentar a etapa de Authorization já exigida em `IDENTITY_HUB.md`, Seção 6, posterior à Authentication (ADR-006).

**Architectural Responsibility**: apenas registrar a decisão já resolvida — nenhuma lógica de resolução RBAC/ABAC/Policy.

**Explicitly Out of Scope**: RBAC Engine, ABAC Engine, Policy Engine, ou qualquer motor de avaliação.

---

## Session

**Architectural Purpose**: registrar o ciclo de vida de uma autenticação ativa, incluindo o Claim de Tenant exigido pelo isolamento multiempresa.

**Conceptual Objective**: sustentar Criação, Renovação, Expiração e Revogação já exigidas em `IDENTITY_HUB.md`, Seção 11, e o isolamento de Tenant já exigido na Seção 13.

**Architectural Responsibility**: apenas registrar — nenhuma lógica de expiração automática, nenhum mecanismo de armazenamento distribuído.

**Constraints**: toda Session carrega `tenantId`, satisfazendo Tenant Isolation sem artefato próprio adicional.

**Explicitly Out of Scope**: Device, Trust Engine, cálculo de nível de confiança.

---

## Role / Permission

**Architectural Purpose**: declarar Papel como agrupamento reutilizável de Permissões, e Permissão como unidade atômica de autorização.

**Conceptual Objective**: sustentar o modelo RBAC já exigido em `IDENTITY_HUB.md`, Seções 7 e 8.

**Architectural Responsibility**: apenas declarar — nenhuma lista fixa de Papéis nomeados (pertencente a `SAAS_ARCHITECTURE.md`, fora das fontes autorizadas), nenhum mecanismo de resolução.

**Explicitly Out of Scope**: ABAC, Policy, oito Papéis nomeados de `SAAS_ARCHITECTURE.md`.

---

## Security Context

**Architectural Purpose**: representar o conjunto já resolvido de identidade, tenant, sessão e papéis, consumível por qualquer Hub sem nova consulta ao Identity Hub.

**Conceptual Objective**: sustentar o conceito de Claims já descrito em `IDENTITY_HUB.md`, Seção 10.

**Architectural Responsibility**: apenas representar o resultado já resolvido — nenhuma lógica de resolução ou de emissão de Token.

**Explicitly Out of Scope**: Token, Scope, mecanismo de serialização ou de assinatura.

---

## Access Audit Record

**Architectural Purpose**: registrar de forma imutável uma decisão de acesso relevante — concessão, negação, ou mudança de Permissão.

**Conceptual Objective**: sustentar a Auditoria obrigatória já exigida em `IDENTITY_HUB.md`, Seções 5 (ADR-007) e 15.

**Architectural Responsibility**: apenas registrar — nenhum mecanismo real de persistência imutável, nenhuma lógica de retenção.

**Explicitly Out of Scope**: Security Event Manager, Identity Analytics, mecanismo de alerta.

---

## Shared Constraints

- Nenhum vocabulário de negócio.
- Reside no agrupamento **Platform Services**, pacote `@abp/platform-services`.
- Nenhum provedor concreto de autenticação, criptografia, banco de usuários, login, ou interface.
- Nenhuma duplicação de contrato já existente (`Event`, `PlatformError`, `EventPublisher`/`EventSubscriber`).
- Nenhuma dependência de `@abp/infrastructure` — Platform Services depende apenas de Core e Shared.

---

## Open Decisions

- **Nome de arquivo e localização** — resolvidos em `IDENTITY_CONCRETE_STRUCTURE.md`.
- **Tecnologia/linguagem** — já resolvida por convenção preexistente.

---

## Validation Strategy

✓ Nenhum provedor concreto.
✓ Session carrega `tenantId` (Tenant Isolation).
✓ Authorization Decision sucede Authentication Result conceitualmente (Authentication Before Authorization).
✓ Nenhuma duplicação de contrato já existente.

---

## Traceability

| Artefato | Fonte |
|---|---|
| Todos | `COMPONENT_12_IDENTITY_ARTIFACT_IDENTIFICATION.md`; `IDENTITY_HUB.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | SPECIFICATION APPROVED |
| Version | 1.0 |
| Author | Claude |
