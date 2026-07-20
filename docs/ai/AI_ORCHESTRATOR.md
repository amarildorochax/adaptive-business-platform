# AI Orchestrator

**Adaptive Business Platform · AI Handbook · Documento Técnico Oficial**

---

## 1. Introdução

Este documento é a autoridade máxima e definitiva sobre a coordenação da Inteligência Artificial da Adaptive Business Platform. Ele não substitui nenhum documento já publicado — não redefine a filosofia já estabelecida em `AI_MANIFESTO.md`, não redefine a estrutura de doze camadas já estabelecida em `AI_ARCHITECTURE.md`, e não altera nenhuma decisão arquitetural já registrada em qualquer um dos vinte e seis documentos do Architecture Handbook. O que este documento adiciona é o detalhamento completo do componente que já foi introduzido, em nível estrutural, em `AI_ARCHITECTURE.md`, Capítulo 5 — o AI Orchestrator — descrevendo agora seus componentes internos, seu pipeline de decisão, e cada uma de suas responsabilidades com o nível de profundidade que um documento dedicado exclusivamente a esse componente permite.

O propósito central deste documento é garantir que toda coordenação de Inteligência Artificial nesta plataforma aconteça através de um único ponto de entrada, verificável e consistente — o AI Orchestrator — nunca através de coordenação implícita, ad hoc ou dispersa entre múltiplos componentes de raciocínio sem um mediador central.

O papel do Orchestrator dentro da topologia já estabelecida por `AI_ARCHITECTURE.md` permanece exatamente o mesmo já descrito naquele documento — o componente que recebe toda solicitação processada pela Experience Layer, coordena as camadas de Capability, de Agent, de Skill, de Tool e de Execution Policy, e devolve um resultado consolidado à Presentation Layer. Este documento não altera essa posição estrutural; ele a detalha.

O escopo deste documento é estritamente o próprio Orchestrator — seus componentes internos, seu pipeline de decisão, e as regras que governam sua coordenação. Este documento não define nenhum Agente específico, nenhuma Skill específica, nenhum modelo de inteligência artificial específico, e nenhuma tecnologia de implementação específica — essas especificações pertencem a documentos técnicos futuros do AI Handbook, já antecipados em `AI_ARCHITECTURE.md`, Capítulo 19, e reafirmados no Capítulo 21 deste documento.

A relação com `AI_MANIFESTO.md` permanece hierárquica e absoluta — todo componente interno do Orchestrator descrito neste documento respeita integralmente os trinta princípios filosóficos e as vinte regras de governança já fixados naquele manifesto, nunca os contradizendo. Um Orchestrator que decidisse, por exemplo, executar uma ação sem confirmação humana quando a Execution Policy Layer já exige essa confirmação, violaria diretamente o princípio Human Oversight is Preserved já central àquele documento — uma violação que este documento existe justamente para impedir estruturalmente.

A relação com `AI_ARCHITECTURE.md` é igualmente hierárquica — este documento nunca introduz uma décima terceira camada, nunca reorganiza a topologia já estabelecida, e nunca redefine a fronteira entre o Orchestrator e as demais camadas já descritas naquele documento. O que este documento faz é abrir o próprio Orchestrator, já tratado como uma única camada em `AI_ARCHITECTURE.md`, e revelar sua composição interna de nove componentes especializados, cada um com responsabilidade estrita, entrada e saída documentadas.

A necessidade de um documento dedicado exclusivamente ao Orchestrator, publicado imediatamente após a Arquitetura de doze camadas e antes de qualquer especificação de Agente individual, decorre de uma observação estrutural direta: entre as doze camadas já descritas em `AI_ARCHITECTURE.md`, o Orchestrator é a única que efetivamente atravessa e coordena todas as demais camadas de IA simultaneamente — a Experience Layer o invoca; a Capability Layer, a Agent Layer, a Skill Runtime, a Tool Abstraction e a Execution Policy Layer são todas, em algum grau, orquestradas por ele. Nenhuma outra camada desta arquitetura ocupa posição de coordenação equivalente, o que justifica que ela receba, isoladamente, o mesmo nível de detalhamento que um Blueprint completo já recebe para um domínio de negócio inteiro no Architecture Handbook.

Um segundo motivo para a existência deste documento é a necessidade de que qualquer especificação futura de Agente, já antecipada por `AI_ARCHITECTURE.md`, Capítulo 19, tenha uma referência estável e completa de como esse Agente será efetivamente invocado, supervisionado e consolidado. Sem este documento, cada futura especificação de Agente teria que reinventar, de forma potencialmente divergente, sua própria compreensão de como a coordenação funciona — reproduzindo exatamente o tipo de fragmentação que toda esta série documental existe para prevenir.

---

## 2. Missão do Orchestrator

O Orchestrator existe para coordenar — determinar, a partir de uma solicitação recebida, qual sequência de processamento entre Capability, Agente e Skill é necessária para produzir um resultado completo e coerente.

Ele existe para distribuir — encaminhar cada etapa de processamento já identificada ao componente mais apropriado, seja um Agente especializado, seja uma Capability específica, sem jamais processar essa etapa diretamente em seu próprio lugar.

Ele existe para supervisionar — acompanhar o progresso de toda etapa já delegada, identificando atraso, falha ou resultado inesperado antes que esse problema comprometa a resposta final apresentada ao Usuário.

Ele existe para consolidar — combinar o resultado de múltiplas etapas de processamento, possivelmente produzidas por Agentes distintos, em uma resposta única, coerente e sem contradição interna.

Ele existe para proteger — aplicar toda verificação de Execution Policy, de Permission e de Segurança antes que qualquer sugestão se torne uma ação real, preservando a fronteira entre raciocínio e execução já central a `AI_MANIFESTO.md`.

Ele existe para governar — garantir que toda decisão tomada durante seu próprio processamento seja rastreável, auditável e conforme às vinte regras de governança já fixadas em `AI_MANIFESTO.md`, Capítulo 11.

O Orchestrator nunca executa Regra de negócio — nenhuma verificação de pré-condição, nenhuma aplicação de fórmula de cálculo, e nenhuma decisão de domínio já documentada em qualquer Blueprint do Architecture Handbook é processada dentro do Orchestrator; essa responsabilidade permanece exclusiva de cada Business Hub proprietário.

O Orchestrator nunca substitui os Business Hubs — mesmo quando coordena uma solicitação que eventualmente resulta em um Command formal, o Orchestrator nunca se torna, ele mesmo, o processador desse Command; ele apenas encaminha a solicitação já aprovada através do Command Bus já catalogado em `COMMAND_CATALOG.md`, e o Business Hub proprietário processa essa solicitação integralmente.

O Orchestrator nunca altera estado diretamente — nenhuma estrutura de dado de negócio, nenhuma Entidade já catalogada em `DOMAIN_OWNERSHIP_MATRIX.md`, é modificada pelo Orchestrator; toda mudança de estado acontece exclusivamente através do Command Bus, após toda verificação de Execution Policy e de confirmação humana já exigida.

```
                    O QUE O ORCHESTRATOR FAZ, O QUE ELE NUNCA FAZ
   ┌───────────────────────────────────────────────────────────┐
   │  Faz:                              Nunca faz:                   │
   │    Coordena                          Executa Regra de negócio        │
   │    Distribui                         Substitui Business Hub                │
   │    Supervisiona                      Altera estado diretamente                  │
   │    Consolida                         Ignora Execution Policy                        │
   │    Protege                           Contorna confirmação humana                          │
   │    Governa                           Oculta seu próprio raciocínio                             │
   └───────────────────────────────────────────────────────────┘
```

Estas seis capacidades — coordenar, distribuir, supervisionar, consolidar, proteger, governar — compartilham uma característica estrutural comum já antecipada em `AI_ARCHITECTURE.md`, Capítulo 4: todas são capacidades de natureza epistêmica e organizacional, nunca de natureza executiva sobre o domínio de negócio em si. O Orchestrator conhece a topologia de processamento necessária para responder a uma solicitação, mas nunca conhece, e nunca precisa conhecer, os detalhes internos de como uma Invoice é validada pelo Finance Hub ou de como uma Opportunity é qualificada pelo CRM Hub — esse conhecimento de domínio permanece exclusivamente com cada Business Hub proprietário, conforme já registrado em `DOMAIN_OWNERSHIP_MATRIX.md`.

Um teste prático para verificar se uma nova responsabilidade proposta pertence corretamente ao Orchestrator, aplicável a qualquer revisão futura deste documento, decorre diretamente desta distinção: se a responsabilidade envolve decidir a sequência, a prioridade ou a consolidação de processamento, ela pertence ao Orchestrator; se a responsabilidade envolve decidir o conteúdo de negócio — o que uma Invoice deve valer, o que uma Opportunity deve conter —, ela nunca pertence ao Orchestrator, mesmo que pareça, à primeira vista, conveniente centralizá-la ali.

