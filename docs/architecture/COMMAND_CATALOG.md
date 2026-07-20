# Command Catalog

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento consolida oficialmente e de forma definitiva o catálogo de todos os Commands da Adaptive Business Platform. Ele não altera nenhuma decisão de ownership já registrada em `DOMAIN_OWNERSHIP_MATRIX.md`, não substitui nenhum dos cinco Business Hubs já documentados, e não redefine nenhum Command já descrito em seu documento de arquitetura original — `CRM_HUB.md`, `COMMUNICATION_HUB.md`, `FINANCE_HUB.md`, `GROWTH_HUB.md`, `ANALYTICS_HUB.md`, e os demais documentos de Platform Services e de Adaptive Intelligence. O que este documento adiciona é uma referência única e consultável, complementar a `EVENT_CATALOG.md`, na qual todo Command da plataforma pode ser localizado junto ao seu proprietário, suas pré-condições, suas pós-condições, os Eventos que produz e as regras técnicas que governam sua execução.

CQRS — Command-Query Responsibility Segregation — é o padrão arquitetural já aplicado individualmente em cada um dos cinco Business Hubs desta série, sob o qual toda operação sobre um domínio é classificada em exatamente uma de duas categorias: Command, que expressa intenção de mudança de estado, e Query, que expressa leitura sem efeito colateral. Este catálogo é dedicado exclusivamente à primeira categoria; a segunda permanece descrita, Hub a Hub, em seus próprios documentos de arquitetura, sob a seção de Queries de cada um.

Commands, nesta arquitetura, são a forma exclusiva pela qual um Usuário ou um módulo consumidor solicita uma mudança de estado a um Business Hub, a um Platform Service ou a um componente de Adaptive Intelligence. Um Command nunca executa a si mesmo — ele é recebido pelo módulo proprietário do conceito envolvido, validado contra as invariantes de negócio desse domínio, e só então processado.

Write Model é a estrutura de escrita que um Command efetivamente altera — sempre mantida exclusivamente pelo módulo proprietário, nunca por um consumidor externo, conforme já estabelecido pelo princípio Explicit Ownership em cada Blueprint desta série.

Intenção é a propriedade central que distingue um Command de um Evento: um Command comunica o que alguém deseja que aconteça, antes de esse fato se consolidar; um Evento comunica o que já aconteceu, depois de o fato já estar consolidado. Um Command pode ser recusado pela Validation do módulo proprietário; um Evento, por definição, nunca é recusado, porque descreve algo que já é real.

Mudança de estado é o efeito que todo Command bem-sucedido produz — nunca uma leitura, nunca uma agregação analítica, sempre uma alteração real e persistente do Write Model do módulo proprietário.

A diferença entre Commands e Events já foi estabelecida, de forma consolidada, em `EVENT_CATALOG.md`, Capítulo 3: Commands Are Not Events — um Command solicita, um Evento relata. Este catálogo preserva essa distinção em cada uma de suas entradas, e nenhum Command aqui documentado é reclassificado como Evento, nem vice-versa.

A diferença entre Commands e Queries é igualmente central: um Command sempre produz efeito colateral de escrita, mesmo quando esse efeito é recusado pela Validation; uma Query nunca produz efeito colateral, mesmo quando consulta o dado mais atual e sensível de um domínio. Este catálogo documenta exclusivamente Commands — a documentação de Queries permanece, propositalmente, no documento de arquitetura de cada Hub, onde já está descrita ao lado do modelo de leitura que ela consulta.

A necessidade de um catálogo consolidado de Commands, complementar a `EVENT_CATALOG.md`, segue exatamente o mesmo raciocínio que já justificou aquele documento: depois que cinco Business Hubs, quatro Platform Services e três componentes de Adaptive Intelligence já expõem, cada um, seu próprio conjunto de Commands, a única forma de garantir que um novo consumidor — humano ou automatizado — encontre rapidamente a operação de escrita que precisa invocar, sem reler cada documento de arquitetura por completo, é um catálogo único que resuma o contrato essencial de cada Command já publicado.

Este catálogo também formaliza, de forma transversal, uma disciplina que cada Hub já pratica individualmente: nenhum Command produz efeito de escrita sem antes passar por Validation explícita. Essa disciplina, aplicada Hub a Hub em cada documento de arquitetura já publicado, é consolidada aqui como regra de governança para toda a plataforma — nenhuma exceção é aceita, mesmo para o Command mais simples e aparentemente inofensivo já catalogado neste documento.

---

## 2. Objetivos

Este catálogo padroniza — todo Command da plataforma segue a mesma convenção de nome, o mesmo conjunto mínimo de atributos descritivos, e a mesma disciplina de validação, independentemente de qual módulo o processa.

Este catálogo garante governança — nenhum Command é executado por um módulo que não seja seu proprietário, e nenhuma nova capacidade de escrita é adicionada à plataforma sem que seu Command correspondente esteja aqui registrado.

Este catálogo garante consistência — toda mudança de estado, em qualquer domínio, é sempre precedida da mesma sequência de Validation, Execution e publicação de Evento, nunca de um atalho que ignore essa sequência.

Este catálogo reforça ownership — ao explicitar, para cada Command, seu único proprietário autorizado, ele consolida na prática a mesma matriz já registrada em `DOMAIN_OWNERSHIP_MATRIX.md`, aplicada agora à camada específica de escrita.

Este catálogo garante baixo acoplamento — um módulo que invoca um Command de outro depende apenas de seu contrato conceitual já publicado, nunca de sua lógica interna de Validation ou de Execution.

Este catálogo garante escalabilidade — porque todo Command é processado de forma independente por seu próprio módulo proprietário, o volume de escrita em um domínio nunca compromete a capacidade de processamento de outro.

Este catálogo garante auditabilidade — todo Command bem-sucedido produz um Evento correspondente já catalogado em `EVENT_CATALOG.md`, sustentando reconstrução completa de por que qualquer estado atual da plataforma é o que é.

Este catálogo garante evolução — porque o contrato de cada Command é público e versionado, um módulo proprietário pode evoluir sua implementação interna de Validation e de Execution livremente, desde que o contrato externo do Command permaneça estável.

---

## 3. Princípios

**Commands Express Intent.** Todo Command comunica o desejo de que uma mudança de estado ocorra, nunca a confirmação de que ela já ocorreu.

**Single Owner.** Todo Command possui exatamente um módulo autorizado a processá-lo, sempre o proprietário do conceito de negócio envolvido.

**Commands Never Query.** Nenhum Command retorna um Read Model, um Dashboard ou qualquer estrutura de leitura analítica — seu único retorno legítimo é a confirmação de sucesso, de falha, ou o identificador da Entidade afetada.

**Commands May Publish Events.** Todo Command bem-sucedido publica o Evento correspondente já catalogado em `EVENT_CATALOG.md`, antes de considerar sua execução concluída.

**Commands Never Represent Facts.** Um Command representa uma solicitação sujeita a validação, nunca um fato já consolidado — essa distinção nunca é invertida.

**Commands Are Validated.** Todo Command é submetido à Validation do módulo proprietário antes de qualquer efeito de escrita ser aplicado.

**Commands Are Explicit.** Todo Command tem um nome, um propósito e um conjunto de parâmetros claramente definidos, nunca uma operação genérica de "atualizar" sem especificidade de negócio.

**Commands Are Immutable.** O contrato de um Command já publicado, em uma dada versão, não é alterado — qualquer mudança de contrato exige nova versão, conforme detalhado no Capítulo 9.

**Commands Respect Ownership.** Nenhum Command é processado por um módulo que não seja o proprietário do conceito envolvido, mesmo quando esse módulo tecnicamente possui acesso à estrutura de dado subjacente.

**Consumers Never Execute Foreign Commands.** Um módulo consumidor nunca invoca diretamente uma operação de escrita interna de outro módulo além do Command formal já exposto por esse módulo.

**Automation May Invoke Commands.** O Automation Engine pode invocar um Command formal exposto por qualquer Business Hub, sempre respeitando integralmente as pré-condições desse Command, nunca contornando sua Validation.

**AI Never Executes Commands.** O AI Hub nunca invoca diretamente um Command de negócio — toda sugestão do AI Hub que implique mudança de estado exige confirmação humana antes de qualquer Command ser efetivamente processado.

**Analytics Never Executes Commands Operacionais.** O Analytics Hub nunca invoca um Command de CRM, Communication, Finance ou Growth — sua capacidade de escrita permanece estritamente confinada a seus próprios conceitos, já catalogados em `ANALYTICS_DOMAIN_BLUEPRINT.md`.

**Idempotency Where Applicable.** Todo Command cujo reprocessamento poderia produzir efeito duplicado — como a captura de um Payment — é desenhado para ser idempotente, conforme detalhado no Capítulo 8.

**Versionable Commands.** Todo Command possui uma versão explícita de contrato, permitindo evolução controlada sem quebrar consumidor já existente.

**Business First.** O nome e os parâmetros de todo Command refletem a linguagem do negócio, nunca uma abstração técnica arbitrária.

**Explicit Contracts.** Toda pré-condição, toda pós-condição e todo Evento produzido por um Command são documentados de forma explícita, nunca inferidos por convenção implícita.

**No Shared Ownership.** Nenhum Command é processado por mais de um módulo, mesmo quando dois módulos participam do mesmo processo de negócio mais amplo.

