# Domain Ownership Matrix

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento consolida oficialmente a matriz de ownership da Adaptive Business Platform. Ele não substitui nenhum documento já existente — cada conceito aqui listado permanece definido, com todo seu detalhe conceitual, arquitetural e de regra de negócio, em seu documento proprietário original: `CRM_DOMAIN_BLUEPRINT.md`, `COMMUNICATION_DOMAIN_BLUEPRINT.md`, `FINANCE_DOMAIN_BLUEPRINT.md`, `GROWTH_DOMAIN_BLUEPRINT.md`, `ANALYTICS_DOMAIN_BLUEPRINT.md`, `AUTOMATION_ENGINE.md`, `IDENTITY_HUB.md`, `KNOWLEDGE_HUB.md`, `INTEGRATION_HUB.md`, `AI_HUB.md`, `BUSINESS_PROFILE_ENGINE.md` e `BRANDING_HUB.md`. O que este documento adiciona é uma referência única, consultável em um só lugar, que resolve de forma definitiva a pergunta "quem é o proprietário deste conceito" para qualquer conceito já existente na plataforma.

Ownership, no sentido usado por toda esta série de documentos, é a atribuição exclusiva de responsabilidade por um conceito de negócio a um único módulo — o proprietário é quem define a estrutura do conceito, quem detém autoridade para alterá-lo, e quem publica o Evento que comunica sua mudança de estado ao restante da plataforma. Nenhum outro módulo além do proprietário pode escrever, redefinir ou duplicar esse conceito.

Single Source of Truth é a garantia de que, para qualquer conceito, existe exatamente um lugar na plataforma onde seu estado real e atual pode ser lido com autoridade — todo outro módulo que precise desse dado o consome através de Evento ou de Query, nunca mantém sua própria cópia divergente.

Domain Ownership é o princípio arquitetural, já introduzido em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 2, e aplicado individualmente em cada um dos cinco pares de Blueprint e Hub já documentados, segundo o qual todo domínio de negócio possui fronteira explícita e conceitos que lhe pertencem com exclusividade.

Bounded Context é o termo de Domain-Driven Design que descreve essa fronteira — o limite dentro do qual um conceito tem significado único e consistente, e além do qual sua interpretação pode legitimamente mudar ou deixar de se aplicar.

Domain-Driven Design, a disciplina de modelagem que orienta toda esta série de documentos desde `BUSINESS_HUB_ARCHITECTURE.md`, trata o alinhamento entre modelo de software e modelo de negócio como o objetivo central da arquitetura — e ownership explícito é a ferramenta central pela qual esse alinhamento é preservado à medida que a plataforma cresce.

Uma plataforma Enterprise como a Adaptive Business Platform, composta por doze módulos distintos — cinco Business Hubs, quatro Platform Services e três componentes de Adaptive Intelligence — precisa de ownership explícito porque a alternativa é a degradação silenciosa e inevitável já descrita em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 3: conceitos duplicados, lógica de negócio espalhada, e acoplamento oculto que só se manifesta quando já é caro demais corrigir. Este documento existe para que essa pergunta nunca precise ser respondida por suposição, por arqueologia de código, ou por decisão ad hoc de um único Engenheiro — ela é respondida, de forma definitiva e consultável, pela matriz que segue.

A necessidade de um documento consolidador como este só se torna evidente depois que uma plataforma já acumulou múltiplos domínios de negócio maduros — é exatamente a posição em que a Adaptive Business Platform se encontra ao final desta série. Enquanto apenas um ou dois Business Hubs existiam, a pergunta "quem é dono deste conceito" tinha resposta óbvia por eliminação; com cinco Business Hubs, quatro Platform Services e três componentes de Adaptive Intelligence já documentados, cada um com dezenas de conceitos próprios, a superfície de possível ambiguidade cresce de forma combinatória, não linear — um conceito como "Segmento", por exemplo, poderia plausivelmente pertencer ao Growth Hub, como Audience Segment, ou ao Business Profile Engine, como classificação setorial da Empresa cliente, ou ainda ao Analytics Hub, como Analytical Dimension. Sem uma matriz consolidada, cada um desses três módulos poderia, de forma independente e bem-intencionada, assumir que "Segmento" lhe pertence, produzindo exatamente o tipo de colisão conceitual que este documento existe para prevenir.

Este documento também serve a um segundo propósito, complementar ao primeiro: ele é a ferramenta de onboarding mais direta para qualquer Engenheiro, Arquiteto ou Stakeholder que precise entender rapidamente a topologia de responsabilidade da plataforma inteira, sem precisar ler os doze documentos proprietários em sequência antes de tomar uma primeira decisão de design. A matriz não substitui a leitura desses documentos quando o detalhe de um conceito específico é necessário — mas ela permite que a primeira pergunta, "isto já pertence a alguém, e a quem", seja respondida em segundos.

---

## 2. Objetivos

Esta matriz elimina ambiguidade — para qualquer conceito da plataforma, existe uma resposta única e imediatamente consultável sobre quem é seu proprietário, eliminando a necessidade de inferir essa resposta a partir de convenção implícita ou de precedente informal.

Esta matriz reduz acoplamento — ao tornar explícito quem pode consumir e quem nunca pode alterar cada conceito, ela impede que um módulo desenvolva, de forma gradual e não intencional, uma dependência direta sobre a estrutura interna de outro.

Esta matriz evita duplicação — ao registrar formalmente que cada conceito possui exatamente um proprietário, ela impede que dois módulos modelem, de forma independente e divergente, a mesma ideia de negócio sob nomes diferentes ou sob a mesma estrutura reimplementada.

Esta matriz define responsabilidades — para qualquer decisão de onde uma nova capacidade deve ser implementada, a matriz já fornece o critério de a qual domínio essa capacidade naturalmente pertence, a partir do conceito de negócio que ela manipula.

Esta matriz garante evolução independente — porque cada módulo sabe exatamente qual fronteira precisa preservar e qual Evento precisa publicar, ele pode evoluir sua implementação interna livremente, sem quebrar nenhum consumidor, desde que o contrato de Evento e a fronteira de ownership permaneçam estáveis.

Estes cinco objetivos não são independentes entre si — eles se reforçam mutuamente da mesma forma já observada entre a Filosofia e os Design Principles de cada Hub individual documentado nesta série. A eliminação de ambiguidade só é sustentável na prática porque a redução de acoplamento impede que uma resposta ambígua hoje se transforme em uma dependência técnica irreversível amanhã; e a garantia de evolução independente só se mantém porque a definição explícita de responsabilidade impede que um módulo assuma, silenciosamente, uma responsabilidade que nunca lhe pertenceu. Um leitor que reconhecer esse padrão de reforço mútuo já o observou antes, em `FINANCE_HUB.md`, Capítulo 4, e em `GROWTH_HUB.md`, Capítulo 4 — a mesma disciplina de coerência entre princípios se aplica aqui, na escala da plataforma inteira, não apenas de um único domínio.

---

## 3. Princípios

**Single Owner.** Todo conceito possui exatamente um proprietário; nenhum conceito é compartilhado entre dois ou mais módulos.

