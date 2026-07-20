# Business Profile Engine — Arquitetura de Referência

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento é a referência arquitetural oficial do Business Profile Engine — o mecanismo responsável por compreender cada empresa que opera dentro da Adaptive Business Platform e por transformar esse entendimento em adaptação automática de toda a experiência da plataforma.

Quatro documentos oficiais já existem e não são repetidos aqui. `PLATFORM_MANIFESTO.md` introduz o Business Profile Engine como um dos pilares do ecossistema e define o conceito de Adaptive Experience que ele sustenta. `AI_HUB.md` detalha como o AI Hub consome o perfil de negócio através do Business Profile Connector para adaptar o comportamento da inteligência artificial. `SYSTEM_BLUEPRINT.md` posiciona o Business Profile Engine no mapa geral de Hubs e descreve o evento `ProfileChanged` como mecanismo de propagação. `SAAS_ARCHITECTURE.md` detalha como o perfil influencia Menus, Widgets, KPIs, Fluxos, Recomendações, Automações, Modelos de IA e Templates dentro da arquitetura de configuração adaptativa, e como o Tenant Model se relaciona com a classificação de negócio. Onde qualquer um desses quatro documentos já explicou um conceito em profundidade suficiente, este documento referencia o arquivo correspondente em vez de reproduzi-lo, e aprofunda exclusivamente o que é específico do próprio Business Profile Engine: como ele constrói, mantém, versiona e explica o entendimento que tem de cada empresa.

Se o AI Hub é o cérebro da plataforma, conforme já estabelecido em `AI_HUB.md`, o Business Profile Engine é o que poderia ser descrito como o DNA de cada empresa dentro dela — a informação estrutural, herdada desde o primeiro contato e refinada continuamente, que determina como aquele negócio específico se expressa em cada superfície da plataforma. Assim como o DNA não determina sozinho o comportamento de um organismo, mas condiciona e orienta como ele se desenvolve diante de cada estímulo, o Business Profile não decide sozinho o que a plataforma faz — ele condiciona como cada Hub, cada Módulo e cada recomendação se expressam para aquela Empresa específica.

---

## 2. Missão

O objetivo do Business Profile Engine é compreender profundamente cada empresa que opera dentro da plataforma, a um nível de detalhe suficiente para permitir que toda a experiência — interface, inteligência artificial, indicadores, automações, identidade — se adapte automaticamente a essa empresa, sem exigir que ela configure manualmente nenhuma dessas superfícies.

Compreender, aqui, não significa apenas classificar. Uma classificação de segmento isolada — "esta empresa é uma floricultura" — é o ponto de partida, não o objetivo final. A missão do Business Profile Engine é construir um entendimento vivo e multidimensional de cada negócio: o que ele vende, a quem, através de quais canais, em que estágio de maturidade opera, quais são seus objetivos declarados, e como esse conjunto de fatores muda ao longo do tempo à medida que a própria empresa muda. É esse entendimento multidimensional, e não uma etiqueta única de segmento, que sustenta a adaptação descrita nos demais documentos da plataforma.

---

## 3. Problema que Resolve

Plataformas tradicionais de gestão empresarial tratam toda empresa cliente da mesma forma estrutural, e essa uniformidade não é um acidente de implementação — é consequência direta de como esse tipo de software costuma ser construído: um conjunto fixo de telas, campos e fluxos, desenhado para o denominador comum entre todos os segmentos que o fornecedor pretende atender, com qualquer diferença real de negócio empurrada para configuração manual feita pelo próprio cliente ou por uma consultoria de implementação contratada à parte.

Essa abordagem produz limitações previsíveis. A interface mostra o mesmo conjunto de menus e campos a uma clínica e a uma loja de roupas, ainda que os dois negócios operem com vocabulários, prioridades e ciclos completamente diferentes. Os indicadores sugeridos por padrão raramente refletem o que aquele tipo específico de negócio realmente usa para decidir algo — uma métrica de "taxa de recompra" é vital para um pet shop e irrelevante para um escritório de advocacia, mas ambos veem o mesmo painel genérico até que alguém, manualmente, o reconfigure. A inteligência artificial, quando existe, responde de forma genérica, sem qualquer noção do segmento em que está operando, produzindo sugestões que soam corretas em abstrato e erradas em contexto. E cada empresa, para obter qualquer especificidade real, precisa investir tempo e dinheiro em configuração manual — o mesmo tempo entre contratação e primeiro valor percebido que o Manifesto já identificou como falha central do software de gestão tradicional.

O Business Profile Engine resolve esse problema invertendo onde o trabalho de adaptação acontece. Em vez de exigir que a empresa descreva, campo a campo, como seu negócio funciona e configure, manualmente, cada superfície da plataforma de acordo, o Business Profile Engine constrói esse entendimento automaticamente — a partir de um conjunto mínimo de informação inicial, refinado continuamente pelo uso real — e distribui esse entendimento a cada Hub e Módulo interessado, que o consome para se adaptar sem exigir nenhuma intervenção manual adicional da empresa.

---

## 4. Filosofia

A plataforma se adapta ao negócio; o negócio nunca se adapta à plataforma. Esta é a aplicação mais direta, dentro do Business Profile Engine, da missão central já registrada em `PLATFORM_MANIFESTO.md` — e aqui ela ganha um mecanismo concreto: o próprio Business Profile Engine é o componente que torna essa frase operacionalmente verdadeira, não apenas aspiracional.

Cada empresa possui identidade própria, e essa identidade não se resume ao segmento declarado no cadastro. Duas floriculturas podem ter perfis de negócio substancialmente diferentes entre si — uma operando exclusivamente por encomenda para eventos, outra com loja física de fluxo constante — e o Business Profile Engine precisa capturar essa diferença dentro do mesmo segmento, não apenas a diferença entre segmentos distintos.

Cada empresa evolui ao longo do tempo, e o perfil que a representa dentro da plataforma nunca é estático. Uma empresa que começa pequena e sem presença digital relevante pode, dois anos depois, operar em múltiplos canais com um volume de dado completamente diferente — e o perfil precisa acompanhar essa evolução continuamente, não apenas na configuração inicial de onboarding. Um perfil que permanece congelado na primeira impressão do primeiro dia é, por definição, um perfil que envelhece mal e progressivamente deixa de refletir a empresa real por trás dele.

---

## 5. Design Principles

Os princípios abaixo governam toda decisão de design dentro do Business Profile Engine.

**Business First.** Toda decisão de arquitetura do Engine parte da pergunta "o que isto revela sobre o negócio real?", nunca de "que campo é fácil de capturar tecnicamente?". A conveniência de captura nunca deve determinar o que é modelado como parte do perfil.

**Adaptive Experience.** O propósito final de todo dado capturado pelo Business Profile Engine é alimentar a adaptação de experiência já descrita em `PLATFORM_MANIFESTO.md`. Um dado que não alimenta nenhuma adaptação concreta não deveria fazer parte do Modelo de Perfil descrito no Capítulo 8.

**Continuous Learning.** O perfil nunca é considerado completo ou finalizado — ele está permanentemente sujeito a refinamento a partir de novo dado observado, conforme detalhado no Capítulo 12.

