# Context Framework

**Adaptive Business Platform · AI Handbook · Documento Técnico Oficial**

---

## 1. Introdução

Este documento é a autoridade máxima, oficial e definitiva sobre o gerenciamento de Contexto da Adaptive Business Platform. Ele não substitui nenhum documento já publicado — não redefine a filosofia já estabelecida em `AI_MANIFESTO.md`, não redefine a topologia de doze camadas já estabelecida em `AI_ARCHITECTURE.md`, não redefine a coordenação já detalhada em `AI_ORCHESTRATOR.md`, e não redefine o framework de Agente já estabelecido em `AGENT_FRAMEWORK.md`. O que este documento adiciona é o detalhamento completo de um sistema já mencionado, em nível conceitual, por todos os quatro documentos anteriores — o Contexto — elevando-o à condição de sistema arquitetural próprio, aqui denominado Context Operating System, ou Context OS.

O propósito deste documento é garantir que todo Contexto consumido por qualquer componente da camada de Inteligência Artificial desta plataforma — o AI Orchestrator, através de seu Context Builder já introduzido em `AI_ORCHESTRATOR.md`, Capítulo 5, e todo Agente, através de seu componente de Context já introduzido em `AGENT_FRAMEWORK.md`, Capítulo 6 — seja construído, validado, enriquecido, distribuído, priorizado, reduzido e observado através de um único sistema governado, nunca através de coleta de informação ad hoc e não disciplinada por cada componente individualmente.

A missão deste documento é elevar o Contexto de um conceito auxiliar, já mencionado lateralmente em cada documento anterior desta série, a um ativo arquitetural de primeira classe e plenamente governado — com sua própria filosofia, sua própria estrutura em camadas, seu próprio modelo de qualidade, seu próprio ciclo de vida completo, e sua própria disciplina formal de Ownership, exatamente como qualquer Entidade de negócio já recebe em cada Blueprint do Architecture Handbook.

O escopo deste documento é estritamente o Context OS — sua arquitetura, seus componentes conceituais, e as regras que governam a construção e a distribuição de todo Contexto. Este documento não define nenhuma tecnologia de armazenamento, nenhum modelo de inteligência artificial, e nenhum formato técnico específico de representação de Contexto — essas decisões pertencem à camada de implementação, inteiramente fora do escopo deste framework.

A relação com `AI_MANIFESTO.md` permanece hierárquica e absoluta — o Context OS aqui descrito é a materialização técnica direta dos princípios Context Before Reasoning e Data Minimization by Design já fixados naquele manifesto, Capítulo 3, aplicados agora com o rigor de um sistema arquitetural completo, não apenas de uma diretriz filosófica isolada.

A relação com `AI_ARCHITECTURE.md` é igualmente hierárquica — este documento nunca reposiciona o Contexto dentro da topologia de doze camadas já estabelecida; ele detalha exclusivamente o mecanismo já introduzido naquele documento, Capítulo 12, através das etapas de Construção, Redução, Enriquecimento, Propagação e Expiração, agora elevadas a um sistema completo com governança própria.

A relação com `AI_ORCHESTRATOR.md` é operacional e direta — o Context Builder, já detalhado como um dos nove componentes internos do Orchestrator, é aqui reconhecido como a interface de consumo formal do Context OS mais amplo descrito neste documento, nunca uma implementação paralela e potencialmente divergente do mesmo conceito arquitetural.

A relação com `AGENT_FRAMEWORK.md` é igualmente direta — o Context Access já exigido como um dos dezessete elementos do Agent Contract, e o componente interno de Context já detalhado naquele documento, Capítulo 6, são ambos consumidores diretos e disciplinados do Context OS aqui descrito, respeitando integralmente toda regra de Isolamento, de Qualidade e de Distribuição já estabelecida por este framework.

A necessidade de um quinto documento dedicado exclusivamente ao Contexto, publicado depois da filosofia, da estrutura, da coordenação e da unidade fundamental de raciocínio já estabelecidas pelos quatro documentos anteriores, decorre de uma observação estrutural direta: o Contexto é o único insumo que atravessa absolutamente todo componente já especificado nesta série — o Intent Analyzer, o Context Builder e o Memory Manager do Orchestrator já dependem dele; todo Agente já construído sob `AGENT_FRAMEWORK.md` depende dele através de seu Context Access; e toda futura Skill, Ferramenta ou capacidade de Planejamento dependerá dele igualmente. Nenhum outro conceito desta série ocupa posição de dependência tão universal, o que justifica que ele receba, isoladamente, o mesmo nível de detalhamento e de governança já aplicado a qualquer domínio de negócio completo no Architecture Handbook.

Um segundo motivo para a existência deste documento é a necessidade de prevenir exatamente o risco já identificado na Visão que abre este framework — sem uma disciplina arquitetural explícita, o Contexto tende a ser tratado, em sistemas de Inteligência Artificial menos maduros, como um conceito informal e não governado: um texto qualquer concatenado antes de uma chamada de raciocínio, sem qualidade mensurável, sem rastreabilidade, e sem respeito a Ownership. Este documento existe precisamente para elevar o Contexto acima dessa informalidade, tratando-o como um sistema com a mesma disciplina arquitetural já demonstrada, ao longo de toda esta série, para Evento, para Command e para Query.

---

## 2. O que é Contexto

Contexto é a informação relevante, já selecionada, estruturada e qualificada, que fundamenta o raciocínio de um componente de Inteligência Artificial em um momento específico — nunca um conceito difuso ou indefinido, mas um ativo arquitetural com propriedade, com qualidade mensurável, e com ciclo de vida formal, detalhado ao longo deste documento.

Contexto não é texto — texto é apenas uma possível forma de representação superficial de um Contexto já construído; o Contexto em si é a estrutura de informação relevante, independente da forma final em que é apresentada a um Reasoning Engine.

Contexto não é Prompt — um Prompt, no sentido técnico mais restrito, é a instrução específica formulada para uma solicitação de raciocínio; o Contexto é a informação de fundo que sustenta essa instrução, mas nunca se confunde com ela.

Contexto não é Memória — Memória, já detalhada em `AI_ARCHITECTURE.md`, Capítulo 11, e em `AI_ORCHESTRATOR.md`, Capítulo 10, é a categoria de informação preservada além do escopo de uma única solicitação; Contexto é a seleção específica e momentânea de informação relevante a uma solicitação particular, que pode incluir Memória já recuperada, mas nunca se limita a ela.

Contexto não é Conhecimento — Conhecimento, administrado exclusivamente pelo Knowledge Hub conforme já fixado em `KNOWLEDGE_HUB.md`, é o corpo documental indexado e consultável da plataforma; Contexto é a seleção específica de Conhecimento relevante a uma solicitação particular, nunca o corpo documental completo em si.

Contexto não é Estado — Estado, já definido em `DOMAIN_OWNERSHIP_MATRIX.md`, é a verdade de negócio persistida por um Business Hub proprietário; Contexto é a leitura momentânea desse Estado, já materializada através de Read Model, consumida para fundamentar raciocínio, mas nunca uma cópia paralela desse Estado.

Contexto não é Dado — Dado é a unidade bruta e não qualificada de informação; Contexto é Dado já selecionado, qualificado e estruturado especificamente para sustentar um raciocínio, nunca um conjunto arbitrário e indiferenciado de informação disponível.

Contexto não é Informação genérica — Informação é qualquer conteúdo comunicável; Contexto é Informação já submetida a todo o ciclo de qualidade, de priorização e de governança descrito neste documento, nunca qualquer Informação bruta consumida sem essa disciplina.

```
                    CONTEXTO E OS CONCEITOS VIZINHOS
   ┌───────────────────────────────────────────────────────────┐
   │  Dado ──► Informação ──► Contexto (selecionado, qualificado,       │
   │                          estruturado e governado)                     │
   │                                                                │
   │  Memória, Conhecimento e Estado são fontes possíveis de              │
   │  Contexto, nunca sinônimos dele                                          │
   │                                                                │
   │  Prompt é a instrução formulada; Contexto é a informação de                  │
   │  fundo que a sustenta                                                              │
   └───────────────────────────────────────────────────────────┘
```

Contexto é um ativo arquitetural governado porque, sem essa governança, a plataforma correria exatamente o risco já identificado em `AI_MANIFESTO.md`, Capítulo 3 — um raciocínio fundamentado em informação não qualificada, não rastreável e potencialmente excessiva, comprometendo tanto a Explicabilidade quanto a Segurança já exigidas transversalmente por toda esta série. Tratar Contexto como um sistema arquitetural próprio, com o mesmo rigor já aplicado a uma Entidade de negócio em qualquer Blueprint do Architecture Handbook, é a decisão estrutural central que este documento formaliza.

