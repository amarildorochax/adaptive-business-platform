# ANALYTICS — Especificação Funcional do Módulo

**Andreia AI Platform** · Growth Hub
Documentação funcional do módulo Analytics — o terceiro módulo do Growth Hub a ser especificado em detalhe.

Este documento é uma **especificação funcional**, não uma implementação. Relaciona-se com `docs/requirements/growth/GROWTH_HUB.md` (Analytics é um dos 18 módulos ali listados) e com `docs/requirements/growth/BLOG.md`/`SEO.md`, que já citam Analytics como consumidor de seus dados.

**Legenda usada em todo o documento (três níveis):**
- 🟢 **Implementado** — lógica real, funcional, executável hoje.
- 🟡 **Parcial** — existe algum indício real no código, mas sem lógica de negócio completa por trás, ou uma mistura de real e mockado no mesmo componente.
- ⚪ **Planejado** — não existe nenhum vestígio no código; é direção de design.

---

## Missão do módulo

O módulo Analytics **não é** apenas uma integração com Google Analytics. É o **Centro Inteligente de Observabilidade da Plataforma**, cujo objetivo é transformar dado em decisão.

---

## Nota metodológica — investigação realizada no código

Antes de escrever, investiguei o repositório inteiro pelos termos pedidos: `Analytics`, `Google Analytics`, `GA4`, `Métricas`, `Eventos`, `Tracking`, `Dashboard`, `Relatórios`, `KPIs`, `Google`, `Measurement`, `PageView`, `Session`, `Conversion`, `EventTypes`. Auditei especificamente `EventTypes.ts`, `EventBus.ts`, os componentes de Dashboard e qualquer integração com Google Analytics. Achados, sem nenhuma suposição:

| Achado | Onde | Natureza real |
|---|---|---|
| `src/modules/analytics/` (`Manager.ts`, `Events.ts`, `Models.ts`, `Types.ts`, `index.ts`) | `src/modules/analytics/` | 🟢 Scaffold estrutural real: `AnalyticsManager implements IModule` (`id: 'analytics'`, `name: 'Analytics'`, `init/start/stop` vazios); `Events.ts` define `AnalyticsEventTypes`/`AnalyticsEventType` (tipos, não barramento). **Zero lógica de negócio** — mesmo padrão dos outros 11 módulos já documentados em `docs/02-SYSTEM_ARCHITECTURE.md` §6. |
| `AgentType.ANALYTICS = "analytics"` | `src/core/agents/registry/AgentTypes.ts` | 🟡 Valor de enum declarado, ao lado de `SEO`, `BLOG` etc. — mesma situação já registrada em `docs/requirements/growth/SEO.md`: nunca importado fora do próprio barrel, nenhum `AnalyticsAgent` real. |
| `KPI_UPDATED`, `DASHBOARD_REFRESH` (grupo `// Dashboard`) e `META_ANALYZED`/`GOOGLE_ANALYZED`/`PINTEREST_ANALYZED` (grupo `// Traffic`) | `src/core/events/EventTypes.ts` | 🟡 Nomes de evento declarados no catálogo do `EventBus` — **nunca emitidos (`eventBus.emit`) nem assinados (`eventBus.subscribe`) em nenhum lugar do código.** Vocabulário reservado, sem uso — confirmado por busca direta de cada nome em todo `src/`. |
| `KpiCards.tsx` | `src/components/cards/KpiCards.tsx` | 🟡 **Achado mais importante desta investigação — um componente misto, real e mockado ao mesmo tempo.** O card "Agentes" é 🟢 genuinamente real-time: usa `useState`/`useEffect`, assina `agentStore.subscribe(...)` e lê `agentStore.totalAgents()`. Os outros cinco cards — "Tarefas" (`"21"`), "Execuções" (`"154"`), "IA" (`"GPT-5"`), "Leads" (`"42"`), "Vendas" (`"12"`) — são **strings hardcoded**, sem nenhuma fonte de dado. Visualmente os seis cards parecem igualmente "ao vivo"; só um é. |
| `AgentStore` | `src/core/store/AgentStore.ts` | 🟢 Store reativo real (`subscribe`/`notify`, wrapping de `AgentRegistry`) — mas mede apenas contagem/status de Agentes, nada de tráfego, conteúdo, conversão ou receita. |
| `"Analytics"` na Sidebar | `src/components/sidebar/Sidebar.tsx` | 🟡 Label de botão dentro de um array estático (`items`); o `<button>` não tem `onClick`, não navega para lugar nenhum. Decorativo. |
| `ExecutionHistoryPanel.tsx`, `ActivityFeed.tsx` | `src/components/history/`, `src/components/` | 🟡 Componentes com nome que sugere dado real ("Histórico de Execuções", "Atividade em Tempo Real"), mas ambos renderizam um texto fixo de estado vazio ("Nenhuma execução registrada.", "Nenhuma atividade registrada.") — **não consultam** `ExecutionHistory` nem assinam o `EventBus`, apesar de ambos existirem e serem funcionais (`src/core/history/ExecutionHistory.ts`, `src/core/events/EventBus.ts`). |
| `src/components/dashboard/*` (8 subpastas: `cards`, `center`, `footer`, `header`, `history`, `logs`, `rightpanel`, `sidebar`) | `src/components/dashboard/` | ⚪ **Correção a um achado de Sprint anterior:** `docs/PLATFORM_VISION.md` §5 e `docs/03-DASHBOARD_V2.md` citam esta pasta como a "base visual já existente, parcialmente" do Dashboard. Investigando agora com `find -type f`, confirmei que **as 8 subpastas estão inteiramente vazias — zero arquivos.** O UI que de fato existe e roda (`KpiCards`, `Sidebar`, `RightPanel`, `AgentPanel`, `ActivityFeed`, `ExecutionHistoryPanel`, `StatusBar`, `BottomPanel`, `Header`, `ScenePanel`) vive em `src/components/{cards,sidebar,rightpanel,history,bottom,header,center,scene}/` e em arquivos soltos na raiz de `src/components/` — uma árvore paralela, não a `dashboard/`. Não corrigi os dois documentos anteriores (fora do escopo desta Sprint), mas registro aqui para não repetir a imprecisão. |
| Google Analytics real (SDK, API, `gtag`, GA4, `Measurement`, `PageView`, `Conversion`) | — | ⚪ **Nenhuma ocorrência em todo `src/`.** Nenhum vestígio, nem vocabulário reservado — diferente de SEO, que ao menos tinha `GOOGLE_ANALYZED` como nome de evento; aqui nem isso existe fora do que já foi listado acima. |

**Conclusão da investigação:** o módulo Analytics tem a base estrutural mais completa dos três módulos documentados até agora (`src/modules/analytics/` já segue o contrato `IModule` corretamente) e é o primeiro caso em que encontrei um pedaço de UI genuinamente funcional (`AgentStore` + o card "Agentes" do `KpiCards.tsx`) — mas é também o primeiro caso de um componente que **mistura dado real e dado inventado lado a lado sem nenhuma distinção visual**, o que é precisamente o tipo de armadilha que esta Sprint pediu para não presumir.

---

## Capítulo 1 — Visão Geral

**O que é:** o módulo Analytics é o sistema que recebe dado de todos os outros módulos do Growth Hub (e de módulos do Business Hub, como CRM e Financeiro) e os transforma em indicadores, relatórios e recomendações acionáveis — o ponto único de verdade sobre "o que está funcionando" na operação de crescimento da Empresa.

**Objetivos:** ver Capítulo 2.

**Escopo:** centralização de KPIs (§5), consolidação de dado vindo de múltiplas Fontes de Dados (§4), geração de Relatórios (§7), detecção de Insights/Alertas (§3), e o fornecimento desses dados ao Dashboard (§10).

**Benefícios:**
- Ponto único de verdade — em vez de cada módulo (Blog, SEO, Ads) mostrar seu próprio número isolado, o Analytics cruza tudo.
- Decisão orientada por dado consolidado, não por sensação ou número solto.
- Detecção de problema (queda de conversão, evento duplicado, dado incompleto) antes que vire prejuízo maior.

