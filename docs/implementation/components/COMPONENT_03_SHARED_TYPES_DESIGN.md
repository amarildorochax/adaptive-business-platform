# Component 03 — Shared Types Design

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento inicia, para o Component 03 — Shared Types, a mesma cadeia documental já estabelecida no Component 01 e consolidada no Component 02: Design → Implementation Plan → README → Conformance Review (se necessário) → Build → Final Validation → Sprint Update. Ele não cria arquitetura, não define implementação, não escolhe linguagem, e não cria nenhum tipo novo além dos três já conceituados em documentos aprovados.*

---

## Objective

Documentar o design do componente Shared Types, cujo objetivo já está fixado em `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3: *"realizar a forma genérica de Command, de Evento e de Query, tal como já conceituados em `COMMAND_CATALOG.md`, `EVENT_CATALOG.md` e `QUERY_CATALOG.md`"*.

Este documento não define a forma concreta desses tipos — organiza o design conceitual sobre o qual `COMPONENT_03_IMPLEMENTATION_PLAN.md` se apoiará.

---

## Scope

**Dentro do escopo deste componente:**
- Documentar o propósito e os princípios da forma genérica de Command, Evento e Query — o vocabulário comum já reservado, como conceito, no agrupamento **Core** de `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3.
- Preparar, em nível de design, a base para os três arquivos previstos em `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3.

**Fora do escopo deste componente:**
- Definir campo, estrutura de dado concreta, ou forma final de qualquer um dos três tipos.
- Escolher linguagem, framework, ou tecnologia.
- Redefinir qualquer Command, Evento ou Query específico já descrito em cada Business Hub.

---

## Architectural Context

O componente Shared Types é o terceiro dos oito componentes da Sprint 1 — Core Foundation, sucedendo Dependency Management. Sua posição está registrada em `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 4 (Dependency Graph): *"Dependency Management → Shared Types: o vocabulário comum de Command, Evento e Query, já catalogado em `COMMAND_CATALOG.md`, `EVENT_CATALOG.md` e `QUERY_CATALOG.md`, precisa de um local governado por regra de dependência antes de ser escrito, para que nenhum outro módulo o consuma de forma indevida desde sua origem."*

`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 (Grouping Responsibilities), já reserva o espaço arquitetural para este componente dentro do agrupamento **Core**, não do agrupamento **Shared**: *"Core — Espaço da forma genérica de Command, Evento e Query (Shared Types) e dos contratos abstratos de Ownership e de mediação (Base Contracts). Nenhum vocabulário de domínio específico reside aqui."* **Nota de precisão terminológica**: o nome do componente na Sprint ("Shared Types") não corresponde ao agrupamento "Shared" do Manifesto — o espaço reservado para Shared Types é o agrupamento **Core**. Este documento preserva essa distinção para evitar ambiguidade.

`GATE_G2_IMPLEMENTATION_ROADMAP.md` não nomeia "Shared Types" como entidade — sua granularidade é de Fase, não de componente de Sprint. **Ausência registrada**: nenhuma menção nominal a "Shared Types" existe em `GATE_G2_IMPLEMENTATION_ROADMAP.md`; nenhum conteúdo foi inventado para preencher essa ausência. Ainda assim, a Seção 6 (Implementation Phases) do mesmo documento identifica a base técnica da **Phase 1 — Foundation** nestes termos: *"Core Foundation: contratos de Ownership, Command, Evento, Query já catalogados tornam-se a base técnica sobre a qual tudo o mais é construído."* Esta é a âncora de Fase sob a qual o componente Shared Types se insere.

A forma genérica de Command, Evento e Query que este componente organiza já está integralmente conceituada em `BUSINESS_HUB_ARCHITECTURE.md` (ver Design Principles abaixo).

---

## Design Principles

Os princípios de design deste componente já estão fixados em `BUSINESS_HUB_ARCHITECTURE.md` — este documento não os redefine:

- **Intenção antes de Fato** — *"Commands representam uma intenção de mudança dentro do domínio... distintos de Domain Event porque um Command ainda não aconteceu, é uma solicitação, enquanto um Evento já é um fato consumado"* (`BUSINESS_HUB_ARCHITECTURE.md`, Seção 7).
- **Publish Facts, Not Commands** — *"Um Business Hub publica o que aconteceu — um Fato consumado, já ocorrido —, nunca uma instrução do que outro Hub deveria fazer"* (`BUSINESS_HUB_ARCHITECTURE.md`, Seção 5).
- **Query como leitura explícita e excepcional entre Hubs** — *"apenas os Domain Events, e ocasionalmente uma Query explícita quando estritamente necessária, atravessam essa fronteira"* (`BUSINESS_HUB_ARCHITECTURE.md`, Seção 7).
- **Contratos formalizam o formato** — *"Contratos formalizam o formato de todo Evento e de toda Query eventualmente exposta entre Hubs, versionados conforme já estabelecido no princípio Backward Compatibility"* (`BUSINESS_HUB_ARCHITECTURE.md`, Seção 9).

---

## Shared Types Principles

O propósito dos tipos compartilhados (Shared Types) é fornecer a **forma genérica** — o vocabulário estrutural comum — que qualquer Command, Evento ou Query específico de domínio, já catalogado em cada Business Hub, segue estruturalmente. Este propósito já está fixado em `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3: o agrupamento Core é o "espaço da forma genérica de Command, Evento e Query", e "nenhum vocabulário de domínio específico reside aqui".