Um teste prático para verificar se uma informação específica se qualifica como Contexto, aplicável a qualquer futura decisão de engenharia sobre este framework, decorre diretamente desta distinção: uma informação é Contexto apenas quando já passou pela disciplina completa de Validação, de Scoring e de Priorização descrita nos Capítulos 8, 9 e 10 deste documento; uma informação que ainda não passou por essa disciplina permanece, até então, apenas um Dado candidato — nunca tratado como Contexto legítimo enquanto essa qualificação não for concluída. Este teste evita que qualquer implementação futura relaxe, por conveniência de desempenho, a disciplina que distingue um Contexto governado de uma simples concatenação de informação bruta.

---

## 3. Filosofia

**Context Before Memory.** Toda construção de Contexto para uma solicitação específica precede a consulta de Memória de longo prazo, que a complementa, nunca a substitui.

**Context Before Reasoning.** Nenhum raciocínio de nenhum componente de Inteligência Artificial é aplicado antes que o Contexto relevante já tenha sido construído, aplicação direta de `AI_MANIFESTO.md`, Capítulo 3.

**Context is Dynamic.** Todo Contexto é reconstruído a cada nova solicitação, nunca reutilizado indefinidamente de uma solicitação anterior sem verificação de sua atualidade.

**Context is Governed.** Toda construção, distribuição e expiração de Contexto respeita as regras formais já estabelecidas por este framework, nunca uma decisão ad hoc de um componente individual.

**Context is Observable.** Toda decisão de construção de Contexto produz sinal observável suficiente para reconstrução posterior, detalhado no Capítulo 18.

**Context has Ownership.** Todo Contexto deriva de uma fonte com proprietário explícito, já detalhado no Capítulo 14, nunca uma fonte anônima ou não rastreável.

**Context has Lifecycle.** Todo Contexto percorre um ciclo de vida formal de treze etapas, detalhado no Capítulo 15, da Criação ao Arquivamento.

**Context is Layered.** Todo Contexto é organizado em camadas hierárquicas, de escopo global a escopo de execução específica, detalhado no Capítulo 5.

**Context is Explainable.** Toda inclusão de informação em um Contexto construído é justificável, rastreável até sua fonte de origem.

**Quality Before Quantity.** Um Contexto pequeno e altamente qualificado é sempre preferível a um Contexto grande e de qualidade inconsistente.

**Relevance Before Volume.** A inclusão de informação em um Contexto é decidida por sua relevância à solicitação em curso, nunca pela mera disponibilidade dessa informação.

**Freshness Before History.** Informação recente e atual é priorizada sobre informação histórica, salvo quando a natureza da solicitação exige explicitamente análise de tendência de longo prazo.

**Policies Before Distribution.** Nenhum Contexto é distribuído a um Agente ou a um componente antes que as políticas de Isolamento e de Permission já aplicáveis tenham sido verificadas.

**Context is Never Arbitrary.** Nenhuma informação é incluída ou excluída de um Contexto sem critério explícito e documentado.

**Single Construction Point.** Todo Contexto desta plataforma é construído através do Context OS, nunca através de coleta paralela e não governada por um componente individual.

**Bounded Scope.** Todo Contexto é delimitado ao escopo estrito da solicitação que o originou, nunca expandido além do necessário.

**Traceable Origin.** Toda porção de um Contexto construído é rastreável até a fonte específica que a produziu.

**Confidence is Explicit.** Todo Contexto expõe, quando aplicável, o grau de confiança da informação que o compõe, nunca uma apresentação uniforme que oculte incerteza real.

**Tenant Isolation is Absolute.** Nenhum Contexto de uma Empresa é acessível, nem incidentalmente, à construção de Contexto de outra Empresa.

**Expiration is Mandatory.** Todo Contexto possui um momento de expiração já determinado, nunca uma existência indefinida sem revisão de sua atualidade.

**Compression Preserves Meaning.** Toda redução de volume de um Contexto preserva seu significado essencial, nunca sacrificando informação crítica em nome de economia de espaço.

**Distribution is Scoped.** Todo Contexto distribuído a um Agente é delimitado exatamente ao escopo de sua Responsibility já declarada em `AGENT_FRAMEWORK.md`.

**Sensitivity is Respected.** Informação sensível dentro de um Contexto é tratada com controle de acesso proporcional à sua classificação de sensibilidade, nunca uniformemente exposta.

**Business Value Guides Priority.** A priorização de informação dentro de um Contexto reflete seu valor real para a solicitação de negócio em curso, nunca uma ordenação arbitrária.

**No Duplicate Sources.** A mesma informação, quando disponível por mais de uma fonte, é consolidada uma única vez dentro de um Contexto construído, nunca repetida de forma redundante.

**Evolution is Continuous.** Todo Contexto está sujeito a evolução ao longo do tempo, conforme detalhado no Capítulo 16, nunca tratado como uma fotografia estática e permanente.

**Versioning is Explicit.** Mudança relevante na estrutura de um tipo de Contexto é versionada, permitindo rastreabilidade de qual versão produziu qual raciocínio.

**Ownership Never Shifts Silently.** A atribuição de qual fonte é proprietária de qual categoria de Contexto nunca muda sem registro formal, mesma disciplina já exigida em `DOMAIN_OWNERSHIP_MATRIX.md`.

**Budget is Finite.** Todo Contexto opera sob um orçamento finito de capacidade, detalhado no Capítulo 11, exigindo priorização disciplinada, nunca inclusão irrestrita de toda informação disponível.

**Reduction is a First-Class Operation.** A redução de um Contexto é uma operação arquitetural deliberada e observável, nunca um efeito colateral acidental de limitação técnica.

**No Silent Loss.** Toda perda de informação durante Compressão é explicitamente reconhecida e, quando relevante, comunicada, nunca oculta silenciosamente.

**Context Serves Reasoning, Never Replaces It.** O Contexto fundamenta o raciocínio de um Agente ou do Orchestrator, mas nunca substitui esse raciocínio por uma conclusão já embutida na própria construção do Contexto.

**Human Data Deserves Extra Care.** Contexto que envolva dado pessoal de um indivíduo específico recebe tratamento de sensibilidade e de minimização redobrado, aplicação direta de Privacy by Design já central a `SAAS_ARCHITECTURE.md`.

**Provider Agnostic Representation.** A estrutura conceitual de um Contexto nunca depende de formato específico exigido por um único modelo de inteligência artificial.

**Auditability Above Convenience.** Nenhuma otimização de construção de Contexto compromete sua Auditabilidade, mesmo quando essa otimização produziria ganho real de desempenho.

**Governance Before Autonomy.** Nenhuma automação de construção ou de distribuição de Contexto opera com autonomia além do que já foi formalmente concedido por este framework.

Estes trinta e cinco princípios se organizam em torno de uma progressão que estrutura o próprio Context Operating System detalhado no capítulo seguinte — da construção disciplinada à distribuição governada, sempre sob observabilidade completa.

Um agrupamento útil destes trinta e cinco princípios distingue quatro categorias complementares, análogas às já identificadas em `AI_ORCHESTRATOR.md`, Capítulo 3, e em `AGENT_FRAMEWORK.md`, Capítulo 4, mas aqui aplicadas especificamente ao Contexto. Uma primeira categoria — Context Before Memory, Context Before Reasoning, Context is Dynamic, Single Construction Point — trata da posição temporal e estrutural do Contexto dentro do fluxo geral de processamento, sempre precedendo qualquer raciocínio. Uma segunda categoria — Quality Before Quantity, Relevance Before Volume, Freshness Before History, Context is Never Arbitrary — estabelece o critério de qualidade que orienta toda decisão de inclusão ou de exclusão de informação. Uma terceira categoria — Context has Ownership, Tenant Isolation is Absolute, Policies Before Distribution, Sensitivity is Respected — reafirma, no contexto específico de gerenciamento de informação, a mesma disciplina de governança e de segurança já central a toda esta plataforma. E uma quarta categoria — Context is Observable, Traceable Origin, Auditability Above Convenience, No Silent Loss — garante que todo Contexto permaneça investigável e confiável, mesmo quando processado em volume elevado e sob pressão de desempenho.

Nenhuma destas quatro categorias pode ser sacrificada em favor de outra — um Context OS que aplique perfeitamente a disciplina de qualidade, mas falhe em preservar rastreabilidade completa, comprometeria a Auditabilidade já exigida como objetivo central em `AI_ARCHITECTURE.md`, Capítulo 2, mesmo operando de forma tecnicamente correta em todos os demais aspectos já descritos por este framework, exatamente como já demonstrado pelo mesmo raciocínio aplicado individualmente a cada um dos quatro documentos anteriores desta série do AI Handbook.

---

## 4. Context Operating System

```
                                Context OS
                                    │
                ┌───────────────────┼────────────────────┐
                ▼                    ▼                    ▼
          Context Sources      Context Builder      Context Policies
                │                    │                    │
                └───────────────────┼────────────────────┘
                                    ▼
                          Context Validation
                                    ▼
                         Context Normalization
                                    ▼
                            Context Scoring
                                    ▼
                          Context Prioritization
                                    ▼
                            Context Budget
                                    ▼
                         Context Distribution
                                    ▼
                           Context Evolution
                                    ▼
                        Context Observability
```

