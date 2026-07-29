# Architectural Principles for Shared Types

**Adaptive Business Platform · Architecture Decision Record**

Status: Proposed
Category: Architecture Decision Record
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Esta é a primeira decisão arquitetural inédita registrada durante a implementação da Adaptive Business Platform — até este ponto, toda decisão de execução (Decision Log da Sprint 1) foi de natureza operacional, nunca arquitetural. Este documento define exclusivamente os princípios que deverão orientar a futura definição da estrutura concreta de Generic Command, Generic Event e Generic Query. Ele não define nenhum campo, nenhum tipo de dado, nenhuma linguagem, nenhum algoritmo, e não implementa nenhum dos três artefatos.*

**Nota sobre a forma deste documento**: os 327 ADRs já catalogados em `docs/architecture/ADR_INDEX.md` são todos registrados como entradas numeradas dentro de um documento proprietário já existente (um Hub, um Blueprint, ou um Catálogo). Esta decisão é, por definição, a primeira que não pertence a nenhum domínio, Hub ou catálogo já publicado — ela nasce da execução da Sprint 1 (Component 03), não de um dos vinte e quatro documentos de Volume I. Por isso, ela é registrada como um documento próprio em `docs/architecture/ADR/`, em vez de uma entrada numerada em um documento já existente. Esta observação é feita para preservar rastreabilidade; nenhuma alteração foi feita a `ADR_INDEX.md` ou a qualquer documento proprietário por este registro.

---

## Context

`STRUCTURE_GAP_CONFIRMATION.md` confirmou formalmente, com base em `SHARED_TYPES_STRUCTURE_AUDIT.md`, que a Open Decision "Estrutura de dado concreta" — para os três artefatos previstos do Component 03 (Generic Command, Generic Event, Generic Query) — **representa uma lacuna arquitetural real**, não resolvível pela documentação hoje existente, e que sua resolução **exigirá uma nova decisão arquitetural** (`STRUCTURE_GAP_CONFIRMATION.md`, Seção 3, Conclusão B).

Nenhuma estrutura concreta foi, até este ponto, definida em nenhum documento oficial para nenhum dos três artefatos — apenas um objetivo conceitual já aprovado em `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`.

---

## Objective

Esta ADR existe para que a futura definição da estrutura concreta dos três artefatos seja conduzida **depois** que seus princípios arquiteturais já estejam formalmente fixados — nunca ao mesmo tempo, e nunca depois. Este é o mesmo princípio de governança já registrado em `docs/architecture/ADR_INDEX.md`, Seção 3: *"Architecture Before Code. A decisão arquitetural precede sua implementação técnica, nunca o inverso."* Nenhum campo, nenhum tipo de dado, nenhuma tecnologia e nenhum algoritmo é definido aqui — apenas os princípios que qualquer estrutura futura, seja qual for sua forma final, deverá obrigatoriamente respeitar.

---

## Architectural Principles

**1. Neutralidade de domínio.** Nenhum dos três artefatos poderá conter vocabulário específico de nenhum domínio de negócio. Fundamento: `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 — o agrupamento Core, onde os três artefatos residem, é definido como o espaço onde "nenhum vocabulário de domínio específico reside"; `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`, Seção "Shared Constraints" — "nenhum dos três pode conter vocabulário de domínio específico."

**2. Independência tecnológica.** Nenhum princípio arquitetural aqui ou em documento futuro relacionado poderá pressupor linguagem, framework, ou convenção de build específica. Fundamento: `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 7 — "Neutralidade tecnológica — nenhum princípio aqui listado pressupõe linguagem, framework, ou convenção de build específica"; `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`, que exclui explicitamente tecnologia e linguagem do escopo dos três artefatos.

**3. Reutilização.** A estrutura futura deverá ser desenhada para ser consumida por qualquer agrupamento arquitetural autorizado a depender de Core, nunca para uso exclusivo de um único consumidor. Fundamento: `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 4 (Dependency Matrix) — todos os demais sete agrupamentos podem depender de Core, e Core "nunca depende de: qualquer outro agrupamento", tornando-o, por definição, uma fundação de reutilização ampla.

**4. Compatibilidade com os catálogos oficiais.** A estrutura futura deverá ser capaz de representar, sem alteração e sem contradição, qualquer entrada já catalogada em `COMMAND_CATALOG.md`, `EVENT_CATALOG.md` e `QUERY_CATALOG.md`. Fundamento: `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`, Seção "Shared Constraints" — "cada forma genérica deve ser capaz de representar, sem alteração, qualquer entrada já catalogada... a título de amostra conceitual", critério já confirmado como satisfeito no nível conceitual em validação anterior a este documento.

**5. Não introduzir acoplamento entre Business Hubs.** A estrutura futura de Generic Command, Generic Event e Generic Query não poderá, em nenhuma circunstância, tornar-se um meio indireto de acoplamento entre Business Hubs, nem entre Business Hubs e AI. Fundamento: `BUSINESS_HUB_ARCHITECTURE.md`, Seção 5 (Loose Coupling) — "Nenhum Business Hub conhece a implementação interna de outro — apenas o Contrato que ele expõe publicamente"; `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 5 (Mandatory Isolation Rules) — "Nenhum Business Hub depende de outro Business Hub, direta ou indiretamente" e "AI nunca depende de Business Hubs."

**6. Evolução controlada de contratos.** Qualquer estrutura futura deverá poder evoluir sem quebrar consumidor já existente, seguindo o mesmo princípio de compatibilidade retroativa já estabelecido para contratos entre Hubs. Fundamento: `BUSINESS_HUB_ARCHITECTURE.md`, Seção 9 (Domain Ownership) — "Contratos formalizam o formato de todo Evento e de toda Query eventualmente exposta entre Hubs, versionados conforme já estabelecido no princípio Backward Compatibility do Capítulo 5."

Nenhum princípio além destes seis é registrado por esta ADR.

---

## Out of Scope

Este documento não define, e não antecipa:

- Estrutura concreta (campos, atributos, composição) de Generic Command, Generic Event ou Generic Query.
- Nomes de campos.
- Tipos de dados.
- Linguagem de programação.
- Algoritmo.
- Implementação de qualquer um dos três artefatos.

---

## Traceability

| Seção | Fonte |
|---|---|
| Context | `STRUCTURE_GAP_CONFIRMATION.md`, Seções 1–3 |
| Objective | `docs/architecture/ADR_INDEX.md`, Seção 3 (Architecture Before Code); `STRUCTURE_GAP_CONFIRMATION.md`, Conclusão |
| Princípio 1 — Neutralidade de domínio | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3; `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`, Shared Constraints |
| Princípio 2 — Independência tecnológica | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 7; `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`, Out of Scope de cada artefato |
| Princípio 3 — Reutilização | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 4 |
| Princípio 4 — Compatibilidade com catálogos oficiais | `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`, Shared Constraints |
| Princípio 5 — Não introduzir acoplamento entre Business Hubs | `BUSINESS_HUB_ARCHITECTURE.md`, Seção 5; `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 5 |
| Princípio 6 — Evolução controlada de contratos | `BUSINESS_HUB_ARCHITECTURE.md`, Seção 9 |
| Out of Scope | `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`, Open Decisions |

Nenhum documento ausente foi identificado entre as quatro fontes obrigatórias desta ADR.

---

## Approval

| Campo | Valor |
|---|---|
| Status | ARCHITECTURAL PRINCIPLES APPROVED |
| Version | 1.0 |
| Author | Claude |
