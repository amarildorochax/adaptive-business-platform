# Automation Engine — Arquitetura de Referência

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento é a referência arquitetural oficial do Automation Engine — o mecanismo responsável por executar processos automáticos, orquestrar eventos, coordenar fluxos de trabalho e integrar todos os Hubs da Adaptive Business Platform entre si.

Seis documentos oficiais já existem e não são repetidos aqui. `PLATFORM_MANIFESTO.md` introduz o Automation Hub como um dos pilares do ecossistema e estabelece o princípio de que toda ação de impacto relevante exige checkpoint de aprovação humana antes de execução autônoma. `AI_HUB.md` define, em profundidade, como a inteligência artificial da plataforma funciona — Prompt Engine, Context Manager, Memory Engine, Provider Layer — e estabelece a fronteira entre decisão inteligente e execução, fronteira que este documento assume como ponto de partida. `SYSTEM_BLUEPRINT.md` posiciona o Automation Hub no mapa geral de Hubs, descreve o Event Bus como infraestrutura compartilhada de comunicação, e já apresenta o Automation Hub como o consumidor de eventos mais promíscuo da plataforma por natureza. `SAAS_ARCHITECTURE.md` detalha o Tenant Model, o isolamento multiempresa e a arquitetura de planos que também se aplicam à execução de automação. `BUSINESS_PROFILE_ENGINE.md` detalha como o perfil de uma empresa influencia quais automações são recomendadas. `BRANDING_HUB.md` detalha como identidade visual e tom de voz são aplicados a qualquer comunicação gerada em nome de uma empresa. Onde qualquer um desses seis documentos já explicou um conceito em profundidade suficiente, este documento referencia o arquivo correspondente em vez de reproduzi-lo, e aprofunda exclusivamente o que é responsabilidade própria do Automation Engine.

O papel do Automation Engine dentro da Adaptive Business Platform é definido por uma distinção que este documento trata como sua fronteira mais importante, repetida sempre que necessário ao longo dos capítulos seguintes: o Automation Engine não toma decisões inteligentes — ele executa decisões. Toda inteligência pertence ao AI Hub, conforme já estabelecido em `AI_HUB.md`. Quando um Fluxo precisa de julgamento além do que uma regra determinística pode resolver, o Automation Engine solicita essa inteligência ao AI Hub exatamente como qualquer outro Hub de domínio o faria — ele nunca implementa sua própria lógica paralela de raciocínio. Se o AI Hub é o cérebro da plataforma e o Business Profile Engine é o seu DNA, conforme já estabelecido nos respectivos documentos, o Automation Engine é o sistema nervoso motor: ele não decide o que fazer, mas garante que, uma vez decidido — por regra determinística ou por recomendação do AI Hub —, a ação aconteça de forma confiável, rastreável e no momento certo.

---

## 2. Missão

A missão do Automation Engine é executar processos automáticos de forma previsível, auditável, escalável e desacoplada.

Previsível significa que, dado o mesmo Trigger e o mesmo conjunto de Conditions satisfeitas, um Workflow produz sempre o mesmo comportamento — nunca uma execução ambígua ou dependente de estado oculto não documentado no próprio Workflow. Auditável significa que toda execução, bem-sucedida ou falha, deixa um rastro completo o suficiente para reconstruir exatamente o que aconteceu, quando, e por quê — detalhado no Capítulo 18. Escalável significa que o volume de automações executadas simultaneamente, para um Tenant ou para milhares de Tenants ao mesmo tempo, não compromete a previsibilidade nem a auditabilidade descritas acima — detalhado no Capítulo 17. Desacoplada significa que nenhum Workflow depende do conhecimento interno de nenhum Hub de domínio específico — ele reage a eventos e invoca ações através de contrato, exatamente como toda comunicação entre Hubs já estabelecida em `SYSTEM_BLUEPRINT.md`.

---

## 3. Problema que Resolve

Quando a lógica de automação é implementada de forma dispersa — um pouco dentro do CRM Hub, um pouco dentro do Growth Hub, um pouco dentro do Communication Hub, cada Hub reimplementando sua própria noção de "se isto acontecer, faça aquilo" —, quatro problemas previsíveis se acumulam ao longo do tempo.

Acoplamento aparece porque a lógica condicional de um Hub frequentemente precisa conhecer o estado interno de outro para decidir se deve agir — o CRM Hub, por exemplo, precisaria conhecer diretamente a estrutura de dado do Finance Hub para reagir a uma fatura vencida, violando a regra de comunicação exclusivamente por evento já estabelecida em `SYSTEM_BLUEPRINT.md`, Capítulo 8.

Duplicação aparece porque padrões de automação semelhantes — um lembrete programado, uma notificação condicional, uma sequência de tentativa com espera progressiva — tendem a ser reimplementados, de forma ligeiramente diferente, em cada Hub que precisa deles, em vez de existir uma única implementação compartilhada e reutilizável.

Manutenção difícil é a consequência direta dos dois problemas anteriores: uma mudança de comportamento em uma automação específica exige localizar exatamente onde, dentro de qual Hub, aquela lógica foi implementada, e uma correção aplicada em um lugar frequentemente não se propaga ao comportamento equivalente implementado de forma divergente em outro Hub.

Baixa escalabilidade aparece porque, sem um mecanismo central de fila, retry e execução paralela, cada Hub que implementa sua própria automação tende a fazê-lo de forma síncrona e bloqueante, ou com sua própria estratégia isolada e não testada sob volume real — exatamente o tipo de fragmentação que motivou a centralização do AI Hub, já descrita em `AI_HUB.md`, Capítulo 3, aplicada aqui ao domínio de execução de automação.

O Automation Engine resolve esses quatro problemas centralizando toda orquestração de automação em um único mecanismo, consumido por todo Hub de domínio da mesma forma, exatamente como o AI Hub centraliza toda inteligência artificial. Nenhum Hub de domínio implementa sua própria lógica de Trigger, Condition, Retry ou fila de execução — todos consomem a mesma infraestrutura compartilhada descrita neste documento.

---

## 4. Filosofia

Automação é orquestração, não inteligência. O Automation Engine coordena quando e como uma ação acontece — ele nunca decide, por julgamento próprio, o que fazer diante de uma situação ambígua. Essa distinção é a mais importante deste documento, e nenhum Workflow deve ser desenhado de forma que confunda as duas responsabilidades.

IA é inteligência. Toda decisão que exige julgamento, interpretação de linguagem natural, ou avaliação de um cenário não coberto por regra determinística explícita pertence ao AI Hub, nunca a uma lógica implementada dentro de um Workflow. Um Workflow pode invocar o AI Hub como uma de suas Actions, mas o resultado dessa invocação é tratado pelo Workflow como um dado de entrada para a próxima etapa, nunca como uma decisão que o próprio Workflow reinterpreta ou reimplementa.

