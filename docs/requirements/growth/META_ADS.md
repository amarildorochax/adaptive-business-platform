# META ADS — Especificação Funcional do Módulo

**Andreia AI Platform** · Growth Hub
Documentação funcional do módulo Meta Ads — o sétimo módulo do Growth Hub a ser especificado em detalhe, e o primeiro desta série auditado sob o padrão de 17 itens obrigatórios da Sprint de Documentação 12.0.

Este documento é uma **especificação funcional**, não uma implementação. Relaciona-se com `docs/requirements/growth/GROWTH_HUB.md` (Meta Ads é um dos 18 módulos ali listados, Capítulo 3/4) e com `docs/05-ECOSYSTEM_MAP.md` Capítulo 6, que já esboçou o fluxo específico `Campanha → Lead → CRM → WhatsApp → Venda → Financeiro → Analytics`. Esta Sprint é **exclusivamente de documentação** — nenhum arquivo `.ts`, `.tsx`, `.json` ou `.css` foi alterado para produzi-la; apenas ferramentas de leitura (Read, Grep, Glob) foram usadas.

**Legenda usada em todo o documento (quatro níveis):**
- 🟢 **Implementado** — lógica real, funcional, executável hoje.
- 🟡 **Estrutura** — existe código real (uma classe, um scaffold), mas sem lógica de negócio completa por trás.
- 🔷 **Vocabulário** — existe apenas um nome, string ou valor de enum declarado — sem nenhuma estrutura ao redor.
- ⚪ **Planejado** — não existe nenhum vestígio no código; é direção de design.

---

## Missão do módulo

O Meta Ads **não é** tratado como uma API. É o **Centro Inteligente de Aquisição de Tráfego Pago em Facebook/Instagram**, cujo objetivo é transformar orçamento de mídia social em Leads qualificados e, a partir deles, em Venda.

---

## 1. Objetivo

**O que é:** o módulo Meta Ads é a camada da plataforma responsável por planejar, executar e otimizar campanhas de mídia paga na rede Meta (Facebook e Instagram — Feed, Stories, Reels, Audience Network), sempre sob controle explícito de orçamento e aprovação humana antes de qualquer gasto real (mesma regra já fixada em `docs/requirements/growth/GROWTH_HUB.md` §7 e repetida em `docs/PLATFORM_VISION.md` §8 e `docs/02-SYSTEM_ARCHITECTURE.md` §9).

**Objetivos funcionais:**
- Gerar Leads mensuráveis a partir de investimento controlado em Facebook/Instagram.
- Otimizar continuamente CPL (Custo por Lead), CPC, CTR e ROAS.
- Encaminhar todo Lead capturado para o CRM (Business Hub) e, quando aplicável, para o WhatsApp como canal de continuidade de conversa — fluxo já descrito em `docs/05-ECOSYSTEM_MAP.md` §6 (ver Capítulo 12 deste documento).
- Alimentar o Analytics com dado confiável de origem paga Meta, distinto do Google Ads (`docs/requirements/growth/GOOGLE_ADS.md`) e do Pinterest Ads.

**Benefícios:**
- Aquisição de tráfego/Lead em um dos canais de maior alcance social, complementar ao Google Ads e ao orgânico (Blog, SEO, Social Media).
- Ciclo de conversa mais curto que Google Ads — o fluxo de referência (`docs/05-ECOSYSTEM_MAP.md` §6) vai direto de Lead a WhatsApp, sem etapa intermediária de Landing Page obrigatória (diferente do Google Ads, §5 do mesmo documento).
- Decisão de orçamento apoiada em Venda real (via CRM/Financeiro), não em métrica de vaidade (curtida, alcance).

**Problemas que resolve:**
- Gasto de mídia social sem controle de orçamento ou sem checkpoint de Aprovação humana antes de ir ao ar.
- Leads gerados em Facebook/Instagram sem rota clara até o CRM/WhatsApp, perdendo-se antes de virar conversa comercial.
- Falta de retroalimentação entre o que a campanha promete (Lead) e o que de fato acontece depois (Venda, Financeiro).

## 2. Escopo

Gestão de Campanhas por objetivo (Reconhecimento, Tráfego, Engajamento, Geração de Leads, Conversão — ver Capítulo 4), Conjuntos de anúncios (Públicos, Posicionamento, Orçamento), Anúncios/Criativos, Pixel/Conversions API para rastreamento de Conversão, Lead Ads (formulário nativo dentro do Facebook/Instagram, sem sair da rede), e Otimização contínua.

**Limites:**
- O Meta Ads não decide orçamento total da Empresa — decisão de negócio aprovada fora do módulo (Operations Hub).
- O Meta Ads não produz o criativo do zero — consome ativos já produzidos (Designer Agent, Blog) ou os adapta ao formato de anúncio (mesmo limite já registrado em `docs/requirements/growth/GOOGLE_ADS.md` §1).
- O Meta Ads não substitui o CRM como sistema de gestão de Lead, nem o WhatsApp como canal de conversa — apenas origina o Lead e aciona a ponte para os dois (`docs/05-ECOSYSTEM_MAP.md` §6).

---

## 3. Auditoria Completa

Antes de escrever qualquer especificação, auditei o repositório inteiro (`src/`, `docs/`, `package.json`) pelos termos pedidos por esta Sprint: `Meta`, `Facebook`, `Instagram`, `Ads`, `Campaign`, `CampaignManager`, `Ad`, `Pixel`, `Business Manager`, `Lead Ads`, `Conversions API`, `Audience`, `Creative`, `Remarketing`, `Lookalike`, `UTM`, `Tracking`, `Conversion`, `Event`, `Webhook`, `Marketing`, `MetaAgent`, `AgentType`, `EventType`, além de varredura estrutural por Enums, Interfaces, Factories, Pipelines, Services, Stores, Hooks, UI, Scenes e Modules. Toda busca foi feita caso-insensível, com atenção a falsos positivos (ex.: `import.meta.env` do Vite, `nameTag`, `Leads`/`Squads` contendo a substring `ads`).

