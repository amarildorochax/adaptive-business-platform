# Conversation Hub Architecture — Blueprint Oficial do Conversation Hub

**Adaptive Business Platform · Documento Técnico Oficial**

---

## Nota de Posicionamento Documental

Este documento nasce em status **Draft** (`DOCUMENTATION_CONSTITUTION.md`, §8.1) e exige, antes de qualquer outro conteúdo, a reconciliação mais direta encontrada até agora nesta série de Blueprints: **o Conversation Hub, como nomeado em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, e o Communication Hub, já Official em `COMMUNICATION_DOMAIN_BLUEPRINT.md` e em `COMMUNICATION_HUB.md`, são o mesmo Bounded Context.**

Diferente da reconciliação registrada em `CONTENT_HUB_ARCHITECTURE.md` — onde um Hub novo absorvia módulos que nunca tinham sido formalmente atribuídos a nenhum proprietário —, aqui o domínio inteiro já existe, já é Official, e já é extremamente maduro: `COMMUNICATION_DOMAIN_BLUEPRINT.md` já define Conversation, Message, Channel, Delivery, Inbox, Broadcast, Template, Attachment, Conversation Assignment, Conversation Status, Read Receipt e mais uma dúzia de conceitos; `COMMUNICATION_HUB.md` já define trinta e três componentes internos, treze Comandos, treze Consultas, quinze Eventos, quinze ADRs e um Roadmap completo. Este documento **não redefine nenhum desses conceitos** — onde o ESCOPO desta Sprint pede algo já coberto por aqueles dois documentos, este documento cita-os como fonte de verdade e resume o necessário para manter a leitura coerente, nunca reescrevendo em paralelo.

O que este documento genuinamente acrescenta — capacidades pedidas explicitamente pelo ESCOPO desta Sprint e ainda não cobertas pelo par Blueprint/Hub existente — é: Filas e Departamentos como Entidades de primeira classe (o Communication Hub já mencionava "regra de fila configurada" de forma operacional, nunca como Entidade nomeada); SLA e Política de tempo de resposta; Etiqueta de conversa; Mensagem Rápida, distinta de Message Template; Bot e Fluxo Conversacional; a fronteira explícita entre Automação de conversa e o Automation Engine já existente; Sessão de Atendimento como unidade de trabalho humano mensurável; resolução de identidade entre múltiplos identificadores de canal (Channel Handle); e o catálogo de canais explicitamente nomeado pelo ESCOPO (Instagram Direct, Facebook Messenger, Telegram, Web Chat, SMS, APIs de Mensageria), que os documentos existentes tratam de forma agnóstica, sem enumerar.

Três decisões de governança seguem daqui:

**Primeira — nomenclatura.** Este documento adota "Conversation Hub" como título, por ser o nome já introduzido em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` e o nome solicitado por esta Sprint, mas declara formalmente que ele é, do ponto de vista de Domain Ownership, o **mesmo Hub** já registrado como "Communication Hub" em `DOMAIN_OWNERSHIP_MATRIX.md`. A reconciliação formal de qual nome prevalece — uma renomeação de `DOMAIN_OWNERSHIP_MATRIX.md` e dos dois documentos Official existentes, ou uma declaração explícita de alias — é um item de governança pendente (Capítulo 37, ADR-CV-001), não resolvido por este documento isoladamente, exatamente como já registrado para reconciliações equivalentes em `CONTENT_HUB_ARCHITECTURE.md`.

**Segunda — extensão, não substituição.** Toda nova Entidade introduzida aqui (Queue, Department, SLAPolicy, ConversationLabel, QuickReply, Bot, ConversationalFlow, AttendanceSession, ChannelHandle) é modelada como **extensão do Bounded Context já existente do Communication Hub**, nunca como um domínio concorrente. Nenhuma delas duplica Conversation, Message, Channel, Delivery ou qualquer conceito já catalogado em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 4.

**Terceira — nenhum documento Official é alterado.** `COMMUNICATION_DOMAIN_BLUEPRINT.md` e `COMMUNICATION_HUB.md` permanecem, byte a byte, como estão. A incorporação formal das Entidades e Eventos novos deste documento a esses dois arquivos Official é também um item de governança pendente, sujeito ao processo de Change Request de `DOCUMENTATION_CONSTITUTION.md`, §10.

Nenhum código, componente, rota, banco de dados ou API foi alterado para produzir este documento.

---

## 1. Introdução

Este documento é o Blueprint arquitetural do **Conversation Hub** — o Hub responsável por toda comunicação entre a Adaptive Business Platform (em nome de uma Empresa) e qualquer parte externa, em qualquer canal, convergindo sempre para a mesma Timeline do CRM Hub. Ele implementa o lado conversacional do Modelo 02 de negócio já descrito em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, §10.2 (`Instagram/Facebook/Google/QR Code/Indicação → WhatsApp → CRM → Relacionamento → Venda → Pós-venda → Fidelização`), da mesma forma que `CONTENT_HUB_ARCHITECTURE.md` implementa o Modelo 01.

O Conversation Hub não é apenas um sistema de chat. Não é apenas uma integração com WhatsApp. É um ecossistema completo de comunicação, atendimento, automação, colaboração e relacionamento — toda conversa, de qualquer canal, deve compor a mesma Timeline única do CRM, exatamente como exige o ESCOPO desta Sprint.

Este documento segue o padrão de par Blueprint/Hub já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md` e já demonstrado por CRM e por Communication — mas, por ser pedido como um único arquivo por esta Sprint, combina os dois papéis num só documento, exatamente como `CONTENT_HUB_ARCHITECTURE.md` já fez. Onde um conceito já pertence ao par `COMMUNICATION_DOMAIN_BLUEPRINT.md`/`COMMUNICATION_HUB.md`, ele é citado, nunca redefinido.

---

## 2. Missão

A missão do Conversation Hub é centralizar todo canal de atendimento da plataforma numa única experiência omnichannel — permitindo que uma Empresa converse com seus clientes por WhatsApp, Instagram, Facebook Messenger, Telegram, Web Chat, e-mail, SMS ou qualquer API de mensageria futura, sempre através da mesma Inbox, da mesma Fila, do mesmo conjunto de Etiquetas e Fluxos, e sempre alimentando a mesma Timeline do CRM — sem que a Empresa precise contratar uma ferramenta de atendimento separada para cada canal que decide usar.

---

## 3. Visão

Que o Conversation Hub se torne, para qualquer negócio que capta clientes por conversa (Modelo 02), o único sistema de que ele precisa entre a primeira mensagem recebida — de qualquer canal — e a venda fechada, com pós-venda e fidelização conduzidos dentro da mesma Conversation, sempre visível ao lado do histórico de conteúdo, de campanha e de negócio que o resto da plataforma já constrói sobre o mesmo Cliente.

---

## 4. Objetivos Estratégicos

| # | Objetivo | Descrição |
|---|---|---|
| OE-1 | **Unificar todo canal numa única Inbox** | WhatsApp, Instagram, Facebook, Telegram, Web Chat, e-mail, SMS e canais futuros convergem para a mesma experiência de atendimento. |
| OE-2 | **Organizar o atendimento em escala** | Filas, Departamentos e Distribuição Automática garantem que volume crescente de conversa não dependa de coordenação manual. |
| OE-3 | **Medir e honrar tempo de resposta** | SLA torna mensurável, e não apenas aspiracional, o compromisso de resposta de uma Empresa com seus clientes. |
| OE-4 | **Preparar automação de conversa sem duplicar o Automation Engine** | Bot e Fluxo Conversacional cobrem a lógica de interação dentro de uma Conversation; qualquer efeito fora dela continua do Automation Engine. |
| OE-5 | **Nunca duplicar Domain Ownership já estabelecido** | Conversation, Message, Channel, Delivery, Template, Attachment continuam exatamente como já definidos em `COMMUNICATION_DOMAIN_BLUEPRINT.md` — nenhuma redefinição paralela. |
| OE-6 | **Alimentar uma única Timeline de Cliente** | Toda Conversation, de qualquer canal, produz Activity consumível pelo CRM Hub, nunca uma trilha de relacionamento paralela e desconectada. |
| OE-7 | **Preparar o terreno para IA de atendimento** | Cada capacidade de IA listada no Capítulo 27 é reservada como contrato, não implementada nesta Sprint. |

