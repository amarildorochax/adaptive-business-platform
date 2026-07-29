# Content Hub Architecture — Blueprint Oficial do Content Hub

**Adaptive Business Platform · Documento Técnico Oficial**

---

## Nota de Posicionamento Documental

Este documento nasce em status **Draft**, como toda documentação nova exige (`DOCUMENTATION_CONSTITUTION.md`, §8.1), e não substitui, silenciosamente ou de outra forma, nenhum documento já Official ou Frozen da plataforma. Três reconciliações precisam ser registradas explicitamente antes de qualquer outro conteúdo, porque este Hub nasce numa posição incomum: ele já é mencionado, com graus diferentes de detalhe, em três corpos de documentação anteriores que não concordam totalmente entre si.

**Primeira reconciliação — com `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` (Sprint BP-001, Draft).** Aquele documento já introduziu o Content Hub como um dos 8 Hubs da plataforma, responsável por "toda a aquisição orgânica" (SEO, Blog, Landing Pages). Este documento é sua continuação direta — o Blueprint da plataforma descreveu o Content Hub em nível de visão; este documento o descreve em nível de arquitetura de domínio, seguindo o padrão que o Volume I já estabeleceu para os cinco Business Hubs existentes.

**Segunda reconciliação — com `DOMAIN_OWNERSHIP_MATRIX.md` (Official) e `GROWTH_DOMAIN_BLUEPRINT.md`/`GROWTH_HUB.md` (Frozen/Official).** O Growth Hub já é proprietário de Campaign, Audience, Funnel, Journey, Experiment, A/B Test, Attribution, Lead Source, Acquisition Channel, Referral e de toda a família de conceitos de crescimento estratégico — nenhum deles é redefinido aqui. `BUSINESS_HUB_ARCHITECTURE.md`, §12, já citava "Otimização de Conteúdo" como exemplo ilustrativo de Capacidade do Growth Hub, mas nenhum documento proprietário jamais formalizou essa capacidade como pertencente a ele — `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 6, não a lista entre suas dezoito Capacidades de Negócio reais. Este documento resolve essa lacuna: **produção, gestão editorial e otimização técnica de conteúdo (SEO on-page, semântico e estrutural) passam a pertencer, formalmente, ao Content Hub — um Business Hub novo, não ao Growth Hub.** O Growth Hub permanece proprietário de tudo o que é *estratégico e comparativo* sobre crescimento — Campanha, Atribuição, Experimento, Funil; o Content Hub passa a ser proprietário de tudo o que é *produção e otimização de conteúdo em si* — Artigo, Página, Formulário, Mídia, Metadado de SEO. A fronteira exata está registrada no Capítulo 6 e na tabela de Boundaries do Capítulo 22. Nenhuma linha de `DOMAIN_OWNERSHIP_MATRIX.md` é alterada por este documento — a atualização formal daquela matriz, incluindo o Content Hub como décimo terceiro proprietário da plataforma, é um item de governança pendente, a ser executado como uma mudança própria e revisada, não como efeito colateral deste Blueprint.

**Terceira reconciliação — com `docs/requirements/growth/BLOG.md`, `SEO.md`, `LANDING_PAGES.md`, `WEB_STORIES.md`, `EMAIL_MARKETING.md` e `ANALYTICS.md`.** Esses seis documentos — pré-existentes, fora do Documentation System (`DOCUMENTATION_INDEX.md`, §10), escritos sob o nome de produto anterior "Andreia AI Platform" — já especificam em grande detalhe funcional Blog, SEO, Landing Pages e Web Stories como quatro dos dezoito módulos de um "Growth Hub" monolítico de sete-Hubs (Business, Growth, Operations, Integration, AI, Marketplace, Academy), e Email Marketing/Analytics como módulos irmãos que tocam o mesmo conteúdo. **Este documento não contradiz nenhuma dessas especificações funcionais — ele as absorve, preserva integralmente e as reorganiza** sob a disciplina arquitetural do Volume I (Bounded Context, Domain Ownership, Eventos, ADRs), promovendo Blog, SEO, Landing Pages e Web Stories de "módulos de um Growth Hub monolítico" a "módulos internos de um Content Hub dedicado". Toda Capacidade, todo KPI, toda Integração e todo Papel de permissão já especificado nesses seis documentos está preservado neste Blueprint — nenhum deles precisa ser reescrito ou descartado; eles passam a ser lidos como as especificações funcionais originais que fundamentam os módulos internos aqui descritos (Capítulos 9–21), da mesma forma que um Domain Blueprint do Volume I fundamenta seu Hub correspondente. A atualização formal do cabeçalho desses seis documentos para refletir essa promoção é, também, um item de governança pendente, não executado por este Blueprint.

Nenhum código, componente, rota, banco de dados ou API foi alterado para produzir este documento — conforme exigido pela Sprint que o originou.

---

## 1. Introdução

Este documento é o Blueprint arquitetural oficial do **Content Hub** — o Business Hub responsável por toda a aquisição orgânica da Adaptive Business Platform: o Modelo 01 de negócio já descrito em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, §10.1 (`Google → SEO → Blog → Landing Pages → Lead → CRM`).

O Content Hub não é apenas um Blog. Não é apenas um CMS. É um ecossistema completo de produção, gerenciamento, distribuição, otimização e conversão de conteúdo — todo conteúdo publicado por ele deve ser capaz de gerar autoridade, tráfego, leads e oportunidades comerciais, exatamente como estabelece o ESCOPO desta Sprint. Ele segue, ponto a ponto, o padrão obrigatório definido em `BUSINESS_HUB_ARCHITECTURE.md` para todo Business Hub da plataforma: Bounded Context explícito, Domain Ownership inequívoco, comunicação exclusivamente por Evento, e o checklist arquitetural de dez pontos do Capítulo 17 daquele documento.

Este documento combina, num único arquivo, o papel que o Volume I normalmente divide em dois — um Domain Blueprint (o que é o domínio, suas Entidades, suas Regras) e um Hub de arquitetura (como ele é construído tecnicamente, seus componentes, seus Eventos, sua integração) — porque foi este o formato pedido pela Sprint que o originou. Onde um conceito de arquitetura geral já foi definido em `BUSINESS_HUB_ARCHITECTURE.md` ou em `SYSTEM_BLUEPRINT.md`, ele é aplicado aqui, não reexplicado.

---

## 2. Missão

A missão do Content Hub é permitir que qualquer empresa atendida pela Adaptive Business Platform construa, gerencie e otimize sua estratégia inteira de Marketing de Conteúdo dentro da própria plataforma — sem depender de um CMS externo, de uma ferramenta de SEO separada, de um construtor de páginas de terceiros ou de uma plataforma de e-mail avulsa — e que todo conteúdo produzido seja estruturado, desde sua concepção, para gerar autoridade, tráfego orgânico, captura de lead e oportunidade comercial mensurável, convergindo sempre para o CRM Hub.

---

## 3. Visão

Que o Content Hub se torne, para qualquer empresa que capta clientes por conteúdo (Modelo 01), o único sistema de que ela precisa entre a decisão de "vamos escrever sobre isso" e a chegada de um lead qualificado ao CRM — cobrindo planejamento editorial, redação, imagem, SEO técnico e semântico, páginas de conversão, formulários, materiais para download, chamadas para ação, distribuição por newsletter, formato Web Story, e a leitura consolidada de tudo o que funcionou.

---

## 4. Objetivos Estratégicos

| # | Objetivo | Descrição |
|---|---|---|
| OE-1 | **Consolidar produção de conteúdo** | Cobrir nativamente CMS, Blog, Landing Pages, Mídia, Downloads e Web Stories — eliminando a necessidade de WordPress, um Page Builder externo ou um CDN de mídia de terceiros para operar. |
| OE-2 | **Estruturar SEO desde a concepção** | Garantir que Palavra-chave, Cluster e Estrutura técnica sejam parte do fluxo editorial, nunca uma correção aplicada depois de o conteúdo já estar escrito — princípio já registrado em `docs/requirements/growth/BLOG.md`, Capítulo 5. |
| OE-3 | **Converter tráfego em oportunidade comercial** | Formulário, CTA e Página de conversão existem para produzir um evento de negócio real (`LeadCaptured`), nunca apenas para exibir informação. |
| OE-4 | **Preservar Domain Ownership rigoroso** | Nenhuma Entidade já pertencente a outro Hub (Lead, Campaign, Attribution) é duplicada dentro do Content Hub — toda referência cruzada é feita por identificador e por Evento. |
| OE-5 | **Preparar o terreno para IA de conteúdo** | Cada módulo interno já reserva pontos de extensão para IA (Capítulo 25), sem implementá-los nesta Sprint — mesmo padrão de "contrato primeiro, implementação depois" já estabelecido para o CRM Hub em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, §19. |
| OE-6 | **Sustentar Multiempresa e Multi-idioma desde o desenho** | Toda Entidade deste Hub é isolada por Tenant, conforme `SAAS_ARCHITECTURE.md`, Capítulo 6, e admite extensão futura de tradução sem redesenho do Domain Model. |
| OE-7 | **Nunca competir com o Growth Hub** | Estratégia de campanha, atribuição e experimentação continuam pertencendo ao Growth Hub — o Content Hub referencia esses conceitos, nunca os recria. |

---

## 5. Escopo

**Dentro do escopo:** CMS Engine, Blog Manager, Landing Page Builder, SEO Manager (técnico, on-page e semântico), Media Library, Download Center, Form Builder, CTA Manager, Editorial Workflow, Newsletter Manager (autoria de conteúdo de newsletter), Web Stories Manager, e o Reporting Adapter de Content Analytics.

**Fora do escopo:** disparo de campanha de e-mail em massa e Segmentação de audiência (Growth Hub); entrega técnica de mensagem (Communication Hub, quando existente); pagamento e checkout (Commerce Hub); atribuição, funil e experimentação comparativa (Growth Hub); qualquer estado de relacionamento com Cliente (CRM Hub); mídia paga (Growth Hub, via Acquisition Channel).

---

## 6. Responsabilidades

Produção de conteúdo é responsabilidade exclusiva do Content Hub — todo Artigo, toda Página, todo Web Story nasce, é editado e é versionado dentro deste Hub.

Otimização para busca é responsabilidade do Content Hub em sua totalidade técnica e on-page (Meta Tags, Schema, Cluster, Palavra-chave, SEO Semântico) — o Growth Hub nunca duplica essa responsabilidade; quando precisa saber de onde um lead veio, consulta Attribution/Lead Source, que são conceitos distintos e já seus.

Captura de intenção comercial é responsabilidade do Content Hub através de Formulário e CTA — mas a criação do registro de relacionamento em si (`Lead`) é sempre delegada ao CRM Hub, nunca executada diretamente pelo Content Hub.

Distribuição multicanal de conteúdo já produzido é parcialmente responsabilidade do Content Hub (curadoria do que entra em uma Newsletter, derivação de um Web Story a partir de um Artigo) e parcialmente delegada — o envio de e-mail em massa permanece do Growth Hub/Communication Hub, nunca implementado dentro deste Hub.

Medição de desempenho de conteúdo é responsabilidade do Content Hub apenas como produtor de fato bruto (visualização, conversão, clique em CTA) — o cálculo de indicador consolidado, de Métrica e de KPI permanece exclusivamente do Analytics Hub, conforme ADR-004 e ADR-016 de `DOMAIN_OWNERSHIP_MATRIX.md`.

```
              LIMITES ENTRE CONTENT HUB E DEMAIS HUBS
   ┌───────────────────────────────────────────────────────────┐
   │  Content Hub produz, otimiza e captura intenção                │
   │       │                                                        │
   │       ├──► CRM Hub formaliza o Lead e o relacionamento             │
   │       ├──► Growth Hub decide Campanha, Atribuição, Experimento          │
   │       ├──► Commerce Hub processa Venda quando a Conversão é direta         │
   │       ├──► Communication Hub executa o envio técnico de mensagem               │
   │       └──► Analytics Hub consolida Métrica e KPI a partir do fato bruto             │
   └───────────────────────────────────────────────────────────┘