Context Sources, já detalhadas no Capítulo 6, são a origem primária de toda informação potencialmente relevante — Business Hubs, Knowledge Hub, Identity, e demais módulos já catalogados pelo Architecture Handbook.

Context Builder, já introduzido como componente do Orchestrator em `AI_ORCHESTRATOR.md`, Capítulo 5, é aqui reconhecido como a interface funcional que efetivamente invoca o Context OS para produzir um Contexto consumível.

Context Policies são o conjunto de regras de Isolamento, de Permission e de Sensibilidade que governam quais fontes podem contribuir a um Contexto específico, e sob qual condição.

Context Validation, detalhada no Capítulo 8, verifica a consistência, a integridade e a confiabilidade de toda informação já reunida antes de sua incorporação formal ao Contexto em construção.

Context Normalization padroniza a estrutura de informação já validada, garantindo que dado de origens distintas — um Read Model, um Documento indexado, um Evento consolidado — seja representado de forma consistente dentro do mesmo Contexto.

Context Scoring, detalhado no Capítulo 10, atribui pontuação a cada porção de informação já normalizada, com base nos atributos de qualidade já detalhados no Capítulo 9.

Context Prioritization ordena a informação já pontuada, determinando qual porção recebe destaque e qual porção é candidata a redução, quando o volume total exceder o Context Budget disponível.

Context Budget, detalhado no Capítulo 11, é o limite finito de capacidade dentro do qual o Contexto final deve ser construído, exigindo decisão disciplinada de priorização.

Context Distribution, detalhada no Capítulo 13, entrega o Contexto já finalizado a cada Agente ou componente que dele necessita, sempre respeitando o escopo de Permission e de Responsibility já aplicável.

Context Evolution, detalhada no Capítulo 16, administra como o Contexto de uma solicitação em andamento se ajusta à medida que nova informação relevante surge durante o próprio processamento.

Context Observability, detalhada no Capítulo 18, garante que toda etapa deste sistema produza sinal rastreável, sustentando investigação completa de qualquer Contexto já construído no passado.

```
              RELAÇÃO ENTRE O CONTEXT OS E O ORCHESTRATOR
   ┌───────────────────────────────────────────────────────────┐
   │  AI Orchestrator (AI_ORCHESTRATOR.md)                           │
   │       │                                                        │
   │       ▼                                                        │
   │  Context Builder (componente interno do Orchestrator)              │
   │       │                                                        │
   │       ▼                                                        │
   │  Context Operating System (este documento)                                │
   │       │                                                        │
   │       ▼                                                        │
   │  Contexto construído, validado, priorizado e distribuído                        │
   │       │                                                        │
   │       ▼                                                        │
   │  Reasoning Engine de cada Agente (AGENT_FRAMEWORK.md)                                │
   └───────────────────────────────────────────────────────────┘
```

O Context Builder, portanto, nunca implementa sua própria lógica paralela de construção de Contexto — ele invoca o Context OS aqui descrito como sua implementação de referência, garantindo que todo Contexto consumido por qualquer Agente, independentemente de qual subtarefa o originou, atravesse exatamente a mesma disciplina de qualidade e de governança.

Uma propriedade estrutural relevante deste diagrama, análoga à já observada entre os componentes do Orchestrator em `AI_ORCHESTRATOR.md`, Capítulo 4, é a assimetria de frequência de invocação entre os nove blocos funcionais do Context OS. Context Sources, Context Builder e Context Validation são invocados em toda construção de Contexto, sem exceção; Context Compression é invocado apenas quando o volume de informação já pontuada excede o Context Budget disponível, sendo dispensável para uma solicitação suficientemente simples cujo volume de informação relevante já caiba integralmente dentro do orçamento; e Context Evolution é invocado apenas quando o processamento de uma solicitação se estende por tempo suficiente para que nova informação relevante surja durante seu próprio curso. Esta assimetria não reduz a obrigatoriedade estrutural de nenhum dos nove blocos — cada um permanece parte integral e sempre disponível do Context OS, apenas não ativado quando sua função específica não é exigida por uma construção de Contexto particular.

---

## 5. Context Layers

```
   Global Context
      │
      ▼
   Organization Context
      │
      ▼
   Business Context
      │
      ▼
   Tenant Context
      │
      ▼
   User Context
      │
      ▼
   Session Context
      │
      ▼
   Conversation Context
      │
      ▼
   Task Context
      │
      ▼
   Execution Context
```

Global Context é a camada mais ampla, contendo informação aplicável a toda a plataforma independentemente de Empresa, Usuário ou solicitação específica — por exemplo, a versão vigente de um Design Principle já fixado em `AI_ARCHITECTURE.md`.

Organization Context contém informação relativa a um agrupamento administrativo de Tenants, quando aplicável, conforme já definido em `SAAS_ARCHITECTURE.md`, ADR-008.

Business Context contém informação relativa ao domínio de negócio em geral, independente de Empresa específica — por exemplo, a estrutura conceitual de uma Capability já catalogada em `AI_ARCHITECTURE.md`, Capítulo 6.

Tenant Context contém informação específica de uma Empresa cliente — seu Business Profile, sua Configuration, seu Branding, sempre isolado de forma absoluta em relação a qualquer outra Empresa.

User Context contém informação específica do Usuário que originou a solicitação — sua Permission, seu Perfil, suas preferências já expressas anteriormente.

Session Context contém informação relativa à sessão ativa em curso, incluindo autenticação já verificada e histórico recente de interação dentro daquela sessão específica.

Conversation Context contém informação relativa a uma interação contínua específica com a camada de Inteligência Artificial, preservando continuidade entre múltiplas solicitações relacionadas dentro da mesma troca.

Task Context contém informação relativa ao objetivo específico já identificado pelo Intent Analyzer do Orchestrator, conforme já detalhado em `AI_ORCHESTRATOR.md`, Capítulo 5.

Execution Context é a camada mais estreita e específica, contendo informação relevante apenas à subtarefa individual já delegada a um Agente específico, no momento exato de sua execução.

```
              PROPRIEDADE E EXEMPLO POR CAMADA
   ┌───────────────────────────────────────────────────────────┐
   │  Camada                 Escopo              Exemplo               │
   │  Global                  toda a plataforma    Design Principle          │
   │  Organization             agrupamento de       hierarquia                    │
   │                          Tenants              administrativa                     │
   │  Business                 domínio de negócio    estrutura de Capability                │
   │  Tenant                    uma Empresa            Business Profile                          │
   │  User                       um Usuário             Permission, preferência                       │
   │  Session                     sessão ativa           autenticação corrente                            │
   │  Conversation                  interação contínua      histórico de troca recente                          │
   │  Task                            objetivo identificado   intenção da solicitação                                 │
   │  Execution                        subtarefa específica     dado necessário a uma                                     │
   │                                                          Skill específica                                              │
   └───────────────────────────────────────────────────────────┘
```

Cada camada mais estreita herda, por composição, toda informação relevante já disponível nas camadas mais amplas que a precedem — o Execution Context de uma subtarefa específica tem acesso, quando relevante, a informação já disponível no Task Context, no Conversation Context, e assim sucessivamente até o Global Context, sempre filtrada pela Prioritization e pelo Budget já aplicáveis, nunca uma herança irrestrita de todo o volume das camadas superiores.

Um esclarecimento adicional relevante a esta arquitetura de camadas diz respeito à relação entre Tenant Context e o restante das camadas mais estreitas — toda camada situada abaixo do Tenant Context nesta hierarquia herda, implicitamente, o isolamento absoluto já estabelecido naquela camada. Um User Context, um Session Context, um Conversation Context, um Task Context e um Execution Context, todos associados a uma mesma Empresa, nunca cruzam essa fronteira de isolamento em direção a outra Empresa, mesmo quando a solicitação em curso envolve múltiplos Usuários daquela mesma Empresa colaborando através de sessões distintas. Esta propriedade de herança de isolamento é a razão estrutural pela qual o Tenant Context ocupa uma posição intermediária tão central nesta hierarquia — ele é o ponto exato em que o escopo de informação deixa de ser compartilhável entre diferentes Empresas e passa a ser exclusivo de uma única Empresa cliente.

Uma segunda observação relevante é que nem toda solicitação processada por esta plataforma ativa todas as nove camadas simultaneamente — uma solicitação simples e isolada, sem histórico de Conversation relevante, pode dispensar por completo o Conversation Context, operando diretamente entre o Task Context e o Execution Context. A arquitetura de camadas aqui descrita define a hierarquia máxima possível, nunca uma exigência de que toda solicitação percorra obrigatoriamente as nove camadas por completo.

---

## 6. Context Sources