---

## 5. Escopo

**Dentro do escopo:** Omnichannel, Inbox Unificada, Gestão de Conversas, Gestão de Contatos (na acepção conversacional — Participant/Channel Handle), Sessões de Atendimento, Filas, Departamentos, Distribuição Automática, SLA, Etiquetas, Templates, Mensagens Rápidas, Bots, Fluxos Conversacionais, fronteira de Automação, Central de Anexos, Histórico e Timeline Integrada.

**Fora do escopo:** identidade de relacionamento (`Customer`, `Lead`, `Contact` — CRM Hub); estratégia de campanha e atribuição (Growth/Marketing Hub); produção de conteúdo (Content Hub); pagamento e pedido (Commerce Hub); execução de Workflow genérico não conversacional (Automation Engine); conexão técnica com qualquer Provider externo (Integration Hub); cálculo de indicador consolidado (Analytics Hub).

---

## 6. Responsabilidades

Toda troca de mensagem, de qualquer canal, é responsabilidade do Conversation Hub — ele já é, através do Communication Hub, o único proprietário de `Conversation` e de `Message` na plataforma inteira.

Organização operacional do atendimento — quem atende o quê, em que ordem, com que prazo — é responsabilidade do Conversation Hub através de Queue, Department, Conversation Assignment (já existente) e SLAPolicy.

Automação de interação dentro de uma conversa é responsabilidade do Conversation Hub através de Bot e ConversationalFlow — mas qualquer efeito de negócio fora da própria conversa (criar um Lead, disparar uma Campaign) é sempre delegado por Evento ao Hub proprietário correspondente.

```
              LIMITES ENTRE CONVERSATION HUB E DEMAIS HUBS
   ┌───────────────────────────────────────────────────────────┐
   │  Conversation Hub comunica, organiza e automatiza a conversa   │
   │       │                                                        │
   │       ├──► CRM Hub formaliza Lead/Customer e a Timeline geral       │
   │       ├──► Growth/Marketing Hub decide Campaign e Atribuição             │
   │       ├──► Commerce Hub processa Venda quando fechada na conversa           │
   │       ├──► Automation Engine executa Workflow fora da conversa                  │
   │       └──► Integration Hub fala com WhatsApp/Instagram/e-mail/etc.                  │
   └───────────────────────────────────────────────────────────┘
```

---

## 7. Arquitetura Geral

```
                              Platform
                                 │
                                 ▼
                         Conversation Hub
              (mesmo Bounded Context de Communication Hub,
               estendido — Nota de Posicionamento Documental)
                                 │
                                 ▼
                          Business Capabilities
     (já catalogadas em COMMUNICATION_DOMAIN_BLUEPRINT.md, Capítulo 6,
      mais Queue/Department/SLA/Label/QuickReply/Bot/Flow — Capítulo 9)
                                 │
                                 ▼
                       Domain Model (Capítulo 22)
        (Conversation, Message, Channel, Delivery — já existentes;
         Queue, Department, SLAPolicy, ConversationLabel, QuickReply,
         Bot, ConversationalFlow, AttendanceSession, ChannelHandle — novos)
                                 │
                                 ▼
                          Domain Events (Capítulo 28)
        (publicados no Event Bus — SYSTEM_BLUEPRINT.md, Capítulo 7)
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
             CRM Hub        Growth Hub      Analytics Hub
        (Timeline única  (Attribution de  (indicador de
         via Activity)    conversa)        atendimento)
```

```
        Conversation Hub                    CRM Hub
          │                                    │
          │  publica MessageReceived            │
          └───────────►  Event Bus  ◄───────────┐
                              │                    consome
                              │
                              └────────────────────────────────► Timeline
                                    (Activity/Interaction, já
                                     proprietário do CRM Hub)

      Nenhuma seta representa chamada direta. Toda colaboração passa
      pelo Event Bus, exatamente como exigido por
      BUSINESS_HUB_ARCHITECTURE.md, Capítulo 6.
```

---

## 8. Conceito de Conversation Hub

O Conversation Hub é um Business Hub, na categorização de `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 1 — a mesma classificação já aplicada ao Communication Hub, do qual ele é extensão direta.

O que o Conversation Hub **não é**:

- Não é apenas um sistema de chat — Inbox Unificada é uma entre quinze capacidades.
- Não é apenas uma integração com WhatsApp — WhatsApp é um Canal entre nove já catalogados no Capítulo 21.
- Não é o CRM Hub — não decide quem é o `Lead`, apenas o comunica.
- Não é o Automation Engine — não orquestra Workflow genérico fora de uma Conversation.

O que o Conversation Hub **é**: o ecossistema completo, dentro da Adaptive Business Platform, para que uma Empresa converse com qualquer cliente, em qualquer canal, com organização de fila, prazo mensurável, automação assistida e histórico único — a implementação viva do Modelo 02 descrito em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`.

---

## 9. Omnichannel

Omnichannel Routing já é uma Capacidade de Negócio formalmente catalogada em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 6, e arquiteturalmente implementada pela colaboração entre `Conversation Manager` e `Channel Manager`, conforme `COMMUNICATION_HUB.md`, Capítulo 8. Este documento não a redefine — ele acrescenta um mecanismo que os documentos existentes ainda não detalhavam: **resolução de identidade entre canais através de `ChannelHandle`** (Capítulo 22), necessária para que uma mesma pessoa, conhecida por um número de WhatsApp e por um perfil de Instagram, seja reconhecida como o mesmo `Participant` mesmo antes de qualquer `Customer`/`Contact` correspondente existir no CRM Hub.

```
   WhatsApp (+55 11 9...)  ──┐
   Instagram (@fulano)      ├──► ChannelHandle[] ──► Participant ──► Conversation
   E-mail (fulano@x.com)    ──┘        (resolução de identidade,
                                        Capítulo 22)
```

---

## 10. Inbox Unificada

Já definida como `Inbox` em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 4, e arquiteturalmente servida pelo `Inbox Manager` (`COMMUNICATION_HUB.md`, Capítulo 7) e pela Query `Inbox` (Capítulo 11 daquele documento). Este documento estende a Inbox com dois filtros operacionais novos, consistentes com as Entidades introduzidas nos Capítulos 14–15: filtro por `Queue` e filtro por `Department`, permitindo que um atendente veja apenas a fatia da Inbox relevante à sua fila/departamento, sem que isso altere o Domain Model já existente de `Inbox` em si.

---

## 11. Gestão de Conversas

Já definida integralmente por `Conversation`, `Conversation Status`, `Conversation Assignment` e `Thread` em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7, e pelos respectivos Managers em `COMMUNICATION_HUB.md`, Capítulo 7. Este documento acrescenta `AttendanceSession` (Capítulo 13) como unidade de medição de trabalho ativo, e `ConversationLabel` (Capítulo 18) como mecanismo de categorização — nenhum dos dois altera o ciclo de vida de `Conversation` já definido.

---

## 12. Gestão de Contatos

**Fronteira crítica, reafirmada explicitamente:** `Contact` é proprietário do CRM Hub (`DOMAIN_OWNERSHIP_MATRIX.md`, linha "Contact | CRM Hub"). O Conversation Hub nunca cria, altera ou possui `Contact` — ele mantém `Participant`, já definido em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7, como referência por identificador a um `Contact`/`Customer`, quando já resolvido pelo CRM Hub, ou como parte externa ainda não identificada, quando não.