**Cross Reference.** Toda menção a um Command fora de seu documento de arquitetura original é feita por referência, nunca por redefinição paralela.

**Bounded Context.** Todo Command opera estritamente dentro da fronteira conceitual de seu módulo proprietário, nunca produzindo efeito de escrita fora dessa fronteira.

---

## 4. Catálogo Oficial

Esta seção organiza o catálogo por módulo proprietário. Cada Command é descrito por oito atributos: Objetivo, Owner, Pré-condições, Pós-condições, Eventos publicados, Regras, Idempotência e Validações conceituais. Onde um Command já foi integralmente descrito em seu documento de arquitetura original, esta entrada resume seu contrato de execução; a definição completa de Regra de negócio associada permanece exclusivamente naquele documento.

Uma observação de consistência é necessária antes do catálogo: os documentos `GROWTH_HUB.md`, `ANALYTICS_HUB.md` e `AI_HUB.md` registraram, cada um de forma independente, um Command de nome genérico "Generate Recommendation". Para eliminar a ambiguidade que essa coincidência de nome produziria em um catálogo consolidado, este documento distingue os três explicitamente como `GenerateGrowthRecommendation`, `GenerateAnalyticalRecommendation` e `GenerateAIRecommendation` — cada um permanece, na prática, exatamente o mesmo Command já descrito em seu documento de origem; apenas sua grafia neste catálogo foi desambiguada para preservar Single Owner sem colisão de nome.

### CRM Hub

**`CreateCustomer`** — Objetivo: registrar novo Customer. Owner: CRM Hub. Pré-condições: dado de contato mínimo válido. Pós-condições: Customer persistido com identificador único. Eventos publicados: `CustomerCreated`. Regras: nenhum Customer duplicado para o mesmo dado de identificação principal. Idempotência: por chave de identificação externa, quando fornecida. Validações conceituais: formato de contato, Organization associada quando aplicável.

**`UpdateCustomer`** — Objetivo: alterar atributo de um Customer já existente. Owner: CRM Hub. Pré-condições: Customer existente e ativo. Pós-condições: atributo atualizado. Eventos publicados: `CustomerUpdated`. Regras: campos de identidade principal exigem fluxo de MergeCustomer, nunca UpdateCustomer direto. Idempotência: por identificador e timestamp de submissão. Validações conceituais: consistência de formato do campo alterado.

**`MergeCustomer`** — Objetivo: unificar dois registros duplicados de Customer. Owner: CRM Hub. Pré-condições: dois Customer identificados como duplicados. Pós-condições: um Customer sobrevivente, um descontinuado com referência preservada. Eventos publicados: `CustomerMerged`. Regras: histórico de ambos os registros é preservado sob o sobrevivente. Idempotência: por par de identificadores. Validações conceituais: nenhum dos dois já mesclado anteriormente.

**`ArchiveCustomer`** — Objetivo: encerrar formalmente um relacionamento. Owner: CRM Hub. Pré-condições: Customer ativo, sem Opportunity aberta bloqueante. Pós-condições: Customer marcado como arquivado. Eventos publicados: `CustomerArchived`. Regras: histórico nunca é removido, apenas o Status muda. Idempotência: por identificador. Validações conceituais: motivo de encerramento obrigatório.

**`CreateLead`** — Objetivo: registrar novo Lead. Owner: CRM Hub. Pré-condições: Lead Source identificada. Pós-condições: Lead persistido. Eventos publicados: `LeadCreated`. Regras: todo Lead exige origem rastreável. Idempotência: por identificador externo de captura, quando fornecido. Validações conceituais: dado mínimo de contato presente.

**`QualifyLead`** — Objetivo: registrar que um Lead atingiu critério de qualificação. Owner: CRM Hub. Pré-condições: Lead ainda não qualificado. Pós-condições: Lead marcado como qualificado. Eventos publicados: `LeadQualified`. Regras: critério de qualificação é sempre explícito e registrado. Idempotência: por identificador e critério. Validações conceituais: critério pertence ao conjunto já configurado pela Empresa.

**`ConvertLead`** — Objetivo: transformar um Lead qualificado em Customer. Owner: CRM Hub. Pré-condições: Lead já qualificado. Pós-condições: Customer criado, Lead marcado como convertido. Eventos publicados: `LeadConverted`. Regras: um Lead nunca é convertido mais de uma vez. Idempotência: por identificador do Lead. Validações conceituais: ausência de Customer já existente para o mesmo dado de identificação.

**`AssignCustomer`** — Objetivo: atribuir um Customer Owner responsável. Owner: CRM Hub. Pré-condições: Customer existente, Usuário destinatário com Permission válida. Pós-condições: Customer Owner atualizado. Eventos publicados: `RelationshipUpdated`. Regras: um Customer possui sempre exatamente um Customer Owner ativo. Idempotência: por identificador e Usuário destinatário. Validações conceituais: Usuário destinatário verificado junto ao Identity Hub.

### Communication Hub

**`CreateConversation`** — Objetivo: iniciar nova Conversation. Owner: Communication Hub. Pré-condições: Channel válido, Customer ou Contact identificado. Pós-condições: Conversation persistida. Eventos publicados: `ConversationStarted`. Regras: toda Conversation pertence a exatamente um Channel de origem. Idempotência: por identificador externo de origem, quando aplicável. Validações conceituais: Channel habilitado para o Tenant.

**`CloseConversation`** — Objetivo: encerrar formalmente uma Conversation. Owner: Communication Hub. Pré-condições: Conversation ativa. Pós-condições: Conversation marcada como encerrada. Eventos publicados: `ConversationClosed`. Regras: histórico de Message permanece integralmente preservado. Idempotência: por identificador. Validações conceituais: motivo de encerramento presente.

**`SendMessage`** — Objetivo: enviar uma Message dentro de uma Conversation. Owner: Communication Hub. Pré-condições: Conversation ativa, conteúdo válido. Pós-condições: Message registrada e encaminhada ao Integration Hub. Eventos publicados: `MessageSent`. Regras: toda Message pertence a exatamente uma Conversation. Idempotência: por identificador de submissão. Validações conceituais: conteúdo compatível com o Channel de destino.

**`ScheduleMessage`** — Objetivo: agendar o envio futuro de uma Message. Owner: Communication Hub. Pré-condições: horário futuro válido. Pós-condições: Message registrada como pendente de envio. Eventos publicados: nenhum até o envio efetivo, que produz `MessageSent`. Regras: agendamento nunca ultrapassa o limite máximo de antecedência configurado. Idempotência: por identificador de agendamento. Validações conceituais: horário dentro da janela permitida pelo Tenant.

**`PublishTemplate`** — Objetivo: disponibilizar novo Message Template. Owner: Communication Hub. Pré-condições: Template aprovado internamente. Pós-condições: Template disponível para uso. Eventos publicados: `TemplatePublished`. Regras: um Template publicado não é removido, apenas descontinuado. Idempotência: por identificador. Validações conceituais: conformidade com o Channel de destino pretendido.

**`RegisterDelivery`** — Objetivo: registrar confirmação técnica de entrega de uma Message. Owner: Communication Hub. Pré-condições: Message já enviada. Pós-condições: Delivery Status atualizado. Eventos publicados: `MessageDelivered`. Regras: confirmação sempre referencia a Message original. Idempotência: por identificador da Message e timestamp de confirmação. Validações conceituais: confirmação originada do Integration Hub.

**`CreateNotification`** — Objetivo: registrar disparo de uma Notification. Owner: Communication Hub. Pré-condições: destinatário e Template válidos. Pós-condições: Notification registrada. Eventos publicados: `NotificationSent`. Regras: toda Notification referencia o Template usado. Idempotência: por identificador de submissão. Validações conceituais: destinatário elegível a receber a Notification.

### Finance Hub

Os dezesseis Commands desta seção já foram catalogados integralmente em `FINANCE_HUB.md`, Capítulo 10.

**`CreateInvoice`** — Objetivo: criar nova Invoice. Owner: Finance Hub. Pré-condições: Financial Account válida. Pós-condições: Invoice persistida em Status pendente. Eventos publicados: `InvoiceCreated`. Regras: toda Invoice referencia uma Financial Account. Idempotência: por identificador de origem, quando aplicável. Validações conceituais: valor e moeda válidos.

**`UpdateInvoice`** — Objetivo: alterar Invoice ainda não paga. Owner: Finance Hub. Pré-condições: Invoice em Status pendente. Pós-condições: campo atualizado. Eventos publicados: `InvoiceUpdated`. Regras: Invoice paga nunca é alterada. Idempotência: por identificador e timestamp. Validações conceituais: campo alterado pertence ao conjunto editável.

**`CancelInvoice`** — Objetivo: cancelar Invoice antes de pagamento. Owner: Finance Hub. Pré-condições: Invoice ainda não paga. Pós-condições: Invoice marcada como cancelada, histórico preservado. Eventos publicados: `InvoiceCancelled`. Regras: cancelamento nunca remove o registro. Idempotência: por identificador. Validações conceituais: motivo de cancelamento presente.

**`AuthorizePayment`** — Objetivo: iniciar processamento de um Payment. Owner: Finance Hub. Pré-condições: Invoice pendente, Payment Method válido. Pós-condições: Payment Intent criado. Eventos publicados: `PaymentAuthorized`. Regras: autorização é sempre mediada pelo Integration Hub. Idempotência: por identificador do Payment Intent. Validações conceituais: valor compatível com a Invoice.

