# INT-01 — Integração Orchestrator ↔ Context

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação do item INT-01 de `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md` — a primeira e única Sprint de integração autorizada por este ciclo. Nenhum outro item do backlog é iniciado, alterado, ou antecipado por este documento.*

---

## 1. Objetivo

Permitir que o AI Orchestrator (Component 17) consuma o Contexto já montado pelo Context Framework (Component 15) durante a etapa Context Assembly do Pipeline de Decisão, sem redefinir nenhum contrato público já existente de nenhum dos dois componentes.

---

## 2. Base Utilizada

| Fonte | Uso |
|---|---|
| `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.1 e 7.3 | Limites e dependências declaradas de Context e Orchestrator |
| `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, 8, 9 | Etapa Context Assembly; dependências permitidas (identificador opaco) e proibidas (import de tipo entre componentes) |
| `AI_ORCHESTRATOR.md`, Capítulos 5, 6, 9 | Context Builder, etapa Context Assembly do Pipeline, Gerenciamento de Contexto |
| `CONTEXT_FRAMEWORK.md`, Capítulos 4–16 | Estrutura do Contexto já implementada em Component 15 |
| `SPRINT_04_FINAL_APPROVAL.md` | Confirmação de que os onze componentes permanecem aprovados e sem alteração |
| `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-01 | Objetivo, critérios de aceitação, e ordem obrigatória já fixados |

---

## 3. Decisão de Design

A etapa Context Assembly já é nomeada em `AI_ORCHESTRATOR.md`, Capítulo 6, e o Contexto já é o artefato completo de Component 15. A única lacuna real entre os dois é o **registro de vínculo** entre uma solicitação (`requestId`) e o Contexto já resolvido para ela (`contextId`) — o mesmo padrão já usado por `CapabilitySelection` (Orchestrator ↔ Capability) e por `AgentSelection` (Orchestrator ↔ Agent Framework), ambos artefatos do Orchestrator que referenciam outro componente exclusivamente por identificador opaco.

Este padrão é reaplicado aqui sem modificação: um novo artefato, de propriedade do Orchestrator, vincula `requestId` a `contextId` — nunca importando o tipo `Context` (Component 15), e nunca sendo importado por nenhum arquivo de Context.

`ContextDistribution` (Component 15), já existente, permanece o mecanismo simétrico do lado do Context — seu campo `recipientId: string` já é suficientemente genérico para representar o Orchestrator como destinatário, sem exigir nenhuma alteração.

---

## 4. Artefato Criado

### `ContextAssemblyResult` (novo — Component 17, Orchestrator)

```ts
export interface ContextAssemblyResult {
  readonly requestId: string;
  readonly contextId: string;
  readonly assembledAt: Date;
}
```

| Campo | Papel |
|---|---|
| `requestId` | Solicitação em processamento — mesmo identificador já usado por `DecisionPipelineState`, `CapabilitySelection`, `AgentSelection` |
| `contextId` | Contexto resolvido — identificador opaco, sem redefinir `Context` (Component 15) |
| `assembledAt` | Momento em que a etapa Context Assembly foi concluída para esta solicitação |

---

## 5. Estrutura Concreta

| Elemento | Decisão |
|---|---|
| Arquivo | `platform/packages/ai/src/ContextAssemblyResult.ts` |
| Pacote | `@abp/ai` — mesmo pacote de todos os onze componentes, nenhum pacote novo criado |
| Import | Nenhum — nem de `Context.ts`, nem de `DecisionPipelineState.ts`, nem de nenhum outro componente |
| Export | Um único tipo, `ContextAssemblyResult`, seguindo o padrão já usado por `CapabilitySelection.ts` e `AgentSelection.ts` |

---

## 6. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| `Context.ts` modificado? | Não |
| `DecisionPipelineState.ts` modificado? | Não |
| Import de tipo entre Context (15) e Orchestrator (17)? | Não — vínculo exclusivamente por `contextId: string` opaco |
| Import de `@abp/infrastructure`, `@abp/platform-services`, `@abp/core`, ou `@abp/shared`? | Não |
| Novo componente introduzido além dos onze já aprovados? | Não |
| Mecanismo de execução, IA concreta, ou ferramenta implementado? | Não — artefato puramente declarativo, sem função ou lógica de runtime |
| Isolamento entre Context e os demais componentes preservado? | Sim — Context permanece sem nenhuma referência de código a Orchestrator; a referência existe apenas no sentido Orchestrator → Context, por identificador |
| Outro item do backlog (INT-02 a INT-10) iniciado? | Não |

---

## 7. Critérios de Aceitação (herdados de INT-01)

✓ Nenhuma alteração de contrato público de `Context` ou de `DecisionPipelineState`.
✓ Resolução modelada estritamente na etapa Context Assembly, conforme `AI_ORCHESTRATOR.md`, Capítulo 6, e `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6.
✓ Nenhum acoplamento além do identificador opaco já autorizado por `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 8.

---

## Approval

| Campo | Valor |
|---|---|
| Status | INT-01 IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