**Configuration Over Customization.** O mesmo princípio já estabelecido em `SAAS_ARCHITECTURE.md` se aplica aqui de forma direta: o Business Profile Engine nunca gera código ou lógica específica de uma empresa — ele gera dado de configuração, consumido por lógica genérica e compartilhada entre todas as empresas.

**Profile Driven Decisions.** Toda recomendação, priorização ou adaptação de superfície, em qualquer Hub da plataforma, que dependa de entendimento de negócio, consulta o Business Profile Engine como fonte — nenhum Hub reimplementa sua própria lógica paralela de classificação de segmento.

**Context Before Automation.** Nenhuma automação é sugerida ou executada sem que o contexto de negócio relevante já tenha sido considerado — aplicação, no domínio deste Engine, do princípio "Context Before Prompt" já estabelecido em `AI_HUB.md`.

**Business Identity.** O perfil de uma empresa é tratado como parte de sua identidade dentro da plataforma, com o mesmo peso estrutural atribuído à identidade visual gerida pelo Branding Hub — os dois juntos formam o que a empresa é dentro do sistema.

**Incremental Evolution.** Mudanças no perfil acontecem de forma incremental e continuamente observável, nunca como uma reclassificação abrupta e completa que descarta o entendimento anterior de uma só vez.

**Composable Profile.** O perfil é composto de elementos independentes — Segmento, Maturidade, Objetivos, Canais, e os demais descritos no Capítulo 8 — cada um evoluindo em seu próprio ritmo, sem que a mudança em um elemento exija recalcular todos os demais do zero.

**Human Validation.** A classificação automática produzida pelo Business Profile Engine é sempre apresentada como sugestão validável por um humano na jornada inicial, e permanece ajustável manualmente a qualquer momento — o Engine nunca impõe uma classificação que o próprio Owner do Workspace explicitamente corrigiu.

**Explainable Adaptation.** Toda adaptação de superfície originada no Business Profile deve poder ser explicada em linguagem de negócio — por que este KPI está em destaque, por que esta automação foi sugerida — nunca apresentada como uma decisão opaca e não rastreável.

**Privacy by Design.** Toda captura e todo uso de dado de perfil respeita, desde o desenho, os mesmos princípios de segurança e conformidade já estabelecidos em `AI_HUB.md` e em `SAAS_ARCHITECTURE.md`, detalhados especificamente para este Engine no Capítulo 17.

**Tenant Isolation.** O perfil de uma empresa nunca é usado para inferir ou influenciar o perfil de outra, mesmo quando ambas pertencem ao mesmo segmento — cada Tenant tem seu próprio perfil, isolado exatamente como já estabelecido em `SAAS_ARCHITECTURE.md`.

**Profile Versioning.** Toda mudança relevante de perfil é versionada, permitindo reconstruir, a qualquer momento, como a plataforma entendia aquela empresa em um ponto específico do passado — detalhado no Capítulo 7, componente Profile Versioning.

**Low Coupling.** O Business Profile Engine nunca conhece a implementação interna de nenhum Hub consumidor — ele publica seu entendimento através de contrato e de evento, exatamente como já estabelecido para toda comunicação entre Hubs em `SYSTEM_BLUEPRINT.md`.

---

## 6. Arquitetura Conceitual

```
                              Empresa
                    (dado inicial + uso contínuo)
                                 │
                                 ▼
                      Business Profile Engine
              (compreende, classifica, versiona, distribui)
                                 │
                                 ▼
                               Perfil
                (Segmento, Maturidade, Objetivos, Canais,
                 Capacidades, Preferências — Capítulo 8)
                                 │
                                 ▼
                           Configurações
              (parâmetros consumidos pelas superfícies,
               nunca código específico de Empresa)
                                 │
        ┌──────────┬────────────┼────────────┬──────────┐
        ▼          ▼             ▼            ▼          ▼
    Branding      IA        Dashboards   Automações     KPIs
   (identidade  (contexto   (Widgets,   (fluxos       (indicadores
    de marca)    de negócio  Menus)      sugeridos)    priorizados)
                  no AI Hub)
        │          │             │            │          │
        └──────────┴────────────┼────────────┴──────────┘
                                 ▼
                            Templates
                (modelos de documento, campanha, comunicação)
                                 │
                                 ▼
                      Experiência Adaptativa
              (o que o usuário efetivamente vê e usa)
```

Este diagrama resume a cadeia completa descrita neste documento: uma Empresa fornece dado inicial e produz uso contínuo; o Business Profile Engine transforma esse dado em um Perfil estruturado; o Perfil se materializa em Configurações consumíveis; essas Configurações são consumidas, em paralelo e de forma independente, por Branding, IA, Dashboards, Automações e KPIs; e o resultado agregado de todos esses consumos, incluindo os Templates que combinam múltiplas dessas dimensões, é a Experiência Adaptativa percebida pelo usuário final. Nenhuma seta deste diagrama é uma chamada síncrona bloqueante entre Hubs de domínio — a distribuição do Perfil segue o mesmo padrão de evento (`ProfileChanged`) já descrito em `SYSTEM_BLUEPRINT.md`.

---

## 7. Componentes Internos

Esta seção descreve, em profundidade, cada componente interno do Business Profile Engine — sua responsabilidade central, os limites do que ele não deve fazer, seu papel no fluxo geral, e suas integrações com os demais componentes.

### Profile Manager

O Profile Manager é o ponto de entrada e o orquestrador central do Engine. Toda leitura e toda escrita de perfil passam por ele, que coordena os demais componentes especializados descritos abaixo e garante que o perfil resultante seja internamente consistente antes de ser distribuído. O Profile Manager não classifica segmento, não calcula maturidade e não gera recomendação — sua responsabilidade é orquestração e consistência, nunca a lógica de domínio específica que pertence a cada componente especializado.

### Business Classifier

O Business Classifier determina o Segmento e o Subsegmento de uma empresa, a partir do dado declarado no onboarding e refinado pelo padrão de uso observado ao longo do tempo. Ele não decide o que fazer com essa classificação — apenas a produz e a disponibiliza ao restante do Engine.

### Segment Engine

O Segment Engine mantém o catálogo de segmentos e subsegmentos reconhecidos pela plataforma, junto com as características típicas associadas a cada um — vocabulário comum, prioridades operacionais frequentes, KPIs tipicamente relevantes. É a fonte de conhecimento estrutural que o Business Classifier consulta para produzir uma classificação, mas nunca ele mesmo decide qual segmento se aplica a uma empresa específica.

### Business Maturity Engine

O Business Maturity Engine avalia em que estágio de maturidade operacional e digital uma empresa se encontra — desde uma operação iniciante, sem presença digital estabelecida, até uma operação já sofisticada, com múltiplos canais e processos maduros. Essa avaliação é distinta da classificação de Segmento: duas empresas do mesmo segmento podem estar em estágios de maturidade completamente diferentes, e a experiência adaptada precisa refletir ambas as dimensões de forma independente.

### Goals Engine

O Goals Engine captura e organiza os Objetivos declarados por uma empresa — aumentar vendas, reduzir custo operacional, melhorar atendimento, expandir para novo canal — e os mantém como uma dimensão viva do perfil, revisável ao longo do tempo à medida que os próprios objetivos de negócio mudam.