**Consumer Never Owns.** Um módulo que consome um conceito através de Evento ou de Query nunca se torna, por esse consumo, proprietário parcial desse conceito.

**No Shared Ownership.** Não existe modalidade de propriedade compartilhada, coproprietária ou de responsabilidade dividida entre dois módulos para o mesmo conceito.

**No Duplicate Models.** Nenhum módulo consumidor mantém sua própria cópia estrutural de um conceito já definido por outro módulo — ele referencia por identificador, nunca reimplementa.

**Cross Reference.** Toda menção a um conceito fora de seu documento proprietário é feita por referência explícita a esse documento, nunca por redefinição paralela.

**Immutable Boundaries.** A fronteira de ownership de um conceito, uma vez estabelecida e documentada, não é alterada informalmente — qualquer mudança de fronteira exige o processo de evolução formal descrito no Capítulo 11.

**Explicit Responsibility.** Toda responsabilidade de escrita, de leitura e de publicação de Evento associada a um conceito é atribuída de forma nomeada e verificável, nunca implícita.

**High Cohesion.** Conceitos relacionados ao mesmo aspecto de negócio permanecem sob o mesmo proprietário, evitando fragmentação de um domínio coerente entre múltiplos módulos.

**Low Coupling.** Um módulo depende apenas do contrato de Evento e de Query já exposto por outro, nunca de sua estrutura interna de implementação.

**Domain First.** A decisão de a quem um conceito pertence é sempre derivada do domínio de negócio que ele representa, nunca de conveniência técnica de implementação.

**Business First.** A linguagem usada para nomear e descrever um conceito reflete a linguagem do negócio, não uma abstração técnica arbitrária — o mesmo princípio de Linguagem Ubíqua já aplicado em cada Blueprint desta série.

**Events Before Integration.** Toda integração entre módulos é desenhada em torno do Evento que o proprietário publica, nunca em torno de uma chamada direta a ser construída posteriormente.

**Read Models Are Consumers.** Um Read Model materializado por um módulo consumidor, mesmo quando otimizado e fisicamente distinto, permanece uma cópia derivada — nunca uma fonte de verdade competindo com o proprietário original.

**Analytics Never Owns Operational Data.** O Analytics Hub consolida e projeta indicador, mas nunca se torna proprietário do dado operacional bruto que o origina — CRM, Communication, Finance e Growth continuam proprietários de seus próprios dados de origem, conforme já estabelecido em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 4.

**Automation Never Owns Business Data.** O Automation Engine decide quando um processo ocorre, mas nunca se torna proprietário do dado de negócio que esse processo manipula — a Invoice permanece do Finance Hub, a Campaign permanece do Growth Hub, mesmo quando sua criação é temporizada pelo Automation Engine.

---

## 4. Ownership Matrix

A tabela a seguir é a referência central deste documento. Cada linha representa um conceito já definido em algum documento proprietário desta série; a coluna Owner identifica o único módulo autorizado a criar, alterar e publicar Evento sobre esse conceito; a coluna Consumidores lista os módulos que legitimamente consultam ou reagem a esse conceito através de Evento ou de Query, sem nunca alterá-lo; e a coluna Justificativa resume, em uma frase, por que essa atribuição é a correta.

