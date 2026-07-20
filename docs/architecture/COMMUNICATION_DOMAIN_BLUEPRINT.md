# Communication Domain Blueprint

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento define o domínio do Communication Hub dentro da Adaptive Business Platform, aplicando integralmente os princípios já estabelecidos em `BUSINESS_HUB_ARCHITECTURE.md` — Bounded Context, Domain Ownership, comunicação exclusiva por Evento — ao domínio específico de comunicação. Ele não é uma implementação nem uma especificação técnica: é o contrato arquitetural que um futuro `COMMUNICATION_HUB.md`, e qualquer código construído a partir dele, deve obedecer integralmente, seguindo o mesmo padrão de par Blueprint/Hub já estabelecido por `CRM_DOMAIN_BLUEPRINT.md` e `CRM_HUB.md`.

O Communication Hub é responsável pela comunicação entre a organização e toda entidade externa com a qual ela troca mensagem, em qualquer canal — WhatsApp, e-mail, notificação, mensagem de redes sociais — independentemente de qual Business Hub originou a necessidade daquela comunicação. Esta é uma distinção que precisa ser estabelecida com precisão desde a primeira linha deste documento, porque o domínio de Communication é frequentemente confundido com o domínio de CRM, já definido em `CRM_DOMAIN_BLUEPRINT.md`: o CRM continua sendo o proprietário exclusivo do relacionamento — quem é o Lead, quem é o Customer, qual o Estágio de uma Opportunity —, enquanto o Communication Hub é o proprietário exclusivo da comunicação em si — a Conversation, a Message, o Canal por onde ela trafega, sua Entrega. Um Relationship é sobre quem a Empresa conhece e como esse vínculo evolui; uma Conversation é sobre o que foi dito, por qual canal, e se chegou ao destinatário. Os dois domínios colaboram intensamente, mas nunca se confundem: o CRM Hub já publica e consome eventos relacionados a mensagem, conforme já antecipado em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 10 e Capítulo 11, e este documento formaliza o lado complementar dessa mesma colaboração.

---

## 2. Missão

A missão do Communication Hub é gerenciar toda comunicação omnichannel da plataforma de forma consistente, rastreável e desacoplada — garantindo que uma mensagem enviada ou recebida em qualquer canal seja registrada de forma uniforme, que sua entrega seja acompanhada até confirmação ou falha, e que nenhum outro domínio da plataforma precise implementar sua própria lógica de envio, recebimento ou histórico de comunicação.

---

## 3. Problema que Resolve

Mensagens espalhadas surgem quando o conteúdo de comunicação com um Cliente vive disperso entre a caixa de entrada pessoal de um atendente, um aplicativo de mensageria não integrado, e uma planilha de acompanhamento manual, sem nenhum repositório central reconhecido como oficial.

Múltiplos canais sem coordenação acontecem quando WhatsApp, e-mail e notificação são tratados como sistemas completamente isolados entre si, de modo que uma conversa iniciada em um canal não tem continuidade reconhecível quando o mesmo Cliente entra em contato por outro.

Perda de histórico é o mesmo risco já diagnosticado para relacionamento em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 3, aqui aplicado especificamente ao conteúdo da comunicação — sem repositório central, o teor exato do que já foi dito a um Cliente se perde quando o atendente que o registrou não está mais disponível.

Duplicação de envios acontece quando, na ausência de um mecanismo central de coordenação, a mesma mensagem é enviada mais de uma vez ao mesmo destinatário, por engano ou por reprocessamento não controlado de uma fila.

Falta de rastreabilidade surge quando não existe confirmação central de que uma mensagem foi de fato entregue, lida, ou falhou — a Empresa não tem como saber se uma comunicação importante efetivamente chegou ao destinatário.

Ausência de omnichannel é o problema estrutural mais amplo: sem um domínio central de comunicação, cada canal opera como um silo, impedindo que um atendente veja, em um único lugar, toda a conversa com um Cliente independentemente de por qual canal cada mensagem específica trafegou.

Inconsistência entre canais acontece quando o tom, o Template e a identidade de marca aplicados a uma comunicação variam de forma não coordenada entre WhatsApp, e-mail e notificação, produzindo uma experiência fragmentada exatamente do tipo que `BRANDING_HUB.md`, Capítulo 3, já identificou como falha central de personalização superficial.

O Communication Hub resolve essas sete categorias de risco centralizando toda comunicação — de qualquer canal, de entrada ou de saída — em um único Domain Model, com Conversation como unidade central de agrupamento omnichannel, consumido de forma uniforme por toda a plataforma.