### Capabilities Engine

O Capabilities Engine mapeia o que uma empresa efetivamente é capaz de operar hoje — presença de equipe dedicada a marketing, capacidade de atendimento em múltiplos canais simultâneos, maturidade de processo financeiro — informação que difere de Objetivo: uma empresa pode ter o objetivo de operar automação avançada sem ainda ter a capacidade organizacional de sustentá-la, e essa diferença é relevante para o tipo de recomendação que o Engine produz.

### Channel Manager

O Channel Manager identifica e mantém atualizados os canais através dos quais uma empresa opera — loja física, e-commerce, redes sociais, WhatsApp, mercado de terceiros — informação central para determinar quais Módulos de Growth e de Communication são mais relevantes para aquela empresa específica.

### Localization Engine

O Localization Engine mantém o idioma, a moeda e as convenções regionais relevantes para uma empresa, garantindo que toda superfície adaptada — de KPI a comunicação gerada por IA — respeite essas convenções sem exigir configuração manual repetida em cada Módulo.

### Preferences Engine

O Preferences Engine captura preferências explícitas, declaradas pela própria empresa ou por um usuário específico dentro dela — nível de detalhe preferido em relatório, frequência de notificação, tom de comunicação preferido quando diverge do padrão sugerido pelo segmento — e as trata com prioridade sobre a inferência automática, respeitando o princípio de Human Validation já descrito no Capítulo 5.

### Recommendation Engine

O Recommendation Engine transforma o entendimento acumulado pelos demais componentes em sugestões acionáveis — Módulo, KPI, Automação, Template — descritas em profundidade no Capítulo 16. Ele não decide sozinho a lógica de negócio de cada tipo de recomendação; consulta o Feature Advisor, o Configuration Advisor e o Automation Selector, descritos adiante, para compor a lista final apresentada à empresa.

### Adaptive Rules Engine

O Adaptive Rules Engine mantém as regras que traduzem uma combinação de Segmento, Maturidade, Objetivo e demais dimensões do perfil em uma configuração concreta de superfície — é o componente central que resolve, para cada requisição de configuração adaptativa, qual conjunto de parâmetros se aplica a uma empresa específica.

### Configuration Generator

O Configuration Generator produz a configuração final e estruturada consumida pelo restante da plataforma, a partir da resolução produzida pelo Adaptive Rules Engine. Ele nunca gera código — apenas dado de configuração, respeitando o princípio Configuration Over Customization.

### Template Selector

O Template Selector escolhe, entre o catálogo de Templates disponíveis na plataforma, quais são apresentados como sugestão prioritária a uma empresa específica, com base em Segmento, Canais e Branding já aplicado — sem nunca criar um Template exclusivo e não reutilizável para uma única empresa.

### KPI Selector

O KPI Selector determina quais indicadores, do catálogo geral já mantido pelo Analytics Hub, são priorizados em destaque para uma empresa específica, com base em Segmento e Objetivos — a mesma lógica geral já introduzida em `SAAS_ARCHITECTURE.md`, cujo mecanismo de decisão vive, especificamente, neste componente.

### Automation Selector

O Automation Selector identifica, entre os Fluxos candidatos mantidos pelo Automation Hub, quais são sugeridos com maior prioridade a uma empresa específica — detalhado no Capítulo 15.

### AI Context Builder

O AI Context Builder prepara a representação do perfil de negócio no formato consumido pelo Business Profile Connector do AI Hub, já descrito em `AI_HUB.md`. Este componente não decide como a IA usa essa informação — apenas garante que o perfil seja entregue em formato correto e atualizado, sempre que solicitado.

### Profile History

O Profile History preserva o registro cronológico de toda mudança relevante de perfil, sustentando tanto o Profile Versioning quanto qualquer investigação futura de como o entendimento de uma empresa evoluiu ao longo do tempo.

### Profile Versioning

O Profile Versioning aplica identificação de versão a cada estado relevante do perfil, permitindo reconstruir, com precisão, qual configuração de perfil estava ativa em um momento específico do passado — essencial tanto para auditoria quanto para investigar por que uma adaptação específica aconteceu de determinada forma em um momento passado.

### Profile Validator

O Profile Validator garante que um perfil, antes de ser distribuído aos consumidores, esteja internamente consistente — que um Objetivo declarado não contradiga a Capacidade já mapeada, por exemplo — sinalizando inconsistência para revisão humana quando aplicável, em vez de propagar um perfil internamente contraditório ao restante da plataforma.

### Explainability Engine

O Explainability Engine produz, para qualquer adaptação de superfície originada no Business Profile, uma explicação em linguagem de negócio de por que aquela adaptação aconteceu — aplicação direta do princípio Explainable Adaptation já descrito no Capítulo 5, e detalhado como funcionalidade no Capítulo 17.

### Feature Advisor

O Feature Advisor recomenda, especificamente, quais Módulos e capacidades ainda não ativados seriam relevantes para uma empresa, com base no seu perfil — alimentando diretamente a seção de Recomendações Inteligentes do Capítulo 16.

### Configuration Advisor

O Configuration Advisor recomenda ajustes de configuração dentro de Módulos já ativos — por exemplo, sugerir a ativação de um KPI adicional relevante que ainda não está em destaque — distinto do Feature Advisor, que recomenda capacidade nova, não ajuste de capacidade já existente.

Cada um destes componentes tem um limite estrito de responsabilidade, e nenhum deles acumula lógica de outro componente vizinho — a mesma disciplina de modularidade interna já aplicada aos componentes do AI Hub em `AI_HUB.md` se aplica, com o mesmo rigor, aqui.

---

## 8. Modelo de Perfil

O Modelo de Perfil é a estrutura de dado que representa o entendimento acumulado sobre uma empresa. Cada elemento abaixo é mantido por um dos componentes descritos no Capítulo 7, e evolui de forma independente, conforme o princípio Composable Profile.

Segmento identifica a categoria principal de negócio — floricultura, clínica, academia — mantido pelo Business Classifier.

Subsegmento refina essa categoria com uma especialização mais precisa — dentro de "clínica", por exemplo, distinguir uma clínica odontológica de uma clínica estética, cada uma com prioridades operacionais distintas.

Porte captura a dimensão de escala da empresa — número de colaboradores, volume de operação — relevante para calibrar a complexidade de configuração sugerida por padrão.

Localização identifica onde a empresa opera fisicamente, informação consumida tanto pelo Localization Engine quanto por eventuais Módulos de presença local.

Idioma e Moeda são mantidos pelo Localization Engine e aplicados de forma consistente a toda superfície que produz texto ou valor monetário em nome da empresa.

Número de colaboradores complementa Porte com uma medida mais direta de escala organizacional, relevante para o Capabilities Engine calibrar a complexidade de automação recomendada.

Objetivos são mantidos pelo Goals Engine — o que a empresa declara querer alcançar em um horizonte próximo, revisável ao longo do tempo.

Produtos e Serviços descrevem o que a empresa efetivamente oferece, informação central tanto para Templates de Growth quanto para o vocabulário aplicado pela IA em respostas geradas em nome da empresa.

