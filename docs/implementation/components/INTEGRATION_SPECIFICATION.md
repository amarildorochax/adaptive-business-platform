# Integration Hub Specification

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento especifica, em nível exclusivamente documental, o contrato conceitual dos seis artefatos já identificados em `COMPONENT_14_INTEGRATION_ARTIFACT_IDENTIFICATION.md`.*

---

## Objective

Definir propósito, responsabilidade e restrições de Protocol, Connector, Connector Configuration, Connector Contract, Webhook Registration e Webhook Delivery.

---

## Covered Artifacts

- Protocol
- Connector
- Connector Configuration
- Connector Contract
- Webhook Registration
- Webhook Delivery

---

## Protocol

**Architectural Purpose**: identificar, de forma opaca, o protocolo usado por um Connector.

**Conceptual Objective**: sustentar a neutralidade de protocolo já exigida em `INTEGRATION_HUB.md`, Seção 9: *"nenhum desses protocolos recebe tratamento privilegiado na arquitetura."*

**Architectural Responsibility**: apenas identificar — nenhum protocolo concreto nomeado, nenhuma implementação de comunicação.

**Explicitly Out of Scope**: REST, GraphQL, SOAP, gRPC, Webhooks (como protocolo), AMQP, MQTT, SFTP, WebSocket — todos nomeados apenas narrativamente em `INTEGRATION_HUB.md`, nunca elevados a valor concreto.

---

## Connector

**Architectural Purpose**: representar um Connector já registrado — protocolo, versão e capacidades declaradas.

**Conceptual Objective**: sustentar o Connector Registry já exigido em `INTEGRATION_HUB.md`, Seção 7, como "fonte oficial de o que a plataforma sabe se comunicar com o mundo externo."

**Architectural Responsibility**: apenas representar o registro — nenhuma lógica de instanciação (Connector Factory), nenhuma comunicação real com Provider.

**Explicitly Out of Scope**: Connector Factory, Connector Lifecycle Manager, Provider Manager, qualquer Provider nominal.

---

## Connector Configuration

**Architectural Purpose**: representar os parâmetros de uma instância de Connector para um Tenant específico.

**Conceptual Objective**: sustentar Configuration over Code já exigido em `INTEGRATION_HUB.md`, Seção 5.

**Architectural Responsibility**: apenas representar parâmetros — nenhuma credencial, nenhum segredo.

**Constraints**: toda Connector Configuration carrega `tenantId`, satisfazendo Tenant Awareness sem artefato próprio adicional.

**Explicitly Out of Scope**: Credential Manager, Secrets Manager, Credential Vault, Authentication Adapter, OAuth Manager, API Key Manager.

---

## Connector Contract

**Architectural Purpose**: declarar que um Connector possui um formato de entrada e de saída versionado.

**Conceptual Objective**: sustentar Version Everything já exigido em `INTEGRATION_HUB.md`, Seção 5 e ADR-005.

**Architectural Responsibility**: apenas declarar a versão do Contract — nenhum schema real, nenhuma lógica de validação.

**Explicitly Out of Scope**: Schema Validator, Transformation Engine, Mapping Engine, Serialization Manager.

---

## Webhook Registration

**Architectural Purpose**: registrar o endpoint de recebimento de notificação externa, único por Connector e por Tenant.

**Conceptual Objective**: sustentar o Webhook Manager já exigido em `INTEGRATION_HUB.md`, Seção 7.

**Architectural Responsibility**: apenas registrar — nenhuma lógica de recebimento real, nenhuma validação criptográfica.

**Explicitly Out of Scope**: Webhook Validator, Webhook Security (já cobertos por `WebhookValidation.ts`, Component 11).

---

## Webhook Delivery

**Architectural Purpose**: registrar que uma notificação foi recebida através de um Webhook já registrado.

**Conceptual Objective**: sustentar o mecanismo de notificação assíncrona de entrada já exigido em `INTEGRATION_HUB.md`, Seção 8.

**Architectural Responsibility**: apenas registrar o recebimento — nenhuma normalização em evento interno (Event Bridge), nenhuma validação de assinatura (já em `WebhookValidation.ts`, Component 11).

**Explicitly Out of Scope**: Event Bridge, Message Router, mecanismo de validação criptográfica.

---

## Shared Constraints

- Nenhum vocabulário de negócio.
- Reside no agrupamento **Platform Services**, pacote `@abp/platform-services` (já criado pelo Component 12).
- Nenhuma API concreta, cliente HTTP, SDK, protocolo concreto, broker concreto, provedor SaaS, ou mecanismo concreto de autenticação.
- Nenhuma duplicação de contrato já existente (`Event`, `PlatformError`, `Role`, `Permission`, `WebhookValidation`, `ConnectorProtection`, `QueuedMessage`).
- Nenhuma dependência de `@abp/infrastructure` — Platform Services depende apenas de Core e Shared.

---

## Open Decisions

- **Nome de arquivo e localização** — resolvidos em `INTEGRATION_CONCRETE_STRUCTURE.md`.
- **Tecnologia/linguagem** — já resolvida por convenção preexistente.

---

## Validation Strategy

✓ Nenhum protocolo, provedor, ou tecnologia concreta.
✓ Connector Configuration e Webhook Registration carregam `tenantId`.
✓ Nenhuma duplicação de artefato já existente no Component 11.

---

## Traceability

| Artefato | Fonte |
|---|---|
| Todos | `COMPONENT_14_INTEGRATION_ARTIFACT_IDENTIFICATION.md`; `INTEGRATION_HUB.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | SPECIFICATION APPROVED |
| Version | 1.0 |
| Author | Claude |
