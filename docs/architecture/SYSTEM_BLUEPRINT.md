# System Blueprint — Mapa Oficial da Arquitetura

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento é o mapa oficial da Adaptive Business Platform. Ele não substitui `PLATFORM_MANIFESTO.md`, que define missão, princípios e filosofia, nem `AI_HUB.md`, que define em profundidade o subsistema de inteligência artificial. Ele complementa os dois: onde o Manifesto explica por que a plataforma existe e o AI Hub explica como a inteligência artificial funciona por dentro, o Blueprint mostra como tudo se encaixa — camadas, Hubs, fluxos, eventos e limites de comunicação.

Nenhum conceito já definido nos dois documentos anteriores é reexplicado aqui em profundidade. Este documento assume que o leitor já conhece a missão, os princípios e a estrutura interna do AI Hub, e foca exclusivamente em posicionamento estrutural e relações entre componentes. Onde um conceito do Manifesto ou do AI Hub é relevante para entender uma conexão específica, ele é citado por referência, nunca reexplicado.

O objetivo é que um desenvolvedor novo na plataforma, ao ler este documento, compreenda em poucos minutos: em que camada cada Hub vive, quem se comunica com quem, como um evento se propaga, como uma requisição atravessa o sistema do início ao fim, e onde qualquer nova capacidade deve se encaixar. Todo novo Hub, todo novo módulo e toda nova integração devem respeitar o mapa descrito aqui — e qualquer proposta de arquitetura que não encontre lugar neste mapa deve ser revisada antes de ser aceita, não o mapa distorcido para acomodá-la.

A forma de leitura recomendada não é sequencial e exaustiva, mas de consulta. Um desenvolvedor implementando uma capacidade de CRM consulta o Capítulo 6 para entender o fluxo daquela área e o Capítulo 8 para saber com quem seu Hub pode e não pode se comunicar. Um desenvolvedor investigando um incidente de produção consulta o Capítulo 13 para entender onde encontrar o rastro daquela falha. Um arquiteto avaliando uma proposta de novo Hub consulta o Capítulo 3 para decidir em que camada ele deveria viver, e o Capítulo 4 para entender a que outros Hubs ele precisará se conectar. Este documento é, antes de tudo, uma ferramenta de trabalho diário, não uma leitura única de integração.

---

## 2. Visão Geral da Plataforma

```
                          ADAPTIVE BUSINESS PLATFORM
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
 PRESENTATION LAYER          APPLICATION LAYER              DOMAIN LAYER
 (Web · Mobile · API         (Orquestração de casos         (Regras de negócio
  pública · Dashboards)       de uso · Controllers ·         de cada Hub —
                               Session Handling)              CRM, Finance,
                                                                Growth, etc.)
        │                             │                             │
        └─────────────────────────────┼─────────────────────────────┘
                                      ▼
                                AI LAYER
                        (AI Hub — cérebro central,
                         única via de acesso a IA)
                                      │
                                      ▼
                          INTEGRATION LAYER
                (Integration Hub · Connectors · Webhooks ·
                 único ponto de saída para o mundo externo)
                                      │
                                      ▼
                         INFRASTRUCTURE LAYER
              (Event Bus · Filas · Workers · Cache ·
               Observabilidade · Health Checks)
                                      │
                                      ▼
                              DATA LAYER
                  (Persistência isolada por Empresa/Tenant,
                   backups, política de retenção)
                                      │
                                      ▼
                          EXTERNAL SERVICES
        (OpenAI · Claude · Gemini · DeepSeek · Ollama ·
         WhatsApp · Google · Meta · Pinterest · Provedores
         de pagamento · Provedores de e-mail · Nuvem)
```

Duas observações estruturais atravessam este diagrama e se repetem em todo o restante do documento.

Primeiro: nenhuma camada acessa uma camada abaixo dela pulando as intermediárias. A Presentation Layer nunca fala diretamente com a Infrastructure Layer; a Domain Layer nunca fala diretamente com External Services. Toda travessia de camada obedece à ordem descrita acima, sem atalho — e um atalho identificado em qualquer parte da plataforma é tratado como um defeito arquitetural a ser corrigido, não como uma otimização a ser tolerada.

Segundo: a Security Layer, descrita em detalhe no Capítulo 12, não aparece como uma caixa nesta cadeia porque ela não é uma etapa sequencial adicional — é uma camada transversal, presente em toda comunicação entre todas as demais, do primeiro clique do usuário até a chamada final a um serviço externo. Tratá-la como uma etapa isolada, aplicada apenas em um ponto do fluxo, seria o mesmo erro estrutural que motivou toda a disciplina de segurança descrita no AI Hub — segurança adicionada ao final é sempre mais fraca do que segurança presente desde o início.

---

