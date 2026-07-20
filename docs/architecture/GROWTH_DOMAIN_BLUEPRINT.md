# Growth Domain Blueprint

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento define, de forma oficial e exclusiva, o domínio Growth da Adaptive Business Platform. Ele é o proprietário deste domínio nos mesmos termos já estabelecidos por `CRM_DOMAIN_BLUEPRINT.md`, por `COMMUNICATION_DOMAIN_BLUEPRINT.md` e por `FINANCE_DOMAIN_BLUEPRINT.md`: define sua fronteira, suas Entidades conceituais, suas Capacidades de Negócio, seus Eventos e suas Regras de negócio. Este documento não define arquitetura — nenhum componente interno, nenhum Command, nenhuma Query. A arquitetura do domínio Growth será definida, no futuro, por um documento chamado `GROWTH_HUB.md`, que deverá respeitar integralmente tudo o que aqui é estabelecido, exatamente como `CRM_HUB.md` respeita `CRM_DOMAIN_BLUEPRINT.md`, como `COMMUNICATION_HUB.md` respeita `COMMUNICATION_DOMAIN_BLUEPRINT.md`, e como `FINANCE_HUB.md` respeita `FINANCE_DOMAIN_BLUEPRINT.md`.

Growth é responsável por toda estratégia e operação de crescimento da plataforma — a disciplina de negócio que transforma potencial de mercado em Cliente ativo, Cliente ativo em Cliente retido, e Cliente retido em Cliente que expande sua relação com a Empresa ou a indica a terceiros. Este domínio é um Business Hub, na categorização já estabelecida em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 1, e segue integralmente as regras ali definidas para todo Business Hub: Domain Ownership, Eventos sobre chamada direta, Anti-Corruption Layer nas fronteiras com outros domínios.

A posição do Growth entre os Business Hubs já documentados exige uma clareza de fronteira redobrada, porque seu próprio nome sugere sobreposição com responsabilidades já atribuídas a outros domínios. CRM continua proprietário do relacionamento — quem é o Cliente, qual seu histórico de interação, qual sua Organização, conforme já definido em `CRM_DOMAIN_BLUEPRINT.md`. Communication continua proprietário da comunicação — o que foi dito, por qual canal, com qual Conversation associada, conforme já definido em `COMMUNICATION_DOMAIN_BLUEPRINT.md`. Finance continua proprietário do estado financeiro — o que é devido, o que foi pago, o que consta no Ledger, conforme já definido em `FINANCE_DOMAIN_BLUEPRINT.md`. Growth é proprietário do crescimento do negócio — a estratégia, a medição e a orquestração conceitual de como a Empresa adquire, ativa, retém, expande e multiplica sua base de Clientes, sem jamais assumir a posse de Entidades que já pertencem a esses três domínios.

---

## 2. Missão

A missão do domínio Growth é gerenciar aquisição, ativação, retenção, expansão e indicação de Clientes de forma mensurável, escalável e desacoplada dos demais domínios de negócio da plataforma — permitindo que toda estratégia de crescimento seja desenhada, executada e avaliada através de conceitos próprios, sem depender de acesso direto a Entidades de CRM, de Communication ou de Finance, e sem que esses domínios precisem conhecer a lógica interna de uma Campaign, de um Experiment ou de uma Journey.

---

## 3. Problema que Resolve

Sem um domínio Growth explicitamente delimitado, uma plataforma de negócio tende a acumular uma série de problemas recorrentes, todos já observados na motivação de domínios anteriores desta série e agravados quando não existe um proprietário claro da estratégia de crescimento.

Campanhas isoladas surgem quando cada iniciativa de aquisição é desenhada e executada sem relação com as demais, impedindo qualquer leitura consolidada de qual estratégia efetivamente traz resultado. Ausência de funil surge quando não existe um modelo explícito das etapas entre o primeiro contato de um potencial Cliente e sua conversão efetiva, tornando invisível em qual etapa a maior parte do potencial de negócio se perde. Perda de conversões é a consequência direta dessa ausência de funil — sem visibilidade de etapa, uma oportunidade de conversão se perde sem que ninguém identifique o ponto exato da perda. Baixa retenção surge quando a Empresa investe em trazer Cliente novo, mas não possui estratégia equivalente para manter o Cliente já adquirido ativo ao longo do tempo. Ausência de experimentação surge quando toda decisão de crescimento é baseada em intuição, sem comparação estruturada entre alternativas. Falta de atribuição surge quando a Empresa não consegue relacionar um resultado de conversão à campanha ou ao canal que efetivamente o originou, tornando qualquer decisão de investimento em aquisição um exercício de suposição. Crescimento não mensurável é a soma de todos os problemas anteriores — sem funil, sem atribuição e sem experimentação, a métrica de crescimento se torna uma leitura superficial, incapaz de orientar decisão real. Mistura entre CRM e Marketing surge quando, na ausência de um domínio Growth próprio, a lógica de campanha e de funil é implementada dentro do próprio CRM, corrompendo a fronteira de responsabilidade já estabelecida em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 3, e reproduzindo exatamente o tipo de acoplamento indevido que aquele documento already alerta como risco central de domínios sobrepostos.

