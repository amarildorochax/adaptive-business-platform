# Query Catalog

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento consolida oficialmente e de forma definitiva o catálogo de todos os modelos de leitura — Queries e seus Read Models correspondentes — da Adaptive Business Platform. Ele não altera nenhuma decisão de ownership já registrada em `DOMAIN_OWNERSHIP_MATRIX.md`, não redefine nenhum Evento já catalogado em `EVENT_CATALOG.md`, e não redefine nenhum Command já catalogado em `COMMAND_CATALOG.md`. O que este documento adiciona é uma referência única e consultável, na qual toda Query da plataforma pode ser localizada junto ao seu proprietário, à origem de seu dado, aos seus consumidores, às Projeções que a sustentam e às suas garantias de consistência e de autorização.

CQRS — Command-Query Responsibility Segregation — já foi introduzido em `COMMAND_CATALOG.md`, Capítulo 1, como o padrão que separa toda operação sobre um domínio em duas categorias mutuamente exclusivas: Command, que expressa intenção de mudança de estado, e Query, que expressa leitura sem efeito colateral. Este documento é dedicado integralmente à segunda categoria, completando a tríade iniciada por `EVENT_CATALOG.md` e por `COMMAND_CATALOG.md`.

Read Model é a estrutura de dado otimizada especificamente para leitura, materializada a partir de Evento já publicado, nunca a mesma estrutura usada para escrita por um Command. Todo Read Model é derivado, nunca uma fonte primária de verdade — a fonte primária permanece sempre no Write Model do módulo proprietário, conforme já estabelecido em cada Hub desta série.

Query é a operação que consulta um Read Model já materializado, retornando um resultado de leitura sem jamais produzir efeito de escrita, sem jamais publicar Evento, e sem jamais executar Command.

Projection é o processo técnico que transforma um Evento consumido em atualização de um Read Model — a mesma lógica de consolidação já descrita, por exemplo, pelo Aggregation Manager em `ANALYTICS_HUB.md`, Capítulo 7, aplicada aqui como conceito transversal a toda a plataforma.

Materialized Views são a implementação física mais comum de um Read Model — uma estrutura de dado já pré-computada e otimizada para o padrão de consulta que sustenta, permitindo que uma Query retorne resultado sem recomputar Aggregation a cada chamada.

A separação entre leitura e escrita é o princípio arquitetural central deste documento e de todo o padrão CQRS já aplicado nesta plataforma: nenhum módulo mistura, em uma única estrutura, a responsabilidade de sustentar escrita transacional e a responsabilidade de sustentar leitura otimizada — as duas evoluem de forma independente, cada uma otimizada para sua própria natureza de uso.

A diferença entre Commands, Events e Queries já foi estabelecida de forma progressiva por esta série de documentos: um Command comunica o que se deseja que aconteça; um Evento comunica o que já aconteceu; uma Query comunica o que já é possível ler a partir do que já aconteceu. As três categorias nunca se confundem — um Command nunca retorna um Read Model, conforme já fixado em `COMMAND_CATALOG.md`, ADR-020; um Evento nunca é usado como substituto de uma Query, conforme já fixado em `EVENT_CATALOG.md`; e uma Query, o objeto central deste documento, nunca produz o efeito de nenhuma das outras duas categorias.

Consultas otimizadas para consumo são o propósito final de todo Read Model catalogado neste documento — cada um é desenhado para responder rapidamente ao padrão de leitura que seu consumidor mais frequente precisa, nunca para servir como estrutura genérica de propósito indefinido.

A necessidade de um catálogo consolidado de Query, completando a tríade já iniciada por `EVENT_CATALOG.md` e por `COMMAND_CATALOG.md`, segue o mesmo raciocínio já aplicado aos dois documentos anteriores: depois que cinco Business Hubs, quatro Platform Services e três componentes de Adaptive Intelligence já expõem, cada um, seu próprio conjunto de Query, a única forma de garantir que um novo consumidor encontre rapidamente o Read Model que precisa consultar, sem reler cada documento de arquitetura por completo, é uma referência única que resuma o contrato essencial de cada Query já publicada.

Este catálogo também torna explícita uma distinção que, embora já praticada individualmente em cada Hub desta série, nunca havia sido consolidada de forma transversal: nem toda Query tem a mesma origem de dado. Algumas, como `CustomerView` ou `InvoiceView`, consultam exclusivamente o Read Model de seu próprio módulo proprietário. Outras, como `ExecutiveDashboard` ou `DecisionSupportView`, consolidam Read Model de múltiplos módulos simultaneamente, sem que essa consolidação jamais implique posse sobre o dado de origem — uma distinção já reforçada, individualmente, em `ANALYTICS_HUB.md`, e aqui generalizada como propriedade de toda Query agregada da plataforma.

---

## 2. Objetivos

Este catálogo garante performance — todo Read Model é pré-computado especificamente para o padrão de consulta que sustenta, eliminando a necessidade de recomputar Aggregation a cada chamada de Query.

Este catálogo garante escalabilidade — porque a leitura é servida por estrutura fisicamente distinta da escrita, o volume de consulta em um domínio nunca compromete a capacidade de processamento transacional desse mesmo domínio.

Este catálogo garante especialização dos Read Models — cada Query catalogada é sustentada por um Read Model desenhado exclusivamente para seu próprio propósito, nunca por uma estrutura genérica compartilhada entre propósitos distintos.

Este catálogo garante baixo acoplamento — um consumidor de Query depende apenas do contrato de leitura já publicado, nunca da lógica interna de Projection que o produtor usa para materializar seu Read Model.

Este catálogo torna explícita a consistência eventual — toda Query documenta, de forma clara, a janela de latência aceitável entre a ocorrência de um Evento de origem e sua reflexão no Read Model consultado.

Este catálogo garante governança — nenhuma nova capacidade de leitura é considerada plenamente integrada à plataforma sem que sua Query correspondente esteja aqui registrada, com seu Owner e sua origem de dado explícitos.

Este catálogo garante reutilização — um Read Model já materializado por um módulo pode ser consumido por múltiplas Query e por múltiplos consumidores, sem exigir nova Projection para cada novo caso de uso.

Este catálogo garante segurança — toda Query documenta explicitamente sua regra de autorização, garantindo que nenhum Read Model seja consultado além do escopo de Permission do solicitante.

Este catálogo garante observabilidade — a existência de um catálogo único de todo modelo de leitura permite monitorar, de forma consolidada, a saúde de cada Projection Pipeline que sustenta a plataforma.

Estes nove objetivos, tomados em conjunto, definem o critério pelo qual qualquer proposta de mudança a este catálogo deve ser avaliada — uma mudança que melhora a performance de uma Query, mas compromete sua governança ou sua segurança, não é uma mudança aceitável; toda evolução deste catálogo precisa preservar os nove objetivos simultaneamente, nunca otimizar um às custas dos demais, mesmo princípio de coerência já aplicado em `EVENT_CATALOG.md`, Capítulo 2, e em `COMMAND_CATALOG.md`, Capítulo 2.

---

## 3. Princípios

**Queries Never Change State.** Toda Query é estritamente de leitura, sem exceção, nunca produzindo efeito colateral de escrita.

**Read Models Are Disposable.** Um Read Model pode ser descartado e reconstruído do zero a qualquer momento, sem perda de informação, porque sua fonte de verdade permanece sempre no histórico de Evento já publicado.

**Projection Before Query.** Nenhuma Query é resolvida antes que sua Projection correspondente já tenha materializado o Read Model consultado.

**Single Ownership.** Todo Read Model possui exatamente um módulo responsável por sua materialização, mesmo quando consolida dado de múltiplas origens.

**Read Models Respect Ownership.** Nenhum Read Model é tratado como fonte de verdade competindo com o proprietário original do conceito que representa.

**Events Feed Read Models.** Todo Read Model é atualizado exclusivamente através de Evento consumido, nunca por escrita direta em sua estrutura de leitura.

**Read Models Are Rebuildable.** Todo Read Model pode ser reconstruído integralmente a partir do histórico completo de Evento já catalogado em `EVENT_CATALOG.md`.

**Consumer Independence.** A adição de um novo consumidor a uma Query já existente nunca exige mudança na Projection que a sustenta.

**High Performance Reads.** Todo Read Model é desenhado para responder à consulta mais frequente de seu domínio com a menor latência possível.

**Eventual Consistency.** Toda Query tolera uma janela de latência entre a ocorrência de um Evento e sua reflexão no Read Model consultado, nunca exigindo consistência instantânea.

**No Business Logic Mutation.** Nenhuma Query executa lógica de negócio que produza efeito de escrita, mesmo quando sua leitura envolve cálculo complexo de agregação.