## 3. Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                                │
│  Dashboards · Web App · Mobile · API pública                     │
├─────────────────────────────────────────────────────────────────┤
│ APPLICATION LAYER                                                 │
│  Orquestração de casos de uso · Controllers · Session Handling   │
├─────────────────────────────────────────────────────────────────┤
│ DOMAIN LAYER                                                      │
│  CRM Hub · Finance Hub · Growth Hub · Communication Hub ·         │
│  Automation Hub · Branding Hub · Knowledge Hub ·                  │
│  Business Profile Engine                                          │
├─────────────────────────────────────────────────────────────────┤
│ AI LAYER                                                          │
│  AI Hub (único ponto de acesso a inteligência artificial)         │
├─────────────────────────────────────────────────────────────────┤
│ INTEGRATION LAYER                                                 │
│  Integration Hub · Connectors · Webhooks                          │
├─────────────────────────────────────────────────────────────────┤
│ INFRASTRUCTURE LAYER                                              │
│  Event Bus · Queues · Cache · Workers · Observability             │
├─────────────────────────────────────────────────────────────────┤
│ DATA LAYER                                                        │
│  Persistência isolada por Tenant · Backups · Retenção              │
├─────────────────────────────────────────────────────────────────┤
│ SECURITY LAYER (transversal a todas as camadas acima)             │
│  Identity Hub · Autenticação · Autorização · Auditoria · LGPD      │
└─────────────────────────────────────────────────────────────────┘
```

Cada camada tem uma regra de acesso única, que não admite exceção, e um exemplo concreto do que a violaria.

A Presentation Layer nunca contém lógica de negócio — apenas apresenta o que a Application Layer fornece e envia de volta a intenção do usuário. Violação típica: um componente de dashboard que decide, sozinho, se um Lead deve mudar de estágio no funil — essa decisão pertence ao CRM Hub, na Domain Layer, e o dashboard deveria apenas solicitar essa mudança e exibir o resultado.

A Application Layer traduz uma intenção de usuário em um ou mais casos de uso, orquestrando chamadas à Domain Layer, mas nunca implementando regra de negócio ela mesma. Violação típica: um Controller que calcula, diretamente, se uma fatura está vencida — esse cálculo pertence ao Finance Hub.

A Domain Layer é onde cada Hub de negócio vive — CRM, Finance, Growth, Communication, Automation, Branding, Knowledge, Business Profile Engine — cada um com sua própria regra, isolado dos demais por comunicação orientada a evento, conforme detalhado no Capítulo 8. Violação típica: o CRM Hub lendo, diretamente, uma tabela de dados que pertence ao Finance Hub, em vez de consumir o evento `PaymentReceived` que o Finance Hub já publica para esse propósito.

A AI Layer é ocupada inteiramente pelo AI Hub. Nenhum outro componente vive nesta camada, e nenhum Hub da Domain Layer acessa um provedor de inteligência artificial sem atravessar esta camada primeiro — regra já estabelecida em `AI_HUB.md` e aqui apenas posicionada estruturalmente. Violação típica: qualquer Hub de domínio importando um SDK de um provedor de IA diretamente, em vez de solicitar a capacidade ao AI Hub.

A Integration Layer é o único ponto de saída da plataforma para qualquer sistema externo. Nenhum Hub de domínio possui sua própria integração direta com um sistema de terceiro. Violação típica: o Growth Hub chamando a API do Google Ads diretamente, em vez de solicitar essa chamada através de um Connector do Integration Hub.

A Infrastructure Layer sustenta a comunicação assíncrona e a observabilidade de toda a plataforma, sem conter nenhuma regra de negócio. Violação típica: uma fila de mensagens que decide, sozinha, se uma automação deve ou não ser executada — essa decisão pertence ao Automation Hub; a fila apenas entrega a mensagem de forma confiável.

A Data Layer garante persistência isolada por Tenant, detalhada no Capítulo 10. Violação típica: uma consulta que retorna dado de múltiplos Tenants sem filtro explícito de isolamento — tratada, nesta arquitetura, como incidente de segurança grave, não como bug comum.

A Security Layer, transversal, é atravessada por toda requisição, em toda camada, sem exceção — detalhada no Capítulo 12. Violação típica: um endpoint interno que assume que já foi autenticado por uma camada anterior, sem verificar essa autenticação ele mesmo — a Security Layer nunca é "assumida", ela é sempre verificada no ponto de uso.

---

## 4. Mapa Geral dos Hubs

```
                              ┌───────────────┐
                              │  Identity Hub │
                              │ (autenticação, │
                              │  papéis,       │
                              │  permissões)   │
                              └───────┬───────┘
                                      │ valida acesso de todos
        ┌─────────────┬─────────────┬┴────────────┬─────────────┬─────────────┐
        ▼             ▼             ▼             ▼             ▼             ▼
   ┌─────────┐  ┌───────────┐ ┌──────────┐ ┌───────────┐  ┌──────────┐ ┌───────────┐
   │ CRM Hub │  │Finance Hub│ │Growth Hub│ │Automation │  │Communica-│ │Branding   │
   │         │  │           │ │          │ │Hub        │  │tion Hub  │ │Hub        │
   └────┬────┘  └─────┬─────┘ └────┬─────┘ └─────┬─────┘  └────┬─────┘ └─────┬─────┘
        │             │            │             │             │             │
        └─────────────┴─────┬──────┴─────────────┴──────┬──────┴─────────────┘
                             │                            │
                             ▼                            ▼
                      ┌─────────────┐            ┌─────────────────┐
                      │   AI Hub    │◄──────────►│ Business Profile │
                      │  (cérebro)  │            │     Engine        │
                      └──────┬──────┘            └─────────────────┘
                             │
                      ┌──────┴──────┐
                      ▼             ▼
              ┌─────────────┐ ┌──────────┐
              │Knowledge Hub│ │Analytics │
              │             │ │   Hub    │
              └─────────────┘ └──────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Integration Hub │
                    │ (única saída)   │
                    └────────┬────────┘
                             ▼
                      Mundo Externo
```

Todo Hub de domínio se conecta ao AI Hub quando precisa de inteligência, ao Identity Hub quando precisa validar acesso, ao Integration Hub quando precisa alcançar um sistema externo, e ao Analytics Hub quando produz dado relevante para medição. Nenhum Hub de domínio se conecta diretamente a outro Hub de domínio — essa regra é detalhada no Capítulo 8 e é a espinha dorsal de todo o desacoplamento da plataforma.

A tabela abaixo resume, para cada Hub, sua responsabilidade central em uma frase e seus dois consumidores mais frequentes — não uma lista exaustiva de toda integração possível, mas o padrão de uso dominante de cada um.

| Hub | Responsabilidade central | Consumidores frequentes |
|---|---|---|
| Identity Hub | Autenticar e autorizar todo acesso à plataforma | Todos os demais Hubs |
| AI Hub | Centralizar toda capacidade de inteligência artificial | Todos os Hubs de domínio |
| CRM Hub | Gerir o relacionamento com Leads e Clientes | Communication Hub, Analytics Hub |
| Finance Hub | Gerir saúde financeira e transações | CRM Hub, Analytics Hub |
| Growth Hub | Gerir aquisição, conteúdo e conversão | AI Hub, Branding Hub, Analytics Hub |
| Automation Hub | Executar fluxos condicionais entre eventos | Praticamente todos, via Event Bus |
| Communication Hub | Gerir canais de conversa com o cliente | AI Hub, Integration Hub, CRM Hub |
| Branding Hub | Gerir identidade visual e de tom da empresa | AI Hub, Growth Hub, Presentation Layer |
| Business Profile Engine | Entender o segmento e o perfil da empresa | Todos os Hubs de domínio |
| Knowledge Hub | Organizar conhecimento acumulado da empresa | AI Hub |
| Analytics Hub | Consolidar dado em indicadores de negócio | Presentation Layer (dashboards) |
| Integration Hub | Prover a única saída para sistemas externos | Growth Hub, Communication Hub, Finance Hub |

---

## 5. Fluxo Global da Plataforma

```
Usuário
   │
   ▼
