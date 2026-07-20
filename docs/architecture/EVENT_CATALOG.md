# Event Catalog

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento consolida oficialmente e de forma definitiva o catálogo de todos os Domain Events publicados pela Adaptive Business Platform. Ele não altera nenhuma decisão de ownership já registrada em `DOMAIN_OWNERSHIP_MATRIX.md`, nem redefine nenhum Evento já descrito em seu documento proprietário original — `CRM_DOMAIN_BLUEPRINT.md`, `COMMUNICATION_DOMAIN_BLUEPRINT.md`, `FINANCE_DOMAIN_BLUEPRINT.md`, `GROWTH_DOMAIN_BLUEPRINT.md`, `ANALYTICS_DOMAIN_BLUEPRINT.md`, e os demais documentos de Platform Services e de Adaptive Intelligence. O que este documento adiciona é uma referência única e consultável, na qual todo Evento da plataforma pode ser localizado, junto ao seu produtor, seus consumidores, seu propósito e suas regras técnicas de publicação, replay, ordenação, versionamento e idempotência.

Event-Driven Architecture é o estilo arquitetural que atravessa toda a Adaptive Business Platform desde `SYSTEM_BLUEPRINT.md` — módulos que não se chamam diretamente, mas que comunicam mudança de estado através de Evento publicado em um Event Bus comum. Este catálogo é a materialização mais concreta desse estilo: a lista exaustiva de todo fato de negócio que a plataforma já reconhece como relevante o suficiente para ser publicado.

Eventos, nesta arquitetura, são o contrato entre domínios — não a estrutura interna de dado de um módulo, não uma chamada de função, mas um registro nomeado e estável do que já aconteceu, que qualquer outro módulo pode consumir sem jamais precisar conhecer como o produtor implementa internamente esse fato. É esse contrato, e não uma integração ad hoc, que permite que CRM, Communication, Finance, Growth e Analytics evoluam de forma independente, conforme já demonstrado individualmente em cada um dos cinco pares de Blueprint e Hub desta série.

Baixo acoplamento é a consequência direta desse contrato — um módulo consumidor depende apenas do formato conceitual de um Evento já publicado, nunca da lógica interna que o produziu, permitindo que o produtor altere sua implementação livremente desde que o contrato do Evento permaneça estável.

Comunicação assíncrona é a forma padrão de toda interação entre Business Hubs nesta plataforma — um Evento é publicado sem que seu produtor aguarde ou dependa de uma resposta imediata de qualquer consumidor, garantindo que a indisponibilidade momentânea de um consumidor nunca bloqueie a operação do produtor.

Eventos como linguagem do negócio é o princípio segundo o qual todo nome de Evento reflete um fato que um especialista de negócio reconheceria e nomearia da mesma forma — `InvoicePaid`, `OpportunityWon`, `CampaignFinished` — nunca uma abstração técnica arbitrária como "registro atualizado" ou "estado modificado". Este catálogo preserva essa disciplina em cada uma de suas entradas.

A necessidade de um catálogo consolidado como este só se torna evidente na mesma escala em que a necessidade de `DOMAIN_OWNERSHIP_MATRIX.md` já se tornou evidente — depois que múltiplos domínios maduros já publicam dezenas de Evento cada um. Enquanto apenas um Business Hub existia, o conjunto de Evento relevante cabia inteiramente na cabeça de qualquer Engenheiro envolvido; com cinco Business Hubs, quatro Platform Services e três componentes de Adaptive Intelligence já publicando fatos de negócio de forma independente, a única forma de garantir que um novo consumidor encontre rapidamente o Evento que precisa, sem reler cinco Blueprints inteiros, é um catálogo único que resuma o contrato essencial de cada um.

Este catálogo também formaliza uma distinção que, embora já implícita em cada documento proprietário desta série, nunca havia sido explicitada de forma transversal: nem todo Evento tem os mesmos consumidores, nem toda propagação de Evento tem a mesma urgência. Um Evento como `PaymentFailed`, que aciona uma reação quase imediata do Automation Engine, tem uma expectativa de latência de propagação muito diferente de um Evento como `BenchmarkUpdated`, cuja propagação pode tolerar uma janela de consistência eventual de várias horas sem prejuízo a nenhuma decisão de negócio. Este catálogo torna essa distinção visível, entrada por entrada, através do atributo Momento de publicação.

---

## 2. Objetivos

Este catálogo padroniza — todo Evento da plataforma segue a mesma convenção de nome, o mesmo conjunto mínimo de atributos descritivos, e a mesma disciplina de publicação, independentemente de qual módulo o produz.

Este catálogo garante interoperabilidade — qualquer módulo que precise consumir um fato de negócio de outro domínio encontra, em um único lugar, o contrato conceitual estável que precisa respeitar.

Este catálogo garante desacoplamento — ao tornar o contrato de cada Evento público e estável, ele permite que produtor e consumidor evoluam suas implementações internas de forma independente.

Este catálogo garante escalabilidade — a arquitetura de publicação e consumo assíncrono já descrita nesta introdução permite que o volume de Evento cresça sem que o produtor precise aguardar processamento síncrono de nenhum consumidor.

Este catálogo garante rastreabilidade — todo Evento carrega identificador e timestamp suficientes para reconstruir a sequência exata de fatos que produziu qualquer estado atual da plataforma.

Este catálogo garante auditoria — a existência de um registro permanente e imutável de todo Evento já publicado sustenta qualquer verificação de conformidade futura, sem depender de reconstrução manual de histórico.

Este catálogo garante reprocessamento — porque todo Evento é preservado e replayable, qualquer módulo pode reconstruir seu próprio Read Model do zero a partir do histórico completo, conforme já demonstrado individualmente em cada Hub desta série.

Estes sete objetivos, tomados em conjunto, definem o critério pelo qual qualquer proposta de mudança a este catálogo deve ser avaliada — uma mudança que melhora a padronização mas compromete a auditoria, por exemplo, não é uma mudança aceitável; toda evolução deste catálogo precisa preservar os sete objetivos simultaneamente, nunca otimizar um às custas dos demais.

---

## 3. Princípios

**Business Events Only.** Todo Evento catalogado representa um fato de negócio relevante, nunca um detalhe técnico interno de implementação de um módulo.

**Single Producer.** Todo Evento possui exatamente um produtor, sempre o proprietário do conceito de negócio envolvido, conforme já registrado em `DOMAIN_OWNERSHIP_MATRIX.md`.

**Multiple Consumers.** Um Evento pode ser consumido por zero, um ou múltiplos módulos simultaneamente, sem que o produtor precise conhecer quem o consome.

**Immutable Events.** Um Evento, uma vez publicado, nunca é alterado.

**Append Only.** Todo Evento é adicionado ao histórico, nunca inserido, substituído ou removido de uma posição intermediária já existente.

**Idempotent Processing.** Todo consumidor processa um mesmo Evento entregue mais de uma vez sem produzir efeito duplicado.

**Replay Safe.** Todo Evento pode ser reprocessado, do início ao fim de seu histórico, sem produzir resultado diferente do que produziria em sua primeira entrega.

**Versioned Events.** Todo Evento possui uma versão explícita de contrato, permitindo evolução controlada sem quebrar consumidor já existente.

**Backward Compatibility.** Uma nova versão de Evento preserva a capacidade de um consumidor antigo continuar processando o contrato anterior durante o período de transição.

**No Shared Ownership.** Nenhum Evento é publicado por mais de um módulo, mesmo quando dois módulos participam do mesmo processo de negócio mais amplo.

**Events Represent Facts.** Um Evento descreve algo que já aconteceu, nunca uma instrução ou uma intenção futura.

**Commands Are Not Events.** Um Command solicita uma mudança de estado; um Evento relata que essa mudança já ocorreu — os dois nunca são confundidos ou tratados de forma intercambiável.

**Consumers Never Redefine Contracts.** Um módulo consumidor nunca reinterpreta ou estende, por conta própria, o contrato de um Evento além do que seu produtor já publicou.

**Ordering When Required.** A ordenação de Evento é garantida apenas quando o domínio de negócio exige, nunca imposta uniformemente onde não é necessária.

**Eventually Consistent.** A propagação de Evento entre módulos tolera uma janela de latência, nunca exigindo consistência instantânea entre produtor e consumidor.

**Audit Friendly.** Todo Evento é preservado de forma que sustente auditoria de conformidade, mesmo anos após sua publicação original.

**Cross Reference.** Toda descrição de Evento neste catálogo referencia seu documento proprietário original, nunca redefine sua estrutura de forma paralela.

**Explicit Ownership.** Todo Evento tem seu produtor claramente identificado nesta matriz, sem ambiguidade.