Canais são mantidos pelo Channel Manager — onde a empresa está presente e opera comercialmente.

Mercado captura o contexto competitivo e de demanda em que a empresa opera, quando essa informação está disponível, refinando ainda mais a relevância das recomendações produzidas.

Maturidade Digital é mantida pelo Business Maturity Engine, medindo o quão sofisticada é a operação digital já existente da empresa, independentemente do segmento.

Volume operacional captura a escala real de operação — número de Leads processados, transações mensais — uma medida dinâmica, atualizada continuamente pelo uso real, distinta do Porte declarado no cadastro inicial.

Preferências são mantidas pelo Preferences Engine, com prioridade sobre inferência automática, conforme já descrito.

Identidade, neste contexto, refere-se à referência à identidade de marca gerida pelo Branding Hub — o Modelo de Perfil mantém a associação a essa identidade, sem duplicar sua gestão, que pertence inteiramente ao Branding Hub.

Capacidades são mantidas pelo Capabilities Engine, conforme já descrito.

Desafios capturam dificuldades declaradas ou inferidas da operação da empresa — um sinal valioso tanto para o Recommendation Engine quanto para priorização de Automação relevante.

```
                          MODELO DE PERFIL
   ┌─────────────────────────────────────────────────────────┐
   │  Identificação:  Segmento · Subsegmento · Porte ·         │
   │                  Localização · Idioma · Moeda             │
   │                                                            │
   │  Operação:       Produtos · Serviços · Canais · Mercado · │
   │                  Volume operacional · Colaboradores        │
   │                                                            │
   │  Direção:        Objetivos · Desafios                      │
   │                                                            │
   │  Maturidade:     Maturidade Digital · Capacidades           │
   │                                                            │
   │  Personalização: Preferências · Identidade (ref. Branding) │
   └─────────────────────────────────────────────────────────┘
```

Nenhum desses elementos existe de forma isolada dentro do Engine — todos são consultados em conjunto pelo Adaptive Rules Engine no momento de resolver uma configuração concreta, conforme já descrito no Capítulo 7.

---

## 9. Jornada de Construção do Perfil

```
Cadastro
   │  Tenant e Workspace provisionados (SAAS_ARCHITECTURE.md, Cap. 12)
   ▼
Perguntas Iniciais
   │  segmento declarado, objetivo principal, canais em uso hoje
   ▼
Classificação
   │  Business Classifier + Segment Engine produzem Segmento e
   │  Subsegmento sugeridos; Business Maturity Engine estima
   │  maturidade inicial a partir das respostas fornecidas
   ▼
Validação
   │  Owner confirma ou corrige a classificação sugerida
   │  (princípio Human Validation, Capítulo 5)
   ▼
Perfil Inicial
   │  Profile Validator confirma consistência interna;
   │  Profile Manager consolida o primeiro estado versionado
   ▼
Configuração Automática
   │  Adaptive Rules Engine + Configuration Generator produzem
   │  a primeira configuração de Menus, KPIs, Widgets e Templates
   ▼
Aprendizado Contínuo
   │  uso real observado passa a refinar o perfil (Capítulo 12)
   ▼
Revisões
   │  mudanças relevantes de negócio disparam nova versão do
   │  perfil (Profile Versioning), nunca substituição silenciosa
```

A etapa de Validação é o ponto de maior atenção arquitetural desta jornada: a classificação produzida pelo Business Classifier é sempre uma sugestão, nunca uma imposição, e a confirmação — ou correção — do Owner é registrada como um sinal de alta confiança, priorizado por todo componente subsequente sobre qualquer inferência automática divergente.

A transição de Configuração Automática para Aprendizado Contínuo marca a passagem de um perfil estático de onboarding para um perfil vivo — a partir deste ponto, o perfil nunca mais é tratado como definitivamente completo, conforme o princípio Continuous Learning já descrito no Capítulo 5.

---

## 10. Segmentação Inteligente

O Business Profile Engine reconhece um catálogo extensível de segmentos, cada um associado a um conjunto inicial de características típicas mantidas pelo Segment Engine — características que orientam a primeira configuração, mas que nunca substituem o refinamento contínuo descrito no Capítulo 12.

Uma Floricultura tende a ter volume operacional sazonal, forte dependência de ocasião (datas comemorativas), e ciclo de venda curto — características que priorizam KPIs de conversão rápida e Automações de lembrete sazonal.

Um Pet Shop tende a ter ciclo de recompra previsível, atrelado à idade e às necessidades recorrentes do animal — priorizando Automação de reengajamento programado e KPI de frequência de recompra.

Uma Clínica tende a exigir maior formalidade de comunicação e atenção a confidencialidade, com ciclo de relacionamento mais longo que uma venda de varejo — priorizando Templates mais formais e Automação de lembrete de retorno, não de oferta promocional.

Um Restaurante tende a operar em tempo real, com janelas de decisão curtas — priorizando KPI operacional imediato (ocupação, tempo de espera) sobre indicador de tendência de longo prazo.

Uma marca de Moda tende a operar fortemente em torno de tendência, estação e apelo visual — priorizando Templates de forte apelo visual e Automação de campanha sazonal.

Uma Academia tende a medir sucesso em retenção e frequência, não apenas em transação isolada — priorizando KPI de churn e Automação de reengajamento de aluno inativo.

Um escritório de Advocacia tende a exigir precisão terminológica e formalidade elevada, com tolerância mínima a ambiguidade — priorizando Template formal e um Tom de comunicação, gerido pelo Branding Hub, calibrado para esse nível de formalidade.

Uma Agência opera de forma estruturalmente distinta das demais — não vende um produto ou serviço final a um consumidor, mas gerencia a operação de múltiplos clientes, o que a aproxima do cenário de Organização já descrito em `SAAS_ARCHITECTURE.md`, Capítulo 21, mais do que do perfil de um negócio operacional único.

Um E-commerce tende a ter volume operacional mais previsível e mensurável digitalmente desde o primeiro dia, priorizando KPI de conversão de funil e Automação de recuperação de carrinho abandonado.

Uma empresa de Prestação de Serviços tende a operar por contrato ou projeto, com ciclo de venda mais longo e relacionamento mais consultivo — priorizando KPI de valor de contrato e Automação de acompanhamento de proposta.

```
                        CATÁLOGO DE SEGMENTOS
   ┌───────────────────────────────────────────────────────────┐
   │ Floricultura · Pet Shop · Clínica · Restaurante · Moda ·   │
   │ Academia · Advocacia · Agência · E-commerce ·              │
   │ Prestação de Serviços · (extensível a novos segmentos)      │
   └───────────────────────────────────────────────────────────┘
```

Nenhum desses segmentos é implementado como uma versão de código separada da plataforma — cada um é uma configuração inicial mantida pelo Segment Engine, consumida pelo Adaptive Rules Engine da mesma forma para qualquer segmento, incluindo qualquer segmento novo adicionado ao catálogo no futuro sem exigir alteração de nenhum componente já existente.

---

## 11. Motor de Adaptação

O motor de adaptação é a combinação operacional do Adaptive Rules Engine e do Configuration Generator, já descritos no Capítulo 7, aplicada a cada superfície de experiência da plataforma.