**Problemas que resolve:**
- Fragmentação de métricas entre módulos — resolvido ao centralizar em um único lugar (§3, "Visão Geral").
- Falta de contexto histórico — um número isolado ("42 leads") não diz se é bom ou ruim; Comparações (§3, §7) resolvem isso.
- Decisões tardias — Alertas (§3, §10) antecipam problemas em vez de esperar um relatório mensal revelar a queda.

**Limites:**
- O Analytics não produz dado primário — ele consome o que Blog, SEO, Ads, CRM e Financeiro já geraram (§4). Sem essas fontes, não há o que analisar.
- O Analytics não decide ação sozinho — Insights (§3) são recomendação, não execução automática (isso seria Automação, Operations Hub).
- O Analytics não substitui o Google Analytics real como ferramenta de coleta bruta — ele consome esse dado via integração (§9), não reimplementa o rastreamento.

---

## Capítulo 2 — Objetivos

- **Centralizar indicadores** — um único lugar para ver o desempenho de todo o Growth Hub, em vez de módulo por módulo.
- **Analisar crescimento** — tendência ao longo do tempo, não só o número do momento.
- **Identificar oportunidades** — sinais no dado que apontam para onde investir a seguir.
- **Monitorar desempenho** — acompanhamento contínuo de todos os KPIs (§5) definidos.
- **Detectar problemas** — quedas, anomalias e erros de coleta, antes que se tornem prejuízo maior.
- **Apoiar decisões** — todo dado exposto deve levar a uma decisão possível, não ser só um número informativo.

---

## Capítulo 3 — Estrutura

Componentes funcionais do módulo — todos ⚪ Planejado, exceto onde indicado (ver "Nota metodológica" acima):

| Componente | Função |
|---|---|
| **Visão Geral** | Painel-resumo consolidado de todo o módulo — o equivalente analítico ao Painel Principal já descrito para o Blog. |
| **Painéis** | Agrupamentos de indicadores organizados por tema (tráfego, conteúdo, conversão, receita). |
| **Relatórios** | Ver Capítulo 7. |
| **KPIs** | Ver Capítulo 5. |
| **Eventos** | Ver Capítulo 6. |
| **Conversões** | Rastreamento de quando um visitante completa a ação desejada. |
| **Funis** | Visualização das etapas entre a primeira visita e a Conversão, mostrando onde há maior perda. |
| **Campanhas** | Desempenho consolidado de Google Ads, Meta Ads e Pinterest Ads lado a lado. |
| **Conteúdo** | Desempenho por artigo/página, cruzando com o catálogo do Blog. |
| **SEO** | Desempenho orgânico, consumindo o Monitoramento já definido em `docs/requirements/growth/SEO.md` §10. |
| **Receita** | Consolidação financeira atribuível ao Growth Hub — cruza com o módulo Financeiro (Business Hub). |
| **Alertas** | Sinalização ativa de anomalia — ver §10. |
| **Insights** | Recomendação gerada a partir do cruzamento de dado — o produto final mais valioso do módulo. |
| **Comparações** | Contraste entre períodos (mês a mês, ano a ano) ou entre campanhas/conteúdos. |
| **Exportação** | Extração do dado para uso fora da plataforma (planilha, relatório em PDF). |
| **Configurações** | Parâmetros do módulo — quais fontes estão ativas, frequência de atualização, limites de Alerta. |

---

## Capítulo 4 — Fontes de Dados

Cada fonte tem uma responsabilidade específica e não sobreposta — todas ⚪ Planejado como integração real (ver Capítulo 9 para o mapa completo):

