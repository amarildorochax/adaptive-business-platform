# Analytics Domain Blueprint

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento define, de forma oficial e exclusiva, o domínio Analytics da Adaptive Business Platform. Ele é o proprietário deste domínio nos mesmos termos já estabelecidos por `CRM_DOMAIN_BLUEPRINT.md`, por `COMMUNICATION_DOMAIN_BLUEPRINT.md`, por `FINANCE_DOMAIN_BLUEPRINT.md` e por `GROWTH_DOMAIN_BLUEPRINT.md`: define sua fronteira, suas Entidades conceituais, suas Capacidades de Negócio, seus Eventos e suas Regras de negócio. Este documento não define arquitetura — nenhum componente interno, nenhum Command, nenhuma Query. A arquitetura do domínio Analytics será definida, no futuro, por um documento chamado `ANALYTICS_HUB.md`, que deverá respeitar integralmente tudo o que aqui é estabelecido, exatamente como `CRM_HUB.md` respeita `CRM_DOMAIN_BLUEPRINT.md`, como `COMMUNICATION_HUB.md` respeita `COMMUNICATION_DOMAIN_BLUEPRINT.md`, como `FINANCE_HUB.md` respeita `FINANCE_DOMAIN_BLUEPRINT.md`, e como `GROWTH_HUB.md` respeita `GROWTH_DOMAIN_BLUEPRINT.md`.

Analytics é proprietário da inteligência analítica da plataforma — a disciplina de negócio que transforma o Evento e o dado já produzido por todo domínio operacional em indicador, tendência, previsão e suporte à decisão. Este domínio é um Business Hub, na categorização já estabelecida em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 1, e segue integralmente as regras ali definidas para todo Business Hub: Domain Ownership, Eventos sobre chamada direta, Anti-Corruption Layer nas fronteiras com outros domínios.

A posição do Analytics entre os Business Hubs já documentados exige uma clareza de fronteira redobrada, precisamente porque sua função é consumir o resultado de todos os demais domínios sem jamais assumir a posse deles. CRM continua proprietário do relacionamento — quem é o Cliente, qual seu histórico de interação, conforme já definido em `CRM_DOMAIN_BLUEPRINT.md`. Communication continua proprietário da comunicação — o que foi dito, por qual canal, conforme já definido em `COMMUNICATION_DOMAIN_BLUEPRINT.md`. Finance continua proprietário do estado financeiro — o que é devido, o que foi pago, conforme já definido em `FINANCE_DOMAIN_BLUEPRINT.md`. Growth continua proprietário do crescimento — a estratégia e a medição de aquisição, ativação, retenção e expansão, conforme já definido em `GROWTH_DOMAIN_BLUEPRINT.md`. Analytics é proprietário da inteligência analítica — a consolidação, a leitura histórica e a projeção futura de indicador que combina dado de todos esses domínios em uma única leitura coerente, sem jamais alterar o estado de origem de nenhum deles.

Esta é uma característica que distingue o Analytics de todos os quatro domínios de negócio já documentados nesta série: nenhum deles tem, como propósito central, a leitura e a combinação do resultado dos demais. CRM, Communication, Finance e Growth produzem Evento; o Analytics é o primeiro domínio cuja razão de existir é consumir Evento de todos eles simultaneamente, sem jamais originar, em contrapartida, uma mudança de estado de volta a nenhum desses domínios. Essa direção estritamente unidirecional de dependência — de todo domínio operacional em direção ao Analytics, nunca o inverso — é a característica estrutural mais importante deste Blueprint, e molda toda decisão de fronteira registrada a partir do Capítulo 4.

Esta posição também implica que o Analytics é o domínio mais dependente, em toda a plataforma, da maturidade e da consistência do Evento publicado pelos demais — um Evento mal formado ou ausente em qualquer domínio operacional se propaga diretamente como uma lacuna ou uma distorção em algum indicador consolidado pelo Analytics. Por essa razão, o Analytics não corrige nem reinterpreta um Evento recebido de forma incompleta; ele o consome como está, e qualquer inconsistência observada é sinalizada como um problema de qualidade de dado a ser resolvido na origem, nunca silenciosamente compensado dentro do próprio domínio Analytics.

---

## 2. Missão

A missão do domínio Analytics é transformar Eventos e dados de negócio já produzidos pelos demais domínios da plataforma em indicadores, dashboards, tendências, previsões e suporte à decisão, de forma desacoplada e escalável — permitindo que qualquer Empresa enxergue, em uma única leitura coerente, o resultado consolidado de sua operação de relacionamento, de comunicação, de finanças e de crescimento, sem que o Analytics precise conhecer a lógica interna de nenhum desses domínios além do Evento que cada um já publica.

---

## 3. Problema que Resolve