---

## 4. Boundaries (Bounded Context)

### Pertence ao Communication Hub

| Conceito | Por que pertence |
|---|---|
| Conversation | Unidade central que agrupa toda troca de mensagem com uma parte externa, independentemente de canal — o Aggregate raiz do domínio. |
| Message | Unidade individual de comunicação, sempre associada a uma Conversation. |
| Channel | O meio através do qual uma mensagem trafega — WhatsApp, e-mail, notificação. |
| Channel Account | A conta específica de um Canal usada pela Empresa — por exemplo, um número de WhatsApp Business específico. |
| Thread | Agrupamento de Message dentro de uma Conversation quando um mesmo Canal suporta múltiplos fios de discussão simultâneos. |
| Delivery | O registro de tentativa de entrega de uma Message, com seu próprio estado, distinto da Message em si. |
| Delivery Status | O estado atual de uma Delivery — pendente, entregue, lida, falha. |
| Message Template | Modelo reutilizável de mensagem, com identidade de marca já aplicada. |
| Campaign Message | Mensagem associada a uma iniciativa de Growth, cujo conteúdo estratégico pertence ao Growth Hub, mas cujo envio e rastreamento pertencem ao Communication Hub. |
| Notification | Comunicação unidirecional, tipicamente interna à plataforma ou de sistema para Usuário, distinta de Message, que é bidirecional e conversacional. |
| Broadcast | Envio de uma mesma Message a múltiplos destinatários simultaneamente. |
| Inbox | A visão consolidada de Conversation de entrada aguardando atenção. |
| Outbox | A fila de Message pendente de envio. |
| Attachment | Arquivo anexado a uma Message. |
| Webhook Event | O registro técnico de notificação recebida de um Canal externo, antes de sua tradução em Message ou em atualização de Delivery Status. |
| Typing Indicator | Sinal transitório de que uma das partes está compondo uma mensagem, relevante para experiência de conversa em tempo real. |
| Read Receipt | Confirmação de que uma Message foi lida pelo destinatário. |
| Reaction | Resposta rápida e não textual a uma Message específica, quando o Canal suporta esse recurso. |
| Conversation Assignment | O registro de qual atendente é responsável por uma Conversation em um dado momento. |
| Conversation Status | O estado operacional de uma Conversation — aberta, em atendimento, fechada. |
| Communication Preference (operacional) | A aplicação operacional, dentro de uma Conversation específica, da preferência de canal e de frequência já mantida como dado de relacionamento pelo CRM Hub. |
| Communication Policy | Regra que rege como e quando a Empresa pode se comunicar através de um Canal específico. |
| Delivery Queue | A fila técnica de Message aguardando processamento de envio. |
| Retry Policy | A política de nova tentativa aplicável a uma Delivery que falhou por motivo transitório. |

### NÃO pertence ao Communication Hub

| Conceito | Proprietário correto |
|---|---|
| Customer | CRM Hub — relacionamento, já detalhado em `CRM_DOMAIN_BLUEPRINT.md`. |
| Lead | CRM Hub — relacionamento em estágio inicial. |
| Relationship | CRM Hub — o vínculo estrutural entre Empresa e parte externa. |
| Opportunity | CRM Hub — possibilidade de negócio em progressão. |
| Invoices | Finance Hub — ciclo de vida financeiro. |
| Payments | Finance Hub — conciliação de pagamento. |
| Campaign Strategy | Growth Hub — estratégia e conteúdo de campanha; o Communication Hub executa o envio de uma Campaign Message já definida pelo Growth Hub, mas não decide sua estratégia. |
| Authentication | Identity Hub — autenticação e Permissão, já detalhado em `IDENTITY_HUB.md`. |
| Knowledge | Knowledge Hub — conhecimento não estruturado, já detalhado em `KNOWLEDGE_HUB.md`. |
| Automation | Automation Engine — orquestração de Workflow, já detalhado em `AUTOMATION_ENGINE.md`. |
| Provider APIs | Integration Hub — única via de comunicação externa, já detalhado em `INTEGRATION_HUB.md`; o Communication Hub nunca implementa sua própria integração direta com WhatsApp, e-mail ou qualquer Canal externo. |
| Analytics | Analytics Hub — indicador agregado, nunca calculado pelo Communication Hub. |
| Branding | Branding Hub — identidade visual e tom, já detalhado em `BRANDING_HUB.md`; o Communication Hub consome, nunca gera, essa identidade. |
| Identity | Identity Hub — modelo RBAC e ABAC, já detalhado em `IDENTITY_HUB.md`. |

