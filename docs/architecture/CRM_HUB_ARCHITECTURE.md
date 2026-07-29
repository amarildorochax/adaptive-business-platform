# CRM Hub Architecture — Blueprint Oficial do CRM Hub

**Adaptive Business Platform · Documento Técnico Oficial**

---

## Nota de Posicionamento Documental

Este documento nasce em status **Draft** (`DOCUMENTATION_CONSTITUTION.md`, §8.1) e enfrenta a reconciliação de maior friction encontrada até agora nesta série de Blueprints: o domínio do CRM já está definido, integralmente, em `CRM_DOMAIN_BLUEPRINT.md` e em `CRM_HUB.md` — e ambos já alcançaram **Frozen**, o status mais alto de estabilidade da plataforma (`DOCUMENTATION_INDEX.md`, §7.2), junto de `PLATFORM_MANIFESTO.md`, `AI_HUB.md`, `BUSINESS_HUB_ARCHITECTURE.md` e `DOMAIN_OWNERSHIP_MATRIX.md`. Alterar um documento Frozen exige Amendment, não Change Request (`DOCUMENTATION_CONSTITUTION.md`, §10) — o padrão de maior friction que existe na plataforma. Este documento **não tenta essa Amendment**. Ele não redefine Lead, Customer, Organization, Contact, Opportunity, Pipeline, Stage, Activity, Task, Timeline, Relationship, Consent, Segment, Tag ou Custom Field — todos já integralmente definidos, com dezesseis Capacidades de Negócio, trinta e três componentes internos, onze Comandos, nove Consultas, dezoito Eventos e vinte e seis ADRs somados entre os dois documentos Frozen já existentes.

O que este documento genuinamente acrescenta, sem jamais contradizer o par já Frozen:

**Primeira adição — convergência explícita com os Hubs introduzidos depois do CRM Hub ter sido congelado.** `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 11, já antecipa integração com Communication Hub, Finance Hub e Growth Hub — os três Business Hubs que existiam no momento em que foi escrito. Content Hub (`CONTENT_HUB_ARCHITECTURE.md`) e Conversation Hub (`CONVERSATION_HUB_ARCHITECTURE.md`) nasceram depois, dentro desta mesma série, e Marketing Hub, Commerce Hub e Business Hub — nomeados em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` — ainda não têm Blueprint próprio. Este documento formaliza como cada um converge para a Timeline do CRM Hub (Capítulo 17), sem introduzir nenhuma Entidade nova de relacionamento — apenas mapeando Evento já publicado por esses Hubs (existentes ou ainda a especificar) contra o consumo já previsto, em espírito, pelo CRM Hub Frozen.

**Segunda adição — reconciliação de nomenclatura entre o Blueprint Frozen e a implementação real já construída.** A Adaptive Business Platform já possui uma fundação de CRM implementada em código (`src/app/features/crm/`, Sprints 32 e 33 desta plataforma) — não documentação, mas Entidade real, em produção de desenvolvimento. Essa implementação usa `Company` onde o Blueprint Frozen usa `Organization`; usa `Deal` onde o Blueprint Frozen usa `Opportunity`; usa `HistoryEntry` onde o Blueprint Frozen usa `Timeline Event`; e já trata `Note` como Entidade de primeira classe, algo que o Blueprint Frozen apenas menciona en passant (Capítulo 4, "Customer Notes") sem jamais formalizá-la com Manager, Command e Event próprios. Este documento registra essas quatro reconciliações formalmente (Capítulo 36.1) — nenhuma delas contradiz o domínio Frozen; todas são o mesmo conceito, batizado de forma diferente em momentos diferentes da vida do projeto.

**Terceira adição — fechamento de três lacunas honestamente identificadas no par Frozen.** `Note` é citada como pertencente ao CRM (`CRM_DOMAIN_BLUEPRINT.md`, Capítulo 4) mas nunca ganhou Manager, Command ou Event dedicado nos dois documentos Frozen. `Contact` não tem Evento próprio catalogado — apenas implícito dentro de `CustomerUpdated`. `MergeCustomer`, Comando já existente, não tem o Evento correspondente formalmente catalogado. Este documento propõe o fechamento dessas três lacunas como extensão aditiva (Capítulo 28), nunca como correção do texto já Frozen.

**Quarta adição — a arquitetura de Customer Journey e de IA aplicada ao CRM, ambas pedidas explicitamente por esta Sprint e ausentes, com esse nível de detalhe, no par Frozen.** Customer Journey exige cuidado redobrado: `Journey` já é Entidade Frozen do Growth Hub (`DOMAIN_OWNERSHIP_MATRIX.md`, linha "Journey | Growth Hub"), com significado de sequência estratégica de Touchpoint planejada por uma Campaign. Este documento define Customer Journey do CRM Hub como algo estruturalmente diferente — uma visão de leitura composta sobre dado já proprietário do CRM (Capítulo 26) — precisamente para não duplicar aquela Entidade.

Nenhum código, componente, rota, banco de dados ou API foi alterado para produzir este documento. Nenhuma linha de `CRM_DOMAIN_BLUEPRINT.md` ou de `CRM_HUB.md` foi tocada.

---

## 1. Introdução

Este documento é o Blueprint de extensão do **CRM Hub** — o Hub já Frozen, através de `CRM_DOMAIN_BLUEPRINT.md` e `CRM_HUB.md`, que a Sprint que originou este documento pede para reapresentar como "o coração operacional da Adaptive Business Platform". Ele já é isso, formalmente, desde que os dois documentos citados acima alcançaram Frozen — este documento reafirma essa posição central à luz da arquitetura de 8 Hubs já introduzida em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, e formaliza a convergência com Hubs que, no momento em que o CRM Hub foi congelado, ainda não existiam nomeados.

O CRM Hub nunca duplicará responsabilidade de outro domínio — esse princípio já é ADR-001 tanto em `CRM_DOMAIN_BLUEPRINT.md` quanto em `CRM_HUB.md`, e este documento o reafirma como sua própria regra mais importante (Capítulo 38). Seu papel é centralizar identidade, relacionamento, histórico, contexto e jornada do cliente — nunca produzir, ele mesmo, o conteúdo, a conversa, a campanha ou a venda que alimenta esse relacionamento.

---

## 2. Missão

A missão do CRM Hub, já registrada em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 2, permanece: gerenciar relacionamentos entre a organização e todas as entidades externas com as quais ela mantém vínculo comercial ou institucional, preservando histórico completo, organizando progressão comercial, e servindo como fonte única de verdade sobre quem a Empresa conhece. Este documento estende essa missão apenas em escopo de convergência: a fonte única de verdade agora recebe, explicitamente, sinal de seis Hubs a mais do que existiam quando essa missão foi originalmente escrita.

---

## 3. Visão

Que o CRM Hub permaneça, através de qualquer expansão futura da Adaptive Business Platform — novo Hub, novo canal, nova capacidade de IA —, o único lugar onde a pergunta "o que sabemos sobre este relacionamento, e o que já aconteceu com ele" tem uma resposta completa, cronológica e confiável, independentemente de quantos outros domínios de negócio a plataforma acumule ao longo dos anos.

---

## 4. Objetivos Estratégicos