**Event Replay.** Todo módulo é capaz de reconstruir seu próprio estado derivado a partir do histórico completo de Evento já consumido.

**Consumer Independence.** A adição de um novo consumidor a um Evento já existente nunca exige mudança no produtor.

---

## 4. Catálogo Oficial

Esta seção organiza o catálogo por módulo produtor. Cada Evento é descrito por oito atributos: Objetivo, Produtor, Consumidores, Momento de publicação, Payload conceitual, Idempotência, Replay e Versionamento. Quando a regra de Idempotência, de Replay ou de Versionamento de um Evento segue exatamente o padrão já geral do módulo, essa regra é indicada de forma resumida, evitando repetição desnecessária do mesmo texto para cada entrada — o padrão completo de cada categoria está descrito nos Capítulos 8 a 11.

### CRM Hub

Todo Evento desta seção é produzido exclusivamente pelo CRM Hub, conforme já registrado em `CRM_DOMAIN_BLUEPRINT.md` e em `DOMAIN_OWNERSHIP_MATRIX.md`.

**`CustomerCreated`** — Objetivo: registrar a criação de um novo Customer. Produtor: CRM Hub. Consumidores: Communication, Finance, Growth, Analytics. Momento: imediatamente após a persistência bem-sucedida do Customer. Payload conceitual: identificador do Customer, Organization associada, dado de contato mínimo. Idempotência: garantida por identificador único do Customer. Replay: seguro, reconstrói o Read Model de relacionamento de qualquer consumidor. Versionamento: v1, contrato estável.

**`CustomerUpdated`** — Objetivo: comunicar alteração de atributo relevante de um Customer já existente. Produtor: CRM Hub. Consumidores: Communication, Analytics. Momento: após confirmação da alteração. Payload conceitual: identificador do Customer, campos alterados. Idempotência: por identificador e timestamp de alteração. Replay: seguro. Versionamento: v1.

**`CustomerMerged`** — Objetivo: comunicar a unificação de dois registros duplicados de Customer. Produtor: CRM Hub. Consumidores: Communication, Finance, Growth, Analytics. Momento: após confirmação da fusão. Payload conceitual: identificador sobrevivente, identificador descontinuado. Idempotência: por par de identificadores. Replay: seguro, essencial para consumidores reconciliarem referência antiga. Versionamento: v1.

**`CustomerArchived`** — Objetivo: comunicar o encerramento formal de um relacionamento. Produtor: CRM Hub. Consumidores: Communication, Finance, Analytics. Momento: após confirmação do arquivamento. Payload conceitual: identificador do Customer, motivo de encerramento. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`LeadCreated`** — Objetivo: registrar a entrada de um novo Lead na plataforma. Produtor: CRM Hub. Consumidores: Growth, Analytics. Momento: imediatamente após a captura do Lead. Payload conceitual: identificador do Lead, Lead Source associada. Idempotência: por identificador do Lead. Replay: seguro. Versionamento: v1.

**`LeadQualified`** — Objetivo: comunicar que um Lead atingiu critério de qualificação comercial. Produtor: CRM Hub. Consumidores: Growth, Automation. Momento: após avaliação de qualificação concluída. Payload conceitual: identificador do Lead, critério atingido. Idempotência: por identificador e critério. Replay: seguro. Versionamento: v1.

**`LeadConverted`** — Objetivo: comunicar que um Lead se tornou um Customer. Produtor: CRM Hub. Consumidores: Growth, Finance, Analytics. Momento: após criação do Customer correspondente. Payload conceitual: identificador do Lead, identificador do Customer resultante. Idempotência: por identificador do Lead. Replay: seguro. Versionamento: v1.

**`RelationshipUpdated`** — Objetivo: comunicar mudança de Relationship Status de um Customer. Produtor: CRM Hub. Consumidores: Growth, Analytics. Momento: após confirmação da mudança de estágio. Payload conceitual: identificador do Customer, estágio anterior, estágio atual. Idempotência: por identificador e transição. Replay: seguro. Versionamento: v1.

**`OpportunityCreated`** — Objetivo: registrar uma nova negociação comercial em curso. Produtor: CRM Hub. Consumidores: Finance, Analytics. Momento: após persistência da Opportunity. Payload conceitual: identificador da Opportunity, Customer associado, valor estimado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`OpportunityWon`** — Objetivo: comunicar que uma negociação comercial foi ganha. Produtor: CRM Hub. Consumidores: Finance, Growth, Analytics. Momento: após confirmação formal do fechamento. Payload conceitual: identificador da Opportunity, valor confirmado, Customer associado. Idempotência: por identificador. Replay: seguro, aciona reconstrução de faturamento correspondente no Finance Hub. Versionamento: v1.

### Communication Hub

Todo Evento desta seção é produzido exclusivamente pelo Communication Hub, conforme já registrado em `COMMUNICATION_DOMAIN_BLUEPRINT.md`.

**`ConversationStarted`** — Objetivo: registrar o início de uma nova Conversation. Produtor: Communication Hub. Consumidores: CRM, Analytics. Momento: na primeira Message trocada. Payload conceitual: identificador da Conversation, Channel de origem, Customer associado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`ConversationClosed`** — Objetivo: comunicar o encerramento formal de uma Conversation. Produtor: Communication Hub. Consumidores: CRM, Analytics. Momento: após confirmação de encerramento. Payload conceitual: identificador da Conversation, motivo de encerramento. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`MessageSent`** — Objetivo: registrar o envio de uma Message. Produtor: Communication Hub. Consumidores: Analytics, Automation. Momento: imediatamente após o envio ser iniciado. Payload conceitual: identificador da Message, Conversation associada, Channel. Idempotência: por identificador da Message. Replay: seguro. Versionamento: v1.

**`MessageDelivered`** — Objetivo: confirmar a entrega técnica de uma Message. Produtor: Communication Hub. Consumidores: Growth, Analytics. Momento: após confirmação recebida do Integration Hub. Payload conceitual: identificador da Message, timestamp de entrega. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`MessageRead`** — Objetivo: registrar a confirmação de leitura de uma Message. Produtor: Communication Hub. Consumidores: Growth, Analytics. Momento: após recebimento do Read Receipt. Payload conceitual: identificador da Message, timestamp de leitura. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`NotificationSent`** — Objetivo: registrar o disparo de uma Notification. Produtor: Communication Hub. Consumidores: Automation, Analytics. Momento: no momento do disparo. Payload conceitual: identificador da Notification, destinatário, Template usado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`NotificationDelivered`** — Objetivo: confirmar a entrega de uma Notification. Produtor: Communication Hub. Consumidores: Analytics. Momento: após confirmação técnica de entrega. Payload conceitual: identificador da Notification, timestamp. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`TemplatePublished`** — Objetivo: comunicar a disponibilização de um novo Message Template. Produtor: Communication Hub. Consumidores: Automation, Growth. Momento: após aprovação e publicação do Template. Payload conceitual: identificador do Template, Channel aplicável. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

### Finance Hub

Os dezenove Eventos desta seção já foram catalogados integralmente em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 10. Este catálogo apenas resume seu contrato de publicação; a definição completa permanece exclusivamente naquele documento.

**`InvoiceCreated`** — Objetivo: registrar a criação de uma Invoice. Produtor: Finance Hub. Consumidores: CRM, Analytics. Momento: após persistência da Invoice. Payload conceitual: identificador, Financial Account associada, valor. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`InvoiceUpdated`** — Objetivo: comunicar alteração de uma Invoice ainda não paga. Produtor: Finance Hub. Consumidores: Analytics. Momento: após confirmação da alteração. Payload conceitual: identificador, campos alterados. Idempotência: por identificador e timestamp. Replay: seguro. Versionamento: v1.

**`InvoicePaid`** — Objetivo: comunicar a quitação integral de uma Invoice. Produtor: Finance Hub. Consumidores: CRM, Growth, Analytics. Momento: após confirmação de Payment associado. Payload conceitual: identificador da Invoice, valor pago, Payment associado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`InvoiceCancelled`** — Objetivo: comunicar o cancelamento de uma Invoice. Produtor: Finance Hub. Consumidores: Analytics. Momento: após confirmação do cancelamento. Payload conceitual: identificador, motivo. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`PaymentAuthorized`** — Objetivo: comunicar a autorização de um Payment junto ao Provider. Produtor: Finance Hub. Consumidores: Analytics. Momento: após confirmação de autorização via Integration Hub. Payload conceitual: identificador do Payment, valor autorizado. Idempotência: por identificador do Payment Intent. Replay: seguro. Versionamento: v1.

