# PINTEREST ADS — Especificação Funcional do Módulo

**Andreia AI Platform** · Growth Hub
Documentação funcional do módulo Pinterest Ads — o nono módulo do Growth Hub a ser especificado em detalhe, seguindo o padrão de 17 itens obrigatórios já usado em `docs/requirements/growth/META_ADS.md` (Sprint 12.0) e `docs/requirements/growth/PINTEREST.md` (Sprint 13.0).

Este documento é uma **especificação funcional**, não uma implementação. Relaciona-se com `docs/requirements/growth/GROWTH_HUB.md` (Pinterest Ads é um dos 18 módulos ali listados — distinto de Pinterest orgânico, que é módulo próprio já documentado em `PINTEREST.md`) e com `docs/requirements/growth/PINTEREST.md` §2, que já registrava o limite: "O Pinterest não gerencia mídia paga — isso é papel do módulo irmão Pinterest Ads". Esta Sprint é **exclusivamente de documentação** — nenhum arquivo `.ts`, `.tsx`, `.json` ou `.css` foi alterado para produzi-la; apenas ferramentas de leitura (Read, Grep, Glob) foram usadas. Por instrução explícita desta Sprint, toda conclusão abaixo se apoia na auditoria do código atual — documentação anterior é citada apenas como referência cruzada, nunca como fonte de verdade sobre o que existe implementado.

**Legenda usada em todo o documento (quatro níveis):**
- 🟢 **Implementado** — lógica real, funcional, executável hoje.
- 🟡 **Estrutura** — existe código real (uma classe, um scaffold), mas sem lógica de negócio completa por trás.
- 🔷 **Vocabulário** — existe apenas um nome, string ou valor de enum declarado — sem nenhuma estrutura ao redor.
- ⚪ **Planejado** — não existe nenhum vestígio no código; é direção de design.

---

## Missão do módulo

O Pinterest Ads **não é** tratado como uma API. É o **Centro Inteligente de Aquisição de Tráfego Pago em Pinterest**, cujo objetivo é ampliar, com orçamento controlado, o alcance de descoberta visual que o módulo orgânico (`docs/requirements/growth/PINTEREST.md`) já constrói de forma gratuita.

---

## 1. Objetivo

**O que é:** o módulo Pinterest Ads é a camada da plataforma responsável por planejar, executar e otimizar campanhas de mídia paga na rede Pinterest (Pins Patrocinados, Shopping Ads, Collections Ads), sempre sob controle explícito de orçamento e Aprovação humana antes de qualquer gasto real — mesma regra já fixada em `docs/requirements/growth/GROWTH_HUB.md` §7 e repetida para os dois módulos pagos irmãos já documentados (`docs/requirements/growth/GOOGLE_ADS.md` §1, `META_ADS.md` §1).

**Objetivos funcionais:**
- Ampliar com orçamento pago o alcance de Pins que já performam bem organicamente (`docs/requirements/growth/PINTEREST.md` §5, "Pins").
- Direcionar Tráfego pago para Landing Page/Catálogo de produto, com Conversão mensurável.
- Otimizar continuamente CPC, CTR, CPA e ROAS especificamente do canal Pinterest, distinto de Google Ads e Meta Ads.
- Alimentar o Analytics com dado de desempenho pago Pinterest, já citado em `docs/requirements/growth/ANALYTICS.md` §3 ("Campanhas: desempenho consolidado de Google Ads, Meta Ads e Pinterest Ads lado a lado").

**Benefícios:**
- Aquisição paga em um canal de intenção de descoberta/compra (diferente de Meta Ads, mais social, e Google Ads, mais orientado a busca ativa).
- Reaproveitamento direto de Pins/Boards já criados pelo módulo orgânico (`PINTEREST.md`), reduzindo custo de produção de Criativo.
- Decisão de orçamento apoiada em Conversão real, cruzada com CRM/Financeiro, e não apenas em Impressão/Clique.

**Problemas que resolve:**
- Pins de bom desempenho orgânico limitados por alcance natural, sem opção de amplificação paga controlada.
- Gasto de mídia em Pinterest sem controle de orçamento ou sem checkpoint de Aprovação humana antes de ir ao ar.
- Falta de visão unificada do retorno pago em Pinterest frente a Google Ads/Meta Ads, hoje dispersa sem consolidação (`docs/requirements/growth/ANALYTICS.md` §3).

## 2. Escopo

Gestão de Campanhas por objetivo (Reconhecimento, Consideração, Conversão, Catálogo/Shopping), Grupos de anúncios, Criativos (Pins Patrocinados, Collections, Carrossel), Públicos (interesses, Palavras-chave, Públicos personalizados/semelhantes), Lances e Orçamento, rastreamento de Conversão via Tag/Pixel Pinterest, e integração de Catálogo de produto para anúncios de Shopping.

**Limites:**
- O Pinterest Ads não produz o Pin/Criativo do zero — reaproveita ativos já publicados pelo módulo orgânico Pinterest ou os adapta a formato de anúncio (mesmo limite já registrado em `docs/requirements/growth/GOOGLE_ADS.md` §1 e `META_ADS.md` §2).
- O Pinterest Ads não decide orçamento total da Empresa — decisão de negócio aprovada fora do módulo (Operations Hub).
- O Pinterest Ads não substitui o CRM como sistema de gestão de Lead, nem o módulo Pinterest orgânico como origem de Boards/Categorias (`docs/requirements/growth/PINTEREST.md` §2).