---

## 3. Princípios

**Single Coordination Point.** Toda coordenação de Inteligência Artificial nesta plataforma acontece através de um único Orchestrator, nunca através de coordenação dispersa entre múltiplos pontos de entrada concorrentes.

**Capabilities Before Skills.** O Orchestrator sempre identifica a Capability relevante antes de considerar qual Skill específica implementa essa Capability, nunca o inverso.

**Context Before Planning.** Nenhum planejamento é iniciado antes que o contexto relevante já tenha sido reunido, aplicação direta do princípio já fixado em `AI_MANIFESTO.md`, Capítulo 3.

**Planning Before Execution.** Toda solicitação complexa é decomposta em um plano explícito antes de qualquer etapa individual ser processada.

**Policies Before Commands.** Nenhum Command é invocado antes que a Execution Policy Layer já tenha determinado a política aplicável àquela ação específica.

**Human Before Automation.** Toda ação de impacto real aguarda confirmação humana antes de qualquer automação subsequente ser acionada.

**Business Before Intelligence.** Toda Regra de negócio já documentada em um Blueprint prevalece sobre qualquer conclusão de raciocínio produzida pela camada de Inteligência Artificial.

**Determinism Before Creativity.** Quando uma tarefa admite solução determinística já configurada — através do Automation Engine —, essa solução determinística é preferida sobre uma solução criativa e variável produzida por raciocínio de IA.

**Observability Before Optimization.** Nenhuma otimização de desempenho ou de custo do Orchestrator é aplicada antes que sua operação já seja plenamente observável.

**Governance Before Autonomy.** Nenhuma autonomia adicional é concedida ao Orchestrator ou a qualquer Agente coordenado por ele antes que a governança correspondente já esteja formalmente registrada.

**Single Responsibility per Component.** Cada componente interno do Orchestrator, já detalhado no Capítulo 5, possui exatamente uma responsabilidade, nunca acumulando escopo de outro componente vizinho.

**Explicit Delegation.** Toda delegação do Orchestrator a um Agente, a uma Capability ou a uma Skill é explícita e documentada, nunca implícita ou inferida por comportamento observado.

**Traceable Coordination.** Toda decisão de coordenação produzida pelo Orchestrator é rastreável até seu contexto de origem e sua justificativa.

**No Silent Failure.** Nenhuma falha de coordenação é absorvida silenciosamente pelo Orchestrator; toda falha é sinalizada de forma explícita, sujeita a Fallback já documentado ou a comunicação clara ao Usuário.

**No Direct Agent Communication.** Nenhum Agente se comunica diretamente com outro Agente; toda comunicação entre Agentes é mediada exclusivamente pelo Orchestrator.

**Parallel When Possible.** Toda subtarefa sem dependência identificada em relação a outra é processada em paralelo, nunca sequencialmente sem necessidade real.

**Sequential When Necessary.** Toda subtarefa com dependência identificada é processada em sequência estrita, respeitando a ordem determinada pelo planejamento.

**Consolidation is Mandatory.** Nenhum resultado parcial de Agente é apresentado diretamente ao Usuário sem passar pela etapa de Consolidação já descrita no Capítulo 14.

**Explainability by Default.** Toda resposta consolidada pelo Orchestrator inclui, por padrão, referência ao raciocínio e ao contexto que a sustentam.

**Context Isolation Between Tenants.** Nenhum contexto reunido para uma Empresa é acessível, nem incidentalmente, à coordenação de outra Empresa.

**Memory Respects Ownership.** Toda memória gerenciada pelo Orchestrator é derivada de Evento, de Read Model ou de Conhecimento já catalogados, nunca uma fonte de verdade paralela.

**Fail Safe Coordination.** Diante de qualquer falha não recuperável, o Orchestrator interrompe a coordenação de forma segura, nunca prossegue com informação incompleta apresentando-a como completa.

**Idempotent Re-coordination.** Uma mesma solicitação reenviada ao Orchestrator, por exemplo após uma falha de rede, nunca produz coordenação duplicada nem efeito duplicado.

**Bounded Autonomy.** Toda autonomia de decisão concedida ao Orchestrator opera dentro de um limite já formalmente definido pela Execution Policy Layer, nunca acima desse limite.

**Consistent Prioritization.** O critério de priorização entre múltiplas subtarefas concorrentes é aplicado de forma consistente, nunca arbitrária ou variável sem justificativa documentada.

**Graceful Degradation.** A indisponibilidade de um Agente ou de uma Capability específica degrada apenas a funcionalidade que ela sustenta, nunca interrompe a coordenação de outras solicitações não relacionadas.

**Auditable Every Step.** Cada etapa do pipeline de decisão, já detalhado no Capítulo 6, produz registro auditável, permitindo reconstrução completa de qualquer coordenação passada.

**No Hidden State.** O Orchestrator nunca mantém estado oculto e não documentado entre uma coordenação e outra além da Memória já formalmente descrita no Capítulo 10.

**Provider Agnostic Coordination.** A lógica de coordenação do Orchestrator nunca depende de característica específica de um único modelo de inteligência artificial subjacente.

**Recoverable Planning.** Todo plano de execução já construído pode ser retomado a partir do último ponto de progresso confirmado, mesmo após interrupção de infraestrutura.

**Escalation to Human is Always Available.** Em qualquer etapa do pipeline, o Orchestrator pode escalar uma decisão a um Usuário humano quando a confiança em sua própria coordenação for insuficiente, nunca forçando uma conclusão automatizada de baixa confiança.

Estes trinta princípios se organizam em torno de uma progressão temporal que já estrutura o próprio pipeline de decisão detalhado no Capítulo 6 — do reconhecimento de intenção até a resposta final —, e em torno de uma disciplina de governança que atravessa todo esse pipeline, sem exceção.

Um agrupamento útil destes trinta princípios distingue quatro categorias complementares. Uma primeira categoria — Single Coordination Point, No Direct Agent Communication, Single Responsibility per Component, Explicit Delegation — trata da topologia de coordenação em si, garantindo que a estrutura de comunicação entre componentes permaneça sempre clara e centralizada. Uma segunda categoria — Capabilities Before Skills, Context Before Planning, Planning Before Execution, Policies Before Commands — estabelece a sequência temporal obrigatória do próprio pipeline de decisão, nunca permitindo que uma etapa posterior seja processada antes de sua predecessora. Uma terceira categoria — Human Before Automation, Business Before Intelligence, Determinism Before Creativity, Governance Before Autonomy — reafirma, no contexto específico de coordenação, a mesma hierarquia de autoridade já fixada por `AI_MANIFESTO.md` entre domínio, automação e inteligência. E uma quarta categoria — Traceable Coordination, No Silent Failure, Auditable Every Step, Explainability by Default — garante que toda essa coordenação permaneça observável e investigável, mesmo quando processa múltiplos Agentes simultaneamente através de fluxos complexos de colaboração.

Nenhuma destas quatro categorias pode ser sacrificada em favor de outra — um Orchestrator que respeite perfeitamente a sequência temporal do pipeline, mas falhe em produzir rastreabilidade suficiente, comprometeria a Auditabilidade já exigida como objetivo central em `AI_ARCHITECTURE.md`, Capítulo 2, mesmo operando de forma tecnicamente correta em todos os demais aspectos.

---

## 4. Arquitetura Geral

```
                                 Usuário
                                    │
                                    ▼
                            AI Orchestrator
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                    ▼                    ▼
          Intent Analyzer      Context Builder      Memory Manager
                │                    │                    │
                └───────────────────┼───────────────────┘
                                    ▼
                          Capability Selector
                                    │
                                    ▼
                            Planning Engine
                                    │
                                    ▼
                      Execution Policy Engine
                                    │
                                    ▼
                          Agent Coordinator
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                    ▼                    ▼
              Agent               Agent                Agent
                │                    │                    │
                └───────────────────┼───────────────────┘
                                    ▼
                       Result Consolidator
                                    │
                                    ▼
                          Human Approval
              (quando exigido pela Execution Policy)
                                    │
                                    ▼
                         Response Builder
                                    │
                                    ▼
                                Resposta
```

Este diagrama representa a composição interna completa do AI Orchestrator, expandindo o que `AI_ARCHITECTURE.md`, Capítulo 5, já descreveu em nível de responsabilidade geral. Cada um dos nove componentes visíveis neste diagrama — Intent Analyzer, Context Builder, Memory Manager, Capability Selector, Planning Engine, Execution Policy Engine, Agent Coordinator, Result Consolidator e Response Builder — é detalhado individualmente no Capítulo 5 deste documento.

A leitura deste diagrama revela uma propriedade estrutural central: os três primeiros componentes — Intent Analyzer, Context Builder e Memory Manager — operam em paralelo, cada um contribuindo com uma dimensão distinta de compreensão da solicitação recebida, e convergem antes que qualquer decisão de Capability seja tomada. A partir da Capability Selector, o processamento segue uma sequência estrita — Planning, Execution Policy, Agent Coordination — até que múltiplos Agentes, quando necessário, processem novamente em paralelo, convergindo de volta através do Result Consolidator.