---

## 5. Responsabilidades

O Communication Hub é responsável por registrar toda Conversation, independentemente de qual Canal a originou, e por agrupar dentro dela toda Message trocada ao longo do tempo. É responsável por administrar o Canal e a Channel Account através dos quais a Empresa se comunica, cada um mediado exclusivamente pelo Integration Hub. É responsável por rastrear a Delivery de toda Message enviada, do estado pendente até a confirmação de entrega, leitura, ou falha. É responsável por administrar Message Template com identidade de marca já aplicada, e por processar Broadcast de forma controlada e sem duplicação. É responsável por manter Inbox e Outbox como visões operacionais de comunicação pendente, por administrar Attachment associado a uma Message, e por manter Conversation Assignment e Conversation Status para organização de atendimento. É responsável por aplicar Communication Policy e Retry Policy de forma consistente a toda tentativa de envio.

É também responsável por garantir a continuidade omnichannel de uma Conversation — reconhecer que uma nova Message chegando por um Canal diferente do usado anteriormente ainda pertence ao mesmo relacionamento em andamento, quando a identificação da parte externa já é conhecida, evitando que a mesma pessoa seja tratada como um contato novo e desconectado a cada vez que muda de Canal. E é responsável por preservar, de forma imutável, o registro de tudo o que já foi dito, garantindo que a Empresa nunca perca acesso ao teor exato de uma comunicação passada, mesmo quando o Canal original que a transportou deixa de existir ou é descontinuado pelo Provider externo.

O Communication Hub não é responsável por decidir quem é o Customer por trás de uma Conversation, por calcular indicador agregado de comunicação, por autenticar o Usuário que opera o atendimento, ou por qualquer das demais responsabilidades já atribuídas a outro Hub na tabela do Capítulo 4 — sua responsabilidade termina em registrar, rastrear e entregar a comunicação, publicando Evento sobre ela, nunca em decidir a estratégia de relacionamento ou de campanha que a motivou.

Essa distinção entre "comunicar" e "decidir o que comunicar e por quê" é a linha mais importante que este Blueprint traça, no mesmo espírito da linha equivalente já traçada em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 5, entre "manter o relacionamento" e "agir sobre o relacionamento". É tentador, por exemplo, imaginar que o Communication Hub deveria decidir, sozinho, qual Cliente deve receber uma campanha de reengajamento — mas essa decisão pertence ao Growth Hub, que define a estratégia e o Segmento-alvo, e ao Automation Engine, que dispara o envio em reação a um Evento; o Communication Hub apenas executa o envio já decidido, rastreia sua entrega, e publica o resultado como Evento. Um Communication Hub que absorvesse decisão de estratégia deixaria de ser um domínio de comunicação e passaria a duplicar responsabilidade que já pertence, de forma inequívoca, a outro Business Hub.

---

## 6. Capacidades

Conversation Management cobre criação, agrupamento e encerramento de Conversation. Message Management cobre o registro individual de cada Message trocada. Channel Management cobre a administração de Canal e Channel Account. Inbox Management cobre a organização de Conversation de entrada aguardando atenção. Delivery Tracking cobre o acompanhamento de estado de entrega de toda Message enviada. Omnichannel Routing cobre a capacidade de direcionar e agrupar comunicação de canais diferentes sob a mesma Conversation. Notification Management cobre comunicação unidirecional distinta de Message conversacional. Broadcast cobre envio controlado a múltiplos destinatários. Message Templates cobre modelo reutilizável de mensagem. Attachments cobre arquivo anexado a uma Message. Conversation Assignment cobre atribuição de responsável por atendimento. Communication Policies cobre regra de quando e como a Empresa pode se comunicar por um Canal. Queue Management cobre a fila técnica de Message pendente de envio. Retry Management cobre nova tentativa de entrega diante de falha transitória. Delivery History cobre o registro consultável de toda tentativa de entrega já ocorrida.

```
                CAPACIDADES DE NEGÓCIO DO COMMUNICATION HUB
   ┌───────────────────────────────────────────────────────────┐
   │  Núcleo:          Conversation Management · Message Mgmt       │
   │  Canal:           Channel Management · Omnichannel Routing       │
   │  Operação:        Inbox Management · Conversation Assignment        │
   │  Entrega:         Delivery Tracking · Queue Management ·              │
   │                   Retry Management · Delivery History                    │
   │  Conteúdo:        Message Templates · Attachments                          │
   │  Alcance:         Broadcast · Notification Management                        │
   │  Governança:      Communication Policies                                        │
   └───────────────────────────────────────────────────────────┘
```

