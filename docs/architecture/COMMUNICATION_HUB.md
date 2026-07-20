# Communication Hub — Arquitetura de Referência

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento é a referência arquitetural oficial do Communication Hub — a implementação técnica do domínio de comunicação já definido em `COMMUNICATION_DOMAIN_BLUEPRINT.md`. Aquele documento é o proprietário exclusivo do domínio: sua fronteira, suas Entidades — Conversation, Message, Channel, Delivery, e as demais já catalogadas —, seus dezoito Eventos, suas dez Regras de negócio. Este documento não redefine nenhum desses conceitos — ele descreve exclusivamente como o Communication Hub é arquitetado para operar sobre esse domínio: seus componentes internos, seus Commands e Queries, seus fluxos operacionais, sua integração técnica com o restante da plataforma, e suas garantias de segurança, observabilidade e escala.

A relação entre os dois documentos segue exatamente o mesmo padrão já estabelecido pelo par `CRM_DOMAIN_BLUEPRINT.md` e `CRM_HUB.md`: o Blueprint responde "o que é a comunicação e o que ela modela"; este documento responde "como o Communication Hub é construído, tecnicamente, para servir esse modelo". Onde qualquer conceito de domínio é mencionado aqui, ele é citado por referência ao Blueprint, nunca redefinido. Onde um conceito de arquitetura geral já foi definido em `BUSINESS_HUB_ARCHITECTURE.md` — Bounded Context, Domain Ownership, Aggregate, Anti-Corruption Layer, Command-Query Separation já aplicado em `CRM_HUB.md` — ele é aplicado aqui, não reexplicado. Um leitor familiarizado com o par CRM reconhecerá, ao longo deste documento, a mesma estrutura de raciocínio aplicada a um domínio diferente — a mudança de lente do domínio para a arquitetura, do "o que significa" para o "como funciona", já explicada naquele par e repetida aqui com a mesma disciplina.

---

## 2. Missão

A missão operacional do Communication Hub é executar, com confiabilidade e em escala, tudo o que o domínio de comunicação já definido no Blueprint exige: registrar toda Conversation independentemente de canal, rastrear a Delivery de toda Message até confirmação ou falha definitiva, processar Broadcast sem duplicação, e expor tudo isso a Usuário humano e a Hub consumidor através de um conjunto estável de Commands, Queries e Eventos — sem jamais assumir responsabilidade que pertence a outro domínio, conforme já delimitado na tabela de Boundaries do Blueprint, Capítulo 4.

Confiabilidade, aqui, significa especificamente que nenhuma Message enviada é perdida sem rastro, que toda tentativa de entrega — bem-sucedida ou falha — produz registro consultável, e que uma Conversation nunca perde continuidade quando a parte externa muda de Canal. Escala significa que essas garantias permanecem válidas independentemente de a Empresa consumidora processar dezenas ou milhões de Conversation simultaneamente, e independentemente de quantas outras Empresas operam ao mesmo tempo sobre a mesma infraestrutura compartilhada, conforme detalhado no Capítulo 17.

---

## 3. Papel dentro da Plataforma

O Communication Hub é um Business Hub, na categorização já estabelecida em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 1 — uma capacidade de negócio reconhecível pelo cliente, não um serviço técnico transversal nem um componente de Adaptive Intelligence.

```
                POSIÇÃO DO COMMUNICATION HUB NA PLATAFORMA
   ┌───────────────────────────────────────────────────────────┐
   │  Platform Services                                            │
   │  (AI Hub · Identity Hub · Knowledge Hub · Integration Hub)     │
   │       consumidos pelo Communication Hub — Capítulo 13            │
   ├───────────────────────────────────────────────────────────┤
   │  Adaptive Intelligence                                          │
   │  (Business Profile Engine · Branding Hub · Automation Engine)   │
   │       consumidos pelo Communication Hub — Capítulo 13              │
   ├───────────────────────────────────────────────────────────┤
   │  Business Hubs                                                   │
   │  ┌─────────┐  ┌───────────┐  ┌──────────┐  ┌───────────┐        │
   │  │ CRM Hub │  │Finance Hub│  │Growth Hub│  │Communica-  │        │
   │  │         │  │           │  │          │  │tion Hub    │        │
   │  └─────────┘  └───────────┘  └──────────┘  │(este       │        │
   │       colaboram exclusivamente por Evento    │ documento)│        │
   │       — Capítulo 14                          └───────────┘        │
   └───────────────────────────────────────────────────────────┘
```

O Communication Hub consome todo Platform Service e todo componente de Adaptive Intelligence exatamente como qualquer outro Business Hub já descrito em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 14 e já demonstrado em `CRM_HUB.md`, Capítulo 13. E o Communication Hub colabora com os demais Business Hubs — CRM, Finance, Growth, Analytics — exclusivamente por Evento, nunca por chamada direta, conforme já estabelecido naquele mesmo documento e detalhado no Capítulo 14 aqui.

A posição do Communication Hub tem uma característica própria que o distingue do CRM Hub: ele é, ao mesmo tempo, um Business Hub — representando a capacidade de negócio "comunicar-se com o mercado" — e o ponto de convergência técnica mais próximo do Integration Hub para tudo que envolve troca de mensagem, ainda que a fronteira entre os dois permaneça absoluta, conforme já estabelecido no Blueprint, Capítulo 4, e detalhada arquiteturalmente no Capítulo 13 deste documento. Essa proximidade técnica com o Integration Hub nunca se traduz em nenhum atalho arquitetural — o Communication Hub permanece, em todos os aspectos relevantes de modelagem de domínio, tão distante da implementação de um Provider quanto qualquer outro Business Hub da plataforma.

---

## 4. Filosofia

Omnichannel First. Toda decisão de arquitetura parte da premissa de que uma Conversation pode, e frequentemente vai, atravessar múltiplos Canais ao longo de sua vida — nenhum componente é desenhado assumindo um único Canal fixo por relacionamento.

Conversation First. A Conversation, não a Message individual, é a unidade central em torno da qual toda a arquitetura é organizada — uma Message isolada, sem Conversation associada, nunca é um estado válido do sistema.

Channel Agnostic. Nenhum componente interno do Communication Hub contém lógica específica de um Canal particular — essa especificidade pertence inteiramente ao Connector correspondente dentro do Integration Hub, já detalhado em `INTEGRATION_HUB.md`.

Single Communication Source. Existe exatamente um registro técnico de cada Conversation e de cada Message — nenhum componente interno mantém cópia paralela.

Event Driven. Toda mudança de estado relevante — nova Message, mudança de Delivery Status, transição de Conversation Status — produz um Evento antes de qualquer outra forma de comunicação com o restante da plataforma ser considerada.

Asynchronous by Default. O envio e o recebimento de comunicação são tratados, por padrão, como operações assíncronas — o Communication Hub nunca bloqueia um Command aguardando confirmação síncrona de um Provider externo antes de retornar controle ao solicitante.

Provider Independence. O Communication Hub nunca assume a permanência ou a disponibilidade constante de um Provider de Canal específico — essa independência é herdada diretamente do princípio já estabelecido em `INTEGRATION_HUB.md`, Capítulo 5.

Reliable Delivery. Toda Message despachada para envio é rastreada até sua confirmação ou até sua falha definitiva, nunca deixada em estado ambíguo e não observável.

Explicit Ownership. Toda Conversation tem um Conversation Assignment claro, e toda responsabilidade arquitetural interna é atribuída a um componente específico, nunca implícita.

Low Coupling. Nenhum componente interno depende da implementação interna de outro além do contrato que expõe.

High Cohesion. Todo componente relacionado a uma mesma Capacidade de Negócio, já catalogada no Blueprint, Capítulo 6, vive próximo, logicamente coeso, dentro da arquitetura interna.

---

## 5. Design Principles

**Conversation before Message.** Nenhuma Message é criada sem que uma Conversation já exista ou seja criada simultaneamente — a ordem de criação nunca se inverte.

**Message Immutability.** Uma Message, uma vez criada, nunca tem seu conteúdo alterado — apenas o Delivery Status associado evolui, conforme já exigido no Blueprint, Capítulo 12.

**Delivery is Independent.** Delivery é um Aggregate distinto de Message, permitindo múltiplas tentativas rastreáveis sobre a mesma Message, sem jamais fundir os dois conceitos em um único registro.

**Channel Independence.** A lógica central de Conversation Management nunca depende de qual Canal específico está em uso — a mesma Conversation, o mesmo Conversation Assignment e o mesmo Conversation Status se aplicam identicamente a WhatsApp, e-mail ou qualquer Canal futuro.

**Retry Never Rewrites History.** Toda nova tentativa de entrega produz um novo registro de Delivery, nunca sobrescrevendo o registro da tentativa anterior, aplicação arquitetural direta da Regra já fixada no Blueprint.

**Provider Abstraction.** Nenhum componente interno do Communication Hub conhece o formato técnico específico de um Provider — toda comunicação com Provider externo é mediada pelo Integration Hub, que já absorve essa abstração conforme `INTEGRATION_HUB.md`.

**Event Publication.** Todo Command bem-sucedido publica o Evento correspondente já catalogado no Blueprint antes de considerar a operação concluída.

**Delivery Tracking.** O estado de toda tentativa de entrega é observável em tempo real, do momento de despacho até confirmação ou falha, nunca uma caixa-preta entre esses dois pontos.