```
                      Perfil (Modelo de Perfil, Cap. 8)
                                 │
                                 ▼
                      Adaptive Rules Engine
        (resolve, para cada superfície, o conjunto de regras
         aplicável a esta combinação específica de Segmento,
         Maturidade, Objetivos e demais dimensões)
                                 │
                                 ▼
                      Configuration Generator
                                 │
        ┌──────┬──────┬─────────┼─────────┬──────┬──────┬──────┐
        ▼      ▼      ▼         ▼         ▼      ▼      ▼      ▼
      Menus Widgets  KPIs   Templates Relatórios Automações  IA  Branding
                                                              │      │
                                                        (contexto  (tom e
                                                         de negócio identidade,
                                                         no AI Hub)  Cap. 14)
```

Para cada uma dessas superfícies, o motor de adaptação resolve o mesmo tipo de decisão: dado o perfil completo de uma empresa, qual subconjunto do catálogo geral daquela superfície — Menus disponíveis, Widgets candidatos, KPIs calculáveis, Templates existentes, Relatórios possíveis, Automações candidatas — deve ser priorizado, sugerido, ou exibido em destaque. Em nenhum caso o motor de adaptação cria uma versão nova e exclusiva de Menu, Widget, KPI, Template, Relatório ou Automação para uma empresa específica — ele sempre seleciona e prioriza dentro do catálogo comum, consistente com o princípio Configuration Over Customization.

Dashboards e Fluxos, mencionados na estrutura solicitada por este documento, são a composição de múltiplos desses elementos individuais — um Dashboard é uma composição priorizada de Widgets e KPIs; um Fluxo é uma composição priorizada de etapas de Automação — e por isso não constituem uma superfície adicional distinta no motor de adaptação, mas o resultado agregado da mesma resolução já descrita para seus elementos constituintes.

---

## 12. Aprendizado Contínuo

O perfil de uma empresa nunca para de evoluir depois da jornada inicial descrita no Capítulo 9. O Business Profile Engine observa continuamente quatro categorias de sinal, refinando o perfil sem exigir nenhuma nova rodada explícita de perguntas ao Owner, salvo quando o próprio Engine identifica uma divergência relevante o suficiente para justificar uma nova validação humana.

Uso real é o sinal mais direto: quais Módulos são efetivamente acessados com frequência, quais KPIs são consultados, quais Automações sugeridas são de fato ativadas versus ignoradas. Esse padrão de uso, ao longo do tempo, frequentemente revela mais sobre a operação real de uma empresa do que a resposta declarada no onboarding — uma empresa pode ter se classificado como pequena no cadastro e, seis meses depois, operar em volume que já sugere um Porte diferente.

Preferências explicitamente ajustadas — quando um Usuário reconfigura manualmente um Widget sugerido, ou corrige uma classificação automática — são tratadas com prioridade máxima, conforme já estabelecido no Capítulo 5, e nunca são revertidas silenciosamente por uma nova inferência automática divergente.

Novos Módulos ativados pela própria empresa, seja por decisão própria, seja seguindo uma recomendação do Feature Advisor, atualizam o Capabilities Engine, refletindo uma capacidade organizacional que passou a existir e que pode, por si só, tornar outras recomendações relevantes que não eram antes.

Novos Objetivos declarados, ou mudanças observadas de comportamento consistentes com um objetivo diferente do inicialmente declarado, atualizam o Goals Engine, permitindo que a plataforma acompanhe mudança de direção estratégica do negócio sem exigir que a empresa refaça o onboarding do zero.

```
                    SINAIS DE APRENDIZADO CONTÍNUO
   ┌───────────────────────────────────────────────────────────┐
   │  Uso real ──────────┐                                       │
   │  Preferências ──────┼──► Profile Manager ──► Profile        │
   │  ajustadas           │     (consolida sinais)   Validator    │
   │  Novos Módulos ─────┤                              │        │
   │  ativados            │                              ▼        │
   │  Novos Objetivos ───┘                    Nova versão do      │
   │  declarados                              perfil, se           │
   │                                          consistente          │
   └───────────────────────────────────────────────────────────┘
```

Nenhum desses quatro sinais, isoladamente, força uma mudança imediata de perfil — o Profile Manager consolida sinais observados ao longo de uma janela de tempo antes de propor uma nova versão, evitando que uma variação pontual e não representativa de uso — um pico atípico de atividade em uma única semana, por exemplo — seja confundida com uma mudança real e duradoura de maturidade ou de capacidade. Essa consolidação é o que distingue Aprendizado Contínuo de reclassificação reativa: o Engine observa padrão sustentado, não evento isolado.

Todo esse aprendizado acontece sem comprometer privacidade — o refinamento contínuo do perfil de uma empresa específica nunca é usado para inferir ou influenciar, de forma identificável, o perfil de outra empresa, mesmo dentro do mesmo segmento, respeitando o princípio Tenant Isolation já descrito no Capítulo 5 e detalhado em `SAAS_ARCHITECTURE.md`. Um eventual aprendizado agregado entre múltiplas empresas do mesmo segmento — por exemplo, refinar o conjunto padrão de características associadas a um Segmento inteiro no Segment Engine — acontece apenas de forma anonimizada e agregada, nunca atribuível a uma empresa individual, na mesma linha de raciocínio já estabelecida para o aprendizado agregado do AI Hub em `AI_HUB.md`.

---

## 13. Integração com IA

O Business Profile Engine fornece contexto de negócio ao AI Hub exclusivamente através do Business Profile Connector, já detalhado em `AI_HUB.md`. Este documento não repete essa integração — acrescenta apenas o que é responsabilidade específica deste Engine dentro dela.

O AI Context Builder, descrito no Capítulo 7, é o componente responsável por preparar a representação do perfil no formato consumido pelo Connector, garantindo que a versão mais atual do perfil — incluindo qualquer refinamento produzido pelo Aprendizado Contínuo descrito no Capítulo 12 — esteja sempre disponível no momento em que uma solicitação de IA precisar dela. O Business Profile Engine nunca compõe o prompt final enviado a um modelo de linguagem, nem decide qual modelo deve processar uma solicitação — essas responsabilidades pertencem inteiramente ao Prompt Engine e ao Provider Manager, já descritos em `AI_HUB.md`. A responsabilidade deste Engine termina em entregar um perfil correto, completo e atualizado; o que o AI Hub faz com esse perfil pertence a outro documento.

---

## 14. Integração com Branding

O Branding Hub utiliza o perfil de negócio, em conjunto com a identidade visual derivada da logo já descrita em `PLATFORM_MANIFESTO.md`, para calibrar o Tom de comunicação aplicado a cada Empresa — a formalidade de um escritório de advocacia e a proximidade de uma marca de moda jovem, ainda que ambas possam ter paletas de cor tecnicamente elegantes, exigem calibração de tom completamente diferente, e é o Segmento e a Maturidade mantidos por este Engine que informam essa calibração.

O Business Profile Engine não gera nem armazena nenhum elemento de identidade visual — cor, tipografia, logo — essa responsabilidade pertence inteiramente ao Branding Hub. A integração entre os dois acontece em uma única direção clara: o perfil de negócio informa o Branding Hub sobre o contexto de tom apropriado; o Branding Hub nunca informa de volta o Segmento ou a Maturidade de uma empresa — essas classificações pertencem exclusivamente a este Engine.