### Termo por termo — o que foi encontrado

| Termo buscado | Ocorrência real | Onde |
|---|---|---|
| `META_ANALYZED` | 🔷 Vocabulário — declarado, nunca emitido/assinado | `src/core/events/EventTypes.ts:33` |
| `AgentType.FACEBOOK` / `AgentType.INSTAGRAM` | 🔷 Vocabulário — valores de enum declarados, nunca referenciados fora do próprio arquivo | `src/core/agents/registry/AgentTypes.ts:5-6` |
| `Marketing` (módulo genérico) | 🟡 Estrutura — scaffold `IModule` real, mas genérico ("campanhas e conteúdo"), sem nenhuma lógica ou vocabulário específico de Meta | `src/modules/marketing/` |
| `Meta`, `Facebook`, `Instagram` (demais ocorrências em `src/`) | Nenhuma | — |
| `Campaign`, `Ad`, `Ads` (fora de `Leads`/`Squads`, falsos positivos) | Nenhuma | — |
| `Pixel` | Nenhuma ocorrência relacionada a rastreamento — única ocorrência de "pixel" em todo `src/` é `cam.setRoundPixels(true)` em `src/game/systems/CameraController.ts:23`, uma configuração de câmera do Phaser, sem nenhuma relação com Meta Pixel | `src/game/systems/CameraController.ts` |
| `Business Manager`, `Lead Ads`, `Conversions API`, `Audience`, `Creative`, `Remarketing`, `Lookalike`, `UTM`, `Webhook` | Zero ocorrências em todo `src/` | — |
| `Tracking` | Falsos positivos apenas (câmera de jogo, `e.ctrlKey`); nenhuma relação com rastreamento de conversão/anúncio | `src/game/*` |
| `Conversion`/`Conversão` | Zero ocorrências em código; apenas em documentação (`docs/`) | — |
| `MetaAgent` | Nenhuma ocorrência — não existe classe, arquivo ou referência | — |
| `EventType` (catálogo geral) | Ver Capítulo 5 — `META_ANALYZED` é o único item do grupo `// Traffic` relacionado a Meta | `src/core/events/EventTypes.ts` |
| `AgentType` (catálogo geral) | Ver Capítulo 6 — `FACEBOOK`/`INSTAGRAM` são os dois valores relacionados a Meta | `src/core/agents/registry/AgentTypes.ts` |
| Dependências em `package.json` (SDK Meta/Facebook Business) | Zero — nenhum pacote relacionado a Meta/Facebook/Instagram Ads instalado | `package.json` |

### 🟢 Código funcional

**Nenhum.** Mesma conclusão de Google Ads, AdSense e Search Console.

### 🟡 Estruturas

Um único item, e genérico — não específico de Meta Ads:

| Achado | Onde | Natureza real |
|---|---|---|
| `src/modules/marketing/` (`Manager.ts`, `Events.ts`, `Models.ts`, `Types.ts`, `index.ts`) | `src/modules/marketing/` | `MarketingManager implements IModule` (`id: 'marketing'`, `name: 'Marketing'`, `init/start/stop` vazios); `Events.ts` define `MarketingEventTypes`/`MarketingEventType` como objeto vazio (`{} as const`); `Models.ts`/`Types.ts` são apenas `export {}`. O comentário do próprio arquivo descreve o escopo pretendido como "Marketing (campanhas e conteúdo)" — um agrupamento amplo, não uma referência a Meta especificamente. `docs/requirements/growth/GROWTH_HUB.md` §3 cita este scaffold (ao lado de `communication` e `analytics`) como "os pontos de entrada mais prováveis para agrupar vários destes 18 [módulos] quando a implementação começar" — ou seja, um precedente **estrutural indireto e compartilhado**, não uma estrutura dedicada ao Meta Ads. |

### 🔷 Vocabulário

Dois itens:

| Achado | Onde | Natureza real |
|---|---|---|
| `META_ANALYZED: "META_ANALYZED"` (grupo `// Traffic`) | `src/core/events/EventTypes.ts:33` | Nome de evento declarado no catálogo do `EventBus`, ao lado de `GOOGLE_ANALYZED` e `PINTEREST_ANALYZED` — **nunca emitido (`eventBus.emit`) nem assinado (`eventBus.subscribe`) em nenhum lugar do código.** Diferente do `GOOGLE_ANALYZED` (já qualificado como ambíguo/genérico em `docs/requirements/growth/GOOGLE_ADS.md` §2, `SEARCH_CONSOLE.md` §2 e `ADSENSE.md` §2), este nome é **inequivocamente atribuível ao Meta Ads** — é o único dos três eventos do grupo `// Traffic` com um dono claro, ainda que nunca usado. |
| `AgentType.FACEBOOK = "facebook"` e `AgentType.INSTAGRAM = "instagram"` | `src/core/agents/registry/AgentTypes.ts:5-6` | Dois valores de enum declarados lado a lado com `BLOG`, `SEO`, `PINTEREST`, `YOUTUBE`, `CRM`, `DESIGN`, `ANALYTICS`, `AUTOMATION`. Confirmado por `src/core/agents/registry/registerAgents.ts`: **nenhum dos dois é usado** — a função registra apenas `BlogAgent`, nada relacionado a Facebook/Instagram. Nenhuma classe `FacebookAgent`/`InstagramAgent`/`MetaAgent` existe. É o precedente de vocabulário **mais forte de todos os módulos de Growth documentados até agora nesta série** — dois valores dedicados, contra nenhum valor de `AgentType` para Google Ads, AdSense ou Search Console. |

