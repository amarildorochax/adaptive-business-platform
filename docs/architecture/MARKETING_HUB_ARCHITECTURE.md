# Marketing Hub Architecture — Blueprint Oficial do Marketing Hub

**Adaptive Business Platform · Documento Técnico Oficial**

---

## Nota de Posicionamento Documental

Este documento nasce em status **Draft** (`DOCUMENTATION_CONSTITUTION.md`, §8.1) e exige a mesma reconciliação de nome já enfrentada por `CONVERSATION_HUB_ARCHITECTURE.md` — mas com uma composição de status diferente: **o Marketing Hub, como nomeado em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, é o mesmo Bounded Context já definido como Growth Hub em `GROWTH_DOMAIN_BLUEPRINT.md` (Official) e em `GROWTH_HUB.md` (Draft)**. Diferente de Communication Hub (Official/Official) e de CRM Hub (Frozen/Frozen), aqui apenas o Domain Blueprint já atingiu Official — a arquitetura técnica (`GROWTH_HUB.md`) permanece Draft, o que reduz a friction de qualquer extensão futura à camada de arquitetura, ainda que o domínio em si continue exigindo Change Request, não simples edição.

`GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 4, já define — como pertencentes ao domínio — vinte e nove Entidades: Campaign, Campaign Goal, Audience, Audience Segment, Funnel, Journey, Touchpoint, Experiment, A/B Test, Variant, Conversion Goal, Conversion Event, Lead Source, Attribution, Attribution Model, Acquisition Channel, Activation Strategy, Retention Strategy, Expansion Strategy, Referral Program, Referral, Growth Metric, Growth KPI, Cohort, Lifecycle Stage, Engagement Score, Growth Opportunity, Growth Initiative, Growth Insight, Growth Recommendation. `GROWTH_HUB.md` já define trinta e dois componentes internos, dezesseis Comandos, treze Consultas, dezessete Eventos e doze ADRs sobre esse domínio. Este documento **não redefine nenhuma dessas Entidades** — onde o ESCOPO desta Sprint pede algo já coberto, este documento cita a fonte e resume, exatamente como já fez `CONVERSATION_HUB_ARCHITECTURE.md` em relação a Communication Hub.

O que este documento genuinamente acrescenta:

**Primeira adição — Growth Loop, Entidade explicitamente pedida por esta Sprint e ausente do catálogo já Official.** Definida no Capítulo 19 como um padrão circular e autorreforçado, composto por Entidades já existentes (Referral, Acquisition Channel, Conversion Event), nunca como um conceito atômico concorrente com `Funnel` (linear) ou com `Referral Program` (já Frozen... Official).

**Segunda adição — fronteira explícita e reafirmada entre Marketing Hub e Automation Engine para "Automações" e "Gatilhos".** `AUTOMATION_ENGINE.md` já é proprietário exclusivo de `Workflow`, `Trigger`, `Condition` e `Action` (`DOMAIN_OWNERSHIP_MATRIX.md`). `GROWTH_HUB.md`, ADR-005, já estabelece que "o disparo efetivo de cada etapa de uma Campaign ou de uma Journey... é decidido e executado pelo Automation Engine, nunca por lógica própria de agendamento dentro do Growth". Este documento não introduz nenhuma exceção a essa regra — apenas a nomeia explicitamente nos termos pedidos por esta Sprint (Capítulos 22 e 23), seguindo exatamente o mesmo padrão já usado por `CONVERSATION_HUB_ARCHITECTURE.md` para distinguir `ConversationalFlow` de `Workflow` (ADR-CV-003).

**Terceira adição — reconciliação de Lead Scoring com `CRM_HUB_ARCHITECTURE.md`.** Aquele documento, Capítulo 27, já descreve `LeadScore`/`scoreLead` como parte do contrato `CrmAiAssistProvider`, preparado no código-fonte real da plataforma. Este documento esclarece (Capítulo 15) que o cálculo estratégico de pontuação de Lead é, por natureza, uma capacidade de crescimento — mais próxima de `Engagement Score`, já Official do Growth Hub, do que de uma capacidade de relacionamento — e reposiciona `CrmAiAssistProvider.scoreLead` como o ponto de **consumo** desse cálculo pelo CRM Hub, nunca como um cálculo concorrente. Nenhum dos dois documentos precisa ser alterado para essa reconciliação valer — ela é uma clarificação de fronteira, registrada aqui.

**Quarta adição — um defeito de documentação pré-existente, descoberto durante esta leitura obrigatória, honestamente registrado, não corrigido.** `Lifecycle Stage` aparece simultaneamente na tabela "Pertence ao CRM" de `CRM_DOMAIN_BLUEPRINT.md` (Frozen) e na tabela "Pertence ao Growth" de `GROWTH_DOMAIN_BLUEPRINT.md` (Official). `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 9, já estabelece a regra de desempate: "divergência entre esta matriz e um documento proprietário específico é sempre resolvida a favor do documento proprietário" — e, entre dois documentos proprietários conflitantes, o de maior autoridade (Frozen > Official) prevalece. `Lifecycle Stage` do Relacionamento, portanto, é CRM Hub, exatamente como já assumido em `CRM_HUB_ARCHITECTURE.md`; a entrada equivalente em `GROWTH_DOMAIN_BLUEPRINT.md` é tratada, por este documento, como uma imprecisão herdada, não como uma segunda fonte de verdade. Nenhum documento Official é editado para registrar essa correção — apenas citada aqui como item de governança pendente.

Nenhum código, componente, rota, banco de dados ou API foi alterado para produzir este documento.

---