---

## 15. Integração com Automações

O Automation Selector, descrito no Capítulo 7, consulta o perfil completo de uma empresa para priorizar, entre o catálogo geral de Fluxos candidatos mantido pelo Automation Hub, quais são sugeridos com maior destaque para aquela empresa específica — o mesmo padrão de recomendação de Automação já introduzido em `SAAS_ARCHITECTURE.md`, Capítulo 13, cujo mecanismo de decisão vive, especificamente, neste componente.

Este Engine não executa nenhuma Automação, não define a lógica condicional interna de nenhum Fluxo, e não decide se uma Automação sugerida deve ser ativada automaticamente ou aguardar confirmação explícita do Owner — essas responsabilidades pertencem inteiramente ao Automation Hub. A responsabilidade deste Engine termina em identificar e priorizar, com base em Segmento, Objetivos e Desafios já capturados no Modelo de Perfil, quais Automações do catálogo geral são mais relevantes para uma empresa específica em um determinado momento de sua maturidade.

---

## 16. Recomendações Inteligentes

O Recommendation Engine, orquestrando o Feature Advisor e o Configuration Advisor já descritos no Capítulo 7, produz sete categorias de recomendação a partir do perfil de uma empresa.

Novos Módulos são recomendados pelo Feature Advisor quando o perfil sugere uma necessidade ainda não atendida por nenhum Módulo ativo — por exemplo, um volume crescente de Leads capturados manualmente sugerindo a ativação de Automação de qualificação.

Novos KPIs são recomendados pelo KPI Selector e pelo Configuration Advisor quando um indicador relevante ao Segmento ou ao Objetivo declarado ainda não está em destaque no Dashboard da empresa.

Novas Automações seguem o mesmo padrão já descrito no Capítulo 15, priorizadas pelo Automation Selector.

Novas Integrações são recomendadas quando o Channel Manager identifica um canal em que a empresa já opera, mas para o qual nenhum Connector do Integration Hub — já descrito em `SYSTEM_BLUEPRINT.md` — está ainda configurado.

Melhores práticas são recomendações qualitativas, derivadas do conhecimento estrutural mantido pelo Segment Engine sobre o que tipicamente funciona bem para aquele tipo de negócio, apresentadas como sugestão de ação, não como configuração automática.

Conteúdo é recomendado quando o perfil sugere uma oportunidade de Growth ainda não explorada — por exemplo, um Objetivo declarado de aumento de vendas sazonal sugerindo pauta de conteúdo alinhada à sazonalidade típica daquele Segmento, já descrita no Capítulo 10.

Treinamentos são recomendados quando o Capabilities Engine identifica uma lacuna entre o que a empresa deseja operar, segundo os Objetivos declarados, e o que ela já demonstra saber operar, segundo o padrão de uso observado — uma recomendação voltada a capacitar a equipe da empresa, não a configurar a plataforma por ela.

Toda recomendação produzida por qualquer uma dessas sete categorias é acompanhada de uma explicação gerada pelo Explainability Engine, detalhada no capítulo seguinte, e nenhuma delas é aplicada automaticamente sem alguma forma de confirmação, respeitando o princípio Human Validation já estabelecido no Capítulo 5.

---

## 17. Segurança

Privacidade é tratada, no Business Profile Engine, com a mesma disciplina arquitetural já estabelecida em `AI_HUB.md` e em `SAAS_ARCHITECTURE.md` — todo dado capturado como parte do Modelo de Perfil tem finalidade declarada e é usado exclusivamente para os propósitos de adaptação já descritos neste documento, nunca repassado ou vendido como dado agregado de mercado sem uma política própria e explícita para esse fim, distinta do uso operacional padrão do Engine.

Consentimento é obtido no momento em que a empresa fornece dado inicial durante o onboarding, e qualquer refinamento adicional obtido através de Aprendizado Contínuo respeita a mesma finalidade já consentida — capturar mais sobre como a empresa opera para adaptar melhor sua experiência, nunca para qualquer propósito não declarado.

A conformidade com a LGPD segue o mesmo padrão já estabelecido nos documentos anteriores, com uma especificidade própria deste Engine: o perfil de uma empresa, embora normalmente composto majoritariamente de dado de negócio e não de dado pessoal individual, pode conter referência indireta a preferência de indivíduos específicos dentro da empresa — capturada pelo Preferences Engine — e essa parcela específica do perfil está sujeita ao mesmo direito de exclusão individual já estabelecido para dado pessoal em geral.

Versionamento, já descrito no Capítulo 7 através do Profile Versioning, é ele mesmo um mecanismo de segurança e de governança — sem versionamento, nenhuma auditoria de "por que a plataforma se comportou desta forma para esta empresa em um momento específico" seria reconstruível.

Auditoria preserva o registro de toda mudança relevante de perfil, incluindo quem — humano ou o próprio Engine, de forma automática — originou cada mudança, alinhado ao mesmo padrão de Auditoria imutável já descrito em `SYSTEM_BLUEPRINT.md`.

Controle de alterações garante que uma correção manual feita por um Owner, conforme o princípio Human Validation, nunca seja silenciosamente revertida por uma inferência automática subsequente — o Profile Validator, descrito no Capítulo 7, é o componente responsável por impedir esse tipo de reversão indevida.

Explicabilidade das adaptações, sustentada pelo Explainability Engine, é tratada nesta seção não apenas como uma funcionalidade de produto, mas como um requisito de segurança e de confiança: uma empresa que não consegue entender por que a plataforma tomou uma decisão de adaptação específica em seu nome tem motivo legítimo para desconfiar de toda a adaptação automática que sustenta a proposta central da plataforma — e por isso este princípio é tratado com o mesmo peso que os demais controles de segurança listados nesta seção.

---

## 18. Escalabilidade

O Business Profile Engine é desenhado para que milhões de perfis evoluam de forma completamente independente entre si, sem que o refinamento contínuo de um perfil específico dependa, em nenhum momento, do estado ou do processamento de qualquer outro perfil.

Essa independência é o que torna a escala horizontal, já descrita em `SYSTEM_BLUEPRINT.md`, diretamente aplicável a este Engine: o processamento de Aprendizado Contínuo para a Empresa A pode ocorrer em uma instância de processamento completamente distinta da que processa a Empresa B, no mesmo instante, sem qualquer coordenação necessária entre as duas, porque nenhum dos componentes internos do Engine — Business Classifier, Business Maturity Engine, Goals Engine e os demais descritos no Capítulo 7 — mantém estado compartilhado entre perfis de empresas diferentes.

O único ponto de agregação entre múltiplos perfis é o refinamento anonimizado e agregado do conhecimento estrutural mantido pelo Segment Engine, mencionado no Capítulo 12 — um processo deliberadamente separado, que opera em lote, de forma assíncrona, e nunca no caminho crítico de resolução de perfil de uma empresa individual, precisamente para que esse processo agregado nunca se torne um gargalo de escala para o restante do Engine.

---

## 19. Observabilidade