### ⚪ Funcionalidades inexistentes

Todo o restante, sem exceção — confirmado termo a termo:

- `Campaign`/`CampaignManager`, `Ad`/`Ads` (fora de falsos positivos), `Pixel` (real, de rastreamento), `Business Manager`, `Lead Ads`, `Conversions API`, `Audience`, `Creative`, `Remarketing`, `Lookalike`, `UTM`, `Webhook`, `Conversion`/`Conversão` — **zero ocorrências em todo `src/`**.
- Nenhum módulo `src/modules/meta-ads` ou equivalente.
- Nenhuma classe `MetaAgent`, `FacebookAgent` ou `InstagramAgent`.
- Nenhuma menção em componente visual mockado (`Sidebar.tsx`, `AgentPanel.tsx`, `RightPanel.tsx`, `KpiCards.tsx`, `BottomPanel.tsx`) — ver Capítulo 8.
- Nenhum conector concreto (`src/core/connectors/*` são todos stubs genéricos — ver Capítulo 9).
- Nenhuma dependência de SDK Meta/Facebook em `package.json`.

### Resumo

| Categoria | Existe para Meta Ads? |
|---|---|
| Arquivos dedicados | Nenhum |
| Pastas dedicadas | Nenhuma |
| Eventos | 1 declarado e inequívoco (`META_ANALYZED`), nunca emitido |
| Enums | 2 valores declarados (`AgentType.FACEBOOK`, `AgentType.INSTAGRAM`), nunca usados |
| Estruturas genéricas aplicáveis | 1 (`src/modules/marketing/`, compartilhada com outros módulos) |
| Mocks de UI | Nenhum |
| Componentes | Nenhum |
| Dependências de pacote | Nenhuma |

### Conclusão objetiva da auditoria

O Meta Ads tem **o vocabulário mais forte de todos os cinco módulos de Growth Hub já documentados nesta série** (Blog, SEO, Analytics, Search Console, AdSense, Google Ads) — é o único com dois valores de `AgentType` dedicados (`FACEBOOK`, `INSTAGRAM`) e o único cujo evento `*_ANALYZED` não é ambíguo. Ainda assim, **zero código funcional e zero estrutura própria**: os dois valores de enum nunca são importados fora do próprio arquivo, o evento nunca é emitido, e o único scaffold estrutural minimamente aplicável (`src/modules/marketing/`) é genérico, compartilhado com qualquer outro módulo de marketing/conteúdo, e hoje sem nenhuma linha de lógica de negócio. Ou seja: mais nomes reservados, mas o mesmo zero absoluto de implementação dos demais módulos pagos (Google Ads, Pinterest Ads).

---

## 4. Estruturas Encontradas

| Estrutura | Estado | Observação |
|---|---|---|
| `src/modules/meta-ads/` (ou equivalente dedicado) | ⚪ Inexistente | Não há nenhuma pasta específica de Meta Ads em `src/modules/*` — confirmado por varredura completa (25 módulos existentes: `crm`, `business`, `agenda`, `marketing`, `communication`, `analytics`, `fiscal`, `hr`, `projects`, `documents`, `academy`, `marketplace`; nenhum chamado `meta-ads`, `meta`, `facebook` ou `instagram`). |
| `src/modules/marketing/` | 🟡 Estrutura genérica | `MarketingManager implements IModule`; `Events.ts`/`Models.ts`/`Types.ts` vazios. Ver Capítulo 3. Candidato mais provável a abrigar Meta Ads no futuro (junto com Google Ads e Pinterest Ads), por já ser o scaffold nomeado "campanhas e conteúdo" — mas isso é inferência de nomenclatura, não uma decisão registrada em código. |
| `src/core/connectors/` (`BaseConnector`, `ConnectorManager`, `ConnectorRegistry`, `ConnectorTypes`, `ConnectorEvents`) | 🟡 Estrutura genérica de infraestrutura | Nenhum conector concreto para Meta existe; `BaseConnector` é `abstract class` com `id` abstrato e os demais membros como stubs neutros (`init/start/stop` vazios, `isConnected()` sempre `false`). Um futuro `MetaConnector` estenderia esta classe, mas nada disso existe hoje. |
| `src/core/agents/registry/` (`AgentType`, `AgentRegistry`, `Agent`, `AgentStatus`) | 🟡 Estrutura genérica real | `AgentType.FACEBOOK`/`INSTAGRAM` vivem aqui (Capítulo 6), mas `AgentRegistry`/`registerAgents.ts` não os utilizam. |
| `src/shared/interfaces/IModule.ts`, `IConnector.ts` | 🟢 Contrato real, usado por toda a plataforma | Interfaces genéricas que qualquer módulo/conector futuro (incluindo um eventual Meta Ads) precisaria implementar — não são específicas deste módulo. |

Nenhuma estrutura de dado (`Campaign`, `AdSet`, `Ad`, `Creative`, `Pixel`, `LeadForm`) existe em `Models.ts` de nenhum módulo — todos os `Models.ts` auditados (`marketing`, `analytics`, `crm`, `business`) são `export {}` vazio.

---

## 5. Componentes Encontrados

Nenhum componente visual (React) específico de Meta Ads existe hoje. Os componentes funcionais que o módulo **teria**, todos ⚪ Planejado:

| Componente | Função |
|---|---|
| **Visão Geral** | Painel-resumo consolidado do módulo. |
| **Campanhas** | Unidade principal — objetivo (§ Capítulo 12/IA), orçamento e status. |
| **Conjuntos de anúncios** | Subdivisão por Público/Posicionamento/Orçamento dentro de uma Campanha. |
| **Anúncios/Criativos** | Peças publicadas (imagem, vídeo, carrossel), frequentemente adaptadas do Blog/Designer Agent. |
| **Lead Ads** | Formulários nativos de captura de Lead dentro do próprio Facebook/Instagram, sem redirecionamento externo — recurso característico deste canal, sem equivalente direto documentado em Google Ads. |
| **Pixel / Conversions API** | Rastreamento de Conversão fora da rede Meta (no site/Landing Page da Empresa) e via API server-side. |
| **Públicos** | Segmentação — Públicos personalizados, Públicos semelhantes (Lookalike) e segmentação demográfica/comportamental nativa. |
| **Remarketing** | Campanhas direcionadas a quem já interagiu com a Empresa (site, perfil, Lead anterior). |
| **Relatórios** | Consolidação periódica do dado deste módulo. |
| **Alertas** | Ver Capítulo 9 (Dashboard). |
| **Oportunidades** | Recomendações acionáveis de ajuste de Campanha/Público/Orçamento. |
| **Configurações** | Conta Business Manager conectada, Pixel configurado, limites de Orçamento, regras de Aprovação. |

Nenhum destes doze itens aparece hoje em `Sidebar.tsx`, `AgentPanel.tsx`, `RightPanel.tsx`, `KpiCards.tsx` ou `BottomPanel.tsx` — ver Capítulo 8.

---

## 6. Eventos Encontrados

Já detalhado no Capítulo 3, consolidado aqui:

- **`META_ANALYZED`** (`src/core/events/EventTypes.ts:33`, grupo `// Traffic`) — 🔷 único evento existente relacionado a Meta Ads. Nunca emitido (`eventBus.emit`) nem assinado (`eventBus.subscribe`) em nenhum arquivo de `src/`. Diferente de `GOOGLE_ANALYZED`, não é ambíguo — não há outro módulo Google/Pinterest que este nome poderia servir.
- Nenhum evento mais granular (`META_CAMPAIGN_CREATED`, `META_LEAD_RECEIVED`, `PIXEL_FIRED`, `CONVERSION_TRACKED`) existe — todos ⚪ Planejado.
- Toda comunicação de evento, quando implementada, passará pelo `EventBus` único já existente (`src/core/events/EventBus.ts`) — o Meta Ads não deve criar nenhum barramento próprio, mesma regra arquitetural fixa desde `docs/02-SYSTEM_ARCHITECTURE.md` §10 e repetida em todos os módulos já documentados.
- `src/modules/marketing/Events.ts` (o scaffold estrutural mais próximo — Capítulo 3) declara `MarketingEventTypes` como objeto **vazio** — mesmo se este viesse a ser o módulo que abriga Meta Ads, hoje ele não contém nenhum nome de evento, nem genérico nem específico.

---

## 7. Enums Encontrados

Já detalhado no Capítulo 3, consolidado aqui:

- **`AgentType.FACEBOOK = "facebook"`** e **`AgentType.INSTAGRAM = "instagram"`** (`src/core/agents/registry/AgentTypes.ts:5-6`) — únicos dois valores de enum relacionados a Meta Ads em toda a base de código. Declarados, nunca referenciados fora do próprio arquivo (`registerAgents.ts` só registra `BlogAgent`).
- Nenhum enum de domínio específico existe: sem `CampaignObjective`, `AdStatus`, `PlacementType`, `AudienceType`, `CreativeFormat` ou equivalente — todos ⚪ Planejado.
- Nenhum enum `ConnectorType` com valor `META` ou `FACEBOOK` existe em `src/core/connectors/ConnectorTypes.ts` — o arquivo é `export {}` vazio (mesmo padrão de `Events.ts`/`Models.ts`/`Types.ts` em todos os módulos ainda não implementados).

---

## 8. Integrações

Todas ⚪ Planejado — nenhuma implementada hoje, confirmado por auditoria de `src/core/connectors/*` (Capítulo 4: todos os arquivos são stubs/contratos vazios, sem nenhum conector concreto).

| Integração | Papel no módulo Meta Ads |
|---|---|
| **Meta (Facebook/Instagram)** | A própria fonte de dado e canal de execução — a integração central deste módulo. Citada como exemplo de Connector futuro em `docs/02-SYSTEM_ARCHITECTURE.md` §7 e `docs/05-ECOSYSTEM_MAP.md` §12, mas hoje com **zero implementação de conector** — mesmo nível de precedente que Google e Pinterest. |
| **CRM** | Recebe todo Lead gerado como registro — próximo elo do fluxo (`docs/05-ECOSYSTEM_MAP.md` §6), fronteira direta com o Business Hub. |
| **WhatsApp** | Canal de continuidade de conversa com o Lead capturado — elo característico do fluxo Meta Ads (§6 do Ecosystem Map), sem equivalente direto no fluxo Google Ads (`docs/requirements/growth/GOOGLE_ADS.md` §7, que vai direto a Landing Page). |
| **Financeiro** | Recebe o investimento (custo de mídia) e a Receita atribuída à Venda originada, para cálculo de ROI/ROAS. |
| **Analytics** | Consome Leads/Conversões/ROAS deste módulo como uma das Fontes de Dados já registradas em `docs/requirements/growth/ANALYTICS.md` §4 e §13 ("Meta Ads — mesma função [do Google Ads], para campanhas Meta"). |
| **Blog / Designer Agent** | Fonte de Conteúdo/Imagem a ser adaptada em Criativos (Capítulo 5). |
| **Social Media** | Módulo irmão dentro do Growth Hub (`docs/requirements/growth/GROWTH_HUB.md` §4) — cobre a presença orgânica em Facebook/Instagram, distinta da aquisição paga deste módulo, mas compartilhando o mesmo Conector Meta de base (`docs/05-ECOSYSTEM_MAP.md` §12: "Meta → Growth Hub — Meta Ads, Social Media"). |
| **Google Ads / Pinterest Ads** | Não é dependência funcional direta, mas compartilha o mesmo princípio de Aprovação de gasto (`docs/requirements/growth/GOOGLE_ADS.md` §13) e é comparado lado a lado em Analytics (`ANALYTICS.md` §3, "Campanhas: desempenho consolidado de Google Ads, Meta Ads e Pinterest Ads lado a lado"). |
| **Claude / OpenAI / Gemini** | Provedores de IA que sustentariam Criativos e Otimização de Lances — mesmo precedente parcial já citado nos módulos anteriores (`AIProviderFactory.ts`, ver Capítulo 13 sobre uma inconsistência encontrada nesta citação). |