**Authorization First.** Toda Query verifica Permission antes de resolver seu resultado, nunca depois.

**Tenant Isolation.** Nenhum Read Model expõe dado de um Tenant a uma consulta originada de outro.

**Explicit Contracts.** Toda Query documenta explicitamente seus filtros, sua ordenação e sua estrutura de retorno.

**Versionable Queries.** Toda Query possui uma versão de contrato explícita, permitindo evolução controlada sem quebrar consumidor existente.

**Cache Friendly.** Todo Read Model de alta frequência de consulta é desenhado para se beneficiar de Cache, sempre com tempo de vida compatível com sua janela de consistência aceitável.

**Aggregation Allowed.** Uma Query pode combinar dado de múltiplas origens através de Aggregation, desde que nunca assuma ownership sobre o dado agregado.

**Analytics Is Read Only.** O Analytics Hub, o maior consolidador de leitura combinada da plataforma, nunca produz efeito de escrita sobre nenhum domínio de origem que consulta.

**Projection Pipelines.** Toda Projection é organizada como um pipeline explícito e observável, nunca como uma transformação implícita e opaca de Evento em Read Model.

**Cross Reference.** Toda menção a uma Query fora de seu documento de arquitetura original é feita por referência, nunca por redefinição paralela.

---

## 4. Catálogo Oficial

Esta seção organiza o catálogo por módulo proprietário. Cada Query é descrita por nove atributos: Objetivo, Owner, Origem dos dados, Consumidores, Projeções utilizadas, Filtros, Ordenação, Consistência e Autorização.

### CRM Hub

**`CustomerView`** — Objetivo: recuperar estrutura completa de um Customer específico. Owner: CRM Hub. Origem dos dados: Write Model de Customer. Consumidores: Communication, Finance, Growth. Projeções: Customer Projection. Filtros: identificador do Customer. Ordenação: não aplicável, registro único. Consistência: forte, lida diretamente do Write Model. Autorização: Permission de leitura de relacionamento.

**`CustomerDetails`** — Objetivo: recuperar visão consolidada de Customer com Organization e Contact associados. Owner: CRM Hub. Origem dos dados: Customer, Organization, Contact. Consumidores: Communication, Finance. Projeções: Customer 360 Projection. Filtros: identificador do Customer. Ordenação: não aplicável. Consistência: eventual, janela curta. Autorização: Permission de leitura de relacionamento.

**`CustomerTimeline`** — Objetivo: recuperar histórico cronológico de Interaction de um Customer. Owner: CRM Hub. Origem dos dados: Timeline consolidada. Consumidores: Analytics. Projeções: Timeline Projection. Filtros: identificador do Customer, intervalo de data. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission de leitura de Timeline.

**`CustomerSegmentView`** — Objetivo: recuperar composição de um agrupamento de Customer por critério de relacionamento. Owner: CRM Hub. Origem dos dados: Customer, Relationship Status. Consumidores: Growth. Projeções: Segment Projection. Filtros: critério de segmentação. Ordenação: por relevância ou por data de atualização. Consistência: eventual. Autorização: Permission de leitura de relacionamento.

**`LeadPipeline`** — Objetivo: recuperar visão consolidada de Lead por estágio de qualificação. Owner: CRM Hub. Origem dos dados: Lead, Lead Source. Consumidores: Growth, Analytics. Projeções: Pipeline Projection. Filtros: estágio, Lead Source, intervalo de data. Ordenação: por data de criação. Consistência: eventual. Autorização: Permission de leitura comercial.

**`SalesFunnelView`** — Objetivo: recuperar taxa de conversão entre etapas de Opportunity Stage. Owner: CRM Hub. Origem dos dados: Opportunity, Opportunity Stage. Consumidores: Analytics. Projeções: Funnel Projection. Filtros: período, Pipeline. Ordenação: por etapa. Consistência: eventual. Autorização: Permission de leitura comercial.

**`CustomerActivityView`** — Objetivo: recuperar atividade recente associada a um Customer. Owner: CRM Hub. Origem dos dados: Interaction, Task. Consumidores: — . Projeções: Activity Projection. Filtros: identificador do Customer, intervalo de data. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission de leitura de relacionamento.

**`RelationshipHistory`** — Objetivo: recuperar histórico completo de mudança de Relationship Status. Owner: CRM Hub. Origem dos dados: Relationship Status. Consumidores: Growth, Analytics. Projeções: History Projection. Filtros: identificador do Customer. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de leitura de relacionamento.

**`CustomerSearch`** — Objetivo: localizar Customer por termo de busca textual. Owner: CRM Hub. Origem dos dados: índice de busca dedicado. Consumidores: — . Projeções: Search Index Projection. Filtros: termo de busca, Tenant. Ordenação: por relevância. Consistência: eventual. Autorização: filtro de Permission aplicado antes do ranking de relevância.

### Communication Hub

**`ConversationView`** — Objetivo: recuperar estrutura de uma Conversation específica. Owner: Communication Hub. Origem dos dados: Write Model de Conversation. Consumidores: CRM, Analytics. Projeções: Conversation Projection. Filtros: identificador da Conversation. Ordenação: não aplicável. Consistência: forte. Autorização: Permission de leitura de comunicação.

**`ConversationTimeline`** — Objetivo: recuperar sequência cronológica de Message de uma Conversation. Owner: Communication Hub. Origem dos dados: Message. Consumidores: CRM. Projeções: Timeline Projection. Filtros: identificador da Conversation. Ordenação: cronológica. Consistência: eventual, janela curta. Autorização: Permission de leitura de comunicação.

**`MessageHistory`** — Objetivo: recuperar histórico de Message de um Customer através de múltiplas Conversation. Owner: Communication Hub. Origem dos dados: Message, Conversation. Consumidores: Analytics. Projeções: History Projection. Filtros: identificador do Customer, intervalo de data. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission de leitura de comunicação.

**`DeliveryStatus`** — Objetivo: recuperar estado de entrega de uma Message específica. Owner: Communication Hub. Origem dos dados: Delivery. Consumidores: Growth, Analytics. Projeções: Delivery Projection. Filtros: identificador da Message. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de leitura de comunicação.

**`NotificationHistory`** — Objetivo: recuperar histórico de Notification disparadas. Owner: Communication Hub. Origem dos dados: Notification. Consumidores: Automation, Analytics. Projeções: Notification Projection. Filtros: destinatário, intervalo de data. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission de leitura de comunicação.

**`TemplateCatalog`** — Objetivo: recuperar catálogo de Message Template disponíveis. Owner: Communication Hub. Origem dos dados: Message Template. Consumidores: Automation, Growth. Projeções: Catalog Projection. Filtros: Channel aplicável. Ordenação: alfabética. Consistência: eventual. Autorização: Permission de leitura de comunicação.

**`ConversationSearch`** — Objetivo: localizar Conversation por termo de busca textual. Owner: Communication Hub. Origem dos dados: índice de busca dedicado. Consumidores: — . Projeções: Search Index Projection. Filtros: termo de busca, Tenant. Ordenação: por relevância. Consistência: eventual. Autorização: filtro de Permission aplicado antes do ranking de relevância, mesmo padrão já descrito em `COMMUNICATION_HUB.md`, Capítulo 15.

**`CommunicationDashboard`** — Objetivo: recuperar indicador consolidado de operação de comunicação. Owner: Communication Hub. Origem dos dados: Message, Delivery, Notification. Consumidores: — . Projeções: Dashboard Projection. Filtros: período, Channel. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de leitura de comunicação.

### Finance Hub

As treze Queries desta seção já foram catalogadas integralmente em `FINANCE_HUB.md`, Capítulo 11.

**`InvoiceView`** — Objetivo: recuperar estrutura de uma Invoice. Owner: Finance Hub. Origem dos dados: Invoice, Invoice Item. Consumidores: CRM, Analytics. Projeções: Invoice Projection. Filtros: identificador da Invoice. Ordenação: não aplicável. Consistência: forte. Autorização: Permission financeira.

**`PaymentView`** — Objetivo: recuperar estado de um Payment. Owner: Finance Hub. Origem dos dados: Payment, Payment Attempt. Consumidores: Analytics. Projeções: Payment Projection. Filtros: identificador do Payment. Ordenação: não aplicável. Consistência: forte. Autorização: Permission financeira.

**`LedgerView`** — Objetivo: recuperar Ledger Entry associados a uma Financial Account. Owner: Finance Hub. Origem dos dados: Ledger Entry. Consumidores: Analytics. Projeções: Ledger Projection. Filtros: Financial Account, intervalo de data. Ordenação: cronológica. Consistência: forte. Autorização: Permission financeira restrita.