| # | Objetivo | Descrição |
|---|---|---|
| OE-1 | **Preservar o domínio Frozen intacto** | Nenhuma Entidade, Evento ou Regra já definida em `CRM_DOMAIN_BLUEPRINT.md`/`CRM_HUB.md` é redefinida. |
| OE-2 | **Formalizar convergência com os Hubs pós-CRM** | Content Hub, Conversation Hub, Marketing Hub, Commerce Hub, Business Hub e AI Hub, todos mapeados contra o consumo de Evento já existente. |
| OE-3 | **Reconciliar nomenclatura entre Blueprint e implementação real** | Company/Organization, Deal/Opportunity, HistoryEntry/Timeline Event, Note. |
| OE-4 | **Fechar lacunas honestamente identificadas** | Note, Contact e Merge ganham Manager/Command/Event formal, como extensão aditiva. |
| OE-5 | **Definir Customer Journey sem colidir com Journey do Growth Hub** | Uma visão de leitura sobre dado já proprietário do CRM, nunca uma nova Entidade estratégica de campanha. |
| OE-6 | **Preparar IA aplicada ao CRM em profundidade** | Doze capacidades listadas (Capítulo 27), a maioria já com contrato real preparado no código-fonte da plataforma. |
| OE-7 | **Nunca duplicar Entidade de outro Bounded Context** | Verificação explícita, entidade por entidade, contra `DOMAIN_OWNERSHIP_MATRIX.md` (Capítulo 36.1). |

---

## 5. Escopo

**Dentro do escopo:** tudo já coberto por `CRM_DOMAIN_BLUEPRINT.md`/`CRM_HUB.md` (citado, não redefinido); convergência de Timeline com Content/Conversation/Marketing/Commerce/Business/AI Hub; Customer Journey como Read View; reconciliação de nomenclatura; fechamento das três lacunas (Note, Contact, Merge); IA aplicada ao CRM em profundidade.

**Fora do escopo:** produção de conteúdo (Content Hub); canal de comunicação (Conversation Hub); estratégia de campanha, Journey de marketing, Attribution (Growth/Marketing Hub); pagamento e pedido (Commerce Hub); execução de Workflow genérico (Automation Engine); qualquer cálculo de indicador consolidado (Analytics Hub).

---

## 6. Responsabilidades

Já integralmente definidas em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 5 — captura de Lead, qualificação e conversão, registro central de Organization/Contact/Supplier/Partner, progressão de Opportunity por Pipeline, Activity e Task, Timeline imutável, Ownership, Consent, Segmentação e Tag. Este documento acrescenta uma responsabilidade explícita de convergência: **consumir, nunca produzir**, todo Evento relevante de relacionamento publicado por Content Hub, Conversation Hub, Marketing Hub, Commerce Hub, Business Hub e AI Hub, exatamente como já faz hoje com Communication Hub, Finance Hub e Growth Hub.

```
              LIMITES ENTRE CRM HUB E OS DEMAIS HUBS (visão consolidada)
   ┌───────────────────────────────────────────────────────────┐
   │  CRM Hub mantém relacionamento e consolida Timeline            │
   │       │                                                        │
   │       ├──► Content Hub origina Lead por conteúdo (LeadCaptured)     │
   │       ├──► Conversation Hub origina/registra interação (MessageReceived)│
   │       ├──► Marketing/Growth Hub decide Campanha e Segmentação estratégica │
   │       ├──► Commerce Hub processa Venda (OpportunityWon consumido)          │
   │       ├──► Business Hub informa Segmento/Identidade (calibra vocabulário)     │
   │       ├──► AI Hub sugere, nunca decide, sobre Qualificação/Priorização           │
   │       └──► Identity Hub autentica e autoriza toda operação                          │
   └───────────────────────────────────────────────────────────┘
```

---

## 7. Arquitetura Geral

```
                              Platform
                                 │
                                 ▼
                              CRM Hub
                (Frozen — CRM_DOMAIN_BLUEPRINT.md / CRM_HUB.md —
                 estendido por este documento, nunca redefinido)
                                 │
                                 ▼
                          Business Capabilities
     (16 já Frozen — CRM_DOMAIN_BLUEPRINT.md, Capítulo 6 —
      mais Note Management, adicionada por este documento — Capítulo 9)
                                 │
                                 ▼
                       Domain Model (Capítulo 22)
   (Lead, Customer/Company, Organization, Contact, Opportunity/Deal,
    Pipeline, Stage, Activity, Task, Note, Timeline Event/HistoryEntry,
    Relationship, Custom Field, Segment — já Frozen, exceto Note)
                                 │
                                 ▼
                          Domain Events (Capítulo 28)
     (18 já Frozen + NoteAdded/ContactCreated/CustomerMerged, novos)
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
          Content Hub     Conversation Hub    Commerce Hub
        (LeadCaptured)    (MessageReceived)   (fecha Opportunity)
                                 │
                                 ▼
                         Timeline Unificada
                    (Capítulo 17 — convergência total)
```

---

## 8. Conceito de CRM Hub

Já integralmente definido em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 1, e em `CRM_HUB.md`, Capítulos 1 a 3 — o CRM Hub é um Business Hub, categoria já estabelecida em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 1. Este documento acrescenta apenas a formulação exigida por esta Sprint: o CRM Hub é o **coração operacional** da plataforma, no sentido preciso de que é o único domínio para o qual toda origem de relacionamento — conteúdo, conversa, campanha, venda — converge, e a partir do qual nenhuma dessas origens é executada de volta. Ele recebe; nunca produz o que recebe.

---

## 9. Single Source of Truth

Já estabelecido, em espírito, por `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 3 ("Múltiplas planilhas", "Relacionamento descentralizado") e por `CRM_HUB.md`, Capítulo 4 (princípio "Single Relationship Source"). Este documento formaliza a extensão explícita desse princípio ao cenário de múltiplos Hubs de origem: **existe exatamente uma implementação técnica de cada `Lead`/`Customer`/`Organization`/`Opportunity` na plataforma inteira**, e nenhum dos seis Hubs que convergem para o CRM Hub (Capítulo 17) jamais mantém sua própria cópia paralela dessas Entidades — cada um referencia por identificador, resolvido por Anti-Corruption Layer, exatamente como já exigido em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 10, e já demonstrado por `CONTENT_HUB_ARCHITECTURE.md` (ADR-CH-001) e por `CONVERSATION_HUB_ARCHITECTURE.md` (ADR-CV-005/006) ao tratar exatamente esta mesma garantia a partir do lado deles.

---

## 10. Gestão de Leads

**Já integralmente definido.** `Lead` é Entidade Frozen (`CRM_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7), com Capacidade Lead Management implementada pelo `Lead Manager` (`CRM_HUB.md`, Capítulo 7), Comandos `Create Lead`/`Convert Lead`, e Eventos `LeadCreated`/`LeadQualified`/`LeadConverted`. Este documento não redefine nada — acrescenta apenas a origem explícita de captura pelos novos Hubs: um `Lead` pode agora ser criado em reação a `LeadCaptured` (Content Hub, via Formulário) ou a uma interação iniciada em `Conversation` (Conversation Hub, via `MessageReceived` de primeiro contato), sempre através do mesmo Comando `Create Lead` já existente — nenhum caminho de criação alternativo, nenhuma Entidade paralela.