---

## 3. Auditoria Completa

Auditei o repositório inteiro (`src/`, `docs/`, `package.json`) pelos termos pedidos por esta Sprint: `Pinterest Ads`, `PinterestAds`, `Ads`, `Ad`, `Campaign`, `CampaignManager`, `CampaignService`, `CampaignAgent`, `AdGroup`, `Creative`, `CreativeService`, `Audience`, `Targeting`, `Interest`, `Keyword`, `Bid`, `Budget`, `Conversion`, `Conversion API`, `Pixel`, `Tag`, `Tracking`, `UTM`, `Analytics`, `Click`, `Impression`, `CTR`, `CPC`, `CPA`, `ROAS`, `Webhook`, `Catalog`, `Shopping`, `Feed`, `Marketing`, `Growth`, `AgentType`, `EventType`, além de varredura estrutural por Enums, Interfaces, Factories, Stores, Services, Hooks, Pipelines, Modules, Scenes, UI. Toda busca foi caso-insensível, com checagem manual de falsos positivos — vários termos desta Sprint são especialmente propensos a colisão com nomes genéricos do código: `Interest` casa com a substring de `Pinterest`; `CTR` casa com `ctrlKey`; `Pixel` casa com o nome de arquivo de fonte `ark-pixel-12px.woff2`; `Feed` casa com o comentário `// activity feed`.

### Termo por termo — o que foi encontrado

| Termo buscado | Ocorrência real | Onde |
|---|---|---|
| `Pinterest Ads`, `PinterestAds` | Zero ocorrências em `src/` — aparece apenas em prosa de `docs/` (`GROWTH_HUB.md`, `PLATFORM_VISION.md`, `03-DASHBOARD_V2.md`, `05-ECOSYSTEM_MAP.md`, `ANALYTICS.md`, `BLOG.md`, `GOOGLE_ADS.md`, `META_ADS.md`, `PINTEREST.md`) | `docs/*` (nenhum em `src/`) |
| `AgentType.PINTEREST` | 🔷 Vocabulário — já auditado em `docs/requirements/growth/PINTEREST.md` §7; um único valor genérico (`"pinterest"`), sem distinção entre orgânico e pago | `src/core/agents/registry/AgentTypes.ts:4` |
| `PIN_CREATED`, `PIN_PUBLISHED`, `PINTEREST_ANALYZED` | 🔷 Vocabulário — mesmos três eventos já documentados em `PINTEREST.md` §6; nenhum específico de Ads/Campanha/Conversão paga | `src/core/events/EventTypes.ts:24-25,35` |
| `"Pinterest Agent"` (string mockada) | 🔷/UI mockado — mesma string já registrada em `PINTEREST.md` §9; genérica, sem distinção entre módulo orgânico e pago | `src/components/AgentPanel.tsx:12`, `src/components/rightpanel/RightPanel.tsx:11` |
| `Campaign`, `CampaignManager`, `CampaignService`, `CampaignAgent`, `AdGroup`, `Creative`, `CreativeService` | Zero ocorrências em todo `src/` | — |
| `Audience`, `Targeting`, `Interest` (segmentação), `Keyword`, `Bid`, `Budget` | Zero ocorrências reais — únicas colisões são falsos positivos da substring `Interest` dentro de `Pinterest` (nas mesmas linhas já listadas acima) | — |
| `Conversion`, `Conversion API`, `Pixel` (rastreamento), `Tag` (rastreamento), `Tracking`, `UTM` | Zero ocorrências reais — `Pixel` só aparece em `src/styles/globals.css:11` (`ark-pixel-12px.woff2`, nome de fonte pixelizada usada no jogo, sem relação com rastreamento de anúncio) | `src/styles/globals.css` (falso positivo) |
| `Click`, `Impression`, `CTR`, `CPC`, `CPA`, `ROAS` | Zero ocorrências reais — `CTR` só colide com `e.ctrlKey` em `src/game/systems/CameraController.ts:59` (zoom de câmera do Phaser, nada a ver com Click-Through Rate) | `src/game/systems/CameraController.ts` (falso positivo) |
| `Webhook`, `Catalog`, `Shopping` | Zero ocorrências em todo `src/` | — |
| `Feed` (Shopping Feed) | Zero ocorrências reais — única colisão é o comentário `// activity feed` em `src/types/state.ts:62`, referente ao feed de atividade do Dashboard, não a um feed de produto | `src/types/state.ts` (falso positivo) |
| `Marketing`, `Growth` (módulos genéricos) | 🟡 Estrutura real e genérica (`src/modules/marketing/`), sem nenhuma referência a Pinterest Ads dentro dela; nenhum módulo/pasta chamado `growth` existe | `src/modules/marketing/*` |
| Módulo dedicado (`src/modules/pinterest-ads`) | Não existe | — |
| Conector dedicado (`PinterestAdsConnector`) | Não existe — apenas `BaseConnector` genérico | `src/core/connectors/*` |
| Dependência em `package.json` (SDK Pinterest Ads/Marketing API) | Zero | `package.json` |

### 🟢 Código funcional

**Nenhum.** Nenhuma lógica de negócio de Pinterest Ads existe em nenhuma camada — mesma conclusão de Google Ads, AdSense, Search Console, Meta Ads e Pinterest orgânico.

### 🟡 Estruturas

Nenhuma estrutura **dedicada** a Pinterest Ads existe. A única estrutura genérica aplicável é a mesma já registrada para os módulos pagos irmãos e para o Pinterest orgânico:

| Achado | Onde | Natureza real |
|---|---|---|
| `src/modules/marketing/` (`Manager.ts`, `Events.ts`, `Models.ts`, `Types.ts`, `index.ts`) | `src/modules/marketing/` | `MarketingManager implements IModule` (`id: 'marketing'`, `name: 'Marketing'`, `init/start/stop` vazios); `Events.ts`/`Models.ts`/`Types.ts` vazios. Escopo descrito no comentário do arquivo como "Marketing (campanhas e conteúdo)" — genérico, sem nenhuma menção a Pinterest ou Pinterest Ads especificamente. Mesmo scaffold já citado como candidato genérico em `META_ADS.md` §3 e `PINTEREST.md` §3 — não há nenhuma evidência de que ele seria o destino de Pinterest Ads em particular, em vez de qualquer outro módulo de Ads. |

Diferente do Pinterest orgânico (`PINTEREST.md` §3, que também cita `src/modules/analytics/` como estrutura genérica relevante por conta de uma citação em `ANALYTICS.md` §4), o Pinterest Ads **não tem nenhuma menção equivalente dentro de `src/modules/analytics/`** — `Types.ts`/`Models.ts` desse módulo são `export {}` vazio, sem nenhum tipo `PinterestAdsMetrics`, `Campaign` ou similar.

### 🔷 Vocabulário

Nenhum item de vocabulário **específico** de Pinterest Ads existe. Os únicos itens relacionados a Pinterest em geral já foram integralmente documentados em `docs/requirements/growth/PINTEREST.md` e são genéricos o suficiente para não distinguir orgânico de pago:

| Achado | Onde | Natureza real |
|---|---|---|
| `AgentType.PINTEREST = "pinterest"` | `src/core/agents/registry/AgentTypes.ts:4` | Único valor de enum relacionado a Pinterest em toda a base — não há `AgentType.PINTEREST_ADS` nem qualquer distinção entre canal orgânico e pago. Nunca usado fora do próprio arquivo (`registerAgents.ts` só registra `BlogAgent`). |
| `PIN_CREATED`, `PIN_PUBLISHED` (grupo `// Pinterest`) | `src/core/events/EventTypes.ts:24-25` | Eventos de ciclo de vida de Pin — semanticamente mais associáveis à publicação orgânica (`PINTEREST.md` §6) do que a uma Campanha paga; não há um evento equivalente a "Campanha criada" ou "Anúncio publicado". Nunca emitidos/assinados. |
| `PINTEREST_ANALYZED` (grupo `// Traffic`) | `src/core/events/EventTypes.ts:35` | Nome genérico o bastante para cobrir tanto tráfego orgânico quanto pago de Pinterest — mas, assim como os `*_ANALYZED` de Google/Meta, não distingue as duas origens. Nunca emitido/assinado. |
| `"Pinterest Agent"` (string, não enum) | `src/components/AgentPanel.tsx:12`, `src/components/rightpanel/RightPanel.tsx:11` | Mesma string já registrada em `PINTEREST.md` §3/§9 — não há nenhuma variação ("Pinterest Ads Agent" ou similar) em nenhum dos dois componentes. |

**Conclusão de vocabulário:** diferente de Google Ads/Meta Ads (que, apesar de zero estrutura, têm ao menos um evento `*_ANALYZED` unicamente atribuível a si), o Pinterest Ads **não tem nenhum item de vocabulário que o distinga do módulo orgânico Pinterest** — todo o vocabulário reservado relacionado a "Pinterest" no código hoje é ambíguo entre os dois módulos, sem prioridade de um sobre o outro.

### ⚪ Funcionalidades inexistentes

Todo o restante, sem exceção — confirmado termo a termo:

- `Campaign`, `CampaignManager`, `CampaignService`, `CampaignAgent`, `AdGroup`, `Creative`, `CreativeService`, `Audience`, `Targeting`, `Keyword`, `Bid`, `Budget`, `Conversion`, `Conversion API`, `Pixel` (real, de rastreamento), `Tag` (real, de rastreamento), `Tracking`, `UTM`, `Click`/`Impression`/`CTR`/`CPC`/`CPA`/`ROAS` (reais), `Webhook`, `Catalog`, `Shopping`, `Feed` (real, de produto) — **zero ocorrências em todo `src/`**.
- Nenhum módulo `src/modules/pinterest-ads` ou equivalente.
- Nenhuma classe `PinterestAdsAgent`, `CampaignManager` ou `CreativeService`.
- Nenhum conector concreto para Pinterest Ads (`src/core/connectors/*` são stubs genéricos, compartilhados com qualquer integração futura).
- Nenhuma dependência de SDK Pinterest Ads/Marketing API em `package.json`.
- Nenhum componente de UI cita "Pinterest Ads" — apenas "Pinterest Agent" genérico, já registrado em `PINTEREST.md`.
- Nenhum capítulo dedicado a Pinterest Ads em `docs/05-ECOSYSTEM_MAP.md` — diferente de Google Ads (Capítulo 5), Meta Ads (Capítulo 6) e Pinterest orgânico (Capítulo 7), que têm cada um seu próprio diagrama de fluxo, Pinterest Ads é citado apenas de passagem dentro da tabela de integrações do Capítulo 12 ("Pinterest → Growth Hub — Pinterest, Pinterest Ads").

### Resumo