**`BalanceView`** — Objetivo: recuperar Balance atual de uma Financial Account. Owner: Finance Hub. Origem dos dados: derivado do Ledger. Consumidores: Growth, Analytics. Projeções: Balance Projection. Filtros: Financial Account. Ordenação: não aplicável. Consistência: forte. Autorização: Permission financeira.

**`SubscriptionView`** — Objetivo: recuperar estrutura de uma Subscription. Owner: Finance Hub. Origem dos dados: Subscription. Consumidores: Growth. Projeções: Subscription Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission financeira.

**`ReceivableView`** — Objetivo: recuperar Account Receivable pendente. Owner: Finance Hub. Origem dos dados: Account Receivable. Consumidores: Analytics. Projeções: Receivable Projection. Filtros: antiguidade, Financial Account. Ordenação: por antiguidade. Consistência: eventual. Autorização: Permission financeira.

**`PayableView`** — Objetivo: recuperar Account Payable pendente. Owner: Finance Hub. Origem dos dados: Account Payable. Consumidores: Analytics. Projeções: Payable Projection. Filtros: antiguidade. Ordenação: por antiguidade. Consistência: eventual. Autorização: Permission financeira.

**`SettlementView`** — Objetivo: recuperar histórico de Settlement. Owner: Finance Hub. Origem dos dados: Settlement. Consumidores: Analytics. Projeções: Settlement Projection. Filtros: período. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission financeira restrita.

**`FinancialTimeline`** — Objetivo: recuperar histórico cronológico completo de uma Financial Account. Owner: Finance Hub. Origem dos dados: Ledger Entry, Invoice, Payment. Consumidores: Analytics. Projeções: Timeline Projection. Filtros: Financial Account, intervalo de data. Ordenação: cronológica. Consistência: eventual. Autorização: Permission financeira.

**`WalletView`** — Objetivo: recuperar saldo disponível de uma Wallet. Owner: Finance Hub. Origem dos dados: Wallet. Consumidores: — . Projeções: Wallet Projection. Filtros: identificador da Wallet. Ordenação: não aplicável. Consistência: forte. Autorização: Permission financeira.

**`OutstandingInvoices`** — Objetivo: recuperar toda Invoice emitida ainda não paga. Owner: Finance Hub. Origem dos dados: Invoice. Consumidores: Growth. Projeções: Outstanding Projection. Filtros: Status, antiguidade. Ordenação: por vencimento. Consistência: eventual. Autorização: Permission financeira.

**`CashPosition`** — Objetivo: recuperar posição de caixa consolidada. Owner: Finance Hub. Origem dos dados: Balance, Receivable, Payable. Consumidores: — . Projeções: Cash Position Projection. Filtros: período. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission financeira restrita.

**`FinancialDashboard`** — Objetivo: recuperar indicador consolidado de operação financeira. Owner: Finance Hub. Origem dos dados: agregação de Invoice, Payment, Ledger. Consumidores: Analytics. Projeções: Dashboard Projection. Filtros: período. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission financeira.

### Growth Hub

As treze Queries desta seção já foram catalogadas integralmente em `GROWTH_HUB.md`, Capítulo 11.

**`CampaignView`** — Objetivo: recuperar estrutura de uma Campaign. Owner: Growth Hub. Origem dos dados: Campaign. Consumidores: Finance, Analytics. Projeções: Campaign Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: forte. Autorização: Permission de crescimento.

**`AudienceView`** — Objetivo: recuperar composição de uma Audience. Owner: Growth Hub. Origem dos dados: Audience, Audience Segment. Consumidores: Analytics. Projeções: Audience Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de crescimento.

**`JourneyView`** — Objetivo: recuperar estrutura de uma Journey e progresso de Touchpoint. Owner: Growth Hub. Origem dos dados: Journey, Touchpoint. Consumidores: Communication. Projeções: Journey Projection. Filtros: identificador, Cliente. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de crescimento.

**`FunnelView`** — Objetivo: recuperar taxa de conversão entre etapas de um Funnel. Owner: Growth Hub. Origem dos dados: Funnel, Conversion Event. Consumidores: Analytics. Projeções: Funnel Projection. Filtros: período. Ordenação: por etapa. Consistência: eventual. Autorização: Permission de crescimento.

**`ExperimentView`** — Objetivo: recuperar estado de um Experiment e desempenho de Variant. Owner: Growth Hub. Origem dos dados: Experiment, Variant. Consumidores: Analytics. Projeções: Experiment Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de crescimento.

**`AttributionView`** — Objetivo: recuperar Attribution calculada de Conversion Event. Owner: Growth Hub. Origem dos dados: Attribution. Consumidores: Finance, Analytics. Projeções: Attribution Projection. Filtros: Campaign, período. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de crescimento.

**`CohortView`** — Objetivo: recuperar composição e comportamento de um Cohort. Owner: Growth Hub. Origem dos dados: Cohort. Consumidores: Analytics. Projeções: Cohort Projection. Filtros: critério de formação. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de crescimento.

**`LifecycleView`** — Objetivo: recuperar distribuição de Clientes por Lifecycle Stage. Owner: Growth Hub. Origem dos dados: Lifecycle Stage. Consumidores: CRM, Analytics. Projeções: Lifecycle Projection. Filtros: período. Ordenação: por estágio. Consistência: eventual. Autorização: Permission de crescimento.

**`ReferralView`** — Objetivo: recuperar histórico de Referral de um Referral Program. Owner: Growth Hub. Origem dos dados: Referral. Consumidores: CRM, Analytics. Projeções: Referral Projection. Filtros: Referral Program, período. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de crescimento.

**`GrowthDashboard`** — Objetivo: recuperar indicador consolidado de operação de crescimento. Owner: Growth Hub. Origem dos dados: agregação de Growth Metric. Consumidores: Analytics. Projeções: Dashboard Projection. Filtros: período. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de crescimento.

**`GrowthTimeline`** — Objetivo: recuperar histórico cronológico de Campaign, Journey e Conversion Event. Owner: Growth Hub. Origem dos dados: agregação multi-entidade. Consumidores: Analytics. Projeções: Timeline Projection. Filtros: Audience ou Cliente, intervalo de data. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de crescimento.

**`ConversionAnalysis`** — Objetivo: recuperar detalhamento de Conversion Event por Campaign, canal ou Segment. Owner: Growth Hub. Origem dos dados: Conversion Event. Consumidores: Analytics. Projeções: Conversion Projection. Filtros: Campaign, Acquisition Channel, Audience Segment. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de crescimento.

**`RetentionAnalysis`** — Objetivo: recuperar evolução de Engagement Score e transição de Lifecycle Stage. Owner: Growth Hub. Origem dos dados: Engagement Score, Lifecycle Stage. Consumidores: Analytics. Projeções: Retention Projection. Filtros: período. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de crescimento.

### Analytics Hub

As treze Queries desta seção já foram catalogadas integralmente em `ANALYTICS_HUB.md`, Capítulo 11. Reforça-se aqui, de forma explícita, o princípio Analytics Is Read Only já central a este módulo: toda Query desta seção agrega dado de origem em múltiplos Business Hubs, mas nunca assume ownership sobre esse dado, conforme já fixado em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 4.

**`DashboardView`** — Objetivo: recuperar estrutura e conteúdo atual de um Dashboard. Owner: Analytics Hub. Origem dos dados: Widget, Metric, KPI. Consumidores: — . Projeções: Dashboard Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de leitura analítica.

**`ExecutiveDashboard`** — Objetivo: recuperar composição consolidada de Executive Indicator. Owner: Analytics Hub. Origem dos dados: agregação de CRM, Communication, Finance, Growth. Consumidores: — . Projeções: Executive Projection. Filtros: período, Tenant. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission executiva.

**`KPIView`** — Objetivo: recuperar valor atual e histórico recente de um KPI. Owner: Analytics Hub. Origem dos dados: KPI. Consumidores: Todos. Projeções: KPI Projection. Filtros: identificador, janela temporal. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de leitura analítica.

**`MetricView`** — Objetivo: recuperar valor atual de uma Metric com fórmula e janela de referência. Owner: Analytics Hub. Origem dos dados: Metric. Consumidores: Todos. Projeções: Metric Projection. Filtros: identificador, janela temporal. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de leitura analítica.

**`TrendView`** — Objetivo: recuperar evolução de Metric ou KPI ao longo de um período. Owner: Analytics Hub. Origem dos dados: Time Series. Consumidores: — . Projeções: Trend Projection. Filtros: identificador, período. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de leitura analítica.

**`ForecastView`** — Objetivo: recuperar projeção futura de uma Metric. Owner: Analytics Hub. Origem dos dados: Forecast. Consumidores: — . Projeções: Forecast Projection. Filtros: identificador. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de leitura analítica.