**`CapturePayment`** — Objetivo: confirmar captura efetiva de um Payment já autorizado. Owner: Finance Hub. Pré-condições: Payment Intent autorizado. Pós-condições: Payment confirmado, Ledger Entry criado. Eventos publicados: `PaymentCaptured`. Regras: aplicação direta do princípio Idempotent Payments. Idempotência: por identificador do Payment Intent. Validações conceituais: valor capturado não excede o valor autorizado.

**`FailPayment`** — Objetivo: registrar falha de um Payment Attempt. Owner: Finance Hub. Pré-condições: tentativa de captura recusada pelo Provider. Pós-condições: Payment Attempt marcado como falho. Eventos publicados: `PaymentFailed`. Regras: falha nunca cancela a Invoice automaticamente. Idempotência: por identificador da tentativa. Validações conceituais: motivo de falha presente.

**`IssueRefund`** — Objetivo: processar devolução de valor já pago. Owner: Finance Hub. Pré-condições: Payment original confirmado. Pós-condições: Refund criado, novo Ledger Entry gerado. Eventos publicados: `RefundIssued`. Regras: Refund nunca reverte o Ledger Entry original. Idempotência: por identificador do Refund. Validações conceituais: valor não excede o valor já pago.

**`CreateSubscription`** — Objetivo: estabelecer acordo de cobrança recorrente. Owner: Finance Hub. Pré-condições: Financial Account e periodicidade válidas. Pós-condições: Subscription ativa. Eventos publicados: `SubscriptionCreated`. Regras: Subscription nunca processa pagamento diretamente. Idempotência: por identificador. Validações conceituais: periodicidade dentro do conjunto suportado.

**`RenewSubscription`** — Objetivo: renovar Subscription para novo ciclo. Owner: Finance Hub. Pré-condições: Subscription ativa. Pós-condições: novo ciclo registrado. Eventos publicados: `SubscriptionRenewed`. Regras: renovação nunca altera o ciclo anterior. Idempotência: por identificador e ciclo. Validações conceituais: ciclo anterior já concluído.

**`GenerateRecurringInvoice`** — Objetivo: gerar Invoice a partir de Subscription ativa. Owner: Finance Hub. Pré-condições: Subscription ativa, ciclo devido. Pós-condições: nova Invoice criada. Eventos publicados: `RecurringBillingExecuted`, `InvoiceCreated`. Regras: cada ciclo gera exatamente uma Invoice. Idempotência: por identificador de ciclo. Validações conceituais: ciclo ainda não faturado.

**`ApplyDiscount`** — Objetivo: aplicar redução a uma Invoice. Owner: Finance Hub. Pré-condições: Invoice ainda não paga. Pós-condições: valor final recalculado. Eventos publicados: `DiscountApplied`. Regras: desconto nunca resulta em valor negativo. Idempotência: por identificador da aplicação. Validações conceituais: percentual ou valor dentro do limite configurado.

**`ApplyFinancialAdjustment`** — Objetivo: registrar correção manual de estado financeiro. Owner: Finance Hub. Pré-condições: Permission de nível restrito confirmada. Pós-condições: novo Ledger Entry criado. Eventos publicados: `FinancialAdjustmentApplied`. Regras: ajuste nunca altera Ledger Entry existente. Idempotência: por identificador do ajuste. Validações conceituais: justificativa obrigatória presente.

**`RegisterSettlement`** — Objetivo: registrar confirmação de liquidação junto ao Provider. Owner: Finance Hub. Pré-condições: Payment já capturados, pendentes de repasse. Pós-condições: Settlement registrado. Eventos publicados: `SettlementCompleted`. Regras: Settlement nunca altera Ledger Entry de Payment original. Idempotência: por identificador do Settlement. Validações conceituais: valor consolidado confere com Payment associados.

**`StartReconciliation`** — Objetivo: iniciar comparação entre registro interno e extrato externo. Owner: Finance Hub. Pré-condições: extrato externo disponível via Integration Hub. Pós-condições: processo de Reconciliation registrado. Eventos publicados: `ReconciliationCompleted`. Regras: divergência é sinalizada, nunca corrigida automaticamente. Idempotência: por identificador do processo e período. Validações conceituais: período de referência válido.

**`CreateReceivable`** — Objetivo: registrar valor a receber explícito. Owner: Finance Hub. Pré-condições: motivo de registro válido, não decorrente automático de Invoice. Pós-condições: Account Receivable criado. Eventos publicados: nenhum Evento dedicado; consolidado sob leitura de Receivable View. Regras: Receivable referencia sempre uma Financial Account. Idempotência: por identificador. Validações conceituais: valor e prazo válidos.

**`CreatePayable`** — Objetivo: registrar obrigação da Empresa perante terceiro. Owner: Finance Hub. Pré-condições: fornecedor ou obrigação identificada. Pós-condições: Account Payable criado. Eventos publicados: nenhum Evento dedicado. Regras: Payable referencia sempre uma Financial Account. Idempotência: por identificador. Validações conceituais: valor e prazo válidos.

### Growth Hub

Os dezesseis Commands desta seção já foram catalogados integralmente em `GROWTH_HUB.md`, Capítulo 10.

**`CreateCampaign`** — Objetivo: criar nova Campaign. Owner: Growth Hub. Pré-condições: Audience e Campaign Goal definidos. Pós-condições: Campaign persistida. Eventos publicados: `CampaignCreated`. Regras: Campaign nunca inicia sem Audience já associada. Idempotência: por identificador de submissão. Validações conceituais: Campaign Goal mensurável presente.

**`StartCampaign`** — Objetivo: iniciar execução de Campaign já criada. Owner: Growth Hub. Pré-condições: Campaign em Status pendente. Pós-condições: Campaign em execução. Eventos publicados: `CampaignStarted`. Regras: início aciona a Journey associada via Automation Engine. Idempotência: por identificador. Validações conceituais: período de execução válido.

**`StopCampaign`** — Objetivo: encerrar antecipadamente Campaign em execução. Owner: Growth Hub. Pré-condições: Campaign em execução. Pós-condições: Campaign encerrada, histórico preservado. Eventos publicados: `CampaignFinished`. Regras: encerramento nunca remove Conversion Event já registrado. Idempotência: por identificador. Validações conceituais: motivo de encerramento presente.

**`CreateAudience`** — Objetivo: construir nova Audience. Owner: Growth Hub. Pré-condições: critério de composição definido. Pós-condições: Audience consolidada. Eventos publicados: `AudienceBuilt`. Regras: Audience referencia Customer por identificador, nunca por cópia de estrutura. Idempotência: por identificador de critério e timestamp. Validações conceituais: critério resolvível contra o CRM Hub.

**`UpdateSegment`** — Objetivo: recalcular composição de um Audience Segment. Owner: Growth Hub. Pré-condições: Segment já existente. Pós-condições: composição atualizada. Eventos publicados: `SegmentUpdated`. Regras: recálculo nunca altera a Audience de origem. Idempotência: por identificador e timestamp. Validações conceituais: critério de segmentação válido.

**`CreateJourney`** — Objetivo: estruturar nova Journey. Owner: Growth Hub. Pré-condições: sequência de Touchpoint definida. Pós-condições: Journey persistida. Eventos publicados: nenhum Evento dedicado à criação; `JourneyStarted` ocorre no primeiro Touchpoint percorrido. Regras: Journey nunca envia mensagem diretamente. Idempotência: por identificador. Validações conceituais: ao menos um Touchpoint presente.

**`StartExperiment`** — Objetivo: iniciar execução de um Experiment. Owner: Growth Hub. Pré-condições: Conversion Goal e Variant definidos. Pós-condições: Experiment em execução, Variant expostas. Eventos publicados: `ExperimentStarted`. Regras: Experiment nunca inicia sem Conversion Goal explícito. Idempotência: por identificador. Validações conceituais: ao menos duas Variant presentes.

**`FinishExperiment`** — Objetivo: encerrar Experiment e consolidar resultado. Owner: Growth Hub. Pré-condições: Experiment em execução, critério de encerramento atingido. Pós-condições: Winner Selection registrada. Eventos publicados: `ExperimentFinished`, `VariantSelected`. Regras: composição de Variant permanece estável até este Command. Idempotência: por identificador. Validações conceituais: significância mínima atingida.

**`RegisterConversion`** — Objetivo: registrar Conversion Event. Owner: Growth Hub. Pré-condições: Conversion Goal já definido. Pós-condições: Attribution calculada. Eventos publicados: `ConversionRegistered`. Regras: Attribution nunca é recalculada retroativamente por mudança de modelo. Idempotência: por identificador do Conversion Event. Validações conceituais: origem rastreável presente.

**`RegisterReferral`** — Objetivo: registrar nova indicação. Owner: Growth Hub. Pré-condições: Referral Program ativo. Pós-condições: Referral persistido. Eventos publicados: `ReferralCreated`. Regras: Referral nunca cria Customer diretamente. Idempotência: por identificador de submissão. Validações conceituais: Referral Program válido e vigente.

**`CalculateAttribution`** — Objetivo: recalcular Attribution de um conjunto de Conversion Event. Owner: Growth Hub. Pré-condições: Attribution Model vigente definido. Pós-condições: Attribution registrada. Eventos publicados: nenhum Evento dedicado; consolidado sob Attribution View. Regras: cálculo nunca reescreve Attribution já existente. Idempotência: por identificador do Conversion Event. Validações conceituais: modelo vigente aplicável ao período.