Business Hubs — CRM, Communication, Finance, Growth, Analytics — são a origem primária de todo Contexto relativo a Entidade de negócio, sempre consumida através de Query já catalogada em `QUERY_CATALOG.md`, nunca por acesso direto à estrutura interna de cada Hub.

Knowledge Hub é a origem de todo Contexto derivado de conteúdo documental já indexado, consumido através de Retrieval já detalhado em `KNOWLEDGE_HUB.md`.

Identity é a origem de todo Contexto relativo a Permission, a Perfil e a Sessão do Usuário que originou a solicitação, consumida através do Identity Hub já detalhado em `IDENTITY_HUB.md`.

Analytics é a origem de todo Contexto relativo a indicador consolidado, a Trend e a Forecast, consumida através de Query já catalogada especificamente pelo Analytics Hub.

Communication é a origem de todo Contexto relativo a histórico de interação de comunicação já registrado, quando relevante à solicitação em curso.

Automation é a origem de todo Contexto relativo a Workflow já em execução ou já concluído, quando relevante ao raciocínio de um Agente que apoie decisão de automação.

Policies são a origem de todo Contexto relativo a Regra de negócio já documentada em qualquer Blueprint do Architecture Handbook, consumida para sustentar a Validação já exigida pelo Reasoning Engine de todo Agente, conforme `AGENT_FRAMEWORK.md`, Capítulo 11.

Events são a origem de todo Contexto derivado de fato de negócio já publicado e catalogado em `EVENT_CATALOG.md`, consolidado em Read Model antes de sua incorporação a um Contexto.

Queries são o mecanismo formal através do qual toda informação de Business Hub, de Analytics ou de qualquer outro módulo do Architecture Handbook é efetivamente obtida, nunca uma leitura direta e não mediada.

External Systems são a origem de Contexto derivado de sistema externo, sempre mediada exclusivamente pelo Integration Hub, conforme já fixado em `INTEGRATION_HUB.md`, ADR-001, nunca uma comunicação direta entre o Context OS e um sistema fora da plataforma.

```
              ORIGENS DE CONTEXTO (visão consolidada)
   ┌───────────────────────────────────────────────────────────┐
   │  Business Hubs   → Entidade de negócio via Query                │
   │  Knowledge Hub    → Conteúdo documental via Retrieval               │
   │  Identity          → Permission, Perfil, Sessão                         │
   │  Analytics           → Indicador, Trend, Forecast                            │
   │  Communication        → Histórico de comunicação                                   │
   │  Automation            → Estado de Workflow                                           │
   │  Policies                → Regra de negócio documentada                                    │
   │  Events                    → Fato de negócio já consolidado em Read Model                        │
   │  Queries                    → Mecanismo formal de obtenção de toda informação                        │
   │  External Systems             → Mediado exclusivamente pelo Integration Hub                             │
   └───────────────────────────────────────────────────────────┘
```

Nenhuma destas dez fontes é acessada diretamente pelo Context Builder sem passar pela camada de Query, de Retrieval ou de Integration já apropriada — o Context OS nunca introduz um canal de acesso paralelo que contorne a arquitetura de domínio já consolidada pelo Architecture Handbook.

Uma consideração adicional relevante a este capítulo é a distinção entre uma Context Source primária e uma Context Source derivada — Business Hubs, Knowledge Hub e Identity são fontes primárias, no sentido de que produzem diretamente a informação de negócio original; Analytics é uma fonte derivada, no sentido de que consolida e reprocessa informação já originada por múltiplas fontes primárias em um indicador de nível superior. Esta distinção é relevante para a atribuição de Ownership já detalhada no Capítulo 14 — uma informação derivada do Analytics Hub permanece atribuída a esse Hub como proprietário do indicador consolidado, mesmo que a informação bruta subjacente tenha se originado, em última instância, de um Business Hub operacional distinto, respeitando o mesmo princípio já fixado em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 4, de que o Analytics Hub nunca assume Ownership sobre o dado operacional de origem, apenas sobre o indicador que dele deriva.

---

## 7. Context Builder

Criação, no âmbito do Context Builder, é o momento em que uma nova construção de Contexto é iniciada, a partir da intenção já identificada pelo Intent Analyzer e do escopo já delimitado pela subtarefa em questão.

Enriquecimento é o processo pelo qual o Context Builder identifica, durante a própria construção, informação adicional relevante que complementa a solicitação inicial — por exemplo, ao identificar que uma solicitação sobre um Cliente também se beneficia de indicador consolidado do Analytics Hub, mesmo que essa origem não tivesse sido explicitamente solicitada, conforme já exemplificado em `AI_ARCHITECTURE.md`, Capítulo 12.

Redução é o processo complementar de eliminar do Contexto em construção toda informação irrelevante, redundante ou de baixa prioridade, aplicando o Context Scoring e a Context Prioritization já detalhados nos Capítulos 9 e 10.

Preparação é a etapa final do Context Builder, na qual o Contexto já enriquecido e já reduzido é normalizado em uma estrutura consistente, pronta para Context Distribution.

```
              CICLO INTERNO DO CONTEXT BUILDER
   ┌───────────────────────────────────────────────────────────┐
   │  Criação (a partir da intenção e do escopo identificados)          │
   │       ▼                                                        │
   │  Enriquecimento (identificação de informação adicional                 │
   │  relevante)                                                              │
   │       ▼                                                        │
   │  Redução (eliminação de informação irrelevante ou redundante)                 │
   │       ▼                                                        │
   │  Preparação (normalização final antes da Distribution)                             │
   └───────────────────────────────────────────────────────────┘
```

---

## 8. Context Validation

Validação verifica que toda informação incorporada a um Contexto em construção é tecnicamente correta e provém de uma Context Source já reconhecida no Capítulo 6, nunca de uma origem não catalogada ou não confiável.

Consistência verifica que informação de múltiplas origens, quando combinada dentro do mesmo Contexto, não produz contradição não resolvida — quando uma contradição real é identificada, ela é sinalizada explicitamente, nunca silenciosamente ignorada.

Ownership verifica que toda informação incluída respeita a atribuição de propriedade já formalmente registrada no Capítulo 14, garantindo que nenhuma informação seja tratada como pertencente a uma fonte diferente daquela que efetivamente a produziu.

Integridade verifica que a informação obtida através de Query, de Retrieval ou de Evento não foi corrompida ou truncada durante sua obtenção, antes de sua incorporação ao Contexto.

Confiança verifica o grau de certeza associado a cada porção de informação, especialmente relevante para informação derivada de Forecast ou de Inferência já produzida por um Agente anterior, garantindo que essa incerteza seja preservada e comunicada, nunca convertida silenciosamente em afirmação categórica.

```
              CINCO VERIFICAÇÕES DE CONTEXT VALIDATION
   ┌───────────────────────────────────────────────────────────┐
   │  Validação:       origem tecnicamente correta e reconhecida       │
   │  Consistência:     ausência de contradição não resolvida              │
   │  Ownership:         atribuição de propriedade respeitada                 │
   │  Integridade:         informação não corrompida ou truncada                  │
   │  Confiança:            grau de certeza explicitamente preservado                   │
   └───────────────────────────────────────────────────────────┘
```

---

## 9. Context Quality

Relevance mede o quão diretamente uma porção de informação se relaciona à intenção já identificada para a solicitação em curso.

Freshness mede há quanto tempo aquela informação foi produzida ou atualizada pela fonte de origem, penalizando informação desatualizada em favor de informação recente, salvo quando a natureza da solicitação exige análise histórica explícita.

Confidence mede o grau de certeza associado àquela informação, especialmente relevante para conteúdo derivado de Forecast, de Inferência ou de sugestão já produzida por outro Agente.

Consistency mede o quão bem aquela informação se alinha com o restante do Contexto já reunido, sinalizando divergência quando identificada.

Completeness mede se aquela informação representa integralmente o aspecto que descreve, ou se é apenas uma fração parcial que pode induzir a conclusão incompleta.

Sensitivity mede o grau de proteção que aquela informação exige, conforme sua classificação de privacidade e de confidencialidade já aplicável.

Priority mede a importância relativa daquela informação frente às demais já reunidas, insumo direto do Context Scoring detalhado no Capítulo 10.

Business Value mede o quanto aquela informação contribui efetivamente para o objetivo de negócio da solicitação em curso, distinto de sua mera Relevance temática.

Ownership identifica formalmente qual fonte, já catalogada no Capítulo 14, é responsável por aquela informação específica.

Traceability garante que aquela informação seja rastreável até seu ponto exato de origem, sustentando toda Auditabilidade já exigida transversalmente por esta plataforma.

```
              DEZ ATRIBUTOS DE QUALIDADE DE CONTEXTO
   ┌───────────────────────────────────────────────────────────┐
   │  Relevance          Sensitivity                                 │
   │  Freshness           Priority                                       │
   │  Confidence           Business Value                                    │
   │  Consistency           Ownership                                            │
   │  Completeness            Traceability                                          │
   └───────────────────────────────────────────────────────────┘
```

