# PINTEREST — Especificação Funcional do Módulo

**Andreia AI Platform** · Growth Hub
Documentação funcional do módulo Pinterest — o oitavo módulo do Growth Hub a ser especificado em detalhe, seguindo o padrão de 17 itens obrigatórios já usado em `docs/requirements/growth/META_ADS.md` (Sprint 12.0).

Este documento é uma **especificação funcional**, não uma implementação. Relaciona-se com `docs/requirements/growth/GROWTH_HUB.md` (Pinterest é um dos 18 módulos ali listados — distinto de Pinterest Ads, que é módulo próprio) e com `docs/05-ECOSYSTEM_MAP.md` Capítulo 7, que já esboçou o fluxo `Pin → Blog → Landing Page → Conversão → CRM → Analytics`. Esta Sprint é **exclusivamente de documentação** — nenhum arquivo `.ts`, `.tsx`, `.json` ou `.css` foi alterado para produzi-la; apenas ferramentas de leitura (Read, Grep, Glob) foram usadas. Por instrução explícita desta Sprint, toda conclusão abaixo se apoia na auditoria do código atual — documentação anterior (`ANALYTICS.md`, `BLOG.md`, `GROWTH_HUB.md`, `05-ECOSYSTEM_MAP.md`) é citada apenas como referência cruzada, nunca como fonte de verdade sobre o que existe implementado.

**Legenda usada em todo o documento (quatro níveis):**
- 🟢 **Implementado** — lógica real, funcional, executável hoje.
- 🟡 **Estrutura** — existe código real (uma classe, um scaffold), mas sem lógica de negócio completa por trás.
- 🔷 **Vocabulário** — existe apenas um nome, string ou valor de enum declarado — sem nenhuma estrutura ao redor.
- ⚪ **Planejado** — não existe nenhum vestígio no código; é direção de design.

---

## Missão do módulo

O Pinterest **não é** tratado como uma rede social qualquer. É o **Centro Inteligente de Distribuição Visual**, cujo objetivo é transformar Conteúdo já produzido (Blog) em descoberta visual de longa cauda, redirecionando tráfego qualificado de volta para os canais próprios da Empresa.

---

## 1. Objetivo

**O que é:** o módulo Pinterest é a camada da plataforma responsável por gerenciar a presença orgânica em Pinterest — criação e organização de Boards, publicação de Pins apontando para Conteúdo já existente (majoritariamente do Blog), e monitoramento de Tráfego de saída (Outbound) gerado por esses Pins.

**Objetivos funcionais:**
- Redistribuir Conteúdo já produzido pelo Blog em formato visual (Pin), estendendo seu alcance sem produzir conteúdo original duplicado.
- Gerar Tráfego de saída (Outbound) qualificado de volta para Blog/Landing Pages.
- Organizar Pins em Boards temáticos, alinhados às Categorias já definidas no Blog (`docs/requirements/growth/BLOG.md` §3).
- Alimentar o Analytics com dado de desempenho orgânico Pinterest, distinto do Pinterest Ads (módulo pago irmão, fora do escopo deste documento).

**Benefícios:**
- Canal de Distribuição de baixo custo direto (orgânico, sem mídia paga), complementar ao Blog/SEO.
- Vida útil de conteúdo mais longa que outras redes sociais — um Pin pode gerar Tráfego meses/anos após publicado, diferente do ciclo curto de Social Media tradicional.
- Reaproveitamento direto de ativos visuais já produzidos (Designer Agent/Blog), sem exigir produção de conteúdo dedicado.

**Problemas que resolve:**
- Conteúdo do Blog publicado mas nunca redistribuído visualmente, perdendo alcance potencial.
- Falta de rastreamento de qual Pin efetivamente gera Tráfego de volta ao site (Outbound).
- Boards desorganizados ou desalinhados com a estrutura de Categoria do Blog, dificultando descoberta.

## 2. Escopo

Gestão de Boards (criação, organização temática), Pins (criação a partir de imagem/artigo existente, agendamento via PinScheduler), Rich Pins (metadado enriquecido — artigo, produto, receita), Idea Pins (formato nativo multi-página do Pinterest), e monitoramento de Impressões, Cliques, Saves (repins) e Tráfego de saída (Outbound).

**Limites:**
- O Pinterest não produz o Conteúdo original — consome o que o Blog já publicou (`docs/requirements/growth/BLOG.md` §9: "Pinterest — Canal de Distribuição — Pins apontando de volta para artigos").
- O Pinterest não gerencia mídia paga — isso é papel do módulo irmão Pinterest Ads, fora do escopo deste documento (`docs/requirements/growth/BLOG.md` §1: "gerenciar campanhas de mídia paga... outros módulos do Growth Hub").
- O Pinterest não substitui o CRM como sistema de gestão de Lead — apenas gera Tráfego que, se convertido, é processado por outro módulo (`docs/05-ECOSYSTEM_MAP.md` §7).

---

## 3. Auditoria Completa

Auditei o repositório inteiro (`src/`, `docs/`, `package.json`, `node_modules` apenas para descartar falso positivo) pelos termos pedidos por esta Sprint: `Pinterest`, `Pin`, `Board`, `BoardManager`, `BoardService`, `BoardAgent`, `PinAgent`, `PinScheduler`, `Rich Pins`, `Idea Pin`, `Pinterest API`, `Pinterest OAuth`, `OAuth`, `OAuth2`, `Access Token`, `Refresh Token`, `Webhook`, `Catalog`, `Shopping`, `Feed`, `Image`, `ImageGenerator`, `Canvas`, `Media`, `Upload`, `Media Upload`, `UTM`, `Tracking`, `Analytics`, `Impression`, `Click`, `Save`, `Repin`, `Outbound`, `Traffic`, além de varredura estrutural por `AgentType`, `EventType`, Enums, Interfaces, Factories, Pipelines, Stores, Hooks, Services, Modules, Scenes, UI. Toda busca foi caso-insensível, com checagem manual de falsos positivos (`Dashboard` contém a substring `board`; `DashboardPage`/`DashboardLayout` disparam falsamente por essa razão; `game.canvas` do Phaser não tem relação com Pinterest; `PinLightBlend.js` em `node_modules/pixi.js` é um modo de blend de imagem, não Pinterest).