| Conceito | Owner | Consumidores | Justificativa |
|---|---|---|---|
| Customer | CRM Hub | Communication, Finance, Growth, Analytics | Relacionamento pertence ao CRM — `CRM_DOMAIN_BLUEPRINT.md`. |
| Lead | CRM Hub | Growth, Analytics | Potencial relacionamento ainda não convertido. |
| Organization | CRM Hub | Finance, Communication, Analytics | Entidade jurídica do relacionamento comercial. |
| Contact | CRM Hub | Communication, Analytics | Pessoa física associada a um relacionamento. |
| Opportunity | CRM Hub | Finance, Growth, Analytics | Negociação comercial em curso. |
| Opportunity Stage | CRM Hub | Analytics | Etapa do funil de relacionamento comercial. |
| Pipeline | CRM Hub | Analytics | Estrutura de organização de Opportunity. |
| Relationship Status | CRM Hub | Growth, Analytics | Estado consolidado do vínculo com o Cliente. |
| Interaction | CRM Hub | Analytics | Registro de contato pontual com o Cliente. |
| Timeline (CRM) | CRM Hub | Analytics | Histórico cronológico de relacionamento. |
| Note | CRM Hub | — | Anotação interna sobre um Cliente. |
| Tag (CRM) | CRM Hub | Growth | Rótulo de categorização de relacionamento. |
| Task (CRM) | CRM Hub | Automation | Atividade pendente associada a um relacionamento. |
| Customer Owner | CRM Hub | Identity | Usuário responsável por um relacionamento. |
| Territory | CRM Hub | — | Divisão geográfica ou setorial de relacionamento. |
| Customer Health | CRM Hub | Growth, Analytics | Indicador qualitativo de saúde do relacionamento. |
| Duplicate Resolution | CRM Hub | — | Processo de identificação de Customer duplicado. |
| Communication Preference | CRM Hub | Communication, Growth | Preferência de canal do Cliente, associada ao relacionamento. |
| Conversation | Communication Hub | CRM, Analytics | Comunicação pertence ao Communication Hub — `COMMUNICATION_DOMAIN_BLUEPRINT.md`. |
| Message | Communication Hub | Analytics | Conteúdo individual trocado dentro de uma Conversation. |
| Delivery | Communication Hub | Analytics | Registro técnico de entrega de uma Message. |
| Delivery Status | Communication Hub | Growth, Analytics | Estado de entrega de uma Message. |
| Channel | Communication Hub | Growth, Analytics | Meio técnico de comunicação. |
| Message Template | Communication Hub | Automation | Estrutura reutilizável de conteúdo de mensagem. |
| Attachment | Communication Hub | — | Arquivo anexado a uma Message. |
| Inbox | Communication Hub | — | Caixa de entrada consolidada de Conversation. |
| Thread | Communication Hub | — | Agrupamento de Message relacionadas. |
| Read Receipt | Communication Hub | Analytics | Confirmação de leitura de uma Message. |
| Invoice | Finance Hub | CRM, Growth, Analytics | Estado financeiro pertence ao Finance Hub — `FINANCE_DOMAIN_BLUEPRINT.md`. |
| Invoice Item | Finance Hub | Analytics | Linha de detalhamento de uma Invoice. |
| Payment | Finance Hub | Growth, Analytics | Registro de pagamento de uma Invoice. |
| Payment Attempt | Finance Hub | Analytics | Tentativa individual de processar um Payment. |
| Refund | Finance Hub | Analytics | Devolução de valor já pago. |
| Credit | Finance Hub | — | Valor a favor do Cliente. |
| Debit | Finance Hub | — | Valor devido pelo Cliente. |
| Wallet | Finance Hub | Analytics | Saldo de valor disponível em nome do Cliente. |
| Balance | Finance Hub | Analytics | Valor consolidado e derivado do Ledger. |
| Ledger Entry | Finance Hub | Analytics | Registro contábil imutável. |
| Transaction | Finance Hub | Analytics | Agrupamento atômico de Ledger Entry. |
| Financial Account | Finance Hub | CRM, Analytics | Conta financeira associada a uma Empresa ou Cliente. |
| Account Receivable | Finance Hub | Analytics | Valor a receber pendente. |
| Account Payable | Finance Hub | Analytics | Valor a pagar pendente. |
| Subscription | Finance Hub | Growth, Analytics | Acordo de cobrança recorrente. |
| Recurring Billing | Finance Hub | Analytics | Processo de geração de cobrança periódica. |
| Installment Plan | Finance Hub | Analytics | Estrutura de parcelamento de cobrança. |
| Payment Method | Finance Hub | — | Meio de pagamento registrado. |
| Payment Intent | Finance Hub | — | Intenção de pagamento antes de sua confirmação. |
| Settlement | Finance Hub | Analytics | Processo de liquidação junto a Provider de pagamento. |
| Reconciliation | Finance Hub | Analytics | Comparação entre registro interno e extrato externo. |
| Charge | Finance Hub | Integration | Cobrança técnica processada junto a um Provider. |
| Fee | Finance Hub | Analytics | Taxa aplicada a uma transação. |
| Discount (Finance) | Finance Hub | Growth | Redução aplicada a uma Invoice. |
| Financial Adjustment | Finance Hub | Analytics | Correção manual de estado financeiro. |
| Financial Document | Finance Hub | Branding | Invoice, Recibo ou Comprovante gerado. |
| Tax Record | Finance Hub | Analytics | Registro conceitual de tributo aplicável. |
| Currency | Finance Hub | Growth, Analytics | Moeda associada a uma transação. |
| Exchange Rate | Finance Hub | Analytics | Taxa de conversão entre moedas. |
| Campaign | Growth Hub | CRM, Finance, Analytics | Crescimento pertence ao Growth Hub — `GROWTH_DOMAIN_BLUEPRINT.md`. |
| Campaign Goal | Growth Hub | Analytics | Objetivo de resultado de uma Campaign. |
| Audience | Growth Hub | Analytics | Conjunto de potenciais ou atuais Clientes visado. |
| Audience Segment | Growth Hub | Analytics | Subdivisão estratégica de uma Audience. |
| Funnel | Growth Hub | Analytics | Modelo das etapas entre potencial e conversão. |
| Journey | Growth Hub | Communication, Automation | Sequência estratégica de Touchpoint. |
| Touchpoint | Growth Hub | Communication | Ponto de contato dentro de uma Journey. |
| Experiment | Growth Hub | Analytics | Estrutura de testagem de hipótese de crescimento. |
| A/B Test | Growth Hub | Analytics | Comparação entre duas Variant. |
| Variant | Growth Hub | — | Alternativa testada dentro de um Experiment. |
| Conversion Goal | Growth Hub | Analytics | Resultado que caracteriza sucesso de conversão. |
| Conversion Event | Growth Hub | CRM, Finance, Analytics | Registro de conversão atingida. |
| Lead Source | Growth Hub | CRM, Analytics | Origem estratégica de um potencial Cliente. |
| Attribution | Growth Hub | Analytics | Relação entre conversão e origem estratégica. |
| Attribution Model | Growth Hub | Analytics | Regra de distribuição de crédito de conversão. |
| Acquisition Channel | Growth Hub | Integration, Analytics | Canal estratégico de aquisição. |
| Activation Strategy | Growth Hub | Automation | Estratégia de ativação de novo Cliente. |
| Retention Strategy | Growth Hub | Automation, Analytics | Estratégia de retenção de Cliente ativo. |
| Expansion Strategy | Growth Hub | CRM, Finance | Estratégia de ampliação de relação comercial. |
| Referral Program | Growth Hub | Analytics | Estrutura de incentivo à indicação. |
| Referral | Growth Hub | CRM, Analytics | Indicação concreta registrada. |
| Growth Metric | Growth Hub | Analytics | Medida quantitativa isolada de crescimento. |
| Growth KPI | Growth Hub | Analytics | Indicador-chave de crescimento. |
| Cohort | Growth Hub | Analytics | Agrupamento por critério temporal ou comportamental. |
| Lifecycle Stage | Growth Hub | CRM, Analytics | Etapa de crescimento de um Cliente. |
| Engagement Score | Growth Hub | Analytics | Medida derivada de engajamento. |
| Growth Opportunity | Growth Hub | Analytics | Oportunidade estratégica de crescimento identificada. |
| Growth Initiative | Growth Hub | — | Ação estratégica planejada de crescimento. |
| Growth Insight | Growth Hub | Analytics | Constatação derivada de Growth Metric. |
| Growth Recommendation | Growth Hub | Automation | Sugestão de ação de crescimento. |
| Dashboard | Analytics Hub | Todos | Superfície consolidada de leitura — `ANALYTICS_DOMAIN_BLUEPRINT.md`. |
| Widget | Analytics Hub | — | Unidade visual de um Dashboard. |
| Report | Analytics Hub | Branding | Documento estruturado de leitura analítica. |
| Report Template | Analytics Hub | — | Estrutura reutilizável de um Report. |
| Metric | Analytics Hub | Todos | Medida quantitativa isolada consolidada. |
| KPI | Analytics Hub | Todos | Indicador-chave derivado de Metric. |
| Trend | Analytics Hub | Todos | Evolução de indicador ao longo do tempo. |
| Forecast | Analytics Hub | Todos | Projeção futura derivada de Trend. |
| Insight (Analytics) | Analytics Hub | Automation, AI | Constatação consolidada de múltiplos domínios. |
| Analytical Model | Analytics Hub | — | Estrutura lógica de transformação de Dataset. |
| Aggregation | Analytics Hub | — | Operação de consolidação de dado bruto. |
| Snapshot | Analytics Hub | — | Registro imutável de indicador em um instante. |
| Time Series | Analytics Hub | — | Sequência ordenada de Snapshot. |
| Benchmark | Analytics Hub | — | Referência comparativa de desempenho. |
| Scorecard | Analytics Hub | Todos | Conjunto estruturado de indicador consolidado. |
| Dataset | Analytics Hub | — | Dado bruto consolidado a partir de Evento. |
| Visualization | Analytics Hub | — | Representação gráfica de indicador. |
| Business Indicator | Analytics Hub | Todos | Indicador de leitura geral de negócio. |
| Executive Indicator | Analytics Hub | Todos | Indicador de leitura de alta liderança. |
| Operational Indicator | Analytics Hub | Todos | Indicador de acompanhamento operacional. |
| Strategic Indicator | Analytics Hub | Todos | Indicador de leitura de médio e longo prazo. |
| Analytical Recommendation | Analytics Hub | Automation | Sugestão de ação derivada de Insight consolidado. |
| Decision Support | Analytics Hub | Todos | Apresentação consolidada de apoio à decisão. |
| Workflow | Automation Engine | Todos | Execução pertence ao Automation Engine — `AUTOMATION_ENGINE.md`. |
| Action | Automation Engine | Todos | Unidade executável de um Workflow. |
| Trigger | Automation Engine | Todos | Condição que inicia um Workflow. |
| Condition | Automation Engine | — | Regra de decisão dentro de um Workflow. |
| Retry Policy | Automation Engine | — | Política de repetição de execução. |
| Execution Queue | Automation Engine | — | Fila de execução de Action pendente. |
| Circuit Breaker | Automation Engine | Integration | Mecanismo de proteção contra falha em cascata. |
| Notification Engine | Automation Engine | Todos | Disparo de Notification a Usuário ou a Cliente. |
| Identity | Identity Hub | Todos | Identidade pertence ao Identity Hub — `IDENTITY_HUB.md`. |
| Authentication | Identity Hub | Todos | Verificação de identidade de acesso. |
| Session | Identity Hub | Todos | Contexto de acesso autenticado ativo. |
| Token | Identity Hub | Todos | Credencial técnica de autenticação. |
| Permission | Identity Hub | Todos | Autorização granular sobre uma ação. |
| Role | Identity Hub | Todos | Conjunto nomeado de Permission. |
| Profile (Perfil) | Identity Hub | Todos | Classificação de acesso de um Usuário. |
| Knowledge Base | Knowledge Hub | AI | Conhecimento pertence ao Knowledge Hub — `KNOWLEDGE_HUB.md`. |
| Document (Knowledge) | Knowledge Hub | AI | Unidade de conteúdo documental indexado. |
| Policy | Knowledge Hub | AI, Finance, Growth | Regra documentada de negócio. |
| Procedure | Knowledge Hub | AI | Processo documentado de execução. |
| Embedding | Knowledge Hub | AI | Representação vetorial de conteúdo indexado. |
| Retrieval Index | Knowledge Hub | AI | Estrutura de busca semântica. |
| Provider (Integration) | Integration Hub | Todos | Integração externa pertence ao Integration Hub — `INTEGRATION_HUB.md`. |
| Connector | Integration Hub | Todos | Módulo técnico de conexão com sistema externo. |
| Webhook | Integration Hub | Todos | Notificação técnica recebida de sistema externo. |
| External API | Integration Hub | — | Interface técnica de um sistema externo. |
| Gateway | Integration Hub | Finance | Ponto único de saída para Provider de pagamento. |
| Rate Limit Policy | Integration Hub | — | Política de limite de chamada externa. |
| AI Prompt | AI Hub | Automation | Inteligência pertence ao AI Hub — `AI_HUB.md`. |
| AI Model | AI Hub | — | Modelo de inferência utilizado internamente. |
| Policy Engine (AI) | AI Hub | — | Mecanismo de aplicação de regra sobre decisão de IA. |
| Provider Layer (AI) | AI Hub | — | Camada de abstração sobre provedor de IA externo. |
| AI Decision | AI Hub | Todos | Sugestão gerada por inteligência automatizada. |
| Human Oversight Record | AI Hub | — | Registro de confirmação humana sobre sugestão de IA. |
| Business Profile | Business Profile Engine | Todos | Adaptação do SaaS pertence ao Business Profile Engine — `BUSINESS_PROFILE_ENGINE.md`. |
| Segment (Empresa) | Business Profile Engine | Todos | Classificação setorial da Empresa cliente. |
| Maturity | Business Profile Engine | Todos | Classificação de maturidade operacional da Empresa. |
| Business Classification | Business Profile Engine | Todos | Categorização geral de perfil de negócio. |
| Brand Theme | Branding Hub | Todos | Identidade visual pertence ao Branding Hub — `BRANDING_HUB.md`. |
| Template Manager (Branding) | Branding Hub | Analytics, Finance | Gestão de modelo visual reutilizável. |
| Document Branding | Branding Hub | Finance, Analytics | Aplicação de identidade visual a documento gerado. |
| Brand Asset | Branding Hub | — | Recurso visual — logo, cor, fonte — de uma Empresa. |