Frontend (Presentation Layer)
   │  intenção do usuário
   ▼
Hub de Domínio (ex.: CRM Hub)
   │  identifica necessidade de inteligência
   ▼
AI Hub
   │  compõe contexto, prompt e memória
   ▼
Provider (OpenAI · Claude · Gemini · outro)
   │  processa e retorna
   ▼
AI Hub
   │  valida, registra, retorna
   ▼
Hub de Domínio
   │  aplica resultado ao caso de uso
   ▼
Resposta
   │
   ▼
Frontend
   │
   ▼
Usuário
   │
   ▼ (em paralelo, a cada etapa acima)
Analytics Hub ◄── Logs ◄── Observability (Infrastructure Layer)
   │
   ▼
Dashboard
```

Este é o fluxo padrão de qualquer interação iniciada por um usuário que envolva inteligência artificial. Interações que não envolvem IA seguem o mesmo esqueleto, apenas sem passar pela etapa do AI Hub e do Provider — Usuário → Frontend → Hub de Domínio → Resposta → Frontend → Usuário, com Analytics e Logs capturando o mesmo evento em paralelo, sempre.

Existe ainda um segundo fluxo global, de origem diferente: o fluxo iniciado por um sistema externo, não por um usuário interagindo com o Frontend.

```
Sistema Externo (ex.: WhatsApp, Google, Meta)
   │
   ▼
Integration Hub
   │  recebe e valida o webhook/evento externo
   ▼
Hub de Domínio correspondente (ex.: Communication Hub)
   │  processa a notificação recebida
   ▼
Event Bus
   │  publica um evento interno (ex.: MessageReceived)
   ▼
Consumidores do evento (AI Hub, Automation Hub, CRM Hub, conforme aplicável)
   │
   ▼
Ação resultante (resposta automática, atualização de estágio, alerta)
   │
   ▼ (em paralelo)
Analytics Hub ◄── Logs
```

Os dois fluxos globais compartilham a mesma regra de fundo: toda entrada na plataforma, seja de um usuário através do Frontend, seja de um sistema externo através do Integration Hub, atravessa a Security Layer, é processada por um Hub de domínio específico, pode envolver o AI Hub quando exige inteligência, e produz dado observável capturado pelo Analytics Hub — sem exceção, independentemente de onde a interação começou.

---

## 6. Fluxos por Área

Cada Hub de domínio segue o mesmo esqueleto de fluxo global do Capítulo 5, adaptado ao seu próprio vocabulário. Os diagramas abaixo mostram a especialização de cada área, sem repetir a explicação de componentes já descritos.

**CRM**

```
Lead capturado → CRM Hub → Business Profile Engine (contexto do segmento)
   → AI Hub (sugestão de resposta) → Provider → Resposta sugerida
   → Atendente decide → CRM Hub atualiza estágio → evento LeadCreated
   ou LeadConverted → Analytics Hub
```

O ponto arquitetural relevante aqui é que o CRM Hub nunca decide, sozinho, o conteúdo de uma resposta a um Lead — ele solicita a sugestão ao AI Hub, que já traz consigo o contexto do Business Profile, e a decisão final de enviar permanece com o atendente humano, salvo em fluxos de automação explicitamente aprovados.

**Marketing (Growth Hub)**

```
Ideia de campanha → Growth Hub → Branding Hub (identidade)
   → AI Hub (geração de conteúdo/criativo) → Provider → Conteúdo gerado
   → Aprovação humana → Integration Hub → Canal externo (Ads/Social/E-mail)
   → evento CampaignPublished → Resultado → Analytics Hub
```

A etapa de Aprovação humana antes do Integration Hub não é opcional em nenhum fluxo que envolva gasto real de mídia paga — regra já fixada no Manifesto e reforçada aqui como restrição estrutural do próprio fluxo, não apenas como recomendação de processo.

**Financeiro (Finance Hub)**

```
Transação registrada → Finance Hub → AI Hub (análise/anomalia)
   → Provider → Insight gerado → Finance Hub → Alerta ou Relatório
   → evento PaymentReceived (quando aplicável) → Analytics Hub
```

O Finance Hub é o único, entre os Hubs de domínio, cuja saída de eventos alimenta diretamente decisões do CRM Hub — uma mudança de status de pagamento frequentemente determina uma mudança de status de cliente, e essa dependência é resolvida via evento, nunca via chamada direta entre os dois Hubs.

**Automação (Automation Hub)**

```
Evento de gatilho (qualquer evento do Event Bus) → Automation Hub
   → Regra determinística disponível?
        Sim → Ação executada diretamente
        Não → AI Hub (decisão assistida) → Provider → Recomendação
              → Aprovação (se de alto impacto) → Ação executada
   → evento AutomationExecuted → Analytics Hub
```

O Automation Hub é o consumidor de eventos mais promíscuo da plataforma por natureza — sua função central é reagir a qualquer evento relevante publicado por qualquer outro Hub, o que o torna, ao mesmo tempo, o Hub mais valioso para orquestração e o que exige a disciplina mais rígida de não se transformar, silenciosamente, em um ponto de acoplamento entre Hubs que deveriam permanecer independentes.

**Comunicação (Communication Hub)**

```
Mensagem recebida (canal externo) → Integration Hub → Communication Hub
   → AI Hub (sugestão/resposta) → Provider → Resposta composta
   → Branding Hub (tom aplicado) → Envio → Integration Hub → Canal externo
   → evento MessageReceived já publicado no recebimento
```

Toda resposta composta pela IA em nome da empresa passa pelo Branding Hub antes do envio — este é o ponto exato do fluxo onde a identidade de marca, descrita no Capítulo 14 do `AI_HUB.md`, é aplicada ao texto final, não apenas à aparência visual da interface.

**Business Profile**

```
Dados iniciais da empresa → Business Profile Engine → Classificação de segmento
   → Perfil gerado → evento ProfileChanged publicado ao Event Bus
   → Cada Hub de domínio consome o evento e adapta seu próprio
     comportamento (dashboards, sugestões, indicadores)