A observabilidade do Business Profile Engine segue o mesmo padrão de Logs, Tracing e Metrics já detalhado em `SYSTEM_BLUEPRINT.md`, aplicado às operações específicas deste Engine.

Logs registram toda mudança de estado de perfil, toda recomendação produzida, e toda decisão do Profile Validator, incluindo os casos em que uma inconsistência foi identificada e sinalizada para revisão humana.

Histórico é mantido pelo Profile History, já descrito no Capítulo 7, permitindo reconstruir a trajetória completa de como o entendimento de uma empresa específica evoluiu desde o primeiro dia de onboarding.

Mudanças são registradas com granularidade suficiente para identificar exatamente qual elemento do Modelo de Perfil — Segmento, Objetivo, Capacidade, ou qualquer outro descrito no Capítulo 8 — foi alterado, quando, e por qual origem (humana ou inferência automática).

Recomendações produzidas pelo Recommendation Engine são registradas junto com o resultado — se foram aceitas, ignoradas, ou explicitamente rejeitadas — alimentando um ciclo de melhoria contínua da qualidade das próprias recomendações futuras.

Adaptações efetivamente aplicadas a cada superfície — qual configuração de Menu, Widget, KPI, Template, Relatório ou Automação foi resolvida pelo motor de adaptação para uma empresa específica em um momento específico — são registradas de forma consultável, sustentando diretamente o Explainability Engine.

Métricas agregadas sobre a saúde operacional do próprio Engine — tempo de resolução de configuração, taxa de aceitação de recomendação, frequência de correção manual de classificação automática — alimentam tanto a operação técnica da plataforma quanto a evolução do próprio Segment Engine ao longo do tempo.

---

## 20. Casos de Uso

**Caso 1 — Floricultura em fase inicial.** Uma floricultura recém-cadastrada declara, no onboarding, foco em vendas por encomenda para datas comemorativas. O Business Classifier a associa ao Segmento Floricultura; o Business Maturity Engine, a partir da ausência de canal digital declarado, estima maturidade inicial baixa. O motor de adaptação prioriza um Dashboard simples, com KPI de pedidos por data comemorativa em destaque, e o Feature Advisor recomenda a ativação do Módulo de Communication via WhatsApp, canal tipicamente relevante para esse Segmento. Seis meses depois, o Channel Manager observa a ativação de um canal de e-commerce próprio, e o Goals Engine registra a mudança de Objetivo declarado, de "vender por encomenda" para "expandir vendas recorrentes" — o perfil é revisado, uma nova versão é registrada pelo Profile Versioning, e o motor de adaptação passa a priorizar KPI de recorrência de compra, anteriormente irrelevante.

**Caso 2 — Clínica já madura.** Uma clínica odontológica se cadastra já operando com volume relevante de pacientes e processo estabelecido. O Business Maturity Engine, a partir do volume operacional declarado e do número de colaboradores informado, estima maturidade elevada desde o primeiro dia. O motor de adaptação já prioriza, desde a Configuração Automática inicial, Templates de comunicação mais formais, calibrados pelo Branding Hub em conjunto com o Segmento e a Subsegmento "clínica odontológica", e o Automation Selector prioriza Fluxos de lembrete de retorno periódico sobre Fluxos de oferta promocional, adequados a um Segmento com ciclo de relacionamento longo e comunicação tipicamente mais reservada.

**Caso 3 — Agência administrando múltiplos clientes.** Uma agência se cadastra declarando seu próprio perfil como "Agência" no Segment Engine, e passa a operar múltiplos Tenants-cliente sob uma Organização, conforme já descrito em `SAAS_ARCHITECTURE.md`, Capítulo 21. O Business Profile Engine mantém um perfil próprio e isolado para cada Tenant-cliente administrado pela agência, nunca um único perfil compartilhado entre eles — mesmo quando múltiplos clientes da agência pertencem ao mesmo Segmento, cada um evolui de forma independente, respeitando o princípio Tenant Isolation, enquanto a própria agência, como usuária operacional com acesso consolidado, vê recomendações agregadas de padrão entre seus clientes através do Analytics Hub, não através de um perfil de negócio fundido entre eles.

**Caso 4 — Restaurante evoluindo em automação.** Um restaurante, inicialmente classificado com maturidade digital baixa, começa a demonstrar, através do padrão de uso observado, adoção crescente de reservas online e de comunicação automatizada de confirmação — o Capabilities Engine atualiza sua avaliação de maturidade digital para um nível mais alto, e o Feature Advisor passa a recomendar Automação mais sofisticada de gestão de fila de espera, uma capacidade que não teria sido recomendada com prioridade no perfil inicial, quando a maturidade digital observada ainda era baixa.

**Caso 5 — E-commerce de moda com sazonalidade e maturidade elevada.** Uma marca de moda que já opera loja física e e-commerce próprio se cadastra declarando volume operacional relevante e equipe dedicada a marketing. O Business Classifier a associa ao Segmento Moda, e o Channel Manager identifica dois canais simultâneos — físico e digital. O Business Maturity Engine, a partir da presença de equipe dedicada declarada, estima maturidade elevada desde o início, o que altera a natureza da recomendação produzida pelo Feature Advisor: em vez de sugerir capacidade básica de Growth, como faria para uma empresa de maturidade inicial, o Engine prioriza recomendação de Automação de campanha sazonal mais sofisticada e de Template de forte apelo visual, alinhados ao padrão típico do Segmento já descrito no Capítulo 10, mas calibrados para um nível de complexidade compatível com a maturidade observada, não com o piso mínimo do Segmento.

---

## 21. Roadmap

No curto prazo, a prioridade é o Profile Manager, o Business Classifier e o Segment Engine operando de ponta a ponta para o conjunto inicial de Segmentos descrito no Capítulo 10, com a jornada de construção de perfil do Capítulo 9 funcionando de forma completa, incluindo a etapa de Validação humana.

No médio prazo, a prioridade é o Aprendizado Contínuo descrito no Capítulo 12 operando de forma real sobre uso observado, o Recommendation Engine com suas sete categorias de recomendação já ativas, e a integração plena com Branding e Automação descrita nos Capítulos 14 e 15.

No longo prazo, a prioridade é o Explainability Engine em sua forma mais madura — explicação detalhada e consultável para qualquer adaptação, em qualquer superfície —, o refinamento agregado e anonimizado do Segment Engine a partir de padrão observado entre múltiplas empresas do mesmo Segmento, e a extensão do catálogo de Segmentos reconhecidos muito além dos dez exemplos descritos neste documento, sem exigir alteração de nenhum componente já existente do Engine.

---

## 22. Architecture Decision Records

**ADR-001 — Todo Tenant possui exatamente um Business Profile ativo.** Nenhuma Empresa opera sem um perfil de negócio associado, mesmo que ainda incompleto logo após o cadastro. Contexto: sem essa garantia, nenhuma superfície do motor de adaptação teria uma base mínima de resolução.

**ADR-002 — O perfil nunca altera regra de negócio diretamente.** O Business Profile Engine produz configuração, consumida por lógica genérica de cada Hub — ele nunca contém, ele mesmo, a lógica de cálculo ou de fluxo de nenhum Hub de domínio. Contexto: aplicação direta do princípio Configuration Over Customization e da regra equivalente já estabelecida para Branding em `SAAS_ARCHITECTURE.md`, ADR-003.

