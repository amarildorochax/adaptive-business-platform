# INT-03 — Integração Orchestrator ↔ Planning

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação do item INT-03 de `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`. Nenhum outro item do backlog é iniciado, alterado, ou antecipado por este documento.*

---

## 1. Objetivo

Permitir que o AI Orchestrator (Component 17) solicite, referencie e registre o resultado da etapa Planning do Pipeline de Decisão, produzido pelo Planning Framework (Component 20), sem redefinir nenhum contrato público já existente de nenhum dos dois componentes.

---

## 2. Base Utilizada

| Fonte | Uso |
|---|---|
| `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.3 e 7.6 | Limites e dependências declaradas de Orchestrator e Planning |
| `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, 8, 9 | Etapa Planning; dependências permitidas (identificador opaco) e proibidas (import de tipo entre componentes) |
| `AI_ORCHESTRATOR.md`, Capítulos 5, 6 | Planning Engine, etapa Planning do Pipeline de Decisão |
| `docs/implementation/components/PLANNING_SPECIFICATION.md` | Especificação já aprovada do Component 20 — `PlanningState`, `PlanningStep`, `PlanningGoal` |
| `SPRINT_04_FINAL_APPROVAL.md` | Confirmação de que os onze componentes permanecem aprovados e sem alteração |
| `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-03 | Objetivo, critérios de aceitação, e ordem obrigatória já fixados |

---

## 3. Decisão de Design

A etapa Planning já é nomeada em `AI_ORCHESTRATOR.md`, Capítulo 6: "o Planning Engine decompõe a Capability já resolvida em um plano de subtarefas executáveis, identificando dependência entre elas." O plano em si já é modelado integralmente por Component 20 (`PlanningState`, `PlanningGoal`, `PlanningStep`), identificado por `planId`.

Assim como em INT-01 e INT-02, a única lacuna real é o vínculo entre a solicitação (`requestId`) e o plano já produzido para ela (`planId`) — um plano por solicitação, mesma cardinalidade já usada por `ContextAssemblyResult.contextId` (INT-01), e distinta da pluralidade de `MemoryRetrievalResult.memoryIds` (INT-02).

O padrão já estabelecido é reaplicado sem alteração estrutural: um novo artefato, de propriedade do Orchestrator, vincula `requestId` a `planId` — nunca importando `PlanningState`, `PlanningGoal` ou `PlanningStep` (Component 20), e nunca sendo importado por nenhum arquivo de Planning.

---

## 4. Artefato Criado

### `PlanningResult` (novo — Component 17, Orchestrator)

```ts
export interface PlanningResult {
  readonly requestId: string;
  readonly planId: string;
  readonly plannedAt: Date;
}
```

| Campo | Papel |
|---|---|
| `requestId` | Solicitação em processamento — mesmo identificador já usado por `DecisionPipelineState`, `CapabilitySelection`, `AgentSelection`, `ContextAssemblyResult`, `MemoryRetrievalResult` |
| `planId` | Plano produzido — identificador opaco, sem redefinir `PlanningState` (Component 20) |
| `plannedAt` | Momento em que a etapa Planning foi concluída para esta solicitação |

---

## 5. Estrutura Concreta

| Elemento | Decisão |
|---|---|
| Arquivo | `platform/packages/ai/src/PlanningResult.ts` |
| Pacote | `@abp/ai` — mesmo pacote de todos os onze componentes, nenhum pacote novo criado |
| Import | Nenhum — nem de `PlanningState.ts`, `PlanningGoal.ts`, `PlanningStep.ts`, nem de `DecisionPipelineState.ts`, nem de nenhum outro componente |
| Export | Um único tipo, `PlanningResult`, seguindo o mesmo padrão já usado por `CapabilitySelection.ts`, `AgentSelection.ts`, `ContextAssemblyResult.ts` (INT-01) e `MemoryRetrievalResult.ts` (INT-02) |

---

## 6. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| `PlanningState.ts`, `PlanningGoal.ts`, `PlanningStep.ts`, ou qualquer outro artefato de Planning, modificado? | Não |
| `DecisionPipelineState.ts` modificado? | Não |
| Import de tipo entre Planning (20) e Orchestrator (17)? | Não — vínculo exclusivamente por `planId: string` opaco |
| Import de `@abp/infrastructure`, `@abp/platform-services`, `@abp/core`, ou `@abp/shared`? | Não |
| Dependência estrutural nova entre Planning e Orchestrator? | Não — apenas identificador opaco, mesmo padrão de INT-01 e INT-02 |
| Novo componente introduzido além dos onze já aprovados? | Não |
| Mecanismo de execução, IA concreta, ou decomposição real implementado? | Não — artefato puramente declarativo, sem função ou lógica de runtime |
| Isolamento entre Planning e os demais componentes preservado? | Sim — Planning permanece sem nenhuma referência de código a Orchestrator; a referência existe apenas no sentido Orchestrator → Planning, por identificador |
| Outro item do backlog (INT-01/INT-02 reabertos, INT-04 a INT-10) iniciado? | Não |

---

## 7. Critérios de Aceitação (herdados de INT-03)

✓ Comunicação exclusivamente por identificadores opacos e contratos declarativos.
✓ Nenhuma dependência estrutural criada entre Planning e Orchestrator.
✓ Nenhum artefato já aprovado de Planning modificado.
✓ Modelagem do resultado da etapa de planejamento concluída (`PlanningResult`).

---

## Approval

| Campo | Valor |
|---|---|
| Status | INT-03 IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
