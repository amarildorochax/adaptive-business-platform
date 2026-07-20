# Event Interaction Matrix

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento consolida oficialmente como os módulos da Adaptive Business Platform interagem entre si por meio dos Eventos, dos Commands e das Queries já definidos. Ele não cria nenhum Evento novo, não altera nenhuma decisão de ownership já registrada em `DOMAIN_OWNERSHIP_MATRIX.md`, não redefine nenhum Command já catalogado em `COMMAND_CATALOG.md`, e não redefine nenhuma Query já catalogada em `QUERY_CATALOG.md`. O que este documento adiciona é a visão consolidada, módulo a módulo, de quem publica, quem consome, em qual direção a comunicação acontece, e quais dependências são permitidas ou proibidas entre os doze módulos já documentados nesta série.

Event-Driven Architecture, já introduzida em `SYSTEM_BLUEPRINT.md` e aplicada de ponta a ponta por esta série de documentos, é o estilo arquitetural sob o qual nenhum módulo chama outro diretamente — toda comunicação acontece através de Evento publicado, de Command formalmente invocado, ou de Query resolvida contra um Read Model já materializado.

Comunicação desacoplada é a propriedade central que este documento demonstra, de forma consolidada, entre todos os pares de módulos da plataforma — cada módulo evolui sua implementação interna livremente, desde que o contrato de Evento, de Command ou de Query que expõe ao restante da plataforma permaneça estável.

Publicadores e consumidores são os dois papéis que todo módulo assume em relação a um Evento específico — publicador é sempre o proprietário do conceito envolvido, já registrado em `DOMAIN_OWNERSHIP_MATRIX.md`; consumidor é qualquer módulo que reaja a esse Evento sem jamais alterá-lo.

Fluxo de eventos é a sequência observável pela qual um fato de negócio se propaga de seu módulo de origem até os módulos consumidores que dele dependem, direta ou indiretamente, conforme já demonstrado individualmente em cada Hub desta série e agora consolidado de forma transversal neste documento.

Dependência unidirecional é o princípio estrutural mais importante deste documento: toda dependência de leitura ou de reação a Evento aponta em uma única direção — do módulo consumidor em direção ao módulo produtor —, nunca formando um ciclo em que dois módulos dependam, de forma circular, do estado um do outro para sua própria operação.

Event Mesh conceitual é o termo usado neste documento para descrever a topologia completa de comunicação da Adaptive Business Platform — não uma infraestrutura física específica, mas o desenho lógico de todas as relações de publicação e de consumo já estabelecidas entre os doze módulos, cuja visão consolidada é precisamente o objeto central deste catálogo.

A necessidade de um documento consolidador como este surge exatamente no mesmo ponto de maturidade em que já surgiu a necessidade de `DOMAIN_OWNERSHIP_MATRIX.md`: depois que doze módulos distintos já publicam, consomem e leem dado uns dos outros através de dezenas de Evento, de Command e de Query já catalogados individualmente, nenhum documento único, até agora, respondia à pergunta "como, exatamente, o módulo A se relaciona com o módulo B" sem exigir a leitura cruzada de `EVENT_CATALOG.md`, de `COMMAND_CATALOG.md` e de `QUERY_CATALOG.md` simultaneamente. Este documento resolve essa lacuna, oferecendo uma visão de topologia completa, módulo a módulo, que nenhum dos três catálogos anteriores foi desenhado para oferecer isoladamente — cada um deles organiza sua informação por Evento, por Command ou por Query individual, nunca pela relação consolidada entre dois módulos específicos.

Esta diferença de organização é o que torna este documento genuinamente complementar, não redundante, aos três catálogos que o precedem. Um Engenheiro que precise saber "quais Eventos o Finance Hub publica" consulta `EVENT_CATALOG.md`. Um Engenheiro que precise saber "como o Finance Hub e o Growth Hub se relacionam, em ambas as direções, através de todos os seus Eventos, Commands e Queries combinados" consulta este documento, que apresenta essa mesma informação já disponível nos catálogos anteriores, mas organizada pela pergunta de topologia entre pares de módulos, não pela pergunta de contrato individual de cada interação.

---

## 2. Objetivos

Este documento elimina dependências diretas — ao tornar explícita toda relação de publicação e de consumo já existente, ele evidencia qualquer dependência que, por acidente de implementação, tenha se formado fora do contrato de Evento, de Command ou de Query já estabelecido.

Este documento reduz acoplamento — a visão consolidada de quem depende de quem permite identificar, antes que se torne um problema real, qualquer relação que aproxime dois módulos além do que sua fronteira de Domain Ownership permite.

Este documento garante escalabilidade — porque toda interação acontece de forma assíncrona e desacoplada, o crescimento de volume em um módulo nunca exige mudança correspondente na capacidade de outro módulo apenas para sustentar a comunicação entre eles.

Este documento garante evolução independente — ao tornar explícito o contrato de cada interação, ele permite que qualquer módulo evolua sua implementação interna sem quebrar nenhum consumidor, desde que o contrato externo já documentado permaneça estável.

Este documento garante observabilidade — a existência de uma matriz consolidada de interação permite monitorar, de forma centralizada, a saúde de cada relação de comunicação entre módulos.

Este documento garante rastreabilidade — qualquer investigação sobre por que um módulo específico reagiu de determinada forma pode começar por esta matriz, identificando rapidamente a origem provável do Evento ou do Command que motivou essa reação.

Este documento garante governança — nenhuma nova integração entre dois módulos é considerada plenamente estabelecida antes de estar refletida nesta matriz, com sua direção, sua classificação e sua justificativa explícitas.

Estes sete objetivos, tomados em conjunto, definem o critério pelo qual qualquer proposta de mudança a este documento deve ser avaliada — uma mudança que elimina uma dependência direta indesejada, mas compromete a rastreabilidade de uma cadeia já bem estabelecida, não é uma mudança aceitável; toda evolução desta matriz precisa preservar os sete objetivos simultaneamente, mesmo princípio de coerência já aplicado em cada catálogo anterior desta série de governança transversal.

---

## 3. Princípios

**Publish Once.** Todo Evento é publicado exatamente uma vez por seu módulo produtor, independentemente de quantos consumidores o processarão.

**Consume Many.** Um mesmo Evento pode ser consumido por múltiplos módulos simultaneamente, sem que o produtor precise conhecer quantos ou quais consumidores existem.

**Single Producer.** Todo Evento possui exatamente um módulo autorizado a publicá-lo, sempre o proprietário já registrado em `DOMAIN_OWNERSHIP_MATRIX.md`.

**Consumer Independence.** A adição ou a remoção de um consumidor de um Evento já existente nunca exige mudança no produtor nem em qualquer outro consumidor já existente.

**Event Ownership.** Todo Evento pertence exclusivamente ao módulo que o publica, nunca a um módulo que apenas o consome.

**No Circular Dependencies.** Nenhum módulo consome, direta ou indiretamente, um Evento cuja cadeia de causalidade retorne a si mesmo, conforme detalhado no Capítulo 10.

**Events Before Integration.** Toda integração entre dois módulos é desenhada em torno do Evento, do Command ou da Query já publicados, nunca em torno de uma chamada direta construída à parte.