Eventos conectam a plataforma. O Automation Engine é, por natureza, o consumidor de eventos mais amplo de toda a plataforma — qualquer evento publicado por qualquer Hub, conforme o Event Map já descrito em `SYSTEM_BLUEPRINT.md`, Capítulo 7, é um Trigger candidato para algum Workflow.

Fluxos devem ser desacoplados. Um Workflow nunca depende da implementação interna de um Hub específico — ele reage a um evento publicado e invoca uma Action através de um contrato estável, nunca através de uma chamada que pressupõe conhecimento da estrutura de dado interna daquele Hub.

Automação nunca pertence aos módulos. Assim como toda inteligência artificial pertence ao AI Hub, conforme `AI_HUB.md`, Capítulo 4, toda lógica de automação pertence ao Automation Engine. Nenhum Hub de domínio implementa seu próprio motor de regra condicional, sua própria fila de execução, ou sua própria lógica de retry — essas capacidades são centralizadas, e um Hub que precisa de automação a solicita ao Automation Engine, exatamente como solicitaria inteligência ao AI Hub.

---

## 5. Design Principles

**Event First.** Todo Workflow nasce de um evento — publicado no Event Bus por qualquer Hub, ou por um Trigger de tempo já descrito no Capítulo 9. Nenhum Workflow é iniciado por consulta ativa e repetida ao estado de um Hub; a iniciativa é sempre do evento, nunca de uma verificação periódica que poderia, ela mesma, ser substituída por um evento mais preciso.

**Workflow as Configuration.** Um Workflow é dado estruturado — Trigger, Conditions, Actions — nunca código compilado específico de uma empresa. Esse princípio é a aplicação direta de Configuration Over Customization, já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 3, ao domínio de automação.

**Low Coupling.** Um Workflow nunca conhece a implementação interna de nenhum Hub — ele consome eventos e invoca Actions através de contrato estável, exatamente como toda comunicação entre Hubs já estabelecida em `SYSTEM_BLUEPRINT.md`.

**Retry by Design.** Toda Action sujeita a falha transitória — uma integração externa momentaneamente indisponível, por exemplo — é desenhada assumindo que a primeira tentativa pode falhar, com uma política de nova tentativa definida desde a concepção da Action, nunca adicionada como correção posterior a um problema já observado em produção.

**Idempotência.** A execução repetida de uma mesma Action, com o mesmo dado de entrada, nunca produz um efeito colateral duplicado — um Lead não é criado duas vezes porque um evento foi processado duas vezes por engano, uma notificação não é enviada duas vezes porque uma nova tentativa de retry coincidiu com uma execução original ainda em andamento.

**Auditabilidade.** Toda execução de Workflow, do início ao resultado final, produz um registro completo e consultável, detalhado no Capítulo 18 — nenhuma automação executa de forma silenciosa e não rastreável.

**Observabilidade.** Todo componente do Automation Engine produz Logs, Tracing e Metrics de forma consistente com o padrão já estabelecido para toda a plataforma em `SYSTEM_BLUEPRINT.md`, Capítulo 13.

**Human Approval When Needed.** Toda ação de impacto relevante — financeiro, jurídico, reputacional, ou qualquer outro já classificado como de alto impacto pela política da plataforma — exige um ponto explícito de aprovação humana antes de ser executada automaticamente, mesmo quando toda a lógica condicional anterior já foi satisfeita. Este é o mesmo princípio de Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5, aplicado aqui à execução de automação, não apenas à geração de conteúdo por IA.

**Scalable Execution.** A capacidade de executar Workflows cresce horizontalmente com o volume de demanda, sem que a arquitetura do Execution Engine precise ser redesenhada à medida que o número de Tenants e de execuções simultâneas aumenta.

**Stateless Workers.** Cada unidade de processamento que executa uma etapa de Workflow não retém estado entre uma execução e a próxima — todo estado necessário à continuidade de um Workflow em andamento é mantido pelo Execution Engine de forma centralizada e persistente, nunca na memória local de um worker individual, aplicação do mesmo princípio Stateless Requests, Persistent Memory já estabelecido em `AI_HUB.md`, Capítulo 5, ao domínio de execução de automação.

**Queue Driven.** Toda execução de Action passa por uma fila antes de ser processada, permitindo absorver pico de demanda sem bloquear a publicação de novos eventos, detalhado no Capítulo 17.

**Failure Isolation.** A falha de uma execução específica de Workflow nunca compromete a execução de outro Workflow em andamento, mesmo quando ambos pertencem ao mesmo Tenant — cada execução é isolada o suficiente para que uma falha permaneça contida.

**Time-aware Automation.** O Automation Engine reconhece nativamente Triggers baseados em tempo — agendamento, atraso programado, janela de execução — como uma categoria de primeira classe, não como uma adaptação improvisada sobre uma infraestrutura pensada apenas para reação a evento instantâneo.

**Explainable Automation.** Toda execução de Workflow pode ser explicada — qual Trigger a iniciou, quais Conditions foram avaliadas e com qual resultado, qual Action foi executada — aplicação do mesmo princípio de explicabilidade já estabelecido para o Business Profile Engine e para o Branding Hub em seus respectivos documentos.

**Composable Workflows.** Um Workflow pode invocar outro Workflow já existente como parte de sua própria sequência de Actions, permitindo reuso de lógica de automação já validada, em vez de duplicar a mesma sequência de etapas em múltiplos Workflows independentes.

---

## 6. Arquitetura Conceitual

```
                              Eventos
              (Event Bus — SYSTEM_BLUEPRINT.md, Capítulo 7)
                                 │
                                 ▼
                        Automation Engine
              (Automation Manager orquestra os componentes
               internos descritos no Capítulo 7)
                                 │
                                 ▼
                          Workflow Engine
              (resolve qual Workflow reage a este evento)
                                 │
                                 ▼
                            Conditions
              (Condition Engine avalia se o Workflow prossegue)
                                 │
                                 ▼
                              Actions
              (Action Engine executa a etapa definida)
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              Integrations  Notifications   Modules
             (Integration    (Notification  (Hubs de
              Connector,      Engine)        domínio,
              via Integration                via evento
              Hub)                           de retorno)
```

Este diagrama resume a cadeia completa deste documento: um Evento publicado no Event Bus é o ponto de entrada; o Workflow Engine resolve qual Workflow, entre os cadastrados na Workflow Library, deve reagir a ele; o Condition Engine avalia se as condições daquele Workflow são satisfeitas; o Action Engine executa a etapa correspondente; e o resultado dessa execução alcança Integrations externas, Notifications ao usuário, ou de volta aos Modules — Hubs de domínio — através de um novo evento publicado, fechando o ciclo de comunicação assíncrona já estabelecido em `SYSTEM_BLUEPRINT.md`. Nenhuma seta deste diagrama é uma chamada síncrona bloqueante entre o Automation Engine e um Hub de domínio específico — toda comunicação de entrada e de saída acontece via evento ou via Integration Connector, nunca por acoplamento direto.