### Termo por termo — o que foi encontrado

| Termo buscado | Ocorrência real | Onde |
|---|---|---|
| `PINTEREST` (enum) | 🔷 Vocabulário — `AgentType.PINTEREST = "pinterest"`, declarado, nunca importado fora do próprio arquivo | `src/core/agents/registry/AgentTypes.ts:4` |
| `PIN_CREATED`, `PIN_PUBLISHED` | 🔷 Vocabulário — dois nomes de evento declarados sob comentário `// Pinterest`, nunca emitidos/assinados | `src/core/events/EventTypes.ts:23-25` |
| `PINTEREST_ANALYZED` | 🔷 Vocabulário — nome de evento sob `// Traffic`, nunca emitido/assinado | `src/core/events/EventTypes.ts:35` |
| `"Pinterest Agent"` (string mockada) | 🟡/UI mockado — aparece em dois componentes visuais mockados | `src/components/AgentPanel.tsx:12`, `src/components/rightpanel/RightPanel.tsx:11` |
| `Board`, `BoardManager`, `BoardService`, `BoardAgent`, `PinAgent`, `PinScheduler` | Nenhuma ocorrência real (só falsos positivos de `Dashboard`) | — |
| `Rich Pins`, `Idea Pin`, `Pinterest API`, `Pinterest OAuth`, `OAuth`, `OAuth2`, `Access Token`, `Refresh Token`, `Webhook`, `Catalog`, `Shopping` | Zero ocorrências em todo `src/` | — |
| `Image`, `ImageGenerator`, `Canvas`, `Media`, `Upload` | Falsos positivos apenas — `canvas` refere-se ao elemento `<canvas>` HTML5 do Phaser (`src/game/PhaserGame.tsx`, `src/game/systems/CameraController.ts`), sem nenhuma relação com upload/geração de imagem de Pin | `src/game/*` |
| `UTM`, `Tracking` (rastreamento de link) | Zero ocorrências reais — a única ocorrência de "tracking" em todo `src/` já havia sido descartada como falsa em `docs/requirements/growth/META_ADS.md` §3 (câmera do Phaser) | — |
| `Impression`, `Click`, `Save`, `Repin`, `Outbound`, `Traffic` (métricas) | Zero ocorrências relacionadas a métrica de Pinterest — `Traffic` existe apenas como comentário de agrupamento (`// Traffic`) em `EventTypes.ts`, ao lado de `META_ANALYZED`/`GOOGLE_ANALYZED`/`PINTEREST_ANALYZED` | `src/core/events/EventTypes.ts:32` |
| `Analytics` (módulo) | 🟡 Estrutura real e genérica (`src/modules/analytics/`), sem nenhuma referência a Pinterest dentro dela | `src/modules/analytics/*` |
| `Marketing` (módulo genérico) | 🟡 Estrutura real, mas sem nenhuma linha de vocabulário ou lógica específica de Pinterest | `src/modules/marketing/*` |
| Módulo dedicado (`src/modules/pinterest`) | Não existe | — |
| Conector dedicado (`PinterestConnector`) | Não existe — apenas `BaseConnector` genérico, sem nenhuma implementação concreta | `src/core/connectors/*` |
| Dependência em `package.json` (SDK Pinterest) | Zero | `package.json` |

### 🟢 Código funcional

**Nenhum.** Nenhuma lógica de negócio de Pinterest existe em nenhuma camada — mesma conclusão de Google Ads, AdSense, Search Console e Meta Ads.

### 🟡 Estruturas

Nenhuma estrutura **dedicada** a Pinterest existe. Duas estruturas genéricas são aplicáveis, na mesma situação já registrada para Meta Ads (`docs/requirements/growth/META_ADS.md` §3):

| Achado | Onde | Natureza real |
|---|---|---|
| `src/modules/marketing/` (`Manager.ts`, `Events.ts`, `Models.ts`, `Types.ts`, `index.ts`) | `src/modules/marketing/` | `MarketingManager implements IModule` (`id: 'marketing'`, `name: 'Marketing'`, `init/start/stop` vazios); `Events.ts` define `MarketingEventTypes` como objeto vazio; `Models.ts`/`Types.ts` são `export {}`. Escopo pretendido descrito no comentário do arquivo como "Marketing (campanhas e conteúdo)" — genérico, sem nenhuma menção a Pinterest. |
| `src/modules/analytics/` (`Manager.ts`, `Events.ts`, `Models.ts`, `Types.ts`, `index.ts`) | `src/modules/analytics/` | `AnalyticsManager implements IModule`, mesmo padrão de scaffold vazio. Relevante aqui porque `docs/requirements/growth/ANALYTICS.md` §4/§13 já cita "Pinterest" como uma Fonte de Dados/Dependência deste módulo — mas a auditoria direta de `src/modules/analytics/Types.ts`/`Models.ts` (ambos `export {}`) confirma **zero vocabulário ou estrutura de Pinterest dentro do próprio Analytics**, contradizendo a impressão de que essa citação em prosa corresponderia a algo no código. |

### 🔷 Vocabulário

Três itens — mais que Google Ads/AdSense/Search Console, mas sem o `EventType` inequívoco que Meta Ads tinha (`META_ANALYZED`):

