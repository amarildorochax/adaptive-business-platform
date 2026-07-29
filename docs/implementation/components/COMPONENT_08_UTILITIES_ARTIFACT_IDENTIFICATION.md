# Component 08 — Utilities — Artifact Identification

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento identifica, a partir de necessidade já observável nos sete componentes anteriores da Sprint 1, quais funções auxiliares genéricas compõem o conjunto inicial de Utilities. Nenhuma função é proposta sem rastreabilidade direta a um artefato já implementado.*

---

## Metodologia

Cada um dos seis contratos já implementados (`Command`, `Event`, `Query`, `PlatformError`, `Owned`/`EventPublisher`/`EventSubscriber`, `ConfigurationLoader`, `Logger`/`LoggingConfigurationSource`) foi examinado em busca de necessidade recorrente ainda não coberta por nenhum deles individualmente.

---

## Necessidade Identificada

**Presença de valor opcional.** Três dos artefatos já implementados possuem propriedades explicitamente opcionais:

| Artefato | Propriedade opcional | Fonte |
|---|---|---|
| `Command<TPayload>` | `submissionId?` | `platform/packages/core/src/Command.ts` |
| `Query<TFilters>` | `sorting?` | `platform/packages/core/src/Query.ts` |
| `Query<TFilters>` | `pagination?` | `platform/packages/core/src/Query.ts` |

Nenhum dos seis contratos já implementados provê uma forma genérica de verificar se um desses valores opcionais está de fato presente. Esta é uma necessidade recorrente, observável diretamente no código já aprovado, e não duplicada por nenhum artefato existente.

---

## Artefato Identificado

**`isDefined`** — função auxiliar genérica que verifica se um valor não é `null` nem `undefined`.

**Justificativa de não duplicação**: nenhum dos seis contratos anteriores provê essa verificação — `Command`, `Event`, `Query`, `PlatformError`, `Owned`, `EventPublisher`/`EventSubscriber`, `ConfigurationLoader`, `Logger`/`LoggingConfigurationSource` são todos estruturas de dado ou contratos de ação, nenhum deles uma função utilitária de verificação de presença.

---

## Necessidades Não Identificadas

Nenhuma outra necessidade recorrente e rastreável foi encontrada nos sete componentes já implementados. Consistente com `COMPONENT_08_UTILITIES_DESIGN.md`, nenhuma função é proposta especulativamente. O conjunto inicial permanece deliberadamente pequeno — uma única função —, podendo ser estendido em rodada futura caso nova necessidade rastreável seja identificada durante a implementação dos demais Sprints.

---

## Conclusão

Um artefato identificado (`isDefined`), fundamentado em necessidade já observável em `Command.ts` e `Query.ts`, sem duplicar nenhuma capacidade já existente.

---

## Traceability

| Artefato | Fonte |
|---|---|
| `isDefined` | `platform/packages/core/src/Command.ts` (`submissionId?`); `platform/packages/core/src/Query.ts` (`sorting?`, `pagination?`) |

---

## Approval

| Campo | Valor |
|---|---|
| Status | ARTIFACT IDENTIFICATION COMPLETED |
| Version | 1.0 |
| Author | Claude |
