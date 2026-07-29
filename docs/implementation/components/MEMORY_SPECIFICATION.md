# Memory Specification

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento especifica, em nível exclusivamente documental, o contrato conceitual dos onze artefatos já identificados em `COMPONENT_16_MEMORY_ARTIFACT_IDENTIFICATION.md`.*

---

## Objective

Definir propósito, responsabilidade e restrições de MemoryType, MemoryScope, MemoryOwnership, MemoryEntry, MemoryLifecycle, MemoryRetention, MemoryPolicy, MemoryVersion, MemoryReference, MemoryValidation e MemoryQuality.

---

## Covered Artifacts

MemoryType · MemoryScope · MemoryOwnership · MemoryEntry · MemoryLifecycle · MemoryRetention · MemoryPolicy · MemoryVersion · MemoryReference · MemoryValidation · MemoryQuality

---

## MemoryType

**Architectural Purpose**: nomear as duas naturezas fundamentais de memória (curta e longa duração). **Conceptual Objective**: sustentar `AI_HUB.md`, Capítulo 11. **Architectural Responsibility**: apenas nomear. **Explicitly Out of Scope**: mecanismo de armazenamento por natureza.

## MemoryScope

**Architectural Purpose**: nomear as cinco categorias de alcance de memória. **Conceptual Objective**: sustentar `AI_ARCHITECTURE.md`, Capítulo 11. **Architectural Responsibility**: apenas nomear. **Explicitly Out of Scope**: mecanismo de mediação entre Agentes (Compartilhada).

## MemoryOwnership

**Architectural Purpose**: nomear as três titularidades de memória. **Conceptual Objective**: sustentar `AI_HUB.md`, Capítulo 11. **Architectural Responsibility**: apenas nomear. **Explicitly Out of Scope**: lógica de atribuição automática de titularidade.

## MemoryEntry

**Architectural Purpose**: representar uma entrada de memória, combinando Tipo, Escopo e Titularidade. **Conceptual Objective**: sustentar os "seis compartimentos" já exigidos em `AI_HUB.md`, Capítulo 11. **Architectural Responsibility**: apenas representar — nenhum conteúdo de negócio armazenado diretamente, nenhum mecanismo de persistência real. **Explicitly Out of Scope**: Memory Manager executável.

## MemoryLifecycle

**Architectural Purpose**: registrar o momento de escrita, de último acesso e de expiração de uma entrada. **Conceptual Objective**: sustentar Leitura/Escrita autorizada (`AGENT_FRAMEWORK.md`, Capítulo 9) e expiração (`AI_HUB.md`, Capítulo 11). **Architectural Responsibility**: apenas registrar — nenhuma lógica de mediação real. **Explicitly Out of Scope**: verificação de Agent Contract.

## MemoryRetention

**Architectural Purpose**: declarar o prazo mínimo de retenção por combinação de Escopo e Tipo. **Conceptual Objective**: sustentar a "política própria de retenção" (`AI_HUB.md`, Capítulo 11). **Architectural Responsibility**: apenas declarar. **Explicitly Out of Scope**: mecanismo de expiração automática real.

## MemoryPolicy

**Architectural Purpose**: declarar se uma combinação de Escopo e Tipo é legível e/ou gravável. **Conceptual Objective**: sustentar Leitura/Escrita autorizada (`AGENT_FRAMEWORK.md`, Capítulo 9). **Architectural Responsibility**: apenas declarar. **Explicitly Out of Scope**: verificação de Memory Access de um Agente específico.

## MemoryVersion

**Architectural Purpose**: registrar uma versão de entrada de memória. **Conceptual Objective**: sustentar a "capacidade de correção retroativa" já exigida (`AI_ARCHITECTURE.md`, Capítulo 11). **Architectural Responsibility**: apenas registrar. **Explicitly Out of Scope**: mecanismo de reconstrução real.

## MemoryReference

**Architectural Purpose**: registrar a origem exata (Evento, Read Model, ou Conhecimento) da qual uma entrada deriva. **Conceptual Objective**: sustentar o princípio de que memória nunca é fonte de verdade paralela (`AI_ARCHITECTURE.md`, Capítulo 11). **Architectural Responsibility**: apenas registrar a referência. **Explicitly Out of Scope**: mecanismo de consulta real à origem.

## MemoryValidation

**Architectural Purpose**: registrar que uma entrada foi confirmada como reconstruível e não divergente. **Conceptual Objective**: sustentar o mesmo princípio acima. **Architectural Responsibility**: apenas registrar o resultado. **Explicitly Out of Scope**: algoritmo de verificação real.

## MemoryQuality

**Architectural Purpose**: registrar relevância e confiança de uma entrada de memória. **Conceptual Objective**: sustentar a qualidade de memória contextual antes de sua incorporação a um Contexto (`AI_ARCHITECTURE.md`, Capítulo 11, cross-referência ao Capítulo 12), por analogia direta a `ContextQuality`. **Architectural Responsibility**: apenas registrar valores já calculados. **Explicitly Out of Scope**: algoritmo de cálculo de qualidade.

---

## Shared Constraints

- Nenhum vocabulário de negócio.
- Reside no agrupamento **AI**, pacote `@abp/ai`.
- Nenhum banco vetorial, embedding, LLM, ou tecnologia concreta.
- Nenhuma duplicação de contrato já existente (`Event`, `PlatformError`, artefatos de Context).
- Nenhuma dependência real de `@abp/infrastructure` ou `@abp/platform-services`.

---

## Open Decisions

- **Nome de arquivo e localização** — resolvidos em `MEMORY_CONCRETE_STRUCTURE.md`.
- **Tecnologia/linguagem** — já resolvida por convenção preexistente.

---

## Validation Strategy

✓ Nenhum mecanismo concreto de armazenamento ou de IA.
✓ Dois tipos, cinco escopos e três titularidades exatamente conforme as fontes autorizadas.
✓ `MemoryEntry` carrega `tenantId`.
✓ Nenhuma duplicação de contrato já existente.

---

## Traceability

| Artefato | Fonte |
|---|---|
| Todos | `COMPONENT_16_MEMORY_ARTIFACT_IDENTIFICATION.md`; `AI_HUB.md`; `AI_ARCHITECTURE.md`; `AGENT_FRAMEWORK.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | SPECIFICATION APPROVED |
| Version | 1.0 |
| Author | Claude |