Esta alternância entre paralelismo e sequência não é arbitrária — ela reflete exatamente onde existe, e onde não existe, dependência real entre etapas de processamento, aplicação direta do princípio Parallel When Possible e Sequential When Necessary já fixados no Capítulo 3.

A etapa de Human Approval, posicionada explicitamente entre o Result Consolidator e o Response Builder, nunca é contornada quando a Execution Policy Engine já determinou sua obrigatoriedade — este posicionamento no diagrama reflete, de forma estrutural e visualmente inequívoca, a soberania absoluta do princípio Human Oversight já central a `AI_MANIFESTO.md`.

Uma observação adicional relevante a esta visão geral diz respeito à relação entre este diagrama e a topologia de doze camadas já apresentada em `AI_ARCHITECTURE.md`, Capítulo 3. O diagrama daquele documento mostra o AI Orchestrator como uma única caixa entre a Experience Layer e a Capability Layer; o diagrama deste capítulo expande exatamente essa única caixa, revelando que ela, internamente, já contém referência direta às camadas de Capability, de Agent, de Skill — através do Agent Coordinator, que invoca Agentes que por sua vez invocam Skills — e de Execution Policy. Este documento não introduz uma nova topologia paralela; ele detalha, com granularidade adicional, exatamente a mesma topologia já estabelecida, mantendo perfeita consistência entre os dois documentos.

Um segundo aspecto relevante é a posição do Memory Manager neste diagrama, ao lado do Intent Analyzer e do Context Builder. Esta posição não é acidental — a memória relevante a uma solicitação é reunida no mesmo momento em que o contexto imediato é construído, permitindo que informação já persistida de interações anteriores complemente, desde o início do pipeline, a compreensão da intenção atual, em vez de ser consultada apenas tardiamente, quando já poderia ser tarde demais para influenciar corretamente a Capability Resolution subsequente.

---

## 5. Componentes Internos

### Intent Analyzer

O Intent Analyzer tem como responsabilidade interpretar a solicitação recebida da Experience Layer e identificar sua intenção subjacente — o que o Usuário efetivamente deseja alcançar, distinto da forma literal com que a solicitação foi expressa. Sua entrada é a solicitação bruta já recebida da Experience Layer; sua saída é uma representação estruturada de intenção, consumida em seguida pelo Capability Selector. O limite estrito do Intent Analyzer é que ele nunca decide, ele mesmo, qual Capability responde a essa intenção — essa decisão pertence exclusivamente ao Capability Selector.

### Context Builder

O Context Builder tem como responsabilidade reunir toda informação relevante à intenção já identificada — Read Model já catalogado em `QUERY_CATALOG.md`, Conhecimento já indexado pelo Knowledge Hub, e histórico de interação relevante. Sua entrada é a intenção estruturada produzida pelo Intent Analyzer; sua saída é um contexto consolidado, aplicando o ciclo completo de construção, redução e enriquecimento já detalhado em `AI_ARCHITECTURE.md`, Capítulo 12. Seu limite estrito é nunca reter esse contexto além do escopo da solicitação atual, salvo quando explicitamente promovido a Memória persistente pelo Memory Manager.

### Memory Manager

O Memory Manager tem como responsabilidade administrar toda categoria de memória já descrita em `AI_ARCHITECTURE.md`, Capítulo 11 — efêmera, persistente, compartilhada, contextual e organizacional. Sua entrada é tanto a solicitação de recuperação de memória relevante quanto a solicitação de persistência de novo contexto relevante ao final de um ciclo de coordenação; sua saída é a memória recuperada, disponibilizada ao Context Builder, ou a confirmação de persistência de nova memória. Seu limite estrito é o isolamento absoluto entre Empresas distintas, conforme já fixado em `AI_HUB.md`, ADR-008.

### Capability Selector

O Capability Selector tem como responsabilidade identificar, a partir da intenção já estruturada e do contexto já reunido, qual Capability, ou qual combinação de Capabilities, já catalogadas conceitualmente em `AI_ARCHITECTURE.md`, Capítulo 6, responde à solicitação em curso. Sua entrada é a intenção e o contexto já consolidados; sua saída é a Capability, ou o conjunto de Capabilities, selecionadas para processamento. Seu limite estrito é nunca inventar uma Capability não já registrada — se nenhuma Capability existente responde adequadamente à solicitação, essa ausência é comunicada explicitamente, nunca preenchida por uma capacidade improvisada.

### Planning Engine

O Planning Engine tem como responsabilidade decompor a Capability já selecionada em um plano de subtarefas executáveis, identificando dependência entre elas, conforme já detalhado em `AI_ARCHITECTURE.md`, Capítulo 13. Sua entrada é a Capability já selecionada; sua saída é um plano estruturado de subtarefas, cada uma associada a um Agente ou a uma Skill candidata. Seu limite estrito é nunca executar, ele mesmo, nenhuma subtarefa — apenas planejá-la.

### Execution Policy Engine

O Execution Policy Engine tem como responsabilidade determinar, para cada subtarefa já planejada que envolva potencial mudança de estado, qual política de execução — já catalogada em `AI_ARCHITECTURE.md`, Capítulo 10, e detalhada no Capítulo 13 deste documento — se aplica. Sua entrada é o plano já construído pelo Planning Engine; sua saída é o plano anotado com a política de execução aplicável a cada subtarefa relevante. Seu limite estrito é nunca decidir, ele mesmo, o conteúdo de uma sugestão — apenas a condição sob a qual ela pode ser processada.

### Agent Coordinator

O Agent Coordinator tem como responsabilidade delegar cada subtarefa já planejada e já anotada com sua política de execução ao Agente mais apropriado, coordenando processamento paralelo ou sequencial conforme a dependência já identificada. Sua entrada é o plano já anotado pelo Execution Policy Engine; sua saída é o conjunto de resultados parciais produzidos por cada Agente delegado. Seu limite estrito é nunca processar, ele mesmo, o raciocínio de nenhuma subtarefa — apenas coordenar sua delegação e seu acompanhamento.

### Result Consolidator

O Result Consolidator tem como responsabilidade combinar os resultados parciais de múltiplos Agentes em uma resposta única e coerente, resolvendo qualquer conflito identificado conforme já detalhado no Capítulo 14. Sua entrada é o conjunto de resultados parciais produzidos pelo Agent Coordinator; sua saída é um resultado consolidado, encaminhado à etapa de Human Approval quando aplicável, ou diretamente ao Response Builder quando não exigida.

### Response Builder

O Response Builder tem como responsabilidade traduzir o resultado já consolidado, e já aprovado quando exigido, em uma resposta apresentável ao Usuário através da Experience Layer. Sua entrada é o resultado consolidado e aprovado; sua saída é a resposta final na forma consumível pela Experience Layer. Seu limite estrito é nunca alterar o conteúdo substantivo do resultado já consolidado — apenas sua forma de apresentação.

Estes nove componentes compartilham uma propriedade estrutural importante que merece registro explícito: cada um deles pode ser avaliado, testado e evoluído de forma inteiramente independente dos demais, desde que seu contrato de entrada e de saída, já documentado individualmente acima, permaneça estável. Um futuro aprimoramento do Intent Analyzer, por exemplo — uma capacidade mais refinada de identificar intenção ambígua ou composta — nunca exige mudança correspondente no Context Builder, no Memory Manager ou em qualquer componente subsequente do pipeline, desde que o Intent Analyzer continue produzindo a mesma representação estruturada de intenção que o Capability Selector já espera consumir.

Uma segunda propriedade relevante é a assimetria de complexidade entre os nove componentes — Intent Analyzer, Context Builder e Memory Manager tendem a processar toda solicitação recebida pelo Orchestrator, tornando-se os componentes de maior volume de invocação; Planning Engine e Execution Policy Engine processam com menor frequência, ativados apenas quando a solicitação envolve real complexidade de decomposição ou potencial mudança de estado; e Result Consolidator é ativado apenas quando mais de um Agente foi delegado, sendo dispensável em toda solicitação processada por um único Agente isoladamente. Esta assimetria de frequência de invocação é uma consideração relevante para qualquer futuro dimensionamento de capacidade de processamento de cada componente, embora este documento, mantendo seu escopo estritamente estrutural, nunca prescreva a implementação técnica específica dessa capacidade.

