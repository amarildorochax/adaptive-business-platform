# Component 04 — Errors — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta da taxonomia de Errors, resolvendo as Open Decisions "Estrutura concreta", "Nome de arquivo" e "Localização" já registradas em `ERRORS_TAXONOMY_SPECIFICATION.md`. Nenhuma categoria além das cinco já identificadas é criada. Nenhuma tecnologia nova é escolhida — a mesma convenção já em vigor para Shared Types (TypeScript, pnpm, `platform/packages/<nome>`) é seguida por continuidade, não por nova decisão.*

---

## Categoria (Enumeração Fechada)

A taxonomia é representada por uma enumeração fechada com exatamente as cinco categorias já identificadas em `COMPONENT_04_ERRORS_ARTIFACT_IDENTIFICATION.md` — nenhuma categoria além destas cinco:

| Categoria | Fonte |
|---|---|
| Contrato Violado | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 4 |
| Permission Ausente | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 4 |
| Dependência Indisponível | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 4 |
| Evento Malformado | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 4 |
| Falha de Carregamento de Configuração | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 6 |

---

## Estrutura

| Propriedade | Descrição conceitual | Fonte |
|---|---|---|
| Categoria | Uma das cinco categorias fechadas acima, identificando a natureza técnica do erro | `COMPONENT_04_ERRORS_ARTIFACT_IDENTIFICATION.md` |
| Mensagem | Descrição diagnóstica do erro, sem lógica de negócio | Padrão recorrente de "motivo" já exigido em toda entrada de `COMMAND_CATALOG.md` para rejeição/cancelamento (ex.: "motivo de cancelamento presente", "motivo de encerramento obrigatório") |

Nenhuma outra propriedade é definida — nenhum campo de causa aninhada, nenhuma estrutura de payload adicional, consistente com "Não criar abstrações adicionais".

### Propriedades

Ambas obrigatórias em todo Erro, sem exceção.

### Responsabilidades

Categorizar tecnicamente uma falha já ocorrida em qualquer módulo da plataforma, sem conter lógica de negócio (`SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 4).

### Regras Obrigatórias

- A Categoria é restrita exclusivamente às cinco já identificadas — nenhuma nova categoria pode ser introduzida sem repetir o processo de Identification já aplicado aqui.
- Nenhuma categoria contém vocabulário de domínio específico.
- Reside no agrupamento Shared (`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3), consumível por qualquer agrupamento.

### Invariantes

- Um Erro nunca corrige ou previne automaticamente a falha que representa — apenas a categoriza.
- Um Erro nunca substitui o mecanismo já responsável pela falha (Identity Hub para Permission, Circuit Breaker/Retry para indisponibilidade, validação de esquema para malformação, Configuration para falha de carregamento).

---

## Convenções

**Nomenclatura**: Categoria nomeada em forma substantiva (ex.: `ContractViolated`, `PermissionMissing`), seguindo o mesmo estilo de nomeação técnica já observado nas categorias exemplificadas pelo Backlog.

**Localização**: `platform/packages/shared/src/Error.ts`, no pacote `@abp/shared` — correspondente ao agrupamento **Shared** do Manifesto (Seção 3), distinto de `platform/packages/core/`, onde residem Generic Command/Event/Query (agrupamento Core). Mesma convenção de pacote real já estabelecida por `@abp/config` e por `@abp/core`.

**Versionamento**: qualquer adição de nova categoria é uma mudança aditiva; qualquer remoção ou redefinição de categoria já existente exige nova versão, mesmo princípio de Backward Compatibility já aplicado a Command/Event/Query.

**Rastreabilidade**: toda categoria permanece rastreável à sua fonte de identificação original, conforme `COMPONENT_04_ERRORS_ARTIFACT_IDENTIFICATION.md`.

**Compatibilidade**: consumível por qualquer agrupamento autorizado a depender de Shared — ou seja, todos os demais sete agrupamentos (`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 4).

---

## Validação

✓ Compatível com `ERRORS_TAXONOMY_SPECIFICATION.md` — as cinco categorias e as duas propriedades correspondem exatamente às já documentadas.
✓ Compatível com `platform/PACKAGE_STRUCTURE_MANIFEST.md` — reside em Shared, sem vocabulário de domínio.
✓ Compatível com `DOMAIN_OWNERSHIP_MATRIX.md` e `EVENT_INTERACTION_MATRIX.md` — nenhuma categoria contradiz os cenários de falha já esperados.
✓ Nenhuma categoria além das cinco já identificadas.
✓ Nenhuma tecnologia nova — mesma convenção já em uso para Shared Types.
✓ Nenhuma expansão de escopo.

---

## Traceability

| Seção | Fonte |
|---|---|
| Categoria | `COMPONENT_04_ERRORS_ARTIFACT_IDENTIFICATION.md` |
| Estrutura | `ERRORS_TAXONOMY_SPECIFICATION.md`; `COMMAND_CATALOG.md` (padrão de "motivo") |
| Convenções | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seções 3 e 4; `SHARED_TYPES_CONCRETE_STRUCTURE.md` (precedente de convenção) |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