Todo Contexto construído pelo Context OS expõe, para cada porção de informação que o compõe, o valor já atribuído a cada um destes dez atributos — nenhuma informação é incorporada de forma anônima e não qualificada, aplicação direta do princípio Quality Before Quantity já fixado no Capítulo 3.

Estes dez atributos podem ser agrupados em três dimensões complementares de qualidade. Uma primeira dimensão — Relevance, Freshness, Confidence — mede a qualidade intrínseca da informação em relação à solicitação específica em curso. Uma segunda dimensão — Consistency, Completeness, Priority, Business Value — mede a qualidade relativa dessa informação frente ao restante do Contexto já reunido. E uma terceira dimensão — Sensitivity, Ownership, Traceability — mede a qualidade de governança dessa informação, garantindo que ela possa ser protegida, atribuída e auditada corretamente independentemente de sua qualidade de conteúdo. Nenhuma informação é considerada plenamente qualificada para incorporação a um Contexto sem que as três dimensões tenham sido avaliadas, mesmo quando uma delas, isoladamente, já apresente pontuação elevada.

---

## 10. Context Scoring

Diferentes informações recebem pontuação através da combinação ponderada dos dez atributos de qualidade já descritos no Capítulo 9 — uma informação de alta Relevance, alta Freshness e alta Confidence recebe pontuação superior a uma informação de baixa Relevance, mesmo que ambas sejam tecnicamente válidas.

A priorização decorrente dessa pontuação determina a ordem em que informação é considerada para inclusão no Contexto final, sempre respeitando o Context Budget já detalhado no Capítulo 11 — informação de pontuação mais alta é incluída primeiro, e informação de pontuação mais baixa é a primeira candidata a redução quando o volume total exceder esse orçamento.

Conflitos entre duas informações de pontuação equivalente, mas de conteúdo divergente, são resolvidos através de critério de precedência já formalmente estabelecido — por exemplo, informação de Ownership mais próxima ao domínio específico da solicitação em curso prevalece sobre informação de Ownership mais geral, e informação mais recente prevalece sobre informação mais antiga quando a Freshness é o fator decisivo.

Esta resolução de conflito nunca é aplicada de forma silenciosa — quando duas informações candidatas efetivamente divergem em seu conteúdo, essa divergência é registrada como um sinal relevante de Observabilidade, mesmo após a resolução já ter sido aplicada, permitindo que uma investigação futura identifique se a divergência refletia um problema real de inconsistência entre Context Sources distintas, merecendo correção em sua origem.

```
              MODELO CONCEITUAL DE CONTEXT SCORING
   ┌───────────────────────────────────────────────────────────┐
   │  Informação candidata                                          │
   │       │                                                        │
   │       ▼                                                        │
   │  Avaliação dos dez atributos de qualidade (Capítulo 9)              │
   │       │                                                        │
   │       ▼                                                        │
   │  Pontuação combinada                                                   │
   │       │                                                        │
   │       ▼                                                        │
   │  Ordenação por prioridade ──► inclusão respeitando o Budget                 │
   │       │                                                        │
   │       ▼                                                        │
   │  Conflito identificado? ──► resolução por critério de                        │
   │  precedência já formalizado                                                        │
   └───────────────────────────────────────────────────────────┘
```

---

## 11. Context Budget

Todo Contexto opera sob um orçamento finito de capacidade — nunca uma inclusão irrestrita de toda informação tecnicamente disponível, mesmo quando essa informação seria, em princípio, relevante à solicitação em curso.

Weight é o peso relativo de cada porção de informação dentro do orçamento total disponível, proporcional ao seu volume e à sua complexidade estrutural.

Cost é o custo arquitetural de incluir aquela informação, considerando tanto seu Weight quanto o esforço de sua obtenção junto à Context Source de origem.

Priority, já introduzida no Capítulo 9 como atributo de qualidade, é aqui reaplicada como critério direto de alocação do orçamento disponível.

Value é o benefício estimado que aquela informação contribui para a qualidade final do raciocínio que ela sustenta, avaliado em conjunto com sua Business Value já descrita no Capítulo 9.

Risk é o risco associado à omissão daquela informação, caso ela seja excluída por restrição de orçamento — uma informação de alto Risk de omissão recebe tratamento prioritário mesmo quando seu Weight é elevado.

Expiration é o momento em que aquela informação deixa de ser considerada válida para inclusão, aplicação direta do princípio Expiration is Mandatory já fixado no Capítulo 3.

Dependencies são as relações de precedência entre porções de informação — uma informação que depende de outra para ser corretamente interpretada nunca é incluída isoladamente sem sua dependência correspondente.

```
              MONTAGEM DO MELHOR CONJUNTO DE CONTEXTO POSSÍVEL
   ┌───────────────────────────────────────────────────────────┐
   │  Orçamento total disponível para esta solicitação                  │
   │       │                                                        │
   │       ▼                                                        │
   │  Candidatas ordenadas por Priority, Value e Risk de omissão              │
   │       │                                                        │
   │       ▼                                                        │
   │  Inclusão sequencial respeitando Weight e Cost de cada uma                    │
   │       │                                                        │
   │       ▼                                                        │
   │  Verificação de Dependencies antes de finalizar a seleção                          │
   │       │                                                        │
   │       ▼                                                        │
   │  Verificação de Expiration antes de finalizar a seleção                                │
   │       │                                                        │
   │       ▼                                                        │
   │  Melhor conjunto de Contexto possível dentro do orçamento                                  │
   │  disponível, pronto para Distribution                                                          │
   └───────────────────────────────────────────────────────────┘
```

O Orchestrator, através de seu Context Builder já descrito em `AI_ORCHESTRATOR.md`, Capítulo 5, monta este melhor conjunto possível de Contexto aplicando exatamente este modelo de orçamento — nunca uma inclusão exaustiva de toda informação disponível, e nunca uma redução arbitrária sem critério explícito de Weight, Cost, Priority, Value, Risk, Expiration e Dependencies já formalmente estabelecido por este capítulo.

O tamanho exato deste orçamento nunca é fixo e uniforme para toda solicitação — ele varia proporcionalmente à natureza da Capability em curso, já selecionada pelo Capability Selector do Orchestrator, conforme já detalhado em `AI_ORCHESTRATOR.md`, Capítulo 5. Uma Capability de consulta simples, como as já exemplificadas em `AI_MANIFESTO.md`, Capítulo 12, opera com orçamento naturalmente menor do que uma Capability de análise de risco combinada, que envolve múltiplas Context Sources e múltipla Cooperação entre Capabilities distintas, já descrita em `AI_ORCHESTRATOR.md`, Capítulo 11. Esta variação proporcional garante que o Context Budget nunca se torne, ele mesmo, um limitador artificial de qualidade para uma solicitação genuinamente complexa, nem um desperdício desnecessário de capacidade para uma solicitação genuinamente simples.

---

## 12. Context Compression

Resumo é a técnica de condensar um volume grande de informação relacionada em uma representação mais compacta, preservando seu significado essencial, aplicação direta da capacidade de Sumarização já descrita em `AI_MANIFESTO.md`, Capítulo 4.

Redução, já introduzida no Capítulo 7 como etapa do Context Builder, elimina informação de baixa pontuação identificada pelo Context Scoring, nunca informação de alta prioridade apenas por conveniência de espaço.

Agrupamento combina múltiplas porções de informação relacionada e de origem semelhante em uma única representação consolidada, evitando repetição fragmentada da mesma categoria de dado.

Remoção é a exclusão definitiva de informação já identificada como irrelevante ou como redundante em relação a outra já presente no Contexto, aplicada apenas após verificação de que nenhuma Dependency já descrita no Capítulo 11 depende dela.

Preservação garante que informação de alto Risk de omissão, mesmo quando sujeita a Compressão, nunca seja integralmente descartada — apenas condensada, nunca eliminada por completo quando sua ausência comprometeria a qualidade do raciocínio subsequente.

A ordem em que estas seis técnicas são aplicadas nunca é arbitrária — Agrupamento e Resumo são sempre tentados antes de Redução e de Remoção, porque consolidar informação relacionada frequentemente libera espaço suficiente dentro do Context Budget sem exigir qualquer perda real de conteúdo relevante; apenas quando essa consolidação já não é suficiente para respeitar o orçamento disponível é que a Redução, e em último caso a Remoção definitiva, são efetivamente aplicadas, sempre precedidas pela verificação de Preservação já descrita acima.

Perda aceitável é o reconhecimento explícito de que toda Compressão envolve, por definição, alguma perda de detalhe granular — essa perda é sempre calculada e comunicada quando relevante, nunca ocultada silenciosamente, aplicação direta do princípio No Silent Loss já fixado no Capítulo 3.