| Achado | Onde | Natureza real |
|---|---|---|
| `AgentType.PINTEREST = "pinterest"` | `src/core/agents/registry/AgentTypes.ts:4` | Valor de enum declarado ao lado de `BLOG`, `SEO`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`, `CRM`, `DESIGN`, `ANALYTICS`, `AUTOMATION`. Confirmado por `src/core/agents/registry/registerAgents.ts`: **nunca usado** — a função registra apenas `BlogAgent`. Nenhuma classe `PinterestAgent` existe. |
| `PIN_CREATED: "PIN_CREATED"`, `PIN_PUBLISHED: "PIN_PUBLISHED"` (grupo `// Pinterest`) | `src/core/events/EventTypes.ts:24-25` | Dois nomes de evento dedicados — o único módulo de Growth Hub, entre os seis já auditados nesta série, com um **grupo de comentário próprio** (`// Pinterest`) no catálogo do `EventBus`, distinto do genérico `// Traffic`. Nunca emitidos (`eventBus.emit`) nem assinados (`eventBus.subscribe`) em nenhum lugar de `src/`. |
| `PINTEREST_ANALYZED: "PINTEREST_ANALYZED"` (grupo `// Traffic`) | `src/core/events/EventTypes.ts:35` | Terceiro nome de evento, ao lado de `META_ANALYZED` e `GOOGLE_ANALYZED`. Diferente de `GOOGLE_ANALYZED` (já qualificado como ambíguo em documentos anteriores), este nome é inequívoco — mas, diferente de `META_ANALYZED` (único evento de canal em `// Traffic` no documento de Meta Ads), aqui o módulo já tem **dois eventos próprios adicionais** (`PIN_CREATED`/`PIN_PUBLISHED`) em um grupo dedicado, o que é um precedente de vocabulário mais amplo. |
| `"Pinterest Agent"` (string, não enum) | `src/components/AgentPanel.tsx:12`, `src/components/rightpanel/RightPanel.tsx:11` | Não é um enum nem uma constante — é uma string literal dentro de um array mockado de UI (`status: "Idle"` / `"🔵 Pronto"`). Tecnicamente uma referência indireta de vocabulário (nome citado em dois componentes reais), mas sem nenhum vínculo de código com `AgentType.PINTEREST` — são dois pontos de nomenclatura desconectados entre si (nenhum import, nenhuma leitura do enum a partir do componente). |

### ⚪ Funcionalidades inexistentes

Todo o restante, sem exceção — confirmado termo a termo:

- `Board`, `BoardManager`, `BoardService`, `BoardAgent`, `PinAgent`, `PinScheduler`, `Rich Pins`, `Idea Pin`, `Pinterest API`, `Pinterest OAuth`, `OAuth`/`OAuth2`, `Access Token`, `Refresh Token`, `Webhook`, `Catalog`, `Shopping`, `Feed` (no sentido de feed de produto Pinterest), `ImageGenerator`, `Media Upload`, `UTM`, `Impression`, `Click` (métrica), `Save`/`Repin`, `Outbound` — **zero ocorrências em todo `src/`**.
- Nenhum módulo `src/modules/pinterest` ou equivalente.
- Nenhuma classe `PinterestAgent`, `BoardManager` ou `PinScheduler`.
- Nenhum conector concreto para Pinterest (`src/core/connectors/*` são stubs genéricos, sem nenhuma implementação por integração).
- Nenhuma dependência de SDK Pinterest em `package.json`.
- Nenhum componente de UI dedicado (Sidebar não lista "Pinterest"; KpiCards não tem card de Pin/Board/Outbound).

### Resumo

| Categoria | Existe para Pinterest? |
|---|---|
| Arquivos dedicados | Nenhum |
| Pastas dedicadas | Nenhuma |
| Eventos | 3 declarados (`PIN_CREATED`, `PIN_PUBLISHED`, `PINTEREST_ANALYZED`), nenhum emitido |
| Enums | 1 valor declarado (`AgentType.PINTEREST`), nunca usado |
| Estruturas genéricas aplicáveis | 2 (`src/modules/marketing/`, `src/modules/analytics/`), nenhuma com vocabulário próprio de Pinterest |
| Mocks de UI | 2 componentes citam a string "Pinterest Agent" (`AgentPanel.tsx`, `RightPanel.tsx`), sem nenhuma lógica por trás |
| Componentes funcionais | Nenhum |
| Dependências de pacote | Nenhuma |

### Conclusão objetiva da auditoria

O Pinterest tem o **maior número de eventos dedicados** (3: `PIN_CREATED`, `PIN_PUBLISHED`, `PINTEREST_ANALYZED`) entre os seis módulos de Growth Hub já auditados nesta série, incluindo o único grupo de comentário próprio (`// Pinterest`) dentro de `EventTypes.ts` — mais específico, nesse aspecto, que o Meta Ads (que tinha um único evento inequívoco, `META_ANALYZED`). É também o único módulo cujo nome aparece **duas vezes em componentes de UI reais** (`AgentPanel.tsx`, `RightPanel.tsx`), ainda que apenas como string mockada sem nenhuma lógica. Ainda assim, o padrão se repete: **zero código funcional, zero estrutura própria dedicada** — os três eventos nunca são emitidos, o enum nunca é usado, e as duas menções de UI são decorativas, desconectadas do enum e uma da outra.

---

## 4. Estruturas Encontradas