Sem um domínio Analytics explicitamente delimitado, uma plataforma de negócio tende a acumular uma série de problemas recorrentes, todos já observados na motivação de domínios anteriores desta série e agravados quando não existe um proprietário claro da inteligência analítica.

Dashboards espalhados surgem quando cada domínio operacional expõe seu próprio painel de indicador isolado, sem nenhuma consolidação entre eles, obrigando o Usuário a alternar entre múltiplas telas para formar uma visão completa do negócio. KPIs duplicados surgem quando dois domínios diferentes calculam, de forma independente e potencialmente divergente, um indicador que deveria ser único — uma taxa de conversão calculada de uma forma pelo Growth Hub e de outra forma por um relatório improvisado do CRM Hub, por exemplo. Métricas inconsistentes é a consequência direta dessa duplicação — o mesmo nome de indicador produzindo valores diferentes conforme a origem consultada, corroendo a confiança de qualquer decisão baseada nele. Ausência de visão consolidada surge quando não existe nenhum lugar único onde indicador de relacionamento, de comunicação, de finanças e de crescimento possam ser lidos lado a lado. Análises isoladas surgem quando cada domínio produz sua própria leitura de desempenho sem qualquer cruzamento com o desempenho dos demais, escondendo correlação relevante entre eles. Ausência de tendências surge quando apenas o valor atual de um indicador é exposto, sem nenhuma leitura de sua evolução ao longo do tempo. Ausência de previsões surge quando toda decisão de negócio é baseada exclusivamente em dado passado, sem nenhuma projeção estruturada do que é razoável esperar adiante. Relatórios conflitantes surgem quando dois relatórios gerados por processos diferentes apresentam números diferentes para o mesmo período, sem nenhuma fonte única de verdade que resolva a divergência. Mistura entre operacional e analítico surge quando, na ausência de um domínio Analytics próprio, a lógica de consolidação de indicador é implementada dentro de cada domínio operacional individualmente, corrompendo a fronteira de responsabilidade já estabelecida em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 3, e reproduzindo exatamente o tipo de acoplamento indevido que aquele documento já alerta como risco central de domínios sobrepostos.

O domínio Analytics resolve estes problemas ao introduzir um proprietário único e explícito para Dashboard, Metric, KPI, Trend, Forecast e Insight — conceitos que passam a existir de forma consistente, consolidada e reutilizável em toda a plataforma, sempre derivados do Evento já publicado por cada domínio operacional, nunca recalculados de forma divergente em mais de um lugar.

---

## 4. Boundaries (Bounded Context)

### Pertence ao Analytics

| Conceito | Por que pertence ao Analytics |
|---|---|
| Dashboard | É a superfície central de leitura consolidada de indicador, pertencente exclusivamente a este domínio. |
| Widget | É a unidade visual individual que compõe um Dashboard. |
| Report | É o documento estruturado de leitura analítica gerado a partir de dado consolidado. |
| Report Template | Define a estrutura reutilizável de um Report. |
| Metric | É a medida quantitativa isolada, unidade básica de toda leitura analítica. |
| KPI | É o indicador-chave derivado de uma ou mais Metric. |
| Trend | É a leitura da evolução de uma Metric ou de um KPI ao longo do tempo. |
| Forecast | É a projeção futura derivada de um Trend já identificado. |
| Insight | É uma constatação derivada da análise consolidada de dado analítico. |
| Analytical Model | É a estrutura lógica que define como um conjunto de dado é transformado em Metric ou em Insight. |
| Aggregation | É a operação de consolidação de múltiplos dados brutos em uma medida única. |
| Snapshot | É o registro imutável do estado de um indicador em um ponto específico no tempo. |
| Time Series | É a sequência ordenada de Snapshot de uma mesma Metric ao longo do tempo. |
| Benchmark | É a referência comparativa de desempenho, interna ou de mercado, contra a qual um indicador é avaliado. |
| Scorecard | É o conjunto estruturado de indicador usado para avaliação de desempenho consolidado. |
| Analytical Dimension | É o eixo de categorização usado para segmentar uma Metric — por período, por canal, por Segmento. |
| Analytical Measure | É o valor quantitativo associado a uma combinação específica de Analytical Dimension. |
| Visualization | É a representação gráfica de uma Metric, de um KPI ou de um Trend. |
| Dataset | É o conjunto de dado bruto, já consolidado a partir de Evento, sobre o qual uma Aggregation opera. |
| Analytical View | É uma leitura específica e nomeada de um Dataset, reutilizável por múltiplos Dashboard ou Report. |
| Business Indicator | É um indicador de leitura geral do desempenho de negócio. |
| Executive Indicator | É um indicador voltado à leitura de alta liderança, tipicamente mais consolidado. |
| Operational Indicator | É um indicador voltado ao acompanhamento do dia a dia operacional. |
| Strategic Indicator | É um indicador voltado à leitura de médio e longo prazo de posicionamento estratégico. |
| Analytical Recommendation | É uma sugestão de ação derivada de um Insight, no contexto exclusivamente analítico deste domínio. |
| Decision Support | É a capacidade consolidada de apresentar dado, Trend, Forecast e Analytical Recommendation de forma a apoiar uma decisão humana. |