```
              NOVE COMPONENTES DO ORCHESTRATOR (resumo)
   ┌───────────────────────────────────────────────────────────┐
   │  Intent Analyzer        → interpreta intenção                      │
   │  Context Builder         → reúne contexto relevante                    │
   │  Memory Manager           → administra toda categoria de memória           │
   │  Capability Selector       → identifica Capability aplicável                    │
   │  Planning Engine            → decompõe em subtarefas executáveis                        │
   │  Execution Policy Engine     → determina política de execução                                 │
   │  Agent Coordinator            → delega e acompanha Agentes                                        │
   │  Result Consolidator            → combina resultados parciais                                          │
   │  Response Builder                 → traduz resultado em resposta final                                     │
   └───────────────────────────────────────────────────────────┘
```

---

## 6. Pipeline de Decisão

```
   Request
      │
      ▼
   Intent Analysis
      │
      ▼
   Context Assembly
      │
      ▼
   Memory Retrieval
      │
      ▼
   Capability Resolution
      │
      ▼
   Planning
      │
      ▼
   Execution Policy
      │
      ▼
   Agent Delegation
      │
      ▼
   Execution
      │
      ▼
   Consolidation
      │
      ▼
   Human Approval
      │
      ▼
   Response
```

Request é o momento em que a solicitação bruta do Usuário chega ao Orchestrator através da Experience Layer, ainda sem nenhuma interpretação ou estrutura aplicada.

Intent Analysis é a etapa em que o Intent Analyzer produz a representação estruturada da intenção subjacente à solicitação recebida.

Context Assembly é a etapa em que o Context Builder reúne toda informação relevante — Read Model, Conhecimento, histórico — associada a essa intenção já identificada.

Memory Retrieval é a etapa, coordenada com a anterior, em que o Memory Manager recupera memória relevante já persistida de interações passadas, complementando o contexto recém-reunido.

Capability Resolution é a etapa em que o Capability Selector identifica qual Capability, ou qual combinação delas, responde adequadamente à intenção já estruturada e ao contexto já consolidado.

Planning é a etapa em que o Planning Engine decompõe a Capability já resolvida em um plano de subtarefas executáveis, identificando dependência entre elas.

Execution Policy é a etapa em que o Execution Policy Engine anota cada subtarefa relevante com a política de execução aplicável, determinando antecipadamente se exigirá confirmação humana.

Agent Delegation é a etapa em que o Agent Coordinator distribui cada subtarefa já planejada e já anotada ao Agente mais apropriado para processá-la.

Execution é a etapa em que cada Agente já delegado processa sua subtarefa específica, possivelmente invocando uma ou mais Skills através da Skill Runtime já descrita em `AI_ARCHITECTURE.md`, Capítulo 8.

Consolidation é a etapa em que o Result Consolidator combina todo resultado parcial já produzido em uma resposta única e coerente.

Human Approval é a etapa, aplicada sempre que a Execution Policy já determinada assim exigir, em que a resposta consolidada é apresentada ao Usuário para confirmação explícita antes de qualquer efeito de negócio real.

Response é a etapa final, em que o Response Builder traduz o resultado já consolidado e já aprovado, quando exigido, em uma resposta apresentável de volta ao Usuário através da Experience Layer.

```
              TEMPO E CATEGORIA DE CADA ETAPA DO PIPELINE
   ┌───────────────────────────────────────────────────────────┐
   │  Etapas de compreensão:   Intent Analysis · Context               │
   │                          Assembly · Memory Retrieval                   │
   │  Etapas de decisão:       Capability Resolution · Planning ·                 │
   │                          Execution Policy                                        │
   │  Etapas de execução:      Agent Delegation · Execution                               │
   │  Etapas de finalização:   Consolidation · Human Approval ·                                │
   │                          Response                                                             │
   └───────────────────────────────────────────────────────────┘
```

Este pipeline de doze etapas nunca é interrompido ou reordenado por conveniência de implementação — mesmo quando uma solicitação é suficientemente simples para tornar uma etapa específica trivial, como uma Consultation pura que dispensa qualquer Planning real, essa etapa ainda é formalmente percorrida, apenas com processamento mínimo, nunca omitida da sequência. Esta disciplina garante que toda solicitação, independentemente de sua complexidade aparente, produza o mesmo nível de Observabilidade e de Auditabilidade já exigido transversalmente por este documento e por `AI_ARCHITECTURE.md`, Capítulo 2 — uma consulta simples é tão rastreável quanto uma coordenação complexa de múltiplos Agentes.

Um segundo aspecto relevante deste pipeline é sua reversibilidade parcial em caso de falha — cada etapa, ao concluir com sucesso, produz um ponto de Checkpoint que permite retomada em caso de interrupção subsequente, sem exigir reprocessamento das etapas já concluídas, aplicação direta do princípio Recoverable Planning já fixado no Capítulo 3, e detalhado com maior profundidade no Capítulo 15 deste documento.

---

## 7. Coordenação

Distribuição é o mecanismo pelo qual o Agent Coordinator encaminha cada subtarefa já planejada ao Agente mais apropriado, considerando sua especialização já registrada e sua disponibilidade atual de processamento.

Paralelismo é aplicado sempre que duas ou mais subtarefas não possuem dependência identificada entre si, permitindo que sejam processadas simultaneamente sem que uma aguarde a conclusão da outra.

Sincronização é o mecanismo complementar, aplicado quando uma subtarefa depende do resultado de outra já identificada durante o planejamento, garantindo que a subtarefa dependente só inicie após a conclusão da subtarefa da qual depende.

Balanceamento é a distribuição equilibrada de carga entre múltiplas instâncias de um mesmo tipo de Agente, garantindo que nenhuma instância receba volume desproporcional de subtarefa delegada.

Priorização é o critério pelo qual, diante de múltiplas subtarefas concorrentes, o Orchestrator decide a ordem de processamento mais eficiente, respeitando toda dependência já identificada e toda urgência de negócio já sinalizada.

Cancelamento é a capacidade de interromper o processamento de uma subtarefa já delegada quando sua conclusão deixa de ser necessária — por exemplo, quando o próprio Usuário cancela a solicitação original antes de sua conclusão completa.

Recuperação é a capacidade de retomar uma coordenação interrompida por falha de infraestrutura a partir do último ponto de progresso confirmado, sem reprocessar subtarefa já concluída com sucesso, aplicação direta do princípio Recoverable Planning já fixado no Capítulo 3.

```
              COORDENAÇÃO DE MÚLTIPLAS SUBTAREFAS (exemplo)
   ┌───────────────────────────────────────────────────────────┐
   │  Subtarefa A (sem dependência) ──► processada em paralelo         │
   │  Subtarefa B (sem dependência) ──► processada em paralelo             │
   │  Subtarefa C (depende de A) ──► aguarda conclusão de A antes               │
   │                                de iniciar                                     │
   │       │                                                        │
   │       ▼                                                        │
   │  Todas concluídas ──► Result Consolidator combina resultado                       │
   └───────────────────────────────────────────────────────────┘
```

A distinção entre Coordenação e Colaboração, dois capítulos próximos e relacionados deste documento, merece um esclarecimento explícito: Coordenação, tratada neste capítulo, refere-se à disciplina técnica de distribuição, de sincronização e de sequenciamento de subtarefas já planejadas — a mecânica de como o processamento efetivamente flui entre componentes. Colaboração, tratada no Capítulo 14, refere-se à disciplina de como múltiplos Agentes, já coordenados por este mecanismo, efetivamente combinam seu raciocínio especializado em um resultado conjunto. A primeira é a infraestrutura; a segunda é o comportamento que essa infraestrutura sustenta.

O Balanceamento de carga, já introduzido acima, adquire relevância adicional em cenário de múltiplas Empresas operando simultaneamente através da mesma infraestrutura compartilhada de Orchestrator — o mesmo princípio de Noisy Neighbor Prevention já detalhado em `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 11, se aplica integralmente à coordenação de Inteligência Artificial: o volume de solicitação de uma Empresa nunca degrada a latência de coordenação percebida por outra Empresa operando na mesma plataforma compartilhada.

---

## 8. Planejamento

Decomposição é o processo pelo qual o Planning Engine transforma um objetivo amplo, identificado pela Capability já resolvida, em subtarefas menores e diretamente executáveis por um Agente ou por uma Skill específica.

Dependências entre subtarefas são identificadas explicitamente durante o próprio processo de decomposição, garantindo que a sequência de execução, já detalhada no Capítulo 7, respeite toda relação de precedência real entre elas.

Objetivos são sempre explícitos antes de qualquer decomposição — o Planning Engine nunca decompõe uma solicitação sem que a Capability Resolution já tenha identificado claramente o que a solicitação deseja alcançar.

Subtarefas resultantes da decomposição são sempre unidades pequenas o suficiente para serem delegadas de forma isolada a um único Agente ou a uma única Skill, nunca unidades tão amplas que exijam, elas mesmas, uma decomposição interna adicional não planejada previamente.

Replanejamento acontece quando uma subtarefa já em execução produz resultado inesperado, ou quando uma nova informação relevante surge durante o processamento — o Planning Engine ajusta apenas a parte do plano afetada, nunca reconstruindo desnecessariamente subtarefas já concluídas com sucesso.

Acompanhamento do progresso de um plano já em execução é mantido continuamente pelo Agent Coordinator, permitindo que o Planning Engine seja acionado para Replanejamento no momento exato em que uma divergência é identificada, nunca apenas ao final de todo o processamento.

```
              CICLO DE PLANEJAMENTO E REPLANEJAMENTO
   ┌───────────────────────────────────────────────────────────┐
   │  Objetivo identificado ──► Decomposição em Subtarefas              │
   │  ──► Identificação de Dependências ──► Execução ──►                     │
   │  Acompanhamento contínuo                                                     │
   │       │                                                        │
   │       ├──► resultado conforme esperado ──► prossegue                            │
   │       │                                                        │
   │       └──► resultado inesperado ──► Replanejamento da porção                        │
   │            afetada, preservando o restante do plano                                       │
   └───────────────────────────────────────────────────────────┘