O domínio Growth resolve estes problemas ao introduzir um proprietário único e explícito para Campaign, Audience, Funnel, Journey, Experiment e Attribution — conceitos que passam a existir de forma consistente, mensurável e reutilizável em toda a plataforma, em vez de serem reimplementados de forma fragmentada dentro de outros domínios que não foram desenhados para sustentá-los.

---

## 4. Boundaries (Bounded Context)

### Pertence ao Growth

| Conceito | Por que pertence ao Growth |
|---|---|
| Campaign | É a unidade central de iniciativa de crescimento — sua estratégia, seu objetivo e sua execução conceitual pertencem exclusivamente a este domínio. |
| Campaign Goal | Define o resultado esperado de uma Campaign, inseparável de sua estratégia. |
| Audience | É o conjunto de potenciais ou atuais Clientes visado por uma Campaign, modelado como conceito de Growth, não como lista de Customer do CRM. |
| Audience Segment | É uma subdivisão de Audience por critério de crescimento, parte da mesma lógica de segmentação estratégica. |
| Funnel | Modela as etapas entre potencial e conversão, o instrumento central de medição de perda de crescimento. |
| Journey | Modela a sequência de etapas que um potencial ou atual Cliente percorre dentro de uma estratégia de crescimento. |
| Touchpoint | É um ponto de contato dentro de uma Journey, unidade estrutural do modelo de jornada. |
| Experiment | É a unidade de testagem estruturada de uma hipótese de crescimento. |
| A/B Test | É um tipo específico de Experiment, parte do mesmo conceito de experimentação. |
| Variant | É uma alternativa testada dentro de um Experiment. |
| Conversion Goal | Define o resultado que caracteriza sucesso de conversão dentro de um Funnel ou de uma Campaign. |
| Conversion Event | É o registro de que uma Conversion Goal foi atingida. |
| Lead Source | Identifica a origem estratégica de um potencial Cliente, dado de crescimento por natureza. |
| Attribution | Relaciona um resultado de conversão à Campaign ou ao Acquisition Channel que o originou. |
| Attribution Model | Define a regra estratégica de como o crédito de uma conversão é distribuído entre múltiplos pontos de contato. |
| Acquisition Channel | Modela o canal estratégico de aquisição, distinto do Channel de comunicação já definido em `COMMUNICATION_DOMAIN_BLUEPRINT.md`. |
| Activation Strategy | Define a estratégia de como um Cliente recém-adquirido é levado a obter valor inicial da Empresa. |
| Retention Strategy | Define a estratégia de como um Cliente já ativo é mantido engajado ao longo do tempo. |
| Expansion Strategy | Define a estratégia de como um Cliente já retido é levado a ampliar sua relação comercial com a Empresa. |
| Referral Program | Define a estrutura estratégica de incentivo à indicação. |
| Referral | É o registro de uma indicação concreta originada dentro de um Referral Program. |
| Growth Metric | É uma medida quantitativa de crescimento. |
| Growth KPI | É um indicador-chave derivado de uma ou mais Growth Metric. |
| Cohort | É um agrupamento de Clientes por critério temporal ou comportamental de crescimento. |
| Lifecycle Stage | Modela a etapa de crescimento em que um Cliente se encontra. |
| Engagement Score | É uma medida derivada do nível de engajamento de um Cliente. |
| Growth Opportunity | É uma oportunidade estratégica de crescimento identificada. |
| Growth Initiative | É uma ação estratégica planejada para capturar uma Growth Opportunity. |
| Growth Insight | É uma constatação derivada da análise de dado de crescimento. |
| Growth Recommendation | É uma sugestão de ação de crescimento derivada de um Growth Insight. |

### Não pertence ao Growth

| Conceito | Hub proprietário |
|---|---|
| Customer | CRM Hub — `CRM_DOMAIN_BLUEPRINT.md` |
| Lead | CRM Hub — `CRM_DOMAIN_BLUEPRINT.md` |
| Conversation | Communication Hub — `COMMUNICATION_DOMAIN_BLUEPRINT.md` |
| Message | Communication Hub — `COMMUNICATION_DOMAIN_BLUEPRINT.md` |
| Invoice | Finance Hub — `FINANCE_DOMAIN_BLUEPRINT.md` |
| Payment | Finance Hub — `FINANCE_DOMAIN_BLUEPRINT.md` |
| Ledger | Finance Hub — `FINANCE_DOMAIN_BLUEPRINT.md` |
| Automation Workflow | Automation Engine — `AUTOMATION_ENGINE.md` |
| Knowledge Base | Knowledge Hub — `KNOWLEDGE_HUB.md` |
| Identity | Identity Hub — `IDENTITY_HUB.md` |
| Authentication | Identity Hub — `IDENTITY_HUB.md` |
| Provider APIs | Integration Hub — `INTEGRATION_HUB.md` |
| Analytics Reports | Analytics Hub (futuro) |
| Branding | Branding Hub — `BRANDING_HUB.md` |
| AI Prompt | AI Hub — `AI_HUB.md` |
| Communication Preference | CRM Hub / Communication Hub, conforme já delimitado em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 4 |