**`PaymentCaptured`** — Objetivo: comunicar a captura efetiva de um Payment. Produtor: Finance Hub. Consumidores: CRM, Growth, Analytics. Momento: após confirmação de captura. Payload conceitual: identificador, valor capturado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`PaymentFailed`** — Objetivo: registrar a falha de um Payment Attempt. Produtor: Finance Hub. Consumidores: Automation, Analytics. Momento: após confirmação de recusa do Provider. Payload conceitual: identificador, motivo da falha. Idempotência: por identificador da tentativa. Replay: seguro. Versionamento: v1.

**`RefundIssued`** — Objetivo: comunicar a devolução de valor já pago. Produtor: Finance Hub. Consumidores: CRM, Analytics. Momento: após confirmação do Refund. Payload conceitual: identificador, Payment original referenciado, valor. Idempotência: por identificador do Refund. Replay: seguro. Versionamento: v1.

**`SubscriptionCreated`** — Objetivo: registrar novo acordo de cobrança recorrente. Produtor: Finance Hub. Consumidores: Growth, Analytics. Momento: após confirmação da Subscription. Payload conceitual: identificador, periodicidade, valor. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`SubscriptionRenewed`** — Objetivo: comunicar a renovação de uma Subscription para novo ciclo. Produtor: Finance Hub. Consumidores: Analytics. Momento: após confirmação da renovação. Payload conceitual: identificador, novo ciclo. Idempotência: por identificador e ciclo. Replay: seguro. Versionamento: v1.

**`RecurringBillingExecuted`** — Objetivo: comunicar a execução de uma cobrança recorrente. Produtor: Finance Hub. Consumidores: Analytics. Momento: após geração da Invoice correspondente. Payload conceitual: identificador da Subscription, Invoice gerada. Idempotência: por identificador de ciclo. Replay: seguro. Versionamento: v1.

**`SettlementCompleted`** — Objetivo: comunicar a conclusão de um processo de liquidação. Produtor: Finance Hub. Consumidores: Analytics. Momento: após confirmação do repasse. Payload conceitual: identificador do Settlement, Payment consolidados. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`ReconciliationCompleted`** — Objetivo: comunicar a conclusão de um processo de conciliação. Produtor: Finance Hub. Consumidores: Analytics. Momento: após finalização da comparação. Payload conceitual: identificador, divergência identificada quando houver. Idempotência: por identificador do processo. Replay: seguro. Versionamento: v1.

**`LedgerEntryCreated`** — Objetivo: registrar novo lançamento contábil imutável. Produtor: Finance Hub. Consumidores: Analytics. Momento: imediatamente após a gravação. Payload conceitual: identificador, Financial Account, valor, natureza. Idempotência: por identificador único do lançamento. Replay: seguro, base de toda reconstrução de Balance. Versionamento: v1.

**`WalletUpdated`** — Objetivo: comunicar alteração de saldo de uma Wallet. Produtor: Finance Hub. Consumidores: Analytics. Momento: após novo Ledger Entry associado. Payload conceitual: identificador da Wallet, novo saldo. Idempotência: por identificador e Ledger Entry associado. Replay: seguro. Versionamento: v1.

**`BalanceUpdated`** — Objetivo: comunicar o recálculo de um Balance. Produtor: Finance Hub. Consumidores: Analytics. Momento: após novo Ledger Entry relevante. Payload conceitual: identificador da Financial Account, novo valor. Idempotência: por identificador e Ledger Entry de origem. Replay: seguro. Versionamento: v1.

**`DiscountApplied`** — Objetivo: comunicar aplicação de redução a uma Invoice. Produtor: Finance Hub. Consumidores: Growth, Analytics. Momento: após confirmação da aplicação. Payload conceitual: identificador da Invoice, valor de desconto. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`FinancialAdjustmentApplied`** — Objetivo: comunicar uma correção manual de estado financeiro. Produtor: Finance Hub. Consumidores: Analytics. Momento: após confirmação do ajuste. Payload conceitual: identificador, Ledger Entry produzido. Idempotência: por identificador do ajuste. Replay: seguro. Versionamento: v1.

**`CurrencyUpdated`** — Objetivo: comunicar atualização de registro de moeda associada a uma transação. Produtor: Finance Hub. Consumidores: Analytics. Momento: após confirmação da atualização. Payload conceitual: identificador da transação, moeda. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

### Growth Hub

Os dezessete Eventos desta seção já foram catalogados integralmente em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 10.

**`CampaignCreated`** — Objetivo: registrar nova Campaign. Produtor: Growth Hub. Consumidores: Finance, Analytics. Momento: após persistência da Campaign. Payload conceitual: identificador, Campaign Goal, Audience associada. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`CampaignStarted`** — Objetivo: comunicar o início de execução de uma Campaign. Produtor: Growth Hub. Consumidores: Automation, Analytics. Momento: após confirmação de início. Payload conceitual: identificador, timestamp de início. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`CampaignFinished`** — Objetivo: comunicar o encerramento de uma Campaign. Produtor: Growth Hub. Consumidores: Analytics. Momento: após confirmação de encerramento. Payload conceitual: identificador, resultado consolidado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`AudienceBuilt`** — Objetivo: comunicar a conclusão da construção de uma Audience. Produtor: Growth Hub. Consumidores: Communication. Momento: após consolidação da Audience. Payload conceitual: identificador, critérios aplicados. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`SegmentUpdated`** — Objetivo: comunicar recálculo de um Audience Segment. Produtor: Growth Hub. Consumidores: Analytics. Momento: após recomposição do Segment. Payload conceitual: identificador, critério de segmentação. Idempotência: por identificador e timestamp. Replay: seguro. Versionamento: v1.

**`JourneyStarted`** — Objetivo: registrar o início da passagem de um Cliente por uma Journey. Produtor: Growth Hub. Consumidores: Automation, Analytics. Momento: no primeiro Touchpoint. Payload conceitual: identificador da Journey, Cliente associado. Idempotência: por identificador e Cliente. Replay: seguro. Versionamento: v1.

**`JourneyCompleted`** — Objetivo: comunicar a conclusão de todos os Touchpoint de uma Journey. Produtor: Growth Hub. Consumidores: Analytics. Momento: após o último Touchpoint. Payload conceitual: identificador, Cliente associado. Idempotência: por identificador e Cliente. Replay: seguro. Versionamento: v1.

**`ExperimentStarted`** — Objetivo: comunicar o início de exposição de Variant de um Experiment. Produtor: Growth Hub. Consumidores: Analytics. Momento: após início da exposição controlada. Payload conceitual: identificador, Conversion Goal associado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`ExperimentFinished`** — Objetivo: comunicar o encerramento de um Experiment. Produtor: Growth Hub. Consumidores: Analytics. Momento: após consolidação do resultado. Payload conceitual: identificador, Variant vencedora. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`VariantSelected`** — Objetivo: comunicar qual Variant obteve melhor desempenho. Produtor: Growth Hub. Consumidores: Analytics. Momento: na Winner Selection. Payload conceitual: identificador do Experiment, Variant selecionada. Idempotência: por identificador do Experiment. Replay: seguro. Versionamento: v1.

**`ConversionRegistered`** — Objetivo: registrar que um Conversion Goal foi atingido. Produtor: Growth Hub. Consumidores: CRM, Finance, Analytics. Momento: no momento da conversão observada. Payload conceitual: identificador, Campaign ou Experiment de origem, Attribution calculada. Idempotência: por identificador do Conversion Event. Replay: seguro. Versionamento: v1.

**`ReferralCreated`** — Objetivo: registrar nova indicação dentro de um Referral Program. Produtor: Growth Hub. Consumidores: Analytics. Momento: no registro da indicação. Payload conceitual: identificador, Referral Program associado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`ReferralConverted`** — Objetivo: comunicar que um Referral resultou em novo Cliente. Produtor: Growth Hub. Consumidores: CRM, Analytics. Momento: após confirmação da conversão. Payload conceitual: identificador do Referral. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`RetentionImproved`** — Objetivo: comunicar melhora sustentada de Engagement Score. Produtor: Growth Hub. Consumidores: Analytics. Momento: após confirmação da melhora sustentada. Payload conceitual: Cliente ou Cohort, novo Engagement Score. Idempotência: por identificador e período. Replay: seguro. Versionamento: v1.

**`ExpansionAchieved`** — Objetivo: comunicar que um Cliente ampliou sua relação comercial. Produtor: Growth Hub. Consumidores: CRM, Finance, Analytics. Momento: após confirmação da expansão. Payload conceitual: Cliente, Growth Opportunity capturada. Idempotência: por identificador da Opportunity de expansão. Replay: seguro. Versionamento: v1.

**`GrowthInsightGenerated`** — Objetivo: comunicar novo Growth Insight identificado. Produtor: Growth Hub. Consumidores: Analytics. Momento: após identificação do padrão. Payload conceitual: identificador do Insight, Growth Metric associada. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`GrowthRecommendationGenerated`** — Objetivo: comunicar nova Growth Recommendation formulada. Produtor: Growth Hub. Consumidores: Automation. Momento: após formulação da sugestão. Payload conceitual: identificador, Growth Insight de origem. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

