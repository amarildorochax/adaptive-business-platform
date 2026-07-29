# INT-04 — Integração Execution Policy ↔ AI Governance

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação do item INT-04 de `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`. Nenhum outro item do backlog é iniciado, alterado, ou antecipado por este documento.*

---

## 1. Objetivo

Permitir que o AI Orchestrator (Component 17) registre e referencie a avaliação de governança da etapa Execution Policy do Pipeline de Decisão, realizada contra AI Governance (Component 24), sem redefinir nenhum contrato público já existente de nenhum dos dois componentes, e sem implementar enforcement real de Política.

---

## 2. Base Utilizada

| Fonte | Uso |
|---|---|
| `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.3 e 7.10 | Limites e dependências declaradas de Orchestrator e AI Governance |
| `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, 8, 9 | Etapa Execution Policy avaliada contra AI Governance; dependências permitidas (identificador opaco) e proibidas (import de tipo entre componentes) |
| `AI_ORCHESTRATOR.md`, Capítulos 5, 6, 13 | Execution Policy Engine, etapa Execution Policy do Pipeline de Decisão |
| `docs/implementation/components/AI_GOVERNANCE_SPECIFICATION.md` | Especificação já aprovada do Component 24 — `GovernancePolicy`, `GovernanceRule`, `GovernanceCompliance` |
| `SPRINT_04_FINAL_APPROVAL.md` | Confirmação de que os onze componentes permanecem aprovados e sem alteração |
| `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-04 | Objetivo, critérios de aceitação, e ordem obrigatória já fixados |

---

## 3. Decisão de Design

`AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, já fixa que a etapa Execution Policy é sustentada pelo Orchestrator (`ExecutionPolicy`) "avaliado contra AI Governance (24)". `ExecutionPolicy` (Component 17) já existe e é identificado por `subtaskId`; `GovernancePolicy`/`GovernanceRule` (Component 24) já existem e são identificados por `policyId`. A lacuna real é o vínculo entre os dois — o registro de que uma subtarefa específica teve sua Execution Policy avaliada contra um ou mais `policyId` já registrados.

Diferente de INT-01/INT-02/INT-03, este item exige um cuidado adicional explícito na restrição do usuário: **não implementar enforcement de políticas**. Por isso, o novo artefato registra apenas que a avaliação ocorreu e quais Políticas foram consultadas — nunca o efeito resultante (`GovernanceEffect`, já de propriedade exclusiva de Component 24) e nunca uma decisão de permitir ou bloquear. Duplicar `GovernanceEffect` aqui equivaleria a redefinir, mesmo que parcialmente, um contrato já publicado de AI Governance — exatamente o que a Seção 9 de `AI_CORE_INTEGRATION_ARCHITECTURE.md` proíbe.

O padrão já estabelecido em INT-01/INT-02/INT-03 é reaplicado: um novo artefato, de propriedade do Orchestrator, vincula um identificador já existente do Orchestrator (`subtaskId`, o mesmo já usado por `ExecutionPolicy`) a identificadores opacos de Governance (`policyIds`) — nunca importando `GovernancePolicy`, `GovernanceRule`, `GovernanceEffect` ou `GovernanceCompliance` (Component 24), e nunca sendo importado por nenhum arquivo de Governance.

---

## 4. Artefato Criado

### `ExecutionPolicyGovernanceEvaluation` (novo — Component 17, Orchestrator)

```ts
export interface ExecutionPolicyGovernanceEvaluation {
  readonly subtaskId: string;
  readonly policyIds: readonly string[];
  readonly evaluatedAt: Date;
}
```

| Campo | Papel |
|---|---|
| `subtaskId` | Subtarefa cuja Execution Policy foi avaliada — mesmo identificador já usado por `ExecutionPolicy` (Component 17) |
| `policyIds` | Políticas de Governança consultadas — identificadores opacos, plural (mais de uma Política pode se aplicar), sem redefinir `GovernancePolicy` (Component 24) |
| `evaluatedAt` | Momento em que a avaliação foi concluída |

Deliberadamente **não incluído**: qualquer campo equivalente a `GovernanceEffect` (permitir/bloquear/exigir aprovação/exigir registro) — esse resultado permanece de propriedade exclusiva de AI Governance, consultável por seu próprio identificador (`policyId`) quando necessário, nunca duplicado neste artefato.

---

## 5. Estrutura Concreta

| Elemento | Decisão |
|---|---|
| Arquivo | `platform/packages/ai/src/ExecutionPolicyGovernanceEvaluation.ts` |
| Pacote | `@abp/ai` — mesmo pacote de todos os onze componentes, nenhum pacote novo criado |
| Import | Nenhum — nem de `GovernancePolicy.ts`, `GovernanceRule.ts`, `GovernanceCompliance.ts`, nem de `ExecutionPolicy.ts`, nem de nenhum outro componente |
| Export | Um único tipo, `ExecutionPolicyGovernanceEvaluation`, seguindo o mesmo padrão já usado por `ContextAssemblyResult.ts` (INT-01), `MemoryRetrievalResult.ts` (INT-02) e `PlanningResult.ts` (INT-03) |

---

## 6. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| `GovernancePolicy.ts`, `GovernanceRule.ts`, `GovernanceCompliance.ts`, ou qualquer outro artefato de AI Governance, modificado? | Não |
| `ExecutionPolicy.ts` ou `DecisionPipelineState.ts` modificado? | Não |
| Import de tipo entre AI Governance (24) e Orchestrator (17)? | Não — vínculo exclusivamente por `subtaskId`/`policyIds: readonly string[]` opacos |
| `GovernanceEffect` duplicado ou antecipado? | Não — resultado da avaliação permanece exclusivo de AI Governance |
| Import de `@abp/infrastructure`, `@abp/platform-services`, `@abp/core`, ou `@abp/shared`? | Não |
| Dependência estrutural nova entre AI Governance e Orchestrator? | Não — apenas identificador opaco, mesmo padrão de INT-01, INT-02 e INT-03 |
| Novo componente introduzido além dos onze já aprovados? | Não |
| Enforcement de Política, execução de Agente, ou IA concreta implementado? | Não — artefato puramente declarativo, sem função ou lógica de runtime |
| Isolamento entre AI Governance e os demais componentes preservado? | Sim — AI Governance permanece sem nenhuma referência de código a Orchestrator; a referência existe apenas no sentido Orchestrator → AI Governance, por identificador |
| Outro item do backlog (INT-01/02/03 reabertos, INT-05 a INT-10) iniciado? | Não |

---

## 7. Critérios de Aceitação (herdados de INT-04)

✓ Comunicação exclusivamente por identificadores opacos e contratos declarativos.
✓ Nenhuma dependência estrutural criada entre AI Governance e Orchestrator.
✓ Nenhum artefato já aprovado de AI Governance modificado.
✓ Modelagem do resultado da avaliação de governança concluída (`ExecutionPolicyGovernanceEvaluation`), sem duplicar `GovernanceEffect` e sem implementar enforcement.

---

## Approval

| Campo | Valor |
|---|---|
| Status | INT-04 IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
