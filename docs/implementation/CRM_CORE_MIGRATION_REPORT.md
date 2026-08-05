# CRM Core Migration Report

**Adaptive Business Platform · Documento de Implementação**

Status: Approved · Sprint: IMP-002 — CRM Hub Migration (Fase 1 — CRM Core)

---

## Nota de Posicionamento Documental

Dois itens da leitura obrigatória e do contexto desta Sprint não correspondem ao estado real do repositório, e são registrados aqui antes de qualquer decisão técnica, seguindo o mesmo padrão de transparência já usado em `AI_CODEBASE_RECONCILIATION.md` (ST-005) para o caso análogo de `platform/packages/ai-hub/`.

**`CRM_ENTERPRISE_CAPABILITIES.md` não existe** em nenhum lugar do repositório. Como esta Sprint explicitamente exclui recursos Enterprise de seu escopo ("Não implementar recursos Enterprise nesta Sprint"), essa ausência não bloqueou o trabalho — `CRM_HUB_ARCHITECTURE.md` e `CRM_VOCABULARY_RECONCILIATION.md` já eram, sozinhos, suficientes como fonte autoritativa de vocabulário e arquitetura para o núcleo migrado.

**`platform/packages/crm/` não existe** — o pacote real é `platform/packages/crm-hub/`, já confirmado e usado como tal desde a ST-004 e a IMP-001. Todo este relatório usa `crm-hub`, consistente com o restante do workspace.

Um terceiro ponto, descoberto durante a implementação, não estava previsto no contexto: o exemplo de Commands e Events fornecido pela própria Sprint ("UpdateLead", "TimelineEventAdded") não corresponde ao vocabulário já aprovado. `CRMCommand.ts` (11 Commands já Frozen) não inclui `UpdateLead`, e `CRMEvent.ts` (18 Events já Frozen) usa `TimelineUpdated`, não `TimelineEventAdded`. Per a própria regra desta Sprint — "preservar nomenclatura oficial" — este relatório e o código produzido usam exclusivamente os nomes já aprovados, tratando o texto de exemplo da Sprint como ilustrativo, não normativo.

---

## Resumo Executivo