**Event Replay Safe.** Toda interação baseada em Evento é segura para reprocessamento, sem produzir efeito duplicado, conforme já garantido em `EVENT_CATALOG.md`, Capítulo 11.

**Eventual Consistency.** Toda propagação de Evento entre módulos tolera uma janela de latência, nunca exigindo consistência instantânea entre produtor e consumidor.

**Immutable Events.** Nenhum Evento consumido é alterado pelo consumidor antes ou depois de seu processamento.

**Analytics Never Publishes Operational State.** O Analytics Hub publica apenas Evento de sua própria natureza analítica — `InsightGenerated`, `ForecastGenerated` — nunca um Evento que altere o estado operacional de CRM, Communication, Finance ou Growth.

**Automation Reacts.** O Automation Engine consome Evento e invoca Command formal em reação a ele, mas nunca publica Evento em nome do domínio de negócio que aciona.

**AI Advises.** O AI Hub publica Evento de sugestão, nunca um Evento que force uma mudança de estado sem confirmação humana.

**Explicit Dependencies.** Toda dependência de consumo entre dois módulos é documentada de forma explícita nesta matriz, nunca inferida por convenção implícita de implementação.

**Cross Reference.** Toda menção a um Evento, a um Command ou a uma Query fora deste documento é feita por referência a `EVENT_CATALOG.md`, a `COMMAND_CATALOG.md` ou a `QUERY_CATALOG.md`, nunca por redefinição paralela.

**Bounded Context First.** Toda decisão de quem consome o quê respeita, antes de qualquer consideração técnica, a fronteira de domínio já estabelecida em `BUSINESS_HUB_ARCHITECTURE.md`.

**Versioned Contracts.** Toda interação entre módulos respeita a versão de contrato já estabelecida para o Evento, o Command ou a Query envolvidos.

**Idempotent Consumption.** Todo consumidor processa uma mesma interação repetida sem produzir efeito duplicado.

**Horizontal Scalability.** Toda interação entre módulos é desenhada para escalar através de mais instâncias de processamento, nunca através do aumento de capacidade de uma única instância central.

**Loose Coupling.** Nenhum módulo depende da implementação interna de outro além do contrato de Evento, de Command ou de Query já publicado por ele.

---

## 4. Matriz Oficial de Interações

A tabela a seguir descreve a relação de cada módulo em linha (Origem) com cada módulo em coluna (Destino). A legenda é: **P** — Origem publica Evento consumido por Destino; **C** — Origem consome Evento publicado por Destino; **R** — Origem lê Read Model de Destino através de Query, sem consumo de Evento; **N** — nenhuma interação direta estabelecida. Uma célula com **P/C** indica relação bidirecional — cada módulo publica algo que o outro consome. Módulos: CRM, Communication (COM), Finance (FIN), Growth (GRO), Analytics (ANA), Automation (AUT), Identity (IDN), Knowledge (KNO), AI, Integration (INT), Branding (BRA), Business Profile (BPE).

| Origem \ Destino | CRM | COM | FIN | GRO | ANA | AUT | IDN | KNO | AI | INT | BRA | BPE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **CRM** | — | P/C | P | P | P | P | C | N | C | C | N | C |
| **COM** | P/C | — | N | P | P | P | C | N | C | C | N | C |
| **FIN** | P | N | — | P | P | P | C | N | N | C | C | C |
| **GRO** | P | N | P | — | P | P | C | N | C | C | N | C |
| **ANA** | N | N | N | N | — | P | C | N | P/C | C | C | C |
| **AUT** | N¹ | N¹ | N¹ | N¹ | C | — | C | N | C | N | N | C |
| **IDN** | P | P | P | P | P | P | — | P | P | P | P | P |
| **KNO** | N | C² | N | N | N | N | C | — | P/C | N | N | C |
| **AI** | P | P | N | P | P/C | P | C | P/C | — | N | N | C |
| **INT** | P | P | P | P | P | N | C | N | N | — | N | C |
| **BRA** | N | N | P | N | P | N | C | N | N | N | — | C |
| **BPE** | P | P | P | P | P | P | C | P | P | P | P | — |

¹ O Automation Engine não estabelece dependência de Evento direta com CRM, Communication, Finance ou Growth — sua relação com esses quatro Business Hubs acontece exclusivamente por Command Invocation, já catalogada em `COMMAND_CATALOG.md` e detalhada na classificação do Capítulo 8 deste documento.

² O Communication Hub consome `SummarizationCompleted`, publicado pelo AI Hub, não diretamente pelo Knowledge Hub; a célula KNO→COM reflete que o Knowledge Hub não publica Evento consumido diretamente pelo Communication Hub, apenas indiretamente através do AI Hub.

Um leitor desta matriz notará que a linha do CRM Hub e a linha do Communication Hub compartilham a marca P/C na célula que as conecta — a relação entre os dois é genuinamente bidirecional: o CRM Hub publica `CustomerCreated`, consumido pelo Communication Hub para iniciar uma Conversation quando aplicável, e o Communication Hub publica `ConversationStarted` e `ConversationClosed`, consumidos de volta pelo CRM Hub para atualizar seu próprio Relationship Status. Esta bidirecionalidade nunca configura um Ciclo, porque cada Evento envolvido é distinto e representa um fato novo, nunca a mesma informação circulando repetidamente entre os dois módulos — distinção central detalhada no Capítulo 10.

A linha do Analytics Hub é a mais assimétrica de toda a matriz: ela contém apenas células N ou C em relação aos quatro Business Hubs operacionais — nunca P —, refletindo o princípio Analytics Never Publishes Operational State já descrito no Capítulo 3. A única célula P da linha Analytics aponta para o Automation Engine, através de `InsightGenerated`, `ForecastGenerated` e `RecommendationGenerated` — Eventos de natureza consultiva, nunca operacional.

A linha do Identity Hub e a linha do Business Profile Engine são as mais simétricas em direção única de toda a matriz: ambas contêm P em praticamente toda coluna, e C ou N em quase todas as demais, refletindo sua natureza de Platform Service transversal — cada um informa todo módulo da plataforma, mas depende de muito pouco em retorno, exceto da própria criação de Tenant, no caso do Business Profile Engine, que depende do `TenantCreated` já publicado pelo Identity Hub.

A relação entre o Knowledge Hub e o AI Hub, marcada como P/C, é a segunda relação genuinamente bidirecional mais importante desta matriz — o Knowledge Hub publica `KnowledgeIndexed` e `SemanticIndexUpdated`, consumidos pelo AI Hub para apoiar Retrieval; e o AI Hub publica `SummarizationCompleted`, consumido de volta pelo Knowledge Hub quando uma sumarização automatizada precisa ser incorporada como novo conteúdo indexado. Esta relação, mais estreita do que qualquer outra par de módulos nesta matriz, reflete a proximidade funcional natural entre conhecimento documental e inteligência automatizada, sem que essa proximidade jamais comprometa a fronteira de ownership já fixada individualmente em `KNOWLEDGE_HUB.md` e em `AI_HUB.md`.

---

## 5. Fluxos Entre Hubs

