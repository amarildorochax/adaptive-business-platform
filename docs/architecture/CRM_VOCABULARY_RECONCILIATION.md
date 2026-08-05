# CRM Vocabulary Reconciliation

**Adaptive Business Platform · Documento de Arquitetura (Draft)**

---

## Nota de Posicionamento Documental

Este documento decide, de forma definitiva, o Vocabulário Ubíquo do domínio CRM — a única pergunta que `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md` (BP-009) registrou como conflito, `IMPLEMENTATION_ROADMAP_MASTER.md` (BP-010) tornou pré-requisito bloqueante da Fase 4, e `TECHNICAL_MIGRATION_STRATEGY.md` (BP-011) confirmou existir em código real. Esta Sprint lê, campo a campo, as quatro implementações do conceito de Opportunity, de Organization/Company/Customer, e de Timeline Event/HistoryEntry/Interaction — não apenas seus nomes de arquivo — e decide, com evidência de Domain-Driven Design, qual vocabulário prevalece.

**A decisão central deste documento**: o vocabulário já Frozen (`CRM_DOMAIN_BLUEPRINT.md`, `CRM_HUB.md`) — Organization, Opportunity, Timeline Event, Lead, Customer, Contact, Relationship — é o Vocabulário Ubíquo oficial. Esta não é uma escolha entre alternativas equivalentes: a leitura de código desta Sprint confirma que o vocabulário do Blueprint é também o mais rigoroso em termos de Domain-Driven Design entre os quatro candidatos — é o único que modela `Opportunity` e `Organization` como referências a um `Relationship` (o Aggregate que aglutina Customer/Organization/Supplier/Partner como diferentes "partidos" de um mesmo relacionamento comercial), o único que declara `Timeline Event` explicitamente imutável por construção, e o único cujos onze Commands e dezoito Events já formam um vocabulário fechado e consistente, verificado nesta Sprint diretamente em `platform/packages/crm-hub/src/CRMCommand.ts`, `CRMQuery.ts` e `CRMEvent.ts`. As outras três variantes — `src/app/features/crm` (Company/Deal/HistoryEntry), `src/core/crm` (Customer/Interaction/Opportunity) — são implementações mais simples, corretas para o que resolveram no momento em que foram escritas, mas não competem em rigor de modelagem com o Blueprint já Frozen.

Este documento não altera nenhum código, não renomeia nenhum arquivo, e não altera `CRM_DOMAIN_BLUEPRINT.md` ou `CRM_HUB.md` — ambos permanecem Frozen, exatamente como estão. O que este documento produz é a decisão de convergência que autoriza, formalmente, a Fase 4 de `IMPLEMENTATION_ROADMAP_MASTER.md` a prosseguir.

---

## 1. Introdução

Este documento é a Reconciliação Oficial do Vocabulário do CRM da Adaptive Business Platform. A partir de sua aprovação, ele é a referência autoritativa sobre qual nome cada conceito do domínio CRM deve carregar em qualquer implementação futura — nenhum outro documento pode redefinir esses conceitos sem passar pelo processo formal já descrito em `IMPLEMENTATION_GOVERNANCE.md`.

---

## 2. Objetivos

Eliminar, de forma definitiva, a ambiguidade entre quatro vocabulários coexistentes para o mesmo conjunto de conceitos de negócio. Determinar o Vocabulário Ubíquo com base em evidência de modelagem, não em preferência ou em precedência histórica de qual código foi escrito primeiro. Produzir a tabela de migração que orienta a Fase 4 de `IMPLEMENTATION_ROADMAP_MASTER.md`.

---

## 3. Contexto Histórico