---

## 7. Componentes Internos

### Automation Manager

O Automation Manager é o ponto de entrada e orquestrador central do Automation Engine, equivalente em função ao Profile Manager e ao Brand Manager já descritos nos documentos anteriores. Ele coordena os demais componentes especializados e garante consistência antes de qualquer execução, mas não decide, ele mesmo, a lógica condicional ou a Action de nenhum Workflow específico.

### Workflow Engine

O Workflow Engine resolve, para cada evento recebido, quais Workflows da Workflow Library estão inscritos naquele tipo de evento e devem ser avaliados. Ele não decide se as Conditions de um Workflow são satisfeitas — apenas identifica os Workflows candidatos e delega a avaliação ao Condition Engine.

### Workflow Builder

O Workflow Builder é o componente que estrutura um novo Workflow a partir de sua definição — Trigger, Conditions, Actions —, garantindo que a estrutura resultante seja bem formada antes de ser submetida ao Workflow Validator.

### Workflow Validator

O Workflow Validator verifica que um Workflow recém-construído ou editado é internamente consistente — que toda Condition referencia um campo de dado existente, que toda Action referencia uma integração ou um Hub válido, que não existe um ciclo lógico que produziria execução infinita — antes de permitir sua ativação.

### Workflow Versioning

O Workflow Versioning aplica identificação de versão a cada estado relevante de um Workflow, permitindo reconstruir qual definição de Workflow estava ativa em um momento específico do passado — mesmo princípio já estabelecido para Profile Versioning e Brand Versioning nos documentos anteriores, aplicado aqui à definição de Workflow.

### Workflow Library

A Workflow Library é o catálogo central de todos os Workflows disponíveis na plataforma — tanto os modelos genéricos oferecidos nativamente quanto os Workflows específicos configurados por cada empresa —, consultado pelo Feature Advisor e pelo Automation Selector do Business Profile Engine, já descritos em `BUSINESS_PROFILE_ENGINE.md`, para produzir recomendação de automação.

### Trigger Manager

O Trigger Manager administra o registro de Triggers ativos na plataforma — de tempo, de evento, manual, de webhook, e as demais categorias detalhadas no Capítulo 9 — e garante que, quando um Trigger se ativa, o Workflow Engine seja notificado corretamente, sem que o próprio Trigger Manager decida qual Workflow deve reagir.

### Condition Engine

O Condition Engine avalia a lógica condicional de um Workflow — operadores lógicos, filtros, comparação de valor — detalhada no Capítulo 10, determinando se a execução deve prosseguir para a próxima etapa ou ser encerrada sem ação.

### Action Engine

O Action Engine executa a etapa concreta definida por um Workflow — enviar mensagem, atualizar registro, acionar integração, solicitar inteligência ao AI Hub — detalhado no Capítulo 11, sem decidir, ele mesmo, se aquela Action deveria ou não ser executada; essa decisão já foi resolvida pelo Condition Engine antes de alcançar o Action Engine.

### Scheduler

O Scheduler administra Triggers baseados em tempo — agendamento recorrente, atraso programado, janela de execução —, garantindo que um Workflow com Trigger temporal seja iniciado no momento correto, mesmo quando esse momento está distante do momento em que o Workflow foi originalmente configurado.

### Queue Manager

O Queue Manager organiza a execução de Actions em filas, absorvendo pico de demanda sem bloquear a publicação de novos eventos — mesmo princípio já detalhado para o Queue Manager do AI Hub em `AI_HUB.md`, Capítulo 7, aplicado aqui à execução de Actions de automação.

### Retry Manager

O Retry Manager administra tentativas de repetição de uma Action que falhou por motivo transitório, com política de espera progressiva — mesmo componente conceitual já descrito para o AI Hub, aplicado aqui à execução de Actions, garantindo que uma falha momentânea de integração externa não seja tratada como falha definitiva do Workflow inteiro.

### Execution Engine

O Execution Engine é o componente que efetivamente processa um Workflow do início ao fim, mantendo o estado de progresso de uma execução em andamento — qual etapa já foi concluída, qual está pendente — de forma centralizada e persistente, conforme o princípio Stateless Workers já descrito no Capítulo 5.

### Execution History

O Execution History preserva o registro completo de toda execução de Workflow já concluída, bem-sucedida ou falha, sustentando tanto a Auditabilidade quanto a investigação de incidente.

### Approval Engine

O Approval Engine administra o ponto de checkpoint humano descrito no princípio Human Approval When Needed — quando um Workflow alcança uma Action classificada como de alto impacto, o Approval Engine pausa a execução, notifica o Usuário responsável através do Notification Engine, e retoma a execução apenas após confirmação explícita, nunca prosseguindo silenciosamente na ausência de resposta.

### Notification Engine

O Notification Engine entrega notificação a um Usuário — tanto para solicitar aprovação quanto para informar resultado de execução —, consumindo o Communication Hub e o Branding Hub para garantir que a notificação respeite identidade e tom da empresa em nome de quem a automação está operando.

### Template Engine

O Template Engine resolve, para uma Action que produz comunicação — mensagem, e-mail, notificação —, o Template apropriado, consumindo o Template Manager já descrito em `BRANDING_HUB.md`, sem duplicar essa responsabilidade dentro do Automation Engine.

### Integration Connector

O Integration Connector é o ponto através do qual uma Action alcança um sistema externo, sempre através do Integration Hub já descrito em `SYSTEM_BLUEPRINT.md` — o Automation Engine nunca implementa sua própria integração direta com um sistema externo, respeitando a mesma regra arquitetural de único ponto de saída já estabelecida para toda a plataforma.

### Metrics Engine

O Metrics Engine agrega dado operacional sobre execução de Workflow — volume, latência, taxa de sucesso e de falha por tipo de Workflow — alimentando tanto observabilidade técnica quanto o Automation Analytics descrito adiante.

### Audit Engine

O Audit Engine preserva o registro imutável de toda mudança relevante de Workflow — criação, edição, ativação, desativação — e de toda aprovação humana concedida ou negada através do Approval Engine, alinhado ao mesmo padrão de auditoria imutável já estabelecido nos documentos anteriores.

### Automation Analytics

O Automation Analytics transforma o dado agregado pelo Metrics Engine em indicador consultável de negócio — quantos Leads foram processados por automação, qual a taxa de conversão de um Fluxo de reengajamento — consumido pelo Analytics Hub já descrito em `SYSTEM_BLUEPRINT.md`.

### Automation Preview

O Automation Preview permite visualizar como um Workflow se comportaria diante de um cenário de entrada específico, antes de ativá-lo em produção — equivalente conceitual ao Brand Preview já descrito em `BRANDING_HUB.md`, aplicado aqui à validação de comportamento de automação antes de sua ativação real.

### Simulation Engine

