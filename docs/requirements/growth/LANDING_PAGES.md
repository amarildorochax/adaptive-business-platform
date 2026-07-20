# LANDING PAGES — Especificação Funcional do Módulo

**Andreia AI Platform** · Growth Hub
Documentação funcional do módulo Landing Pages — o décimo segundo módulo do Growth Hub a ser especificado em detalhe, seguindo o padrão de 17 itens obrigatórios já usado em `docs/requirements/growth/META_ADS.md` (Sprint 12.0) até `EMAIL_MARKETING.md` (Sprint 16.0).

Este documento é uma **especificação funcional**, não uma implementação. Relaciona-se com `docs/requirements/growth/GROWTH_HUB.md` (Landing Pages é um dos 18 módulos ali listados, descrito em §4 como "páginas de conversão dedicadas, o destino de campanhas pagas e orgânicas") e com `docs/05-ECOSYSTEM_MAP.md`, que já cita "Landing Page" como etapa dentro dos fluxos de Google Ads (Capítulo 5) e Pinterest (Capítulo 7). Esta Sprint é **exclusivamente de documentação** — nenhum arquivo `.ts`, `.tsx`, `.json` ou `.css` foi alterado para produzi-la; apenas ferramentas de leitura (Read, Grep, Glob) foram usadas. Por instrução explícita desta Sprint, toda conclusão abaixo se apoia **exclusivamente** na auditoria do código atual — documentação anterior é citada apenas como referência cruzada, nunca como fonte de verdade sobre o que existe implementado.

**Legenda usada em todo o documento (quatro níveis):**
- 🟢 **Implementado** — lógica real, funcional, executável hoje.
- 🟡 **Estrutura** — existe código real (uma classe, um scaffold), mas sem lógica de negócio completa por trás.
- 🔷 **Vocabulário** — existe apenas um nome, string ou valor de enum declarado — sem nenhuma estrutura ao redor.
- ⚪ **Planejado** — não existe nenhum vestígio no código; é direção de design.

---

## Missão do módulo

O Landing Pages **não é** tratado como um hospedador de páginas. É o **Centro Inteligente de Conversão**, cujo objetivo é transformar o tráfego que qualquer outro módulo do Growth Hub já trouxe em Lead ou Venda mensurável.

---

## 1. Objetivo

**O que é:** o módulo Landing Pages é a camada da plataforma responsável por criar, publicar e otimizar páginas de conversão dedicadas — o destino final de Campanhas pagas (Google Ads, Meta Ads, Pinterest Ads) e de tráfego orgânico (Blog, Pinterest, Social Media) quando o objetivo é uma ação específica (capturar Lead, vender, baixar material), não a navegação livre de um site institucional.

**Objetivos funcionais:**
- Servir como destino de conversão dedicado para Campanhas pagas, mesmo papel já citado em `docs/requirements/growth/GOOGLE_ADS.md` §1/§12 (fluxo `Campanha → Landing Page → Conversão → CRM → Financeiro → Analytics → Dashboard`) e `docs/requirements/growth/PINTEREST.md` §12 (fluxo `Pin → Blog → Landing Page → Conversão → CRM → Analytics`).
- Capturar Lead via Formulário (Form), com ou sem incentivo (Lead Magnet/isca digital) — já citado em `docs/requirements/growth/BLOG.md` §9 ("um artigo pode capturar um Lead diretamente... sem passar por uma Landing Page separada", implicando que a Landing Page é o caminho padrão quando existe).
- Oferecer Chamada para ação (CTA) clara e mensurável, com Taxa de conversão rastreável.
- Testar variações de página (A/B Test) para melhorar Taxa de conversão ao longo do tempo.

**Benefícios:**
- Página com um único objetivo (Conversão), sem a distração de navegação de um site completo — Taxa de conversão tipicamente maior que uma home institucional.
- Ponto de medição único e comum entre canais pagos e orgânicos diferentes (Google Ads, Meta Ads, Pinterest), simplificando comparação de retorno entre eles.
- Reaproveitamento de Criativo/Conteúdo já produzido por outros módulos (Blog, Designer Agent), adaptado ao formato de página de conversão.

**Problemas que resolve:**
- Campanha paga direcionando tráfego para uma página genérica, sem CTA claro, desperdiçando investimento em cliques que não convertem.
- Falta de rastreamento de qual página/variação de Landing Page efetivamente gera Lead, versus qual apenas recebe visita.
- Ausência de Thank You Page/confirmação após conversão, perdendo a oportunidade de reforçar a ação (ex.: entrega imediata do Lead Magnet, próximo passo claro).

## 2. Escopo

Gestão de Páginas de conversão (criação via Page Builder, Templates), Formulários de captura (Form/FormSubmit), Chamadas para ação (CTA), Testes A/B (Split Test), Página de agradecimento (Thank You Page), entrega de Lead Magnet, e monitoramento de Taxa de conversão por página/variação.

