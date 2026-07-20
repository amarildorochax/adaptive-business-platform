# GOOGLE BUSINESS PROFILE — Especificação Funcional do Módulo

**Andreia AI Platform** · Growth Hub
Documentação funcional do módulo Google Business Profile — o décimo módulo do Growth Hub a ser especificado em detalhe, seguindo o padrão de 17 itens obrigatórios já usado em `docs/requirements/growth/META_ADS.md` (Sprint 12.0), `PINTEREST.md` (Sprint 13.0) e `PINTEREST_ADS.md` (Sprint 14.0).

Este documento é uma **especificação funcional**, não uma implementação. Relaciona-se com `docs/requirements/growth/GROWTH_HUB.md` (Google Business Profile é um dos 18 módulos ali listados) e com `docs/requirements/growth/SEARCH_CONSOLE.md` §8 e `SEO.md` §9, que já citam o módulo como fonte complementar de sinais locais. Esta Sprint é **exclusivamente de documentação** — nenhum arquivo `.ts`, `.tsx`, `.json` ou `.css` foi alterado para produzi-la; apenas ferramentas de leitura (Read, Grep, Glob) foram usadas. Por instrução explícita desta Sprint, toda conclusão abaixo se apoia **exclusivamente** na auditoria do código atual — documentação anterior é citada apenas como referência cruzada, nunca como fonte de verdade sobre o que existe implementado.

**Legenda usada em todo o documento (quatro níveis):**
- 🟢 **Implementado** — lógica real, funcional, executável hoje.
- 🟡 **Estrutura** — existe código real (uma classe, um scaffold), mas sem lógica de negócio completa por trás.
- 🔷 **Vocabulário** — existe apenas um nome, string ou valor de enum declarado — sem nenhuma estrutura ao redor.
- ⚪ **Planejado** — não existe nenhum vestígio no código; é direção de design.

---

## Missão do módulo

O Google Business Profile **não é** tratado como uma ficha de cadastro. É o **Centro Inteligente de Presença e Reputação Local**, cujo objetivo é transformar busca e mapa em confiança e visita/contato real.

---

## 1. Objetivo

**O que é:** o módulo Google Business Profile é a camada da plataforma responsável por gerenciar a presença local da Empresa nas buscas e mapas do Google — dados do perfil (Listing), Avaliações (Reviews) de clientes, Horário de funcionamento (Opening Hours), Fotos, Posts locais, e os sinais de Local SEO que diferenciam busca por proximidade de busca por conteúdo (`docs/requirements/growth/SEO.md` §9: "Relevante para SEO local... com sinais próprios de otimização, diferente do SEO de conteúdo").

**Objetivos funcionais:**
- Manter o Listing (nome, endereço, telefone, categoria, horário) preciso e atualizado nas propriedades Google.
- Centralizar e responder Avaliações de clientes (Review/Reply Review), protegendo Reputação/Rating.
- Publicar Posts locais e Fotos, mantendo o perfil ativo perante o algoritmo de busca local.
- Medir Insights nativos (visualizações, ligações, cliques em site, solicitações de rota) e alimentar o Analytics com esse dado, distinto de tráfego orgânico de conteúdo (Search Console) ou pago (Ads).

**Benefícios:**
- Presença local (mapas, "perto de mim") sem depender de conteúdo/SEO de longa cauda — canal com dinâmica própria.
- Reputação (Avaliações) tratada como ativo gerenciado, não como reação pontual e manual.
- Sinal complementar e não sobreposto ao Search Console — já registrado em `docs/requirements/growth/SEARCH_CONSOLE.md` §8 ("fonte complementar para SEO local... frequentemente correlacionada, mas fora do escopo direto" daquele módulo).

**Problemas que resolve:**
- Perfil desatualizado (endereço/horário errado) gerando fricção ou perda de confiança antes mesmo do primeiro contato.
- Avaliação negativa sem resposta, prejudicando Reputação sem que ninguém tenha percebido a tempo.
- Ausência de visão consolidada de quantas Ligações/Solicitações de rota o perfil gerou, deixando esse retorno fora do restante da medição de Growth Hub.

## 2. Escopo

Gestão de Listing (nome, endereço, categoria, atributos), Horário de funcionamento (regular e especial), Fotos, Posts locais, Avaliações e Respostas, Perguntas e respostas de clientes, Insights nativos (visualizações, Ligações, cliques em site, solicitações de rota), e Verificação do perfil junto ao Google.

**Limites:**
- O Google Business Profile não substitui o Search Console como fonte de dado de busca orgânica de conteúdo — cobre especificamente sinais locais (`docs/requirements/growth/SEARCH_CONSOLE.md` §8).
- O Google Business Profile não gerencia mídia paga — isso é papel de Google Ads (`docs/requirements/growth/GOOGLE_ADS.md`), ainda que ambos compartilhem a mesma superfície de busca do Google.
- O Google Business Profile não é o CRM — um contato originado de uma Ligação/clique no perfil é processado pelo módulo CRM (Business Hub), não armazenado dentro deste módulo.

---

## 3. Auditoria Completa