---

## 7. Modelo Conceitual

Conversation representa o agrupamento central de toda troca de comunicação com uma parte externa, independentemente de quantos Canais diferentes participaram ao longo do tempo — o Aggregate raiz deste domínio.

Message representa uma unidade individual de comunicação, sempre associada a exatamente uma Conversation, carregando seu próprio conteúdo, remetente, e referência de Canal de origem.

Thread representa um agrupamento de Message dentro de uma Conversation, relevante quando um Canal específico suporta múltiplos fios de discussão simultâneos sobre o mesmo relacionamento — por exemplo, duas solicitações de suporte abertas ao mesmo tempo pelo mesmo Cliente.

Channel representa o meio de comunicação em si — WhatsApp, e-mail, notificação — como conceito abstrato, distinto da conta concreta usada para operá-lo.

Channel Account representa a instância concreta de um Channel operada pela Empresa, mediada por uma Connection do Integration Hub já descrita em `INTEGRATION_HUB.md`, Capítulo 8.

Attachment representa um arquivo anexado a uma Message, com seu próprio metadado de tipo e tamanho.

Delivery representa o registro de tentativa de entrega de uma Message específica, mantido separado da Message em si porque uma mesma Message pode ter múltiplas tentativas de Delivery ao longo do tempo, cada uma com seu próprio Delivery Status.

Template representa um modelo reutilizável de Message, resolvido em conjunto com o Branding Hub para aplicação de identidade e tom.

Notification representa comunicação unidirecional, tipicamente originada da própria plataforma para um Usuário ou para uma parte externa, sem expectativa de resposta conversacional, distinta de Message.

Broadcast representa o envio coordenado de uma mesma Message a múltiplos destinatários, cada envio individual ainda produzindo sua própria Delivery rastreável.

Inbox representa a visão operacional de Conversation de entrada que aguarda atenção humana, organizada por Conversation Status e por Conversation Assignment.

Outbox representa a fila de Message ainda não confirmada como entregue, base operacional do Delivery Queue.

Queue representa a estrutura técnica de processamento assíncrono de envio, administrada em conjunto com o Retry Policy.

Webhook Event representa o registro bruto de notificação recebida de um Canal externo, antes de sua tradução em Message ou em atualização de Delivery Status — a fronteira exata onde o Integration Hub entrega ao Communication Hub, conforme já descrito em `INTEGRATION_HUB.md`, Capítulo 16.

Read Receipt representa a confirmação, quando o Canal suporta esse recurso, de que uma Message foi efetivamente lida pelo destinatário.

Reaction representa uma resposta rápida e não textual a uma Message específica.

Conversation Assignment representa a atribuição de um responsável humano por uma Conversation em um dado momento, podendo ser transferida ao longo do tempo.

Communication Policy representa a regra que rege como e quando um Canal pode ser usado — por exemplo, restrição de horário de envio, ou exigência de opt-in prévio.

Communication Preference, na acepção operacional deste Hub, representa a aplicação, dentro de uma Conversation específica, da preferência de canal já mantida como dado de relacionamento pelo CRM Hub, consumida através de Evento, nunca duplicada como Entidade própria.

Conversation Status representa o estado operacional de uma Conversation — aberta, em atendimento, fechada — distinto do conteúdo em si.

Participant representa qualquer parte envolvida em uma Conversation — o Usuário da Empresa e a parte externa —, cada um referenciado por identificador, sem que o Communication Hub duplique o Domain Model completo de nenhuma dessas partes, que pertence a outro Hub quando aplicável.

---

## 8. Relacionamentos

```
                              Conversation
                     (agrupamento central, independente de canal)
                                 │
              ┌──────────┬───────┴───────┬──────────┐
              ▼          ▼               ▼          ▼
          Message    Participant   Conversation   Conversation
              │                     Assignment       Status
              │
        ┌─────┼─────┐
        ▼     ▼      ▼
    Channel Attachment Thread
     (via
     Channel
     Account)
        │
        ▼
     Delivery
        │
        ▼
  Delivery Status
   (Read Receipt, Reaction quando aplicável)
```

```
                              Message
                                 │
                    ┌────────────┼────────────┐
                    ▼                         ▼
                Outbox                    Delivery
           (aguardando envio)                 │
                    │                          ▼
                    ▼                   Delivery Status
              Delivery Queue            (Retry Policy aplicada
                    │                    em caso de falha)
                    ▼
              Provider (via Integration Hub —
              INTEGRATION_HUB.md, nunca acessado
              diretamente pelo Communication Hub)
```