**`CalculateEngagementScore`** — Objetivo: recalcular Engagement Score de Cliente ou Cohort. Owner: Growth Hub. Pré-condições: sinal de comportamento disponível. Pós-condições: Engagement Score atualizado. Eventos publicados: `RetentionImproved`, quando aplicável. Regras: Engagement Score é sempre derivado, nunca definido manualmente. Idempotência: por identificador e janela temporal. Validações conceituais: sinal de origem verificável.

**`GenerateGrowthInsight`** — Objetivo: identificar Growth Insight a partir de Growth Metric. Owner: Growth Hub. Pré-condições: volume mínimo de dado disponível. Pós-condições: Growth Insight registrado. Eventos publicados: `GrowthInsightGenerated`. Regras: Insight nunca dispara ação automaticamente. Idempotência: por identificador. Validações conceituais: padrão estatisticamente relevante.

**`GenerateGrowthRecommendation`** — Objetivo: formular Growth Recommendation a partir de Insight. Owner: Growth Hub. Pré-condições: Growth Insight já existente. Pós-condições: Growth Recommendation registrada. Eventos publicados: `GrowthRecommendationGenerated`. Regras: Recommendation é sempre sugestão, nunca ação autoexecutável. Idempotência: por identificador. Validações conceituais: Insight de origem ainda válido.

**`CreateInitiative`** — Objetivo: registrar Growth Initiative planejada. Owner: Growth Hub. Pré-condições: Growth Opportunity identificada. Pós-condições: Initiative registrada. Eventos publicados: nenhum Evento dedicado. Regras: Initiative referencia sempre uma Opportunity. Idempotência: por identificador. Validações conceituais: Opportunity ainda aberta.

**`CloseOpportunity`** — Objetivo: encerrar Growth Opportunity. Owner: Growth Hub. Pré-condições: Opportunity aberta. Pós-condições: Opportunity encerrada, por captura ou por descontinuação. Eventos publicados: `ExpansionAchieved`, quando aplicável. Regras: encerramento preserva histórico da Opportunity. Idempotência: por identificador. Validações conceituais: motivo de encerramento presente.

### Analytics Hub

Os dezesseis Commands desta seção já foram catalogados integralmente em `ANALYTICS_HUB.md`, Capítulo 10. Reforça-se aqui, de forma explícita, o princípio já central a este módulo: o Analytics Hub altera apenas seus próprios modelos analíticos — Dashboard, Metric, Forecast, Insight — e nunca invoca um Command de CRM, Communication, Finance ou Growth.

**`CreateDashboard`** — Objetivo: criar novo Dashboard. Owner: Analytics Hub. Pré-condições: nenhuma além de Permission válida. Pós-condições: Dashboard persistido. Eventos publicados: `DashboardCreated`. Regras: Dashboard nunca expõe capacidade de escrita sobre outro domínio. Idempotência: por identificador de submissão. Validações conceituais: composição inicial de Widget válida.

**`UpdateDashboard`** — Objetivo: alterar composição de Widget de um Dashboard. Owner: Analytics Hub. Pré-condições: Dashboard existente. Pós-condições: composição atualizada. Eventos publicados: `DashboardUpdated`. Regras: alteração nunca produz efeito sobre dado de origem. Idempotência: por identificador e timestamp. Validações conceituais: Widget referencia Metric ou KPI já existente.

**`GenerateReport`** — Objetivo: gerar Report a partir de Report Template. Owner: Analytics Hub. Pré-condições: Report Template configurado. Pós-condições: Report gerado. Eventos publicados: `ReportGenerated`. Regras: Report preserva granularidade de Permission do conteúdo subjacente. Idempotência: por identificador de submissão. Validações conceituais: Template compatível com o Dataset disponível.

**`CalculateMetric`** — Objetivo: recalcular uma Metric a partir de Dataset atualizado. Owner: Analytics Hub. Pré-condições: Dataset consolidado disponível. Pós-condições: Metric atualizada, Snapshot criado. Eventos publicados: `MetricCalculated`. Regras: Metric expõe sempre fórmula e janela temporal. Idempotência: por identificador e janela. Validações conceituais: Dataset íntegro e completo.

**`CalculateKPI`** — Objetivo: recalcular KPI a partir de Metric associadas. Owner: Analytics Hub. Pré-condições: Metric componentes já calculadas. Pós-condições: KPI atualizado. Eventos publicados: `KPIUpdated`. Regras: KPI é sempre derivado, nunca definido manualmente. Idempotência: por identificador e janela. Validações conceituais: todas as Metric componentes disponíveis.

**`GenerateForecast`** — Objetivo: projetar Forecast a partir de Trend identificado. Owner: Analytics Hub. Pré-condições: Trend já identificado. Pós-condições: Forecast registrado. Eventos publicados: `ForecastGenerated`. Regras: Forecast expõe sempre a incerteza da projeção. Idempotência: por identificador. Validações conceituais: Trend com histórico suficiente.

**`GenerateTrend`** — Objetivo: analisar Time Series e identificar evolução. Owner: Analytics Hub. Pré-condições: Time Series com histórico mínimo. Pós-condições: Trend registrado. Eventos publicados: `TrendIdentified`. Regras: Trend nunca é gerado a partir de janela insuficiente de dado. Idempotência: por identificador e janela. Validações conceituais: volume mínimo de Snapshot disponível.

**`RefreshDataset`** — Objetivo: consolidar novo Evento em Dataset existente. Owner: Analytics Hub. Pré-condições: Evento pendente de consumo disponível. Pós-condições: Dataset atualizado. Eventos publicados: `DatasetRefreshed`. Regras: Dataset é sempre reconstruível a partir do histórico completo de Evento. Idempotência: por identificador do Evento consumido. Validações conceituais: Evento de origem já validado.

**`CreateSnapshot`** — Objetivo: registrar estado imutável de um indicador. Owner: Analytics Hub. Pré-condições: Metric ou KPI já calculado. Pós-condições: Snapshot criado. Eventos publicados: `SnapshotCreated`. Regras: Snapshot nunca é alterado após criação. Idempotência: por identificador único do Snapshot. Validações conceituais: valor de origem já confirmado.

**`GenerateInsight`** — Objetivo: identificar Insight a partir de Dataset consolidado. Owner: Analytics Hub. Pré-condições: volume mínimo de dado disponível. Pós-condições: Insight registrado. Eventos publicados: `InsightGenerated`. Regras: Insight nunca executa ação automaticamente. Idempotência: por identificador. Validações conceituais: padrão estatisticamente relevante.

**`GenerateAnalyticalRecommendation`** — Objetivo: formular Analytical Recommendation a partir de Insight. Owner: Analytics Hub. Pré-condições: Insight já existente. Pós-condições: Recommendation registrada. Eventos publicados: `RecommendationGenerated`. Regras: Recommendation exige confirmação humana antes de qualquer ação. Idempotência: por identificador. Validações conceituais: Insight de origem ainda válido.

**`UpdateBenchmark`** — Objetivo: registrar nova versão de Benchmark. Owner: Analytics Hub. Pré-condições: Permission restrita confirmada. Pós-condições: nova versão registrada, versão anterior preservada. Eventos publicados: `BenchmarkUpdated`. Regras: atualização nunca sobrescreve versão anterior. Idempotência: por identificador e versão. Validações conceituais: valor dentro de faixa plausível.

**`PublishVisualization`** — Objetivo: disponibilizar nova Visualization. Owner: Analytics Hub. Pré-condições: Metric, KPI ou Trend representável. Pós-condições: Visualization publicada. Eventos publicados: `VisualizationPublished`. Regras: Visualization referencia sempre indicador já calculado. Idempotência: por identificador. Validações conceituais: tipo de gráfico compatível com o dado representado.

**`UpdateScorecard`** — Objetivo: recalcular composição ou resultado de um Scorecard. Owner: Analytics Hub. Pré-condições: indicadores componentes disponíveis. Pós-condições: Scorecard atualizado. Eventos publicados: `ScorecardUpdated`. Regras: Scorecard nunca inclui indicador não derivado. Idempotência: por identificador e janela. Validações conceituais: todos os indicadores componentes calculados.

**`ArchiveDashboard`** — Objetivo: encerrar exibição ativa de Dashboard não mais relevante. Owner: Analytics Hub. Pré-condições: Dashboard existente. Pós-condições: Dashboard arquivado, histórico preservado. Eventos publicados: nenhum Evento dedicado. Regras: arquivamento nunca remove o registro. Idempotência: por identificador. Validações conceituais: nenhuma.

**`RefreshAnalytics`** — Objetivo: acionar atualização ampla de múltiplos Dataset e Metric simultaneamente. Owner: Analytics Hub. Pré-condições: reprocessamento justificado, tipicamente após correção de defeito. Pós-condições: Dataset e Metric afetados recalculados. Eventos publicados: `DatasetRefreshed`, `MetricCalculated` para cada item afetado. Regras: reprocessamento nunca produz resultado divergente do already esperado pela Regra Deterministic Growth. Idempotência: por identificador de execução. Validações conceituais: escopo de reprocessamento explicitamente delimitado.

### Automation Engine

**`CreateWorkflow`** — Objetivo: registrar novo Workflow. Owner: Automation Engine. Pré-condições: Trigger e ao menos uma Action definidos. Pós-condições: Workflow persistido. Eventos publicados: nenhum Evento dedicado à criação. Regras: Workflow nunca possui o dado de negócio que manipula. Idempotência: por identificador de submissão. Validações conceituais: Action referencia Command já exposto por um Hub proprietário.