### Analytics Hub

Os catorze Eventos desta seção já foram catalogados integralmente em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 10.

**`DashboardCreated`** — Objetivo: registrar novo Dashboard. Produtor: Analytics Hub. Consumidores: nenhum consumidor de negócio necessário; interno ao próprio Hub. Momento: após persistência. Payload conceitual: identificador, composição inicial de Widget. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`DashboardUpdated`** — Objetivo: comunicar alteração de composição de um Dashboard. Produtor: Analytics Hub. Consumidores: — . Momento: após confirmação. Payload conceitual: identificador, Widget alterado. Idempotência: por identificador e timestamp. Replay: seguro. Versionamento: v1.

**`ReportGenerated`** — Objetivo: comunicar a geração de um Report. Produtor: Analytics Hub. Consumidores: Branding. Momento: após conclusão da geração. Payload conceitual: identificador, Report Template usado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`MetricCalculated`** — Objetivo: comunicar o recálculo de uma Metric. Produtor: Analytics Hub. Consumidores: — . Momento: após atualização do Dataset correspondente. Payload conceitual: identificador da Metric, valor, janela temporal. Idempotência: por identificador e janela. Replay: seguro. Versionamento: v1.

**`KPIUpdated`** — Objetivo: comunicar o recálculo de um KPI. Produtor: Analytics Hub. Consumidores: Automation. Momento: após recálculo das Metric associadas. Payload conceitual: identificador do KPI, novo valor. Idempotência: por identificador e janela. Replay: seguro. Versionamento: v1.

**`TrendIdentified`** — Objetivo: comunicar identificação de novo Trend. Produtor: Analytics Hub. Consumidores: — . Momento: após análise de Time Series. Payload conceitual: identificador, direção do Trend. Idempotência: por identificador e janela. Replay: seguro. Versionamento: v1.

**`ForecastGenerated`** — Objetivo: comunicar nova projeção de Forecast. Produtor: Analytics Hub. Consumidores: Automation. Momento: após projeção a partir de Trend identificado. Payload conceitual: identificador, valor projetado, incerteza. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`InsightGenerated`** — Objetivo: comunicar novo Insight consolidado. Produtor: Analytics Hub. Consumidores: Automation, AI. Momento: após análise consolidada de Dataset. Payload conceitual: identificador, dado de sustentação. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`BenchmarkUpdated`** — Objetivo: comunicar atualização de referência comparativa. Produtor: Analytics Hub. Consumidores: — . Momento: após nova versão do Benchmark. Payload conceitual: identificador, novo valor, versão anterior preservada. Idempotência: por identificador e versão. Replay: seguro. Versionamento: v1.

**`SnapshotCreated`** — Objetivo: registrar novo Snapshot imutável. Produtor: Analytics Hub. Consumidores: — . Momento: no instante de captura do indicador. Payload conceitual: identificador, valor, timestamp. Idempotência: por identificador único do Snapshot. Replay: seguro, base de toda Time Series. Versionamento: v1.

**`DatasetRefreshed`** — Objetivo: comunicar atualização de um Dataset a partir de novo Evento consumido. Produtor: Analytics Hub. Consumidores: — . Momento: após consolidação do novo Evento. Payload conceitual: identificador do Dataset, origem do Evento consumido. Idempotência: por identificador e Evento de origem. Replay: seguro. Versionamento: v1.

**`VisualizationPublished`** — Objetivo: comunicar disponibilização de nova Visualization. Produtor: Analytics Hub. Consumidores: — . Momento: após publicação. Payload conceitual: identificador, Metric ou KPI representado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`RecommendationGenerated`** — Objetivo: comunicar nova Analytical Recommendation. Produtor: Analytics Hub. Consumidores: Automation. Momento: após formulação a partir de Insight. Payload conceitual: identificador, Insight de origem. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`ScorecardUpdated`** — Objetivo: comunicar recálculo de um Scorecard. Produtor: Analytics Hub. Consumidores: — . Momento: após atualização dos indicadores componentes. Payload conceitual: identificador, indicadores associados. Idempotência: por identificador e janela. Replay: seguro. Versionamento: v1.

### Automation Engine

**`WorkflowStarted`** — Objetivo: comunicar o início de execução de um Workflow. Produtor: Automation Engine. Consumidores: Analytics. Momento: após ativação do Trigger correspondente. Payload conceitual: identificador do Workflow, Trigger de origem. Idempotência: por identificador de execução. Replay: seguro. Versionamento: v1.

**`WorkflowPaused`** — Objetivo: comunicar a suspensão temporária de um Workflow. Produtor: Automation Engine. Consumidores: Analytics. Momento: após condição de pausa atingida. Payload conceitual: identificador, motivo da pausa. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`WorkflowCompleted`** — Objetivo: comunicar a conclusão de um Workflow. Produtor: Automation Engine. Consumidores: Analytics. Momento: após execução da última Action. Payload conceitual: identificador, resultado consolidado. Idempotência: por identificador de execução. Replay: seguro. Versionamento: v1.

**`TriggerActivated`** — Objetivo: comunicar a ativação de uma condição de disparo. Produtor: Automation Engine. Consumidores: — . Momento: no instante da avaliação positiva da condição. Payload conceitual: identificador do Trigger, Evento de origem. Idempotência: por identificador e Evento de origem. Replay: seguro. Versionamento: v1.

**`ActionExecuted`** — Objetivo: registrar a execução de uma Action específica. Produtor: Automation Engine. Consumidores: Analytics. Momento: após conclusão da Action. Payload conceitual: identificador, Hub de destino invocado. Idempotência: por identificador de execução. Replay: seguro. Versionamento: v1.

**`RuleEvaluated`** — Objetivo: registrar a avaliação de uma Regra condicional dentro de um Workflow. Produtor: Automation Engine. Consumidores: Analytics. Momento: no momento da avaliação. Payload conceitual: identificador da Regra, resultado da avaliação. Idempotência: por identificador e contexto de avaliação. Replay: seguro. Versionamento: v1.

### AI Hub

**`RecommendationProduced`** — Objetivo: comunicar sugestão gerada por inteligência automatizada, sujeita a confirmação humana. Produtor: AI Hub. Consumidores: Growth, Analytics, Automation. Momento: após inferência concluída. Payload conceitual: identificador, contexto de origem, nível de confiança. Idempotência: por identificador da inferência. Replay: seguro. Versionamento: v1.

**`PredictionProduced`** — Objetivo: comunicar projeção gerada por modelo de inferência. Produtor: AI Hub. Consumidores: Analytics. Momento: após conclusão do modelo. Payload conceitual: identificador, valor projetado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`ClassificationCompleted`** — Objetivo: comunicar conclusão de uma classificação automatizada. Produtor: AI Hub. Consumidores: CRM, Growth. Momento: após conclusão da inferência. Payload conceitual: identificador, categoria atribuída. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`SummarizationCompleted`** — Objetivo: comunicar conclusão de uma sumarização automatizada de conteúdo. Produtor: AI Hub. Consumidores: Knowledge, Communication. Momento: após conclusão do processamento. Payload conceitual: identificador, conteúdo de origem referenciado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`AIAnalysisCompleted`** — Objetivo: comunicar conclusão geral de uma análise assistida por IA. Produtor: AI Hub. Consumidores: Analytics. Momento: após conclusão do processamento solicitado. Payload conceitual: identificador, tipo de análise, resultado. Idempotência: por identificador da análise. Replay: seguro. Versionamento: v1.

### Knowledge Hub

**`KnowledgeCreated`** — Objetivo: registrar novo Document indexado na Knowledge Base. Produtor: Knowledge Hub. Consumidores: AI. Momento: após indexação inicial. Payload conceitual: identificador, tipo de conteúdo. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`KnowledgeUpdated`** — Objetivo: comunicar atualização de um Document já indexado. Produtor: Knowledge Hub. Consumidores: AI. Momento: após reindexação. Payload conceitual: identificador, versão anterior referenciada. Idempotência: por identificador e versão. Replay: seguro. Versionamento: v1.

**`KnowledgeIndexed`** — Objetivo: comunicar conclusão de indexação semântica de um Document. Produtor: Knowledge Hub. Consumidores: AI. Momento: após geração de Embedding. Payload conceitual: identificador, Retrieval Index associado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`KnowledgeArchived`** — Objetivo: comunicar arquivamento de um Document. Produtor: Knowledge Hub. Consumidores: AI. Momento: após confirmação do arquivamento. Payload conceitual: identificador, motivo. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`SemanticIndexUpdated`** — Objetivo: comunicar atualização geral do Retrieval Index. Produtor: Knowledge Hub. Consumidores: AI. Momento: após reprocessamento do índice. Payload conceitual: identificador do índice, volume de Document afetado. Idempotência: por identificador e versão do índice. Replay: seguro. Versionamento: v1.