| Fonte | Responsabilidade |
|---|---|
| **Blog** | Desempenho por artigo — visualizações, tempo de leitura, taxa de rejeição por conteúdo. |
| **SEO** | Posição, impressões, cliques, cobertura de indexação (já definidos em `docs/requirements/growth/SEO.md` §10 — o Analytics consome, não redefine). |
| **Google Analytics** | Comportamento de navegação — sessões, usuários, funis, engajamento. |
| **Search Console** | Dado de busca real — mesma fonte já usada pelo SEO, mas aqui cruzada com as demais para visão consolidada. |
| **Google Ads** | Desempenho de campanhas pagas Google — CPC, impressões, conversões pagas. |
| **Meta Ads** | Mesma função, para campanhas Meta. |
| **Pinterest** | Desempenho orgânico e pago em Pinterest. |
| **CRM** | Quantos Leads/Clientes foram originados por cada canal — fecha o loop entre tráfego e negócio real. |
| **Financeiro** | Receita e custo reais, para calcular ROI/ROAS/CAC/LTV (§5) com precisão financeira, não estimativa. |
| **Dashboard** | Não é uma fonte, é o destino — recebe o resultado já processado pelo Analytics (§10). |

---

## Capítulo 5 — KPIs

Todos ⚪ Planejado:

| KPI | Definição |
|---|---|
| **Usuários** | Visitantes únicos em um período. |
| **Sessões** | Visitas totais, incluindo retornos. |
| **Visualizações** | Total de páginas/telas vistas. |
| **CTR** | Percentual de impressão que virou clique. |
| **Conversões** | Total de ações desejadas completadas. |
| **Leads** | Quantidade de Leads gerados, de qualquer origem. |
| **Receita** | Valor financeiro total atribuível ao Growth Hub. |
| **ROI** | Retorno total dividido pelo investimento total. |
| **ROAS** | Receita de mídia paga dividida pelo gasto em mídia. |
| **CAC** | Custo de aquisição por Cliente. |
| **LTV** | Receita total esperada de um Cliente ao longo do relacionamento. |
| **RPM** | Receita a cada mil impressões/visualizações (relevante para AdSense). |
| **Tempo médio** | Duração média de sessão/leitura. |
| **Engajamento** | Nível de interação com o conteúdo (rolagem, cliques internos, tempo ativo). |
| **Taxa de rejeição** | Percentual de visitas que saem sem interagir. |
| **Conteúdo atualizado** | Quantidade de conteúdo revisado em um período (cruza com `docs/requirements/growth/BLOG.md` §11). |
| **Posição média** | Ranqueamento médio em busca (mesma definição de `docs/requirements/growth/SEO.md` §12, consumida aqui). |
| **Impressões** | Quantas vezes o conteúdo/anúncio foi exibido. |
| **Cliques** | Volume absoluto de cliques. |

**Nota:** o único dado hoje genuinamente "ao vivo" em toda a plataforma relacionado a qualquer um destes KPIs é a contagem de Agentes (`AgentStore.totalAgents()`, ver "Nota metodológica") — e nenhum dos 19 KPIs acima é sobre Agentes. Ou seja: **nenhum destes KPIs tem hoje qualquer precedente real de cálculo.**

---

## Capítulo 6 — Eventos

O Analytics depende de eventos para saber o que aconteceu na plataforma, sem precisar perguntar ativamente a cada módulo. Todos ⚪ Planejado como fluxo real — o vocabulário já existe parcialmente (ver "Nota metodológica"):

- **Eventos internos** — originados dentro da própria plataforma (ex.: `LEAD_RECEIVED`, `SALE_COMPLETED`, já declarados em `EventTypes.ts` sob o grupo `// CRM`, nunca emitidos ainda).
- **Eventos externos** — originados por integrações (ex.: um clique reportado pelo Google Ads) — chegam à plataforma através de um Connector, nunca diretamente.
- **Eventos do Runtime** — sinais de ciclo de vida da própria plataforma (ex.: falha de execução) — relevantes para Confiabilidade (§14), não para KPI de negócio.
- **Eventos dos módulos** — cada módulo publica seus próprios eventos de domínio (`AnalyticsEventTypes`, `BlogEventTypes`, `CrmEventTypes` — todos já existem como *definição de tipo*, nunca como emissão real, mesmo padrão descrito em `docs/02-SYSTEM_ARCHITECTURE.md` §10).
- **Eventos dos conectores** — sinalizam sucesso/falha de uma chamada externa (ex.: falha ao consultar Google Analytics) — insumo direto para Alertas (§3, §10).

