# WEB STORIES — Especificação Funcional do Módulo

**Andreia AI Platform** · Growth Hub
Documentação funcional do módulo Web Stories — o décimo terceiro módulo do Growth Hub a ser especificado em detalhe, seguindo o padrão de 17 itens obrigatórios já usado em `docs/requirements/growth/META_ADS.md` (Sprint 12.0) até `LANDING_PAGES.md` (Sprint 17.0).

Este documento é uma **especificação funcional**, não uma implementação. Relaciona-se com `docs/requirements/growth/GROWTH_HUB.md` (Web Stories é um dos 18 módulos ali listados, descrito em §4 como "formato de conteúdo curto e visual, geralmente derivado de conteúdo já existente do Blog") e com `docs/requirements/growth/BLOG.md` §3/§9, que já cita Web Story como uma derivação de artigo ("Formato derivado, tipicamente reaproveitando conteúdo/imagens já produzidos para um artigo"). Esta Sprint é **exclusivamente de documentação** — nenhum arquivo `.ts`, `.tsx`, `.json` ou `.css` foi alterado para produzi-la; apenas ferramentas de leitura (Read, Grep, Glob) foram usadas. Por instrução explícita desta Sprint, toda conclusão abaixo se apoia **exclusivamente** na auditoria do código atual — documentação anterior é citada apenas como referência cruzada, nunca como fonte de verdade sobre o que existe implementado.

**Legenda usada em todo o documento (quatro níveis):**
- 🟢 **Implementado** — lógica real, funcional, executável hoje.
- 🟡 **Estrutura** — existe código real (uma classe, um scaffold), mas sem lógica de negócio completa por trás.
- 🔷 **Vocabulário** — existe apenas um nome, string ou valor de enum declarado — sem nenhuma estrutura ao redor.
- ⚪ **Planejado** — não existe nenhum vestígio no código; é direção de design.

---

## Missão do módulo

O Web Stories **não é** tratado como um formato de imagem. É o **Centro Inteligente de Conteúdo Efêmero Visual**, cujo objetivo é transformar Conteúdo já produzido (Blog) em consumo rápido, em tela cheia, com o menor atrito possível para quem está de passagem.

---

## 1. Objetivo

**O que é:** o módulo Web Stories é a camada da plataforma responsável por transformar Conteúdo já publicado no Blog em um formato de Slides curto e visual (Web Story/AMP Story) — narrativa em tela cheia, navegação por toque, tipicamente reaproveitando texto e imagens já produzidos para o artigo de origem.

**Objetivos funcionais:**
- Derivar Web Stories a partir de artigos já existentes, mesma definição já registrada em `docs/requirements/growth/BLOG.md` §3 ("suas derivações — imagem, vídeo, Web Story") e §9 ("Formato derivado, tipicamente reaproveitando conteúdo/imagens já produzidos para um artigo").
- Produzir Slides com Imagem/Vídeo, Transição e Legenda curta, sem exigir redação original para cada Web Story.
- Publicar no formato técnico esperado (estrutura AMP Story, Dados estruturados/Schema), garantindo elegibilidade a superfícies de descoberta do Google (Discover, resultados visuais).
- Medir Visualizações e retenção por Slide, alimentando o Analytics com retorno deste formato específico.

**Benefícios:**
- Formato de consumo rápido, alinhado a hábito de navegação mobile, complementar ao artigo de longa duração do Blog.
- Custo de produção baixo — reaproveita ativos (texto, imagem) já pagos pela produção do artigo original, sem exigir Conteúdo dedicado.
- Superfície de descoberta adicional (Google Discover, carrossel de Stories), fora do resultado de busca tradicional já coberto por SEO/Search Console.

**Problemas que resolve:**
- Conteúdo de artigo já produzido, mas nunca reaproveitado em formato mais rápido de consumir, perdendo alcance em audiência que prefere Stories a texto longo.
- Falta de visão de qual Slide/Web Story efetivamente retém atenção, versus qual é abandonado logo no início.
- Publicação de Web Story sem Dados estruturados corretos, tornando o conteúdo inelegível às superfícies de descoberta que dependem desse Schema.

## 2. Escopo

Derivação de Web Stories a partir de artigos do Blog, montagem de Slides (Imagem/Vídeo/Áudio, Transição, Legenda/Narração), Capa (Thumbnail/Cover) de abertura, Publicação no formato técnico AMP Story com Dados estruturados, e monitoramento de Visualizações/retenção por Slide.

**Limites:**
- O Web Stories não produz o Conteúdo original — deriva do que o Blog já publicou (`docs/requirements/growth/BLOG.md` §9), mesmo limite já registrado para Pinterest (`docs/requirements/growth/PINTEREST.md` §2) e para os módulos de Ads.
- O Web Stories não é o módulo SEO — depende de Dados estruturados/Schema corretos, mas a estratégia de palavra-chave e estrutura técnica mais ampla é responsabilidade do SEO (`docs/requirements/growth/BLOG.md` linha 36: "Ele não substitui o módulo SEO").
- O Web Stories não substitui o Analytics como medição geral do site — mede especificamente Visualizações/retenção deste formato (`docs/requirements/growth/BLOG.md` linha 36).