```

---

## 9. Gerenciamento de Contexto

Coleta é a primeira etapa do Context Builder — reunir toda fonte de informação potencialmente relevante à intenção já identificada, incluindo Read Model, Conhecimento documental e histórico de interação.

Enriquecimento complementa a coleta inicial com informação adicional identificada como relevante durante o próprio processamento, mesmo quando não explicitamente solicitada de início, conforme já detalhado em `AI_ARCHITECTURE.md`, Capítulo 12.

Redução elimina do contexto já coletado toda informação irrelevante ou redundante, garantindo que o raciocínio subsequente opere sobre um volume suficiente, mas nunca excessivo, de informação.

Expiração garante que informação contextual não permaneça disponível além de sua relevância real, prevenindo que uma coordenação futura se baseie em contexto já desatualizado.

Isolamento garante que o contexto reunido para uma Empresa nunca seja acessível, nem incidentalmente, à coordenação de solicitação de outra Empresa, aplicação absoluta do princípio Context Isolation Between Tenants já fixado no Capítulo 3.

Compartilhamento, distinto de vazamento entre Empresas, é o mecanismo pelo qual o mesmo contexto já reunido para uma única solicitação é disponibilizado a múltiplos Agentes envolvidos no processamento dessa mesma solicitação, evitando reconstrução redundante por cada um.

```
              GERENCIAMENTO DE CONTEXTO (ciclo completo)
   ┌───────────────────────────────────────────────────────────┐
   │  Coleta ──► Enriquecimento ──► Redução ──► Compartilhamento          │
   │  entre Agentes da mesma solicitação ──► Expiração após                    │
   │  relevância cessar                                                              │
   │                                                                │
   │  Isolamento aplicado em toda etapa, sem exceção, entre                              │
   │  Empresas distintas                                                                        │
   └───────────────────────────────────────────────────────────┘
```

---

## 10. Gerenciamento de Memória

Memória efêmera é administrada pelo Memory Manager exclusivamente durante o ciclo de vida de uma única solicitação, descartada imediatamente ao final de seu processamento sem persistência adicional.

Memória persistente é administrada além do escopo de uma única solicitação, permitindo que uma coordenação futura reconstrua continuidade de interação com o mesmo Usuário, sempre respeitando a política de retenção já aplicável.

Memória organizacional é a categoria de maior sensibilidade administrada pelo Memory Manager — o contexto de longo prazo específico de uma Empresa cliente, preservado com isolamento absoluto em relação a qualquer outra Empresa, conforme já fixado em `AI_HUB.md`, ADR-008.

Memória compartilhada, distinta da memória organizacional isolada por Empresa, é o contexto acessível por múltiplos Agentes durante o processamento de uma mesma solicitação, sempre mediado pelo Memory Manager, nunca por acesso direto de um Agente à memória interna de outro.

```
              CATEGORIAS DE MEMÓRIA ADMINISTRADAS PELO MEMORY MANAGER
   ┌───────────────────────────────────────────────────────────┐
   │  Efêmera:        descartada ao final de uma única solicitação      │
   │  Persistente:     mantida além de uma única solicitação                │
   │  Organizacional:   isolada de forma absoluta por Empresa                   │
   │  Compartilhada:     acessível por múltiplos Agentes, mediada pelo               │
   │                   Memory Manager                                                    │
   └───────────────────────────────────────────────────────────┘
```

Nenhuma memória administrada pelo Memory Manager jamais se torna, ela mesma, uma fonte de verdade de negócio — toda memória permanece derivada de Evento, de Read Model ou de Conhecimento já catalogados pelo Architecture Handbook, aplicação direta do princípio Memory Respects Ownership já fixado no Capítulo 3.

A relação entre o Memory Manager, aqui descrito como componente interno do Orchestrator, e as categorias de memória já introduzidas em nível conceitual por `AI_ARCHITECTURE.md`, Capítulo 11, é de implementação direta — este componente é o mecanismo técnico específico através do qual aquelas cinco categorias conceituais de memória são efetivamente administradas dentro do fluxo de coordenação do Orchestrator. Nenhuma nova categoria de memória é introduzida por este documento; o Memory Manager apenas opera sobre as mesmas cinco categorias já estabelecidas, nunca inventando uma sexta categoria não documentada.

Um aspecto de segurança particularmente relevante ao Memory Manager, complementar ao já detalhado no Capítulo 17, é a distinção entre memória que pode legitimamente influenciar uma futura coordenação e memória que deveria ter expirado, mas permanece indevidamente retida. O Memory Manager aplica, de forma contínua, a mesma disciplina de Expiração já detalhada no Capítulo 9 sobre Contexto, garantindo que memória persistente nunca se torne memória permanente por omissão de manutenção — uma distinção sutil, porém crítica, para que o princípio Recommendations Decay já fixado em `AI_MANIFESTO.md`, Capítulo 3, seja efetivamente respeitado na prática de coordenação, não apenas em sua declaração filosófica.

---

## 11. Seleção de Capacidades

Descoberta de Capability acontece quando o Capability Selector identifica, dentro do conjunto já registrado de Capabilities disponíveis, quais delas respondem à intenção estruturada e ao contexto já reunido para uma solicitação específica.

Priorização de Capability é aplicada quando mais de uma Capability responde parcialmente à mesma solicitação — o Capability Selector escolhe aquela cuja correspondência ao contexto e à intenção já identificados é mais precisa, nunca uma escolha arbitrária entre múltiplas candidatas equivalentes.

Cooperação entre múltiplas Capabilities acontece quando uma solicitação exige mais de uma capacidade de negócio simultaneamente — por exemplo, uma solicitação que combine apoio à análise de crescimento com apoio à análise financeira, já exemplificado em `AI_MANIFESTO.md`, Capítulo 12, através do caso de uso de análise de risco de inadimplência. Nesses casos, o Capability Selector identifica todas as Capabilities relevantes, e o Planning Engine subsequente já as incorpora como diferentes ramos do mesmo plano de subtarefas.

```
              SELEÇÃO DE CAPABILITY (fluxo de decisão)
   ┌───────────────────────────────────────────────────────────┐
   │  Intenção e contexto já consolidados                           │
   │       │                                                        │
   │       ▼                                                        │
   │  Descoberta de Capabilities candidatas                             │
   │       │                                                        │
   │       ├──► uma única Capability corresponde ──► seleção direta         │
   │       │                                                        │
   │       └──► múltiplas Capabilities correspondem parcialmente               │
   │            ──► Cooperação entre elas, incorporada ao plano                     │
   │            subsequente                                                              │
   └───────────────────────────────────────────────────────────┘