```

---

## 7. Arquitetura Geral

```
                              Platform
                                 │
                                 ▼
                            Content Hub
                 (Business Hub — produção e otimização
                  de conteúdo, Bounded Context próprio)
                                 │
                                 ▼
                          Business Capabilities
        (CMS, Blog, Landing Page, SEO, Mídia, Download, Formulário,
         CTA, Editorial, Newsletter, Web Story, Content Analytics)
                                 │
                                 ▼
                       Domain Model (Capítulo 22)
        (Article, Page, LandingPage, Form, MediaAsset, SEOProfile,
         WebStory, Category, ContentTag, Author, ...)
                                 │
                                 ▼
                          Domain Events (Capítulo 27)
        (publicados no Event Bus — SYSTEM_BLUEPRINT.md, Capítulo 7)
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
             CRM Hub        Growth Hub      Analytics Hub
        (cria Lead a     (Attribution,    (consolida Métrica
         partir de        Campaign,        e KPI a partir do
         LeadCaptured)    Funnel)          fato bruto)
```

```
        Content Hub                    Growth Hub
          │                                │
          │  publica LeadCaptured          │
          └───────────►  Event Bus  ◄───────────┐
                              │                    consome
                              │
                              └────────────────────────────────► CRM Hub
                                    consome, em seu próprio
                                    tempo e de forma independente

      Nenhuma seta representa uma chamada direta entre o Content
      Hub e qualquer outro Hub. Toda colaboração passa pelo Event
      Bus, exatamente como exigido por BUSINESS_HUB_ARCHITECTURE.md,
      Capítulo 6.
```

---

## 8. Conceito do Content Hub

O Content Hub é um Business Hub, na categorização de `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 1 — uma capacidade de negócio reconhecível diretamente por qualquer empresa cliente ("eu escrevo, publico e otimizo meu conteúdo aqui"), não uma conveniência técnica de organização de código nem um Platform Service.

O que o Content Hub **não é**, por definição deliberada:

- Não é apenas um Blog — o Blog Manager é um entre doze módulos internos.
- Não é apenas um CMS — CMS Engine é a fundação técnica, não o produto inteiro.
- Não é o Growth Hub — não decide Campanha, não calcula Atribuição, não roda Experimento comparativo.
- Não é o CRM Hub — não armazena Lead; ele o origina e o entrega.
- Não é o Analytics Hub — não calcula Métrica consolidada; ele produz o fato bruto que o Analytics Hub consome.

O que o Content Hub **é**: o ecossistema completo, dentro da Adaptive Business Platform, para que uma empresa transforme conhecimento e identidade em tráfego, autoridade e oportunidade comercial mensurável — a implementação viva do Modelo 01 descrito em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`.

---

## 9. Módulos Internos

O Content Hub se divide em doze Módulos Internos — a unidade de Capacidade de Negócio na granularidade já estabelecida em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 12. Cada um é detalhado em seu próprio capítulo a seguir (10–21), sempre com a mesma estrutura: Objetivo, Responsabilidades, Funcionalidades, Fluxos, Dependências, Eventos, Integrações e Limites do domínio.

```
                    MÓDULOS INTERNOS DO CONTENT HUB
   ┌───────────────────────────────────────────────────────────┐
   │  Fundação:        CMS Engine                                   │
   │                                                                │
   │  Produção:        Blog Manager · Landing Page Builder ·           │
   │                    Web Stories Manager                               │
   │                                                                │
   │  Otimização:      SEO Manager                                           │
   │                                                                │
   │  Ativos:          Media Library · Download Center                          │
   │                                                                │
   │  Conversão:       Form Builder · CTA Manager                                  │
   │                                                                │
   │  Processo:        Editorial Workflow                                             │
   │                                                                │
   │  Distribuição:    Newsletter Manager                                                │
   │                                                                │
   │  Medição:         Content Analytics                                                    │
   └───────────────────────────────────────────────────────────┘