## 1. Introdução

Este documento é o Blueprint de extensão do **Marketing Hub** — o mesmo Bounded Context já Official através de `GROWTH_DOMAIN_BLUEPRINT.md`, apresentado sob o nome já introduzido em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`. Ele é responsável por toda estratégia de aquisição, ativação, relacionamento, retenção e crescimento da plataforma — orquestrando Campanha, Jornada, Automação e Experimento sempre em cima de Lead/Customer já proprietário do CRM Hub, de Conteúdo já proprietário do Content Hub, e de Conversa já proprietária do Conversation Hub, nunca duplicando nenhum dos três.

---

## 2. Missão

Já registrada em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 2: gerenciar aquisição, ativação, retenção, expansão e indicação de Clientes de forma mensurável, escalável e desacoplada dos demais domínios de negócio — sem jamais depender de acesso direto a Entidades de CRM, de Content ou de Conversation Hub, e sem que esses domínios precisem conhecer a lógica interna de uma Campaign, de um Experiment ou de uma Journey. Este documento estende essa missão apenas para nomear explicitamente os dois Hubs que passaram a existir depois de `GROWTH_DOMAIN_BLUEPRINT.md` ter sido escrito — Content Hub e Conversation Hub —, sem alterar seu conteúdo em uma única palavra.

---

## 3. Visão

Que o Marketing Hub permaneça o único domínio responsável por decidir **quando, para quem e por qual razão estratégica** uma campanha acontece — enquanto Content Hub decide o quê publicar, Conversation Hub decide como conversar, e CRM Hub decide quem já é relacionamento formal — nenhum dos quatro jamais absorvendo a responsabilidade central do outro.

---

## 4. Objetivos Estratégicos

| # | Objetivo | Descrição |
|---|---|---|
| OE-1 | **Preservar o domínio Official intacto** | Nenhuma das vinte e nove Entidades já definidas em `GROWTH_DOMAIN_BLUEPRINT.md` é redefinida. |
| OE-2 | **Introduzir Growth Loop sem competir com Funnel** | Ver Capítulo 19. |
| OE-3 | **Reafirmar a fronteira com Automation Engine para Automação e Gatilhos** | Nenhum Trigger/Workflow é implementado dentro do Marketing Hub. |
| OE-4 | **Reconciliar Lead Scoring com `CRM_HUB_ARCHITECTURE.md`** | Cálculo no Marketing Hub, consumo no CRM Hub. |
| OE-5 | **Formalizar integração com Content Hub e Conversation Hub** | Ambos ausentes, por definição temporal, do texto Official já existente. |
| OE-6 | **Nunca ser proprietário de Lead, Customer, Conversa ou Conteúdo** | Reafirmação explícita, exigida pelo ESCOPO desta Sprint. |
| OE-7 | **Preparar IA aplicada ao Marketing em profundidade** | Doze capacidades (Capítulo 24), nenhuma implementada. |

---

## 5. Escopo

**Dentro do escopo:** tudo já coberto por `GROWTH_DOMAIN_BLUEPRINT.md`/`GROWTH_HUB.md` (citado, não redefinido); Growth Loop; fronteira explícita com Automation Engine; reconciliação de Lead Scoring; integração com Content Hub e Conversation Hub; IA aplicada ao Marketing.

**Fora do escopo:** identidade de relacionamento (CRM Hub); produção de conteúdo (Content Hub); canal de comunicação e envio técnico (Conversation Hub); pagamento e pedido (Commerce Hub); execução de Workflow/Trigger genérico (Automation Engine); cálculo de indicador consolidado (Analytics Hub); identidade visual (Branding Hub).

---

## 6. Responsabilidades

Já integralmente definidas em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 5 — Campanha, Aquisição, Ativação, Retenção, Expansão, Indicação, Experimentação, Segmentação, Atribuição, Funil, Jornada, Métricas. Este documento acrescenta uma responsabilidade de integração explícita: consumir `LeadCaptured` (Content Hub) e `MessageReceived`/`ConversationLabeled` (Conversation Hub) como sinais adicionais de Attribution e de Audience, exatamente como já consome sinal do CRM Hub e do Finance Hub.

```
              LIMITES ENTRE MARKETING HUB E OS DEMAIS HUBS
   ┌───────────────────────────────────────────────────────────┐
   │  Marketing Hub decide estratégia e mede resultado               │
   │       │                                                        │
   │       ├──► CRM Hub formaliza relacionamento e conversão real        │
   │       ├──► Content Hub produz o conteúdo consumido pela Campanha        │
   │       ├──► Conversation Hub executa envio e captura resposta               │
   │       ├──► Commerce Hub processa qualquer venda/cobrança resultante            │
   │       ├──► Automation Engine decide quando cada etapa efetivamente ocorre         │
   │       └──► Analytics Hub consolida indicador de negócio mais amplo                    │
   └───────────────────────────────────────────────────────────┘
```

---

## 7. Arquitetura Geral

```
                              Platform
                                 │
                                 ▼
                           Marketing Hub
                (= Growth Hub — GROWTH_DOMAIN_BLUEPRINT.md, Official —
                 estendido por este documento)
                                 │
                                 ▼
                          Business Capabilities
     (18 já Official — GROWTH_DOMAIN_BLUEPRINT.md, Capítulo 6 —
      mais Growth Loop Management, novo — Capítulo 9)
                                 │
                                 ▼
                       Domain Model (Capítulo 22)
   (Campaign, Audience, Segment, Journey, Experiment, Attribution,
    Funnel — já Official; Growth Loop — novo)
                                 │
                                 ▼
                          Domain Events (Capítulo 25)
        (17 já Official + GrowthLoopCompleted, novo)
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
             CRM Hub        Content Hub     Conversation Hub
        (ConversionRegistered  (LeadCaptured   (MessageReceived
         consumido de volta)    consumido)      consumido)
