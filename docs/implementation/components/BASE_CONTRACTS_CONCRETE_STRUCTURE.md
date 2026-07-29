# Component 05 — Base Contracts — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos dois contratos abstratos de Base Contracts, resolvendo as Open Decisions restantes de `BASE_CONTRACTS_SPECIFICATION.md`. Nenhuma tecnologia nova é escolhida — mesma convenção já em vigor para Shared Types e Errors (TypeScript, pnpm, `platform/packages/core/`).*

---

## Ownership Contract

### Estrutura

| Propriedade | Descrição conceitual | Fonte |
|---|---|---|
| Módulo Proprietário | Identificador nomeado do único módulo autorizado a criar, alterar, e publicar Evento sobre o conceito | `DOMAIN_OWNERSHIP_MATRIX.md`, Seção 3 ("Single Owner") e Seção 9 |

### Propriedades

Obrigatória, única, sem exceção — nenhum conceito pode declarar mais de um módulo proprietário nem omitir o proprietário.

### Responsabilidades

Declarar, para qualquer conceito que a implemente, exatamente um módulo proprietário.

### Regras Obrigatórias

- Um único proprietário por conceito (`DOMAIN_OWNERSHIP_MATRIX.md`, "Single Owner").
- Nenhuma modalidade de propriedade compartilhada (`DOMAIN_OWNERSHIP_MATRIX.md`, "No Shared Ownership").

### Invariantes

- O módulo proprietário nunca é alterado silenciosamente — qualquer mudança de fronteira de ownership exige revisão formal (`DOMAIN_OWNERSHIP_MATRIX.md`, Seção 9).

---

## Event Mediation Contract

### Estrutura

| Propriedade/Ação | Descrição conceitual | Fonte |
|---|---|---|
| Publicar | Ação que envia um `Event<TPayload>` já existente através do mediador, sem aguardar confirmação síncrona de nenhum assinante | `EVENT_INTERACTION_MATRIX.md`, Introdução; `SHARED_TYPES_CONCRETE_STRUCTURE.md` |
| Assinar | Ação que registra um manipulador para consumir Eventos de um nome específico, sem chamada direta ao publicador | `EVENT_INTERACTION_MATRIX.md`, Seção 9 |

### Propriedades

Ambas as ações são obrigatórias no contrato — qualquer módulo que participe da mediação deve poder publicar e/ou assinar conforme seu papel (produtor e/ou consumidor).

### Responsabilidades

Mediar comunicação entre módulos exclusivamente através de Evento, nunca por chamada direta.

### Regras Obrigatórias

- Nenhuma chamada direta é aceita como substituto da mediação por Evento (`EVENT_INTERACTION_MATRIX.md`, Seção 9).
- Um Evento pertence exclusivamente ao módulo que o publica (`EVENT_INTERACTION_MATRIX.md`, "Event Ownership").
- Publicação nunca aguarda confirmação de processamento do assinante (`EVENT_INTERACTION_MATRIX.md`, Introdução).

### Invariantes

- A mediação nunca opera sobre um formato de Evento diferente de `Event<TPayload>`.
- A mediação nunca decide política de retry, ordenação, ou Dead Letter — apenas medeia; esses mecanismos permanecem de responsabilidade de `EVENT_INTERACTION_MATRIX.md`.

---

## Convenções

**Nomenclatura**: `Owned` para o contrato de Ownership; `EventPublisher` e `EventSubscriber` para o contrato de mediação — nomes descritivos da ação, mesmo padrão de nomenclatura técnica já usado em `Command`, `Event`, `Query`, `PlatformError`.

**Localização**: `platform/packages/core/src/Ownership.ts` e `platform/packages/core/src/EventMediation.ts` — mesmo pacote `@abp/core` onde já residem `Command.ts`, `Event.ts`, `Query.ts`, consistente com `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 (Base Contracts reside em Core).

**Versionamento**: qualquer mudança nos dois contratos segue o mesmo princípio de Backward Compatibility já aplicado a Command/Event/Query.

**Identificação**: o Módulo Proprietário e o nome do Evento assinado são identificadores nomeados, consistentes com a convenção já estabelecida em `SHARED_TYPES_CONCRETE_STRUCTURE.md`.

**Ownership**: os próprios contratos não possuem proprietário de negócio — pertencem ao agrupamento Core, fundação da plataforma.

**Rastreabilidade**: toda publicação/assinatura permanece rastreável ao nome do Evento e ao módulo proprietário declarado.

**Compatibilidade**: ambos os contratos referenciam exclusivamente `Event<TPayload>` (Shared Types) e, quando aplicável, `PlatformError` (Errors) — nenhum vocabulário novo introduzido.

---

## Validação

✓ Compatível com `BASE_CONTRACTS_SPECIFICATION.md`, `DOMAIN_OWNERSHIP_MATRIX.md`, `EVENT_INTERACTION_MATRIX.md`.
✓ Referencia exclusivamente Shared Types e Errors já existentes.
✓ Nenhum transporte técnico, nenhuma tecnologia nova.
✓ Nenhuma expansão de escopo.

---

## Traceability

| Seção | Fonte |
|---|---|
| Ownership Contract | `DOMAIN_OWNERSHIP_MATRIX.md`, Seções 3 e 9 |
| Event Mediation Contract | `EVENT_INTERACTION_MATRIX.md`, Introdução, Seções 3 e 9 |
| Convenções | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3; `SHARED_TYPES_CONCRETE_STRUCTURE.md` (precedente) |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
