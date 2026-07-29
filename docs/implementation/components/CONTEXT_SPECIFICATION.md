# Context Specification

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento especifica, em nível exclusivamente documental, o contrato conceitual dos onze artefatos já identificados em `COMPONENT_15_CONTEXT_ARTIFACT_IDENTIFICATION.md`.*

---

## Objective

Definir propósito, responsabilidade e restrições de Context, Context Layer, Context Source, Context Quality, Context Validation Result, Context Budget, Context Compression Record, Context Distribution, Context Ownership, Context Lifecycle State e Context Version.

---

## Covered Artifacts

Context · Context Layer · Context Source · Context Quality · Context Validation Result · Context Budget · Context Compression Record · Context Distribution · Context Ownership · Context Lifecycle State · Context Version

---

## Context

**Architectural Purpose**: representar o Contexto já construído para uma solicitação de IA. **Conceptual Objective**: sustentar o Context Operating System já exigido em `CONTEXT_FRAMEWORK.md`, Capítulo 4. **Architectural Responsibility**: apenas representar — nenhuma lógica de construção real. **Explicitly Out of Scope**: Context Builder como mecanismo executável.

## Context Layer

**Architectural Purpose**: nomear as nove camadas hierárquicas de escopo de Contexto. **Conceptual Objective**: sustentar a hierarquia já exigida no Capítulo 5. **Architectural Responsibility**: apenas nomear. **Explicitly Out of Scope**: lógica de herança entre camadas.

## Context Source

**Architectural Purpose**: nomear as dez origens catalogadas de informação de Contexto. **Conceptual Objective**: sustentar o Capítulo 6. **Architectural Responsibility**: apenas nomear. **Explicitly Out of Scope**: mecanismo real de consulta a qualquer origem (Query, Retrieval, Integration já pertencem a outros componentes/Hubs).

## Context Quality

**Architectural Purpose**: registrar os dez atributos de qualidade de uma porção de informação. **Conceptual Objective**: sustentar Quality Before Quantity (Capítulo 9). **Architectural Responsibility**: apenas registrar valores já calculados — nenhum mecanismo de cálculo. **Explicitly Out of Scope**: algoritmo de pontuação.

## Context Validation Result

**Architectural Purpose**: registrar o resultado das cinco verificações de validação. **Conceptual Objective**: sustentar o Capítulo 8. **Architectural Responsibility**: apenas registrar — nenhuma lógica de verificação real. **Explicitly Out of Scope**: mecanismo de detecção de contradição.

## Context Budget

**Architectural Purpose**: registrar os sete elementos que determinam a inclusão de uma informação dentro do orçamento disponível. **Conceptual Objective**: sustentar o Capítulo 11. **Architectural Responsibility**: apenas registrar — nenhum mecanismo de alocação real. **Explicitly Out of Scope**: algoritmo de otimização de orçamento.

## Context Compression Record

**Architectural Purpose**: registrar que uma técnica de compressão foi aplicada, com perda aceitável comunicada explicitamente. **Conceptual Objective**: sustentar No Silent Loss (Capítulo 12). **Architectural Responsibility**: apenas registrar — nenhum mecanismo real de resumo ou de agrupamento. **Explicitly Out of Scope**: algoritmo de sumarização.

## Context Distribution

**Architectural Purpose**: registrar que um Contexto (ou subconjunto) foi entregue a um destinatário. **Conceptual Objective**: sustentar o Capítulo 13. **Architectural Responsibility**: apenas registrar — nenhuma implementação de Agente. **Explicitly Out of Scope**: Agent Framework (Component 18).

## Context Ownership

**Architectural Purpose**: declarar a matriz de oito categorias de Contexto e seus proprietários oficiais. **Conceptual Objective**: sustentar o Capítulo 14, extensão direta de `DOMAIN_OWNERSHIP_MATRIX.md`. **Architectural Responsibility**: apenas declarar. **Explicitly Out of Scope**: qualquer lógica de atribuição automática.

## Context Lifecycle State

**Architectural Purpose**: nomear as treze etapas do ciclo de vida de um Contexto e registrar o estágio atual. **Conceptual Objective**: sustentar o Capítulo 15. **Architectural Responsibility**: apenas registrar — nenhuma lógica de transição. **Explicitly Out of Scope**: Context Builder e Context Scoring como mecanismos próprios (já subsumidos aqui e em Context Quality/Budget).

## Context Version

**Architectural Purpose**: registrar uma versão de Contexto e o momento de sua substituição, quando aplicável. **Conceptual Objective**: sustentar Context Evolution (Capítulo 16). **Architectural Responsibility**: apenas registrar. **Explicitly Out of Scope**: mecanismo de refinamento contínuo de critério de Scoring.

---

## Shared Constraints

- Nenhum vocabulário de negócio.
- Reside no agrupamento **AI**, pacote `@abp/ai`.
- Nenhum LLM, banco vetorial, ou tecnologia concreta.
- Nenhuma duplicação de contrato já existente (`Event`, `PlatformError`, `Role`, `Permission`, `KnowledgeAsset`, etc.).
- Nenhuma dependência de `@abp/infrastructure` ou `@abp/platform-services` — AI depende apenas de Core, Shared e Platform Services no nível de pacote, mas nenhum destes onze artefatos exige, de fato, nenhuma importação cruzada.

---

## Open Decisions

- **Nome de arquivo e localização** — resolvidos em `CONTEXT_CONCRETE_STRUCTURE.md`.
- **Tecnologia/linguagem** — já resolvida por convenção preexistente.

---

## Validation Strategy

✓ Nenhum mecanismo concreto de IA ou de armazenamento vetorial.
✓ Nove camadas, dez origens, oito categorias e treze etapas exatamente conforme `CONTEXT_FRAMEWORK.md`.
✓ Nenhuma duplicação de contrato já existente.

---

## Traceability

| Artefato | Fonte |
|---|---|
| Todos | `COMPONENT_15_CONTEXT_ARTIFACT_IDENTIFICATION.md`; `CONTEXT_FRAMEWORK.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | SPECIFICATION APPROVED |
| Version | 1.0 |
| Author | Claude |