O que este documento acrescenta é `ChannelHandle` (Capítulo 22) — o identificador técnico específico de canal (número de telefone, `@handle` de Instagram, endereço de e-mail) associado a um `Participant`, permitindo que múltiplos identificadores de canal apontem para a mesma pessoa antes mesmo de o CRM Hub ter formalizado um `Contact` correspondente.

---

## 13. Sessões de Atendimento

**Objetivo.** Medir o período de trabalho ativo de um atendente sobre uma `Conversation` específica, distinto do ciclo de vida completo da própria `Conversation` (que pode durar semanas) e distinto de `Conversation Assignment` (que registra responsabilidade, não tempo efetivamente dedicado).

**Responsabilidades.** Ciclo de vida de `AttendanceSession` — abertura quando um atendente inicia atenção ativa a uma `Conversation`, fechamento quando encerra ou é reatribuído; acúmulo do tempo total de atendimento humano por `Conversation`.

**Funcionalidades.** Abertura automática ao primeiro `Send Message` de um atendente numa `Conversation`; fechamento automático por inatividade configurável ou por `Close Conversation`; consulta de duração agregada.

**Fluxos.** `ConversationAssigned → AttendanceSession aberta → Mensagens trocadas → Inatividade ou encerramento → AttendanceSession fechada`.

**Dependências.** `Conversation Assignment Manager` (já existente); `Queue`/`SLAPolicy` (Capítulos 14 e 17, consumidores do tempo medido).

**Eventos.** `AttendanceSessionStarted`, `AttendanceSessionEnded`.

**Integrações.** Analytics Hub (tempo médio de atendimento como indicador consolidado).

**Limites do domínio.** `AttendanceSession` nunca substitui `Conversation Assignment` como registro de responsabilidade — ela mede tempo, o Assignment já existente decide responsável.

---

## 14. Filas

**Objetivo.** Organizar `Conversation` pendente de atendimento em agrupamentos nomeados, com regra de distribuição própria — capacidade hoje mencionada apenas de forma operacional e implícita em `COMMUNICATION_HUB.md` ("regra de fila já configurada"), formalizada aqui como Entidade de primeira classe.

**Responsabilidades.** Ciclo de vida de `Queue`; associação de `Conversation` pendente a exatamente uma `Queue`; ordenação de atendimento dentro da fila (FIFO, prioridade, SLA mais próximo do vencimento).

**Funcionalidades.** Criação e configuração de `Queue` por canal, por Departamento ou por critério de negócio (ex.: "Suporte VIP"); visualização de profundidade de fila; reordenação por prioridade.

**Fluxos.** `ConversationStarted (Communication Hub) → Queue resolvida (por canal/Departamento/regra) → aguardando Distribuição Automática (Capítulo 16)`.

**Dependências.** `Conversation Manager` (já existente, para o fato de que uma `Conversation` está aguardando); `Department` (Capítulo 15).

**Eventos.** `ConversationQueued`, `QueueDepthChanged`.

**Integrações.** Analytics Hub (profundidade e tempo médio de espera por `Queue`).

**Limites do domínio.** `Queue` nunca decide, sozinha, para qual atendente uma `Conversation` vai — essa decisão pertence à Distribuição Automática (Capítulo 16), consumidora da `Queue`.

---

## 15. Departamentos

**Objetivo.** Agrupar atendentes e Filas por área de negócio (Vendas, Suporte, Financeiro, Pós-venda), formalizando uma estrutura organizacional que hoje não existe em nenhum documento já Official.

**Responsabilidades.** Ciclo de vida de `Department`; associação de `Queue[]` e de atendentes (referenciados por identificador ao Identity Hub) a um `Department`.

**Funcionalidades.** Criação e configuração de Departamento; horário de funcionamento por Departamento (relevante a SLA, Capítulo 17); relatório de carga por Departamento.

**Fluxos.** `Department criado → Queue[] associadas → Atendentes associados (via Identity Hub) → Conversation distribuída dentro do Departamento`.

**Dependências.** `Queue` (Capítulo 14); Identity Hub (associação de Usuário/Papel a um Departamento).

**Eventos.** `DepartmentCreated`, `DepartmentUpdated`.

**Integrações.** Identity Hub (Permissão por Departamento); Analytics Hub (indicador consolidado por Departamento).

**Limites do domínio.** `Department` é puramente organizacional — não implementa lógica de distribuição, apenas a estrutura sobre a qual a Distribuição Automática opera.

---

## 16. Distribuição Automática

**Objetivo.** Atribuir automaticamente uma `Conversation` pendente em uma `Queue` a um atendente disponível, sem exigir triagem manual — extensão explícita do `Conversation Assignment Manager` já existente em `COMMUNICATION_HUB.md`, Capítulo 7.

**Responsabilidades.** Aplicação de regra de distribuição (round-robin, menor carga ativa, habilidade/especialização) sobre `Queue`; produção do `Conversation Assignment` (já existente) resultante.

**Funcionalidades.** Configuração de estratégia de distribuição por `Queue`; consideração de disponibilidade declarada do atendente (via Identity Hub/Configuration); reatribuição automática em caso de inatividade prolongada do atendente originalmente designado.

**Fluxos.** `ConversationQueued → estratégia de distribuição aplicada → AssignConversation (Command já existente do Communication Hub) → ConversationAssigned`.

**Dependências.** `Queue`, `Department`, `Conversation Assignment Manager` (já existente).

**Eventos.** Não introduz Evento novo — produz o já existente `ConversationAssigned`, catalogado em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 10.

**Integrações.** AI Hub (Capítulo 27 — priorização assistida de distribuição, sem decidir sozinha).

**Limites do domínio.** A Distribuição Automática nunca cria `Conversation Assignment` fora do Command já existente — ela é uma política de decisão sobre quando e para quem invocar esse Command, nunca um mecanismo paralelo de escrita.

---

## 17. SLA

**Objetivo.** Tornar mensurável o compromisso de tempo de resposta e de resolução de uma Empresa, algo que `COMMUNICATION_HUB.md`, Capítulo 16, já cita como SLI ("tempo de primeira resposta") mas nunca formaliza como política configurável e monitorável.

**Responsabilidades.** Ciclo de vida de `SLAPolicy` (tempo-alvo de primeira resposta, tempo-alvo de resolução, por `Queue`/`Department`); monitoramento contínuo de `Conversation` ativa contra a `SLAPolicy` aplicável; produção do fato `SLAExceeded` quando o prazo é ultrapassado.

**Funcionalidades.** Configuração de `SLAPolicy` por `Queue`/`Department`/canal; painel de `Conversation` em risco de estourar SLA; escalonamento automático (via Automation Engine) quando configurado.

**Fluxos.** `ConversationAssigned → Cronômetro de SLA iniciado → MessageSent (primeira resposta) → SLA de primeira resposta cumprido ou SLAExceeded publicado`.

**Dependências.** `AttendanceSession` (Capítulo 13, para excluir tempo fora de horário de atendimento do cronômetro, quando configurado); `Queue`, `Department`.

**Eventos.** `SLAExceeded`.

**Integrações.** Automation Engine (consome `SLAExceeded` para disparar escalonamento, notificação a gestor); Analytics Hub (indicador consolidado de cumprimento de SLA).

**Limites do domínio.** SLA nunca altera `Conversation Assignment` diretamente — quando um estouro exige reatribuição, essa decisão é delegada ao Automation Engine através de Evento, nunca executada diretamente pelo SLA Manager.

---

## 18. Etiquetas

**Objetivo.** Categorizar `Conversation` com marcação livre e reutilizável — nome deliberadamente `ConversationLabel`, distinto de `Tag` (CRM Hub) e de `ContentTag` (Content Hub), seguindo a mesma disciplina de nomenclatura já registrada em `CONTENT_HUB_ARCHITECTURE.md`, ADR-CH-005.

