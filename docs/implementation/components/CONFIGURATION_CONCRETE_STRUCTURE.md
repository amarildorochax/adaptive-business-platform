# Component 06 — Configuration — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos dois artefatos de Configuration. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm, `platform/packages/shared/`).*

---

## Configuration Loader

### Estrutura

| Propriedade/Ação | Descrição conceitual | Fonte |
|---|---|---|
| Carregar | Ação que recupera um valor de configuração técnica a partir de uma chave nomeada | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 6 |

### Propriedades

`load` é a única ação do contrato — genérica sobre o tipo de valor retornado, opaca quanto à fonte concreta.

### Responsabilidades

Carregar valor de configuração técnica por chave, sem depender de nenhum Business Hub.

### Regras Obrigatórias

- Nenhuma dependência de Business Hub.
- Nenhuma fonte concreta definida pelo próprio contrato.

### Invariantes

- O mecanismo nunca antecipa Configuração de negócio (Segmento, Maturidade, Objetivos, Canais, Preferências — `BUSINESS_PROFILE_ENGINE.md`, Capítulo 8).

---

## Configuration Load Failure

### Estrutura

| Propriedade | Descrição conceitual | Fonte |
|---|---|---|
| Categoria | Restrita exclusivamente a `"ConfigurationLoadFailure"`, já existente em `ErrorCategory` | `platform/packages/shared/src/Error.ts` |

### Propriedades

Um estreitamento (narrowing) de `PlatformError`, nunca um tipo paralelo.

### Responsabilidades

Vincular formalmente toda falha de carregamento à categoria já existente.

### Regras Obrigatórias

- Nenhuma categoria de erro nova.
- Toda falha de `load` que precisar ser comunicada usa exclusivamente este tipo.

### Invariantes

- Nunca redefine `PlatformError` — apenas o estreita.

---

## Convenções

**Nomenclatura**: `ConfigurationLoader` (mecanismo), `ConfigurationLoadFailure` (declaração de falha) — mesmo estilo de nomeação técnica já usado em `Owned`, `EventPublisher`.

**Localização**: `platform/packages/shared/src/ConfigurationLoader.ts` e `ConfigurationLoadFailure.ts`, no pacote `@abp/shared` já existente (mesmo pacote de `Error.ts`), consistente com `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3.

**Versionamento**: mudança aditiva não exige nova versão; remoção ou redefinição exige, mesmo princípio já aplicado aos artefatos anteriores.

**Identificação**: a chave de configuração é um identificador nomeado (`string`), mesma convenção de `Command`/`Query`.

**Rastreabilidade**: toda falha de carregamento permanece rastreável à categoria `ConfigurationLoadFailure` já existente.

**Compatibilidade**: referencia exclusivamente `PlatformError`/`ErrorCategory` já implementados — nenhum vocabulário novo.

---

## Validação

✓ Compatível com `CONFIGURATION_SPECIFICATION.md`, `BUSINESS_PROFILE_ENGINE.md` (nenhuma sobreposição), `platform/packages/shared/src/Error.ts`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo.

---

## Traceability

| Seção | Fonte |
|---|---|
| Configuration Loader | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 6 |
| Configuration Load Failure | `platform/packages/shared/src/Error.ts` |
| Convenções | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