```

---

## 10. CMS Engine

**Objetivo.** Ser a fundação técnica genérica de conteúdo estruturado sobre a qual todos os demais módulos operam — a camada que sabe criar, versionar, categorizar e publicar qualquer unidade de conteúdo, sem conhecer a especificidade de um Artigo de Blog ou de uma Página de conversão.

**Responsabilidades.** Manter o ciclo de vida genérico de uma unidade de conteúdo (rascunho → revisão → publicado → arquivado); administrar Category e ContentTag; administrar Author; garantir Versionamento e Histórico de qualquer conteúdo publicado.

**Funcionalidades.** Criação e edição de conteúdo estruturado; categorização e etiquetagem; controle de versão com Histórico completo; lixeira/recuperação antes de exclusão definitiva; multi-idioma (reservado, Capítulo 34).

**Fluxos.** `Content criado → Content em rascunho → Content revisado → Content publicado → Content arquivado`, o mesmo esqueleto de estados reaproveitado por Article, Page, LandingPage e WebStory (Capítulo 23).

**Dependências.** Identity Hub (quem pode publicar); Business Hub (Segmento/identidade visual aplicada ao conteúdo, quando relevante).

**Eventos.** Nenhum Evento próprio — o CMS Engine é infraestrutura interna consumida pelos demais módulos, que publicam seus próprios Eventos (`ArticlePublished`, `LandingPagePublished`, etc.).

**Integrações.** Nenhuma integração externa direta — toda integração externa passa pelos módulos especializados que o consomem.

**Limites do domínio.** O CMS Engine nunca decide estratégia de SEO, nunca captura Lead, nunca processa pagamento — ele é puramente estrutural.

---

## 11. Blog Manager

**Objetivo.** Ser o centro de produção de conteúdo de longa duração do Content Hub — absorvendo integralmente a especificação já registrada em `docs/requirements/growth/BLOG.md`, agora como módulo interno do Content Hub em vez de módulo do Growth Hub.

**Responsabilidades.** Ciclo de vida completo de um Article (Capítulo 23); Calendário Editorial (partilhado com Editorial Workflow, Capítulo 18); Categorias e Tags de conteúdo; Autores; Biblioteca de Templates de artigo.

**Funcionalidades.** Planejamento (Ideia, Pesquisa, Briefing); Redação; inserção de Imagem/Vídeo (via Media Library); aplicação de SEO (via SEO Manager); Revisão e Aprovação; Publicação; Distribuição; Monitoramento; Atualização; Arquivamento — o mesmo Ciclo de Vida de 16 etapas já detalhado em `docs/requirements/growth/BLOG.md`, Capítulo 5, preservado integralmente e reproduzido no Capítulo 23 deste documento.

**Fluxos.** Ver Capítulo 23 (Ciclo de Vida Editorial) e Capítulo 24 (Fluxo de Captura de Lead a partir de um Artigo).

**Dependências.** CMS Engine (fundação); SEO Manager (palavra-chave e estrutura, nunca o inverso — mesma fronteira já registrada em `docs/requirements/growth/BLOG.md`, Capítulo 8); Media Library; Editorial Workflow.

**Eventos.** `ArticleCreated`, `ArticleUpdated`, `ArticlePublished`, `ArticleFlaggedForUpdate`, `ArticleArchived` (Capítulo 27).

**Integrações.** Integration Hub (destino WordPress ou equivalente, quando aplicável); AI Hub (Redator/SEO/Designer Agent, Capítulo 25); CRM Hub (quando o Artigo captura Lead diretamente, sem Landing Page separada).

**Limites do domínio.** O Blog Manager não decide palavra-chave-alvo nem Cluster (SEO Manager decide; o Blog consome); não gerencia campanha de mídia paga (Growth Hub); não é o CRM.

---

## 12. Landing Page Builder

**Objetivo.** Criar, publicar e otimizar páginas de conversão dedicadas — o destino de Campanhas do Growth Hub e de tráfego orgânico do próprio Content Hub — absorvendo a especificação já registrada em `docs/requirements/growth/LANDING_PAGES.md`.

**Responsabilidades.** Ciclo de vida de LandingPage (Capítulo 22); construção visual via Templates; associação de Form e de CTA; Página de agradecimento (Thank You Page) pós-conversão; entrega de material (Lead Magnet, via Download Center).

**Funcionalidades.** Page Builder visual; biblioteca de Templates por objetivo (captura de Lead, venda direta, download); publicação; Thank You Page; medição de Taxa de conversão por página (fato bruto, consumido pelo Analytics Hub).

**Fluxos.** `Tráfego (Growth Hub ou orgânico) → LandingPage → Form → FormSubmission → LeadCaptured → ThankYouPage`, detalhado no Capítulo 24.

**Dependências.** CMS Engine; Media Library (Criativo reaproveitado); Form Builder; CTA Manager; SEO Manager (Meta Tags da própria página).

**Eventos.** `LandingPagePublished`, `LandingPageArchived`, `LeadCaptured` (publicado em conjunto com Form Builder).

**Integrações.** Growth Hub (referencia Acquisition Channel/Lead Source por identificador, nunca duplica — decisão registrada em ADR-CH-004, Capítulo 35); Commerce Hub (quando a conversão é uma venda direta); CRM Hub (consumidor de `LeadCaptured`).

**Limites do domínio.** Não gera tráfego — recebe o que Growth Hub ou o próprio Blog Manager já direcionaram. Não decide qual Variante testar de forma comparativa — quando um teste A/B é necessário, o Landing Page Builder fornece as versões candidatas de conteúdo, mas a orquestração da comparação, o critério estatístico e a seleção de vencedor pertencem ao Experiment/A/B Test/Variant do Growth Hub (decisão de fronteira registrada em ADR-CH-002, Capítulo 35 — nenhuma Entidade de teste A/B é duplicada aqui).

---

## 13. SEO Manager

**Objetivo.** Garantir que todo conteúdo produzido pelo Content Hub seja estruturado, técnica e semanticamente, para ser encontrado organicamente — absorvendo integralmente `docs/requirements/growth/SEO.md`, agora como módulo interno do Content Hub, não como módulo irmão do Blog dentro de um Growth Hub monolítico.

**Responsabilidades.** Pesquisa de Palavra-chave; organização em ContentCluster; SEO Semântico (Entidade, NLP, LSI); Otimização on-page (Meta Tags, Heading, URL, Alt Text, Schema); Auditoria técnica; detecção de Canibalização e de Conteúdo Desatualizado; SEOProfile por unidade de conteúdo.

**Funcionalidades.** Ver detalhamento completo no Capítulo 24 (Arquitetura de SEO) — este capítulo cobre integralmente os dezoito subtemas exigidos pela Sprint (SEO Técnico, On Page, Off Page, Meta Tags, Canonical, Robots, Sitemap, Open Graph, Structured Data, Schema.org, Rich Snippets, Core Web Vitals, NLP, Salience Score, LSI, Google Discover, Internal Linking, Taxonomia).

**Fluxos.** `Pesquisa → Cluster → Estrutura (entregue ao Blog Manager/Landing Page Builder) → Otimização on-page → Publicação → Monitoramento → Auditoria contínua`.

**Dependências.** Blog Manager e Landing Page Builder (consumidores diretos — o SEO Manager decide direção, os demais decidem produção, mesma fronteira já registrada em `docs/requirements/growth/BLOG.md`, Capítulo 8); Integration Hub (Search Console, Analytics externo).

**Eventos.** `SEOOptimized`, `ContentClusterUpdated`, `ContentFlaggedOutdated`, `KeywordCanibalizationDetected`.

**Integrações.** Integration Hub (Google Search Console, Google Analytics, Rank Math/WordPress quando aplicável); AI Hub (SEO Agent, Capítulo 25); Analytics Hub (consumidor do fato bruto de Monitoramento).

**Limites do domínio.** O SEO Manager não produz o conteúdo em si (Blog Manager/Landing Page Builder); não gerencia mídia paga (Growth Hub); não decide orçamento.

---

## 14. Media Library

**Objetivo.** Ser o repositório central e reutilizável de todo ativo de mídia — imagem, vídeo, áudio — produzido ou usado por qualquer módulo do Content Hub.

**Responsabilidades.** Armazenamento e organização de MediaAsset; metadado técnico (dimensão, formato, peso, Alt Text); reuso entre Artigo, LandingPage, WebStory e Newsletter, evitando duplicação de upload.

**Funcionalidades.** Upload; organização por pasta/etiqueta; otimização de peso/formato (relevante a Core Web Vitals, Capítulo 24); busca; reutilização cross-módulo.

**Fluxos.** `Upload → Processamento (otimização técnica) → Disponível para reuso → Associado a um ou mais Content`.

**Dependências.** CMS Engine; Integration Hub (CDN externo, quando aplicável).

**Eventos.** `MediaAssetUploaded`.

**Integrações.** Integration Hub (armazenamento/CDN externo); AI Hub (Designer Agent, geração/curadoria assistida).

**Limites do domínio.** Não decide onde uma imagem é usada — apenas a disponibiliza; a decisão de uso pertence ao módulo consumidor (Blog Manager, Landing Page Builder, Web Stories Manager).

---

## 15. Download Center

**Objetivo.** Administrar material para download — Lead Magnet, e-book, material técnico — oferecido como incentivo de conversão dentro de uma LandingPage ou de um Artigo.

**Responsabilidades.** Ciclo de vida de um Download (upload, publicação, controle de acesso); entrega automática pós-conversão (Thank You Page); contagem de download como fato bruto.

**Funcionalidades.** Upload de material; associação a um Form/CTA como incentivo; entrega imediata após `LeadCaptured`; controle de expiração de link, quando aplicável.

**Fluxos.** `Download associado a um Form → FormSubmission → LeadCaptured → DownloadCompleted (entrega)`.

**Dependências.** Media Library (armazenamento do arquivo); Form Builder (o Form que condiciona a entrega); Landing Page Builder.

**Eventos.** `DownloadCompleted`.

**Integrações.** CRM Hub (o Download consumido é uma Atividade relevante de relacionamento, registrada como fato pelo CRM ao consumir o Evento).

**Limites do domínio.** Não decide se o Download exige captura de Lead — essa decisão é de configuração de cada LandingPage/Form; o Download Center apenas executa a entrega.

---

## 16. Form Builder

**Objetivo.** Capturar dado estruturado de um visitante, dentro de um Artigo, de uma LandingPage ou de um Web Story, transformando tráfego anônimo em intenção comercial identificável.

**Responsabilidades.** Ciclo de vida de Form e de FormField; validação de submissão; produção do fato `FormSubmitted`; quando o Form representa intenção comercial (não apenas newsletter), produção adicional do fato `LeadCaptured`.

**Funcionalidades.** Construtor de campo (texto, e-mail, telefone, seleção); validação client-side e server-side; anti-spam; redirecionamento pós-submissão (Thank You Page).

**Fluxos.** Ver Capítulo 24 (Fluxo de Captura de Lead).

**Dependências.** CMS Engine; Landing Page Builder e Blog Manager (onde o Form é embutido).

**Eventos.** `FormSubmitted`, `LeadCaptured`, `NewsletterSubscriptionRequested` (quando o Form é especificamente de assinatura de newsletter).

**Integrações.** CRM Hub (consumidor de `LeadCaptured`, cria seu próprio `Lead`); Growth Hub (consumidor de `NewsletterSubscriptionRequested` para associação a Audience); Identity Hub (quando o Form exige autenticação, incomum mas admitido).

**Limites do domínio.** O Form Builder nunca cria um `Lead` — ele publica o fato `LeadCaptured`; a criação da Entidade `Lead` em si é sempre e exclusivamente responsabilidade do CRM Hub. Esta é a regra de negócio mais importante deste módulo, detalhada em ADR-CH-001 (Capítulo 35).

---

## 17. CTA Manager

**Objetivo.** Administrar Chamadas para Ação (CTA) — o elemento de interface que direciona um visitante à conversão desejada, dentro de um Artigo, de uma LandingPage ou de um Web Story.

**Responsabilidades.** Ciclo de vida de CallToAction; associação a um destino (Form, LandingPage, Download, link externo mediado pelo Integration Hub); rastreamento de clique como fato bruto.

**Funcionalidades.** Editor de CTA (texto, estilo, posição); teste de variação textual (delegado ao Growth Hub quando comparativo, mesma fronteira do Capítulo 12); rastreamento de conversão.

**Fluxos.** `CTA exibida → Clique → Destino (Form/LandingPage/Download) → Conversão`.

**Dependências.** CMS Engine; Landing Page Builder, Blog Manager e Web Stories Manager (onde a CTA é embutida); Business Hub (identidade visual aplicada ao estilo da CTA, herdada do Smart Business Identity já descrito em `PLATFORM_MANIFESTO.md`).

**Eventos.** `CTAConverted`.

**Integrações.** Growth Hub (quando a CTA é parte de um Experiment comparativo).

**Limites do domínio.** A CTA Manager não decide estratégia de campanha — apenas executa e mede a chamada à ação dentro do próprio conteúdo.

---

## 18. Editorial Workflow

**Objetivo.** Formalizar o processo pelo qual todo conteúdo — Artigo, LandingPage, Web Story — passa antes de ser publicado, absorvendo a Gestão Editorial já registrada em `docs/requirements/growth/BLOG.md`, Capítulo 4, e generalizando-a para todos os tipos de conteúdo do Content Hub, não apenas o Artigo.

**Responsabilidades.** Calendário Editorial; Status de conteúdo (Ideia, Em produção, Em revisão, Aguardando aprovação, Publicado, Desatualizado, Arquivado); Prioridade; Aprovação (checkpoint humano obrigatório antes de publicar).

**Funcionalidades.** Planejamento e priorização; visualização temporal (Calendário); fluxo de Revisão e Aprovação; disparo de Atualização quando o SEO Manager sinaliza queda de desempenho.

**Fluxos.** Ver Capítulo 23 (Ciclo de Vida Editorial completo).

**Dependências.** Todos os módulos de produção (Blog Manager, Landing Page Builder, Web Stories Manager) consomem o Editorial Workflow para governar seu próprio ciclo de vida.

**Eventos.** Nenhum Evento próprio adicional — o Editorial Workflow governa transições de estado que resultam nos Eventos já catalogados pelos módulos de produção (`ArticlePublished`, `LandingPagePublished`, `StoryPublished`).

**Integrações.** Identity Hub (Permissão de quem aprova); AI Hub (Marketing Agent propondo Ideias e priorizando o Calendário, Capítulo 25).

**Limites do domínio. Nenhum conteúdo pula etapa do fluxo editorial — nem mesmo conteúdo gerado por IA, que continua sujeito a Aprovação humana antes de publicar, aplicação direta do princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5.

---

## 19. Newsletter Manager

**Objetivo.** Curar e compor o conteúdo de uma edição de newsletter a partir de material já produzido pelo Blog Manager, absorvendo a dimensão de conteúdo (não de disparo) já registrada em `docs/requirements/growth/EMAIL_MARKETING.md`.

**Responsabilidades.** Ciclo de vida de NewsletterIssue (curadoria de quais Artigos entram em uma edição, layout, texto de introdução); nunca a Lista de destinatários, nunca o disparo em massa, nunca a métrica de abertura/clique.

**Funcionalidades.** Seleção de Artigos recentes; template de e-mail; pré-visualização; publicação da edição como artefato pronto para envio.

**Fluxos.** `Artigos selecionados → NewsletterIssue composta → NewsletterIssuePublished → entregue ao Growth Hub (Campaign) + Communication Hub (Delivery)`.

**Dependências.** Blog Manager (fonte de conteúdo); Media Library.

**Eventos.** `NewsletterIssuePublished`.

**Integrações.** Growth Hub (dono de Audience/Segment/Campaign — recebe a NewsletterIssue como conteúdo de uma Campaign a ser criada e disparada por ele); Communication Hub (execução técnica de entrega, quando existente).

**Limites do domínio.** Esta é a fronteira mais frequentemente mal-entendida do Content Hub, e por isso registrada explicitamente: o Newsletter Manager **não envia e-mail, não mantém Lista de contato, não mede Taxa de abertura** — essas três responsabilidades já pertencem, respectivamente, ao Communication Hub (execução), ao Growth Hub (Audience/Segment/Campaign) e ao Analytics Hub (indicador consolidado). O Newsletter Manager entrega apenas o conteúdo pronto — decisão de fronteira registrada em ADR-CH-003 (Capítulo 35).

---

## 20. Web Stories Manager

**Objetivo.** Transformar conteúdo já publicado pelo Blog Manager em formato curto e visual (Web Story/AMP Story), absorvendo integralmente `docs/requirements/growth/WEB_STORIES.md`.

**Responsabilidades.** Ciclo de vida de WebStory e de StorySlide; derivação a partir de um Article; publicação no formato técnico exigido (estrutura AMP, Dados estruturados).

**Funcionalidades.** Seleção de trecho/imagem de um Artigo de origem; montagem de Slide (Imagem/Vídeo, Transição, Legenda); Capa (Cover); Dados estruturados; publicação.

**Fluxos.** `ArticlePublished (origem) → Seleção de trechos/imagens → Slides montados → SEOProfile (Schema) aplicado → StoryPublished`.

**Dependências.** Blog Manager (fonte); Media Library; SEO Manager (Dados estruturados/Schema exigidos pelo formato).

**Eventos.** `StoryPublished`.

**Integrações.** Integration Hub (destino técnico de publicação — WordPress/CDN, mesmo Connector do Blog Manager); AI Hub (Designer Agent/derivação assistida, Capítulo 25).

**Limites do domínio.** O Web Stories Manager não produz conteúdo original — deriva exclusivamente do que o Blog Manager já publicou, mesmo limite já registrado em `docs/requirements/growth/WEB_STORIES.md`, §2.

---

## 21. Content Analytics

**Objetivo.** Expor o fato bruto de desempenho de todo conteúdo do Content Hub a quem precisa consumi-lo — nunca calcular, ele mesmo, Métrica ou KPI consolidado, responsabilidade exclusiva do Analytics Hub.

**Responsabilidades.** Reporting Adapter que consolida, dentro do próprio Content Hub, os fatos já publicados (visualização, conversão de CTA, submissão de Form, download) em um Read Model de leitura interna, consumido pelo Dashboard do Content Hub e pelo Analytics Hub.

**Funcionalidades.** Painel interno de desempenho por Artigo/LandingPage/WebStory; alerta de queda de desempenho (consumido pelo SEO Manager para disparar Atualização); exportação de fato bruto ao Analytics Hub.

**Fluxos.** `Fato bruto publicado (visualização/conversão/submissão) → Read Model interno → Reporting Adapter → Analytics Hub (cálculo de Métrica/KPI consolidado)`.

**Dependências.** Todos os demais módulos internos, como produtores do fato bruto.

**Eventos.** Nenhum Evento de domínio próprio — consome os Eventos já publicados pelos demais módulos (Capítulo 27) para materializar seu Read Model interno.

**Integrações.** Analytics Hub (consumidor primário); Integration Hub (Google Analytics/Search Console como fonte externa complementar de comportamento de tráfego, já registrada em `docs/requirements/growth/BLOG.md`, Capítulo 7).

**Limites do domínio.** Content Analytics nunca é citado, em nenhuma circunstância, como proprietário de `Metric`, `KPI`, `Dashboard` ou `Report` — esses quatro termos permanecem exclusivamente do Analytics Hub, conforme `DOMAIN_OWNERSHIP_MATRIX.md`, linha "Dashboard | Analytics Hub | Todos". A violação equivalente a esta fronteira já está catalogada como "Duplicação silenciosa de indicador" naquele documento, Capítulo 10.

---

## 22. Entidades do Domínio

### Pertence ao Content Hub

| Conceito | Objetivo | Proprietário do domínio | Relacionamentos | Ciclo de vida |
|---|---|---|---|---|
| Article | Unidade central de conteúdo de longa duração. | Blog Manager | Tem Category, ContentTag[], Author, MediaAsset[], SEOProfile. Pode originar WebStory e NewsletterIssue. | Ideia → Rascunho → Revisão → Aprovação → Publicado → Desatualizado → Arquivado. |
| ArticleVersion | Snapshot imutável de uma revisão de Article. | Blog Manager | Pertence a um Article. | Criada a cada publicação/atualização; nunca editada, apenas criada. |
| ContentBrief | Documento-guia de um Article antes da Redação. | Editorial Workflow | Pertence a um Article em produção. | Criado → Consumido pela Redação → Arquivado com o Article. |
| Category | Agrupamento temático amplo de conteúdo. | CMS Engine | Associada a Article, Page, WebStory. | Criada → Ativa → Arquivada. |
| ContentTag | Marcação granular de conteúdo (nome deliberadamente distinto de `Tag`, já proprietário do CRM Hub — ver Capítulo 35, ADR-CH-005). | CMS Engine | Associada a qualquer unidade de conteúdo. | Criada → Ativa → Arquivada. |
| Author | Autoria editorial — humana ou Agente de IA. | CMS Engine | Referencia um usuário do Identity Hub por identificador, quando humano; nunca duplica a Entidade `Identity`. | Criado → Ativo → Inativo. |
| ContentTemplate | Estrutura reutilizável (de Artigo ou de Página). | CMS Engine | Usado por Article, LandingPage, Page. | Criado → Publicado → Arquivado. |
| EditorialCalendar / EditorialSlot | Visão temporal do que está planejado/em produção/publicado. | Editorial Workflow | Referencia Article/LandingPage/WebStory por identificador. | Slot criado → Ocupado → Concluído. |
| Page | Página institucional genérica (não focada em conversão). | CMS Engine | Tem SEOProfile. | Rascunho → Publicada → Arquivada. |
| LandingPage | Página de conversão dedicada. | Landing Page Builder | Tem Form, CallToAction[], SEOProfile; referencia Acquisition Channel (Growth Hub) por identificador. | Rascunho → Publicada → Arquivada. |
| MediaAsset | Imagem, vídeo ou áudio reutilizável. | Media Library | Associado a Article, LandingPage, WebStory, NewsletterIssue. | Enviado → Processado → Disponível → Arquivado. |
| Download | Material para download (Lead Magnet). | Download Center | Associado a um Form/LandingPage/Article. | Enviado → Publicado → Arquivado. |
| Form | Formulário de captura embutido em conteúdo. | Form Builder | Tem FormField[]; embutido em Article ou LandingPage. | Criado → Publicado → Arquivado. |
| FormField | Campo individual de um Form. | Form Builder | Pertence a um Form. | Definido junto ao Form. |
| FormSubmission | Registro de uma submissão de Form — o fato bruto, nunca o `Lead` em si. | Form Builder | Referencia um Form; opcionalmente referencia um `Lead` já criado pelo CRM Hub, por identificador, após consumo do Evento correspondente. | Criada no momento da submissão; imutável. |
| CallToAction | Elemento de chamada à ação. | CTA Manager | Embutido em Article, LandingPage ou WebStory; aponta a um destino (Form, Download, link). | Criada → Publicada → Arquivada. |
| NewsletterIssue | Edição curada de newsletter, pronta para envio. | Newsletter Manager | Composta por Article[] selecionados. | Rascunho → Publicada (entregue ao Growth Hub) → Enviada (fato de fora do Content Hub). |
| WebStory | Formato curto e visual derivado de um Article. | Web Stories Manager | Deriva de um Article; composta por StorySlide[]. | Rascunho → Publicada → Arquivada. |
| StorySlide | Slide individual de um WebStory. | Web Stories Manager | Pertence a um WebStory. | Criado junto à WebStory. |
| SEOProfile | Metadado técnico de SEO de uma unidade de conteúdo. | SEO Manager | Associado a Article, Page, LandingPage ou WebStory (um-para-um). | Criado junto ao conteúdo → Atualizado continuamente. |
| Keyword | Termo de busca alvo ou relacionado. | SEO Manager | Associada a um ou mais ContentCluster; referenciada por SEOProfile. | Descoberta → Priorizada → Monitorada → Descontinuada. |
| ContentCluster | Agrupamento temático de conteúdo com Página Pilar e Artigos Satélites. | SEO Manager | Composto por um Article "Pilar" e Article[] "Satélites". | Criado → Ativo → Reestruturado → Arquivado. |

### Não pertence ao Content Hub

| Conceito | Hub proprietário |
|---|---|
| Lead | CRM Hub — `DOMAIN_OWNERSHIP_MATRIX.md` |
| Customer, Contact, Organization | CRM Hub |
| Campaign, Audience, Audience Segment, Funnel, Experiment, A/B Test, Variant, Attribution, Attribution Model, Lead Source, Acquisition Channel, Referral | Growth Hub — `GROWTH_DOMAIN_BLUEPRINT.md` |
| Conversation, Message, Delivery | Communication Hub |
| Invoice, Payment | Finance Hub / Commerce Hub (quando formalizado) |
| Dashboard, Widget, Report, Metric, KPI | Analytics Hub |
| Identity, Authentication, Permission | Identity Hub |
| AI Prompt, AI Model, AI Decision | AI Hub |
| Business Profile, Segment (Empresa), Brand Theme | Business Profile Engine / Branding Hub |
| Tag (CRM) | CRM Hub — distinto de `ContentTag`, ver ADR-CH-005 |

O Content Hub nunca acessa diretamente `Lead`, `Campaign`, `Customer` ou qualquer outra Entidade listada acima — quando precisa referenciar um Acquisition Channel do Growth Hub, por exemplo, o faz através de identificador, resolvido por Anti-Corruption Layer, nunca por leitura direta da estrutura interna do Growth Hub.

---

## 23. Fluxos Operacionais

### 23.1 Ciclo de Vida Editorial (Article)

```
Ideia → Pesquisa → Briefing → Palavras-chave → Estrutura → Redação → Imagens →
Vídeos → SEO → Revisão → Aprovação → Publicação → Distribuição →
Monitoramento → Atualização → Arquivamento
```

Este ciclo preserva integralmente as dezesseis etapas já especificadas em `docs/requirements/growth/BLOG.md`, Capítulo 5 — nenhuma etapa foi removida, renomeada ou reordenada. A etapa **Atualização**, quando disparada, retorna o Article a um estado anterior do ciclo (tipicamente Redação/SEO), nunca reinicia do zero.

### 23.2 Fluxo de Captura de Lead

```
   Content Hub                                    CRM Hub
      │                                              │
      │  Visitante preenche Form (LandingPage        │
      │  ou Article)                                 │
      │      │                                       │
      │      ▼                                       │
      │  FormSubmission criada                        │
      │      │                                       │
      │      ▼                                       │
      │  Event Publisher ──► LeadCaptured ──────────►│
      │                                              │  consome LeadCaptured
      │                                              │      │
      │                                              │      ▼
      │                                              │  cria Lead
      │                                              │      │
      │                                              │      ▼
      │                                              │  Event Publisher ──► LeadCreated
      │                                              │
      │  ThankYouPage exibida ao visitante            │
      │  DownloadCompleted (se aplicável)              │