---

## 11. Gestão de Contatos

**Já integralmente definido** como `Contact` (`CRM_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Contact Manager`, `CRM_HUB.md`, Capítulo 7). Este documento fecha uma lacuna honesta: nenhum Evento dedicado a `Contact` está catalogado nos dezoito já Frozen — apenas implícito dentro de `CustomerUpdated`. Ver Capítulo 28 para a proposta de extensão (`ContactCreated`), e Capítulo 12 do `CONVERSATION_HUB_ARCHITECTURE.md` para a fronteira já formalizada entre `Contact` (CRM Hub) e `ChannelHandle`/`Participant` (Conversation Hub) — o CRM Hub continua sendo o único proprietário da identidade formal; o Conversation Hub apenas referencia por identificador.

---

## 12. Gestão de Clientes

**Já integralmente definido** como `Customer` (`CRM_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Customer Manager`, `CRM_HUB.md`, Capítulo 7), com `Customer Status`, `Lifecycle Stage`, `Account Manager` (Ownership) já Frozen. Ver Capítulo 36.1 para a reconciliação de nomenclatura com `Company`, nome usado na implementação real já construída (`src/app/features/crm/types/Company.ts`, Sprints 32/33) para a Entidade coletiva — a mesma reconciliação, em espelho, aplicável a `Organization` (Capítulo 13).

---

## 13. Gestão de Empresas/Organizações

**Já integralmente definido** como `Organization` (`CRM_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Organization Manager`, `CRM_HUB.md`, Capítulo 7) — a entidade coletiva, distinta de um `Contact` individual, associada a múltiplos `Contact`. A implementação já construída desta plataforma (Sprint 32) nomeia esta mesma Entidade `Company`, com campos concretos (`cnpj`, `segment`, `size`, `address`, `phone`, `email`, `website`, `ownerName`, `status`) plenamente compatíveis com o Domain Model Frozen — nenhum campo daquela implementação contradiz `Organization`; é o mesmo conceito, nomeado de forma mais concreta e mais próxima da linguagem de um usuário final brasileiro. A reconciliação formal de qual nome prevalece permanece pendente (Capítulo 36.1, Capítulo 38 ADR-CR-001).

---

## 14. Gestão de Oportunidades

**Já integralmente definido** como `Opportunity` (`CRM_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Opportunity Manager`, `CRM_HUB.md`, Capítulo 7) — sempre associada a um `Customer` ou `Organization`, nunca a um `Lead` não convertido, conforme ADR-007 já Frozen. A implementação já construída nomeia esta Entidade `Deal` (`src/app/features/crm/types/Deal.ts`), com campos (`clientId`, `companyId`, `title`, `value`, `probability`, `stageId`, `ownerName`, `expectedCloseDate`, `source`, `notes`) plenamente compatíveis com `Opportunity`. Mesma reconciliação pendente do Capítulo 13, registrada formalmente no Capítulo 36.1.

---

## 15. Pipelines

**Já integralmente definido** como `Pipeline` (`CRM_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Pipeline Manager`, `CRM_HUB.md`, Capítulo 7), resolvido inteiramente por Configuration, nunca por implementação de código específica por Empresa — princípio Configuration-Driven Pipeline já Frozen. Nenhuma extensão nova.

---

## 16. Etapas de Negócio

**Já integralmente definido** como `Stage` (`CRM_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Stage Manager`, `CRM_HUB.md`, Capítulo 7). A implementação já construída nomeia esta Entidade `CrmPipelineStage` (`src/app/features/crm/types/CrmPipelineStage.ts`), com o prefixo `Crm` deliberadamente escolhido, à época de sua construção, para não colidir com um conceito homônimo e não relacionado do Dashboard daquela mesma implementação — uma decisão de nomenclatura já documentada naquele código, e citada aqui como precedente concreto de que a disciplina de "nunca deixar dois conceitos homônimos sem distinção clara", já exigida em `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 3, já foi aplicada com sucesso na implementação real desta plataforma antes mesmo deste documento existir.

---

## 17. Timeline Unificada

Esta é a seção de maior valor agregado deste documento — a exigência central desta Sprint: "toda informação proveniente do Content Hub, Conversation Hub, Marketing Hub, Commerce Hub, Business Hub e AI Hub deverá convergir para uma Timeline única".

`Timeline` já é Entidade Frozen (`CRM_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7), garantida imutável pelo `Timeline Manager` (`CRM_HUB.md`, Capítulo 7, ADR-002), reconstruível a partir da sequência de Eventos já publicados (princípio Event-Sourced Timeline, `CRM_HUB.md`, Capítulo 5). O que este documento formaliza é o **catálogo completo de origem** de todo `Timeline Event` — antes implícito, agora explícito, Hub por Hub:

| Hub de origem | Evento consumido pelo CRM Hub | Timeline Event produzido |
|---|---|---|
| Content Hub | `LeadCaptured` (`CONTENT_HUB_ARCHITECTURE.md`, Capítulo 27) | "Lead capturado via conteúdo — origem: [Article/LandingPage]" |
| Content Hub | `DownloadCompleted` | "Material [nome] baixado" |
| Conversation Hub | `MessageReceived` (já Frozen como consumo — `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 11) | "Mensagem recebida via [Canal]" |
| Conversation Hub | `ConversationClosed`, `SLAExceeded`, `ConversationLabeled` (`CONVERSATION_HUB_ARCHITECTURE.md`, Capítulo 28) | "Atendimento encerrado" / "Prazo de resposta excedido" / "Conversa etiquetada" |
| Marketing/Growth Hub | Evento de Campanha já consumido (`CRM_DOMAIN_BLUEPRINT.md`, Capítulo 11) | "Campanha [nome] recebida" |
| Commerce Hub | `OpportunityWon` (já Frozen, publicado pelo próprio CRM, consumido de volta pelo Commerce Hub) → evento de pedido pago, consumido pelo CRM | "Pedido [número] confirmado" |
| Business Hub | `ProfileChanged` (já Frozen — `CRM_HUB.md`, Capítulo 13) | Não produz Timeline Event por si — recalibra vocabulário/Configuration, conforme já estabelecido |
| AI Hub | Sugestão consumida (Qualificação, priorização — já Frozen) | Não produz Timeline Event por si — apoia decisão humana, que é quem produz o evento correspondente quando confirmada |
| Identity Hub | Autenticação de toda operação — nunca produz Timeline Event diretamente | — |

```
        CONVERGÊNCIA DE TODA A PLATAFORMA PARA A TIMELINE DO CRM HUB
   ┌───────────────────────────────────────────────────────────┐
   │  Content Hub ──LeadCaptured──────────┐                         │
   │  Conversation Hub ──MessageReceived──┤                            │
   │  Marketing/Growth Hub ──Campanha─────┼──► CRM Hub ──► Timeline       │
   │  Commerce Hub ──Pedido pago──────────┤    (Anti-Corruption Layer         │
   │  Business Hub ──ProfileChanged───────┤     por integração — já              │
   │  AI Hub ──Sugestão (via decisão      │     Frozen, Capítulo 14)                │
   │  humana confirmada)──────────────────┘                                          │
   └───────────────────────────────────────────────────────────┘
```

**Rastreabilidade, auditoria e contexto completo — como são preservados.** O CRM Hub nunca produz esses Eventos originalmente — ele apenas os consome (exigência explícita desta Sprint, e já o princípio arquitetural padrão de todo Business Hub desde `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 10). Cada Evento consumido atravessa uma Anti-Corruption Layer dedicada, já exigida em `CRM_HUB.md`, Capítulo 14, antes de produzir um `Timeline Event` — nunca importando diretamente o vocabulário do Hub de origem. O `Timeline Event` resultante preserva sempre a referência ao Hub e ao Evento de origem (rastreabilidade), é imutável por construção via `Timeline Manager` (auditoria), e é sempre associado a exatamente um `Relationship` já existente ou recém-criado pela mesma cadeia de convergência (contexto completo) — nunca um `Timeline Event` órfão, sem `Relationship` associado, aplicação direta da Regra de negócio já Frozen em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 12.