### Não pertence ao Analytics

| Conceito | Hub proprietário |
|---|---|
| Customer | CRM Hub — `CRM_DOMAIN_BLUEPRINT.md` |
| Campaign | Growth Hub — `GROWTH_DOMAIN_BLUEPRINT.md` |
| Conversation | Communication Hub — `COMMUNICATION_DOMAIN_BLUEPRINT.md` |
| Message | Communication Hub — `COMMUNICATION_DOMAIN_BLUEPRINT.md` |
| Invoice | Finance Hub — `FINANCE_DOMAIN_BLUEPRINT.md` |
| Payment | Finance Hub — `FINANCE_DOMAIN_BLUEPRINT.md` |
| Ledger | Finance Hub — `FINANCE_DOMAIN_BLUEPRINT.md` |
| Automation Workflow | Automation Engine — `AUTOMATION_ENGINE.md` |
| Knowledge Base | Knowledge Hub — `KNOWLEDGE_HUB.md` |
| Identity | Identity Hub — `IDENTITY_HUB.md` |
| Authentication | Identity Hub — `IDENTITY_HUB.md` |
| Growth Recommendation | Growth Hub — `GROWTH_DOMAIN_BLUEPRINT.md` |
| AI Prompt | AI Hub — `AI_HUB.md` |
| Provider APIs | Integration Hub — `INTEGRATION_HUB.md` |
| Brand Theme | Branding Hub — `BRANDING_HUB.md` |

Analytics nunca acessa diretamente Customer, Conversation, Invoice, Campaign ou qualquer outra Entidade listada acima — quando um Dashboard precisa consolidar dado de relacionamento ou de crescimento, ele o faz exclusivamente a partir do Evento já publicado por CRM Hub, Communication Hub, Finance Hub ou Growth Hub, resolvido por Anti-Corruption Layer, nunca por leitura direta da estrutura interna de origem.

---

## 5. Responsabilidades

Dashboards são de responsabilidade exclusiva do Analytics — sua composição de Widget, sua estrutura visual e sua atualização são definidas e mantidas inteiramente dentro deste domínio. Nenhum outro Hub expõe seu próprio painel consolidado de indicador; cada domínio operacional publica Evento, e o Analytics consolida.

KPIs são a responsabilidade de derivar indicador-chave a partir de uma ou mais Metric, garantindo que cada KPI exista em exatamente um lugar da plataforma, eliminando a duplicação já descrita no Capítulo 3.

Métricas são a responsabilidade de calcular medida quantitativa isolada a partir de Dataset consolidado — o Analytics calcula a métrica, mas nunca decide a ação de negócio decorrente dela, responsabilidade que permanece do domínio operacional correspondente.

Tendências são a responsabilidade de analisar a evolução de uma Metric ou de um KPI ao longo do tempo, através de Time Series.

Previsões são a responsabilidade de projetar, a partir de um Trend já identificado, um Forecast razoável de comportamento futuro — sempre como projeção sujeita a incerteza explícita, nunca como garantia de resultado.

Benchmarking é a responsabilidade de comparar um indicador contra uma referência interna ou de mercado já registrada como Benchmark.

Scorecards são a responsabilidade de consolidar um conjunto estruturado de indicador em uma leitura única de avaliação de desempenho.

Relatórios são a responsabilidade de gerar Report estruturado a partir de Report Template já definido, consumindo Dataset e Analytical View já consolidados.

Indicadores são a responsabilidade de classificar e expor Business Indicator, Executive Indicator, Operational Indicator e Strategic Indicator, cada um com granularidade e público de leitura próprios.

Consolidação de eventos é a responsabilidade central deste domínio — todo Evento publicado por CRM Hub, Communication Hub, Finance Hub e Growth Hub é consumido pelo Analytics para composição de Dataset, sem que o Analytics jamais publique de volta um Comando que altere o domínio de origem.

Análise histórica é a responsabilidade de preservar Snapshot imutável de indicador ao longo do tempo, sustentando qualquer Time Series ou comparação retrospectiva.

Suporte à decisão é a responsabilidade de apresentar, de forma consolidada, dado, Trend, Forecast e Analytical Recommendation suficientes para apoiar uma decisão humana, sem jamais executar essa decisão automaticamente.