```

Este fluxo é a aplicação direta, ao Content Hub, do padrão de Anti-Corruption Layer já demonstrado em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 18, Caso de Uso "CRM": o Content Hub nunca cria a Entidade `Lead` — ele publica o fato de que uma intenção comercial foi capturada, e o CRM Hub, único proprietário de `Lead`, decide como e quando formalizá-la.

### 23.3 Fluxo de Derivação de Web Story

```
Article publicado → SEO Manager confirma Cluster/Schema base →
Seleção de trechos/imagens → Slides montados (Media Library) →
SEOProfile próprio da WebStory → Publicação → StoryPublished
```

### 23.4 Fluxo de Newsletter

```
Blog Manager (Article recentes) → Newsletter Manager (curadoria) →
NewsletterIssue composta → NewsletterIssuePublished →
Growth Hub (cria Campaign de e-mail) → Communication Hub (executa envio)
→ Analytics Hub (consolida Open Rate/CTR)
```

### 23.5 Fluxo de Atualização por Sinal de SEO

```
SEO Manager detecta queda de posição/tráfego (Monitoramento) →
ContentFlaggedOutdated publicado → Editorial Workflow move o
Article de volta a "Em revisão" → Atualização executada → Article
republicado → Monitoramento reinicia
```

---

## 24. Arquitetura de SEO

Este capítulo cobre, em profundidade, o conjunto completo de subtemas de SEO exigido pela Sprint que originou este documento — absorvendo integralmente `docs/requirements/growth/SEO.md`, reorganizado sob o SEO Manager do Content Hub.

**SEO Técnico.** Cobertura de indexação, velocidade de carregamento, ausência de erro de rastreamento — pré-condição estrutural para qualquer resultado orgânico, monitorada continuamente via Auditoria.

**SEO On Page.** Título, Heading (H1-H2-H3), densidade e posicionamento de Palavra-chave, Alt Text, URL descritiva — todo ajustado dentro do próprio conteúdo, responsabilidade compartilhada entre o SEO Manager (direção) e o Blog Manager/Landing Page Builder (execução dentro do fluxo editorial), exatamente na mesma fronteira já registrada em `docs/requirements/growth/BLOG.md`, Capítulo 8.

**SEO Off Page.** Backlink recebido de terceiros (autoridade externa) e link concedido a terceiros dentro do próprio conteúdo — monitorado pelo SEO Manager, sem que o Content Hub controle diretamente o comportamento de sites externos (fora de seu Bounded Context).

**Meta Tags.** Título e Meta Description aplicados a todo `SEOProfile`, determinantes de CTR na SERP.

**Canonical.** URL canônica declarada por `SEOProfile`, evitando que múltiplas variações de uma mesma Página concorram entre si por indexação — mecanismo direto de prevenção de Canibalização quando duas URLs distintas representam, na prática, o mesmo conteúdo.

**Robots.** Diretiva de indexação/rastreamento por unidade de conteúdo (indexável, não indexável, seguir/não seguir links), parte do `SEOProfile`.

**Sitemap.** Mapa consolidado de todo conteúdo publicado e indexável do Tenant, gerado automaticamente a partir do CMS Engine, exposto ao Integration Hub para submissão a mecanismos de busca.

**Open Graph.** Metadado de compartilhamento social (título, imagem, descrição) aplicado a todo conteúdo publicável, derivado de `SEOProfile` e de `MediaAsset` associado.

**Structured Data / Schema.org.** Dado estruturado aplicado ao conteúdo publicado — Article, FAQPage, Product (quando o Commerce Hub estiver integrado), Recipe e demais tipos relevantes — condição de elegibilidade para Rich Snippets e, no caso de Web Stories, para a superfície de descoberta específica do formato.

**Rich Snippets.** Resultado enriquecido na SERP (estrelas, FAQ, receita), consequência direta de Schema corretamente aplicado — nenhuma ação isolada além de garantir que o `SEOProfile` publicado seja válido.

**Core Web Vitals.** Métrica técnica de performance/experiência (velocidade de carregamento, estabilidade visual, responsividade de interação) que afeta tanto ranqueamento quanto experiência real de quem visita — monitorada pelo SEO Manager através de Auditoria contínua, com peso direto na Otimização de imagem já responsabilidade da Media Library.

**NLP (Processamento de Linguagem Natural).** Análise do significado do conteúdo, não apenas das palavras literais, aplicada para identificar Entidade e Contexto dentro de um Article — insumo direto do SEO Semântico.

**Salience Score.** Medida de relevância relativa de uma Entidade dentro de um conteúdo — quanto mais central uma Entidade é ao tema do Article, maior seu Salience Score, orientando priorização de Internal Linking e de reforço semântico.

**LSI (Latent Semantic Indexing).** Termos semanticamente relacionados ao termo principal, usados para reforçar relevância temática sem repetição mecânica da mesma Palavra-chave — insumo direto da etapa de Redação, entregue pelo SEO Manager antes da produção do texto.

**Google Discover.** Superfície de descoberta baseada em interesse e comportamento, não em busca ativa — elegibilidade depende de Schema, de Core Web Vitals e de qualidade editorial consistente; especialmente relevante ao Web Stories Manager, cujo formato é estruturalmente alinhado a essa superfície.

**Internal Linking.** Malha de links entre conteúdos do próprio Tenant, reforçando a estrutura de um `ContentCluster` — conexão entre a Página Pilar e seus Artigos Satélites, e entre Satélites relacionados entre si.

**Taxonomia.** A estrutura hierárquica de `Category` e `ContentTag` que organiza todo o catálogo de conteúdo — base sobre a qual `ContentCluster` é formado e sobre a qual a Navegação do próprio site se apoia.

```
                    ARQUITETURA DE SEO DENTRO DO CONTENT HUB
   ┌───────────────────────────────────────────────────────────┐
   │  Estratégia:      Keyword Research · ContentCluster                │
   │                                                                │
   │  Semântico:       Entidade · NLP · Salience Score · LSI               │
   │                                                                │
   │  Técnico:         Meta Tags · Canonical · Robots · Sitemap ·             │
   │                    Open Graph · Schema.org · Core Web Vitals                │
   │                                                                │
   │  Estrutural:       Internal Linking · Taxonomia                                 │
   │                                                                │
   │  Monitoramento:    Auditoria · Canibalização · Conteúdo                            │
   │                    Desatualizado · Rich Snippets · Google Discover                     │
   └───────────────────────────────────────────────────────────┘
