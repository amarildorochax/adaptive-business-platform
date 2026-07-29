# INT-02 — Integração Orchestrator ↔ Memory

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação do item INT-02 de `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`. Nenhum outro item do backlog é iniciado, alterado, ou antecipado por este documento.*

---

## 1. Objetivo

Permitir que o AI Orchestrator (Component 17) solicite e referencie a recuperação de memória já realizada pelo Memory Framework (Component 16) durante a etapa Memory Retrieval do Pipeline de Decisão, sem redefinir nenhum contrato público já existente de nenhum dos dois componentes.

---

## 2. Base Utilizada e Nota de Reconciliação Documental

| Fonte | Uso |
|---|---|
| `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.2 e 7.3 | Limites e dependências declaradas de Memory e Orchestrator |
| `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, 8, 9 | Etapa Memory Retrieval; dependências permitidas (identificador opaco) e proibidas (import de tipo entre componentes) |
| `AI_ORCHESTRATOR.md`, Capítulos 5, 6, 10 | Memory Manager, etapa Memory Retrieval do Pipeline, Gerenciamento de Memória |
| `SPRINT_04_FINAL_APPROVAL.md` | Confirmação de que os onze componentes permanecem aprovados e sem alteração |
| `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-02 | Objetivo, critérios de aceitação, e ordem obrigatória já fixados |

**Nota de reconciliação**: a Base Obrigatória desta Sprint cita `MEMORY_FRAMEWORK.md`. Este arquivo não existe como documento Official autônomo no repositório — o mesmo já registrado em `SPRINT_04_TRACEABILITY_MATRIX.md`, Component 16, e em `VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decision 008 (aprofundamento técnico dedicado de Memory, `MEMORY_OS.md`, formalmente adiado). A estrutura de Memory já implementada (Component 16) deriva de `AI_HUB.md` Cap. 11, `AI_ARCHITECTURE.md` Cap. 11, `AGENT_FRAMEWORK.md` Cap. 9 e `AI_ORCHESTRATOR.md` Cap. 10 — as mesmas fontes usadas aqui, sem aguardar um documento ainda não escrito. Esta reconciliação é registrada de forma transparente, mesmo padrão já aplicado em `COMPONENT_16_MEMORY_DESIGN.md`.

---

## 3. Decisão de Design

A etapa Memory Retrieval já é nomeada em `AI_ORCHESTRATOR.md`, Capítulo 6 e 10 — o Memory Manager recupera memória relevante já persistida, complementando o Contexto recém-reunido. Diferente de INT-01 (um único `contextId` por solicitação), a recuperação de memória é plural por natureza ("memória relevante já persistida de interações passadas"), mesma característica plural já modelada em `CapabilitySelection.capabilityIds`.

O padrão já estabelecido em INT-01 é reaplicado aqui sem alteração estrutural: um novo artefato, de propriedade do Orchestrator, vincula `requestId` às entradas de memória recuperadas — nunca importando o tipo `MemoryEntry` (Component 16), e nunca sendo importado por nenhum arquivo de Memory.

Nenhuma dependência estrutural entre Memory e Orchestrator é criada — a única referência é o identificador opaco `memoryId`, já existente e já reutilizado por `MemoryReference` e `MemoryValidation` dentro do próprio Component 16.

---

## 4. Artefato Criado

### `MemoryRetrievalResult` (novo — Component 17, Orchestrator)

```ts
export interface MemoryRetrievalResult {
  readonly requestId: string;
  readonly memoryIds: readonly string[];
  readonly retrievedAt: Date;
}
```

| Campo | Papel |
|---|---|
| `requestId` | Solicitação em processamento — mesmo identificador já usado por `DecisionPipelineState`, `CapabilitySelection`, `AgentSelection`, `ContextAssemblyResult` |
| `memoryIds` | Entradas de memória recuperadas — identificadores opacos, sem redefinir `MemoryEntry` (Component 16); plural, por analogia estrutural a `CapabilitySelection.capabilityIds` |
| `retrievedAt` | Momento em que a etapa Memory Retrieval foi concluída para esta solicitação |

---

## 5. Estrutura Concreta

| Elemento | Decisão |
|---|---|
| Arquivo | `platform/packages/ai/src/MemoryRetrievalResult.ts` |
| Pacote | `@abp/ai` — mesmo pacote de todos os onze componentes, nenhum pacote novo criado |
| Import | Nenhum — nem de `MemoryEntry.ts`, nem de `DecisionPipelineState.ts`, nem de nenhum outro componente |
| Export | Um único tipo, `MemoryRetrievalResult`, seguindo o mesmo padrão já usado por `CapabilitySelection.ts`, `AgentSelection.ts` e `ContextAssemblyResult.ts` (INT-01) |

---

## 6. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| `MemoryEntry.ts`, ou qualquer outro artefato de Memory, modificado? | Não |
| `DecisionPipelineState.ts` modificado? | Não |
| Import de tipo entre Memory (16) e Orchestrator (17)? | Não — vínculo exclusivamente por `memoryIds: readonly string[]` opacos |
| Import de `@abp/infrastructure`, `@abp/platform-services`, `@abp/core`, ou `@abp/shared`? | Não |
| Dependência estrutural nova entre Memory e Orchestrator? | Não — apenas identificador opaco, mesmo padrão de INT-01 |
| Novo componente introduzido além dos onze já aprovados? | Não |
| Mecanismo de execução, IA concreta, ou persistência real implementado? | Não — artefato puramente declarativo, sem função ou lógica de runtime |
| Isolamento entre Memory e os demais componentes preservado? | Sim — Memory permanece sem nenhuma referência de código a Orchestrator; a referência existe apenas no sentido Orchestrator → Memory, por identificador |
| Outro item do backlog (INT-01 reaberto, INT-03 a INT-10) iniciado? | Não |

---

## 7. Critérios de Aceitação (herdados de INT-02)

✓ Comunicação exclusivamente por identificadores opacos e contratos declarativos.
✓ Nenhuma dependência estrutural criada entre Memory e Orchestrator.
✓ Nenhum artefato já aprovado de Memory modificado — `MemoryEntry.ts` e todos os demais permanecem intactos.
✓ Modelagem do resultado da recuperação de memória concluída (`MemoryRetrievalResult`).

---

## Approval

| Campo | Valor |
|---|---|
| Status | INT-02 IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