**`ActivateWorkflow`** — Objetivo: habilitar Workflow para execução. Owner: Automation Engine. Pré-condições: Workflow em Status inativo. Pós-condições: Workflow ativo. Eventos publicados: nenhum Evento dedicado. Regras: ativação nunca dispara execução imediata sem Trigger correspondente. Idempotência: por identificador. Validações conceituais: configuração completa e válida.

**`PauseWorkflow`** — Objetivo: suspender temporariamente um Workflow ativo. Owner: Automation Engine. Pré-condições: Workflow ativo. Pós-condições: Workflow pausado. Eventos publicados: `WorkflowPaused`. Regras: pausa preserva o progresso já executado. Idempotência: por identificador. Validações conceituais: nenhuma execução crítica em andamento no instante da pausa.

**`ResumeWorkflow`** — Objetivo: retomar Workflow pausado. Owner: Automation Engine. Pré-condições: Workflow em Status pausado. Pós-condições: Workflow ativo novamente. Eventos publicados: nenhum Evento dedicado. Regras: retomada nunca reexecuta etapa já concluída. Idempotência: por identificador. Validações conceituais: configuração ainda válida no momento da retomada.

**`StopWorkflow`** — Objetivo: encerrar definitivamente um Workflow. Owner: Automation Engine. Pré-condições: Workflow ativo ou pausado. Pós-condições: Workflow encerrado, histórico preservado. Eventos publicados: `WorkflowCompleted`. Regras: encerramento nunca remove o registro de execução. Idempotência: por identificador. Validações conceituais: motivo de encerramento presente.

**`ExecuteWorkflow`** — Objetivo: acionar manualmente a execução de um Workflow fora de seu Trigger padrão. Owner: Automation Engine. Pré-condições: Permission de execução manual confirmada. Pós-condições: execução iniciada. Eventos publicados: `WorkflowStarted`. Regras: execução manual respeita as mesmas pré-condições de uma execução automática. Idempotência: por identificador de execução. Validações conceituais: contexto de execução completo.

**`EvaluateRule`** — Objetivo: avaliar uma Regra condicional dentro de um Workflow em execução. Owner: Automation Engine. Pré-condições: contexto de avaliação disponível. Pós-condições: resultado da avaliação registrado. Eventos publicados: `RuleEvaluated`. Regras: avaliação nunca produz efeito de escrita fora do próprio Automation Engine. Idempotência: por identificador e contexto de avaliação. Validações conceituais: contexto compatível com a Regra configurada.

### AI Hub

Reforça-se, para toda esta seção, o princípio central já estabelecido em `AI_HUB.md`, Capítulo 5: o AI Hub nunca altera estado operacional de nenhum Business Hub. Todo Command desta seção produz um resultado de inferência, nunca uma mudança de estado de negócio.

**`GenerateAIRecommendation`** — Objetivo: produzir sugestão a partir de inferência automatizada. Owner: AI Hub. Pré-condições: contexto de entrada suficiente. Pós-condições: sugestão registrada, sujeita a confirmação humana. Eventos publicados: `RecommendationProduced`. Regras: sugestão nunca é aplicada sem confirmação humana ou Regra determinística. Idempotência: por identificador da inferência. Validações conceituais: nível de confiança mínimo atingido.

**`GeneratePrediction`** — Objetivo: produzir projeção a partir de modelo de inferência. Owner: AI Hub. Pré-condições: dado de entrada suficiente. Pós-condições: projeção registrada. Eventos publicados: `PredictionProduced`. Regras: projeção nunca é tratada como garantia de resultado. Idempotência: por identificador. Validações conceituais: modelo aplicável ao contexto fornecido.

**`GenerateSummary`** — Objetivo: produzir sumarização automatizada de conteúdo. Owner: AI Hub. Pré-condições: conteúdo de origem disponível. Pós-condições: sumarização registrada. Eventos publicados: `SummarizationCompleted`. Regras: sumarização referencia sempre o conteúdo de origem. Idempotência: por identificador do conteúdo e da versão processada. Validações conceituais: conteúdo dentro do limite de processamento suportado.

**`GenerateClassification`** — Objetivo: classificar uma Entidade por categoria inferida. Owner: AI Hub. Pré-condições: dado de entrada suficiente. Pós-condições: classificação registrada. Eventos publicados: `ClassificationCompleted`. Regras: classificação nunca decide sozinha uma ação de negócio. Idempotência: por identificador da Entidade classificada. Validações conceituais: categoria pertence ao conjunto já configurado.

**`AnalyzeBusinessContext`** — Objetivo: produzir análise consolidada assistida por IA sobre um contexto de negócio. Owner: AI Hub. Pré-condições: contexto suficiente fornecido pelo módulo solicitante. Pós-condições: análise registrada. Eventos publicados: `AIAnalysisCompleted`. Regras: análise nunca substitui a Validation do módulo solicitante. Idempotência: por identificador da análise. Validações conceituais: contexto compatível com o tipo de análise solicitada.

### Knowledge Hub

**`CreateKnowledge`** — Objetivo: registrar novo Document na Knowledge Base. Owner: Knowledge Hub. Pré-condições: conteúdo válido fornecido. Pós-condições: Document persistido. Eventos publicados: `KnowledgeCreated`. Regras: Document nunca altera negócio diretamente. Idempotência: por identificador de submissão. Validações conceituais: formato de conteúdo suportado.

**`UpdateKnowledge`** — Objetivo: atualizar Document já indexado. Owner: Knowledge Hub. Pré-condições: Document existente. Pós-condições: nova versão registrada. Eventos publicados: `KnowledgeUpdated`. Regras: versão anterior é preservada. Idempotência: por identificador e versão. Validações conceituais: conteúdo revisado válido.

**`IndexKnowledge`** — Objetivo: gerar indexação semântica de um Document. Owner: Knowledge Hub. Pré-condições: Document já persistido. Pós-condições: Embedding gerado, Retrieval Index atualizado. Eventos publicados: `KnowledgeIndexed`, `SemanticIndexUpdated`. Regras: indexação nunca altera o conteúdo original do Document. Idempotência: por identificador e versão do Document. Validações conceituais: conteúdo processável pelo modelo de indexação.

**`ArchiveKnowledge`** — Objetivo: arquivar Document não mais relevante. Owner: Knowledge Hub. Pré-condições: Document existente. Pós-condições: Document arquivado, removido do Retrieval Index ativo. Eventos publicados: `KnowledgeArchived`. Regras: arquivamento preserva o registro para auditoria. Idempotência: por identificador. Validações conceituais: motivo de arquivamento presente.

### Identity Hub

**`CreateUser`** — Objetivo: registrar novo Usuário. Owner: Identity Hub. Pré-condições: Tenant válido, dado de identificação único. Pós-condições: Usuário persistido. Eventos publicados: `UserCreated`. Regras: Usuário sempre pertence a exatamente um Tenant. Idempotência: por identificador de identificação externa. Validações conceituais: unicidade de identificação dentro do Tenant.

**`AssignRole`** — Objetivo: atribuir Role a um Usuário. Owner: Identity Hub. Pré-condições: Usuário e Role existentes. Pós-condições: atribuição registrada. Eventos publicados: `RoleAssigned`. Regras: atribuição nunca contorna hierarquia de aprovação já configurada. Idempotência: por identificador do Usuário e da Role. Validações conceituais: Role compatível com o Tenant do Usuário.

**`GrantPermission`** — Objetivo: conceder Permission granular a um Usuário. Owner: Identity Hub. Pré-condições: Permission existente no catálogo do Tenant. Pós-condições: concessão registrada. Eventos publicados: `PermissionGranted`. Regras: concessão é sempre auditável. Idempotência: por identificador do Usuário e da Permission. Validações conceituais: Permission aplicável ao módulo referenciado.

**`CreateTenant`** — Objetivo: provisionar novo Tenant. Owner: Identity Hub. Pré-condições: dado cadastral mínimo válido. Pós-condições: Tenant persistido e isolado. Eventos publicados: `TenantCreated`. Regras: todo dado futuro do Tenant é isolado desde sua criação. Idempotência: por identificador cadastral externo. Validações conceituais: unicidade de identificação do Tenant.

**`StartSession`** — Objetivo: iniciar Session autenticada. Owner: Identity Hub. Pré-condições: Authentication bem-sucedida. Pós-condições: Session ativa registrada. Eventos publicados: `SessionStarted`, `AuthenticationSucceeded`. Regras: Session possui tempo de vida limitado e configurável. Idempotência: por identificador de tentativa de autenticação. Validações conceituais: credencial válida e não expirada.

**`RevokeAccess`** — Objetivo: revogar Permission, Role ou Session de um Usuário. Owner: Identity Hub. Pré-condições: concessão ou Session ativa existente. Pós-condições: acesso revogado imediatamente. Eventos publicados: nenhum Evento dedicado; tratado como Security Event interno. Regras: revogação é sempre auditável e imediata. Idempotência: por identificador do Usuário e do escopo revogado. Validações conceituais: escopo de revogação claramente delimitado.

### Integration Hub