```
              TÉCNICAS DE CONTEXT COMPRESSION (visão consolidada)
   ┌───────────────────────────────────────────────────────────┐
   │  Resumo:        condensação preservando significado essencial      │
   │  Redução:         eliminação de informação de baixa pontuação           │
   │  Agrupamento:       consolidação de informação relacionada                    │
   │  Remoção:             exclusão definitiva de informação já                        │
   │                     verificada como dispensável                                        │
   │  Preservação:           proteção de informação de alto Risk de                             │
   │                     omissão mesmo sob Compressão                                                │
   │  Perda aceitável:         reconhecimento explícito e comunicado de                                  │
   │                     qualquer perda de detalhe granular                                                 │
   └───────────────────────────────────────────────────────────┘
```

---

## 13. Context Distribution

Diferentes Agentes recebem diferentes Contextos — o Agent Coordinator, já descrito em `AI_ORCHESTRATOR.md`, Capítulo 5, distribui a cada Agente delegado exatamente o subconjunto de Contexto relevante à sua subtarefa específica, nunca o Contexto completo construído para a solicitação inteira.

Isolamento garante que o Contexto distribuído a um Agente nunca inclua informação além do escopo de sua Responsibility e de seu Context Access, já formalmente declarados no Agent Contract conforme `AGENT_FRAMEWORK.md`, Capítulo 5.

Colaboração acontece quando o resultado de um Agente é incorporado, através do Orchestrator, ao Contexto distribuído a outro Agente que processa subtarefa relacionada — nunca uma distribuição direta entre os dois Agentes, sempre mediada pela mesma disciplina de Memória compartilhada já detalhada em `AI_ORCHESTRATOR.md`, Capítulo 10.

Esta disciplina de mediação exclusiva na Distribution, análoga à já central em `AGENT_FRAMEWORK.md`, Capítulo 15, para toda comunicação entre Agentes, garante que o Context OS nunca se torne um canal implícito de acoplamento direto entre duas unidades de raciocínio que deveriam permanecer isoladas entre si, exceto na medida exata em que o Orchestrator já determinou, através de sua etapa de Consolidation, que essa colaboração é necessária à solicitação em curso.

```
              DISTRIBUIÇÃO DE CONTEXTO ENTRE MÚLTIPLOS AGENTES
   ┌───────────────────────────────────────────────────────────┐
   │  Contexto completo construído para a solicitação                   │
   │       │                                                        │
   │       ├──► Agente A recebe subconjunto relevante à sua                    │
   │       │    subtarefa específica                                              │
   │       │                                                        │
   │       └──► Agente B recebe subconjunto relevante à sua                          │
   │            subtarefa específica, potencialmente sobreposto,                          │
   │            mas nunca idêntico, ao de Agente A                                              │
   │                                                                │
   │  Nenhum Agente acessa o Contexto completo além de seu                                          │
   │  próprio subconjunto já delimitado                                                                    │
   └───────────────────────────────────────────────────────────┘
```

---

## 14. Context Ownership

```
   CRM Hub
      │
      ▼
   Customer Context

   Finance Hub
      │
      ▼
   Financial Context

   Growth Hub
      │
      ▼
   Campaign Context

   Analytics Hub
      │
      ▼
   Metrics Context

   Knowledge Hub
      │
      ▼
   Knowledge Context

   Identity Hub
      │
      ▼
   Identity Context
```

Customer Context, proprietário do CRM Hub, contém toda informação relativa a Customer, a Lead, a Organization e a Opportunity, sempre obtida através de Query já catalogada em `QUERY_CATALOG.md` e nunca por acesso direto à estrutura interna do CRM Hub.

Financial Context, proprietário do Finance Hub, contém toda informação relativa a Invoice, a Payment, a Ledger e a Balance, sempre respeitando o mesmo rigor de sensibilidade já exigido individualmente em `FINANCE_HUB.md`, Capítulo 15.

Campaign Context, proprietário do Growth Hub, contém toda informação relativa a Campaign, a Audience, a Experiment e a Growth Metric.

Metrics Context, proprietário do Analytics Hub, contém todo indicador consolidado, Trend e Forecast já materializados por aquele módulo.

Knowledge Context, proprietário do Knowledge Hub, contém todo conteúdo documental já indexado e recuperável através de Retrieval.

Identity Context, proprietário do Identity Hub, contém toda informação relativa a Permission, a Perfil, a Sessão e a Tenant do Usuário que originou a solicitação.

```
              MATRIZ DE OWNERSHIP DE CONTEXTO
   ┌───────────────────────────────────────────────────────────┐
   │  Categoria de Contexto        Proprietário oficial                │
   │  Customer Context               CRM Hub                               │
   │  Financial Context                Finance Hub                              │
   │  Campaign Context                   Growth Hub                                  │
   │  Metrics Context                      Analytics Hub                                  │
   │  Knowledge Context                      Knowledge Hub                                    │
   │  Identity Context                         Identity Hub                                       │
   │  Communication Context                      Communication Hub                                    │
   │  Automation Context                           Automation Engine                                       │
   └───────────────────────────────────────────────────────────┘
```

Esta matriz de Ownership de Contexto é uma extensão direta da matriz já consolidada em `DOMAIN_OWNERSHIP_MATRIX.md`, nunca uma nova atribuição paralela e potencialmente divergente — o proprietário de uma categoria de Contexto é sempre exatamente o mesmo módulo já registrado como proprietário do conceito de negócio subjacente àquele Contexto.

Uma implicação prática desta correspondência direta é que toda futura extensão de `DOMAIN_OWNERSHIP_MATRIX.md` — um sexto Business Hub, um novo Platform Service — herda automaticamente uma nova categoria correspondente de Contexto, sem exigir revisão formal deste documento. Um sexto Business Hub que viesse a ser criado, por exemplo, adicionaria uma nova linha a esta matriz de Ownership de Contexto seguindo exatamente o mesmo padrão já demonstrado pelas seis categorias aqui já registradas, nunca exigindo reformulação da estrutura do Context OS em si.

Um segundo aspecto relevante desta matriz é a distinção entre Ownership de Contexto e Ownership de Evento, já consolidada separadamente em `EVENT_CATALOG.md`. Embora ambos frequentemente coincidam — o CRM Hub é proprietário tanto do Evento `CustomerCreated` quanto do Customer Context correspondente —, a categoria de Contexto é sempre mais ampla do que qualquer Evento isolado, agregando o resultado consolidado de múltiplos Eventos já publicados ao longo do tempo, nunca limitada a um único fato pontual já catalogado.

---

## 15. Context Lifecycle

```
   Create
      │
      ▼
   Collect
      │
      ▼
   Normalize
      │
      ▼
   Validate
      │
      ▼
   Score
      │
      ▼
   Prioritize
      │
      ▼
   Compress
      │
      ▼
   Distribute
      │
      ▼
   Consume
      │
      ▼
   Observe
      │
      ▼
   Update
      │
      ▼
   Expire
      │
      ▼
   Archive
```

Create é o momento em que uma nova construção de Contexto é iniciada, correspondendo à etapa de Criação já descrita no Context Builder, Capítulo 7.

Collect é a etapa em que cada Context Source relevante, já catalogada no Capítulo 6, é consultada para fornecer informação candidata.

Normalize padroniza a estrutura dessa informação já coletada, garantindo consistência de representação entre origens distintas.

Validate aplica toda verificação já descrita no Capítulo 8, confirmando correção, consistência, Ownership, integridade e confiança.

Score aplica o Context Scoring já descrito no Capítulo 10, atribuindo pontuação a cada porção de informação já validada.

Prioritize ordena essa informação já pontuada, determinando sua sequência de inclusão dentro do Context Budget disponível.

Compress aplica, quando necessário, as técnicas já descritas no Capítulo 12, reduzindo o volume total ao que o orçamento disponível permite.

Distribute entrega o Contexto já finalizado a cada Agente ou componente relevante, conforme já descrito no Capítulo 13.

Consume é o momento em que um Agente ou o próprio Orchestrator efetivamente utiliza esse Contexto para fundamentar seu raciocínio.

Observe registra todo sinal relevante de como aquele Contexto específico foi construído e consumido, sustentando a Observabilidade já detalhada no Capítulo 18.

Update ajusta o Contexto já em uso quando nova informação relevante surge durante o próprio processamento da solicitação, aplicação direta da Context Evolution detalhada no Capítulo 16.

Expire encerra a validade daquele Contexto específico, conforme o momento de Expiration já determinado durante sua Criação.

Archive preserva, quando aplicável, um registro histórico daquele Contexto já expirado, sustentando Auditabilidade futura sem manter esse Contexto disponível para novo consumo ativo.

```
              CICLO DE VIDA COMPLETO (treze etapas, visão resumida)
   ┌───────────────────────────────────────────────────────────┐
   │  Construção:      Create · Collect · Normalize · Validate          │
   │  Qualificação:      Score · Prioritize · Compress                       │
   │  Uso:                Distribute · Consume · Observe                            │
   │  Encerramento:         Update · Expire · Archive                                    │
   └───────────────────────────────────────────────────────────┘
```