O Simulation Engine executa um Workflow inteiro contra dado histórico ou hipotético, sem produzir nenhum efeito colateral real — nenhuma mensagem é de fato enviada, nenhum registro é de fato criado —, permitindo validar o comportamento completo de um Workflow complexo antes de sua primeira execução real.

### Rollback Manager

O Rollback Manager reverte, quando tecnicamente possível, o efeito de uma Action já executada — por exemplo, cancelar um envio ainda não entregue, ou reverter uma atualização de registro — usado tipicamente em conjunto com o Approval Engine, quando uma aprovação concedida é posteriormente revogada antes da conclusão efetiva da Action.

### Dead Letter Queue

A Dead Letter Queue recebe toda execução de Action que falhou de forma definitiva, após esgotar a política de nova tentativa administrada pelo Retry Manager — preservando o evento e o contexto da falha para investigação manual, em vez de descartá-lo silenciosamente ou deixá-lo bloqueado indefinidamente em uma fila de execução ativa.

Cada um destes componentes tem um limite estrito de responsabilidade, e nenhum deles acumula lógica de outro componente vizinho — a mesma disciplina de modularidade interna já aplicada aos componentes do AI Hub, do Business Profile Engine e do Branding Hub se aplica, com o mesmo rigor, aqui.

---

## 8. Modelo de Workflow

```
Trigger
   │  o que inicia a execução (Capítulo 9)
   ▼
Conditions
   │  o que precisa ser verdadeiro para prosseguir (Capítulo 10)
   ▼
Branches
   │  caminhos alternativos, cada um com suas próprias Conditions
   ▼
Actions
   │  o que efetivamente é executado (Capítulo 11)
   ▼
Retries
   │  política de nova tentativa em caso de falha transitória
   ▼
Timeouts
   │  limite de tempo aceitável para uma etapa concluir
   ▼
Success
   │  registro de conclusão bem-sucedida (Execution History)
   ▼
Failure
   registro de falha definitiva (Dead Letter Queue, se aplicável)
```

Um Workflow é sempre expresso nesta estrutura, sem exceção — um Trigger dispara a avaliação; Conditions determinam se a execução prossegue; Branches permitem que caminhos diferentes sejam seguidos conforme o resultado de Conditions distintas, cada Branch com sua própria sequência subsequente de Actions; cada Action executada está sujeita a uma política de Retries em caso de falha transitória; um Timeout delimita quanto tempo uma etapa pode levar antes de ser considerada travada; e o resultado final é sempre registrado, seja como Success no Execution History, seja como Failure, encaminhada à Dead Letter Queue quando a falha é definitiva.

Nenhum Workflow pula uma dessas etapas — mesmo um Workflow simples, sem Branch nem Retry configurado explicitamente, ainda percorre a mesma estrutura, apenas com valores padrão mínimos em cada etapa não configurada explicitamente pelo autor do Workflow.

Um Branch merece atenção arquitetural específica por ser, entre os elementos deste modelo, o mais frequentemente mal compreendido. Um Branch não é uma bifurcação de execução paralela — dentro de um mesmo Workflow, apenas um Branch é seguido por execução, determinado pela primeira Condition satisfeita entre os Branches disponíveis, avaliados sempre na ordem em que foram definidos. Um Workflow com múltiplos Branches sem nenhum deles satisfeito simplesmente encerra sem executar nenhuma Action, um resultado válido e esperado, registrado no Execution History como conclusão sem ação, nunca como falha. Essa distinção — entre "nenhuma Action executada porque nenhuma Condition foi satisfeita" e "falha na execução de uma Action" — é preservada de forma explícita em todo registro produzido pelo Execution Engine, permitindo que uma investigação futura nunca confunda os dois cenários.

---

## 9. Triggers

Tempo dispara um Workflow em um momento agendado ou após um atraso programado, administrado pelo Scheduler já descrito no Capítulo 7 — um lembrete enviado três dias após uma primeira interação, por exemplo.

Evento dispara um Workflow em reação a um evento publicado no Event Bus por qualquer Hub — o Trigger mais comum na plataforma, alinhado ao princípio Event First já descrito no Capítulo 5.

Manual dispara um Workflow por ação explícita de um Usuário, tipicamente usado para automações que a empresa deseja executar sob demanda, não automaticamente a cada ocorrência de um evento.

Webhook dispara um Workflow a partir de uma notificação recebida de um sistema externo, sempre processada primeiro pelo Integration Hub antes de alcançar o Automation Engine como um evento interno, conforme já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 5.

API dispara um Workflow a partir de uma chamada explícita originada pela Application Layer, tipicamente em resposta a uma ação de usuário que não se encaixa nos demais tipos de Trigger.

Mudança de dados dispara um Workflow quando um registro específico é criado, atualizado ou removido em um Hub de domínio — tecnicamente implementado como um evento publicado por aquele Hub no momento da mudança, não como uma consulta ativa e repetida ao estado do dado.

IA dispara um Workflow quando o AI Hub produz uma recomendação ou uma conclusão que justifica ação subsequente — por exemplo, uma anomalia identificada pelo Finance Hub através de análise do AI Hub, já descrita em `SYSTEM_BLUEPRINT.md`, Capítulo 6, disparando um Workflow de alerta. O Automation Engine nunca solicita essa análise por conta própria de forma inteligente — ele apenas reage ao resultado já produzido pelo AI Hub, publicado como evento.

Integrações disparam um Workflow a partir de uma notificação originada por um sistema externo já conectado através de um Connector do Integration Hub, tecnicamente equivalente ao Trigger de Webhook, mas frequentemente tratado como categoria própria por representar uma relação de integração já estabelecida e recorrente, não um evento pontual.

```
                          CATEGORIAS DE TRIGGER
   ┌───────────────────────────────────────────────────────────┐
   │ Tempo · Evento · Manual · Webhook · API ·                   │
   │ Mudança de dados · IA (resultado do AI Hub) · Integrações   │
   └───────────────────────────────────────────────────────────┘
```

---

## 10. Conditions

Operadores lógicos AND, OR e NOT combinam múltiplas condições individuais em uma expressão condicional completa — todas as condições combinadas por AND precisam ser verdadeiras, ao menos uma combinada por OR precisa ser verdadeira, e NOT inverte o resultado de uma condição específica.

Filtros restringem a avaliação a um subconjunto específico de dado — por exemplo, aplicar um Workflow apenas a Leads originados de um canal específico.

Datas comparam um valor de tempo — o Lead foi criado há mais de sete dias, a fatura vence em menos de três dias — frequentemente combinadas com Triggers de tempo administrados pelo Scheduler.

Valores comparam um campo de dado específico contra um valor de referência — o valor da transação é maior que um limite configurado, por exemplo.

Segmentos consultam o Segmento de uma empresa, mantido pelo Business Profile Engine já descrito em `BUSINESS_PROFILE_ENGINE.md`, permitindo que um Workflow se comporte de forma diferente conforme o tipo de negócio em que está operando, sem que o próprio Workflow reimplemente lógica de classificação de Segmento.