Esta tabela cobre os conceitos centrais já catalogados pelos documentos proprietários desta série. Nenhuma linha representa uma nova definição — cada uma é uma referência resumida ao conceito já integralmente descrito em seu documento de origem, indicado na coluna Justificativa sempre que aplicável.

---

## 5. Ownership por Hub

Esta seção reorganiza a mesma matriz do Capítulo 4 por proprietário, oferecendo uma leitura vertical de tudo o que cada módulo possui.

**CRM Hub** possui: Customer, Lead, Organization, Contact, Opportunity, Opportunity Stage, Pipeline, Relationship Status, Interaction, Timeline, Note, Tag, Task, Customer Owner, Territory, Customer Health, Duplicate Resolution, Communication Preference.

**Communication Hub** possui: Conversation, Message, Delivery, Delivery Status, Channel, Message Template, Attachment, Inbox, Thread, Read Receipt.

**Finance Hub** possui: Invoice, Invoice Item, Payment, Payment Attempt, Refund, Credit, Debit, Wallet, Balance, Ledger Entry, Transaction, Financial Account, Account Receivable, Account Payable, Subscription, Recurring Billing, Installment Plan, Payment Method, Payment Intent, Settlement, Reconciliation, Charge, Fee, Discount, Financial Adjustment, Financial Document, Tax Record, Currency, Exchange Rate.

**Growth Hub** possui: Campaign, Campaign Goal, Audience, Audience Segment, Funnel, Journey, Touchpoint, Experiment, A/B Test, Variant, Conversion Goal, Conversion Event, Lead Source, Attribution, Attribution Model, Acquisition Channel, Activation Strategy, Retention Strategy, Expansion Strategy, Referral Program, Referral, Growth Metric, Growth KPI, Cohort, Lifecycle Stage, Engagement Score, Growth Opportunity, Growth Initiative, Growth Insight, Growth Recommendation.

**Analytics Hub** possui: Dashboard, Widget, Report, Report Template, Metric, KPI, Trend, Forecast, Insight, Analytical Model, Aggregation, Snapshot, Time Series, Benchmark, Scorecard, Dataset, Visualization, Business Indicator, Executive Indicator, Operational Indicator, Strategic Indicator, Analytical Recommendation, Decision Support.

**Automation Engine** possui: Workflow, Action, Trigger, Condition, Retry Policy, Execution Queue, Circuit Breaker, Notification Engine.

**Identity Hub** possui: Identity, Authentication, Session, Token, Permission, Role, Profile.

**Knowledge Hub** possui: Knowledge Base, Document, Policy, Procedure, Embedding, Retrieval Index.

**Integration Hub** possui: Provider, Connector, Webhook, External API, Gateway, Rate Limit Policy.

**AI Hub** possui: AI Prompt, AI Model, Policy Engine, Provider Layer, AI Decision, Human Oversight Record.

**Business Profile Engine** possui: Business Profile, Segment (Empresa), Maturity, Business Classification.

**Branding Hub** possui: Brand Theme, Template Manager, Document Branding, Brand Asset.

