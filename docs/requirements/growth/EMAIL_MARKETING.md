# EMAIL MARKETING — Especificação Funcional do Módulo

**Andreia AI Platform** · Growth Hub
Documentação funcional do módulo Email Marketing — o décimo primeiro módulo do Growth Hub a ser especificado em detalhe, seguindo o padrão de 17 itens obrigatórios já usado em `docs/requirements/growth/META_ADS.md` (Sprint 12.0) até `GOOGLE_BUSINESS_PROFILE.md` (Sprint 15.0).

Este documento é uma **especificação funcional**, não uma implementação. Relaciona-se com `docs/requirements/growth/GROWTH_HUB.md` (Email Marketing é um dos 18 módulos ali listados) e com `docs/requirements/growth/BLOG.md` §9, que já citava Email Marketing como canal de Distribuição ("inclusão de artigos novos em newsletters"). Esta Sprint é **exclusivamente de documentação** — nenhum arquivo `.ts`, `.tsx`, `.json` ou `.css` foi alterado para produzi-la; apenas ferramentas de leitura (Read, Grep, Glob) foram usadas. Por instrução explícita desta Sprint, toda conclusão abaixo se apoia **exclusivamente** na auditoria do código atual — documentação anterior é citada apenas como referência cruzada, nunca como fonte de verdade sobre o que existe implementado.

**Legenda usada em todo o documento (quatro níveis):**
- 🟢 **Implementado** — lógica real, funcional, executável hoje.
- 🟡 **Estrutura** — existe código real (uma classe, um scaffold), mas sem lógica de negócio completa por trás.
- 🔷 **Vocabulário** — existe apenas um nome, string ou valor de enum declarado — sem nenhuma estrutura ao redor.
- ⚪ **Planejado** — não existe nenhum vestígio no código; é direção de design.

---

## Missão do módulo

O Email Marketing **não é** tratado como um disparador de mensagens. É o **Centro Inteligente de Retenção e Reengajamento**, cujo objetivo é transformar um Lead/Cliente já capturado em relacionamento contínuo, sem depender de aquisição paga repetida.

---

## 1. Objetivo

**O que é:** o módulo Email Marketing é a camada da plataforma responsável por gerenciar o envio de e-mail para quem já é Lead ou Cliente da Empresa — Campanhas pontuais, Sequências automáticas (Autoresponder), Newsletters recorrentes com conteúdo do Blog, e a Lista/Segmentação de contatos que recebe cada envio.

**Objetivos funcionais:**
- Reter e reengajar quem já converteu em Lead, via e-mail — mesma definição já registrada em `docs/requirements/growth/GROWTH_HUB.md` §4 ("retenção e reengajamento de quem já converteu em Lead, via e-mail").
- Distribuir Conteúdo já produzido pelo Blog em formato de Newsletter, estendendo seu alcance para quem já está na Lista (`docs/requirements/growth/BLOG.md` §9: "Canal de Distribuição — inclusão de artigos novos em newsletters").
- Automatizar Sequências de e-mail (Autoresponder) disparadas por evento (novo Lead, Venda, abandono), reduzindo trabalho manual repetitivo.
- Medir Taxa de abertura (Open Rate), Cliques, Bounce e Descadastro (Unsubscribe), alimentando o Analytics com retorno do canal.

**Benefícios:**
- Canal de custo direto baixo (sem leilão de mídia como Ads), sobre uma base de contato já própria da Empresa — não dependente de alcance de terceiro.
- Reaproveitamento direto de Conteúdo já produzido (Blog), sem exigir redação dedicada para cada envio.
- Frequência e relevância de contato controladas pela própria Empresa, diferente de redes sociais sujeitas a algoritmo de terceiro.

**Problemas que resolve:**
- Lead capturado por qualquer canal (Ads, Blog, Pinterest) que nunca mais recebe contato, esfriando sem nenhuma tentativa de reengajamento.
- Envio manual e não sistemático de e-mail, sem Sequência disparada por evento nem Segmentação de público.
- Falta de visão de quais Campanhas de e-mail efetivamente geram abertura/clique/retorno, versus as que geram apenas Descadastro.

## 2. Escopo

Gestão de Listas e Segmentos de contato, Templates de e-mail, Campanhas pontuais, Sequências automáticas (Autoresponder) disparadas por Trigger, Newsletter recorrente com Conteúdo do Blog, e monitoramento de Taxa de abertura, Cliques, Bounce e Descadastro.

**Limites:**
- O Email Marketing não captura o Lead — recebe o que outros módulos (Blog, Ads, Pinterest) já capturaram; a Lista é alimentada de fora para dentro.
- O Email Marketing não é o CRM — o histórico de relacionamento completo do Lead/Cliente vive no CRM (Business Hub); este módulo cuida especificamente do canal de e-mail.
- O Email Marketing não decide o Conteúdo original de uma Newsletter — reaproveita o que o Blog já produziu, adaptando formato quando necessário (mesmo limite já registrado para Pinterest em `docs/requirements/growth/PINTEREST.md` §2).

---