```

---

## 8. Conceito de Marketing Hub

Já integralmente definido em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 1 — o Marketing Hub é um Business Hub, categoria já estabelecida em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 1. O que este documento acrescenta é a formulação exigida por esta Sprint: o Marketing Hub orquestra — nunca executa diretamente e nunca é proprietário do que orquestra. Ele decide que uma Campanha deve existir; o Content Hub produz a página que ela usa; o Conversation Hub envia a mensagem que ela dispara; o CRM Hub formaliza o Lead que ela captura; o Automation Engine decide o instante exato em que cada uma dessas ações ocorre.

---

## 9. Gestão de Campanhas

**Já integralmente definido.** `Campaign`/`Campaign Goal` são Entidades Official (`GROWTH_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7), implementadas pelo `Campaign Manager` (`GROWTH_HUB.md`, Capítulo 7), com Comandos `CreateCampaign`/`StartCampaign`/`StopCampaign` e Eventos `CampaignCreated`/`CampaignStarted`/`CampaignFinished` já catalogados. "Campaign Execution", pedida por esta Sprint como Entidade própria, **não é uma nova Entidade** — é o mesmo Aggregate `Campaign` em seu estado operacional de execução (`CampaignStarted` até `CampaignFinished`), já coberto pelo `Lifecycle Coordinator` (`GROWTH_HUB.md`, Capítulo 7). Distinta de `Campaign Message` (Communication/Conversation Hub — o envio técnico e seu rastreamento) e de `LandingPage` (Content Hub — o destino de conversão), ambas já formalmente distinguidas em seus respectivos Blueprints.

---

## 10. Gestão de Audiências

**Já integralmente definido** como `Audience` (`GROWTH_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Audience Manager`, `GROWTH_HUB.md`, Capítulo 7), nunca uma cópia da estrutura de `Customer` do CRM Hub — resolvida por identificador via Anti-Corruption Layer, já Design Principle "Audience Is Independent" (`GROWTH_HUB.md`, Capítulo 5). Nenhuma extensão nova.

---

## 11. Segmentação

**Já integralmente definido** como `Audience Segment` (`GROWTH_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Segmentation Manager`, `GROWTH_HUB.md`, Capítulo 7). Fronteira reafirmada, não alterada, contra dois conceitos homônimos já formalmente distinguidos em `DOMAIN_OWNERSHIP_MATRIX.md`: `Segment`/`Customer Segments` (CRM Hub — agrupamento de Relationship por característica de relacionamento, já detalhado em `CRM_HUB_ARCHITECTURE.md`, Capítulo 24) e `Segment (Empresa)` (Business Profile Engine — classificação setorial da própria Empresa cliente da plataforma). `Audience Segment` consome `SegmentUpdated`, publicado pelo CRM Hub, como um dos sinais que compõem sua própria segmentação — nunca o inverso.

---

## 12. Jornadas de Marketing

**Já integralmente definido** como `Journey`/`Touchpoint` (`GROWTH_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Journey Manager`, `GROWTH_HUB.md`, Capítulo 7) — sequência estratégica e planejada de pontos de contato, sempre prospectiva. Fronteira já formalmente estabelecida contra `Customer Journey` do CRM Hub em `CRM_HUB_ARCHITECTURE.md`, Capítulo 26: `Journey` (este Hub) é o plano; Customer Journey (CRM Hub) é o registro factual e retrospectivo de por onde um Relacionamento efetivamente já passou. As duas nunca se fundem — a primeira nunca lê o Read Model da segunda, e vice-versa.

---

## 13. Automações

Ver Capítulos 22 e 23 — nenhuma Entidade de automação genérica é definida por este Hub. `Journey`/`Retention Strategy`/`Activation Strategy` definem *o quê* deve acontecer estrategicamente; o Automation Engine decide *quando*, através de `Workflow`/`Trigger`/`Condition`/`Action`, já proprietários daquele domínio conforme `DOMAIN_OWNERSHIP_MATRIX.md`.

---

## 14. Funis

**Já integralmente definido** como `Funnel` (`GROWTH_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Funnel Manager`, `GROWTH_HUB.md`, Capítulo 7) — modelo linear das etapas entre potencial e conversão. Distinto de Growth Loop (Capítulo 19), que é circular e autorreforçado, nunca terminal.

---

## 15. Lead Scoring

**Reconciliação formal com `CRM_HUB_ARCHITECTURE.md`.** Nenhuma Entidade `Lead Score` é formalmente catalogada em `GROWTH_DOMAIN_BLUEPRINT.md` — o conceito mais próximo já Official é `Engagement Score` (Capítulos 4 e 7 daquele documento; `Engagement Manager`, `GROWTH_HUB.md`, Capítulo 7), "medida derivada do nível de engajamento de um Cliente", sempre calculada, nunca armazenada como valor editável manualmente (ADR-011 daquele documento).

Este documento posiciona Lead Scoring como uma extensão direta de `Engagement Score`, aplicada especificamente a um `Lead` ainda não convertido — mesmo Domain Service (`Engagement Manager`), mesmo princípio de cálculo sempre derivado. `CRM_HUB_ARCHITECTURE.md`, Capítulo 27, já descreve `CrmAiAssistProvider.scoreLead`/`LeadScore` como contrato preparado no código real da plataforma — este documento esclarece que esse contrato representa o **consumo**, pelo CRM Hub, de um cálculo que, estrategicamente, pertence ao Marketing Hub, nunca um cálculo concorrente implementado duas vezes. Nenhum dos dois documentos exige alteração para essa reconciliação valer.