**Communication Auditability.** Toda operação sensível — transferência de Conversation Assignment, alteração de Communication Policy — produz registro auditável.

**Queue Isolation.** A fila de processamento de um Tenant, ou de um Canal específico, nunca compete de forma bloqueante pelo mesmo recurso que a fila de outro Tenant ou de outro Canal sob volume excepcional.

**Idempotent Delivery.** O processamento repetido de uma mesma tentativa de entrega, por exemplo por reenvio acidental de uma mensagem já na fila, nunca produz uma segunda Message efetivamente entregue ao destinatário.

**Explicit Conversation Ownership.** Toda Conversation tem, em um dado momento, exatamente um Conversation Assignment válido — nunca dois atendentes simultaneamente responsáveis de forma ambígua.

**Stateless Processing.** Nenhum Worker que processa Delivery retém estado entre uma operação e a próxima — todo estado necessário à continuidade de uma Conversation ou de uma Delivery em andamento é mantido de forma centralizada e persistente.

**Observability by Design.** Todo componente produz Logs, Tracing e Metrics desde sua concepção, nunca como capacidade adicionada depois de um incidente.

**Horizontal Scalability.** Todo componente é desenhado para escalar através de mais instâncias, nunca através do aumento de capacidade de uma única instância central.

---

## 6. Arquitetura Conceitual

```
                              Usuário
                     (atendente, ou parte externa via Canal)
                                 │
                                 ▼
                            Conversation
                  (unidade central de agrupamento — Blueprint,
                   Capítulo 7)
                                 │
                                 ▼
                          Communication Hub
              (Communication Manager orquestra os componentes
               internos descritos no Capítulo 7)
                                 │
                                 ▼
                       Business Capabilities
              (Conversation Management, Delivery Tracking, e as
               demais já catalogadas no Blueprint, Capítulo 6)
                                 │
                                 ▼
                          Domain Services
              (Validation, Retry Policy, Communication Policy)
                                 │
                                 ▼
                              Queues
              (Delivery Queue, processada por Workers)
                                 │
                                 ▼
                              Events
              (publicados conforme o catálogo do Blueprint,
               Capítulo 10)
                                 │
                                 ▼
                          Integration Hub
              (único ponto de saída para Provider externo —
               INTEGRATION_HUB.md)
                                 │
                                 ▼
                             Providers
              (WhatsApp, e-mail, e demais Canais externos)
```

A arquitetura interna que processa Command e Query segue o mesmo padrão de separação já estabelecido em `CRM_HUB.md`, Capítulo 6, com uma etapa adicional específica a este domínio — o Delivery Pipeline:

```
                    Usuário ou Hub consumidor
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
          Command                          Query
    (muda estado — Capítulo 10)      (lê estado — Capítulo 11)
              │                               │
              ▼                               ▼
      Validation Engine                  Read Model
              │                       (já materializado a
              ▼                        partir de Eventos
      Manager correspondente                anteriores)
      (Conversation, Message,                │
       Delivery, ...)                        ▼
              │                          Resposta
              ▼
        Delivery Pipeline (quando aplicável)
              │
              ▼
        Delivery Queue ──► Worker ──► Integration Hub ──► Provider
              │
              ▼
        Delivery Status atualizado (via Webhook Event
        traduzido, ou confirmação síncrona quando disponível)
              │
              ▼
        Event Publisher
              │
              ▼
           Evento
```

O Delivery Pipeline é acionado exclusivamente por um Command que produz envio de comunicação — Send Message, Send Broadcast — e nunca por uma Query. Toda Conversation Timeline, mencionada como capacidade central de consulta neste documento, é a agregação cronológica de Message e de Delivery Status já materializados através deste mesmo pipeline, consultável através da Query Conversation Timeline detalhada no Capítulo 11.

O paralelo entre a Conversation Timeline deste Hub e a Timeline já detalhada em `CRM_HUB.md` para o CRM Hub é intencional, mas não deve ser confundido com identidade de propósito: a Timeline do CRM Hub registra a história de negócio de um Relationship — quando uma Opportunity mudou de Estágio, quando o Ownership foi transferido —, enquanto a Conversation Timeline deste Hub registra especificamente o conteúdo e o estado de entrega de cada Message trocada. As duas Timelines são consultáveis de forma independente, cada uma pelo Hub que a possui, e um painel de Customer 360 que uma Empresa eventualmente construa na camada de apresentação combina as duas apenas na superfície de exibição, nunca fundindo os dois Read Models em uma única estrutura de dado compartilhada entre os dois Hubs.

---

## 7. Componentes Internos

### Communication Manager

O Communication Manager é o ponto de entrada e orquestrador central do Communication Hub, equivalente em função ao CRM Manager já descrito em `CRM_HUB.md`. Recebe todo Command e toda Query, direciona-os ao componente especializado correspondente, e não contém lógica de negócio específica de Capacidade.

### Conversation Manager

O Conversation Manager administra o ciclo de vida do Aggregate central Conversation — criação, agrupamento de Message, encerramento — servindo como base estrutural consultada por praticamente todos os demais componentes de Gestão de Entidade.

### Message Manager

O Message Manager administra a criação de Message, sempre associada a uma Conversation já existente ou recém-criada, garantindo a imutabilidade de seu conteúdo conforme já exigido no Blueprint.

### Thread Manager

O Thread Manager administra o agrupamento de Message em Thread dentro de uma Conversation, quando o Canal em uso suporta múltiplos fios de discussão simultâneos.

### Channel Manager

O Channel Manager administra o catálogo de Channel reconhecido pela plataforma — WhatsApp, e-mail, notificação — como conceito abstrato, consultado pelo Conversation Manager para resolver a que tipo de Canal uma nova Message pertence.

### Channel Account Manager

O Channel Account Manager administra a instância concreta de um Channel operada por uma Empresa, referenciando a Connection correspondente já mantida pelo Integration Hub, conforme `INTEGRATION_HUB.md`, Capítulo 8 — o Channel Account Manager nunca mantém, ele mesmo, a credencial técnica daquela conta, apenas a referência à Connection que a representa.

### Inbox Manager

O Inbox Manager mantém o Read Model consultável de toda Conversation de entrada aguardando atenção, organizado por Conversation Status e por Conversation Assignment.

### Outbox Manager

O Outbox Manager mantém o Read Model consultável de toda Message ainda não confirmada como entregue, base operacional para a Query Outbox detalhada no Capítulo 11.

### Delivery Manager

O Delivery Manager administra a criação do Aggregate Delivery a cada tentativa de envio, distinto de Message, conforme já exigido no Blueprint.

### Delivery Tracking Manager

O Delivery Tracking Manager mantém o Read Model consultável de Delivery Status em tempo real, atualizado a cada Evento de confirmação ou de falha recebido através do Integration Hub.

### Retry Manager

O Retry Manager administra a Retry Policy aplicável a uma Delivery que falhou por motivo transitório, produzindo um novo registro de Delivery a cada nova tentativa, nunca sobrescrevendo o anterior, aplicação direta do princípio Retry Never Rewrites History já descrito no Capítulo 5.

### Queue Manager

O Queue Manager organiza a Delivery Queue, absorvendo pico de volume de envio sem bloquear a criação de nova Message, mesmo princípio conceitual já descrito em `AUTOMATION_ENGINE.md` e em `INTEGRATION_HUB.md`, aplicado aqui especificamente a envio de comunicação.

### Broadcast Manager

O Broadcast Manager administra a decomposição de um Broadcast em Delivery individuais rastreáveis, conforme já exigido no Blueprint, garantindo que nenhum envio em massa seja tratado como operação atômica opaca.

### Notification Manager

O Notification Manager administra a criação de Notification, distinta de Message conversacional, tipicamente originada de outro Hub através de uma Action do Automation Engine.

### Template Manager

O Template Manager administra o Message Template, consumindo o Template Manager e o Theme Manager já descritos em `BRANDING_HUB.md` para garantir que identidade de marca seja aplicada a todo modelo reutilizável de mensagem.

### Attachment Manager

O Attachment Manager administra a associação de Attachment a uma Message, garantindo que nenhum Attachment exista sem uma Message correspondente, conforme já exigido no Blueprint.

### Conversation Assignment Manager

O Conversation Assignment Manager administra a atribuição e a transferência de responsável por uma Conversation, garantindo unicidade de responsável em qualquer momento, mesmo princípio já aplicado ao Ownership Manager do CRM Hub em `CRM_HUB.md`, Capítulo 7.

### Conversation Status Manager

O Conversation Status Manager administra a transição de Conversation Status — aberta, em atendimento, fechada —, garantindo que uma Conversation possua exatamente um Status em um dado momento.

### Participant Manager

O Participant Manager administra o registro de Participant de uma Conversation, referenciando por identificador tanto o Usuário da Empresa quanto a parte externa, sem duplicar o Domain Model completo de nenhum dos dois.

### Preference Manager

O Preference Manager administra a Communication Preference operacional dentro de uma Conversation específica, consumida por Evento do CRM Hub, nunca mantida como cópia independente da preferência de relacionamento.

### Policy Manager

O Policy Manager administra a Communication Policy aplicável a cada Canal e a cada Empresa, verificada pelo Message Manager antes de permitir a criação de qualquer nova Message de saída.

### Webhook Manager