**Responsabilidades.** Ciclo de vida de `ConversationLabel`; associação de `ConversationLabel[]` a uma `Conversation`.

**Funcionalidades.** Criação de etiqueta por Departamento; filtro de Inbox por etiqueta; etiquetagem manual ou automática (via `ConversationalFlow`/Bot, Capítulo 21).

**Fluxos.** `Conversation criada ou em andamento → ConversationLabel aplicada (manual ou por Fluxo) → filtro/relatório por etiqueta`.

**Dependências.** `Conversation Manager` (já existente).

**Eventos.** `ConversationLabeled`.

**Integrações.** Analytics Hub (distribuição de `Conversation` por etiqueta); Growth Hub (etiqueta como sinal complementar de segmentação, referenciado por identificador, nunca duplicado).

**Limites do domínio.** `ConversationLabel` nunca substitui `ConversationStatus` (já existente) — é categorização livre, não estado operacional.

---

## 19. Templates

Já integralmente definido como `Message Template` em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 4, arquiteturalmente servido pelo `Template Manager` (`COMMUNICATION_HUB.md`, Capítulo 7), com identidade de marca resolvida via Branding Hub. Nenhuma extensão nova é introduzida por este documento — `Message Template` continua sendo o mecanismo formal de mensagem reutilizável, tipicamente usado em envio outbound estruturado e em `Broadcast`.

---

## 20. Mensagens Rápidas

**Objetivo.** Oferecer a um atendente um atalho pessoal ou de equipe para resposta recorrente durante uma `Conversation` ao vivo — distinto de `Message Template` por natureza de uso: um `Message Template` é formal, versionado, tipicamente usado em campanha ou em primeira resposta padronizada; uma `QuickReply` é informal, editável livremente, inserida ad-hoc durante o atendimento.

**Responsabilidades.** Ciclo de vida de `QuickReply`; escopo pessoal (do próprio atendente) ou de `Department`.

**Funcionalidades.** Atalho de teclado/comando (`/saudacao`) para inserir texto pré-definido; biblioteca compartilhada por `Department`.

**Fluxos.** `Atendente aciona atalho → QuickReply expandida no campo de composição → SendMessage (Command já existente)`.

**Dependências.** `Message Manager` (já existente, consumidor do texto expandido).

**Eventos.** Nenhum Evento de domínio próprio — `QuickReply` afeta apenas a composição local de uma `Message`, cujo `MessageSent` já é catalogado.

**Integrações.** Nenhuma além do próprio Conversation Hub.

**Limites do domínio.** `QuickReply` nunca é enviada diretamente — ela apenas preenche o conteúdo de uma `Message` que ainda passa pelo fluxo normal de envio, incluindo verificação de `Communication Policy` já existente.

---

## 21. Bots

**Objetivo.** Permitir que uma `Conversation` seja conduzida, em parte ou integralmente, por um agente automatizado — sem que isso comprometa nenhuma garantia já estabelecida para `Message` (imutabilidade, associação a `Conversation`, Delivery rastreável).

**Responsabilidades.** Ciclo de vida de `Bot` como um tipo de `Author`/`Participant` interno; execução de um `ConversationalFlow` (Capítulo 22) associado; produção de `Message` de saída através do mesmo `Message Manager` já existente — um Bot nunca tem caminho de envio próprio e paralelo.

**Funcionalidades.** Configuração de `Bot` por canal/`Queue`; transferência de uma `Conversation` de Bot para atendente humano (`BotFinished` seguido de `ConversationAssigned`); fallback humano configurável após N tentativas sem entendimento.

**Fluxos.** Ver Capítulo 22 (Fluxo Conversacional completo).

**Dependências.** `ConversationalFlow`; `AI Hub` (Capítulo 27, quando o Bot usa geração assistida em vez de fluxo determinístico puro).

**Eventos.** `BotStarted`, `BotFinished`.

**Integrações.** AI Hub (geração de resposta, classificação de intenção); Automation Engine (quando um passo do Fluxo precisa de efeito fora da conversa).

**Limites do domínio.** Um Bot nunca cria `Lead`, nunca processa pagamento, nunca decide Campanha — quando o Fluxo Conversacional chega a um ponto que exige uma dessas ações, ele publica o Evento correspondente (por exemplo `LeadCaptured`, já definido em `CONTENT_HUB_ARCHITECTURE.md` e reutilizado aqui pelo mesmo princípio de não duplicar Evento equivalente) para que o Hub proprietário decida, nunca executa diretamente.

---

## 22. Fluxos Conversacionais

**Objetivo.** Modelar a lógica de condução de uma `Conversation` por um `Bot` — árvore de decisão, opções, coleta de dado — como uma Entidade própria do Conversation Hub, sem duplicar o `Workflow` genérico já proprietário do Automation Engine.

**Responsabilidades.** Ciclo de vida de `ConversationalFlow` e de `FlowStep`; execução determinística ou assistida por IA de um `FlowStep` a cada `Message` recebida enquanto o `Bot` está ativo numa `Conversation`.

**Funcionalidades.** Editor de árvore de decisão (opções de múltipla escolha, campo livre validado, condição); ponto de saída explícito para transferência a atendente humano; ponto de saída explícito para publicar um Evento de negócio (ex.: `LeadCaptured`).

**Fluxos.**

```
MessageReceived → Bot ativo? → FlowStep atual avaliado →
  ├─ Resposta determinística (opção escolhida) → próximo FlowStep
  ├─ Coleta de dado válida → armazenada no contexto do Fluxo → próximo FlowStep
  ├─ Necessidade de geração assistida → AI Hub (Capítulo 27) → Message composta
  ├─ Condição de saída para humano → BotFinished → ConversationQueued/Assigned
  └─ Condição de saída para negócio → Evento de domínio publicado (ex.: LeadCaptured)
```

**Dependências.** `Bot` (Capítulo 21); `Message Manager` (já existente); AI Hub, quando aplicável.

**Eventos.** `ConversationalFlowStarted`, `ConversationalFlowStepCompleted`, `ConversationalFlowExited`.

**Integrações.** AI Hub (classificação de intenção, geração assistida — Capítulo 27); Automation Engine (quando um `FlowStep` precisa de um efeito colateral fora da própria conversa, delegado por Evento, nunca por chamada direta ao Automation Engine).

**Limites do domínio — a fronteira mais importante deste capítulo.** Um `ConversationalFlow` nunca é um `Workflow` do Automation Engine, e vice-versa. O `ConversationalFlow` decide o que a próxima `Message` de um `Bot` diz, dentro de uma `Conversation` específica, em reação direta ao que a parte externa acabou de dizer — uma decisão interna, síncrona à conversa, sempre dentro do Bounded Context do Conversation Hub. O `Workflow` do Automation Engine decide quando um processo de negócio deve ocorrer, em reação a um Evento de qualquer Hub — uma decisão externa, assíncrona por natureza, nunca modelando o conteúdo de uma resposta conversacional específica. Quando um `FlowStep` precisa de um efeito que só o Automation Engine deveria decidir — por exemplo, dispará-lo com atraso configurável, ou condicioná-lo a uma regra que envolve outro Hub —, o `ConversationalFlow` publica um Evento e encerra sua própria responsabilidade ali, exatamente como qualquer outro Business Hub já faz ao consumir o Automation Engine, conforme `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 14.

---

## 23. Automações

Esta seção não introduz uma nova Entidade — ela consolida, de forma explícita, a fronteira já estabelecida nos Capítulos 21 e 22 e a estende ao restante do domínio. O Conversation Hub consome o Automation Engine exatamente como qualquer Business Hub, através de Evento publicado e de `Action` invocada (ex.: a Action "Enviar mensagem" já descrita em `AUTOMATION_ENGINE.md`, Capítulo 11, e já referenciada em `COMMUNICATION_HUB.md`, Capítulo 13). O Conversation Hub nunca implementa seu próprio motor de `Trigger`/`Condition`/`Retry Policy` genérico — esses conceitos permanecem exclusivos do Automation Engine, conforme `DOMAIN_OWNERSHIP_MATRIX.md`, linha "Workflow | Automation Engine".

| Tipo de automação | Proprietário |
|---|---|
| Lógica de condução de uma conversa por Bot (o que responder a seguir) | Conversation Hub — `ConversationalFlow` |
| Disparo de processo de negócio fora da conversa (lembrete, cobrança, campanha agendada) | Automation Engine — `Workflow` |
| Retry de entrega de uma Message | Communication Hub (já existente) — `Retry Policy`, específico de Delivery |
| Escalonamento por SLA estourado | Automation Engine, acionado por `SLAExceeded` publicado pelo Conversation Hub |

---

## 24. Central de Anexos

Já integralmente definido como `Attachment` em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 4, arquiteturalmente servido pelo `Attachment Manager` (`COMMUNICATION_HUB.md`, Capítulo 7). Este documento acrescenta apenas uma observação de integração: quando um Attachment enviado numa `Conversation` é um material já existente no Content Hub (por exemplo, um `Download` — `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 22), o Conversation Hub referencia esse material por identificador, nunca duplicando o arquivo — mesma disciplina de reuso já aplicada em toda a plataforma.

