# Component 03 — Implementation Plan

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento planeja a implementação do Component 03 — Shared Types, apoiado em `COMPONENT_03_SHARED_TYPES_DESIGN.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`, `SPRINT_01_IMPLEMENTATION_BACKLOG.md` e `GATE_G2_IMPLEMENTATION_ROADMAP.md`. Nenhuma arquitetura foi alterada, nenhum documento existente foi modificado, e nenhuma tecnologia foi escolhida na elaboração deste plano.*

---

## Goal

Planejar a sequência de implementação do componente Shared Types, cujo objetivo já está fixado em `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3, e cujo design já está documentado em `COMPONENT_03_SHARED_TYPES_DESIGN.md`: realizar a forma genérica de Command, de Evento e de Query, sem conter nenhum vocabulário de domínio específico.

---

## Deliverables

Os arquivos previstos para este componente já estão fixados em `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3 — **o número de artefatos já está definido: três**. Este plano não adiciona nem remove nenhum:

| Ordem | Entrega | Descrição | Status |
|---|---|---|---|
| 1 | Definição de tipo genérico para Command | Forma genérica que representa a intenção de mudança de estado, conforme `BUSINESS_HUB_ARCHITECTURE.md`, Seção 7 | Pendente — não iniciado |
| 2 | Definição de tipo genérico para Evento | Forma genérica que representa um fato já consumado, conforme `BUSINESS_HUB_ARCHITECTURE.md`, Seções 5 e 7 | Pendente — não iniciado |
| 3 | Definição de tipo genérico para Query | Forma genérica que representa leitura sem efeito colateral, atravessando fronteira de Hub apenas quando estritamente necessária, conforme `BUSINESS_HUB_ARCHITECTURE.md`, Seção 7 | Pendente — não iniciado |

Nenhuma outra entrega é prevista para este componente. Nenhum dos três arquivos define implementação, linguagem, ou tecnologia (`COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Shared Types Principles").

---

## Implementation Strategy

`SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3, não define uma ordem entre os três arquivos previstos. Este plano propõe a seguinte ordem, fundamentada exclusivamente na relação conceitual entre Command e Evento já descrita em `BUSINESS_HUB_ARCHITECTURE.md`, Seção 7 — *"um Command ainda não aconteceu, é uma solicitação, enquanto um Evento já é um fato consumado"* — e no papel de leitura independente e excepcional da Query (Seção 7 — *"apenas os Domain Events, e ocasionalmente uma Query explícita quando estritamente necessária, atravessam essa fronteira"*):

1. **Command** — primeiro, por expressar a intenção que, uma vez processada, origina o Evento.
2. **Evento** — segundo, por representar o fato consumado que resulta do processamento de um Command.
3. **Query** — terceiro, por ser uma leitura independente do fluxo de escrita Command → Evento, e por atravessar fronteira de Hub apenas de forma excepcional.

Esta ordem é uma recomendação de planejamento, não uma regra arquitetural nova — nenhuma dependência técnica entre os três arquivos é declarada por nenhuma fonte obrigatória.

---

## Validation Strategy

Cada arquivo do componente segue o mesmo fluxo já estabelecido em `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 6, e já aplicado aos Components 01 e 02: Planejamento → Implementação → **Build** → Testes → Revisão → **Validação Final**.

- **Build**: validação individual de cada arquivo contra `COMPONENT_03_SHARED_TYPES_DESIGN.md` e contra `platform/PACKAGE_STRUCTURE_MANIFEST.md`, registrada em um Build Validation Report dedicado.
- **Final Validation**: encerramento formal do arquivo após Build aprovado, sem pendência bloqueante.
- **Sprint Update**: apenas após a Validação Final do último dos três arquivos, `SPRINT_01_EXECUTION_TRACKER.md` e `SPRINT_01_IMPLEMENTATION_BACKLOG.md` são atualizados para refletir a conclusão do componente inteiro — nunca antes, e nunca de forma fracionária incorreta, mesmo padrão já aplicado a Package Structure e a Dependency Management.

Nenhuma atualização de Sprint Tracker ou de Backlog é executada por este documento.

---

## Acceptance Criteria

O componente Shared Types será considerado concluído quando, conforme `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3:

✓ As três formas genéricas (Command, Evento, Query) existirem, com Build aprovado e Validação Final concluída para cada uma.
✓ Nenhuma das três formas genéricas contiver nenhum campo específico de nenhum domínio.
✓ Cada forma genérica for capaz de representar, sem alteração, qualquer entrada já catalogada em `COMMAND_CATALOG.md`, `EVENT_CATALOG.md` e `QUERY_CATALOG.md`, a título de amostra conceitual.
✓ Fidelidade confirmada contra os três catálogos oficiais, em conformidade com o critério de revisão já fixado no Backlog.

---

## Risks

Riscos exclusivamente documentais — nenhum risco técnico é antecipado ou inventado, em conformidade com o escopo deste plano:

- **Risco de vocabulário de domínio infiltrado**: um Build futuro poderia, por engano, introduzir um campo específico de um Business Hub (por exemplo, um campo exclusivo do CRM) dentro da forma genérica. *Mitigação*: o critério de conclusão de `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3, exige explicitamente ausência de campo específico de domínio.
- **Risco de confusão entre "Shared Types" e o agrupamento "Shared"**: por semelhança de nome, um Build futuro poderia posicionar incorretamente este componente no agrupamento Shared em vez de Core. *Mitigação*: `COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Architectural Context", já registra essa distinção explicitamente.
- **Risco de antecipação de decisão de tecnologia**: qualquer um dos três arquivos poderia ser especificado com uma escolha de linguagem ou estrutura de dado concreta ainda não autorizada. *Mitigação*: `COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Shared Types Principles", já exclui explicitamente essa decisão deste componente.

---

## Traceability

| Seção deste documento | Fonte |
|---|---|
| Goal | `COMPONENT_03_SHARED_TYPES_DESIGN.md`; `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3 |
| Deliverables | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3; `BUSINESS_HUB_ARCHITECTURE.md`, Seções 5 e 7 |
| Implementation Strategy | `BUSINESS_HUB_ARCHITECTURE.md`, Seção 7 |
| Validation Strategy | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 6 (padrão já aplicado aos Components 01 e 02) |
| Acceptance Criteria | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3 |
| Risks | `COMPONENT_03_SHARED_TYPES_DESIGN.md` |

Nenhum documento ausente foi identificado na elaboração deste plano além do já registrado em `COMPONENT_03_SHARED_TYPES_DESIGN.md` (ausência nominal de "Shared Types" em `GATE_G2_IMPLEMENTATION_ROADMAP.md`).

---

## Approval

| Campo | Valor |
|---|---|
| Status | IMPLEMENTATION PLAN APPROVED |
| Version | 1.0 |
| Author | Claude |