---

## 18. Histórico Completo do Cliente

Já integralmente definido como `Customer 360` (Query, `CRM_HUB.md`, Capítulos 11 e 18) e como `Timeline`/`Customer History` — a visão consolidada de todo `Lead` original, toda `Opportunity`, toda `Activity`, todo `Task` e toda mudança de `Stage` já ocorrida, em ordem cronológica. Com a convergência do Capítulo 17, `Customer 360` passa a incluir, sem exigir nenhuma mudança em sua estrutura de Read Model já Frozen, também os `Timeline Event` originados de Content Hub, Conversation Hub, Marketing Hub, Commerce Hub e Business Hub — porque todos eles já entram na mesma Timeline unificada antes de `Customer 360` ser resolvida.

---

## 19. Atividades

**Já integralmente definido** como `Activity` (`CRM_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Activity Manager`, `CRM_HUB.md`, Capítulo 7) — ação já realizada, registrada em passado, sempre associada a exatamente um `Relationship`. Nenhuma extensão nova, exceto a origem ampliada já descrita no Capítulo 17 (uma `Activity` pode agora ser registrada em reação a Evento de qualquer um dos seis Hubs convergentes, não apenas Communication Hub).

---

## 20. Tarefas

**Já integralmente definido** como `Task` (`CRM_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Task Manager`, `CRM_HUB.md`, Capítulo 7) — trabalho pendente, atribuído a um responsável, com Comandos `Create Task`/`Complete Task` e Eventos `TaskAssigned`/`TaskCompleted` já Frozen. Nenhuma extensão nova.

---

## 21. Agenda

**Não é Entidade proprietária distinta do CRM Hub neste Blueprint Frozen** — `Task` já cobre trabalho pendente com data associada. A implementação já construída desta plataforma (Sprint 32) introduz `AgendaEvent` como uma especialização de compromisso datado (`type: appointment | callback | follow-up | meeting | reminder`), com um campo `externalCalendarId` deliberadamente reservado para integração futura com calendário externo, nunca implementada. Este documento trata `AgendaEvent` como uma especialização de `Task` dentro do mesmo Bounded Context do CRM Hub — nenhuma nova Entidade proprietária é necessária; a Agenda é uma visão filtrada de `Task` por data e por tipo de compromisso, resolvida por Query, não por um novo Aggregate.

---

## 22. Notas

**Lacuna identificada e proposta de fechamento.** `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 4, já lista "Customer Notes — Anotação qualitativa associada a um relacionamento" como pertencente ao CRM — mas nenhum dos dois documentos Frozen formaliza um `Note Manager`, um Comando `Add Note` ou um Evento `NoteAdded`. A implementação já construída (`src/app/features/crm/types/Note.ts`, Sprint 32) já trata `Note` como Entidade de primeira classe (`{ id, entityType, entityId, author, content, createdAt }`, associável a Company, Client ou Deal), confirmando na prática que essa formalização é necessária.

Este documento propõe, como extensão aditiva — nunca como alteração do texto Frozen —: um `Note Manager` (novo componente, categoria "Gestão de Entidade" já existente em `CRM_HUB.md`, Capítulo 7); os Comandos `Add Note`/`Update Note`; e o Evento `NoteAdded` (Capítulo 28). `Note` permanece, como já Frozen, associável a qualquer `Relationship` — a implementação já construída generaliza isso para qualquer Entidade do CRM (`Company`, `Client`, `Deal`), o que é plenamente compatível com o conceito já Frozen de que toda `Activity`/`Task` (e, por extensão proposta, `Note`) deve estar associada a exatamente um `Relationship` ou a uma Entidade subordinada a ele.

---

## 23. Campos Personalizados

**Já integralmente definido** como `Custom Field` (`CRM_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Custom Field Manager`, `CRM_HUB.md`, Capítulo 7), resolvido por Configuration, nunca por alteração do Domain Model central — princípio Configuration-Driven já Frozen (ADR-011). Nenhuma extensão nova.

---

## 24. Segmentação

**Já integralmente definido** como `Segment`/`Customer Segments` (`CRM_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Segment Manager`, `CRM_HUB.md`, Capítulo 7), publicando `SegmentUpdated`, já consumido pelo Growth Hub. **Fronteira reafirmada, não alterada:** o `Segment` do CRM Hub agrupa `Relationship` por característica compartilhada de relacionamento (por exemplo, Lifecycle Stage, Tag, Custom Field); é estruturalmente distinto de `Audience Segment` (Growth Hub — critério estratégico de campanha) e de `Segment (Empresa)` (Business Profile Engine — classificação setorial da própria Empresa cliente da plataforma), ambos já formalmente distinguidos em `DOMAIN_OWNERSHIP_MATRIX.md`, linhas correspondentes. O CRM Hub publica `SegmentUpdated`; o Growth Hub o consome como um dos sinais que compõem sua própria `Audience Segment` — nunca o contrário, e nunca uma fusão dos dois conceitos.

---

## 25. Relacionamentos entre Entidades

Já integralmente definido em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 8 — `Relationship` conectando `Customer`/`Organization`/`Supplier`/`Partner`; `Contact` associado a `Customer` ou `Organization`; `Opportunity` associada a `Customer`/`Organization` via `Pipeline`/`Stage`; `Activity`/`Task` associados a `Relationship`; todo o conjunto produzindo `Timeline Event`. Este documento acrescenta apenas `Note` (Capítulo 22) ao mesmo diagrama, associável a `Relationship` ou a `Opportunity`, com o mesmo padrão de associação obrigatória já exigido para `Activity`.

```
                              Relationship
                     (já Frozen — CRM_DOMAIN_BLUEPRINT.md, Capítulo 8)
                                 │
              ┌──────────┬───────┼───────┬──────────┬──────────┐
              ▼          ▼       ▼       ▼          ▼          ▼
          Customer  Organization Opportunity  Activity      Task       Note
         (= Company) (= Company)     │      (já Frozen)  (já Frozen)  (novo,
                                      ▼                                Capítulo 22)
                                   Pipeline → Stage
                                      │
                                      ▼
                                  Timeline
                        (todo item acima produz Timeline Event,
                         agora também convergindo de 6 Hubs — Capítulo 17)