---

## 16. Attribution

**Já integralmente definido** como `Attribution`/`Attribution Model` (`GROWTH_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Attribution Manager`, `GROWTH_HUB.md`, Capítulo 7) — princípio "Attribution Is Immutable" já Official (Design Principle, `GROWTH_HUB.md`, Capítulo 5). Este documento acrescenta apenas uma nova origem de sinal: `LeadCaptured` (Content Hub) e `NewsletterSubscriptionRequested` (Content Hub, via Form Builder) agora alimentam `Lead Source`/`Acquisition Channel`, ambos já Official, sem exigir nenhuma nova Entidade.

---

## 17. Experimentação

**Já integralmente definido** como `Experiment` (`GROWTH_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `Experiment Manager`, `GROWTH_HUB.md`, Capítulo 7). Fronteira já formalmente estabelecida contra o Content Hub em `CONTENT_HUB_ARCHITECTURE.md`, ADR-CH-002: o Content Hub fornece as versões candidatas de conteúdo (por exemplo, de uma `LandingPage`); o Marketing Hub, através de `Experiment`/`A/B Test`/`Variant`, decide a comparação estatística e o vencedor — nunca o inverso.

---

## 18. Testes A/B

**Já integralmente definido** como `A/B Test`/`Variant` (`GROWTH_DOMAIN_BLUEPRINT.md`, Capítulos 4 e 7; `A/B Test Manager`/`Variant Manager`, `GROWTH_HUB.md`, Capítulo 7) — forma mais simples de `Experiment`, comparando exatamente duas `Variant`. Nenhuma extensão nova.

---

## 19. Growth Loops

**Entidade genuinamente nova, pedida explicitamente por esta Sprint e ausente do catálogo já Official.**

**Objetivo.** Modelar um padrão de crescimento circular e autorreforçado — onde o resultado do engajamento de um Cliente se torna, ele mesmo, insumo para adquirir ou engajar o próximo — distinto de `Funnel` (Capítulo 14), que é linear e termina na conversão.

**Responsabilidades.** Ciclo de vida de `Growth Loop`; composição de um Loop a partir de Entidades já Official (`Referral Program`, `Acquisition Channel`, `Conversion Event`), nunca redefinindo nenhuma delas; medição de taxa de fechamento do ciclo (quantos Clientes gerados por um Loop retornam a alimentá-lo).

**Funcionalidades.** Definição de `LoopStage[]` (etapas do ciclo); associação de `Growth Metric` de entrada e de saída de cada Loop, já Official; identificação de Loop de maior retorno composto ao longo do tempo.

**Fluxos.**

```
Cliente engajado → Ação geradora de novo alcance (Referral,
  conteúdo compartilhado, indicação) → Novo Lead adquirido
  (via Acquisition Channel já Official) → Conversão (Conversion
  Event já Official) → Cliente engajado (reinicia o ciclo)
```

**Dependências.** `Referral Program`/`Referral`, `Acquisition Channel`, `Conversion Event`, todos já Official.

**Eventos.** `GrowthLoopStarted`, `GrowthLoopCompleted` (Capítulo 25).

**Integrações.** Content Hub (quando o mecanismo de compartilhamento do Loop é um Artigo/Download); Conversation Hub (quando o mecanismo é um convite via WhatsApp).

**Limites do domínio.** `Growth Loop` nunca cria `Referral` ou `Conversion Event` diretamente — ele apenas os referencia, como Entidade de composição estratégica sobre dado já existente, mesmo padrão de "Read View sobre dado já proprietário" já usado para Customer Journey em `CRM_HUB_ARCHITECTURE.md`, Capítulo 26.

---

## 20. Remarketing

**Não é uma nova Entidade** — é um padrão de uso de `Audience`/`Audience Segment` já Official, aplicado especificamente a um subconjunto que já interagiu (via `Conversion Event` incompleto ou `Touchpoint` sem conversão) mas ainda não converteu. Uma `Campaign` de Remarketing é uma `Campaign` comum, associada a uma `Audience` filtrada por esse critério — nenhum componente novo, nenhuma Entidade nova.

---

## 21. Personalização

**Não é uma nova Entidade** — é a aplicação, dentro de uma `Campaign`/`Journey`, de conteúdo condicional já produzido pelo Content Hub (blocos de `Article`/`LandingPage` variáveis por `Audience Segment`) e de identidade visual já resolvida pelo Branding Hub (`BRANDING_HUB.md`), calibrados pelo Segmento/Maturidade já informados pelo Business Profile Engine (`BUSINESS_PROFILE_ENGINE.md`). O Marketing Hub nunca produz o conteúdo personalizado em si — ele decide, estrategicamente, para qual `Audience Segment` qual variação já existente é exibida.

---

## 22. Regras de Automação

Este capítulo reafirma, sem introduzir Entidade nova, a fronteira já Official (`GROWTH_HUB.md`, ADR-005): toda regra de "se este critério de negócio for satisfeito, esta etapa de `Journey`/`Campaign` deve ocorrer" é expressa dentro do próprio `Journey`/`Campaign` (já Official), mas sua avaliação e disparo efetivo pertencem exclusivamente ao Automation Engine, através de `Workflow`/`Condition`, já proprietário daquele domínio.

| Tipo de regra | Onde é definida | Quem avalia e dispara |
|---|---|---|
| Sequência estratégica de uma Journey | Marketing Hub — `Journey`/`Touchpoint` (já Official) | Automation Engine — `Workflow` |
| Critério de elegibilidade de Audience Segment | Marketing Hub — `Segmentation Manager` (já Official) | Marketing Hub avalia diretamente (não é automação temporal, é cálculo de associação) |
| Disparo de e-mail de reengajamento por inatividade | Marketing Hub — `Retention Strategy` (já Official) | Automation Engine — `Trigger` de tempo |

---

## 23. Gatilhos

**`Trigger` é, sem exceção, proprietário do Automation Engine** (`DOMAIN_OWNERSHIP_MATRIX.md`, linha "Trigger | Automation Engine"). O Marketing Hub nunca implementa seu próprio motor de Trigger — quando uma `Journey`/`Campaign` precisa que uma etapa ocorra em um momento específico ou em reação a um Evento, ela publica essa necessidade (já Official, através do próprio Evento `JourneyStarted`/`CampaignStarted` consumido pelo Automation Engine) e aguarda a `Action` correspondente ser invocada de volta — nunca implementando um agendador ou um avaliador de condição paralelo. Esta é a mesma fronteira já estabelecida, com exatamente a mesma disciplina, entre `ConversationalFlow` e `Workflow` em `CONVERSATION_HUB_ARCHITECTURE.md`, ADR-CV-003.

---

## 24. IA aplicada ao Marketing

Nenhuma capacidade descrita neste capítulo é implementada nesta Sprint — mesmo padrão de "preparação sem implementação prematura" já aplicado nos três Blueprints anteriores desta série. `GROWTH_HUB.md`, Capítulo 7, já antecipa `Growth Insight Manager`/`Growth Recommendation Manager`, apoiados pelo AI Hub — este capítulo os detalha para as doze capacidades explicitamente pedidas por esta Sprint.

**Criação de campanhas.** O AI Hub sugeriria estrutura inicial de `Campaign` — `Campaign Goal`, `Audience` candidata — a partir de um objetivo declarado em linguagem natural, sempre revisável antes de `StartCampaign`.

**Otimização de campanhas.** Sugestão contínua de ajuste de `Campaign` já em execução, a partir de `Growth Metric` observada — nunca uma alteração automática do `Aggregate` sem confirmação.

**Segmentação inteligente.** Sugestão de recomposição de `Audience Segment`, equivalente à mesma capacidade já descrita para o Content Hub (`CONTENT_HUB_ARCHITECTURE.md`, Capítulo 25) mas aplicada à composição estratégica, não à otimização de conteúdo.

**Previsão de conversão.** Estimativa de probabilidade de uma `Audience`/`Segment` atingir `Conversion Goal`, complementar ao Lead Scoring já descrito no Capítulo 15.

**Recomendação de audiências.** Sugestão de nova `Audience` candidata a partir de padrão observado em `Cohort` já Official.

**Otimização de jornadas.** Sugestão de reordenação ou de remoção de `Touchpoint` de uma `Journey`, a partir de onde o `Funnel` associado revela maior perda.

**Geração de conteúdos para campanhas.** O Marketing Hub nunca produz conteúdo — esta capacidade é, na prática, uma solicitação ao AI Hub mediada pelo Content Hub (`CONTENT_HUB_ARCHITECTURE.md`, Capítulo 25, "Landing Pages"/"CTAs"), nunca implementada dentro deste Hub.

**Análise de performance.** Leitura consolidada de `Growth Metric`/`Growth KPI` já Official, entregue como `Growth Insight`.

**Detecção de gargalos.** Identificação de etapa de `Funnel`/`Journey` com maior perda de conversão, insumo direto de Otimização de jornadas, acima.

**Recomendação de canais.** Sugestão de `Acquisition Channel` mais eficiente para um `Campaign Goal` específico, a partir de `Attribution` histórica já Official.

**Previsão de ROI.** Estimativa de retorno esperado de uma `Campaign`, cruzando `Growth Metric` com custo já registrado pelo Finance Hub (consumido por Evento, nunca acessado diretamente, mesma fronteira já Official em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 11).

**Otimização contínua.** Consolidação de todas as capacidades acima em um ciclo de `Growth Insight → Growth Recommendation`, já Official (`GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 10), sempre sujeita a confirmação humana antes de qualquer ação de negócio efetiva, aplicação direta do princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5, e já reafirmado como ADR-012 em `GROWTH_DOMAIN_BLUEPRINT.md`.