```

---

## 25. IA aplicada ao Content Hub

Nenhuma capacidade descrita neste capítulo é implementada nesta Sprint — apenas o contrato de responsabilidade é registrado, seguindo o mesmo padrão de "preparação sem implementação prematura" já aplicado ao CRM Hub em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, §19, e ao AI Hub em `AI_HUB.md`.

**Geração de artigos.** O Redator Agent (já com precedente parcial real em `docs/requirements/growth/BLOG.md`, Capítulo 6 — `BlogAgent`/`BlogAgentExecutor`) produziria o texto de um Article a partir de um `ContentBrief` já aprovado, nunca decidindo sozinho o que produzir.

**Revisão.** Um Agente de revisão checaria aderência ao `ContentBrief` e qualidade editorial antes da etapa de Aprovação humana — nunca substituindo essa Aprovação.

**SEO.** O SEO Agent executaria Pesquisa de Palavra-chave, formação de `ContentCluster` e Auditoria técnica contínua, entregando direção ao Redator Agent antes da Redação começar — mesma fronteira já registrada em `docs/requirements/growth/SEO.md`, Capítulo 8.

**Palavras-chave.** Sugestão de `Keyword` prioritária a partir de oportunidade identificada (Volume, Intenção, Dificuldade, Sazonalidade).

**Clusters.** Sugestão automática de reorganização de `ContentCluster` a partir do catálogo já existente, identificando Página Pilar candidata e lacunas de Artigo Satélite.

**FAQs.** Geração assistida de blocos de Perguntas Frequentes elegíveis a Rich Snippet (Schema `FAQPage`), a partir do conteúdo já existente de um Article.

**Landing Pages.** Geração assistida de estrutura e copy de uma `LandingPage` a partir de um objetivo de conversão declarado.

**CTAs.** Geração e sugestão de variação textual de `CallToAction`, com comparação delegada ao Growth Hub quando testada comparativamente (Capítulo 12).

**Web Stories.** Seleção assistida de trechos/imagens de um `Article` de origem e montagem inicial de `StorySlide`, sempre revisável antes da publicação.

**Calendário editorial.** Sugestão de prioridade e sequenciamento de `EditorialSlot`, a partir de oportunidade identificada pelo SEO Manager e de meta de negócio do Business Hub.

**Recomendações.** Recomendação acionável de Oportunidade (nova Palavra-chave, Cluster incompleto, conteúdo candidato a Atualização), sempre como sugestão — nunca como ação autoexecutável, aplicação direta do princípio Human Oversight.

**Análise de concorrência.** Leitura assistida de conteúdo de terceiros já posicionado para uma mesma Palavra-chave/Cluster, identificando lacuna de abordagem ainda não coberta pelo Tenant.

Toda capacidade acima é consumida através do contrato já estabelecido em `AI_HUB.md` — o Content Hub nunca implementa lógica de inteligência artificial própria, aplicação direta do princípio já fixado em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 14.

---

## 26. Integração com os demais Hubs

**CRM Hub.** Consome `LeadCaptured` para criar sua própria Entidade `Lead`, publicando `LeadCreated` em resposta — o Content Hub nunca cria `Lead` diretamente (Capítulo 23.2). O CRM Hub também consome `DownloadCompleted` como registro de Atividade de relacionamento.

**Conversation Hub.** Quando existente, pode consumir `LeadCaptured` originado de um formulário que solicita contato imediato, iniciando uma conversa — decisão de orquestração que pertence ao Automation Engine, nunca ao Content Hub diretamente.

**Marketing Hub / Growth Hub.** Consome `NewsletterIssuePublished` para criar e disparar a Campaign de e-mail correspondente; consome `LeadCaptured`/`NewsletterSubscriptionRequested` para atualização de Audience/Audience Segment; fornece Acquisition Channel/Lead Source referenciados por LandingPage e Article.

**Commerce Hub.** Consome `CTAConverted`/`FormSubmitted` quando a conversão de uma LandingPage é uma venda direta de produto digital, iniciando seu próprio fluxo de Pedido — o Content Hub nunca processa pagamento.

**Business Hub.** Fornece Segmento e Identidade Visual (Smart Business Identity) que o Content Hub consome para adaptar automaticamente Template, vocabulário sugerido pela IA, e estilo visual de LandingPage/CTA — mesmo padrão de consumo já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 14.

**AI Hub.** Consumido por todos os módulos de produção e otimização, conforme Capítulo 25 — o Content Hub nunca implementa lógica de IA própria.

**Identity Hub.** Autentica e autoriza toda operação sobre Article, LandingPage, Form e demais Entidades deste Hub, através do modelo já detalhado em `IDENTITY_HUB.md` — nenhuma verificação de Permissão própria é implementada dentro do Content Hub.

**Integration Hub.** Único ponto de saída para publicação em WordPress/CDN, submissão de Sitemap, consulta a Search Console/Analytics externo, e qualquer outro sistema externo consumido pelos módulos deste Hub — o Content Hub nunca se conecta diretamente a um Provider externo.

```
              INTEGRAÇÃO DO CONTENT HUB COM OUTROS HUBS
   ┌───────────────────────────────────────────────────────────┐
   │  Content Hub                                                  │
   │    publica: ArticlePublished · LandingPagePublished ·             │
   │             LeadCaptured · CTAConverted · DownloadCompleted ·         │
   │             NewsletterIssuePublished · StoryPublished ·                   │
   │             SEOOptimized                                                    │
   │    consome: (via Anti-Corruption Layer) Acquisition Channel/                    │
   │             Lead Source do Growth Hub; Segmento/Identidade                          │
   │             Visual do Business Hub                                                     │
   └───────────────────────────────────────────────────────────┘