```

---

## 26. Customer Journey

**A fronteira mais importante deste documento.** `Journey` já é Entidade Frozen do Growth Hub (`GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 4; `DOMAIN_OWNERSHIP_MATRIX.md`, linha "Journey | Growth Hub | Communication, Automation | Sequência estratégica de Touchpoint") — uma sequência **planejada** de pontos de contato, desenhada antes de acontecer, parte de uma estratégia de crescimento.

Customer Journey do CRM Hub, tal como pedida por esta Sprint, é algo estruturalmente diferente: **uma visão de leitura (Query) que compõe, cronologicamente, dado já proprietário do CRM Hub — Lifecycle Stage, Timeline, Opportunity, Stage** — apresentando "por onde este relacionamento específico já passou de fato", nunca "por onde este relacionamento deveria passar segundo uma estratégia". Journey (Growth Hub) é prospectiva e estratégica; Customer Journey (CRM Hub) é retrospectiva e factual — a mesma distinção, em espírito, já estabelecida entre Conversation Timeline e Timeline do CRM em `CONVERSATION_HUB_ARCHITECTURE.md`, Capítulo 26.

```
   Growth Hub — Journey                    CRM Hub — Customer Journey
   (estratégico, prospectivo)               (factual, retrospectivo)
   ┌─────────────────────┐                  ┌─────────────────────┐
   │  Touchpoint 1 (plano)│                  │  Lead capturado          │
   │  Touchpoint 2 (plano)│   nunca fundidos │  Mensagem recebida            │
   │  Touchpoint 3 (plano)│  ◄─────X────────►│  Qualificado                       │
   └─────────────────────┘                  │  Convertido                             │
                                             │  Opportunity aberta                        │
                                             │  Won                                            │
                                             └─────────────────────┘
```

Customer Journey é implementada como uma nova Query — `Customer Journey View` — resolvida contra o mesmo Read Model já usado por `Customer 360` e por `Timeline` (Capítulo 11 de `CRM_HUB.md`), filtrada e ordenada para apresentar a progressão de `Lifecycle Stage` e de `Stage` de `Opportunity` ao longo do tempo, com os `Timeline Event` de maior relevância de marco (conversão, mudança de Estágio, fechamento) em destaque — nenhuma Entidade nova de armazenamento, apenas uma nova forma de ler dado já existente.

---

## 27. IA aplicada ao CRM

Nenhuma capacidade descrita neste capítulo é implementada nesta Sprint — mesmo padrão de "preparação sem implementação prematura" já aplicado em `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 25, e em `CONVERSATION_HUB_ARCHITECTURE.md`, Capítulo 27. `CRM_HUB.md`, Capítulo 13, já antecipa três destas capacidades em nível geral (assistência à Qualificação, priorização de Opportunity, sugestão de resposta); este capítulo as detalha e as completa para as doze capacidades explicitamente pedidas por esta Sprint.

Notavelmente, a implementação já construída desta plataforma já preparou, em código, dois contratos diretamente relevantes a este capítulo — `CrmAiExtensionPoints` (sete pontos de extensão reservados: agentes de IA, WhatsApp, e-mail, automação, marketing, análises, financeiro, todos com `connected: false`) e `CrmAiAssistProvider` (`suggestNextContact`, `summarizeClient`, `scoreLead`, todos interfaces sem implementação) — ambos já citados em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, §19, como exemplo do padrão "contrato primeiro, implementação depois" que esta plataforma já pratica. As capacidades abaixo estendem esses mesmos contratos já preparados, não os substituem.

**Enriquecimento de Leads.** O AI Hub complementaria um `Lead` recém-capturado com dado inferido a partir de fonte pública ou de padrão já observado em `Lead`s semelhantes, sempre como sugestão apresentada ao responsável antes de qualquer gravação.

**Classificação automática.** Categorização de `Lead`/`Opportunity` por segmento, intenção ou potencial de valor, informando priorização sem decidir Qualificação sozinha.

**Lead Scoring.** Equivalente direto ao já preparado `scoreLead` de `CrmAiAssistProvider` — pontuação de propensão à conversão, apresentada como `LeadScore` (`score`, `band: cold|warm|hot`), nunca como decisão automática de Qualificação, mesma Regra de negócio já Frozen ("A Qualificação de um Lead é sempre uma decisão explícita e registrada").

**Previsão de conversão.** Estimativa de probabilidade de uma `Opportunity` fechar como Won, complementar ao campo `probability` já presente na implementação real (`Deal.probability`), refinando manualmente atribuído por sugestão assistida.

**Resumo de histórico.** Equivalente direto ao já preparado `summarizeClient` — síntese da `Timeline`/`Customer 360` de um `Relationship`, útil quando um novo `Account Manager` assume Ownership (Capítulo 9 de `CRM_HUB.md`) e precisa de contexto rápido.

**Sugestões de próximas ações.** Equivalente direto ao já preparado `suggestNextContact` — `NextContactSuggestion` (`suggestedDate`, `reason`), apoiando o `Account Manager` sem jamais criar `Task`/`Activity` automaticamente sem confirmação.

**Identificação de riscos.** Apoio à decisão já tomada pelo `Lifecycle Manager` (`CRM_HUB.md`, Capítulo 9, "Cliente inativo") — o AI Hub antecipa sinal de risco antes que a inatividade se torne o gatilho reativo já existente, mas a transição de `Lifecycle Stage` continua sendo decidida pelo `Lifecycle Manager`, nunca pelo AI Hub diretamente.

**Segmentação inteligente.** Sugestão de novo `Segment` ou de recomposição de um já existente, a partir de padrão observado em `Timeline` — sempre uma sugestão ao `Segment Manager`, nunca uma escrita direta.

**Recomendações comerciais.** Sugestão de produto/serviço adicional relevante a um `Customer` já ativo, a partir de padrão de `Opportunity` já fechada — a decisão de criar uma nova `Opportunity` a partir dessa sugestão permanece do `Account Manager`.

**Análise comportamental.** Leitura de padrão de interação ao longo da Timeline (frequência, canal preferido, tempo médio de resposta) — insumo tanto para Identificação de riscos quanto para Recomendações comerciais.

**Detecção de churn.** Especialização de Identificação de riscos com foco explícito em probabilidade de perda definitiva do `Relationship`, não apenas de risco temporário — resultado sempre apresentado como recomendação ao `Lifecycle Manager`/`Account Manager`, nunca como Archive automático.

**Geração de insights.** Síntese consolidada, entregue tipicamente ao Analytics Hub como insumo complementar (nunca como substituto do cálculo de indicador, que permanece exclusivo daquele Hub, conforme `DOMAIN_OWNERSHIP_MATRIX.md`, ADR-004) — por exemplo, "Relacionamentos originados por Conversation Hub convertem 30% mais rápido que os originados por Content Hub neste trimestre".

Toda capacidade acima é consumida através do contrato já estabelecido em `AI_HUB.md` — o CRM Hub nunca implementa lógica de inteligência artificial própria, aplicação direta do princípio já Frozen em `CRM_HUB.md`, Capítulo 13, e do princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5.

---

## 28. Eventos do Domínio

Os dezoito eventos abaixo já estão integralmente definidos e Frozen em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 10 — reproduzidos aqui, sem redefinição, para consolidar o catálogo pedido por esta Sprint num único lugar de consulta. Os três eventos finais são a extensão proposta por este documento (Capítulos 11 e 22), marcados como tal.

| Evento | Produtor | Consumidor | Objetivo | Impacto |
|---|---|---|---|---|
| `LeadCreated` | CRM Hub (já Frozen) | Growth Hub, Analytics Hub | Novo Lead registrado, qualquer origem. | Ponto de entrada de relacionamento. |
| `LeadQualified` | CRM Hub (já Frozen) | Analytics Hub | Lead atende critério mínimo. | Antecede Conversão. |
| `LeadConverted` | CRM Hub (já Frozen) | Communication Hub, Finance Hub, Analytics Hub | Lead vira Customer. | Cria Relationship formal. |
| `CustomerCreated` | CRM Hub (já Frozen) | Analytics Hub | Novo Customer registrado. | Base de relacionamento ativo. |
| `CustomerUpdated` | CRM Hub (já Frozen) | Analytics Hub | Atributo de Customer alterado. | Mantém Read Model consistente. |
| `CustomerArchived` | CRM Hub (já Frozen) | Analytics Hub | Relationship encerrado (Soft Delete). | Timeline preservada, consultável. |
| `SupplierRegistered` | CRM Hub (já Frozen) | — | Novo Supplier registrado. | — |
| `PartnerRegistered` | CRM Hub (já Frozen) | — | Novo Partner registrado. | — |
| `OpportunityCreated` | CRM Hub (já Frozen) | Analytics Hub | Nova Opportunity/Deal aberta. | Entra em Pipeline. |
| `OpportunityWon` | CRM Hub (já Frozen) | Finance Hub, Commerce Hub (novo consumidor, Capítulo 29), Analytics Hub | Opportunity fechada com sucesso. | Inicia faturamento/pedido. |
| `OpportunityLost` | CRM Hub (já Frozen) | Analytics Hub | Opportunity encerrada sem sucesso. | Motivo preservado na Timeline. |
| `TaskAssigned` | CRM Hub (já Frozen) | Automation Engine | Task atribuído a responsável. | Notificação disparada. |
| `TaskCompleted` | CRM Hub (já Frozen) | Analytics Hub | Task concluído. | Timeline Event registrado. |
| `ActivityLogged` | CRM Hub (já Frozen) | Analytics Hub | Nova Activity registrada. | Timeline Event registrado. |
| `ConsentUpdated` | CRM Hub (já Frozen) | Communication Hub, Conversation Hub (novo consumidor, Capítulo 29) | Consent de comunicação alterado. | Respeitado antes de qualquer envio. |
| `RelationshipChanged` | CRM Hub (já Frozen) | Communication Hub, Automation Engine, Analytics Hub | Status/Lifecycle Stage/Owner alterado. | Pode disparar reengajamento. |
| `SegmentUpdated` | CRM Hub (já Frozen) | Growth Hub, Analytics Hub | Segmentação de Relationship mudou. | Insumo de Audience Segment. |
| `TimelineUpdated` | CRM Hub (já Frozen) | Analytics Hub | Novo Timeline Event registrado. | Reação em tempo próximo ao real. |
| `ContactCreated` **(novo)** | CRM Hub | Conversation Hub, Analytics Hub | Novo Contact associado a Customer/Organization. | Fecha a lacuna do Capítulo 11. |
| `NoteAdded` **(novo)** | CRM Hub | Analytics Hub | Nova Note registrada. | Fecha a lacuna do Capítulo 22. |
| `CustomerMerged` **(novo)** | CRM Hub | Analytics Hub | Dois registros fundidos pelo Merge Engine (já Frozen como Comando). | Formaliza o Evento correspondente ao já existente `MergeCustomer`. |

---

## 29. Integração com os demais Hubs

**Content Hub.** Publica `LeadCaptured` (Formulário/CTA) e `DownloadCompleted`, ambos consumidos pelo CRM Hub para criar `Lead` (via `Create Lead` já Frozen) e para registrar `Timeline Event`, respectivamente — exatamente o fluxo já formalizado em `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 23.2, e citado ali como aplicação do padrão já Frozen em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 18.