```
   CRM
      │
      ▼
   CustomerCreated
      │
      ▼
   Growth
      │
      ▼
   AudienceBuilt (Audience construída a partir do novo Customer)
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

Este fluxo demonstra a propagação de um fato de relacionamento até uma execução automatizada, atravessando quatro módulos sem que nenhum deles jamais escreva diretamente sobre o módulo anterior na cadeia.

```
   Finance
      │
      ▼
   InvoicePaid
      │
      ▼
   Analytics
      │
      ▼
   Revenue KPI (KPIUpdated)
      │
      ▼
   Executive Dashboard
```

Este segundo fluxo demonstra como um fato financeiro se consolida em indicador executivo, sem que o Finance Hub jamais tenha conhecimento de que um Dashboard consome, ao final da cadeia, o resultado de sua própria publicação.

```
   Communication
      │
      ▼
   ConversationClosed
      │
      ▼
   CRM
      │
      ▼
   RelationshipUpdated
      │
      ▼
   Analytics
      │
      ▼
   TrendIdentified
```

Este terceiro fluxo demonstra a cadeia entre comunicação, relacionamento e tendência consolidada — o Communication Hub encerra uma Conversation, o CRM Hub reage atualizando o Relationship Status, e o Analytics Hub identifica um Trend a partir da acumulação desses eventos ao longo do tempo.

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
   Finance
      │
      ▼
   InvoiceCreated
```

Este quarto fluxo demonstra a cadeia de indicação até a primeira cobrança de um novo Cliente — Growth publica a conversão do Referral, CRM cria o Customer correspondente, e Finance, ao consumir um Evento subsequente de conversão comercial, emite a primeira Invoice.

```
   Knowledge
      │
      ▼
   KnowledgeIndexed
      │
      ▼
   AI
      │
      ▼
   RecommendationProduced
      │
      ▼
   Growth
      │
      ▼
   GenerateGrowthRecommendation (Command, mediado por confirmação humana)
```

Este quinto fluxo demonstra como conhecimento documental alimenta sugestão de IA, e como essa sugestão, somente após confirmação humana, se traduz em um Command formal já catalogado em `COMMAND_CATALOG.md`.

```
   Identity
      │
      ▼
   TenantCreated
      │
      ▼
   Business Profile Engine
      │
      ▼
   BusinessProfileCreated
      │
      ▼
   Todos os Business Hubs
      │
      ▼
   Configuration inicial de cada módulo aplicada
```

Este sexto fluxo demonstra a inicialização estrutural de um novo Tenant, propagando-se de forma simultânea a todos os cinco Business Hubs, sem que nenhum dependa de ordem específica entre si.

```
   Integration
      │
      ▼
   WebhookDelivered
      │
      ▼
   Finance
      │
      ▼
   PaymentCaptured
      │
      ▼
   Analytics
      │
      ▼
   MetricCalculated
```

Este sétimo fluxo demonstra como uma notificação técnica externa, mediada exclusivamente pelo Integration Hub, se transforma em fato financeiro e, em seguida, em indicador consolidado.

```
   AI Hub
      │
      ▼
   RecommendationProduced (sugestão, nunca ação)
      │
      ▼
   Confirmação humana
      │
      ▼
   Analytics Hub
      │
      ▼
   RecommendationGenerated (consolidação da decisão tomada)
      │
      ▼
   Automation Engine
      │
      ▼
   Command Invocation sobre o Business Hub apropriado
```

Este oitavo e último fluxo reforça, de forma consolidada, o princípio Advisory já classificado no Capítulo 8 — toda sugestão originada de inteligência automatizada, seja do AI Hub, seja do Analytics Hub, passa obrigatoriamente por confirmação humana antes que qualquer Command real seja invocado sobre qualquer Business Hub, nunca havendo um caminho alternativo que contorne essa confirmação, independentemente de quão alta seja a confiança da inferência original.

---

## 6. Dependências Permitidas

CRM → Analytics é permitida porque o Analytics Hub consome todo Evento de relacionamento para composição de Business Indicator, sem jamais escrever de volta sobre a Entidade Customer, conforme já detalhado em `ANALYTICS_HUB.md`, Capítulo 14.

Finance → Analytics é permitida pela mesma razão, aplicada ao domínio financeiro — o Analytics Hub consome `InvoicePaid` e Eventos correspondentes exclusivamente para leitura consolidada.

Growth → Analytics é permitida pela mesma razão, aplicada ao domínio de crescimento — o Analytics Hub consome Growth Metric já calculada, nunca a recalculando de forma divergente, conforme já fixado em `ANALYTICS_DOMAIN_BLUEPRINT.md`, ADR-006.

Automation → Commands é permitida porque o Automation Engine invoca Command formal já exposto por qualquer Business Hub, sempre respeitando integralmente suas pré-condições, conforme já catalogado em `COMMAND_CATALOG.md`, Capítulo 3 — Automation May Invoke Commands.

Analytics → Dashboards é permitida porque o Dashboard é a própria Entidade proprietária do Analytics Hub, servida por Query já catalogada em `QUERY_CATALOG.md`, nunca uma dependência externa.

AI → Recommendations é permitida porque toda sugestão do AI Hub é publicada como Evento de categoria consultiva, sempre sujeita a confirmação humana antes de qualquer efeito de negócio, conforme já detalhado em `AI_HUB.md`, Capítulo 5.

Knowledge → AI é permitida porque o AI Hub consulta a Knowledge Base para apoiar Retrieval, sem que o Knowledge Hub jamais decida sobre o resultado dessa consulta, conforme já detalhado em `KNOWLEDGE_HUB.md`.

Integration → Todos é permitida porque o Integration Hub é o único ponto de comunicação técnica com sistema externo, mediando Webhook, importação e exportação para qualquer Business Hub que precise desse dado, conforme já fixado em `INTEGRATION_HUB.md`, ADR-001.

Identity → Todos é permitida porque toda operação de qualquer módulo depende de autenticação e de autorização já verificadas pelo Identity Hub, conforme já fixado em `IDENTITY_HUB.md`.

Business Profile → Todos é permitida porque toda calibração de Configuration de qualquer módulo depende do Segmento e da Maturidade já classificados pelo Business Profile Engine, conforme já fixado em `BUSINESS_PROFILE_ENGINE.md`.

Branding → Interface é permitida porque toda superfície de apresentação de documento ou de relatório consome identidade visual já publicada pelo Branding Hub, sem que o Branding Hub jamais decida sobre o conteúdo de negócio dessa superfície.

```
              DEPENDÊNCIAS PERMITIDAS (visão consolidada)
   ┌───────────────────────────────────────────────────────────┐
   │  Business Hubs ──► Analytics (leitura consolidada)              │
   │  Analytics ──► Automation (Insight, Forecast, Recommendation)       │
   │  Automation ──► Business Hubs (Command Invocation apenas)             │
   │  Knowledge ──► AI (apoio de Retrieval)                                    │
   │  AI ──► Business Hubs (sugestão, sempre com Human Oversight)                  │
   │  Platform Services ──► Todos (Identity, Integration, Business Profile,             │
   │                                Branding — serviços transversais)                       │
   └───────────────────────────────────────────────────────────┘
```

Cada uma destas onze dependências permitidas compartilha uma propriedade estrutural comum: a direção da dependência sempre aponta do módulo que precisa de informação em direção ao módulo que já a produz, nunca o inverso. O Finance Hub depende do Analytics Hub para consolidação, não o contrário; o Automation Engine depende do Analytics Hub para identificar quando reagir, não o contrário; o AI Hub depende do Knowledge Hub para fundamentar sua sugestão, não o contrário. Esta unidirecionalidade consistente é o que torna a plataforma inteira auditável através de uma única matriz — nenhuma dependência permitida exige verificação adicional de que o módulo dependente também influencia, de volta, o módulo do qual depende.

