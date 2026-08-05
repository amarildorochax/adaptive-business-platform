# IMP-016 — Integration Hub Core — Relatório de Migração

**Status:** Concluída. **Pacote:** `@abp/platform-services` (`platform/packages/platform-services`). **Padrão:** Extrair → Adaptar → Portar.

---

## 1. Fonte de Verdade e Confirmação de Escopo

Documento arquitetural oficial: `docs/architecture/INTEGRATION_HUB.md` ("Integration Hub — Arquitetura
de Referência", Documento Técnico Oficial). Cadeia de aprovação complementar confirmada, mesmo padrão
já usado por Identity Hub (Component 12) e Knowledge Hub (Component 13):

- `docs/implementation/components/COMPONENT_14_INTEGRATION_ARTIFACT_IDENTIFICATION.md`
- `docs/implementation/components/COMPONENT_14_INTEGRATION_DESIGN.md`
- `docs/implementation/components/INTEGRATION_SPECIFICATION.md`
- `docs/implementation/components/INTEGRATION_CONCRETE_STRUCTURE.md` (Status: **STRUCTURE APPROVED**)
  — fonte direta dos seis contratos já scaffolded em `platform/packages/platform-services/src/` desde
  a IMP-001
- `docs/implementation/components/COMPONENT_14_INTEGRATION_IMPLEMENTATION_PLAN.md`
- `docs/implementation/components/INTEGRATION_BUILD_VALIDATION_REPORT.md`
- `docs/implementation/components/COMPONENT_14_INTEGRATION_FINAL_VALIDATION_REPORT.md`

### 1.1 Confirmação explícita: Integration Hub ≠ Infrastructure (Component 11)

Existe um **segundo** par de documentos, deliberadamente distinto: `COMPONENT_11_INTEGRATION_RESILIENCE_*`
e `INTEGRATION_RESILIENCE_CONCRETE_STRUCTURE.md` (Status: STRUCTURE APPROVED), que descreve
`WebhookValidation`, `ConnectorProtection` (`RateLimitRule`/`TimeoutPolicy`/`RetryPolicy`/
`CircuitBreakerState`) e `QueuedMessage` — já scaffolded desde a IMP-001, mas em
**`platform/packages/infrastructure/src/`**, fonte `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulos 7 e
12, nunca `INTEGRATION_HUB.md`. `INTEGRATION_CONCRETE_STRUCTURE.md`, seção "Compatibilidade", já
proíbe explicitamente qualquer confusão entre os dois: *"nenhuma duplicação de... WebhookValidation/
ConnectorProtection/QueuedMessage (Component 11); nenhuma dependência de `@abp/infrastructure`"*. Esta
Sprint confirma e preserva essa fronteira — nenhum arquivo criado aqui importa `@abp/infrastructure`,
e nenhuma lógica de Circuit Breaker, Rate Limit, Retry, ou verificação de assinatura de Webhook (todas
já scaffolded no Component 11) foi reimplementada neste pacote. Esse é exatamente o escopo que o
próprio prompt desta Sprint pediu para confirmar: "que o escopo pertence ao Integration Hub e não a
Runtime, AI Core ou Infrastructure" — confirmado.

**Confirmação de pacote-alvo:** `INTEGRATION_CONCRETE_STRUCTURE.md`, seção "Localização", especifica
que os seis contratos vivem em `platform/packages/platform-services/src/` — "mesmo pacote
`@abp/platform-services` já criado para Identity Hub (Component 12) e Knowledge Hub (Component 13)".
Integration Hub nunca teve pacote próprio — é, como Identity e Knowledge, um Platform Service dentro
do mesmo pacote (Phase 3 do `GATE_G2_IMPLEMENTATION_ROADMAP.md`; com esta Sprint, os três Platform
Services daquela Fase — Identity, Knowledge, Integration — estão finalmente completos).

## 2. Auditoria de Legado (`src/`)

Busca pelas treze palavras-chave desta Sprint (integration, connector, provider, adapter, webhook,
api, integration hub, external service, integration manager, synchronization, sync, inbound,
outbound). Resultado: **nenhum legado extraível** — quarto Sprint desta série com esse resultado
(após IMP-012, IMP-013, IMP-014), mas com dois achados de falso amigo particularmente relevantes de
serem registrados por sua proximidade de nome.

### 2.1 Falso amigo confirmado, porém informativo: `src/core/connectors/`

Cinco arquivos — `BaseConnector.ts`, `ConnectorEvents.ts`, `ConnectorManager.ts`,
`ConnectorRegistry.ts`, `ConnectorTypes.ts` — genuinamente antecipam o conceito de Connector externo,
mas **100% inertes**: `ConnectorTypes.ts` autodocumentado "Sem definições nesta etapa";
`ConnectorRegistry.ts` é um `Map` genérico, autodocumentado "hoje sempre vazio, já que nenhum conector
concreto existe ainda"; `ConnectorManager.ts` e `BaseConnector.ts` têm apenas stubs de ciclo de vida
vazios ("ainda sem lógica de negócio"); `ConnectorEvents.ts` declara `ConnectorEventTypes = {}`,
autodocumentado "Nenhum nome de evento é definido nesta etapa". Nenhuma linha de lógica real existe
para extrair — mas o próprio nome e a intenção documentada confirmam, do lado do legado, que
Integration/Connector sempre foi reconhecido como capacidade futura nunca implementada, consistente
com o escopo desta Sprint ser a primeira a de fato construí-la.

### 2.2 Falso amigo confirmado, de maior escala: `src/app/integrations/`

O maior falso amigo de nome já encontrado nesta série. `src/app/integrations/index.ts` autodocumenta
sua própria responsabilidade: *"a ÚNICA porta oficial de comunicação entre o Frontend e o Core
v1.0"* — um pipeline de RPC interno **Frontend↔Core** (Sprint 30/31A do legado: contracts, adapters,
mappers, pipeline, middlewares, executor, registry), nunca comunicação com sistema externo de
terceiro. Mesmo padrão de colisão de nome puro já visto entre `ExecutionContext` do Runtime (IMP-013,
correlação/Tenant/Identidade) e `ExecutionContext` do Integration Pipeline legado
(moduleId/attempt/startedAt) — aqui a colisão é de escala ainda maior, o próprio termo "integrations"
nomeando um diretório inteiro de dezenas de arquivos que não têm nenhuma relação com o Integration Hub
desta Sprint. Nenhuma linha deste diretório foi consultada como precedente de forma ou de lógica.

### 2.3 Outros falsos amigos confirmados, menores

- `src/core/ai/AIProviderFactory.ts`/`AIProviderRegistry.ts` — já migrados pela IMP-010 (AI Hub); a
  palavra "Provider" aqui refere-se exclusivamente a provedor de modelo de linguagem (OpenAI, Claude,
  Gemini), já coberto pela Provider Layer do AI Hub, nunca um Provider externo de negócio genérico.
- `src/core/notifications/` — menciona "webhook" apenas em prosa de comentário; pertence ao domínio de
  Notification (Communication Hub), sem nenhuma implementação de Webhook real.

**Conclusão da auditoria:** nenhuma linha de lógica de negócio foi portada de `src/legado` — o legado
relevante é (a) uma antecipação genuína, mas inteiramente vazia, do próprio conceito de Connector, ou
(b) um falso amigo de nome em outra camada da plataforma (Frontend↔Core RPC, AI Provider Layer,
Notification).

## 3. Contratos Reutilizados (Foundation, IMP-001)

Os seis contratos já existentes desde a IMP-001 foram confirmados, lidos por completo, e
**reutilizados sem nenhuma alteração de campo**:

| Contrato | Campos | Situação |
|---|---|---|
| `Protocol` | `type Protocol = string` (opaco, nenhum protocolo privilegiado) | Reaproveitado sem alteração |
| `Connector` | `connectorId`, `name`, `protocol`, `version`, `capabilities` | Reaproveitado sem alteração |
| `ConnectorConfiguration` | `connectorId`, `tenantId`, `parameters` | Reaproveitado sem alteração |
| `ConnectorContract` | `connectorId`, `contractVersion` | Reaproveitado sem alteração |
| `WebhookRegistration` | `connectorId`, `tenantId`, `endpoint` | Reaproveitado sem alteração |
| `WebhookDelivery` | `connectorId`, `tenantId`, `receivedAt` | Reaproveitado sem alteração |

**Nenhuma Entity nova foi criada nesta Sprint** — mesmo padrão já estabelecido pela IMP-013 (Runtime)
e pela IMP-014 (AI Agents). Notavelmente ausentes do conjunto aprovado — e portanto nunca inventados
por esta Sprint — três elementos do "Modelo de Integração" (Capítulo 8) que o próprio texto do
Blueprint descreve em prosa: **Connection** (a instância ativa por Tenant — `ConnectorConfiguration`
já cumpre esse papel estrutural, sem Entity própria), **Credentials/Secret** (deliberadamente ausentes
— "nenhuma credencial é exposta a um Hub de domínio consumidor", ADR-007, e a IAM/Identity Hub já
administra `Credential` como conceito próprio, IMP-011) e **Request/Response** (o ciclo de vida de uma
chamada síncrona individual, correspondendo a "conectores reais para provedores externos", já
explicitamente fora de escopo desta Sprint).

## 4. Achado — Integration Hub Tem Catálogo Formal, Parcialmente Coberto pelo Core

Como o Knowledge Hub (IMP-015), o Integration Hub **tem** catálogo formal em `COMMAND_CATALOG.md` e
`EVENT_CATALOG.md`, com Owner/Produtor "Integration Hub":

| Command | Evento(s) publicado(s) | Implementado nesta Sprint |
|---|---|---|
| `CreateConnector` | `ConnectorCreated` | ✅ Sim |
| `RegisterWebhook` | `WebhookDelivered` | ✅ Sim |
| `ImportData` | `ImportCompleted` | ❌ Não — ver Seção 6 |
| `ExportData` | `ExportCompleted` | ❌ Não — ver Seção 6 |
| `SynchronizeData` | `SynchronizationCompleted` | ❌ Não — ver Seção 6 |
| — (nenhum Command catalogado) | `APIRegistered` | ❌ Não — ver Seção 6 |

Mesma convenção genérica já estabelecida pelo pacote desde a IMP-001 (`KnowledgeUpdatedPayload.ts`,
confirmada e reaplicada pela IMP-015): `Command<TPayload>`/`Event<TPayload>` de `@abp/core`, nunca um
wrapper local `{Hub}Command`/`{Hub}Event`. Dois arquivos de payload novos: `CreateConnectorPayload`
(entrada do Command `CreateConnector`) e `RegisterWebhookPayload` (entrada do Command
`RegisterWebhook`) — os dois Eventos correspondentes (`ConnectorCreated`, `WebhookDelivered`)
reaproveitam diretamente a forma dos próprios `Connector`/`WebhookDelivery` já aprovados como
`Event<Connector>`/`Event<WebhookDelivery>`, sem exigir um payload de saída dedicado, simplificação
que a IMP-015 não pôde aplicar (o `KnowledgeAsset` já existia por trás de `KnowledgeCreatedPayload`,
mas o catálogo pedia campos mais específicos que a Entity completa).

`IntegrationOperationResult<TEntity> = { result, command?, events? }` — mesma forma opcional já usada
por Knowledge Hub, CRM, Communication, Finance e Growth.

### 4.1 Decisão arquitetural — "RegisterWebhook" nunca cria um `WebhookRegistration`

A leitura literal do nome do Command `RegisterWebhook` sugeriria criar um `WebhookRegistration`
(registro de endpoint). O texto do próprio `COMMAND_CATALOG.md`, porém, descreve outra operação:
*"processar notificação técnica recebida de sistema externo... Pré-condições: Webhook validado quanto
à origem e à assinatura... Pós-condições: Webhook processado e encaminhado ao Hub proprietário
correspondente"* — isso é o processamento de uma **notificação já recebida** em um endpoint **já
registrado**, produzindo um `WebhookDelivery`, nunca a criação do próprio endpoint. Esta Sprint
implementa os dois como operações distintas e nomeadas de forma a nunca confundi-las:
`IntegrationManager.registerWebhookEndpoint()` (Webhook Manager, sem Command catalogado, cria
`WebhookRegistration`) e `IntegrationManager.registerWebhook()` (Command "RegisterWebhook" catalogado,
cria `WebhookDelivery`). O nome do método público que implementa o Command segue exatamente o nome
oficial do Command, mesma disciplina já aplicada em toda a série — a ambiguidade é registrada em
comentário extenso em `RegisterWebhookPayload.ts` e neste relatório, nunca silenciosamente absorvida.

A verificação de origem e de assinatura, precondição explícita do Command, nunca é reimplementada
aqui — pertence ao Webhook Security/`WebhookValidation` (Component 11, `@abp/infrastructure`), fora de
escopo por proibição explícita de dependência (Seção 1.1). `registerWebhook()` assume que a validação,
quando implementada por uma Sprint futura de Integration Resilience, já aconteceu antes da chamada —
mesma disciplina de "tecnologia concreta de resolução fora de escopo" já aplicada a
`DispatcherService.dispatch(succeeded)` no Runtime (IMP-013).

## 5. Componentes Implementados

### 5.1 Repository Interfaces (5)

`ConnectorRepository`, `ConnectorConfigurationRepository`, `ConnectorContractRepository`,
`WebhookRegistrationRepository`, `WebhookDeliveryRepository`. `Connector`, `ConnectorContract` e
`WebhookDelivery` são fatos observacionais imutáveis — sem `update` nem `remove`.
`ConnectorConfiguration` também nunca tem `update` — cada reconfiguração é um novo registro imutável,
e a vigente é sempre a última em ordem de inserção, mesma disciplina de "nunca ordenar por timestamp
para decidir o mais recente" já aplicada a `CredentialService.matches` (IMP-011).
`WebhookRegistration` é única por par Connector/Tenant, sem histórico de reconfiguração modelado nesta
Sprint (endpoint reconfigurável seria médio prazo).

### 5.2 Services (5)

| Service | Componente Interno implementado (Capítulo 7) |
|---|---|
| `ConnectorService` | Connector Registry |
| `ConnectorConfigurationService` | Configuration Manager |
| `ConnectorContractService` | Contract (parte do Connector Registry/versionamento) |
| `WebhookRegistrationService` | Webhook Manager (registro de endpoint) |
| `WebhookDeliveryService` | Processamento de notificação recebida (metade "Core" do Event Bridge — normalização completa em Evento interno permanece fora de escopo, ver Seção 6) |

**Decisão arquitetural registrada — proporcionalidade de Componentes sem contrato próprio.** O
Capítulo 7 nomeia 29 Componentes Internos — o maior catálogo de qualquer domínio já migrado nesta
série, superando até o Knowledge Hub (26). Dos 29, apenas cinco têm Entity aprovada correspondente no
Core (`Connector`, `ConnectorConfiguration`, `ConnectorContract`, `WebhookRegistration`,
`WebhookDelivery`). Connector Registry, Connector Manager (ciclo de vida operacional) e Provider
Manager foram consolidados em `ConnectorService`, pela mesma razão já registrada para o Knowledge Hub
(IMP-015): nenhum dos três tem sub-estrutura própria além dos campos já presentes em `Connector`.
Connector Lifecycle Manager, Connector Versioning, Credential Manager, Secrets Manager, Credential
Vault, Authentication Adapter, OAuth Manager, API Key Manager, Webhook Validator, Webhook Security,
REST/GraphQL/SOAP/gRPC/SFTP/Generic API Connector, Event Bridge, Message Router, Queue Bridge,
Transformation Engine, Mapping Engine, Schema Validator, Serialization Manager, Retry Manager, Rate
Limit Manager, Circuit Breaker, Dead Letter Queue, Integration Monitor, Integration Analytics, Health
Manager, Connector Sandbox, Connector Testing Engine e Connector Marketplace — os 24 restantes — não
correspondem a nenhum Entity/Repository já aprovado e/ou pertencem explicitamente a fases posteriores
do Roadmap (médio/longo prazo, Capítulo 17) ou a Component 11 (Integration Resilience, já scaffolded
em outro pacote) — ver Seção 6.

### 5.3 IntegrationManager

Implementa o "Integration Manager" (Capítulo 7): "ponto de entrada e orquestrador central... coordena
os demais componentes especializados e garante consistência antes de qualquer chamada externa, sem
implementar, ele mesmo, a lógica técnica de nenhum Connector individual." Orquestra as duas operações
com Command/Event catalogado (`createConnector`, `registerWebhook`) e três operações sem Command
próprio (`configureConnector`, `registerContract`, `registerWebhookEndpoint`). Nunca contém lógica
própria de registro, de configuração, ou de processamento — cada chamada delega integralmente a
exatamente um Service.

## 6. Fora de Escopo — Registrado Explicitamente

- **`ImportData`/`ExportData`/`SynchronizeData`** — catalogados em `COMMAND_CATALOG.md` com Owner
  Integration Hub, mas **nenhuma Entity aprovada** os sustenta (nenhum "ImportExecution"/
  "ExportExecution"/"SynchronizationExecution" existe em `INTEGRATION_CONCRETE_STRUCTURE.md`), e o
  próprio Roadmap do Blueprint (Capítulo 17) reserva cobertura completa de Conector — pré-requisito
  real destas três operações — para médio prazo, nunca curto prazo ("No curto prazo, a prioridade é o
  Integration Manager, o Connector Registry, a Connector Factory e o suporte pleno a REST e a
  Webhook" — nunca menciona Import/Export/Synchronize). Implementá-las exigiria inventar uma Entity
  ausente do Blueprint aprovado; a lacuna é registrada, nunca preenchida silenciosamente.
- **`APIRegistered`** — catalogado em `EVENT_CATALOG.md`, mas **nenhum Command o publica** em
  `COMMAND_CATALOG.md` — mesma situação já registrada para `SemanticIndexUpdated` no Knowledge Hub
  (IMP-015). Provavelmente associado ao "Generic API Connector" (Capítulo 7), ele mesmo já fora de
  escopo (ver abaixo). Não implementado.
- **Conectores reais para provedores externos** (REST/GraphQL/SOAP/gRPC/SFTP/Generic API Connector, e
  todo o catálogo do Capítulo 10 — WhatsApp, Stripe, Google Ads etc.) — explicitamente fora de escopo
  pela própria Sprint; nenhuma implementação de protocolo real, nenhuma chamada de rede.
- **Autenticação OAuth completa, API Key Manager, Credential Manager, Secrets Manager, Credential
  Vault** — explicitamente fora de escopo; a IAM/Identity Hub (IMP-011) já administra `Credential`
  como conceito de plataforma, nunca duplicado aqui; nenhuma credencial real é resolvida ou
  transmitida por este Core.
- **SDKs específicos, gateways proprietários** — explicitamente fora de escopo; nenhuma biblioteca de
  terceiro integrada.
- **MCP** — mencionado apenas no já registrado `PRE_IMP_014_ROADMAP_AUDIT.md` como pertencente a
  `AI_HUB_ARCHITECTURE.md` (Linhagem BP-series, ainda não migrada por nenhuma Sprint IMP); nunca
  mencionado por `INTEGRATION_HUB.md`.
- **Dashboard** — Capítulo 14 menciona um "Dashboard" de observabilidade operacional consolidado, mas
  corresponde à Experience/Presentation Layer (Phase 7 original de `GATE_G2_IMPLEMENTATION_ROADMAP.md`),
  nunca migrado por nenhuma Sprint IMP até o momento.
- **Circuit Breaker, Rate Limit Manager, Retry Manager, Dead Letter Queue** — já scaffolded como
  `ConnectorProtection`/`QueuedMessage` no Component 11 (`@abp/infrastructure`), explicitamente fora do
  pacote e da dependência permitida desta Sprint (Seção 1.1).
- **Event Bridge (normalização completa em Evento interno consumido pelo Event Bus)** — esta Sprint
  implementa apenas o registro de que uma notificação foi recebida (`WebhookDelivery`); a normalização
  para o formato de Evento interno do `SYSTEM_BLUEPRINT.md`, Capítulo 7, e a publicação real no Event
  Bus permanecem fora de escopo, coerente com "conectores reais" estarem excluídos.

## 7. ACL

Nenhuma linha desta Sprint importa `@abp/crm-hub`, `@abp/communication-hub`, `@abp/content-hub`,
`@abp/growth-hub`, `@abp/commerce-hub`, `@abp/finance-hub`, `@abp/analytics-hub`,
`@abp/automation-engine`, `@abp/ai`, `@abp/ai-agents`, `@abp/runtime`, ou `@abp/infrastructure`.
`connectorId`/`tenantId` são sempre identificadores opacos. Todo uso do genérico
`Command<TPayload>`/`Event<TPayload>` vem exclusivamente de `@abp/core`, já uma dependência existente
do pacote.

## 8. Validação

```
pnpm typecheck   → 17/17 pacotes, sucesso
pnpm build       → 17/17 pacotes + apps/web (vite build), sucesso
pnpm lint        → sucesso
pnpm test        → 273/273 testes, 81/81 arquivos de teste (suíte inteira do monorepo)
```

**Testes desta Sprint:** 14 testes em 6 arquivos (`ConnectorService`, `ConnectorConfigurationService`,
`ConnectorContractService`, `WebhookRegistrationService`, `WebhookDeliveryService`,
`IntegrationManager`), cobrindo: versão inicial de Connector, isolamento de Configuration por
Tenant e "vigente é sempre a mais recente", versionamento de Contract, isolamento de
WebhookRegistration por par Connector/Tenant, filtragem de WebhookDelivery por Connector, e presença/
ausência de `command`/`events` no resultado do Manager exatamente nas duas operações com Command
catalogado — incluindo um teste dedicado confirmando que `registerWebhookEndpoint` e `registerWebhook`
produzem entidades estruturalmente distintas (`WebhookRegistration` vs. `WebhookDelivery`).

## 9. Resumo

| Item | Contagem |
|---|---|
| Entities novas | 0 (todas as seis já existiam desde a IMP-001) |
| Entities reaproveitadas sem alteração | 6 (`Protocol`, `Connector`, `ConnectorConfiguration`, `ConnectorContract`, `WebhookRegistration`, `WebhookDelivery`) |
| Command/Event payload novos | 2 (`CreateConnectorPayload`, `RegisterWebhookPayload`) |
| Repository interfaces | 5 |
| Services | 5 |
| Manager | 1 (`IntegrationManager`) |
| Commands implementados | 2 de 5 já catalogados (`CreateConnector`, `RegisterWebhook`) |
| Events implementados | 2 de 6 já catalogados (`ConnectorCreated`, `WebhookDelivered`) |
| Testes novos | 14 |
| Arquivos de legado (`src/`) com lógica real extraída | 0 (todo legado é placeholder inerte ou falso amigo de nome) |