```
                LIMITES ENTRE ANALYTICS E DEMAIS DOMÍNIOS
   ┌───────────────────────────────────────────────────────────┐
   │  Analytics consolida, mede e projeta                            │
   │       │                                                        │
   │       ├──► CRM permanece proprietário do Cliente e do                │
   │       │      relacionamento em si                                       │
   │       ├──► Communication permanece proprietária da comunicação             │
   │       │      em si                                                            │
   │       ├──► Finance permanece proprietário do estado financeiro                    │
   │       │      em si                                                                    │
   │       ├──► Growth permanece proprietário da estratégia de                                 │
   │       │      crescimento em si                                                                │
   │       ├──► Automation decide quando uma Analytical Recommendation                                   │
   │       │      confirmada é efetivamente executada                                                       │
   │       └──► AI apoia a geração de Insight, nunca decide sozinho                                              │
   └───────────────────────────────────────────────────────────┘
```

Um limite adicional merece registro explícito frente ao Knowledge Hub: o Knowledge Hub administra conhecimento textual e documental — Política, Procedimento —, enquanto o Analytics administra indicador quantitativo derivado de Evento de negócio; os dois domínios podem se complementar quando um Insight analítico referencia uma Política já documentada, mas nunca se sobrepõem em seu objeto central.

Um segundo limite merece o mesmo registro explícito frente ao Growth Hub, dado que ambos os domínios lidam com Insight e com Recommendation como conceito nomeado. O Growth Insight e a Growth Recommendation, já definidos em `GROWTH_DOMAIN_BLUEPRINT.md`, são estritamente escopados ao domínio de crescimento — derivados exclusivamente de Growth Metric, e relevantes apenas à estratégia de aquisição, ativação, retenção, expansão e indicação. O Insight e a Analytical Recommendation deste Blueprint são, em contraste, deliberadamente mais amplos — derivados da combinação de dado de múltiplos domínios simultaneamente, e relevantes a qualquer decisão de negócio, não apenas à estratégia de crescimento. Um Growth Insight pode, inclusive, ser um dos insumos consumidos pelo Analytics na composição de um Insight mais amplo, mas o inverso nunca ocorre — o Analytics nunca produz, nem substitui, um Growth Insight que já pertence exclusivamente ao Growth Hub.

---

## 6. Business Capabilities

Dashboard Management administra a criação, a composição e a atualização de um Dashboard e de seus Widget.

Report Management administra a geração de Report a partir de Report Template.

Metric Management administra o cálculo e a exposição de Metric.

KPI Management administra a derivação e a exposição de KPI a partir de uma ou mais Metric.

Trend Analysis administra a leitura da evolução de indicador ao longo do tempo, através de Time Series.

Forecasting administra a projeção de Forecast a partir de um Trend já identificado.

Business Intelligence administra a consolidação geral de indicador de negócio a partir de múltiplos domínios operacionais.

Operational Analytics administra a exposição de Operational Indicator voltado ao acompanhamento do dia a dia.

Executive Analytics administra a exposição de Executive Indicator voltado à leitura de alta liderança.

Strategic Analytics administra a exposição de Strategic Indicator voltado a decisão de médio e longo prazo.

Benchmark Analysis administra a comparação de indicador contra uma referência já registrada como Benchmark.

Scorecard Management administra a composição de um Scorecard consolidado de avaliação de desempenho.

Visualization administra a representação gráfica de Metric, de KPI e de Trend.

Analytical Modeling administra a definição de um Analytical Model que transforma Dataset em Metric ou em Insight.

Historical Analysis administra a preservação e a consulta de Snapshot ao longo do tempo.

Decision Support administra a apresentação consolidada de dado suficiente para apoiar uma decisão humana.

Insight Generation administra a identificação de Insight a partir de padrão observado em dado consolidado.

Analytical Recommendations administra a formulação de Analytical Recommendation derivada de um Insight já identificado.

```
                CAPACIDADES DE NEGÓCIO DO ANALYTICS
   ┌───────────────────────────────────────────────────────────┐
   │  Consolidação:   Dashboard Management · Report Management ·        │
   │                  Metric Management · KPI Management                    │
   │  Leitura         Business Intelligence · Operational Analytics ·           │
   │  Segmentada:     Executive Analytics · Strategic Analytics                     │
   │  Projeção:       Trend Analysis · Forecasting                                     │
   │  Comparação:     Benchmark Analysis · Scorecard Management                            │
   │  Apresentação:   Visualization · Analytical Modeling ·                                    │
   │                  Historical Analysis                                                          │
   │  Inteligência:   Decision Support · Insight Generation ·                                          │
   │                  Analytical Recommendations                                                           │
   └───────────────────────────────────────────────────────────┘
```

---

## 7. Modelo Conceitual

Dashboard é a superfície central de leitura consolidada de indicador, composta por Widget individuais.

Widget é a unidade visual que exibe uma Metric, um KPI ou uma Visualization específica dentro de um Dashboard.

Report é o documento estruturado de leitura analítica gerado a partir de Report Template.