```
                          Webhook Event
              (recebido do Integration Hub)
                                 │
                                 ▼
                    Tradução (Anti-Corruption Layer)
                                 │
              ┌──────────────────┴──────────────────┐
              ▼                                      ▼
       Nova Message                          Atualização de
       (Conversation existente               Delivery Status
        ou nova Conversation)                 (Message já enviada)
```

---

## 9. Fluxos

```
Mensagem recebida
   │  Webhook Event chega via Integration Hub
   ▼
Conversation
   │  nova Conversation criada, ou Message associada a
   │  Conversation já existente com a mesma parte externa
   ▼
Assignment
   │  Conversation Assignment atribui um responsável,
   │  automaticamente ou por regra de fila configurada
   ▼
Resposta
   │  atendente ou AI Hub compõe uma nova Message
   ▼
Delivery
   Message entra na Delivery Queue, processada e
   rastreada até confirmação
```

```
Broadcast
   │  uma Message é definida para múltiplos destinatários
   ▼
Queue
   │  cada envio individual entra na Delivery Queue,
   │  respeitando limite de taxa do Canal
   ▼
Delivery
   │  cada Delivery é processada e rastreada individualmente
   ▼
Receipts
   Read Receipt e Delivery Status agregados por Broadcast,
   sem perder a rastreabilidade individual de cada envio
```

```
Notificação
   │  originada internamente pela plataforma (por exemplo,
   │  o Automation Engine acionando o Notification Publisher
   │  já descrito em CRM_HUB.md, Capítulo 7)
   ▼
Canal
   │  o Channel apropriado é resolvido — push, e-mail,
   │  notificação interna da plataforma
   ▼
Entrega
   A Notification é processada pela mesma Delivery Queue
   usada por Message, com seu próprio Delivery Status
```

---

## 10. Eventos do Domínio

`ConversationStarted` é publicado quando uma nova Conversation é criada, seja por Message recebida de canal externo, seja por iniciativa de um atendente.

`ConversationAssigned` é publicado quando um responsável é atribuído a uma Conversation, automaticamente ou por ação manual.

`MessageReceived` é publicado quando uma nova Message chega de canal externo, já introduzido em `SYSTEM_BLUEPRINT.md`, Capítulo 7, e consumido pelo CRM Hub conforme já antecipado em `CRM_DOMAIN_BLUEPRINT.md`.

`MessageSent` é publicado no momento em que uma Message é despachada para a Delivery Queue, antes de qualquer confirmação de entrega.

`MessageDelivered` é publicado quando o Canal confirma que uma Message foi entregue ao destinatário.

`MessageFailed` é publicado quando uma tentativa de entrega falha de forma definitiva, após esgotar a Retry Policy aplicável.

`MessageRead` é publicado quando um Read Receipt confirma que a Message foi lida, quando o Canal suporta esse recurso.

`NotificationSent` é publicado quando uma Notification, distinta de Message conversacional, é despachada.

`BroadcastStarted` é publicado quando um Broadcast é iniciado, antes de qualquer Delivery individual ser processada.

`BroadcastFinished` é publicado quando todo envio individual de um Broadcast já foi processado, com sucesso ou falha.

`AttachmentUploaded` é publicado quando um Attachment é associado a uma Message.

`ConversationClosed` é publicado quando uma Conversation transiciona para Status encerrado.

`TemplateUpdated` é publicado quando um Message Template é criado ou alterado, relevante para o Automation Engine que dele depende para composição automática de mensagem.

`DeliveryRetried` é publicado a cada nova tentativa de entrega disparada pela Retry Policy, preservando rastreabilidade de quantas tentativas uma Delivery específica exigiu.

`WebhookReceived` é publicado no momento em que um Webhook Event bruto chega do Integration Hub, antes de sua tradução em Message ou em atualização de Delivery Status — um Evento de baixo nível, consumido internamente pelo próprio Communication Hub para orquestrar essa tradução, e ocasionalmente relevante para observabilidade de integração.

---

## 11. Integração com outros Hubs

O CRM Hub publica `LeadCreated`, `RelationshipChanged` e `ConsentUpdated`, consumidos pelo Communication Hub para determinar destinatário elegível e Communication Preference operacional; e consome `MessageReceived` e `ConversationClosed`, publicados pelo Communication Hub, para registrar Activity na Timeline correspondente, conforme já antecipado em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 11.