Este componente:
- **Não define implementação** — nenhuma estrutura de dado concreta, nenhum campo, nenhuma classe ou tipo de linguagem é especificado por este documento.
- **Não cria novos tipos** — Command, Evento e Query já são as três categorias conceituadas em `BUSINESS_HUB_ARCHITECTURE.md`; este componente realiza sua forma genérica, sem introduzir uma quarta categoria ou subtipo novo.
- **Não define linguagem** — nenhuma tecnologia ou linguagem de programação é escolhida por este componente.

---

## Out of Scope

- Definição de campo, estrutura de dado concreta, ou forma final de Command, Evento ou Query.
- Escolha de linguagem, framework, ou qualquer tecnologia.
- Redefinição de qualquer Command, Evento ou Query específico já descrito em `CRM_HUB.md`, `COMMUNICATION_HUB.md`, `FINANCE_HUB.md`, `GROWTH_HUB.md`, `ANALYTICS_HUB.md`, ou nos demais documentos de Platform Services e AI.
- Criação de categoria além de Command, Evento e Query.
- Alteração da Dependency Matrix ou de qualquer definição de agrupamento já fixada em `platform/PACKAGE_STRUCTURE_MANIFEST.md`.

---

## Design Decisions

Este documento não introduz nenhuma decisão de design nova. As únicas decisões referenciadas já estão aprovadas nas fontes abaixo:

| Decisão | Fonte já aprovada |
|---|---|
| Shared Types reside no agrupamento Core, não no agrupamento Shared | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 |
| Shared Types é o terceiro componente da Sprint 1, sucedendo Dependency Management | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 4 |
| A forma genérica não contém nenhum vocabulário de domínio específico | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 |
| Command expressa intenção ainda não ocorrida; Evento expressa fato já consumado | `BUSINESS_HUB_ARCHITECTURE.md`, Seção 7 |

Nenhuma decisão arquitetural nova foi tomada na criação deste documento.

---

## Traceability

| Seção deste documento | Fonte |
|---|---|
| Objective | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3 |
| Scope | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3; `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 |
| Architectural Context | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 4; `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3; `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 6 (ausência nominal registrada) |
| Design Principles | `BUSINESS_HUB_ARCHITECTURE.md`, Seções 5, 7 e 9 |
| Shared Types Principles | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 |
| Out of Scope | `platform/PACKAGE_STRUCTURE_MANIFEST.md` (limites já fixados) |
| Design Decisions | `platform/PACKAGE_STRUCTURE_MANIFEST.md`; `SPRINT_01_IMPLEMENTATION_BACKLOG.md`; `BUSINESS_HUB_ARCHITECTURE.md` |

**Documentos ausentes identificados durante a elaboração**: `GATE_G2_IMPLEMENTATION_ROADMAP.md` não nomeia "Shared Types" como entidade própria (ver Architectural Context). Nenhum conteúdo foi inventado para suprir essa ausência.

---

## Approval

| Campo | Valor |
|---|---|
| Status | DESIGN DOCUMENT APPROVED |
| Version | 1.0 |
| Author | Claude |