```

O Business Profile Engine nunca instrui outro Hub sobre como se adaptar — ele apenas publica o que aprendeu sobre a empresa, e cada Hub decide, com autonomia, como usar essa informação. Essa é a mesma disciplina de baixo acoplamento aplicada à camada de personalização.

**Branding**

```
Logo enviada → Branding Hub → Extração de identidade (cor, tom, tipografia)
   → Identidade aplicada → evento BrandUpdated →
     Presentation Layer, AI Hub, Growth Hub e Communication Hub
     consomem a nova identidade de forma independente
```

Uma mudança de logo em produção não exige nenhuma intervenção manual em nenhum dos quatro consumidores listados — todos reagem ao mesmo evento, no momento em que ele é publicado, cada um aplicando a nova identidade à sua própria superfície.

**Conhecimento (Knowledge Hub)**

```
Documento enviado/gerado → Knowledge Hub → Indexação
   → evento KnowledgeUpdated → AI Hub passa a poder consultar
     este novo conhecimento em solicitações futuras
```

Entre a publicação do evento `KnowledgeUpdated` e a disponibilidade efetiva desse conhecimento em uma resposta gerada, não existe nenhuma etapa manual — o Knowledge Connector do AI Hub, descrito em `AI_HUB.md`, consulta o Knowledge Hub de forma automática a cada solicitação relevante.

**Analytics**

```
Todo Hub de domínio → emite eventos e logs → Infrastructure Layer
   → Analytics Hub → Processamento e agregação → Dashboard
   → Insight → (opcional) AI Hub interpreta e recomenda ação
```

O Analytics Hub é o único Hub cuja função central é exclusivamente de leitura — ele nunca publica um evento que altere o estado de outro Hub, apenas consome o que já foi publicado e o transforma em indicador consultável.

---

## 7. Eventos — Event Map

Toda comunicação entre Hubs de domínio, salvo o acesso direto e obrigatório ao AI Hub, ao Identity Hub e ao Integration Hub já descritos, acontece através de eventos publicados no Event Bus da Infrastructure Layer. Nenhum Hub assina um evento diretamente de outro Hub — todos publicam e consomem através do mesmo barramento central.

```
                    Publicador                Event Bus                Consumidor(es)
                        │                         │                         │
                        ▼                         ▼                         ▼
                  Hub de Domínio ───publica───► [ Evento ] ───entrega───► Hub(s) inscritos
                        │                         │                         │
                        └── não conhece quem ──────┴── não modifica ─────────┘
                            consumirá o evento         o conteúdo do evento
```

```
                         EVENT BUS (Infrastructure Layer)
   ┌───────────────────────────────────────────────────────────────┐
   │  LeadCreated · LeadConverted · CampaignPublished ·             │
   │  PaymentReceived · InvoiceOverdue · MessageReceived ·          │
   │  BrandUpdated · ProfileChanged · KnowledgeUpdated ·            │
   │  AutomationExecuted · AIResponseGenerated · UserInvited ·      │
   │  TenantProvisioned · ReportGenerated                           │
   └───────────────────────────────────────────────────────────────┘
```

| Evento | Origem | Consumidores típicos |
|---|---|---|
| `LeadCreated` | CRM Hub | Automation Hub, Analytics Hub, Communication Hub |
| `LeadConverted` | CRM Hub | Finance Hub, Analytics Hub |
| `CampaignPublished` | Growth Hub | Analytics Hub, Finance Hub (custo), Automation Hub |
| `PaymentReceived` | Finance Hub | CRM Hub (status de cliente), Analytics Hub |
| `InvoiceOverdue` | Finance Hub | CRM Hub, Automation Hub (cobrança) |
| `MessageReceived` | Communication Hub (via Integration Hub) | CRM Hub, AI Hub, Automation Hub |
| `BrandUpdated` | Branding Hub | AI Hub, Growth Hub, Communication Hub, Presentation Layer |
| `ProfileChanged` | Business Profile Engine | Todos os Hubs de domínio |
| `KnowledgeUpdated` | Knowledge Hub | AI Hub |
| `AutomationExecuted` | Automation Hub | Analytics Hub, Hub de domínio afetado |
| `AIResponseGenerated` | AI Hub | Analytics Hub, Hub de domínio solicitante |
| `UserInvited` | Identity Hub | Communication Hub (envio de convite), Analytics Hub |
| `TenantProvisioned` | Identity Hub | Business Profile Engine, Branding Hub |
| `ReportGenerated` | Analytics Hub | Communication Hub (quando o relatório deve ser enviado) |

Cada evento carrega, no mínimo, o identificador do Tenant de origem, o timestamp, e o payload relevante ao seu tipo. Nenhum evento cruza a fronteira de isolamento entre Tenants descrita no Capítulo 11 — um evento publicado por uma empresa nunca é entregue a um consumidor processando em nome de outra empresa, mesmo quando o mesmo tipo de evento é relevante para múltiplas empresas simultaneamente.

Um evento publicado sem nenhum consumidor inscrito no momento não é um erro — o Event Bus não exige que todo evento tenha consumidor imediato, precisamente para permitir que novos Hubs, adicionados no futuro, comecem a consumir eventos que já existiam antes de sua própria criação, sem exigir nenhuma alteração no Hub que os publica.

---

## 8. Comunicação entre Hubs

```
                     ┌─────────────────────────────┐
                     │   REGRAS DE COMUNICAÇÃO     │
                     └─────────────────────────────┘

  Hub de Domínio ──chama diretamente──► AI Hub          (permitido, obrigatório)
  Hub de Domínio ──chama diretamente──► Identity Hub     (permitido, obrigatório)
  Hub de Domínio ──chama diretamente──► Integration Hub  (permitido, obrigatório)
  Hub de Domínio ──publica evento────► Event Bus         (permitido, padrão)
  Hub de Domínio ──consome evento────► Event Bus         (permitido, padrão)

  Hub de Domínio ──chama diretamente──► Hub de Domínio   (PROIBIDO)
  Hub de Domínio ──chama diretamente──► Provider externo (PROIBIDO)
  Hub de Domínio ──acessa dado de────► outro Tenant       (PROIBIDO)