Growth nunca acessa diretamente Customer, Conversation, Invoice ou qualquer outra Entidade listada acima — quando uma Campaign precisa referenciar um destinatário, ela o faz através de identificador de Audience, resolvido por Anti-Corruption Layer contra o domínio proprietário correspondente, nunca por leitura direta de sua estrutura interna.

---

## 5. Responsabilidades

Campanhas são de responsabilidade exclusiva do Growth — sua criação, seu objetivo, seu período de execução e sua Audience-alvo são definidos e mantidos inteiramente dentro deste domínio. O CRM Hub nunca cria Campaign; ele apenas consome o Evento de conversão resultante para atualizar seu próprio Status de Relacionamento.

Aquisição é a responsabilidade de atrair potencial Cliente novo através de um Acquisition Channel e de atribuir corretamente essa origem através de Attribution — o Growth decide a estratégia e mede o resultado, mas nunca executa a comunicação técnica com um canal de mídia externo, responsabilidade que permanece do Integration Hub, conforme já estabelecido em `INTEGRATION_HUB.md`.

Ativação é a responsabilidade de definir e medir a estratégia pela qual um Cliente recém-adquirido obtém seu primeiro valor real da Empresa, modelada através de Activation Strategy — o Growth define o que caracteriza ativação e mede sua ocorrência, mas nunca implementa diretamente a funcionalidade de produto que entrega esse valor.

Retenção é a responsabilidade de definir e medir a estratégia de manutenção de engajamento ao longo do tempo, modelada através de Retention Strategy e de Engagement Score — o Growth identifica risco de perda de engajamento, mas a ação de comunicação decorrente é sempre delegada ao Communication Hub através de Evento e de Automation Engine.

Expansão é a responsabilidade de definir e medir a estratégia de ampliação de relação comercial de um Cliente já retido, modelada através de Expansion Strategy — o Growth identifica a oportunidade, mas a formalização comercial de uma expansão, incluindo qualquer nova cobrança associada, permanece exclusivamente do CRM Hub e do Finance Hub.

Indicação é a responsabilidade de administrar a estrutura estratégica de incentivo através de Referral Program e de registrar cada Referral concreto — o Growth nunca cria diretamente um novo Customer a partir de uma indicação bem-sucedida; essa criação, quando ocorre, é sempre uma responsabilidade do CRM Hub, acionada pelo Evento correspondente publicado pelo Growth.

Experimentação é a responsabilidade de estruturar e medir Experiment, A/B Test e suas Variant — testando hipótese de crescimento de forma controlada, sem nunca alterar diretamente Entidade de outro domínio como efeito colateral de um teste.

Segmentação é a responsabilidade de definir Audience Segment com critério estratégico de crescimento — distinta, na motivação e no uso, da segmentação de Business Profile já definida em `BUSINESS_PROFILE_ENGINE.md`, que classifica a própria Empresa cliente da plataforma, não o público-alvo de uma Campaign.

Atribuição é a responsabilidade de relacionar resultado de conversão à origem que o produziu, através de Attribution e de Attribution Model — capacidade que nenhum outro domínio da plataforma implementa.

Funis são a responsabilidade de modelar a sequência de etapas entre potencial e conversão através de Funnel, permitindo identificar em qual etapa a perda de conversão concentra-se.

Jornadas são a responsabilidade de modelar a sequência de Touchpoint que um Cliente percorre, através de Journey — distinta de Conversation, que registra o conteúdo real de uma interação de comunicação; Journey registra a estrutura estratégica da sequência, nunca o conteúdo trocado.

Métricas de crescimento são a responsabilidade de calcular e expor Growth Metric e Growth KPI — indicadores próprios do domínio, consumidos pelo futuro Analytics Hub para composição de indicador de negócio mais amplo, mas nunca calculados por aquele domínio em nome do Growth.

```
                LIMITES ENTRE GROWTH E DEMAIS DOMÍNIOS
   ┌───────────────────────────────────────────────────────────┐
   │  Growth decide estratégia e mede resultado                     │
   │       │                                                        │
   │       ├──► CRM formaliza relacionamento e conversão real           │
   │       ├──► Communication executa o envio de mensagem                  │
   │       ├──► Finance processa qualquer cobrança resultante                  │
   │       ├──► Automation decide quando uma ação de crescimento ocorre             │
   │       └──► Analytics (futuro) consolida indicador de negócio mais amplo             │
   └───────────────────────────────────────────────────────────┘
```

---

## 6. Business Capabilities

Campaign Management administra o ciclo de vida completo de uma Campaign, de sua criação até seu encerramento.

Audience Management administra a construção e a manutenção de uma Audience associada a uma ou mais Campaign.

Segmentation administra a divisão de uma Audience em Audience Segment por critério estratégico.

Journey Management administra a definição e o acompanhamento de uma Journey e de seus Touchpoint.