Perfil consulta outras dimensões do Modelo de Perfil, além do Segmento — Maturidade, Objetivos, Capacidades — já detalhadas em `BUSINESS_PROFILE_ENGINE.md`, Capítulo 8.

Permissões verificam se o Usuário ou o contexto que originou o Trigger tem autorização suficiente para que a Action subsequente seja executada, consultando o Identity Hub já descrito em `SYSTEM_BLUEPRINT.md`, Capítulo 12.

Estado do Workflow consulta o progresso de uma execução em andamento — relevante para Workflows compostos, onde uma etapa posterior precisa verificar o resultado de uma etapa anterior antes de prosseguir.

```
                             CONDITIONS
   ┌───────────────────────────────────────────────────────────┐
   │  AND · OR · NOT (operadores lógicos)                        │
   │  Filtros · Datas · Valores (comparação de dado)              │
   │  Segmentos · Perfil (consulta ao Business Profile Engine)    │
   │  Permissões (consulta ao Identity Hub)                        │
   │  Estado do Workflow (consulta à própria execução em curso)     │
   └───────────────────────────────────────────────────────────┘
```

---

## 11. Actions

Enviar mensagem entrega uma comunicação a um Lead ou Cliente através do Communication Hub, com Template e identidade resolvidos pelo Template Engine e pelo Branding Hub, já descritos em `BRANDING_HUB.md`.

Criar Lead registra um novo Lead no CRM Hub, tipicamente como resultado de um Trigger de Webhook ou de API originado de um canal de captura externo.

Atualizar CRM modifica um registro já existente no CRM Hub — mudança de estágio, atualização de dado de contato — em reação a um evento ou a uma condição satisfeita.

Gerar relatório aciona o Analytics Hub para consolidar um relatório específico, tipicamente em resposta a um Trigger de tempo recorrente, com identidade aplicada pelo Document Branding já descrito em `BRANDING_HUB.md`.

Enviar E-mail é uma especialização de Enviar mensagem, canalizada especificamente através do Email Branding.

Atualizar Dashboard modifica a configuração ou o conteúdo de um Dashboard, tipicamente uma Action de menor frequência, usada quando uma automação precisa refletir um resultado diretamente na experiência de uso interno da empresa.

Criar tarefa gera um item de trabalho atribuído a um Usuário específico, usado quando o resultado de um Workflow exige ação humana subsequente que a própria plataforma não pode executar automaticamente.

Executar IA invoca o AI Hub para produzir uma resposta, uma recomendação ou uma análise — a Action mais frequentemente associada ao Trigger de tipo IA descrito no Capítulo 9, mas também usada como etapa intermediária de um Workflow disparado por qualquer outro tipo de Trigger. O Automation Engine trata o resultado dessa invocação como um dado de entrada estruturado para a Action seguinte, nunca reinterpretando ou expandindo esse resultado com lógica própria.

Acionar integração invoca um sistema externo através do Integration Connector, sempre mediado pelo Integration Hub, nunca por uma conexão direta implementada dentro do Automation Engine.

Registrar evento publica um novo evento no Event Bus, permitindo que um Workflow sinalize a conclusão de uma etapa relevante ao restante da plataforma, fechando o ciclo de comunicação assíncrona entre Hubs.

```
                              ACTIONS
   ┌───────────────────────────────────────────────────────────┐
   │  Comunicação:  Enviar mensagem · Enviar E-mail               │
   │  CRM:          Criar Lead · Atualizar CRM                     │
   │  Medição:      Gerar relatório · Atualizar Dashboard          │
   │  Trabalho:     Criar tarefa                                    │
   │  Inteligência: Executar IA                                     │
   │  Integração:   Acionar integração                              │
   │  Sinalização:  Registrar evento                                │
   └───────────────────────────────────────────────────────────┘
```

---

## 12. Integração com AI Hub

O Automation Engine solicita inteligência ao AI Hub exatamente da mesma forma que qualquer outro Hub de domínio já descrito em `AI_HUB.md` — através da Action Executar IA, descrita no Capítulo 11, que invoca o AI Gateway e aguarda uma resposta processada por todo o pipeline interno já detalhado naquele documento: Context Manager, Prompt Engine, Provider Manager, e os demais componentes.

O Automation Engine não incorpora nenhuma lógica inteligente própria — ele não interpreta linguagem natural, não decide entre múltiplas interpretações ambíguas de um cenário, e não gera conteúdo original. Quando um Workflow precisa de qualquer uma dessas capacidades, a Action Executar IA delega inteiramente ao AI Hub, e o Automation Engine trata o resultado retornado como um valor estruturado, consumido pela etapa seguinte do Workflow através de Conditions e Actions já configuradas, nunca reinterpretado por uma lógica adicional dentro do próprio Automation Engine.

Essa fronteira é o que preserva a distinção central estabelecida na Introdução deste documento: o Automation Engine executa decisões, o AI Hub as produz. Um Workflow mal desenhado que tentasse replicar, através de Conditions cada vez mais elaboradas, uma lógica de decisão que deveria pertencer ao AI Hub, estaria violando essa fronteira — e a resposta correta, nesse cenário, é sempre delegar a decisão ao AI Hub através de uma Action Executar IA, nunca expandir a complexidade condicional do próprio Workflow para tentar simular julgamento.

---

## 13. Integração com Business Profile

O Business Profile Engine, detalhado em `BUSINESS_PROFILE_ENGINE.md`, influencia o Automation Engine em duas frentes distintas: quais Workflows são sugeridos, e como os parâmetros de um Workflow já ativo são calibrados.

O Automation Selector, componente do Business Profile Engine já descrito em `BUSINESS_PROFILE_ENGINE.md`, Capítulo 7, consulta a Workflow Library para identificar quais Workflows candidatos são mais relevantes ao Segmento, à Maturidade e aos Objetivos de uma empresa específica — um Pet Shop recebe prioridade de sugestão para um Workflow de reengajamento por ciclo de recompra, enquanto uma Clínica recebe prioridade para um Workflow de lembrete de retorno periódico, conforme os exemplos já detalhados naquele documento.

Além da sugestão inicial, o perfil de negócio também calibra parâmetros de execução de um Workflow já ativo — o intervalo de tempo de um Trigger de tempo, o limiar de valor usado em uma Condition, podem ser ajustados de acordo com o Porte ou o Volume operacional de uma empresa específica, sem que isso exija a criação de um Workflow tecnicamente diferente para cada faixa de porte. O Automation Engine nunca decide, por conta própria, qual Segmento ou qual Maturidade uma empresa possui — ele consome essa classificação já produzida pelo Business Profile Engine, respeitando a mesma fronteira de responsabilidade já estabelecida entre os dois Hubs em `BUSINESS_PROFILE_ENGINE.md`, Capítulo 15.