| Estrutura | Estado | Observação |
|---|---|---|
| `src/modules/pinterest/` (ou equivalente dedicado) | ⚪ Inexistente | Confirmado por varredura completa de `src/modules/*` (12 módulos existentes: `crm`, `business`, `agenda`, `marketing`, `communication`, `analytics`, `fiscal`, `hr`, `projects`, `documents`, `academy`, `marketplace`; nenhum chamado `pinterest`). |
| `src/modules/marketing/` | 🟡 Estrutura genérica | Ver Capítulo 3. Sem nenhuma linha de vocabulário Pinterest. |
| `src/modules/analytics/` | 🟡 Estrutura genérica | Ver Capítulo 3. Citado em prosa por `ANALYTICS.md` §4/§13 como consumidor de dado Pinterest, mas `Types.ts`/`Models.ts` vazios — nenhum tipo `PinterestMetrics` ou equivalente existe de fato. |
| `src/core/connectors/` (`BaseConnector`, `ConnectorManager`, `ConnectorRegistry`, `ConnectorTypes`, `ConnectorEvents`) | 🟡 Estrutura genérica de infraestrutura | Nenhum `PinterestConnector` concreto; `BaseConnector` é `abstract class` com `id` abstrato e stubs neutros (`init/start/stop` vazios, `isConnected()` sempre `false`). |
| `src/core/agents/registry/` (`AgentType`, `AgentRegistry`, `Agent`, `AgentStatus`) | 🟡 Estrutura genérica real | `AgentType.PINTEREST` vive aqui (Capítulo 6), mas `registerAgents.ts` não o utiliza. |
| `src/shared/interfaces/IModule.ts`, `IConnector.ts` | 🟢 Contrato real, usado por toda a plataforma | Interfaces genéricas que um eventual módulo/conector Pinterest precisaria implementar — não são específicas deste módulo. |

Nenhuma estrutura de dado (`Board`, `Pin`, `RichPin`, `IdeaPin`) existe em nenhum `Models.ts` auditado — todos são `export {}` vazio.

---

## 5. Componentes Encontrados

Nenhum componente funcional de Pinterest existe. Dois componentes de UI **mockam apenas o nome** ("Pinterest Agent"), sem lógica alguma — ver Capítulo 3/9. Os componentes que o módulo **teria**, todos ⚪ Planejado (nenhum precedente de código, nem estrutural nem de mock funcional):

| Componente | Função |
|---|---|
| **Visão Geral** | Painel-resumo consolidado do módulo. |
| **Boards** | Organização temática de Pins — normalmente espelhando as Categorias já definidas no Blog (`docs/requirements/growth/BLOG.md` §3). |
| **Pins** | Peça publicada, apontando para um Conteúdo/Landing Page existente. |
| **Rich Pins** | Pins com metadado enriquecido (artigo, produto, receita), sincronizado automaticamente com a fonte original. |
| **Idea Pins** | Formato nativo multi-página/vídeo do Pinterest, sem link de saída direto — mais focado em alcance/engajamento dentro da própria rede. |
| **Agendamento (PinScheduler)** | Programação de publicação de Pins ao longo do tempo. |
| **Tráfego de saída (Outbound)** | Volume de cliques que efetivamente saíram do Pinterest de volta para o site da Empresa. |
| **Impressões / Saves** | Métricas nativas de alcance e engajamento (Save = repin). |
| **Relatórios** | Consolidação periódica do dado deste módulo. |
| **Alertas** | Ver Capítulo 9. |
| **Oportunidades** | Recomendações acionáveis de que Conteúdo redistribuir, ou qual Board criar. |
| **Configurações** | Conta Pinterest Business conectada, frequência de sincronização. |

---

## 6. Eventos Encontrados

Já detalhado no Capítulo 3, consolidado aqui:

- **`PIN_CREATED`** e **`PIN_PUBLISHED`** (`src/core/events/EventTypes.ts:24-25`, grupo dedicado `// Pinterest`) — 🔷 os dois únicos eventos de ciclo de vida de Pin declarados no catálogo. Nunca emitidos nem assinados em nenhum arquivo de `src/`.
- **`PINTEREST_ANALYZED`** (`src/core/events/EventTypes.ts:35`, grupo `// Traffic`) — 🔷 mesmo padrão de `META_ANALYZED`/`GOOGLE_ANALYZED`, inequívoco quanto ao dono, nunca emitido/assinado.
- Nenhum evento mais granular (`PIN_SAVED`, `PIN_CLICKED`, `BOARD_CREATED`, `OUTBOUND_TRAFFIC_DETECTED`) existe — todos ⚪ Planejado.
- Toda comunicação de evento, quando implementada, passaria pelo `EventBus` único já existente (`src/core/events/EventBus.ts`) — mesma regra arquitetural já fixada em `docs/02-SYSTEM_ARCHITECTURE.md` §10 e repetida em todos os módulos já documentados.
- `src/modules/marketing/Events.ts` (scaffold estrutural genérico mais próximo) declara `MarketingEventTypes` como objeto **vazio** — nenhum dos três eventos acima está replicado ali.

---

## 7. Enums Encontrados

Já detalhado no Capítulo 3, consolidado aqui:

- **`AgentType.PINTEREST = "pinterest"`** (`src/core/agents/registry/AgentTypes.ts:4`) — único valor de enum relacionado a Pinterest em toda a base de código. Declarado, nunca referenciado fora do próprio arquivo (`registerAgents.ts` só registra `BlogAgent`).
- Nenhum enum de domínio específico existe: sem `BoardPrivacy`, `PinFormat`, `IdeaPinPageType` ou equivalente — todos ⚪ Planejado.
- Nenhum enum `ConnectorType` com valor `PINTEREST` existe — `src/core/connectors/ConnectorTypes.ts` é `export {}` vazio.

---

## 8. Integrações

Todas ⚪ Planejado — nenhuma implementada hoje, confirmado por auditoria de `src/core/connectors/*` (Capítulo 4: todos os arquivos são stubs/contratos vazios, sem nenhum conector concreto).