**Conversation Hub.** Publica `MessageReceived` (já Frozen como consumo do CRM Hub) e, com a extensão daquele documento, `ConversationClosed`/`SLAExceeded`/`ConversationLabeled`, todos convertidos em `Timeline Event`. O CRM Hub publica `ConsentUpdated` e `RelationshipChanged`, já consumidos pelo Conversation Hub conforme `CONVERSATION_HUB_ARCHITECTURE.md`, Capítulo 29.

**Marketing Hub.** Ainda sem Blueprint próprio nesta série — o CRM Hub já consome, em espírito, "evento de Campanha" (`CRM_DOMAIN_BLUEPRINT.md`, Capítulo 11, referenciando Growth Hub) e publica `SegmentUpdated`/`LeadCreated`, consumidos de volta. Quando um Marketing Hub formal for especificado, esta integração deve seguir exatamente o mesmo padrão já Frozen para Growth Hub, sem exigir mudança ao CRM Hub.

**Commerce Hub.** Ainda sem Blueprint próprio — o CRM Hub publica `OpportunityWon` (já Frozen), que um futuro Commerce Hub consumiria para iniciar seu próprio Pedido, exatamente como o Finance Hub já faz hoje. O CRM Hub nunca processa pagamento nem cria Pedido diretamente, mesma fronteira já Frozen (ADR-003).

**Business Hub.** Ainda sem Blueprint próprio — o CRM Hub já consome `ProfileChanged` (já Frozen, referenciando Business Profile Engine) para calibrar vocabulário de Estágio e prioridade de Segmentação via `Configuration Manager`. Um futuro Business Hub formal herdaria essa mesma integração sem alteração.

**AI Hub.** Consumido nos termos do Capítulo 27 — o CRM Hub nunca implementa lógica de IA própria, mesma fronteira já Frozen (`CRM_HUB.md`, Capítulo 13).

**Identity Hub.** Autentica e autoriza toda operação de Command e Query sobre o CRM Hub, já Frozen (`CRM_HUB.md`, Capítulo 13).

**Integration Hub.** Única via de captura de Lead externo e de notificação a sistema externo, já Frozen (`CRM_HUB.md`, Capítulo 13).

**Analytics Hub.** Consome todo Evento publicado pelo CRM Hub, já Frozen (`CRM_HUB.md`, Capítulo 14) — nunca calcula indicador o próprio CRM Hub.

```
              INTEGRAÇÃO DO CRM HUB COM TODOS OS HUBS (visão final)
   ┌───────────────────────────────────────────────────────────┐
   │  CRM Hub                                                      │
   │    publica: LeadCreated · LeadQualified · LeadConverted ·        │
   │             CustomerCreated · OpportunityCreated ·                  │
   │             OpportunityWon · OpportunityLost · ConsentUpdated ·        │
   │             RelationshipChanged · SegmentUpdated · TimelineUpdated ·     │
   │             ContactCreated · NoteAdded · CustomerMerged (3 novos)          │
   │    consome:  LeadCaptured, DownloadCompleted (Content Hub) ·                  │
   │              MessageReceived, ConversationClosed, SLAExceeded,                   │
   │              ConversationLabeled (Conversation Hub) ·                               │
   │              Campanha (Marketing/Growth Hub) ·                                         │
   │              ProfileChanged (Business Hub) ·                                              │
   │              PaymentConfirmed (Finance Hub, já Frozen)                                      │
   └───────────────────────────────────────────────────────────┘
```