```

Nenhuma Capability é inventada pelo Capability Selector no momento da solicitação — toda Capability já existe, registrada formalmente, antes de qualquer solicitação real que venha a utilizá-la, aplicação direta da disciplina de nomenclatura explícita já exigida em `AI_ARCHITECTURE.md`, Capítulo 6.

Quando nenhuma Capability já registrada corresponde adequadamente à intenção identificada, o Capability Selector comunica essa ausência de forma explícita ao Usuário, nunca tentando aproximar forçadamente uma Capability parcialmente relacionada como se fosse uma correspondência completa. Esta honestidade de resultado, mesmo quando frustrante para o Usuário no momento imediato, preserva a confiança de longo prazo na plataforma — uma sugestão de baixa qualidade, apresentada como se fosse de alta qualidade, é sempre mais prejudicial do que uma comunicação clara de limitação atual.

---

## 12. Seleção de Agentes

Agentes são escolhidos pelo Agent Coordinator a partir da subtarefa específica já planejada, considerando a especialização declarada de cada Agente disponível e a correspondência entre essa especialização e a natureza exata da subtarefa.

Especializações são consideradas de forma estrita — o Agent Coordinator nunca delega uma subtarefa a um Agente cuja especialização declarada não corresponda a ela, mesmo quando esse Agente esteja disponível e outro mais apropriado esteja temporariamente ocupado; nesse cenário, a subtarefa aguarda disponibilidade do Agente correto, ou é escalada para atenção humana quando o atraso se torna significativo.

Colaboração entre Agentes já selecionados é organizada inteiramente pelo Agent Coordinator, aplicando a mesma disciplina de mediação central já detalhada em `AI_ARCHITECTURE.md`, Capítulo 7 — nenhum Agente já selecionado se comunica diretamente com outro Agente também selecionado para a mesma solicitação; toda troca de informação entre eles acontece através do Orchestrator.

Um caso particular de seleção de Agente merece registro explícito: quando nenhum Agente disponível possui especialização suficientemente próxima da subtarefa em questão, o Agent Coordinator nunca força a delegação a um Agente de especialização incompatível apenas para evitar atraso — essa ausência de correspondência adequada é tratada como uma limitação real da capacidade atual da plataforma, comunicada explicitamente, e registrada como sinal relevante para o desenvolvimento futuro de um novo Agente mais apropriado àquela categoria específica de subtarefa ainda não plenamente coberta.

```
              SELEÇÃO DE AGENTE PARA UMA SUBTAREFA ESPECÍFICA
   ┌───────────────────────────────────────────────────────────┐
   │  Subtarefa planejada                                           │
   │       │                                                        │
   │       ▼                                                        │
   │  Agent Coordinator identifica Agentes com especialização               │
   │  correspondente                                                            │
   │       │                                                        │
   │       ├──► Agente correto disponível ──► delegação imediata               │
   │       │                                                        │
   │       └──► Agente correto indisponível ──► aguarda ou escala                    │
   │            para atenção humana, nunca delega a Agente de                             │
   │            especialização incorreta                                                        │
   └───────────────────────────────────────────────────────────┘
```

---

## 13. Políticas de Execução

Read Only é aplicada quando a subtarefa em processamento é puramente consultiva, sem produzir sugestão de ação nem possibilidade de execução — o Orchestrator processa e retorna o resultado diretamente, sem passar pela etapa de Human Approval.

Recommendation Only é aplicada quando a subtarefa produz uma sugestão explicável, mas nenhuma execução é sequer proposta — o resultado é apresentado ao Usuário como insumo de decisão, sem exigir confirmação formal porque nenhuma ação real está em jogo.

Human Approval é aplicada sempre que a subtarefa envolve potencial mudança de estado de negócio real — o Execution Policy Engine marca essa subtarefa explicitamente, e o pipeline de decisão já detalhado no Capítulo 6 garante que a etapa de Human Approval seja executada antes de qualquer Command ser formalmente invocado.

Automatic Execution é aplicada apenas a ação já delimitada como de baixo impacto e já validada ao longo do tempo, conforme o princípio Trust is Earned Incrementally já fixado em `AI_MANIFESTO.md` — o Orchestrator, mesmo nesse caso, preserva registro completo da execução para auditoria posterior.

Simulation é aplicada quando uma nova Capability, ou uma nova combinação de Agentes, precisa ser validada antes de sua liberação real — o Orchestrator processa o pipeline de decisão completo em ambiente isolado, sem que o Command final alcance efetivamente o Command Bus.

Dry Run é aplicada de forma mais pontual do que a Simulation, verificando o efeito esperado de uma única subtarefa específica antes de sua apresentação ao Usuário, sem processar o restante do plano em ambiente isolado.

O Orchestrator decide qual política aplicar a cada subtarefa através do Execution Policy Engine, considerando a natureza do Command potencialmente envolvido, o histórico de confiabilidade já demonstrado pela Capability em questão, e a Configuration já definida pela Empresa cliente através do Business Profile Engine, exatamente como já detalhado em `AI_ARCHITECTURE.md`, Capítulo 10.

Um esclarecimento adicional relevante a este capítulo é que a política de execução determinada pelo Execution Policy Engine não é fixa por Capability de forma permanente e imutável — a mesma Capability pode ser processada, em ocasiões distintas, sob políticas diferentes, dependendo do contexto específico de cada solicitação. Uma Capability de apoio financeiro, por exemplo, pode operar sob Recommendation Only quando a subtarefa em questão envolve apenas consulta e análise de indicador já consolidado, e sob Human Approval quando essa mesma Capability, em outra ocasião, é acionada em um contexto que efetivamente propõe uma mudança de estado financeiro real. O Execution Policy Engine avalia essa determinação a cada nova subtarefa, nunca aplicando uma classificação estática e desatualizada.

---

```
              DECISÃO DE POLÍTICA DE EXECUÇÃO (critério consolidado)
   ┌───────────────────────────────────────────────────────────┐
   │  Subtarefa envolve mudança de estado?                           │
   │       │                                                        │
   │       ├──► Não ──► Read Only ou Recommendation Only                    │
   │       │                                                        │
   │       └──► Sim ──► qual o impacto estimado?                                │
   │                    │                                                    │
   │                    ├──► alto impacto ──► Human Approval                      │
   │                    │                                                        │
   │                    └──► baixo impacto já validado ──► Automatic                  │
   │                         Execution                                                    │
   └───────────────────────────────────────────────────────────┘
```

---

## 14. Consolidação

Fusão é o processo pelo qual o Result Consolidator combina múltiplos resultados parciais, produzidos por Agentes distintos, em uma única estrutura de resposta coerente, eliminando redundância de informação repetida entre eles.

Consenso é aplicado quando dois ou mais Agentes produzem conclusão convergente sobre o mesmo aspecto de uma solicitação, reforçando a confiança na resposta final consolidada.

Resolução de conflitos é aplicada quando dois Agentes produzem conclusão divergente sobre o mesmo aspecto, seguindo critério de precedência já formalmente estabelecido — por exemplo, a conclusão do Agente com maior especialização documentada sobre o aspecto específico em disputa prevalece sobre a conclusão de um Agente de especialização mais geral.

Eliminação de duplicidade garante que informação equivalente, produzida por mais de um Agente de forma independente, seja apresentada uma única vez na resposta final, nunca repetida de forma redundante.

Priorização, no contexto de Consolidação, determina qual informação recebe destaque mais proeminente na resposta final, com base na relevância já identificada durante o Intent Analysis original da solicitação.

Rastreabilidade é preservada durante toda a Consolidação — mesmo após a fusão de múltiplos resultados parciais em uma resposta única, é sempre possível reconstruir qual Agente e qual Skill específicos produziram cada porção da resposta final, sustentando a Auditabilidade já exigida em `AI_ARCHITECTURE.md`, Capítulo 2.

Esta Rastreabilidade nunca é sacrificada em nome de uma resposta final mais fluida e mais natural em sua apresentação — mesmo quando o Response Builder, na etapa subsequente já descrita no Capítulo 5, produz uma resposta em linguagem contínua e legível, a referência de origem de cada porção substantiva dessa resposta permanece disponível para consulta, ainda que não necessariamente exibida de forma proeminente na primeira leitura apresentada ao Usuário.

```
              CONSOLIDAÇÃO DE MÚLTIPLOS RESULTADOS PARCIAIS
   ┌───────────────────────────────────────────────────────────┐
   │  Resultado do Agente 1  ─┐                                      │
   │  Resultado do Agente 2  ─┼──► Fusão e eliminação de                 │
   │  Resultado do Agente 3  ─┘    duplicidade                              │
   │                                    │                                    │
   │                                    ▼                                    │
   │                          Resolução de conflito, se houver                    │
   │                          divergência entre resultados                             │
   │                                    │                                    │
   │                                    ▼                                    │
   │                          Priorização de informação relevante                          │
   │                                    │                                    │
   │                                    ▼                                    │
   │                          Resposta única, rastreável até cada                              │
   │                          origem individual                                                    │
   └───────────────────────────────────────────────────────────┘