```

---

## 27. Eventos do Domínio

| Evento | Produtor (módulo) | Consumidor | Objetivo | Impacto |
|---|---|---|---|---|
| `ArticleCreated` | Blog Manager | Editorial Workflow, Content Analytics | Registrar início de produção de um Article. | Adiciona o Article ao Calendário Editorial em estado "Ideia"/"Rascunho". |
| `ArticleUpdated` | Blog Manager | Content Analytics, SEO Manager | Registrar mudança de conteúdo em Article já existente. | Nova `ArticleVersion` criada; SEO Manager reavalia SEOProfile. |
| `ArticlePublished` | Blog Manager | CRM Hub (quando aplicável), Growth Hub, Analytics Hub, Web Stories Manager, Newsletter Manager | Comunicar que um Article está publicamente disponível. | Article elegível a derivação em WebStory/NewsletterIssue; Monitoramento inicia. |
| `ArticleFlaggedForUpdate` | SEO Manager | Editorial Workflow | Sinalizar queda de desempenho detectada em Monitoramento. | Article retorna a estado "Em revisão" no Editorial Workflow. |
| `ArticleArchived` | Blog Manager | Content Analytics | Registrar retirada de circulação preservando histórico. | Article deixa de ser indexável, sem apagar seu registro. |
| `LandingPagePublished` | Landing Page Builder | Growth Hub, Analytics Hub | Comunicar que uma página de conversão está disponível. | LandingPage elegível a receber tráfego de Campaign. |
| `LandingPageArchived` | Landing Page Builder | Analytics Hub | Registrar retirada de circulação de uma LandingPage. | — |
| `FormSubmitted` | Form Builder | Content Analytics | Registrar fato bruto de submissão. | Base para cálculo de Taxa de conversão pelo Analytics Hub. |
| `LeadCaptured` | Form Builder | CRM Hub, Analytics Hub | Comunicar intenção comercial capturada por conteúdo. | CRM Hub cria `Lead` e publica `LeadCreated`. |
| `NewsletterSubscriptionRequested` | Form Builder | Growth Hub, CRM Hub | Comunicar intenção de assinatura de newsletter. | Growth Hub associa o contato a Audience/Segment; CRM Hub registra preferência de comunicação. |
| `CTAConverted` | CTA Manager | Growth Hub (quando parte de Experiment), Analytics Hub | Registrar clique/conversão de uma Chamada para Ação. | Base para comparação de variação textual e para Taxa de conversão. |
| `DownloadCompleted` | Download Center | CRM Hub, Analytics Hub | Registrar entrega efetiva de material a um visitante já convertido. | CRM Hub registra como Atividade de relacionamento. |
| `NewsletterIssuePublished` | Newsletter Manager | Growth Hub, Communication Hub | Entregar conteúdo curado pronto para distribuição. | Growth Hub cria Campaign de e-mail correspondente. |
| `StoryPublished` | Web Stories Manager | Analytics Hub | Comunicar que um Web Story está publicamente disponível. | Elegível às superfícies de descoberta (Google Discover). |
| `SEOOptimized` | SEO Manager | Content Analytics, Analytics Hub | Registrar que o `SEOProfile` de um conteúdo foi finalizado/atualizado. | Sinaliza prontidão técnica para publicação/indexação. |
| `ContentClusterUpdated` | SEO Manager | Content Analytics | Registrar reorganização de um `ContentCluster`. | Recalcula prioridade de Internal Linking. |
| `ContentFlaggedOutdated` | SEO Manager | Editorial Workflow | Sinalizar conteúdo com performance em queda sustentada. | Dispara fluxo de Atualização (Capítulo 23.5). |
| `KeywordCanibalizationDetected` | SEO Manager | Editorial Workflow, Content Analytics | Sinalizar dois conteúdos competindo pela mesma Palavra-chave. | Recomendação de consolidação ou de redirecionamento canônico. |
| `MediaAssetUploaded` | Media Library | Content Analytics | Registrar novo ativo disponível para reuso. | — |

Este catálogo é a referência exclusiva de Eventos do Content Hub. Nenhum outro Hub publica Evento em nome deste domínio, e nenhum consumidor externo trata este catálogo como incompleto sem antes consultar uma futura atualização formal — mesma disciplina de Governança de Evento já exigida por `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 11.

