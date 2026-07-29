# Knowledge Hub Specification

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento especifica, em nível exclusivamente documental, o contrato conceitual dos sete artefatos já identificados em `COMPONENT_13_KNOWLEDGE_ARTIFACT_IDENTIFICATION.md`.*

---

## Objective

Definir propósito, responsabilidade e restrições de Knowledge Type, Knowledge Asset, Knowledge Version, Knowledge Lifecycle State, Index Entry, Search Query/Search Result e Knowledge Updated Payload.

---

## Covered Artifacts

- Knowledge Type
- Knowledge Asset
- Knowledge Version
- Knowledge Lifecycle State
- Index Entry
- Search Query / Search Result
- Knowledge Updated Payload

---

## Knowledge Type

**Architectural Purpose**: nomear os doze tipos de conhecimento já estabelecidos pelo Modelo de Conhecimento.

**Conceptual Objective**: sustentar a Classificação já exigida em `KNOWLEDGE_HUB.md`, Seção 8.

**Architectural Responsibility**: apenas nomear — nenhuma lógica de determinação automática de tipo (Classification Engine, fora de escopo).

**Explicitly Out of Scope**: Classification Engine, sugestão automática de Categoria.

---

## Knowledge Asset

**Architectural Purpose**: representar um registro individual de conhecimento — seu tipo, Tenant, categoria e tags.

**Conceptual Objective**: sustentar o princípio Metadata First já exigido em `KNOWLEDGE_HUB.md`, Seção 5.

**Architectural Responsibility**: apenas representar — nenhum armazenamento real, nenhuma extração de conteúdo (Document Parser, fora de escopo).

**Constraints**: todo Knowledge Asset carrega `tenantId`, satisfazendo isolamento de Tenant (ADR-011) sem artefato próprio adicional.

**Explicitly Out of Scope**: Repository Manager, Document Manager, Document Parser, Metadata Engine, Tag Manager, Category Manager.

---

## Knowledge Version

**Architectural Purpose**: registrar uma versão preservável de um Knowledge Asset.

**Conceptual Objective**: sustentar Knowledge Versioning já exigido em `KNOWLEDGE_HUB.md`, Seção 9 e ADR-005.

**Architectural Responsibility**: apenas registrar — nenhuma lógica de reconstrução de estado passado ou de diff.

**Explicitly Out of Scope**: Knowledge History, mecanismo de comparação entre versões.

---

## Knowledge Lifecycle State

**Architectural Purpose**: nomear os nove estágios do Ciclo de Vida do Conhecimento e registrar o estágio atual de um Knowledge Asset.

**Conceptual Objective**: sustentar o Ciclo de Vida já exigido em `KNOWLEDGE_HUB.md`, Seção 9.

**Architectural Responsibility**: apenas registrar — nenhuma lógica de transição entre estágios, nenhuma validação de política por categoria (Knowledge Lifecycle Manager, fora de escopo).

**Explicitly Out of Scope**: Knowledge Lifecycle Manager, Approval Workflow, Retention Manager, Knowledge Archive, Knowledge Recovery.

---

## Index Entry

**Architectural Purpose**: registrar que um Knowledge Asset foi indexado e está pesquisável.

**Conceptual Objective**: sustentar a Indexação já exigida em `KNOWLEDGE_HUB.md`, Seção 7 (Index Manager).

**Architectural Responsibility**: apenas registrar — nenhum mecanismo real de indexação, nenhuma representação vetorial.

**Explicitly Out of Scope**: Embedding Manager, banco vetorial, motor de busca concreto.

---

## Search Query / Search Result

**Architectural Purpose**: representar uma consulta de busca e seu resultado ranqueado.

**Conceptual Objective**: sustentar a Busca já exigida em `KNOWLEDGE_HUB.md`, Seções 7 e 10.

**Architectural Responsibility**: apenas representar consulta e resultado — nenhum mecanismo de cálculo de Relevância ou de Ranking.

**Explicitly Out of Scope**: Keyword Search, Semantic Search, Hybrid Search, Embedding, motor de busca concreto.

---

## Knowledge Updated Payload

**Architectural Purpose**: declarar o conteúdo do evento `KnowledgeUpdated`, já nomeado em `SYSTEM_BLUEPRINT.md`.

**Conceptual Objective**: sustentar a propagação de mudança de conhecimento já exigida em `KNOWLEDGE_HUB.md`, Seção 9.

**Architectural Responsibility**: apenas declarar o `payload` — o envelope genérico do Evento já existe em `Event<TPayload>` (`@abp/core`), nunca redefinido aqui.

**Explicitly Out of Scope**: Publishing Engine, mecanismo real de publicação no Event Bus.

---

## Shared Constraints

- Nenhum vocabulário de negócio.
- Reside no agrupamento **Platform Services**, pacote `@abp/platform-services` (já criado pelo Component 12).
- Nenhum banco vetorial, motor de busca concreto, Embedding real, ou modelo de IA.
- Nenhuma duplicação de contrato já existente (`Event`, `PlatformError`, `Role`, `Permission`).
- Nenhuma dependência de `@abp/infrastructure` — Platform Services depende apenas de Core e Shared.

---

## Open Decisions

- **Nome de arquivo e localização** — resolvidos em `KNOWLEDGE_CONCRETE_STRUCTURE.md`.
- **Tecnologia/linguagem** — já resolvida por convenção preexistente.

---

## Validation Strategy

✓ Nenhum mecanismo concreto de busca ou de armazenamento vetorial.
✓ Doze tipos e nove estágios exatamente conforme `KNOWLEDGE_HUB.md`.
✓ Knowledge Asset e Search Query carregam `tenantId`.
✓ Nenhuma duplicação de contrato já existente.

---

## Traceability

| Artefato | Fonte |
|---|---|
| Todos | `COMPONENT_13_KNOWLEDGE_ARTIFACT_IDENTIFICATION.md`; `KNOWLEDGE_HUB.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | SPECIFICATION APPROVED |
| Version | 1.0 |
| Author | Claude |