```

---

## 15. Tratamento de Falhas

Timeouts limitam o tempo máximo que o Orchestrator aguarda por resposta de um Agente, de uma Skill ou de uma dependência externa antes de considerar essa etapa como falha, evitando bloqueio indefinido de todo o pipeline de decisão.

Indisponibilidade de um Agente ou de uma Capability específica é tratada através de Fallback já configurado, quando disponível, ou através de comunicação explícita ao Usuário de que aquela funcionalidade específica está temporariamente indisponível, nunca através de silêncio ou de resposta incompleta apresentada como completa.

Inconsistência entre resultados parciais de diferentes Agentes, quando não resolvível através do critério de precedência já descrito no Capítulo 14, é escalada para decisão humana explícita, nunca resolvida por uma escolha arbitrária e não documentada do próprio Orchestrator.

Degradação controlada garante que a falha de um componente específico do Orchestrator — por exemplo, a indisponibilidade momentânea do Memory Manager — reduza a qualidade da coordenação apenas na dimensão específica afetada, nunca interrompendo o processamento inteiro de uma solicitação que poderia prosseguir com qualidade reduzida em vez de falhar completamente.

Retry é aplicado a falha transitória de comunicação com um Agente, com uma Skill ou com uma dependência externa, sempre respeitando a garantia de Idempotência já central a toda arquitetura da Adaptive Business Platform.

Fallback é o comportamento alternativo aceitável aplicado quando uma dependência falha de forma persistente, já detalhado como conceito em `AI_ARCHITECTURE.md`, Capítulo 15, aqui aplicado especificamente ao contexto interno de coordenação do Orchestrator.

Isolamento garante que a falha de uma subtarefa específica, delegada a um Agente específico, nunca comprometa o processamento de outra subtarefa não relacionada, mesma disciplina de Fault Isolation já central a toda a plataforma.

```
              CADEIA DE TRATAMENTO DE FALHA NO ORCHESTRATOR
   ┌───────────────────────────────────────────────────────────┐
   │  Falha detectada (Timeout, Indisponibilidade, Inconsistência)     │
   │       │                                                        │
   │       ▼                                                        │
   │  Retry, se a falha for transitória                                 │
   │       │                                                        │
   │       ▼                                                        │
   │  Fallback, se a falha persistir                                        │
   │       │                                                        │
   │       ▼                                                        │
   │  Degradação controlada, isolando o impacto à funcionalidade                │
   │  específica afetada                                                            │
   │       │                                                        │
   │       ▼                                                        │
   │  Escalação a decisão humana, se nenhuma resolução automática                     │
   │  for suficiente                                                                       │
   └───────────────────────────────────────────────────────────┘
```

O princípio Fail Safe Coordination, já fixado no Capítulo 3, orienta toda decisão tomada ao longo desta cadeia — diante de qualquer ambiguidade sobre se uma falha já foi suficientemente resolvida, o Orchestrator sempre escolhe o caminho mais conservador, comunicando incerteza explicitamente ao Usuário em vez de apresentar uma resposta de confiança inflada. Esta escolha reflete diretamente o princípio Fail Safe, Not Fail Silent já fixado em `AI_MANIFESTO.md`, Capítulo 3 — uma resposta parcial claramente sinalizada como parcial é sempre preferível a uma resposta completa que, na realidade, esconde uma falha não resolvida em algum componente de sua composição.

---

## 16. Observabilidade

Métricas produzidas pelo Orchestrator incluem volume de solicitação processada, latência de cada etapa do pipeline de decisão, taxa de sucesso de Agent Delegation, e taxa de acionamento de Human Approval por Capability.

Auditoria preserva o registro imutável de toda coordenação já processada, incluindo qual Capability foi selecionada, qual Agente foi delegado, qual política de execução foi aplicada, e qual decisão de confirmação humana, quando exigida, foi tomada.

Tracing conecta toda etapa do pipeline de decisão de ponta a ponta, permitindo reconstruir exatamente como uma solicitação específica percorreu desde o Intent Analysis até a Response final, mesmo quando múltiplos Agentes foram envolvidos.

Decisões tomadas pelo Orchestrator — qual Capability selecionar, qual Agente delegar, qual política aplicar — são registradas de forma explícita e rastreável, nunca inferidas retroativamente a partir de comportamento observado.

Explicabilidade é garantida pela mesma disciplina já central a `AI_MANIFESTO.md` — toda resposta consolidada e apresentada ao Usuário referencia o raciocínio e o contexto que a sustentam, permitindo que qualquer sugestão seja questionada e verificada.

Logs conceituais, entendidos como o registro estruturado de cada etapa do pipeline sem especificação de formato técnico específico, sustentam toda a Observabilidade descrita neste capítulo, seguindo o mesmo padrão de estruturação já exigido transversalmente em `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 9.

```
              OBSERVABILIDADE DO ORCHESTRATOR (visão consolidada)
   ┌───────────────────────────────────────────────────────────┐
   │  Métricas:      volume, latência por etapa, taxa de sucesso        │
   │  Auditoria:      registro imutável de toda coordenação                 │
   │  Tracing:        rastreamento de ponta a ponta do pipeline                  │
   │  Decisões:       registradas explicitamente, nunca inferidas                     │
   │  Explicabilidade: raciocínio sempre referenciável na resposta final                     │
   └───────────────────────────────────────────────────────────┘
```

A Observabilidade do Orchestrator possui uma característica distintiva em relação à Observabilidade já exigida de qualquer Business Hub tradicional — além de métrica técnica de desempenho, ela precisa sustentar uma segunda dimensão de investigação, específica à natureza de coordenação de raciocínio: a capacidade de reconstruir não apenas o que aconteceu, mas por que o Orchestrator escolheu processar dessa forma específica — por que esta Capability e não outra, por que este Agente e não outro, por que esta política de execução e não outra mais permissiva ou mais restritiva. Esta segunda dimensão, exclusiva de um componente de coordenação de Inteligência Artificial, é sustentada pelo registro explícito de Decisões já descrito acima, e nunca pode ser reconstruída apenas a partir de Métrica ou de Tracing técnico tradicional isoladamente.

---

## 17. Segurança

Autorização de toda subtarefa delegada a um Agente é verificada junto ao Identity Hub antes de qualquer processamento, garantindo que o contexto da solicitação original — incluindo a Permission do Usuário que a originou — seja respeitado em cada etapa do pipeline.

Isolamento entre Empresas é preservado em toda camada de coordenação do Orchestrator, incluindo Memória, Contexto e resultado de Agente, conforme já detalhado nos Capítulos 9 e 10.

Políticas de execução, já detalhadas no Capítulo 13, são a principal camada de segurança específica desta arquitetura de coordenação — nenhuma ação de negócio real é processada sem que sua política já tenha sido determinada e respeitada integralmente.

Identidade de toda solicitação processada pelo Orchestrator é preservada de ponta a ponta, garantindo que a resposta final seja sempre atribuível ao Usuário que originou a solicitação e às Permissions que esse Usuário efetivamente possui.

Confidencialidade de todo contexto reunido pelo Context Builder é preservada durante toda a coordenação, nunca exposta a um Agente ou a uma Skill sem Permission correspondente ao escopo específico daquele dado.

```
              CAMADAS DE SEGURANÇA DO ORCHESTRATOR
   ┌───────────────────────────────────────────────────────────┐
   │  Autenticação e Autorização (Identity Hub)                     │
   │       ▼                                                         │
   │  Isolamento entre Empresas (Tenant Isolation)                       │
   │       ▼                                                         │
   │  Execution Policy (governa toda ação de negócio real)                  │
   │       ▼                                                         │
   │  Confidencialidade de contexto (escopo de Permission preservado)           │
   └───────────────────────────────────────────────────────────┘
```

Um princípio de segurança adicional, específico à natureza de coordenação deste componente, é a verificação de Permission em cada etapa de delegação, nunca apenas na entrada inicial da solicitação. Um Usuário que possua Permission suficiente para iniciar uma solicitação ampla pode, ainda assim, não possuir Permission suficiente para que uma subtarefa específica dentro dessa solicitação seja processada por um Agente que acesse um domínio de negócio mais restrito — o Agent Coordinator verifica essa Permission granular a cada delegação individual, nunca assumindo que a autorização inicial da solicitação se estende automaticamente a toda subtarefa subsequente sem verificação própria.

---

## 18. Fluxos Arquiteturais

```
   CONSULTA SIMPLES
   ┌───────────────────────────────────────────────────────────┐
   │  Request ──► Intent Analysis ──► Context Assembly ──►             │
   │  Capability Resolution (Read Only) ──► Agent Delegation                 │
   │  (único Agente) ──► Execution ──► Response direta, sem                     │
   │  Human Approval                                                                  │
   └───────────────────────────────────────────────────────────┘
```

```
   COLABORAÇÃO ENTRE AGENTES
   ┌───────────────────────────────────────────────────────────┐
   │  Request ──► Planning identifica múltiplas Subtarefas             │
   │  independentes ──► Agent Delegation em paralelo para                    │
   │  Agente 1 e Agente 2 ──► Execution simultânea ──►                            │
   │  Consolidation combina os dois resultados ──► Response                           │
   └───────────────────────────────────────────────────────────┘
```

```
   APROVAÇÃO HUMANA
   ┌───────────────────────────────────────────────────────────┐
   │  Request ──► Capability Resolution identifica potencial            │
   │  mudança de estado ──► Execution Policy marca Human                     │
   │  Approval ──► Consolidation ──► apresentação ao Usuário                        │
   │  para confirmação ──► confirmação recebida ──► Command                             │
   │  formal invocado ──► Response confirma execução concluída                              │
   └───────────────────────────────────────────────────────────┘
```

```
   FALHA PARCIAL
   ┌───────────────────────────────────────────────────────────┐
   │  Request ──► Planning com múltiplas Subtarefas ──►                 │
   │  Agente 1 conclui com sucesso; Agente 2 falha por                       │
   │  Timeout ──► Fallback aplicado para Agente 2, se disponível                 │
   │  ──► Consolidation combina resultado bem-sucedido de                            │
   │  Agente 1 com aviso explícito de indisponibilidade parcial                          │
   │  relativa a Agente 2 ──► Response comunica ambos claramente                             │
   └───────────────────────────────────────────────────────────┘
```