---

## 9. UI

Auditoria de todos os componentes visuais hoje renderizados na aplicação — nenhum menciona Meta Ads, Facebook ou Instagram:

| Componente | Arquivo | O que existe hoje |
|---|---|---|
| **Sidebar** | `src/components/sidebar/Sidebar.tsx` | Array estático de 9 rótulos (`Dashboard`, `Squads`, `Agentes`, `Tarefas`, `Automações`, `Analytics`, `Integrações`, `Eventos`, `Configurações`) — nenhum item "Meta Ads", "Ads" ou "Campanhas"; botões sem `onClick`. |
| **AgentPanel** | `src/components/AgentPanel.tsx` | Lista mockada de 4 agentes: `Blog Agent`, `SEO Agent`, `Pinterest Agent`, `WordPress Agent` — **nenhum "Facebook Agent" ou "Instagram Agent"**, apesar de `AgentType.FACEBOOK`/`INSTAGRAM` existirem como enum (Capítulo 7). |
| **RightPanel** | `src/components/rightpanel/RightPanel.tsx` | Lista mockada de 3 agentes: `Blog Agent`, `SEO Agent`, `Pinterest Agent` — mesma ausência. |
| **KpiCards** | `src/components/cards/KpiCards.tsx` | 6 cards; só "Agentes" é real (`agentStore.totalAgents()`); os demais (`Tarefas`, `Execuções`, `IA`, `Leads`, `Vendas`) são strings hardcoded — nenhum card de Meta Ads/Campanhas/CPL/ROAS. |
| **BottomPanel** | `src/components/bottom/BottomPanel.tsx` | Componente existe, não auditado em profundidade nesta Sprint (fora do escopo específico de Meta Ads) — nenhuma ocorrência de termo relacionado encontrada na varredura textual do Capítulo 3. |

Nenhuma Janela, Widget ou tela dedicada a Meta Ads existe em `src/components/dashboard/` — a mesma pasta já registrada como **inteiramente vazia** em `docs/requirements/growth/ANALYTICS.md` ("Nota metodológica").

---

## 10. Runtime

O runtime da plataforma (`src/core/platform/`) é genérico e não conhece nenhum módulo de negócio por nome — nem Meta Ads, nem qualquer um dos 18 módulos do Growth Hub:

- **`PlatformRuntime.ts`** — ponto único de composição do runtime; mantém `bootManager`, `lifecycleManager`, `moduleLoader`, `connectorLoader`, `automationLoader` e o `RuntimeState` atual (`CREATED → INITIALIZING → INITIALIZED/ERROR → STARTING → RUNNING → STOPPING → STOPPED`). `init()` já executa de fato o `BootPipeline` (Capítulo 11) e transiciona estado — mas **nenhum módulo/conector/automação concreto é carregado**, confirmado pelo próprio comentário do arquivo ("nada aqui é chamado por nenhum outro ponto do código").
- **`ModuleLoader.ts`** — `load()` retorna lista vazia; o comentário do arquivo é explícito: "nenhum import dinâmico de módulos concretos; nenhum registro automático". Um futuro carregamento de `MarketingManager` (ou de um eventual `MetaAdsManager`) passaria por aqui, mas hoje não passa.
- **`ConnectorManager.ts`** — mesma situação: `ILifecycle` com `init/start/stop` vazios, nenhum conector concreto orquestrado.
- Conclusão: o Meta Ads não tem **nenhum ponto de entrada no runtime real** — nem ele, nem nenhum outro módulo de negócio, o que é consistente com o estado ⚪ Planejado de todo o Growth Hub (`docs/requirements/growth/GROWTH_HUB.md`, nota de abertura).

---

## 11. Pipeline

A infraestrutura de pipeline (`src/core/pipeline/Pipeline.ts`) é genérica e reutilizável — hoje com uma única especialização real, `BootPipeline` (`src/core/platform/BootPipeline.ts`), que nada tem a ver com Meta Ads:

- `Pipeline.execute()` já roda de verdade (registra `PipelineStep`s, cria um `PipelineContext`, executa em ordem, produz `PipelineResult` com `success`/`errors`/`duration`) — mecanismo genérico, sem qualquer noção de "Campanha", "Anúncio" ou "Conversão".
- `BootPipeline` registra apenas três etapas puramente estruturais (`InitializeRuntimeStep`, `ValidateRuntimeStep`, `FinalizeRuntimeStep`), todas com `execute/rollback` vazios — nenhuma delas acessa Runtime, Registry, Connectors ou Modules.
- Não existe, e não é citado em nenhum lugar, um pipeline de campanha (`CampaignPipeline`, `AdPublishPipeline` ou equivalente) que orquestraria etapas como "criar Conjunto de anúncios → validar Orçamento → publicar Anúncio → confirmar via Pixel". Se este módulo vier a existir, a mesma infraestrutura `Pipeline` seria reutilizada (é o padrão já estabelecido — o comentário de `Pipeline.ts` cita explicitamente pipelines futuros como `LifecyclePipeline`, `ShutdownPipeline` etc., mas não cita nenhum pipeline de negócio de Growth Hub).
- Conclusão: **zero precedente de pipeline específico de Meta Ads** — apenas a infraestrutura genérica, já usada para Boot, disponível para reuso futuro.