Funnel Management administra a definição das etapas de um Funnel e a medição de conversão entre elas.

Experimentation administra a estrutura geral de testagem controlada de hipótese de crescimento.

A/B Testing administra especificamente a comparação entre duas ou mais Variant dentro de um Experiment.

Growth Metrics administra o cálculo e a exposição de Growth Metric.

Growth Insights administra a identificação de Growth Insight a partir de padrão observado em dado de crescimento.

Referral Management administra a estrutura de um Referral Program e o registro de cada Referral.

Acquisition Tracking administra o rastreamento de origem de um potencial Cliente através de Lead Source e de Acquisition Channel.

Retention Management administra a estratégia e o acompanhamento de Retention Strategy.

Expansion Management administra a estratégia e o acompanhamento de Expansion Strategy.

Activation Management administra a estratégia e o acompanhamento de Activation Strategy.

Attribution administra o cálculo de crédito de conversão através de Attribution Model.

Lifecycle Analysis administra a classificação de um Cliente em um Lifecycle Stage.

Engagement Scoring administra o cálculo de Engagement Score.

Growth Recommendations administra a geração de Growth Recommendation a partir de um Growth Insight já identificado.

```
                    CAPACIDADES DE NEGÓCIO DO GROWTH
   ┌───────────────────────────────────────────────────────────┐
   │  Estratégia:     Campaign Management · Audience Management ·   │
   │                  Segmentation                                     │
   │  Jornada:        Journey Management · Funnel Management                │
   │  Experimentação: Experimentation · A/B Testing                             │
   │  Medição:        Growth Metrics · Attribution · Acquisition                   │
   │                  Tracking                                                        │
   │  Ciclo de vida:  Activation Management · Retention Management ·                    │
   │                  Expansion Management · Lifecycle Analysis ·                          │
   │                  Engagement Scoring                                                       │
   │  Indicação:      Referral Management                                                        │
   │  Inteligência:   Growth Insights · Growth Recommendations                                        │
   └───────────────────────────────────────────────────────────┘
```

---

## 7. Modelo Conceitual

Campaign é a unidade central de iniciativa de crescimento, responsável por reunir um objetivo, um período de execução e uma Audience-alvo.

Audience é o conjunto de potenciais ou atuais Clientes visado por uma ou mais Campaign.

Segment é uma subdivisão de uma Audience por critério estratégico comum.

Journey é a sequência de etapas estratégicas que um Cliente percorre em relação a uma iniciativa de crescimento.

Touchpoint é um ponto específico de contato dentro de uma Journey.

Funnel é o modelo das etapas entre potencial e conversão, usado para medir onde a perda de conversão se concentra.

Experiment é a estrutura de testagem de uma hipótese estratégica de crescimento.

Variant é uma alternativa específica testada dentro de um Experiment.

A/B Test é a forma mais simples de Experiment, comparando exatamente duas Variant.

Conversion Goal define o resultado que caracteriza sucesso dentro de um Funnel ou de uma Campaign.

Conversion Event é o registro concreto de que uma Conversion Goal foi atingida.

Lead Source identifica a origem estratégica de um potencial Cliente.

Attribution relaciona um Conversion Event à Campaign ou ao Acquisition Channel responsável por sua origem.

Acquisition Channel modela o canal estratégico usado para atrair potencial Cliente.

Lifecycle Stage modela a etapa de crescimento em que um Cliente se encontra — por exemplo, recém-adquirido, ativado, retido, ou em expansão.

Engagement Score é uma medida derivada do nível de engajamento observado de um Cliente ao longo do tempo.

Growth KPI é um indicador-chave de crescimento, derivado de uma ou mais Growth Metric.

Growth Metric é uma medida quantitativa isolada de crescimento.

Referral é o registro de uma indicação concreta de um novo potencial Cliente por um Cliente existente.

Referral Program é a estrutura estratégica que organiza e incentiva a prática de indicação.

Growth Initiative é uma ação estratégica planejada para capturar uma Growth Opportunity.

Growth Opportunity é uma oportunidade estratégica de crescimento identificada a partir de dado observado.

Growth Recommendation é uma sugestão concreta de ação, derivada de um Growth Insight.

Cohort é um agrupamento de Clientes por critério temporal ou comportamental comum, usado para comparar comportamento de crescimento entre grupos equivalentes.

---

## 8. Relacionamentos

```
   Campaign ──────► Audience ──────► Segment
      │
      ▼
   Journey ──────► Funnel

   Experiment ──────► Variant

   Campaign ──────► Conversion Goal

   Referral Program ──────► Referral

   Lifecycle Stage ──────► Engagement Score

   Growth KPI ──────► Growth Metric
```