**`CreateConnector`** — Objetivo: configurar novo Connector com Provider externo. Owner: Integration Hub. Pré-condições: credencial de acesso ao Provider válida. Pós-condições: Connector persistido. Eventos publicados: `ConnectorCreated`. Regras: Connector nunca é acessado diretamente por nenhum Business Hub além do Integration Hub. Idempotência: por identificador de configuração. Validações conceituais: credencial verificada junto ao Provider.

**`ImportData`** — Objetivo: importar dado de sistema externo. Owner: Integration Hub. Pré-condições: Connector já configurado. Pós-condições: dado importado e encaminhado ao Hub proprietário correspondente. Eventos publicados: `ImportCompleted`. Regras: Integration Hub nunca decide a interpretação de negócio do dado importado. Idempotência: por identificador de execução da importação. Validações conceituais: formato compatível com o Hub de destino.

**`ExportData`** — Objetivo: exportar dado para sistema externo. Owner: Integration Hub. Pré-condições: Connector já configurado, dado de origem já autorizado para exportação. Pós-condições: dado entregue ao destino externo. Eventos publicados: `ExportCompleted`. Regras: exportação respeita a mesma Permission já aplicada ao dado de origem. Idempotência: por identificador de execução. Validações conceituais: destino externo validado.

**`RegisterWebhook`** — Objetivo: processar notificação técnica recebida de sistema externo. Owner: Integration Hub. Pré-condições: Webhook validado quanto à origem e à assinatura. Pós-condições: Webhook processado e encaminhado ao Hub proprietário correspondente. Eventos publicados: `WebhookDelivered`. Regras: Webhook nunca é processado sem validação de origem. Idempotência: por identificador único do Webhook. Validações conceituais: assinatura de origem confirmada.

**`SynchronizeData`** — Objetivo: sincronizar dado bidirecionalmente com sistema externo. Owner: Integration Hub. Pré-condições: Connector configurado para sincronização. Pós-condições: ambos os lados consistentes. Eventos publicados: `SynchronizationCompleted`. Regras: divergência de sincronização é sinalizada, nunca resolvida silenciosamente. Idempotência: por identificador de execução. Validações conceituais: ambos os lados acessíveis no momento da execução.

### Branding Hub

**`UpdateTheme`** — Objetivo: atualizar Brand Theme de uma Empresa. Owner: Branding Hub. Pré-condições: Theme existente. Pós-condições: nova versão do Theme registrada. Eventos publicados: `ThemeUpdated`. Regras: atualização nunca altera conteúdo de negócio de documento já gerado anteriormente. Idempotência: por identificador e versão. Validações conceituais: paleta e tipografia dentro do padrão suportado.

**`PublishBrandAssets`** — Objetivo: disponibilizar novo Brand Asset. Owner: Branding Hub. Pré-condições: Asset validado quanto a formato. Pós-condições: Asset disponível para uso. Eventos publicados: `BrandAssetChanged`. Regras: Asset publicado não é removido, apenas substituído por nova versão. Idempotência: por identificador. Validações conceituais: formato de arquivo suportado.

**`UpdatePalette`** — Objetivo: atualizar paleta de cor de uma Empresa. Owner: Branding Hub. Pré-condições: paleta anterior existente. Pós-condições: nova paleta registrada. Eventos publicados: `BrandPaletteUpdated`. Regras: paleta nunca é aplicada retroativamente a documento já gerado. Idempotência: por identificador e versão. Validações conceituais: contraste mínimo de acessibilidade respeitado.

### Business Profile Engine

**`CreateBusinessProfile`** — Objetivo: registrar novo Business Profile de Empresa cliente. Owner: Business Profile Engine. Pré-condições: dado cadastral mínimo disponível. Pós-condições: Business Profile persistido com Segmento e Maturidade iniciais. Eventos publicados: `BusinessProfileCreated`. Regras: todo Tenant possui exatamente um Business Profile. Idempotência: por identificador do Tenant. Validações conceituais: classificação inicial dentro do conjunto suportado.

**`EnableCapability`** — Objetivo: habilitar capacidade específica para uma Empresa. Owner: Business Profile Engine. Pré-condições: capacidade existente no catálogo da plataforma. Pós-condições: capacidade habilitada. Eventos publicados: `CapabilityEnabled`. Regras: habilitação nunca contorna Permission já configurada pelo Identity Hub. Idempotência: por identificador da capacidade e do Tenant. Validações conceituais: capacidade compatível com o Segmento da Empresa.

**`DisableCapability`** — Objetivo: desabilitar capacidade específica. Owner: Business Profile Engine. Pré-condições: capacidade atualmente habilitada. Pós-condições: capacidade desabilitada. Eventos publicados: `CapabilityDisabled`. Regras: desabilitação preserva dado histórico já produzido pela capacidade. Idempotência: por identificador da capacidade e do Tenant. Validações conceituais: nenhuma dependência ativa bloqueante.

**`UpdateBusinessProfile`** — Objetivo: atualizar classificação de Segmento ou Maturidade. Owner: Business Profile Engine. Pré-condições: Business Profile existente. Pós-condições: classificação atualizada. Eventos publicados: nenhum Evento dedicado; consolidado sob `BusinessAdaptationCompleted` quando acompanhado de recalibração. Regras: atualização nunca é aplicada sem critério objetivo de reclassificação. Idempotência: por identificador e timestamp. Validações conceituais: nova classificação pertence ao conjunto suportado.

**`RunAdaptation`** — Objetivo: executar ciclo de adaptação de configuração da plataforma para uma Empresa. Owner: Business Profile Engine. Pré-condições: Business Profile já classificado. Pós-condições: configuração recalibrada em todo módulo aplicável. Eventos publicados: `BusinessAdaptationCompleted`. Regras: adaptação nunca altera diretamente a estrutura interna de nenhum Business Hub, apenas seu Configuration exposto. Idempotência: por identificador do ciclo. Validações conceituais: escopo de recalibração explicitamente delimitado.

---

## 5. Classificação dos Commands

Business Commands são todo Command que altera diretamente uma Entidade de negócio reconhecível — `CreateInvoice`, `CreateCampaign`, `ConvertLead` — a categoria dominante deste catálogo, distribuída pelos cinco Business Hubs.

Platform Commands são todo Command de escopo estrutural da própria plataforma — `CreateTenant`, `CreateUser` — publicados pelo Identity Hub e pelo Business Profile Engine.

Administrative Commands são todo Command que configura ou recalibra um módulo sem alterar diretamente uma Entidade de negócio transacional — `UpdateTheme`, `EnableCapability`, `UpdateBusinessProfile`.

Lifecycle Commands são todo Command que transiciona o estágio de vida de uma Entidade — `ArchiveCustomer`, `CloseOpportunity`, `StopWorkflow` — presentes em praticamente todo módulo.

Analytical Commands são todo Command que produz ou atualiza indicador consolidado — `CalculateMetric`, `CalculateKPI`, `GenerateForecast` — publicados exclusivamente pelo Analytics Hub.

Security Commands são todo Command relativo a autenticação, autorização ou acesso — `AssignRole`, `GrantPermission`, `RevokeAccess` — publicados exclusivamente pelo Identity Hub.

Integration Commands são todo Command que media comunicação técnica com sistema externo — `ImportData`, `ExportData`, `SynchronizeData` — publicados exclusivamente pelo Integration Hub.

AI Commands são todo Command que produz resultado de inferência automatizada — `GenerateAIRecommendation`, `GeneratePrediction`, `GenerateClassification` — publicados exclusivamente pelo AI Hub, sempre sujeitos a Human Oversight antes de qualquer efeito de negócio decorrente.

```
                    CLASSIFICAÇÃO DOS COMMANDS
   ┌───────────────────────────────────────────────────────────┐
   │  Business Commands:      CRM · Communication · Finance · Growth │
   │  Platform Commands:      Identity Hub · Business Profile Engine    │
   │  Administrative Commands: Branding Hub · Business Profile Engine        │
   │  Lifecycle Commands:      presentes em praticamente todo módulo             │
   │  Analytical Commands:     Analytics Hub                                        │
   │  Security Commands:       Identity Hub                                            │
   │  Integration Commands:    Integration Hub                                             │
   │  AI Commands:             AI Hub                                                          │
   └───────────────────────────────────────────────────────────┘
```

---

## 6. Fluxo Oficial

```
   Command
      │
      ▼
   Validation
      │
      ▼
   Execution
      │
      ▼
   Domain Event
      │
      ▼
   Consumers
```

Este é o fluxo padrão de todo Command da plataforma: recebido pelo módulo proprietário, validado contra pré-condições e invariantes, executado com efeito de escrita real, e finalizado com a publicação do Evento correspondente já catalogado em `EVENT_CATALOG.md` — nenhum Command é considerado concluído antes dessa publicação, quando aplicável.

```
   Automation
      │
      ▼
   Command
      │
      ▼
   Business Hub
      │
      ▼
   Events
      │
      ▼
   Analytics
```

Este segundo fluxo demonstra como o Automation Engine invoca um Command formal já exposto por um Business Hub — nunca contornando sua Validation —, e como o Evento resultante alimenta, em seguida, a consolidação analítica do Analytics Hub.

```
   AI Hub
      │
      ▼
   Sugestão (nunca um Command direto)
      │
      ▼
   Confirmação humana
      │
      ▼
   Command formal
      │
      ▼
   Business Hub proprietário
```

Este terceiro fluxo reforça o princípio AI Never Executes Commands já descrito no Capítulo 3 — toda sugestão do AI Hub passa por confirmação humana antes que qualquer Command real seja processado por seu Hub proprietário.