---

## 16. Context Evolution

Contexto muda continuamente ao longo do processamento de uma solicitação complexa — a etapa Update, já introduzida no Capítulo 15, garante que informação nova e relevante, identificada durante o próprio raciocínio de um Agente, seja incorporada sem exigir reconstrução completa do Contexto original.

Contexto amadurece à medida que o Context OS acumula experiência sobre qual combinação de informação produz raciocínio de maior qualidade para determinada categoria de solicitação, refinando gradualmente os critérios de Scoring e de Prioritization já descritos nos Capítulos 9 e 10.

Contexto aprende no sentido de que padrões recorrentes de solicitação relacionada podem informar Enriquecimento futuro mais preciso, sempre respeitando o isolamento absoluto entre Empresas já central ao princípio Tenant Isolation is Absolute fixado no Capítulo 3.

Versões de Contexto coexistem quando uma mudança estrutural relevante em uma categoria de Contexto é introduzida — a versão anterior permanece válida para solicitação já em processamento no momento da mudança, enquanto a nova versão se torna padrão para toda solicitação subsequente, mesma disciplina de transição controlada já exigida para versionamento de Evento em `EVENT_CATALOG.md`, Capítulo 8.

Esta capacidade de amadurecimento contínuo nunca compromete a Consistency já exigida como atributo de qualidade no Capítulo 9 — mesmo quando o Context OS refina seus próprios critérios de Scoring ao longo do tempo, essa evolução é sempre versionada e documentada, nunca uma mudança de comportamento silenciosa que produziria resultado divergente para duas solicitações estruturalmente equivalentes processadas em momentos distintos sem justificativa rastreável e formalmente registrada para essa divergência observada.

```
              EVOLUÇÃO DE CONTEXTO AO LONGO DO TEMPO
   ┌───────────────────────────────────────────────────────────┐
   │  Contexto em uso ativo durante uma solicitação                     │
   │       │                                                        │
   │       ▼                                                        │
   │  Nova informação relevante identificada ──► Update aplicado                  │
   │  sem reconstrução completa                                                        │
   │                                                                │
   │  Mudança estrutural de categoria de Contexto ──► nova versão                        │
   │  coexiste temporariamente com a versão anterior, até                                     │
   │  transição completa                                                                            │
   └───────────────────────────────────────────────────────────┘
```

---

## 17. Segurança

Autorização de toda construção de Contexto verifica, junto ao Identity Hub, que a Permission do Usuário que originou a solicitação sustenta o acesso a cada Context Source consultada.

Isolamento entre Empresas é absoluto em toda camada de Contexto, particularmente no Tenant Context já descrito no Capítulo 5, nunca permitindo que informação de uma Empresa seja incorporada, mesmo incidentalmente, ao Contexto de outra.

Privacidade de todo dado pessoal presente em um Contexto é preservada através de minimização já exigida pelo princípio Human Data Deserves Extra Care fixado no Capítulo 3, aplicando agregação e anonimização quando a finalidade do raciocínio permitir.

Confidencialidade de informação classificada como sensível, conforme o atributo Sensitivity já descrito no Capítulo 9, é preservada através de controle de acesso proporcional durante toda a Distribution do Contexto.

Multi-tenancy é sustentada de ponta a ponta pelo Context OS, garantindo que a arquitetura de camadas já descrita no Capítulo 5 nunca produza vazamento de informação entre Tenants distintos, mesmo sob volume elevado de solicitação concorrente.

Um princípio de segurança adicional, específico à natureza colaborativa de múltiplos Agentes já descrita em `AGENT_FRAMEWORK.md`, Capítulo 15, é a verificação de Permission granular a cada etapa de Context Distribution — quando o Contexto de um Agente é enriquecido com resultado parcial de outro Agente através do Orchestrator, essa incorporação respeita o mesmo escopo de Permission já herdado da solicitação original, nunca ampliando o acesso de nenhum Agente além do que ele já possuiria caso processasse a mesma informação de forma isolada, mesma disciplina de prevenção de escalonamento indevido já reforçada naquele documento.

```
              CAMADAS DE SEGURANÇA DO CONTEXT OS
   ┌───────────────────────────────────────────────────────────┐
   │  Autorização (Identity Hub verifica Permission)                    │
   │       ▼                                                         │
   │  Isolamento entre Empresas (Tenant Context)                            │
   │       ▼                                                         │
   │  Privacidade (minimização de dado pessoal)                                  │
   │       ▼                                                         │
   │  Confidencialidade (controle de acesso por Sensitivity)                          │
   │       ▼                                                         │
   │  Multi-tenancy preservada de ponta a ponta                                            │
   └───────────────────────────────────────────────────────────┘
```

---

## 18. Observabilidade

Toda decisão do Context Builder deve ser auditável — qual informação foi incluída, qual foi excluída, e qual critério de Scoring determinou essa decisão são registrados de forma explícita e rastreável.

Toda distribuição deve ser rastreável — qual Agente recebeu qual subconjunto de Contexto, e em qual momento, permanece reconstruível indefinidamente, sustentando investigação de qualquer conclusão passada até o Contexto exato que a fundamentou.

Toda remoção deve ser explicável — quando uma informação candidata é excluída por Compressão ou por Prioritization, o critério dessa exclusão é preservado, nunca uma perda silenciosa sem justificativa reconstruível.

Toda priorização deve possuir justificativa — a ordenação produzida pelo Context Scoring é sempre acompanhada da pontuação específica atribuída a cada atributo de qualidade já descrito no Capítulo 9, permitindo verificação completa de por que uma informação recebeu prioridade sobre outra.

A Observabilidade do Context OS compartilha, com a Observabilidade já detalhada em `AI_ORCHESTRATOR.md`, Capítulo 16, e em `AGENT_FRAMEWORK.md`, Capítulo 16, a mesma segunda dimensão de investigação além da métrica técnica tradicional — a capacidade de reconstruir não apenas quanto Contexto foi consumido, mas por que aquele Contexto específico, entre todas as alternativas candidatas disponíveis, foi o que efetivamente fundamentou uma conclusão já produzida. Esta segunda dimensão é sustentada, no nível do Context OS, pelo registro explícito de cada etapa do ciclo de vida já descrito no Capítulo 15 — Collect, Score, Prioritize, Compress —, cada uma produzindo seu próprio sinal observável, permitindo que uma investigação futura reconstrua o percurso completo de construção de Contexto, não apenas seu resultado final consolidado.

```
              OBSERVABILIDADE DO CONTEXT OS (visão consolidada)
   ┌───────────────────────────────────────────────────────────┐
   │  Construção:      auditável — inclusão e exclusão justificadas      │
   │  Distribuição:      rastreável — qual Agente recebeu qual                │
   │                    subconjunto                                              │
   │  Remoção:            explicável — critério de exclusão preservado                 │
   │  Priorização:          justificada — pontuação de cada atributo                        │
   │                    reconstruível                                                          │
   └───────────────────────────────────────────────────────────┘
```

---

## 19. Fluxos Arquiteturais

```
   CONSTRUÇÃO DE CONTEXTO
   ┌───────────────────────────────────────────────────────────┐
   │  Intent Analyzer identifica intenção ──► Context OS               │
   │  consulta Context Sources relevantes ──► Validation ──►                  │
   │  Normalization ──► Scoring ──► Prioritization dentro do                        │
   │  Budget ──► Contexto finalizado                                                     │
   └───────────────────────────────────────────────────────────┘
```

```
   DISTRIBUIÇÃO
   ┌───────────────────────────────────────────────────────────┐
   │  Contexto finalizado ──► Agent Coordinator identifica              │
   │  subtarefas delegadas ──► cada Agente recebe subconjunto                 │
   │  delimitado ao seu próprio Context Access já declarado                        │
   │  no Agent Contract                                                                   │
   └───────────────────────────────────────────────────────────┘
```

```
   COLABORAÇÃO
   ┌───────────────────────────────────────────────────────────┐
   │  Agente A conclui subtarefa ──► resultado reportado ao              │
   │  Orchestrator ──► incorporado como Enriquecimento ao                     │
   │  Contexto de Agente B, quando relevante à subtarefa de B                       │
   └───────────────────────────────────────────────────────────┘
```

```
   ATUALIZAÇÃO
   ┌───────────────────────────────────────────────────────────┐
   │  Nova informação relevante identificada durante                    │
   │  processamento ──► Update aplicado ao Contexto já em uso               │
   │  ──► reprocessamento apenas da porção afetada, sem                            │
   │  reconstrução completa                                                              │
   └───────────────────────────────────────────────────────────┘
```

```
   EXPIRAÇÃO
   ┌───────────────────────────────────────────────────────────┐
   │  Contexto atinge seu momento de Expiration já determinado           │
   │  ──► Expire aplicado ──► Archive preserva registro histórico              │
   │  para Auditabilidade, sem manter disponibilidade para novo                     │
   │  consumo ativo                                                                        │
   └───────────────────────────────────────────────────────────┘
```

