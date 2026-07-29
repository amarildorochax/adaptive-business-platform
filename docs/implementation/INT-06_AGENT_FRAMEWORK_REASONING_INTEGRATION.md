# INT-06 — Integração Agent Framework ↔ Reasoning

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação do item INT-06 de `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`. Nenhum outro item do backlog é iniciado, alterado, ou antecipado por este documento.*

---

## 1. Objetivo

Implementar a integração declarativa entre o Agent Framework (Component 18) e o Reasoning Framework (Component 19) durante a etapa de raciocínio do Pipeline de Decisão, incluindo a validação de pré-condições para utilização do raciocínio pelo Agente, sem redefinir nenhum contrato público já existente, e sem implementar execução de raciocínio, modelo de IA, ou inferência real.

---

## 2. Base Utilizada

| Fonte | Uso |
|---|---|
| `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.4 e 7.5 | Limites e dependências declaradas de Agent Framework e Reasoning |
| `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, 8, 9 | Etapa Execution — Agent Framework → Reasoning; dependências permitidas e proibidas |
| `docs/implementation/components/REASONING_SPECIFICATION.md` | Especificação já aprovada do Component 19 — `ReasoningCycleState`, `ReasoningConclusion` |
| `AGENT_FRAMEWORK.md`, Capítulo 5 e 11 | Agent Contract (`reasoningInterfaceDeclared`); ciclo de raciocínio do Agente |
| `SPRINT_04_FINAL_APPROVAL.md` | Confirmação de que os onze componentes permanecem aprovados e sem alteração |
| `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-06 | Objetivo, critérios de aceitação, e ordem obrigatória já fixados |

---

## 3. Achado Prévio — `ReasoningCycleState` já modela a interação

A inspeção do código já aprovado revelou que `ReasoningCycleState` (Component 19) já vincula, por identificador opaco, um Agente e uma subtarefa a um ciclo de raciocínio:

```ts
export interface ReasoningCycleState {
  readonly agentId: string;
  readonly subtaskId: string;
  readonly stage: ReasoningStage;
  readonly enteredAt: Date;
}
```

Este vínculo já satisfaz a exigência de "modelagem da interação entre Agent Framework e Reasoning" através de `agentId`/`subtaskId`, sem import de tipo entre os dois componentes desde sua criação original na Sprint 4. Nenhum novo artefato é necessário para duplicar esse vínculo — mesmo achado já registrado para `AgentSelection` em INT-05.

---

## 4. Lacuna Real Identificada e Decisão de Design

A lacuna real, explicitamente exigida pelo escopo desta Sprint, é a **validação de pré-condições para utilização do raciocínio pelo Agente** — nenhum artefato já aprovado registra que, antes de um ciclo de raciocínio começar, foi verificado que o Agente em questão de fato declara `reasoningInterfaceDeclared: true` em seu Agent Contract (`AGENT_FRAMEWORK.md`, Capítulo 5).

Esta lacuna é estruturalmente idêntica à já resolvida por `AgentDelegationValidation` (INT-05) — um registro declarativo de que uma verificação de pré-condição ocorreu, nunca a lógica de verificação em si, e nunca a execução do ciclo de raciocínio. O mesmo padrão é reaplicado aqui, por analogia direta.

---

## 5. Artefato Criado

### `AgentReasoningPrecondition` (novo — integração Agent Framework (18) ↔ Reasoning (19))

```ts
export interface AgentReasoningPrecondition {
  readonly agentId: string;
  readonly subtaskId: string;
  readonly reasoningInterfaceDeclared: boolean;
  readonly validatedAt: Date;
}
```

| Campo | Papel |
|---|---|
| `agentId` | Agente que pretende iniciar o ciclo de raciocínio — mesmo identificador já usado por `ReasoningCycleState.agentId` |
| `subtaskId` | Subtarefa sobre a qual o raciocínio seria aplicado — mesmo identificador já usado por `ReasoningCycleState.subtaskId` |
| `reasoningInterfaceDeclared` | Se o Agente declara contrato de raciocínio especializado — mesmo nome de campo já usado em `AgentContract.reasoningInterfaceDeclared`, reutilizado apenas como valor booleano, nunca como import de tipo |
| `validatedAt` | Momento em que a verificação foi concluída |

Deliberadamente **não incluído**: qualquer campo que redefina `AgentContract` ou `ReasoningCycleState`, qualquer lógica de verificação real, e qualquer campo relativo à execução do ciclo de raciocínio, inferência, ou modelo de IA.

---

## 6. Estrutura Concreta

| Elemento | Decisão |
|---|---|
| Arquivo | `platform/packages/ai/src/AgentReasoningPrecondition.ts` |
| Pacote | `@abp/ai` — mesmo pacote de todos os onze componentes, nenhum pacote novo criado |
| Import | Nenhum — nem de `AgentContract.ts`, `ReasoningCycleState.ts`, `ReasoningConclusion.ts`, nem de nenhum outro componente |
| Export | Um único tipo, `AgentReasoningPrecondition`, seguindo o mesmo padrão declarativo já usado por `AgentDelegationValidation.ts` (INT-05) |

---

## 7. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| `AgentContract.ts`, `ReasoningCycleState.ts`, `ReasoningConclusion.ts`, ou qualquer outro artefato já aprovado, modificado? | Não |
| Import de tipo entre Agent Framework (18) e Reasoning (19)? | Não — vínculo exclusivamente por `agentId`/`subtaskId: string` opacos |
| Import de `@abp/infrastructure`, `@abp/platform-services`, `@abp/core`, ou `@abp/shared`? | Não |
| Dependência estrutural nova entre Agent Framework e Reasoning? | Não — apenas identificador opaco, mesmo padrão de INT-01 a INT-05 |
| Novo componente introduzido além dos onze já aprovados? | Não |
| Execução de raciocínio, modelo de IA, ou inferência implementada? | Não — artefato puramente declarativo, sem função ou lógica de runtime |
| Isolamento entre os componentes preservado? | Sim — nenhuma referência de código em nenhum sentido entre os arquivos de Agent Framework e de Reasoning; o novo artefato apenas referencia ambos por identificador |
| Artefato duplicado desnecessariamente? | Não — `ReasoningCycleState`, já existente, não foi recriado; apenas a lacuna real (validação de pré-condição) foi modelada |
| Outro item do backlog (INT-01 a INT-05 reabertos, INT-07 a INT-10) iniciado? | Não |

---

## 8. Critérios de Aceitação (herdados de INT-06)

✓ Comunicação exclusivamente por identificadores opacos e contratos declarativos.
✓ Nenhuma dependência estrutural criada entre Agent Framework e Reasoning.
✓ Nenhum artefato já aprovado modificado.
✓ Modelagem da interação confirmada como já satisfeita por `ReasoningCycleState`; validação de pré-condição modelada por `AgentReasoningPrecondition`.

---

## Approval

| Campo | Valor |
|---|---|
| Status | INT-06 IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