O Automation Engine consome eventos do Communication Hub — `MessageReceived`, `ConversationAssigned` — para disparar Workflow, e invoca o Communication Hub através de uma Action de tipo "Enviar mensagem" já descrita em `AUTOMATION_ENGINE.md`, Capítulo 11, quando um Workflow decide que uma comunicação deve ser enviada.

O AI Hub é consumido pelo Communication Hub para compor sugestão de resposta a uma Message recebida, através do contrato já detalhado em `AI_HUB.md` — o Communication Hub nunca implementa lógica de geração de linguagem própria.

O Knowledge Hub é consultado, através do AI Hub, quando uma resposta se beneficia de FAQ ou Procedimento já documentado, seguindo o padrão de Retrieval já detalhado em `KNOWLEDGE_HUB.md`.

O Identity Hub autentica e autoriza toda operação de Conversation Assignment e de envio, através do modelo já detalhado em `IDENTITY_HUB.md`.

O Integration Hub é a única via pela qual toda Message alcança ou chega de um Canal externo, através do modelo já detalhado em `INTEGRATION_HUB.md` — o Communication Hub nunca implementa Connector próprio para WhatsApp, e-mail ou qualquer outro Canal.

O Finance Hub não é consumidor frequente do Communication Hub, mas pode invocar o envio de uma Notification de cobrança através do mesmo mecanismo geral de Action já descrito em `AUTOMATION_ENGINE.md`.

O Growth Hub define o conteúdo estratégico de uma Campaign Message, mas delega inteiramente ao Communication Hub o envio, o rastreamento de Delivery e a captura de Read Receipt — o Growth Hub nunca implementa sua própria fila de envio.

O Analytics Hub consome todo Evento publicado pelo Communication Hub para calcular indicador consolidado de comunicação — taxa de entrega, taxa de resposta —, nunca calculado pelo próprio Communication Hub além do que é inerente à sua operação transacional direta.

---

## 12. Regras de Negócio

Toda Message pertence a uma Conversation — nenhuma Message existe de forma isolada, mesmo quando é a primeira mensagem de um novo relacionamento, caso em que uma nova Conversation é criada simultaneamente.

Conversation pode possuir vários canais — uma mesma Conversation agrega Message de WhatsApp e de e-mail, por exemplo, quando a mesma parte externa alterna entre canais ao longo do tempo, preservando continuidade omnichannel.

Delivery nunca altera Message — o conteúdo de uma Message, uma vez criada, é imutável; apenas o Delivery Status associado evolui ao longo do tempo.

Template é versionado — toda mudança relevante em um Message Template produz uma nova versão preservável, mesmo princípio de versionamento já estabelecido em toda a plataforma.

Retry nunca altera histórico — cada nova tentativa de entrega, disparada pela Retry Policy, produz um novo registro de Delivery, preservando o registro de tentativas anteriores, nunca sobrescrevendo-o.

Receipts são imutáveis — um Read Receipt ou uma Reaction, uma vez registrado, nunca é alterado ou removido, mesmo padrão de imutabilidade já aplicado à Timeline no domínio de CRM.

Webhook nunca altera mensagens diretamente — todo Webhook Event passa por tradução explícita antes de produzir qualquer efeito sobre uma Message ou Delivery Status, nunca aplicando mudança de estado de forma direta e não mediada.

Toda Conversation possui exatamente um Conversation Status em um dado momento — nunca dois estados simultâneos e ambíguos.

Um Broadcast é sempre decomposto em Delivery individuais rastreáveis — nenhum Broadcast é tratado como uma única operação atômica que impossibilite saber, depois, quais destinatários específicos efetivamente receberam a mensagem.

Nenhuma Message é enviada sem que a Communication Policy aplicável ao Canal e ao destinatário tenha sido verificada — por exemplo, respeitando janela de horário permitida ou exigência de opt-in já registrada como Consent pelo CRM Hub.

Uma Attachment nunca existe sem uma Message associada — mesmo quando um arquivo é enviado isoladamente através de um Canal que tecnicamente permite envio de mídia sem texto, o Communication Hub sempre cria uma Message correspondente, ainda que com conteúdo textual vazio, para que o Attachment tenha um ponto de ancoragem consistente dentro da Conversation.

Um Read Receipt só é registrado quando o Canal de origem efetivamente suporta e reporta esse sinal — o Communication Hub nunca infere ou simula uma confirmação de leitura para um Canal que não a fornece nativamente, preservando a distinção honesta entre "confirmadamente lido" e "entregue, mas sem confirmação de leitura disponível".

---

## 13. Casos de Uso