---

## 25. Eventos do Domínio

Os primeiros dezessete eventos abaixo já estão integralmente definidos e Official em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 10 — reproduzidos aqui, sem redefinição, para consolidar o catálogo pedido por esta Sprint num único lugar. Os dois eventos finais são a extensão proposta por este documento.

| Evento | Produtor | Consumidor | Objetivo | Impacto |
|---|---|---|---|---|
| `CampaignCreated` | Marketing Hub (já Official) | Finance Hub, Analytics Hub | Nova Campaign registrada. | Início do ciclo de vida. |
| `CampaignStarted` | Marketing Hub (já Official) | Automation Engine | Campaign entra em execução. | Dispara Journey/Touchpoint associados. |
| `CampaignFinished` | Marketing Hub (já Official) | Analytics Hub | Campaign encerrada. | Fecha janela de Attribution. |
| `AudienceBuilt` | Marketing Hub (já Official) | — | Audience pronta para associação. | Disponível a Campaign. |
| `SegmentUpdated` (CRM) / `SegmentUpdated` (Growth, sinal distinto) | CRM Hub / Marketing Hub | Marketing Hub / Analytics Hub | Recomposição de segmento, cada um em seu próprio domínio. | Ver Capítulo 11 para a distinção formal. |
| `JourneyStarted` | Marketing Hub (já Official) | Automation Engine | Cliente inicia passagem por uma Journey. | Aciona primeiro Touchpoint. |
| `JourneyCompleted` | Marketing Hub (já Official) | Analytics Hub | Cliente conclui todos os Touchpoint. | Fecha o ciclo de Journey. |
| `AutomationExecuted` (recebido, não publicado por este Hub) | Automation Engine | Marketing Hub | Confirma execução de etapa solicitada. | Atualiza estado de Journey/Campaign. |
| `TriggerFired` (recebido, não publicado por este Hub) | Automation Engine | Marketing Hub | Confirma disparo de condição. | Ver Capítulo 23. |
| `ExperimentStarted` | Marketing Hub (já Official) | Analytics Hub | Experiment expõe Variant à Audience. | Início de comparação. |
| `ExperimentFinished` | Marketing Hub (já Official) | Analytics Hub | Experiment encerrado. | Seleciona Variant vencedora. |
| `VariantSelected` | Marketing Hub (já Official) | Content Hub (quando aplicável), Analytics Hub | Resultado de Experiment determinado. | Base de Growth Recommendation. |
| `ConversionRegistered` (= `ConversionTracked`) | Marketing Hub (já Official) | CRM Hub, Finance Hub, Analytics Hub | Conversion Goal atingido. | Base de Attribution. |
| `ReferralConverted` | Marketing Hub (já Official) | CRM Hub | Indicação convertida em novo Cliente. | CRM Hub cria Customer. |
| `GrowthInsightGenerated` | Marketing Hub (já Official) | Automation Engine | Novo Insight identificado. | Insumo de Recommendation. |
| `GrowthRecommendationGenerated` | Marketing Hub (já Official) | — | Recommendation formulada. | Sujeita a confirmação humana. |
| `AttributionCalculated` | Marketing Hub (já Official, implícito em Attribution Manager) | CRM Hub, Analytics Hub | Crédito de conversão distribuído. | Nunca recalculado retroativamente. |
| `GrowthLoopStarted` **(novo)** | Marketing Hub | Analytics Hub | Um Growth Loop é instanciado. | Início de medição de ciclo. |
| `GrowthLoopCompleted` **(novo)** | Marketing Hub | Analytics Hub | Um ciclo completo de Growth Loop se fecha. | Base de taxa de reforço composto. |