O Webhook Manager recebe o Webhook Event já traduzido pelo Integration Hub e o direciona ao componente correspondente — Message Manager para nova Message recebida, Delivery Tracking Manager para atualização de Delivery Status —, nunca aplicando a mudança diretamente sem essa mediação.

### Typing Indicator Manager

O Typing Indicator Manager administra o sinal transitório de que uma das partes está compondo uma mensagem, relevante para experiência de conversa em tempo real, tratado como sinal efêmero, nunca persistido como parte da Timeline.

### Read Receipt Manager

O Read Receipt Manager administra o registro imutável de confirmação de leitura, aplicado apenas quando o Canal de origem efetivamente reporta esse sinal, conforme já exigido no Blueprint.

### Reaction Manager

O Reaction Manager administra o registro de Reaction a uma Message específica, quando o Canal suporta esse recurso.

### Conversation Search Manager

O Conversation Search Manager mantém índice dedicado para busca sobre Conversation e Message, atualizado a partir dos mesmos Eventos que atualizam os demais Read Models, mesmo padrão já descrito para o Search Manager do CRM Hub.

### Communication Analytics

O Communication Analytics agrega dado operacional interno — volume de Message por Canal, taxa de entrega, tempo médio de primeira resposta — consumido pelo Analytics Hub, sem que o Communication Hub calcule, ele mesmo, indicador de negócio mais amplo dependente de outro Hub.

### History Manager

O History Manager preserva o registro cronológico de mudança relevante de qualquer Entidade do Communication Hub, complementar e distinto da Conversation Timeline em si — History cobre mudança de estado técnico, Timeline cobre especificamente a história de comunicação de uma Conversation.

### Audit Manager

O Audit Manager preserva o registro imutável de toda operação sensível — transferência de Conversation Assignment, alteração de Communication Policy —, alinhado ao mesmo padrão de auditoria imutável já estabelecido em toda a plataforma.

### Lifecycle Manager

O Lifecycle Manager administra a transição de Conversation Status ao longo do tempo, incluindo encerramento automático de Conversation inativa após intervalo configurável.

### Configuration Manager

O Configuration Manager administra os parâmetros específicos de cada Empresa — regra de fila de atendimento, limite de Retry, Canal habilitado —, aplicando o princípio Configuration over Code já estabelecido em `SAAS_ARCHITECTURE.md`.

### Notification Publisher

O Notification Publisher aciona notificação a um Usuário responsável — por exemplo, ao receber uma nova Conversation atribuída —, consumindo o Notification Engine já descrito em `AUTOMATION_ENGINE.md`.

### Event Publisher

O Event Publisher é o componente técnico responsável por publicar todo Evento de domínio já catalogado no Blueprint no Event Bus descrito em `SYSTEM_BLUEPRINT.md`, garantindo que todo Command bem-sucedido produza o Evento correspondente antes de considerar a operação concluída.

### Reporting Adapter

O Reporting Adapter expõe o Read Model do Communication Hub em formato consumível por relatório gerado através do Document Branding já descrito em `BRANDING_HUB.md`.

Cada um destes componentes tem um limite estrito de responsabilidade, e nenhum deles acumula lógica de outro componente vizinho — a mesma disciplina de modularidade interna já aplicada em `CRM_HUB.md` se aplica, com o mesmo rigor, aqui.

Os trinta e três componentes se organizam em cinco categorias funcionais, mesmo padrão de categorização já introduzido em `CRM_HUB.md`, Capítulo 7:

```
              CATEGORIAS DE COMPONENTES INTERNOS DO COMMUNICATION HUB
   ┌───────────────────────────────────────────────────────────┐
   │  Orquestração:        Communication Manager                    │
   │                                                                │
   │  Gestão de Entidade:  Conversation · Message · Thread ·           │
   │                       Channel · Channel Account · Attachment ·      │
   │                       Conversation Assignment · Conversation          │
   │                       Status · Participant · Preference               │
   │                                                                │
   │  Entrega:             Delivery · Delivery Tracking · Retry ·           │
   │                       Queue · Broadcast · Notification                   │
   │                                                                │
   │  Conteúdo e Sinal:    Template · Typing Indicator · Read                  │
   │                       Receipt · Reaction · Webhook                          │
   │                                                                │
   │  Suporte Transversal: Policy · Conversation Search ·                          │
   │                       Communication Analytics · History · Audit ·               │
   │                       Lifecycle · Configuration · Notification                     │
   │                       Publisher · Event Publisher · Reporting Adapter                │
   └───────────────────────────────────────────────────────────┘
```

---

## 8. Business Capabilities

As quinze Capacidades de Negócio do Communication Hub já foram catalogadas em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 6. Este capítulo mapeia cada uma ao componente interno que a implementa arquiteturalmente.

Conversation Management é implementada pelo Conversation Manager. Message Management é implementada pelo Message Manager. Channel Management é implementada pelo Channel Manager e pelo Channel Account Manager. Inbox Management é implementada pelo Inbox Manager. Delivery Tracking é implementada pelo Delivery Manager e pelo Delivery Tracking Manager. Omnichannel Routing é implementada em conjunto pelo Conversation Manager e pelo Channel Manager, resolvendo a associação de nova Message a Conversation já existente independentemente do Canal de origem. Notification Management é implementada pelo Notification Manager. Broadcast é implementado pelo Broadcast Manager. Message Templates é implementada pelo Template Manager. Attachments é implementada pelo Attachment Manager. Conversation Assignment é implementada pelo Conversation Assignment Manager. Communication Policies é implementada pelo Policy Manager. Queue Management é implementada pelo Queue Manager. Retry Management é implementada pelo Retry Manager. Delivery History é implementada em conjunto pelo History Manager e pelo Delivery Tracking Manager.

```
              MAPEAMENTO DE CAPACIDADE PARA COMPONENTE (resumo)
   ┌───────────────────────────────────────────────────────────┐
   │  Conversation Management → Conversation Manager                │
   │  Message Management      → Message Manager                       │
   │  Channel Management       → Channel Manager + Channel Account Mgr    │
   │  Inbox Management         → Inbox Manager                              │
   │  Delivery Tracking        → Delivery Manager + Delivery Tracking Mgr     │
   │  Omnichannel Routing      → Conversation Manager + Channel Manager        │
   │  Notification Management  → Notification Manager                            │
   │  Broadcast                → Broadcast Manager                                  │
   │  Message Templates        → Template Manager                                     │
   │  Attachments              → Attachment Manager                                     │
   │  Conversation Assignment  → Conversation Assignment Manager                          │
   │  Communication Policies   → Policy Manager                                             │
   │  Queue Management         → Queue Manager                                                │
   │  Retry Management         → Retry Manager                                                  │
   │  Delivery History         → History Manager + Delivery Tracking Manager                       │
   └───────────────────────────────────────────────────────────┘
```

Duas Capacidades — Omnichannel Routing e Delivery History — são as únicas implementadas pela colaboração de mais de um componente principal, e essa exceção é deliberada: Omnichannel Routing existe precisamente na interseção entre gestão de Conversation e gestão de Canal, e Delivery History existe na interseção entre o registro histórico geral e o rastreamento específico de entrega. Nenhuma das duas introduz uma dependência circular — Conversation Manager e Channel Manager permanecem componentes independentes entre si, coordenados através do Communication Manager, nunca um invocando o outro diretamente.