**ADR-003 — Toda adaptação deve ser explicável.** Nenhuma adaptação de superfície originada no Business Profile pode ser apresentada sem uma explicação disponível através do Explainability Engine. Contexto: sem explicabilidade, a adaptação automática se torna indistinguível de comportamento arbitrário aos olhos do cliente, corroendo a confiança central à proposta de valor da plataforma.

**ADR-004 — O perfil evolui continuamente e nunca é declarado definitivamente completo.** Nenhum estado de perfil é tratado como final; o Aprendizado Contínuo permanece ativo durante toda a vida útil do Tenant. Contexto: aplicação direta do princípio Continuous Learning.

**ADR-005 — Correção manual de perfil tem prioridade permanente sobre inferência automática divergente.** Uma vez que um Owner corrige explicitamente uma classificação, essa correção não é revertida silenciosamente por uma nova inferência. Contexto: aplicação do princípio Human Validation; alternativa descartada — permitir que a inferência automática sobrescreva a correção manual após um período de tempo, rejeitada por comprometer a confiança do cliente na estabilidade de suas próprias decisões.

**ADR-006 — Cada elemento do Modelo de Perfil evolui de forma independente.** Uma mudança em Objetivos não exige recalcular Segmento, Maturidade ou Capacidades do zero. Contexto: aplicação do princípio Composable Profile, essencial para a escalabilidade descrita no Capítulo 18.

**ADR-007 — Nenhum Segmento é implementado como versão de código separada.** Todo Segmento, incluindo qualquer um adicionado no futuro, é uma configuração mantida pelo Segment Engine, consumida da mesma forma pelo Adaptive Rules Engine. Contexto: garantir que a extensibilidade de catálogo de Segmentos, descrita no Capítulo 10, nunca exija alteração de componente já existente.

**ADR-008 — O perfil de uma empresa nunca influencia o perfil de outra de forma identificável.** Aprendizado agregado entre empresas do mesmo Segmento acontece exclusivamente de forma anonimizada, em processo separado do caminho crítico de resolução individual. Contexto: aplicação do princípio Tenant Isolation, alinhado à mesma regra já estabelecida para memória de IA em `AI_HUB.md`.

**ADR-009 — Toda mudança relevante de perfil é versionada.** Nenhuma atualização de perfil sobrescreve o estado anterior sem preservar a versão prévia, através do Profile Versioning. Contexto: sem essa garantia, nenhuma investigação de "por que a plataforma se comportou assim para esta empresa em um momento passado" seria possível.

**ADR-010 — O Business Profile Engine nunca gera nem armazena identidade visual.** Toda responsabilidade de Branding pertence exclusivamente ao Branding Hub; este Engine apenas fornece o contexto de Segmento e Maturidade que o Branding Hub consome. Contexto: preservar o limite de responsabilidade descrito no Capítulo 14, evitando duplicação de lógica de identidade em dois lugares diferentes da plataforma.

**ADR-011 — Recomendações nunca são aplicadas automaticamente sem alguma forma de confirmação.** Toda recomendação de Módulo, KPI, Automação, Integração, prática, conteúdo ou treinamento exige, no mínimo, uma ação explícita de aceite. Contexto: aplicação do princípio Human Validation à camada de recomendação especificamente, complementando o ADR-005, que trata de correção de classificação.

---

## 23. Glossário

**Business Profile** — entendimento estruturado e vivo de uma Empresa, mantido pelo Business Profile Engine, composto pelos elementos descritos no Capítulo 8.

**Segmento** — categoria principal de negócio de uma Empresa, mantida pelo Business Classifier e pelo Segment Engine.

**Subsegmento** — especialização mais precisa dentro de um Segmento.

**Maturidade Digital** — estágio de sofisticação da operação digital de uma Empresa, mantido pelo Business Maturity Engine, independente do Segmento.

**Capacidades** — o que uma Empresa é efetivamente capaz de operar hoje, mantido pelo Capabilities Engine.

**Objetivos** — o que uma Empresa declara querer alcançar, mantido pelo Goals Engine, revisável ao longo do tempo.

**Composable Profile** — princípio segundo o qual cada elemento do Modelo de Perfil evolui de forma independente dos demais.

**Adaptive Rules Engine** — componente que resolve, para cada superfície de experiência, qual configuração se aplica a uma combinação específica de perfil.

**Configuration Generator** — componente que produz a configuração final consumida pelas superfícies da plataforma, nunca código específico de Empresa.

**Explainability Engine** — componente que produz explicação em linguagem de negócio para qualquer adaptação originada no perfil.

**Profile Versioning** — mecanismo que preserva o estado histórico do perfil de uma Empresa ao longo do tempo.

**Human Validation** — princípio segundo o qual toda classificação e recomendação automática permanece sujeita a confirmação ou correção humana.

**Recommendation Engine** — componente que produz as sete categorias de recomendação descritas no Capítulo 16.

**Feature Advisor** — componente que recomenda Módulos e capacidades ainda não ativados.

**Configuration Advisor** — componente que recomenda ajuste de configuração dentro de Módulos já ativos.

**Tenant Isolation** — garantia de que o perfil de uma Empresa nunca influencia, de forma identificável, o perfil de outra.

**Continuous Learning** — princípio segundo o qual o perfil nunca é considerado definitivamente completo.

**Adaptive Experience** — comportamento geral de personalização automática da plataforma, já definido em `PLATFORM_MANIFESTO.md`, sustentado tecnicamente pelo Business Profile Engine.

---

## 24. Conclusão

O Business Profile Engine transforma uma plataforma que, de outra forma, seria genérica, em uma plataforma verdadeiramente adaptativa. Sem ele, cada Hub — CRM, Growth, Automation, Communication, Branding, e o próprio AI Hub — operaria sobre um denominador comum, incapaz de distinguir uma floricultura de um escritório de advocacia além do que cada usuário configurasse manualmente. Com ele, cada um desses Hubs recebe, de forma contínua e sem exigir intervenção manual, o entendimento de negócio necessário para se expressar de forma específica e relevante a cada Empresa.

É sobre esse entendimento — construído no onboarding, validado por humano, refinado continuamente pelo uso real, versionado, e sempre explicável — que a inteligência artificial do AI Hub, a identidade do Branding Hub, as automações do Automation Hub, os dashboards do Analytics Hub e as recomendações descritas neste documento constroem experiências verdadeiramente personalizadas. O Business Profile Engine não substitui nenhum desses Hubs, e não decide por eles — ele é a base de entendimento comum sobre a qual cada um constrói sua própria forma de se adaptar.

Junto com `PLATFORM_MANIFESTO.md`, `AI_HUB.md`, `SYSTEM_BLUEPRINT.md` e `SAAS_ARCHITECTURE.md`, este documento completa o conjunto de referência arquitetural que explica não apenas o que a Adaptive Business Platform faz, mas como ela conhece, de verdade, cada empresa que a utiliza — e é esse conhecimento, mais do que qualquer funcionalidade isolada, que sustenta a promessa central registrada no primeiro documento desta série: a tecnologia deve se adaptar ao negócio, e não o negócio à tecnologia.