Uma segunda propriedade compartilhada por toda dependência permitida é o grau de acoplamento mínimo que ela impõe: em nenhum caso, um módulo precisa conhecer mais do que o contrato explícito de Evento, de Command ou de Query já publicado pelo módulo do qual depende. O Finance Hub, ao consumir uma sugestão do AI Hub, nunca precisa conhecer qual modelo de inferência o AI Hub usa internamente; o Automation Engine, ao invocar um Command do Growth Hub, nunca precisa conhecer como o Growth Hub processa esse Command internamente. Esta propriedade de acoplamento mínimo é o que permite que cada um dos doze módulos evolua sua implementação interna de forma inteiramente independente dos demais, desde que o contrato externo já documentado em `EVENT_CATALOG.md`, em `COMMAND_CATALOG.md` e em `QUERY_CATALOG.md` permaneça estável.

---

## 7. Dependências Proibidas

CRM alterar Finance é proibido — o CRM Hub nunca cria, atualiza ou cancela uma Invoice, mesmo diante de uma Opportunity ganha; essa operação é sempre delegada ao Finance Hub através de Evento, conforme já fixado em `FINANCE_DOMAIN_BLUEPRINT.md`, ADR-005.

Finance alterar CRM é proibido — o Finance Hub nunca atualiza diretamente o Relationship Status de um Customer; ele apenas publica `InvoicePaid`, e o CRM Hub decide, de forma autônoma, se e como reagir a esse fato.

Analytics alterar Growth é proibido — o Analytics Hub nunca modifica uma Campaign, um Experiment ou qualquer Entidade do Growth Hub, mesmo quando identifica um Insight diretamente relevante à estratégia de crescimento em curso, conforme já fixado em `GROWTH_DOMAIN_BLUEPRINT.md`, ADR-006.

AI alterar CRM é proibido — o AI Hub nunca cria ou atualiza diretamente um Customer, mesmo após uma Classification de alta confiança; toda ação de negócio decorrente exige confirmação humana antes de um Command formal ser invocado.

Automation assumir ownership é proibido — o Automation Engine nunca passa a deter o dado de negócio que manipula; uma Invoice criada por sua invocação de Command permanece integralmente propriedade do Finance Hub, conforme já fixado em `COMMAND_CATALOG.md`, ADR-004.

Knowledge alterar Customer é proibido — o Knowledge Hub administra conhecimento documental, mas nunca produz efeito de escrita sobre nenhuma Entidade de negócio de nenhum Business Hub.

Integration alterar domínio é proibido — o Integration Hub media a comunicação técnica com sistema externo, mas nunca decide, por conta própria, se uma cobrança deve ser retentada ou se uma Campaign deve ser pausada; essas decisões permanecem exclusivas do Finance Hub e do Growth Hub, respectivamente, conforme já fixado em `INTEGRATION_HUB.md`, ADR-001.

Branding alterar conteúdo de negócio é proibido — o Branding Hub aplica identidade visual a um documento já gerado, mas nunca altera seu conteúdo substantivo, como o valor de uma Invoice.

Business Profile alterar estrutura interna de Hub é proibido — o Business Profile Engine recalibra o Configuration exposto por cada módulo, mas nunca altera diretamente a estrutura interna de nenhum Business Hub.

Communication decidir estratégia de crescimento é proibido — o Communication Hub executa a entrega técnica de mensagem, mas nunca decide, por si só, a segmentação de Audience que deveria motivar essa entrega.

```
              EXEMPLO DE DEPENDÊNCIA PROIBIDA
   ┌───────────────────────────────────────────────────────────┐
   │  PROIBIDO:                                                     │
   │    Analytics Hub ──escreve diretamente──► Growth Metric            │
   │    (recalculando de forma paralela e divergente)                       │
   │                                                                │
   │  CORRETO:                                                         │
   │    Growth Hub ──publica──► GrowthMetric já calculada                    │
   │                       │                                                │
   │                       ▼                                                │
   │    Analytics Hub ──consome──► consolida em Business Indicator                │
   │    (nunca recalcula a Growth Metric original)                                   │
   └───────────────────────────────────────────────────────────┘
```

Estas dez dependências proibidas compartilham uma característica estrutural inversa à já descrita no Capítulo 6: em cada caso, um módulo que não é o proprietário de um conceito tenta exercer autoridade de decisão ou de escrita sobre ele, mesmo quando essa tentativa parece, a princípio, uma otimização operacional legítima. A proibição nunca se baseia em incapacidade técnica — um Analytics Hub tecnicamente poderia escrever sobre uma Campaign, um AI Hub tecnicamente poderia criar um Customer — a proibição se baseia inteiramente na disciplina de Domain Ownership já estabelecida em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 2, e preservada, sem exceção, por todo documento subsequente desta série.

Um padrão recorrente entre as dez dependências proibidas merece destaque: em quase todos os casos, a tentação de violar a fronteira surge de um desejo legítimo de eficiência — evitar a latência de uma Cascata de Evento, evitar a complexidade de uma Command Invocation formal, ou evitar a espera por confirmação humana antes de uma ação de IA. Este documento reconhece essa tentação explicitamente, da mesma forma que `GROWTH_DOMAIN_BLUEPRINT.md` e `FINANCE_DOMAIN_BLUEPRINT.md` já reconheceram, cada um em seu próprio Capítulo de Responsabilidades, a tentação equivalente de contornar a mediação de um Hub — e reafirma, em cada caso, que o custo de curto prazo da disciplina de ownership é sempre inferior ao custo de longo prazo de um acoplamento oculto que, uma vez estabelecido, se torna caro e arriscado de desfazer.

---

## 8. Classificação das Interações

Event Consumption é a categoria dominante desta matriz — um módulo consome Evento já publicado por outro, atualizando seu próprio Read Model ou reagindo através de um Workflow, sem nunca produzir efeito de escrita sobre o módulo de origem.

Read Access é a interação em que um módulo consulta diretamente o Read Model de outro através de Query já catalogada em `QUERY_CATALOG.md`, sem consumo de Evento — como o Query Coordinator do Analytics Hub, que resolve `ExecutiveDashboard` combinando Read Model de múltiplos Business Hubs.

Command Invocation é a interação em que um módulo invoca formalmente um Command já exposto por outro, sempre respeitando suas pré-condições — a forma dominante pela qual o Automation Engine interage com CRM, Communication, Finance e Growth, conforme já detalhado em `COMMAND_CATALOG.md`, Capítulo 6.

Advisory é a interação em que um módulo produz sugestão consultiva consumida por outro, sempre sujeita a confirmação humana antes de qualquer efeito de negócio — a forma característica de toda interação originada do AI Hub e do Analytics Hub em direção aos demais módulos.

Projection é a interação técnica interna pela qual um módulo transforma Evento consumido em atualização de seu próprio Read Model, já detalhada em `QUERY_CATALOG.md`, Capítulo 6.

Synchronization é a interação bidirecional mediada pelo Integration Hub entre um domínio interno e um sistema externo, garantindo consistência entre ambos os lados sem que nenhum domínio interno se comunique diretamente com o sistema externo.