| Categoria | Existe para Pinterest Ads? |
|---|---|
| Arquivos dedicados | Nenhum |
| Pastas dedicadas | Nenhuma |
| Eventos dedicados (distintos do Pinterest orgânico) | Nenhum — os 3 existentes (`PIN_CREATED`, `PIN_PUBLISHED`, `PINTEREST_ANALYZED`) são compartilhados/ambíguos com o módulo orgânico |
| Enums dedicados | Nenhum — `AgentType.PINTEREST` é único e compartilhado |
| Estruturas genéricas aplicáveis | 1 (`src/modules/marketing/`) |
| Mocks de UI | "Pinterest Agent" citado em 2 componentes, mas genérico (compartilhado com o módulo orgânico) |
| Componentes funcionais | Nenhum |
| Fluxo documentado dedicado (`docs/05-ECOSYSTEM_MAP.md`) | Nenhum capítulo próprio — apenas menção em tabela |
| Dependências de pacote | Nenhuma |

### Conclusão objetiva da auditoria

O Pinterest Ads é, entre os sete módulos de Growth Hub já auditados nesta série (Blog, SEO, Analytics, Search Console, AdSense, Google Ads, Meta Ads, Pinterest), o que tem **o precedente de vocabulário mais fraco de todos os módulos pagos**: diferente de Google Ads e Meta Ads (que ao menos têm um evento `*_ANALYZED` unicamente seu, ainda que nunca emitido), e diferente do Pinterest orgânico (que tem três eventos dedicados e duas menções de UI), o Pinterest Ads **não tem nenhum item de vocabulário que não seja também, e igualmente, atribuível ao módulo orgânico**. Não há absolutamente nada no código — nem estrutural, nem de nome reservado — que diferencie "Pinterest" de "Pinterest Ads". Toda a especificação abaixo parte de folha em branco, com o agravante de que, ao contrário dos demais módulos pagos (Google Ads/Meta Ads, com Capítulo próprio no Ecosystem Map), este módulo nem sequer tem um fluxo arquitetural dedicado já esboçado em documentação anterior.

---

## 4. Estruturas Encontradas

| Estrutura | Estado | Observação |
|---|---|---|
| `src/modules/pinterest-ads/` (ou equivalente dedicado) | ⚪ Inexistente | Confirmado por varredura completa de `src/modules/*` (12 módulos existentes: `crm`, `business`, `agenda`, `marketing`, `communication`, `analytics`, `fiscal`, `hr`, `projects`, `documents`, `academy`, `marketplace`; nenhum chamado `pinterest-ads` ou `pinterest`). |
| `src/modules/marketing/` | 🟡 Estrutura genérica | Ver Capítulo 3. Único scaffold aplicável, sem nenhum vocabulário de Pinterest Ads. |
| `src/modules/analytics/` | 🟡 Estrutura genérica, sem menção | Diferente do que ocorre para Pinterest orgânico (`PINTEREST.md` §3, que ao menos é citado em prosa por `ANALYTICS.md`), não há nenhuma citação equivalente para Pinterest Ads dentro de `ANALYTICS.md` além da linha genérica "Campanhas: desempenho consolidado de Google Ads, Meta Ads e Pinterest Ads lado a lado" (§3) — e mesmo essa citação não corresponde a nenhum tipo real dentro de `src/modules/analytics/Types.ts`/`Models.ts` (ambos `export {}`). |
| `src/core/connectors/` (`BaseConnector`, `ConnectorManager`, `ConnectorRegistry`, `ConnectorTypes`, `ConnectorEvents`) | 🟡 Estrutura genérica de infraestrutura | Nenhum `PinterestAdsConnector` concreto; mesmo `BaseConnector` abstrato e stubs neutros já documentados para os demais módulos. |
| `src/core/agents/registry/` (`AgentType`, `AgentRegistry`, `Agent`, `AgentStatus`) | 🟡 Estrutura genérica real | `AgentType.PINTEREST` vive aqui, compartilhado com o módulo orgânico — nenhum valor `PINTEREST_ADS` separado. |
| `src/shared/interfaces/IModule.ts`, `IConnector.ts` | 🟢 Contrato real, usado por toda a plataforma | Interfaces genéricas que um eventual módulo/conector Pinterest Ads precisaria implementar — não são específicas deste módulo. |

Nenhuma estrutura de dado (`Campaign`, `AdGroup`, `Creative`, `Catalog`) existe em nenhum `Models.ts` auditado — todos são `export {}` vazio.

---

## 5. Componentes Encontrados

Nenhum componente funcional de Pinterest Ads existe, e — diferente do Pinterest orgânico — **nem sequer uma menção de UI distinta** existe ("Pinterest Agent" nos dois componentes mockados não faz nenhuma distinção entre orgânico e pago; ver Capítulo 3/9). Os componentes que o módulo **teria**, todos ⚪ Planejado:

| Componente | Função |
|---|---|
| **Visão Geral** | Painel-resumo consolidado do módulo. |
| **Campanhas** | Unidade principal — objetivo (Reconhecimento, Consideração, Conversão, Catálogo), orçamento e status. |
| **Grupos de anúncios** | Subdivisão por Público/Palavra-chave/Orçamento dentro de uma Campanha. |
| **Criativos** | Pins Patrocinados, Collections, Carrossel — reaproveitados ou adaptados do módulo orgânico Pinterest (`PINTEREST.md` §5). |
| **Catálogo / Shopping** | Anúncios de produto sincronizados a um feed de Catálogo — recurso característico deste canal para e-commerce. |
| **Públicos** | Interesses nativos do Pinterest, Palavras-chave, Públicos personalizados/semelhantes. |
| **Tag / Conversão** | Rastreamento de Conversão fora da rede Pinterest (no site/Landing Page/Catálogo da Empresa). |
| **Lances e Orçamento** | Estratégia de quanto pagar por clique/conversão — manual ou automatizada. |
| **Relatórios** | Consolidação periódica do dado deste módulo. |
| **Alertas** | Ver Capítulo 9. |
| **Oportunidades** | Recomendação de qual Pin orgânico de bom desempenho merece amplificação paga — ponte direta com `PINTEREST.md` §5 ("Pins"). |
| **Configurações** | Conta Pinterest Business conectada, Tag configurada, limites de Orçamento, regras de Aprovação. |

---

## 6. Eventos Encontrados

Já detalhado no Capítulo 3, consolidado aqui:

- Nenhum evento **específico** de Pinterest Ads existe. Os três eventos relacionados a Pinterest em geral (`PIN_CREATED`, `PIN_PUBLISHED`, `PINTEREST_ANALYZED`, `src/core/events/EventTypes.ts:24-25,35`) já foram integralmente documentados em `docs/requirements/growth/PINTEREST.md` §6, e nenhum deles é semanticamente exclusivo de Campanha paga — não existe `PINTEREST_AD_CAMPAIGN_CREATED`, `PINTEREST_CONVERSION_TRACKED` ou equivalente.
- Nenhum dos três eventos é emitido/assinado em nenhum lugar do código — mesma conclusão já registrada para o módulo orgânico.
- Toda comunicação de evento, quando implementada, passaria pelo `EventBus` único já existente (`src/core/events/EventBus.ts`) — mesma regra arquitetural já fixada em `docs/02-SYSTEM_ARCHITECTURE.md` §10.
- `src/modules/marketing/Events.ts` declara `MarketingEventTypes` como objeto **vazio** — nenhum evento de Ads, de qualquer canal, está ali.

---

## 7. Enums Encontrados

Já detalhado no Capítulo 3, consolidado aqui:

- **`AgentType.PINTEREST = "pinterest"`** (`src/core/agents/registry/AgentTypes.ts:4`) — único valor de enum relacionado a Pinterest em toda a base de código, compartilhado entre orgânico e pago sem distinção. Não existe `AgentType.PINTEREST_ADS`.
- Nenhum enum de domínio específico existe: sem `CampaignObjective`, `AdFormat`, `BidStrategy`, `CatalogSyncStatus` ou equivalente — todos ⚪ Planejado.
- Nenhum enum `ConnectorType` com valor `PINTEREST_ADS` ou `PINTEREST` existe — `src/core/connectors/ConnectorTypes.ts` é `export {}` vazio, mesmo padrão já confirmado para os módulos pagos irmãos.

---

## 8. Integrações

Todas ⚪ Planejado — nenhuma implementada hoje, confirmado por auditoria de `src/core/connectors/*` (Capítulo 4: todos os arquivos são stubs/contratos vazios, sem nenhum conector concreto).

| Integração | Papel no módulo Pinterest Ads |
|---|---|
| **Pinterest** | A própria fonte de dado e canal de execução — a integração central deste módulo. `docs/05-ECOSYSTEM_MAP.md` §12 já cita "Pinterest → Growth Hub — Pinterest, Pinterest Ads" na mesma linha de integração, sem diferenciar conector orgânico de pago; hoje com **zero implementação de conector** para qualquer um dos dois. |
| **Pinterest (módulo orgânico)** | Fonte de Pins/Boards já publicados, candidatos a amplificação paga (`docs/requirements/growth/PINTEREST.md` §5) — dependência de conteúdo mais direta deste módulo, análoga à relação Blog → Pinterest orgânico. |
| **CRM** | Recebe todo Lead/Conversão gerado como registro — fronteira direta com o Business Hub. |
| **Financeiro** | Recebe o investimento (custo de mídia) e a Receita atribuída, para cálculo de ROI/ROAS. |
| **Analytics** | Consumiria Campanhas/Conversões deste módulo como uma das Fontes de Dados já citadas em `docs/requirements/growth/ANALYTICS.md` §3, sem nenhum tipo correspondente hoje em `src/modules/analytics/` (Capítulo 4). |
| **Google Ads / Meta Ads** | Não é dependência funcional direta, mas compartilha o mesmo princípio de Aprovação de gasto (`docs/requirements/growth/GOOGLE_ADS.md` §13, `META_ADS.md` §19) e é comparado lado a lado em Analytics (`ANALYTICS.md` §3). |
| **Claude / OpenAI / Gemini** | Provedores de IA que sustentariam Criativos e Otimização de Lances — mesma ressalva já registrada em `docs/requirements/growth/META_ADS.md` §13 e `PINTEREST.md` §8: a citação repetida de que `src/providers/gemini/` "já reserva a pasta" não corresponde ao estado real do código, que só tem `src/providers/mock/MockAIProvider.ts`. |

---

## 9. UI

Auditoria de todos os componentes visuais hoje renderizados na aplicação — nenhum distingue Pinterest Ads do módulo orgânico:

| Componente | Arquivo | O que existe hoje |
|---|---|---|
| **Sidebar** | `src/components/sidebar/Sidebar.tsx` | Array estático de 9 rótulos (`Dashboard`, `Squads`, `Agentes`, `Tarefas`, `Automações`, `Analytics`, `Integrações`, `Eventos`, `Configurações`) — nenhum item "Pinterest" ou "Pinterest Ads"; botões sem `onClick`. |
| **AgentPanel** | `src/components/AgentPanel.tsx` | Lista mockada de 4 agentes: `Blog Agent`, `SEO Agent`, **`Pinterest Agent` (status: "Idle")**, `WordPress Agent` — mesma string já registrada em `PINTEREST.md` §9; nenhuma variação "Pinterest Ads Agent" ou equivalente. |
| **RightPanel** | `src/components/rightpanel/RightPanel.tsx` | Lista mockada de 3 agentes: `Blog Agent`, `SEO Agent`, **`Pinterest Agent` (status: "🔵 Pronto")** — mesma situação. |
| **KpiCards** | `src/components/cards/KpiCards.tsx` | 6 cards; só "Agentes" é real (`agentStore.totalAgents()`); os demais são strings hardcoded — nenhum card de Campanha/CPC/ROAS de Pinterest Ads. |
| **BottomPanel** | `src/components/bottom/BottomPanel.tsx` | Sem nenhuma ocorrência de termo relacionado a Pinterest Ads na varredura textual do Capítulo 3. |

Nenhuma Janela, Widget ou tela dedicada a Pinterest Ads (ou a Pinterest de forma geral) existe em `src/components/dashboard/` — pasta já registrada como **inteiramente vazia** em `docs/requirements/growth/ANALYTICS.md` ("Nota metodológica").

**Observação de UI:** diferente do módulo orgânico Pinterest, que ao menos tem uma string de UI própria e específica ("Pinterest Agent"), o Pinterest Ads **não tem absolutamente nenhuma menção distinta em nenhum componente** — a única string existente já é integralmente compartilhada e ambígua entre os dois módulos.

---

## 10. Runtime

O runtime da plataforma (`src/core/platform/`) é genérico e não conhece nenhum módulo de negócio por nome — nem Pinterest Ads, nem qualquer um dos 18 módulos do Growth Hub, mesma conclusão já registrada em `docs/requirements/growth/META_ADS.md` §10 e `PINTEREST.md` §10:

- **`PlatformRuntime.ts`** — mantém `bootManager`, `lifecycleManager`, `moduleLoader`, `connectorLoader`, `automationLoader` e `RuntimeState`; `init()` executa o `BootPipeline` (Capítulo 11) e transiciona estado, mas **nenhum módulo/conector concreto é carregado**.
- **`ModuleLoader.ts`** — `load()` retorna lista vazia; comentário do próprio arquivo confirma "nenhum import dinâmico de módulos concretos".
- **`ConnectorManager.ts`** — `ILifecycle` com `init/start/stop` vazios, nenhum conector concreto orquestrado.
- Conclusão: o Pinterest Ads não tem nenhum ponto de entrada no runtime real — consistente com o estado ⚪ Planejado de todo o Growth Hub.

---

## 11. Pipeline

A infraestrutura de pipeline (`src/core/pipeline/Pipeline.ts`) é genérica e reutilizável — hoje com uma única especialização real, `BootPipeline`, sem relação com Pinterest Ads:

- `Pipeline.execute()` já roda de verdade (registra `PipelineStep`s, cria `PipelineContext`, executa em ordem, produz `PipelineResult`) — mecanismo genérico, sem qualquer noção de "Campanha", "Lance" ou "Conversão".
- `BootPipeline` registra apenas três etapas estruturais (`InitializeRuntimeStep`, `ValidateRuntimeStep`, `FinalizeRuntimeStep`), com `execute/rollback` vazios.
- Não existe, e não é citado em nenhum lugar, um pipeline de Campanha (`CampaignPipeline`, `AdPublishPipeline` ou equivalente) que orquestraria etapas como "selecionar Pin de bom desempenho → definir Orçamento → publicar Campanha → confirmar via Tag de Conversão".
- Conclusão: **zero precedente de pipeline específico de Pinterest Ads** — apenas a infraestrutura genérica, já usada para Boot, disponível para reuso futuro.

---

## 12. Fluxo Arquitetural

Diferente de Google Ads (Capítulo 5), Meta Ads (Capítulo 6) e Pinterest orgânico (Capítulo 7), **nenhum fluxo arquitetural específico de Pinterest Ads existe em `docs/05-ECOSYSTEM_MAP.md`** — o documento cita o módulo apenas de passagem na tabela de integrações do Capítulo 12 ("Pinterest → Growth Hub — Pinterest, Pinterest Ads"), sem diagrama próprio. Este é, por si, um achado da auditoria: dos três módulos de mídia paga do Growth Hub, Pinterest Ads é o único sem fluxo de referência já esboçado em documentação anterior.

Por analogia estrutural com os dois fluxos pagos já documentados (`docs/requirements/growth/GOOGLE_ADS.md` §12: `Campanha → Landing Page → Conversão → CRM → Financeiro → Analytics → Dashboard`; `META_ADS.md` §12: `Campanha → Lead → CRM → WhatsApp → Venda → Financeiro → Analytics`) e com o fluxo orgânico de Pinterest já registrado (`PINTEREST.md` §12: `Pin → Blog → Landing Page → Conversão → CRM → Analytics`), o fluxo mais provável para Pinterest Ads — **não documentado em nenhum lugar, portanto integralmente hipotético e explicitamente marcado como tal** — seria:

```
Pin (orgânico) → Campanha (amplificação paga) → Landing Page/Catálogo → Conversão → CRM → Financeiro → Analytics
```

Esta sequência **não tem nenhum precedente em `docs/` nem em `src/`** — é uma inferência por analogia com os módulos irmãos, apresentada aqui apenas para preencher a lacuna identificada, e deve ser tratada como ⚪ Planejado no grau mais alto (nem sequer desenhado antes desta Sprint).

Dentro do fluxo geral do Growth Hub (`docs/requirements/growth/GROWTH_HUB.md` §5), o Pinterest Ads participaria principalmente de **Planejamento** (definição de objetivo de Campanha) e **Otimização** — mesma participação já atribuída aos demais módulos de Ads.

---

## 13. Precedentes Reais da Implementação

Consolidação dos Capítulos 3–7: **não existe nenhum precedente real de implementação específico de Pinterest Ads.** Diferente de todos os seis módulos já auditados nesta série — que, apesar de zero código funcional, tinham ao menos algum vocabulário exclusivo (`GOOGLE_ANALYZED`, `META_ANALYZED` + `AgentType.FACEBOOK`/`INSTAGRAM`, `PIN_CREATED`/`PIN_PUBLISHED`/`PINTEREST_ANALYZED` + string de UI) — o Pinterest Ads não tem nenhum item que já não pertença, de forma ambígua e compartilhada, ao módulo orgânico Pinterest:

1. `AgentType.PINTEREST` — compartilhado com o orgânico, sem distinção.
2. `PIN_CREATED`/`PIN_PUBLISHED`/`PINTEREST_ANALYZED` — compartilhados, sem distinção.
3. `"Pinterest Agent"` — compartilhado, sem distinção.
4. `src/modules/marketing/` — genérico, aplicável a qualquer módulo de Ads.

**Achado adicional (inconsistência a registrar, não corrigir):** `docs/requirements/growth/GROWTH_HUB.md` §3 e §4 tratam Pinterest e Pinterest Ads como **dois módulos distintos** na lista de 18 ("Pinterest" e "Pinterest Ads" são linhas separadas na tabela §3, com responsabilidades diferentes descritas em §4: "presença orgânica" vs. "aquisição paga"). A auditoria de código desta Sprint confirma que essa distinção **não existe em nenhuma camada de `src/`** — não há dois `AgentType`, dois grupos de evento, ou duas pastas de módulo. O código de hoje trata (ou melhor, ainda não trata, mas o vocabulário que existe não distingue) Pinterest como um único conceito indiferenciado. Isso não é uma contradição grave — a documentação anterior descreve intenção de design, não implementação —, mas reforça que qualquer decisão de nomenclatura futura (dois `AgentType` separados, ou um único com um campo de "modalidade") ainda está inteiramente em aberto.

---

## 14. Comparação com Analytics, Google Ads, Meta Ads e Pinterest

| Módulo | Código funcional (🟢) | Estrutura (🟡) | Vocabulário (🔷) | Observação |
|---|---|---|---|---|
| **Analytics** | Nenhum | `src/modules/analytics/` completo (`IModule`), mais `AgentStore`/`KpiCards` parcialmente reais | `AgentType.ANALYTICS`; `KPI_UPDATED`, `DASHBOARD_REFRESH`, `*_ANALYZED` | Único módulo com um pedaço de UI genuinamente funcional. |
| **Google Ads** | Nenhum | Nenhuma | Apenas `GOOGLE_ANALYZED` (ambíguo, compartilhado com Search Console/AdSense) | Nenhum `AgentType` dedicado. |
| **Meta Ads** | Nenhum | `src/modules/marketing/` — genérico, compartilhado | `META_ANALYZED` (inequívoco) + `AgentType.FACEBOOK`/`AgentType.INSTAGRAM` (dois valores dedicados) | Vocabulário de enum mais forte entre os módulos pagos. |
| **Pinterest** (orgânico) | Nenhum | `src/modules/marketing/`, `src/modules/analytics/` — genéricos | `AgentType.PINTEREST` + `PIN_CREATED`/`PIN_PUBLISHED`/`PINTEREST_ANALYZED` (3 eventos) + `"Pinterest Agent"` em 2 componentes de UI | Maior número de eventos dedicados entre os sete módulos; única presença literal em UI real. |
| **Pinterest Ads** (este documento) | Nenhum | `src/modules/marketing/` — genérico, compartilhado | **Nenhum item exclusivo** — todo vocabulário existente (`AgentType.PINTEREST`, os 3 eventos, a string de UI) é compartilhado e ambíguo com o módulo orgânico | **O único módulo pago sem nenhum vocabulário próprio** e o único sem fluxo dedicado em `docs/05-ECOSYSTEM_MAP.md`. |

**Leitura da comparação:** dos três módulos de mídia paga do Growth Hub (Google Ads, Meta Ads, Pinterest Ads), o Pinterest Ads é o que parte da posição mais fraca — não porque tenha menos código (todos têm zero), mas porque **não tem nenhum vocabulário sequer reservado para si**. Google Ads tem um evento ambíguo mas próprio o bastante para ser citado em quatro documentos anteriores como "seu"; Meta Ads tem dois enums dedicados; até o Pinterest orgânico, module irmão mais próximo, tem três eventos e presença em UI. Pinterest Ads não tem nada disso — todo nome que poderia ser seu já está integralmente ocupado, de forma indistinta, pelo módulo orgânico.