Metric é a medida quantitativa isolada, unidade básica de toda leitura analítica.

KPI é o indicador-chave derivado de uma ou mais Metric.

Trend é a leitura da evolução de uma Metric ou de um KPI ao longo do tempo.

Forecast é a projeção futura derivada de um Trend já identificado.

Insight é uma constatação derivada da análise consolidada de dado analítico.

Analytical Model é a estrutura lógica que define como um Dataset é transformado em Metric ou em Insight.

Aggregation é a operação de consolidação de múltiplos dados brutos em uma medida única.

Snapshot é o registro imutável do estado de um indicador em um ponto específico no tempo.

Dataset é o conjunto de dado bruto, já consolidado a partir de Evento de outros domínios, sobre o qual uma Aggregation opera.

Visualization é a representação gráfica de uma Metric, de um KPI ou de um Trend.

Scorecard é o conjunto estruturado de indicador usado para avaliação de desempenho consolidado.

Benchmark é a referência comparativa de desempenho, interna ou de mercado, contra a qual um indicador é avaliado.

Business Indicator é um indicador de leitura geral do desempenho de negócio.

Executive Indicator é um indicador voltado à leitura de alta liderança.

Operational Indicator é um indicador voltado ao acompanhamento do dia a dia.

Strategic Indicator é um indicador voltado à leitura de médio e longo prazo.

Decision Support é a capacidade consolidada de apresentar dado, Trend, Forecast e Analytical Recommendation suficientes para apoiar uma decisão humana.

Analytical Recommendation é uma sugestão de ação derivada de um Insight, no contexto exclusivamente analítico deste domínio.

---

## 8. Relacionamentos

```
   Dataset ──────► Aggregation ──────► Metric ──────► KPI ──────► Dashboard
```

```
   Events ──────► Snapshot ──────► Trend ──────► Forecast
```

```
   Report ──────► Visualization ──────► Decision Support
```

Um Dataset é consolidado a partir de Evento de outros domínios e submetido a uma ou mais Aggregation, produzindo uma Metric; uma ou mais Metric são combinadas em um KPI; e um ou mais KPI compõem um Dashboard. Todo Evento consumido produz um Snapshot correspondente; a sequência de Snapshot ao longo do tempo compõe um Trend; e um Trend já identificado sustenta a geração de um Forecast. Um Report se relaciona com uma ou mais Visualization, que juntas sustentam a capacidade de Decision Support.

---

## 9. Fluxos

```
   Eventos
      │
      ▼
   Dataset
      │
      ▼
   Aggregation
      │
      ▼
   Metric
      │
      ▼
   Dashboard
```

Todo Evento publicado por CRM Hub, Communication Hub, Finance Hub ou Growth Hub é consumido e consolidado em um Dataset; o Dataset é submetido a uma Aggregation; o resultado produz uma Metric; e a Metric, uma vez calculada, é exposta através de um Dashboard.

```
   Time Series
      │
      ▼
   Trend
      │
      ▼
   Forecast
      │
      ▼
   Recommendation
```

Uma Time Series acumulada ao longo do tempo é analisada para identificar um Trend; o Trend sustenta a projeção de um Forecast; e o Forecast, quando relevante, origina uma Analytical Recommendation.

```
   Business Indicators
      │
      ▼
   Executive Dashboard
      │
      ▼
   Decision Support
```

Um conjunto de Business Indicator já consolidado é organizado em um Executive Dashboard voltado à alta liderança; e esse Executive Dashboard, combinado a Trend e a Forecast relevantes, compõe a capacidade de Decision Support de mais alto nível da plataforma.

---

## 10. Eventos do Domínio

`DashboardCreated` ocorre quando um novo Dashboard é registrado.

`DashboardUpdated` ocorre quando a composição de Widget de um Dashboard já existente é alterada.

`ReportGenerated` ocorre quando um Report é gerado a partir de um Report Template.

`MetricCalculated` ocorre quando o valor de uma Metric é recalculado a partir de um Dataset atualizado.

`KPIUpdated` ocorre quando um KPI é recalculado a partir de suas Metric associadas.

`TrendIdentified` ocorre quando um novo Trend é identificado a partir da análise de uma Time Series.

`ForecastGenerated` ocorre quando um novo Forecast é projetado a partir de um Trend já identificado.

`InsightGenerated` ocorre quando um novo Insight é identificado a partir da análise consolidada de dado.

`BenchmarkUpdated` ocorre quando a referência comparativa de um Benchmark é atualizada.

`SnapshotCreated` ocorre quando um novo Snapshot imutável de indicador é registrado.

`DatasetRefreshed` ocorre quando um Dataset é atualizado a partir de novo Evento consumido de outro domínio.

`VisualizationPublished` ocorre quando uma nova Visualization se torna disponível para uso em Dashboard ou em Report.