---

## 12. Fluxo Arquitetural

O único fluxo específico de Meta Ads já documentado (fora deste documento) está em `docs/05-ECOSYSTEM_MAP.md`, Capítulo 6 — inteiramente ⚪ Planejado:

```
Campanha → Lead → CRM → WhatsApp → Venda → Financeiro → Analytics
```

| Etapa | Hub | Estado |
|---|---|---|
| Campanha | Growth Hub — Meta Ads (via Conector Meta) | ⚪ |
| Lead | Growth Hub | ⚪ |
| CRM | Business Hub — Lead processado | ⚪ |
| WhatsApp | Integration Hub — continuidade de conversa | ⚪ |
| Venda | Business Hub | ⚪ |
| Financeiro | Business Hub — custo de mídia e receita registrados | ⚪ |
| Analytics | Growth Hub — retorno medido | ⚪ |

Este fluxo é notavelmente **mais curto e mais direto ao WhatsApp** que o do Google Ads (`docs/05-ECOSYSTEM_MAP.md` §5: `Campanha → Landing Page → Conversão → CRM → Financeiro → Analytics → Dashboard`) — reflexo do recurso nativo de Lead Ads (Capítulo 5), que captura o Lead dentro da própria rede Meta sem exigir uma Landing Page intermediária. `docs/05-ECOSYSTEM_MAP.md` §6 reforça explicitamente que "mesma regra de Aprovação de gasto do Capítulo 5 se aplica aqui" — ou seja, nenhuma divergência na governança de orçamento entre os dois canais pagos.

Dentro do fluxo geral do Growth Hub (`docs/requirements/growth/GROWTH_HUB.md` §5: `Pesquisa → Planejamento → Conteúdo → SEO → Imagem → Vídeo → Publicação → Distribuição → Indexação → Monitoramento → Otimização → Monetização → Dashboard`), o Meta Ads participa principalmente das etapas **Planejamento** (definição de objetivo de Campanha), **Imagem** (Criativos) e **Otimização** — não participa de SEO/Indexação, por não ser um canal orgânico de busca.

---

## 13. Precedentes Reais da Implementação

Consolidação dos Capítulos 3–7: o precedente real de implementação do Meta Ads é **exclusivamente de vocabulário reservado**, nunca de lógica de negócio:

1. `AgentType.FACEBOOK` / `AgentType.INSTAGRAM` — dois valores de enum, nunca usados.
2. `META_ANALYZED` — um nome de evento, nunca emitido/assinado.
3. `src/modules/marketing/` — um scaffold `IModule` genérico, não específico de Meta, sem lógica.

**Achado adicional (inconsistência a registrar, não corrigir — regra 6 desta Sprint):** os quatro documentos anteriores desta série (`docs/requirements/growth/GOOGLE_ADS.md` §7, `ADSENSE.md` §7, `ANALYTICS.md` §9, `SEARCH_CONSOLE.md` §8), assim como `docs/05-ECOSYSTEM_MAP.md` §12 e `docs/02-SYSTEM_ARCHITECTURE.md` §7, repetem a afirmação de que "`src/providers/gemini/` já reserva a pasta correspondente" como precedente parcial de integração de IA. A auditoria desta Sprint (`Glob` direto sobre `src/providers/*`) encontrou **apenas `src/providers/mock/MockAIProvider.ts`** — não existe `src/providers/openai/`, `src/providers/claude/` nem `src/providers/gemini/` em lugar nenhum do repositório. `src/core/ai/AIProviderFactory.ts` confirma isso: as importações de `OpenAIProvider`/`ClaudeProvider` estão **comentadas** (`// import { OpenAIProvider } ...`), e tanto `"openai"` quanto `"claude"` caem em `MockAIProvider`; não há sequer um `case "gemini"` no `switch`. Ou seja, a citação repetida de "pasta reservada" para os três provedores é **mais otimista do que o código real** — só a pasta `mock` existe. Não corrigi os documentos anteriores (fora do escopo desta Sprint), mas registro aqui para não repetir a imprecisão em qualquer capítulo futuro de IA deste ou de outros módulos.

---

## 14. Comparação com Analytics, Search Console, Google Ads e AdSense

| Módulo | Código funcional (🟢) | Estrutura (🟡) | Vocabulário (🔷) | Observação |
|---|---|---|---|---|
| **Analytics** | Nenhum | `src/modules/analytics/` completo (`IModule` + `Events.ts`/`Models.ts`/`Types.ts`), mais `AgentStore`/`KpiCards` parcialmente reais | `AgentType.ANALYTICS`; `KPI_UPDATED`, `DASHBOARD_REFRESH`, `*_ANALYZED` | O único dos seis módulos com um pedaço de UI genuinamente funcional (contagem de Agentes). |
| **Search Console** | Nenhum | Nenhuma (nem scaffold `IModule` próprio) | Apenas `GOOGLE_ANALYZED` (ambíguo) | O mais pobre de vocabulário entre os seis. |
| **Google Ads** | Nenhum | Nenhuma | Apenas `GOOGLE_ANALYZED` (ambíguo, compartilhado) | Nenhum `AgentType` dedicado. |
| **AdSense** | Nenhum | Nenhuma | `GOOGLE_ANALYZED`, com atribuição classificada como "um estiramento" pelo próprio `ADSENSE.md` §2 | O mais fraco de todos em vocabulário. |
| **Meta Ads** (este documento) | Nenhum | `src/modules/marketing/` — genérico, compartilhado, não dedicado | `META_ANALYZED` (**inequívoco**, diferente dos `*_ANALYZED` do Google) + `AgentType.FACEBOOK`/`AgentType.INSTAGRAM` (**dois valores dedicados**, únicos entre os seis módulos) | **Vocabulário mais forte de todos os seis módulos já documentados**, mas mesmo zero de código funcional/estrutura própria dos demais. |