```

CRM Hub, Finance Hub, Growth Hub, Automation Hub, Communication Hub, Branding Hub e Knowledge Hub nunca se chamam entre si diretamente. Quando o CRM Hub precisa reagir a uma campanha publicada pelo Growth Hub, ele não chama o Growth Hub — ele consome o evento `CampaignPublished` do Event Bus, no seu próprio tempo, sem depender da disponibilidade imediata do Growth Hub.

O AI Hub, o Identity Hub e o Integration Hub são exceções deliberadas a essa regra, porque são serviços transversais consumidos de forma síncrona por qualquer Hub de domínio — inteligência, autenticação e acesso externo não fazem sentido como eventos assíncronos na maioria dos casos de uso, e por isso são expostos como chamada direta controlada, nunca como acoplamento entre dois Hubs de domínio.

O Business Profile Engine e o Branding Hub ocupam uma posição intermediária: são consumidos tanto via chamada direta, quando um Hub precisa de contexto imediato para uma decisão em andamento, quanto via evento, quando uma mudança de perfil ou de identidade precisa ser propagada a todos os interessados de uma vez — `ProfileChanged` e `BrandUpdated`, respectivamente.

O Analytics Hub nunca é chamado diretamente por nenhum Hub de domínio para fornecer dado a uma decisão em tempo real — ele exclusivamente consome eventos e logs, de forma assíncrona, e expõe seu próprio resultado através de dashboards e, quando necessário, através de consulta explícita da Application Layer.

A tabela abaixo resume o padrão de comunicação de cada Hub em três colunas: o que ele chama diretamente, o que ele publica, e o que ele consome.

| Hub | Chama diretamente | Publica (eventos) | Consome (eventos) |
|---|---|---|---|
| CRM Hub | AI Hub, Identity Hub | `LeadCreated`, `LeadConverted` | `PaymentReceived`, `MessageReceived` |
| Finance Hub | AI Hub, Identity Hub | `PaymentReceived`, `InvoiceOverdue` | `LeadConverted`, `CampaignPublished` |
| Growth Hub | AI Hub, Branding Hub, Integration Hub | `CampaignPublished` | `ProfileChanged`, `BrandUpdated` |
| Automation Hub | AI Hub | `AutomationExecuted` | praticamente todos os demais |
| Communication Hub | AI Hub, Integration Hub, Branding Hub | (via Integration Hub) `MessageReceived` | `LeadCreated`, `InvoiceOverdue` |
| Branding Hub | — | `BrandUpdated` | `TenantProvisioned` |
| Knowledge Hub | — | `KnowledgeUpdated` | — |
| Business Profile Engine | — | `ProfileChanged` | `TenantProvisioned` |
| Analytics Hub | — | `ReportGenerated` | todos (somente leitura) |
| Identity Hub | — | `UserInvited`, `TenantProvisioned` | — |
| AI Hub | Integration Hub (quando aplicável) | `AIResponseGenerated` | `KnowledgeUpdated`, `ProfileChanged`, `BrandUpdated` |
| Integration Hub | — | (repassa eventos de sistemas externos) | eventos que exigem saída externa |

---

## 9. Arquitetura da IA — Posição no Blueprint

Este capítulo não repete o conteúdo de `AI_HUB.md`. Ele mostra, apenas, onde o AI Hub se encaixa no restante da arquitetura.

```
   Hubs de Domínio (CRM, Finance, Growth, Automation,
   Communication, Branding, Knowledge, Business Profile)
                        │
                        │  única via de acesso a inteligência
                        ▼
                    ┌─────────┐
                    │ AI Hub  │
                    └────┬────┘
                         │
                         ▼
                Provider Layer
                         │
        ┌────────┬───────┼───────┬────────┐
        ▼        ▼       ▼       ▼        ▼
     OpenAI   Claude  Gemini  DeepSeek  Ollama
```

O AI Hub ocupa, sozinho, toda a AI Layer descrita no Capítulo 3. Nenhum outro componente da plataforma vive nessa camada, e nenhum Hub de domínio a atravessa sem passar pelo AI Hub. Toda a profundidade interna dessa camada — Prompt Engine, Context Manager, Memory Engine, Provider Manager, e os demais componentes — está descrita em `AI_HUB.md` e não é reproduzida aqui.

O que este Blueprint acrescenta, que o documento do AI Hub não cobre, é a posição relativa: o AI Hub recebe conexão direta de oito Hubs de domínio simultaneamente (conforme o Capítulo 4), o que o torna, depois do Identity Hub, o componente com maior grau de conectividade de toda a plataforma. Essa centralidade é deliberada — é precisamente o que permite que a inteligência artificial da plataforma se comporte como um cérebro único, consultado por todo o corpo, em vez de um conjunto de reflexos isolados implementados módulo a módulo.

---

## 10. Arquitetura SaaS

```
                          Tenant
                            │
                            ▼
                          Empresa
                    (Workspace isolado)
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
          Usuário       Usuário       Usuário
              │             │             │
              ▼             ▼             ▼
           Papel         Papel         Papel
      (Administrador,  (Marketing,   (Financeiro,
       CEO, Analista)   Editor...)    Operacional)
              │             │             │
              ▼             ▼             ▼
         Permissões    Permissões    Permissões
     (o que este papel pode ver, criar, alterar)
                            │
                            ▼
                      Dados Isolados
              (visíveis apenas dentro deste Tenant)