Toda comunicação de evento passa pelo `EventBus` único já existente (`src/core/events/EventBus.ts`) — o Analytics **não cria nenhum barramento próprio**, mesma regra arquitetural fixa desde a Sprint 7.2 (`docs/02-SYSTEM_ARCHITECTURE.md` §10).

---

## Capítulo 7 — Relatórios

Todos ⚪ Planejado:

- **Diário** — resumo do dia anterior, para acompanhamento de rotina.
- **Semanal** — visão de tendência de curto prazo.
- **Mensal** — visão de tendência de médio prazo, base de decisão de orçamento.
- **Campanhas** — desempenho consolidado de Ads (Google/Meta/Pinterest, §4).
- **Conteúdo** — desempenho do catálogo do Blog.
- **SEO** — consolidação do que já é monitorado em `docs/requirements/growth/SEO.md` §10.
- **Monetização** — receita por canal (AdSense, afiliados, vendas originadas).
- **Comparativos** — qualquer um dos relatórios acima, mas contrastado com um período anterior equivalente.

---

## Capítulo 8 — IA

Responsabilidades dos Agentes dentro do módulo Analytics — todos ⚪ Planejado. Existe hoje `AgentType.ANALYTICS` como valor de enum (ver "Nota metodológica"), mas — assim como o "SEO Agent" documentado em `docs/requirements/growth/SEO.md` §8 — não corresponde a nenhuma responsabilidade real das listadas abaixo.

- **CEO Agent** — consome Insights e Relatórios consolidados (§7) para decisão de alto nível; não opera o módulo diretamente.
- **Marketing Agent** — usa Oportunidades/Insights para redirecionar Planejamento (`docs/requirements/growth/GROWTH_HUB.md` §4).
- **SEO Agent** — consome Analytics para validar se Otimizações (`docs/requirements/growth/SEO.md` §7) realmente melhoraram resultado.
- **Publisher Agent** — recebe sinal de Conteúdo (§3) com baixo desempenho, candidato a Atualização.
- **Finance Agent** — consome Receita/ROI/ROAS/CAC/LTV (§5) para reconciliar com o Financeiro real (Business Hub).
- **CRM Agent** — consome Leads/Conversões (§5) para priorizar atendimento por canal de origem.
- **Analytics Agent** — dono do módulo: processa as Fontes de Dados (§4), calcula os KPIs (§5), gera Relatórios (§7), Insights e Alertas (§3, §10).

---

## Capítulo 9 — Integrações

Todas ⚪ Planejado.

| Integração | Papel no módulo Analytics |
|---|---|
| **Google Analytics** | Fonte primária de comportamento de navegação (§4) — a integração mais central deste módulo, e também a que tem **zero** precedente de código (nem vocabulário), diferente de Search Console/AdSense que ao menos aparecem como nome de evento em outros módulos. |
| **Blog** | Fornece dado de Conteúdo (§3, §4). |
| **SEO** | Fornece dado de posição/indexação já monitorado (`docs/requirements/growth/SEO.md` §10). |
| **Search Console** | Mesma fonte usada pelo SEO, consumida aqui de forma consolidada. |
| **Google Ads** | Fornece dado de Campanhas pagas (§3, §4). |
| **Meta Ads** | Mesma função, para Meta. |
| **Pinterest** | Fornece dado orgânico e pago de Pinterest. |
| **CRM** | Fornece Leads/Conversões (§4). |
| **Financeiro** | Fornece Receita real (§4) — necessário para KPIs financeiros precisos (§5). |
| **Claude / OpenAI / Gemini** | Provedores de IA que sustentam o Analytics Agent (§8) na geração de Insights — mesmo precedente parcial já documentado em `docs/requirements/growth/BLOG.md` §7 e `SEO.md` §9 (`AIProviderFactory.ts`), sem nenhum uso específico de Analytics até hoje. |

---

## Capítulo 10 — Dashboard

Como o Analytics alimenta o Dashboard (`docs/03-DASHBOARD_V2.md`) — ⚪ Planejado como fluxo real, com um esclarecimento importante sobre o que já existe hoje:

- **Sidebar** — entrada "Analytics" já aparece hoje como rótulo estático em `src/components/sidebar/Sidebar.tsx` (🟡 — sem `onClick`, sem navegação real).
- **Widgets** — nenhum widget de Analytics existe hoje. O componente mais próximo, `KpiCards.tsx` (🟡, ver "Nota metodológica"), mistura um dado real (contagem de Agentes) com cinco dados inventados — **não deve ser reaproveitado como está** quando a implementação real começar, exatamente por essa mistura.
- **Painel Direito** — receberia Leads, Receita e Campanhas consolidadas (já és definido de forma geral em `docs/requirements/growth/GROWTH_HUB.md` §8); hoje o `RightPanel.tsx` real mostra apenas uma lista estática de status de agente (não Analytics).
- **Barra Inferior** — receberia KPIs de saúde operacional (ex.: eventos processados); hoje `StatusBar.tsx`/`BottomPanel.tsx` existem como componentes, mas — mesmo padrão do restante desta investigação — precisam ser auditados individualmente antes de qualquer reaproveitamento (não abertos nesta Sprint, fora do escopo do módulo Analytics).
- **Alertas** — dependem inteiramente de Eventos reais (§6), hoje inexistentes.
- **Comparativos** — dependem de Relatórios (§7) armazenados historicamente, hoje inexistentes.

**Correção registrada nesta Sprint:** `docs/PLATFORM_VISION.md` §5 e `docs/03-DASHBOARD_V2.md` citam `src/components/dashboard/` como a base visual "já existente, parcialmente". A investigação desta Sprint (ver "Nota metodológica") confirmou que essa pasta está **inteiramente vazia** — o UI real e funcional (ainda que majoritariamente mockado) vive em outra árvore de pastas. Não é uma contradição grave, mas é uma imprecisão a ter em mente: a "base visual existente" citada nos dois documentos anteriores não é `src/components/dashboard/`, e sim `src/components/{cards,sidebar,rightpanel,history,bottom,header,center,scene}/` e arquivos soltos em `src/components/`.

---

## Capítulo 11 — Permissões

Papéis específicos ao módulo Analytics — ⚪ Planejado:

| Papel | Acesso típico |
|---|---|
| **Administrador** | Acesso total — configurações, fontes de dado ativas, exportação. |
| **CEO** | Leitura consolidada de Relatórios e Insights (§7, §3); não configura fontes de dado. |
| **Marketing** | Leitura de Campanhas, Conteúdo, Funis; usa Insights para redirecionar Planejamento. |
| **SEO** | Leitura da seção SEO (§3) consolidada; mesmo dado já visível no próprio módulo SEO. |
| **Financeiro** | Leitura de Receita, ROI, ROAS, CAC, LTV (§5); sem acesso às demais seções operacionais. |
| **Analista** | Acesso amplo de leitura a todo o módulo — é o papel mais próximo do "dono" funcional do dia a dia do Analytics, sem ser Administrador. |

---

## Capítulo 12 — Roadmap

| Fase | Foco |
|---|---|
| **Fase 1 — Coleta de Dados** | Conectar as Fontes de Dados (§4) uma a uma, começando pelas que já têm precedente de vocabulário (Search Console/Google Ads, via os eventos `*_ANALYZED` já declarados) — sem cálculo de KPI ainda, só ingestão. |
| **Fase 2 — KPIs** | Cálculo real dos 19 indicadores do Capítulo 5 sobre o dado já coletado — só aqui `KpiCards.tsx` (§10) deveria deixar de ter números hardcoded. |
| **Fase 3 — Dashboards** | Painéis (§3) organizando os KPIs já calculados por tema. |
| **Fase 4 — Relatórios** | Consolidação periódica (§7) sobre os Dashboards já funcionais. |
| **Fase 5 — Insights** | Primeira camada de recomendação automática, cruzando dado de múltiplas Fontes. |
| **Fase 6 — IA** | Analytics Agent (§8) assumindo Insights de forma cada vez mais autônoma, e os demais Agentes consumindo o módulo já maduro. |

Diferente do SEO (que partia de zero absoluto de lógica), o Analytics tem uma vantagem real de ponto de partida: `src/modules/analytics/` já segue o contrato `IModule` corretamente, e o padrão `AgentStore` (`src/core/store/AgentStore.ts`) já prova que um store reativo real, alimentando um card de KPI, funciona nesta base de código — mesmo que hoje meça só Agentes.