**`DatasetView`** — Objetivo: recuperar composição bruta de um Dataset consolidado. Owner: Analytics Hub. Origem dos dados: Dataset. Consumidores: — . Projeções: Dataset Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission técnica restrita, tipicamente para auditoria.

**`ReportView`** — Objetivo: recuperar Report já gerado a partir de Report Template. Owner: Analytics Hub. Origem dos dados: Report. Consumidores: — . Projeções: Report Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: eventual. Autorização: herda a Permission do conteúdo subjacente ao Report.

**`InsightView`** — Objetivo: recuperar Insight identificado, incluindo dado de sustentação. Owner: Analytics Hub. Origem dos dados: Insight. Consumidores: Automation. Projeções: Insight Projection. Filtros: identificador. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de leitura analítica.

**`BenchmarkView`** — Objetivo: recuperar referência comparativa atual e histórico de versões anteriores. Owner: Analytics Hub. Origem dos dados: Benchmark. Consumidores: — . Projeções: Benchmark Projection. Filtros: identificador. Ordenação: por versão. Consistência: eventual. Autorização: Permission de leitura analítica.

**`TimeSeriesView`** — Objetivo: recuperar sequência completa de Snapshot de uma Metric. Owner: Analytics Hub. Origem dos dados: Snapshot. Consumidores: — . Projeções: Time Series Projection. Filtros: identificador, período. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de leitura analítica.

**`DecisionSupportView`** — Objetivo: recuperar composição consolidada de indicador, Trend, Forecast e Recommendation. Owner: Analytics Hub. Origem dos dados: agregação multi-entidade. Consumidores: — . Projeções: Decision Support Projection. Filtros: contexto de decisão. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission executiva ou estratégica.

**`AnalyticsTimeline`** — Objetivo: recuperar histórico cronológico de Snapshot, Insight e Recommendation. Owner: Analytics Hub. Origem dos dados: agregação multi-entidade. Consumidores: — . Projeções: Timeline Projection. Filtros: dimensão específica, intervalo de data. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de leitura analítica.

### Automation Engine

**`WorkflowView`** — Objetivo: recuperar estrutura de um Workflow. Owner: Automation Engine. Origem dos dados: Workflow. Consumidores: — . Projeções: Workflow Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: forte. Autorização: Permission de automação.

**`WorkflowHistory`** — Objetivo: recuperar histórico de execução de um Workflow. Owner: Automation Engine. Origem dos dados: execução de Workflow. Consumidores: Analytics. Projeções: History Projection. Filtros: identificador, período. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission de automação.

**`ExecutionTimeline`** — Objetivo: recuperar sequência cronológica de Action executadas dentro de um Workflow. Owner: Automation Engine. Origem dos dados: Action. Consumidores: Analytics. Projeções: Timeline Projection. Filtros: identificador de execução. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de automação.

**`TriggerView`** — Objetivo: recuperar configuração de um Trigger. Owner: Automation Engine. Origem dos dados: Trigger. Consumidores: — . Projeções: Trigger Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: forte. Autorização: Permission de automação.

**`RuleEvaluationHistory`** — Objetivo: recuperar histórico de avaliação de Regra condicional. Owner: Automation Engine. Origem dos dados: avaliação de Regra. Consumidores: Analytics. Projeções: Evaluation Projection. Filtros: identificador da Regra, período. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission de automação.

**`AutomationDashboard`** — Objetivo: recuperar indicador consolidado de operação de automação. Owner: Automation Engine. Origem dos dados: agregação de Workflow e Action. Consumidores: — . Projeções: Dashboard Projection. Filtros: período. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de automação.

### AI Hub

**`RecommendationHistory`** — Objetivo: recuperar histórico de sugestão produzida por inferência. Owner: AI Hub. Origem dos dados: AI Decision. Consumidores: Growth, Analytics. Projeções: History Projection. Filtros: período, tipo de sugestão. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission de leitura de IA.

**`PredictionView`** — Objetivo: recuperar projeção específica já produzida. Owner: AI Hub. Origem dos dados: AI Decision. Consumidores: Analytics. Projeções: Prediction Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de leitura de IA.

**`ClassificationResults`** — Objetivo: recuperar resultado de classificação automatizada. Owner: AI Hub. Origem dos dados: AI Decision. Consumidores: CRM, Growth. Projeções: Classification Projection. Filtros: identificador da Entidade classificada. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de leitura de IA.

**`PromptHistory`** — Objetivo: recuperar histórico de AI Prompt já processado. Owner: AI Hub. Origem dos dados: AI Prompt. Consumidores: — . Projeções: History Projection. Filtros: período. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission técnica restrita.

**`AnalysisHistory`** — Objetivo: recuperar histórico de análise assistida por IA. Owner: AI Hub. Origem dos dados: AIAnalysisCompleted consolidado. Consumidores: Analytics. Projeções: History Projection. Filtros: tipo de análise, período. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission de leitura de IA.

**`AIDashboard`** — Objetivo: recuperar indicador consolidado de uso e desempenho do AI Hub. Owner: AI Hub. Origem dos dados: agregação de AI Decision. Consumidores: — . Projeções: Dashboard Projection. Filtros: período. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission técnica restrita.

### Knowledge Hub

**`KnowledgeCatalog`** — Objetivo: recuperar catálogo de Document disponíveis na Knowledge Base. Owner: Knowledge Hub. Origem dos dados: Document. Consumidores: AI. Projeções: Catalog Projection. Filtros: categoria, Tenant. Ordenação: alfabética. Consistência: eventual. Autorização: Permission de leitura de conhecimento.

**`KnowledgeSearch`** — Objetivo: localizar Document por termo de busca textual. Owner: Knowledge Hub. Origem dos dados: índice de busca dedicado. Consumidores: AI. Projeções: Search Index Projection. Filtros: termo de busca, Tenant. Ordenação: por relevância. Consistência: eventual. Autorização: filtro de Permission antes do ranking.

**`KnowledgeTimeline`** — Objetivo: recuperar histórico de mudança de um Document. Owner: Knowledge Hub. Origem dos dados: versão de Document. Consumidores: — . Projeções: Timeline Projection. Filtros: identificador do Document. Ordenação: cronológica. Consistência: eventual. Autorização: Permission de leitura de conhecimento.

**`SemanticSearch`** — Objetivo: localizar Document por similaridade semântica a uma consulta. Owner: Knowledge Hub. Origem dos dados: Embedding, Retrieval Index. Consumidores: AI. Projeções: Semantic Index Projection. Filtros: consulta vetorial, Tenant. Ordenação: por proximidade semântica. Consistência: eventual. Autorização: filtro de Permission antes do ranking semântico, conforme já estabelecido em `KNOWLEDGE_HUB.md`, Capítulo 17.

**`DocumentHistory`** — Objetivo: recuperar histórico de versão de um Document específico. Owner: Knowledge Hub. Origem dos dados: versão de Document. Consumidores: — . Projeções: History Projection. Filtros: identificador. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission de leitura de conhecimento.

**`KnowledgeDashboard`** — Objetivo: recuperar indicador consolidado de uso da Knowledge Base. Owner: Knowledge Hub. Origem dos dados: agregação de Document e Retrieval. Consumidores: — . Projeções: Dashboard Projection. Filtros: período. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission técnica restrita.

### Identity Hub

**`UserView`** — Objetivo: recuperar estrutura de um Usuário. Owner: Identity Hub. Origem dos dados: Identity. Consumidores: Todos. Projeções: User Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: forte. Autorização: Permission administrativa.

**`RoleView`** — Objetivo: recuperar definição de uma Role. Owner: Identity Hub. Origem dos dados: Role. Consumidores: Todos. Projeções: Role Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: forte. Autorização: Permission administrativa.

**`PermissionMatrix`** — Objetivo: recuperar matriz consolidada de Permission por Role. Owner: Identity Hub. Origem dos dados: Permission, Role. Consumidores: Todos. Projeções: Matrix Projection. Filtros: Tenant. Ordenação: por Role. Consistência: eventual. Autorização: Permission administrativa restrita.

**`TenantView`** — Objetivo: recuperar configuração de um Tenant. Owner: Identity Hub. Origem dos dados: Tenant. Consumidores: Todos. Projeções: Tenant Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: forte. Autorização: Permission administrativa.

**`SessionHistory`** — Objetivo: recuperar histórico de Session de um Usuário. Owner: Identity Hub. Origem dos dados: Session. Consumidores: — . Projeções: History Projection. Filtros: identificador do Usuário, período. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission administrativa restrita.

**`AuthenticationHistory`** — Objetivo: recuperar histórico de tentativa de autenticação. Owner: Identity Hub. Origem dos dados: tentativa de Authentication. Consumidores: — . Projeções: History Projection. Filtros: identificador do Usuário, período. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission administrativa restrita, tipicamente para segurança.