---

## 14. Integração com Branding

Toda Action de comunicação — Enviar mensagem, Enviar E-mail, Gerar relatório — consome o Template Engine, que por sua vez resolve o Template e o Theme apropriados através do Template Manager e do Theme Manager já descritos em `BRANDING_HUB.md`, Capítulos 7 e 10.

Isso garante que uma comunicação automatizada, disparada por um Workflow sem intervenção humana direta no momento do envio, preserve exatamente a mesma identidade visual e o mesmo Tom de voz que uma comunicação produzida manualmente por um Usuário da empresa — nenhuma automação produz comunicação neutra ou genérica, dissociada da marca em nome de quem está operando. O Automation Engine nunca armazena nem gera, ele mesmo, nenhum elemento de identidade — cor, tipografia, tom —, apenas invoca o Branding Hub no momento de execução de uma Action de comunicação, respeitando a mesma fronteira de responsabilidade já estabelecida entre os dois Hubs em `BRANDING_HUB.md`, Capítulo 5, princípio Single Source of Truth.

---

## 15. Eventos

O catálogo de eventos consumidos e produzidos pelo Automation Engine é o mesmo Event Map já descrito em `SYSTEM_BLUEPRINT.md`, Capítulo 7 — este documento não repete esse catálogo, apenas detalha como o Automation Engine especificamente opera sobre ele.

Publicação acontece sempre que um Workflow conclui uma etapa relevante o suficiente para que outro Hub possa estar interessado — o evento `AutomationExecuted`, já introduzido em `SYSTEM_BLUEPRINT.md`, é o exemplo central, mas um Workflow também pode publicar um evento de domínio mais específico através da Action Registrar evento, descrita no Capítulo 11.

Consumo acontece através do Trigger Manager, que mantém o registro de quais Workflows estão inscritos em quais tipos de evento — um mesmo evento publicado pode acionar múltiplos Workflows distintos simultaneamente, cada um avaliado de forma independente pelo Condition Engine, sem que o publicador do evento precise saber, antecipadamente, quantos ou quais Workflows reagirão a ele, respeitando o mesmo desacoplamento entre publicador e consumidor já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 7.

Versionamento de evento é relevante quando a estrutura de um tipo de evento muda ao longo do tempo — um Workflow já ativo, configurado contra uma versão anterior da estrutura de um evento, precisa continuar funcionando corretamente mesmo após essa estrutura evoluir, ou precisa ser explicitamente migrado para a nova versão, nunca quebrado silenciosamente por uma mudança de formato que ele não previa.

---

## 16. Segurança

Permissões determinam quem, dentro de um Workspace, pode criar, editar ou ativar um Workflow — tipicamente restrito a Perfis de Administrador ou Gerente, conforme o modelo de Perfis já descrito em `SAAS_ARCHITECTURE.md`, Capítulo 11 —, verificadas pelo Condition Engine sempre que uma Action exige autorização específica de execução.

Auditoria, administrada pelo Audit Engine já descrito no Capítulo 7, preserva o registro imutável de toda criação, edição e ativação de Workflow, e de toda decisão de aprovação concedida ou negada através do Approval Engine.

Execução segura garante que uma Action nunca acesse dado ou capacidade além do estritamente necessário para sua própria função — o mesmo princípio de menor privilégio já aplicado entre Hubs em `SYSTEM_BLUEPRINT.md`, Capítulo 12, aplicado aqui à execução de uma etapa individual de Workflow.

Proteção contra loops impede que um Workflow, direta ou indiretamente através de Workflows compostos permitidos pelo princípio Composable Workflows, produza um ciclo de execução infinita — o Workflow Validator, descrito no Capítulo 7, verifica essa condição antes de permitir a ativação de qualquer Workflow, e o Execution Engine mantém um limite de profundidade de composição como proteção adicional em tempo de execução.

Limites de taxa de execução impedem que um único Workflow, ou um único Tenant, consuma recursos de processamento além do razoável, protegendo tanto a estabilidade da plataforma quanto os demais Tenants operando simultaneamente sobre a mesma infraestrutura compartilhada, conforme já detalhado em `SAAS_ARCHITECTURE.md`, Capítulo 17.

---

## 17. Escalabilidade

Workers processam Actions de forma paralela e escalável, adicionados ou removidos de acordo com a demanda observada em tempo real — mesmo mecanismo já descrito para o AI Hub em `AI_HUB.md`, Capítulo 19, aplicado aqui à execução de Workflow.

Filas, administradas pelo Queue Manager, absorvem pico de demanda sem bloquear a publicação de novos eventos, garantindo que um volume repentino de Trigger — uma campanha bem-sucedida gerando um grande número de novos Leads simultaneamente, por exemplo — não comprometa a capacidade da plataforma de continuar aceitando novos eventos enquanto processa o volume acumulado.

Execução paralela permite que múltiplas execuções de Workflow, mesmo do mesmo tipo e para o mesmo Tenant, avancem simultaneamente sem interferir umas nas outras, respeitando o princípio Failure Isolation já descrito no Capítulo 5.

Particionamento organiza a fila de execução de forma que o volume de um Tenant específico, mesmo excepcionalmente alto, não bloqueie o processamento de execuções pendentes de outros Tenants — cada Tenant opera, na prática, sobre sua própria capacidade de fila isolada, sem competir diretamente pelo mesmo espaço de processamento que os demais.

Alta disponibilidade garante que a indisponibilidade momentânea de uma instância do Execution Engine não interrompa Workflows em andamento — o estado de progresso, mantido de forma persistente conforme o princípio Stateless Workers, permite que outra instância retome a execução exatamente de onde a anterior parou.

---

## 18. Observabilidade

Logs registram toda etapa relevante de uma execução de Workflow — Trigger acionado, Condition avaliada e seu resultado, Action executada e seu resultado — com o mesmo padrão estrutural já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 13.

Tracing conecta esses registros individuais em uma linha de execução completa e navegável por Workflow, permitindo reconstruir, para qualquer execução específica, exatamente o caminho percorrido desde o Trigger até o resultado final, mesmo quando esse caminho atravessa múltiplas Actions, Integrations e, eventualmente, uma chamada ao AI Hub.

Métricas agregam volume de execução, taxa de sucesso e de falha, e distribuição de tempo de execução por tipo de Workflow, alimentando tanto o Metrics Engine quanto o Automation Analytics já descritos no Capítulo 7.

Tempo de execução é medido por etapa individual, não apenas no agregado do Workflow inteiro, permitindo identificar exatamente qual Action específica está contribuindo para uma eventual degradação de desempenho de um Workflow composto por múltiplas etapas.

Falhas são registradas com o mesmo nível de detalhe que execuções bem-sucedidas, incluindo a etapa exata onde a falha ocorreu e a ação de contingência tomada pelo Retry Manager, ou o encaminhamento à Dead Letter Queue quando a falha se mostrou definitiva.