```
   CONTEXT BUDGET
   ┌───────────────────────────────────────────────────────────┐
   │  Candidatas de informação já pontuadas ──► ordenadas por            │
   │  Priority, Value e Risk de omissão ──► inclusão sequencial               │
   │  respeitando Weight e Cost ──► verificação de Dependencies                     │
   │  ──► melhor conjunto possível dentro do orçamento disponível                        │
   └───────────────────────────────────────────────────────────┘
```

```
   CONTEXT SCORING
   ┌───────────────────────────────────────────────────────────┐
   │  Informação candidata ──► avaliação de Relevance,                  │
   │  Freshness, Confidence, Consistency, Completeness,                       │
   │  Sensitivity, Priority, Business Value, Ownership e                            │
   │  Traceability ──► pontuação combinada ──► ordenação final                          │
   └───────────────────────────────────────────────────────────┘
```

---

## 20. Architecture Decision Records

**ADR-001 — Todo Contexto desta plataforma é construído exclusivamente através do Context Operating System.** Contexto: aplicação direta do princípio Single Construction Point já fixado no Capítulo 3.

**ADR-002 — Contexto é distinto de Memória, de Conhecimento, de Estado e de Prompt, nunca tratado como sinônimo de nenhum deles.** Contexto: preservar clareza conceitual já detalhada no Capítulo 2.

**ADR-003 — Todo Contexto opera sob um Context Budget finito.** Contexto: prevenir inclusão irrestrita de informação, preservando qualidade sobre volume, já detalhado no Capítulo 11.

**ADR-004 — Toda categoria de Contexto possui um proprietário oficial, já derivado de `DOMAIN_OWNERSHIP_MATRIX.md`.** Contexto: aplicação direta da matriz de Ownership já detalhada no Capítulo 14.

**ADR-005 — Todo Contexto é organizado em nove camadas hierárquicas, de escopo global a escopo de execução.** Contexto: já detalhado no Capítulo 5, sustentando composição consistente entre camadas.

**ADR-006 — Nenhuma Context Source é acessada diretamente sem passar por Query, por Retrieval ou por Integration já apropriada.** Contexto: preservar a arquitetura de domínio já consolidada pelo Architecture Handbook, detalhado no Capítulo 6.

**ADR-007 — Toda Compressão de Contexto preserva informação de alto Risk de omissão.** Contexto: aplicação do princípio Compression Preserves Meaning já fixado no Capítulo 3.

**ADR-008 — Nenhuma perda de informação durante Compressão é silenciosa.** Contexto: aplicação do princípio No Silent Loss já fixado no Capítulo 3.

**ADR-009 — Todo Contexto distribuído a um Agente é delimitado ao escopo de sua Responsibility e de seu Context Access já declarados em `AGENT_FRAMEWORK.md`.** Contexto: preservar Isolamento entre Agentes já central àquele documento.

**ADR-010 — Nenhum Agente recebe o Contexto completo de uma solicitação; apenas o subconjunto relevante à sua subtarefa específica.** Contexto: aplicação do princípio Bounded Scope já fixado no Capítulo 3.

**ADR-011 — Toda mudança estrutural relevante em uma categoria de Contexto é versionada.** Contexto: aplicação do princípio Versioning is Explicit, mesma disciplina já exigida para Evento em `EVENT_CATALOG.md`.

**ADR-012 — Isolamento entre Empresas é absoluto em toda camada de Contexto, sem exceção.** Contexto: aplicação direta de `AI_HUB.md`, ADR-008, e de `AI_MANIFESTO.md`, Capítulo 3.

**ADR-013 — Todo Contexto expõe explicitamente seu grau de Confidence quando derivado de Inferência ou de Forecast.** Contexto: preservar transparência de incerteza já central ao Reasoning Engine descrito em `AGENT_FRAMEWORK.md`, Capítulo 11.

**ADR-014 — Toda decisão de construção, de priorização e de distribuição de Contexto é auditável e rastreável.** Contexto: aplicação do princípio Auditability Above Convenience já fixado no Capítulo 3.

**ADR-015 — Este documento não define nenhuma tecnologia de armazenamento, nenhum modelo de inteligência artificial, e nenhum formato técnico específico de representação de Contexto.** Contexto: preservar seu escopo estritamente arquitetural, delegando decisão de implementação a documentos técnicos futuros ou a escolhas de engenharia fora do AI Handbook.

---

## 21. Glossário

**Context** — informação relevante, já selecionada, estruturada e qualificada, que fundamenta o raciocínio de um componente de Inteligência Artificial em um momento específico, sempre construída, governada e distribuída através do Context Operating System já descrito neste documento.

**Context Operating System** — o sistema arquitetural completo e único responsável por construir, validar, enriquecer, distribuir, priorizar, reduzir e observar todo Contexto consumido por qualquer componente desta plataforma.

**Context Layer** — cada uma das nove camadas hierárquicas de escopo já formalmente definidas, de Global Context a Execution Context, cada uma delimitando um nível progressivamente mais estreito de aplicabilidade.

**Context Source** — a origem primária ou derivada de informação potencialmente relevante, sempre com proprietário formal já registrado na matriz correspondente.

**Context Builder** — o componente interno do AI Orchestrator, já detalhado em `AI_ORCHESTRATOR.md`, que invoca o Context OS para produzir Contexto consumível.

**Context Scoring** — o mecanismo de pontuação de toda informação candidata segundo os dez atributos de qualidade formais já detalhados neste documento.

**Context Budget** — o orçamento finito e variável de capacidade dentro do qual todo Contexto é construído, exigindo priorização disciplinada.

**Context Compression** — o conjunto de seis técnicas que reduz o volume de um Contexto já construído, sempre preservando seu significado essencial.

**Context Distribution** — o mecanismo formal de entrega de subconjuntos específicos de Contexto a cada Agente ou componente já autorizado a recebê-los.

**Context Ownership** — a atribuição formal e explícita de qual módulo é proprietário oficial de cada categoria de Contexto.

**Context Lifecycle** — o ciclo formal de treze etapas, de Create a Archive, que todo Contexto desta plataforma percorre integralmente.

**Context Evolution** — o processo contínuo pelo qual um Contexto se ajusta e amadurece ao longo do tempo e do processamento de uma solicitação em curso.

**Relevance, Freshness, Confidence, Consistency, Completeness, Sensitivity, Priority, Business Value, Ownership, Traceability** — os dez atributos formais e obrigatórios de qualidade de todo Contexto já construído.

---

## 22. Conclusão

Este documento declara oficialmente que `CONTEXT_FRAMEWORK.md` torna-se a autoridade máxima sobre o gerenciamento de Contexto da Adaptive Business Platform. Todo componente da camada de Inteligência Artificial — o AI Orchestrator, todo Agente já construído sob `AGENT_FRAMEWORK.md`, e todo documento técnico futuro deste AI Handbook — deverá respeitar integralmente este framework: suas nove camadas hierárquicas, seus dez atributos de qualidade, seu Context Budget, sua matriz de Ownership, e seu ciclo de vida completo de treze etapas.

A hierarquia documental desta série permanece precisa e definitiva: `AI_MANIFESTO.md` define a filosofia — por que a Inteligência Artificial existe e quais limites ela nunca cruza. `AI_ARCHITECTURE.md` define a estrutura — como essa filosofia se organiza em doze camadas verificáveis. `AI_ORCHESTRATOR.md` define a coordenação — como o componente central dessa estrutura opera internamente. `AGENT_FRAMEWORK.md` define a unidade inteligente — o Agente, sua composição interna e seu ciclo de vida completo. `CONTEXT_FRAMEWORK.md`, este documento, define o Sistema Oficial de Contexto — como toda informação relevante que fundamenta qualquer raciocínio desta plataforma é construída, qualificada, governada e distribuída. E o Architecture Handbook, consolidado por vinte e seis documentos já concluídos, permanece soberano sobre toda a plataforma — nenhum Contexto, por mais rico e sofisticado que se torne, jamais assume Ownership de negócio, jamais contorna a arquitetura de domínio já consolidada, e jamais substitui o raciocínio humano ou a Regra de negócio que ele apenas fundamenta e nunca decide em seu lugar.

Com a publicação deste quinto documento do AI Handbook, a plataforma já dispõe de filosofia, estrutura, coordenação, unidade fundamental de raciocínio e sistema oficial de Contexto integralmente estabelecidos — a base completa e coerente sobre a qual todo futuro documento dedicado a Memória, a Planejamento, a Skill, a Ferramenta e a Colaboração Multi-Agente será construído, cada um consumindo o mesmo Context OS aqui descrito como sua fonte única e disciplinada de informação relevante, sem jamais precisar redefinir o que este framework já consolidou de forma definitiva.