### Identity Hub

**`UserCreated`** — Objetivo: registrar novo Usuário na plataforma. Produtor: Identity Hub. Consumidores: Todos. Momento: após confirmação de cadastro. Payload conceitual: identificador, Tenant associado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`RoleAssigned`** — Objetivo: comunicar atribuição de Role a um Usuário. Produtor: Identity Hub. Consumidores: Todos. Momento: após confirmação da atribuição. Payload conceitual: identificador do Usuário, Role atribuída. Idempotência: por identificador e Role. Replay: seguro. Versionamento: v1.

**`PermissionGranted`** — Objetivo: comunicar concessão de Permission específica. Produtor: Identity Hub. Consumidores: Todos. Momento: após confirmação. Payload conceitual: identificador do Usuário, Permission concedida. Idempotência: por identificador e Permission. Replay: seguro. Versionamento: v1.

**`TenantCreated`** — Objetivo: registrar novo Tenant na plataforma. Produtor: Identity Hub. Consumidores: Todos. Momento: após provisionamento inicial. Payload conceitual: identificador do Tenant, configuração inicial. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`SessionStarted`** — Objetivo: registrar início de uma Session autenticada. Produtor: Identity Hub. Consumidores: — . Momento: após autenticação bem-sucedida. Payload conceitual: identificador da Session, Usuário associado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`AuthenticationSucceeded`** — Objetivo: registrar autenticação bem-sucedida. Produtor: Identity Hub. Consumidores: — . Momento: no instante da confirmação. Payload conceitual: identificador do Usuário, método de autenticação. Idempotência: por identificador da tentativa. Replay: seguro. Versionamento: v1.

**`AuthenticationFailed`** — Objetivo: registrar tentativa de autenticação recusada. Produtor: Identity Hub. Consumidores: — . Momento: no instante da recusa. Payload conceitual: identificador da tentativa, motivo. Idempotência: por identificador da tentativa. Replay: seguro. Versionamento: v1.

### Integration Hub

**`ConnectorCreated`** — Objetivo: registrar novo Connector configurado. Produtor: Integration Hub. Consumidores: — . Momento: após configuração inicial. Payload conceitual: identificador, Provider associado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`WebhookDelivered`** — Objetivo: comunicar recebimento e processamento de um Webhook externo. Produtor: Integration Hub. Consumidores: Finance, Growth, Communication. Momento: após validação e processamento do Webhook. Payload conceitual: identificador, Provider de origem, tipo de notificação. Idempotência: por identificador único do Webhook. Replay: seguro. Versionamento: v1.

**`ImportCompleted`** — Objetivo: comunicar conclusão de uma importação de dado externo. Produtor: Integration Hub. Consumidores: CRM, Finance. Momento: após conclusão do processamento. Payload conceitual: identificador, volume importado. Idempotência: por identificador da execução. Replay: seguro. Versionamento: v1.

**`ExportCompleted`** — Objetivo: comunicar conclusão de uma exportação de dado para sistema externo. Produtor: Integration Hub. Consumidores: Analytics. Momento: após confirmação de entrega externa. Payload conceitual: identificador, destino externo. Idempotência: por identificador da execução. Replay: seguro. Versionamento: v1.

**`SynchronizationCompleted`** — Objetivo: comunicar conclusão de sincronização bidirecional com sistema externo. Produtor: Integration Hub. Consumidores: CRM. Momento: após confirmação de ambos os lados sincronizados. Payload conceitual: identificador, Connector envolvido. Idempotência: por identificador da execução. Replay: seguro. Versionamento: v1.

**`APIRegistered`** — Objetivo: comunicar o registro de uma nova integração de API externa. Produtor: Integration Hub. Consumidores: — . Momento: após validação da configuração. Payload conceitual: identificador, Provider associado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

### Branding Hub

**`ThemeUpdated`** — Objetivo: comunicar atualização de um Brand Theme. Produtor: Branding Hub. Consumidores: Analytics, Finance. Momento: após confirmação da atualização. Payload conceitual: identificador do Theme, Empresa associada. Idempotência: por identificador e versão. Replay: seguro. Versionamento: v1.

**`BrandAssetChanged`** — Objetivo: comunicar alteração de um Brand Asset. Produtor: Branding Hub. Consumidores: Analytics, Finance. Momento: após confirmação da alteração. Payload conceitual: identificador do Asset, tipo. Idempotência: por identificador e versão. Replay: seguro. Versionamento: v1.

**`BrandPaletteUpdated`** — Objetivo: comunicar atualização da paleta visual de uma Empresa. Produtor: Branding Hub. Consumidores: Analytics. Momento: após confirmação. Payload conceitual: identificador da paleta, cores associadas. Idempotência: por identificador e versão. Replay: seguro. Versionamento: v1.

### Business Profile Engine

**`BusinessProfileCreated`** — Objetivo: registrar novo Business Profile de uma Empresa cliente. Produtor: Business Profile Engine. Consumidores: Todos. Momento: após conclusão da classificação inicial. Payload conceitual: identificador, Segmento, Maturidade. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`BusinessAdaptationCompleted`** — Objetivo: comunicar conclusão de um ciclo de adaptação de configuração da plataforma. Produtor: Business Profile Engine. Consumidores: Todos. Momento: após aplicação da nova configuração. Payload conceitual: identificador, mudanças aplicadas. Idempotência: por identificador do ciclo. Replay: seguro. Versionamento: v1.

**`CapabilityEnabled`** — Objetivo: comunicar habilitação de uma capacidade específica para uma Empresa. Produtor: Business Profile Engine. Consumidores: Todos. Momento: após confirmação da habilitação. Payload conceitual: identificador da capacidade, Empresa associada. Idempotência: por identificador e Empresa. Replay: seguro. Versionamento: v1.

**`CapabilityDisabled`** — Objetivo: comunicar desabilitação de uma capacidade específica. Produtor: Business Profile Engine. Consumidores: Todos. Momento: após confirmação da desabilitação. Payload conceitual: identificador da capacidade, Empresa associada. Idempotência: por identificador e Empresa. Replay: seguro. Versionamento: v1.

---

## 5. Classificação dos Eventos

Business Events são todo Evento que representa um fato de negócio reconhecível por um especialista do domínio — `InvoicePaid`, `OpportunityWon`, `CampaignFinished` — a categoria dominante deste catálogo, publicada pelos cinco Business Hubs.

Integration Events são todo Evento que comunica o resultado de uma comunicação técnica com sistema externo — `WebhookDelivered`, `ImportCompleted`, `SynchronizationCompleted` — publicados exclusivamente pelo Integration Hub.

Analytical Events são todo Evento que comunica a produção de indicador, tendência ou projeção consolidada — `MetricCalculated`, `TrendIdentified`, `ForecastGenerated` — publicados exclusivamente pelo Analytics Hub.

AI Events são todo Evento que comunica o resultado de uma inferência automatizada — `RecommendationProduced`, `PredictionProduced`, `ClassificationCompleted` — publicados exclusivamente pelo AI Hub, sempre sujeitos a Human Oversight antes de qualquer ação de negócio decorrente.

Lifecycle Events são todo Evento que comunica transição de estágio de vida de uma Entidade — `CustomerArchived`, `SubscriptionRenewed`, `CampaignFinished` — presentes em praticamente todo módulo produtor.

Security Events são todo Evento relativo a autenticação, autorização ou acesso — `AuthenticationSucceeded`, `AuthenticationFailed`, `PermissionGranted` — publicados exclusivamente pelo Identity Hub.

Platform Events são todo Evento de escopo estrutural da própria plataforma, não de um domínio de negócio específico — `TenantCreated`, `BusinessProfileCreated`, `CapabilityEnabled` — publicados pelo Identity Hub e pelo Business Profile Engine.

```
                    CLASSIFICAÇÃO DOS EVENTOS
   ┌───────────────────────────────────────────────────────────┐
   │  Business Events:     CRM · Communication · Finance · Growth   │
   │  Integration Events:  Integration Hub                             │
   │  Analytical Events:   Analytics Hub                                  │
   │  AI Events:           AI Hub                                            │
   │  Lifecycle Events:    presentes em praticamente todo módulo                │
   │  Security Events:     Identity Hub                                            │
   │  Platform Events:     Identity Hub · Business Profile Engine                     │
   └───────────────────────────────────────────────────────────┘
```

---

## 6. Fluxo Oficial de Eventos

