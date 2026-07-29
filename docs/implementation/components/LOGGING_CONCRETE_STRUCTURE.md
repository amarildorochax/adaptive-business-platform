# Component 07 — Logging — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos dois artefatos de Logging. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm, `platform/packages/shared/`).*

---

## Logger

### Estrutura

| Propriedade/Ação | Descrição conceitual | Fonte |
|---|---|---|
| Mensagem | Conteúdo estruturado do registro técnico | `NON_FUNCTIONAL_REQUIREMENTS.md`, linha 329 |
| Correlation ID | Identificador único que acompanha a requisição de ponta a ponta — obrigatório | `NON_FUNCTIONAL_REQUIREMENTS.md`, NFR-034; `AI_OBSERVABILITY.md` |
| Momento de Ocorrência | Instante em que o evento técnico ocorreu | `docs/ai/AI_OBSERVABILITY.md` (campo "timestamp" já observado em diagrama de registro de Observabilidade) |
| Registrar | Ação que recebe um registro (`LogEntry`) e o processa | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 7 |

### Propriedades

As três propriedades de `LogEntry` (mensagem, Correlation ID, momento) são obrigatórias, sem exceção — nenhum registro é aceito sem Correlation ID.

### Responsabilidades

Registrar evento técnico estruturado e correlacionável, consumível sem conhecimento de implementação interna.

### Regras Obrigatórias

- Nenhum registro sem Correlation ID.
- Nenhum destino ou nível de verbosidade concreto definido pelo próprio contrato.

### Invariantes

- Um Log nunca substitui Metrics ou Tracing — permanece exclusivamente um registro textual estruturado.

---

## Logging Configuration Source

### Estrutura

| Propriedade | Descrição conceitual | Fonte |
|---|---|---|
| Configuração | Referência ao `ConfigurationLoader` já implementado | `platform/packages/shared/src/ConfigurationLoader.ts` |

### Propriedades

Obrigatória — toda implementação de Logging declara sua dependência do `ConfigurationLoader`.

### Responsabilidades

Declarar formalmente a consulta à Configuração, sem definir chave ou valor concreto.

### Regras Obrigatórias

- Referencia exclusivamente `ConfigurationLoader` já existente.

### Invariantes

- Nunca introduz um segundo mecanismo de configuração paralelo.

---

## Convenções

**Nomenclatura**: `LogEntry` (dado), `Logger` (capacidade), `LoggingConfigurationSource` (declaração de consulta) — mesmo estilo técnico já usado em `Command`, `Event`, `ConfigurationLoader`.

**Localização**: `platform/packages/shared/src/Logger.ts` e `LoggingConfigurationSource.ts`, no pacote `@abp/shared` já existente.

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos artefatos anteriores.

**Identificação**: Correlation ID é um identificador nomeado (`string`), mesma convenção já usada para identificadores em `Command`/`Event`.

**Rastreabilidade**: todo registro permanece rastreável ao seu Correlation ID.

**Compatibilidade**: `LoggingConfigurationSource` referencia exclusivamente `ConfigurationLoader` já implementado — nenhum vocabulário novo.

---

## Validação

✓ Compatível com `LOGGING_SPECIFICATION.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `docs/ai/AI_OBSERVABILITY.md`, `platform/packages/shared/src/ConfigurationLoader.ts`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo.

---

## Traceability

| Seção | Fonte |
|---|---|
| Logger | `NON_FUNCTIONAL_REQUIREMENTS.md`, linha 329, NFR-034; `docs/ai/AI_OBSERVABILITY.md` |
| Logging Configuration Source | `platform/packages/shared/src/ConfigurationLoader.ts` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
