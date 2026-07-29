# Component 19 — Reasoning — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos dois artefatos de Reasoning. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm), no pacote `platform/packages/ai/` já criado pelos Components 15–18.*

---

## Reasoning Cycle State

`ReasoningStage` (union de 5 literais): `"Análise"`, `"Síntese"`, `"Inferência"`, `"Validação"`, `"Explicabilidade"` — Capítulo 11.

| Propriedade | Descrição | Fonte |
|---|---|---|
| `agentId` | Agente que executa o ciclo de raciocínio | Capítulo 11 |
| `subtaskId` | Subtarefa sobre a qual o raciocínio é aplicado | Capítulo 11 |
| `stage` | Etapa atual (`ReasoningStage`) | Capítulo 11 |
| `enteredAt` | Momento em que o ciclo entrou nesta etapa | Capítulo 11 |

## Reasoning Conclusion

| Propriedade | Descrição | Fonte |
|---|---|---|
| `subtaskId` | Subtarefa para a qual a conclusão foi produzida | Capítulo 11 |
| `confidence` | Grau de confiança da Inferência — nunca certeza absoluta | Capítulo 11 |
| `validated` | Se a conclusão foi confirmada contra Regra de negócio já documentada | Capítulo 11 |
| `explanation` | Justificativa rastreável até o dado e o contexto que a sustentam | Capítulo 11 |
| `producedAt` | Momento em que a conclusão foi produzida | Capítulo 11 |

---

## Convenções

**Nomenclatura**: `ReasoningCycleState` (com `ReasoningStage`), `ReasoningConclusion`.

**Localização**: `platform/packages/ai/src/ReasoningCycleState.ts`, `ReasoningConclusion.ts` — mesmo pacote `@abp/ai` já criado para Context, Memory, Orchestrator e Agent Framework (Components 15–18).

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos demais artefatos.

**Compatibilidade**: nenhum vocabulário novo além do já citado em `AGENT_FRAMEWORK.md`, Capítulo 11; nenhuma duplicação de artefato já implementado; nenhuma importação cruzada de tipo — toda referência é feita por identificador opaco.

---

## Validação

✓ Compatível com `REASONING_SPECIFICATION.md`, `AGENT_FRAMEWORK.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de artefato já existente.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_19_REASONING_ARTIFACT_IDENTIFICATION.md`; `AGENT_FRAMEWORK.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