## 3. Auditoria Completa

Auditei o repositório inteiro (`src/`, `docs/`, `package.json`) pelos termos pedidos por esta Sprint: `Email`, `E-mail`, `Mail`, `Mailer`, `MailService`, `SMTP`, `IMAP`, `POP3`, `Inbox`, `Outbox`, `Newsletter`, `Campaign`, `EmailCampaign`, `Template`, `EmailTemplate`, `Sequence`, `Automation`, `Autoresponder`, `Trigger`, `Contact`, `Subscriber`, `Lead`, `List`, `Audience`, `Segment`, `Open Rate`, `CTR`, `Click`, `Bounce`, `Unsubscribe`, `Webhook`, `Tracking`, `Pixel`, `UTM`, `Resend`, `SendGrid`, `Mailgun`, `SES`, `Brevo`, `Postmark`, `Nodemailer`, `OAuth`, `AgentType`, `EventType`, além de varredura estrutural por Enums, Interfaces, Factories, Stores, Services, Hooks, Pipelines, Modules, Scenes, UI. Toda busca foi caso-insensível, com checagem manual de falsos positivos — este conjunto de termos colide fortemente com vocabulário genérico de automação e de UI já existente na plataforma: `Trigger`/`Sequence` são conceitos genéricos do motor de Automação (`src/core/automation/TriggerManager.ts`, `RuleEngine.ts`), sem relação com e-mail; `unsubscribe` aparece como nome de função de limpeza de `useEffect` em componentes React (retorno de `agentStore.subscribe()`); `Bounce` colide com o comentário `// Debounce timers` em `src/plugin/squadWatcher.ts`.

### Termo por termo — o que foi encontrado