**`AuditView`** — Objetivo: recuperar registro de auditoria de operação sensível de acesso. Owner: Identity Hub. Origem dos dados: registro de auditoria. Consumidores: — . Projeções: Audit Projection. Filtros: Usuário, período, tipo de operação. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission de auditoria restrita.

### Integration Hub

**`ConnectorView`** — Objetivo: recuperar configuração de um Connector. Owner: Integration Hub. Origem dos dados: Connector. Consumidores: — . Projeções: Connector Projection. Filtros: identificador. Ordenação: não aplicável. Consistência: forte. Autorização: Permission técnica restrita.

**`ImportHistory`** — Objetivo: recuperar histórico de execução de importação. Owner: Integration Hub. Origem dos dados: execução de Import. Consumidores: CRM, Finance. Projeções: History Projection. Filtros: Connector, período. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission técnica restrita.

**`ExportHistory`** — Objetivo: recuperar histórico de execução de exportação. Owner: Integration Hub. Origem dos dados: execução de Export. Consumidores: Analytics. Projeções: History Projection. Filtros: Connector, período. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission técnica restrita.

**`SynchronizationStatus`** — Objetivo: recuperar estado atual de uma sincronização em curso ou já concluída. Owner: Integration Hub. Origem dos dados: execução de Synchronization. Consumidores: CRM. Projeções: Status Projection. Filtros: Connector. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission técnica restrita.

**`WebhookHistory`** — Objetivo: recuperar histórico de Webhook recebido e processado. Owner: Integration Hub. Origem dos dados: Webhook. Consumidores: Finance, Growth, Communication. Projeções: History Projection. Filtros: Provider, período. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission técnica restrita.

**`APICatalog`** — Objetivo: recuperar catálogo de integração de API externa já registrada. Owner: Integration Hub. Origem dos dados: External API. Consumidores: — . Projeções: Catalog Projection. Filtros: Provider. Ordenação: alfabética. Consistência: eventual. Autorização: Permission técnica restrita.

### Branding Hub

**`ThemeView`** — Objetivo: recuperar Brand Theme atual de uma Empresa. Owner: Branding Hub. Origem dos dados: Brand Theme. Consumidores: Finance, Analytics. Projeções: Theme Projection. Filtros: Tenant. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de leitura de marca.

**`BrandAssets`** — Objetivo: recuperar conjunto de Brand Asset de uma Empresa. Owner: Branding Hub. Origem dos dados: Brand Asset. Consumidores: Finance, Analytics. Projeções: Asset Projection. Filtros: Tenant, tipo de Asset. Ordenação: por tipo. Consistência: eventual. Autorização: Permission de leitura de marca.

**`PaletteView`** — Objetivo: recuperar paleta de cor atual de uma Empresa. Owner: Branding Hub. Origem dos dados: paleta associada ao Brand Theme. Consumidores: — . Projeções: Palette Projection. Filtros: Tenant. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de leitura de marca.

**`TypographyCatalog`** — Objetivo: recuperar configuração tipográfica de uma Empresa. Owner: Branding Hub. Origem dos dados: Brand Theme. Consumidores: — . Projeções: Typography Projection. Filtros: Tenant. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission de leitura de marca.

**`TokenCatalog`** — Objetivo: recuperar catálogo de token de estilo reutilizável. Owner: Branding Hub. Origem dos dados: Brand Theme. Consumidores: — . Projeções: Token Projection. Filtros: Tenant. Ordenação: alfabética. Consistência: eventual. Autorização: Permission de leitura de marca.

### Business Profile Engine

**`BusinessProfileView`** — Objetivo: recuperar Business Profile de uma Empresa. Owner: Business Profile Engine. Origem dos dados: Business Profile. Consumidores: Todos. Projeções: Profile Projection. Filtros: Tenant. Ordenação: não aplicável. Consistência: forte. Autorização: Permission administrativa.

**`CapabilityMatrix`** — Objetivo: recuperar matriz de capacidade habilitada por Empresa. Owner: Business Profile Engine. Origem dos dados: capacidade habilitada. Consumidores: Todos. Projeções: Matrix Projection. Filtros: Tenant. Ordenação: alfabética. Consistência: eventual. Autorização: Permission administrativa.

**`BusinessAdaptationHistory`** — Objetivo: recuperar histórico de ciclo de adaptação de configuração. Owner: Business Profile Engine. Origem dos dados: ciclo de adaptação. Consumidores: — . Projeções: History Projection. Filtros: Tenant, período. Ordenação: cronológica decrescente. Consistência: eventual. Autorização: Permission administrativa restrita.

**`FeatureConfiguration`** — Objetivo: recuperar configuração específica de uma capacidade habilitada. Owner: Business Profile Engine. Origem dos dados: Configuration por capacidade. Consumidores: Todos. Projeções: Configuration Projection. Filtros: Tenant, capacidade. Ordenação: não aplicável. Consistência: eventual. Autorização: Permission administrativa.

**`AdaptationRecommendations`** — Objetivo: recuperar sugestão de nova capacidade recomendada para o Segmento e a Maturidade de uma Empresa. Owner: Business Profile Engine. Origem dos dados: Business Profile, catálogo de capacidade. Consumidores: — . Projeções: Recommendation Projection. Filtros: Tenant. Ordenação: por relevância. Consistência: eventual. Autorização: Permission administrativa.

---

## 5. Classificação das Queries

Business Queries são toda Query que recupera Entidade de negócio reconhecível — `CustomerView`, `InvoiceView`, `CampaignView` — a categoria dominante deste catálogo.

Operational Queries são toda Query voltada ao acompanhamento do dia a dia de um processo — `LeadPipeline`, `WorkflowHistory`, `OutstandingInvoices`.

Analytical Queries são toda Query que recupera indicador consolidado ou agregado — `MetricView`, `KPIView`, `TrendView` — publicadas exclusivamente pelo Analytics Hub.

Historical Queries são toda Query voltada à reconstrução de histórico cronológico — `CustomerTimeline`, `FinancialTimeline`, `GrowthTimeline`, `AnalyticsTimeline`.

Executive Queries são toda Query voltada à leitura de alta liderança — `ExecutiveDashboard`, `CashPosition`.

Strategic Queries são toda Query voltada a decisão de médio e longo prazo — `DecisionSupportView`, `ForecastView`, `BenchmarkView`.

Administrative Queries são toda Query voltada à configuração e à governança da plataforma — `PermissionMatrix`, `CapabilityMatrix`, `TenantView`.

Security Queries são toda Query relativa a acesso, autenticação e auditoria — `SessionHistory`, `AuthenticationHistory`, `AuditView` — publicadas exclusivamente pelo Identity Hub.

AI Queries são toda Query que recupera resultado de inferência automatizada — `RecommendationHistory`, `PredictionView`, `ClassificationResults`.

Integration Queries são toda Query relativa a comunicação técnica com sistema externo — `ImportHistory`, `WebhookHistory`, `SynchronizationStatus`.

```
                    CLASSIFICAÇÃO DAS QUERIES
   ┌───────────────────────────────────────────────────────────┐
   │  Business Queries:       CRM · Communication · Finance ·        │
   │                          Growth                                     │
   │  Operational Queries:    presentes em praticamente todo módulo         │
   │  Analytical Queries:     Analytics Hub                                    │
   │  Historical Queries:     presentes em praticamente todo módulo                │
   │  Executive Queries:      Analytics Hub · Finance Hub                             │
   │  Strategic Queries:      Analytics Hub                                              │
   │  Administrative Queries: Identity Hub · Business Profile Engine                         │
   │  Security Queries:       Identity Hub                                                      │
   │  AI Queries:             AI Hub                                                                │
   │  Integration Queries:    Integration Hub                                                          │
   └───────────────────────────────────────────────────────────┘
```

---

## 6. Arquitetura de Read Models

```
   Business Events
      │
      ▼
   Projection
      │
      ▼
   Read Model
      │
      ▼
   Query
      │
      ▼
   Dashboard
```

Este é o fluxo padrão de materialização de todo Read Model desta plataforma: Evento já publicado por um módulo proprietário é consumido por uma Projection dedicada, que atualiza um Read Model já otimizado para o padrão de consulta que sustenta; uma Query resolve contra esse Read Model; e o resultado é apresentado, tipicamente, através de um Dashboard ou de outra superfície de leitura.

```
   Commands
      │
      ▼
   Events
      │
      ▼
   Projection
      │
      ▼
   Query
      │
      ▼
   Visualization
```

