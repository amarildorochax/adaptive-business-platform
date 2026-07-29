# Component 15 — Context Design

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento inicia, para o Component 15 — Context (primeiro componente da Sprint 4 — AI Core), a mesma cadeia documental já consolidada nas Sprints 1, 2 e 3.*

---

## Objective

Documentar o design do componente Context, cuja responsabilidade já está fixada em `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.1: *"resolver, construir, validar, pontuar, comprimir e distribuir o Contexto relevante a uma solicitação de IA — o 'Context Operating System' já elevado a sistema próprio"* — fundamentado em `CONTEXT_FRAMEWORK.md` (Official, 22 capítulos) e registrado em `SPRINT_04_IMPLEMENTATION_BACKLOG.md` como Component 15.

---

## Scope

**Dentro do escopo**: as doze abstrações já declaradas para este componente em `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.1, e detalhadas em `CONTEXT_FRAMEWORK.md`, Capítulos 4–16: Context Operating System, Context Layers, Context Sources, Context Builder, Context Validation, Context Quality, Context Scoring, Context Budget, Context Compression, Context Distribution, Context Ownership, Context Lifecycle, Context Evolution.

**Fora do escopo**: qualquer mecanismo concreto de IA, LLM, banco de dados, provedor externo ou framework; ABAC/RBAC (já formalizados no Component 12); Prompt Engine, Orchestrator, Agent Framework (Components 17 e 18, ainda não implementados nesta Sprint); Context Observability (Capítulo 18 de `CONTEXT_FRAMEWORK.md`) — já coberta pelo componente AI Observability (Component 25, posterior nesta Sprint).

---

## Architectural Context

Context é um dos onze componentes da Sprint 4 — AI Core, primeiro a ser implementado, em paralelo a Memory (Component 16), sem dependência entre eles (`SPRINT_04_IMPLEMENTATION_BACKLOG.md`, Seção 4; `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 8). Sucede Platform Services (Phase 3, já concluída) por sequenciamento de Fase, não por dependência de pacote.

Fundamentação em `CONTEXT_FRAMEWORK.md`: diagrama do Context Operating System (Capítulo 4), Context Layers — nove camadas hierárquicas (Capítulo 5), Context Sources — dez origens catalogadas (Capítulo 6), Context Builder — ciclo de quatro fases (Capítulo 7), Context Validation — cinco verificações (Capítulo 8), Context Quality — dez atributos (Capítulo 9), Context Scoring (Capítulo 10), Context Budget — sete elementos (Capítulo 11), Context Compression — seis técnicas (Capítulo 12), Context Distribution (Capítulo 13), Context Ownership — matriz de oito categorias (Capítulo 14), Context Lifecycle — treze etapas (Capítulo 15), Context Evolution (Capítulo 16). Complementado por `AI_HUB.md` (Context Manager, Capítulo 10) e `AI_ARCHITECTURE.md` (Capítulo 12, Contexto).

**Relação com a Foundation e com os componentes já implementados**: nenhum contrato da Foundation (`Command`, `Event`, `Query`, `PlatformError`, `Owned`, `EventPublisher`/`EventSubscriber`, `ConfigurationLoader`, `Logger`) é redefinido. Nenhum artefato de Infrastructure ou de Platform Services (Identity/Knowledge/Integration Hub) é duplicado ou importado.

---

## Design Principles

- **Quality Before Quantity** — nenhuma informação incorporada sem os dez atributos de qualidade já avaliados (`CONTEXT_FRAMEWORK.md`, Capítulo 9).
- **Tenant Isolation is Absolute** — Tenant Context nunca cruza fronteira entre Empresas (Capítulo 5).
- **No Silent Loss** — toda Compressão comunica explicitamente a perda envolvida (Capítulo 12).
- **Ownership rastreável** — toda categoria de Contexto corresponde exatamente ao proprietário já registrado em `DOMAIN_OWNERSHIP_MATRIX.md` (Capítulo 14).
- **Ausência de mecanismo concreto** — nenhum banco vetorial, nenhum LLM, nenhuma tecnologia de composição real.
- **Independência de domínio** — nenhuma referência a regra de negócio específica de Business Hub.

---

## Out of Scope

- Qualquer LLM, banco vetorial, framework de IA, ou tecnologia concreta.
- Prompt Engine, Orchestrator, Agent Framework — dependentes deste componente, mas não implementados nesta tarefa.
- Context Observability (Capítulo 18) — coberta pelo componente AI Observability (Component 25).
- Context Builder como artefato isolado — seu ciclo de quatro fases (Criação/Enriquecimento/Redução/Preparação) é subsumido pelas treze etapas já mais completas de Context Lifecycle.
- Context Scoring como artefato isolado — seu resultado já é capturado pelos campos de pontuação existentes em Context Quality e em Context Budget.
- Escolha de linguagem, framework, ou tecnologia.

---

## Design Decisions

| Decisão | Fonte já aprovada |
|---|---|
| Context é o Component 15, primeiro componente da Sprint 4 | `SPRINT_04_IMPLEMENTATION_BACKLOG.md`, Seção 3 |
| Context reside no agrupamento AI, novo pacote `@abp/ai` | `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.1; `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 2 |
| Doze elementos de escopo, conforme já listados em `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.1 | Escopo já fixado pela Architecture Definition |
| Context não depende de nenhum outro componente da Sprint 4 — paralelo a Memory | `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 8 |

---

## Traceability

| Seção | Fonte |
|---|---|
| Objective / Scope | `CONTEXT_FRAMEWORK.md`, Capítulos 4–16; `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.1 |
| Architectural Context | `SPRINT_04_IMPLEMENTATION_BACKLOG.md`; `AI_HUB.md`; `AI_ARCHITECTURE.md` |
| Design Principles | `CONTEXT_FRAMEWORK.md`, Capítulo 3 |

---

## Approval

| Campo | Valor |
|---|---|
| Status | DESIGN DOCUMENT APPROVED |
| Version | 1.0 |
| Author | Claude |
