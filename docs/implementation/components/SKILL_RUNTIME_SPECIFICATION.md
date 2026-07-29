# Skill Runtime Specification

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento especifica, em nível exclusivamente documental, o contrato conceitual dos oito artefatos já identificados em `COMPONENT_21_SKILL_RUNTIME_ARTIFACT_IDENTIFICATION.md`.*

---

## Objective

Definir propósito, responsabilidade e restrições de Skill Definition, Skill State, Skill Metadata, Skill Capability, Skill Requirement, Skill Constraint, Skill Compatibility e Skill Result.

---

## Covered Artifacts

Skill Definition · Skill State · Skill Metadata · Skill Capability · Skill Requirement · Skill Constraint · Skill Compatibility · Skill Result

---

## Skill Definition

**Architectural Purpose**: representar a identidade declarativa de uma Skill. **Conceptual Objective**: sustentar Registro (`AI_ARCHITECTURE.md`, Capítulo 8). **Architectural Responsibility**: apenas representar. **Explicitly Out of Scope**: lógica interna de qualquer Skill, plugin loader.

## Skill State

**Architectural Purpose**: nomear os três estados pré-execução de uma Skill e registrar o estado atual. **Conceptual Objective**: sustentar o ciclo de vida (Capítulo 8), restrito ao pré-execução. **Architectural Responsibility**: apenas registrar. **Explicitly Out of Scope**: Descoberta, Autorização, Execução.

## Skill Metadata

**Architectural Purpose**: registrar metadado estrutural de uma Skill. **Conceptual Objective**: sustentar rastreabilidade, mesmo padrão já aplicado a Planning Metadata. **Architectural Responsibility**: apenas registrar. **Explicitly Out of Scope**: qualquer conteúdo de negócio.

## Skill Capability

**Architectural Purpose**: representar as Capabilities às quais uma Skill está associada. **Conceptual Objective**: sustentar "relevantes à Capability em curso" (`AGENT_FRAMEWORK.md`, Capítulo 13). **Architectural Responsibility**: apenas representar. **Explicitly Out of Scope**: catálogo de Capability concreta.

## Skill Requirement

**Architectural Purpose**: representar os requisitos que devem estar satisfeitos antes de uma Skill poder ser invocada. **Conceptual Objective**: sustentar Autorização (Capítulo 8) e Execution Policy (`AGENT_FRAMEWORK.md`, Capítulo 13). **Architectural Responsibility**: apenas representar. **Explicitly Out of Scope**: verificação de Permission real, Identity Hub.

## Skill Constraint

**Architectural Purpose**: representar uma restrição arquitetural aplicável a uma Skill. **Conceptual Objective**: sustentar Isolamento (Capítulo 8). **Architectural Responsibility**: apenas representar. **Explicitly Out of Scope**: sandbox ou isolamento de execução real.

## Skill Compatibility

**Architectural Purpose**: representar as versões com as quais uma Skill permanece compatível. **Conceptual Objective**: sustentar Versionamento (Capítulo 8). **Architectural Responsibility**: apenas representar. **Explicitly Out of Scope**: mecanismo de migração de versão real.

## Skill Result

**Architectural Purpose**: representar o formato esperado do resultado de uma Skill. **Conceptual Objective**: sustentar "formato estruturado e previsível" (`AGENT_FRAMEWORK.md`, Capítulo 13). **Architectural Responsibility**: apenas representar. **Explicitly Out of Scope**: resultado real de invocação.

---

## Shared Constraints

- Nenhum vocabulário de negócio.
- Reside no agrupamento **AI**, pacote `@abp/ai`.
- Nenhuma execução, runtime engine, plugin loader, reflection, dependency injection, service locator, discovery, registro automático, workflow, scheduler, cache, mecanismo de IA, otimização, ou código específico de infraestrutura.
- Nenhuma duplicação de contrato já existente (`Event`, `PlatformError`, artefatos de Context, Memory, Orchestrator, Agent Framework, Reasoning, ou Planning).
- Nenhuma importação cruzada de tipo com componentes anteriores — apenas identificador opaco.

---

## Open Decisions

- **Nome de arquivo e localização** — resolvidos em `SKILL_RUNTIME_CONCRETE_STRUCTURE.md`.
- **Tecnologia/linguagem** — já resolvida por convenção preexistente.

---

## Validation Strategy

✓ Nenhum mecanismo concreto de execução, descoberta, ou autorização.
✓ Três estados de `SkillState` exatamente conforme o ciclo pré-execução já nomeado.
✓ Nenhuma dependência circular ou importação cruzada.

---

## Traceability

| Artefato | Fonte |
|---|---|
| Todos | `COMPONENT_21_SKILL_RUNTIME_ARTIFACT_IDENTIFICATION.md`; `AI_ARCHITECTURE.md`; `AGENT_FRAMEWORK.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | SPECIFICATION APPROVED |
| Version | 1.0 |
| Author | Claude |