---

## 3. Auditoria Completa

Auditei o repositório inteiro (`src/`, `docs/`, `package.json`) pelos termos pedidos por esta Sprint: `Web Story`, `Web Stories`, `Story`, `Stories`, `AMP Story`, `Google Web Stories`, `StoryBuilder`, `StoryTemplate`, `Slide`, `SlideBuilder`, `Scene`, `SceneBuilder`, `Page`, `Media`, `Image`, `Video`, `Audio`, `Animation`, `Transition`, `Timeline`, `Narration`, `Thumbnail`, `Cover`, `Preview`, `Publish`, `Publishing`, `AMP`, `Metadata`, `Structured Data`, `Schema`, `SEO`, `Analytics`, `Tracking`, `UTM`, `Webhook`, `AgentType`, `EventType`, além de varredura estrutural por Enums, Interfaces, Factories, Stores, Services, Hooks, Pipelines, Modules, Scenes, UI. Toda busca foi caso-insensível, com checagem manual de falsos positivos — este conjunto de termos é o mais propenso a colisão de toda a série, por reunir palavras centrais do vocabulário de um jogo Phaser 2D (`src/game/*`) já presente no repositório: `Scene` é literalmente o nome de classe do Phaser (`OfficeScene.ts`) e do componente de área central do Dashboard (`ScenePanel.tsx`, `SceneArea.tsx`); `Image`/`Video`/`Audio`/`Media` colidem com o tipo de `Artifact` de saída de squad (`src/types/state.ts`, união `"video" | "image" | ...`) e com classificação de extensão de arquivo (`squadWatcher.ts`); `Animation`/`Transition` colidem com config de sprite do jogo e CSS de hover de botão; `Metadata` colide com o comentário `// Squad metadata from squad.yaml`.

### Termo por termo — o que foi encontrado