Esse mapeamento também esclarece uma pergunta natural para quem lê este documento pela primeira vez: por que Omnichannel Routing, uma das Capacidades mais centrais à proposta de valor deste Hub, não recebe um componente principal próprio e dedicado, ao contrário de Capacidades aparentemente mais simples como Attachments. A resposta é que Omnichannel Routing não é uma operação isolada executável por um único componente — é uma propriedade emergente da forma como Conversation Manager e Channel Manager já operam em conjunto, sempre que uma nova Message chega por qualquer Canal e precisa ser associada à Conversation correta. Introduzir um "Omnichannel Routing Manager" dedicado duplicaria lógica de resolução de Conversation já existente no Conversation Manager, exatamente o tipo de duplicação de responsabilidade que `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 3, já identificou como risco central a evitar.

---

## 9. Fluxos Operacionais

**Mensagem Recebida.** Um Webhook Event chega através do Integration Hub, processado pelo Webhook Manager, que o direciona ao Message Manager. O Conversation Manager resolve se a mensagem pertence a uma Conversation já existente ou se uma nova deve ser criada, e o Event Publisher publica `MessageReceived`.

**Assignment.** Uma nova Conversation, ou uma Conversation sem responsável ativo, é processada pelo Conversation Assignment Manager, que aplica regra de fila já configurada — round-robin, carga já atribuída, ou disponibilidade declarada — e publica `ConversationAssigned`.

**Resposta.** Um atendente, ou o AI Hub através de sugestão consumida pelo atendente, compõe uma nova Message. O Message Manager cria o Aggregate, o Policy Manager verifica a Communication Policy aplicável, e a Message segue para o Delivery Pipeline já descrito no Capítulo 6.

**Delivery.** A Message despachada entra na Delivery Queue administrada pelo Queue Manager, um Worker a processa através do Integration Hub, e o Delivery Tracking Manager atualiza o Delivery Status conforme a confirmação retorna.

**Receipts.** Quando o Canal de origem suporta o recurso, um Read Receipt é recebido via Webhook Event, traduzido e registrado pelo Read Receipt Manager, e `MessageRead` é publicado.

**Broadcast.** Um Command `SendBroadcast` é processado pelo Broadcast Manager, que decompõe o envio em múltiplas Delivery individuais.

**Queue.** Cada Delivery individual de um Broadcast entra na mesma Delivery Queue usada por envio de Conversation individual, respeitando o Rate Limiting já detalhado no Capítulo 17.

**Worker.** Um Worker consome a fila, processa cada Delivery através do Integration Hub, e atualiza o Delivery Status correspondente, sem que a falha de uma Delivery específica bloqueie o processamento das demais.

**Retry.** Uma Delivery que falha por motivo transitório é reprocessada pelo Retry Manager conforme a Retry Policy configurada, produzindo novo registro de Delivery a cada tentativa.

**Notification.** Um Evento de outro Hub, consumido através de uma Action do Automation Engine, aciona o Notification Manager, que cria uma Notification e a envia através do mesmo Delivery Pipeline usado por Message.

**Policy.** Antes de qualquer envio, o Policy Manager verifica a Communication Policy aplicável ao Canal e ao destinatário, incluindo janela de horário e exigência de Consent já registrado pelo CRM Hub.

**Channel.** O Channel Manager resolve, para uma nova Message de saída, qual Channel Account específica deve processá-la, consultando a Configuration daquela Empresa.

**Delivery.** Uma vez resolvido o Canal, a Delivery segue o mesmo pipeline já descrito, mediado pelo Integration Hub.

**Conversation Omnichannel.** Uma Conversation já aberta via WhatsApp recebe uma nova Message via e-mail da mesma parte externa; o Conversation Manager reconhece a continuidade através de identificador de Participant comum, agregando a nova Message à Conversation já existente em vez de criar uma nova.

**Mudança de Canal.** O Channel Manager registra a mudança de Canal dentro da mesma Conversation, sem produzir encerramento nem reinício, preservando a Timeline unificada.

**Continuidade da Conversa.** A Conversation Timeline, consultável através da Query já descrita no Capítulo 11, apresenta toda Message de ambos os Canais em ordem cronológica única, independentemente de origem.

**Escalonamento entre Atendentes.** Uma Conversation que exige atenção de nível superior é transferida através de um Command `TransferConversation`, processado pelo Conversation Assignment Manager, que registra a mudança de responsável e publica `ConversationAssigned` novamente, com o novo Account Manager herdando acesso imediato à Timeline completa.

```
              FLUXO OPERACIONAL — MENSAGEM RECEBIDA ATÉ RESPOSTA
   ┌───────────────────────────────────────────────────────────┐
   │  Webhook Event (via Integration Hub)                           │
   │       │                                                        │
   │       ▼                                                        │
   │  Webhook Manager (traduz e direciona)                              │
   │       │                                                        │
   │       ▼                                                        │
   │  Message Manager ──► Conversation Manager                          │
   │  (cria a Message)     (resolve Conversation existente ou nova)        │
   │       │                        │                                       │
   │       ▼                        ▼                                       │
   │  Event Publisher ──► MessageReceived                                      │
   │                                │                                            │
   │                                ▼                                            │
   │                     Conversation Assignment Manager                             │
   │                     (atribui responsável, se ainda não houver)                     │
   │                                │                                                    │
   │                                ▼                                                    │
   │                     Event Publisher ──► ConversationAssigned                            │
   │                                │                                                        │
   │                                ▼                                                        │
   │                     Atendente (ou AI Hub) compõe resposta                                    │
   │                                │                                                            │
   │                                ▼                                                            │
   │                     Delivery Pipeline (Capítulo 6)                                              │
   └───────────────────────────────────────────────────────────┘
```

---

## 10. Comandos

Start Conversation cria uma nova Conversation, tipicamente em reação a uma Message recebida sem Conversation prévia, ou por iniciativa manual de um atendente.

Assign Conversation atribui um responsável a uma Conversation ainda sem Conversation Assignment ativo, processado pelo Conversation Assignment Manager.

Transfer Conversation transfere a responsabilidade de uma Conversation já atribuída para outro Usuário, preservando o histórico de atribuições anteriores.

Close Conversation transiciona uma Conversation para Status encerrado, processado pelo Conversation Status Manager.

Send Message cria uma nova Message de saída, associada a uma Conversation existente, sujeita a Validation e a verificação de Communication Policy antes de seguir ao Delivery Pipeline.

Retry Delivery aciona manualmente uma nova tentativa de entrega para uma Delivery já falha, complementar ao Retry automático já administrado pelo Retry Manager.

Create Template cria um novo Message Template, com identidade de marca resolvida através do Branding Hub.

Update Template altera um Template já existente, produzindo nova versão preservável conforme já exigido no Blueprint.

Send Broadcast inicia o envio de uma Message a múltiplos destinatários, processado pelo Broadcast Manager.

Upload Attachment associa um novo Attachment a uma Message já existente.

Register Webhook configura o endpoint de recebimento de notificação de um novo Channel Account, mediado pelo Webhook Manager do Integration Hub.

Change Communication Preference atualiza a preferência operacional de canal e de frequência dentro de uma Conversation específica, tipicamente em reação a um Evento já publicado pelo CRM Hub.

Update Conversation Status altera o Status de uma Conversation diretamente, quando essa mudança não é consequência automática de outra operação.

```
                              COMANDOS
   ┌───────────────────────────────────────────────────────────┐
   │  Conversation:  StartConversation · AssignConversation ·        │
   │                 TransferConversation · CloseConversation ·        │
   │                 UpdateConversationStatus                            │
   │  Mensagem:      SendMessage · UploadAttachment                        │
   │  Entrega:       RetryDelivery                                          │
   │  Conteúdo:      CreateTemplate · UpdateTemplate                          │
   │  Alcance:       SendBroadcast                                             │
   │  Integração:    RegisterWebhook                                             │
   │  Preferência:   ChangeCommunicationPreference                                 │
   └───────────────────────────────────────────────────────────┘
```

Todo Comando listado acima segue o princípio Idempotent Delivery já descrito no Capítulo 5, quando aplicável a operação de envio — cada um identificado por operação única, garantindo que reenvio acidental nunca produza efeito duplicado, mesma disciplina já demonstrada para os Comandos do CRM Hub em `CRM_HUB.md`, Capítulo 10.

---

## 11. Consultas

Conversation View recupera a estrutura central de uma Conversation — Status, Assignment, Canal em uso — sem incluir a Timeline extensa, equivalente conceitual ao Relationship View já descrito em `CRM_HUB.md`.

Conversation Timeline recupera o histórico cronológico completo de Message e Delivery Status de uma Conversation específica, resolvida contra o Read Model mantido em conjunto pelo Message Manager e pelo Delivery Tracking Manager.

Inbox recupera toda Conversation de entrada aguardando atenção, filtrável por Conversation Status e por Conversation Assignment.

Outbox recupera toda Message ainda não confirmada como entregue.

Delivery Status recupera o estado atual de uma Delivery específica, incluindo histórico de tentativas já realizadas pelo Retry Manager.

Broadcast Status recupera o progresso agregado de um Broadcast, incluindo quantas Delivery individuais já foram confirmadas, falharam, ou permanecem pendentes.

Unread Conversations recupera toda Conversation com Message não lida pelo atendente responsável, uma visão operacional de prioridade de atendimento.

Assigned Conversations recupera toda Conversation atribuída a um Usuário específico, base da visão de trabalho diário de um atendente.

Conversation Search recupera Conversation ou Message correspondente a um termo de busca, resolvida contra o índice mantido pelo Conversation Search Manager.

Message History é sinônimo operacional de Conversation Timeline aplicado especificamente à perspectiva de conteúdo trocado, sem incluir necessariamente todo metadado de Delivery.

Delivery History recupera o registro consultável de toda tentativa de entrega já ocorrida, incluindo falhas e retentativas, mantido pelo History Manager.

Communication Dashboard recupera indicador consolidado de operação do Communication Hub — volume por Canal, taxa de entrega, tempo médio de resposta —, consumindo o Communication Analytics já descrito no Capítulo 7.

```
                              CONSULTAS
   ┌───────────────────────────────────────────────────────────┐
   │  Visão consolidada:  Conversation View · Conversation Timeline  │
   │  Fila de trabalho:   Inbox · Unread Conversations ·               │
   │                      Assigned Conversations                          │
   │  Entrega:            Outbox · Delivery Status · Broadcast Status        │
   │  Histórico:          Message History · Delivery History                   │
   │  Organização:        Conversation Search                                     │
   │  Indicador:          Communication Dashboard                                    │
   └───────────────────────────────────────────────────────────┘