```

Um Tenant é a unidade máxima de isolamento da plataforma — normalmente equivalente a uma Empresa cliente, ainda que a arquitetura já preveja, no Capítulo 11, cenários de Tenant compartilhado entre múltiplas unidades de uma mesma marca. Dentro de um Tenant, múltiplos Usuários operam sob Papéis distintos, cada Papel carregando um conjunto de Permissões que determina exatamente o que aquele usuário pode ver e fazer.

A distinção entre Papel e Permissão é deliberada e não deve ser colapsada em uma única entidade: um Papel é um agrupamento nomeado e reutilizável — Administrador, CEO, Marketing, Financeiro, Analista, Editor — enquanto uma Permissão é a unidade atômica de autorização — ler Leads, criar Campanha, aprovar gasto de mídia, exportar relatório financeiro. Um Papel é a composição de múltiplas Permissões, e essa composição pode ser ajustada por Tenant sem exigir a criação de um novo tipo de Papel a cada pequena variação de acesso necessária.

Todo dado — de CRM, de Finance, de Knowledge, de memória de IA — está associado a exatamente um Tenant, e nenhuma consulta, de nenhum Hub, retorna dado de um Tenant diferente do que está autenticado na requisição corrente. Essa associação é resolvida uma única vez, no momento da autenticação pelo Identity Hub, e propagada, de forma obrigatória e não removível, a toda chamada subsequente dentro do ciclo de vida daquela requisição.

---

## 11. Arquitetura Multiempresa

```
                    ┌─────────────────────────────┐
                    │        Event Bus             │
                    │  (compartilhado fisicamente, │
                    │   segregado logicamente)      │
                    └──────────┬──────────┬────────┘
                               │          │
              ┌────────────────┘          └────────────────┐
              ▼                                             ▼
      ┌───────────────┐                             ┌───────────────┐
      │  Tenant A      │                             │  Tenant B      │
      │                │                             │                │
      │  CRM Hub  ─────┼── contexto A ──► AI Hub      │  CRM Hub  ─────┼── contexto B ──► AI Hub
      │  Knowledge ────┼── conhecimento A             │  Knowledge ────┼── conhecimento B
      │  Branding ─────┼── identidade A               │  Branding ─────┼── identidade B
      │  Dados ────────┼── isolados ───► Data Layer A  │  Dados ────────┼── isolados ───► Data Layer B
      └───────────────┘                             └───────────────┘

      Nenhuma seta cruza de um Tenant para o outro, em nenhuma camada.
```

O isolamento multiempresa é lógico, não necessariamente físico — múltiplos Tenants podem compartilhar a mesma infraestrutura de computação, o mesmo Event Bus, os mesmos provedores de IA — mas nenhum dado, contexto, memória ou conhecimento de um Tenant é acessível a partir de outro, em nenhuma circunstância. A IA de cada empresa é isolada: memória e contexto compostos para o Tenant A nunca informam uma resposta gerada para o Tenant B, conforme já detalhado em `AI_HUB.md`. O Knowledge de cada empresa é isolado: documentos e conhecimento indexados para um Tenant não são consultáveis por outro. O Branding de cada empresa é isolado: a identidade visual e de tom de uma empresa nunca vaza para o conteúdo gerado em nome de outra.

Esse isolamento é aplicado no ponto de entrada de toda requisição — o identificador de Tenant é resolvido pelo Identity Hub antes de qualquer outro processamento, e propagado, de forma obrigatória, a cada chamada subsequente dentro daquela requisição.

Um caso particular, já antecipado no Manifesto, é o de uma agência operando múltiplos Tenants em nome de diferentes empresas-cliente, ou de uma franquia com uma Empresa-mãe consolidando dado de múltiplas unidades. Nesses cenários, o isolamento entre os Tenants operacionais permanece absoluto exatamente como descrito acima — o que muda é a existência de um papel de acesso consolidado, concedido explicitamente pelo Identity Hub, que permite a um único usuário visualizar indicadores agregados de múltiplos Tenants através do Analytics Hub, sem que isso implique, em nenhum momento, acesso direto ao dado operacional de cada Tenant individualmente fora dessa visão consolidada e explicitamente autorizada.

---

## 12. Segurança

```
Requisição
   │
   ▼
Autenticação (Identity Hub)
   │  quem é este usuário?
   ▼
Autorização (Identity Hub + Policy Engine do AI Hub, quando aplicável)
   │  o que este usuário/papel pode fazer?
   ▼
Permissões (por módulo, por ação, por dado)
   │  esta ação específica é permitida?
   ▼
Segregação entre Módulos
   │  este Hub só acessa o que lhe é permitido acessar
   ▼
Execução da Ação
   │
   ▼
Auditoria (registro imutável da ação executada)
   │
   ▼
Conformidade LGPD (finalidade, consentimento, direito de exclusão)
```

Autenticação confirma identidade: quem está por trás desta requisição, verificado por credencial válida. Autorização confirma escopo de atuação dentro daquela identidade: este usuário, autenticado, tem permissão de operar dentro deste Tenant e sob este Papel. Permissões aplicam o detalhe fino de o que uma ação específica pode ou não fazer: este Papel especificamente pode aprovar gasto de mídia, mas não pode exportar dado financeiro consolidado, por exemplo.

Segurança entre módulos garante que um Hub comprometido ou mal configurado não obtenha acesso a dado ou capacidade de outro Hub além do estritamente necessário — o mesmo princípio de menor privilégio aplicado entre pessoas é aplicado, nesta arquitetura, entre os próprios Hubs de domínio. Auditoria preserva um registro imutável de toda ação sensível, independente de qualquer log operacional de vida mais curta — uma alteração de permissão, uma aprovação de gasto, uma exclusão de dado, todas permanecem rastreáveis muito além do ciclo de retenção padrão de log técnico.

A conformidade com a LGPD é verificada em toda etapa que envolve dado pessoal, não apenas na etapa final de armazenamento: a finalidade da coleta é declarada no momento em que o dado entra na plataforma, o consentimento é verificado antes de qualquer processamento que dependa dele, e o direito de exclusão é honrado de forma efetiva — o que inclui, obrigatoriamente, a memória de longa duração do AI Hub, que por natureza retém dado pessoal ao longo do tempo e precisa ser passível de exclusão completa quando solicitado, exatamente como já estabelecido em `AI_HUB.md`.

Essas seis etapas não são opcionais nem contornáveis por nenhum Hub, incluindo o próprio AI Hub — a segurança descrita aqui é a mesma Security Layer transversal já introduzida no Capítulo 3, e nenhuma etapa deste fluxo pode ser pulada por conveniência de desempenho ou de prazo de entrega.

---

## 13. Observabilidade

```
                    Toda ação em qualquer Hub
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
            Logs           Tracing          Metrics
      (registro          (linha de       (latência, volume,
       estruturado do    execução        taxa de erro,
       que aconteceu)    ponta a ponta)   custo, uso)
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                       Health Checks
              (cada Hub reporta seu próprio estado)
                              │
                              ▼
                       Observability Layer
                     (Infrastructure Layer)
                              │
              ┌───────────────┼───────────────┐
              ▼                               ▼
         Dashboards                        Alertas
   (visão consolidada em            (disparados quando um
    tempo real do sistema)           limite é ultrapassado)