| Termo buscado | Ocorrência real | Onde |
|---|---|---|
| `Email`, `E-mail`, `Mail`, `Mailer`, `MailService`, `SMTP`, `IMAP`, `POP3`, `Inbox`, `Outbox`, `Newsletter` | **Zero ocorrências em todo `src/`** | — |
| `EmailCampaign`, `EmailTemplate` | Zero ocorrências | — |
| `Sequence` | Falsos positivos apenas — `CommandSequence` (`src/game/ai/OfficeCommands.ts`, `Scheduler.ts`), sequenciamento de comandos de movimentação do personagem no jogo, sem relação com Sequência de e-mail | `src/game/ai/OfficeCommands.ts`, `src/game/ai/Scheduler.ts` |
| `Automation`, `Trigger` | 🟡 Estrutura genérica real — `src/core/automation/` (`TriggerManager`, `RuleEngine`, `AutomationEvents`, `IAutomation`), infraestrutura de automação **completamente genérica**, sem nenhuma menção a e-mail dentro dela | `src/core/automation/*` |
| `Autoresponder` | Zero ocorrências | — |
| `Contact`, `Subscriber` | Zero ocorrências | — |
| `Lead` | 🔷 Vocabulário — `LEAD_RECEIVED` já existe como evento (grupo `// CRM`), mas pertence ao domínio do CRM, não deste módulo — ver Capítulo 6 | `src/core/events/EventTypes.ts:28` |
| `List`, `Audience`, `Segment` | Zero ocorrências relacionadas a lista de contato/segmentação de e-mail | — |
| `Open Rate`, `CTR`, `Click`, `Bounce`, `Unsubscribe` | Falsos positivos apenas — `unsubscribe` é o nome padrão de função de limpeza de `useEffect` (`KpiCards.tsx`, retorno de `agentStore.subscribe()`); `Bounce` colide com o comentário `// Debounce timers` (`squadWatcher.ts`) | `src/components/cards/KpiCards.tsx`, `src/plugin/squadWatcher.ts` |
| `Webhook`, `Tracking`, `Pixel`, `UTM` | Zero ocorrências reais — mesma conclusão já registrada em `docs/requirements/growth/META_ADS.md` §3, `PINTEREST.md` §3 e `PINTEREST_ADS.md` §3 | — |
| `Resend`, `SendGrid`, `Mailgun`, `SES`, `Brevo`, `Postmark`, `Nodemailer` (provedores de envio) | Zero ocorrências em `src/` e zero dependências em `package.json` | — |
| `OAuth` | Zero ocorrências | — |
| `AgentType` (catálogo geral) | Nenhum valor relacionado a Email Marketing existe — 10 valores no total (`BLOG`, `SEO`, `PINTEREST`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`, `CRM`, `DESIGN`, `ANALYTICS`, `AUTOMATION`), nenhum `EMAIL` ou equivalente | `src/core/agents/registry/AgentTypes.ts` |
| `EventType` (catálogo geral) | Nenhum evento relacionado a Email Marketing existe, nem mesmo em nome de grupo de comentário (`// Tasks`, `// Agents`, `// Squads`, `// Blog`, `// Pinterest`, `// CRM`, `// Traffic`, `// Dashboard`, `// System`) | `src/core/events/EventTypes.ts` |
| `src/modules/communication/` (nome de módulo, candidato de nomenclatura) | 🟡 Estrutura genérica, escopo compatível na descrição, mas sem nenhum conteúdo específico | `src/modules/communication/Manager.ts` |
| Dependência em `package.json` (SDK de envio de e-mail) | Zero | `package.json` |

### 🟢 Código funcional

**Nenhum.** Nenhuma lógica de negócio de Email Marketing existe em nenhuma camada.

### 🟡 Estruturas

Duas estruturas genéricas são plausivelmente aplicáveis — nenhuma dedicada:

| Achado | Onde | Natureza real |
|---|---|---|
| `src/modules/communication/` (`Manager.ts`, `Events.ts`, `Models.ts`, `Types.ts`, `index.ts`) | `src/modules/communication/` | `CommunicationManager implements IModule` (`id: 'communication'`, `name: 'Communication'`, `init/start/stop` vazios); `Events.ts` define `CommunicationEventTypes` como objeto **vazio**; `Models.ts`/`Types.ts` são `export {}`. O comentário do próprio arquivo descreve o escopo como "Comunicação (mensagens e canais)" — é, dos scaffolds genéricos já existentes, o de nome **mais compatível** com Email Marketing encontrado até agora nesta série (mais direto que `marketing`, usado como candidato para os módulos de Ads). Ainda assim, zero linha de vocabulário ou lógica específica de e-mail dentro dele. |
| `src/core/automation/` (`TriggerManager`, `RuleEngine`, `AutomationEvents`, `IAutomation`) | `src/core/automation/*` | Infraestrutura de automação genérica e real (`TriggerManager implements IAutomation`), relevante porque uma Sequência de e-mail (Autoresponder) é, por definição, uma automação disparada por evento — mas hoje **sem nenhuma menção a e-mail, Lead ou Sequência de mensagem** dentro dela; é a mesma infraestrutura que serviria qualquer outro fluxo de automação da plataforma. |

### 🔷 Vocabulário

Um único item, e indireto — não é vocabulário próprio deste módulo, mas de um módulo vizinho (CRM) que uma futura implementação de Email Marketing dependeria:

| Achado | Onde | Natureza real |
|---|---|---|
| `LEAD_RECEIVED: "LEAD_RECEIVED"` (grupo `// CRM`) | `src/core/events/EventTypes.ts:28` | Evento já existente no catálogo do `EventBus`, pertencente ao domínio do CRM — um Autoresponder de Email Marketing tipicamente reagiria a este evento (ex.: disparar Sequência de boas-vindas). **Nunca emitido nem assinado** em nenhum lugar do código, e não é, de forma alguma, um vocabulário "de" Email Marketing — é citado aqui apenas por ser o precedente mais próximo de um gatilho (Trigger) que este módulo, se implementado, consumiria. |

Diferente de Google Business Profile (que ao menos tinha `GOOGLE_ANALYZED`, um evento ambíguo mas presente), o Email Marketing **não tem nenhum item de vocabulário que já mencione ou nomeie o próprio módulo** — nem um `AgentType`, nem um evento `EMAIL_SENT`/`CAMPAIGN_SENT`/`NEWSLETTER_PUBLISHED` sequer declarado e não usado.

### ⚪ Funcionalidades inexistentes

Todo o restante, sem exceção — confirmado termo a termo:

- `Mail`, `Mailer`, `MailService`, `SMTP`, `IMAP`, `POP3`, `Inbox`, `Outbox`, `Newsletter`, `EmailCampaign`, `EmailTemplate`, `Autoresponder`, `Contact`, `Subscriber`, `List` (de contato), `Audience`/`Segment` (de e-mail), `Open Rate`, `Bounce` (real), `Unsubscribe` (real), `Webhook`, `Tracking`, `Pixel`, `UTM`, `Resend`/`SendGrid`/`Mailgun`/`SES`/`Brevo`/`Postmark`/`Nodemailer`, `OAuth` — **zero ocorrências em todo `src/`**.
- Nenhum valor de `AgentType` correspondente.
- Nenhum evento em `EventTypes.ts` correspondente, nem mesmo um genérico dedicado.
- Nenhuma menção em componente visual mockado (`Sidebar.tsx`, `AgentPanel.tsx`, `RightPanel.tsx`, `KpiCards.tsx`, `BottomPanel.tsx`) — confirmado por auditoria direta no Capítulo 9.
- Nenhuma pasta, arquivo, enum, mock ou componente dedicado.
- Nenhuma dependência de SDK de envio de e-mail (Resend, SendGrid, Mailgun, SES, Brevo, Postmark, Nodemailer) em `package.json`.
- Nenhum capítulo dedicado em `docs/05-ECOSYSTEM_MAP.md` — o módulo aparece apenas em listas de módulos e no diagrama de arquitetura de alto nível ("Growth Hub: Blog, SEO, Ads, Social, **Email**"), sem fluxo próprio.

### Resumo

| Categoria | Existe para Email Marketing? |
|---|---|
| Arquivos dedicados | Nenhum |
| Pastas dedicadas | Nenhuma |
| Eventos | Nenhum — nem mesmo um genérico ambíguo (diferente de Google Business Profile, que tinha `GOOGLE_ANALYZED`) |
| Enums | Nenhum |
| Estruturas genéricas plausivelmente aplicáveis | 2 (`src/modules/communication/`, `src/core/automation/`) — mais compatíveis por nome/escopo que os candidatos vistos em módulos anteriores, mas ainda sem nenhum conteúdo específico |
| Mocks de UI | Nenhum |
| Componentes | Nenhum |
| Dependências de pacote | Nenhuma |

### Conclusão objetiva da auditoria

O Email Marketing é, entre os dez módulos de Growth Hub já auditados nesta série (Blog, SEO, Analytics, Search Console, AdSense, Google Ads, Meta Ads, Pinterest, Pinterest Ads, Google Business Profile), o único **sem nenhum item de vocabulário que sequer nomeie o próprio módulo** — nem um `AgentType`, nem um evento (ambíguo ou não), nem uma string de UI. Isso o torna, em termos de vocabulário reservado, ainda mais pobre que Google Business Profile (que ao menos tinha `GOOGLE_ANALYZED` compartilhado). Em compensação, é o único cujos **dois candidatos de estrutura genérica** (`src/modules/communication/`, cujo comentário já descreve "mensagens e canais", e `src/core/automation/`, infraestrutura real de Trigger/Automação) têm compatibilidade de nomenclatura/escopo mais direta com o que o módulo precisaria — ainda que, hoje, nenhum dos dois contenha uma única linha específica de e-mail.

---

## 4. Estruturas Encontradas

| Estrutura | Estado | Observação |
|---|---|---|
| `src/modules/email-marketing/` (ou equivalente dedicado) | ⚪ Inexistente | Confirmado por varredura completa de `src/modules/*` (12 módulos existentes: `crm`, `business`, `agenda`, `marketing`, `communication`, `analytics`, `fiscal`, `hr`, `projects`, `documents`, `academy`, `marketplace`; nenhum chamado `email` ou `email-marketing`). |
| `src/modules/communication/` | 🟡 Estrutura genérica, candidato de nomenclatura mais compatível | Ver Capítulo 3. `Events.ts`/`Models.ts`/`Types.ts` vazios — nenhum tipo `EmailCampaign`, `Template` ou `Contact` existe. |
| `src/core/automation/` (`TriggerManager`, `RuleEngine`, `AutomationEvents`, `IAutomation`) | 🟡 Estrutura genérica real | Infraestrutura de Trigger/Automação já funcional em termos de contrato (`IAutomation`), mas sem nenhuma regra ou evento de e-mail associado; serviria qualquer Automação futura, não apenas Email Marketing. |
| `src/modules/marketing/` | 🟡 Estrutura genérica, sem menção | Já citada em `META_ADS.md`/`PINTEREST.md`/`PINTEREST_ADS.md` como "campanhas e conteúdo" — plausível para Campanhas de e-mail especificamente, mas sem nenhuma evidência de que seria o destino escolhido em vez de `communication`. |
| `src/core/connectors/` (`BaseConnector`, `ConnectorManager`, `ConnectorRegistry`, `ConnectorTypes`, `ConnectorEvents`) | 🟡 Estrutura genérica de infraestrutura | Nenhum conector concreto para provedor de e-mail (Resend/SendGrid/etc.) existe; `BaseConnector` é `abstract class` com stubs neutros, mesmo padrão já confirmado para todos os módulos anteriores. |
| `src/shared/interfaces/IModule.ts`, `IConnector.ts`, `IAutomation.ts` | 🟢 Contratos reais, usados por toda a plataforma | Interfaces genéricas que um eventual módulo/conector/automação de Email Marketing precisaria implementar — não são específicas deste módulo. |

Nenhuma estrutura de dado (`Contact`, `List`, `Template`, `Campaign`, `Sequence`) existe em nenhum `Models.ts` auditado.

---

## 5. Componentes Encontrados

Nenhum componente funcional ou mockado de Email Marketing existe — mesma situação de Google Business Profile (`docs/requirements/growth/GOOGLE_BUSINESS_PROFILE.md` §5), sem sequer uma string isolada em algum componente de UI. Os componentes que o módulo **teria**, todos ⚪ Planejado:

| Componente | Função |
|---|---|
| **Visão Geral** | Painel-resumo consolidado do módulo. |
| **Listas** | Contatos segmentados por origem/interesse/status de conversão. |
| **Templates** | Modelos de e-mail reutilizáveis, por tipo de Campanha/Sequência. |
| **Campanhas** | Envios pontuais para uma Lista/Segmento. |
| **Sequências (Autoresponder)** | Fluxos automáticos disparados por Trigger (novo Lead, Venda, abandono). |
| **Newsletter** | Envio recorrente com Conteúdo do Blog (`docs/requirements/growth/BLOG.md` §9). |
| **Segmentação** | Critérios de recorte da Lista (origem, comportamento, estágio no funil). |
| **Métricas de envio** | Taxa de abertura, Cliques, Bounce, Descadastro. |
| **Relatórios** | Consolidação periódica do dado deste módulo. |
| **Alertas** | Ver Capítulo 9. |
| **Oportunidades** | Recomendação de Segmento/Template com melhor desempenho. |
| **Configurações** | Provedor de envio conectado (Resend/SendGrid/etc.), domínio verificado, limites de frequência. |

---

## 6. Eventos Encontrados

Já detalhado no Capítulo 3, consolidado aqui: **nenhum evento específico de Email Marketing existe** — nem mesmo um nome genérico e ambíguo (diferente de Google Business Profile, que tinha `GOOGLE_ANALYZED`). O único evento tangencialmente relevante é `LEAD_RECEIVED` (`src/core/events/EventTypes.ts:28`, grupo `// CRM`), que pertence ao domínio do CRM — um futuro Autoresponder consumiria este evento como gatilho (Trigger), mas ele não é, e não deveria ser confundido com, vocabulário próprio deste módulo. Nunca emitido nem assinado em nenhum lugar de `src/`.

Nenhum grupo de comentário `// Email` ou `// Communication` existe em `EventTypes.ts`. `src/modules/communication/Events.ts` declara `CommunicationEventTypes` como objeto **vazio** — nenhum nome de evento de e-mail está ali. Toda comunicação de evento, quando implementada, passaria pelo `EventBus` único já existente (`src/core/events/EventBus.ts`), mesma regra arquitetural já fixada em `docs/02-SYSTEM_ARCHITECTURE.md` §10.

---

## 7. Enums Encontrados

Já detalhado no Capítulo 3, consolidado aqui: **nenhum enum específico de Email Marketing existe.** `src/core/agents/registry/AgentTypes.ts` declara exatamente 10 valores (`BLOG`, `SEO`, `PINTEREST`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`, `CRM`, `DESIGN`, `ANALYTICS`, `AUTOMATION`) — nenhum relacionado a Email Marketing. Nenhum enum de domínio (`CampaignStatus`, `TemplateType`, `SegmentCriteria`) existe em nenhum lugar. Nenhum enum `ConnectorType` com valor correspondente a provedor de e-mail existe — `src/core/connectors/ConnectorTypes.ts` é `export {}` vazio.

---

## 8. Integrações

Todas ⚪ Planejado — nenhuma implementada hoje, confirmado por auditoria de `src/core/connectors/*` (Capítulo 4: todos os arquivos são stubs/contratos vazios, sem nenhum conector concreto).

| Integração | Papel no módulo Email Marketing |
|---|---|
| **Provedor de envio (Resend/SendGrid/Mailgun/SES/Brevo/Postmark)** | A própria infraestrutura de entrega de e-mail — a integração central deste módulo, hoje com **zero implementação de conector** e zero dependência em `package.json`. |
| **Blog** | Fonte de Conteúdo incluído em Newsletters (`docs/requirements/growth/BLOG.md` §9) — dependência mais direta de conteúdo. |
| **CRM** | Fonte da Lista de contatos (Lead/Cliente) — o evento `LEAD_RECEIVED` (Capítulo 6) seria o gatilho mais natural de entrada de um novo contato na Lista. |
| **Analytics** | Consumiria Taxa de abertura/Cliques/Bounce como uma das Fontes de Dados do módulo, sem nenhum tipo correspondente hoje em `src/modules/analytics/`. |
| **Automação (Operations Hub)** | Sequências (Autoresponder) seriam implementadas sobre a infraestrutura genérica já existente em `src/core/automation/` (Capítulo 4) — mas hoje sem nenhuma regra de e-mail configurada. |
| **Claude / OpenAI / Gemini** | Provedores de IA que sustentariam a geração de Templates/Assunto de e-mail — mesma ressalva já registrada em `docs/requirements/growth/META_ADS.md` §13, `PINTEREST.md` §8 e `GOOGLE_BUSINESS_PROFILE.md` §8: a citação repetida de que `src/providers/gemini/` "já reserva a pasta" não corresponde ao estado real do código, que só tem `src/providers/mock/MockAIProvider.ts`. |

---

## 9. UI

Auditoria de todos os componentes visuais hoje renderizados na aplicação — nenhum menciona Email Marketing, Newsletter, Campanha de e-mail ou qualquer termo desta Sprint:

| Componente | Arquivo | O que existe hoje |
|---|---|---|
| **Sidebar** | `src/components/sidebar/Sidebar.tsx` | Array estático de 9 rótulos (`Dashboard`, `Squads`, `Agentes`, `Tarefas`, `Automações`, `Analytics`, `Integrações`, `Eventos`, `Configurações`) — nenhum item relacionado. |
| **AgentPanel** | `src/components/AgentPanel.tsx` | Lista mockada de 4 agentes: `Blog Agent`, `SEO Agent`, `Pinterest Agent`, `WordPress Agent` — nenhum "Email Agent" ou equivalente. |
| **RightPanel** | `src/components/rightpanel/RightPanel.tsx` | Lista mockada de 3 agentes: `Blog Agent`, `SEO Agent`, `Pinterest Agent` — mesma ausência. |
| **KpiCards** | `src/components/cards/KpiCards.tsx` | 6 cards; só "Agentes" é real; os demais são strings hardcoded — nenhum card de Taxa de abertura/Cliques/Descadastro. |
| **BottomPanel** | `src/components/bottom/BottomPanel.tsx` | Sem nenhuma ocorrência de termo relacionado na varredura textual do Capítulo 3. |

Nenhuma Janela, Widget ou tela dedicada existe em `src/components/dashboard/` — pasta já registrada como **inteiramente vazia** em `docs/requirements/growth/ANALYTICS.md` ("Nota metodológica").

**Observação de UI:** Email Marketing é, junto com Google Business Profile, um dos únicos módulos, entre os dez já documentados nesta série, **sem nenhuma menção — nem mesmo decorativa — em qualquer componente de UI já renderizado.**

---

## 10. Runtime

O runtime da plataforma (`src/core/platform/`) é genérico e não conhece nenhum módulo de negócio por nome — nem Email Marketing, nem qualquer um dos 18 módulos do Growth Hub, mesma conclusão já registrada nos documentos anteriores desta série:

- **`PlatformRuntime.ts`** — mantém `bootManager`, `lifecycleManager`, `moduleLoader`, `connectorLoader`, `automationLoader` e `RuntimeState`; `init()` executa o `BootPipeline` (Capítulo 11) e transiciona estado, mas **nenhum módulo/conector concreto é carregado**.
- **`ModuleLoader.ts`** — `load()` retorna lista vazia; comentário do próprio arquivo confirma "nenhum import dinâmico de módulos concretos".
- **`ConnectorManager.ts`** — `ILifecycle` com `init/start/stop` vazios, nenhum conector concreto orquestrado.
- Conclusão: o Email Marketing não tem nenhum ponto de entrada no runtime real — consistente com o estado ⚪ Planejado de todo o Growth Hub.

---

## 11. Pipeline

A infraestrutura de pipeline (`src/core/pipeline/Pipeline.ts`) é genérica e reutilizável — hoje com uma única especialização real, `BootPipeline`, sem relação com Email Marketing:

- `Pipeline.execute()` já roda de verdade (registra `PipelineStep`s, cria `PipelineContext`, executa em ordem, produz `PipelineResult`) — mecanismo genérico, sem qualquer noção de "Campanha de e-mail", "Sequência" ou "Envio".
- `BootPipeline` registra apenas três etapas estruturais (`InitializeRuntimeStep`, `ValidateRuntimeStep`, `FinalizeRuntimeStep`), com `execute/rollback` vazios.
- Não existe, e não é citado em nenhum lugar, um pipeline de envio (`EmailSendPipeline`, `SequenceTriggerPipeline` ou equivalente) que orquestraria etapas como "selecionar Segmento → renderizar Template → enviar via provedor → registrar Bounce/Abertura".
- Conclusão: **zero precedente de pipeline específico de Email Marketing** — apenas a infraestrutura genérica, já usada para Boot, disponível para reuso futuro. A infraestrutura de `src/core/automation/` (Capítulo 4) é a mais próxima conceitualmente de um "pipeline de Sequência", mas hoje não contém nenhuma regra configurada.

---

## 12. Fluxo Arquitetural

**Nenhum fluxo arquitetural específico de Email Marketing existe em `docs/05-ECOSYSTEM_MAP.md`** — o documento cita o módulo apenas dentro do diagrama de arquitetura de alto nível do Capítulo 1 ("Growth Hub: Blog, SEO, Ads, Social, **Email**"), sem nenhum capítulo ou diagrama de fluxo dedicado, mesma situação já registrada para Pinterest Ads (`PINTEREST_ADS.md` §12) e Google Business Profile (`GOOGLE_BUSINESS_PROFILE.md` §12) — mas aqui ainda mais escassa: nem uma linha de tabela de integração própria existe (diferente de Google Business Profile, que ao menos aparecia numa célula da tabela do Capítulo 12 do Ecosystem Map).

Por analogia estrutural com o fluxo de Distribuição já citado em `docs/requirements/growth/BLOG.md` §9 e `GROWTH_HUB.md` §5 (etapa "Distribuição" do fluxo geral do Growth Hub) e com o papel de retenção já descrito em `GROWTH_HUB.md` §4, o fluxo mais provável para Email Marketing — **não documentado em nenhum lugar, portanto integralmente hipotético e explicitamente marcado como tal** — seria:

```
Lead capturado (qualquer canal) → Lista → Sequência (Autoresponder) → Abertura/Clique → CRM → Analytics
Artigo novo do Blog → Newsletter → Lista → Abertura/Clique → Analytics
```

Esta sequência **não tem nenhum precedente em `docs/` nem em `src/`** — é uma inferência por analogia, apresentada aqui apenas para preencher a lacuna identificada, e deve ser tratada como ⚪ Planejado no grau mais alto.

Dentro do fluxo geral do Growth Hub (`docs/requirements/growth/GROWTH_HUB.md` §5), o Email Marketing participaria principalmente da etapa **Distribuição** (Newsletter) — já citada explicitamente para este módulo em três documentos diferentes (`BLOG.md` §5/§9, `GROWTH_HUB.md` §6, `PLATFORM_VISION.md` linha 229) — e de uma etapa de retenção pós-conversão que o fluxo de 13 passos daquele documento não nomeia explicitamente (o fluxo termina em "Monetização → Dashboard", sem uma etapa de "Retenção").

---

## 13. Precedentes Reais da Implementação

Consolidação dos Capítulos 3–7: **não existe nenhum precedente real de implementação de Email Marketing**, nem mesmo de vocabulário exclusivo ou ambíguo. Diferente de todos os dez módulos já auditados nesta série — que tinham, no mínimo, um evento genérico compartilhado (`GOOGLE_ANALYZED` para Google Business Profile) — o Email Marketing não tem **nenhum** item de vocabulário que já mencione o próprio módulo:

1. Nenhum `AgentType`.
2. Nenhum evento — nem mesmo um `*_ANALYZED` ambíguo.
3. Nenhuma string em UI mockada.
4. `LEAD_RECEIVED` — citado no Capítulo 6, mas pertence ao domínio do CRM, não deste módulo.
5. `src/modules/communication/`, `src/core/automation/` — dois scaffolds genéricos com nomenclatura/escopo compatível, mas zero conteúdo específico.

**Achado adicional (inconsistência a registrar, não corrigir):** `docs/requirements/growth/GROWTH_HUB.md` §3 e §4 tratam Email Marketing como um módulo de negócio distinto e definido ("retenção e reengajamento de quem já converteu em Lead, via e-mail"), e `docs/requirements/growth/BLOG.md` §9 já o cita como destino de Distribuição de artigos novos. A auditoria de código desta Sprint confirma que **nenhuma dessas responsabilidades tem qualquer estrutura, evento ou enum correspondente** em `src/` — nem mesmo o candidato mais plausível (`src/modules/communication/`) contém uma única linha de vocabulário de e-mail. Não é uma contradição factual (a documentação anterior usa a legenda ⚪ para este módulo, corretamente), mas reforça, mais uma vez, a instrução desta Sprint de não tratar menção em prosa como evidência de implementação.

---

## 14. Comparação com Analytics, SEO, Google Ads, Meta Ads, Pinterest e Google Business Profile

| Módulo | Código funcional (🟢) | Estrutura (🟡) | Vocabulário (🔷) | Observação |
|---|---|---|---|---|
| **Analytics** | Nenhum | `src/modules/analytics/` completo (`IModule`), mais `AgentStore`/`KpiCards` parcialmente reais | `AgentType.ANALYTICS`; `KPI_UPDATED`, `DASHBOARD_REFRESH`, `*_ANALYZED` | Único módulo com um pedaço de UI genuinamente funcional. |
| **SEO** | Nenhum | Nenhuma dedicada | `AgentType.SEO` | `AgentType` dedicado, mas sem nenhuma responsabilidade real correspondente (já registrado em `docs/requirements/growth/ANALYTICS.md` §8 sobre o "SEO Agent"). |
| **Google Ads** | Nenhum | Nenhuma | Apenas `GOOGLE_ANALYZED` (ambíguo) | Nenhum `AgentType` dedicado. |
| **Meta Ads** | Nenhum | `src/modules/marketing/` — genérico | `META_ANALYZED` (inequívoco) + `AgentType.FACEBOOK`/`AgentType.INSTAGRAM` | Vocabulário de enum mais forte entre os módulos pagos. |
| **Pinterest** | Nenhum | `src/modules/marketing/`, `src/modules/analytics/` — genéricos | `AgentType.PINTEREST` + 3 eventos dedicados + `"Pinterest Agent"` em 2 componentes de UI | Maior número de eventos dedicados; única presença literal em UI real. |
| **Google Business Profile** | Nenhum | Nenhuma genuinamente aplicável (`src/modules/business/` é falso cognato) | Apenas `GOOGLE_ANALYZED`, diluído entre 4 módulos | Nenhuma menção em UI; posição mais fraca até esta Sprint. |
| **Email Marketing** (este documento) | Nenhum | `src/modules/communication/`, `src/core/automation/` — **candidatos de nomenclatura mais compatíveis de toda a série**, ainda sem conteúdo específico | **Nenhum item que mencione o próprio módulo** — nem enum, nem evento (ambíguo ou não), nem string de UI | **Único módulo com zero vocabulário absoluto de qualquer natureza** — posição ainda mais fraca que Google Business Profile em vocabulário, mas com scaffolds genéricos mais alinhados por nome/escopo. |

**Leitura da comparação:** Email Marketing inverte um padrão que se repetia desde Meta Ads — todos os módulos anteriores tinham, no mínimo, um evento ambíguo (`GOOGLE_ANALYZED`) ou um `AgentType` (`SEO`, `PINTEREST`) que já nomeava, ainda que de forma fraca, o próprio domínio. Aqui, nada disso existe. Em compensação, é o único módulo cujos candidatos de estrutura genérica (`communication`, `automation`) têm compatibilidade de escopo direta e explícita com o que o módulo precisaria — "mensagens e canais" e "Trigger/regra" são, literalmente, os dois blocos de que um Autoresponder é feito. Isso não constitui nenhum precedente de implementação, apenas indica onde a base já é estruturalmente mais favorável a receber a lógica no futuro.

---

## 15. Matriz de Estado

| Item | Estado | Evidência |
|---|---|---|
| Módulo dedicado (`src/modules/email-marketing`) | ⚪ | Não existe — Capítulo 4 |
| Scaffold genérico aplicável (`communication`, `automation`) | 🟡 | Capítulo 3/4 |
| Evento dedicado ou ambíguo | ⚪ | Nenhum — Capítulo 6 |
| Evento de domínio vizinho relevante (`LEAD_RECEIVED`) | 🔷 (do CRM, não deste módulo) | `EventTypes.ts:28` |
| Enum dedicado (`AgentType`) | ⚪ | Nenhum — Capítulo 7 |
| String de UI (mockada ou real) | ⚪ | Nenhuma — Capítulo 9 |
| Classe `Mailer`/`CampaignManager`/`SequenceEngine` | ⚪ | Nenhuma ocorrência — Capítulo 3 |
| Conector de provedor de envio | ⚪ | `src/core/connectors/*` são stubs genéricos — Capítulo 4/8 |
| Componente de UI funcional (com dado real) | ⚪ | Capítulo 9 |
| Runtime/Pipeline específico | ⚪ | Capítulos 10/11 |
| Fluxo arquitetural dedicado em documentação | ⚪ | Não existe em `docs/05-ECOSYSTEM_MAP.md` — nem sequer menção em tabela — Capítulo 12 |
| Dependência de pacote (SDK de envio de e-mail) | ⚪ | `package.json` — Capítulo 3 |
| Código funcional (🟢) de qualquer natureza | 🟢 **Nenhum** | Capítulos 3–11 |

---

## 16. Conclusão

O módulo Email Marketing, hoje, não tem **absolutamente nenhum precedente de implementação identificável ou vocabulário reservado que já mencione o próprio módulo** — é o único, entre os onze módulos de Growth Hub já auditados nesta série (Blog, SEO, Analytics, Search Console, AdSense, Google Ads, Meta Ads, Pinterest, Pinterest Ads, Google Business Profile), sem nenhum enum, evento (ambíguo ou não) ou string de UI que o nomeie. O único evento tangencialmente relevante (`LEAD_RECEIVED`) pertence ao domínio do CRM, não deste módulo. Em compensação, é o primeiro módulo desta série cujos dois candidatos de estrutura genérica (`src/modules/communication/`, descrito no próprio código como "mensagens e canais", e `src/core/automation/`, infraestrutura real de Trigger/Automação) têm compatibilidade de nomenclatura e escopo diretamente alinhada ao que o módulo precisaria implementar — ainda que, hoje, nenhum dos dois contenha uma única linha de lógica ou vocabulário de e-mail. Toda a especificação funcional deste documento — Listas, Templates, Sequências, Newsletter — parte de folha inteiramente em branco.

## 17. Próximos Passos

| Fase | Foco |
|---|---|
| **Fase 1 — Criação do módulo** | Scaffold dedicado sobre `IModule` (`src/modules/email-marketing/`, ou absorvido por `communication`, Capítulo 3/4 — candidato de nomenclatura mais direto de toda a série) — sem lógica de negócio. |
| **Fase 2 — Conector de provedor de envio** | Primeira implementação concreta de `BaseConnector` para um provedor real (Resend/SendGrid/Mailgun/SES/Brevo/Postmark) — hoje inexistente (Capítulo 4/8). |
| **Fase 3 — Listas e Templates** | Painéis de contato/segmentação e modelos de e-mail sobre o conector já funcional. |
| **Fase 4 — Campanhas e Newsletter** | Envio pontual e recorrente, reaproveitando Conteúdo do Blog (`docs/requirements/growth/BLOG.md` §9). |
| **Fase 5 — Sequências (Autoresponder)** | Automações disparadas por evento, construídas sobre `src/core/automation/` (Capítulo 4) — primeira vez que essa infraestrutura genérica ganharia uma regra de negócio real, consumindo `LEAD_RECEIVED` (Capítulo 6/13) como gatilho de exemplo. |
| **Fase 6 — Métricas de envio** | Taxa de abertura, Cliques, Bounce, Descadastro. |
| **Fase 7 — Fluxo arquitetural** | Documentar formalmente em `docs/05-ECOSYSTEM_MAP.md` o fluxo esboçado por analogia no Capítulo 12 deste documento — lacuna hoje existente frente aos demais módulos de Growth Hub. |
| **Fase 8 — Integração com Analytics** | Métricas de envio alimentando de fato as Fontes de Dados do Analytics. |
| **Fase 9 — IA** | Um eventual Agente de retenção assumindo Segmentação e Otimização de Template/Assunto de forma cada vez mais autônoma. |

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
