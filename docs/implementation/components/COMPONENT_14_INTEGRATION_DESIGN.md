# Component 14 — Integration Hub Design

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento inicia, para o Component 14 — Integration Hub (terceiro e último componente da Sprint 3 — Platform Services), a mesma cadeia documental já consolidada nas Sprints 1, 2 e nos Components 12 e 13.*

---

## Objective

Documentar o design do componente Integration Hub, cuja missão já está fixada em `INTEGRATION_HUB.md`, Seção 2: *"centralizar todas as integrações externas de maneira segura, desacoplada, observável, resiliente e escalável"* — formalizado como componente oficial em `PLATFORM_SERVICES_ARCHITECTURE_DEFINITION.md`, Seção 2.3, e registrado em `SPRINT_03_IMPLEMENTATION_BACKLOG.md` como Component 14.

---

## Scope

**Dentro do escopo**: as abstrações de Connectors, Connector Registry, Connector Configuration, Connector Contract, Endpoint, Webhook Registration, Webhook Delivery, Protocolos de integração, Catálogo de integrações, e Capacidades de integração — exatamente os dez itens já delimitados pela tarefa que originou este componente.

**Fora do escopo**: qualquer API concreta, cliente HTTP, SDK, ou protocolo concreto (REST, GraphQL, gRPC); qualquer broker concreto (RabbitMQ, Kafka); qualquer provedor SaaS ou integração específica (WhatsApp, Stripe, Google Ads, etc.); qualquer mecanismo concreto de autenticação. Connector Factory, Connector Lifecycle Manager, Provider Manager, Credential/Secrets Manager, OAuth/API Key Manager, Event Bridge, Message Router, Queue Bridge, Transformation/Mapping Engine, Retry Manager, Rate Limit Manager, Circuit Breaker, Dead Letter Queue, Integration Monitor/Analytics, Health Manager, Connector Sandbox/Testing Engine/Marketplace — todos já nomeados em `INTEGRATION_HUB.md`, Seção 7, mas não citados entre os dez itens de escopo autorizados por esta tarefa.