```
   Usuário
      │
      ▼
   Command
      │
      ▼
   Validation (rejeita se inválido)
      │
      ├──► Falha ──► resposta de erro, nenhum efeito de escrita
      │
      └──► Sucesso ──► Execution ──► Domain Event ──► Consumers
```

Este quarto fluxo demonstra o caminho de rejeição — todo Command inválido é recusado antes de qualquer efeito de escrita, e nenhum Evento é publicado para uma execução que não se consolidou.

---

## 7. Regras de Execução

Somente o Owner executa — todo Command é processado exclusivamente pelo módulo já registrado como seu proprietário em `DOMAIN_OWNERSHIP_MATRIX.md`.

Commands validam invariantes — nenhum Command é executado sem que suas pré-condições de negócio sejam integralmente verificadas antes do efeito de escrita.

Commands podem publicar Events — todo Command bem-sucedido publica o Evento correspondente já catalogado em `EVENT_CATALOG.md`.

Commands nunca alteram domínio externo — nenhum Command produz efeito de escrita sobre Entidade que não pertença ao seu próprio módulo proprietário.

Commands nunca retornam Dashboards — o retorno de um Command é sempre confirmação de sucesso, de falha, ou identificador afetado, nunca um Read Model analítico.

Commands respeitam ownership — nenhuma exceção de execução é aceita mesmo sob justificativa de urgência operacional.

Todo Command é processado de forma transacional dentro de seu próprio módulo — ou todo o efeito de escrita é aplicado, ou nenhum.

Nenhum Command depende de resposta síncrona de outro módulo para sua própria conclusão, salvo quando essa dependência é uma pré-condição explícita já documentada.

Toda falha de Validation produz mensagem de rejeição clara, nunca um efeito parcial de escrita.

Todo Command carrega identificador de submissão suficiente para deduplicação, conforme detalhado no Capítulo 8.

Nenhum Command é executado sem verificação prévia de Permission junto ao Identity Hub.

Toda mudança de contrato de Command é versionada, nunca aplicada retroativamente sobre execuções já concluídas em versão anterior.

Nenhum Command é removido deste catálogo sem que seu módulo proprietário registre formalmente sua descontinuação.

Todo novo Command, ao ser introduzido, é registrado neste catálogo antes de sua primeira execução em produção.

Commands que produzem efeito financeiro seguem sempre o padrão de idempotência mais rigoroso já exigido em `FINANCE_HUB.md`, Capítulo 5.

Commands que alteram Permission ou Role são sempre auditáveis de forma imutável.

Nenhum Command invoca diretamente outro Command de módulo distinto — toda colaboração entre módulos acontece por Evento, nunca por encadeamento direto de Command.

Um Command pode invocar outro Command dentro do mesmo módulo proprietário, desde que ambos pertençam à mesma transação lógica de escrita.

Toda Execution de Command é observável através de Logs e de Tracing, conforme já exigido em cada Hub desta série.

Nenhum Command é aceito sem um propósito de negócio claramente identificável — Commands puramente técnicos de infraestrutura não pertencem a este catálogo.

---

## 8. Idempotência

Idempotência de Command é exigida sempre que seu reprocessamento acidental poderia produzir efeito de negócio duplicado — capturar um Payment duas vezes, criar duas Invoice idênticas, ou registrar duas vezes o mesmo Conversion Event.

Idempotência não é exigida da mesma forma para Commands cujo reprocessamento é naturalmente inofensivo — uma segunda chamada a `ArchiveDashboard` sobre um Dashboard já arquivado simplesmente confirma o estado já existente, sem produzir efeito adicional prejudicial, ainda que a boa prática recomende tratar mesmo esses casos de forma consistente.

Retry, quando uma falha de rede ou de infraestrutura interrompe a confirmação de um Command já processado, reenvia o mesmo Command ao módulo proprietário, que deve reconhecer, através de seu identificador de submissão, que a operação já foi concluída anteriormente.

Deduplicação é a técnica pela qual o módulo proprietário identifica, através do identificador único de submissão já exigido no Capítulo 7, que um Command específico já foi processado, retornando o resultado já consolidado em vez de reexecutar o efeito de escrita.

Reprocessamento, neste contexto, é sempre tratado como uma consequência aceita da garantia de entrega do Command já descrita no Capítulo 6 — o Usuário ou o módulo solicitante nunca precisa se preocupar com duplicação, porque essa garantia é responsabilidade do módulo proprietário, nunca do solicitante.

Esta atribuição de responsabilidade — sempre ao módulo proprietário, nunca ao solicitante — espelha exatamente a mesma decisão já registrada em `EVENT_CATALOG.md`, Capítulo 11, para a idempotência de consumo de Evento. A simetria não é coincidência: um Command que produz efeito duplicado e um Evento que é processado duas vezes representam o mesmo risco técnico fundamental — reenvio de uma mesma solicitação, seja ela uma intenção de mudança ou um fato já publicado —, e a plataforma responde a esse risco com a mesma disciplina em ambos os lados do fluxo já descrito no Capítulo 6.

Um caso específico que merece o mesmo destaque já dado em `EVENT_CATALOG.md`, Capítulo 11, é a idempotência de Command com efeito financeiro. `CapturePayment`, `IssueRefund` e `ApplyFinancialAdjustment` seguem a garantia de idempotência mais rigorosa de toda a plataforma, aplicação direta do princípio Idempotent Payments já estabelecido em `FINANCE_HUB.md`, Capítulo 5 — nenhuma quantidade de retry, por maior que seja, jamais resulta em uma segunda captura de valor do Cliente ou em uma segunda devolução do mesmo Payment.

---

```
              GARANTIA DE IDEMPOTÊNCIA (exemplo)
   ┌───────────────────────────────────────────────────────────┐
   │  CapturePayment (submissão 1) ──► processado ──► sucesso        │
   │  CapturePayment (submissão 1, reenviada por retry) ──►               │
   │    identificador já reconhecido ──► resultado já consolidado             │
   │    retornado, nenhuma nova captura processada                                │
   └───────────────────────────────────────────────────────────┘
```

---

## 9. Versionamento

Compatibilidade é preservada sempre que uma nova versão de um Command adiciona um parâmetro opcional, nunca quando remove ou altera o significado de um parâmetro já existente na versão anterior.

Evolução de um Command segue o mesmo princípio de extensão aditiva já aplicado à evolução de Evento em `EVENT_CATALOG.md`, Capítulo 8 — um novo parâmetro pode ser adicionado sem exigir nova versão, desde que consumidores existentes possam omiti-lo com segurança.

Depreciação é o estado formal de uma versão de Command que ainda é aceita, mas cuja substituição já foi anunciada e cujo prazo de descontinuação já está definido.

Breaking Changes — remoção de parâmetro, alteração de tipo, ou modificação de significado de um parâmetro existente — exigem sempre nova versão de Command, aceita em paralelo à versão anterior durante todo o período de transição.

Migração de um consumidor de uma versão antiga de Command para uma nova é sempre responsabilidade do próprio consumidor, nunca do módulo proprietário — o proprietário apenas garante que ambas as versões permaneçam aceitas durante a janela de transição já acordada.

---

## 10. Segurança

RBAC, administrado pelo Identity Hub, determina qual Perfil de Usuário está autorizado a submeter qual categoria de Command — um Perfil Financeiro submete `CapturePayment`, um Perfil Comercial submete `CreateLead`, conforme já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 11.

ABAC complementa essa autorização com atributo contextual — um Usuário pode ter Permission geral para `ApplyFinancialAdjustment`, mas essa Permission pode ser adicionalmente restrita a um limite de valor específico, verificado no momento da submissão.

Tenant Isolation garante que todo Command submetido por um Usuário afete exclusivamente dado do Tenant a que esse Usuário pertence, sem exceção.

Auditoria preserva o registro imutável de todo Command sensível — `ApplyFinancialAdjustment`, `IssueRefund`, `RevokeAccess` — junto ao Usuário que o submeteu e ao momento da submissão.

Autorização é verificada antes de qualquer Validation de negócio — um Command submetido sem Permission adequada é recusado antes mesmo de sua verificação de pré-condição, evitando qualquer exposição de dado de negócio a um solicitante não autorizado.

Permissões são sempre explícitas e nomeadas — nenhum Command é implicitamente permitido por ausência de restrição; toda Permission necessária é positivamente concedida através do próprio Identity Hub.

---

## 11. Casos de Uso

**Fechamento de negociação comercial.** Um Usuário do Perfil Comercial submete `CloseOpportunity` no CRM Hub, que por sua vez publica Evento consumido pelo Finance Hub para criar a Invoice correspondente através de `CreateInvoice`.

**Cobrança recorrente automatizada.** O Automation Engine, ao identificar que um ciclo de Subscription está devido, submete `GenerateRecurringInvoice` ao Finance Hub, respeitando integralmente suas pré-condições.

**Correção de estado financeiro.** Um Gestor Financeiro, após identificar uma divergência através de `StartReconciliation`, submete `ApplyFinancialAdjustment`, exigindo Permission de nível restrito conforme já estabelecido no Capítulo 10.

**Lançamento de campanha de aquisição.** Um Gestor de Crescimento submete `CreateCampaign` seguido de `CreateAudience` e, ao concluir a configuração, `StartCampaign`, acionando o Automation Engine para disparar a Journey associada.