Auditei o repositório inteiro (`src/`, `docs/`, `package.json`) pelos termos pedidos por esta Sprint: `Google Business`, `Business Profile`, `Google My Business`, `GMB`, `GBP`, `BusinessProfile`, `Place`, `Places`, `Maps`, `Google Maps`, `Listing`, `Location`, `BusinessLocation`, `BusinessAgent`, `Review`, `Reviews`, `Rating`, `Customer Review`, `Reply Review`, `Opening Hours`, `Hours`, `Photo`, `Business Photo`, `Post`, `Business Post`, `Local SEO`, `Local Search`, `Directions`, `Call`, `Website Click`, `Insights`, `Verification`, `Google API`, `Places API`, `Business Profile API`, `Webhook`, `OAuth`, `Access Token`, `Refresh Token`, `UTM`, `Tracking`, `Analytics`, `AgentType`, `EventType`, além de varredura estrutural por Enums, Interfaces, Factories, Stores, Services, Hooks, Pipelines, Modules, Scenes, UI. Toda busca foi caso-insensível, com checagem manual de falsos positivos — este conjunto de termos é particularmente propenso a colisão, por reunir palavras comuns de engenharia de software e de um jogo Phaser 2D (`src/game/*`): `Place`/`Places` colide com `replace`/`marketplace`; `Maps` colide com `Tilemaps`/`/maps/office2.json` (arquivo de mapa do jogo); `Location` colide com `window.location` e com `OfficeLocation` (posição de mesa no escritório virtual); `Hours` colide com a variável `hours` de formatação de tempo; `Directions` colide com o array de direções de movimento do personagem (`up`/`down`/`left`/`right`).

### Termo por termo — o que foi encontrado