Este segundo fluxo demonstra a cadeia completa da tríade CQRS: um Command, já catalogado em `COMMAND_CATALOG.md`, produz uma mudança de estado; essa mudança é comunicada através de um Evento, já catalogado em `EVENT_CATALOG.md`; a Projection consome esse Evento; e a Query, finalmente, expõe o resultado através de uma Visualization consumível por um Usuário.

```
   CRM
      │
      ▼
   Analytics
      │
      ▼
   Executive Dashboard
      │
      ▼
   Decision Support
```

Este terceiro fluxo demonstra como uma Query agregada, como `ExecutiveDashboard`, combina dado de origem em múltiplos Business Hubs — aqui exemplificado pelo CRM Hub — sem que o Analytics Hub jamais assuma ownership sobre esse dado de origem, aplicação direta do princípio Analytics Is Read Only já reforçado no Capítulo 4.

```
              PROJECTION PIPELINE (visão detalhada)
   ┌───────────────────────────────────────────────────────────┐
   │  Evento consumido                                              │
   │       │                                                        │
   │       ▼                                                        │
   │  Validação de esquema do Evento                                    │
   │       │                                                        │
   │       ▼                                                        │
   │  Transformação para o formato do Read Model                            │
   │       │                                                        │
   │       ▼                                                        │
   │  Aplicação incremental sobre o Read Model já existente                       │
   │       │                                                        │
   │       ▼                                                        │
   │  Read Model atualizado, disponível para nova Query                                 │
   └───────────────────────────────────────────────────────────┘
```

---

## 7. Regras de Leitura

Queries nunca alteram estado — nenhuma Query, em nenhum módulo, produz efeito colateral de escrita.

Queries nunca publicam Events — a leitura de um Read Model nunca aciona a publicação de um Evento, mesmo quando essa leitura é intensiva ou complexa.

Queries nunca executam Commands — nenhuma Query invoca, direta ou indiretamente, um Command já catalogado em `COMMAND_CATALOG.md`.

Queries respeitam ownership — toda Query é servida exclusivamente pelo módulo já registrado como proprietário do Read Model consultado em `DOMAIN_OWNERSHIP_MATRIX.md`.

Queries utilizam projeções — nenhuma Query recomputa Aggregation a partir do histórico bruto de Evento a cada chamada, salvo em cenário explícito de auditoria ou de depuração.

Read Models podem ser reconstruídos — todo Read Model é reconstruível do zero a partir do histórico completo de Evento, sem perda de informação.

Projeções são descartáveis — a estrutura física de um Read Model pode ser descartada e recriada a qualquer momento, sem impacto na fonte de verdade subjacente.

Dashboards consultam Read Models — nenhum Dashboard lê diretamente o Write Model de um módulo, sempre through Read Model já materializado.

Analytics pode agregar — o Analytics Hub combina dado de múltiplas origens sem jamais assumir ownership sobre nenhuma delas.

Consumers nunca redefinem modelos — um consumidor de Query nunca cria sua própria versão paralela de um Read Model já proprietário de outro módulo.

Toda Query documenta explicitamente sua janela de consistência, nunca deixando essa garantia implícita.

Nenhuma Query retorna dado além do escopo de Permission do solicitante, mesmo quando tecnicamente presente no Read Model consultado.

Toda Query respeita Tenant Isolation, sem exceção, mesmo em Query agregada que combine múltiplas origens.

Nenhum Read Model é compartilhado estruturalmente entre dois módulos distintos — cada módulo materializa sua própria Projection, mesmo quando consome o mesmo Evento de origem que outro módulo também consome.

Toda mudança de contrato de Query é versionada, conforme detalhado no Capítulo 8 de `EVENT_CATALOG.md` aplicado por analogia direta a este catálogo.

Nenhuma Query é removida deste catálogo sem que seu módulo proprietário registre formalmente sua descontinuação.

Todo novo Read Model, ao ser introduzido, é registrado neste catálogo antes de sua primeira disponibilização em produção.

Toda Query de alta frequência é candidata a Cache, respeitando sempre a janela de consistência já documentada para essa Query específica.

Nenhuma Query paginada retorna volume de resultado sem limite explícito, preservando a mesma disciplina de paginação já esperada de toda API interna da plataforma.

Toda Query é observável através de Logs e de Tracing, permitindo correlação entre uma consulta lenta e a Projection que a sustenta.

---

## 8. Consistência

Eventual Consistency é a garantia padrão de toda Query catalogada neste documento — nenhum Read Model reflete instantaneamente um Evento recém-publicado; existe sempre uma janela de latência entre a publicação do Evento e sua reflexão na Projection correspondente.

Projection Pipeline é o mecanismo técnico, já descrito no Capítulo 6, que absorve essa janela de latência — quanto mais simples a transformação de Evento em Read Model, menor a janela; quanto mais complexa a Aggregation envolvida, maior a janela tipicamente observada.

Snapshot, quando mantido por um Read Model — como o Snapshot Manager já descrito em `ANALYTICS_HUB.md` —, acelera a disponibilização de um estado consolidado sem exigir reprocessamento de todo o histórico de Evento a cada consulta.

Rebuild é a reconstrução completa e deliberada de um Read Model a partir do histórico integral de Evento, tipicamente usada após correção de defeito em uma Projection ou após mudança em sua lógica de transformação.

Delay é a medida observável da janela de consistência eventual de uma Query específica — algumas Queries, como `BalanceView`, toleram Delay mínimo, medido em milissegundos; outras, como `BenchmarkView`, toleram Delay de horas sem prejuízo a nenhuma decisão de negócio.

Refresh é o processo de atualização incremental de um Read Model a partir de novo Evento consumido, distinto de Rebuild, que reconstrói o Read Model inteiro do zero.

Recovery é o processo de retomada de uma Projection após falha de infraestrutura, sempre a partir do último Checkpoint confirmado, conforme já detalhado em `EVENT_CATALOG.md`, Capítulo 9.

Sincronização, neste contexto, é a verificação periódica de que um Read Model permanece consistente com o histórico de Evento que já deveria ter consumido, identificando qualquer divergência antes que ela se torne uma fonte de erro operacional silencioso.

Uma distinção importante separa Rebuild de Reconciliation: Rebuild reconstrói um Read Model inteiro do zero, tipicamente após correção de defeito na lógica de Projection; Reconciliation apenas compara o Read Model já existente contra o que o histórico de Evento indicaria, sinalizando divergência sem necessariamente reconstruir nada. Um Read Model saudável passa por Reconciliation periódica sem jamais precisar de Rebuild; um Read Model que falha em sua Reconciliation repetidamente é candidato a Rebuild completo, e essa decisão é sempre deliberada, nunca automática.

O custo de Rebuild varia amplamente entre módulos, exatamente como já observado para Replay de Evento em `EVENT_CATALOG.md`, Capítulo 9 — o Read Model de `LedgerView`, que cresce continuamente ao longo de toda a vida operacional de um Tenant, tem o custo de Rebuild mais alto de toda a plataforma, enquanto o Read Model de `TenantView`, cuja atualização é pouco frequente, pode ser reconstruído quase instantaneamente. Esse custo variável é uma consideração central de qualquer decisão de arquitetura de Snapshot para um novo Read Model introduzido no futuro.

```
              JANELA DE CONSISTÊNCIA POR CATEGORIA (exemplo)
   ┌───────────────────────────────────────────────────────────┐
   │  BalanceView            → segundos (Financial, forte)           │
   │  CustomerView           → segundos (relacionamento crítico)         │
   │  ExecutiveDashboard     → minutos (consolidação multi-origem)           │
   │  BenchmarkView          → horas (referência comparativa estável)            │
   └───────────────────────────────────────────────────────────┘
```

---

## 9. Performance

Cache reduz a carga de Query de alta frequência, sempre com tempo de vida calibrado à janela de consistência eventual já aceita para cada Query específica, nunca aplicado a uma Query que exige consistência forte, como `LedgerView`.

Materialized Views são a implementação física padrão de todo Read Model catalogado neste documento, eliminando a necessidade de recomputar Aggregation a cada chamada.

Paginação é obrigatória em toda Query que possa retornar volume não limitado de resultado — `MessageHistory`, `WorkflowHistory`, `ImportHistory` — nunca retornando um conjunto completo sem corte explícito.

Índices dedicados sustentam toda Query de busca textual ou semântica — `CustomerSearch`, `ConversationSearch`, `SemanticSearch` — permitindo resposta em tempo aceitável mesmo sobre volume de dado muito grande.

Distribuição permite que o Read Model de um Tenant seja fisicamente segregado do Read Model de outro, garantindo que o volume de consulta de uma Empresa excepcionalmente grande nunca comprometa o desempenho de outra.

Paralelismo permite que múltiplas Query, de Tenants ou de domínios distintos, sejam resolvidas simultaneamente sem interferência mútua.