Uma Campaign se relaciona com exatamente uma Audience-alvo, que por sua vez pode ser dividida em um ou mais Segment. Uma Campaign também se relaciona com uma Journey, que estrutura a sequência de Touchpoint percorrida, e essa Journey se relaciona com um Funnel, que mede a conversão entre suas etapas. Um Experiment se relaciona com duas ou mais Variant testadas em paralelo. Uma Campaign se relaciona com um ou mais Conversion Goal que definem seu sucesso. Um Referral Program se relaciona com múltiplos Referral individuais registrados ao longo de sua vigência. Um Lifecycle Stage se relaciona com o Engagement Score que frequentemente determina sua transição. Um Growth KPI se relaciona com uma ou mais Growth Metric das quais é derivado.

---

## 9. Fluxos

```
   Campanha
      │
      ▼
   Audiência
      │
      ▼
   Conversão
      │
      ▼
   Ativação
      │
      ▼
   Retenção
```

Uma Campaign é criada e direcionada a uma Audience já construída; a partir da interação dessa Audience com a Campaign, um Conversion Event pode ser registrado; a partir da conversão, o Cliente entra em uma etapa de Ativação, acompanhada por uma Activation Strategy; e, uma vez ativado, o Cliente passa a ser acompanhado por uma Retention Strategy ao longo do tempo.

```
   Experimento
      │
      ▼
   Variantes
      │
      ▼
   Conversão
      │
      ▼
   Resultado
```

Um Experiment é estruturado com duas ou mais Variant; cada Variant é exposta a uma parcela da Audience; a conversão de cada Variant é registrada através de Conversion Event; e o Resultado consolidado determina qual Variant obteve melhor desempenho frente ao Conversion Goal definido.

```
   Referral
      │
      ▼
   Novo Cliente
      │
      ▼
   Ativação
      │
      ▼
   Expansão
```

Um Referral é registrado a partir de um Referral Program já ativo; quando esse Referral se converte, o CRM Hub cria o Novo Cliente correspondente, consumindo o Evento publicado pelo Growth; o Novo Cliente então percorre sua própria etapa de Ativação; e, ao longo do tempo, pode alcançar uma etapa de Expansão, acompanhada por uma Expansion Strategy.

```
   Funil
      │
      ▼
   Conversão
      │
      ▼
   Métrica
      │
      ▼
   Insight
```

Um Funnel estrutura as etapas entre potencial e conversão; cada Conversion Event observado alimenta o cálculo de uma Growth Metric; a Growth Metric, analisada ao longo do tempo, produz um Growth Insight; e o Growth Insight, quando aplicável, origina uma Growth Recommendation.

---

## 10. Eventos do Domínio

`CampaignCreated` ocorre quando uma nova Campaign é registrada, antes de seu início efetivo.

`CampaignStarted` ocorre quando uma Campaign já criada entra em execução.

`CampaignFinished` ocorre quando uma Campaign alcança o fim de seu período de execução.

`AudienceBuilt` ocorre quando a construção de uma Audience é concluída e ela se torna disponível para associação a uma Campaign.

`SegmentUpdated` ocorre quando a composição de um Audience Segment é recalculada.

`JourneyStarted` ocorre quando um Cliente inicia sua passagem por uma Journey.

`JourneyCompleted` ocorre quando um Cliente conclui todos os Touchpoint de uma Journey.

`ExperimentStarted` ocorre quando um Experiment começa a expor suas Variant à Audience definida.

`ExperimentFinished` ocorre quando um Experiment alcança seu critério de encerramento.

`VariantSelected` ocorre quando o Resultado de um Experiment determina qual Variant obteve melhor desempenho.

`ConversionRegistered` ocorre quando um Conversion Event é registrado em relação a um Conversion Goal.

`ReferralCreated` ocorre quando um novo Referral é registrado dentro de um Referral Program.

`ReferralConverted` ocorre quando um Referral resulta efetivamente em um novo Cliente.

`RetentionImproved` ocorre quando o Engagement Score de um Cliente ou de um Cohort demonstra melhora sustentada.

`ExpansionAchieved` ocorre quando um Cliente já retido efetivamente amplia sua relação comercial, capturando uma Growth Opportunity de expansão.

`GrowthInsightGenerated` ocorre quando um novo Growth Insight é identificado a partir da análise de Growth Metric.

`GrowthRecommendationGenerated` ocorre quando uma nova Growth Recommendation é derivada de um Growth Insight já existente.

---

## 11. Integração com outros Hubs

O CRM Hub consome `ConversionRegistered` e `ReferralConverted` para formalizar o Novo Cliente e atualizar seu Status de Relacionamento — o Growth nunca cria diretamente uma Entidade de CRM; ele apenas publica o Evento correspondente, conforme já detalhado em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 11.

O Communication Hub é acionado, através do Automation Engine, para executar o envio de mensagem associado a uma etapa de uma Journey ou de uma Retention Strategy — o Growth decide que uma mensagem deve ser enviada em determinado ponto da estratégia, mas nunca envia diretamente, responsabilidade que permanece exclusiva do Communication Hub conforme já estabelecido em `COMMUNICATION_DOMAIN_BLUEPRINT.md`.

O Finance Hub consome `CampaignCreated` para registrar, quando aplicável, o custo de mídia associado a uma Campaign — o Growth nunca processa cobrança nem acessa Ledger diretamente, conforme já estabelecido em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 4.