`CRM_DOMAIN_BLUEPRINT.md` e `CRM_HUB.md` alcançaram status Frozen antes de qualquer código de CRM ser escrito nesta série de Sprints. `src/core/crm/` é anterior a ambos — parte da aplicação "Andreia AI Platform", com um modelo de dado propositalmente simples (Customer/Interaction/Opportunity, com `status` compartilhando vocabulário com o módulo de Marketing por decisão de projeto explícita, per comentário em `Customer.ts`). `src/app/features/crm/` foi construído depois, nas Sprints 32/33/33A desta mesma sessão, já em paralelo aos Blueprints, mas sem consultá-los — daí a Company/Deal/HistoryEntry. `platform/packages/crm-hub/` foi criado depois de todos, já lendo diretamente `CRM_DOMAIN_BLUEPRINT.md`, o que explica por que já usa Organization/Opportunity/TimelineEvent — mas permanece inteiramente tipo, sem lógica.

---

## 4. Inventário de Conceitos

**Entidades e Agregados (Blueprint, Frozen):** Lead, Customer, Organization, Contact, Supplier, Partner, Opportunity, Pipeline, Stage, Activity, Task, Timeline (composta por Timeline Event), Relationship (o Aggregate que estrutura Organization/Opportunity/Timeline Event via `relationshipId`), Note (formalizado por `CRM_HUB_ARCHITECTURE.md`).

**Value Objects (Blueprint):** Address, Tag, Custom Field, Communication Preference, Consent.

**Commands (11, verificados em `platform/packages/crm-hub/src/CRMCommand.ts`):** CreateLead, ConvertLead, CreateCustomer, UpdateCustomer, AssignOwner, CreateOpportunity, MoveOpportunity, CreateTask, CompleteTask, MergeCustomer, ArchiveCustomer.

**Queries (9, verificadas em `CRMQuery.ts`, mais Customer Journey per `CRM_HUB_ARCHITECTURE.md`):** Customer360, Timeline, OpenOpportunities, ActiveLeads, PipelineSummary, SegmentSearch, CustomerHistory, ActivityHistory, RelationshipView, Customer Journey View.

**Events (18, verificados em `CRMEvent.ts`, mais 3 propostos por `CRM_HUB_ARCHITECTURE.md`):** LeadCreated, LeadQualified, LeadConverted, CustomerCreated, CustomerUpdated, CustomerArchived, SupplierRegistered, PartnerRegistered, OpportunityCreated, OpportunityWon, OpportunityLost, TaskAssigned, TaskCompleted, ActivityLogged, ConsentUpdated, RelationshipChanged, SegmentUpdated, TimelineUpdated, mais ContactCreated, NoteAdded, CustomerMerged.

**Serviços (src/core/crm, reais):** CustomerService, InteractionService, OpportunityService, CRMManager (orquestrador), CRMMetrics, CRMExportProvider, CRMImportProvider, CRMNotificationProvider, CRMPersistenceAdapter, CRMSearchProvider.

**Serviços (src/app/features/crm, reais):** CrmMockService, CrmKpiService.

**DTOs:** CustomerInput/InteractionInput/OpportunityInput (`src/core/crm`); formulários Company/Client/Deal/Activity/Note/Tag (`src/app/features/crm/components/forms/`).

**Estados/Enums divergentes:** `OpportunityOutcome` = `Open|Won|Lost` (platform, PascalCase) vs. `OpportunityStatus` = `open|won|lost` (src/core, lowercase) vs. `isWon`/`isLost` booleanos em `CrmPipelineStage` (src/app). `CustomerStatus` = `active|inactive|lead|lost` (src/core, conflando Lead como status de Customer) vs. `ClientStatus` = `lead|prospect|customer|inactive` (src/app, mesma conflação com vocabulário próprio).

---

## 5. Matriz Comparativa