**Atendimento WhatsApp.** Um Cliente envia mensagem via WhatsApp Business. O Webhook Event chega através do Integration Hub, é traduzido em uma nova Message associada a uma Conversation existente ou recém-criada, e `MessageReceived` é publicado, consumido pelo CRM Hub para atualizar Timeline.

**E-mail.** Uma Message é composta e enviada por e-mail, entrando na Delivery Queue; o Delivery Status evolui de pendente para entregue conforme confirmação do Provider, mediado pelo Integration Hub, e `MessageDelivered` é publicado.

**Push Notification.** Uma Notification é disparada pelo Automation Engine em reação a um Evento de outro Hub, processada pela mesma Delivery Queue, com seu próprio Delivery Status rastreado independentemente de Message conversacional.

**Broadcast.** Uma Campaign Message definida pelo Growth Hub é enviada a um Segmento de destinatários já identificado pelo CRM Hub; cada envio individual produz sua própria Delivery, e `BroadcastFinished` é publicado quando todos já foram processados.

**Suporte.** Uma Conversation de suporte é aberta, atribuída automaticamente a um atendente disponível através de Conversation Assignment, e permanece com Conversation Status "em atendimento" até resolução.

**Conversa Omnichannel.** Um Cliente que iniciou contato via WhatsApp continua a mesma conversa por e-mail dias depois; a Conversation já existente agrega a nova Message, preservando continuidade de contexto para o atendente.

**Fila de atendimento.** Múltiplas Conversation chegam simultaneamente à Inbox; Conversation Assignment distribui cada uma a um atendente disponível conforme regra de fila configurada, sem sobrecarregar um único responsável.

**Mudança de atendente.** Uma Conversation já em atendimento é transferida para outro responsável; Conversation Assignment registra a mudança, preservando o histórico completo de Message já trocada para o novo atendente.

**Anexos.** Um Cliente envia um comprovante de pagamento como Attachment associado a uma Message; `AttachmentUploaded` é publicado, e o Attachment permanece consultável junto à Conversation.

**Histórico completo.** Um Usuário consulta uma Conversation específica, vendo toda Message trocada, independentemente de canal, junto com Delivery Status e Read Receipt de cada uma — a visão omnichannel que resolve diretamente o problema já descrito no Capítulo 3.

**Falha de entrega recuperada.** Uma Message enviada por WhatsApp falha por indisponibilidade momentânea do Provider, mediada pelo Integration Hub. A Retry Policy aciona uma nova tentativa após intervalo progressivo, produzindo um novo registro de Delivery a cada tentativa, conforme já exigido no Capítulo 12; quando a entrega finalmente é confirmada, `MessageDelivered` é publicado, e o histórico completo de tentativas permanece consultável, incluindo a falha inicial.

---

## 14. Architecture Decision Records

**ADR-001 — Communication não conhece Providers.** Toda comunicação com WhatsApp, e-mail ou qualquer Canal externo passa exclusivamente pelo Integration Hub. Contexto: aplicação direta do princípio Single Integration Layer já estabelecido em `INTEGRATION_HUB.md`, ADR-001.

**ADR-002 — Communication nunca chama API externa diretamente.** Nenhum componente do domínio implementa cliente técnico de comunicação com Provider. Contexto: preservar a fronteira já delimitada no Capítulo 4.