**Limites:**
- O Landing Pages não gera o tráfego — recebe o que Ads/Blog/Pinterest/Social Media já direcionaram; não é, em si, um canal de aquisição.
- O Landing Pages não é o CRM — o Lead capturado pelo Formulário é processado pelo módulo CRM (Business Hub), não armazenado dentro deste módulo.
- O Landing Pages não decide o Criativo/Conteúdo original — reaproveita ativos já produzidos (Blog, Designer Agent), adaptando-os ao formato de página de conversão, mesmo limite já registrado para os módulos de Ads (`docs/requirements/growth/GOOGLE_ADS.md` §1, `META_ADS.md` §2).

---

## 3. Auditoria Completa

Auditei o repositório inteiro (`src/`, `docs/`, `package.json`) pelos termos pedidos por esta Sprint: `Landing`, `Landing Page`, `LandingPages`, `Page Builder`, `Builder`, `Page`, `PageTemplate`, `Template`, `Lead Capture`, `Capture`, `Form`, `FormBuilder`, `CTA`, `Call To Action`, `Conversion`, `Conversion Rate`, `Funnel`, `Sales Funnel`, `Opt-in`, `Signup`, `Subscribe`, `Lead Magnet`, `Download`, `Thank You Page`, `A/B Test`, `Split Test`, `Analytics`, `Tracking`, `Pixel`, `UTM`, `Webhook`, `CRM`, `Lead`, `Contact`, `FormSubmit`, `AgentType`, `EventType`, além de varredura estrutural por Enums, Interfaces, Factories, Stores, Services, Hooks, Pipelines, Modules, Scenes, UI. Toda busca foi caso-insensível, com checagem manual de falsos positivos — vários termos desta Sprint colidem com padrões genéricos de arquitetura já auditados em Sprints anteriores: `Subscribe` colide com o método `subscribe()` do `EventBus`/`AgentStore` (padrão pub/sub genérico, `EMAIL_MARKETING.md` §3 já havia registrado a mesma colisão); `Page` colide com nomes de componente React genéricos (`DashboardPage.tsx`) já descartados como falso positivo em `PINTEREST.md` §3.

### Termo por termo — o que foi encontrado