---

## Capítulo 13 — Dependências

| Dependência | Natureza |
|---|---|
| **Growth Hub** | O Analytics é um módulo deste Hub. |
| **Blog** | Fonte de dado de Conteúdo (§4). |
| **SEO** | Fonte de dado de busca orgânica (§4). |
| **Search Console** | Fonte de dado de indexação/posição. |
| **Google Ads** | Fonte de dado de mídia paga Google. |
| **Meta Ads** | Fonte de dado de mídia paga Meta. |
| **Pinterest** | Fonte de dado orgânico/pago Pinterest. |
| **CRM** | Fonte de dado de Leads/Conversões. |
| **Financeiro** | Fonte de dado de Receita real. |
| **Integration Hub** | Portão obrigatório para toda integração externa do Capítulo 9. |
| **AI Hub** | Sustenta o Analytics Agent e os demais Agentes do Capítulo 8. |

---

## Capítulo 14 — Melhores Práticas

- **Baixo acoplamento** — o Analytics consome dado de cada Fonte (§4) via contrato, nunca lendo o estado interno de outro módulo diretamente.
- **Observabilidade** — o próprio módulo é a camada de observabilidade da plataforma (Missão) — por isso, ele mesmo precisa ser o mais rastreável de todos: todo KPI deve ser rastreável até o Evento/Fonte que o originou.
- **Eventos** — toda ingestão de dado deve ser orientada a evento (§6), nunca a consulta ativa e repetida às fontes.
- **Automação** — geração de Relatórios (§7) recorrentes deve ser um Workflow (Operations Hub), não uma ação manual.
- **Escalabilidade** — uma nova Fonte de Dados (§4) deve poder ser adicionada sem alterar o cálculo dos KPIs já existentes.
- **Confiabilidade** — como o Analytics é a base de toda decisão (Missão), dado incorreto aqui é pior do que dado ausente — ver Riscos (§15).

---

## Capítulo 15 — Riscos

- **Dados incompletos** — uma Fonte de Dados fora do ar ou mal configurada gera KPI parcial, que pode ser mal interpretado como o total real.
- **Mudanças nas APIs** — Google Analytics, Search Console e as demais integrações mudam formato de dado sem aviso.
- **Eventos duplicados** — sem controle de idempotência, o mesmo Evento (§6) processado duas vezes infla artificialmente um KPI.
- **Consentimento LGPD** — coleta de comportamento de navegação depende de consentimento explícito do usuário final, antes mesmo de chegar ao Analytics.
- **Privacidade** — dado agregado ainda pode expor informação sensível se cruzado de forma imprudente entre Fontes.
- **Amostragem** — algumas fontes (ex.: Google Analytics em alto volume) reportam dado amostrado, não exato — um Relatório (§7) que não deixa isso claro pode levar a decisão equivocada.
- **Perda de dados** — falha na ingestão de um período sem re-processamento posterior cria uma lacuna permanente na série histórica, prejudicando Comparações (§3, §7).

---

## Capítulo 16 — Visão Futura

- **Analytics Preditivo** — projeção de tendência futura, não só leitura do passado.
- **Detecção automática de anomalias** — identificar uma queda/pico fora do padrão sem que um humano precise definir o limite manualmente.
- **Recomendações por IA** — Insights (§3) cada vez mais específicos e priorizados por impacto esperado, mesma direção já registrada para SEO (`docs/requirements/growth/SEO.md` §18).
- **Relatórios inteligentes** — geração de texto explicativo junto ao dado numérico (não só gráfico/tabela), produzido pelo Analytics Agent.
- **Comparações automáticas** — o próprio módulo sugerindo qual comparação é relevante (ex.: "este mês está performando 20% acima da média dos últimos 6"), sem o usuário precisar configurar.
- **Alertas inteligentes** — limites de Alerta (§10) ajustados automaticamente ao padrão histórico de cada Empresa, em vez de um limite fixo igual para todas.

---

## Capítulo 17 — Glossário

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