```
                    DOZE PROPRIETÁRIOS DA PLATAFORMA
   ┌───────────────────────────────────────────────────────────┐
   │  Business Hubs:        CRM · Communication · Finance ·          │
   │                        Growth · Analytics                          │
   │  Platform Services:    Automation · Identity · Knowledge ·               │
   │                        Integration                                          │
   │  Adaptive Intelligence: AI · Business Profile · Branding                        │
   └───────────────────────────────────────────────────────────┘
```

---

## 6. Dependências Permitidas

Todo módulo pode consumir Evento publicado por qualquer outro módulo, desde que essa consumo nunca produza escrita de volta sobre o estado do módulo de origem.

```
              QUEM PUBLICA, QUEM CONSOME (visão geral)
   ┌───────────────────────────────────────────────────────────┐
   │  CRM Hub ──publica──► ConversionRegistered (consumido por        │
   │                        Growth), mudança de Relacionamento           │
   │                        (consumido por Analytics)                       │
   │                                                                │
   │  Communication Hub ──publica──► confirmação de entrega                    │
   │                        (consumido por Growth, Analytics)                     │
   │                                                                │
   │  Finance Hub ──publica──► InvoicePaid, PaymentCaptured                          │
   │                        (consumido por CRM, Growth, Analytics)                      │
   │                                                                │
   │  Growth Hub ──publica──► CampaignCreated, ReferralConverted                            │
   │                        (consumido por CRM, Finance, Analytics)                            │
   │                                                                │
   │  Analytics Hub ──publica──► InsightGenerated,                                                │
   │                        RecommendationGenerated (consumido apenas                               │
   │                        por Automation Engine — nunca pelos Hubs                                   │
   │                        operacionais para sua própria escrita)                                       │
   └───────────────────────────────────────────────────────────┘
```

Todo Business Hub pode consumir Platform Service e Adaptive Intelligence livremente — Identity Hub para autenticação, Knowledge Hub para Retrieval, Integration Hub para comunicação externa, AI Hub para sugestão, Business Profile Engine para calibração de Configuration, Branding Hub para identidade visual — sem que esse consumo jamais produza escrita de volta sobre o Business Hub consumidor.

Quem publica Evento é sempre e exclusivamente o proprietário do conceito envolvido — apenas o Finance Hub publica `InvoicePaid`; apenas o Growth Hub publica `CampaignCreated`; apenas o CRM Hub publica mudança de Relacionamento.

Quem apenas consulta faz isso através de Query already exposta pelo proprietário, ou através de Read Model já materializado a partir de Evento consumido, nunca por acesso direto à estrutura interna de armazenamento de outro módulo.

Quem nunca modifica outro Hub é todo módulo, sem exceção — nenhum Business Hub, nenhum Platform Service, nenhum componente de Adaptive Intelligence possui, em nenhuma circunstância, capacidade técnica de escrever diretamente sobre a Entidade de outro módulo.

Uma distinção adicional merece registro explícito neste capítulo: nem toda dependência permitida tem a mesma direção em ambos os sentidos. A dependência entre um Business Hub e um Platform Service, como Identity Hub ou Integration Hub, é tipicamente unidirecional — o Business Hub consome o serviço, mas o serviço nunca depende de volta da lógica de negócio específica de nenhum Business Hub individual, preservando a mesma neutralidade transversal já exigida de todo Platform Service em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 14. Já a dependência entre dois Business Hubs operacionais, como CRM e Growth, tende a ser bidirecional em nível de Evento — cada um publica algo que o outro consome —, mas nunca bidirecional em nível de escrita, que permanece sempre estritamente unidirecional em direção ao proprietário do conceito alterado.

Uma segunda observação relevante diz respeito à posição do Analytics Hub nesta rede de dependência, já detalhada em `ANALYTICS_HUB.md`, Capítulo 3: ele é o único módulo cuja dependência de entrada é praticamente universal — consome Evento de todos os cinco Business Hubs — e cuja dependência de saída, em termos de escrita, é praticamente nula. Essa assimetria deliberada faz do Analytics Hub o módulo estruturalmente mais seguro de toda a plataforma do ponto de vista de risco de acoplamento indevido, precisamente porque sua natureza de consumidor universal nunca se converte em autoridade de escrita sobre nenhuma das fontes que consome.

---

## 7. Dependências Proibidas

CRM alterar Finance é proibido — o CRM Hub nunca cria, atualiza ou cancela uma Invoice, mesmo quando uma Opportunity é marcada como ganha; essa criação é sempre delegada ao Finance Hub através do Evento `OpportunityWon`, conforme já estabelecido em `FINANCE_DOMAIN_BLUEPRINT.md`, ADR-005.

Growth alterar CRM é proibido — o Growth Hub nunca cria diretamente um Customer a partir de um Referral convertido; essa criação é sempre responsabilidade do CRM Hub, acionada pelo Evento `ReferralConverted`, conforme já estabelecido em `GROWTH_DOMAIN_BLUEPRINT.md`, ADR-003.

Analytics alterar qualquer domínio é proibido — o Analytics Hub é, por desenho, somente leitura em relação a todos os demais Business Hubs, conforme já estabelecido em `ANALYTICS_HUB.md`, ADR-001; nenhuma Query ou Command deste módulo produz efeito de escrita fora de sua própria fronteira.

Automation alterar ownership é proibido — o Automation Engine decide quando um processo deve ocorrer, mas nunca redefine a quem um conceito pertence, nem cria diretamente uma Invoice, uma Campaign ou um Customer sem passar pelo Command exposto pelo Hub proprietário correspondente.

AI alterar estado operacional é proibido — o AI Hub apoia decisão através de sugestão, mas nunca executa diretamente uma mudança de estado em CRM, Communication, Finance, Growth ou Analytics, aplicação do princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5.

Knowledge alterar negócio é proibido — o Knowledge Hub administra conhecimento documental, mas nunca produz efeito de escrita sobre Payment, Campaign ou Customer, mesmo quando uma Política nele registrada é diretamente relevante a uma decisão de negócio.

Communication decidir estratégia de relacionamento é proibido — o Communication Hub executa a entrega técnica de uma mensagem, mas nunca decide, por si só, qual estratégia de retenção ou qual segmentação de Audience deveria motivar essa entrega; essa decisão permanece exclusiva do CRM Hub ou do Growth Hub, conforme o caso, conforme já estabelecido em `COMMUNICATION_DOMAIN_BLUEPRINT.md`.

Integration decidir política de negócio é proibido — o Integration Hub media toda comunicação técnica com sistema externo, mas nunca decide, por conta própria, se uma cobrança deve ser tentada novamente ou se uma Campaign deve ser pausada; essas decisões permanecem exclusivas do Finance Hub e do Growth Hub, respectivamente, conforme já estabelecido em `INTEGRATION_HUB.md`, ADR-001.

Branding alterar conteúdo de negócio é proibido — o Branding Hub aplica identidade visual a um documento já gerado, mas nunca altera o conteúdo substantivo desse documento, como o valor de uma Invoice ou o texto de um Report, responsabilidade que permanece exclusiva do módulo proprietário do conteúdo em questão.

