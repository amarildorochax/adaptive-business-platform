# Component 11 — Integration Resilience — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos três artefatos de Integration Resilience. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm, `platform/packages/infrastructure/`).*

---

## Webhook Validation

| Propriedade | Descrição | Fonte |
|---|---|---|
| `webhookId` | Identificador do Webhook recebido | Capítulo 12 |
| `originVerified` | Se a origem foi verificada | Capítulo 12 |
| `signatureVerified` | Se a assinatura foi verificada | Capítulo 12 |
| `receivedAt` | Momento do recebimento | Capítulo 12 |

---

## Connector Protection

| Elemento | Propriedade | Descrição | Fonte |
|---|---|---|---|
| `RateLimitRule` | `connectorName`, `maxRequests`, `windowSeconds` | Limite de chamadas por Connector em uma janela de tempo | Capítulo 12 |
| `TimeoutPolicy` | `connectorName`, `timeoutMs` | Tempo máximo de espera por resposta | Capítulo 12 |
| `RetryPolicy` | `connectorName`, `maxAttempts` | Número máximo de tentativas, preservando Idempotência | Capítulo 7 |
| `CircuitBreakerState` | `connectorName`, `isOpen`, `openedAt?` | Se a comunicação com o Connector está temporariamente interrompida | Capítulo 7 |

### Regras Obrigatórias
Todos os quatro elementos são identificados por `connectorName` — aplicação individual por Connector, nunca global.

---

## Queued Message

| Propriedade | Descrição | Fonte |
|---|---|---|
| `queueName` | Nome da Fila que absorveu a mensagem | Capítulo 12 |
| `messageId` | Identificador da mensagem | Capítulo 12 |
| `receivedAt` | Momento em que a mensagem foi absorvida pela Fila | Capítulo 12 |

---

## Convenções

**Nomenclatura**: `WebhookValidation`, `RateLimitRule`/`TimeoutPolicy`/`RetryPolicy`/`CircuitBreakerState` (mesmo arquivo `ConnectorProtection.ts`), `QueuedMessage`.

**Localização**: `platform/packages/infrastructure/src/WebhookValidation.ts`, `ConnectorProtection.ts`, `QueuedMessage.ts` — mesmo pacote `@abp/infrastructure` já criado para Observability e Data.

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos demais artefatos.

**Compatibilidade**: nenhum vocabulário novo além do já citado em `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulos 7 e 12; nenhuma duplicação de `Event`, `PlatformError`, ou `EventPublisher`/`EventSubscriber` já implementados.

---

## Validação

✓ Compatível com `INTEGRATION_RESILIENCE_SPECIFICATION.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de artefato já existente.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_11_INTEGRATION_RESILIENCE_ARTIFACT_IDENTIFICATION.md`; `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulos 7 e 12 |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