**Encerramento de experimento com significância estatística.** O Growth Hub, ao confirmar que um Experiment atingiu significância suficiente, aceita a submissão de `FinishExperiment`, que produz Winner Selection e o Evento correspondente.

**Aplicação de sugestão de IA confirmada por humano.** O AI Hub produz uma sugestão através de `GenerateAIRecommendation`; um Usuário revisa e confirma; somente então um Command formal, como `ApplyDiscount` no Finance Hub, é efetivamente submetido.

**Onboarding de novo Tenant.** O Identity Hub processa `CreateTenant`, seguido pela submissão automática de `CreateBusinessProfile` pelo Business Profile Engine, inicializando a configuração adaptativa da nova Empresa.

**Atualização de identidade visual antes de emissão de documento.** Um Gestor de Marca submete `UpdateTheme` no Branding Hub antes que o Finance Hub gere um novo lote de Invoice, garantindo que o Financial Document reflita a identidade atualizada.

**Reindexação de política após revisão de conteúdo.** Um Especialista de Conhecimento submete `UpdateKnowledge` seguido de `IndexKnowledge`, atualizando o Retrieval Index consultado pelo AI Hub em sugestões futuras.

**Revogação de acesso após desligamento.** O Identity Hub processa `RevokeAccess` imediatamente após confirmação de desligamento de um Usuário, encerrando toda Session ativa e toda Permission concedida.

**Sincronização de dado com sistema contábil externo.** O Integration Hub processa `SynchronizeData` periodicamente, mediando a comparação entre o Ledger interno do Finance Hub e um sistema contábil externo, sem que o Finance Hub jamais se comunique diretamente com esse sistema.

**Habilitação de nova capacidade por reclassificação de Segmento.** O Business Profile Engine, ao processar `UpdateBusinessProfile` para uma Empresa que cresceu de porte, submete em seguida `EnableCapability` para uma funcionalidade antes indisponível a seu Segmento anterior.

---

## 12. Architecture Decision Records

**ADR-001 — Commands representam intenção, nunca fato consolidado.** Contexto: aplicação direta do princípio Commands Express Intent já descrito no Capítulo 3, distinguindo Command de Evento em toda a plataforma.

**ADR-002 — Todo Command possui exatamente um Owner.** Contexto: aplicação direta de `DOMAIN_OWNERSHIP_MATRIX.md` à camada específica de escrita.

**ADR-003 — Commands publicam Events quando aplicável, nunca o inverso.** Contexto: preservar a direção única de causalidade entre intenção validada e fato consolidado.

**ADR-004 — Automation executa Commands em nome de um processo temporizado, nunca em nome de um domínio de negócio que não lhe pertence.** Contexto: aplicação da fronteira entre execução e ownership já estabelecida em `AUTOMATION_ENGINE.md`.

**ADR-005 — Analytics nunca executa Command operacional de CRM, Communication, Finance ou Growth.** Contexto: já fixado em `ANALYTICS_HUB.md`, ADR-001, reafirmado aqui como regra transversal deste catálogo.

**ADR-006 — AI recomenda através de resultado de inferência, nunca invoca Command de negócio diretamente.** Contexto: aplicação do princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5.

**ADR-007 — Identity controla todo acesso a todo Command da plataforma.** Contexto: aplicação transversal do modelo RBAC e ABAC já estabelecido em `IDENTITY_HUB.md`.

**ADR-008 — Finance controla todo Command que produz efeito financeiro.** Contexto: já fixado em `FINANCE_DOMAIN_BLUEPRINT.md`, ADR-001, aplicado aqui à camada de Command.

**ADR-009 — CRM controla todo Command que altera relacionamento.** Contexto: já fixado em `CRM_DOMAIN_BLUEPRINT.md`.

**ADR-010 — Communication controla todo Command que altera comunicação.** Contexto: já fixado em `COMMUNICATION_DOMAIN_BLUEPRINT.md`.

**ADR-011 — Growth controla todo Command que altera estratégia de crescimento.** Contexto: já fixado em `GROWTH_DOMAIN_BLUEPRINT.md`, ADR-001.

**ADR-012 — Nenhum Command é executado sem Validation prévia de suas pré-condições.** Contexto: garantir que nenhum efeito de escrita seja aplicado sobre um estado inválido de negócio.

**ADR-013 — Nenhum Command invoca diretamente um Command de módulo distinto — toda colaboração entre módulos acontece por Evento.** Contexto: preservar Low Coupling entre Business Hubs, Platform Services e componentes de Adaptive Intelligence.

**ADR-014 — Commands com efeito financeiro seguem garantia de idempotência mais rigorosa do que qualquer outro Command da plataforma.** Contexto: já fixado em `FINANCE_HUB.md`, Capítulo 5, sob o princípio Idempotent Payments.

**ADR-015 — Nomes de Command colidentes entre módulos são desambiguados neste catálogo sem alterar seu comportamento original.** Contexto: resolver a coincidência de nome "Generate Recommendation" entre Growth Hub, Analytics Hub e AI Hub, preservando Single Owner sem ambiguidade de leitura.

**ADR-016 — Breaking Changes de contrato de Command exigem publicação em paralelo de versão antiga e nova.** Contexto: preservar compatibilidade retroativa já detalhada no Capítulo 9.

**ADR-017 — Todo Command sensível é auditável de forma imutável.** Contexto: aplicação transversal do princípio Auditability by Design já presente em cada Hub desta série.

**ADR-018 — Este catálogo é normativo, não apenas descritivo.** Um Command executado em produção que diverge deste catálogo é tratado como defeito de implementação a ser corrigido, nunca como justificativa para atualizar o catálogo em sentido contrário à intenção original de seu proprietário.

**ADR-019 — Todo novo Command é registrado neste catálogo antes de sua primeira execução em produção.** Contexto: garantir que este documento nunca fique desatualizado frente à evolução real da plataforma.

**ADR-020 — Nenhum Command retorna estrutura de leitura analítica.** Contexto: preservar a separação estrita entre Command e Query já central ao padrão CQRS aplicado em toda a plataforma.

---

## 13. Glossário

**Command** — instrução que expressa intenção de mudança de estado, processada exclusivamente pelo módulo proprietário do conceito envolvido.

**Intent** — propriedade central de todo Command: comunicar o que se deseja que aconteça, antes de esse fato se consolidar.

**Invariant** — regra de negócio que deve permanecer verdadeira antes e depois da execução de um Command.

**Write Model** — estrutura de escrita mantida exclusivamente pelo módulo proprietário de um conceito.

**Validation** — verificação de pré-condições e de invariantes de negócio, realizada antes de qualquer efeito de escrita de um Command.

**Execution** — aplicação efetiva do efeito de escrita de um Command já validado com sucesso.

**Ownership** — atribuição exclusiva de autoridade de execução de um Command a um único módulo.

**Aggregate** — agrupamento de Entidade e de Regra de negócio tratado como unidade consistente de escrita por um Command.

**Consistency** — garantia de que todo efeito de escrita de um Command é aplicado de forma transacional, integralmente ou não aplicado.

**CQRS** — Command-Query Responsibility Segregation, o padrão que separa toda operação de escrita, através de Command, de toda operação de leitura, através de Query.

**Idempotency** — garantia de que o reprocessamento de um mesmo Command nunca produz efeito de escrita duplicado.

**Authorization** — verificação de Permission antes de qualquer Validation de negócio de um Command.

---

## 14. Conclusão

Este documento passa a ser a autoridade oficial para todo Command já executado ou a ser executado pela Adaptive Business Platform. Ele não substitui nenhum dos cinco Business Hubs já documentados — cada Command aqui catalogado permanece integralmente definido, com toda sua Regra de negócio associada, em seu documento de arquitetura original.

Todo novo Command deverá ser registrado aqui antes de sua primeira execução em produção, respeitando exatamente a mesma estrutura de oito atributos já aplicada a cada entrada deste catálogo: Owner, Objetivo, Pré-condições, Pós-condições, Eventos publicados, Regras, Idempotência e Validações conceituais.

A distinção central que este documento reforça, junto a `EVENT_CATALOG.md`, permanece: Commands representam intenção. Events representam fatos. Queries representam leitura. Nenhuma das três categorias jamais assume o papel da outra em nenhum módulo da Adaptive Business Platform.

Este catálogo respeita integralmente `DOMAIN_OWNERSHIP_MATRIX.md`, sem alterar nenhuma atribuição de ownership ali registrada; respeita integralmente `EVENT_CATALOG.md`, garantindo que todo Command bem-sucedido produza exatamente o Evento correspondente já catalogado; e respeita integralmente todos os Hubs oficiais já documentados — CRM, Communication, Finance, Growth e Analytics —, consolidando, sem redefinir, a camada de escrita que cada um já expõe ao restante da plataforma.

Com a publicação deste documento, a Adaptive Business Platform consolida as três camadas fundamentais de sua arquitetura de governança transversal: quem é dono de cada conceito, já resolvido por `DOMAIN_OWNERSHIP_MATRIX.md`; como cada domínio comunica seus próprios fatos de negócio, já resolvido por `EVENT_CATALOG.md`; e como cada domínio aceita solicitação de mudança de estado, agora resolvido por este catálogo. Toda futura extensão da plataforma — um sexto Business Hub, um novo Platform Service — herda, por este precedente, a mesma obrigação de registrar seus próprios Commands aqui, com o mesmo rigor descritivo já aplicado a cada uma das entradas deste documento.