Notification é a interação em que um módulo aciona a entrega de uma mensagem a um Usuário ou a um Cliente, sempre mediada pelo Communication Hub e disparada através do Automation Engine.

Integration é a interação técnica que media toda comunicação com sistema externo, sempre exclusiva do Integration Hub, nunca estabelecida diretamente por nenhum Business Hub.

```
                CLASSIFICAÇÃO DAS INTERAÇÕES
   ┌───────────────────────────────────────────────────────────┐
   │  Event Consumption:  categoria dominante entre Business Hubs       │
   │                       e Analytics Hub                                 │
   │  Read Access:        Query Coordinator do Analytics Hub                    │
   │  Command Invocation: Automation Engine → Business Hubs                        │
   │  Advisory:           AI Hub e Analytics Hub → demais módulos                     │
   │  Projection:         interna a cada módulo consumidor                               │
   │  Synchronization:    Integration Hub ↔ sistema externo                                 │
   │  Notification:       Automation Engine → Communication Hub                                │
   │  Integration:        Integration Hub ↔ Provider externo                                      │
   └───────────────────────────────────────────────────────────┘
```

Esta classificação em oito categorias não é apenas descritiva — ela orienta diretamente a forma como um novo Engenheiro deve avaliar qualquer nova integração proposta entre dois módulos. Antes de implementar qualquer nova interação, a primeira pergunta é sempre a mesma: a qual destas oito categorias essa interação pertence? Uma interação que não se encaixa claramente em nenhuma das oito categorias já estabelecidas é um sinal de alerta — frequentemente indica uma tentativa de comunicação direta que deveria, em vez disso, ser desenhada como Event Consumption, como Command Invocation ou como Read Access, respeitando integralmente o contrato já publicado pelo módulo de origem.

Um grau de acoplamento pode ser atribuído, de forma qualitativa, a cada uma destas categorias, do mais fraco ao mais forte. Event Consumption é a forma de acoplamento mais fraca desta plataforma — o produtor nunca sabe quantos ou quais consumidores existem. Read Access é ligeiramente mais forte, porque o consumidor depende da estrutura do Read Model exposto pela Query, ainda que não da implementação interna que a materializa. Command Invocation é mais forte ainda, porque o módulo invocador precisa conhecer as pré-condições exatas do Command que invoca, já catalogadas em `COMMAND_CATALOG.md`. Synchronization e Integration são as formas de acoplamento potencialmente mais fortes, porque envolvem coordenação bidirecional com um sistema externo cuja disponibilidade a plataforma não controla — razão pela qual essas duas categorias são exclusivamente mediadas pelo Integration Hub, isolando esse acoplamento mais forte em um único módulo especializado, em vez de distribuí-lo por toda a plataforma.

---

## 9. Regras de Comunicação

Somente o Owner publica — todo Evento é publicado exclusivamente pelo módulo já registrado como seu produtor em `DOMAIN_OWNERSHIP_MATRIX.md`.

Consumidores nunca modificam Evento — um Evento consumido é processado, nunca alterado, mesmo quando o consumidor identifica uma inconsistência em seu conteúdo.

Commands respeitam ownership — todo Command é sempre processado pelo módulo proprietário do conceito que altera, conforme já fixado em `COMMAND_CATALOG.md`, ADR-002.

Queries não alteram estado — toda Query, em qualquer módulo, permanece estritamente de leitura, conforme já fixado em `QUERY_CATALOG.md`, ADR-001.

Analytics apenas consome — nenhuma interação originada do Analytics Hub produz efeito de escrita sobre nenhum Business Hub de origem.

Automation executa — toda interação originada do Automation Engine em direção a um Business Hub acontece através de Command Invocation, nunca através de escrita direta.

AI recomenda — toda interação originada do AI Hub em direção a um Business Hub é consultiva, sujeita a confirmação humana.

Knowledge informa — toda interação originada do Knowledge Hub é de natureza documental, nunca de efeito operacional direto.

Integration integra — toda interação técnica com sistema externo é sempre mediada pelo Integration Hub, nunca estabelecida diretamente por outro módulo.

Identity autentica — toda interação entre dois módulos pressupõe verificação prévia de Permission já realizada pelo Identity Hub.

Nenhuma interação bidirecional entre dois Business Hubs assume ordem de precedência implícita — cada direção da interação é avaliada e documentada independentemente nesta matriz.

Toda nova interação entre dois módulos é registrada nesta matriz antes de sua primeira implementação em produção.

Nenhuma interação contorna o Event Bus, o Command formal ou a Query já catalogada — nenhuma chamada direta é aceita como substituto dessas três formas de comunicação.

Toda interação de categoria Advisory é explicitamente marcada como tal nesta matriz, distinguindo-a de uma interação de Event Consumption que produz reação automática sem intervenção humana.

Toda interação entre um Business Hub e um Platform Service segue direção majoritariamente unidirecional — o Business Hub consome o serviço, o serviço nunca depende de volta da lógica de negócio específica de nenhum Business Hub individual.

Nenhuma interação entre dois módulos é removida desta matriz sem que ambos os módulos envolvidos confirmem formalmente sua descontinuação.

Toda interação sensível — como a consumida pelo Audit Manager de qualquer Hub — é auditável de forma imutável.

Toda interação respeita Tenant Isolation, sem exceção, mesmo quando dois módulos colaboram no mesmo processo de negócio mais amplo.

Nenhuma interação é aceita sem propósito de negócio claramente identificável — interações puramente técnicas de infraestrutura não pertencem a esta matriz.

Esta matriz é revisada formalmente sempre que uma nova interação é proposta, nunca deixada desatualizada frente à evolução real da plataforma.

Estas vinte regras, tomadas em conjunto, formam um checklist prático que qualquer proposta de nova interação entre módulos deve satisfazer integralmente antes de sua aprovação. Uma proposta que viole mesmo uma única regra desta lista não é uma exceção pontual a ser aceita por conveniência — é um sinal de que a interação proposta precisa ser redesenhada, tipicamente reformulada como uma das oito categorias já descritas no Capítulo 8, em vez de como uma nova forma de comunicação direta fora do contrato já estabelecido pela plataforma.

Vale notar que estas regras não impõem burocracia desnecessária sobre interação já trivial — uma Query de leitura simples, como `CustomerView`, satisfaz automaticamente a totalidade destas vinte regras sem exigir nenhuma análise adicional, precisamente porque seu contrato já foi desenhado, desde sua concepção em `CRM_HUB.md`, para respeitar cada uma delas. O checklist se torna relevante, na prática, apenas quando uma nova forma de comunicação é proposta — um novo consumidor para um Evento já existente, uma nova Command Invocation entre dois módulos que antes não se relacionavam, ou uma nova composição de leitura agregada através do Query Coordinator do Analytics Hub.

---

## 10. Prevenção de Ciclos

Ciclos proibidos são toda cadeia de interação em que um módulo, direta ou indiretamente, volta a depender de si mesmo para completar seu próprio processamento — por exemplo, se o CRM Hub dependesse de um Insight do Analytics Hub que, por sua vez, dependesse de um Evento que só o próprio CRM Hub pudesse produzir em resposta a esse Insight, formando um laço de dependência circular.