---

## 28. Segurança

Toda operação sensível do Content Hub — publicar, arquivar, alterar `SEOProfile`, exportar dado de `FormSubmission` — é autenticada e autorizada exclusivamente através do Identity Hub, nunca por verificação própria implementada dentro deste Hub, aplicação direta do princípio já estabelecido em `IDENTITY_HUB.md` e reforçado em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 14.

Dado pessoal capturado via `FormSubmission` (nome, e-mail, telefone) é tratado com o mesmo cuidado de consentimento e finalidade já registrado em `docs/requirements/growth/GROWTH_HUB.md`, §13 (LGPD) — a finalidade da coleta é declarada no próprio Form, e o dado nunca é reaproveitado para propósito não declarado sem novo consentimento.

Todo conteúdo publicado é servido através do Integration Hub, que aplica isolamento de Tenant desde a camada de publicação — nenhum Article, LandingPage ou WebStory de uma Empresa é acessível, mesmo acidentalmente, sob o domínio de outra.

Upload de `MediaAsset` e `Download` é validado quanto a tipo e tamanho de arquivo antes de aceito, prevenindo abuso de armazenamento e conteúdo malicioso — mesma disciplina de validação de entrada já esperada de qualquer Command, conforme `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 7.

---

## 29. Permissões

| Papel | Acesso típico |
|---|---|
| **Administrador** | Acesso total ao Content Hub — configuração, integrações, papéis, todos os módulos. |
| **Editor** | Aprova conteúdo, organiza o Calendário Editorial, decide prioridade — checkpoint humano do Editorial Workflow. |
| **Redator** | Produz `ContentBrief` e Redação; não publica sozinho. |
| **SEO** | Trabalha Palavra-chave, `ContentCluster` e Otimização técnica; acesso de leitura ao restante. |
| **Designer** | Produz e organiza `MediaAsset`; sem acesso a Publicação. |
| **Marketing** | Propõe Ideias, cura `NewsletterIssue`, acompanha Content Analytics; não publica Article sozinho. |
| **Analista** | Leitura de Content Analytics e Relatórios; sem permissão de edição de conteúdo. |
| **CEO / Executivo** | Leitura consolidada; aprovação de decisões de maior impacto (ex.: reestruturação de `ContentCluster`). |

Toda atribuição de Papel é resolvida pelo Identity Hub — este Hub apenas declara qual Papel autoriza qual Capacidade de Negócio (Capítulo 9), nunca implementa sua própria tabela de permissão.

---

## 30. Auditoria

Toda mudança relevante de Entidade — publicação, arquivamento, alteração de `SEOProfile`, exclusão de `MediaAsset` — produz registro auditável imutável desde sua concepção, aplicação direta do princípio Auditability by Design já estabelecido em `GROWTH_HUB.md`, Capítulo 5, e em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 15.

`ArticleVersion` é, por si só, um mecanismo de auditoria de conteúdo — toda mudança publicada em um Article já produzido gera uma nova versão rastreável, nunca uma sobrescrita silenciosa, preservando integralmente o princípio já registrado em `docs/requirements/growth/BLOG.md`, Capítulo 14.

Todo `FormSubmission` preserva o registro completo do que foi submetido, quando, e a partir de qual Form/LandingPage — rastreabilidade necessária tanto para resposta a uma eventual solicitação de titular de dado (LGPD) quanto para reconstrução de Attribution pelo Growth Hub.

---

## 31. Escalabilidade

Separação por domínio garante que o volume de leitura de conteúdo publicado (tipicamente o volume mais alto de qualquer Hub da plataforma, por natureza pública) nunca compete pelo mesmo recurso que o volume de escrita editorial, ordens de grandeza menor — mesma propriedade já descrita em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 16.

Leitura de conteúdo publicado (Article, LandingPage, WebStory) é otimizada por Read Model já materializado a partir dos Eventos de publicação, servido preferencialmente através de camada de cache/CDN via Integration Hub — nenhuma requisição de leitura pública reconstrói o conteúdo a partir do histórico completo de `ArticleVersion` a cada chamada.

Processamento de `MediaAsset` (otimização de imagem/vídeo) é assíncrono e paralelizável — um upload não bloqueia a publicação do conteúdo que o referencia; o Content Hub tolera que a otimização final de um `MediaAsset` complete após a publicação inicial do Article, sem inconsistência de negócio.

Escalabilidade independente significa que um pico de tráfego de leitura em um Article que "viralizou" nunca exige que o Editorial Workflow ou o Form Builder escalem junto — cada Capacidade de Negócio escala de acordo com sua própria demanda real, mesmo princípio já demonstrado para o Growth Hub em `GROWTH_HUB.md`, Capítulo 16.

---

## 32. Diagramas ASCII

```
                    POSIÇÃO DO CONTENT HUB NA PLATAFORMA
   ┌───────────────────────────────────────────────────────────┐
   │  Platform Services                                            │
   │  (AI Hub · Identity Hub · Knowledge Hub · Integration Hub)     │
   │       consumidos pelo Content Hub — Capítulo 26                  │
   ├───────────────────────────────────────────────────────────┤
   │  Adaptive Intelligence                                          │
   │  (Business Profile Engine · Branding Hub · Automation Engine)   │
   │       consumidos pelo Content Hub — Capítulo 26                    │
   ├───────────────────────────────────────────────────────────┤
   │  Business Hubs                                                   │
   │  ┌─────────┐  ┌───────────┐  ┌──────────┐  ┌────────────┐        │
   │  │ CRM Hub │  │Growth Hub │  │Content   │  │Communica-  │        │
   │  │         │  │           │  │Hub (este  │  │tion Hub    │        │
   │  │         │  │           │  │documento) │  │            │        │
   │  └─────────┘  └───────────┘  └──────────┘  └────────────┘        │
   │       colaboram exclusivamente por Evento — Capítulo 26              │
   └───────────────────────────────────────────────────────────┘
```

```
              CATEGORIAS DE MÓDULOS INTERNOS (visão consolidada)
   ┌───────────────────────────────────────────────────────────┐
   │  Fundação:     CMS Engine                                       │
   │  Produção:     Blog Manager · Landing Page Builder ·               │
   │                Web Stories Manager                                    │
   │  Otimização:   SEO Manager                                               │
   │  Ativos:       Media Library · Download Center                              │
   │  Conversão:    Form Builder · CTA Manager                                      │
   │  Processo:     Editorial Workflow                                                 │
   │  Distribuição: Newsletter Manager                                                    │
   │  Medição:      Content Analytics                                                       │
   └───────────────────────────────────────────────────────────┘
```

```
                    MODELO 01 — DE CONTEÚDO A VENDA
   ┌───────────────────────────────────────────────────────────┐
   │  Google → SEO Manager → Blog Manager → Landing Page Builder →   │
   │  Form Builder → LeadCaptured → CRM Hub → Relacionamento →           │
   │  Commerce Hub → Venda                                                    │
   └───────────────────────────────────────────────────────────┘