---

## 25. Histórico de Conversas

Já integralmente definido como `Conversation Timeline` em `COMMUNICATION_HUB.md`, Capítulos 6 e 11 — a agregação cronológica de `Message` e `Delivery Status` de uma `Conversation`, servida por Read Model já materializado. Nenhuma extensão nova é introduzida aqui.

---

## 26. Timeline Integrada

Esta seção formaliza, para esta Sprint, a exigência explícita do ESCOPO: "Toda conversa deverá compor a Timeline única do CRM". `COMMUNICATION_HUB.md`, Capítulo 6, já distingue com precisão a `Conversation Timeline` (conteúdo e estado de entrega, proprietária do Conversation Hub) da Timeline do CRM Hub (história de negócio do relacionamento — mudança de Estágio, transferência de Ownership —, já proprietária do CRM Hub). As duas nunca se fundem numa única estrutura de dado compartilhada.

O que as conecta é o mesmo mecanismo já formalizado em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 11: o CRM Hub consome `MessageReceived` e `ConversationClosed` (e, com este documento, também `SLAExceeded` e `ConversationLabeled`, quando relevantes a relacionamento) para registrar sua própria `Interaction`/Activity — já proprietária do CRM Hub (`DOMAIN_OWNERSHIP_MATRIX.md`, linha "Interaction | CRM Hub"). Um painel de Customer 360 combina as duas Timelines apenas na camada de apresentação, nunca na camada de domínio — a mesma ressalva já registrada em `COMMUNICATION_HUB.md`, Capítulo 6.

```
   Conversation Hub                              CRM Hub
      │                                             │
      │  MessageReceived / ConversationClosed /     │
      │  SLAExceeded / ConversationLabeled           │
      ├────────────────────────────────────────────►│
      │                                             │  cria Interaction/Activity
      │                                             │      │
      │                                             │      ▼
      │                                             │  Timeline do CRM Hub
      │                                             │  (relacionamento)
      │
      │  Conversation Timeline
      │  (conteúdo e entrega — permanece aqui)
```

---

## 27. IA aplicada ao Atendimento

Nenhuma capacidade descrita neste capítulo é implementada nesta Sprint — apenas o contrato de responsabilidade é registrado, mesmo padrão de "preparação sem implementação prematura" já aplicado em `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 25, e em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, §19.

**Resumo automático de conversas.** O AI Hub produziria uma síntese de uma `Conversation` longa, consumível pelo atendente que assume um `Conversation Assignment` transferido, sem precisar ler toda a `Conversation Timeline`.

**Classificação automática.** Categorização de intenção/assunto de uma `Conversation` recém-iniciada, informando `Queue`/`Department` mais adequado antes mesmo da Distribuição Automática decidir o atendente.

**Análise de sentimento.** Leitura contínua do tom de uma `Conversation` ativa, sinalizando risco de insatisfação — insumo relevante para priorização (abaixo) e para escalonamento por SLA (Capítulo 17).

**Sugestão de respostas.** O AI Hub compõe uma sugestão de `Message` de resposta a partir do contexto da `Conversation`, sempre apresentada ao atendente para confirmação ou edição antes do envio — nunca enviada automaticamente sem revisão, salvo quando o próprio `Bot`/`ConversationalFlow` está explicitamente configurado para operar sem supervisão humana num trecho determinístico.

**Tradução automática.** Tradução de `Message` recebida e de resposta composta, permitindo atendimento em idioma diferente do falado pela parte externa, sem exigir atendente poliglota.

**Identificação de intenção.** Reconhecimento do que a parte externa deseja (dúvida, reclamação, intenção de compra), insumo direto de `ConversationalFlow` (Capítulo 22) para decidir o próximo `FlowStep`.

**Priorização de atendimentos.** Reordenação assistida de uma `Queue`, combinando Análise de sentimento, SLA remanescente e classificação de intenção — sempre uma sugestão de ordenação, nunca uma sobrescrita da regra de Distribuição Automática sem visibilidade ao gestor.

**Resumo de atendimentos.** Síntese pós-encerramento de uma `Conversation`, útil a relatório de qualidade e a treinamento de novo atendente.

**Geração de respostas.** Composição integral de uma `Message` por um `Bot` operando um trecho não determinístico de um `ConversationalFlow`, sempre dentro dos limites de fallback humano já configurados no Capítulo 21.

**Assistência ao operador.** Presença contínua do AI Hub ao lado do atendente humano — sugestão de próximo passo, alerta de política de comunicação aplicável, alerta de SLA próximo do vencimento — sem nunca assumir o envio em nome do atendente sem confirmação, aplicação direta do princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5.

---

## 28. Eventos do Domínio

Os primeiros quinze eventos abaixo já estão integralmente definidos em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 10 — reproduzidos aqui, sem redefinição, apenas para consolidar o catálogo completo pedido pelo ESCOPO desta Sprint num único lugar de consulta. Os eventos seguintes são as extensões introduzidas por este documento.

| Evento | Produtor | Consumidor | Objetivo | Impacto |
|---|---|---|---|---|
| `ConversationStarted` | Communication Hub (já existente) | CRM Hub, Analytics Hub | Nova `Conversation` criada. | Primeira etapa de qualquer atendimento. |
| `ConversationAssigned` | Communication Hub / Distribuição Automática | Analytics Hub | Responsável atribuído a uma `Conversation`. | Inicia `AttendanceSession` (novo). |
| `ConversationTransferred` | Communication Hub (já existente, via `TransferConversation`) | CRM Hub, Analytics Hub | Responsabilidade transferida entre atendentes. | Nova `AttendanceSession` para o novo responsável. |
| `MessageReceived` | Communication Hub (já existente) | CRM Hub, Conversation Hub (Bot/Flow) | Nova mensagem de entrada. | Consumida pelo `ConversationalFlow` quando `Bot` ativo. |
| `MessageSent` | Communication Hub (já existente) | Analytics Hub | Mensagem despachada para entrega. | Inicia rastreamento de `Delivery`. |
| `MessageRead` | Communication Hub (já existente) | CRM Hub, Analytics Hub | Confirmação de leitura recebida. | Sinal de engajamento. |
| `AttachmentReceived` | Communication Hub (já existente — `AttachmentUploaded`) | CRM Hub, Content Hub (quando aplicável) | Arquivo recebido numa `Conversation`. | Disponível na Central de Anexos. |
| `BotStarted` | Conversation Hub (novo) | Analytics Hub | Um `Bot` assume a condução de uma `Conversation`. | Ativa avaliação de `ConversationalFlow`. |
| `BotFinished` | Conversation Hub (novo) | Distribuição Automática, Analytics Hub | Um `Bot` encerra sua participação. | Dispara `ConversationQueued`/`ConversationAssigned` quando transferido a humano. |
| `ConversationClosed` | Communication Hub (já existente) | CRM Hub, Analytics Hub | `Conversation` encerrada. | Fecha `AttendanceSession` pendente. |
| `SLAExceeded` | Conversation Hub (novo) | Automation Engine, Analytics Hub, CRM Hub | Prazo de `SLAPolicy` ultrapassado. | Pode disparar escalonamento via Automation Engine. |
| `CustomerReplied` | Conversation Hub (novo, especialização de `MessageReceived` quando reinicia o cronômetro de SLA) | SLA Manager | Parte externa respondeu, reiniciando expectativa de próxima resposta. | Recalcula prazo de `SLAPolicy`. |
| `ConversationQueued` | Conversation Hub (novo) | Distribuição Automática, Analytics Hub | `Conversation` aguardando em `Queue`. | Base para `QueueDepthChanged`. |
| `QueueDepthChanged` | Conversation Hub (novo) | Analytics Hub | Profundidade de `Queue` mudou. | Alerta operacional de sobrecarga. |
| `DepartmentCreated` / `DepartmentUpdated` | Conversation Hub (novo) | Identity Hub, Analytics Hub | `Department` criado/alterado. | Reorganização de fila e de permissão. |
| `ConversationLabeled` | Conversation Hub (novo) | Analytics Hub, Growth Hub | Etiqueta aplicada a uma `Conversation`. | Sinal complementar de segmentação. |
| `ConversationalFlowStarted` / `ConversationalFlowStepCompleted` / `ConversationalFlowExited` | Conversation Hub (novo) | Analytics Hub | Progresso de um `Bot` num `ConversationalFlow`. | Observabilidade de automação conversacional. |
| `AttendanceSessionStarted` / `AttendanceSessionEnded` | Conversation Hub (novo) | Analytics Hub | Início/fim de trabalho ativo de um atendente. | Base de indicador de tempo de atendimento. |
| `ChannelHandleLinked` | Conversation Hub (novo) | CRM Hub | Novo identificador de canal associado a um `Participant`. | Melhora a resolução de identidade omnichannel. |

Este catálogo estende, sem contradizer, o catálogo já Official de `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 10 — a incorporação formal dos eventos novos àquele documento é um item de governança pendente (Capítulo 37).