| Conceito | Blueprint (Frozen) | src/app/features/crm | src/core/crm | platform/packages/crm-hub | Observações |
|---|---|---|---|---|---|
| Entidade coletiva (empresa) | `Organization` (`organizationId`, `tenantId`, `relationshipId`, `createdAt`) | `Company` (`id`, `name`, `tradeName`, `cnpj`, `segment`, `size`, endereço, `status`) | — (não modelado) | `Organization.ts` idêntico ao Blueprint | `src/app` tem mais campos de negócio (CNPJ, endereço); Blueprint tem a referência estrutural a `Relationship` que nenhuma das outras duas possui |
| Possibilidade de negócio | `Opportunity` (`opportunityId`, `relationshipId`, `pipelineId`, `stageId`, `partnerId?`, `outcome: Open\|Won\|Lost`, `lostReason?`, `closedAt?`) | `Deal` (`id`, `clientId`, `companyId`, `title`, `value`, `probability`, `stageId`, `expectedCloseDate`, `source`, `notes`) | `Opportunity` (`id`, `customerId`, `title`, `value`, `status: open\|won\|lost`, `probability`) | `Opportunity.ts` idêntico ao Blueprint | Três formas distintas de modelar o mesmo resultado (`outcome` enum tripartite vs. `status` string vs. ausência de campo de motivo de perda em duas das três) |
| Unidade de linha do tempo | `Timeline Event` (`timelineEventId`, `relationshipId`, `description`, `occurredAt`, imutável por construção — ADR-006) | `HistoryEntry` (`id`, `entityType`, `entityId`, `action`, `actor`, `timestamp`) | — (não modelado como Entidade própria; mais próximo é `Interaction`) | `TimelineEvent.ts` idêntico ao Blueprint | Apenas o Blueprint declara imutabilidade explicitamente; `HistoryEntry` é estruturalmente equivalente mas não a declara |
| Contato individual | `Contact` (mencionado no Blueprint, associado a `Organization`) | `Client` (conflaciona Contact + Customer/Lead via `status`) | `Customer` (conflaciona todos os papéis de pessoa/relacionamento) | `Contact.ts` e `Customer.ts` distintos, per Blueprint | Apenas o par Blueprint/platform preserva a distinção Contact ≠ Customer ≠ Lead exigida pelos Commands `CreateCustomer` e `ConvertLead` serem operações distintas |
| Registro de interação pontual | `Activity` / `Timeline Event` | `Activity` (`type`, `clientId`, `dealId`, `date`, `description`, `status`) | `Interaction` (`type: call\|email\|meeting\|note\|other`, `customerId`, `description`) | `Activity.ts` per Blueprint | `Interaction` e `Activity` (src/app) cobrem essencialmente o mesmo papel sob nomes diferentes |
| Etapa de funil | `Stage` | `CrmPipelineStage` (`id`, `name`, `order`, `isWon`, `isLost`) | — (não modelado; `Opportunity.status` cumpre parcialmente o papel) | `Stage.ts` per Blueprint | Já reconciliado por `CRM_HUB_ARCHITECTURE.md`: `CrmPipelineStage` é nome de implementação deliberado, não um conceito concorrente |
| Anotação qualitativa | `Note` (formalizado por `CRM_HUB_ARCHITECTURE.md`) | `Note` (`id`, `entityType`, `entityId`, `author`, `content`) | — (parcialmente coberto por `Interaction` tipo `"note"`) | Não presente nos arquivos auditados | `src/app` já usa o nome correto |
| Compromisso datado | Não formalizado como Entidade distinta de `Task` | `AgendaEvent` | — | `Task.ts` | Já reconciliado por `CRM_HUB_ARCHITECTURE.md`, Capítulo 21: tratado como especialização de `Task` |

---

## 6. Conflitos Identificados

**Mesmo conceito, nomes diferentes** (o caso central desta Sprint): Organization/Company, Opportunity/Opportunity (nome igual, forma diferente — ver abaixo), Timeline Event/HistoryEntry/Interaction.

**Conceitos diferentes com o mesmo nome**: `Opportunity` aparece idêntico em nome em `src/core/crm` e no Blueprint/platform, mas com forma e semântica diferentes — a versão do Blueprint referencia `Relationship`, `Pipeline` e `Partner` explicitamente e usa um enum de resultado tripartite com motivo de perda; a versão de `src/core` é um registro plano de CRUD sem esses relacionamentos. Tratar as duas como "o mesmo Opportunity" seria um erro — a de `src/core` é um subconjunto simplificado, não uma implementação alternativa completa.