Estes seis exemplos adicionais reforçam o mesmo padrão já estabelecido pelos seis primeiros: toda dependência proibida nesta plataforma tem a mesma forma — um módulo que não é o proprietário de um conceito tentando exercer autoridade de decisão ou de escrita sobre ele, ainda que de forma bem-intencionada ou operacionalmente conveniente no curto prazo.

```
              EXEMPLO DE DEPENDÊNCIA PROIBIDA
   ┌───────────────────────────────────────────────────────────┐
   │  PROIBIDO:                                                     │
   │    Growth Hub ──escreve diretamente──► Customer (CRM Hub)         │
   │                                                                │
   │  CORRETO:                                                         │
   │    Growth Hub ──publica──► ReferralConverted                          │
   │                       │                                                │
   │                       ▼                                                │
   │    CRM Hub ──consome Evento──► cria Customer                              │
   └───────────────────────────────────────────────────────────┘
```

---

## 8. Fluxo Oficial de Ownership

```
   CRM
      │
      ▼
   Events (mudança de Relacionamento, conversão)
      │
      ▼
   Analytics
      │
      ▼
   Insights
      │
      ▼
   Automation
      │
      ▼
   CRM Command (executado apenas após confirmação humana ou
   Regra determinística já configurada)
```

Este fluxo demonstra o caminho oficial pelo qual uma constatação analítica pode, em última instância, influenciar uma mudança de estado no CRM Hub — sem que o Analytics Hub jamais escreva diretamente sobre ele. O CRM Hub publica Evento de mudança de Relacionamento; o Analytics Hub consome esse Evento, entre outros, e consolida um Insight; o Insight, quando relevante, origina uma Analytical Recommendation; quando essa Recommendation é confirmada por decisão humana, o Automation Engine decide o momento de sua execução; e apenas então um Command formal, já exposto pelo CRM Hub como parte de seu próprio contrato público, é invocado para produzir a mudança de estado — nunca uma escrita direta originada fora da fronteira do CRM Hub.

O mesmo padrão se repete para qualquer combinação de Hub de origem e Hub de destino — Finance, Growth e Communication seguem exatamente a mesma cadeia: Evento, consolidação analítica quando aplicável, Recommendation, confirmação humana, e só então Command formal executado pelo próprio proprietário do conceito alterado.

```
              FLUXO GENERALIZADO DE INFLUÊNCIA ENTRE HUBS
   ┌───────────────────────────────────────────────────────────┐
   │  Hub de Origem ──Evento──► Analytics ──Insight──►              │
   │  Recommendation ──confirmação humana──► Automation ──►             │
   │  Command formal ──► Hub de Destino (proprietário do conceito           │
   │  alterado)                                                                │
   └───────────────────────────────────────────────────────────┘
```

---

## 9. Regras de Governança

Todo conceito possui um único Owner, registrado nesta matriz.

Nenhum Hub altera dados de outro Hub, sob nenhuma circunstância operacional ou de exceção temporária.

Commands respeitam ownership — todo Command é sempre processado pelo módulo proprietário do conceito que ele altera.

Queries nunca alteram estado — toda Query, em qualquer módulo, é estritamente de leitura.

Eventos são publicados apenas pelo Owner — nenhum módulo consumidor publica, em nome de outro, um Evento que not lhe pertence.

Consumidores nunca redefinem modelos — um módulo consumidor referencia a estrutura do proprietário por identificador, nunca reimplementa sua própria versão divergente.

Toda integração nova passa pelo processo de evolução formal descrito no Capítulo 11 antes de sua implementação.

Nenhuma exceção de ownership é aprovada informalmente — qualquer exceção proposta exige registro formal de ADR e atualização correspondente desta matriz antes de qualquer implementação.

Todo novo Hub, ao ser criado, define seus próprios conceitos nesta matriz antes de sua primeira integração com qualquer outro módulo, seguindo integralmente o processo de evolução formal descrito no Capítulo 11.

Toda mudança de fronteira de ownership exige revisão formal do documento proprietário original antes de sua efetivação, nunca apenas uma atualização isolada desta matriz.

Read Model materializado por um consumidor nunca é tratado como fonte de verdade — apenas o proprietário original detém essa autoridade.

Toda Anti-Corruption Layer entre dois módulos é documentada explicitamente no Hub consumidor correspondente, nunca deixada implícita apenas em código.

Nenhum módulo assume disponibilidade constante de outro — toda integração prevê Graceful Degradation, conforme já demonstrado em cada Hub desta série.

Toda comunicação entre Business Hubs acontece exclusivamente através de Evento, nunca por chamada direta a API interna.

Human Oversight é preservado em toda sugestão gerada por AI Hub ou por Analytics Hub — nenhuma sugestão se torna ação sem confirmação humana ou Regra determinística já configurada.

Toda operação sensível de qualquer módulo é auditável, aplicação transversal do princípio Auditability by Design já presente em cada Hub.

Tenant Isolation é preservado em todo módulo, sem exceção, conforme já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 6.

Esta matriz é revisada formalmente sempre que um novo conceito, um novo Hub ou uma nova integração é proposta, nunca deixada desatualizada frente à evolução real e contínua da plataforma.

Divergência entre esta matriz e um documento proprietário específico é sempre resolvida a favor do documento proprietário, que permanece a fonte de verdade estrutural; esta matriz é atualizada para refletir essa correção.

Nenhum conceito é removido desta matriz sem que seu documento proprietário correspondente também registre formalmente e explicitamente sua descontinuação.

---

## 10. Casos de Violação

Duplicar Customer ocorre quando um módulo além do CRM Hub cria sua própria tabela interna de Cliente, com nome, e-mail e demais atributos replicados — uma violação direta do princípio No Duplicate Models, porque cria duas fontes de verdade divergentes para o mesmo conceito, uma das quais inevitavelmente ficará desatualizada em relação à outra.

Duplicar Invoice ocorre quando o Growth Hub, ao registrar o custo de uma Campaign, cria sua própria estrutura de cobrança em vez de publicar Evento consumido pelo Finance Hub — uma violação que fragmenta o Ledger, já estabelecido como fonte única de verdade financeira em `FINANCE_DOMAIN_BLUEPRINT.md`.

Analytics escrevendo Customer ocorre quando um Dashboard do Analytics Hub expõe uma funcionalidade de edição direta de dado de Cliente — uma violação do princípio Analytics Never Owns Operational Data e do ADR-001 já fixado em `ANALYTICS_HUB.md`.

Automation salvando Invoice ocorre quando o Automation Engine, ao decidir que uma cobrança recorrente deve ocorrer, cria a Invoice diretamente em sua própria estrutura interna em vez de invocar o Command Create Invoice já exposto pelo Finance Hub — uma violação do princípio Automation Never Owns Business Data.

AI criando Campaign ocorre quando o AI Hub, ao identificar uma oportunidade de crescimento, cria e inicia uma Campaign diretamente sem qualquer confirmação humana — uma violação direta do princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5, e do ADR-009 já fixado em `GROWTH_DOMAIN_BLUEPRINT.md`.