```

Toda Query listada acima é resolvida contra um Read Model já materializado, aplicação do mesmo princípio Read Model Optimization já demonstrado em `CRM_HUB.md`, Capítulo 5 — nenhuma delas reconstrói seu resultado a partir de varredura completa do armazenamento transacional primário a cada chamada.

---

## 12. Eventos

Este capítulo não redefine nenhum Evento — o catálogo completo dos quinze Eventos do domínio já está definido em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 10. O que este capítulo descreve é a arquitetura técnica de publicação, consumo e garantia de entrega desses Eventos.

Publicação acontece exclusivamente através do Event Publisher já descrito no Capítulo 7 — nenhum outro componente publica Evento diretamente.

Consumo de Evento originado em outro Hub — `LeadCreated`, `RelationshipChanged`, `ConsentUpdated` do CRM Hub, `CampaignPublished` do Growth Hub — acontece através de uma Anti-Corruption Layer dedicada a cada integração, detalhada no Capítulo 14.

Versionamento de Evento segue o mesmo princípio já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 10, e já aplicado em `CRM_HUB.md`, Capítulo 12.

Replay é suportado pelo History Manager, permitindo reconstruir o Read Model de qualquer Capacidade a partir da sequência completa de Eventos já publicados.

Idempotência de consumo garante que o Communication Hub processe com segurança um mesmo Evento entregue mais de uma vez pelo Event Bus, sem produzir Message ou atualização de Delivery Status duplicada.

Ordenação de Evento é uma preocupação arquitetural específica deste domínio, mais crítica aqui do que em outros Business Hubs já documentados: a sequência em que Message e Delivery Status são processados dentro de uma mesma Conversation precisa refletir a ordem cronológica real, sob pena de a Conversation Timeline apresentar uma sequência de comunicação incoerente. O Communication Hub garante ordenação por Conversation — todo Evento relativo a uma mesma Conversation é processado em sequência, nunca em paralelo de forma que produza ordem indeterminada —, ainda que Eventos de Conversation diferentes continuem processáveis em paralelo entre si, preservando escala sem comprometer coerência.

Consistência eventual, já descrita como propriedade aceita da comunicação entre Business Hubs em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 10, se aplica à propagação de Evento do Communication Hub para os demais — o CRM Hub reflete uma nova Activity a partir de `MessageReceived` dentro de um intervalo curto, não instantâneo.

Dead Letter Queue recebe todo Evento que o Communication Hub falhou em processar de forma definitiva, mesmo componente conceitual já descrito em `AUTOMATION_ENGINE.md` e em `INTEGRATION_HUB.md`, aqui aplicado a falha de consumo de Evento de domínio.

---

## 13. Integração com Platform Services

O Identity Hub autentica e autoriza toda operação de Command e de Query sobre o Communication Hub, através do modelo RBAC e ABAC já detalhado em `IDENTITY_HUB.md` — por exemplo, distinguindo um Perfil Atendimento com Permissão de Send Message de um Perfil Convidado com acesso apenas de leitura.

O Automation Engine consome Eventos publicados pelo Communication Hub — `MessageReceived`, `ConversationAssigned` — para disparar Workflow, e invoca o Communication Hub através da Action "Enviar mensagem" já descrita em `AUTOMATION_ENGINE.md`, Capítulo 11, quando um Workflow decide que uma comunicação deve ser enviada — por exemplo, um lembrete de aniversário já exemplificado naquele documento, Capítulo 19.

O Knowledge Hub é consultado, através do AI Hub, quando uma resposta a Message recebida se beneficia de FAQ ou Procedimento já documentado, seguindo o padrão de Retrieval-Augmented Generation já detalhado em `KNOWLEDGE_HUB.md`, Capítulo 11 — o Communication Hub nunca consulta o Knowledge Hub diretamente sem essa mediação.

O Integration Hub é a única via pela qual toda Message alcança ou chega de um Provider externo, através do modelo já detalhado em `INTEGRATION_HUB.md` — o Webhook Manager e o Delivery Pipeline, ambos já descritos neste documento, consomem exclusivamente esse canal.

O Business Profile Engine informa o Communication Hub sobre o Segmento e a Maturidade da Empresa, consumido pelo Policy Manager para calibrar Communication Policy — por exemplo, um Segmento de natureza mais formal, como Advocacia já exemplificada em `BUSINESS_PROFILE_ENGINE.md`, Capítulo 10, tende a exigir política mais conservadora de frequência de contato.

O Branding Hub informa o Template Manager e o Reporting Adapter sobre identidade de marca e tom de voz, através do modelo já detalhado em `BRANDING_HUB.md` — nenhuma Message composta a partir de um Template ignora essa identidade.

O AI Hub é consumido pelo Message Manager para compor sugestão de resposta a uma Message recebida — o AI Hub decide o conteúdo, o Communication Hub decide quando e por qual Canal enviá-lo, uma distinção que este documento reforça explicitamente na Conclusão.

```
              INTEGRAÇÃO DO COMMUNICATION HUB COM PLATFORM
                    SERVICES E ADAPTIVE INTELLIGENCE
   ┌───────────────────────────────────────────────────────────┐
   │  Communication Manager                                        │
   │       │                                                        │
   │       ├──► Identity Hub          (autenticação, Permissão)       │
   │       ├──► AI Hub                (sugestão de conteúdo de resposta)│
   │       ├──► Knowledge Hub          (via AI Hub — Retrieval)             │
   │       ├──► Integration Hub        (envio/recebimento com Provider)       │
   │       ├──► Automation Engine      (Workflow disparado por Evento)         │
   │       ├──► Business Profile Engine (Segmento, Maturidade → Policy)          │
   │       └──► Branding Hub           (Template, tom de voz)                       │
   └───────────────────────────────────────────────────────────┘
```

A integração com o Business Profile Engine merece um exemplo concreto adicional: uma Empresa classificada com Maturidade Digital ainda inicial, conforme já detalhado em `BUSINESS_PROFILE_ENGINE.md`, Capítulo 7, tipicamente recebe uma Communication Policy padrão mais conservadora — menor frequência de contato automatizado, canal único priorizado — enquanto uma Empresa de Maturidade elevada, já operando múltiplos Canais de forma coordenada, recebe uma Policy que permite maior sofisticação de Omnichannel Routing e de Broadcast simultâneo. O Policy Manager nunca decide essa calibração por conta própria — ele resolve, a cada verificação, a Policy já configurada com base na classificação fornecida pelo Business Profile Engine, exatamente como o Configuration Manager do CRM Hub resolve estrutura de Pipeline a partir da mesma fonte, conforme já demonstrado em `CRM_HUB.md`, Capítulo 18.

Uma falha de disponibilidade em qualquer um desses sete serviços degrada a capacidade específica que ele sustenta, nunca a operação essencial do Communication Hub — a indisponibilidade momentânea do AI Hub suspende a sugestão de resposta, mas nunca impede que um atendente componha e envie uma Message manualmente através do Command padrão já descrito no Capítulo 10, mesmo princípio de Graceful Degradation já aplicado em `CRM_HUB.md`, ADR-014.

---

## 14. Integração com outros Business Hubs

O CRM Hub publica `LeadCreated`, `RelationshipChanged` e `ConsentUpdated`, consumidos pelo Communication Hub para determinar destinatário elegível e Communication Preference operacional; e consome `MessageReceived` e `ConversationClosed`, publicados pelo Communication Hub, para registrar Activity na Timeline correspondente, exatamente conforme já antecipado em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 11, e em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 11.

O Finance Hub pode invocar o envio de uma Notification de cobrança através da mesma Action de Automation Engine já usada por qualquer outro Hub, sem que o Communication Hub conheça o Domain Model interno de Invoice pertencente àquele Hub.

O Growth Hub define o conteúdo estratégico de uma Campaign Message, mas delega inteiramente ao Communication Hub o envio através de Send Broadcast, o rastreamento de Delivery, e a captura de Read Receipt — o Growth Hub nunca implementa sua própria fila de envio, conforme já estabelecido no Blueprint, Capítulo 11.

O Analytics Hub consome todo Evento publicado pelo Communication Hub para calcular indicador consolidado de comunicação, nunca chamado diretamente pelo Communication Hub para fornecer dado em tempo real a uma decisão em andamento.

```
              COLABORAÇÃO ENTRE BUSINESS HUBS (via Evento)
   ┌───────────────────────────────────────────────────────────┐
   │  Communication Hub                                            │
   │    publica: MessageReceived · MessageSent · MessageDelivered ·  │
   │             MessageFailed · MessageRead · ConversationStarted ·    │
   │             ConversationAssigned · ConversationClosed ·               │
   │             BroadcastStarted · BroadcastFinished                        │
   │    consome:  LeadCreated · RelationshipChanged · ConsentUpdated          │
   │              (CRM Hub) · CampaignPublished (Growth Hub)                     │
   └───────────────────────────────────────────────────────────┘