`RecommendationGenerated` ocorre quando uma nova Analytical Recommendation é derivada de um Insight já existente.

`ScorecardUpdated` ocorre quando a composição ou o resultado de um Scorecard é recalculado.

---

## 11. Integração com outros Hubs

O CRM Hub publica Evento de mudança de Relacionamento e de conversão, consumido pelo Analytics para composição de Business Indicator relativo a relacionamento — o Analytics nunca acessa a Entidade Customer diretamente, apenas o Evento já publicado, conforme já delimitado em `CRM_DOMAIN_BLUEPRINT.md`.

O Communication Hub publica Evento de entrega e de engajamento de mensagem, consumido pelo Analytics para composição de indicador de comunicação — sem que o Analytics acesse Conversation ou Message diretamente, conforme já delimitado em `COMMUNICATION_DOMAIN_BLUEPRINT.md`.

O Finance Hub publica Evento de faturamento, de pagamento e de estado de Ledger, consumido pelo Analytics para composição de Business Indicator financeiro — sem que o Analytics acesse Invoice, Payment ou Ledger diretamente, conforme já delimitado em `FINANCE_DOMAIN_BLUEPRINT.md`.

O Growth Hub publica Evento de Campaign, de conversão e de Growth Metric, consumido pelo Analytics para composição de indicador de crescimento consolidado — sem que o Analytics recalcule ou redefina uma Growth Metric já existente, apenas a combine com dado de outros domínios, conforme já delimitado em `GROWTH_DOMAIN_BLUEPRINT.md`.

O Automation Engine é acionado, quando aplicável, para executar a ação decorrente de uma Analytical Recommendation já confirmada por decisão humana — o Analytics nunca executa diretamente uma ação de negócio, apenas a sugere, conforme já estabelecido em `AUTOMATION_ENGINE.md`.

O AI Hub apoia a geração de Insight e de Forecast a partir de padrão observado em Dataset consolidado, sempre como sugestão sujeita a confirmação humana, conforme o princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5 — o Analytics nunca delega ao AI Hub a decisão final sobre a validade de um Insight ou de um Forecast.

O Knowledge Hub pode ser consultado, através do AI Hub, quando uma Política documentada é relevante à interpretação de um Insight — por exemplo, uma meta estratégica já registrada como Procedimento —, seguindo o padrão de Retrieval já detalhado em `KNOWLEDGE_HUB.md`.

O Integration Hub é a única via pela qual um Dataset externo — por exemplo, um Benchmark de mercado obtido de fonte externa — alcança o Analytics, conforme já estabelecido em `INTEGRATION_HUB.md`.

O Identity Hub autentica e autoriza toda operação sobre Dashboard, Report e demais Entidades deste domínio, através do modelo RBAC e ABAC já detalhado em `IDENTITY_HUB.md`.

```
              INTEGRAÇÃO DO ANALYTICS COM OUTROS HUBS
   ┌───────────────────────────────────────────────────────────┐
   │  Analytics                                                     │
   │    publica: DashboardCreated · InsightGenerated ·                  │
   │             RecommendationGenerated · ForecastGenerated                 │
   │    consome:  Evento de CRM Hub, Communication Hub, Finance Hub          │
   │              e Growth Hub — nunca Comando, apenas Evento                    │
   └───────────────────────────────────────────────────────────┘
```

---

## 12. Regras de Negócio

Analytics nunca altera Customer — nenhuma operação deste domínio produz efeito de escrita sobre a Entidade Customer do CRM Hub.

Analytics nunca altera Campaign — nenhuma operação deste domínio produz efeito de escrita sobre a Entidade Campaign do Growth Hub.

KPIs são derivados — nunca definidos manualmente como valor arbitrário; são sempre calculados a partir de uma ou mais Metric já existentes.

Forecast não altera operação — uma projeção nunca produz, por si só, uma mudança de estado em qualquer domínio operacional; sua consequência prática é sempre uma Analytical Recommendation, sujeita a confirmação humana.

Dashboards são leitura — nenhum Dashboard, nem nenhum Widget que o compõe, expõe capacidade de escrita sobre dado de outro domínio.

Analytics publica eventos — toda mudança de estado relevante deste domínio é comunicada ao restante da plataforma exclusivamente através de Evento, nunca por chamada direta a outro Hub.

Snapshots são imutáveis — um Snapshot, uma vez criado, nunca é alterado ou removido, preservando a integridade de qualquer Time Series que o inclua.

Benchmarks preservam histórico — uma atualização de Benchmark nunca sobrescreve seu valor anterior; produz um novo registro versionado, preservando a comparação histórica já realizada contra o valor anterior.

Insights não executam ações — a consequência prática de um Insight é sempre uma Analytical Recommendation, nunca uma ação automática direta.