| Integração | Papel no módulo Pinterest |
|---|---|
| **Pinterest** | A própria fonte de dado e canal de publicação — a integração central deste módulo. Citada como exemplo de Connector futuro em `docs/02-SYSTEM_ARCHITECTURE.md` §7 e `docs/05-ECOSYSTEM_MAP.md` §12, mas hoje com **zero implementação de conector** — mesmo nível de precedente que Meta e Google. |
| **Blog** | Fonte de Conteúdo/imagem redistribuída como Pin — dependência mais fundamental do módulo (`docs/requirements/growth/BLOG.md` §9). |
| **Analytics** | Consumiria desempenho orgânico Pinterest como uma das Fontes de Dados — citado em prosa por `docs/requirements/growth/ANALYTICS.md` §4/§13, mas sem nenhum tipo/estrutura correspondente hoje dentro de `src/modules/analytics/` (Capítulo 3). |
| **CRM** | Recebe eventual Lead originado de Tráfego de saída convertido em Landing Page — mesma fronteira de negócio já descrita para os demais canais de aquisição. |
| **Pinterest Ads** | Módulo pago irmão, fora do escopo deste documento — compartilharia o mesmo Conector Pinterest de base, mas com escopo de mídia paga em vez de orgânico (mesmo padrão já registrado para Meta Ads/Social Media em `docs/requirements/growth/META_ADS.md` §8). |
| **Designer Agent** | Produziria/adaptaria o ativo visual usado no Pin. |
| **Claude / OpenAI / Gemini** | Provedores de IA que sustentariam a geração de Ideas Pins/legendas — mesmo precedente parcial já citado nos módulos anteriores (`AIProviderFactory.ts`), com a mesma ressalva já registrada em `docs/requirements/growth/META_ADS.md` §13: a citação repetida de que `src/providers/gemini/` "já reserva a pasta" não corresponde ao estado real do código, que só tem `src/providers/mock/MockAIProvider.ts`. |

---

## 9. UI

Auditoria de todos os componentes visuais hoje renderizados na aplicação:

| Componente | Arquivo | O que existe hoje |
|---|---|---|
| **Sidebar** | `src/components/sidebar/Sidebar.tsx` | Array estático de 9 rótulos (`Dashboard`, `Squads`, `Agentes`, `Tarefas`, `Automações`, `Analytics`, `Integrações`, `Eventos`, `Configurações`) — nenhum item "Pinterest"; botões sem `onClick`. |
| **AgentPanel** | `src/components/AgentPanel.tsx` | Lista mockada de 4 agentes: `Blog Agent`, `SEO Agent`, **`Pinterest Agent` (status: "Idle")**, `WordPress Agent` — string presente, mas sem nenhum vínculo com `AgentType.PINTEREST` (nenhum import do enum neste arquivo). |
| **RightPanel** | `src/components/rightpanel/RightPanel.tsx` | Lista mockada de 3 agentes: `Blog Agent`, `SEO Agent`, **`Pinterest Agent` (status: "🔵 Pronto")** — mesma situação: string isolada, sem lógica. |
| **KpiCards** | `src/components/cards/KpiCards.tsx` | 6 cards; só "Agentes" é real (`agentStore.totalAgents()`); os demais (`Tarefas`, `Execuções`, `IA`, `Leads`, `Vendas`) são strings hardcoded — nenhum card de Pin/Board/Outbound/Impressões. |
| **BottomPanel** | `src/components/bottom/BottomPanel.tsx` | Sem nenhuma ocorrência de termo relacionado a Pinterest na varredura textual do Capítulo 3. |

Nenhuma Janela, Widget ou tela dedicada a Pinterest existe em `src/components/dashboard/` — pasta já registrada como **inteiramente vazia** em `docs/requirements/growth/ANALYTICS.md` ("Nota metodológica"), confirmação que se estende a este módulo.

**Observação de UI:** "Pinterest Agent" é, entre os seis módulos já documentados nesta série, o **único nome de canal que aparece de forma idêntica em dois componentes mockados distintos** (`AgentPanel.tsx` e `RightPanel.tsx`), com status diferentes ("Idle" vs. "🔵 Pronto") — sinal de que os dois componentes foram mockados de forma independente, sem uma fonte única de verdade nem entre si, muito menos com o enum `AgentType.PINTEREST`.

---

## 10. Runtime

O runtime da plataforma (`src/core/platform/`) é genérico e não conhece nenhum módulo de negócio por nome — nem Pinterest, nem qualquer um dos 18 módulos do Growth Hub, mesma conclusão já registrada em `docs/requirements/growth/META_ADS.md` §10:

- **`PlatformRuntime.ts`** — mantém `bootManager`, `lifecycleManager`, `moduleLoader`, `connectorLoader`, `automationLoader` e `RuntimeState`; `init()` executa o `BootPipeline` (Capítulo 11) e transiciona estado, mas **nenhum módulo/conector concreto é carregado**.
- **`ModuleLoader.ts`** — `load()` retorna lista vazia; comentário do próprio arquivo confirma "nenhum import dinâmico de módulos concretos". Um futuro carregamento de `MarketingManager` ou de um eventual `PinterestManager` passaria por aqui, mas hoje não passa.
- **`ConnectorManager.ts`** — `ILifecycle` com `init/start/stop` vazios, nenhum conector concreto orquestrado.
- Conclusão: o Pinterest não tem nenhum ponto de entrada no runtime real — consistente com o estado ⚪ Planejado de todo o Growth Hub.

---

## 11. Pipeline

A infraestrutura de pipeline (`src/core/pipeline/Pipeline.ts`) é genérica e reutilizável — hoje com uma única especialização real, `BootPipeline`, sem relação com Pinterest:

- `Pipeline.execute()` já roda de verdade (registra `PipelineStep`s, cria `PipelineContext`, executa em ordem, produz `PipelineResult`) — mecanismo genérico, sem qualquer noção de "Pin", "Board" ou "Tráfego de saída".
- `BootPipeline` registra apenas três etapas estruturais (`InitializeRuntimeStep`, `ValidateRuntimeStep`, `FinalizeRuntimeStep`), com `execute/rollback` vazios.
- Não existe, e não é citado em nenhum lugar, um pipeline de publicação de Pin (`PinPublishPipeline` ou equivalente) que orquestraria etapas como "selecionar Conteúdo → gerar imagem de Pin → publicar no Board → confirmar via Webhook".
- Conclusão: **zero precedente de pipeline específico de Pinterest** — apenas a infraestrutura genérica, já usada para Boot, disponível para reuso futuro.

---

## 12. Fluxo Arquitetural

O único fluxo específico de Pinterest já documentado (fora deste documento) está em `docs/05-ECOSYSTEM_MAP.md`, Capítulo 7 — inteiramente ⚪ Planejado, sem nenhum precedente de código (Capítulo 3):

```
Pin → Blog → Landing Page → Conversão → CRM → Analytics
```

| Etapa | Hub | Estado |
|---|---|---|
| Pin | Growth Hub — Pinterest (via Conector Pinterest) | ⚪ |
| Blog | Growth Hub — Conteúdo de origem do Pin | ⚪ |
| Landing Page | Growth Hub | ⚪ |
| Conversão | Growth Hub | ⚪ |
| CRM | Business Hub — Lead processado | ⚪ |
| Analytics | Growth Hub — retorno medido | ⚪ |

Diferente do fluxo de Meta Ads (`Campanha → Lead → CRM → WhatsApp → Venda → Financeiro → Analytics`, `docs/requirements/growth/META_ADS.md` §12) e do Google Ads (`Campanha → Landing Page → Conversão → CRM → Financeiro → Analytics → Dashboard`), o fluxo do Pinterest **começa em Conteúdo já existente** (o Pin aponta para o Blog), não em uma Campanha paga — reflexo de ser um canal orgânico. Também é o único dos três em que o próprio `docs/05-ECOSYSTEM_MAP.md` §7 registra explicitamente uma dependência de outro módulo de Growth (Blog) como origem do fluxo, e não apenas do Business Hub a jusante.

Dentro do fluxo geral do Growth Hub (`docs/requirements/growth/GROWTH_HUB.md` §5), o Pinterest participa principalmente da etapa **Distribuição** — citada three vezes em documentos já auditados (`BLOG.md` §5/§7, `GROWTH_HUB.md` §6, `02-SYSTEM_ARCHITECTURE.md` linha 229) sempre como propagação de Conteúdo já produzido, nunca como produção original.

---

## 13. Precedentes Reais da Implementação

Consolidação dos Capítulos 3–7: o precedente real de implementação do Pinterest é **exclusivamente de vocabulário reservado e menções decorativas de UI**, nunca de lógica de negócio:

1. `AgentType.PINTEREST` — um valor de enum, nunca usado.
2. `PIN_CREATED`, `PIN_PUBLISHED`, `PINTEREST_ANALYZED` — três nomes de evento, nunca emitidos/assinados; o único grupo de comentário próprio (`// Pinterest`) entre os módulos já auditados.
3. `"Pinterest Agent"` — string mockada em dois componentes de UI reais (`AgentPanel.tsx`, `RightPanel.tsx`), sem nenhuma lógica ou vínculo com o enum.
4. `src/modules/marketing/`, `src/modules/analytics/` — dois scaffolds `IModule` genéricos, aplicáveis a qualquer módulo futuro, sem nenhuma linha de vocabulário específico de Pinterest dentro deles.

**Achado adicional (inconsistência a registrar, não corrigir):** `docs/requirements/growth/ANALYTICS.md` §4 e §13 cita "Pinterest" como Fonte de Dados/Dependência do módulo Analytics, na mesma lista que Blog, SEO, Google Ads e Meta Ads. A auditoria direta desta Sprint sobre `src/modules/analytics/Types.ts` e `Models.ts` (ambos `export {}` vazio, confirmado por leitura direta) mostra que **nenhuma dessas fontes tem qualquer estrutura de tipo correspondente dentro do módulo Analytics** — a citação em `ANALYTICS.md` é inteiramente prospectiva (planejamento), não uma descrição de código existente, ainda que o texto do documento não deixe essa distinção totalmente explícita ao leitor apressado. Não é uma contradição factual grave (o próprio `ANALYTICS.md` usa a legenda ⚪ para essas fontes), mas reforça a instrução desta Sprint de não tratar documentação anterior como prova de implementação.

---

## 14. Comparação com Analytics, Search Console, Google Ads e Meta Ads