Knowledge alterando Payment ocorre quando o Knowledge Hub, ao processar uma Política de reembolso documentada, aciona diretamente um Refund sem passar pelo Command formal do Finance Hub — uma violação da fronteira entre conhecimento documental e execução financeira.

Cada um destes seis casos compartilha a mesma característica estrutural: um módulo que não é o proprietário do conceito envolvido produz, ainda que com boa intenção operacional, um efeito de escrita que só o proprietário deveria produzir. A correção, em todos os casos, é a mesma — substituir a escrita direta por um Evento publicado ou por um Command formal invocado através do contrato já exposto pelo proprietário correspondente.

Um segundo grupo de violação, mais sutil do que a escrita direta já descrita acima, é a duplicação silenciosa de indicador. Ela ocorre quando um Business Hub operacional, precisando de uma leitura consolidada para sua própria interface, implementa seu próprio cálculo de KPI em vez de consumir a Metric já calculada pelo Analytics Hub — por exemplo, se o Growth Hub calculasse, internamente e de forma paralela, sua própria versão de um Business Indicator já exposto pelo Analytics Hub, em vez de consumi-lo através de Query. Esta violação é particularmente perigosa porque não produz um erro imediato e visível como uma escrita indevida produziria — ela produz, em vez disso, uma divergência gradual entre duas leituras do mesmo indicador, exatamente o problema de "métricas inconsistentes" já descrito como motivação central em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 3.

Um terceiro grupo de violação é a criação de Anti-Corruption Layer insuficiente — quando um módulo consumidor, ao integrar com outro, expõe diretamente a estrutura interna do proprietário em sua própria interface, em vez de traduzi-la para seu próprio vocabulário de domínio. Um Growth Hub que expusesse diretamente a estrutura de Customer do CRM Hub em sua própria tela de Audience, em vez de traduzi-la para seu próprio conceito de Audience, estaria criando um acoplamento estrutural oculto — qualquer mudança futura na estrutura interna de Customer se propagaria diretamente para o Growth Hub, quebrando o desacoplamento que a Anti-Corruption Layer existe para garantir, conforme já detalhado em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 8.

---

## 11. Processo de Evolução

Quando um novo conceito surge — seja dentro de um Hub já existente, seja como parte de um novo Hub inteiramente novo —, sua incorporação à plataforma segue um processo formal, nunca uma decisão ad hoc de implementação.

Primeiro, o conceito é avaliado frente à fronteira de todo Hub já existente, verificando se ele já pertence, por natureza, a um domínio já documentado — um novo tipo de indicador, por exemplo, tipicamente pertence ao Analytics Hub, não exige um novo proprietário.

Segundo, caso o conceito não pertença a nenhum domínio existente, decide-se se ele justifica um novo Hub inteiro ou se é uma extensão de um Hub já existente — essa decisão segue o mesmo critério de coesão de negócio já aplicado durante a criação de cada um dos cinco Business Hubs desta série, nunca um critério de conveniência técnica.

Terceiro, o Owner do novo conceito é registrado formalmente — primeiro em seu próprio documento Blueprint ou de arquitetura, e em seguida nesta matriz, nunca o inverso.

Quarto, toda integração com módulo já existente é desenhada em torno de Evento, nunca de chamada direta, seguindo o mesmo padrão já demonstrado em cada par de Blueprint e Hub desta série.

Quinto, um ADR formal é registrado no documento proprietário do novo conceito, explicitando por que esse Owner foi escolhido e quais dependências permitidas e proibidas resultam dessa escolha.

Sexto, esta matriz é atualizada com uma nova linha na tabela do Capítulo 4 e com a atualização correspondente da lista por Hub no Capítulo 5.

Sétimo, toda revisão de ADR relacionada a esse conceito, em qualquer documento da plataforma, é cruzada contra esta matriz para garantir que nenhuma contradição de ownership tenha sido introduzida.

Este processo garante consistência de longo prazo — a matriz nunca fica desatualizada por mais do que o tempo necessário para que um novo conceito complete seu próprio ciclo de documentação formal, e nenhuma decisão de ownership é tomada sem o mesmo rigor já aplicado a CRM, a Communication, a Finance, a Growth e a Analytics.

Um caso particular deste processo merece atenção específica: a evolução de um conceito já existente, em vez da introdução de um conceito inteiramente novo. Quando um Hub já documentado precisa estender um conceito já catalogado nesta matriz — por exemplo, se o Finance Hub precisasse introduzir uma nova variação de Payment Method —, esse conceito não exige uma nova linha na matriz nem um novo Owner; ele permanece integralmente sob o Owner já registrado, e sua evolução é tratada inteiramente dentro do processo de manutenção já descrito no próprio documento proprietário, sem necessidade de revisão desta matriz. A matriz é atualizada apenas quando a fronteira de ownership em si muda — um conceito novo aparece, um conceito existente é descontinuado, ou a atribuição de um conceito a um Owner é formalmente reconsiderada.

Um segundo caso particular é a introdução de um Hub inteiramente novo, análogo ao que já ocorreu cinco vezes ao longo desta série — CRM, Communication, Finance, Growth e Analytics. Um sexto Business Hub futuro seguiria exatamente a mesma sequência de sete passos já descrita acima, com uma etapa adicional anterior a todas as demais: a verificação explícita, documentada e registrada, de que o conceito central desse novo Hub não é uma reformulação de um conceito já pertencente a um dos cinco Business Hubs, a um dos quatro Platform Services, ou a um dos três componentes de Adaptive Intelligence já existentes. Esta verificação prévia é o que impede que a plataforma cresça por acúmulo de domínios redundantes, preservando a coerência de ownership que esta matriz existe para documentar.

---

## 12. Architecture Decision Records