```
   CRM
      │
      ▼
   CustomerCreated
      │
      ▼
   Analytics
      │
      ▼
   InsightGenerated
      │
      ▼
   Automation
      │
      ▼
   WorkflowStarted
```

Este fluxo demonstra o caminho oficial pelo qual um fato originado no CRM Hub se propaga até uma execução automatizada, sem que nenhum módulo intermediário jamais escreva diretamente sobre o CRM Hub — cada seta representa consumo de Evento, nunca chamada direta.

```
   Finance
      │
      ▼
   InvoicePaid
      │
      ▼
   Growth
      │
      ▼
   ConversionRegistered
      │
      ▼
   Analytics
      │
      ▼
   KPIUpdated
```

Este segundo fluxo demonstra como um fato financeiro alimenta a medição de crescimento e, em seguida, o indicador consolidado — o Finance Hub nunca sabe que o Growth Hub ou o Analytics Hub existem; ele apenas publica `InvoicePaid`, e cada consumidor decide, de forma inteiramente autônoma, o que fazer com esse fato, sem qualquer coordenação prévia exigida do produtor.

```
   Growth
      │
      ▼
   ReferralConverted
      │
      ▼
   CRM
      │
      ▼
   CustomerCreated
      │
      ▼
   Communication
      │
      ▼
   ConversationStarted
```

Este terceiro fluxo demonstra a cadeia de indicação — o Growth Hub publica a conversão de um Referral; o CRM Hub consome esse fato e cria o Customer correspondente; e o Communication Hub, ao identificar necessidade de contato com esse novo Customer, inicia uma nova Conversation.

```
   Identity
      │
      ▼
   TenantCreated
      │
      ▼
   Todos os Business Hubs
      │
      ▼
   provisionamento inicial de configuração por Tenant
```

Este quarto fluxo demonstra um Evento de escopo estrutural — a criação de um novo Tenant é consumida simultaneamente por todos os cinco Business Hubs, cada um inicializando sua própria estrutura de dado isolada para aquele Tenant, sem que nenhum deles dependa de ordem específica de inicialização entre si ou de confirmação prévia de qualquer outro módulo consumidor.

---

## 7. Regras de Publicação

Somente o Owner publica — todo Evento é publicado exclusivamente pelo módulo já registrado como seu produtor em `DOMAIN_OWNERSHIP_MATRIX.md`.

Eventos são imutáveis — nenhum Evento já publicado é alterado após sua publicação.

Nunca editar Evento — mesmo uma correção de dado incorreto é comunicada através de um novo Evento, nunca por edição do original.

Nunca deletar Evento — um Evento já publicado permanece indefinidamente, sujeito apenas à política de retenção configurada.

Eventos representam fatos ocorridos — nenhum Evento é publicado antes de sua causa ser efetivamente confirmada.

Commands nunca substituem Eventos — um Command solicita mudança; um Evento relata que ela já ocorreu.

Replay é sempre permitido — todo consumidor pode reconstruir seu Read Model a partir do histórico completo de Evento já publicado.

Versionamento é obrigatório — todo Evento carrega uma versão de contrato explícita.

Todo Evento carrega identificador único — nenhum Evento é publicado sem um identificador que permita deduplicação e correlação.

Todo Evento carrega timestamp de ocorrência — o momento exato do fato de negócio, não apenas o momento técnico de publicação.

Todo Evento referencia seu Aggregate de origem — o identificador da Entidade cujo estado o Evento descreve.

Nenhum Evento carrega dado sensível além do estritamente necessário ao propósito de negócio do consumo — aplicação do princípio de minimização já estabelecido em `SAAS_ARCHITECTURE.md`.

Todo Evento é publicado de forma assíncrona — o produtor nunca aguarda confirmação de processamento de nenhum consumidor antes de considerar sua própria operação concluída.

Nenhum consumidor bloqueia a publicação de um Evento — a indisponibilidade momentânea de um consumidor nunca impede o produtor de publicar.

Todo Evento é entregue ao menos uma vez — a garantia mínima de entrega do Event Bus já descrito em `SYSTEM_BLUEPRINT.md`, tornando idempotência de consumo obrigatória em todo consumidor.

Nenhum Evento é publicado em nome de outro módulo — mesmo quando dois módulos colaboram no mesmo processo de negócio mais amplo, cada um publica apenas seu próprio Evento.

Toda mudança de contrato de Evento é versionada, nunca aplicada retroativamente sobre eventos já publicados na versão anterior.

Todo novo Evento, ao ser introduzido, é registrado neste catálogo antes de sua primeira publicação em produção.

Nenhum Evento é publicado sem um propósito de negócio claramente identificável — eventos puramente técnicos de infraestrutura não pertencem a este catálogo.

Toda descontinuação de um Evento é registrada formalmente neste catálogo, nunca removida silenciosamente.

Todo Evento preserva compatibilidade retroativa mínima durante um período de transição, conforme detalhado no Capítulo 8.

---

## 8. Versionamento

Compatibilidade é preservada sempre que uma nova versão de um Evento adiciona um campo opcional, nunca quando remove ou altera o significado de um campo já existente na versão anterior.

Evolução de um Evento segue o mesmo princípio de extensão aditiva já aplicado à evolução de Entidade em cada Blueprint desta série — um novo atributo pode ser adicionado ao payload conceitual sem exigir nova versão, desde que consumidores existentes possam ignorá-lo com segurança.

Deprecated é o estado formal de uma versão de Evento que ainda é publicada, mas cuja substituição já foi anunciada e cujo prazo de descontinuação já está definido — nenhum consumidor novo é construído contra uma versão já marcada como Deprecated.

Breaking Changes — mudança que remove um campo, altera seu tipo, ou modifica o significado de um campo existente — exigem sempre uma nova versão de Evento, publicada em paralelo à versão anterior durante todo o período de transição, nunca substituindo-a instantaneamente.

Migração de um consumidor de uma versão antiga para uma nova é sempre responsabilidade do próprio consumidor, nunca do produtor — o produtor apenas garante que ambas as versões permaneçam disponíveis durante a janela de transição já acordada.

```
                    CICLO DE VIDA DE UMA VERSÃO DE EVENTO
   ┌───────────────────────────────────────────────────────────┐
   │  v1 publicado ──► consumidores existentes migram ──►            │
   │  v2 publicado em paralelo ──► v1 marcado como Deprecated ──►         │
   │  janela de transição decorrida ──► v1 descontinuado formalmente          │
   └───────────────────────────────────────────────────────────┘
```

---

## 9. Replay

Replay é a capacidade de reprocessar o histórico completo de Evento já publicado, do início ao fim, reconstruindo qualquer Read Model derivado sem depender de nenhum estado intermediário previamente calculado.

Snapshots, quando mantidos por um consumidor — como o Snapshot Manager já descrito em `ANALYTICS_HUB.md` —, aceleram esse processo ao fornecer um ponto de partida já consolidado, sem exigir reprocessamento desde o primeiro Evento já publicado; ainda assim, o histórico completo permanece disponível para reconstrução total quando necessário.

Checkpoint é o registro do último Evento já processado com sucesso por um consumidor, permitindo que uma interrupção de processamento seja retomada exatamente de onde parou, sem reprocessamento desnecessário nem perda de Evento.

Recovery é o processo de retomada de consumo após uma falha de infraestrutura, sempre a partir do último Checkpoint confirmado, nunca do início absoluto do histórico, salvo quando um Replay total é explicitamente solicitado.

Rebuild é a reconstrução completa e deliberada de um Read Model a partir do zero, tipicamente usada após correção de um defeito de processamento ou após mudança na lógica de Aggregation de um consumidor.

Reconciliation, neste contexto de Replay, é a verificação periódica de que o Read Model de um consumidor permanece consistente com o histórico completo de Evento já publicado, identificando qualquer divergência antes que ela se torne uma fonte de erro operacional silencioso.

Uma distinção importante separa Replay de Reprocessamento acidental: Replay é sempre uma operação deliberada, iniciada intencionalmente por um Engenheiro ou por um processo de manutenção programado, nunca um efeito colateral inesperado de uma falha de infraestrutura. Um consumidor que reprocessa Evento de forma não intencional, por exemplo devido a um bug em sua lógica de Checkpoint, não está exercendo Replay — está produzindo um incidente a ser investigado e corrigido, ainda que a garantia de Idempotent Processing já descrita no Capítulo 11 limite o dano real desse incidente a, na pior hipótese, reprocessamento sem efeito duplicado.

