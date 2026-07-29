# Shared Types Acceptance Criteria

**Adaptive Business Platform · Architecture Decision Record**

Status: Proposed
Category: Architecture Decision Record
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento define exclusivamente os critérios de aceitação que a futura proposta arquitetural de estrutura concreta de Generic Command, Generic Event e Generic Query deverá satisfazer para ser considerada aprovada. Ele não define solução, não define estrutura, não define contrato, e não escolhe tecnologia — apenas os critérios pelos quais uma proposta futura será avaliada.*

---

## Context

`STRUCTURE_GAP_CONFIRMATION.md` confirmou que a Open Decision "Estrutura de dado concreta" representa uma lacuna arquitetural real, cuja resolução exige uma nova decisão arquitetural. `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md` registrou, em resposta, os seis princípios que deverão orientar essa futura decisão — sem, ela mesma, propor nenhuma estrutura. Este documento dá o próximo passo desse mesmo processo: transformar os princípios já aprovados em critérios de aceitação verificáveis, para que qualquer proposta futura de estrutura concreta possa ser avaliada de forma objetiva contra o que já foi decidido, antes de sua aprovação.

---

## Acceptance Criteria

### Neutralidade de Domínio

**Objetivo**: A proposta arquitetural futura não poderá introduzir, em nenhum dos três artefatos (Generic Command, Generic Event, Generic Query), vocabulário específico de nenhum domínio de negócio.

**Justificativa documental**: Deriva diretamente do Princípio 1 de `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md` — "Nenhum dos três artefatos poderá conter vocabulário específico de nenhum domínio de negócio" — fundamentado em `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3, e em `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`, Seção "Shared Constraints".

---

### Compatibilidade com os Catálogos Oficiais

**Objetivo**: A proposta arquitetural futura deverá ser capaz de representar, sem alteração e sem contradição, qualquer entrada já catalogada em `COMMAND_CATALOG.md`, `EVENT_CATALOG.md` e `QUERY_CATALOG.md`.

**Justificativa documental**: Deriva diretamente do Princípio 4 de `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md`, fundamentado em `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`, Seção "Shared Constraints" — "cada forma genérica deve ser capaz de representar, sem alteração, qualquer entrada já catalogada... a título de amostra conceitual".

---

### Ausência de Acoplamento Adicional

**Objetivo**: A proposta arquitetural futura não poderá se tornar, direta ou indiretamente, um meio de acoplamento entre Business Hubs, nem entre Business Hubs e AI.

**Justificativa documental**: Deriva diretamente do Princípio 5 de `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md`, fundamentado em `BUSINESS_HUB_ARCHITECTURE.md`, Seção 5 (Loose Coupling), e reafirmado nas Mandatory Isolation Rules já citadas por essa mesma ADR.

---

### Independência Tecnológica

**Objetivo**: A proposta arquitetural futura não poderá pressupor, mencionar, ou depender de nenhuma linguagem de programação, framework, ou tecnologia específica.

**Justificativa documental**: Deriva diretamente do Princípio 2 de `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md` — "Nenhum princípio arquitetural... poderá pressupor linguagem, framework, ou convenção de build específica."

---

### Evolução Controlada

**Objetivo**: A proposta arquitetural futura deverá prever um mecanismo de evolução de contrato que preserve compatibilidade com todo consumidor já existente, nunca exigindo quebra retroativa.

**Justificativa documental**: Deriva diretamente do Princípio 6 de `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md`, fundamentado em `BUSINESS_HUB_ARCHITECTURE.md`, Seção 9 — contratos entre Hubs versionados conforme o princípio Backward Compatibility.

---

### Coerência entre Command, Event e Query

**Objetivo**: A proposta arquitetural futura deverá manter consistência conceitual entre os três artefatos, respeitando a relação já estabelecida entre intenção (Command), fato consumado (Event) e leitura sem efeito colateral (Query), sem introduzir contradição entre eles.

**Justificativa documental**: Deriva de `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`, Seção "Implementation Strategy" — a relação conceitual já reconhecida entre Command e Evento ("um Command ainda não aconteceu... um Evento já é um fato consumado") — e da aplicação uniforme dos Princípios 1 e 4 de `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md` aos três artefatos simultaneamente, nunca a apenas um isoladamente.

---

**Nota de cobertura**: o Princípio 3 (Reutilização) de `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md` não origina um critério de aceitação isolado neste documento — sua exigência (a estrutura futura deve poder ser consumida por qualquer agrupamento autorizado a depender de Core) já está implicitamente coberta pela combinação dos critérios "Neutralidade de Domínio" e "Ausência de Acoplamento Adicional" acima, que juntos garantem que nenhuma estrutura proposta seja desenhada em função de um único consumidor. Nenhum critério foi omitido sem registro.

---

## Out of Scope

Este documento:

- Não cria contratos.
- Não define campos.
- Não escolhe tecnologia.
- Não resolve a Open Decision "Estrutura de dado concreta" — apenas define como uma futura proposta de resolução será avaliada.

---

## Traceability

| Critério | Fonte |
|---|---|
| Neutralidade de Domínio | `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md`, Princípio 1 |
| Compatibilidade com os Catálogos Oficiais | `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md`, Princípio 4; `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`, Shared Constraints |
| Ausência de Acoplamento Adicional | `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md`, Princípio 5 |
| Independência Tecnológica | `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md`, Princípio 2 |
| Evolução Controlada | `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md`, Princípio 6 |
| Coerência entre Command, Event e Query | `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`, Implementation Strategy; `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md`, Princípios 1 e 4 |
| Context | `STRUCTURE_GAP_CONFIRMATION.md`; `ADR_SHARED_TYPES_ARCHITECTURAL_PRINCIPLES.md` |

Nenhum documento ausente foi identificado entre as três fontes obrigatórias.

---

## Approval

| Campo | Valor |
|---|---|
| Status | ACCEPTANCE CRITERIA APPROVED |
| Version | 1.0 |
| Author | Claude |