**ADR-001 — Single Ownership.** Todo conceito da plataforma possui exatamente um proprietário. Contexto: fundamento de toda esta matriz e de todo Domain Ownership já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`.

**ADR-002 — No Shared Ownership.** Nenhuma modalidade de propriedade compartilhada é admitida entre dois módulos para o mesmo conceito. Contexto: eliminar a ambiguidade de responsabilidade que uma propriedade dividida inevitavelmente produz.

**ADR-003 — Cross References.** Toda menção a um conceito fora de seu documento proprietário é feita por referência, nunca por redefinição. Contexto: preservar Single Source of Truth documental, espelhando a mesma disciplina já aplicada a todo Evento e Entidade da plataforma.

**ADR-004 — Analytics Read Only.** O Analytics Hub nunca produz escrita sobre qualquer outro Business Hub. Contexto: já fixado em `ANALYTICS_HUB.md`, ADR-001, e reafirmado aqui como regra transversal de governança.

**ADR-005 — Finance Owns Money.** Todo estado financeiro — Invoice, Payment, Ledger — pertence exclusivamente ao Finance Hub. Contexto: já fixado em `FINANCE_DOMAIN_BLUEPRINT.md`, ADR-001.

**ADR-006 — CRM Owns Relationships.** Todo relacionamento — Customer, Lead, Organization, Opportunity — pertence exclusivamente ao CRM Hub. Contexto: já fixado em `CRM_DOMAIN_BLUEPRINT.md`.

**ADR-007 — Growth Owns Growth.** Toda estratégia e medição de crescimento — Campaign, Experiment, Attribution — pertence exclusivamente ao Growth Hub. Contexto: já fixado em `GROWTH_DOMAIN_BLUEPRINT.md`, ADR-001.

**ADR-008 — Automation Executes.** O Automation Engine decide quando um processo ocorre, mas nunca possui o dado de negócio manipulado por esse processo. Contexto: já estabelecido em `AUTOMATION_ENGINE.md`, e reafirmado como princípio transversal no Capítulo 3 deste documento.

**ADR-009 — AI Recommends.** O AI Hub apoia decisão através de sugestão, nunca assume autoridade final sobre estado de negócio de nenhum módulo. Contexto: já fixado em `AI_HUB.md`, Capítulo 5.

**ADR-010 — Knowledge Stores Knowledge.** O Knowledge Hub administra conhecimento documental, nunca estado operacional de negócio. Contexto: já estabelecido em `KNOWLEDGE_HUB.md`.

**ADR-011 — Identity Owns Identity.** Toda autenticação, sessão e permissão pertence exclusivamente ao Identity Hub. Contexto: já estabelecido em `IDENTITY_HUB.md`.

**ADR-012 — Integration Owns External Connectivity.** Toda comunicação técnica com sistema externo é mediada exclusivamente pelo Integration Hub. Contexto: já estabelecido em `INTEGRATION_HUB.md`, ADR-001.

**ADR-013 — Business Profile Owns Adaptation.** Toda classificação de Segmento e de Maturidade da Empresa cliente pertence exclusivamente ao Business Profile Engine. Contexto: já estabelecido em `BUSINESS_PROFILE_ENGINE.md`.

**ADR-014 — Branding Owns Visual Identity.** Toda identidade visual aplicada a documento ou a relatório pertence exclusivamente ao Branding Hub. Contexto: já estabelecido em `BRANDING_HUB.md`.

**ADR-015 — Esta matriz é normativa, não apenas descritiva.** Um conflito entre uma implementação real e esta matriz é tratado como um defeito a ser corrigido na implementação, nunca como justificativa para atualizar a matriz em sentido contrário à intenção original de ownership. Contexto: preservar a autoridade desta matriz como referência de governança, não apenas como documentação histórica.

**ADR-016 — Duplicação silenciosa de indicador é tratada como violação de ownership, não como otimização de desempenho.** Nenhum módulo implementa seu próprio cálculo paralelo de um indicador já proprietário de outro módulo, mesmo sob justificativa de latência ou de conveniência local. Contexto: aplicação do princípio No Duplicate Models estendido explicitamente a indicador derivado, não apenas a Entidade primária, conforme já detalhado no Capítulo 10.

**ADR-017 — Todo novo Hub verifica, antes de sua criação, se seu conceito central já pertence a um módulo existente.** Contexto: prevenir crescimento por acúmulo de domínio redundante, preservando a disciplina de Domain First já estabelecida no Capítulo 3, e aplicada com sucesso em cada um dos cinco Business Hubs já documentados nesta série.

---

## 13. Glossário

**Ownership** — atribuição exclusiva de responsabilidade por um conceito de negócio a um único módulo.

**Owner** — módulo autorizado a criar, alterar e publicar Evento sobre um conceito.

**Consumer** — módulo que consulta ou reage a um conceito sem nunca alterá-lo.

**Domain** — área de negócio delimitada por uma fronteira conceitual explícita.

**Hub** — implementação técnica de um domínio de negócio, organizada como Business Hub, Platform Service ou componente de Adaptive Intelligence.

**Aggregate** — agrupamento de Entidade e de regra de negócio tratado como unidade consistente de escrita.

**Capability** — capacidade de negócio nomeada, implementada por um ou mais componentes internos de um Hub.

**Bounded Context** — limite dentro do qual um conceito tem significado único e consistente.

**Cross Reference** — referência explícita a um conceito já definido em outro documento, em vez de sua redefinição.

**Governance** — conjunto de regras que preserva a consistência de ownership ao longo da evolução da plataforma.

**Event** — registro de mudança de estado publicado pelo proprietário de um conceito.

**Command** — instrução que solicita mudança de estado, processada exclusivamente pelo proprietário do conceito envolvido.

**Query** — instrução de leitura que nunca produz efeito de escrita.

**Read Model** — estrutura de leitura otimizada, materializada a partir de Evento, sempre derivada, nunca fonte de verdade.

**Write Model** — estrutura de escrita mantida exclusivamente pelo proprietário de um conceito.

**Single Source of Truth** — garantia de que existe exatamente um lugar autoritativo onde o estado real de um conceito pode ser lido.

**Anti-Corruption Layer** — camada de tradução que impede que a estrutura interna de um módulo proprietário se propague diretamente para dentro de um módulo consumidor.

**Duplicação silenciosa de indicador** — violação em que um módulo calcula, de forma paralela e independente, sua própria versão de um indicador já proprietário de outro módulo.

**Graceful Degradation** — capacidade de um módulo continuar operando de forma reduzida quando uma dependência externa está indisponível, sem interromper sua capacidade essencial.

**Human Oversight** — princípio segundo o qual toda sugestão gerada por inteligência automatizada permanece sujeita a confirmação humana antes de qualquer ação de negócio efetiva.

---

## 14. Conclusão

Este documento é a autoridade oficial sobre ownership da Adaptive Business Platform. Todo novo documento produzido a partir de agora deverá respeitar esta matriz; todo novo Hub, ao ser criado, deverá definir seus conceitos aqui antes de sua primeira integração com qualquer módulo já existente; e toda evolução futura da plataforma deverá preservar o princípio que atravessa cada capítulo deste documento: cada conceito possui exatamente um proprietário.

O mapa oficial de ownership, consolidado por esta matriz a partir de todos os documentos já produzidos nesta série, permanece: CRM é proprietário do relacionamento. Communication é proprietário da comunicação. Finance é proprietário do estado financeiro. Growth é proprietário do crescimento. Analytics é proprietário da inteligência analítica. Automation é proprietário da execução. AI é proprietário da inteligência de recomendação. Knowledge é proprietário do conhecimento. Identity é proprietário da identidade. Integration é proprietário das integrações externas. Business Profile é proprietário da adaptação do SaaS. Branding é proprietário da identidade visual. Nenhum destes doze proprietários se sobrepõe a outro, e nenhum conceito já catalogado nesta matriz permanece sem uma resposta clara a essa atribuição.

Este documento encerra, com esta consolidação, a principal referência de governança arquitetural da Adaptive Business Platform — não como substituto de nenhum documento proprietário já existente, mas como o único lugar onde a pergunta "quem é dono deste conceito" encontra, para qualquer conceito já documentado, uma resposta única, explícita e definitiva, independentemente de quantos novos Hubs, novos conceitos ou novas integrações venham a se somar à plataforma no futuro.