```

(Diagramas adicionais de fluxo específico aparecem nos Capítulos 7, 23, 24 e 26.)

---

## 33. Tabelas Arquiteturais

### 33.1 Módulo → Capacidade de Negócio

| Módulo | Capacidade de Negócio central |
|---|---|
| CMS Engine | Estrutura de conteúdo genérica |
| Blog Manager | Produção de conteúdo de longa duração |
| Landing Page Builder | Conversão dedicada |
| SEO Manager | Otimização para busca |
| Media Library | Gestão de ativos de mídia |
| Download Center | Entrega de material incentivador |
| Form Builder | Captura de intenção comercial |
| CTA Manager | Direcionamento à conversão |
| Editorial Workflow | Governança de processo editorial |
| Newsletter Manager | Curadoria de conteúdo para distribuição por e-mail |
| Web Stories Manager | Derivação em formato curto e visual |
| Content Analytics | Exposição de fato bruto de desempenho |

### 33.2 KPIs (fatos brutos expostos ao Analytics Hub — nunca calculados como Metric/KPI dentro do próprio Content Hub)

| Indicador de origem | Módulo produtor |
|---|---|
| Artigos publicados / rascunhos / em revisão | Blog Manager, Editorial Workflow |
| Tempo médio de produção (Ideia → Publicação) | Editorial Workflow |
| Visualizações, CTR, Sessões por Article | Content Analytics (via Integration Hub — Google Analytics/Search Console) |
| Taxa de conversão por LandingPage/variação | Landing Page Builder, Content Analytics |
| Leads originados por conteúdo | Form Builder (via `LeadCaptured`) |
| Posição média, Impressões, Cobertura de indexação | SEO Manager (via Integration Hub — Search Console) |
| Visualizações e retenção por Slide | Web Stories Manager |
| Downloads concluídos | Download Center |
| Cliques por CTA | CTA Manager |

### 33.3 Reconciliação de Ownership (resumo)

| Conceito | Documento legado | Novo proprietário formal |
|---|---|---|
| Blog (módulo) | `docs/requirements/growth/BLOG.md`, Growth Hub (Andreia AI Platform) | Content Hub — Blog Manager |
| SEO (módulo) | `docs/requirements/growth/SEO.md`, Growth Hub | Content Hub — SEO Manager |
| Landing Pages (módulo) | `docs/requirements/growth/LANDING_PAGES.md`, Growth Hub | Content Hub — Landing Page Builder |
| Web Stories (módulo) | `docs/requirements/growth/WEB_STORIES.md`, Growth Hub | Content Hub — Web Stories Manager |
| Newsletter (conteúdo, não disparo) | `docs/requirements/growth/EMAIL_MARKETING.md`, Growth Hub | Content Hub — Newsletter Manager (disparo permanece Growth Hub/Communication Hub) |
| "Otimização de Conteúdo" (capacidade citada) | `BUSINESS_HUB_ARCHITECTURE.md`, §12 (exemplo ilustrativo, nunca formalizado) | Content Hub — SEO Manager + Blog Manager |
| Campaign, Attribution, Audience, Experiment | — | Permanece Growth Hub, sem alteração |

---

## 34. Roadmap Evolutivo

| Fase | Foco | Observação |
|---|---|---|
| **Fase 1 — CMS Engine e Blog Manager** | Fundação de conteúdo estruturado; ciclo de vida de Article (scaffold, sem lógica de negócio). | Corresponde à Fase 1/2 já descrita em `docs/requirements/growth/BLOG.md`, Capítulo 13. |
| **Fase 2 — Editorial Workflow** | Calendário, Status, Revisão/Aprovação — formaliza o processo antes de qualquer automação. | — |
| **Fase 3 — SEO Manager** | Palavra-chave, Cluster, Otimização técnica, integração real com Search Console. | Corresponde às Fases 1–4 já descritas em `docs/requirements/growth/SEO.md`, Capítulo 14. |
| **Fase 4 — Media Library e Download Center** | Upload, organização e reuso de ativo; entrega de material incentivador. | — |
| **Fase 5 — Landing Page Builder, Form Builder e CTA Manager** | Primeira capacidade de conversão real, fechando o fluxo `LeadCaptured → CRM Hub`. | Corresponde às Fases 1–3 já descritas em `docs/requirements/growth/LANDING_PAGES.md`, Capítulo 17. |
| **Fase 6 — Web Stories Manager** | Derivação a partir do Blog Manager já maduro. | Corresponde às Fases 1–4 já descritas em `docs/requirements/growth/WEB_STORIES.md`, Capítulo 17. |
| **Fase 7 — Newsletter Manager** | Curadoria de conteúdo, entrega ao Growth Hub para disparo. | Depende de Growth Hub/Communication Hub já maduros para o envio efetivo. |
| **Fase 8 — Content Analytics e integração real com Analytics Hub** | Fato bruto consolidado, alimentando indicador de negócio mais amplo. | — |
| **Fase 9 — IA aplicada** | Agentes assumindo progressivamente as etapas do Capítulo 25, sempre com Aprovação humana. | A etapa de Redação já tem precedente parcial real (`BlogAgentExecutor`) e é a candidata mais madura, mesma conclusão já registrada em `docs/requirements/growth/BLOG.md`, Capítulo 13. |

---

## 35. Regras Arquiteturais

**ADR-CH-001 — Content Hub nunca cria Lead.** O Form Builder publica `LeadCaptured` como fato; a criação da Entidade `Lead` é sempre e exclusivamente responsabilidade do CRM Hub. Contexto: preservar Domain Ownership já estabelecido em `CRM_DOMAIN_BLUEPRINT.md` e o padrão de Anti-Corruption Layer de `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 10.

**ADR-CH-002 — Content Hub não implementa comparação estatística.** Testes comparativos de LandingPage/CTA são fornecidos como conteúdo candidato pelo Content Hub, mas orquestrados, medidos e decididos pelo Experiment/A/B Test/Variant do Growth Hub. Contexto: evitar duplicação do domínio de experimentação já proprietário do Growth Hub (`GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 4).

**ADR-CH-003 — Newsletter Manager não envia e-mail.** Ele produz `NewsletterIssue`; a Lista, a Segmentação, o disparo e a métrica de abertura permanecem do Growth Hub e do Communication Hub. Contexto: preservar a fronteira já estabelecida para Campaign (`DOMAIN_OWNERSHIP_MATRIX.md`, linha "Campaign | Growth Hub").

**ADR-CH-004 — Content Hub referencia Acquisition Channel/Lead Source por identificador.** Nenhuma LandingPage ou Article duplica a estrutura interna desses conceitos, já proprietários do Growth Hub. Contexto: aplicação direta do princípio No Duplicate Models (`DOMAIN_OWNERSHIP_MATRIX.md`, §3).

**ADR-CH-005 — `ContentTag` é distinto de `Tag`.** O nome `ContentTag` foi escolhido deliberadamente para não colidir com `Tag`, já proprietário do CRM Hub (rótulo de categorização de relacionamento). Contexto: mesma disciplina de nomenclatura já aplicada a `CrmPipelineStage` (para não colidir com `PipelineStage` do Dashboard) durante a Sprint 32 da implementação real desta plataforma.

**ADR-CH-006 — Content Hub nunca calcula Metric ou KPI consolidado.** Content Analytics expõe fato bruto; o cálculo de indicador permanece exclusivo do Analytics Hub. Contexto: aplicação direta de ADR-004 e ADR-016 de `DOMAIN_OWNERSHIP_MATRIX.md`.

**ADR-CH-007 — SEO é módulo interno do Content Hub, não do Growth Hub.** Formaliza a lacuna já identificada na Nota de Posicionamento Documental — "Otimização de Conteúdo", citada em `BUSINESS_HUB_ARCHITECTURE.md`, §12, mas nunca formalizada como Capacidade do Growth Hub, passa a pertencer ao Content Hub. Contexto: nenhuma linha de `GROWTH_DOMAIN_BLUEPRINT.md` precisa ser alterada, porque nenhuma delas jamais reivindicou essa Capacidade formalmente.

**ADR-CH-008 — Toda conteúdo publicado por IA permanece sujeito a Aprovação humana.** Nenhuma etapa do Editorial Workflow é pulada para conteúdo gerado por Agente. Contexto: aplicação direta de Human Oversight (`AI_HUB.md`, Capítulo 5).

**ADR-CH-009 — Este documento não altera `DOMAIN_OWNERSHIP_MATRIX.md`.** A inclusão formal do Content Hub como décimo terceiro proprietário da plataforma é um item de governança pendente, executado como mudança própria. Contexto: preservar a autoridade normativa daquele documento (ADR-015, `DOMAIN_OWNERSHIP_MATRIX.md`) e o processo de Change Management de `DOCUMENTATION_CONSTITUTION.md`, §10.

---

## 36. Conclusão

Este documento define oficialmente o Content Hub da Adaptive Business Platform — doze Módulos Internos, vinte e cinco Entidades de domínio próprias, dezenove Eventos catalogados, e uma fronteira explícita e verificada contra os cinco Business Hubs, os quatro Platform Services e os três componentes de Adaptive Intelligence já existentes na plataforma. Nenhuma Entidade já proprietária de outro Hub foi duplicada; toda integração foi desenhada em torno de Evento, nunca de chamada direta; e toda especificação funcional já registrada nos seis documentos legados de `docs/requirements/growth/` (Blog, SEO, Landing Pages, Web Stories, e as porções de Email Marketing e Analytics relevantes a conteúdo) foi preservada integralmente, não descartada.

O Content Hub deixa de ser um conjunto de módulos dispersos dentro de um Growth Hub monolítico e passa a ser o que o `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` já previa: o Hub responsável por toda a aquisição orgânica da plataforma — a implementação viva do Modelo 01, convergindo, sempre, para o mesmo CRM Hub que já é, e continua sendo, o centro de inteligência da Adaptive Business Platform.

Três itens de governança permanecem pendentes, explicitamente registrados, não silenciados: a atualização formal de `DOMAIN_OWNERSHIP_MATRIX.md` para incluir o Content Hub como décimo terceiro proprietário; a atualização de cabeçalho dos seis documentos legados de `docs/requirements/growth/` para refletir sua promoção; e a reconciliação de `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` (Draft) com a taxonomia completa do Volume I, já registrada como Fase 0 de seu próprio Roadmap. Nenhum desses três itens é resolvido por este documento — cada um exige seu próprio processo de Review e Approval, conforme `DOCUMENTATION_CONSTITUTION.md`, §13 e §14.