**Leitura da comparação:** o Meta Ads ocupa uma posição única — não tem nenhuma estrutura própria (como Search Console, Google Ads e AdSense), mas tem o vocabulário reservado mais específico e menos ambíguo de toda a série, graças aos dois valores de `AgentType` dedicados. Isso não implica nenhuma vantagem de implementação — vocabulário não executado equivale, na prática, a zero funcionalidade — mas indica que, **se/quando a plataforma decidir nomear formalmente os primeiros dois "Agentes de canal social"**, os nomes já reservados (`facebook`, `instagram`) sugerem que esse pensamento já ocorreu em algum momento anterior de design, ainda que nunca implementado.

---

## 15. Matriz de Estado (🟢🟡🔷⚪)

| Item | Estado | Evidência |
|---|---|---|
| Módulo dedicado (`src/modules/meta-ads`) | ⚪ | Não existe — Capítulo 4 |
| Scaffold genérico aplicável (`src/modules/marketing`) | 🟡 | Capítulo 3/4 |
| Evento `META_ANALYZED` | 🔷 | `EventTypes.ts:33` |
| Enum `AgentType.FACEBOOK` | 🔷 | `AgentTypes.ts:6` |
| Enum `AgentType.INSTAGRAM` | 🔷 | `AgentTypes.ts:5` |
| Classe `MetaAgent`/`FacebookAgent`/`InstagramAgent` | ⚪ | Nenhuma ocorrência — Capítulo 3 |
| Conector Meta (`MetaConnector`) | ⚪ | `src/core/connectors/*` são stubs genéricos — Capítulo 4 |
| Componente de UI (Sidebar/AgentPanel/RightPanel/KpiCards) | ⚪ | Capítulo 9 |
| Runtime/Pipeline específico | ⚪ | Capítulos 10/11 |
| Fluxo arquitetural (documentação) | ⚪ (documentado, não implementado) | `docs/05-ECOSYSTEM_MAP.md` §6 — Capítulo 12 |
| Dependência de pacote (SDK Meta) | ⚪ | `package.json` — Capítulo 3 |
| Código funcional (🟢) de qualquer natureza | 🟢 **Nenhum** | Capítulos 3–11 |

---

## 16. IA

Responsabilidades dos Agentes dentro do módulo Meta Ads — todas ⚪ Planejado, sem nenhuma implementação (ver Capítulo 13), ainda que dois valores de `AgentType` já estejam reservados (Capítulo 7):

- **CEO Agent** — consome Relatórios consolidados de investimento/Lead/Venda para decisão de alto nível; aprova mudanças de maior impacto em Orçamento.
- **Marketing Agent** — dono do Planejamento de Campanhas, alinhado ao objetivo de negócio do período (mesmo papel geral já descrito em `docs/requirements/growth/GROWTH_HUB.md` §7).
- **Media Buyer** — papel já introduzido em `docs/requirements/growth/GOOGLE_ADS.md` §6: aqui, dono da execução tática de Públicos, Orçamento e Lances dentro do Meta Ads — sempre sujeito a checkpoint de Aprovação humana antes de qualquer mudança que amplie gasto.
- **"Facebook Agent" / "Instagram Agent"** — os dois valores de `AgentType` reservados (Capítulo 7) sugerem a possibilidade de Agentes de canal dedicados, mas hoje **não correspondem a nenhuma responsabilidade real** — nem mesmo uma linha de descrição em nenhum documento anterior a este.
- **Analytics Agent** — cruza Leads/Vendas originados via Meta Ads com o restante da medição consolidada (`docs/requirements/growth/ANALYTICS.md` §8).
- **CRM Agent** — processa o Lead assim que ele chega via Meta Ads, primeiro elo do fluxo do Capítulo 12.
- **Finance Agent** — reconcilia investimento em mídia Meta e receita de Venda atribuída com o Financeiro real (Business Hub).
- **Content Strategist** — adapta Conteúdo já existente (Blog) em Criativos (Capítulo 5) para as Campanhas Meta — mesmo papel já descrito em `docs/requirements/growth/SEARCH_CONSOLE.md` §7 e `ADSENSE.md` §6.

---

## 17. Roadmap / Próximos Passos

| Fase | Foco |
|---|---|
| **Fase 1 — Criação do módulo** | Scaffold dedicado sobre `IModule` (`src/modules/meta-ads/` ou absorvido por `marketing`, Capítulo 3) — sem lógica de negócio. Diferente de Google Ads/AdSense/Search Console, esta fase já parte de dois valores de `AgentType` reservados (Capítulo 7), que precisariam ser efetivamente ligados a um Agente real. |
| **Fase 2 — Conector Meta** | Primeira implementação concreta de `BaseConnector` para a API Meta (Graph API/Marketing API) — hoje inexistente (Capítulo 4/8). |
| **Fase 3 — Painéis** | Visão Geral e Campanhas sobre a primeira conexão real com a API Meta. |
| **Fase 4 — Lead Ads + Pixel/Conversions API** | Captura de Lead nativo e rastreamento de Conversão fora da rede — os dois recursos mais característicos deste módulo (Capítulo 5). |
| **Fase 5 — Integração com CRM/WhatsApp** | Fechamento do fluxo `Lead → CRM → WhatsApp` (Capítulo 12), hoje só documentado. |
| **Fase 6 — Integração com Analytics** | Leads/ROAS alimentando de fato as Fontes de Dados do Analytics (`docs/requirements/growth/ANALYTICS.md` §4). |
| **Fase 7 — IA** | Media Buyer e um eventual "Facebook/Instagram Agent" (Capítulo 16) assumindo Otimização de forma cada vez mais autônoma, sempre com Aprovação humana antes de ampliar gasto. |