O Automation Engine decide quando cada etapa de uma Journey, de uma Activation Strategy ou de uma Retention Strategy deve efetivamente ser disparada, consumindo Evento do Growth e executando a Action correspondente, conforme já estabelecido em `AUTOMATION_ENGINE.md` — o Growth define a estratégia e a condição, mas nunca implementa sua própria lógica de agendamento além da definição estratégica em si.

O AI Hub pode ser consumido para apoiar a geração de Growth Insight e de Growth Recommendation a partir de padrão observado em Growth Metric, sempre como sugestão sujeita a confirmação humana, conforme o princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5 — o Growth nunca delega ao AI Hub a decisão final de iniciar uma Campaign ou de encerrar um Experiment.

O Knowledge Hub pode ser consultado, através do AI Hub, quando uma Política estratégica documentada é relevante à definição de uma Campaign ou de uma Retention Strategy, seguindo o padrão de Retrieval já detalhado em `KNOWLEDGE_HUB.md`.

O Identity Hub autentica e autoriza toda operação sobre Campaign, Experiment e demais Entidades deste domínio, através do modelo RBAC e ABAC já detalhado em `IDENTITY_HUB.md`.

O Integration Hub é a única via pela qual uma Campaign alcança um canal de mídia externo ou um Acquisition Channel digital, conforme já estabelecido em `INTEGRATION_HUB.md` — o Growth nunca se comunica diretamente com um Provider de mídia.

O Analytics Hub, quando existente, consumirá todo Evento publicado pelo Growth para compor indicador de negócio mais amplo, combinando Growth Metric com dado de outros domínios — responsabilidade que permanece exclusivamente daquele domínio futuro, nunca implementada dentro do próprio Growth.

```
              INTEGRAÇÃO DO GROWTH COM OUTROS HUBS
   ┌───────────────────────────────────────────────────────────┐
   │  Growth                                                       │
   │    publica: CampaignCreated · ConversionRegistered ·              │
   │             ReferralConverted · GrowthInsightGenerated                │
   │    consome:  (via Automation Engine) execução de etapa de           │
   │              Journey e de Retention Strategy                             │
   └───────────────────────────────────────────────────────────┘
```

---

## 12. Regras de Negócio

Campanhas nunca alteram Customer — toda mudança de Relacionamento decorrente de uma conversão é aplicada exclusivamente pelo CRM Hub, a partir do Evento publicado pelo Growth.

Experimentos nunca alteram Ledger — nenhum Experiment, independentemente de seu resultado, produz efeito financeiro direto; qualquer efeito financeiro decorrente de uma Variant vencedora é sempre mediado por Evento e processado pelo Finance Hub.

Growth publica eventos — toda mudança de estado relevante deste domínio é comunicada ao restante da plataforma exclusivamente através de Evento, nunca por chamada direta a outro Hub.

Conversões preservam histórico — um Conversion Event, uma vez registrado, nunca é removido ou alterado, ainda que a Campaign ou o Funnel associado seja posteriormente encerrado.

Referral nunca cria Customer — a criação efetiva de um novo Cliente a partir de um Referral convertido é sempre uma responsabilidade do CRM Hub, acionada pelo Evento `ReferralConverted`.

Journey nunca envia mensagens diretamente — toda comunicação decorrente de uma etapa de Journey é sempre delegada ao Communication Hub através do Automation Engine.

Growth nunca executa pagamentos — nenhum componente deste domínio processa Payment ou acessa Financial Account, responsabilidade exclusiva do Finance Hub.

Growth nunca conversa com Providers — toda comunicação técnica com canal de mídia externo ou com Acquisition Channel digital é mediada exclusivamente pelo Integration Hub.

Engagement Score é derivado — nunca é definido manualmente como valor arbitrário; é sempre calculado a partir de sinal de comportamento observado ao longo do tempo.

Cohorts são imutáveis após fechamento — uma vez que um Cohort é fechado para análise comparativa, sua composição não é mais alterada, preservando a integridade de qualquer comparação futura que o utilize como referência.

Attribution nunca é retroativamente reescrita sem novo Evento explícito — uma mudança de Attribution Model se aplica a partir de sua entrada em vigor, nunca reinterpretando silenciosamente conversão já atribuída anteriormente.

Um Experiment sempre possui um Conversion Goal explícito antes de seu início — nenhum teste é iniciado sem critério prévio e claro do que caracteriza sucesso.

Toda Campaign possui uma Audience explicitamente definida antes de seu início — nenhuma Campaign é executada sem alvo estratégico claro.

Growth Insight nunca altera estado de outro domínio automaticamente — sua consequência prática é sempre uma Growth Recommendation, sujeita a decisão humana ou a Regra determinística antes de qualquer ação ser efetivamente disparada.

---

## 13. Casos de Uso

**Aquisição.** Uma Empresa de e-commerce define um Acquisition Channel de mídia paga e associa uma Lead Source específica a cada visitante que chega através dele, permitindo que toda conversão futura seja corretamente atribuída à origem.