Esta Sprint portou o núcleo do domínio CRM — Lead, Customer, Contact, Organization, Relationship, Opportunity, Timeline Event — para `platform/packages/crm-hub`, transformando um pacote que continha exclusivamente contratos de tipo (per `AI_CODEBASE_RECONCILIATION.md` e `SOURCE_TREE_STRATEGY.md`, zero classe, zero lógica de execução) na primeira implementação de domínio real de toda a plataforma. Todo o trabalho seguiu Extrair → Adaptar → Portar: nenhuma Entidade foi reescrita do zero sem antes verificar se uma das duas árvores legadas (`src/core/crm`, `src/app/features/crm`) já resolvia o mesmo problema. `pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro, com 20 testes novos cobrindo Entidade, regra de negócio e orquestração — nenhum teste de infraestrutura, API ou banco.

---

## Inventário e Classificação

| Conceito legado | Origem | Classificação | Justificativa |
|---|---|---|---|
| `Organization` (contrato mínimo) | `platform/packages/crm-hub/Organization.ts` | Reutilizar integralmente | Já Frozen em espírito (`CRM_DOMAIN_BLUEPRINT.md`), campo `relationshipId` preservado sem alteração |
| `Company` (campos de negócio) | `src/app/features/crm/types/Company.ts` | Adaptar | `name`, `tradeName`, CNPJ, segmento, contato — portados como extensão aditiva de `Organization`, nunca como redefinição |
| `Customer` (`src/core/crm`) | `src/core/crm/Customer.ts` | Adaptar | Campos `name`/`email`/`phone` portados; `status` (incluindo o valor `"lead"`) **não** portado — per `CRM_VOCABULARY_RECONCILIATION.md`, Capítulo 6, Lead e Customer são Entidades distintas, nunca diferenciadas por campo de status |
| `Client` (`src/app/features/crm`, dual-purpose) | `src/app/features/crm/types/Client.ts` | Adaptar parcialmente | Papel "lead" portado para `Lead.ts`; papel "customer" portado para `Customer.ts`; a fusão dual-purpose em si **não** foi portada — rejeitada explicitamente por `CRM_VOCABULARY_RECONCILIATION.md`, Capítulo 12 |
| `Opportunity` (`src/core/crm`, forma simplificada) | `src/core/crm/Opportunity.ts` | Substituir | Forma do Blueprint (`relationshipId`, `pipelineId`, `stageId`, `outcome` tripartite, `lostReason`, `closedAt`) já mais completa; apenas `title`/`value` de `Deal.ts` foram efetivamente incorporados |
| `Deal` (`src/app/features/crm`) | `src/app/features/crm/types/Deal.ts` | Adaptar | `title`/`value` portados para `Opportunity.ts`; `clientId`/`companyId` diretos não portados — a associação correta passa por `relationshipId`, per Blueprint |
| `HistoryEntry` | `src/app/features/crm/types/HistoryEntry.ts` | Substituir | `TimelineEvent.ts` já existente é estruturalmente equivalente e, diferente de `HistoryEntry`, já declara imutabilidade (ADR-006) — nada foi portado além da constatação de equivalência |
| `Interaction` (`src/core/crm`) | `src/core/crm/Interaction.ts` | Aposentar (fora de escopo) | Mapeia a Activity, não a Timeline Event; Activity não está no escopo desta Sprint |
| `CRMManager` (`src/core/crm`) | `src/core/crm/CRMManager.ts` | Adaptar | Padrão de orquestração (delegar a Services, emitir Evento, nunca conter regra de Entidade) integralmente preservado; nomenclatura convergida para o vocabulário oficial |
| `CustomerService`/`CustomerStore` (`src/core/crm`) | `src/core/crm/{CustomerService.ts, CustomerStore.ts}` | Adaptar | Padrão Service (regra) + Repository (armazenamento) preservado; `CustomerStore`, sendo uma implementação concreta em memória, não foi portada como está — vira apenas o contrato `CustomerRepository`, per Etapa 5 |
| `Relationship` | — (nenhuma árvore legada modela este conceito) | Construir do zero | Nenhuma implementação prévia existe em `src/core` nem em `src/app` — Aggregate genuinamente novo sobre um contrato já Frozen |

---

## Componentes Migrados

**Entidades** (`platform/packages/crm-hub/src/`): `Organization.ts`, `Customer.ts`, `Lead.ts`, `Contact.ts` estendidos com campo de negócio portado; `Relationship.ts`, `Opportunity.ts` (com `title`/`value` acrescentados), `TimelineEvent.ts` mantidos/estendidos.

**Repositórios** (contratos apenas, per Etapa 5): `LeadRepository.ts`, `CustomerRepository.ts`, `ContactRepository.ts`, `OrganizationRepository.ts`, `RelationshipRepository.ts`, `OpportunityRepository.ts`, `TimelineEventRepository.ts` — este último deliberadamente sem `update`/`remove`.

**Serviços de domínio**: `LeadService.ts`, `CustomerService.ts`, `ContactService.ts`, `OrganizationService.ts`, `RelationshipService.ts`, `OpportunityService.ts`, `TimelineEventService.ts`.

**Orquestrador**: `CRMManager.ts` — implementa, pela primeira vez, o componente "CRM Manager" já catalogado em `CRMHubComponent.ts`. Expõe `createLead`, `convertLead`, `createCustomer`, `updateCustomer`, `createOrganization`, `createContact`, `createOpportunity`, `moveOpportunity` — cada um retornando a Entidade produzida, o `CRMCommand` correspondente (quando existe um já aprovado) e todo `CRMEvent` consequente.

---

## Componentes Reutilizados

O padrão Service/Repository de `src/core/crm` (Store em memória isolado de regra de negócio, Service stateless em relação a evento/métrica) foi reutilizado como estrutura, não como código — nenhuma linha de `CustomerStore.ts` foi copiada, mas sua disciplina de responsabilidade única foi preservada integralmente em cada novo Service. O contrato genérico `Event`/`Command` de `@abp/core` foi reutilizado como referência de forma, sem que `CRMManager` dependa diretamente dele — `CRMEvent`/`CRMCommand` (já Frozen, específicos do domínio) permanecem a interface pública deste pacote.

---

## Componentes Adaptados

Ver a coluna "Classificação" do Inventário. Em resumo: toda a riqueza de campo de negócio já provada em `src/app/features/crm` (a árvore mais madura para UI real, per `SOURCE_TREE_STRATEGY.md`) foi trazida para dentro do vocabulário já Frozen do Blueprint — nunca o inverso.

---

## Componentes Ainda Pendentes

Pipeline, Stage (como Entidade própria — hoje apenas referenciada por `pipelineId`/`stageId` em `Opportunity`), Activity, Task, Note, Tag, Address, Segment, Partner, Supplier, Consent, Custom Field — todos explicitamente fora do escopo desta Sprint. `AssignOwner`, `ArchiveCustomer`, `MergeCustomer`, `CreateTask`, `CompleteTask` — Commands já aprovados, mas não implementados nesta Sprint por não serem estritamente "núcleo" per a leitura desta equipe do escopo solicitado. Nenhuma implementação de `CustomerRepository`/`LeadRepository`/etc. real (banco, API) existe — apenas o contrato, per Etapa 5; os fakes em memória usados por teste (`src/testing/InMemoryFakes.ts`) nunca são exportados pelo barrel do pacote e nunca deveriam ser usados fora de teste.

---

## Diferenças Encontradas

**Nenhum Command aprovado cobre a criação de Organization ou de Contact.** Os 11 Commands já Frozen (`CRMCommand.ts`) incluem `CreateCustomer`, `CreateOpportunity`, etc., mas nenhum `CreateOrganization` nem `CreateContact`. `CRMManager.createOrganization()` e `CRMManager.createContact()` retornam `command: undefined` — deliberadamente, para não mistagar a operação com um Command existente que não a descreve corretamente, e para não inventar um Command novo sem passar pelo processo de governança de `IMPLEMENTATION_GOVERNANCE.md`.

**Nenhum Event aprovado cobre a criação de Organization ou de Contact.** Pelo mesmo motivo, `createOrganization` emite apenas `RelationshipChanged`/`TimelineUpdated`, e `createContact` emite apenas `TimelineUpdated` — `ContactCreated`, já citado como extensão pendente em `CRM_HUB_ARCHITECTURE.md`, Capítulo 28, permanece não incorporado.

**`Customer.status` (legado) não foi portado.** O `status` de `src/core/crm/Customer.ts`, que inclui `"lead"` como valor possível, foi deliberadamente descartado — per a decisão já tomada em `CRM_VOCABULARY_RECONCILIATION.md`, Lead e Customer são Entidades distintas, e portar esse campo teria reintroduzido exatamente a conflação que aquela Sprint rejeitou.

---

## Riscos

Nenhum Event Bus real existe ainda nesta plataforma — os `CRMEvent` retornados por `CRMManager` são coletados, nunca publicados. Se uma Sprint futura de Infrastructure não conectar esse retorno a um `EventPublisher` real (`@abp/core`), os Eventos permanecem inertes indefinidamente. A ausência de Command/Event aprovado para Organization e Contact é um risco de usabilidade prática, não de arquitetura — qualquer consumidor que espere rastrear a criação de uma Organization por Evento não encontrará um hoje.

---

## Recomendações para a Próxima Sprint

Priorizar, como item de governança, a decisão sobre `CreateOrganization`/`CreateContact` e seus respectivos Events — hoje um Command criando uma Entidade sem produzir nenhum Command correspondente é uma lacuna real, não apenas estética. Migrar Pipeline e Stage como Entidades próprias antes de expandir Opportunity além do núcleo já portado, já que `pipelineId`/`stageId` hoje são identificadores opacos sem validação. Conectar os `CRMEvent` retornados por `CRMManager` a um `EventPublisher` real assim que a Fase de Infrastructure o disponibilizar.

---

## Conclusão

O CRM deixou de ser, nesta Sprint, um conjunto de contratos que a plataforma sabia que precisaria um dia implementar — passou a ser o primeiro domínio de negócio com lógica real, testada, rodando sobre a fundação que a IMP-001 preparou. Nenhuma das duas árvores legadas foi descartada: `src/core/crm` emprestou a disciplina de separação entre Service e Repository, `src/app/features/crm` emprestou os campos de negócio que fazem uma Organization ou uma Opportunity úteis na prática, e o Blueprint já Frozen emprestou a única coisa que nenhuma das duas árvores tinha — o Aggregate Relationship que agora estrutura todos os três. O resultado não é a soma das três fontes; é a convergência que `CRM_VOCABULARY_RECONCILIATION.md` já havia decidido que deveria acontecer, agora efetivamente construída.