```

---

## 15. Segurança

Permissões sobre toda operação do Communication Hub são verificadas através do Identity Hub, com granularidade que distingue Perfil operacional de atendimento de Perfil administrativo com acesso a Communication Policy.

Ownership, administrado pelo Conversation Assignment Manager, garante que toda Conversation tenha responsável identificável, eliminando ambiguidade de quem deveria agir sobre uma comunicação pendente.

A conformidade com a LGPD segue o mesmo padrão já estabelecido em toda a série, com atenção específica ao conteúdo de Message, que frequentemente contém dado pessoal — o direito de exclusão é honrado através de ofuscação de dado pessoal identificável, preservando a existência estrutural do registro histórico, mesma disciplina já detalhada em `CRM_HUB.md`, Capítulo 15, para a Timeline do CRM Hub.

Consentimento é consumido do CRM Hub através de `ConsentUpdated`, e verificado pelo Policy Manager antes de qualquer envio, nunca reimplementado como lógica própria dentro do Communication Hub.

Retenção de Message e de Attachment segue política configurável por Empresa, administrada em conjunto pelo Configuration Manager e pelo Lifecycle Manager.

Auditoria, administrada pelo Audit Manager, preserva o registro imutável de toda operação sensível.

Histórico, administrado pelo History Manager, garante que toda mudança relevante permaneça reconstruível.

Soft Delete se aplica a Conversation encerrada — nenhuma Conversation é fisicamente removida, apenas transicionada para Status encerrado, preservando integralmente sua Timeline.

Imutabilidade das mensagens, já exigida no Blueprint e garantida arquiteturalmente pelo Message Manager, é tratada como a garantia de segurança mais fundamental deste Hub, exatamente como a imutabilidade da Timeline o é para o CRM Hub.

Proteção de anexos garante que todo Attachment seja armazenado com o mesmo padrão de criptografia e de isolamento por Tenant já aplicado a qualquer dado sensível da plataforma, com acesso mediado pela mesma verificação de Permissão aplicada à Conversation à qual pertence.

Segurança entre tenants garante que nenhuma Conversation, Message, Delivery ou Attachment de um Tenant seja acessível, nem incidentalmente, a partir de outro, aplicação direta do isolamento multiempresa já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 6, estendido explicitamente ao índice de busca mantido pelo Conversation Search Manager.

Um risco de segurança específico deste domínio, análogo ao já identificado para busca semântica em `KNOWLEDGE_HUB.md`, Capítulo 17, é o vazamento indireto de conteúdo de Conversation através do próprio índice de busca — uma consulta de Conversation Search que, sem verificação de Permissão aplicada antes da avaliação de relevância, poderia retornar um resultado tecnicamente correspondente ao termo buscado, mesmo quando o consulente não tem Permissão de acesso àquela Conversation específica. Por isso, o Conversation Search Manager aplica a mesma verificação já detalhada pelo Identity Hub antes de considerar qualquer Conversation como candidata a resultado, nunca depois — um Relationship ou uma Conversation sem a Permissão correspondente ao consulente é removido do conjunto de candidatos antes mesmo de competir por posição no resultado de busca.

```
                  CAMADAS DE SEGURANÇA DO COMMUNICATION HUB
   ┌───────────────────────────────────────────────────────────┐
   │  Autenticação e Autorização (Identity Hub)                     │
   │       ▼                                                         │
   │  Ownership (Conversation Assignment Manager)                      │
   │       ▼                                                         │
   │  Communication Policy (Policy Manager)                              │
   │       ▼                                                         │
   │  Soft Delete (Conversation Status Manager)                            │
   │       ▼                                                         │
   │  Imutabilidade da Message (Message Manager)                             │
   │       ▼                                                         │
   │  Auditoria (Audit Manager)                                                 │
   └───────────────────────────────────────────────────────────┘