O custo de um Replay total varia consideravelmente entre módulos, e essa variação é uma consideração de design relevante para qualquer consumidor novo. O Finance Hub, cujo histórico de Ledger Entry cresce continuamente e nunca é truncado, enfrenta o custo de Replay mais alto entre todos os módulos desta plataforma — uma reconstrução completa de Balance a partir do zero, para um Tenant com anos de operação, pode exigir processamento de milhões de Ledger Entry. É por essa razão que o Snapshot Manager, já descrito em `ANALYTICS_HUB.md`, e o próprio mecanismo de Balance derivado do Finance Hub, já descrito em `FINANCE_HUB.md`, existem — não para substituir a capacidade de Replay total, mas para tornar sua invocação prática mesmo em escala de produção real.

---

## 10. Ordenação

Ordenação é necessária sempre que a sequência entre dois ou mais Evento relativos ao mesmo Aggregate afeta o resultado final de seu processamento — um `PaymentCaptured` processado antes de seu `InvoiceCreated` correspondente produziria um estado inconsistente, por exemplo.

Ordenação não é necessária entre Evento relativos a Aggregate diferentes, ou entre Evento de módulos distintos sem relação causal direta — dois `CustomerCreated` de Clientes diferentes podem ser processados em qualquer ordem relativa entre si, sem produzir inconsistência.

Event Streams são organizados, nesta plataforma, por identificador de Aggregate — todo Evento relativo a um mesmo Customer, a uma mesma Invoice, ou a um mesmo Experiment é entregue em sequência estrita dentro de seu próprio stream, mesmo que streams diferentes sejam processados em paralelo.

Causal Ordering garante que um Evento que depende logicamente de outro — como `PaymentCaptured` dependendo de `InvoiceCreated` — nunca seja processado antes de sua causa, mesmo quando os dois pertencem a Aggregate tecnicamente distintos mas logicamente relacionados.

Partitioning distribui o processamento de Evento por Aggregate ou por Tenant, permitindo paralelismo horizontal entre partições distintas sem comprometer a ordenação estrita já garantida dentro de cada partição individual.

```
              ORDENAÇÃO POR AGGREGATE (exemplo)
   ┌───────────────────────────────────────────────────────────┐
   │  Stream de Invoice-123:                                        │
   │    InvoiceCreated → InvoiceUpdated → InvoicePaid                   │
   │    (ordem estrita garantida)                                          │
   │                                                                │
   │  Stream de Invoice-456 (processado em paralelo, sem relação            │
   │  de ordem com o stream acima):                                             │
   │    InvoiceCreated → InvoiceCancelled                                          │
   └───────────────────────────────────────────────────────────┘
```

---

## 11. Idempotência

Duplicação de entrega é uma propriedade aceita do Event Bus desta plataforma, conforme já estabelecido em `SYSTEM_BLUEPRINT.md` — a garantia mínima é de entrega ao menos uma vez, nunca exatamente uma vez, o que torna a idempotência de consumo uma exigência, não uma otimização.

Retry, quando uma falha temporária de processamento ocorre, reencaminha o mesmo Evento ao consumidor até confirmação de sucesso, podendo produzir mais de uma tentativa de processamento do mesmo Evento.

Deduplicação é a técnica pela qual um consumidor identifica, através do identificador único já exigido no Capítulo 7, que um Evento específico já foi processado anteriormente, descartando o processamento duplicado sem produzir efeito adicional.

Reprocessamento deliberado — distinto de duplicação acidental — ocorre quando um consumidor executa um Replay ou um Rebuild intencional já descrito no Capítulo 9; a mesma garantia de idempotência assegura que esse reprocessamento produza exatamente o mesmo resultado final da primeira execução.

Garantias de idempotência, nesta plataforma, são responsabilidade do consumidor, nunca do produtor — o produtor publica o Evento uma vez por fato ocorrido; é o consumidor que garante, através de deduplicação por identificador, que múltiplas entregas do mesmo Evento nunca produzam múltiplos efeitos.

Esta atribuição de responsabilidade — sempre ao consumidor, nunca ao produtor — é uma decisão arquitetural deliberada, não uma limitação técnica aceita por conveniência. Se a responsabilidade de idempotência fosse invertida, cada produtor precisaria conhecer a lógica de deduplicação específica de cada consumidor, o que violaria diretamente o princípio Low Coupling já descrito no Capítulo 3 e já aplicado em cada Hub desta série. Ao manter essa responsabilidade sempre do lado do consumidor, um novo consumidor pode ser adicionado a qualquer Evento já existente sem exigir nenhuma mudança no produtor — a mesma garantia de Consumer Independence já descrita no Capítulo 3.

Um caso específico que merece atenção é a idempotência de Evento que produz efeito financeiro, como `PaymentCaptured` ou `RefundIssued`. Nestes casos, a garantia de idempotência não é apenas uma boa prática técnica — é uma exigência de correção contábil absoluta, já reforçada em `FINANCE_HUB.md`, Capítulo 5, sob o princípio Idempotent Payments: o reprocessamento acidental de um mesmo `PaymentCaptured` nunca pode resultar em uma segunda captura de valor do Cliente, e o Finance Hub, como consumidor de sua própria cadeia de processamento interno de Evento, aplica essa mesma disciplina de deduplicação com o rigor mais alto de toda a plataforma.

---

## 12. Casos de Uso

**Reconstrução de indicador após correção de defeito.** O Analytics Hub identifica um defeito em sua lógica de Aggregation, corrige o Aggregation Manager, e aciona um Rebuild completo de Dataset a partir do histórico integral de Evento já publicado por CRM, Communication, Finance e Growth, sem depender de nenhum estado intermediário anterior à correção.

**Auditoria de conformidade sobre pagamento.** Um auditor externo solicita a reconstrução completa da sequência de Evento que produziu o Balance atual de uma Financial Account; o Finance Hub recupera, em ordem, todo `LedgerEntryCreated` já publicado para essa conta, demonstrando a origem exata de cada valor.

**Onboarding de novo Tenant.** O Identity Hub publica `TenantCreated`; CRM, Communication, Finance, Growth e Analytics consomem esse Evento simultaneamente, cada um inicializando sua própria estrutura isolada para o novo Tenant, sem depender de ordem de inicialização entre si.

**Propagação de conversão comercial.** O CRM Hub publica `OpportunityWon`; o Finance Hub consome esse Evento e emite a Invoice correspondente; o Growth Hub consome o `InvoicePaid` subsequente para calcular Attribution da Campaign de origem.

**Reação a falha de pagamento.** O Finance Hub publica `PaymentFailed`; o Automation Engine consome esse Evento e dispara um Workflow que aciona o Communication Hub para notificar o Cliente sobre a necessidade de atualização de Payment Method.

**Geração assistida de indicador de retenção.** O Growth Hub publica `RetentionImproved`; o Analytics Hub consome esse Evento, entre outros, para atualizar um Business Indicator de retenção consolidado, disponível através de Dashboard executivo.

**Sincronização com sistema externo de contabilidade.** O Integration Hub publica `SynchronizationCompleted` após reconciliar o Ledger interno do Finance Hub com um sistema contábil externo, e o Finance Hub confirma, através de sua própria Reconciliation, que ambos permanecem consistentes.

**Qualificação automatizada de Lead.** O AI Hub publica `ClassificationCompleted` ao classificar um novo Lead por probabilidade de conversão; o CRM Hub consome esse Evento para priorizar sua fila de qualificação manual, sem que o AI Hub jamais decida sozinho a qualificação final.

**Indexação de nova Política de negócio.** O Knowledge Hub publica `KnowledgeIndexed` após indexar uma nova Política de reembolso; o AI Hub passa a poder referenciar essa Política em futura sugestão relacionada a Refund, sem que o Knowledge Hub jamais decida sobre o Refund em si.

**Aplicação de novo tema de marca.** O Branding Hub publica `ThemeUpdated`; o Finance Hub e o Analytics Hub consomem esse Evento para aplicar a nova identidade visual a toda futura Invoice e Report gerados para aquela Empresa.

**Reação a mudança de perfil de negócio.** O Business Profile Engine publica `BusinessAdaptationCompleted` após reclassificar a Maturidade de uma Empresa; todo Business Hub consome esse Evento para recalibrar seu próprio Configuration, sem que o Business Profile Engine jamais altere diretamente a configuração interna de nenhum Hub.

**Recuperação após interrupção de infraestrutura.** Um consumidor do Growth Hub sofre interrupção momentânea durante o consumo de Evento do Finance Hub; ao ser restaurado, ele retoma o processamento a partir do último Checkpoint confirmado, sem reprocessar Evento já processado com sucesso antes da interrupção.

---

## 13. Architecture Decision Records

**ADR-001 — Business Events representam fatos, nunca instruções.** Contexto: aplicação direta do princípio Events Represent Facts já descrito no Capítulo 3, distinguindo Evento de Command em toda a plataforma.