---

## 29. Integração com os demais Hubs

**CRM Hub.** Consome `MessageReceived`, `ConversationClosed`, `SLAExceeded` e `ConversationLabeled` para registrar `Interaction`/Activity na Timeline de relacionamento (Capítulo 26); publica `LeadCreated`, `RelationshipChanged`, `ConsentUpdated`, já consumidos pelo Conversation Hub conforme `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 11.

**Content Hub.** Publica `LeadCaptured` quando um Formulário é preenchido; o Conversation Hub pode, através de Automation Engine, iniciar uma `Conversation` proativa em reação a esse Evento — decisão de orquestração do Automation Engine, nunca do Content Hub ou do Conversation Hub diretamente. O Conversation Hub também referencia `Download`/`MediaAsset` do Content Hub como Anexo, conforme Capítulo 24.

**Marketing Hub / Growth Hub.** Define o conteúdo estratégico de `Campaign Message`, entregue ao Conversation Hub para envio via `Broadcast` — já formalizado em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 4 (`Campaign Message`). Consome `ConversationLabeled` como sinal complementar de segmentação.

**Commerce Hub.** Quando uma venda é fechada dentro de uma `Conversation` (típico do Modelo 02), o `ConversationalFlow`/atendente publica o Evento correspondente (equivalente a `CTAConverted`/`FormSubmitted` do Content Hub, adaptado ao contexto conversacional — um novo evento de negócio, não introduzido neste documento por pertencer ao domínio do Commerce Hub quando este for formalizado) para que o Commerce Hub inicie seu próprio fluxo de Pedido.

**Business Hub.** Fornece Segmento/Maturidade e Identidade Visual, consumidos por `Policy Manager` (já existente) e por `Template Manager` (já existente) para calibrar Communication Policy e identidade de `Message Template`/`QuickReply`.

**AI Hub.** Consumido nos termos do Capítulo 27 — o Conversation Hub nunca implementa lógica de IA própria.

**Identity Hub.** Autentica e autoriza toda operação, com granularidade estendida por `Department` (Capítulo 15) além do já existente Perfil operacional/administrativo.

**Integration Hub.** Único ponto de saída para todo Canal externo — WhatsApp, Instagram Direct, Facebook Messenger, Telegram, Web Chat, e-mail, SMS, APIs de Mensageria — conforme já estabelecido em `INTEGRATION_HUB.md` e detalhado no Capítulo 30.

```
              INTEGRAÇÃO DO CONVERSATION HUB COM OUTROS HUBS
   ┌───────────────────────────────────────────────────────────┐
   │  Conversation Hub                                              │
   │    publica: MessageReceived · ConversationClosed ·                │
   │             SLAExceeded · ConversationLabeled · BotFinished           │
   │             (mais os já existentes do Communication Hub)                 │
   │    consome: LeadCreated · RelationshipChanged · ConsentUpdated               │
   │             (CRM Hub) · CampaignPublished (Growth/Marketing Hub) ·                │
   │             LeadCaptured (Content Hub, via Automation Engine)                        │
   └───────────────────────────────────────────────────────────┘
```

---

## 30. Canais Suportados

| Canal | Natureza | Sinal de leitura (Read Receipt) | Observação arquitetural |
|---|---|---|---|
| **WhatsApp** | Conversacional, alta frequência, baixa latência | Sim, nativo | Canal de referência do Modelo 02 (`ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, §10.2). |
| **Instagram Direct** | Conversacional, social | Parcial, depende de API do Provider | Origem tipicamente ligada a `Acquisition Channel` do Growth Hub (Story, publicação). |
| **Facebook Messenger** | Conversacional, social | Parcial | Mesmo padrão de Instagram Direct — ambos mediados pelo mesmo grupo de Provider Meta. |
| **Telegram** | Conversacional | Sim, nativo | Suporta Bot nativamente no próprio protocolo do Provider — o `Bot` deste Hub permanece a camada de domínio, independente dessa capacidade técnica do Canal. |
| **Web Chat** | Conversacional, embutido no site/Landing Page do Content Hub | Sim, por natureza (mesma sessão) | Único Canal cuja origem é sempre o próprio Content Hub — forte candidato a `Bot`/`ConversationalFlow` de primeiro contato. |
| **E-mail** | Assíncrono, formal | Não, tipicamente indisponível | Já exemplificado em `COMMUNICATION_HUB.md`, Capítulo 18 ("Atendimento E-mail"). |
| **SMS** | Assíncrono, alta entrega, baixa riqueza de mídia | Não, tipicamente indisponível | Canal de fallback quando os demais não estão disponíveis para o destinatário. |
| **APIs de Mensageria** | Variável, dependente do Provider | Variável | Categoria aberta — cobre Provider de mensageria não nomeado individualmente, mediado pelo mesmo Connector genérico do Integration Hub. |
| **Canais futuros (via Conector)** | Variável | Variável | Nenhum Canal novo exige mudança no Domain Model deste Hub — apenas um novo Connector no Integration Hub, conforme Capítulo 30.1. |

### 30.1 Como um novo canal converge para a Inbox única

```
Novo Provider externo
      │
      ▼
Novo Connector (Integration Hub — INTEGRATION_HUB.md)
      │
      ▼
Webhook Event traduzido (já existente — COMMUNICATION_HUB.md, Capítulo 7)
      │
      ▼
Channel + ChannelAccount registrados (já existente)
      │
      ▼
Message associada a Conversation (Omnichannel Routing, já existente)
      │
      ▼
Inbox Unificada (Capítulo 10) — nenhuma distinção visual obrigatória
      entre canal de origem, exceto o rótulo do próprio Channel
```