```

---

## 16. Observabilidade

Logs registram toda execução de Command e de Query, com o mesmo padrão estrutural já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 13.

Tracing conecta o processamento de um Command, a mudança de Aggregate resultante, e o Evento publicado em consequência, incluindo o caminho completo através do Delivery Pipeline até confirmação ou falha.

SLIs específicos incluem tempo de primeira resposta em uma Conversation, taxa de sucesso de Delivery na primeira tentativa, e latência de propagação de Read Receipt.

SLOs são calibrados especificamente à natureza de cada Canal — um SLO de latência de entrega aceitável para WhatsApp pode ser diferente do aceitável para e-mail, dado que os dois Canais têm características técnicas de entrega inerentemente distintas.

KPIs consumidos pelo Communication Analytics incluem volume de Conversation aberta por período, tempo médio de resolução, e taxa de Delivery bem-sucedida por Canal.

Conversation Metrics acompanham volume de Conversation ativa, distribuição por Conversation Status, e tempo médio de permanência em cada Status.

Delivery Metrics acompanham volume de Delivery processada, taxa de sucesso, e distribuição de latência de confirmação por Canal.

Queue Metrics acompanham profundidade da Delivery Queue, tempo de espera médio antes de processamento, e taxa de crescimento da fila sob pico de demanda.

Retry Metrics acompanham volume de nova tentativa disparada pelo Retry Manager, e taxa de sucesso de Delivery após retentativa, informando se a Retry Policy configurada está calibrada adequadamente.

Eventos, já descritos no Capítulo 12, são eles mesmos um registro observável de primeira classe.

Health Checks reportam a disponibilidade operacional do Communication Hub de forma independente dos demais Business Hubs.

Alertas são disparados quando a taxa de falha de Delivery de um Canal específico, ou a profundidade da Delivery Queue, ultrapassa um limite configurado, permitindo intervenção antes que uma Empresa perceba mensagem não entregue.

Um sinal de observabilidade específico deste Hub, sem equivalente direto em nenhum dos Hubs já documentados nesta série, é o tempo médio decorrido entre `ConversationStarted` e a primeira `MessageSent` de resposta — o tempo de primeira resposta já mencionado como SLI, mas aqui tratado com profundidade adicional: esse indicador, segmentado por Canal, por horário do dia e por Conversation Assignment Manager responsável, revela padrões operacionais que nenhuma métrica agregada isolada capturaria — por exemplo, uma Empresa pode descobrir que Conversation atribuída fora do horário comercial declarado tem tempo de primeira resposta sistematicamente mais alto, um sinal de que sua regra de fila configurada não está considerando adequadamente a disponibilidade real da equipe fora desse horário.

Um segundo sinal específico é a taxa de Conversation que transita de um Canal para outro ao longo de sua própria vida — uma medida direta e observável de quão efetivamente a capacidade de Omnichannel Routing está sendo utilizada na prática, distinta de simplesmente medir volume por Canal isoladamente. Uma taxa crescente desse indicador ao longo do tempo é, em si, uma validação de que a arquitetura Channel Agnostic já descrita no Capítulo 4 está entregando valor real percebido pela operação da Empresa, não apenas uma capacidade tecnicamente disponível mas raramente exercitada.

---

## 17. Escalabilidade

Milhões de mensagens e milhões de conversas são suportadas porque nenhum componente interno mantém estado compartilhado entre Conversation de Tenants diferentes, aplicação direta do isolamento multiempresa já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 6.

Escalabilidade horizontal permite que múltiplas instâncias de processamento de Command e de Worker de Delivery operem em paralelo, absorvendo aumento de volume através de mais instâncias, nunca através do aumento de capacidade de uma única instância central.

Workers independentes processam a Delivery Queue de forma paralela e escalável, cada um capaz de processar Delivery de qualquer Tenant, sem afinidade fixa que criaria ponto único de gargalo.

Queues, administradas pelo Queue Manager, absorvem pico de volume de envio — por exemplo, o início de um Broadcast de grande escala — sem bloquear o recebimento de nova Message de entrada, que segue seu próprio caminho de processamento independente.

Backpressure sinaliza, de volta a um Hub solicitante, quando o volume de Command de envio excede a capacidade momentânea de processamento, permitindo que o solicitante ajuste seu próprio ritmo em vez de sobrecarregar a Delivery Queue indefinidamente.

Rate Limiting, administrado em conjunto com o Rate Limit Manager já descrito em `INTEGRATION_HUB.md`, respeita o limite de chamada imposto por cada Provider externo, distribuindo esse limite de forma justa entre múltiplas Empresas que compartilham a mesma Channel Account subjacente, quando aplicável.

Cache reduz a carga de Query de alta frequência, como Inbox e Assigned Conversations, sempre com tempo de vida limitado o suficiente para refletir atualização recente.

Alta disponibilidade garante que a indisponibilidade momentânea de uma instância não interrompa a operação do Communication Hub como um todo.

Resiliência garante que, mesmo diante de falha real de um componente específico — por exemplo, indisponibilidade temporária do Conversation Search Manager —, a capacidade essencial de enviar e receber Message permaneça funcional, com a busca degradando graciosamente até que o componente seja restaurado.

Processamento paralelo permite que múltiplas Conversation, de Tenants diferentes ou do mesmo Tenant, sejam processadas simultaneamente sem interferência mútua, respeitando a garantia de ordenação por Conversation já descrita no Capítulo 12.

Recuperação de falhas garante que uma Delivery interrompida por falha de infraestrutura, não por falha do Provider externo, seja retomada de onde parou, sem produzir uma segunda tentativa duplicada — o estado de processamento de cada Delivery é mantido de forma persistente, aplicação do princípio Stateless Processing já descrito no Capítulo 5.

A relação entre volume de Conversation e volume de Message merece atenção arquitetural específica ao planejar capacidade de escala: diferente do CRM Hub, onde o volume de Aggregate cresce de forma relativamente previsível — um Lead, uma Opportunity —, o Communication Hub enfrenta uma relação de um-para-muitos muito mais acentuada entre Conversation e Message, e uma relação ainda mais acentuada entre Message e Delivery quando a Retry Policy é acionada repetidamente. Uma única Conversation de suporte prolongado pode acumular centenas de Message ao longo de semanas, e uma única Campaign Message de Broadcast pode gerar milhares de Delivery em questão de minutos. Por isso, a capacidade de escala deste Hub é dimensionada não apenas pelo número de Empresas ou de Tenants ativos, mas pela distribuição estatística real de Message por Conversation e de Delivery por Message observada ao longo do tempo — um dado que o Communication Analytics já descrito no Capítulo 7 acompanha continuamente para informar decisão de capacidade futura.

---

## 18. Casos de Uso

**Atendimento WhatsApp.** Uma pequena Clínica recebe, através de seu número de WhatsApp Business já conectado ao Integration Hub, a primeira mensagem de um paciente perguntando sobre disponibilidade de horário. O Webhook Manager traduz o Webhook Event recebido, o Message Manager cria a Message, e o Conversation Manager verifica que nenhuma Conversation prévia existe para aquele Participant, criando uma nova. O Conversation Assignment Manager, seguindo a regra de fila já configurada pela recepção da Clínica, atribui automaticamente a Conversation à atendente disponível no momento. Ela responde através de Send Message, o Policy Manager confirma que o horário de envio está dentro da janela permitida pela Communication Policy configurada, e o Delivery Pipeline processa o envio; o Delivery Tracking Manager confirma entrega dentro de segundos, e pouco depois um Read Receipt confirma que o paciente já leu a resposta — típico da baixa latência e da riqueza de sinal de confirmação característica desse Canal.

**Atendimento E-mail.** A mesma Clínica também atende solicitação por e-mail, para pacientes que preferem esse Canal para assuntos mais formais, como envio de documentação médica. O fluxo estrutural é idêntico ao do WhatsApp — Conversation criada ou reaproveitada, Assignment automático, Send Message processado pelo Delivery Pipeline —, mas o Delivery Tracking Manager reflete uma latência de confirmação inerentemente maior, medida em minutos em vez de segundos, e o Read Receipt Manager simplesmente não registra confirmação de leitura, porque a esmagadora maioria dos provedores de e-mail não reporta esse sinal de forma confiável — uma ausência de dado que o Communication Hub trata como esperada para esse Canal, nunca como uma falha a ser investigada.

**Push Notification.** Uma Empresa de e-commerce configura, através do Automation Engine, um Workflow que dispara uma Notification de confirmação assim que um pedido é despachado — um Evento originado no Growth Hub ou em um sistema de logística integrado através do Integration Hub. O Notification Manager cria a Notification, distinta de uma Message conversacional porque não espera resposta do destinatário, e ela segue o mesmo Delivery Pipeline técnico, mas nunca associada a uma Conversation bidirecional — o cliente recebe a confirmação, mas nenhuma "conversa" é aberta como consequência dessa notificação isolada.

**Broadcast.** Uma marca de moda planeja uma campanha de lançamento de coleção, com o Growth Hub definindo o conteúdo estratégico da Campaign Message e o Segmento-alvo de mil Clientes já identificado pelo CRM Hub através de `SegmentUpdated`. O Broadcast Manager recebe o Command Send Broadcast e decompõe o envio em mil Delivery individuais, cada uma entrando na Delivery Queue e sendo processada por um Worker respeitando o Rate Limiting já configurado para aquele Canal em `INTEGRATION_HUB.md`. Ao longo do processamento, `BroadcastStarted` já foi publicado, e o Broadcast Status consultável mostra o progresso em tempo real — quantas Delivery já confirmadas, quantas ainda pendentes, quantas falhas. Quando a última Delivery individual é processada, `BroadcastFinished` é publicado, consumido pelo Analytics Hub para consolidar a taxa de entrega e, posteriormente, de leitura daquela campanha específica.

**Fila de Atendimento.** Uma Empresa de suporte técnico com volume alto de Conversation simultânea configura, através do Configuration Manager, uma regra de distribuição balanceada entre seis atendentes. Quando múltiplas Conversation chegam ao mesmo tempo, o Conversation Assignment Manager distribui cada uma seguindo essa regra, evitando que um único atendente acumule Conversation pendente enquanto outro permanece ocioso — a mesma disciplina de escalabilidade e de baixo acoplamento entre operações concorrentes já detalhada no Capítulo 17.

**Transferência de Conversa.** Um atendente de primeiro nível, ao identificar que uma solicitação exige conhecimento técnico mais aprofundado, emite o Command Transfer Conversation, direcionando a Conversation a um especialista. O Conversation Assignment Manager registra a mudança de responsável, garantindo, conforme a Regra já fixada no Capítulo 5, que em nenhum momento os dois atendentes fiquem simultaneamente responsáveis de forma ambígua — o especialista assume, e o atendente original perde a responsabilidade ativa, ainda que sua participação anterior permaneça visível na Timeline.

**Escalonamento.** Uma Conversation envolvendo uma reclamação sensível é escalonada a um Gestor através do mesmo mecanismo técnico de Transfer Conversation — não existe um Command separado para "escalonamento", porque, do ponto de vista arquitetural, escalonar é apenas transferir responsabilidade a um Perfil de maior autoridade. O Conversation Status permanece "em atendimento" durante toda a transição, garantindo que a parte externa nunca perceba, na prática, qualquer interrupção de continuidade enquanto a responsabilidade interna muda de mãos.

**Conversa Omnichannel.** Um Cliente que abriu uma solicitação de suporte via WhatsApp, sem resposta imediata por estar fora do horário de atendimento, envia um e-mail de acompanhamento horas depois pelo mesmo assunto. O Conversation Manager, ao processar essa nova Message, reconhece — através do mesmo Participant já registrado, identificado por telefone ou por e-mail já associado ao Relationship correspondente no CRM Hub — que ela pertence à mesma Conversation já aberta, agregando-a à Timeline existente em vez de criar uma segunda Conversation desconectada. O atendente que eventualmente responde vê ambas as mensagens, de canais diferentes, na mesma sequência cronológica.

**Campanha de Notificações.** Uma Academia configura, através do Automation Engine, uma série de Notification agendada para lembrar alunos de aulas experimentais próximas do vencimento. Cada Notification individual segue o Delivery Pipeline de forma independente, com seu próprio Delivery Status rastreado por destinatário, permitindo à Academia consultar exatamente quantos alunos efetivamente receberam o lembrete antes da data em questão.

**Recuperação após Falha de Entrega.** Uma Message importante de confirmação de agendamento falha por indisponibilidade momentânea do Provider de WhatsApp, mediado pelo Integration Hub. O Retry Manager aciona automaticamente uma nova tentativa conforme a Retry Policy configurada — tipicamente com espera progressiva entre tentativas —, produzindo um novo registro de Delivery a cada tentativa, nunca sobrescrevendo o anterior, conforme a Regra já fixada no Blueprint. Quando a entrega é finalmente confirmada, `MessageDelivered` é publicado, e o histórico completo de tentativas — incluindo a falha inicial e o motivo registrado — permanece consultável através de Delivery History, permitindo à Empresa auditar, se necessário, por que a confirmação demorou mais que o esperado para aquele agendamento específico.

---

## 19. Roadmap

No curto prazo, a prioridade é o Communication Manager, o Conversation Manager, o Message Manager e o Delivery Manager operando de ponta a ponta para os Commands e Queries essenciais já descritos nos Capítulos 10 e 11, com o Event Publisher garantindo publicação consistente desde a primeira operação em produção, e a integração inicial com o Integration Hub cobrindo ao menos um Canal de comunicação direta.

No médio prazo, a prioridade é o Broadcast Manager e o Retry Manager plenamente funcionais, a cobertura completa dos Canais mais essenciais já catalogados em `INTEGRATION_HUB.md`, Capítulo 10, e a integração completa com o AI Hub para sugestão assistida de resposta.

No longo prazo, a prioridade é o refinamento contínuo do Conversation Search Manager e do Communication Analytics com base em padrão observado entre milhões de Conversation ativas, a maturidade plena de Omnichannel Routing cobrindo qualquer combinação de Canal, e a evolução do Conversation Assignment Manager para sugestão inteligente de distribuição de fila com base em carga histórica e em especialização de atendente.

Cada fase deste roadmap depende estritamente da anterior, pelo mesmo motivo estrutural já demonstrado em `CRM_HUB.md`, Capítulo 19: o Broadcast Manager e o Retry Manager do médio prazo não têm sobre o que operar de forma confiável sem que o Conversation Manager e o Delivery Manager do curto prazo já estejam maduros e produzindo dado consistente; e a distribuição inteligente de fila do longo prazo depende de volume histórico real de Conversation Assignment, acumulado ao longo do tempo, que só existe depois que as fases anteriores já estão em operação estável.

```
                    ROADMAP DO COMMUNICATION HUB
   ┌───────────────────────────────────────────────────────────┐
   │  Curto prazo                                                  │
   │    Communication Manager · Conversation Manager ·                │
   │    Message Manager · Delivery Manager · Event Publisher              │
   │    → Commands e Queries essenciais, primeiro Canal integrado           │
   │                                                                │
   │  Médio prazo                                                     │
   │    Broadcast Manager · Retry Manager · cobertura de Canais ·         │
   │    integração com AI Hub                                                │
   │    → alcance e assistência inteligente plenamente funcionais              │
   │                                                                │
   │  Longo prazo                                                       │
   │    Conversation Search Manager e Communication Analytics                    │
   │    refinados · Omnichannel Routing completo · distribuição                    │
   │    inteligente de fila                                                          │
   │    → operação madura em escala de milhões de Conversation                          │
   └───────────────────────────────────────────────────────────┘