**Distinção explícita de `platform/packages/infrastructure/src/`**: `WebhookValidation.ts`, `ConnectorProtection.ts` (Rate Limit/Timeout/Retry/Circuit Breaker) e `QueuedMessage.ts` já implementam, no Component 11 — Integration Resilience (Sprint 2), o substrato técnico de resiliência de comunicação externa, fundamentado em `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulos 7 e 12. Este componente (Component 14) formaliza, em vez disso, o modelo de negócio de integração já descrito em `INTEGRATION_HUB.md`, Seção 8 — Provider, Connector, Configuration, Contract, Webhook — sem redefinir nenhum mecanismo de resiliência já implementado.

---

## Architectural Context

Integration Hub é um dos três componentes da Sprint 3 — Platform Services, paralelo a Identity Hub e Knowledge Hub (ambos já concluídos), sem dependência entre eles (`SPRINT_03_IMPLEMENTATION_BACKLOG.md`, Seção 4; `PLATFORM_SERVICES_ARCHITECTURE_DEFINITION.md`, Seção 3). Sucede Infrastructure (Phase 2, já concluída) por sequenciamento de Fase, não por dependência de pacote.

Fundamentação em `INTEGRATION_HUB.md`: Missão (Seção 2), diagramas de Arquitetura Conceitual (Seção 6: fluxo de saída via Connector Layer/Provider Layer; fluxo de entrada via Webhook), Modelo de Integração (Seção 8: Provider/Connector/Connection/Configuration/Contract/Webhook), Protocolos (Seção 9), Catálogo de Conectores (Seção 10). Complementado por `SYSTEM_BLUEPRINT.md` (Integration Hub como único ponto de saída, serviço transversal de chamada direta síncrona), e por `NON_FUNCTIONAL_REQUIREMENTS.md`, NFR-028 a NFR-032.

**Relação com a Foundation e com os componentes já implementados**: nenhum contrato da Foundation (`Command`, `Event`, `Query`, `PlatformError`, `Owned`, `EventPublisher`/`EventSubscriber`, `ConfigurationLoader`, `Logger`) é redefinido. Nenhum artefato de Infrastructure, Identity Hub (Component 12), ou Knowledge Hub (Component 13) é duplicado ou importado — cada componente de Platform Services permanece independente dos demais.

---

## Design Principles

- **Single Integration Layer** — toda comunicação externa passa por exatamente uma camada (`INTEGRATION_HUB.md`, Seção 5).
- **Provider Independence** — nenhuma lógica assume a permanência de um provedor específico (Seção 5).
- **Version Everything** — todo Connector e todo Contract possuem versão explícita (Seção 5; ADR-005).
- **Tenant Awareness** — toda Configuration e todo registro de integração são associados a exatamente um Tenant (Seção 5).
- **Configuration over Code** — uma nova instância de integração é sempre um ato de configuração (Seção 5).
- **Ausência de mecanismo concreto** — nenhuma API, cliente HTTP, ou protocolo concreto.
- **Independência de domínio** — nenhuma referência a Business Hub ou regra de negócio.

---

## Out of Scope

- Qualquer API concreta, cliente HTTP, SDK, protocolo concreto (REST, GraphQL, gRPC), broker concreto (RabbitMQ, Kafka).
- Qualquer provedor SaaS ou integração específica (WhatsApp, Stripe, Google Ads, e os demais listados em `INTEGRATION_HUB.md`, Seção 10).
- Autenticação concreta (OAuth, API Key como mecanismo real).
- Connector Factory, Provider Manager, Credential/Secrets Manager, Event Bridge, Retry Manager, Rate Limit Manager, Circuit Breaker — presentes em `INTEGRATION_HUB.md`, mas não listados entre os dez itens de escopo já autorizados, e em parte já implementados como substrato técnico distinto em `platform/packages/infrastructure/src/` (Component 11).
- Escolha de linguagem, framework, ou tecnologia.

---

## Design Decisions

| Decisão | Fonte já aprovada |
|---|---|
| Integration Hub é o Component 14, terceiro e último componente da Sprint 3 | `SPRINT_03_IMPLEMENTATION_BACKLOG.md`, Seção 3 |
| Integration Hub reside no agrupamento Platform Services, pacote `@abp/platform-services` (já criado pelo Component 12) | `PLATFORM_SERVICES_ARCHITECTURE_DEFINITION.md`, Seção 2.3; `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 2 |
| Dez abstrações de escopo: Connectors, Connector Registry, Connector Configuration, Connector Contract, Endpoint, Webhook Registration, Webhook Delivery, Protocolos, Catálogo, Capacidades | Escopo já fixado pela tarefa que originou este componente |
| Integration Hub não depende de Identity Hub nem de Knowledge Hub | `PLATFORM_SERVICES_ARCHITECTURE_DEFINITION.md`, Seção 3 |
| Nenhum mecanismo de resiliência técnica (Rate Limit, Retry, Timeout, Circuit Breaker) é redefinido — já implementado em `platform/packages/infrastructure/src/ConnectorProtection.ts` (Component 11) | `INFRASTRUCTURE_ARCHITECTURE_DEFINITION.md`, Seção 2.3 |

---

## Traceability

| Seção | Fonte |
|---|---|
| Objective / Scope | `INTEGRATION_HUB.md`, Seções 2, 6, 7, 8, 9, 10; `PLATFORM_SERVICES_ARCHITECTURE_DEFINITION.md`, Seção 2.3 |
| Architectural Context | `SPRINT_03_IMPLEMENTATION_BACKLOG.md`; `SYSTEM_BLUEPRINT.md`; `NON_FUNCTIONAL_REQUIREMENTS.md`, NFR-028 a 032 |
| Design Principles | `INTEGRATION_HUB.md`, Seções 4 e 5 |

---

## Approval

| Campo | Valor |
|---|---|
| Status | DESIGN DOCUMENT APPROVED |
| Version | 1.0 |
| Author | Claude |