---

## 30. Segurança

Já integralmente definido em `CRM_HUB.md`, Capítulo 15 — seis camadas (Autenticação/Autorização, Ownership, Validation, Soft Delete, Imutabilidade da Timeline, Auditoria), LGPD já endereçada com a distinção entre "excluir o dado pessoal, preservar o fato estrutural". Nenhuma extensão nova é exigida pela convergência do Capítulo 17 — cada Evento consumido de outro Hub já passa pela mesma Anti-Corruption Layer e pela mesma Validation antes de afetar qualquer Aggregate, conforme já Frozen.

---

## 31. Permissões

Já integralmente definido em `CRM_HUB.md`, Capítulo 10 e Capítulo 13, via Identity Hub (RBAC/ABAC), distinguindo, por exemplo, Perfil Atendimento (acesso a `CreateTask`/`CompleteTask`) de Perfil Administrativo (`MergeCustomer`/`ArchiveCustomer`). Os três Comandos novos propostos neste documento (`AddNote`, `UpdateNote`) seguem o mesmo modelo, tipicamente disponíveis a qualquer Perfil operacional.

---

## 32. Auditoria

Já integralmente definido em `CRM_HUB.md`, Capítulo 15, via `Audit Manager` — toda operação sensível (transferência de Ownership, Merge, alteração de Consent) produz registro imutável. `NoteAdded`/`CustomerMerged` (Capítulo 28), como extensão, seguem o mesmo padrão de auditoria sem exigir nenhum componente novo além do `Note Manager` já proposto.

---

## 33. Multi-Tenant

Já integralmente definido em `CRM_HUB.md`, Capítulo 17 — nenhum componente interno mantém estado compartilhado entre o `Relationship` de um Tenant e o de outro, aplicação direta de `SAAS_ARCHITECTURE.md`, Capítulo 6. A convergência de seis Hubs (Capítulo 17) preserva esse isolamento sem exceção — todo Evento consumido de Content Hub/Conversation Hub/Marketing Hub/Commerce Hub/Business Hub/AI Hub já carrega o identificador de Tenant de origem, verificado antes de qualquer atualização de `Relationship`.

---

## 34. Escalabilidade

Já integralmente definido em `CRM_HUB.md`, Capítulo 17 — Sharding conceitual por Tenant, Search Manager com índice dedicado, separação entre caminho de escrita e caminho de leitura escaláveis independentemente. A convergência de múltiplos Hubs de origem (Capítulo 17) não altera essa arquitetura — cada Evento consumido é processado de forma assíncrona e independente, através do mesmo Event Bus já descrito em `SYSTEM_BLUEPRINT.md`, nunca bloqueando o processamento de Command já em andamento.

---

## 35. Diagramas ASCII

```
                    POSIÇÃO DO CRM HUB NA PLATAFORMA (8 Hubs)
   ┌───────────────────────────────────────────────────────────┐
   │  Platform Services                                            │
   │  (AI Hub · Identity Hub · Knowledge Hub · Integration Hub)     │
   ├───────────────────────────────────────────────────────────┤
   │  Adaptive Intelligence                                          │
   │  (Business Profile Engine · Branding Hub · Automation Engine)   │
   ├───────────────────────────────────────────────────────────┤
   │  Business Hubs                                                   │
   │  ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐          │
   │  │Content  │ │Conversa-  │ │  CRM Hub    │ │Marketing/│          │
   │  │Hub      │ │tion Hub   │ │ (este doc — │ │Commerce/ │          │
   │  │         │ │           │ │  Frozen +   │ │Business  │          │
   │  │         │ │           │ │  extensão)  │ │Hub (a    │          │
   │  │         │ │           │ │             │ │definir)  │          │
   │  └────┬────┘ └─────┬─────┘ └──────┬──────┘ └────┬─────┘          │
   │       └────────────┴──────Timeline┴─────────────┘                  │
   │                    Única (Capítulo 17)                                │
   └───────────────────────────────────────────────────────────┘
```

```
              RECONCILIAÇÃO BLUEPRINT FROZEN ↔ IMPLEMENTAÇÃO REAL
   ┌───────────────────────────────────────────────────────────┐
   │  CRM_DOMAIN_BLUEPRINT.md (Frozen)   →   src/app/features/crm/   │
   │  Organization                       →   Company                    │
   │  Opportunity                        →   Deal                          │
   │  Stage                              →   CrmPipelineStage                 │
   │  Timeline Event                     →   HistoryEntry                        │
   │  Customer Notes (mencionado, nunca  →   Note (já Entidade completa)             │
   │  formalizado)                                                                       │
   └───────────────────────────────────────────────────────────┘
```

(Diagramas de fluxo operacional adicionais — Conversão, Won/Lost — permanecem os já publicados em `CRM_HUB.md`, Capítulo 9, não reproduzidos aqui para evitar duplicação.)

---

## 36. Tabelas Arquiteturais

### 36.1 Reconciliação de nomenclatura (Blueprint Frozen ↔ implementação real)

| Conceito | Nome no Blueprint Frozen | Nome na implementação real (`src/app/features/crm/`) | Status |
|---|---|---|---|
| Entidade coletiva (empresa-cliente) | `Organization` | `Company` | Mesmo conceito — reconciliação de nome pendente (ADR-CR-001). |
| Possibilidade de negócio | `Opportunity` | `Deal` | Mesmo conceito — reconciliação de nome pendente (ADR-CR-001). |
| Etapa de Pipeline | `Stage` | `CrmPipelineStage` | Mesmo conceito — prefixo já usado para evitar colisão com Dashboard. |
| Unidade de Timeline | `Timeline Event` | `HistoryEntry` | Mesmo conceito — reconciliação de nome pendente (ADR-CR-001). |
| Anotação qualitativa | "Customer Notes" (mencionado, nunca formalizado) | `Note` (Entidade completa) | Este documento propõe formalização (Capítulo 22, ADR-CR-002). |
| Compromisso datado | Não formalizado como Entidade distinta de `Task` | `AgendaEvent` | Tratado como especialização de `Task` (Capítulo 21). |

### 36.2 Entidade → Ownership (verificação contra `DOMAIN_OWNERSHIP_MATRIX.md`)

| Entidade | Proprietário | Verificação |
|---|---|---|
| Lead, Customer, Organization/Company, Contact, Opportunity/Deal, Pipeline, Stage, Activity, Task, Timeline, Note (novo) | CRM Hub | Confirmado — nenhuma duplicação. |
| Journey | Growth Hub | Confirmado distinto de Customer Journey (Capítulo 26). |
| Audience Segment | Growth Hub | Confirmado distinto de Segment/CRM (Capítulo 24). |
| Segment (Empresa) | Business Profile Engine | Confirmado distinto de Segment/CRM (Capítulo 24). |
| Conversation, Message, ChannelHandle | Conversation Hub | Confirmado — CRM referencia por identificador. |
| Article, LandingPage, Form | Content Hub | Confirmado — CRM referencia por identificador via `LeadCaptured`. |