Escalabilidade Horizontal é a estratégia padrão de todo módulo desta plataforma, já demonstrada individualmente em cada Hub — mais instâncias de resolução de Query, nunca uma única instância de maior capacidade central.

Consultas Massivas — como a materialização completa de um `ExecutiveDashboard` que combina múltiplas origens — são resolvidas através do Query Coordinator já descrito em `ANALYTICS_HUB.md`, Capítulo 7, que paraleliza a resolução contra cada Read Model de origem antes de consolidar o resultado final.

Otimização de todo Read Model é orientada pelo padrão de consulta real observado, nunca por uma estrutura genérica desenhada antes de qualquer evidência de uso — um Read Model consultado com alta frequência recebe prioridade de otimização sobre um Read Model de uso ocasional.

Uma consideração de performance específica deste catálogo, sem paralelo direto em `EVENT_CATALOG.md` ou em `COMMAND_CATALOG.md`, é o custo de resolução de uma Query agregada frente a uma Query de origem única. `CustomerView`, que consulta exclusivamente o Read Model do CRM Hub, resolve com latência mínima e previsível. `ExecutiveDashboard`, que combina Read Model de quatro Business Hubs distintos através do Query Coordinator, tem uma latência de resolução necessariamente maior, ainda que paralelizada — o tempo total de resposta é determinado pela origem mais lenta entre as quatro consultadas, nunca pela soma sequencial de todas elas. Esta distinção de custo é uma das razões pelas quais toda Query agregada é candidata natural a Cache com janela de vida mais generosa do que uma Query de origem única, conforme já estabelecido no início deste capítulo.

---

## 10. Segurança

RBAC, administrado pelo Identity Hub, determina qual Perfil de Usuário está autorizado a consultar qual categoria de Query — um Perfil executivo consulta `ExecutiveDashboard`, um Perfil operacional consulta primariamente Operational Queries relevantes à sua própria função, conforme já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 11.

ABAC complementa essa autorização com atributo contextual — um Usuário pode ter Permission geral de leitura financeira, mas essa Permission pode ser adicionalmente restrita a uma Financial Account específica, verificada no momento da resolução da Query.

Tenant Isolation garante que nenhuma Query, mesmo agregada através do Query Coordinator, retorne dado de um Tenant a uma consulta originada de outro.

LGPD é preservada através de agregação e, quando aplicável, anonimização em Query que consolide comportamento de Cliente individual — o mesmo princípio já detalhado em `ANALYTICS_HUB.md`, Capítulo 15, aplicado transversalmente a toda Query analítica deste catálogo.

Auditoria preserva o registro de toda Query sensível já executada, particularmente aquelas de escopo administrativo ou financeiro restrito, como `LedgerView` e `AuditView`.

Mascaramento de Dados é aplicado a campo sensível exposto por uma Query quando o Perfil solicitante não possui Permission de acesso ao dado completo — por exemplo, um Payment Method pode ser exibido de forma tokenizada e parcial a um Perfil sem Permission financeira ampla.

Permissões são verificadas antes de qualquer resolução de Query, nunca depois — uma Query sem Permission adequada é recusada antes de qualquer acesso ao Read Model subjacente.

Controle de Acesso é aplicado de forma consistente entre toda Query de busca, garantindo que o filtro de Permission ocorra antes do ranking de relevância ou de proximidade semântica, mesmo padrão já estabelecido em `CustomerSearch`, em `ConversationSearch` e em `SemanticSearch`.

Uma camada de segurança adicional, específica deste catálogo, diz respeito à herança de Permission em Query agregada. Quando `ExecutiveDashboard` ou `DecisionSupportView` combina dado de múltiplos Business Hubs, a Permission efetivamente exigida do solicitante é sempre a interseção das Permission individuais de cada origem consultada, nunca a união mais permissiva delas — um Usuário sem Permission financeira ampla nunca visualiza o componente financeiro de um Dashboard executivo, mesmo que possua Permission ampla sobre os demais componentes de relacionamento e de crescimento agregados na mesma tela. Esta regra de composição de Permission é aplicada de forma consistente pelo Query Coordinator em todo caso de agregação multi-origem já catalogado neste documento.

```
                  CAMADAS DE SEGURANÇA DE TODA QUERY
   ┌───────────────────────────────────────────────────────────┐
   │  Autenticação e Autorização (Identity Hub — RBAC + ABAC)       │
   │       ▼                                                         │
   │  Tenant Isolation                                                   │
   │       ▼                                                         │
   │  Interseção de Permission (quando Query agregada)                       │
   │       ▼                                                         │
   │  Mascaramento de campo sensível, quando aplicável                            │
   │       ▼                                                         │
   │  Auditoria de Query sensível                                                    │
   └───────────────────────────────────────────────────────────┘
```

---

## 11. Casos de Uso

**Dashboard Executivo.** Um Executivo consulta `ExecutiveDashboard`, que o Query Coordinator do Analytics Hub resolve combinando Business Indicator de CRM, Communication, Finance e Growth em uma única leitura consolidada.

**Painel Financeiro.** Um Gestor Financeiro consulta `FinancialDashboard`, `CashPosition` e `OutstandingInvoices` para acompanhar receita, posição de caixa e cobrança pendente em uma única sessão de trabalho.

**Histórico do Cliente.** Um Representante Comercial consulta `CustomerTimeline` e `CustomerActivityView` para entender o histórico completo de interação com um Customer antes de uma reunião comercial.

**Pipeline Comercial.** Um Gestor de Vendas consulta `LeadPipeline` e `SalesFunnelView` para identificar em qual etapa do funil comercial a maior perda de conversão está concentrada.

**Dashboard de Campanhas.** Um Gestor de Crescimento consulta `GrowthDashboard` e `ConversionAnalysis` para avaliar o desempenho de uma Campaign recém-concluída frente ao seu Campaign Goal.

**Forecast Executivo.** Um Diretor Financeiro consulta `ForecastView` para avaliar a projeção de receita dos próximos doze meses antes de uma decisão de investimento estrutural.

**Benchmark.** Uma Empresa consulta `BenchmarkView` para comparar sua taxa de retenção contra a referência de mercado já registrada para seu Segmento.

**Pesquisa Semântica.** Um Usuário consulta `SemanticSearch` para localizar uma Política de reembolso já indexada na Knowledge Base, através de uma pergunta em linguagem natural.

**Auditoria.** Um Auditor consulta `AuditView` e `LedgerView` para reconstruir a sequência completa de operação sensível que produziu o Balance atual de uma Financial Account.

**Matriz de Permissões.** Um Administrador consulta `PermissionMatrix` para revisar quais Role têm acesso a qual categoria de Command e de Query dentro de um Tenant específico.

**Timeline Empresarial.** Um Gestor consulta `AnalyticsTimeline` para revisar a sequência cronológica completa de Insight e de Recommendation já geradas para sua Empresa ao longo de um trimestre.

**Business Overview.** Um novo Usuário, ao acessar a plataforma pela primeira vez, consulta `BusinessProfileView` e `CapabilityMatrix` para entender quais capacidades já estão habilitadas para sua Empresa, calibradas conforme seu Segmento e sua Maturidade.

Em cada um destes doze casos, a mesma disciplina se repete: a Query apropriada é resolvida contra um Read Model já materializado por seu módulo proprietário, nenhuma leitura produz efeito de escrita em nenhum domínio de origem, e toda Query que combine múltipla origem o faz através do Query Coordinator, preservando a interseção de Permission já descrita no Capítulo 10. Cenários compostos — como um Executivo que consulta `ExecutiveDashboard` e, a partir dele, aprofunda em `FinancialDashboard` e em `GrowthDashboard` para investigar um componente específico — são combinações legítimas das mesmas Query já catalogadas neste documento, nunca exigindo uma nova estrutura de leitura dedicada a cada combinação possível.

---

## 12. Architecture Decision Records

**ADR-001 — Queries são somente leitura.** Nenhuma Query, em nenhum módulo, produz efeito colateral de escrita. Contexto: fundamento central do padrão CQRS aplicado a toda a plataforma.

**ADR-002 — Read Models são reconstruíveis.** Todo Read Model pode ser reconstruído do zero a partir do histórico completo de Evento já catalogado em `EVENT_CATALOG.md`. Contexto: preservar Rebuild como capacidade sempre disponível, nunca dependente de estado intermediário insubstituível.

**ADR-003 — Projection deriva exclusivamente de Events.** Nenhum Read Model é atualizado por escrita direta; toda atualização acontece através de Projection consumindo Evento já publicado. Contexto: preservar a integridade da separação entre escrita e leitura.

