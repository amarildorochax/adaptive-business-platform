# Errors Taxonomy Specification

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento especifica, em nível exclusivamente documental, o contrato conceitual das cinco categorias de erro já identificadas em `COMPONENT_04_ERRORS_ARTIFACT_IDENTIFICATION.md`. Nenhuma implementação é realizada. Nenhuma tecnologia é escolhida. Nenhuma categoria além das já identificadas é introduzida.*

---

## Objective

Definir documentalmente o propósito, a responsabilidade e as restrições de cada uma das cinco categorias de erro já identificadas, sem realizar nenhuma implementação.

---

## Covered Categories

- Contrato Violado
- Permission Ausente
- Dependência Indisponível
- Evento Malformado
- Falha de Carregamento de Configuração

---

## Contrato Violado

**Architectural Purpose**: comunicar que um Command, Evento, ou Query não corresponde à forma já definida em `SHARED_TYPES_CONCRETE_STRUCTURE.md`, ou que um contrato abstrato ainda não implementado (Base Contracts) não foi satisfeito.

**Conceptual Objective**: representar, de forma técnica e sem lógica de negócio, a violação de um contrato já aprovado.

**Architectural Responsibility**: apenas a já documentada — categorizar, nunca corrigir ou prevenir automaticamente a violação.

**Constraints**: não pode conter vocabulário de domínio específico; não redefine o contrato que foi violado, apenas o referencia.

**Explicitly Out of Scope**: mecanismo de validação (pertence a cada módulo proprietário, per `IMPLEMENTATION_GUIDELINES.md`); linguagem; tecnologia.

---

## Permission Ausente

**Architectural Purpose**: comunicar que uma operação foi solicitada sem a Permission necessária, verificada junto ao Identity Hub.

**Conceptual Objective**: representar, tecnicamente, a ausência de autorização, consistente com `IMPLEMENTATION_GUIDELINES.md`, linha 184 ("verificação de Permission junto ao Identity Hub, sempre antes de qualquer outra verificação").

**Architectural Responsibility**: apenas categorizar a ausência de Permission — a decisão de conceder ou negar Permission pertence exclusivamente ao Identity Hub, nunca a este componente.

**Constraints**: não decide política de autorização; não substitui o Identity Hub.

**Explicitly Out of Scope**: mecanismo de verificação de Permission (pertence ao Identity Hub); linguagem; tecnologia.

---

## Dependência Indisponível

**Architectural Purpose**: comunicar que uma dependência técnica necessária para completar uma operação está, no momento, indisponível.

**Conceptual Objective**: representar, tecnicamente, a indisponibilidade, consistente com o princípio "Graceful Degradation" já registrado em `DOMAIN_OWNERSHIP_MATRIX.md`.

**Architectural Responsibility**: apenas categorizar a indisponibilidade — mecanismos de resiliência (Circuit Breaker, Retry) já pertencem a `EVENT_INTERACTION_MATRIX.md` e a `AUTOMATION_ENGINE.md`, não são redefinidos aqui.

**Constraints**: não implementa nenhum mecanismo de resiliência; apenas categoriza a falha para que o mecanismo já existente a consuma.

**Explicitly Out of Scope**: Circuit Breaker, Retry, Dead Letter (já definidos alhures); linguagem; tecnologia.

---

## Evento Malformado

**Architectural Purpose**: comunicar que um Evento recebido não corresponde à estrutura já definida para `Event<TPayload>` em `SHARED_TYPES_CONCRETE_STRUCTURE.md`.

**Conceptual Objective**: representar, tecnicamente, a não conformidade estrutural de um Evento, consistente com `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 4.

**Architectural Responsibility**: apenas categorizar a malformação — a validação estrutural em si permanece de responsabilidade do consumidor do Evento.

**Constraints**: não redefine a estrutura de `Event<TPayload>`, já aprovada e implementada; apenas referencia sua violação.

**Explicitly Out of Scope**: mecanismo de validação de esquema; linguagem; tecnologia.

---

## Falha de Carregamento de Configuração

**Architectural Purpose**: comunicar que o mecanismo de Configuration (Component 06, ainda não iniciado) não conseguiu carregar um valor de configuração técnica.

**Conceptual Objective**: representar, tecnicamente, a falha de carregamento, consistente com `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 6.

**Architectural Responsibility**: apenas categorizar a falha — o mecanismo de carregamento em si pertence exclusivamente ao componente Configuration, ainda não implementado.

**Constraints**: não antecipa nenhuma decisão do componente Configuration além de reconhecer que ele consumirá esta categoria.

**Explicitly Out of Scope**: mecanismo de carregamento de configuração; linguagem; tecnologia.

---

## Shared Constraints

- Nenhuma das cinco categorias pode conter vocabulário de domínio específico (`SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 4).
- Todas residem no agrupamento **Shared**, não Core (`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3).
- Nenhuma decisão de tecnologia, linguagem, ou algoritmo é autorizada para nenhuma categoria.
- Nenhuma categoria redefine um mecanismo já existente (validação, resiliência, autorização) — cada uma apenas o referencia.

---

## Open Decisions

- **Nome de arquivo e localização** do artefato de taxonomia — ainda não definidos (mesma natureza de Open Decision já registrada para Shared Types antes de sua Structure).
- **Estrutura concreta de um Erro** (campos: código, mensagem, categoria, causa) — ainda não definida; tratada em `ERRORS_CONCRETE_STRUCTURE.md`.
- **Tecnologia/linguagem de representação** — já resolvida por convenção preexistente do repositório (TypeScript/pnpm), mesma base já usada para Shared Types.

---

## Validation Strategy

Critérios já existentes, conforme `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 4:

✓ Toda categoria de erro técnico já antecipada pelos demais componentes desta Sprint está representada (5/5, per `COMPONENT_04_ERRORS_ARTIFACT_IDENTIFICATION.md`).
✓ Nenhuma categoria de erro contém lógica de negócio ou referência a um domínio específico.
✓ Conformidade confirmada contra os cenários de falha já esperados por `DOMAIN_OWNERSHIP_MATRIX.md` e por `EVENT_INTERACTION_MATRIX.md`.

---

## Traceability

| Categoria | Fonte |
|---|---|
| Contrato Violado | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 4 |
| Permission Ausente | `IMPLEMENTATION_GUIDELINES.md`, linha 184 |
| Dependência Indisponível | `DOMAIN_OWNERSHIP_MATRIX.md`, "Graceful Degradation" |
| Evento Malformado | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 4; `SHARED_TYPES_CONCRETE_STRUCTURE.md` |
| Falha de Carregamento de Configuração | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 6 |

---

## Approval

| Campo | Valor |
|---|---|
| Status | SPECIFICATION APPROVED |
| Version | 1.0 |
| Author | Claude |