### 36.3 KPIs (fatos brutos — cálculo consolidado permanece do Analytics Hub)

| Indicador de origem | Módulo produtor |
|---|---|
| Volume de Lead capturado por Hub de origem | Lead Manager, convergência do Capítulo 17 |
| Taxa de conversão de Lead a Customer | Lead Manager, Customer Manager |
| Tempo médio de progressão por Stage | Stage Manager (já Frozen) |
| Taxa de retenção por Lifecycle Stage | Lifecycle Manager (já Frozen) |
| Volume de Note por Relationship | Note Manager (novo) |

---

## 37. Roadmap Evolutivo

| Fase | Foco | Observação |
|---|---|---|
| **Fase 1 — Governança** | Reconciliar nomenclatura (Capítulo 36.1) e decidir se Frozen é reaberto via Amendment ou se a implementação real adota os nomes Frozen. | Pendente — ver ADR-CR-001. |
| **Fase 2 — Núcleo já Frozen** | Lead Manager, Customer Manager, Relationship Manager, Timeline Manager — já roteirizados em `CRM_HUB.md`, Capítulo 19. | Reaproveitado integralmente. |
| **Fase 3 — Fechamento de lacunas** | Note Manager, ContactCreated, CustomerMerged. | Depende de Fase 1 para nomenclatura definitiva. |
| **Fase 4 — Convergência Content/Conversation Hub** | `LeadCaptured`, `MessageReceived` e demais já consumidos conforme Capítulo 17. | Já especificado nos dois Blueprints correspondentes. |
| **Fase 5 — Customer Journey** | Query `Customer Journey View`, sem nova Entidade. | Depende de Fase 2 madura. |
| **Fase 6 — Convergência Marketing/Commerce/Business Hub** | Requer que esses três Hubs ganhem Blueprint próprio primeiro. | Bloqueado até `MARKETING_HUB_ARCHITECTURE.md`/`COMMERCE_HUB_ARCHITECTURE.md`/`BUSINESS_HUB_ARCHITECTURE.md` (domínio) existirem. |
| **Fase 7 — IA aplicada ao CRM** | As doze capacidades do Capítulo 27, com `CrmAiExtensionPoints`/`CrmAiAssistProvider` já preparados no código. | Contratos já existem; implementação é trabalho futuro. |

---

## 38. Regras Arquiteturais

**ADR-CR-001 — A reconciliação de nomenclatura entre Organization/Company, Opportunity/Deal e Timeline Event/HistoryEntry é um item de governança pendente, não resolvido por este documento.** Contexto: `CRM_DOMAIN_BLUEPRINT.md` é Frozen; qualquer mudança de nome exige Amendment (`DOCUMENTATION_CONSTITUTION.md`, §10), fora do escopo desta Sprint.

**ADR-CR-002 — `Note` é formalizada como extensão aditiva, nunca como correção do texto Frozen.** Note Manager, Add Note, Update Note e NoteAdded são propostos como adição, preservando toda a estrutura já Frozen. Contexto: fechar a lacuna identificada no Capítulo 22 sem reabrir `CRM_DOMAIN_BLUEPRINT.md`.

**ADR-CR-003 — Customer Journey nunca é confundida com Journey (Growth Hub).** Customer Journey é uma Query de leitura sobre dado já proprietário do CRM Hub; Journey é uma Entidade estratégica e prospectiva, proprietária do Growth Hub. Nenhuma das duas lê ou escreve na estrutura interna da outra. Contexto: preservar Domain Ownership já Frozen em `DOMAIN_OWNERSHIP_MATRIX.md`.

**ADR-CR-004 — O CRM Hub nunca produz originalmente nenhum Evento de outro Hub — apenas consome.** Toda convergência descrita no Capítulo 17 é estritamente de consumo. Contexto: exigência explícita desta Sprint ("sem assumir a responsabilidade de produzi-los originalmente"), e aplicação direta do princípio Events over Direct Calls já Frozen.

**ADR-CR-005 — Marketing Hub, Commerce Hub e Business Hub, ainda sem Blueprint próprio, são integrados por analogia ao padrão já Frozen para Growth Hub e Finance Hub.** Nenhuma suposição sobre a estrutura interna desses três Hubs futuros é feita além do Evento já nomeado (`ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, Capítulo 15.3). Contexto: evitar acoplamento prematuro a um domínio ainda não especificado.

**ADR-CR-006 — Este documento não altera `CRM_DOMAIN_BLUEPRINT.md`, `CRM_HUB.md` ou `DOMAIN_OWNERSHIP_MATRIX.md`.** Toda extensão proposta (Note, ContactCreated, CustomerMerged, Customer Journey View) é um item de governança pendente, sujeito a Change Request ou Amendment conforme o documento afetado. Contexto: mesmo princípio já registrado em `CONTENT_HUB_ARCHITECTURE.md`, ADR-CH-009, e em `CONVERSATION_HUB_ARCHITECTURE.md`, ADR-CV-009 — aqui aplicado ao documento de maior friction de todos, por ser Frozen, não apenas Official.

---

## 39. Conclusão

Este documento não introduz um novo domínio — ele reafirma, estende e formaliza a convergência do domínio de relacionamento mais maduro e mais estável de toda a Adaptive Business Platform: o CRM Hub, já Frozen desde `CRM_DOMAIN_BLUEPRINT.md` e `CRM_HUB.md`. Sua contribuição real está em três lugares específicos: a Timeline Unificada (Capítulo 17), que formaliza como seis Hubs — três deles definidos depois do CRM Hub ter sido congelado — convergem para a mesma fonte única de verdade sem que o CRM Hub jamais produza o que apenas deveria consumir; a reconciliação honesta entre o vocabulário do Blueprint Frozen e o vocabulário já usado pela implementação real desta plataforma (`Company`, `Deal`, `HistoryEntry`, `Note`); e o fechamento transparente de três lacunas que o próprio texto Frozen já sinalizava, mas nunca completava.

Nenhuma dessas três contribuições exigiu tocar uma única linha dos dois documentos Frozen. Essa é, precisamente, a prova de que a arquitetura descrita por `BUSINESS_HUB_ARCHITECTURE.md` — Bounded Context estável, Evento como única forma de colaboração, extensão sem modificação do núcleo — funciona exatamente como prometido: o Hub mais antigo e mais crítico da plataforma pôde crescer para receber seis novas origens de relacionamento sem que sua própria fundação precisasse ser reaberta uma única vez.

Três itens de governança permanecem pendentes, explicitamente registrados: a reconciliação de nomenclatura (ADR-CR-001), a formalização de Note/ContactCreated/CustomerMerged nos documentos Frozen (ADR-CR-002/ADR-CR-006), e a futura especificação de Marketing Hub, Commerce Hub e Business Hub como pares completos de Blueprint e Hub, seguindo exatamente o padrão que o próprio CRM Hub inaugurou. Nenhum dos três é resolvido por este documento isoladamente — cada um exige seu próprio processo de Review e Approval, conforme `DOCUMENTATION_CONSTITUTION.md`, §13 e §14.