```

Cada um dos quatro sinais de observabilidade responde a uma pergunta diferente, e nenhum substitui os demais. Logs respondem "o que aconteceu, exatamente, neste componente, neste momento". Tracing responde "por qual caminho, através de quais componentes, esta requisição específica passou, do início ao fim". Metrics responde "como o sistema está se comportando, em agregado, ao longo do tempo". Health Checks respondem "este Hub está operacional agora, neste exato instante, ou não".

Nenhum Hub é considerado corretamente implementado se não produzir os três primeiros tipos de dado — Logs, Tracing e Metrics — de forma consistente com os demais Hubs da plataforma, usando o mesmo formato e a mesma correlação de identificador de requisição, de modo que uma investigação que começa em um Hub possa continuar, sem fricção, em qualquer outro Hub que a mesma requisição tenha atravessado.

Health Checks permitem que a Infrastructure Layer saiba, a qualquer momento, se um Hub está operacional, degradado ou indisponível — informação que alimenta tanto decisões automáticas de roteamento, como o fallback de provedor já descrito em `AI_HUB.md`, quanto alertas direcionados à equipe de operação antes que a degradação se torne visível ao cliente final. Dashboards consolidam Logs, Tracing, Metrics e Health Checks em uma visão única, consultável tanto por engenharia quanto por operação de produto, e Alertas transformam limites configurados — taxa de erro acima do esperado, latência elevada, um Hub reportando estado degradado — em notificação ativa, em vez de exigir que alguém esteja olhando um painel no momento exato em que o problema começa.

---

## 14. Escalabilidade

```
                     Requisições crescentes
                              │
                              ▼
                    Horizontal Scaling
        (múltiplas instâncias de cada Hub, sem estado
         retido localmente entre requisições)
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
           Queues          Workers           Cache
     (absorvem picos   (processam filas   (evitam reprocessamento
      sem bloquear      em paralelo,       de resultado já
      requisições        escaláveis        conhecido e estável)
      urgentes)          independentemente)
                              │
                              ▼
                         Streaming
              (respostas longas entregues de forma
               incremental, reduzindo percepção de espera)
                              │
                              ▼
                    Provider Failover
        (se um provedor de IA ou integração externa falha,
         a plataforma alterna para uma alternativa configurada)
                              │
                              ▼
                     Circuit Breaker
        (se um componente externo falha repetidamente, a
         plataforma para de tentar temporariamente, evitando
         sobrecarga em cascata sobre um sistema já instável)
```

Cada um desses mecanismos existe para uma falha específica, e a ausência de qualquer um deixa um tipo específico de falha sem proteção. Horizontal Scaling resolve volume — mais Tenants, mais usuários simultâneos, mais requisições por segundo — através de mais instâncias, nunca através de uma única instância maior, e só é viável porque nenhum Hub retém estado de sessão localmente entre uma requisição e a próxima. Queues e Workers resolvem pico — um momento de demanda muito acima da média, como uma campanha bem-sucedida gerando um volume repentino de Leads — absorvendo o excesso sem bloquear requisições urgentes que não podem esperar na mesma fila.

Cache resolve custo e latência repetida, evitando que a mesma pergunta, feita duas vezes em um curto intervalo, seja reprocessada do zero pelo AI Hub e por um provedor externo. Streaming resolve percepção de espera, entregando uma resposta longa em pedaços à medida que fica disponível, em vez de manter o usuário esperando pela resposta inteira antes de ver qualquer resultado. Provider Failover resolve indisponibilidade de um fornecedor externo específico — se a OpenAI está instável, a plataforma alterna para Claude ou Gemini, conforme a política de roteamento já descrita em `AI_HUB.md`, sem que o usuário perceba qualquer interrupção. Circuit Breaker resolve o risco de uma falha externa se propagar e degradar toda a plataforma — se um provedor ou uma integração externa falha repetidamente, a plataforma para de tentar temporariamente, protegendo tanto o sistema externo já sobrecarregado quanto os próprios recursos internos que seriam desperdiçados em tentativas repetidas de algo que já se provou indisponível.

---

## 15. Jornada Completa de um Cliente

```
Cadastro
   │
   ▼
Business Profile
   (empresa informa segmento, objetivos → Business Profile Engine
    classifica e distribui evento ProfileChanged)
   │
   ▼
Branding
   (empresa envia logo → Branding Hub extrai identidade → evento
    BrandUpdated propagado a toda a plataforma)
   │
   ▼
Primeiro acesso
   (Dashboard já adaptado ao segmento e à identidade recém-processados)
   │
   ▼
Primeira automação
   (Automation Hub sugere fluxos típicos daquele segmento, com base
    no Business Profile Engine)
   │
   ▼
Primeiro contato
   (Lead chega via CRM Hub ou Communication Hub → evento LeadCreated
    ou MessageReceived → AI Hub assiste a primeira resposta)
   │
   ▼
Primeira campanha
   (Growth Hub, com identidade de marca já aplicada, propõe e
    publica uma campanha inicial → evento CampaignPublished)
   │
   ▼
Primeiro relatório
   (Analytics Hub consolida os eventos gerados até aqui em um
    primeiro relatório de operação → evento ReportGenerated)
   │
   ▼
Evolução da IA
   (Memory Engine do AI Hub acumula contexto real de uso; cada
    interação subsequente é mais informada do que a anterior)
