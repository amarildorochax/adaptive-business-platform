# INT-05 — Integração Orchestrator ↔ Agent Framework

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação do item INT-05 de `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`. Nenhum outro item do backlog é iniciado, alterado, ou antecipado por este documento.*

---

## 1. Objetivo

Permitir que o AI Orchestrator (Component 17) selecione e referencie o Agente (Component 18) responsável pela execução de uma subtarefa durante a etapa Agent Delegation do Pipeline de Decisão, sem redefinir nenhum contrato público já existente de nenhum dos dois componentes, e sem implementar execução ou coordenação real de Agentes.

---

## 2. Base Utilizada

| Fonte | Uso |
|---|---|
| `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.3 e 7.4 | Limites e dependências declaradas de Orchestrator e Agent Framework |
| `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, 8, 9 | Etapa Agent Delegation; dependências permitidas (identificador opaco) e proibidas (import de tipo entre componentes) |
| `AI_ORCHESTRATOR.md`, Capítulos 5, 6, 12 | Agent Coordinator, etapa Agent Delegation do Pipeline, Seleção de Agentes |
| `AGENT_FRAMEWORK.md`, Capítulo 5 | Agent Contract — os dezessete elementos obrigatórios |
| `SPRINT_04_FINAL_APPROVAL.md` | Confirmação de que os onze componentes permanecem aprovados e sem alteração |
| `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-05 | Objetivo, critérios de aceitação, e ordem obrigatória já fixados |

---

## 3. Achado Prévio — `AgentSelection` já satisfaz a seleção e referência

Diferente de INT-01 a INT-04, a inspeção do código já aprovado revelou que `AgentSelection` (Component 17, criado durante a implementação original do Orchestrator na Sprint 4, antes desta Sprint de integração) **já implementa integralmente** a capacidade descrita no objetivo desta Sprint:

```ts
export interface AgentSelection {
  readonly subtaskId: string;
  readonly agentId: string;
  readonly selectedAt: Date;
}
```

Este artefato já vincula uma subtarefa ao Agente selecionado através de identificador opaco (`agentId`), com comentário original já explícito: "Agente selecionado — identificador opaco, sem redefinir Agent Contract (Component 18)." Nenhum novo artefato é necessário para duplicar essa capacidade — fazê-lo violaria a disciplina de não recriar o que já existe, já aplicada consistentemente desde a Sprint 2.

Este achado é registrado de forma transparente, mesmo padrão já aplicado a discrepâncias documentais anteriores (`COMPONENT_18_AGENT_FRAMEWORK_DESIGN.md`, nota de contagem de componentes internos).

---

## 4. Lacuna Real Identificada e Decisão de Design

O próprio item INT-05 de `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md` já antecipa a lacuna real, distinta da seleção: "validando seu `AgentContract`" antes da conclusão da etapa Agent Delegation. `AGENT_FRAMEWORK.md`, Capítulo 5, é explícito — "a ausência de qualquer elemento é tratada como especificação incompleta, nunca como variação legítima" — mas nenhum artefato já aprovado registra o resultado dessa verificação de completude.

Esta lacuna é estruturalmente idêntica à já resolvida por `ContextValidationResult` (Component 15) e `MemoryValidation` (Component 16) — um registro declarativo de que uma verificação estrutural ocorreu, nunca a lógica de verificação em si, e nunca a execução do Agente. O mesmo padrão é reaplicado aqui, por analogia direta, sem inventar uma nova dimensão de qualidade não fundamentada em `AGENT_FRAMEWORK.md`: um único booleano de completude (`contractComplete`), consistente com o critério único e binário — completo ou incompleto — já fixado no Capítulo 5 daquele documento.

---

## 5. Artefato Criado

### `AgentDelegationValidation` (novo — Component 17, Orchestrator)

```ts
export interface AgentDelegationValidation {
  readonly subtaskId: string;
  readonly agentId: string;
  readonly contractComplete: boolean;
  readonly validatedAt: Date;
}
```

| Campo | Papel |
|---|---|
| `subtaskId` | Subtarefa cuja delegação está sendo validada — mesmo identificador já usado por `AgentSelection` |
| `agentId` | Agente selecionado — identificador opaco, mesmo de `AgentSelection.agentId`, sem redefinir `AgentContract` (Component 18) |
| `contractComplete` | Se os dezessete elementos obrigatórios do Agent Contract estão presentes — extensão por analogia a `ContextValidationResult`/`MemoryValidation` |
| `validatedAt` | Momento em que a verificação foi concluída |

Deliberadamente **não incluído**: qualquer campo que redefina os dezessete elementos de `AgentContract`, qualquer lógica de verificação real, e qualquer campo relativo à execução ou à coordenação entre Agentes (fora do escopo explícito desta Sprint).

---

## 6. Estrutura Concreta

| Elemento | Decisão |
|---|---|
| Arquivo | `platform/packages/ai/src/AgentDelegationValidation.ts` |
| Pacote | `@abp/ai` — mesmo pacote de todos os onze componentes, nenhum pacote novo criado |
| Import | Nenhum — nem de `AgentContract.ts`, `AgentSelection.ts`, `AgentLifecycleState.ts`, nem de nenhum outro componente |
| Export | Um único tipo, `AgentDelegationValidation`, seguindo o mesmo padrão declarativo já usado por `ContextValidationResult.ts` (Component 15) e `MemoryValidation.ts` (Component 16), e o mesmo padrão de integração já usado em INT-01 a INT-04 |

---

## 7. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| `AgentContract.ts`, `AgentSelection.ts`, `AgentLifecycleState.ts`, ou qualquer outro artefato de Agent Framework, modificado? | Não |
| `DecisionPipelineState.ts` modificado? | Não |
| Import de tipo entre Agent Framework (18) e Orchestrator (17)? | Não — vínculo exclusivamente por `subtaskId`/`agentId: string` opacos |
| Import de `@abp/infrastructure`, `@abp/platform-services`, `@abp/core`, ou `@abp/shared`? | Não |
| Dependência estrutural nova entre Agent Framework e Orchestrator? | Não — apenas identificador opaco, mesmo padrão de INT-01 a INT-04 |
| Novo componente introduzido além dos onze já aprovados? | Não |
| Execução de Agente, coordenação entre Agentes, ou IA concreta implementada? | Não — artefato puramente declarativo, sem função ou lógica de runtime |
| Isolamento entre Agent Framework e os demais componentes preservado? | Sim — Agent Framework permanece sem nenhuma referência de código a Orchestrator; a referência existe apenas no sentido Orchestrator → Agent Framework, por identificador |
| Artefato duplicado desnecessariamente? | Não — `AgentSelection`, já existente, não foi recriado; apenas a lacuna real (validação de completude) foi modelada |
| Outro item do backlog (INT-01 a INT-04 reabertos, INT-06 a INT-10) iniciado? | Não |

---

## 8. Critérios de Aceitação (herdados de INT-05)

✓ Comunicação exclusivamente por identificadores opacos e contratos declarativos.
✓ Nenhuma dependência estrutural criada entre Agent Framework e Orchestrator.
✓ Nenhum artefato já aprovado de Agent Framework modificado.
✓ Modelagem do resultado da seleção do Agente confirmada como já satisfeita por `AgentSelection`; lacuna real (validação de completude do Agent Contract) modelada por `AgentDelegationValidation`.

---

## Approval

| Campo | Valor |
|---|---|
| Status | INT-05 IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