**Nomenclatura herdada e obsoleta**: `Customer` em `src/core/crm` conflaciona o papel que o Blueprint distribui entre `Lead`, `Customer` e `Contact` — seu campo `status` inclui `"lead"` como um valor possível, quando o Blueprint trata Lead como Entidade própria, convertida para Customer através do Command `ConvertLead` e do Event `LeadConverted`. Isso não é apenas nomenclatura diferente — é uma modelagem de ciclo de vida diferente, e deve ser tratada como tal na migração, não apenas como troca de nome de classe.

**Nomenclatura ambígua**: `Client` em `src/app/features/crm` cumpre, deliberadamente, o papel de `Contact` e de `Customer`/`Lead` simultaneamente, diferenciado apenas pelo campo `status`. Isso funciona operacionalmente na UI atual, mas não é o Vocabulário Ubíquo do Blueprint, onde `ConvertLead` é uma transição de Entidade, não uma transição de valor de campo.

**Sinônimos sem conflito real**: `Stage`/`CrmPipelineStage` e `Task`/`AgendaEvent` já foram reconciliados por `CRM_HUB_ARCHITECTURE.md` como nome de implementação vs. nome conceitual — não exigem nova decisão aqui, apenas reafirmação.

---

## 7. Vocabulário Oficial

| Conceito | Nome Oficial | Por quê | Documento Autoritativo |
|---|---|---|---|
| Entidade coletiva (empresa) | **Organization** | Já Frozen; único a modelar a referência estrutural a `Relationship` | `CRM_DOMAIN_BLUEPRINT.md`, Cap. 7 |
| Possibilidade de negócio | **Opportunity** (forma do Blueprint: `relationshipId`, `pipelineId`, `stageId`, `outcome`, `lostReason`, `closedAt`) | Já Frozen; forma estruturalmente mais completa e correta | `CRM_DOMAIN_BLUEPRINT.md`, Cap. 7 |
| Unidade de linha do tempo | **Timeline Event** | Já Frozen; único com imutabilidade declarada (ADR-006) | `CRM_DOMAIN_BLUEPRINT.md`, ADR-006 |
| Contato individual | **Contact** (distinto de Customer e de Lead) | Já Frozen; a distinção é exigida pela própria existência do Command `ConvertLead` | `CRM_DOMAIN_BLUEPRINT.md`, Cap. 7 |
| Potencial ainda não convertido | **Lead** (Entidade própria, nunca um valor de `status` de Customer) | Já Frozen; `ConvertLead`/`LeadConverted` só fazem sentido como transição de Entidade | `CRM_DOMAIN_BLUEPRINT.md`; `CRMCommand.ts`/`CRMEvent.ts` |
| Registro de interação pontual | **Activity** | Já Frozen; `Interaction` (src/core) e `Activity` (src/app) convergem para este nome | `CRM_DOMAIN_BLUEPRINT.md`, Cap. 7 |
| Etapa de funil (implementação) | **CrmPipelineStage** (nome de classe), **Stage** (nome conceitual) | Já reconciliado — prefixo evita colisão com Dashboard, sem criar conceito concorrente | `CRM_HUB_ARCHITECTURE.md`, Cap. 36.1 |
| Anotação qualitativa | **Note** | Já convergente em `src/app`; formalizado como Entidade própria | `CRM_HUB_ARCHITECTURE.md`, Cap. 22 |
| Compromisso datado | **AgendaEvent** (especialização de `Task`) | Já reconciliado — vocabulário de UI útil, nunca uma Entidade paralela a `Task` | `CRM_HUB_ARCHITECTURE.md`, Cap. 21 |

---

## 8. Tabela de Migração