Toda Metric possui uma fórmula de cálculo e uma janela temporal explicitamente identificáveis — nenhuma Metric é exposta sem que sua origem e seu período de referência sejam claros.

Analytics nunca recalcula Metric de domínio alheio — quando consome uma Growth Metric já calculada pelo Growth Hub, o Analytics a utiliza como está, nunca produzindo uma segunda versão divergente do mesmo indicador.

Um Dataset é sempre reconstruível a partir do histórico completo de Evento consumido — garantindo que qualquer Metric ou KPI derivado possa ser recalculado do zero em caso de necessidade de auditoria.

---

## 13. Casos de Uso

**Dashboard executivo.** Uma Empresa consulta um Executive Dashboard que consolida Business Indicator de relacionamento, de comunicação, de finanças e de crescimento em uma única leitura, permitindo à liderança avaliar o negócio como um todo sem alternar entre painéis distintos de cada domínio.

**Painel financeiro.** Um Gestor Financeiro consulta um conjunto de Operational Indicator derivado de Evento publicado pelo Finance Hub, acompanhando receita, inadimplência e fluxo de caixa consolidado em tempo aproximado.

**Painel comercial.** Um Gestor Comercial consulta indicador derivado de Evento do CRM Hub combinado a Evento do Growth Hub, avaliando taxa de conversão de Oportunidade junto ao desempenho de Campaign que a originou.

**Análise de crescimento.** Uma Empresa consulta uma Time Series de Growth Metric já publicada pelo Growth Hub, agora combinada com indicador de Retenção e de Receita do Finance Hub, revelando correlação entre canal de aquisição e valor de longo prazo do Cliente.

**Forecast.** Uma Empresa consulta um Forecast de receita projetado a partir do Trend de faturamento dos últimos períodos, apoiando decisão de investimento futuro.

**Benchmark.** Uma Empresa compara sua taxa de retenção contra um Benchmark de mercado já registrado para seu Segmento, identificando se seu desempenho está acima ou abaixo da referência setorial.

**Relatório.** Uma Empresa gera um Report mensal a partir de um Report Template já configurado, consolidando indicador de todos os domínios operacionais em um documento estruturado para distribuição interna.

**Indicadores.** Uma Empresa acompanha, lado a lado, um conjunto de Operational Indicator de uso diário e um conjunto de Strategic Indicator de leitura trimestral, cada um com granularidade e frequência de atualização apropriadas ao seu público.

**Insights.** A análise consolidada de Dataset ao longo de um trimestre revela um Insight de que Clientes com maior Engagement Score, já calculado pelo Growth Hub, também apresentam menor taxa de atraso de pagamento, informação relevante consumida do Finance Hub.

**Decision Support.** Uma Empresa utiliza a capacidade de Decision Support do Analytics para avaliar, em uma única tela, o Business Indicator atual, o Trend recente e o Forecast projetado antes de decidir sobre uma mudança estratégica de precificação.

---

## 14. Architecture Decision Records

**ADR-001 — Analytics é proprietário da inteligência analítica.** Nenhum outro Hub cria, altera ou possui Dashboard, Metric, KPI, Trend, Forecast ou qualquer Entidade já catalogada no Capítulo 4. Contexto: aplicação direta do princípio Domain Ownership já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, ADR-001.

**ADR-002 — Dashboards são leitura.** Nenhum Dashboard ou Widget expõe capacidade de escrita sobre dado de outro domínio. Contexto: preservar a fronteira entre consolidação analítica e operação de negócio, evitando que o Analytics se torne um ponto de mutação indevida de estado alheio.

**ADR-003 — KPIs são derivados.** Todo KPI é sempre calculado a partir de uma ou mais Metric já existentes, nunca definido como valor arbitrário. Contexto: garantir rastreabilidade e verificabilidade de todo indicador exposto pela plataforma.

**ADR-004 — Forecast não altera estado.** Uma projeção nunca produz, por si só, mudança de estado em qualquer domínio operacional. Contexto: preservar a distinção entre projeção analítica e decisão de negócio efetiva.

**ADR-005 — Insights não executam.** A consequência prática de um Insight é sempre uma Analytical Recommendation, sujeita a confirmação humana antes de qualquer ação. Contexto: aplicação do princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5.

**ADR-006 — Growth continua dono do crescimento.** O Analytics consome Growth Metric já calculada, nunca a recalcula de forma divergente. Contexto: evitar duplicação de indicador já identificada como problema central no Capítulo 3.

**ADR-007 — Finance continua dono do dinheiro.** O Analytics nunca acessa Ledger ou Invoice diretamente, apenas o Evento já publicado pelo Finance Hub. Contexto: preservar o Domain Ownership já estabelecido em `FINANCE_DOMAIN_BLUEPRINT.md`.