**ADR-002 — Um produtor por Evento.** Todo Evento tem exatamente um módulo autorizado a publicá-lo, sempre o proprietário do conceito envolvido conforme `DOMAIN_OWNERSHIP_MATRIX.md`. Contexto: eliminar ambiguidade de origem e preservar Single Source of Truth.

**ADR-003 — Replay é obrigatório para todo Evento catalogado.** Nenhum Evento é publicado de forma que impeça sua reconstrução futura. Contexto: sustentar auditoria, correção de defeito e reconstrução de Read Model em qualquer módulo consumidor.

**ADR-004 — Eventos são imutáveis.** Nenhum Evento já publicado é alterado. Contexto: preservar a integridade do histórico como fonte confiável de auditoria e de Replay.

**ADR-005 — Versionamento é obrigatório em todo Evento.** Contexto: permitir evolução controlada de contrato sem quebrar consumidor já existente, conforme detalhado no Capítulo 8.

**ADR-006 — Consumers são independentes entre si.** A adição ou remoção de um consumidor de um Evento nunca exige mudança no produtor nem em qualquer outro consumidor já existente. Contexto: preservar Low Coupling entre todos os módulos da plataforma.

**ADR-007 — Analytics apenas consome Evento de negócio, nunca publica Evento que outro Business Hub precise consumir para sua própria escrita.** Contexto: já fixado em `ANALYTICS_HUB.md`, ADR-001, e reafirmado aqui como regra transversal deste catálogo.

**ADR-008 — Automation reage a Evento e publica Evento de execução, mas nunca publica Evento em nome do domínio de negócio que executa.** Contexto: preservar a fronteira entre execução e ownership de dado de negócio já estabelecida em `AUTOMATION_ENGINE.md`.

**ADR-009 — AI recomenda através de Evento, nunca executa ação de negócio diretamente a partir dele.** Contexto: aplicação do princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5, a todo Evento da categoria AI Events.

**ADR-010 — Todo Evento carrega identificador único suficiente para deduplicação.** Contexto: sustentar a garantia de Idempotent Processing já descrita no Capítulo 3 e detalhada no Capítulo 11.

**ADR-011 — Ordenação é garantida por Aggregate, nunca globalmente entre todos os Evento da plataforma.** Contexto: equilibrar a necessidade real de ordenação causal com a exigência de paralelismo horizontal, conforme detalhado no Capítulo 10.

**ADR-012 — Toda entrega de Evento é assíncrona.** Nenhum produtor aguarda confirmação de processamento de nenhum consumidor. Contexto: preservar a independência operacional de cada módulo, mesmo sob indisponibilidade momentânea de outro.

**ADR-013 — Consistência entre módulos é sempre eventual, nunca instantânea.** Contexto: aplicação do princípio Eventually Consistent já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 10, e reafirmado transversalmente neste catálogo.

**ADR-014 — Nenhum Evento é removido deste catálogo sem descontinuação formal registrada.** Contexto: preservar rastreabilidade histórica completa, mesmo para Evento que a plataforma deixe de publicar no futuro.

**ADR-015 — Todo novo Evento é registrado neste catálogo antes de sua primeira publicação em produção.** Contexto: garantir que este documento nunca fique desatualizado frente à evolução real da plataforma.

**ADR-016 — Payload conceitual de todo Evento contém apenas o dado estritamente necessário ao propósito de negócio de seus consumidores.** Contexto: aplicação do princípio de minimização de dado já estabelecido em `SAAS_ARCHITECTURE.md`, evitando que um Evento se torne um vetor indevido de exposição de dado sensível.

**ADR-017 — Breaking Changes exigem publicação em paralelo de versão antiga e nova durante janela de transição explícita.** Contexto: preservar Backward Compatibility já descrita no Capítulo 3 e detalhada no Capítulo 8.

**ADR-018 — Consumidores nunca redefinem o contrato de um Evento já publicado.** Contexto: aplicação direta do princípio Consumers Never Redefine Contracts já descrito no Capítulo 3.

**ADR-019 — Snapshot e Checkpoint aceleram Replay, mas nunca substituem a disponibilidade do histórico completo de Evento.** Contexto: preservar a capacidade de Rebuild total mesmo quando um atalho de reconstrução parcial já existe.

**ADR-020 — Este catálogo é normativo, não apenas descritivo.** Um Evento publicado em produção que diverge deste catálogo é tratado como defeito de implementação a ser corrigido, nunca como justificativa para atualizar o catálogo em sentido contrário à intenção original de seu produtor. Contexto: preservar a autoridade deste documento como referência de governança de Evento.

---

## 14. Glossário

**Domain Event** — registro nomeado, estável e imutável de um fato de negócio já ocorrido, publicado exclusivamente por seu proprietário.

**Produtor** — módulo autorizado a publicar um Evento específico, sempre o proprietário do conceito de negócio envolvido.

**Consumidor** — módulo que consome um Evento já publicado, sem nunca alterá-lo ou redefini-lo.

**Payload conceitual** — conjunto mínimo de dado que um Evento carrega, suficiente para que um consumidor o processe sem depender de consulta adicional ao produtor.

**Idempotência** — garantia de que o processamento repetido de um mesmo Evento nunca produz efeito duplicado.

**Replay** — reprocessamento do histórico completo de Evento já publicado, reconstruindo estado derivado sem depender de estado intermediário anterior.

**Checkpoint** — registro do último Evento já processado com sucesso por um consumidor.

**Rebuild** — reconstrução completa e deliberada de um Read Model a partir do histórico integral de Evento.

**Ordenação por Aggregate** — garantia de sequência estrita de processamento entre Evento relativos a uma mesma Entidade, sem exigir ordenação global entre Aggregate distintos.

**Versionamento** — atribuição de uma versão explícita de contrato a cada Evento, permitindo evolução controlada sem quebra de consumidor existente.

**Breaking Change** — alteração de contrato de Evento que remove, renomeia ou modifica o significado de um campo já existente, exigindo nova versão publicada em paralelo.

**Deprecated** — estado formal de uma versão de Evento ainda publicada, mas já anunciada para descontinuação futura.

**Event Bus** — infraestrutura de publicação e consumo assíncrono de Evento já descrita em `SYSTEM_BLUEPRINT.md`.

**Event Stream** — sequência ordenada de Evento relativos a um mesmo Aggregate.

**Consistência eventual** — propriedade pela qual a propagação de Evento entre módulos tolera uma janela de latência, sem exigir sincronização instantânea.

---

## 15. Conclusão

Este documento passa a ser a autoridade oficial para todo Evento já publicado ou a ser publicado pela Adaptive Business Platform. Ele não substitui nenhum documento proprietário já existente — cada Evento aqui catalogado permanece integralmente definido, com todo seu detalhe conceitual e sua Regra de negócio associada, em seu Blueprint ou documento de arquitetura original.

Todo novo Evento deverá ser registrado aqui antes de sua primeira publicação em produção, respeitando exatamente a mesma estrutura de oito atributos já aplicada a cada entrada deste catálogo: Owner, Consumidores, Objetivo, Momento de publicação, Payload conceitual, Idempotência, Replay e Versionamento — nenhuma entrada futura é aceita com menos rigor descritivo do que já foi aplicado a cada Evento catalogado neste documento.

A comunicação entre domínios desta plataforma deve continuar ocorrendo prioritariamente por Evento, respeitando integralmente os limites de ownership já definidos em `DOMAIN_OWNERSHIP_MATRIX.md` — nenhum Evento catalogado neste documento altera, adiciona ou remove qualquer atribuição de ownership já registrada naquela matriz; este catálogo apenas descreve, com o detalhe técnico necessário à integração, como cada proprietário já registrado comunica seus próprios fatos de negócio ao restante da plataforma, sempre de forma assíncrona, sempre de forma auditável, e sempre respeitando a fronteira de responsabilidade já estabelecida por cada documento proprietário desta série.

Com este catálogo, a Adaptive Business Platform consolida não apenas quem é dono de cada conceito, já resolvido pela matriz de ownership, mas também como cada domínio comunica sua própria evolução ao restante do sistema — completando, junto aos documentos já publicados nesta série, a referência arquitetural completa de uma plataforma inteiramente orientada a Evento, desacoplada por construção, e auditável em cada fato que já produziu seu estado atual.

Toda futura extensão da Adaptive Business Platform — um sexto Business Hub, um novo Platform Service, uma nova capacidade de Adaptive Intelligence — herda, por este precedente, a mesma obrigação: nenhum fato de negócio relevante é considerado plenamente integrado à plataforma até que seu Evento correspondente esteja registrado neste catálogo, com seu produtor único, seus consumidores explícitos, e as oito propriedades de contrato já exigidas de toda entrada aqui documentada, sem exceção e sem atalho.