**Campanha.** Uma Empresa de Prestação de Serviços cria uma Campaign com Campaign Goal de gerar oitenta novos contatos qualificados em um mês, direcionada a uma Audience construída a partir de critério de Segment específico.

**Experimento.** Uma Empresa testa, através de um A/B Test, duas Variant de uma mesma Landing Page associada a uma Campaign, medindo qual delas produz maior taxa de Conversion Event frente ao mesmo Conversion Goal.

**Funil.** Uma Empresa modela um Funnel de cinco etapas entre primeiro contato e conversão final, identificando que a maior perda de conversão ocorre entre a segunda e a terceira etapa, direcionando esforço de melhoria especificamente para esse ponto.

**Referral.** Uma Empresa de assinatura mensal estabelece um Referral Program que recompensa um Cliente existente por cada indicação convertida, registrando cada Referral e acompanhando sua taxa de conversão em novo Cliente.

**Retenção.** Uma Empresa identifica, através de Engagement Score em queda sustentada, um Cohort de Clientes em risco de perda, acionando uma Retention Strategy específica para esse grupo.

**Reativação.** Uma Empresa identifica um grupo de Clientes classificados em um Lifecycle Stage de baixo engajamento recente e direciona uma Campaign específica de reativação a essa Audience.

**Segmentação.** Uma Empresa divide sua Audience em múltiplos Audience Segment por critério de comportamento de conversão observado, permitindo que cada Segment receba uma Journey diferenciada.

**Conversão.** Um potencial Cliente interage com uma Campaign e completa a ação definida por um Conversion Goal, registrando um Conversion Event corretamente atribuído à Campaign de origem.

**Growth Insight.** A análise de Growth Metric ao longo de um trimestre revela que Clientes adquiridos por um Acquisition Channel específico apresentam Engagement Score consistentemente mais alto, gerando um Growth Insight relevante para a próxima definição de estratégia de aquisição.

**Referral Program.** Uma Empresa estrutura um novo Referral Program com regra de incentivo específica, definindo claramente o critério que caracteriza um Referral como convertido.

**Lifecycle.** Uma Empresa acompanha a transição de um Cliente entre Lifecycle Stage — de recém-adquirido, a ativado, a retido, a em expansão — usando essa transição como base para decidir qual Growth Initiative aplicar em cada etapa.

---

## 14. Architecture Decision Records

**ADR-001 — Growth é proprietário do crescimento.** Nenhum outro Hub cria, altera ou possui Campaign, Audience, Funnel, Journey, Experiment ou qualquer Entidade já catalogada no Capítulo 4. Contexto: aplicação direta do princípio Domain Ownership já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, ADR-001.

**ADR-002 — Campaign não conhece Customer.** Uma Campaign referencia Audience por identificador, nunca por leitura direta da Entidade Customer do CRM Hub. Contexto: preservar o Bounded Context já delimitado no Capítulo 4.

**ADR-003 — Referral não cria relacionamentos.** A criação de um novo Customer a partir de um Referral convertido é sempre responsabilidade do CRM Hub, acionada por Evento. Contexto: preservar a fronteira de Domain Ownership já estabelecida em `CRM_DOMAIN_BLUEPRINT.md`.

**ADR-004 — Journey não envia mensagens.** Toda comunicação decorrente de uma etapa de Journey é delegada ao Communication Hub através do Automation Engine. Contexto: preservar a fronteira já estabelecida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 4.

**ADR-005 — Automation executa campanhas.** O disparo efetivo de cada etapa de uma Campaign ou de uma Journey, no tempo certo, é decidido e executado pelo Automation Engine, nunca por lógica própria de agendamento dentro do Growth. Contexto: aplicação da fronteira entre execução e decisão já estabelecida em `AUTOMATION_ENGINE.md`, Capítulo 4.

**ADR-006 — Communication entrega mensagens.** Toda entrega técnica de mensagem associada a uma estratégia de Growth permanece exclusiva do Communication Hub. Contexto: preservar o Domain Ownership já estabelecido naquele documento.

**ADR-007 — CRM continua proprietário do relacionamento.** Growth nunca assume posse de Customer, Lead ou Organization. Contexto: reforçar explicitamente, como decisão arquitetural formal, a distinção já introduzida no Capítulo 1 deste documento.

**ADR-008 — Finance continua proprietário do dinheiro.** Growth nunca processa Payment nem acessa Ledger. Contexto: preservar o Domain Ownership já estabelecido em `FINANCE_DOMAIN_BLUEPRINT.md`.

**ADR-009 — Analytics mede resultados.** A composição de indicador de negócio que combine dado de Growth com dado de outros domínios é responsabilidade do futuro Analytics Hub, nunca implementada dentro do próprio Growth. Contexto: evitar que o Growth acumule responsabilidade de consolidação analítica ampla que não lhe pertence.

**ADR-010 — Growth publica eventos.** Toda comunicação do Growth com o restante da plataforma acontece exclusivamente através de Evento, nunca por chamada direta. Contexto: aplicação direta do princípio Events over Direct Calls já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, ADR-002.