```

Esta jornada é a mesma descrita, em linguagem de produto, no Manifesto — o Blueprint a representa aqui em termos de Hubs e eventos, mostrando exatamente qual componente é responsável por cada etapa e qual evento marca a transição de uma etapa para a seguinte.

Vale notar a diferença de natureza entre as primeiras três etapas e as demais. Cadastro, Business Profile e Branding acontecem uma única vez, no início da relação entre a empresa e a plataforma, e seu resultado — o perfil classificado e a identidade extraída — permanece disponível a toda interação futura sem precisar ser repetido. As etapas seguintes, a partir de Primeiro acesso, são recorrentes: primeira automação, primeiro contato, primeira campanha e primeiro relatório se repetem, em variações, ao longo de toda a vida útil da empresa dentro da plataforma, cada repetição um pouco mais informada pela evolução contínua descrita na última etapa deste fluxo.

---

## 16. Roadmap Arquitetural

```
FASE 1 — Fundação
   Identity Hub · Event Bus · AI Hub (núcleo: Gateway, Provider Layer,
   Prompt Engine básico) · Data Layer isolada por Tenant.
   Sem esta fase, nenhuma fase seguinte é segura de construir — é a
   única fase em que uma falha de isolamento ou de autenticação
   comprometeria toda fase subsequente de forma silenciosa.

FASE 2 — Domínio Essencial
   CRM Hub · Communication Hub · Business Profile Engine · Branding Hub.
   Primeira jornada de cliente completa (Capítulo 15) torna-se possível
   nesta fase, ainda que de forma simplificada — o objetivo desta fase
   é validar o fluxo `Cadastro → Business Profile → Branding →
   Primeiro contato` de ponta a ponta, antes de adicionar qualquer
   capacidade de crescimento ou automação.

FASE 3 — Crescimento e Automação
   Growth Hub · Automation Hub · Knowledge Hub · Integration Hub maduro
   (múltiplos Connectors reais, não apenas contratos vazios). A
   plataforma passa a operar o ciclo completo de aquisição, atendimento
   e conteúdo descrito no Capítulo 6, com Automation Hub já reagindo a
   eventos publicados pelas fases anteriores.

FASE 4 — Inteligência e Escala
   Analytics Hub avançado · Finance Hub completo · AI Hub com memória
   evolutiva plena (descrita em AI_HUB.md, Capítulo 22) · escalabilidade
   horizontal validada em produção sob múltiplos Tenants simultâneos,
   incluindo os mecanismos de Provider Failover e Circuit Breaker
   descritos no Capítulo 14 deste documento, sob carga real, não apenas
   testada em ambiente controlado.
```

Cada fase depende estritamente da anterior. Nenhum Hub de Fase 3 deve ser construído sobre uma Fase 2 incompleta, pelo mesmo motivo estrutural que nenhuma camada da arquitetura pula uma camada intermediária: dependências pela metade produzem acoplamento oculto que só se revela como dívida técnica anos depois. Uma equipe sob pressão de prazo pode ser tentada a começar a Fase 3 antes que a Fase 2 esteja plenamente validada — este documento registra, explicitamente, que essa tentação deve ser resistida, e que o custo de esperar a fase anterior amadurecer é sempre menor do que o custo de descobrir, tarde demais, que uma fundação incompleta precisa ser refeita sob um Hub inteiro já construído em cima dela.

---

## 17. Princípios Arquiteturais

Resumo dos princípios que todo novo Hub, módulo ou integração deve respeitar — a explicação completa de cada um vive em `PLATFORM_MANIFESTO.md` e em `AI_HUB.md`; aqui eles aparecem apenas como checklist de conformidade arquitetural, na forma mais curta possível.

Modularidade — todo Hub deve poder evoluir, ser substituído ou desativado isoladamente, sem exigir mudança nos demais.

Baixo acoplamento — nenhum Hub de domínio conhece a implementação interna de outro; toda dependência é resolvida por contrato ou por evento.

Event Driven — comunicação entre Hubs de domínio acontece por evento publicado, nunca por chamada direta acoplada, exceto nas três exceções deliberadas descritas no Capítulo 8.

Provider Agnostic — nenhuma decisão de arquitetura assume permanência de um único provedor externo, de IA ou de qualquer outro serviço.

Multiempresa — isolamento entre Tenants é absoluto, em toda camada, sem exceção, mesmo sob infraestrutura física compartilhada.

AI First — inteligência artificial é fundação, acessada exclusivamente através do AI Hub, nunca implementada de forma paralela por um Hub de domínio.

Segurança por padrão — autenticação, autorização e auditoria são atravessadas por toda requisição, nunca adicionadas depois ou assumidas como já verificadas por uma camada anterior.

Observabilidade — nenhum Hub é considerado completo sem produzir Logs, Tracing e Metrics de forma consistente com os demais.

Escalabilidade — toda camada é desenhada para crescer horizontalmente, sem estado retido localmente entre requisições.

Branding Inteligente — identidade visual e de tom da empresa é propagada automaticamente a toda superfície da plataforma, nunca configurada manualmente superfície por superfície.

Reutilização — nenhuma capacidade nova é construída do zero sem antes verificar se um Hub ou componente existente já resolve o mesmo problema.

Governança — toda decisão arquitetural relevante é registrada formalmente, seguindo o padrão de Architecture Decision Records já estabelecido em `AI_HUB.md`, aplicável à plataforma como um todo, não apenas ao AI Hub.

---

## 18. Conclusão

Este Blueprint é o mapa oficial da Adaptive Business Platform. Ele não é um documento de referência opcional — é a estrutura contra a qual toda decisão de arquitetura futura deve ser validada.

Todo novo Hub deve respeitar esta arquitetura: viver na camada correta descrita no Capítulo 3, comunicar-se apenas através dos canais permitidos descritos no Capítulo 8, publicar e consumir eventos segundo o padrão do Capítulo 7, e respeitar o isolamento multiempresa do Capítulo 11 sem exceção.

Todo novo módulo, dentro de um Hub já existente, deve integrar-se a este Blueprint sem exigir que ele seja redesenhado — se uma nova capacidade não encontra lugar natural neste mapa, a resposta correta é revisar a proposta da capacidade, não distorcer o mapa para acomodá-la. Um mapa que se ajusta a cada exceção deixa, com o tempo, de ser um mapa confiável.

Junto com `PLATFORM_MANIFESTO.md` e `AI_HUB.md`, este documento forma o conjunto mínimo de leitura obrigatória para qualquer pessoa que vá construir sobre a Adaptive Business Platform. O Manifesto explica por quê. O AI Hub explica como a inteligência funciona por dentro. Este Blueprint explica onde cada peça vive e como elas se encontram — e é, dos três, o documento ao qual qualquer desenvolvedor deve retornar com mais frequência no seu trabalho diário.
