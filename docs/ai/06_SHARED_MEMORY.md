# 06 — Shared Memory

**Adaptive Business Platform · AI Handbook · Documento Técnico Oficial**

Status: Draft
Category: AI Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este capítulo não implementa memória, não define banco de dados, não define persistência, e não cria estrutura de armazenamento. Ele descreve responsabilidades, limites arquiteturais e relações conceituais, organizando material já estabelecido em `AI_ARCHITECTURE.md`, `AI_ORCHESTRATOR.md` e `AGENT_FRAMEWORK.md`. Onde necessário, referencia `AI_MANIFESTO.md`, `AI_GOVERNANCE.md`, `03_AI_ARCHITECTURE.md`, `04_AI_ORCHESTRATOR.md`, `05_AGENT_REGISTRY.md` e `CONTEXT_FRAMEWORK.md` (nomenclatura oficial, conforme `VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decision 005).*

---

## 1. Purpose

Este capítulo existe para dar ao compartilhamento controlado de contexto entre o Orchestrator e os Agentes um lugar próprio na estrutura modular do Volume II, sem introduzir um componente novo. A plataforma já nomeia essa função **Memory Manager**, componente interno do Orchestrator descrito em `AI_ORCHESTRATOR.md`, Capítulos 5 e 10, operando sobre as cinco categorias de memória já conceituadas em `AI_ARCHITECTURE.md`, Capítulo 11. Este capítulo organiza esse material já existente sob o nome "Shared Memory" solicitado pela estrutura modular, sem redefini-lo. O aprofundamento técnico dedicado a este componente — `MEMORY_OS.md` — permanece pendente, conforme já identificado em `VOLUME_II_CONSOLIDATION_REPORT.md`, Seção 6.

---

## 2. Responsibilities

O Shared Memory (Memory Manager) existe para:

- **Disponibilizar contexto de forma controlada** — recuperar, mediante solicitação de um Agente já autorizado por seu `Memory Access` declarado no Agent Contract (`AGENT_FRAMEWORK.md`, Cap. 5), a memória relevante à subtarefa em processamento.
- **Preservar isolamento entre Empresas** — administrar a categoria de memória Organizacional com isolamento absoluto entre Empresas distintas, conforme `AI_HUB.md`, ADR-008.
- **Suportar o fluxo de coordenação** — fornecer, ao Orchestrator e ao Agente já resolvido pelo Agent Registry (`05_AGENT_REGISTRY.md`), a continuidade de memória necessária antes de qualquer Planejamento ou Raciocínio, aplicação direta de `Memory before planning` (`02_AI_PRINCIPLES.md`, Seção 3).

O Shared Memory nunca:

- **Raciocina** — ele recupera e disponibiliza memória; a aplicação de raciocínio sobre essa memória pertence exclusivamente ao Agente.
- **Decide** — nenhuma conclusão de negócio, nenhuma priorização de subtarefa, nenhuma escolha de Agente é tomada por ele.
- **Executa** — nenhuma ação de negócio, nenhum Command, é acionado pelo Shared Memory.
- **Substitui a memória de trabalho interna de um Agente durante sua própria invocação** — o processamento momentâneo que um Agente realiza dentro do escopo de uma única invocação permanece seu, mediado apenas quando essa memória precisa cruzar o limite de uma invocação ou o limite entre Agentes distintos.

---

## 3. Memory Model

As cinco categorias de memória já conceituadas em `AI_ARCHITECTURE.md`, Capítulo 11, permanecem integralmente as mesmas aqui referenciadas, nunca redefinidas ou ampliadas:

```
              CATEGORIAS DE MEMÓRIA (referenciadas de AI_ARCHITECTURE.md, Cap. 11)
   ┌───────────────────────────────────────────────────────────┐
   │  Efêmera:         duração de uma única solicitação                 │
   │  Persistente:      duração além de uma única solicitação                 │
   │  Compartilhada:     acessível por múltiplos Agentes, via                     │
   │                    Orchestrator                                                  │
   │  Contextual:        subconjunto relevante à solicitação atual                       │
   │  Organizacional:     específica de uma Empresa, isolada de outras                        │
   └───────────────────────────────────────────────────────────┘
```

Nenhuma categoria de memória se torna, ela mesma, fonte de verdade de negócio — toda memória é derivada de Evento, de Read Model ou de Conhecimento já catalogados pelo Architecture Handbook, nunca uma estrutura paralela e potencialmente divergente da verdade já consolidada por cada Business Hub proprietário (`AI_ARCHITECTURE.md`, Cap. 11).

**Memória não é Contexto.** `CONTEXT_FRAMEWORK.md`, Capítulo 2, já fixa essa distinção: Memória é informação preservada além do escopo de uma única solicitação; Contexto é a seleção momentânea de informação relevante a uma solicitação particular, que pode incluir Memória já recuperada, mas nunca se limita a ela. Este capítulo não trata da disciplina de construção, validação, scoring ou priorização de Contexto — essa disciplina permanece integralmente em `CONTEXT_FRAMEWORK.md`.

---

## 4. Interactions

Em nível estritamente conceitual — sem protocolo, sem contrato técnico, sem API:

| Interação | Natureza conceitual |
|---|---|
| **AI Orchestrator** | O Shared Memory não é externo ao Orchestrator — é seu componente interno Memory Manager (`04_AI_ORCHESTRATOR.md`, Seção 4). A relação é de composição. |
| **Agent Registry** | O Registry resolve qual Agente atende a uma subtarefa (`05_AGENT_REGISTRY.md`); o Shared Memory então disponibiliza, a esse Agente já resolvido, as categorias de memória que seu Agent Contract autoriza. |
| **Agentes** | Cada Agente lê e, quando autorizado, solicita escrita de memória exclusivamente dentro do escopo já declarado em seu `Memory Access` (`AGENT_FRAMEWORK.md`, Cap. 9) — nunca por acesso direto a estrutura de armazenamento, sempre mediado. |
| **Planning Engine** | Consome memória Persistente e Organizacional já disponibilizada antes de decompor uma Capability em subtarefas — aplicação de `Memory before planning`. |
| **Reasoning Engine** | Consome memória Contextual e Compartilhada, já disponibilizada, como parte do contexto que fundamenta seu raciocínio — aplicação de `Context before reasoning`. |
| **Business Hubs** | Nenhuma interação direta — o Shared Memory nunca acessa um Business Hub diretamente; toda memória já é derivada de Evento ou Read Model que o próprio Business Hub já publicou. |

---

## 5. Access Boundaries

- **Quem pode solicitar contexto**: exclusivamente um Agente já resolvido pelo Agent Registry, e apenas dentro do escopo já declarado em seu `Memory Access` — nenhum Agente solicita memória fora de seu próprio escopo autorizado, e nenhum Agente acessa a memória de outro Agente diretamente.
- **Quem pode disponibilizá-lo**: exclusivamente o Memory Manager, mediando toda leitura e toda escrita — nunca uma estrutura de armazenamento acessada diretamente por um Agente ou por um Business Hub.
- **Isolamento**: memória Organizacional nunca cruza a fronteira entre Empresas distintas, sob nenhuma circunstância (`AI_HUB.md`, ADR-008; `Tenant isolation is absolute`, `02_AI_PRINCIPLES.md`, Seção 5).
- **Expiração**: memória persistente nunca se torna memória permanente por omissão de manutenção — toda escrita autorizada permanece sujeita a critério explícito de relevância decrescente, aplicação prática de `Recommendations decay` (`AI_MANIFESTO.md`, Cap. 3; `AI_ORCHESTRATOR.md`, Cap. 10).
- **Rastreabilidade**: toda recuperação e toda escrita de memória produz sinal de Observabilidade suficiente para reconstrução posterior — nenhuma memória é consultada ou persistida de forma silenciosa.

---

## 6. Relationship with Volume I

Nenhuma categoria de memória se torna fonte de verdade de negócio paralela à já consolidada por cada Business Hub proprietário. Da mesma forma que um Read Model, já catalogado em `QUERY_CATALOG.md`, é sempre derivado e reconstruível a partir do histórico completo de Evento, toda memória desta camada é, em princípio, reconstruível a partir das mesmas fontes de origem já catalogadas pelo Architecture Handbook — nunca uma estrutura irreproduzível e independente.

---

## 7. Relationship with AI_MANIFESTO

As responsabilidades e limites do Shared Memory aplicam diretamente os princípios já organizados em `02_AI_PRINCIPLES.md`: `Memory before planning` e `Context before reasoning` (Seção 3, Operational Principles) fundamentam a Seção 4 deste capítulo; `Tenant isolation is absolute` e `Data minimization by design` (Seções 4 e 5) fundamentam a Seção 5; e `Recommendations decay` fundamenta a disciplina de Expiração já reafirmada acima.

---

## 8. Scope

Este capítulo cobre exclusivamente: o papel do Shared Memory na disponibilização controlada de memória entre Orchestrator e Agentes, as cinco categorias conceituais já existentes, suas interações conceituais, e os limites de acesso e isolamento já estabelecidos.

Este capítulo não cobre, e não tem autoridade para: especificar estrutura de armazenamento, mecanismo de persistência, ou tecnologia; especificar a disciplina de construção e qualificação de Contexto (matéria de `CONTEXT_FRAMEWORK.md`); ou antecipar o conteúdo do aprofundamento técnico ainda pendente em `MEMORY_OS.md`.

---

## 9. Future Evolution

Este componente é complementado pelos capítulos seguintes da estrutura modular, hoje todos já escritos: `07_PLANNING_ENGINE.md` e `08_REASONING_ENGINE.md` detalham como a memória aqui disponibilizada é efetivamente consumida antes da decomposição e do raciocínio; `09_SKILL_RUNTIME.md` e `10_TOOL_RUNTIME.md` detalham se e como um resultado técnico pode vir a ser proposto para persistência como nova memória; e `11_MULTI_AGENT_SYSTEM.md` detalha como a memória Compartilhada medeia a colaboração quando mais de um Agente é resolvido simultaneamente para a mesma solicitação. O aprofundamento técnico completo deste próprio componente permanece reservado a `MEMORY_OS.md`, ainda não escrito — a única pendência estrutural remanescente do Volume II, conforme `VOLUME_II_CONSOLIDATION_REPORT.md` e `GATE_G1_VOLUME_II_CONSOLIDATED.md`.

---

## 10. Approval

| Campo | Valor |
|---|---|
| Status | Draft |
| Version | 0.1 |
| Author | Claude |