```
   REPLANEJAMENTO
   ┌───────────────────────────────────────────────────────────┐
   │  Request ──► Planning inicial ──► Execução da primeira             │
   │  Subtarefa produz resultado inesperado ──► Planning Engine              │
   │  aciona Replanejamento da porção afetada, preservando                       │
   │  Subtarefas já concluídas ──► Execução do plano ajustado ──►                    │
   │  Consolidation ──► Response                                                          │
   └───────────────────────────────────────────────────────────┘
```

```
   MÚLTIPLAS CAPABILITIES
   ┌───────────────────────────────────────────────────────────┐
   │  Request ──► Capability Resolution identifica duas                 │
   │  Capabilities relevantes simultaneamente (por exemplo,                  │
   │  análise de crescimento e análise financeira) ──► Planning                  │
   │  incorpora ambas como ramos do mesmo plano ──► Agent                             │
   │  Delegation para Agentes especializados em cada uma ──►                              │
   │  Consolidation combina ambas as perspectivas em resposta                                 │
   │  única e coerente ──► Response                                                              │
   └───────────────────────────────────────────────────────────┘
```

---

## 19. Architecture Decision Records

**ADR-001 — Toda coordenação de Inteligência Artificial acontece através de um único AI Orchestrator.** Contexto: aplicação direta do princípio Single Coordination Point já fixado no Capítulo 3.

**ADR-002 — O Orchestrator é composto por nove componentes internos, cada um com responsabilidade estrita e documentada.** Contexto: preservar Alta Coesão e Baixo Acoplamento já exigidos como objetivo em `AI_ARCHITECTURE.md`, Capítulo 2.

**ADR-003 — Intent Analyzer, Context Builder e Memory Manager processam em paralelo antes de qualquer decisão de Capability.** Contexto: nenhuma dependência real existe entre essas três dimensões de compreensão inicial da solicitação.

**ADR-004 — O Capability Selector nunca inventa uma Capability não registrada.** Contexto: preservar a disciplina de nomenclatura explícita já exigida em `AI_ARCHITECTURE.md`, Capítulo 6.

**ADR-005 — O Planning Engine nunca executa nenhuma subtarefa diretamente.** Contexto: preservar a separação entre planejamento e execução já central ao princípio Planning Before Execution.

**ADR-006 — O Execution Policy Engine determina a política de execução antes que qualquer Agent Delegation ocorra.** Contexto: aplicação direta do princípio Policies Before Commands já fixado no Capítulo 3.

**ADR-007 — Nenhum Agente se comunica diretamente com outro Agente.** Contexto: toda comunicação é mediada pelo Agent Coordinator, preservando isolamento já exigido em `AI_ARCHITECTURE.md`, Capítulo 7.

**ADR-008 — Toda subtarefa marcada com política Human Approval aguarda confirmação explícita antes de qualquer Command ser invocado.** Contexto: aplicação absoluta do princípio Human Oversight já fixado em `AI_MANIFESTO.md`, Capítulo 3.

**ADR-009 — O Result Consolidator preserva rastreabilidade de origem mesmo após fusão de múltiplos resultados parciais.** Contexto: sustentar Auditabilidade completa de toda coordenação.

**ADR-010 — Toda memória administrada pelo Memory Manager é isolada de forma absoluta entre Empresas.** Contexto: aplicação direta de `AI_HUB.md`, ADR-008, e do princípio Context Isolation Between Tenants.

**ADR-011 — Falha de um componente específico do Orchestrator degrada graciosamente, nunca interrompe coordenação de solicitação não relacionada.** Contexto: aplicação do princípio Graceful Degradation já central a toda a Adaptive Business Platform.

**ADR-012 — Toda decisão de coordenação é registrada de forma auditável e rastreável.** Contexto: aplicação direta do princípio Auditable Every Step já fixado no Capítulo 3.

**ADR-013 — Automatic Execution é aplicada apenas a ação de baixo impacto já validada, nunca a ação financeira, estratégica ou de segurança relevante.** Contexto: aplicação do princípio Trust is Earned Incrementally já fixado em `AI_MANIFESTO.md`.

**ADR-014 — O Orchestrator nunca mantém estado oculto além da Memória formalmente descrita neste documento.** Contexto: aplicação do princípio No Hidden State já fixado no Capítulo 3, sustentando Observabilidade completa.

**ADR-015 — Este documento não define nenhum Agente, nenhuma Skill e nenhuma tecnologia de implementação específicos.** Contexto: preservar seu escopo estritamente dedicado à coordenação, delegando especificação concreta a documentos técnicos futuros do AI Handbook.

---

## 20. Glossário

**AI Orchestrator** — o componente central que coordena toda a camada de Inteligência Artificial desta plataforma, já introduzido estruturalmente em `AI_ARCHITECTURE.md`, Capítulo 5, e detalhado integralmente por este documento.

**Intent Analyzer** — o componente que interpreta a solicitação recebida e identifica a intenção subjacente do Usuário.

**Context Builder** — o componente que reúne, enriquece e reduz toda informação relevante a uma solicitação.

**Memory Manager** — o componente que administra memória efêmera, persistente, organizacional e compartilhada.

**Capability Selector** — o componente que identifica qual Capability, ou combinação delas, responde a uma solicitação.

**Planning Engine** — o componente que decompõe uma Capability em subtarefas executáveis, identificando dependência entre elas.

**Execution Policy Engine** — o componente que determina qual política de execução se aplica a cada subtarefa relevante.

**Agent Coordinator** — o componente que delega, acompanha e coordena o processamento de múltiplos Agentes.

**Result Consolidator** — o componente que combina resultados parciais de múltiplos Agentes em uma resposta única e coerente.

**Response Builder** — o componente que traduz o resultado final consolidado em uma resposta apresentável ao Usuário.

**Pipeline de Decisão** — a sequência completa de doze etapas, de Request a Response, que toda solicitação processada pelo Orchestrator percorre.

**Consolidação** — o processo de fusão, consenso, resolução de conflito e eliminação de duplicidade entre múltiplos resultados parciais.

**Human Approval** — a etapa do pipeline em que uma resposta consolidada, quando exigido pela Execution Policy, aguarda confirmação humana explícita.

---

## 21. Conclusão

Este documento declara oficialmente que `AI_ORCHESTRATOR.md` torna-se a autoridade máxima sobre a coordenação da Inteligência Artificial da Adaptive Business Platform. Todo Agente futuro, especificado por qualquer documento técnico subsequente do AI Handbook, deverá operar exclusivamente através do AI Orchestrator aqui detalhado — nenhum Agente futuro se comunica diretamente com outro, nenhum Agente futuro contorna a Execution Policy Layer, e nenhum Agente futuro alcança o Command Bus sem que o pipeline de decisão completo, já descrito no Capítulo 6, tenha sido integralmente respeitado.

Todo documento futuro do AI Handbook — o Agent Framework, o Memory Framework, o Context Framework, o Planning Framework, o Skill Framework, o Tool Framework, e o Multi-Agent Collaboration — deverá respeitar integralmente a arquitetura aqui estabelecida, detalhando seu próprio escopo específico sem jamais redefinir a estrutura de nove componentes internos, o pipeline de doze etapas, ou as trinta regras de princípio já fixadas neste documento.

A hierarquia documental desta série permanece precisa e definitiva: `AI_MANIFESTO.md` define a filosofia — por que a Inteligência Artificial existe e quais limites ela nunca cruza. `AI_ARCHITECTURE.md` define a estrutura — como essa filosofia se organiza em doze camadas verificáveis. `AI_ORCHESTRATOR.md`, este documento, define a coordenação — como o componente central dessa estrutura opera internamente, através de nove componentes especializados e de um pipeline de decisão de doze etapas. E o Architecture Handbook, consolidado por vinte e seis documentos já concluídos, permanece soberano sobre toda a plataforma — nenhuma coordenação de Inteligência Artificial, por mais sofisticada que se torne, jamais assume Ownership, jamais contorna Command, Evento ou Query já catalogados, e jamais executa ação de impacto real sem a confirmação humana e a Execution Policy já formalmente exigidas por esta arquitetura de coordenação.

Com a publicação deste terceiro documento do AI Handbook, a fundação completa sobre a qual toda especificação futura de Agente, de Skill, de Memória, de Contexto, de Planejamento e de Ferramenta será construída está agora estabelecida — filosofia, estrutura e coordenação, os três pilares que garantem que qualquer futura sofisticação de raciocínio artificial permaneça, em toda circunstância, subordinada à disciplina arquitetural que a Adaptive Business Platform já demonstrou, de forma consistente, ao longo de toda esta série documental.