```

---

## 20. Architecture Decision Records

**ADR-001 — Communication é proprietário das conversas.** O Communication Hub é o único componente técnico autorizado a criar, alterar ou encerrar uma Conversation. Contexto: aplicação direta do princípio Domain Ownership já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, ADR-001, e reafirmado no Blueprint deste domínio, ADR-004 e ADR-005.

**ADR-002 — Mensagens são imutáveis.** Nenhum componente interno altera o conteúdo de uma Message já criada. Contexto: aplicação arquitetural direta da Regra já fixada no Blueprint, Capítulo 12.

**ADR-003 — Delivery nunca altera Message.** Delivery é um Aggregate distinto, referenciando a Message, nunca fundido com ela. Contexto: preservar a capacidade de rastrear múltiplas tentativas de entrega sobre a mesma Message sem comprometer sua imutabilidade.

**ADR-004 — Communication nunca conhece Providers.** Toda comunicação com WhatsApp, e-mail ou qualquer Canal externo passa exclusivamente pelo Integration Hub. Contexto: aplicação direta do princípio Single Integration Layer já estabelecido em `INTEGRATION_HUB.md`, ADR-001, e do princípio Provider Abstraction já descrito no Capítulo 5 deste documento.

**ADR-005 — Integration Hub é proprietário das integrações.** Nenhum Connector de Canal é implementado dentro do Communication Hub. Contexto: mesma regra já estabelecida em `INTEGRATION_HUB.md`, Capítulo 3, e já reafirmada em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, ADR-005.

**ADR-006 — Retry preserva histórico.** Cada nova tentativa de entrega produz um novo registro de Delivery, nunca sobrescrevendo o anterior. Contexto: aplicação do princípio Retry Never Rewrites History; sem essa garantia, a Empresa perderia visibilidade de quantas tentativas uma entrega específica exigiu.

**ADR-007 — Conversation é independente do canal.** A mesma Conversation agrega Message de múltiplos Canais ao longo do tempo, sem exigir recriação a cada mudança de Canal. Contexto: aplicação do princípio Channel Independence; sustenta a Capacidade Omnichannel Routing já catalogada no Blueprint.

**ADR-008 — Broadcast utiliza filas, nunca envio síncrono em massa.** Todo envio de Broadcast é decomposto em Delivery individuais processadas através da Delivery Queue. Contexto: aplicação do princípio Asynchronous by Default; um envio síncrono em massa comprometeria a disponibilidade do Communication Hub para qualquer outra operação simultânea.

**ADR-009 — Receipts são imutáveis.** Um Read Receipt ou uma Reaction, uma vez registrado, nunca é alterado ou removido. Contexto: aplicação da Regra já fixada no Blueprint, Capítulo 12, preservando integridade de confirmação de leitura para fins de auditoria.

**ADR-010 — Communication publica evento para toda mudança de estado relevante.** Nenhuma Conversation, Message ou Delivery muda de estado sem produzir o Evento correspondente já catalogado no Blueprint. Contexto: aplicação do princípio Event Publication já descrito no Capítulo 5.

**ADR-011 — Ordenação de Evento é garantida por Conversation, não globalmente.** Eventos de uma mesma Conversation são processados em sequência estrita; Eventos de Conversation diferentes podem ser processados em paralelo. Contexto: equilibrar coerência de Timeline com escalabilidade horizontal — uma ordenação global estrita eliminaria a possibilidade de processamento paralelo entre Conversation distintas.

**ADR-012 — Toda Conversation possui exatamente um Conversation Assignment válido em um dado momento.** Nenhuma Conversation permanece com dois responsáveis simultâneos e ambíguos. Contexto: aplicação do princípio Explicit Conversation Ownership; eliminar ambiguidade de responsabilidade sobre atendimento pendente.

**ADR-013 — Nenhum Attachment existe sem uma Message associada.** Todo Attachment é ancorado a uma Message, mesmo quando o Canal permite envio de mídia isolada. Contexto: aplicação da Regra já fixada em `COMMUNICATION_DOMAIN_BLUEPRINT.md`; preservar consistência do Domain Model central em torno de Conversation e Message.

**ADR-014 — Read Receipt nunca é inferido ou simulado quando o Canal de origem não o reporta nativamente.** O Read Receipt Manager registra confirmação de leitura apenas quando o sinal chega efetivamente do Provider externo através do Integration Hub. Contexto: aplicação direta da Regra já fixada em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 12; preservar honestidade de dado, evitando que a Empresa tome decisão de acompanhamento com base em uma confirmação de leitura que, na realidade, nunca existiu.

**ADR-015 — Ordenação estrita de Evento é garantida por Conversation, nunca imposta globalmente entre Conversation distintas.** Contexto: aplicação do princípio já descrito no Capítulo 12; uma ordenação global estrita eliminaria a capacidade de processamento paralelo entre Conversation diferentes, comprometendo a escalabilidade horizontal já exigida no Capítulo 17 sem nenhum benefício correspondente de coerência, já que Conversation distintas não compartilham nenhuma dependência de ordem entre si.

---

## 21. Glossário

**Communication Hub** — implementação técnica do domínio de comunicação já definido em `COMMUNICATION_DOMAIN_BLUEPRINT.md`.

**Delivery Pipeline** — sequência técnica de processamento que leva uma Message despachada até sua confirmação ou falha de entrega.

**Conversation Timeline** — histórico cronológico completo de Message e Delivery Status de uma Conversation, consultável através de Query dedicada.

**Delivery Queue** — fila técnica de Message ou Notification aguardando processamento de envio.

**Retry Policy** — política de nova tentativa aplicável a uma Delivery que falhou por motivo transitório, sempre preservando registro de cada tentativa.

**Omnichannel Routing** — capacidade de agrupar comunicação de canais diferentes sob a mesma Conversation.

**Conversation Assignment Manager** — componente que administra atribuição e transferência de responsável por uma Conversation.

**Broadcast Manager** — componente que decompõe um envio em massa em Delivery individuais rastreáveis.

**Provider Abstraction** — princípio segundo o qual nenhum componente interno conhece o formato técnico específico de um Provider externo.

**Idempotent Delivery** — propriedade de que o processamento repetido de uma tentativa de entrega nunca produz efeito duplicado.

**Read Receipt** — confirmação de leitura de uma Message, registrada apenas quando o Canal de origem a reporta nativamente.

**Dead Letter Queue** — destino de todo Evento ou Delivery que falhou de forma definitiva, preservado para investigação manual.

---

## 22. Conclusão

O Communication Hub é o proprietário oficial, técnico e operacional, de toda comunicação entre a organização e qualquer entidade externa, exatamente como já definido em `COMMUNICATION_DOMAIN_BLUEPRINT.md`. Este documento descreveu como esse domínio é servido: pelo conjunto de componentes internos do Capítulo 7, pelos Commands e Queries dos Capítulos 10 e 11, pelos Eventos publicados através do Event Publisher, e pelas garantias de segurança, observabilidade e escala descritas nos capítulos seguintes.

A responsabilidade do Communication Hub existe dentro de uma cadeia de colaboração precisa entre domínios, que este documento reforça explicitamente em sua conclusão: o CRM Hub continua proprietário do relacionamento — quem é o Cliente, qual seu histórico —, conforme já estabelecido em `CRM_DOMAIN_BLUEPRINT.md`. O Automation Engine decide quando comunicar — qual Evento dispara qual Workflow —, conforme já estabelecido em `AUTOMATION_ENGINE.md`. O AI Hub decide o conteúdo — o texto de uma sugestão de resposta —, conforme já estabelecido em `AI_HUB.md`. O Integration Hub executa a comunicação junto aos Providers — o envio técnico real através de WhatsApp, e-mail, ou qualquer outro Canal —, conforme já estabelecido em `INTEGRATION_HUB.md`. E o Communication Hub, especificamente, orquestra todo o ciclo de vida das Conversas e das Mensagens entre esses quatro pontos — nunca decidindo relacionamento, nunca decidindo automação, nunca decidindo conteúdo, e nunca falando diretamente com um Provider, mas garantindo que, uma vez que essas quatro decisões existam, a comunicação resultante seja registrada, entregue, rastreada e preservada com o mesmo rigor aplicado a qualquer outro domínio desta plataforma.

Este documento, junto com `COMMUNICATION_DOMAIN_BLUEPRINT.md`, consolida o segundo par completo de Blueprint e Hub desta série, depois de CRM — confirmando que o padrão já demonstrado por `CRM_DOMAIN_BLUEPRINT.md` e `CRM_HUB.md` não foi específico ao domínio de relacionamento, mas é, de fato, o modelo oficial e repetível para todo futuro Business Hub da Adaptive Business Platform: um Blueprint que define o domínio, e um documento de arquitetura que define como esse domínio é servido, ambos respeitando integralmente `BUSINESS_HUB_ARCHITECTURE.md` e colaborando com os demais Hubs exclusivamente através de Evento.

Um futuro Finance Hub, Growth Hub ou Analytics Hub, ao seguir esse mesmo padrão, encontrará neste par de documentos — e no par equivalente já produzido para CRM — o exemplo concreto de como tratar a fronteira mais delicada de qualquer novo domínio: a tentação de absorver responsabilidade de um Hub vizinho por conveniência de implementação de curto prazo. O Communication Hub resistiu a essa tentação em pelo menos quatro pontos críticos, cada um já documentado explicitamente neste texto — nunca decidir relacionamento, nunca decidir automação, nunca decidir conteúdo, nunca falar diretamente com um Provider — e é precisamente essa disciplina de fronteira, mais do que qualquer detalhe técnico de componente interno, que um novo Business Hub deve replicar com o mesmo rigor.