Nenhum Canal novo, nesta arquitetura, exige uma nova Entidade de domínio — `Channel`/`ChannelAccount` já são suficientemente genéricos, conforme `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7. A única mudança real ao suportar um Canal adicional é a introdução de um novo Connector dentro do Integration Hub — exatamente o mecanismo de Extensibilidade já previsto em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, §19.

---

## 31. Segurança

Toda operação sensível — atribuir, transferir, encerrar `Conversation`; configurar `SLAPolicy`; criar `Department` — é autenticada e autorizada exclusivamente pelo Identity Hub, mesmo padrão já estabelecido em `COMMUNICATION_HUB.md`, Capítulo 15, agora também aplicado por `Department` como novo nível de granularidade de Permissão.

Consentimento continua consumido do CRM Hub via `ConsentUpdated`, verificado antes de qualquer envio — nenhuma mudança em relação ao já estabelecido.

Um `Bot` opera sob o mesmo modelo de Permissão de qualquer `Participant` interno — suas ações são auditáveis exatamente como as de um atendente humano, e um `ConversationalFlow` mal configurado nunca contorna `Communication Policy` já verificada pelo `Policy Manager` existente.

Isolamento por Tenant se estende a `Queue`, `Department`, `SLAPolicy`, `ConversationLabel`, `Bot` e `ConversationalFlow` — nenhuma dessas novas Entidades é visível ou reutilizável entre Empresas diferentes, mesmo princípio já exigido em `SAAS_ARCHITECTURE.md`, Capítulo 6.

---

## 32. Permissões

| Papel | Acesso típico |
|---|---|
| **Administrador** | Acesso total — configuração, Departamentos, Filas, SLA, Bots. |
| **Gestor de Atendimento** | Configura `Queue`/`Department`/`SLAPolicy`; visualiza indicador consolidado; reatribui `Conversation`. |
| **Atendente** | Opera `Inbox` de seu `Department`; envia `Message`; usa `QuickReply`; não configura `SLAPolicy`. |
| **Supervisor de Bot** | Configura `ConversationalFlow`; monitora `BotStarted`/`BotFinished`; ajusta fallback humano. |
| **Analista** | Leitura de indicador consolidado; sem permissão de operação. |
| **CEO / Executivo** | Leitura consolidada; aprovação de decisão de maior impacto (ex.: novo Departamento). |

---

## 33. Auditoria

Toda mudança relevante — `Conversation Assignment`, `SLAPolicy`, `Department`, `ConversationalFlow` — produz registro auditável imutável, mesmo padrão já exigido em `COMMUNICATION_HUB.md`, Capítulo 15, e em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 15.

Toda decisão tomada por um `Bot` dentro de um `ConversationalFlow` é registrada com o mesmo rigor de uma ação humana — qual `FlowStep` foi executado, qual `Message` foi composta, se houve transferência a humano — preservando rastreabilidade completa mesmo quando nenhum atendente humano participou de um trecho da `Conversation`.

---

## 34. Escalabilidade

O Conversation Hub herda integralmente as garantias de escala já detalhadas em `COMMUNICATION_HUB.md`, Capítulo 17 — Workers independentes, Queues técnicas isoladas por Tenant, Rate Limiting por Provider, processamento paralelo por `Conversation`. As Entidades novas deste documento seguem a mesma disciplina: `Queue` (organizacional) e `Delivery Queue` (técnica, já existente) são conceitos distintos e não competem pelo mesmo recurso; `SLAPolicy` é avaliada de forma assíncrona, nunca bloqueando o envio de uma `Message`; `ConversationalFlow` é avaliado por `Conversation` de forma independente, respeitando a mesma ordenação por `Conversation` já exigida em `COMMUNICATION_HUB.md`, Capítulo 12.

---

## 35. Diagramas ASCII

```
                    POSIÇÃO DO CONVERSATION HUB NA PLATAFORMA
   ┌───────────────────────────────────────────────────────────┐
   │  Platform Services                                            │
   │  (AI Hub · Identity Hub · Knowledge Hub · Integration Hub)     │
   ├───────────────────────────────────────────────────────────┤
   │  Adaptive Intelligence                                          │
   │  (Business Profile Engine · Branding Hub · Automation Engine)   │
   ├───────────────────────────────────────────────────────────┤
   │  Business Hubs                                                   │
   │  ┌─────────┐  ┌───────────┐  ┌──────────┐  ┌────────────┐        │
   │  │ CRM Hub │  │Content Hub│  │Growth Hub│  │Conversation │        │
   │  │         │  │           │  │          │  │Hub (este    │        │
   │  │         │  │           │  │          │  │documento —   │        │
   │  │         │  │           │  │          │  │= Communication│        │
   │  │         │  │           │  │          │  │Hub)            │        │
   │  └─────────┘  └───────────┘  └──────────┘  └────────────┘        │
   └───────────────────────────────────────────────────────────┘
```

```
                    ENTIDADES NOVAS SOBRE O DOMÍNIO EXISTENTE
   ┌───────────────────────────────────────────────────────────┐
   │  Já existente (COMMUNICATION_DOMAIN_BLUEPRINT.md):             │
   │  Conversation · Message · Channel · Delivery · Template ·        │
   │  Attachment · Inbox · Broadcast · Assignment · Status               │
   │                                                                │
   │  Novo (este documento):                                          │
   │  Queue · Department · SLAPolicy · ConversationLabel ·               │
   │  QuickReply · Bot · ConversationalFlow · AttendanceSession ·           │
   │  ChannelHandle                                                             │
   └───────────────────────────────────────────────────────────┘
```

```
              MODELO 02 — DE CONVERSA A FIDELIZAÇÃO
   ┌───────────────────────────────────────────────────────────┐
   │  Canal (Capítulo 30) → ChannelHandle → Participant →           │
   │  Conversation → Queue → Distribuição Automática →                  │
   │  Atendente/Bot → CRM Hub (Timeline) → Commerce Hub (Venda) →           │
   │  Pós-venda (mesma Conversation) → ConversationLabel               │
   │  "Fidelizado"                                                        │
   └───────────────────────────────────────────────────────────┘