Fan-out é o padrão pelo qual um único Evento publicado por um módulo é consumido por múltiplos módulos simultaneamente — `CustomerCreated`, por exemplo, é consumido por Communication, Finance, Growth e Analytics ao mesmo tempo, sem que nenhum consumidor bloqueie ou condicione o processamento dos demais.

Fan-in é o padrão pelo qual um único módulo consome Evento de múltiplas origens distintas para compor um resultado consolidado — o caso mais evidente sendo o Analytics Hub, que consome Evento de todos os cinco Business Hubs simultaneamente, conforme já detalhado em `ANALYTICS_HUB.md`, Capítulo 3.

Cascata é a propagação sequencial de reação entre múltiplos módulos — como o fluxo já demonstrado no Capítulo 5, em que CRM publica um fato, Growth reage, Analytics consolida, e Automation finalmente executa. Uma Cascata é aceitável desde que cada etapa mantenha a direção unidirecional já exigida, nunca retornando ao módulo de origem.

Replay, já detalhado em `EVENT_CATALOG.md`, Capítulo 9, nunca introduz um Ciclo — a reconstrução de um Read Model a partir do histórico completo de Evento consome exclusivamente Evento já publicado no passado, nunca produzindo nova escrita que retorne ao módulo de origem.

Dead Letter é o mecanismo pelo qual um Evento que falha repetidamente em seu processamento por um consumidor é isolado para investigação manual, em vez de bloquear indefinidamente o restante do fluxo de consumo — essa isolação nunca produz um Ciclo, apenas interrompe o processamento problemático em um ponto específico e controlado.

Retry, quando uma falha temporária interrompe o processamento de um Evento, reencaminha esse mesmo Evento ao consumidor até confirmação de sucesso — essa repetição nunca forma um Ciclo, porque a garantia de Idempotent Consumption já descrita no Capítulo 3 assegura que múltiplas tentativas produzam exatamente o mesmo efeito de uma única tentativa bem-sucedida.

Compensação é o mecanismo pelo qual uma falha parcial em um processo multi-etapa é tratada sem produzir um Ciclo de correção — cada módulo envolvido reage à falha de forma local, dentro de sua própria fronteira, nunca disparando um Evento que force o módulo anterior na cadeia a reverter seu próprio estado já consolidado.

A distinção entre uma Cascata legítima e um Ciclo proibido não é sempre evidente à primeira vista, e por isso merece um critério prático explícito: uma Cascata é legítima quando cada etapa subsequente representa um fato de negócio genuinamente novo, mesmo que causalmente relacionado ao fato anterior. Um Ciclo é proibido quando uma etapa subsequente apenas reafirma, sem produzir fato novo, uma informação que o módulo de origem já possuía, criando uma dependência circular de significado, mesmo que tecnicamente cada Evento envolvido tenha nome distinto. O teste prático mais confiável é perguntar: se esta etapa fosse removida da cadeia, algum módulo perderia acesso a uma informação que só essa etapa específica poderia fornecer? Se a resposta for não — se a informação já estava disponível anteriormente na cadeia —, a etapa é redundante e potencialmente sintoma de um Ciclo mal disfarçado.

Um segundo critério prático de prevenção de Ciclo é a análise de profundidade máxima de uma Cascata antes que ela retorne, de alguma forma, ao módulo de origem. Nesta plataforma, a Cascata mais profunda já demonstrada nesta matriz — CRM até Automation, passando por Growth e por Analytics — tem quatro módulos de profundidade, e em nenhum ponto dessa cadeia o CRM Hub volta a ser consumidor de um Evento que ele mesmo indiretamente originou sem que um novo fato de negócio real — como uma nova ação humana confirmando uma Recommendation — tenha sido introduzido no meio do caminho. Esta é a garantia estrutural que evita que a plataforma inteira, ao crescer em número de integrações ao longo do tempo, acumule Ciclos ocultos difíceis de detectar manualmente.

Um terceiro critério, complementar aos dois anteriores, é a verificação periódica desta própria matriz contra o comportamento real observado em produção — da mesma forma que um Read Model pode divergir de seu histórico de Evento de origem, exigindo Reconciliation já descrita em `QUERY_CATALOG.md`, Capítulo 8, a topologia real de interação entre módulos pode, ao longo do tempo, divergir silenciosamente da topologia aqui documentada, à medida que novas integrações são implementadas sem atualização correspondente deste catálogo. A prevenção de Ciclo, portanto, não é apenas uma disciplina de desenho inicial — é uma disciplina de manutenção contínua, sustentada pela mesma regra de revisão formal já estabelecida no Capítulo 9.

```
              FAN-OUT E FAN-IN (exemplo consolidado)
   ┌───────────────────────────────────────────────────────────┐
   │                    Fan-out (um para muitos)                     │
   │                                                                │
   │           CRM ──publica──► CustomerCreated                          │
   │                     │                                                │
   │        ┌────────────┼────────────┬────────────┐                          │
   │        ▼            ▼            ▼            ▼                          │
   │  Communication    Finance       Growth      Analytics                        │
   │                                                                │
   │                    Fan-in (muitos para um)                       │
   │                                                                │
   │  CRM   Communication   Finance   Growth                              │
   │   │          │            │         │                                  │
   │   └──────────┴────────────┴─────────┘                                      │
   │                     ▼                                                        │
   │                Analytics (consolida todos)                                       │
   └───────────────────────────────────────────────────────────┘
```

```
              DETECÇÃO CONCEITUAL DE CICLO PROIBIDO
   ┌───────────────────────────────────────────────────────────┐
   │  PROIBIDO:                                                     │
   │    CRM ──► Analytics ──► Insight ──► Automation ──►                 │
   │    Command sobre CRM ──► novo Evento do CRM ──►                          │
   │    novamente consumido pelo mesmo Insight original                            │
   │    (ciclo fechado sem novo fato de negócio real)                                  │
   │                                                                │
   │  CORRETO:                                                         │
   │    CRM ──► Analytics ──► Insight ──► Automation ──►                     │
   │    Command sobre CRM ──► novo Evento do CRM, distinto do                    │
   │    original, refletindo mudança de estado real e nova                            │
   │    ──► consumido por um novo ciclo de Analytics, sem                                 │
   │    depender do Insight que o originou                                                    │
   └───────────────────────────────────────────────────────────┘
```

---

## 11. Casos de Uso

**Venda concluída.** O CRM Hub publica `OpportunityWon` ao confirmar o fechamento de uma negociação comercial; o Finance Hub consome esse Evento e emite `InvoiceCreated` correspondente, sem jamais acessar diretamente a Entidade Opportunity do CRM Hub; o Growth Hub consome o `InvoicePaid` subsequente para calcular Attribution da Campaign que originou o Lead convertido; e o Analytics Hub, ao final da cadeia, consolida o resultado financeiro e de crescimento em `MetricCalculated`, disponível através de `FinancialDashboard` e de `GrowthDashboard` simultaneamente.

**Nova campanha.** O Growth Hub publica `CampaignCreated` ao registrar uma nova iniciativa de aquisição; o Finance Hub consome esse Evento para registrar o custo de mídia associado, quando aplicável, sem que o Growth Hub jamais precise conhecer como o Finance Hub trata esse custo internamente; e o Automation Engine consome `CampaignStarted`, publicado quando a Campaign entra em execução, para disparar a Journey correspondente no momento estrategicamente definido.