| Nome Atual | → | Nome Oficial | Status | Prioridade | Impacto | Documento de Referência | Estratégia de Adoção |
|---|---|---|---|---|---|---|---|
| `Company` (src/app) | → | `Organization` | Pendente de Amendment* | Crítica | Alto — nome em rota (`/crm/empresas`), tipo, formulário, tabela | `CRM_HUB_ARCHITECTURE.md`, 36.1 | Migrar como parte da Fase 4; `platform/packages/crm-hub/Organization.ts` já é o contrato de destino |
| `Customer` (src/core) | → | `Organization` ou `Customer`, conforme o papel real do registro | Pendente de Amendment* | Média (código não conectado à app real) | Baixo — sem consumidor ativo, per `TECHNICAL_MIGRATION_STRATEGY.md` | Este documento, Cap. 6 | Não migrar diretamente — reavaliar registro a registro qual papel (Organization/Customer/Lead) cada instância realmente representa antes de portar |
| `Deal` (src/app) | → | `Opportunity` | Pendente de Amendment* | Crítica | Alto — mesma exposição de `Company` | `CRM_HUB_ARCHITECTURE.md`, 36.1 | Migrar campo a campo para a forma mais completa já definida em `platform/packages/crm-hub/Opportunity.ts` |
| `Opportunity` (src/core, forma simplificada) | → | `Opportunity` (forma do Blueprint) | Pendente de Amendment* | Baixa (código não conectado) | Baixo | Este documento, Cap. 6 | Absorver como fonte de dado histórico, se aplicável; não usar como contrato de destino |
| `HistoryEntry` (src/app) | → | `Timeline Event` | Pendente de Amendment* | Alta | Médio | `CRM_HUB_ARCHITECTURE.md`, 36.1 | Migrar preservando imutabilidade explícita (ADR-006), hoje ausente na forma atual |
| `Interaction` (src/core) | → | `Activity` | Pendente de Amendment* | Baixa (código não conectado) | Baixo | Este documento, Cap. 6 | Absorver como fonte de dado histórico, se aplicável |
| `Client` (src/app, dual-purpose) | → | `Contact` **e** `Lead`/`Customer` (dois conceitos, nunca um) | Pendente de Amendment* | Alta | Alto — requer decisão de produto sobre separação de tela, não apenas de tipo | Este documento, Cap. 6 | Avaliar na Fase 4 se a UI de Cliente deve se dividir em duas telas (Contact vs. Lead/Customer) ou se a fusão é mantida deliberadamente como decisão de produto, registrada como exceção per `IMPLEMENTATION_GOVERNANCE.md`, Cap. 29 |
| `CrmPipelineStage` | mantém | `CrmPipelineStage` (nome de implementação) | Resolvido | — | Nenhum | `CRM_HUB_ARCHITECTURE.md`, 36.1 | Nenhuma ação |
| `AgendaEvent` | mantém | `AgendaEvent` (especialização de `Task`) | Resolvido | — | Nenhum | `CRM_HUB_ARCHITECTURE.md`, Cap. 21 | Nenhuma ação |
| `Note` | mantém | `Note` | Resolvido | — | Nenhum | `CRM_HUB_ARCHITECTURE.md`, Cap. 22 | Nenhuma ação |

*"Pendente de Amendment" refere-se à necessidade de `CRM_DOMAIN_BLUEPRINT.md`/`CRM_HUB.md` (Frozen) ou da implementação convergirem — a direção da convergência (implementação → Blueprint) já está decidida por este documento; o Amendment formal, quando necessário, trata apenas de incorporar as poucas extensões genuínas (Cap. 12), nunca de alterar Organization/Opportunity/Timeline Event em si.

---

## 9. Impacto Arquitetural

Nenhum Hub além do CRM Hub é diretamente afetado — `DOMAIN_OWNERSHIP_MATRIX.md` já registra Organization, Opportunity e Timeline (CRM) sob esse exato nome, de modo que nenhum Hub consumidor (Finance, Growth, Analytics) precisa mudar sua própria nomenclatura, apenas confirmar que já consome esses nomes corretamente. `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` referencia `Organization` apenas como conceito citado do CRM Hub — nenhuma colisão. Nenhum Blueprint precisa ser reescrito; a única mudança arquitetural formal necessária é a incorporação, via Change Request (não Amendment), de `AgendaEvent` e `Note` à documentação Frozen — já proposta e não executada por `CRM_HUB_ARCHITECTURE.md`.

---

## 10. Impacto Técnico