---

## 26. Integração com os demais Hubs

**CRM Hub.** Consome `ConversionRegistered`/`ReferralConverted` para formalizar Customer/relacionamento (já Official); publica `SegmentUpdated`/`LeadCreated`, consumidos pelo Marketing Hub para calibrar Audience/Attribution (já Official).

**Content Hub.** Publica `LeadCaptured`/`NewsletterSubscriptionRequested`/`SEOOptimized`; o Marketing Hub consome os dois primeiros como sinal de `Lead Source`/`Acquisition Channel`, e referencia `LandingPage`/`Article` por identificador quando compõe uma `Campaign`, nunca copiando a estrutura de conteúdo.

**Conversation Hub.** Recebe `Campaign Message` (já Official do Communication/Conversation Hub) definida estrategicamente pelo Marketing Hub, mas executa o envio e o rastreamento de entrega inteiramente por conta própria; publica `MessageReceived`/`ConversationLabeled`, consumidos pelo Marketing Hub como sinal complementar de segmentação e de Attribution.

**Commerce Hub.** Ainda sem Blueprint próprio nesta série — o Marketing Hub consumiria seu evento de venda confirmada para calcular ROI (Capítulo 24), exatamente como já consome evento de pagamento do Finance Hub hoje.

**Business Hub.** Ainda sem Blueprint próprio — informaria Segmento/Maturidade da Empresa, consumido pelo Marketing Hub para calibrar vocabulário e prioridade de Campanha sugerida, mesmo padrão já Official com Business Profile Engine.

**AI Hub.** Consumido nos termos do Capítulo 24 — o Marketing Hub nunca implementa lógica de IA própria.

**Identity Hub.** Autentica e autoriza toda operação, através do modelo RBAC/ABAC já Official (`GROWTH_HUB.md`, Capítulo 13).

**Analytics Hub.** Consome todo Evento publicado pelo Marketing Hub para compor indicador de negócio mais amplo — nunca calculado pelo próprio Marketing Hub além de `Growth Metric`/`Growth KPI` já Official.