**ADR-008 — CRM continua dono do relacionamento.** O Analytics nunca acessa Customer diretamente, apenas o Evento já publicado pelo CRM Hub. Contexto: preservar o Domain Ownership já estabelecido em `CRM_DOMAIN_BLUEPRINT.md`.

**ADR-009 — Communication continua dona da comunicação.** O Analytics nunca acessa Conversation ou Message diretamente, apenas o Evento já publicado pelo Communication Hub. Contexto: preservar o Domain Ownership já estabelecido em `COMMUNICATION_DOMAIN_BLUEPRINT.md`.

**ADR-010 — Analytics publica eventos.** Toda comunicação do Analytics com o restante da plataforma acontece exclusivamente através de Evento, nunca por chamada direta. Contexto: aplicação direta do princípio Events over Direct Calls já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, ADR-002.

**ADR-011 — Snapshot é imutável.** Um Snapshot já criado nunca é alterado ou removido. Contexto: preservar a integridade de toda Time Series e de toda análise histórica que dele dependa.

**ADR-012 — Toda Metric exposta possui fórmula e janela temporal explícitas.** Nenhuma Metric é exposta sem que sua origem de cálculo e seu período de referência sejam claramente identificáveis. Contexto: eliminar a ambiguidade de leitura já descrita como problema central no Capítulo 3 — métricas inconsistentes.

---

## 15. Glossário

**Analytics** — domínio proprietário da inteligência analítica da Adaptive Business Platform.

**Dashboard** — superfície central de leitura consolidada de indicador, composta por Widget.

**Widget** — unidade visual individual que compõe um Dashboard.

**Report** — documento estruturado de leitura analítica gerado a partir de um Report Template.

**Metric** — medida quantitativa isolada, unidade básica de toda leitura analítica.

**KPI** — indicador-chave derivado de uma ou mais Metric.

**Trend** — leitura da evolução de uma Metric ou de um KPI ao longo do tempo.

**Forecast** — projeção futura derivada de um Trend já identificado.

**Insight** — constatação derivada da análise consolidada de dado analítico.

**Analytical Model** — estrutura lógica que define como um Dataset é transformado em Metric ou em Insight.

**Aggregation** — operação de consolidação de múltiplos dados brutos em uma medida única.

**Snapshot** — registro imutável do estado de um indicador em um ponto específico no tempo.

**Time Series** — sequência ordenada de Snapshot de uma mesma Metric ao longo do tempo.

**Benchmark** — referência comparativa de desempenho, interna ou de mercado.

**Scorecard** — conjunto estruturado de indicador usado para avaliação de desempenho consolidado.

**Dataset** — conjunto de dado bruto, já consolidado a partir de Evento de outros domínios.

**Decision Support** — capacidade consolidada de apresentar dado suficiente para apoiar uma decisão humana.

**Analytical Recommendation** — sugestão de ação derivada de um Insight, no contexto exclusivamente analítico deste domínio.

---

## 16. Conclusão

Este documento define oficialmente o domínio Analytics da Adaptive Business Platform — sua fronteira, suas vinte e seis Entidades conceituais, suas dezoito Capacidades de Negócio, seus catorze Eventos e suas doze Regras de negócio. O futuro `ANALYTICS_HUB.md` deverá respeitar integralmente tudo o que aqui foi estabelecido, exatamente como `CRM_HUB.md` respeita `CRM_DOMAIN_BLUEPRINT.md`, como `COMMUNICATION_HUB.md` respeita `COMMUNICATION_DOMAIN_BLUEPRINT.md`, como `FINANCE_HUB.md` respeita `FINANCE_DOMAIN_BLUEPRINT.md`, e como `GROWTH_HUB.md` respeita `GROWTH_DOMAIN_BLUEPRINT.md`.

A cadeia de proprietários da Adaptive Business Platform, reforçada por este documento, permanece precisa: CRM é proprietário do relacionamento. Communication é proprietário da comunicação. Finance é proprietário do estado financeiro. Growth é proprietário do crescimento. Analytics é proprietário da inteligência analítica — a consolidação, a leitura histórica e a projeção futura de indicador que combina dado de todos os demais domínios em uma única leitura coerente. Automation executa — decide quando cada processo, de qualquer domínio, deve efetivamente ocorrer. AI recomenda — apoia decisão através de sugestão, nunca assume autoridade final sobre estado de negócio. Integration integra — é o único ponto de comunicação técnica com sistema externo.

Este é o quinto domínio de negócio explicitamente delimitado por um Blueprint dentro desta série, depois de CRM, de Communication, de Finance e de Growth — confirmando que o método de Domain Ownership explícito, Boundaries em tabela dupla, Eventos como único canal de colaboração entre Hubs, e ADRs como registro formal de cada decisão de fronteira, é o padrão oficial e replicável para todo domínio de negócio da Adaptive Business Platform.