Alertas são disparados quando a taxa de falha de um Workflow específico, ou o volume acumulado na Dead Letter Queue, ultrapassa um limite configurado, permitindo intervenção humana antes que o problema se torne visível ao cliente final da automação — tipicamente um Lead ou Cliente que deixou de receber uma comunicação esperada.

Um sinal de observabilidade específico deste Engine, sem equivalente direto nos Hubs já documentados, é a taxa de Conditions não satisfeitas por Workflow ao longo do tempo — quantas vezes um Trigger é acionado, mas nenhum Branch é seguido porque nenhuma Condition se aplica. Uma taxa crescente desse tipo de resultado, para um Workflow específico, é um indício de que o Trigger configurado está capturando eventos além do escopo que o autor do Workflow realmente pretendia, e é tratada como sinal de revisão de configuração, não apenas como estatística passiva de execução sem efeito.

---

## 19. Casos de Uso

**Novo Lead.** O CRM Hub publica o evento `LeadCreated`, já descrito em `SYSTEM_BLUEPRINT.md`, Capítulo 7. O Workflow Engine identifica um Workflow inscrito nesse evento; o Condition Engine verifica se o Lead se originou de um canal específico configurado como relevante; o Action Engine executa Enviar mensagem de boas-vindas, com Template e identidade resolvidos pelo Branding Hub, e Criar tarefa de acompanhamento atribuída ao Perfil de Atendimento responsável.

**Carrinho abandonado.** Um evento de mudança de dado, publicado pelo Growth Hub ou pelo módulo de e-commerce relevante, sinaliza um carrinho não finalizado após um intervalo configurado. O Scheduler aciona a avaliação após o tempo definido pela Condition de Data; se o carrinho permanece não finalizado, o Action Engine executa Enviar E-mail com Template específico de recuperação, e Registrar evento sinalizando a tentativa de recuperação ao Analytics Hub.

**Pagamento confirmado.** O Finance Hub publica o evento `PaymentReceived`, já descrito em `SYSTEM_BLUEPRINT.md`. O Condition Engine verifica se o Cliente associado está em um Segmento elegível a um benefício específico; o Action Engine executa Atualizar CRM, refletindo o novo status de pagamento, e Enviar mensagem de confirmação ao Cliente.

**Aniversário do cliente.** O Scheduler avalia diariamente, através de um Trigger de tempo recorrente, quais Clientes têm data relevante no dia corrente — uma Condition de Data comparando o campo armazenado contra a data atual. O Action Engine executa Enviar mensagem personalizada, com Tom de voz calibrado pelo Branding Hub conforme o Segmento da empresa, por exemplo mais descontraído para uma loja de moda e mais reservado para uma clínica.

**Reativação de clientes.** Um Trigger de tempo avalia periodicamente Clientes sem interação registrada há um intervalo configurado pela Condition de Data, calibrado pelo Business Profile Engine conforme o ciclo de recompra típico do Segmento daquela empresa, conforme já exemplificado em `BUSINESS_PROFILE_ENGINE.md` para o caso de um Pet Shop. O Action Engine executa Enviar mensagem de reengajamento e Registrar evento para acompanhamento de taxa de retorno pelo Automation Analytics.

**Follow-up automático.** Após a execução de uma Action de Criar tarefa não concluída dentro de um prazo configurado, um Trigger de tempo aciona uma nova avaliação; a Condition verifica se a tarefa permanece pendente; se sim, o Action Engine executa Enviar mensagem de lembrete ao responsável e, opcionalmente, Executar IA para sugerir uma priorização de tarefas pendentes acumuladas, delegando essa sugestão inteiramente ao AI Hub.

**Aprovação humana.** Um Workflow de Growth Hub, disparado por um Trigger manual de "publicar campanha", alcança uma Action classificada como de alto impacto — acionar uma integração de mídia paga com orçamento acima de um limite configurado. O Approval Engine pausa a execução, aciona o Notification Engine para alertar o Perfil com autoridade de aprovação, conforme o modelo de Perfis já descrito em `SAAS_ARCHITECTURE.md`, e retoma a execução apenas após confirmação explícita — nunca prosseguindo automaticamente na ausência de resposta, mesmo que todas as Conditions anteriores já tenham sido satisfeitas.

**Fluxo multicanal.** Um evento de `MessageReceived`, já descrito em `SYSTEM_BLUEPRINT.md`, originado em um canal específico, aciona um Workflow que executa Executar IA para compor uma resposta, e em seguida decide, através de uma Condition consultando o canal de origem, se a resposta deve ser entregue via WhatsApp, e-mail ou outro canal já configurado no Channel Manager do Business Profile Engine — cada canal de saída resolvido através de uma Action de Enviar mensagem distinta, mas todas consumindo o mesmo Template Engine e a mesma identidade de marca, garantindo consistência de comunicação independentemente do canal escolhido.

---

## 20. Roadmap

No curto prazo, a prioridade é o Automation Manager, o Workflow Engine, o Trigger Manager e o Condition Engine operando de ponta a ponta para o conjunto essencial de Triggers de Evento e de Tempo, com o Execution Engine mantendo estado persistente e o Execution History registrando toda execução concluída.

No médio prazo, a prioridade é o Approval Engine plenamente integrado ao ciclo de checkpoint humano já estabelecido no Manifesto, o Automation Preview e o Simulation Engine permitindo validação de Workflow antes de sua ativação em produção, e a integração completa com o Business Profile Engine para recomendação e calibração automática de parâmetros descrita no Capítulo 13.

No longo prazo, a prioridade é o refinamento contínuo do Automation Analytics com base em padrão observado entre milhares de execuções, o amadurecimento do Rollback Manager para cobrir um conjunto mais amplo de Actions reversíveis, e a maturidade do Composable Workflows, permitindo que empresas e, eventualmente, parceiros do Marketplace já antecipado em `SAAS_ARCHITECTURE.md`, Capítulo 9, componham Workflows complexos a partir de blocos já validados, sem exigir conhecimento técnico de implementação.

---

## 21. Architecture Decision Records

**ADR-001 — Toda automação é baseada em evento.** Nenhum Workflow inicia por consulta ativa e repetida ao estado de um Hub; todo Trigger, incluindo os de tempo, é tecnicamente resolvido como um evento publicado internamente. Contexto: aplicação do princípio Event First; alternativa descartada — permitir polling periódico como mecanismo de Trigger alternativo, rejeitada por introduzir latência imprevisível e carga desnecessária sobre os Hubs consultados.

**ADR-002 — Workflows são configurados, não programados.** Um Workflow é dado estruturado — Trigger, Conditions, Actions — nunca código compilado específico de uma empresa. Contexto: aplicação direta de Configuration Over Customization, já estabelecido em `SAAS_ARCHITECTURE.md`.