| Termo buscado | Ocorrência real | Onde |
|---|---|---|
| `Google Business`, `Business Profile`, `Google My Business`, `GMB`, `GBP`, `BusinessProfile` | Zero ocorrências em `src/` — aparece apenas em prosa de `docs/` | `docs/*` (nenhum em `src/`) |
| `Place`/`Places`/`Maps`/`Google Maps` | Falsos positivos apenas — `replace()` (método nativo), `marketplace` (nome de módulo genérico, `src/modules/marketplace/`), `/maps/office2.json` e `Phaser.Tilemaps` (arquivo/API do jogo) | `src/plugin/squadWatcher.ts`, `src/modules/marketplace/*`, `src/game/scenes/OfficeScene.ts`, `src/game/utils/MapHelpers.ts` |
| `Listing` | Zero ocorrências | — |
| `Location`/`BusinessLocation` | Falsos positivos apenas — `OfficeLocation`/`OfficeLocationKind` (posição de mesa no escritório virtual do jogo, `src/game/navigation/OfficeNavigator.ts`) e `window.location` (API do browser, `src/hooks/useSquadSocket.ts`) | `src/game/navigation/OfficeNavigator.ts`, `src/hooks/useSquadSocket.ts` |
| `BusinessAgent` | Zero ocorrências | — |
| `Review`/`Reviews`/`Rating`/`Customer Review`/`Reply Review` | Zero ocorrências em todo `src/` | — |
| `Opening Hours`/`Hours` | Falso positivo apenas — variável `hours` em `src/lib/formatTime.ts` (formatação de cronômetro `HH:MM:SS`, sem relação com horário de funcionamento) | `src/lib/formatTime.ts` |
| `Photo`/`Business Photo`/`Post`/`Business Post` | Zero ocorrências reais relacionadas — nenhum arquivo de `src/` contém essas palavras neste sentido | — |
| `Local SEO`/`Local Search` | Zero ocorrências | — |
| `Directions` | Falso positivo apenas — array `["right", "up", "left", "down"]` de direção de movimento do personagem em `src/game/config/animations.ts` | `src/game/config/animations.ts` |
| `Call`/`Website Click`/`Insights`/`Verification` | Zero ocorrências reais | — |
| `Google API`/`Places API`/`Business Profile API` | Zero ocorrências | — |
| `Webhook`/`OAuth`/`Access Token`/`Refresh Token` | Zero ocorrências em todo `src/` | — |
| `UTM`/`Tracking` | Zero ocorrências reais — mesma conclusão já registrada em `docs/requirements/growth/META_ADS.md` §3 e `PINTEREST.md` §3 | — |
| `AgentType` (catálogo geral) | Nenhum valor relacionado a Google Business Profile existe — 10 valores no total (`BLOG`, `SEO`, `PINTEREST`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`, `CRM`, `DESIGN`, `ANALYTICS`, `AUTOMATION`), nenhum `GOOGLE_BUSINESS` ou equivalente | `src/core/agents/registry/AgentTypes.ts` |
| `EventType` (catálogo geral) | Nenhum evento relacionado a Google Business Profile existe, nem mesmo em nome de comentário de grupo (`// Tasks`, `// Agents`, `// Squads`, `// Blog`, `// Pinterest`, `// CRM`, `// Traffic`, `// Dashboard`, `// System`) | `src/core/events/EventTypes.ts` |
| `GOOGLE_ANALYZED` (não pedido nominalmente por esta Sprint, mas relevante por precedente documental) | 🔷 Vocabulário — mesmo evento ambíguo já documentado em `GOOGLE_ADS.md`/`ADSENSE.md`/`ANALYTICS.md`/`SEARCH_CONSOLE.md`; o próprio `SEARCH_CONSOLE.md` §2 já registrou textualmente que este nome "poderia igualmente servir Google Ads, **Google Business Profile** ou Google Analytics" | `src/core/events/EventTypes.ts:34` |
| `src/modules/business/` (nome de módulo, falso cognato) | 🟡 Estrutura real, mas **não é Google Business Profile** — o comentário do próprio arquivo identifica o escopo como "Negócios (dados e operações da empresa)", i.e. o módulo genérico do Business Hub (financeiro/operacional), sem nenhuma relação com o produto Google | `src/modules/business/Manager.ts` |
| Dependência em `package.json` (SDK Google Business Profile/Places) | Zero | `package.json` |

### 🟢 Código funcional

**Nenhum.** Nenhuma lógica de negócio de Google Business Profile existe em nenhuma camada.

### 🟡 Estruturas

**Nenhuma estrutura real e específica existe.** Um único achado precisa de esclarecimento explícito por ser um falso cognato:

| Achado | Onde | Natureza real |
|---|---|---|
| `src/modules/business/` (`Manager.ts`, `Events.ts`, `Models.ts`, `Types.ts`, `index.ts`) | `src/modules/business/` | `BusinessManager implements IModule` (`id: 'business'`, `name: 'Business'`). O comentário do próprio arquivo é explícito: "módulo business — Negócios (dados e operações da empresa)". Isto é o scaffold genérico do **Business Hub** (`docs/PLATFORM_VISION.md`/`docs/02A-DOMAIN_MODEL.md`), não tem nenhuma relação com o produto Google Business Profile — a coincidência é apenas de nome em português/inglês ("business" = "negócio"). Nenhuma menção a Google, Listing, Review ou qualquer termo desta Sprint existe dentro dele (`Events.ts`/`Models.ts`/`Types.ts` são todos vazios). |

Diferente de Meta Ads e Pinterest (que ao menos tinham `src/modules/marketing/` genericamente aplicável por conter "campanhas e conteúdo" no escopo), o Google Business Profile **não tem nenhum scaffold cujo nome ou comentário sequer sugira aplicabilidade** — nem `marketing`, nem `business` (que é sobre outra coisa, como demonstrado acima), nem `analytics`.

### 🔷 Vocabulário

Um único item, e de atribuição já reconhecida como fraca/compartilhada em documento anterior — não um precedente exclusivo:

| Achado | Onde | Natureza real |
|---|---|---|
| `GOOGLE_ANALYZED: "GOOGLE_ANALYZED"` (grupo `// Traffic`) | `src/core/events/EventTypes.ts:34` | Nome de evento genérico do catálogo do `EventBus`, ao lado de `META_ANALYZED` e `PINTEREST_ANALYZED`. **Nunca emitido nem assinado.** Já citado em quatro documentos anteriores (`GOOGLE_ADS.md`, `ADSENSE.md`, `ANALYTICS.md`, `SEARCH_CONSOLE.md`) como ambíguo entre múltiplos produtos Google — e o próprio `SEARCH_CONSOLE.md` §2 nomeia explicitamente Google Business Profile como um dos destinos plausíveis deste evento, ao lado de Google Ads e Google Analytics. Não há, portanto, nenhum vocabulário que já não seja compartilhado com pelo menos três outros módulos. |

### ⚪ Funcionalidades inexistentes

Todo o restante, sem exceção — confirmado termo a termo:

- `Listing`, `BusinessLocation`, `BusinessAgent`, `Review`/`Reviews`/`Rating`, `Opening Hours` (real), `Photo`/`Post` (reais, de perfil), `Local SEO`/`Local Search`, `Directions` (real, de rota), `Call`/`Website Click`/`Insights`/`Verification`, `Google API`/`Places API`, `Webhook`, `OAuth`/`Access Token`/`Refresh Token` — **zero ocorrências em todo `src/`**.
- Nenhum valor de `AgentType` correspondente.
- Nenhum evento em `EventTypes.ts` correspondente, nem mesmo um genérico dedicado (diferente de Pinterest, que tem `PIN_CREATED`/`PIN_PUBLISHED`).
- Nenhuma menção em componente visual mockado (`Sidebar.tsx`, `AgentPanel.tsx`, `RightPanel.tsx`, `KpiCards.tsx`, `BottomPanel.tsx`) — confirmado por auditoria direta no Capítulo 9.
- Nenhuma pasta, arquivo, enum, mock ou componente dedicado — nem mesmo um scaffold genérico plausivelmente aplicável (diferente de todos os seis módulos já documentados, que tinham ao menos `marketing`/`analytics` como candidato de nomenclatura).
- Nenhuma dependência de SDK Google Business Profile/Places em `package.json`.
- Nenhum capítulo dedicado em `docs/05-ECOSYSTEM_MAP.md` — o módulo é citado apenas uma vez, de passagem, na tabela de integrações do Capítulo 12 ("Google → ... Google Business Profile ...").

### Resumo

| Categoria | Existe para Google Business Profile? |
|---|---|
| Arquivos dedicados | Nenhum |
| Pastas dedicadas | Nenhuma |
| Eventos | Nenhum específico — apenas o genérico `GOOGLE_ANALYZED`, já reconhecido como compartilhado com 3+ módulos |
| Enums | Nenhum |
| Estruturas genéricas plausivelmente aplicáveis | Nenhuma (`src/modules/business/` é um falso cognato, ver Capítulo 3) |
| Mocks de UI | Nenhum |
| Componentes | Nenhum |
| Dependências de pacote | Nenhuma |

### Conclusão objetiva da auditoria

O Google Business Profile é, entre os nove módulos de Growth Hub já auditados nesta série (Blog, SEO, Analytics, Search Console, AdSense, Google Ads, Meta Ads, Pinterest, Pinterest Ads), o que tem **o precedente de código mais fraco de todos, empatado com Pinterest Ads em zero vocabulário exclusivo — mas em posição ainda mais fraca**, porque Pinterest Ads ao menos compartilhava vocabulário real com um módulo irmão explícito (Pinterest orgânico); aqui, o único item de vocabulário (`GOOGLE_ANALYZED`) é ambíguo entre **quatro** outros módulos, e a única estrutura de nome parecido (`src/modules/business/`) é um falso cognato comprovado, sem nenhuma relação real. Toda a especificação abaixo parte de folha absolutamente em branco.

---

## 4. Estruturas Encontradas

| Estrutura | Estado | Observação |
|---|---|---|
| `src/modules/google-business-profile/` (ou equivalente dedicado) | ⚪ Inexistente | Confirmado por varredura completa de `src/modules/*` (12 módulos existentes: `crm`, `business`, `agenda`, `marketing`, `communication`, `analytics`, `fiscal`, `hr`, `projects`, `documents`, `academy`, `marketplace`; nenhum relacionado a Google Business Profile). |
| `src/modules/business/` | 🟡 Estrutura genérica, **não aplicável** | Ver Capítulo 3 — falso cognato, escopo real é "Negócios (dados e operações da empresa)" do Business Hub, sem nenhuma relação com o produto Google. |
| `src/modules/marketing/`, `src/modules/analytics/` | 🟡 Estruturas genéricas, sem nenhuma menção | Diferente de Meta Ads/Pinterest/Pinterest Ads (que ao menos citavam esses scaffolds como candidatos de nomenclatura plausível), nenhum comentário ou conteúdo destes dois módulos sugere qualquer aplicabilidade a Google Business Profile. |
| `src/core/connectors/` (`BaseConnector`, `ConnectorManager`, `ConnectorRegistry`, `ConnectorTypes`, `ConnectorEvents`) | 🟡 Estrutura genérica de infraestrutura | Nenhum conector concreto para Google Business Profile existe; `BaseConnector` é `abstract class` com stubs neutros, mesmo padrão já confirmado para todos os módulos anteriores. |
| `src/core/agents/registry/` (`AgentType`, `AgentRegistry`, `Agent`, `AgentStatus`) | 🟡 Estrutura genérica real | Nenhum valor relacionado a Google Business Profile existe dentro de `AgentType` (Capítulo 7). |
| `src/shared/interfaces/IModule.ts`, `IConnector.ts` | 🟢 Contrato real, usado por toda a plataforma | Interfaces genéricas que um eventual módulo/conector Google Business Profile precisaria implementar — não são específicas deste módulo. |

Nenhuma estrutura de dado (`Listing`, `Review`, `Post`, `Photo`, `Insights`) existe em nenhum `Models.ts` auditado.

---

## 5. Componentes Encontrados

Nenhum componente funcional ou mockado de Google Business Profile existe — este é o único módulo, entre os nove já documentados nesta série, sem sequer uma string isolada em algum componente de UI (diferente de Pinterest/Pinterest Ads, que ao menos têm "Pinterest Agent"). Os componentes que o módulo **teria**, todos ⚪ Planejado:

| Componente | Função |
|---|---|
| **Visão Geral** | Painel-resumo consolidado do módulo. |
| **Listing** | Dados centrais do perfil — nome, endereço, telefone, categoria, atributos. |
| **Horário de funcionamento** | Horário regular e horários especiais (feriados, eventos). |
| **Avaliações** | Reviews de clientes, nota agregada (Rating) e status de resposta (Reply Review). |
| **Fotos** | Galeria de imagens do perfil — fachada, interior, produtos. |
| **Posts** | Publicações locais de curta duração (ofertas, eventos, novidades). |
| **Perguntas e respostas** | Interações públicas de clientes potenciais no próprio perfil. |
| **Insights** | Visualizações, Ligações, cliques em site, solicitações de rota (Directions). |
| **Verificação** | Status de verificação do perfil junto ao Google. |
| **Relatórios** | Consolidação periódica do dado deste módulo. |
| **Alertas** | Ver Capítulo 9. |
| **Oportunidades** | Recomendação de ajuste de Listing/Horário/Foto com base em Insights. |
| **Configurações** | Conta Google Business Profile conectada, frequência de sincronização. |

---

## 6. Eventos Encontrados

Já detalhado no Capítulo 3, consolidado aqui: **nenhum evento específico de Google Business Profile existe.** O único item relacionado é o genérico `GOOGLE_ANALYZED` (`src/core/events/EventTypes.ts:34`, grupo `// Traffic`), já documentado como ambíguo entre quatro módulos (Google Ads, AdSense, Analytics, Search Console) — e explicitamente citado como plausível também para Google Business Profile em `docs/requirements/growth/SEARCH_CONSOLE.md` §2. Nunca emitido nem assinado em nenhum lugar de `src/`.

Diferente de Pinterest (`PIN_CREATED`/`PIN_PUBLISHED`, um grupo de comentário próprio `// Pinterest`), não existe nenhum grupo de comentário `// Google Business` ou equivalente em `EventTypes.ts` — nem mesmo um nome reservado e não emitido. Toda comunicação de evento, quando implementada, passaria pelo `EventBus` único já existente (`src/core/events/EventBus.ts`), mesma regra arquitetural já fixada em `docs/02-SYSTEM_ARCHITECTURE.md` §10.

---

## 7. Enums Encontrados

Já detalhado no Capítulo 3, consolidado aqui: **nenhum enum específico de Google Business Profile existe.** `src/core/agents/registry/AgentTypes.ts` declara exatamente 10 valores (`BLOG`, `SEO`, `PINTEREST`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`, `CRM`, `DESIGN`, `ANALYTICS`, `AUTOMATION`) — nenhum relacionado a Google Business Profile, nem genérico nem específico. Nenhum enum de domínio (`ReviewStatus`, `PostType`, `VerificationState`) existe em nenhum lugar. Nenhum enum `ConnectorType` com valor correspondente existe — `src/core/connectors/ConnectorTypes.ts` é `export {}` vazio.

---

## 8. Integrações

Todas ⚪ Planejado — nenhuma implementada hoje, confirmado por auditoria de `src/core/connectors/*` (Capítulo 4: todos os arquivos são stubs/contratos vazios, sem nenhum conector concreto).

| Integração | Papel no módulo Google Business Profile |
|---|---|
| **Google Business Profile** | A própria fonte de dado e canal de publicação — a integração central deste módulo. Citada apenas de passagem em `docs/05-ECOSYSTEM_MAP.md` §12 (tabela de integrações, sem capítulo/fluxo dedicado), com **zero implementação de conector**. |
| **SEO** | Consumidor de sinais locais complementares (`docs/requirements/growth/SEO.md` §9), sem sobreposição com o SEO de conteúdo. |
| **Search Console** | Correlação com Performance orgânica geral, sem fundir os dois conjuntos de dado (`docs/requirements/growth/SEARCH_CONSOLE.md` §8). |
| **CRM** | Recebe contato originado de Ligação/clique no perfil, quando identificável — fronteira direta com o Business Hub. |
| **Analytics** | Consumiria Insights (visualizações, Ligações, rotas) como uma das Fontes de Dados do módulo, sem nenhum tipo correspondente hoje em `src/modules/analytics/` (Capítulo 4). |
| **Google Ads** | Não é dependência funcional direta, mas compartilha a mesma superfície de busca/mapa do Google — decisão de investimento pago pode ser informada por Insights orgânicos deste módulo. |
| **Claude / OpenAI / Gemini** | Provedores de IA que sustentariam a geração de respostas a Avaliações e Posts locais — mesma ressalva já registrada em `docs/requirements/growth/META_ADS.md` §13 e `PINTEREST.md` §8: a citação repetida de que `src/providers/gemini/` "já reserva a pasta" não corresponde ao estado real do código, que só tem `src/providers/mock/MockAIProvider.ts`. |

---

## 9. UI

Auditoria de todos os componentes visuais hoje renderizados na aplicação — nenhum menciona Google Business Profile, Listing, Review ou qualquer termo desta Sprint:

| Componente | Arquivo | O que existe hoje |
|---|---|---|
| **Sidebar** | `src/components/sidebar/Sidebar.tsx` | Array estático de 9 rótulos (`Dashboard`, `Squads`, `Agentes`, `Tarefas`, `Automações`, `Analytics`, `Integrações`, `Eventos`, `Configurações`) — nenhum item relacionado. |
| **AgentPanel** | `src/components/AgentPanel.tsx` | Lista mockada de 4 agentes: `Blog Agent`, `SEO Agent`, `Pinterest Agent`, `WordPress Agent` — **nenhum "Google Business Agent" ou equivalente**, diferente de Pinterest, que ao menos aparece aqui. |
| **RightPanel** | `src/components/rightpanel/RightPanel.tsx` | Lista mockada de 3 agentes: `Blog Agent`, `SEO Agent`, `Pinterest Agent` — mesma ausência. |
| **KpiCards** | `src/components/cards/KpiCards.tsx` | 6 cards; só "Agentes" é real; os demais são strings hardcoded — nenhum card de Avaliação/Rating/Ligações. |
| **BottomPanel** | `src/components/bottom/BottomPanel.tsx` | Sem nenhuma ocorrência de termo relacionado na varredura textual do Capítulo 3. |

Nenhuma Janela, Widget ou tela dedicada existe em `src/components/dashboard/` — pasta já registrada como **inteiramente vazia** em `docs/requirements/growth/ANALYTICS.md` ("Nota metodológica").

**Observação de UI:** Google Business Profile é o único módulo, entre os nove já documentados nesta série, **sem nenhuma menção — nem mesmo decorativa — em qualquer componente de UI já renderizado**. Isso o distingue até de Pinterest Ads, que ao menos herdava (de forma ambígua) a string "Pinterest Agent" do módulo orgânico irmão.

---

## 10. Runtime

O runtime da plataforma (`src/core/platform/`) é genérico e não conhece nenhum módulo de negócio por nome — nem Google Business Profile, nem qualquer um dos 18 módulos do Growth Hub, mesma conclusão já registrada em `docs/requirements/growth/META_ADS.md` §10, `PINTEREST.md` §10 e `PINTEREST_ADS.md` §10:

- **`PlatformRuntime.ts`** — mantém `bootManager`, `lifecycleManager`, `moduleLoader`, `connectorLoader`, `automationLoader` e `RuntimeState`; `init()` executa o `BootPipeline` (Capítulo 11) e transiciona estado, mas **nenhum módulo/conector concreto é carregado**.
- **`ModuleLoader.ts`** — `load()` retorna lista vazia; comentário do próprio arquivo confirma "nenhum import dinâmico de módulos concretos".
- **`ConnectorManager.ts`** — `ILifecycle` com `init/start/stop` vazios, nenhum conector concreto orquestrado.
- Conclusão: o Google Business Profile não tem nenhum ponto de entrada no runtime real — consistente com o estado ⚪ Planejado de todo o Growth Hub.

---

## 11. Pipeline

A infraestrutura de pipeline (`src/core/pipeline/Pipeline.ts`) é genérica e reutilizável — hoje com uma única especialização real, `BootPipeline`, sem relação com Google Business Profile:

- `Pipeline.execute()` já roda de verdade (registra `PipelineStep`s, cria `PipelineContext`, executa em ordem, produz `PipelineResult`) — mecanismo genérico, sem qualquer noção de "Listing", "Avaliação" ou "Post local".
- `BootPipeline` registra apenas três etapas estruturais (`InitializeRuntimeStep`, `ValidateRuntimeStep`, `FinalizeRuntimeStep`), com `execute/rollback` vazios.
- Não existe, e não é citado em nenhum lugar, um pipeline de sincronização de perfil (`ProfileSyncPipeline`, `ReviewResponsePipeline` ou equivalente).
- Conclusão: **zero precedente de pipeline específico de Google Business Profile** — apenas a infraestrutura genérica, já usada para Boot, disponível para reuso futuro.

---

## 12. Fluxo Arquitetural

**Nenhum fluxo arquitetural específico de Google Business Profile existe em `docs/05-ECOSYSTEM_MAP.md`** — o documento cita o módulo apenas uma vez, de passagem, na tabela de integrações do Capítulo 12 ("Google → Growth Hub — Search Console, Analytics, Google Ads, AdSense, **Google Business Profile**, YouTube"), sem diagrama próprio, mesma situação já registrada para Pinterest Ads em `docs/requirements/growth/PINTEREST_ADS.md` §12 — mas aqui ainda mais escassa, já que nem uma linha de integração exclusiva existe (a linha é compartilhada com cinco outros produtos Google).

Por analogia estrutural com os fluxos de fontes orgânicas/locais já documentados (`docs/requirements/growth/SEARCH_CONSOLE.md` — Performance/Indexação alimentando SEO/Analytics; `SEO.md` §9 — sinais locais complementares), o fluxo mais provável para Google Business Profile — **não documentado em nenhum lugar, portanto integralmente hipotético e explicitamente marcado como tal** — seria:

```
Listing/Post/Foto → Insights (visualizações, ligações, rotas) → Analytics → Dashboard
Avaliação recebida → Reply Review → Reputação → Dashboard
```

Esta sequência **não tem nenhum precedente em `docs/` nem em `src/`** — é uma inferência por analogia, apresentada aqui apenas para preencher a lacuna identificada, e deve ser tratada como ⚪ Planejado no grau mais alto.

Dentro do fluxo geral do Growth Hub (`docs/requirements/growth/GROWTH_HUB.md` §5), o Google Business Profile participaria de uma etapa não mapeada explicitamente no fluxo de 13 passos daquele documento (`Pesquisa → Planejamento → Conteúdo → SEO → Imagem → Vídeo → Publicação → Distribuição → Indexação → Monitoramento → Otimização → Monetização → Dashboard`) — mais próxima de **Monitoramento** (Insights/Avaliações) do que de qualquer etapa de produção de conteúdo, já que este módulo não produz Conteúdo de longa duração como o Blog.

---

## 13. Precedentes Reais da Implementação

Consolidação dos Capítulos 3–7: **não existe nenhum precedente real de implementação de Google Business Profile**, nem mesmo de vocabulário exclusivo. O único item relacionado (`GOOGLE_ANALYZED`) é compartilhado, de forma explicitamente reconhecida em documento anterior, com quatro outros módulos (Google Ads, AdSense, Analytics, Search Console). Não há:

1. Nenhum `AgentType` — nem dedicado, nem compartilhado de forma plausível.
2. Nenhum evento dedicado — apenas o genérico `GOOGLE_ANALYZED`.
3. Nenhuma string em UI mockada.
4. Nenhum scaffold de módulo genuinamente aplicável — `src/modules/business/` é um falso cognato (Capítulo 3).

**Achado adicional (inconsistência a registrar, não corrigir):** `docs/02-SYSTEM_ARCHITECTURE.md` §7 (linha 206) e `docs/05-ECOSYSTEM_MAP.md` §12 listam "Google Business Profile" na mesma célula de tabela que "Search Console, Analytics, Google Ads, AdSense, YouTube", sob a integração genérica "Google". Isso é consistente com a ausência de qualquer precedente próprio no código — mas também significa que **nenhum dos seis documentos anteriores desta série havia, até agora, dedicado uma auditoria específica a este módulo**, apesar de ele aparecer citado de passagem em pelo menos seis documentos diferentes (`GROWTH_HUB.md`, `SEO.md`, `SEARCH_CONSOLE.md`, `05-ECOSYSTEM_MAP.md`, `03-DASHBOARD_V2.md`, `PLATFORM_VISION.md`). Não é uma contradição factual — apenas um lembrete de que menção em prosa não equivale a auditoria, exatamente a distinção que esta Sprint pede para não confundir.

---

## 14. Comparação com Analytics, Search Console, Google Ads, Meta Ads, Pinterest e Pinterest Ads

| Módulo | Código funcional (🟢) | Estrutura (🟡) | Vocabulário (🔷) | Observação |
|---|---|---|---|---|
| **Analytics** | Nenhum | `src/modules/analytics/` completo (`IModule`), mais `AgentStore`/`KpiCards` parcialmente reais | `AgentType.ANALYTICS`; `KPI_UPDATED`, `DASHBOARD_REFRESH`, `*_ANALYZED` | Único módulo com um pedaço de UI genuinamente funcional. |
| **Search Console** | Nenhum | Nenhuma | Apenas `GOOGLE_ANALYZED` (ambíguo) | Vocabulário fraco, mas ao menos citado como "seu" em documento próprio. |
| **Google Ads** | Nenhum | Nenhuma | Apenas `GOOGLE_ANALYZED` (ambíguo) | Nenhum `AgentType` dedicado. |
| **Meta Ads** | Nenhum | `src/modules/marketing/` — genérico | `META_ANALYZED` (inequívoco) + `AgentType.FACEBOOK`/`AgentType.INSTAGRAM` | Vocabulário de enum mais forte entre os módulos pagos. |
| **Pinterest** | Nenhum | `src/modules/marketing/`, `src/modules/analytics/` — genéricos | `AgentType.PINTEREST` + 3 eventos dedicados + `"Pinterest Agent"` em 2 componentes de UI | Maior número de eventos dedicados; única presença literal em UI real. |
| **Pinterest Ads** | Nenhum | `src/modules/marketing/` — genérico | Nenhum item exclusivo — tudo compartilhado com Pinterest orgânico | Nenhum vocabulário próprio, mas ao menos herda algo de um módulo irmão real. |
| **Google Business Profile** (este documento) | Nenhum | **Nenhuma estrutura genuinamente aplicável** — `src/modules/business/` é falso cognato (Capítulo 3) | Apenas `GOOGLE_ANALYZED`, compartilhado com **quatro** outros módulos (o maior grau de diluição de qualquer módulo já documentado) | **Nenhuma menção em UI, nenhum `AgentType`, nenhuma estrutura sequer nominalmente sugestiva** — a posição mais fraca de todos os nove módulos já auditados. |

**Leitura da comparação:** Google Business Profile ocupa a posição mais fraca de toda a série documentada até agora. Diferente de Pinterest Ads (que ao menos herdava vocabulário real, ainda que ambíguo, de um módulo irmão explícito), aqui não há nenhum irmão — o único item de vocabulário é compartilhado entre quatro módulos distintos, tornando a atribuição a este módulo específico a mais fraca e diluída de toda a série. É também o único módulo, entre os nove, sem nenhuma presença — nem mesmo decorativa — em qualquer componente de UI já renderizado na aplicação.

---

## 15. Matriz de Estado

| Item | Estado | Evidência |
|---|---|---|
| Módulo dedicado (`src/modules/google-business-profile`) | ⚪ | Não existe — Capítulo 4 |
| Scaffold genérico aplicável | ⚪ | Nenhum — `src/modules/business/` é falso cognato (Capítulo 3/4) |
| Evento dedicado | ⚪ | Nenhum — Capítulo 6 |
| Evento compartilhado ambíguo (`GOOGLE_ANALYZED`) | 🔷 (diluído entre 4 outros módulos) | `EventTypes.ts:34` |
| Enum dedicado (`AgentType`) | ⚪ | Nenhum — Capítulo 7 |
| String de UI (mockada ou real) | ⚪ | Nenhuma — Capítulo 9 |
| Classe `BusinessAgent`/`ReviewManager`/`ListingService` | ⚪ | Nenhuma ocorrência — Capítulo 3 |
| Conector Google Business Profile | ⚪ | `src/core/connectors/*` são stubs genéricos — Capítulo 4/8 |
| Componente de UI funcional (com dado real) | ⚪ | Capítulo 9 |
| Runtime/Pipeline específico | ⚪ | Capítulos 10/11 |
| Fluxo arquitetural dedicado em documentação | ⚪ | Não existe em `docs/05-ECOSYSTEM_MAP.md` — apenas menção de passagem — Capítulo 12 |
| Dependência de pacote (SDK Google Business Profile/Places) | ⚪ | `package.json` — Capítulo 3 |
| Código funcional (🟢) de qualquer natureza | 🟢 **Nenhum** | Capítulos 3–11 |

---

## 16. Conclusão

O módulo Google Business Profile, hoje, não tem **absolutamente nenhum precedente de implementação que lhe seja identificável** — nem código funcional, nem estrutura própria ou genuinamente aplicável, nem vocabulário reservado que não seja, ao mesmo tempo, compartilhado com quatro outros módulos (`GOOGLE_ANALYZED`). É o único dos nove módulos de Growth Hub já auditados nesta série (Blog, SEO, Analytics, Search Console, AdSense, Google Ads, Meta Ads, Pinterest, Pinterest Ads) sem nenhuma menção — nem mesmo decorativa — em qualquer componente de UI já renderizado, e o único cujo suposto "candidato de scaffold" (`src/modules/business/`) se revela, mediante auditoria direta, um falso cognato sem nenhuma relação real. Toda a especificação funcional deste documento — Listing, Avaliações, Horário de funcionamento, Posts, Insights — parte de folha inteiramente em branco, com o grau mais alto de ausência de precedente entre todos os módulos de mídia/presença digital já documentados nesta série.

## 17. Próximos Passos

| Fase | Foco |
|---|---|
| **Fase 1 — Criação do módulo** | Scaffold dedicado sobre `IModule` (`src/modules/google-business-profile/`) — sem lógica de negócio. Diferente de todos os módulos anteriores, esta fase não parte de nenhum vocabulário reservado (Capítulo 13) nem de um scaffold genérico plausível — é a única desta série a começar sem absolutamente nada. |
| **Fase 2 — Conector Google Business Profile** | Primeira implementação concreta de `BaseConnector` para a Business Profile API/Places API (autenticação, leitura de Listing) — hoje inexistente (Capítulo 4/8). |
| **Fase 3 — Listing e Horário** | Painéis de dados centrais do perfil sobre a primeira conexão real com a API. |
| **Fase 4 — Avaliações** | Centralização de Avaliações e fluxo de Resposta (Reply Review), dependente da Fase 3 já funcional. |
| **Fase 5 — Fotos e Posts** | Gestão de conteúdo visual/local sobre o perfil já conectado. |
| **Fase 6 — Insights** | Ingestão de visualizações, Ligações, cliques em site e solicitações de rota. |
| **Fase 7 — Fluxo arquitetural** | Documentar formalmente em `docs/05-ECOSYSTEM_MAP.md` o fluxo esboçado por analogia no Capítulo 12 deste documento — lacuna hoje existente frente a Google Ads/Meta Ads/Pinterest. |
| **Fase 8 — Integração com Analytics/SEO** | Insights e Avaliações alimentando de fato as Fontes de Dados do Analytics e os sinais locais complementares já citados em `docs/requirements/growth/SEO.md` §9. |
| **Fase 9 — IA** | Um eventual Agente de Reputação/Local SEO assumindo Resposta a Avaliações e Otimização de Listing de forma cada vez mais autônoma, sempre com Aprovação humana antes de qualquer resposta pública sensível. |

---

## Glossário

- **Hub** — Agrupamento de módulos por propósito de negócio (Business, Growth, Operations, Integration, AI, Marketplace, Academy).
- **Módulo** — Unidade de negócio ativável/desativável por empresa (ex.: CRM, Blog).
- **Serviço** — Funcionalidade transversal da plataforma, não amarrada a um módulo de negócio específico.
- **Connector** — Ponte de acesso a um sistema externo; único ponto de saída autorizado da plataforma para fora.
- **Pipeline** — Sequência ordenada de etapas (Steps) executadas com um resultado único ao final.
- **Runtime** — Processo que controla o ciclo de vida da plataforma em execução.
- **Workspace** — Ambiente isolado de uma empresa dentro da plataforma.
- **Tenant** — A empresa cliente dona de um Workspace (contexto de multiempresa).
- **Automation** — Motor que orquestra lógica condicional/sequencial entre módulos.
- **Workflow** — Sequência de ações de negócio executada por uma Automation.
- **Agent** — Entidade de IA que executa tarefas de forma autônoma ou assistida.
- **Skill** — Capacidade reutilizável que um Agent pode executar.
- **Capability** — Permissão/limite do que um Agent tem autorização de fazer.
- **Event** — Fato ocorrido na plataforma, publicado no EventBus para quem quiser reagir.
- **Registry** — Catálogo central de instâncias registráveis de um mesmo tipo.
- **Provider** — Implementação concreta de acesso a um serviço externo de IA ou de dados.
- **Boot** — Processo de inicialização da plataforma.
- **Lifecycle** — Conjunto de estados/transições que uma entidade gerenciada percorre (criação, execução, encerramento).