**Módulos afetados**: `src/app/features/crm/types/*`, `components/*`, `forms/*`, `hooks/*`, `mocks/*` (todos referenciam Company/Deal/HistoryEntry/Client); `platform/packages/crm-hub` não é afetado — já está correto. **Documentos a atualizar futuramente**: nenhum Blueprint — apenas a eventual promoção de status de `CRM_HUB_ARCHITECTURE.md` de Draft para Official, quando a convergência estiver implementada. **APIs impactadas**: nenhuma existe hoje (toda a camada de serviço é mock); a primeira API real do domínio já nasce com o nome oficial. **Eventos impactados**: nenhum evento já Frozen muda de nome; a implementação futura passa a emitir exatamente os 18 (+3) eventos já catalogados, em vez dos eventos ad hoc hoje emitidos por `CRMManager` (`CRM_CUSTOMER_CREATED`, etc., que não correspondem a nenhum Evento do catálogo Frozen). **DTOs impactados**: `CustomerInput`/`OpportunityInput`/`InteractionInput` (src/core) e os formulários de `src/app` precisam ser recriados sobre a forma oficial ao migrar, não apenas renomeados.

---

## 11. Estratégia de Adoção

Nenhuma renomeação acontece nesta Sprint. A adoção segue a Fase 4 já sequenciada em `IMPLEMENTATION_ROADMAP_MASTER.md`: a lógica real de `src/app/features/crm` (a implementação mais madura funcionalmente) é portada para `platform/packages/crm-hub` (o contrato mais correto conceitualmente), campo a campo, convergindo para os nomes decididos no Capítulo 7. `src/core/crm` não é migrado diretamente — por não estar conectado a nenhuma rota ativa (confirmado por `TECHNICAL_MIGRATION_STRATEGY.md`), seu valor é apenas de referência histórica, avaliada caso a caso.

---

## 12. Recomendações

**A implementação deve convergir para o Blueprint — não o inverso.** A análise de campo por campo (Capítulo 5) confirma que o vocabulário Frozen é o mais completo e o mais rigoroso em modelagem, não apenas o mais antigo ou o mais autoritativo por status documental. **O Blueprint deve incorporar duas extensões genuínas da implementação** — `Note` e `AgendaEvent` — ambas já propostas por `CRM_HUB_ARCHITECTURE.md` e ambas aditivas, nunca corretivas do texto Frozen já existente. **Uma terceira alternativa foi considerada e descartada**: fundir `Client` (Contact+Lead+Customer) como um novo conceito único no Blueprint, abandonando a distinção entre os três. Esta Sprint rejeita essa alternativa porque a distinção já é estruturalmente exigida pelos Commands e Events já Frozen (`ConvertLead`/`LeadConverted` só existem porque Lead e Customer são Entidades diferentes) — fundi-los quebraria a semântica já consolidada de onze Commands e dezoito Events, um custo muito maior do que o ganho de conveniência de tela única.

---

## 13. Próximos Passos

Registrar o Amendment formal de `CRM_DOMAIN_BLUEPRINT.md`/`CRM_HUB.md` per `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 23, incorporando `Note` e `AgendaEvent` — não para renomear Organization/Opportunity/Timeline Event, que já estão corretos. Iniciar a Fase 4 de `IMPLEMENTATION_ROADMAP_MASTER.md` com esta tabela de migração (Capítulo 8) como guia campo a campo. Decidir, como item de produto e não de arquitetura, se `Client` se divide em duas telas (Contact vs. Lead/Customer) durante a migração da interface.

---

## 14. Conclusão

A pergunta que motivou esta Sprint tinha, à primeira vista, quatro respostas possíveis igualmente válidas. A leitura de código campo a campo mostra que não são igualmente válidas: apenas uma das quatro variantes modela `Opportunity` como parte de um `Relationship`, apenas uma declara `Timeline Event` imutável por desenho, e apenas uma já tem, prontos e Frozen, os onze Commands e dezoito Events que dão significado operacional a essas Entidades. O Vocabulário Ubíquo do CRM não precisava ser inventado nesta Sprint — precisava ser reconhecido como já existente, e esta é a decisão que este documento formaliza.