**ADR-003 — Communication publica evento para toda mudança de estado relevante.** Nenhuma Conversation, Message ou Delivery muda de estado sem produzir o Evento correspondente. Contexto: aplicação do princípio Events over Direct Calls já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`.

**ADR-004 — CRM continua proprietário do relacionamento.** O Communication Hub nunca cria, altera ou possui Customer, Lead ou Relationship. Contexto: preservar Domain Ownership já estabelecido em `CRM_DOMAIN_BLUEPRINT.md`; o Communication Hub referencia a parte externa apenas por identificador.

**ADR-005 — Integration continua proprietário das integrações.** Nenhum Connector de Canal é implementado dentro do Communication Hub. Contexto: mesma regra já estabelecida em `INTEGRATION_HUB.md`, Capítulo 3.

**ADR-006 — Delivery é uma Entidade distinta de Message, nunca fundida em um único registro.** Contexto: uma Message pode ter múltiplas tentativas de Delivery ao longo do tempo; fundir os dois conceitos impediria rastrear individualmente cada tentativa, violando a Regra já fixada no Capítulo 12.

**ADR-007 — Toda Message é imutável após criação; apenas Delivery Status evolui.** Contexto: preservar integridade de auditoria — o conteúdo do que foi efetivamente dito nunca pode ser alterado retroativamente.

**ADR-008 — Webhook Event é sempre traduzido antes de afetar Message ou Delivery Status, nunca aplicado diretamente.** Contexto: aplicação do princípio Anti-Corruption Layer já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 10, preservando o Domain Model interno do Communication Hub isolado do formato bruto de cada Provider externo.

**ADR-009 — Um Broadcast é sempre decomposto em Delivery individuais rastreáveis.** Nenhum envio em massa é tratado como operação atômica opaca. Contexto: aplicação da Regra já fixada no Capítulo 12; sem essa decomposição, a Empresa não teria como saber quais destinatários específicos efetivamente receberam a comunicação.

**ADR-010 — Communication Preference operacional é sempre consumida por Evento do CRM Hub, nunca duplicada como Entidade própria.** Contexto: preservar Domain Ownership; a preferência de canal do relacionamento pertence ao CRM Hub, o Communication Hub apenas a aplica no momento do envio.

**ADR-011 — Retry nunca sobrescreve tentativa anterior; cada nova tentativa produz novo registro de Delivery.** Contexto: aplicação da Regra já fixada no Capítulo 12; preservar histórico completo de quantas tentativas uma entrega específica exigiu.

**ADR-012 — Toda Message enviada verifica Communication Policy aplicável antes do envio, sem exceção.** Contexto: prevenir violação de janela de horário ou de exigência de opt-in, protegendo a Empresa de risco de conformidade e de reputação de Canal.

---

## 15. Glossário

**Conversation** — agrupamento central de toda troca de comunicação com uma parte externa, independentemente de canal.

**Message** — unidade individual de comunicação, sempre associada a uma Conversation.

**Delivery** — registro de tentativa de entrega de uma Message, distinto da Message em si.

**Delivery Status** — estado atual de uma Delivery — pendente, entregue, lida, falha.

**Channel** — meio de comunicação, distinto da conta concreta que o opera.

**Channel Account** — instância concreta de um Channel operada pela Empresa.

**Broadcast** — envio coordenado de uma mesma Message a múltiplos destinatários, decomposto em Delivery individuais.

**Webhook Event** — registro bruto de notificação recebida de um Canal externo, antes de sua tradução em Message.

**Conversation Assignment** — atribuição de responsável humano por uma Conversation.

**Communication Policy** — regra que rege como e quando um Canal pode ser usado.

**Retry Policy** — política de nova tentativa aplicável a uma Delivery que falhou por motivo transitório.

**Omnichannel Routing** — capacidade de agrupar comunicação de canais diferentes sob a mesma Conversation.

**Read Receipt** — confirmação de que uma Message foi lida pelo destinatário.

---

## 16. Conclusão

Este documento define oficialmente o domínio do Communication Hub dentro da Adaptive Business Platform — sua fronteira, suas Entidades, seus Eventos e suas Regras de negócio, aplicando integralmente os princípios já estabelecidos em `BUSINESS_HUB_ARCHITECTURE.md` e respeitando com precisão a fronteira já estabelecida com o domínio de relacionamento em `CRM_DOMAIN_BLUEPRINT.md`. O futuro `COMMUNICATION_HUB.md`, e qualquer implementação técnica derivada dele, deve respeitar integralmente este Blueprint — nenhuma Entidade aqui não descrita pode ser introduzida sem revisão deste documento, e nenhuma responsabilidade aqui atribuída a outro Hub, em particular ao CRM Hub e ao Integration Hub, pode ser assumida pelo Communication Hub sem violar o Bounded Context estabelecido no Capítulo 4.

Junto com os treze documentos oficiais já existentes, este Blueprint estende o padrão de par Blueprint/Hub, já demonstrado por CRM, ao segundo domínio de negócio da plataforma — a comunicação que torna todo relacionamento gerido pelo CRM Hub efetivamente audível e visível ao Cliente.

Todo arquiteto ou desenvolvedor que construir o futuro `COMMUNICATION_HUB.md` a partir deste Blueprint deve tratar a fronteira estabelecida no Capítulo 4 como não negociável: qualquer tentação de fazer o Communication Hub decidir estratégia de relacionamento, calcular indicador de negócio, ou acessar Provider externo diretamente é um sinal de que a arquitetura está se desviando deste contrato — e a correção correta é sempre delegar essa responsabilidade ao Hub que já a possui, nunca absorvê-la aqui por conveniência de implementação imediata, mesmo quando essa delegação parece exigir mais esforço de coordenação no curto prazo do que simplesmente resolver o problema localmente.