```

(Diagramas de fluxo específico adicionais aparecem nos Capítulos 7, 9, 22 e 26.)

---

## 36. Tabelas Arquiteturais

### 36.1 Entidade → Proprietário (resumo de reconciliação)

| Entidade | Já existente em | Novo neste documento |
|---|---|---|
| Conversation, Message, Channel, ChannelAccount, Thread, Delivery, Delivery Status | `COMMUNICATION_DOMAIN_BLUEPRINT.md` | — |
| Message Template, Attachment, Inbox, Outbox, Broadcast | `COMMUNICATION_DOMAIN_BLUEPRINT.md` | — |
| Conversation Assignment, Conversation Status, Communication Policy | `COMMUNICATION_DOMAIN_BLUEPRINT.md` | — |
| Queue, Department | — | Sim |
| SLAPolicy | — | Sim |
| ConversationLabel, QuickReply | — | Sim |
| Bot, ConversationalFlow, FlowStep | — | Sim |
| AttendanceSession, ChannelHandle | — | Sim |

### 36.2 Módulo (seção do ESCOPO) → Componente arquitetural

| Módulo | Componente responsável |
|---|---|
| Omnichannel | `Conversation Manager` + `Channel Manager` (já existentes) + `ChannelHandle` (novo) |
| Inbox Unificada | `Inbox Manager` (já existente) |
| Gestão de Conversas | `Conversation Manager`, `Conversation Status Manager` (já existentes) |
| Gestão de Contatos | `Participant Manager` (já existente) + `ChannelHandle` (novo) |
| Sessões de Atendimento | `AttendanceSession` (novo) |
| Filas | `Queue` (novo) |
| Departamentos | `Department` (novo) |
| Distribuição Automática | `Conversation Assignment Manager` (já existente), estendido por `Queue`/`Department` |
| SLA | `SLAPolicy` (novo) |
| Etiquetas | `ConversationLabel` (novo) |
| Templates | `Template Manager` (já existente) |
| Mensagens Rápidas | `QuickReply` (novo) |
| Bots | `Bot` (novo) |
| Fluxos Conversacionais | `ConversationalFlow` (novo) |
| Central de Anexos | `Attachment Manager` (já existente) |
| Histórico de Conversas | `Conversation Timeline` (já existente) |

### 36.3 KPIs (fatos brutos — cálculo consolidado permanece do Analytics Hub)

| Indicador de origem | Módulo produtor |
|---|---|
| Tempo médio de primeira resposta | SLA, AttendanceSession |
| Taxa de cumprimento de SLA por Departamento | SLA, Department |
| Profundidade média de Queue | Queue |
| Volume de Conversation por Canal | já existente (Communication Analytics) |
| Taxa de resolução por Bot sem transferência humana | Bot, ConversationalFlow |
| Distribuição de Conversation por Etiqueta | ConversationLabel |

---

## 37. Roadmap Evolutivo

| Fase | Foco | Observação |
|---|---|---|
| **Fase 1 — Reconciliação de governança** | Formalizar a equivalência Conversation Hub / Communication Hub em `DOMAIN_OWNERSHIP_MATRIX.md`; decidir nome definitivo. | Pendente, ver ADR-CV-001. |
| **Fase 2 — Núcleo já Official** | Communication Manager, Conversation Manager, Message Manager, Delivery Manager — já roteirizados em `COMMUNICATION_HUB.md`, Capítulo 19. | Reaproveitado integralmente, sem mudança. |
| **Fase 3 — Organização de atendimento** | Queue, Department, Distribuição Automática. | Depende do núcleo (Fase 2) já maduro. |
| **Fase 4 — SLA e Etiquetas** | SLAPolicy, ConversationLabel. | Depende de Queue/Department (Fase 3). |
| **Fase 5 — Produtividade do atendente** | QuickReply, AttendanceSession, resolução de identidade via ChannelHandle. | — |
| **Fase 6 — Bots e Fluxos Conversacionais** | Bot, ConversationalFlow, primeiro canal com Bot ativo (Web Chat, por menor complexidade de integração). | Depende de AI Hub para geração assistida além do determinístico puro. |
| **Fase 7 — Cobertura completa de canais** | Instagram Direct, Facebook Messenger, Telegram, SMS, APIs adicionais — cada um como novo Connector do Integration Hub. | WhatsApp e e-mail já cobertos como exemplo em `COMMUNICATION_HUB.md`, Capítulo 18. |
| **Fase 8 — IA aplicada ao atendimento** | Capacidades do Capítulo 27, sempre com Aprovação/supervisão humana. | — |

---

## 38. Regras Arquiteturais

**ADR-CV-001 — Conversation Hub e Communication Hub são o mesmo Bounded Context; a reconciliação de nome é pendente.** Contexto: `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` introduziu "Conversation Hub"; `COMMUNICATION_DOMAIN_BLUEPRINT.md`/`COMMUNICATION_HUB.md`, já Official, usam "Communication Hub" para o mesmo domínio. Nenhum documento Official é renomeado por este Blueprint.

**ADR-CV-002 — Nenhuma Entidade já definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md` é redefinida aqui.** Conversation, Message, Channel, Delivery, Template, Attachment, Inbox, Broadcast, Assignment, Status permanecem exatamente como já Official. Contexto: preservar Single Source of Truth (`DOCUMENTATION_CONSTITUTION.md`, §3, Princípio 1).

**ADR-CV-003 — `ConversationalFlow` nunca substitui `Workflow` do Automation Engine.** Um Fluxo Conversacional decide o conteúdo da próxima resposta dentro de uma `Conversation`; qualquer efeito fora dela é delegado por Evento. Contexto: preservar Domain Ownership do Automation Engine (`DOMAIN_OWNERSHIP_MATRIX.md`, linha "Workflow | Automation Engine").

**ADR-CV-004 — `ConversationLabel` é distinto de `Tag` (CRM Hub) e de `ContentTag` (Content Hub).** Contexto: mesma disciplina de nomenclatura já registrada em `CONTENT_HUB_ARCHITECTURE.md`, ADR-CH-005.

**ADR-CV-005 — Um Bot nunca cria Lead, processa pagamento ou decide Campanha diretamente.** Toda ação de negócio fora da própria conversa é publicada como Evento para o Hub proprietário decidir. Contexto: aplicação direta do princípio já estabelecido para o Content Hub em `CONTENT_HUB_ARCHITECTURE.md`, ADR-CH-001, estendido ao Conversation Hub.

**ADR-CV-006 — `ChannelHandle` nunca duplica `Contact`.** Ele referencia um `Participant`/`Contact` por identificador — a resolução de identidade formal continua exclusiva do CRM Hub. Contexto: preservar `DOMAIN_OWNERSHIP_MATRIX.md`, linha "Contact | CRM Hub".

**ADR-CV-007 — `SLAExceeded` nunca reatribui `Conversation` diretamente.** Qualquer escalonamento decorrente é delegado ao Automation Engine. Contexto: preservar a fronteira já estabelecida no Capítulo 23; evitar que o SLA Manager acumule autoridade de execução que pertence ao Automation Engine.

**ADR-CV-008 — Toda Entidade nova deste documento é isolada por Tenant, sem exceção.** Contexto: aplicação direta de `SAAS_ARCHITECTURE.md`, Capítulo 6.

**ADR-CV-009 — Este documento não altera `COMMUNICATION_DOMAIN_BLUEPRINT.md`, `COMMUNICATION_HUB.md` ou `DOMAIN_OWNERSHIP_MATRIX.md`.** A incorporação formal das Entidades e Eventos novos é um item de governança pendente, sujeito a Change Request. Contexto: preservar o processo de Change Management de `DOCUMENTATION_CONSTITUTION.md`, §10, mesmo princípio já registrado em `CONTENT_HUB_ARCHITECTURE.md`, ADR-CH-009.

---

## Conclusão

Este documento define o Conversation Hub da Adaptive Business Platform como extensão formal e explícita do já Official Communication Hub — nove Entidades novas (Queue, Department, SLAPolicy, ConversationLabel, QuickReply, Bot, ConversationalFlow, AttendanceSession, ChannelHandle), dezenove Eventos catalogados (quinze já existentes, referenciados, e mais novos), e uma fronteira cuidadosamente traçada contra o Automation Engine para que Bot e Fluxo Conversacional nunca dupliquem Workflow.

A decisão mais importante registrada aqui não é uma nova Entidade — é a recusa deliberada de reescrever o que já existe. Onde `COMMUNICATION_DOMAIN_BLUEPRINT.md` e `COMMUNICATION_HUB.md` já respondem "o que é uma Conversation" e "como ela é entregue", este documento não compete com essas respostas — ele assume que estão corretas, já são Official, e constrói a organização operacional (Filas, Departamentos, SLA), a produtividade do atendente (Mensagens Rápidas, Sessões) e a automação conversacional (Bots, Fluxos) que a plataforma ainda não tinha, sempre convergindo, como toda conversa deve, para a mesma Timeline única do CRM Hub.

Dois itens de governança permanecem pendentes, explicitamente registrados: a reconciliação formal de nome entre Conversation Hub e Communication Hub (ADR-CV-001), e a incorporação das nove Entidades e dos Eventos novos aos documentos Official já existentes (ADR-CV-009). Nenhum dos dois é resolvido por este documento isoladamente — cada um exige seu próprio processo de Review e Approval, conforme `DOCUMENTATION_CONSTITUTION.md`, §13 e §14.