**Integration Hub.** Única via pela qual uma `Campaign` alcança um canal de mídia externo ou um `Acquisition Channel` digital — o Marketing Hub nunca se comunica diretamente com um Provider de mídia, já Official (`GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 11).

```
              INTEGRAÇÃO DO MARKETING HUB COM TODOS OS HUBS
   ┌───────────────────────────────────────────────────────────┐
   │  Marketing Hub                                                 │
   │    publica: CampaignCreated · JourneyStarted ·                    │
   │             ConversionRegistered · ReferralConverted ·                │
   │             GrowthInsightGenerated · GrowthLoopCompleted (novo)          │
   │    consome: LeadCaptured, SEOOptimized (Content Hub) ·                     │
   │             MessageReceived, ConversationLabeled (Conversation Hub) ·          │
   │             SegmentUpdated, LeadCreated (CRM Hub) ·                                │
   │             PaymentConfirmed (Finance Hub, já Official)                              │
   └───────────────────────────────────────────────────────────┘
```

---

## 27. Segurança

Já integralmente definido em espírito por `GROWTH_HUB.md` (Design Principles Auditability by Design, Human Oversight). Toda operação sensível — encerramento de `Experiment`, mudança de `Attribution Model`, aplicação de `Growth Recommendation` — produz registro auditável, verificado via Identity Hub antes de qualquer execução, mesma disciplina já Official.

---

## 28. Permissões

Já integralmente definido via Identity Hub (RBAC/ABAC) — Perfil de Marketing tipicamente autorizado a `CreateCampaign`/`StartExperiment`, distinto de Perfil de Análise, com acesso apenas de leitura a `Growth Dashboard`. Nenhuma extensão nova.

---

## 29. Auditoria

Já integralmente definido via `Audit Manager` (`GROWTH_HUB.md`, Capítulo 7). `Growth Loop` (Capítulo 19), como extensão, segue o mesmo padrão sem exigir componente novo além do já existente.

---

## 30. Multi-Tenant

Já integralmente definido — nenhum componente interno mantém estado compartilhado entre Tenants, aplicação direta de `SAAS_ARCHITECTURE.md`, Capítulo 6. `Growth Loop` é isolado por Tenant sem exceção.

---

## 31. Escalabilidade

Já integralmente definido em `GROWTH_HUB.md`, Capítulo 17 — Workers independentes, isolamento por Tenant, separação entre caminho de escrita e de leitura. A convergência de sinal adicional de Content Hub/Conversation Hub (Capítulo 26) não altera essa arquitetura — cada Evento consumido é processado de forma assíncrona, nunca bloqueando o processamento de Command já em andamento.

---

## 32. Diagramas ASCII

```
                    POSIÇÃO DO MARKETING HUB NA PLATAFORMA
   ┌───────────────────────────────────────────────────────────┐
   │  Platform Services                                            │
   │  (AI Hub · Identity Hub · Knowledge Hub · Integration Hub)     │
   ├───────────────────────────────────────────────────────────┤
   │  Adaptive Intelligence                                          │
   │  (Business Profile Engine · Branding Hub · Automation Engine)   │
   ├───────────────────────────────────────────────────────────┤
   │  Business Hubs                                                   │
   │  ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌───────────┐          │
   │  │ CRM Hub │ │Content   │ │Conversation │ │Marketing   │          │
   │  │         │ │Hub       │ │Hub          │ │Hub (este    │          │
   │  │         │ │          │ │             │ │documento —   │          │
   │  │         │ │          │ │             │ │= Growth Hub) │          │
   │  └─────────┘ └──────────┘ └────────────┘ └───────────┘          │
   └───────────────────────────────────────────────────────────┘
```

```
              GROWTH LOOP vs. FUNNEL (distinção conceitual)
   ┌───────────────────────────────────────────────────────────┐
   │  Funnel (já Official — linear, terminal)                       │
   │    Visita → Lead → Conversão → FIM                                │
   │                                                                │
   │  Growth Loop (novo — circular, autorreforçado)                    │
   │    Cliente engajado → gera novo alcance → novo Lead →                 │
   │    Conversão → Cliente engajado → (reinicia)                              │
   └───────────────────────────────────────────────────────────┘
```

---

## 33. Tabelas Arquiteturais

### 33.1 Entidade → Ownership (verificação contra `DOMAIN_OWNERSHIP_MATRIX.md`)

| Entidade | Proprietário | Verificação |
|---|---|---|
| Campaign, Audience, Audience Segment, Journey, Attribution, Experiment, Variant, Funnel, Conversion Event, Referral, Growth Loop (novo) | Marketing Hub (= Growth Hub) | Confirmado — nenhuma duplicação. |
| Lead, Customer, Contact, Segment (CRM) | CRM Hub | Confirmado distinto de Audience Segment. |
| Article, LandingPage, Form | Content Hub | Confirmado — Marketing Hub referencia por identificador. |
| Conversation, Message, Campaign Message | Conversation Hub | Confirmado — Marketing Hub nunca executa envio. |
| Workflow, Trigger, Condition, Action | Automation Engine | Confirmado — Capítulos 22 e 23. |
| Lifecycle Stage | CRM Hub (per tie-break, ver Nota de Posicionamento) | Discrepância pré-existente registrada, não corrigida por este documento. |

### 33.2 Reconciliação de nomenclatura

| Conceito | Nome no Blueprint Official (Growth Hub) | Nome nesta Sprint (Marketing Hub) | Status |
|---|---|---|---|
| O Hub inteiro | Growth Hub | Marketing Hub | Mesmo domínio — reconciliação pendente (ADR-MK-001). |
| Lead Score | Não formalizado (mais próximo: Engagement Score) | Lead Scoring | Reconciliado neste documento, Capítulo 15. |
| Conversion Event | Conversion Event | Conversion / ConversionTracked | Mesmo conceito, nome citado do ESCOPO desta Sprint. |

### 33.3 KPIs (fatos brutos — cálculo consolidado permanece do Analytics Hub)

| Indicador de origem | Módulo produtor |
|---|---|
| Taxa de conversão por Funnel | Funnel Manager (já Official) |
| Taxa de fechamento de Growth Loop | Growth Loop (novo) |
| Custo por Aquisição por Acquisition Channel | Attribution Manager (já Official) |
| Volume de Lead por origem (Content/Conversation Hub) | Attribution Manager, com sinal ampliado pela convergência do Capítulo 26 |

---

## 34. Roadmap Evolutivo

| Fase | Foco | Observação |
|---|---|---|
| **Fase 1 — Governança** | Reconciliar nomenclatura Marketing Hub / Growth Hub. | Pendente — ADR-MK-001. |
| **Fase 2 — Núcleo já Official/Draft** | Campaign Manager, Audience Manager, Attribution Manager — já roteirizados em `GROWTH_HUB.md`, Capítulo 19. | Reaproveitado integralmente. |
| **Fase 3 — Convergência com Content Hub e Conversation Hub** | `LeadCaptured`, `MessageReceived` consumidos conforme Capítulo 26. | Depende dos dois Blueprints correspondentes já maduros. |
| **Fase 4 — Growth Loop** | Novo, depende de Referral Program e Acquisition Channel já maduros. | — |
| **Fase 5 — Reconciliação de Lead Scoring com CRM Hub** | Engagement Manager estendido; CrmAiAssistProvider consumindo o cálculo. | Depende de Fase 2. |
| **Fase 6 — IA aplicada ao Marketing** | As doze capacidades do Capítulo 24. | Depende de AI Hub maduro. |
| **Fase 7 — Convergência com Commerce Hub e Business Hub** | Requer que ambos ganhem Blueprint próprio primeiro. | Bloqueado, mesma dependência já registrada em `CRM_HUB_ARCHITECTURE.md`, Fase 6. |

---

## 35. Regras Arquiteturais

**ADR-MK-001 — Marketing Hub e Growth Hub são o mesmo Bounded Context; a reconciliação de nome é pendente.** Contexto: mesmo padrão já registrado em `CONVERSATION_HUB_ARCHITECTURE.md`, ADR-CV-001, aqui aplicado a um domínio Official (não Frozen).

**ADR-MK-002 — `Growth Loop` nunca duplica `Referral Program`, `Acquisition Channel` ou `Conversion Event`.** Ele os compõe, por referência, como padrão estratégico de leitura sobre dado já existente. Contexto: preservar No Duplicate Models (`DOMAIN_OWNERSHIP_MATRIX.md`, §3).

**ADR-MK-003 — Marketing Hub nunca implementa Trigger, Workflow, Condition ou Action.** Toda automação temporal ou condicional é delegada ao Automation Engine. Contexto: reafirmação de `GROWTH_HUB.md`, ADR-005, nos termos explícitos desta Sprint (Capítulos 22 e 23).

**ADR-MK-004 — Lead Scoring é calculado pelo Marketing Hub e consumido pelo CRM Hub, nunca calculado duas vezes.** `CrmAiAssistProvider.scoreLead` representa o ponto de consumo, não um cálculo concorrente. Contexto: reconciliação registrada no Capítulo 15, evitando duplicação silenciosa de indicador (`DOMAIN_OWNERSHIP_MATRIX.md`, ADR-016).

**ADR-MK-005 — A discrepância de ownership de `Lifecycle Stage` entre `CRM_DOMAIN_BLUEPRINT.md` e `GROWTH_DOMAIN_BLUEPRINT.md` é registrada, não corrigida, por este documento.** O tie-break já estabelecido em `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 9, favorece o documento de maior autoridade (Frozen sobre Official) — `CRM_DOMAIN_BLUEPRINT.md` prevalece. Contexto: transparência sobre um defeito de documentação pré-existente, descoberto durante a leitura obrigatória desta Sprint.

**ADR-MK-006 — Este documento não altera `GROWTH_DOMAIN_BLUEPRINT.md`, `GROWTH_HUB.md` ou `DOMAIN_OWNERSHIP_MATRIX.md`.** Toda extensão proposta (Growth Loop, reconciliação de Lead Scoring) é um item de governança pendente. Contexto: mesmo princípio já registrado em `CONTENT_HUB_ARCHITECTURE.md`, ADR-CH-009, e em `CONVERSATION_HUB_ARCHITECTURE.md`, ADR-CV-009, e em `CRM_HUB_ARCHITECTURE.md`, ADR-CR-006.

---

## 36. Conclusão

Este documento não introduz um novo domínio de crescimento — ele reafirma, sob o nome pedido por esta Sprint, o Growth Hub já Official, e o estende exatamente onde a passagem do tempo o exigia: uma Entidade nova (Growth Loop) que o catálogo original não previa; uma fronteira reafirmada contra o Automation Engine para automação e gatilhos, nos termos explícitos desta Sprint; uma reconciliação honesta de Lead Scoring com o CRM Hub já documentado nesta mesma série; e a integração formal com dois Hubs — Content Hub e Conversation Hub — que simplesmente não existiam nomeados quando `GROWTH_DOMAIN_BLUEPRINT.md` foi escrito.

O achado mais valioso desta Sprint não é uma Entidade nova — é a descoberta, durante a leitura obrigatória, de uma divergência de ownership pré-existente entre dois documentos proprietários (`Lifecycle Stage`, disputado entre CRM e Growth) que nenhuma Sprint anterior havia notado. Registrar esse achado sem tentar corrigi-lo sozinho, deixando a correção para o processo de governança apropriado, é a mesma disciplina que este documento pede de si mesmo em toda outra extensão que propõe: nunca reescrever o que já existe, apenas estender com transparência total sobre onde a extensão termina e onde a decisão de outra pessoa começa.

Dois itens de governança permanecem pendentes: a reconciliação de nome entre Marketing Hub e Growth Hub (ADR-MK-001), e a correção formal da divergência de `Lifecycle Stage` entre os dois Blueprints proprietários (ADR-MK-005). Nenhum dos dois é resolvido por este documento isoladamente — cada um exige seu próprio processo de Review e Approval, conforme `DOCUMENTATION_CONSTITUTION.md`, §13 e §14.