| Módulo | Código funcional (🟢) | Estrutura (🟡) | Vocabulário (🔷) | Observação |
|---|---|---|---|---|
| **Analytics** | Nenhum | `src/modules/analytics/` completo (`IModule`), mais `AgentStore`/`KpiCards` parcialmente reais | `AgentType.ANALYTICS`; `KPI_UPDATED`, `DASHBOARD_REFRESH`, `*_ANALYZED` | Único módulo com um pedaço de UI genuinamente funcional (contagem de Agentes). |
| **Search Console** | Nenhum | Nenhuma (nem scaffold `IModule` próprio) | Apenas `GOOGLE_ANALYZED` (ambíguo) | O mais pobre de vocabulário entre os seis. |
| **Google Ads** | Nenhum | Nenhuma | Apenas `GOOGLE_ANALYZED` (ambíguo, compartilhado) | Nenhum `AgentType` dedicado. |
| **Meta Ads** | Nenhum | `src/modules/marketing/` — genérico, compartilhado | `META_ANALYZED` (inequívoco) + `AgentType.FACEBOOK`/`AgentType.INSTAGRAM` (dois valores dedicados) | Vocabulário de enum mais forte entre Ads/Analytics/Search Console. |
| **Pinterest** (este documento) | Nenhum | `src/modules/marketing/`, `src/modules/analytics/` — genéricos, compartilhados | `AgentType.PINTEREST` (1 valor) + `PIN_CREATED`/`PIN_PUBLISHED`/`PINTEREST_ANALYZED` (**3 eventos, o maior número entre os seis**) + `"Pinterest Agent"` mockado em **2 componentes de UI reais** | **Maior número de eventos dedicados e única presença literal em UI real**, mas mesmo zero de código funcional/estrutura própria dos demais. |

**Leitura da comparação:** cada um dos seis módulos já documentados tem um tipo diferente de "vantagem" de vocabulário, sem que nenhuma se traduza em funcionalidade: Analytics tem a única estrutura de módulo completa e o único dado real (contagem de Agentes); Meta Ads tem o enum mais específico (dois canais nomeados); Pinterest tem o maior número de eventos dedicados e é o único citado literalmente dentro de componentes de UI já renderizados na aplicação. Isso não estabelece nenhuma prioridade de implementação — é simplesmente onde, historicamente, alguém já pensou em nomes antes de qualquer lógica ser escrita.

---

## 15. Matriz de Estado

| Item | Estado | Evidência |
|---|---|---|
| Módulo dedicado (`src/modules/pinterest`) | ⚪ | Não existe — Capítulo 4 |
| Scaffold genérico aplicável (`marketing`/`analytics`) | 🟡 | Capítulo 3/4 |
| Evento `PIN_CREATED` | 🔷 | `EventTypes.ts:24` |
| Evento `PIN_PUBLISHED` | 🔷 | `EventTypes.ts:25` |
| Evento `PINTEREST_ANALYZED` | 🔷 | `EventTypes.ts:35` |
| Enum `AgentType.PINTEREST` | 🔷 | `AgentTypes.ts:4` |
| String "Pinterest Agent" em UI mockada | 🔷 (vocabulário em UI, sem lógica) | `AgentPanel.tsx:12`, `RightPanel.tsx:11` |
| Classe `PinterestAgent`/`BoardManager`/`PinScheduler` | ⚪ | Nenhuma ocorrência — Capítulo 3 |
| Conector Pinterest (`PinterestConnector`) | ⚪ | `src/core/connectors/*` são stubs genéricos — Capítulo 4/8 |
| Componente de UI funcional (com dado real) | ⚪ | Capítulo 9 |
| Runtime/Pipeline específico | ⚪ | Capítulos 10/11 |
| Fluxo arquitetural (documentação) | ⚪ (documentado, não implementado) | `docs/05-ECOSYSTEM_MAP.md` §7 — Capítulo 12 |
| Dependência de pacote (SDK Pinterest) | ⚪ | `package.json` — Capítulo 3 |
| Código funcional (🟢) de qualquer natureza | 🟢 **Nenhum** | Capítulos 3–11 |

---

## 16. IA

Responsabilidades dos Agentes dentro do módulo Pinterest — todas ⚪ Planejado, sem nenhuma implementação (ver Capítulo 13), ainda que um valor de `AgentType` já esteja reservado (Capítulo 7) e uma string "Pinterest Agent" já apareça em dois componentes de UI (Capítulo 9):

- **CEO Agent** — consome Relatórios consolidados de Tráfego de saída/Impressões para decisão de alto nível.
- **Marketing Agent** — decide quais Conteúdos priorizar para redistribuição via Pin.
- **Publisher Agent** — executaria a Publicação/Distribuição de Pins, mesmo papel geral já descrito em `docs/requirements/growth/GROWTH_HUB.md` §7 e `BLOG.md` §6.
- **"Pinterest Agent"** — o nome já aparece em `AgentPanel.tsx`/`RightPanel.tsx` (Capítulo 9) e o valor `AgentType.PINTEREST` já está reservado (Capítulo 7), mas nenhuma responsabilidade real está descrita ou implementada em código para esse nome — é, hoje, apenas uma etiqueta repetida em dois lugares diferentes, sem definição funcional por trás.
- **Analytics Agent** — cruzaria Tráfego de saída/Impressões/Saves com o restante da medição consolidada (`docs/requirements/growth/ANALYTICS.md` §8).
- **Designer Agent** — produziria/adaptaria a imagem usada no Pin.
- **Content Strategist** — decidiria quais Boards criar com base em Categorias de maior desempenho, mesmo papel já descrito em `docs/requirements/growth/SEARCH_CONSOLE.md` §7 e `ADSENSE.md` §6.

---

## 17. Próximos Passos