---

## 15. Matriz de Estado

| Item | Estado | Evidência |
|---|---|---|
| Módulo dedicado (`src/modules/pinterest-ads`) | ⚪ | Não existe — Capítulo 4 |
| Scaffold genérico aplicável (`marketing`) | 🟡 | Capítulo 3/4 |
| Evento dedicado (distinto do orgânico) | ⚪ | Nenhum — Capítulo 6 |
| Enum dedicado (distinto do orgânico) | ⚪ | Nenhum — Capítulo 7 |
| Vocabulário compartilhado com Pinterest orgânico (`AgentType.PINTEREST`, `PIN_*`, `PINTEREST_ANALYZED`) | 🔷 (mas não exclusivo) | Capítulo 3 |
| String de UI compartilhada ("Pinterest Agent") | 🔷 (mas não exclusiva) | `AgentPanel.tsx:12`, `RightPanel.tsx:11` |
| Classe `CampaignManager`/`CreativeService`/`PinterestAdsAgent` | ⚪ | Nenhuma ocorrência — Capítulo 3 |
| Conector Pinterest Ads (`PinterestAdsConnector`) | ⚪ | `src/core/connectors/*` são stubs genéricos — Capítulo 4/8 |
| Componente de UI funcional (com dado real) | ⚪ | Capítulo 9 |
| Runtime/Pipeline específico | ⚪ | Capítulos 10/11 |
| Fluxo arquitetural dedicado em documentação | ⚪ | Não existe em `docs/05-ECOSYSTEM_MAP.md` — único entre os três módulos pagos — Capítulo 12 |
| Dependência de pacote (SDK Pinterest Ads) | ⚪ | `package.json` — Capítulo 3 |
| Código funcional (🟢) de qualquer natureza | 🟢 **Nenhum** | Capítulos 3–11 |

---

## 16. Conclusão

O módulo Pinterest Ads, hoje, não tem **nenhum precedente de implementação que lhe seja exclusivo** — nem código funcional, nem estrutura própria, nem vocabulário reservado que já não pertença, de forma indistinta, ao módulo orgânico Pinterest (`docs/requirements/growth/PINTEREST.md`). É o único dos oito módulos de Growth Hub já auditados nesta série (Blog, SEO, Analytics, Search Console, AdSense, Google Ads, Meta Ads, Pinterest) sem absolutamente nenhum item que sobreviva a uma comparação direta com um módulo irmão — mesmo o `AgentType.PINTEREST`, os três eventos e a string de UI "Pinterest Agent" já pertencem, sem distinção, ao Pinterest orgânico. É também o único módulo pago sem fluxo arquitetural próprio já esboçado em `docs/05-ECOSYSTEM_MAP.md`, diferente de Google Ads e Meta Ads. A documentação anterior (`GROWTH_HUB.md`) já tratava Pinterest e Pinterest Ads como módulos distintos de negócio, mas essa distinção existe apenas em prosa — nenhuma camada de código a reflete hoje. Toda a especificação funcional deste documento — Campanhas, Grupos de anúncios, Catálogo/Shopping, Tag de Conversão — parte de folha em branco, na mesma situação de Google Ads, AdSense, Search Console e Meta Ads, com o agravante adicional de vocabulário zero.

## 17. Próximos Passos

| Fase | Foco |
|---|---|
| **Fase 1 — Diferenciação de vocabulário** | Antes de qualquer scaffold, decidir se Pinterest Ads terá `AgentType`/eventos próprios (`AgentType.PINTEREST_ADS`, `PINTEREST_AD_CAMPAIGN_CREATED` etc.) ou se reaproveitará os já existentes do módulo orgânico com um campo de modalidade — hoje essa decisão está inteiramente em aberto (Capítulo 13). |
| **Fase 2 — Criação do módulo** | Scaffold dedicado sobre `IModule` (`src/modules/pinterest-ads/` ou absorvido por `marketing`, Capítulo 3) — sem lógica de negócio. |
| **Fase 3 — Conector Pinterest Ads** | Primeira implementação concreta de `BaseConnector` para a Ads API do Pinterest (autenticação, criação de Campanha) — hoje inexistente (Capítulo 4/8). |
| **Fase 4 — Fluxo arquitetural** | Documentar formalmente em `docs/05-ECOSYSTEM_MAP.md` o fluxo `Pin → Campanha → Landing Page/Catálogo → Conversão → CRM → Financeiro → Analytics` esboçado por analogia no Capítulo 12 deste documento — lacuna hoje existente frente a Google Ads/Meta Ads. |
| **Fase 5 — Painéis** | Visão Geral e Campanhas sobre a primeira conexão real com a API. |
| **Fase 6 — Catálogo/Shopping** | Sincronização de feed de produto — recurso característico deste canal para e-commerce. |
| **Fase 7 — Integração com Analytics** | Campanhas/ROAS alimentando de fato as Fontes de Dados do Analytics (`docs/requirements/growth/ANALYTICS.md` §3), corrigindo a lacuna de tipo já registrada no Capítulo 4 deste documento. |
| **Fase 8 — IA** | Media Buyer (papel já descrito em `docs/requirements/growth/GOOGLE_ADS.md` §6 e `META_ADS.md` §16) assumindo Otimização de forma cada vez mais autônoma, sempre com Aprovação humana antes de ampliar gasto. |

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
