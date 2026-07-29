# INT-09 — Integração Orchestrator ↔ Multi-Agent System

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação do item INT-09 de `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md` — o item de maior sensibilidade arquitetural do backlog, conforme já registrado em sua Seção 3 ("risco arquitetural mais sensível do backlog"). Nenhum outro item do backlog é iniciado, alterado, ou antecipado por este documento.*

---

## 1. Objetivo

Implementar a integração declarativa entre o AI Orchestrator (Component 17) e o Multi-Agent System (Component 23) para representar a coordenação de Agentes durante o Pipeline de Decisão, incluindo a validação de pré-condições de participação, sem jamais introduzir referência direta entre dois Agentes, sem redefinir nenhum contrato público já existente, e sem implementar comunicação, fila, evento, consenso, coordenação distribuída, ou execução real de Agentes.

---

## 2. Base Utilizada

| Fonte | Uso |
|---|---|
| `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.3 e 7.9 | Limites e dependências declaradas de Orchestrator e Multi-Agent System |
| `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, 8, 9 | Etapa Execution — colaboração multi-Agente; dependências permitidas e proibidas |
| `AI_ORCHESTRATOR.md`, Capítulo 12 | "Colaboração entre Agentes já selecionados é organizada inteiramente pelo Agent Coordinator... nenhum Agente já selecionado se comunica diretamente com outro" |
| `docs/implementation/components/MULTI_AGENT_SPECIFICATION.md` | Especificação já aprovada do Component 23 — `MultiAgentIdentity`, `MultiAgentDefinition`, `MultiAgentRelationship` |
| `SPRINT_04_FINAL_APPROVAL.md` | Confirmação de que os onze componentes permanecem aprovados e sem alteração |
| `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-09 | Objetivo, critérios de aceitação, riscos e ordem obrigatória já fixados |

---

## 3. Achado Prévio — Nenhum Artefato de Multi-Agent System Já Referencia `requestId`

A inspeção de `MultiAgentIdentity.ts`, `MultiAgentDefinition.ts`, `MultiAgentState.ts` e `MultiAgentRelationship.ts` confirma que todos são identificados exclusivamente por `groupId`/`agentIds` — nenhum referencia `requestId` do Orchestrator. Mesma situação já encontrada em INT-07 e INT-08: nenhum vínculo pré-existente a reconhecer; o escopo desta Sprint exige artefato novo.

---

## 4. Decisão de Design — Preservação do Princípio "Agents Never Coordinate Themselves"

`MultiAgentRelationship`, já aprovado, é explícito: "a colaboração acontece através de exatamente três canais, e nunca por referência direta entre dois Agentes" (`MediatedByOrchestrator`, `SharedWorkflow`, `SharedRecord`). Este princípio é o critério de design mais restritivo de toda esta Sprint e foi tratado como inegociável:

- **Associação Orchestrator ↔ Grupo**: `OrchestratorMultiAgentCoordination` vincula `requestId` a `groupId` — mesma cardinalidade singular já usada por `ContextAssemblyResult` e `PlanningResult`, nunca vinculando um Agente a outro.

- **Validação de pré-condição de participação**: `MultiAgentParticipationPrecondition` vincula cada Agente ao seu próprio `groupId` e à sua própria `subtaskId` já delegada pelo Orchestrator (`AgentSelection`, Component 17) — nunca a outro Agente do mesmo grupo. A garantia arquitetural central é estrutural, não apenas documental: **nenhum campo deste artefato, ou de `OrchestratorMultiAgentCoordination`, referencia um `agentId` em relação a outro `agentId`** — toda relação passa exclusivamente por `groupId` (já mediado pelo Orchestrator) ou por `subtaskId` (já delegado individualmente). Isso reproduz, ao nível de artefato, exatamente o mesmo padrão já usado por `MultiAgentRelationship.kind = "MediatedByOrchestrator"`.

Nenhum dos dois artefatos importa `AgentSelection`, `MultiAgentIdentity`, `MultiAgentDefinition`, `MultiAgentRelationship`, `DecisionPipelineState`, ou qualquer outro tipo dos dois componentes — toda referência é por identificador opaco.

---

## 5. Artefatos Criados

### `OrchestratorMultiAgentCoordination` (novo — integração Orchestrator (17) ↔ Multi-Agent System (23))

```ts
export interface OrchestratorMultiAgentCoordination {
  readonly requestId: string;
  readonly groupId: string;
  readonly coordinatedAt: Date;
}
```

| Campo | Papel |
|---|---|
| `requestId` | Solicitação para a qual a coordenação Multi-Agent foi acionada |
| `groupId` | Grupo de coordenação envolvido — identificador opaco, sem redefinir `MultiAgentIdentity` (Component 23) |
| `coordinatedAt` | Momento em que a coordenação foi vinculada à solicitação |

### `MultiAgentParticipationPrecondition` (novo — integração Orchestrator (17) ↔ Multi-Agent System (23))

```ts
export interface MultiAgentParticipationPrecondition {
  readonly groupId: string;
  readonly agentId: string;
  readonly subtaskId: string;
  readonly delegationConfirmed: boolean;
  readonly validatedAt: Date;
}
```

| Campo | Papel |
|---|---|
| `groupId` | Grupo de coordenação ao qual a participação se refere |
| `agentId` | Agente cuja participação está sendo validada — nunca referenciado em relação a outro Agente do mesmo grupo |
| `subtaskId` | Subtarefa cuja delegação, já registrada pelo Orchestrator, fundamenta esta participação |
| `delegationConfirmed` | Se a delegação de subtarefa correspondente já foi confirmada pelo Orchestrator |
| `validatedAt` | Momento em que a verificação foi concluída |

Deliberadamente **não incluído** em ambos: qualquer campo que relacione um `agentId` a outro `agentId`; qualquer mecanismo de comunicação, fila, evento, consenso, ou coordenação distribuída; qualquer redefinição de `MultiAgentRelationship` ou `AgentSelection`.

---

## 6. Estrutura Concreta

| Elemento | Decisão |
|---|---|
| Arquivos | `platform/packages/ai/src/OrchestratorMultiAgentCoordination.ts`, `platform/packages/ai/src/MultiAgentParticipationPrecondition.ts` |
| Pacote | `@abp/ai` — mesmo pacote de todos os onze componentes, nenhum pacote novo criado |
| Import | Nenhum em nenhum dos dois arquivos — nem de `DecisionPipelineState.ts`, `AgentSelection.ts`, `MultiAgentIdentity.ts`, `MultiAgentDefinition.ts`, `MultiAgentRelationship.ts`, `MultiAgentState.ts`, nem de nenhum outro componente |
| Export | Um único tipo por arquivo, seguindo o mesmo padrão declarativo já usado desde INT-01 |

---

## 7. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| `MultiAgentIdentity.ts`, `MultiAgentDefinition.ts`, `MultiAgentState.ts`, `MultiAgentRelationship.ts`, `AgentSelection.ts`, `DecisionPipelineState.ts`, ou qualquer outro artefato já aprovado, modificado? | Não |
| Import de tipo entre Orchestrator (17) e Multi-Agent System (23)? | Não — vínculo exclusivamente por `requestId`/`groupId`/`agentId`/`subtaskId: string` opacos |
| **Referência direta de um `agentId` a outro `agentId`?** | **Não — verificado campo a campo em ambos os artefatos; toda relação passa por `groupId` ou por `subtaskId` individual, nunca Agente-a-Agente** |
| Import de `@abp/infrastructure`, `@abp/platform-services`, `@abp/core`, ou `@abp/shared`? | Não |
| Dependência estrutural nova entre Orchestrator e Multi-Agent System? | Não — apenas identificador opaco, mesmo padrão de INT-01 a INT-08 |
| Novo componente introduzido além dos onze já aprovados? | Não |
| Comunicação entre Agentes, fila, evento, consenso, ou coordenação distribuída implementada? | Não — artefatos puramente declarativos, sem função ou lógica de runtime |
| Execução de Agente ou IA concreta implementada? | Não |
| Isolamento entre os componentes preservado? | Sim — nenhuma referência de código em nenhum sentido entre os arquivos de Orchestrator e de Multi-Agent System; os novos artefatos apenas referenciam ambos por identificador |
| Outro item do backlog (INT-01 a INT-08 reabertos, INT-10) iniciado? | Não |

---

## 8. Critérios de Aceitação (herdados de INT-09)

✓ Comunicação exclusivamente por identificadores opacos e contratos declarativos.
✓ Nenhuma dependência estrutural criada entre Orchestrator e Multi-Agent System.
✓ Nenhum artefato já aprovado modificado.
✓ Modelagem da associação entre Orchestrator e o contexto de coordenação Multi-Agent concluída (`OrchestratorMultiAgentCoordination`).
✓ Validação de pré-condições para participação de Agentes em uma coordenação concluída (`MultiAgentParticipationPrecondition`), preservando integralmente o princípio de mediação exclusiva já fixado em `MultiAgentRelationship`.

---

## Approval

| Campo | Valor |
|---|---|
| Status | INT-09 IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