| Fase | Foco |
|---|---|
| **Fase 1 — Criação do módulo** | Scaffold dedicado sobre `IModule` (`src/modules/pinterest/` ou absorvido por `marketing`, Capítulo 3) — sem lógica de negócio. Já parte de um valor de `AgentType` reservado (Capítulo 7) e de três eventos declarados (Capítulo 6), que precisariam ser efetivamente emitidos/consumidos. |
| **Fase 2 — Conector Pinterest** | Primeira implementação concreta de `BaseConnector` para a API Pinterest (autenticação, publicação de Pin) — hoje inexistente (Capítulo 4/8). |
| **Fase 3 — Boards e Pins** | Painéis de Boards/Pins sobre a primeira conexão real com a API. |
| **Fase 4 — Rich Pins / Idea Pins** | Formatos avançados de Pin, dependentes da Fase 3 já funcional. |
| **Fase 5 — Rastreamento de Tráfego de saída** | Emitir de fato `PIN_CREATED`/`PIN_PUBLISHED`/`PINTEREST_ANALYZED` e medir Outbound real. |
| **Fase 6 — Integração com Analytics** | Impressões/Saves/Outbound alimentando de fato as Fontes de Dados do Analytics (`docs/requirements/growth/ANALYTICS.md` §4) — corrigindo a lacuna registrada no Capítulo 13 deste documento. |
| **Fase 7 — IA** | Um eventual "Pinterest Agent" (Capítulo 16), hoje só um nome em UI mockada, assumindo Distribuição/Otimização de forma cada vez mais autônoma. |

---

## 18. Dependências

| Dependência | Natureza |
|---|---|
| **Growth Hub** | O Pinterest é um módulo deste Hub (`docs/requirements/growth/GROWTH_HUB.md` §3). |
| **Blog** | Fonte de Conteúdo redistribuído como Pin — dependência mais fundamental de todas. |
| **Analytics** | Consumidor de Tráfego de saída/Impressões/Saves deste módulo. |
| **CRM** | Recebe eventual Lead originado de Conversão a jusante do Tráfego de saída. |
| **Pinterest Ads** | Módulo pago irmão, mesmo Conector Pinterest de base. |
| **Designer Agent** | Produz/adapta o ativo visual do Pin. |
| **Integration Hub** | Portão obrigatório para a integração externa com a API Pinterest. |
| **AI Hub** | Sustentaria os Agentes do Capítulo 16. |

---

## 19. Melhores Práticas

- **Baixo acoplamento** — o Pinterest consumiria Conteúdo do Blog e exporia Tráfego/Métricas para Analytics via contrato, sem conhecer a implementação interna de nenhum dos dois.
- **Observabilidade** — todo Pin precisaria ser rastreável até o Conteúdo/Board de origem — sem isso, Tráfego de saída não é atribuível.
- **Eventos** — finalmente emitir `PIN_CREATED`/`PIN_PUBLISHED`/`PINTEREST_ANALYZED` (hoje só declarados) no momento em que a lógica real existir, em vez de manter vocabulário morto indefinidamente.
- **Consistência de nomenclatura** — a string "Pinterest Agent" já aparece em dois componentes de UI (`AgentPanel.tsx`, `RightPanel.tsx`) de forma independente e com status diferentes; qualquer implementação futura deveria unificar essa fonte antes de conectar dado real, para não perpetuar a divergência já observada no Capítulo 9.
- **Baixo custo de reaproveitamento** — o valor central deste módulo (redistribuir Conteúdo já existente) só se sustenta se a implementação de fato reaproveitar ativos do Blog/Designer Agent, em vez de exigir produção paralela.

---

## 20. Riscos

- **Mudanças na API Pinterest** — a API pode alterar formato, versão ou política de Rich Pins/Idea Pins sem aviso, quebrando ingestão ou publicação.
- **Atribuição incorreta de Tráfego** — sem rastreamento de UTM/Outbound bem configurado, o retorno real do canal pode ser subestimado ou superestimado.
- **Dependência de conteúdo do Blog** — sem produção contínua de Conteúdo no Blog, o Pinterest não tem o que redistribuir — é o módulo de Growth Hub com a dependência de insumo mais direta de todas (Capítulo 18).
- **Baixo controle de marca** — Pins podem ser salvos (repin) e redistribuídos por terceiros fora do controle da Empresa, diluindo a atribuição de origem.
- **LGPD** — mesmo cuidado de consentimento/finalidade já registrado em `docs/requirements/growth/GROWTH_HUB.md` §13, aplicado a qualquer dado comportamental de clique coletado via Pixel/UTM de retorno.

---

## 21. Visão Futura

- **Recomendação automática de Boards** — sugestão de novos Boards com base em Categorias de melhor desempenho no Blog.
- **Geração automática de Pin** — a partir de um artigo recém-publicado, sem intervenção manual de Designer Agent para o caso mais simples.
- **Idea Pins assistidos por IA** — roteirização automática de formato multi-página a partir de conteúdo de Blog já existente.
- **Unificação de nomenclatura** — resolução formal de "Pinterest Agent" como um único Agente real (hoje um nome repetido em dois componentes mockados sem vínculo, Capítulo 9/16), antes de qualquer dado real ser conectado a ele.

---

## 22. Conclusão

O módulo Pinterest, hoje, é **puramente vocabular e decorativo de UI**: zero código funcional, zero estrutura própria dedicada. Entre os seis módulos de Growth Hub já auditados nesta série (Blog, SEO, Analytics, Search Console, AdSense, Google Ads, Meta Ads), o Pinterest se destaca por dois motivos específicos — nenhum deles equivalente a funcionalidade real: (1) é o único com um grupo de evento próprio no `EventBus` (`// Pinterest`, com dois eventos dedicados além do `PINTEREST_ANALYZED` genérico), e (2) é o único cujo nome de canal aparece literalmente dentro de dois componentes de UI já renderizados na aplicação (`AgentPanel.tsx`, `RightPanel.tsx`), ainda que como string isolada, sem vínculo com o enum `AgentType.PINTEREST` nem entre si. O único scaffold estrutural minimamente relacionável (`src/modules/marketing/`, `src/modules/analytics/`) é genérico e compartilhado, sem nenhuma linha de lógica específica de Pinterest. Toda a especificação funcional deste documento — Boards, Rich Pins, Idea Pins, Tráfego de saída — parte de folha em branco, na mesma situação de Google Ads, AdSense, Search Console e Meta Ads.

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