---

## 18. Dependências

| Dependência | Natureza |
|---|---|
| **Growth Hub** | O Meta Ads é um módulo deste Hub (`docs/requirements/growth/GROWTH_HUB.md` §3). |
| **CRM** | Recebe todo Lead gerado — dependência de negócio mais direta (Capítulo 12). |
| **WhatsApp / Integration Hub** | Canal de continuidade de conversa com o Lead. |
| **Financeiro** | Recebe investimento e Receita atribuída. |
| **Analytics** | Consumidor de Leads/ROAS deste módulo. |
| **Social Media** | Módulo irmão, mesmo Conector Meta de base, escopo orgânico em vez de pago. |
| **Blog / Designer Agent** | Fonte de Conteúdo/Imagem adaptável a Criativo. |
| **Integration Hub** | Portão obrigatório para a integração externa com a API Meta. |
| **AI Hub** | Sustentaria os Agentes do Capítulo 16, incluindo o Media Buyer. |

---

## 19. Melhores Práticas

- **Baixo acoplamento** — o Meta Ads exporia Leads para CRM/Financeiro/Analytics via contrato, sem conhecer a implementação interna de nenhum dos três (mesmo princípio de `docs/requirements/growth/GOOGLE_ADS.md` §13).
- **Observabilidade** — todo Lead precisa ser rastreável até a Campanha/Conjunto de anúncios/Criativo de origem — sem isso, ROAS/CPL não são confiáveis.
- **Eventos** — nova Conversão/Lead detectado deve disparar evento real (finalmente emitindo `META_ANALYZED` ou um evento mais granular), não depender de consulta ativa constante à API Meta.
- **Controle de custos** — nenhuma mudança que amplie gasto real é aplicada sem Orçamento definido e Aprovação — mesmo princípio crítico já fixado desde `docs/requirements/growth/GROWTH_HUB.md` §7, reforçado por `docs/05-ECOSYSTEM_MAP.md` §6.
- **Governança** — toda decisão de Media Buying (manual ou por Agente) precisa ser auditável.
- **Consistência de nomenclatura** — se `AgentType.FACEBOOK`/`INSTAGRAM` forem finalmente usados, a decisão de tratá-los como dois Agentes separados ou como um único "Meta Agent" deveria ser explicitada antes da implementação, para não deixar os dois valores de enum como vocabulário morto (mesmo risco já observado na Conclusão do Capítulo 3).

---

## 20. Riscos

- **Estouro de orçamento** — mesmo risco central já registrado para Google Ads (`docs/requirements/growth/GOOGLE_ADS.md` §14).
- **Leads de baixa qualidade** — Lead Ads (Capítulo 5) facilita a captura, mas pode gerar volume sem qualificação real, sobrecarregando o CRM/WhatsApp sem gerar Venda.
- **Mudanças na API Meta** — a Graph API/Marketing API muda formato, versão ou política sem aviso, podendo quebrar ingestão ou execução de Lances/Orçamento.
- **Políticas da Meta** — violação de política de anúncio (mesmo não intencional, por Agente autônomo) pode suspender toda a conta Business Manager, não só uma Campanha.
- **Dependência de mídia social paga** — crescimento sustentado só por Meta Ads é frágil frente a mudança de custo de leilão ou política, sem o colchão do orgânico (Social Media, Blog).
- **LGPD** — Leads/Pixel carregam dado pessoal e comportamental de terceiro; mesmo cuidado de consentimento/finalidade já registrado em `docs/requirements/growth/GROWTH_HUB.md` §13, reforçado pela integração nativa com WhatsApp (dado de conversa direta).

---

## 21. Visão Futura

- **Otimização automática** — ajuste contínuo de Público/Orçamento sem esperar ciclo manual de revisão.
- **Unificação de Media Buying** — decisão de alocação de orçamento entre Google Ads, Meta Ads e Pinterest Ads de forma unificada, mesma visão já registrada em `docs/requirements/growth/GOOGLE_ADS.md` §15.
- **Qualificação automática de Lead** — triagem do Lead Ads (Capítulo 5) antes de chegar ao WhatsApp/CRM, reduzindo carga de atendimento humano em Leads de baixa qualidade.
- **Campanhas autônomas** — um eventual Media Buyer/Facebook Agent operando o ciclo completo de uma Campanha de rotina, com Aprovação apenas no lançamento inicial.

---

## 22. Conclusão

O módulo Meta Ads, hoje, é **puramente vocabular**: zero código funcional, zero estrutura própria dedicada — mas o vocabulário reservado (`META_ANALYZED` inequívoco, mais os dois valores dedicados `AgentType.FACEBOOK`/`AgentType.INSTAGRAM`) é o mais específico entre os seis módulos de Growth Hub já auditados nesta série (Blog, SEO, Analytics, Search Console, AdSense, Google Ads). Isso não constitui nenhuma vantagem de implementação — nenhum destes nomes é executado em lugar nenhum do código —, mas é um sinal de que, em algum momento anterior de design da plataforma, já houve intenção de nomear canais sociais individualmente (Facebook e Instagram como valores separados), diferente do padrão mais genérico usado para Google/Pinterest. O único scaffold estrutural minimamente relacionável (`src/modules/marketing/`) é genérico e compartilhado, sem nenhuma linha de lógica específica de Meta. Toda a especificação funcional deste documento — Campanhas, Lead Ads, Pixel/Conversions API, Públicos/Lookalike, Remarketing — parte de folha em branco, na mesma situação de Google Ads, AdSense e Search Console.

## 23. Glossário

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