| Termo buscado | Ocorrência real | Onde |
|---|---|---|
| `Landing`, `Landing Page`, `LandingPages` | Zero ocorrências em `src/` — aparece apenas em prosa de `docs/` | `docs/*` (nenhum em `src/`) |
| `Page Builder`, `Builder`, `PageTemplate` | Zero ocorrências | — |
| `Page` (isolado) | Falsos positivos apenas — `DashboardPage.tsx` (componente de rota, já descartado em `docs/requirements/growth/PINTEREST.md` §3 pela mesma razão: "Dashboard" contém a substring "board"/"Page" não se aplica aqui da mesma forma, mas o nome do componente não indica nenhuma Landing Page) | `src/pages/DashboardPage.tsx` |
| `Lead Capture`, `Capture`, `Form`, `FormBuilder`, `FormSubmit` | Zero ocorrências em todo `src/` | — |
| `CTA`, `Call To Action` | Zero ocorrências | — |
| `Conversion`, `Conversion Rate` | Zero ocorrências em todo `src/` — nem mesmo como comentário isolado | — |
| `Funnel`, `Sales Funnel` | Zero ocorrências | — |
| `Opt-in`, `Signup` | Zero ocorrências | — |
| `Subscribe` | Falso positivo apenas — método `subscribe(listener)` do `EventBus` (`src/core/events/EventBus.ts:8`) e do `AgentStore` (`src/core/store/AgentStore.ts:22`), padrão pub/sub genérico da plataforma, sem relação com inscrição de e-mail/newsletter em Landing Page | `src/core/events/EventBus.ts`, `src/core/store/AgentStore.ts` |
| `Lead Magnet`, `Download`, `Thank You Page` | Zero ocorrências | — |
| `A/B Test`, `Split Test` | Zero ocorrências | — |
| `Tracking`, `Pixel`, `UTM`, `Webhook` | Zero ocorrências reais — mesma conclusão já registrada em `docs/requirements/growth/META_ADS.md` §3, `PINTEREST.md` §3, `PINTEREST_ADS.md` §3 e `GOOGLE_BUSINESS_PROFILE.md` §3 | — |
| `Analytics` (módulo) | 🟡 Estrutura real e genérica (`src/modules/analytics/`), sem nenhuma referência a Landing Pages dentro dela | `src/modules/analytics/*` |
| `CRM` | 🟡 Estrutura real e genérica (`src/modules/crm/`); eventos `LEAD_RECEIVED`/`CUSTOMER_CREATED`/`SALE_COMPLETED` já existem (grupo `// CRM`), mas pertencem ao domínio do CRM, não deste módulo — mesma ressalva já aplicada a `LEAD_RECEIVED` em `docs/requirements/growth/EMAIL_MARKETING.md` §3/§6 | `src/modules/crm/*`, `src/core/events/EventTypes.ts:27-30` |
| `Lead` (isolado) | 🔷 Vocabulário indireto — mesmo evento `LEAD_RECEIVED` acima, do domínio do CRM | `src/core/events/EventTypes.ts:28` |
| `Contact` | Zero ocorrências | — |
| `AgentType` (catálogo geral) | Nenhum valor relacionado a Landing Pages existe — 10 valores no total (`BLOG`, `SEO`, `PINTEREST`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`, `CRM`, `DESIGN`, `ANALYTICS`, `AUTOMATION`), nenhum `LANDING` ou equivalente | `src/core/agents/registry/AgentTypes.ts` |
| `EventType` (catálogo geral) | Nenhum evento relacionado a Landing Pages existe, nem mesmo em nome de grupo de comentário | `src/core/events/EventTypes.ts` |
| Dependência em `package.json` (biblioteca de Page Builder: GrapesJS, Unlayer, Craft.js, Builder.io) | Zero | `package.json` |

### 🟢 Código funcional

**Nenhum.** Nenhuma lógica de negócio de Landing Pages existe em nenhuma camada.

### 🟡 Estruturas

Nenhuma estrutura **dedicada** existe. Duas estruturas genéricas são aplicáveis, na mesma situação já registrada para os demais módulos de Ads/conversão:

| Achado | Onde | Natureza real |
|---|---|---|
| `src/modules/marketing/` | `src/modules/marketing/` | `MarketingManager implements IModule`, escopo descrito no comentário como "campanhas e conteúdo" — já citado como candidato genérico para Meta Ads (`META_ADS.md` §3), Pinterest (`PINTEREST.md` §3) e Pinterest Ads (`PINTEREST_ADS.md` §3). Nenhuma menção a Landing Page/Formulário/Conversão dentro dele; `Events.ts`/`Models.ts`/`Types.ts` vazios. |
| `src/modules/crm/` | `src/modules/crm/` | Contém os eventos `LEAD_RECEIVED`/`CUSTOMER_CREATED`/`SALE_COMPLETED` (via `EventTypes.ts`, não dentro do próprio módulo — `src/modules/crm/Events.ts` é vazio, `export {}`). Relevante porque um Formulário de Landing Page, se implementado, dispararia `LEAD_RECEIVED` como resultado — mas isso é consumo de um evento de outro domínio, não vocabulário próprio de Landing Pages. |

Diferente de Email Marketing (que tinha `src/modules/communication/` como candidato com nome explicitamente compatível — "mensagens e canais"), o Landing Pages **não tem nenhum scaffold cujo nome ou comentário sugira aplicabilidade direta** — nem "landing", nem "page", nem "conversion" aparecem em nenhum comentário de módulo.

### 🔷 Vocabulário

Nenhum item de vocabulário **específico** de Landing Pages existe. O único item indiretamente relevante já pertence a outro módulo:

| Achado | Onde | Natureza real |
|---|---|---|
| `LEAD_RECEIVED: "LEAD_RECEIVED"` (grupo `// CRM`) | `src/core/events/EventTypes.ts:28` | Mesmo evento já registrado em `docs/requirements/growth/EMAIL_MARKETING.md` §3/§6 como pertencente ao domínio do CRM. Um Formulário de Landing Page seria, junto com Ads e outros canais, uma das origens que dispararia este evento — mas o evento em si não nomeia nem distingue Landing Pages de nenhuma outra origem de Lead. **Nunca emitido nem assinado** em nenhum lugar do código. |

Diferente de Google Business Profile (que tinha `GOOGLE_ANALYZED`, ao menos um evento com "Google" no nome) e de Pinterest (`PIN_CREATED`/`PIN_PUBLISHED`, com "Pin" no nome), o Landing Pages **não tem nenhum evento, enum ou string que contenha "landing", "page" (no sentido de página de conversão), "form" ou "conversion" em seu nome** — o único vocabulário tangencial (`LEAD_RECEIVED`) é genérico o bastante para não mencionar nenhuma origem específica.

### ⚪ Funcionalidades inexistentes

Todo o restante, sem exceção — confirmado termo a termo:

- `Landing`, `Landing Page`, `Page Builder`, `Builder`, `PageTemplate`, `Lead Capture`, `Capture`, `Form`, `FormBuilder`, `FormSubmit`, `CTA`, `Call To Action`, `Conversion`, `Conversion Rate`, `Funnel`, `Opt-in`, `Signup`, `Lead Magnet`, `Download` (real, de material capturável), `Thank You Page`, `A/B Test`, `Split Test`, `Contact` — **zero ocorrências em todo `src/`**.
- Nenhum valor de `AgentType` correspondente.
- Nenhum evento em `EventTypes.ts` correspondente, nem mesmo um genérico dedicado.
- Nenhuma menção em componente visual mockado (`Sidebar.tsx`, `AgentPanel.tsx`, `RightPanel.tsx`, `KpiCards.tsx`, `BottomPanel.tsx`) — confirmado por auditoria direta no Capítulo 9.
- Nenhuma pasta, arquivo, enum, mock ou componente dedicado.
- Nenhuma dependência de biblioteca de Page Builder em `package.json`.
- Nenhum capítulo dedicado em `docs/05-ECOSYSTEM_MAP.md` — "Landing Page" aparece apenas como uma **etapa dentro dos fluxos de outros módulos** (Google Ads, Capítulo 5; Pinterest, Capítulo 7), nunca como fluxo próprio.

### Resumo

| Categoria | Existe para Landing Pages? |
|---|---|
| Arquivos dedicados | Nenhum |
| Pastas dedicadas | Nenhuma |
| Eventos | Nenhum específico — apenas `LEAD_RECEIVED`, do domínio do CRM, consumível como gatilho |
| Enums | Nenhum |
| Estruturas genéricas plausivelmente aplicáveis | 2 (`src/modules/marketing/`, `src/modules/crm/`), nenhuma com vocabulário próprio |
| Mocks de UI | Nenhum |
| Componentes | Nenhum |
| Presença em fluxo de outro módulo (documentação) | Sim — citado como etapa em 2 fluxos (Google Ads, Pinterest) |
| Dependências de pacote | Nenhuma |

### Conclusão objetiva da auditoria

O Landing Pages é, entre os onze módulos de Growth Hub já auditados nesta série (Blog, SEO, Analytics, Search Console, AdSense, Google Ads, Meta Ads, Pinterest, Pinterest Ads, Google Business Profile, Email Marketing), o único cujo **único precedente documental é o de aparecer como etapa dentro do fluxo de outros dois módulos** (`docs/05-ECOSYSTEM_MAP.md` Capítulos 5 e 7), sem nunca ter um fluxo, evento, enum ou string de UI que lhe seja próprio. Isso o coloca em uma categoria distinta de Email Marketing e Google Business Profile (que também não tinham vocabulário próprio, mas eram citados como módulos independentes em listas e integrações) — o Landing Pages é estruturalmente descrito, em toda a documentação já existente, **como um nó de passagem entre Campanha e Conversão**, nunca como um destino de auditoria em si mesmo, até esta Sprint.

---

## 4. Estruturas Encontradas

| Estrutura | Estado | Observação |
|---|---|---|
| `src/modules/landing-pages/` (ou equivalente dedicado) | ⚪ Inexistente | Confirmado por varredura completa de `src/modules/*` (12 módulos existentes: `crm`, `business`, `agenda`, `marketing`, `communication`, `analytics`, `fiscal`, `hr`, `projects`, `documents`, `academy`, `marketplace`; nenhum chamado `landing` ou `landing-pages`). |
| `src/modules/marketing/` | 🟡 Estrutura genérica, candidato já citado para outros módulos | Ver Capítulo 3. Sem nenhuma linha de vocabulário Landing Page/Formulário/Conversão. |
| `src/modules/crm/` | 🟡 Estrutura genérica, relevante por consumo futuro | Contém o scaffold que receberia o Lead capturado, mas nenhum vocabulário do lado de "quem capturou" (Landing Pages). |
| `src/core/connectors/` (`BaseConnector`, `ConnectorManager`, `ConnectorRegistry`, `ConnectorTypes`, `ConnectorEvents`) | 🟡 Estrutura genérica de infraestrutura | Nenhum conector concreto para hospedagem/publicação de página; `BaseConnector` é `abstract class` com stubs neutros, mesmo padrão já confirmado para todos os módulos anteriores. |
| `src/shared/interfaces/IModule.ts`, `IConnector.ts` | 🟢 Contrato real, usado por toda a plataforma | Interfaces genéricas que um eventual módulo/conector Landing Pages precisaria implementar — não são específicas deste módulo. |

Nenhuma estrutura de dado (`Page`, `Form`, `Template`, `Variant`, `Conversion`) existe em nenhum `Models.ts` auditado — todos são `export {}` vazio.

---

## 5. Componentes Encontrados

Nenhum componente funcional ou mockado de Landing Pages existe — mesma situação de Google Business Profile e Email Marketing, sem sequer uma string isolada em algum componente de UI. Os componentes que o módulo **teria**, todos ⚪ Planejado:

| Componente | Função |
|---|---|
| **Visão Geral** | Painel-resumo consolidado do módulo. |
| **Páginas** | Landing Pages criadas — uma por Campanha/objetivo, tipicamente. |
| **Page Builder** | Editor visual de montagem de página a partir de blocos/Templates. |
| **Templates** | Modelos reutilizáveis de página por objetivo (captura de Lead, venda, download). |
| **Formulários** | Campo de captura de dado do visitante (Form/FormSubmit), gerando Lead. |
| **CTA** | Configuração da Chamada para ação principal da página. |
| **Testes A/B** | Variações de página comparadas por Taxa de conversão. |
| **Página de agradecimento** | Confirmação pós-conversão (Thank You Page), com entrega de Lead Magnet quando aplicável. |
| **Taxa de conversão** | Métrica central — visitantes convertidos dividido por visitantes totais, por página/variação. |
| **Relatórios** | Consolidação periódica do dado deste módulo. |
| **Alertas** | Ver Capítulo 9. |
| **Oportunidades** | Recomendação de qual página/variação replicar, com base em Taxa de conversão. |
| **Configurações** | Domínio conectado, integração de Formulário com CRM, limites de Alerta. |

---

## 6. Eventos Encontrados

Já detalhado no Capítulo 3, consolidado aqui: **nenhum evento específico de Landing Pages existe.** O único evento tangencialmente relevante é `LEAD_RECEIVED` (`src/core/events/EventTypes.ts:28`, grupo `// CRM`), que pertence ao domínio do CRM e seria disparado por qualquer origem de Lead (Landing Pages, Blog, Ads diretamente) — não é, e não deveria ser confundido com, vocabulário próprio deste módulo, mesma ressalva já aplicada em `docs/requirements/growth/EMAIL_MARKETING.md` §6. Nunca emitido nem assinado em nenhum lugar de `src/`.

Nenhum grupo de comentário `// Landing` ou `// Conversion` existe em `EventTypes.ts`. Toda comunicação de evento, quando implementada, passaria pelo `EventBus` único já existente (`src/core/events/EventBus.ts`), mesma regra arquitetural já fixada em `docs/02-SYSTEM_ARCHITECTURE.md` §10.

---

## 7. Enums Encontrados

Já detalhado no Capítulo 3, consolidado aqui: **nenhum enum específico de Landing Pages existe.** `src/core/agents/registry/AgentTypes.ts` declara exatamente 10 valores (`BLOG`, `SEO`, `PINTEREST`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`, `CRM`, `DESIGN`, `ANALYTICS`, `AUTOMATION`) — nenhum relacionado a Landing Pages. Nenhum enum de domínio (`PageStatus`, `FormFieldType`, `VariantStatus`) existe em nenhum lugar. Nenhum enum `ConnectorType` com valor correspondente a hospedagem de página existe — `src/core/connectors/ConnectorTypes.ts` é `export {}` vazio.

---

## 8. Integrações

Todas ⚪ Planejado — nenhuma implementada hoje, confirmado por auditoria de `src/core/connectors/*` (Capítulo 4: todos os arquivos são stubs/contratos vazios, sem nenhum conector concreto).

| Integração | Papel no módulo Landing Pages |
|---|---|
| **Google Ads / Meta Ads / Pinterest Ads** | Origem de tráfego que a Landing Page recebe como destino de Campanha — já citado como etapa fixa nos fluxos de Google Ads (`docs/05-ECOSYSTEM_MAP.md` §5) e implicitamente aplicável aos demais módulos pagos. |
| **Pinterest / Blog / Social Media** | Origem de tráfego orgânico — já citado no fluxo de Pinterest (`docs/05-ECOSYSTEM_MAP.md` §7: `Pin → Blog → Landing Page → Conversão`). |
| **CRM** | Recebe todo Lead capturado pelo Formulário como registro — mesma fronteira de negócio já descrita para todos os módulos de aquisição/conversão desta série. |
| **Analytics** | Consumiria Taxa de conversão/Testes A/B como uma das Fontes de Dados do módulo, sem nenhum tipo correspondente hoje em `src/modules/analytics/`. |
| **Financeiro** | Recebe Receita atribuída quando a Conversão é uma Venda direta (produto digital), mesmo padrão já citado em `docs/requirements/growth/BLOG.md` §9. |
| **Blog / Designer Agent** | Fonte de Conteúdo/Imagem adaptável ao formato de página de conversão. |
| **Claude / OpenAI / Gemini** | Provedores de IA que sustentariam a geração de copy/CTA e a análise de resultado de Testes A/B — mesma ressalva já registrada em `docs/requirements/growth/META_ADS.md` §13, `PINTEREST.md` §8, `GOOGLE_BUSINESS_PROFILE.md` §8 e `EMAIL_MARKETING.md` §8: a citação repetida de que `src/providers/gemini/` "já reserva a pasta" não corresponde ao estado real do código, que só tem `src/providers/mock/MockAIProvider.ts`. |

---

## 9. UI

Auditoria de todos os componentes visuais hoje renderizados na aplicação — nenhum menciona Landing Pages, Formulário, CTA ou qualquer termo desta Sprint:

| Componente | Arquivo | O que existe hoje |
|---|---|---|
| **Sidebar** | `src/components/sidebar/Sidebar.tsx` | Array estático de 9 rótulos (`Dashboard`, `Squads`, `Agentes`, `Tarefas`, `Automações`, `Analytics`, `Integrações`, `Eventos`, `Configurações`) — nenhum item relacionado. |
| **AgentPanel** | `src/components/AgentPanel.tsx` | Lista mockada de 4 agentes: `Blog Agent`, `SEO Agent`, `Pinterest Agent`, `WordPress Agent` — nenhum "Landing Page Agent" ou equivalente. |
| **RightPanel** | `src/components/rightpanel/RightPanel.tsx` | Lista mockada de 3 agentes: `Blog Agent`, `SEO Agent`, `Pinterest Agent` — mesma ausência. |
| **KpiCards** | `src/components/cards/KpiCards.tsx` | 6 cards; só "Agentes" é real; os demais são strings hardcoded — nenhum card de Taxa de conversão/Leads capturados por página. |
| **BottomPanel** | `src/components/bottom/BottomPanel.tsx` | Sem nenhuma ocorrência de termo relacionado na varredura textual do Capítulo 3. |

Nenhuma Janela, Widget ou tela dedicada existe em `src/components/dashboard/` — pasta já registrada como **inteiramente vazia** em `docs/requirements/growth/ANALYTICS.md` ("Nota metodológica").

**Observação de UI:** Landing Pages é, junto com Google Business Profile e Email Marketing, um dos módulos, entre os doze já documentados nesta série, **sem nenhuma menção — nem mesmo decorativa — em qualquer componente de UI já renderizado.**

---

## 10. Runtime

O runtime da plataforma (`src/core/platform/`) é genérico e não conhece nenhum módulo de negócio por nome — nem Landing Pages, nem qualquer um dos 18 módulos do Growth Hub, mesma conclusão já registrada nos documentos anteriores desta série:

- **`PlatformRuntime.ts`** — mantém `bootManager`, `lifecycleManager`, `moduleLoader`, `connectorLoader`, `automationLoader` e `RuntimeState`; `init()` executa o `BootPipeline` (Capítulo 11) e transiciona estado, mas **nenhum módulo/conector concreto é carregado**.
- **`ModuleLoader.ts`** — `load()` retorna lista vazia; comentário do próprio arquivo confirma "nenhum import dinâmico de módulos concretos".
- **`ConnectorManager.ts`** — `ILifecycle` com `init/start/stop` vazios, nenhum conector concreto orquestrado.
- Conclusão: o Landing Pages não tem nenhum ponto de entrada no runtime real — consistente com o estado ⚪ Planejado de todo o Growth Hub.

---

## 11. Pipeline

A infraestrutura de pipeline (`src/core/pipeline/Pipeline.ts`) é genérica e reutilizável — hoje com uma única especialização real, `BootPipeline`, sem relação com Landing Pages:

- `Pipeline.execute()` já roda de verdade (registra `PipelineStep`s, cria `PipelineContext`, executa em ordem, produz `PipelineResult`) — mecanismo genérico, sem qualquer noção de "Página", "Formulário" ou "Conversão".
- `BootPipeline` registra apenas três etapas estruturais (`InitializeRuntimeStep`, `ValidateRuntimeStep`, `FinalizeRuntimeStep`), com `execute/rollback` vazios.
- Não existe, e não é citado em nenhum lugar, um pipeline de publicação de página (`PagePublishPipeline`, `FormSubmitPipeline` ou equivalente) que orquestraria etapas como "renderizar Template → publicar página → capturar Formulário → disparar `LEAD_RECEIVED` → redirecionar para Thank You Page".
- Conclusão: **zero precedente de pipeline específico de Landing Pages** — apenas a infraestrutura genérica, já usada para Boot, disponível para reuso futuro.

---

## 12. Fluxo Arquitetural

Diferente de todos os módulos já auditados nesta série, o Landing Pages **não tem um fluxo próprio em `docs/05-ECOSYSTEM_MAP.md`** — ele aparece como uma **etapa fixa dentro do fluxo de outros dois módulos**:

```
Google Ads (Capítulo 5):  Campanha → Landing Page → Conversão → CRM → Financeiro → Analytics → Dashboard
Pinterest  (Capítulo 7):  Pin → Blog → Landing Page → Conversão → CRM → Analytics
```

Em ambos os casos, "Landing Page" e "Conversão" são etapas adjacentes e distintas — a Landing Page é onde a Conversão acontece, mas o documento trata as duas como conceitos separados. Nenhum dos dois capítulos detalha o que acontece dentro da etapa "Landing Page" (Formulário, CTA, Template) — ela é tratada como uma caixa-preta de passagem em ambos os fluxos, mesmo grau de abstração em ambos.

Por analogia com essas duas aparições e com o papel geral já descrito em `docs/requirements/growth/GROWTH_HUB.md` §4, o fluxo interno da própria etapa "Landing Page" — **não documentado em nenhum lugar, portanto integralmente hipotético e explicitamente marcado como tal** — seria:

```
Tráfego (pago ou orgânico) → Página (Template/CTA) → Formulário → Lead capturado → Thank You Page → CRM → Analytics
```

Esta sequência **não tem nenhum precedente em `docs/` nem em `src/`** — é uma inferência por analogia, apresentada aqui apenas para preencher a lacuna identificada, e deve ser tratada como ⚪ Planejado no grau mais alto.

Dentro do fluxo geral do Growth Hub (`docs/requirements/growth/GROWTH_HUB.md` §5: `Pesquisa → Planejamento → Conteúdo → SEO → Imagem → Vídeo → Publicação → Distribuição → Indexação → Monitoramento → Otimização → Monetização → Dashboard`), o Landing Pages não corresponde diretamente a nenhuma das 13 etapas nomeadas — é, estruturalmente, uma etapa transversal que qualquer fluxo de Ads/orgânico atravessa entre "Publicação"/"Campanha" e "Monetização", mas que o fluxo geral do Growth Hub não nomeia explicitamente como própria.

---

## 13. Precedentes Reais da Implementação

Consolidação dos Capítulos 3–7: **não existe nenhum precedente real de implementação de Landing Pages**, nem mesmo de vocabulário exclusivo ou ambíguo. O único item relacionado (`LEAD_RECEIVED`) pertence ao domínio do CRM e é genérico o bastante para não distinguir Landing Pages de nenhuma outra origem de Lead — mesma situação já registrada para Email Marketing em `docs/requirements/growth/EMAIL_MARKETING.md` §13. Não há:

1. Nenhum `AgentType`.
2. Nenhum evento dedicado — apenas o genérico `LEAD_RECEIVED`, do CRM.
3. Nenhuma string em UI mockada.
4. Nenhum scaffold de módulo genuinamente aplicável por nome — `src/modules/marketing/` é o mesmo candidato genérico já citado para três outros módulos, sem nenhuma evidência de exclusividade.

**Achado adicional (inconsistência a registrar, não corrigir):** `docs/05-ECOSYSTEM_MAP.md` trata "Landing Page" como uma etapa nomeada e presente em dois fluxos distintos (Capítulos 5 e 7), o que poderia sugerir, a um leitor apressado, que o conceito já tem alguma maturidade de especificação — mas em nenhum dos dois capítulos há qualquer detalhamento do que a etapa contém (Formulário, CTA, Template, Variante de Teste A/B). A auditoria desta Sprint confirma que essa "aparição dupla" é inteiramente superficial: o nome da etapa se repete, mas nenhum conteúdo é compartilhado ou detalhado entre as duas ocorrências, e nenhuma delas tem qualquer precedente em `src/`. Não é uma contradição factual (`docs/05-ECOSYSTEM_MAP.md` já marca ambas as etapas como ⚪), mas reforça que "aparecer no nome de um fluxo" não equivale a "ter especificação", a mesma distinção que motivou a criação deste documento dedicado.

---

## 14. Comparação com Analytics, SEO, Email Marketing, Google Ads, Meta Ads, Pinterest e Google Business Profile

| Módulo | Código funcional (🟢) | Estrutura (🟡) | Vocabulário (🔷) | Observação |
|---|---|---|---|---|
| **Analytics** | Nenhum | `src/modules/analytics/` completo (`IModule`), mais `AgentStore`/`KpiCards` parcialmente reais | `AgentType.ANALYTICS`; `KPI_UPDATED`, `DASHBOARD_REFRESH`, `*_ANALYZED` | Único módulo com um pedaço de UI genuinamente funcional. |
| **SEO** | Nenhum | Nenhuma dedicada | `AgentType.SEO` | `AgentType` dedicado, sem responsabilidade real correspondente. |
| **Email Marketing** | Nenhum | `src/modules/communication/`, `src/core/automation/` — candidatos mais compatíveis por nome/escopo | Nenhum item que mencione o próprio módulo | Zero vocabulário absoluto, mas melhor alinhamento estrutural de nomenclatura. |
| **Google Ads** | Nenhum | Nenhuma | Apenas `GOOGLE_ANALYZED` (ambíguo) | Nenhum `AgentType` dedicado; único módulo já com "Landing Page" citada em seu próprio fluxo (`GOOGLE_ADS.md` §12). |
| **Meta Ads** | Nenhum | `src/modules/marketing/` — genérico | `META_ANALYZED` (inequívoco) + `AgentType.FACEBOOK`/`AgentType.INSTAGRAM` | Vocabulário de enum mais forte entre os módulos pagos. |
| **Pinterest** | Nenhum | `src/modules/marketing/`, `src/modules/analytics/` — genéricos | `AgentType.PINTEREST` + 3 eventos dedicados + `"Pinterest Agent"` em 2 componentes de UI | Maior número de eventos dedicados; único com "Landing Page" em seu próprio fluxo além de Google Ads (`PINTEREST.md` §12). |
| **Google Business Profile** | Nenhum | Nenhuma genuinamente aplicável (falso cognato) | Apenas `GOOGLE_ANALYZED`, diluído entre 4 módulos | Nenhuma menção em UI. |
| **Landing Pages** (este documento) | Nenhum | `src/modules/marketing/` — mesmo candidato genérico já usado por 3 outros módulos | **Nenhum item exclusivo** — único vocabulário tangencial (`LEAD_RECEIVED`) pertence ao CRM | **Único módulo cujo nome já aparece dentro do fluxo documentado de dois módulos irmãos** (Google Ads, Pinterest) sem nunca ter fluxo, evento ou UI próprios — uma posição estrutural diferente de todos os anteriores. |

**Leitura da comparação:** Landing Pages compartilha com Email Marketing e Google Business Profile a ausência total de vocabulário exclusivo, mas ocupa uma posição estruturalmente distinta: é o único módulo cujo **nome já está incorporado ao fluxo documentado de outros dois módulos** (Google Ads, Pinterest), o que poderia sugerir maior maturidade de especificação — mas a auditoria confirma que essa incorporação é puramente nominal, sem nenhum detalhamento próprio em nenhum dos dois lugares onde aparece. Isso é diferente de ser "citado como integração" (como Google Business Profile em `05-ECOSYSTEM_MAP.md` §12) — aqui, o módulo é literalmente um nó no diagrama de fluxo de outro módulo, e ainda assim não tem nenhuma especificação própria até este documento.

---

## 15. Matriz de Estado

| Item | Estado | Evidência |
|---|---|---|
| Módulo dedicado (`src/modules/landing-pages`) | ⚪ | Não existe — Capítulo 4 |
| Scaffold genérico aplicável (`marketing`, `crm`) | 🟡 | Capítulo 3/4 |
| Evento dedicado | ⚪ | Nenhum — Capítulo 6 |
| Evento de domínio vizinho relevante (`LEAD_RECEIVED`) | 🔷 (do CRM, não deste módulo) | `EventTypes.ts:28` |
| Enum dedicado (`AgentType`) | ⚪ | Nenhum — Capítulo 7 |
| String de UI (mockada ou real) | ⚪ | Nenhuma — Capítulo 9 |
| Classe `PageBuilder`/`FormService`/`ConversionTracker` | ⚪ | Nenhuma ocorrência — Capítulo 3 |
| Conector de hospedagem/publicação de página | ⚪ | `src/core/connectors/*` são stubs genéricos — Capítulo 4/8 |
| Componente de UI funcional (com dado real) | ⚪ | Capítulo 9 |
| Runtime/Pipeline específico | ⚪ | Capítulos 10/11 |
| Fluxo arquitetural dedicado em documentação | ⚪ | Não existe — apenas etapa dentro de outros 2 fluxos — Capítulo 12 |
| Dependência de pacote (biblioteca de Page Builder) | ⚪ | `package.json` — Capítulo 3 |
| Código funcional (🟢) de qualquer natureza | 🟢 **Nenhum** | Capítulos 3–11 |

---

## 16. Conclusão

O módulo Landing Pages, hoje, não tem **nenhum precedente de implementação identificável, nem vocabulário reservado que o nomeie exclusivamente** — mesma posição de vocabulário zero já registrada para Email Marketing e Google Business Profile. O que o distingue estruturalmente dos onze módulos já auditados nesta série é sua **presença nominal dentro do fluxo documentado de dois módulos irmãos** (`docs/05-ECOSYSTEM_MAP.md` Capítulos 5 e 7, Google Ads e Pinterest) — o único módulo cujo nome já aparece como nó em diagramas de fluxo alheios antes de ter qualquer especificação própria. A auditoria desta Sprint confirma que essa presença é puramente nominal: nenhum dos dois fluxos detalha Formulário, CTA, Template ou Taxa de conversão, e nenhum precedente de código sustenta qualquer parte dessa etapa. Toda a especificação funcional deste documento — Page Builder, Formulários, CTA, Testes A/B, Thank You Page — parte de folha inteiramente em branco, com o agravante (e ao mesmo tempo o diferencial) de já ser mencionado, sem nenhum detalhe, dentro da arquitetura de outros dois módulos.

## 17. Próximos Passos

| Fase | Foco |
|---|---|
| **Fase 1 — Criação do módulo** | Scaffold dedicado sobre `IModule` (`src/modules/landing-pages/`, ou absorvido por `marketing`, Capítulo 3/4) — sem lógica de negócio. |
| **Fase 2 — Page Builder e Templates** | Primeira implementação de edição/publicação de página — hoje inexistente (Capítulo 4/5). |
| **Fase 3 — Formulário e captura de Lead** | Implementação do Formulário disparando `LEAD_RECEIVED` (Capítulo 6/13) como consumidor real desse evento do CRM — primeira vez que esse evento teria uma origem concreta. |
| **Fase 4 — Thank You Page e Lead Magnet** | Confirmação pós-conversão e entrega de material, quando aplicável. |
| **Fase 5 — Testes A/B** | Comparação de variações de página por Taxa de conversão. |
| **Fase 6 — Detalhamento dos fluxos existentes** | Preencher, em `docs/05-ECOSYSTEM_MAP.md`, o conteúdo interno da etapa "Landing Page" já citada nos Capítulos 5 (Google Ads) e 7 (Pinterest) — hoje tratada como caixa-preta em ambos. |
| **Fase 7 — Integração com Analytics** | Taxa de conversão/Testes A/B alimentando de fato as Fontes de Dados do Analytics. |
| **Fase 8 — IA** | Um eventual Agente de Conversão gerando copy/CTA e propondo Testes A/B de forma cada vez mais autônoma, sempre com Aprovação humana antes de publicar uma variação nova. |

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