**ADR-004 — Dashboards nunca alteram estado.** Toda superfície de apresentação consultada através deste catálogo é estritamente de leitura. Contexto: aplicação direta do princípio Queries Never Change State já descrito no Capítulo 3.

**ADR-005 — Analytics agrega dados sem assumir ownership sobre eles.** Toda Query do Analytics Hub que combine origem múltipla preserva o ownership original de cada Entidade consultada, conforme já fixado em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 4.

**ADR-006 — Commands nunca retornam Read Models.** Já fixado em `COMMAND_CATALOG.md`, ADR-020, reafirmado aqui como regra transversal deste catálogo.

**ADR-007 — Ownership permanece sempre no domínio original, mesmo quando um Read Model consolida dado de múltipla origem.** Contexto: preservar `DOMAIN_OWNERSHIP_MATRIX.md` como autoridade única sobre a quem cada conceito pertence, independentemente de onde ele é consultado.

**ADR-008 — Eventual Consistency é aceitável e esperada em toda Query catalogada, salvo indicação explícita de consistência forte.** Contexto: equilibrar performance de leitura com a natureza assíncrona do Event Bus já descrito em `SYSTEM_BLUEPRINT.md`.

**ADR-009 — Read Models são descartáveis.** A estrutura física de um Read Model nunca é tratada como ativo permanente insubstituível — apenas o histórico de Evento que a sustenta o é. Contexto: permitir evolução livre de esquema de leitura sem risco de perda de informação.

**ADR-010 — Cross Reference é obrigatório em toda menção a Query fora de seu documento de origem.** Contexto: preservar Single Source of Truth documental, mesma disciplina já aplicada em `DOMAIN_OWNERSHIP_MATRIX.md`, `EVENT_CATALOG.md` e `COMMAND_CATALOG.md`.

**ADR-011 — Toda Query verifica Permission antes de resolver seu resultado.** Contexto: aplicação do princípio Authorization First já descrito no Capítulo 3.

**ADR-012 — Tenant Isolation é preservado mesmo em Query agregada de múltipla origem.** Contexto: aplicação transversal do isolamento multiempresa já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 6.

**ADR-013 — Toda Query documenta explicitamente sua janela de consistência.** Contexto: eliminar ambiguidade sobre a atualidade do dado retornado, aplicação direta do princípio Explicit Contracts.

**ADR-014 — Nenhuma Query paginada retorna volume ilimitado de resultado.** Contexto: preservar performance e previsibilidade de consumo de todo consumidor de Query.

**ADR-015 — Consultas de busca aplicam filtro de Permission antes do ranking de relevância ou de proximidade semântica.** Contexto: já fixado em `COMMUNICATION_HUB.md`, Capítulo 15, e em `KNOWLEDGE_HUB.md`, Capítulo 17, reafirmado aqui como regra transversal a toda Query de busca.

**ADR-016 — Todo novo Read Model é registrado neste catálogo antes de sua primeira disponibilização em produção.** Contexto: garantir que este documento nunca fique desatualizado frente à evolução real da plataforma.

**ADR-017 — Este catálogo é normativo, não apenas descritivo.** Uma Query disponibilizada em produção que diverge deste catálogo é tratada como defeito de implementação a ser corrigido, nunca como justificativa para atualizar o catálogo em sentido contrário à intenção original de seu proprietário.

**ADR-018 — Nenhum Read Model é compartilhado estruturalmente entre dois módulos distintos.** Cada módulo materializa sua própria Projection, mesmo quando consome o mesmo Evento de origem que outro módulo também consome. Contexto: preservar Low Coupling e Single Ownership sobre cada Read Model individual.

**ADR-019 — Query Coordinator é o único componente autorizado a compor resultado de múltiplos Read Model simultaneamente dentro do Analytics Hub.** Contexto: já fixado em `ANALYTICS_HUB.md`, Capítulo 7, reafirmado aqui como padrão de composição de leitura agregada.

**ADR-020 — A tríade CQRS desta plataforma está oficialmente completa com a publicação deste catálogo.** Commands, Events e Queries possuem, cada um, seu próprio documento de referência consolidada. Contexto: encerrar formalmente a série de documentos de governança transversal iniciada por `DOMAIN_OWNERSHIP_MATRIX.md`.

---

## 13. Glossário

**Query** — operação que consulta um Read Model já materializado, sem jamais produzir qualquer efeito colateral de escrita.

**Read Model** — estrutura de dado otimizada para leitura, materializada a partir de Evento já publicado, sempre derivada, nunca fonte de verdade.

**Projection** — processo técnico que transforma um Evento já consumido em atualização incremental de um Read Model.

**Materialized View** — implementação física de um Read Model já pré-computada e otimizada para um padrão específico de consulta.

**Dashboard** — superfície de apresentação consolidada, composta por Widget que consultam Read Model já materializado.

**Timeline** — Read Model que expõe histórico cronológico de Evento ou de Entidade relacionada a uma dimensão específica.

**KPI** — indicador-chave derivado, consultável através de Query dedicada, sempre calculado a partir de uma ou mais Metric já existente.

**Benchmark** — referência comparativa de desempenho, consultável através de Query dedicada, preservando sempre o histórico completo de sua versão anterior.

**Forecast** — projeção futura consultável através de Query dedicada, sempre acompanhada explicitamente de sua incerteza associada.

**Aggregation** — operação de consolidação de múltiplo dado bruto em uma medida única, insumo direto de toda Projection analítica desta plataforma.

**Snapshot** — registro imutável do estado de um indicador em um instante específico, usado para acelerar a resolução futura de uma Query correspondente.

**CQRS** — Command-Query Responsibility Segregation, o padrão que separa toda operação de escrita, através de Command, de toda operação de leitura, através de Query.

**Eventual Consistency** — propriedade pela qual um Read Model reflete um Evento de origem após uma janela de latência aceitável, nunca instantaneamente.

**Projection Pipeline** — sequência técnica explícita e observável que transforma Evento consumido em Read Model atualizado.

**Read Store** — infraestrutura física que armazena um ou mais Read Model, sempre fisicamente distinta do armazenamento de escrita transacional do mesmo módulo.

**Query Coordinator** — componente responsável pela resolução paralela e pela consolidação de Query que combine múltiplos Read Model de origem simultânea.

---

## 14. Conclusão

Este documento passa a ser a autoridade oficial e definitiva para todo modelo de leitura já disponibilizado ou a ser disponibilizado pela Adaptive Business Platform. Ele não substitui nenhum dos cinco Business Hubs já documentados — cada Query aqui catalogada permanece integralmente definida, com todo seu detalhe de Read Model e de Projection associada, em seu documento de arquitetura original.

Todo novo Read Model deverá ser registrado aqui antes de sua primeira disponibilização em produção, respeitando exatamente a mesma estrutura de nove atributos já aplicada a cada entrada deste catálogo: Owner, Objetivo, Origem dos dados, Consumidores, Projeções utilizadas, Filtros, Ordenação, Consistência e Autorização — nenhuma entrada futura é aceita com menos rigor descritivo do que já foi aplicado a cada Query catalogada neste documento.

A distinção central que este documento reforça, junto a `EVENT_CATALOG.md` e a `COMMAND_CATALOG.md`, permanece definitiva: Commands representam intenção. Events representam fatos. Queries representam leitura. Nenhuma das três categorias jamais assume o papel da outra em nenhum módulo da Adaptive Business Platform, independentemente de quão conveniente pareça, em algum momento futuro, misturar essas responsabilidades para simplificar uma implementação específica.

Com a publicação deste catálogo, declara-se oficialmente concluída a tríade CQRS da Adaptive Business Platform — a camada de escrita, já consolidada em `COMMAND_CATALOG.md`; a camada de comunicação de fato, já consolidada em `EVENT_CATALOG.md`; e a camada de leitura, agora consolidada neste documento. As três camadas, juntas, respeitam integralmente `DOMAIN_OWNERSHIP_MATRIX.md`, sem alterar nenhuma atribuição de ownership ali registrada, e junto a todos os Hubs oficiais já documentados — CRM, Communication, Finance, Growth e Analytics —, completam a referência arquitetural transversal de uma plataforma inteiramente orientada a Evento, desacoplada por construção, e consultável em cada indicador que seu próprio histórico já produziu.

Toda futura extensão da Adaptive Business Platform — um sexto Business Hub, um novo Platform Service, uma nova capacidade de Adaptive Intelligence — herda, por este precedente, a mesma obrigação já estabelecida para Commands e para Events: nenhuma nova capacidade de leitura é considerada plenamente integrada à plataforma até que sua Query correspondente esteja registrada neste catálogo, com seu Owner explícito, sua origem de dado rastreável, e as nove propriedades de contrato já exigidas de toda entrada aqui documentada, sem exceção e sem atalho.
