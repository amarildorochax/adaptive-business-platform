# Component 09 — Observability — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos cinco artefatos de Observability. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm).*

---

## Localização de Pacote

`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 2, reserva **Infrastructure** como um dos oito agrupamentos de topo, distinto de Core e de Shared. Consistente com a convenção já estabelecida por `@abp/core` (Seção 3 do Manifesto: Core) e `@abp/shared` (Seção 3: Shared), este componente materializa um novo pacote real **`@abp/infrastructure`**, em `platform/packages/infrastructure/`, correspondente ao agrupamento já reservado.

---

## CorrelationId

### Estrutura
| Elemento | Descrição | Fonte |
|---|---|---|
| `CorrelationId` | Alias nomeado para o identificador de correlação | `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 9 |

### Regras Obrigatórias
Nenhum formato concreto definido — apenas o tipo nomeado.

---

## Metric

### Estrutura
| Propriedade | Descrição | Fonte |
|---|---|---|
| `name` | Nome nomeado da métrica | `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 9 |
| `value` | Valor numérico observado | `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 9 |
| `correlationId` | `CorrelationId` — obrigatório | "No Signal Without Correlation" |
| `timestamp` | Momento da observação | Mesmo padrão já usado em `Event.occurredAt` e `LogEntry.timestamp` |

### Invariantes
Nunca existe sem `correlationId`.

---

## Span (Tracing)

### Estrutura
| Propriedade | Descrição | Fonte |
|---|---|---|
| `correlationId` | `CorrelationId` — obrigatório | "No Signal Without Correlation" |
| `module` | Módulo em que o segmento ocorreu | `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 9 ("identificar exatamente em qual módulo") |
| `startedAt` | Início do segmento | Capítulo 9 |
| `finishedAt` | Fim do segmento (opcional — pode estar em curso) | Capítulo 9 |

### Invariantes
Nunca existe sem `correlationId`. `finishedAt`, quando presente, é sempre posterior a `startedAt`.

---

## Service Level (SLI/SLO)

### Estrutura
| Elemento | Propriedade | Descrição | Fonte |
|---|---|---|---|
| `ServiceLevelIndicator` | `name`, `metricName` | Nome do indicador e da Metric que o quantifica | Capítulo 9 |
| `ServiceLevelObjective` | `indicator`, `target` | Referência ao SLI e o alvo numérico | Capítulo 9 |

### Regras Obrigatórias
`ServiceLevelObjective.indicator` referencia um `ServiceLevelIndicator.name` já declarado.

---

## Alert Rule

### Estrutura
| Propriedade | Descrição | Fonte |
|---|---|---|
| `metricName` | Nome da Metric monitorada | Capítulo 9 |
| `threshold` | Limite numérico que dispara o Alerta | Capítulo 9 |

### Invariantes
Apenas declarativo — nenhuma lógica de avaliação.

---

## Convenções

**Nomenclatura**: `CorrelationId`, `Metric`, `Span`, `ServiceLevelIndicator`, `ServiceLevelObjective`, `AlertRule` — mesmo estilo técnico já usado na Foundation.

**Localização**: `platform/packages/infrastructure/src/CorrelationId.ts`, `Metric.ts`, `Span.ts`, `ServiceLevel.ts`, `AlertRule.ts`.

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos artefatos da Foundation.

**Compatibilidade**: nenhum vocabulário novo além do já citado em `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 9; `Span` e `Metric` reutilizam `CorrelationId` já definido neste mesmo componente.

---

## Validação

✓ Compatível com `OBSERVABILITY_SPECIFICATION.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de `Logger`/`Query` já existentes.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_09_OBSERVABILITY_ARTIFACT_IDENTIFICATION.md`; `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 9 |
| Localização de Pacote | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seções 2 e 3 |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