**ADR-011 — Engagement Score é sempre derivado.** Nenhum componente futuro do Growth Hub armazenará Engagement Score como valor primário editável manualmente. Contexto: preservar a integridade e a consistência de um indicador usado como base para decisão de Retention Strategy e de Lifecycle Stage.

**ADR-012 — Growth Insight nunca dispara ação automaticamente.** Toda Growth Recommendation derivada de um Growth Insight exige confirmação humana ou Regra determinística explícita antes de qualquer ação ser efetivamente executada. Contexto: aplicação do princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5, estendido à geração de inteligência de crescimento.

---

## 15. Glossário

**Growth** — domínio proprietário da estratégia e da operação de crescimento da Adaptive Business Platform.

**Campaign** — unidade central de iniciativa de crescimento, com objetivo, período de execução e Audience-alvo definidos.

**Audience** — conjunto de potenciais ou atuais Clientes visado por uma Campaign.

**Segment** — subdivisão de uma Audience por critério estratégico comum.

**Journey** — sequência de etapas estratégicas percorridas por um Cliente em relação a uma iniciativa de crescimento.

**Touchpoint** — ponto específico de contato dentro de uma Journey.

**Funnel** — modelo das etapas entre potencial e conversão, usado para medir onde ocorre perda.

**Experiment** — estrutura de testagem de uma hipótese estratégica de crescimento.

**Variant** — alternativa específica testada dentro de um Experiment.

**A/B Test** — forma de Experiment que compara exatamente duas Variant.

**Conversion Goal** — resultado que caracteriza sucesso dentro de um Funnel ou de uma Campaign.

**Conversion Event** — registro concreto de que uma Conversion Goal foi atingida.

**Lead Source** — origem estratégica de um potencial Cliente.

**Attribution** — relação entre um Conversion Event e a Campaign ou canal responsável por sua origem.

**Attribution Model** — regra estratégica de distribuição de crédito de conversão entre múltiplos pontos de contato.

**Acquisition Channel** — canal estratégico usado para atrair potencial Cliente.

**Activation Strategy** — estratégia pela qual um Cliente recém-adquirido obtém valor inicial.

**Retention Strategy** — estratégia de manutenção de engajamento ao longo do tempo.

**Expansion Strategy** — estratégia de ampliação da relação comercial de um Cliente já retido.

**Referral Program** — estrutura estratégica de incentivo à indicação.

**Referral** — registro de uma indicação concreta originada dentro de um Referral Program.

**Growth Metric** — medida quantitativa isolada de crescimento.

**Growth KPI** — indicador-chave derivado de uma ou mais Growth Metric.

**Cohort** — agrupamento de Clientes por critério temporal ou comportamental comum.

**Lifecycle Stage** — etapa de crescimento em que um Cliente se encontra.

**Engagement Score** — medida derivada do nível de engajamento de um Cliente.

**Growth Opportunity** — oportunidade estratégica de crescimento identificada a partir de dado observado.

**Growth Initiative** — ação estratégica planejada para capturar uma Growth Opportunity.

**Growth Insight** — constatação derivada da análise de dado de crescimento.

**Growth Recommendation** — sugestão concreta de ação, derivada de um Growth Insight.

---

## 16. Conclusão

Este documento define oficialmente o domínio Growth da Adaptive Business Platform — sua fronteira, suas vinte e nove Entidades conceituais, suas dezoito Capacidades de Negócio, seus dezessete Eventos e suas quatorze Regras de negócio. O futuro `GROWTH_HUB.md` deverá respeitar integralmente tudo o que aqui foi estabelecido, exatamente como `CRM_HUB.md` respeita `CRM_DOMAIN_BLUEPRINT.md`, como `COMMUNICATION_HUB.md` respeita `COMMUNICATION_DOMAIN_BLUEPRINT.md`, e como `FINANCE_HUB.md` respeita `FINANCE_DOMAIN_BLUEPRINT.md`.

A cadeia de proprietários da Adaptive Business Platform, reforçada por este documento, permanece precisa: CRM é proprietário do relacionamento. Communication é proprietário da comunicação. Finance é proprietário do estado financeiro. Growth é proprietário do crescimento. Analytics, quando formalizado, será proprietário da inteligência analítica que combina dado de todos os domínios de negócio em indicador consolidado. Automation executa — decide quando cada processo, de qualquer domínio, deve efetivamente ocorrer. AI recomenda — apoia decisão através de sugestão, nunca assume autoridade final sobre estado de negócio. Integration integra — é o único ponto de comunicação técnica com sistema externo, incluindo todo canal de mídia e Provider de aquisição.

Este é o quarto domínio de negócio explicitamente delimitado por um Blueprint dentro desta série, depois de CRM, de Communication e de Finance — confirmando que o método de Domain Ownership explícito, Boundaries em tabela dupla, Eventos como único canal de colaboração entre Hubs, e ADRs como registro formal de cada decisão de fronteira, é o padrão oficial e replicável para todo domínio de negócio da Adaptive Business Platform.