| Termo buscado | Ocorrência real | Onde |
|---|---|---|
| `Web Story`, `Web Stories`, `AMP Story`, `Google Web Stories`, `StoryBuilder`, `StoryTemplate` | Zero ocorrências em `src/` — aparece apenas em prosa de `docs/` | `docs/*` (nenhum em `src/`) |
| `Story`/`Stories` (isolado, com limite de palavra) | Zero ocorrências reais | — |
| `Slide`/`SlideBuilder` | Zero ocorrências | — |
| `Scene`/`SceneBuilder` | Falsos positivos apenas — `OfficeScene.ts` (classe de cena do Phaser), `ScenePanel.tsx`/`SceneArea.tsx` (componente de área central do Dashboard que renderiza o jogo), `ScenePanel.module.css` — todos relativos à visualização do escritório virtual 2D, sem nenhuma relação com Slide/Story | `src/game/scenes/OfficeScene.ts`, `src/components/center/ScenePanel.tsx`, `src/components/scene/SceneArea.tsx` |
| `Page` (isolado) | Falso positivo — mesma colisão já descartada em `docs/requirements/growth/LANDING_PAGES.md` §3 (`DashboardPage.tsx`) | `src/pages/DashboardPage.tsx` |
| `Media`, `Image`, `Video`, `Audio` | Falsos positivos apenas — tipo de `Artifact` de saída de squad (`type: "video" \| "image" \| "markdown" \| "data" \| "pdf" \| "text" \| "file"`, `src/types/state.ts:5`) e classificação de extensão de arquivo por squad watcher, ambos genéricos ao sistema de squads, sem relação com Slide de Web Story | `src/types/state.ts`, `src/plugin/squadWatcher.ts` |
| `Animation` | Falso positivo — `src/game/config/animations.ts` (import de sprites do personagem do jogo, `WORKER_SPRITES`), sem relação com Transição de Slide | `src/game/scenes/OfficeScene.ts` |
| `Transition` | Falso positivo — propriedade CSS `transition: "0.2s"` de hover de botão (`src/components/tasks/NewTaskButton.tsx`), sem relação com Transição de Slide | `src/components/tasks/NewTaskButton.tsx` |
| `Timeline`, `Narration`, `Thumbnail`, `Cover`, `Preview` | Zero ocorrências reais | — |
| `Publish`/`Publishing` (isolado) | Zero ocorrências reais além do já conhecido `BLOG_PUBLISHED`/`PIN_PUBLISHED` (grupos `// Blog`/`// Pinterest`, já documentados em Sprints anteriores, sem relação com Web Stories) | `src/core/events/EventTypes.ts:21,25` |
| `AMP`, `Structured Data`, `Schema` | Zero ocorrências em todo `src/` | — |
| `Metadata` | Falso positivo — comentário `// Squad metadata from squad.yaml` (`src/types/state.ts:66`), sobre metadado de squad, não de Web Story | `src/types/state.ts` |
| `SEO` (enum) | 🔷 Vocabulário já documentado em Sprints anteriores — `AgentType.SEO`, sem relação específica com Web Stories | `src/core/agents/registry/AgentTypes.ts` |
| `AgentType` (catálogo geral) | Nenhum valor relacionado a Web Stories existe — 10 valores no total (`BLOG`, `SEO`, `PINTEREST`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`, `CRM`, `DESIGN`, `ANALYTICS`, `AUTOMATION`), nenhum `WEB_STORY`/`STORY` ou equivalente | `src/core/agents/registry/AgentTypes.ts` |
| `EventType` (catálogo geral) | Nenhum evento relacionado a Web Stories existe, nem mesmo em nome de grupo de comentário | `src/core/events/EventTypes.ts` |
| Dependência em `package.json` (biblioteca AMP/Web Stories: `amphtml`, `amp-story`, `@ampproject`) | Zero | `package.json` |

### 🟢 Código funcional

**Nenhum.** Nenhuma lógica de negócio de Web Stories existe em nenhuma camada.

### 🟡 Estruturas

Nenhuma estrutura **dedicada ou genuinamente aplicável** existe. Diferente de todos os módulos anteriores desta série (que ao menos tinham `src/modules/marketing/` ou `src/modules/communication/` como candidato de nomenclatura plausível), o Web Stories **não tem nenhum scaffold cujo nome sugira aplicabilidade** — não é sobre campanha, conteúdo genérico, comunicação ou automação, é especificamente sobre um formato de mídia visual, e nenhum módulo existente em `src/modules/*` (`crm`, `business`, `agenda`, `marketing`, `communication`, `analytics`, `fiscal`, `hr`, `projects`, `documents`, `academy`, `marketplace`) tem esse escopo.

O único precedente estrutural tangencial é o próprio motor de jogo Phaser (`src/game/scenes/*`, `ScenePanel.tsx`), mas — como demonstrado no Capítulo 3 — trata-se da visualização do escritório virtual 2D da aplicação atual, sem nenhuma relação de domínio com produção de conteúdo Web Story; é citado aqui apenas para que fique registrado que a colisão de nome (`Scene`) foi investigada e descartada, não ignorada.

### 🔷 Vocabulário

**Nenhum item de vocabulário específico de Web Stories existe.** Diferente de todos os módulos anteriores (que tinham, no mínimo, um evento ambíguo ou um `AgentType` tangencial), não há aqui nem mesmo um item indiretamente relevante — `BLOG_PUBLISHED` (grupo `// Blog`) é o precedente mais próximo por semântica de "publicação de conteúdo", mas nomeia exclusivamente o domínio do Blog, não uma derivação em Web Story:

| Achado | Onde | Natureza real |
|---|---|---|
| `BLOG_PUBLISHED: "BLOG_PUBLISHED"` (grupo `// Blog`) | `src/core/events/EventTypes.ts:21` | Evento do domínio do Blog — um Web Story derivado de um artigo, se implementado, poderia reagir a este evento como gatilho de derivação, mas o nome do evento não menciona nem distingue Web Stories de nenhuma outra ação sobre o artigo original. **Nunca emitido nem assinado** em nenhum lugar do código. |

### ⚪ Funcionalidades inexistentes

Todo o restante, sem exceção — confirmado termo a termo:

- `Web Story`/`Web Stories`, `AMP Story`, `StoryBuilder`, `StoryTemplate`, `Slide`/`SlideBuilder`, `Timeline`, `Narration`, `Thumbnail`, `Cover` (real, de capa de Story), `Preview`, `AMP`, `Structured Data`, `Schema` — **zero ocorrências em todo `src/`**.
- Nenhum valor de `AgentType` correspondente.
- Nenhum evento em `EventTypes.ts` correspondente, nem mesmo um genérico dedicado.
- Nenhuma menção em componente visual mockado (`Sidebar.tsx`, `AgentPanel.tsx`, `RightPanel.tsx`, `KpiCards.tsx`, `BottomPanel.tsx`) — confirmado por auditoria direta no Capítulo 9.
- Nenhuma pasta, arquivo, enum, mock ou componente dedicado.
- Nenhuma dependência de biblioteca AMP/Web Stories em `package.json`.
- Nenhum capítulo, fluxo ou sequer menção de tabela dedicada em `docs/05-ECOSYSTEM_MAP.md` — diferente de Landing Pages (que ao menos aparecia como etapa em dois fluxos alheios), o Web Stories **não aparece em nenhum lugar** de `docs/05-ECOSYSTEM_MAP.md`.

### Resumo

| Categoria | Existe para Web Stories? |
|---|---|
| Arquivos dedicados | Nenhum |
| Pastas dedicadas | Nenhuma |
| Eventos | Nenhum — nem mesmo um genérico ambíguo ou indiretamente relevante que já mencione o formato |
| Enums | Nenhum |
| Estruturas genéricas plausivelmente aplicáveis | Nenhuma — único módulo desta série sem candidato de nomenclatura sequer parcial |
| Mocks de UI | Nenhum |
| Componentes | Nenhum |
| Menção em `docs/05-ECOSYSTEM_MAP.md` | Nenhuma — ausência total, nem mesmo de passagem |
| Dependências de pacote | Nenhuma |

### Conclusão objetiva da auditoria

O Web Stories é, entre os doze módulos de Growth Hub já auditados nesta série (Blog, SEO, Analytics, Search Console, AdSense, Google Ads, Meta Ads, Pinterest, Pinterest Ads, Google Business Profile, Email Marketing, Landing Pages), o único **sem nenhum candidato de estrutura genérica sequer parcialmente aplicável por nome** e o único **inteiramente ausente de `docs/05-ECOSYSTEM_MAP.md`** — nem como fluxo próprio, nem como etapa de outro fluxo, nem como linha de tabela de integração. Isso o coloca em uma posição de vocabulário ainda mais vazia do que Landing Pages (que ao menos aparecia como nó em dois diagramas alheios) e equivalente à de Email Marketing em termos de ausência de qualquer item nomeado — mas sem o consolo dos scaffolds genéricos de nomenclatura compatível que Email Marketing tinha (`communication`, `automation`).

---

## 4. Estruturas Encontradas

| Estrutura | Estado | Observação |
|---|---|---|
| `src/modules/web-stories/` (ou equivalente dedicado) | ⚪ Inexistente | Confirmado por varredura completa de `src/modules/*` (12 módulos existentes: `crm`, `business`, `agenda`, `marketing`, `communication`, `analytics`, `fiscal`, `hr`, `projects`, `documents`, `academy`, `marketplace`; nenhum relacionado a Web Stories). |
| `src/modules/marketing/` | 🟡 Estrutura genérica, mesmo candidato fraco já usado por outros módulos | Escopo "campanhas e conteúdo" — aplicável em tese a qualquer formato de conteúdo, mas sem nenhuma evidência de exclusividade nem menção a Web Stories. |
| `src/game/scenes/`, `src/components/center/ScenePanel.tsx` | 🟢 Código real, mas **sem relação de domínio** | Ver Capítulo 3 — motor de jogo Phaser do escritório virtual, investigado e descartado como falso cognato de "Scene"/"Slide". |
| `src/core/connectors/` (`BaseConnector`, `ConnectorManager`, `ConnectorRegistry`, `ConnectorTypes`, `ConnectorEvents`) | 🟡 Estrutura genérica de infraestrutura | Nenhum conector concreto para publicação AMP/Web Story existe; `BaseConnector` é `abstract class` com stubs neutros, mesmo padrão já confirmado para todos os módulos anteriores. |
| `src/shared/interfaces/IModule.ts`, `IConnector.ts` | 🟢 Contrato real, usado por toda a plataforma | Interfaces genéricas que um eventual módulo/conector Web Stories precisaria implementar — não são específicas deste módulo. |

Nenhuma estrutura de dado (`Story`, `Slide`, `Transition`, `Cover`) existe em nenhum `Models.ts` auditado.

---

## 5. Componentes Encontrados

Nenhum componente funcional ou mockado de Web Stories existe. Os componentes que o módulo **teria**, todos ⚪ Planejado:

| Componente | Função |
|---|---|
| **Visão Geral** | Painel-resumo consolidado do módulo. |
| **Web Stories** | Lista de Stories já derivadas, uma por artigo de origem (tipicamente). |
| **Editor de Slides** | Montagem de cada Slide — Imagem/Vídeo de fundo, Legenda, Transição para o próximo. |
| **Capa (Cover)** | Slide de abertura, com Thumbnail representativo da Story inteira. |
| **Narração** | Texto curto de acompanhamento por Slide, derivado do artigo original. |
| **Publicação** | Geração do formato técnico AMP Story e envio ao destino (WordPress/CDN). |
| **Dados estruturados** | Schema exigido pelo formato, validando elegibilidade às superfícies de descoberta. |
| **Visualizações** | Métrica central — quantas Stories foram abertas e até que Slide a retenção chegou. |
| **Relatórios** | Consolidação periódica do dado deste módulo. |
| **Alertas** | Ver Capítulo 9. |
| **Oportunidades** | Recomendação de qual artigo do Blog é bom candidato a virar Web Story, com base em desempenho já medido. |
| **Configurações** | Destino de publicação conectado, template padrão de Slide, limites de Alerta. |

---

## 6. Eventos Encontrados

Já detalhado no Capítulo 3, consolidado aqui: **nenhum evento específico de Web Stories existe, nem mesmo um genérico ambíguo.** O único evento tangencialmente relacionável por semântica de "conteúdo publicado" é `BLOG_PUBLISHED` (`src/core/events/EventTypes.ts:21`, grupo `// Blog`) — mas ele nomeia o domínio do Blog, não uma derivação em Web Story, e não deveria ser confundido com vocabulário próprio deste módulo. Nunca emitido nem assinado em nenhum lugar de `src/`.

Nenhum grupo de comentário `// Web Stories`, `// Story` ou equivalente existe em `EventTypes.ts` — diferente de Pinterest (que tem `// Pinterest` dedicado), o Web Stories não tem sequer esse nível de reserva de nome. Toda comunicação de evento, quando implementada, passaria pelo `EventBus` único já existente (`src/core/events/EventBus.ts`), mesma regra arquitetural já fixada em `docs/02-SYSTEM_ARCHITECTURE.md` §10.

---

## 7. Enums Encontrados

Já detalhado no Capítulo 3, consolidado aqui: **nenhum enum específico de Web Stories existe.** `src/core/agents/registry/AgentTypes.ts` declara exatamente 10 valores (`BLOG`, `SEO`, `PINTEREST`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`, `CRM`, `DESIGN`, `ANALYTICS`, `AUTOMATION`) — nenhum relacionado a Web Stories. Nenhum enum de domínio (`SlideType`, `TransitionType`, `StoryStatus`) existe em nenhum lugar. Nenhum enum `ConnectorType` com valor correspondente a publicação AMP existe — `src/core/connectors/ConnectorTypes.ts` é `export {}` vazio.

---

## 8. Integrações

Todas ⚪ Planejado — nenhuma implementada hoje, confirmado por auditoria de `src/core/connectors/*` (Capítulo 4: todos os arquivos são stubs/contratos vazios, sem nenhum conector concreto).

| Integração | Papel no módulo Web Stories |
|---|---|
| **Blog** | Fonte de Conteúdo/imagem derivada em Web Story — dependência mais fundamental do módulo, já registrada em `docs/requirements/growth/BLOG.md` §3/§9. |
| **Designer Agent** | Produziria/adaptaria Imagem/Vídeo usados nos Slides — já citado em `docs/requirements/growth/GROWTH_HUB.md` §7 ("Designer Agent — produz Imagem e, quando aplicável, Vídeo/Web Stories"). |
| **SEO** | Consumidor/fornecedor de Dados estruturados (Schema) que garantem elegibilidade — `docs/requirements/growth/BLOG.md` linha 36 já registra que o Blog "não substitui o módulo SEO", mesma fronteira aplicável aqui. |
| **Analytics** | Consumiria Visualizações/retenção por Slide como uma das Fontes de Dados do módulo, sem nenhum tipo correspondente hoje em `src/modules/analytics/`. |
| **WordPress** | Destino técnico de publicação do formato AMP Story, mesmo Connector já usado pelo Blog (`docs/requirements/growth/BLOG.md` §7). |
| **Google (Discover)** | Superfície de descoberta que consome Web Stories publicadas com Schema correto — sem nenhum precedente de Connector Google específico para este formato. |
| **Claude / OpenAI / Gemini** | Provedores de IA que sustentariam a geração de Legenda/Narração curta a partir do artigo original — mesma ressalva já registrada em `docs/requirements/growth/META_ADS.md` §13, `PINTEREST.md` §8, `GOOGLE_BUSINESS_PROFILE.md` §8, `EMAIL_MARKETING.md` §8 e `LANDING_PAGES.md` §8: a citação repetida de que `src/providers/gemini/` "já reserva a pasta" não corresponde ao estado real do código, que só tem `src/providers/mock/MockAIProvider.ts`. |

---

## 9. UI

Auditoria de todos os componentes visuais hoje renderizados na aplicação — nenhum menciona Web Stories, Slide, AMP ou qualquer termo desta Sprint:

| Componente | Arquivo | O que existe hoje |
|---|---|---|
| **Sidebar** | `src/components/sidebar/Sidebar.tsx` | Array estático de 9 rótulos (`Dashboard`, `Squads`, `Agentes`, `Tarefas`, `Automações`, `Analytics`, `Integrações`, `Eventos`, `Configurações`) — nenhum item relacionado. |
| **AgentPanel** | `src/components/AgentPanel.tsx` | Lista mockada de 4 agentes: `Blog Agent`, `SEO Agent`, `Pinterest Agent`, `WordPress Agent` — nenhum "Web Stories Agent" ou equivalente. |
| **RightPanel** | `src/components/rightpanel/RightPanel.tsx` | Lista mockada de 3 agentes: `Blog Agent`, `SEO Agent`, `Pinterest Agent` — mesma ausência. |
| **KpiCards** | `src/components/cards/KpiCards.tsx` | 6 cards; só "Agentes" é real; os demais são strings hardcoded — nenhum card de Visualizações/retenção de Story. |
| **BottomPanel** | `src/components/bottom/BottomPanel.tsx` | Sem nenhuma ocorrência de termo relacionado na varredura textual do Capítulo 3. |
| **ScenePanel / SceneArea** | `src/components/center/ScenePanel.tsx`, `src/components/scene/SceneArea.tsx` | Componentes reais, mas renderizam o jogo Phaser do escritório virtual (`src/game/scenes/OfficeScene.ts`) — nenhuma relação com Slide/Story de conteúdo, apesar da colisão de nome já investigada no Capítulo 3. |

Nenhuma Janela, Widget ou tela dedicada existe em `src/components/dashboard/` — pasta já registrada como **inteiramente vazia** em `docs/requirements/growth/ANALYTICS.md` ("Nota metodológica").

**Observação de UI:** Web Stories é, junto com Google Business Profile, Email Marketing e Landing Pages, um dos módulos, entre os doze já documentados nesta série, **sem nenhuma menção — nem mesmo decorativa — em qualquer componente de UI já renderizado.**

---

## 10. Runtime

O runtime da plataforma (`src/core/platform/`) é genérico e não conhece nenhum módulo de negócio por nome — nem Web Stories, nem qualquer um dos 18 módulos do Growth Hub, mesma conclusão já registrada nos documentos anteriores desta série:

- **`PlatformRuntime.ts`** — mantém `bootManager`, `lifecycleManager`, `moduleLoader`, `connectorLoader`, `automationLoader` e `RuntimeState`; `init()` executa o `BootPipeline` (Capítulo 11) e transiciona estado, mas **nenhum módulo/conector concreto é carregado**.
- **`ModuleLoader.ts`** — `load()` retorna lista vazia; comentário do próprio arquivo confirma "nenhum import dinâmico de módulos concretos".
- **`ConnectorManager.ts`** — `ILifecycle` com `init/start/stop` vazios, nenhum conector concreto orquestrado.
- Conclusão: o Web Stories não tem nenhum ponto de entrada no runtime real — consistente com o estado ⚪ Planejado de todo o Growth Hub. O motor de jogo Phaser (`src/game/*`), apesar de ter seu próprio ciclo de renderização real e funcional, é uma camada de visualização da aplicação atual, sem nenhuma conexão com o `PlatformRuntime` da nova plataforma nem com qualquer lógica de produção de conteúdo.

---

## 11. Pipeline

A infraestrutura de pipeline (`src/core/pipeline/Pipeline.ts`) é genérica e reutilizável — hoje com uma única especialização real, `BootPipeline`, sem relação com Web Stories:

- `Pipeline.execute()` já roda de verdade (registra `PipelineStep`s, cria `PipelineContext`, executa em ordem, produz `PipelineResult`) — mecanismo genérico, sem qualquer noção de "Slide", "Story" ou "Transição".
- `BootPipeline` registra apenas três etapas estruturais (`InitializeRuntimeStep`, `ValidateRuntimeStep`, `FinalizeRuntimeStep`), com `execute/rollback` vazios.
- Não existe, e não é citado em nenhum lugar, um pipeline de derivação de conteúdo (`StoryDerivationPipeline`, `SlideRenderPipeline` ou equivalente) que orquestraria etapas como "selecionar artigo → extrair trechos/imagens → montar Slides → gerar AMP Story → publicar".
- Conclusão: **zero precedente de pipeline específico de Web Stories** — apenas a infraestrutura genérica, já usada para Boot, disponível para reuso futuro.

---

## 12. Fluxo Arquitetural

**Nenhum fluxo arquitetural de Web Stories existe em `docs/05-ECOSYSTEM_MAP.md`** — diferente de todos os módulos de Ads/orgânicos já documentados (que ao menos apareciam com fluxo próprio ou como etapa de outro), o Web Stories **não é mencionado em nenhum lugar** deste documento, nem no diagrama de arquitetura de alto nível do Capítulo 1, nem na tabela de integrações do Capítulo 12. Este é, por si, o achado mais forte desta Sprint: entre os treze módulos de Growth Hub já auditados nesta série contando este, é o único com ausência total em `docs/05-ECOSYSTEM_MAP.md`.

Por analogia estrutural com a relação já documentada em `docs/requirements/growth/BLOG.md` §9 ("Web Stories — Formato derivado, tipicamente reaproveitando conteúdo/imagens já produzidos para um artigo") e com o papel do Designer Agent já citado em `docs/requirements/growth/GROWTH_HUB.md` §7, o fluxo mais provável para Web Stories — **não documentado em nenhum lugar, portanto integralmente hipotético e explicitamente marcado como tal** — seria:

```
Artigo publicado (Blog) → Seleção de trechos/imagens → Slides (Designer Agent) → AMP Story + Schema → Publicação (WordPress) → Visualizações → Analytics
```

Esta sequência **não tem nenhum precedente em `docs/` nem em `src/`** — é uma inferência por analogia, apresentada aqui apenas para preencher a lacuna identificada, e deve ser tratada como ⚪ Planejado no grau mais alto.

Dentro do fluxo geral do Growth Hub (`docs/requirements/growth/GROWTH_HUB.md` §5: `Pesquisa → Planejamento → Conteúdo → SEO → Imagem → Vídeo → Publicação → Distribuição → Indexação → Monitoramento → Otimização → Monetização → Dashboard`), o Web Stories se encaixaria como uma ramificação das etapas **Imagem**/**Vídeo** — já nomeadas no fluxo geral — em vez de uma etapa própria, reforçando sua natureza de formato derivado, não de canal independente.

---

## 13. Precedentes Reais da Implementação

Consolidação dos Capítulos 3–7: **não existe nenhum precedente real de implementação de Web Stories, nem mesmo vocabulário indiretamente relevante que já mencione o formato.** Diferente de todos os módulos anteriores desta série — que tinham, no mínimo, um evento ambíguo (`GOOGLE_ANALYZED`), um evento de domínio vizinho consumível (`LEAD_RECEIVED`, citado para Email Marketing e Landing Pages), ou um `AgentType` tangencial — o único item aqui é `BLOG_PUBLISHED`, e mesmo esse nomeia exclusivamente o Blog, não uma derivação em Web Story. Não há:

1. Nenhum `AgentType`.
2. Nenhum evento dedicado ou ambíguo.
3. Nenhuma string em UI mockada.
4. Nenhum scaffold de módulo genuinamente aplicável por nome — nem mesmo um candidato fraco como `communication` foi para Email Marketing.
5. Nenhuma menção em `docs/05-ECOSYSTEM_MAP.md`.

**Achado adicional (inconsistência a registrar, não corrigir):** `docs/requirements/growth/GROWTH_HUB.md` §3 lista Web Stories como um dos 18 módulos do Growth Hub, com responsabilidade descrita em §4, e `docs/requirements/growth/BLOG.md` §3/§9 já o cita duas vezes como destino de derivação de conteúdo. Apesar dessas duas menções específicas (mais detalhadas, proporcionalmente, do que a Google Business Profile recebeu antes de seu próprio documento dedicado), a auditoria de código desta Sprint confirma que **nenhuma dessas responsabilidades tem qualquer estrutura, evento, enum ou candidato de scaffold correspondente** em `src/` — é o módulo com a maior distância entre "quantidade de menção em prosa" e "precedente de código" de toda a série até agora, considerando que possui menos precedente que Landing Pages mesmo tendo recebido mais atenção descritiva em documentos anteriores. Não é uma contradição factual (ambos os documentos usam a legenda ⚪), mas reforça, mais uma vez, que menção detalhada em prosa não equivale a qualquer precedente de implementação.

---

## 14. Comparação com Analytics, SEO, Landing Pages, Email Marketing, Google Ads, Meta Ads e Pinterest

| Módulo | Código funcional (🟢) | Estrutura (🟡) | Vocabulário (🔷) | Observação |
|---|---|---|---|---|
| **Analytics** | Nenhum | `src/modules/analytics/` completo (`IModule`), mais `AgentStore`/`KpiCards` parcialmente reais | `AgentType.ANALYTICS`; `KPI_UPDATED`, `DASHBOARD_REFRESH`, `*_ANALYZED` | Único módulo com um pedaço de UI genuinamente funcional. |
| **SEO** | Nenhum | Nenhuma dedicada | `AgentType.SEO` | `AgentType` dedicado, sem responsabilidade real correspondente. |
| **Landing Pages** | Nenhum | `src/modules/marketing/` — genérico | Nenhum item exclusivo (`LEAD_RECEIVED` é do CRM) | Único módulo já citado como etapa dentro do fluxo de dois módulos irmãos (Google Ads, Pinterest). |
| **Email Marketing** | Nenhum | `src/modules/communication/`, `src/core/automation/` — candidatos mais compatíveis por nome/escopo | Nenhum item que mencione o próprio módulo | Zero vocabulário absoluto, mas melhor alinhamento estrutural de nomenclatura. |
| **Google Ads** | Nenhum | Nenhuma | Apenas `GOOGLE_ANALYZED` (ambíguo) | Nenhum `AgentType` dedicado. |
| **Meta Ads** | Nenhum | `src/modules/marketing/` — genérico | `META_ANALYZED` (inequívoco) + `AgentType.FACEBOOK`/`AgentType.INSTAGRAM` | Vocabulário de enum mais forte entre os módulos pagos. |
| **Pinterest** | Nenhum | `src/modules/marketing/`, `src/modules/analytics/` — genéricos | `AgentType.PINTEREST` + 3 eventos dedicados + `"Pinterest Agent"` em 2 componentes de UI | Maior número de eventos dedicados; única presença literal em UI real. |
| **Web Stories** (este documento) | Nenhum | **Nenhuma estrutura genuinamente aplicável** — nenhum scaffold, nem mesmo fraco, sugere este escopo | **Nenhum item exclusivo** — único item relacionável (`BLOG_PUBLISHED`) pertence ao Blog | **Único módulo, entre os treze já auditados, ausente por completo de `docs/05-ECOSYSTEM_MAP.md`**, e o único sem nenhum candidato de scaffold sequer parcialmente compatível por nome. |

**Leitura da comparação:** Web Stories compartilha com Landing Pages, Email Marketing e Google Business Profile a ausência total de vocabulário exclusivo, mas é o único dos quatro sem nenhum consolo estrutural — nem um scaffold de nome compatível (como `communication` para Email Marketing), nem uma aparição em diagrama de fluxo alheio (como "Landing Page" nos fluxos de Google Ads/Pinterest). É, de todos os treze módulos já documentados nesta série, o que menos deixou rastro em qualquer camada do repositório — código ou documentação de arquitetura — apesar de ter recebido descrição relativamente detalhada em dois documentos anteriores (`GROWTH_HUB.md`, `BLOG.md`).

---

## 15. Matriz de Estado

| Item | Estado | Evidência |
|---|---|---|
| Módulo dedicado (`src/modules/web-stories`) | ⚪ | Não existe — Capítulo 4 |
| Scaffold genérico aplicável | ⚪ | Nenhum candidato mesmo fraco — Capítulo 3/4 |
| Evento dedicado ou ambíguo | ⚪ | Nenhum — Capítulo 6 |
| Evento de domínio vizinho relevante (`BLOG_PUBLISHED`) | 🔷 (do Blog, não deste módulo) | `EventTypes.ts:21` |
| Enum dedicado (`AgentType`) | ⚪ | Nenhum — Capítulo 7 |
| String de UI (mockada ou real) | ⚪ | Nenhuma — Capítulo 9 |
| Classe `StoryBuilder`/`SlideRenderer`/`AmpPublisher` | ⚪ | Nenhuma ocorrência — Capítulo 3 |
| Conector de publicação AMP/Web Story | ⚪ | `src/core/connectors/*` são stubs genéricos — Capítulo 4/8 |
| Componente de UI funcional (com dado real) | ⚪ | Capítulo 9 |
| Runtime/Pipeline específico | ⚪ | Capítulos 10/11 |
| Fluxo arquitetural em documentação | ⚪ | **Ausência total** em `docs/05-ECOSYSTEM_MAP.md` — Capítulo 12 |
| Dependência de pacote (biblioteca AMP/Web Stories) | ⚪ | `package.json` — Capítulo 3 |
| Código funcional (🟢) de qualquer natureza | 🟢 **Nenhum** | Capítulos 3–11 |

---

## 16. Conclusão

O módulo Web Stories, hoje, não tem **absolutamente nenhum precedente de implementação, vocabulário reservado exclusivo, candidato de scaffold genérico ou sequer menção em documentação de arquitetura** — é o mais vazio dos treze módulos de Growth Hub já auditados nesta série (Blog, SEO, Analytics, Search Console, AdSense, Google Ads, Meta Ads, Pinterest, Pinterest Ads, Google Business Profile, Email Marketing, Landing Pages), em um sentido específico: é o único cuja ausência de `docs/05-ECOSYSTEM_MAP.md` é total, sem sequer uma aparição como etapa de outro fluxo (diferente de Landing Pages) ou como linha de tabela de integração (diferente de Google Business Profile). O único item relacionável por semântica (`BLOG_PUBLISHED`) pertence ao Blog, não a este módulo. A investigação desta Sprint foi particularmente sensível a falso positivo, dado que boa parte do vocabulário pedido (`Scene`, `Image`, `Video`, `Audio`, `Animation`, `Transition`, `Metadata`) já é usado, com sentido completamente diferente, pelo motor de jogo Phaser e pelo sistema de squads da aplicação atual — todas essas colisões foram investigadas e descartadas individualmente. Toda a especificação funcional deste documento — Slides, Transições, Capa, Narração, Dados estruturados — parte de folha inteiramente em branco.

## 17. Próximos Passos

| Fase | Foco |
|---|---|
| **Fase 1 — Criação do módulo** | Scaffold dedicado sobre `IModule` (`src/modules/web-stories/`) — sem lógica de negócio. Diferente de todos os módulos anteriores, esta fase não tem nenhum scaffold genérico de nomenclatura compatível para se apoiar (Capítulo 13). |
| **Fase 2 — Derivação a partir do Blog** | Primeira lógica de seleção de trechos/imagens de um artigo já publicado — dependência mais direta do módulo (`docs/requirements/growth/BLOG.md` §9). |
| **Fase 3 — Editor de Slides** | Montagem de Slides (Imagem/Vídeo, Transição, Legenda), reaproveitando o Designer Agent (`docs/requirements/growth/GROWTH_HUB.md` §7). |
| **Fase 4 — Publicação AMP** | Geração do formato técnico AMP Story com Dados estruturados/Schema, e envio via Connector WordPress (mesmo já usado pelo Blog). |
| **Fase 5 — Visualizações** | Ingestão de retenção por Slide. |
| **Fase 6 — Fluxo arquitetural** | Documentar formalmente em `docs/05-ECOSYSTEM_MAP.md` o fluxo esboçado por analogia no Capítulo 12 deste documento — lacuna hoje mais completa de toda a série (ausência total, não parcial). |
| **Fase 7 — Integração com Analytics/SEO** | Visualizações/retenção alimentando as Fontes de Dados do Analytics; Dados estruturados validados em conjunto com o módulo SEO. |
| **Fase 8 — IA** | Um eventual Agente de derivação de conteúdo assumindo a seleção de trechos/imagens e a montagem de Slides de forma cada vez mais autônoma. |

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