**Novo cliente.** O CRM Hub publica `CustomerCreated` ao concluir a criação de um novo relacionamento; o Communication Hub consome esse Evento para iniciar uma Conversation de boas-vindas, mediada pelo Automation Engine que decide o momento exato do primeiro contato; e o Growth Hub consome o mesmo Evento para associar o novo Customer a uma Audience relevante, sem que nenhum dos dois módulos jamais escreva diretamente sobre a Entidade Customer que o CRM Hub acabou de criar.

**Novo pagamento.** O Finance Hub publica `PaymentCaptured` ao confirmar a captura efetiva de um Payment; o CRM Hub consome esse Evento para atualizar o Relationship Status correspondente, refletindo que o Cliente cumpriu sua obrigação financeira; e o Growth Hub consome o mesmo Evento para calcular a Attribution de uma conversão comercial já registrada anteriormente, fechando o ciclo entre estratégia de aquisição e resultado financeiro real.

**Novo insight.** O Analytics Hub publica `InsightGenerated` ao identificar um padrão relevante em Dataset consolidado de múltipla origem; o Automation Engine consome esse Evento para avaliar se alguma Regra de disparo configurada se aplica ao Insight identificado; e o AI Hub consome o mesmo Evento para apoiar a formulação de uma Analytical Recommendation complementar, sempre sujeita a confirmação humana antes de qualquer ação de negócio decorrente.

**Workflow automático.** O Finance Hub publica `PaymentFailed` ao registrar a recusa de uma tentativa de captura; o Automation Engine consome esse Evento e invoca formalmente `CreateNotification` no Communication Hub, respeitando integralmente suas pré-condições já catalogadas em `COMMAND_CATALOG.md`; e o Communication Hub processa esse Command e publica `NotificationSent`, fechando a cadeia sem que o Automation Engine jamais tenha escrito diretamente sobre nenhuma Entidade do Communication Hub.

**Dashboard atualizado.** O Growth Hub publica `ConversionRegistered` ao registrar uma nova conversão comercial; o Analytics Hub consome esse Evento e recalcula `MetricCalculated` e `KPIUpdated` correspondentes; e o Dashboard consultado por um Executivo reflete o novo valor dentro da janela de consistência já documentada em `QUERY_CATALOG.md`, Capítulo 8, sem que o Growth Hub jamais precise conhecer que um Dashboard específico consome, ao final da cadeia, o resultado de sua própria publicação.

**Forecast.** O Analytics Hub consolida a Time Series de receita já publicada, ao longo do tempo, pelo Finance Hub; o Forecast Manager projeta `ForecastGenerated` a partir do Trend identificado; e o Automation Engine consome esse Evento para avaliar se um Alerta relevante deve ser disparado, sempre com a incerteza da projeção explicitamente exposta, conforme já exigido pelo Design Principle Forecast Is Advisory de `ANALYTICS_HUB.md`.

**Integração externa.** Um Provider de pagamento notifica o Integration Hub através de um Webhook técnico; o Integration Hub valida essa notificação e publica `WebhookDelivered`; e o Finance Hub consome esse Evento e invoca internamente seu próprio Command `CapturePayment`, sem que o Finance Hub jamais se comunique diretamente com o Provider externo, aplicação direta do princípio Single Integration Layer já fixado em `INTEGRATION_HUB.md`.

**Adaptação do SaaS.** O Business Profile Engine publica `BusinessAdaptationCompleted` após reclassificar a Maturidade de uma Empresa a partir de sinal de crescimento observado; todos os cinco Business Hubs consomem esse Evento simultaneamente, cada um recalibrando seu próprio Configuration de forma independente, sem exigir nenhuma ordem específica de processamento entre si.

**Qualificação assistida de Lead.** O CRM Hub publica `LeadCreated` ao registrar um novo potencial Cliente; o AI Hub consome esse Evento e publica `ClassificationCompleted` com uma categoria de probabilidade de conversão inferida; e o CRM Hub consome essa classificação de volta para priorizar sua própria fila de qualificação manual, sem que essa priorização jamais altere automaticamente o Status do Lead — a decisão final de qualificação permanece sempre humana, aplicação do princípio Human Oversight já reforçado transversalmente nesta matriz.

**Auditoria de conformidade entre módulos.** Um Auditor consulta esta matriz para confirmar que nenhuma interação entre o Finance Hub e o Growth Hub jamais ocorreu por chamada direta, verificando que toda comunicação observada nos Logs de produção corresponde exatamente a uma célula já registrada na tabela do Capítulo 4 — qualquer interação observada que não corresponda a nenhuma célula documentada é imediatamente sinalizada como potencial violação de governança, a ser investigada segundo o critério já estabelecido no Capítulo 9.

---

## 12. Architecture Decision Records

**ADR-001 — Toda comunicação entre módulos é unidirecional em cada relação específica.** Contexto: preservar a ausência de Ciclo já exigida no Capítulo 10, mesmo quando dois módulos mantêm relação bidirecional agregada através de Evento distintos em cada direção.

**ADR-002 — Analytics nunca controla nenhum Business Hub.** Toda interação originada do Analytics Hub é de categoria Event Consumption, Read Access ou Advisory, nunca de escrita direta. Contexto: já fixado em `ANALYTICS_HUB.md`, ADR-001, reafirmado aqui como regra transversal desta matriz.

**ADR-003 — Automation reage a Evento e executa através de Command Invocation, nunca através de escrita direta sobre Entidade de negócio.** Contexto: já fixado em `AUTOMATION_ENGINE.md` e em `COMMAND_CATALOG.md`, ADR-004.

**ADR-004 — AI recomenda através de Evento consultivo, nunca invoca Command de negócio diretamente.** Contexto: já fixado em `AI_HUB.md`, Capítulo 5, e em `COMMAND_CATALOG.md`, ADR-006.

**ADR-005 — Consumidores são independentes entre si.** A adição ou remoção de um consumidor de uma interação já existente nunca exige mudança no produtor nem em qualquer outro consumidor. Contexto: preservar Loose Coupling entre todos os módulos.

**ADR-006 — Nenhum ciclo de dependência é permitido entre módulos, direto ou indireto.** Contexto: aplicação central do princípio No Circular Dependencies já descrito no Capítulo 3, detalhado no Capítulo 10.

**ADR-007 — Todo Evento tem exatamente um produtor.** Contexto: já fixado em `EVENT_CATALOG.md`, ADR-002, reafirmado aqui como fundamento desta matriz.

**ADR-008 — Todo conceito tem exatamente um proprietário.** Contexto: já fixado em `DOMAIN_OWNERSHIP_MATRIX.md`, ADR-001, base de toda atribuição de Origem nesta matriz.

**ADR-009 — Commands permanecem separados de Events e de Queries em toda interação documentada.** Contexto: preservar a tríade CQRS já consolidada em `COMMAND_CATALOG.md`, `EVENT_CATALOG.md` e `QUERY_CATALOG.md`.

**ADR-010 — Queries permanecem estritamente de leitura em toda interação documentada.** Contexto: já fixado em `QUERY_CATALOG.md`, ADR-001.