**ADR-003 — IA nunca executa automações diretamente; ela é invocada por uma Action.** O AI Hub nunca inicia, por conta própria, um Workflow — ele é sempre consumido através da Action Executar IA, dentro de um Workflow já disparado por outro Trigger. Contexto: preservar a fronteira entre execução e inteligência estabelecida na Introdução deste documento.

**ADR-004 — Toda execução é auditável, sem exceção.** Nenhum Workflow executa de forma silenciosa; todo Trigger, Condition avaliada e Action executada é registrada pelo Execution History e, quando relevante à governança, pelo Audit Engine. Contexto: sem essa garantia, nenhuma investigação de "por que esta automação fez isto" seria possível.

**ADR-005 — Toda Action de alto impacto exige aprovação humana explícita.** Nenhuma Condition satisfeita, por si só, autoriza a execução automática de uma Action classificada como de alto impacto. Contexto: aplicação direta de Human Oversight, já estabelecido em `AI_HUB.md`, e da mesma regra de aprovação de gasto já fixada no Manifesto.

**ADR-006 — Nenhum Hub de domínio implementa sua própria lógica de automação.** Toda capacidade de Trigger, Condition, Retry e fila de execução é centralizada no Automation Engine. Contexto: prevenir o retorno da fragmentação descrita no Capítulo 3, mesmo diagnóstico já aplicado à inteligência artificial em `AI_HUB.md`.

**ADR-007 — Toda Action sujeita a falha transitória possui política de Retry definida desde sua concepção.** Nenhuma Action é implementada assumindo sucesso garantido na primeira tentativa. Contexto: aplicação do princípio Retry by Design; alternativa descartada — tratar retry como preocupação de infraestrutura genérica aplicada uniformemente sem distinção por tipo de Action, rejeitada por ignorar que diferentes Actions têm diferentes tolerâncias a atraso e a repetição.

**ADR-008 — Toda Action é desenhada para ser idempotente.** A execução repetida de uma mesma Action, com o mesmo dado de entrada, nunca produz efeito colateral duplicado. Contexto: sem essa garantia, o próprio mecanismo de Retry descrito no ADR-007 se tornaria uma fonte de erro, não de resiliência.

**ADR-009 — A falha de uma execução de Workflow nunca compromete outra execução em andamento.** Cada execução é isolada o suficiente para conter sua própria falha. Contexto: aplicação do princípio Failure Isolation; sem essa garantia, um único Workflow malformado poderia degradar a confiabilidade de toda a plataforma de automação.

**ADR-010 — Nenhum Workflow acessa um sistema externo diretamente; toda integração passa pelo Integration Hub.** O Integration Connector nunca implementa lógica própria de comunicação externa. Contexto: aplicação da regra de único ponto de saída já estabelecida em `SYSTEM_BLUEPRINT.md`, Capítulo 3.

**ADR-011 — Toda execução falha de forma definitiva é preservada na Dead Letter Queue, nunca descartada silenciosamente.** Contexto: sem essa garantia, uma falha real de automação — um Lead que deveria ter recebido uma mensagem e não recebeu — poderia passar despercebida indefinidamente, comprometendo a confiabilidade prometida na Missão deste documento.

**ADR-012 — Um Branch não satisfeito é registrado como conclusão sem ação, nunca como falha.** O Execution History distingue explicitamente entre um Workflow que concluiu sem executar nenhuma Action, por nenhuma Condition ter sido satisfeita, e um Workflow que falhou ao tentar executar uma Action. Contexto: sem essa distinção, a observabilidade descrita no Capítulo 18 confundiria comportamento esperado com incidente real, degradando a confiabilidade dos próprios alertas de falha.

---

## 22. Glossário

**Automation Engine** — mecanismo responsável por executar processos automáticos, orquestrar eventos e coordenar Workflows entre todos os Hubs da plataforma.

**Workflow** — definição estruturada de Trigger, Conditions, Branches e Actions que representa um processo automático configurado.

**Trigger** — evento, tempo, ação manual ou sinal externo que inicia a avaliação de um Workflow.

**Condition** — expressão lógica avaliada para determinar se a execução de um Workflow deve prosseguir.

**Action** — etapa concreta executada por um Workflow, como enviar mensagem, atualizar registro ou acionar integração.

**Branch** — caminho alternativo dentro de um Workflow, seguido conforme o resultado de Conditions específicas.

**Idempotência** — propriedade de uma Action que garante que sua execução repetida, com o mesmo dado de entrada, nunca produz efeito colateral duplicado.

**Dead Letter Queue** — destino de toda execução de Action que falhou de forma definitiva, preservada para investigação manual.

**Approval Engine** — componente que pausa a execução de um Workflow em uma Action de alto impacto até confirmação humana explícita.

**Composable Workflows** — princípio segundo o qual um Workflow pode invocar outro já existente como parte de sua própria sequência de Actions.

**Workflow as Configuration** — princípio segundo o qual um Workflow é sempre dado estruturado, nunca código específico de uma empresa.

**Failure Isolation** — princípio segundo o qual a falha de uma execução nunca compromete outra execução em andamento.

**Explainable Automation** — princípio segundo o qual toda execução de Workflow pode ser explicada em termos de Trigger, Conditions avaliadas e Actions executadas.

**Automation Analytics** — indicador de negócio derivado do dado agregado de execução de Workflow, consumido pelo Analytics Hub.

---

## 23. Conclusão

O Automation Engine transforma decisões — determinísticas, configuradas por regra explícita, ou inteligentes, produzidas pelo AI Hub — em ações coordenadas, executadas de forma previsível, auditável, escalável e desacoplada. Ele nunca decide o que fazer diante de uma ambiguidade que exige julgamento; essa responsabilidade pertence inteiramente ao AI Hub, conforme já estabelecido em `AI_HUB.md`. O que o Automation Engine garante é que, uma vez que uma decisão exista — por regra ou por inteligência —, ela se transforme em ação real, no momento certo, através do canal certo, com identidade e tom corretos, e com aprovação humana quando o impacto da ação assim exigir.

É esse papel que faz do Automation Engine o elo operacional entre inteligência, módulos e integrações: o AI Hub decide, o Business Profile Engine informa contexto de negócio, o Branding Hub garante identidade, e o Automation Engine é quem efetivamente move a plataforma — publicando e consumindo eventos, coordenando Workflows, e integrando todos os Hubs entre si sem que nenhum deles precise conhecer a implementação interna de outro.

Junto com `PLATFORM_MANIFESTO.md`, `AI_HUB.md`, `SYSTEM_BLUEPRINT.md`, `SAAS_ARCHITECTURE.md`, `BUSINESS_PROFILE_ENGINE.md` e `BRANDING_HUB.md`, este documento completa a referência arquitetural que explica não apenas o que a Adaptive Business Platform sabe sobre cada empresa e como ela se apresenta, mas como ela efetivamente age em nome de cada uma delas, de forma coordenada, confiável e sempre supervisionada onde a supervisão é devida.
