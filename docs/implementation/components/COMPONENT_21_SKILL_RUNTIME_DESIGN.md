# Component 21 — Skill Runtime Design

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento inicia, para o Component 21 — Skill Runtime (sétimo componente da Sprint 4 — AI Core, sucedendo Reasoning e Planning), a mesma cadeia documental já consolidada nas Sprints anteriores e nos Components 15–20.*

---

## Objective

Documentar o design do componente Skill Runtime, cuja responsabilidade já está fixada em `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.7: *"sustentar a execução de uma Skill — capacidade nomeada e reutilizável de um Agente"* — nesta tarefa, restrita exclusivamente à estrutura declarativa (identificação, descrição, ciclo de vida), nunca à execução — fundamentado em `AI_ARCHITECTURE.md`, Capítulo 8 (Skill Runtime), e `AGENT_FRAMEWORK.md`, Capítulo 13 (Skills).

---

## Scope

**Dentro do escopo**: representar uma Skill, seu estado, seus metadados, seus requisitos de execução, suas capacidades declaradas, suas dependências declarativas, sua versão, sua compatibilidade, suas restrições arquiteturais, e o resultado esperado — conforme já listado pela tarefa que originou este componente.

**Fora do escopo**: execução, runtime engine, plugin loader, reflection, dependency injection, service locator, discovery (como mecanismo), registro automático, workflow, scheduler, cache, mecanismos de IA, otimizações, código específico de infraestrutura — todos explicitamente fora do `SCOPE_FREEZE_V1.md`. Orquestração (Component 17, já implementado), Planejamento (Component 20, já implementado), Raciocínio (Component 19, já implementado) — não incorporados.

---

## Architectural Context

Skill Runtime é o sétimo componente da Sprint 4 — AI Core, sucedendo Reasoning e Planning (Components 19 e 20, ambos já concluídos, paralelos entre si), dos quais depende (`SPRINT_04_IMPLEMENTATION_BACKLOG.md`, Seção 4; `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 8).

Fundamentação: `AI_ARCHITECTURE.md`, Capítulo 8 — Descoberta, Registro, Execução, Autorização, Isolamento, Versionamento, Reutilização, ciclo "Skill implementada → Registro formal → Descoberta → Autorização verificada → Execução isolada → Resultado retornado"; `AGENT_FRAMEWORK.md`, Capítulo 13 — Skills descobertas e invocadas por um Agente, relação muitos-para-muitos entre Agente e Skill, resultado sempre em formato estruturado e previsível, sujeição a Execution Policy.

**Estado restrito ao pré-execução**: consistente com a mesma disciplina já aplicada a Planning (Component 20), o estado de uma Skill representado por este componente é restrito às etapas anteriores à execução real — Implementada, Registrada, Depreciada — nunca Descoberta, Autorização, ou Execução, todas mecanismos explicitamente fora de escopo desta tarefa.

**Relação com a Foundation e com os componentes já implementados**: nenhum contrato da Foundation é redefinido. Nenhum artefato de Context, Memory, Orchestrator, Agent Framework, Reasoning, ou Planning é duplicado, modificado, ou importado — Skill Runtime referencia Agente, Capability e plano exclusivamente por identificador opaco.

---

## Design Principles

- **Estrutura, nunca execução** — nenhuma Skill é efetivamente invocada por este componente.
- **Reutilização** — uma Skill nunca pertence exclusivamente a um único Agente; relação muitos-para-muitos (`AGENT_FRAMEWORK.md`, Capítulo 13; `AI_ARCHITECTURE.md`, Capítulo 8).
- **Isolamento** — toda Skill é desenhada para nunca produzir efeito colateral não documentado (`AI_ARCHITECTURE.md`, Capítulo 8).
- **Versionamento controlado** — mudança de contrato de Skill exige nova versão, preservando compatibilidade com Agentes que dependam da versão anterior (Capítulo 8).
- **Resultado estruturado e previsível** — toda Skill retorna resultado em formato consistente (`AGENT_FRAMEWORK.md`, Capítulo 13).
- **Neutralidade tecnológica** — nenhuma tecnologia de execução, de plugin, ou de injeção de dependência.

---

## Out of Scope

- Execução, runtime engine, plugin loader, reflection, dependency injection, service locator, discovery (mecanismo), registro automático, workflow, scheduler, cache, mecanismos de IA, otimizações, código específico de infraestrutura.
- Orquestração, Planejamento, Raciocínio como estruturas próprias — já implementados nos Components 17, 20 e 19.
- Tool Runtime, Multi-Agent System (Components 22 e 23) — ainda não implementados.
- Escolha de linguagem, framework, ou tecnologia.

---

## Design Decisions

| Decisão | Fonte já aprovada |
|---|---|
| Skill Runtime é o Component 21, depende de Reasoning e Planning | `SPRINT_04_IMPLEMENTATION_BACKLOG.md`, Seção 3; `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 8 |
| Skill Runtime reside no agrupamento AI, pacote `@abp/ai` (já criado pelos Components 15–20) | `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.7 |
| `SkillState` restrito a três valores pré-execução (Implemented, Registered, Deprecated) | `AI_ARCHITECTURE.md`, Capítulo 8 (diagrama); restrição explícita desta tarefa |
| Oito artefatos: `SkillDefinition`, `SkillState`, `SkillMetadata`, `SkillCapability`, `SkillRequirement`, `SkillConstraint`, `SkillCompatibility`, `SkillResult` | Escopo já fixado pela tarefa que originou este componente |

---

## Traceability

| Seção | Fonte |
|---|---|
| Objective / Scope | `AI_ARCHITECTURE.md`, Capítulo 8; `AGENT_FRAMEWORK.md`, Capítulo 13; `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.7 |
| Architectural Context | `SPRINT_04_IMPLEMENTATION_BACKLOG.md` |
| Design Principles | `AI_ARCHITECTURE.md`, Capítulo 8; `AGENT_FRAMEWORK.md`, Capítulo 13 |

---

## Approval

| Campo | Valor |
|---|---|
| Status | DESIGN DOCUMENT APPROVED |
| Version | 1.0 |
| Author | Claude |