**ADR-011 — Toda dependência entre dois módulos é explicitamente registrada nesta matriz antes de sua primeira implementação em produção.** Contexto: garantir que este documento nunca fique desatualizado frente à evolução real da plataforma.

**ADR-012 — Integration é o único módulo autorizado a estabelecer comunicação técnica com sistema externo.** Contexto: já fixado em `INTEGRATION_HUB.md`, ADR-001, reafirmado aqui como regra transversal de toda interação de categoria Integration.

**ADR-013 — Identity é consultado por todo módulo antes de qualquer interação sensível.** Contexto: já fixado em `IDENTITY_HUB.md`, aplicado transversalmente a toda linha e coluna desta matriz.

**ADR-014 — Business Profile Engine informa Configuration de todo módulo, mas nunca altera sua estrutura interna.** Contexto: já fixado em `BUSINESS_PROFILE_ENGINE.md`.

**ADR-015 — Knowledge Hub interage predominantemente com o AI Hub, sem interação operacional direta com nenhum Business Hub.** Contexto: preservar a fronteira entre conhecimento documental e execução de negócio já fixada em `KNOWLEDGE_HUB.md`.

**ADR-016 — Toda interação de categoria Advisory exige confirmação humana antes de qualquer efeito de negócio decorrente.** Contexto: aplicação transversal do princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5.

**ADR-017 — Fan-out e Fan-in são padrões aceitos, desde que preservem ausência de Ciclo.** Contexto: distinguir topologia legítima de múltiplos consumidores ou de múltiplas origens de uma dependência circular proibida, já detalhado no Capítulo 10.

**ADR-018 — Esta matriz não cria nenhum Evento, Command ou Query novos.** Toda interação aqui descrita referencia exclusivamente contrato já catalogado em `EVENT_CATALOG.md`, em `COMMAND_CATALOG.md` ou em `QUERY_CATALOG.md`. Contexto: preservar a separação de responsabilidade entre este documento e os três catálogos que ele consolida.

**ADR-019 — Esta matriz é normativa, não apenas descritiva.** Uma interação observada em produção que diverge desta matriz é tratada como defeito de implementação a ser corrigido, nunca como justificativa para atualizar a matriz em sentido contrário à intenção original de ownership.

**ADR-020 — A governança de interação da Adaptive Business Platform está oficialmente consolidada com a publicação deste documento.** Contexto: encerrar formalmente a série de documentos de governança transversal iniciada por `DOMAIN_OWNERSHIP_MATRIX.md`.

---

## 13. Glossário

**Producer** — módulo autorizado a publicar um Evento específico, sempre o proprietário do conceito de negócio envolvido.

**Consumer** — módulo que consome um Evento já publicado, sem nunca alterá-lo.

**Publisher** — sinônimo operacional de Producer, usado no contexto técnico do Event Bus.

**Subscriber** — sinônimo operacional de Consumer, usado no contexto técnico do Event Bus.

**Fan-out** — padrão de propagação em que um único Evento é consumido por múltiplos módulos simultaneamente.

**Fan-in** — padrão de consolidação em que um único módulo consome Evento de múltiplas origens distintas.

**Replay** — reprocessamento do histórico completo de Evento já publicado, sem produzir Ciclo de dependência.

**Projection** — processo técnico que transforma Evento consumido em atualização de um Read Model.

**Event Mesh** — topologia lógica completa de todas as relações de publicação e de consumo entre os módulos da plataforma.

**Integration** — categoria de interação técnica com sistema externo, sempre mediada pelo Integration Hub.

**Dependency** — relação em que um módulo consome Evento, invoca Command, ou lê Query de outro módulo.

**Coupling** — grau de acoplamento entre dois módulos, sempre minimizado através de contrato explícito de Evento, de Command ou de Query.

**Notification** — interação em que um módulo aciona a entrega de mensagem a um Usuário ou a um Cliente, sempre mediada pelo Communication Hub.

**Synchronization** — interação bidirecional mediada pelo Integration Hub entre um domínio interno e um sistema externo.

**Command Invocation** — categoria de interação em que um módulo invoca formalmente um Command já exposto por outro, respeitando integralmente suas pré-condições.

**Advisory** — categoria de interação em que um módulo produz sugestão consultiva consumida por outro, sempre sujeita a confirmação humana antes de qualquer efeito de negócio.

**Cascata** — propagação sequencial de reação entre múltiplos módulos, legítima quando cada etapa representa um fato de negócio genuinamente novo.

**Ciclo** — cadeia de dependência em que um módulo, direta ou indiretamente, volta a depender de si mesmo, sempre proibida nesta plataforma.

**Grau de acoplamento** — medida qualitativa de quão fortemente um módulo depende da estrutura ou do comportamento de outro, sempre minimizada através das oito categorias de interação já descritas no Capítulo 8.

**Bounded Context** — limite dentro do qual um conceito tem significado único, referência central para decidir a direção de toda dependência permitida nesta matriz.

---

## 14. Conclusão

Este documento passa a ser a autoridade oficial sobre a comunicação entre todos os módulos da Adaptive Business Platform. Ele consolida, em uma única matriz, a topologia completa de interação já estabelecida por cada documento proprietário desta série, sem jamais redefinir o que já foi definido em cada um deles.

A série de documentos de governança transversal desta plataforma permanece precisamente delimitada: `DOMAIN_OWNERSHIP_MATRIX.md` define propriedade — quem é dono de cada conceito. `EVENT_CATALOG.md` define Eventos — como cada domínio comunica seus próprios fatos de negócio. `COMMAND_CATALOG.md` define intenções — como cada domínio aceita solicitação de mudança de estado. `QUERY_CATALOG.md` define leitura — como cada domínio expõe seu próprio modelo de leitura otimizado. E `EVENT_INTERACTION_MATRIX.md`, este documento, define comunicação — como todos esses contratos já estabelecidos se combinam na topologia completa de interação entre os doze módulos da plataforma.

Com a publicação deste documento, declara-se oficialmente consolidada a governança de interação da Adaptive Business Platform. Toda futura extensão da plataforma — um sexto Business Hub, um novo Platform Service — herda, por este precedente, a mesma obrigação: nenhuma nova interação entre módulos é considerada plenamente integrada até que esteja refletida nesta matriz, com sua direção, sua classificação e sua justificativa explícitas, sempre respeitando integralmente `DOMAIN_OWNERSHIP_MATRIX.md`, `EVENT_CATALOG.md`, `COMMAND_CATALOG.md`, `QUERY_CATALOG.md` e todos os Hubs oficiais já documentados nesta série.

Os cinco documentos de governança transversal agora completos — `DOMAIN_OWNERSHIP_MATRIX.md`, `EVENT_CATALOG.md`, `COMMAND_CATALOG.md`, `QUERY_CATALOG.md` e este documento — formam, juntos, a camada de referência arquitetural que nenhum Blueprint ou documento de Hub individual poderia oferecer isoladamente: uma visão consolidada de propriedade, de fato, de intenção, de leitura e, agora, de comunicação, aplicável a toda a Adaptive Business Platform de uma só vez. Nenhum destes cinco documentos jamais substitui o detalhe já estabelecido em cada Blueprint e em cada Hub individual — eles existem exclusivamente para que a pergunta "como a plataforma inteira se comporta, além de qualquer domínio isolado" tenha sempre uma resposta única, explícita e consultável.
