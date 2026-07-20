# GOOGLE ADS — Especificação Funcional do Módulo

**Andreia AI Platform** · Growth Hub
Documentação funcional do módulo Google Ads — o sexto módulo do Growth Hub a ser especificado em detalhe.

Este documento é uma **especificação funcional**, não uma implementação. Relaciona-se com `docs/requirements/growth/GROWTH_HUB.md` (Google Ads é um dos 18 módulos ali listados) e com `docs/05-ECOSYSTEM_MAP.md` Capítulo 5, que já esboçou o fluxo geral `Campanha → Landing Page → Conversão → CRM → Financeiro → Analytics → Dashboard`.

**Legenda usada em todo o documento (quatro níveis):**
- 🟢 **Implementado** — lógica real, funcional, executável hoje.
- 🟡 **Estrutura** — existe código real (uma classe, um scaffold), mas sem lógica de negócio completa por trás.
- 🔷 **Vocabulário** — existe apenas um nome, string ou valor de enum declarado — sem nenhuma estrutura ao redor.
- ⚪ **Planejado** — não existe nenhum vestígio no código; é direção de design.

---

## Missão do módulo

O Google Ads **não é** tratado como uma API. É o **Centro Inteligente de Aquisição de Tráfego Pago**, cujo objetivo é transformar orçamento em crescimento sustentável.

---

## Capítulo 1 — Visão Geral

**O que é:** o módulo Google Ads é a camada da plataforma responsável por planejar, executar e otimizar campanhas de mídia paga na rede do Google (Pesquisa, Display, Shopping, Vídeo, Performance Max, Discovery, Remarketing — §4), sempre sob controle explícito de orçamento e aprovação humana antes de qualquer gasto real.

**Objetivos:** gerar Conversões (§5) mensuráveis a partir de investimento controlado, otimizar continuamente CPA/CPC/CTR/ROAS (§5), e alimentar o restante do Growth Hub (CRM, Financeiro, Analytics) com dado confiável de origem paga.

**Escopo:** gestão de Campanhas por tipo (§4), Grupos de anúncios, Palavras-chave, Orçamento e Lances, rastreamento de Conversões, segmentação de Públicos, gestão de Criativos, e Otimização contínua (§5).

**Benefícios:**
- Aquisição de tráfego previsível e escalável, complementar ao crescimento orgânico (SEO, Blog) — mais rápida de ativar, mas com custo direto.
- Medição precisa de retorno (ROAS, CPA) em vez de gasto de mídia "no escuro".
- Decisão de orçamento apoiada em dado real de Conversão cruzado com CRM/Financeiro, não em estimativa.

**Problemas que resolve:**
- Gasto de mídia sem controle de orçamento ou sem checkpoint de aprovação humana antes de ir ao ar (mesma regra já fixada em `docs/requirements/growth/GROWTH_HUB.md` §7).
- Campanhas mal segmentadas, gerando clique caro sem Conversão correspondente.
- Falta de retroalimentação entre o que a campanha promete (Conversão) e o que de fato acontece depois (Lead, Cliente, Venda — Business Hub).

**Limites:**
- O Google Ads não decide orçamento total da Empresa — isso é decisão de negócio, aprovada fora do módulo (Operations Hub, Aprovações).
- O Google Ads não produz o criativo/conteúdo do zero — consome ativos já produzidos (Blog, Designer Agent) ou os adapta para o formato de anúncio.
- O Google Ads não substitui o CRM como sistema de gestão de Lead — apenas origina e rotula a Conversão que o CRM processa.

---

## Capítulo 2 — Precedentes Reais da Implementação

Antes de escrever, auditei o repositório inteiro pelos termos pedidos: `Google Ads`, `Ads`, `Campaign`, `Campaigns`, `Ad Group`, `Keyword`, `Keywords`, `Conversion`, `Conversions`, `Bid`, `Bidding`, `Budget`, `CPC`, `CPA`, `ROAS`, `Performance Max`, `PMax`, `Remarketing`, `Audience`, `Audience Signals`, `Google`, `GCLID`, `UTM`. Busquei cada termo isoladamente em todo `src/`.

### 🟢 Código funcional

**Nenhum.**

### 🟡 Estruturas

**Nenhuma.** Não existe `src/modules/google-ads` nem qualquer scaffold equivalente — mesma situação de Search Console e AdSense, diferente de Analytics (que tem `src/modules/analytics/` completo).

### 🔷 Vocabulário

Um único item:

| Achado | Onde | Natureza real |
|---|---|---|
| `GOOGLE_ANALYZED: "GOOGLE_ANALYZED"` (grupo `// Traffic`) | `src/core/events/EventTypes.ts` | Mesmo nome de evento genérico já registrado em `docs/requirements/growth/SEO.md`, `ANALYTICS.md`, `SEARCH_CONSOLE.md` e `ADSENSE.md` — nunca emitido nem assinado. `docs/requirements/growth/SEARCH_CONSOLE.md` já havia observado explicitamente que este nome "poderia igualmente servir Google Ads" — ou seja, este é, dos cinco módulos já documentados, um dos destinos mais plausíveis (junto com SEO, Search Console e Analytics) para este evento genérico, ainda que nenhum seja o dono inequívoco dele. |

### ⚪ Funcionalidades inexistentes

Todo o restante, sem exceção — confirmado termo a termo, incluindo os mais específicos deste módulo:

- `Campaign`/`Campaigns`, `Ad Group`, `Keyword`/`Keywords`, `Conversion`/`Conversions`, `Bid`/`Bidding`, `Budget`, `CPC`, `CPA`, `ROAS`, `Performance Max`/`PMax`, `Remarketing`, `Audience`, `GCLID`, `UTM`/`utm_` — **zero ocorrências em todo `src/`**, nenhuma delas.
- Nenhum valor de `AgentType` correspondente.
- Nenhuma menção em componente visual mockado (`Sidebar.tsx`, `AgentPanel.tsx`, `RightPanel.tsx`, `KpiCards.tsx`).
- Nenhuma pasta, arquivo, enum, mock ou componente dedicado.

### Resumo

| Categoria | Existe para Google Ads? |
|---|---|
| Arquivos | Nenhum |
| Pastas | Nenhuma |
| Eventos | Nenhum específico (só o genérico `GOOGLE_ANALYZED`, compartilhado com outros 4 módulos) |
| Enums | Nenhum |
| Mocks | Nenhum |
| Componentes | Nenhum |

### Conclusão objetiva

O módulo Google Ads não tem nenhum precedente estrutural ou funcional — apenas o mesmo evento genérico já compartilhado por quatro outros módulos documentados nesta série. Em termos de vocabulário, está em posição intermediária: mais plausível que a atribuição feita para AdSense (onde `docs/requirements/growth/ADSENSE.md` já qualificou a atribuição como "um estiramento"), mas sem nenhuma estrutura própria como a de Analytics. A comparação completa com os cinco módulos anteriores está na entrega desta Sprint (item 13, fora deste documento).

---

## Capítulo 3 — Estrutura

Componentes funcionais do módulo — todos ⚪ Planejado (ver Capítulo 2):

| Componente | Função |
|---|---|
| **Visão Geral** | Painel-resumo consolidado do módulo. |
| **Campanhas** | Unidade principal de organização — cada Campanha tem um objetivo, tipo (§4) e orçamento próprio. |
| **Grupos de anúncios** | Subdivisão de uma Campanha por tema/público, agrupando Palavras-chave e Criativos relacionados. |
| **Palavras-chave** | Termos que disparam a exibição do anúncio (em Campanhas de Pesquisa) — compartilha vocabulário com Keyword Research (`docs/requirements/growth/SEO.md` §4), mas aqui aplicado à mídia paga. |
| **Orçamento** | Limite de gasto definido por Campanha/período — ponto central de controle e Governança (§13). |
| **Lances** | Estratégia de quanto pagar por clique/conversão — manual ou automatizada. |
| **Conversões** | Ver Capítulo 5. |
| **Públicos** | Segmentação de quem vê o anúncio — demográfico, comportamental, ou Remarketing (§4). |
| **Criativos** | Os ativos de anúncio em si (texto, imagem, vídeo) — frequentemente adaptados de Conteúdo já produzido pelo Blog/Designer Agent. |
| **Performance Max** | Tipo de campanha automatizada que otimiza entre todos os inventários do Google a partir de um objetivo único — ver §4. |
| **Remarketing** | Campanhas direcionadas a quem já interagiu com a Empresa antes — ver §4. |
| **Relatórios** | Consolidação periódica do dado deste módulo. |
| **Alertas** | Ver Capítulo 8. |
| **Oportunidades** | Recomendações acionáveis de ajuste de Campanha/Palavra-chave/Orçamento. |
| **Configurações** | Parâmetros do módulo — conta Google Ads conectada, limites de Orçamento, regras de Aprovação. |

---

## Capítulo 4 — Gestão de Campanhas

Tipos de campanha suportados — todos ⚪ Planejado:

- **Pesquisa** — anúncios de texto exibidos nos resultados de busca do Google, disparados por Palavras-chave.
- **Display** — anúncios visuais exibidos na rede de sites parceiros do Google.
- **Shopping** — anúncios de produto, com imagem/preço, direcionados a intenção de compra.
- **Vídeo** — anúncios exibidos no YouTube e rede de vídeo do Google.
- **Performance Max** — campanha automatizada única que otimiza entre todos os formatos/inventários acima, a partir de um objetivo de negócio definido.
- **Discovery** — anúncios visuais em feeds do Google (Gmail, Discover), fora do momento de busca ativa.
- **Remarketing** — não é um tipo de campanha isolado, mas uma estratégia de Público aplicável a Pesquisa/Display/Vídeo, direcionada a quem já visitou o site/interagiu antes.

---

## Capítulo 5 — Otimização

Todos ⚪ Planejado:

- **CPA** (Custo por Aquisição) — quanto custa, em média, cada Conversão.
- **CPC** (Custo por Clique) — quanto custa, em média, cada clique.
- **CTR** — taxa de clique nos anúncios exibidos.
- **ROAS** — receita gerada dividida pelo gasto em mídia.
- **Conversões** — ação de negócio completada como resultado do anúncio (Lead, Venda, Cadastro) — cruza diretamente com CRM.
- **Palavras-chave** — ajuste contínuo de quais termos geram retorno e quais devem ser pausados/negativados.
- **Termos de pesquisa** — os termos reais que dispararam o anúncio (frequentemente diferentes das Palavras-chave configuradas), usados para refinar segmentação.
- **Qualidade** — o índice de relevância do Google (Quality Score, §9) entre anúncio, palavra-chave e página de destino — afeta diretamente o custo por clique.
- **Orçamento** — redistribuição entre Campanhas com base em desempenho relativo.

---

## Capítulo 6 — IA

Responsabilidades dos Agentes dentro do módulo Google Ads — todos ⚪ Planejado, sem nenhum precedente (ver Capítulo 2). Somente responsabilidades, sem implementação:

- **CEO Agent** — consome Relatórios consolidados (§3) de investimento/retorno para decisão de alto nível; aprova mudanças de maior impacto em Orçamento.
- **Marketing Agent** — dono do Planejamento de Campanhas (§4), alinhado ao objetivo de negócio do período.
- **Analytics Agent** — cruza Conversões (§5) com o restante da medição consolidada (`docs/requirements/growth/ANALYTICS.md` §4).
- **Finance Agent** — reconcilia investimento em mídia e receita atribuída com o Financeiro real (Business Hub) — mesma fronteira já descrita nos módulos anteriores.
- **SEO Agent** — compartilha dado de Palavras-chave (§3) com o Google Ads: o que já performa bem no orgânico pode informar teste pago, e vice-versa (mesmo princípio de `docs/requirements/growth/GROWTH_HUB.md` §6).
- **Content Strategist** — adapta Conteúdo já existente (Blog) em Criativos (§3) para as Campanhas.
- **Media Buyer** — papel novo, específico deste módulo: dono da execução tática de Lances, Orçamento e Otimização (§5) dia a dia — diferente do Marketing Agent, que decide estratégia, o Media Buyer opera os parâmetros técnicos da campanha em si. Sempre sujeito a checkpoint de Aprovação humana antes de qualquer mudança que amplie gasto (mesma regra de `docs/requirements/growth/GROWTH_HUB.md` §7).

---

## Capítulo 7 — Integrações

Todas ⚪ Planejado.

| Integração | Papel no módulo Google Ads |
|---|---|
| **Analytics** | Consome Conversões/ROAS (§5) como uma das Fontes de Dados (`docs/requirements/growth/ANALYTICS.md` §4). |
| **Search Console** | Compartilha dado de Palavras-chave/Termos de pesquisa entre orgânico e pago (§5), mesmo princípio já citado em `docs/requirements/growth/SEARCH_CONSOLE.md` §8. |
| **CRM** | Recebe toda Conversão gerada como Lead — fronteira direta com o Business Hub, mesmo padrão de todos os módulos de Growth já documentados. |
| **Financeiro** | Recebe o investimento (custo de mídia) e a Receita atribuída, para cálculo real de ROI/ROAS. |
| **Google Ads** | A própria fonte de dado e canal de execução — a integração central deste módulo, hoje com zero precedente de código (Capítulo 2). |
| **Blog** | Fonte de Conteúdo a ser adaptado em Criativos (§3) e de Landing Pages associadas a Campanhas. |
| **SEO** | Compartilha estratégia de Palavras-chave (§5) — mesma colaboração já formalizada entre Blog e SEO em `docs/requirements/growth/BLOG.md` §8, aqui estendida à mídia paga. |
| **Claude / OpenAI / Gemini** | Provedores de IA que sustentam o Media Buyer e o Content Strategist (§6) na geração de Criativos e Otimização de Lances — mesmo precedente parcial já documentado nos módulos anteriores (`AIProviderFactory.ts`), sem nenhum uso específico deste módulo até hoje. |

---

## Capítulo 8 — Dashboard

O que o módulo Google Ads envia ao Dashboard (`docs/03-DASHBOARD_V2.md`) — ⚪ Planejado, sem nenhum precedente de UI (ver Capítulo 2):

- **Campanhas** — status e investimento das Campanhas ativas.
- **Conversões** — volume e tendência.
- **CPA** — custo médio por Conversão, com tendência.
- **ROAS** — retorno sobre o investimento em mídia, indicador mais direto de saúde do módulo.
- **Alertas** — estouro de Orçamento (§14), queda brusca de Qualidade/CTR, Campanha pausada automaticamente pelo Google.
- **Oportunidades** — o resultado do Capítulo 5, exibido de forma acionável.
- **Comparativos** — contraste entre períodos ou entre Campanhas, mesmo princípio já usado em `docs/requirements/growth/ANALYTICS.md` §3.

---

## Capítulo 9 — KPIs

Todos ⚪ Planejado:

| KPI | Definição |
|---|---|
| **Investimento** | Valor total gasto em mídia no período. |
| **Conversões** | Total de ações de negócio completadas a partir dos anúncios. |
| **CPA** | Custo médio por Conversão. |
| **CPC** | Custo médio por clique. |
| **CTR** | Taxa de clique nos anúncios exibidos. |
| **ROAS** | Receita gerada dividida pelo Investimento. |
| **Receita** | Valor financeiro total atribuído às Campanhas. |
| **Leads** | Quantidade de Leads originados via Google Ads. |
| **Impressões** | Quantas vezes os anúncios foram exibidos. |
| **Cliques** | Volume absoluto de cliques recebidos. |
| **Quality Score** | Índice de relevância do Google entre anúncio, palavra-chave e página de destino — afeta diretamente o CPC. |

---

## Capítulo 10 — Permissões

Papéis específicos ao módulo Google Ads — ⚪ Planejado:

| Papel | Acesso típico |
|---|---|
| **Administrador** | Acesso total — configurações, conta conectada, limites de Orçamento. |
| **CEO** | Leitura consolidada de investimento/retorno; aprova mudanças de maior impacto em Orçamento. |
| **Marketing** | Planejamento de Campanhas (§4); acompanha KPIs (§9). |
| **Media Buyer** | Acesso operacional completo — Lances, Orçamento, Palavras-chave, Otimização (§5) — sempre sujeito a Aprovação para ampliar gasto. |
| **Financeiro** | Leitura de Investimento, Receita, ROAS; sem acesso operacional às Campanhas em si. |
| **Analista** | Leitura ampla de todo o módulo, sem permissão de alterar configuração. |

---

## Capítulo 11 — Roadmap

| Fase | Foco |
|---|---|
| **Fase 1 — Criação do módulo** | Scaffold sobre `IModule`, sem lógica de negócio — necessário do zero absoluto, por não haver nenhum precedente estrutural (Capítulo 2). |
| **Fase 2 — Painéis** | Visão Geral e Campanhas (§3) sobre a primeira conexão real com a API do Google Ads. |
| **Fase 3 — Relatórios** | Consolidação periódica sobre os Painéis já funcionais. |
| **Fase 4 — Integração com Analytics** | Conversões/ROAS alimentando de fato as Fontes de Dados do Analytics (`docs/requirements/growth/ANALYTICS.md` §4). |
| **Fase 5 — Integração com CRM** | Fechamento do loop completo `Campanha → Conversão → Lead/Cliente` (`docs/05-ECOSYSTEM_MAP.md` Capítulo 5), hoje só documentado. |
| **Fase 6 — IA** | Media Buyer e Marketing Agent (§6) assumindo Otimização (§5) de forma cada vez mais autônoma, sempre com Aprovação humana antes de ampliar gasto. |

---

## Capítulo 12 — Dependências

| Dependência | Natureza |
|---|---|
| **Growth Hub** | O Google Ads é um módulo deste Hub. |
| **Analytics** | Consumidor de Conversões/ROAS (§7). |
| **Search Console** | Compartilha dado de Palavras-chave entre orgânico e pago (§7). |
| **CRM** | Recebe toda Conversão como Lead — dependência mais direta de negócio. |
| **Financeiro** | Recebe Investimento e Receita atribuída. |
| **Integration Hub** | Portão obrigatório para a integração externa com o Google Ads. |
| **AI Hub** | Sustenta os Agentes do Capítulo 6, incluindo o Media Buyer. |

---

## Capítulo 13 — Melhores Práticas

- **Baixo acoplamento** — o Google Ads expõe Conversões para CRM/Financeiro/Analytics via contrato, sem conhecer a implementação interna de nenhum dos três.
- **Observabilidade** — todo Investimento e toda Conversão precisa ser rastreável até a Campanha/Grupo de anúncios/Palavra-chave de origem — sem isso, ROAS (§5, §9) não é confiável.
- **Eventos** — nova Conversão detectada deve disparar evento (mesmo princípio já fixado em `docs/02-SYSTEM_ARCHITECTURE.md` §10), não depender de consulta ativa constante à API.
- **Escalabilidade** — suportar múltiplas Campanhas simultâneas de tipos diferentes (§4) sem alterar a lógica central de Otimização (§5).
- **Controle de custos** — nenhuma mudança que amplie gasto real é aplicada sem passar por Orçamento definido e Aprovação (mesma regra fixa desde `docs/requirements/growth/GROWTH_HUB.md` §7) — este é o princípio mais crítico de todo o módulo.
- **Governança** — toda decisão de Media Buying (manual ou por Agente) precisa ser auditável: quem/o que mudou o quê, quando, e por quê.

---

## Capítulo 14 — Riscos

- **Estouro de orçamento** — falha de controle (humana ou de automação) pode gastar além do definido antes que alguém perceba — o risco mais direto e financeiro de todo o módulo.
- **Conversões incorretas** — rastreamento mal configurado pode contar Conversões que não são reais (ou deixar de contar as que são), distorcendo ROAS e decisão de Orçamento.
- **Mudanças na API** — a API do Google Ads muda formato/comportamento sem aviso, podendo quebrar ingestão ou (pior) execução de Lances/Orçamento.
- **Dependência de mídia paga** — crescimento sustentado apenas por Google Ads é frágil: qualquer mudança de custo de leilão ou política afeta diretamente o resultado, sem o colchão do orgânico (SEO/Blog).
- **Fraudes** — cliques inválidos (bots, concorrência) consomem Orçamento sem gerar Conversão real.
- **LGPD** — Conversões carregam dado pessoal (o Lead capturado); mesmo cuidado de consentimento/finalidade já registrado em `docs/requirements/growth/GROWTH_HUB.md` §13, reforçado aqui porque o rastreamento de anúncio frequentemente depende de cookies/identificadores de terceiro.

---

## Capítulo 15 — Visão Futura

- **Otimização automática** — ajuste contínuo de Lances/Palavras-chave (§5) sem esperar ciclo manual de revisão.
- **Redistribuição inteligente de orçamento** — realocação automática de Orçamento entre Campanhas com base em ROAS relativo em tempo real.
- **Previsão de ROI** — projeção de retorno esperado antes mesmo de uma Campanha ser lançada, com base em histórico da própria Empresa.
- **Campanhas autônomas** — Media Buyer Agent (§6) operando o ciclo completo de uma Campanha de rotina (ex.: Remarketing sazonal recorrente) com Aprovação apenas no lançamento inicial, não em cada ajuste.
- **IA para Media Buying** — decisão de alocação de Orçamento entre Google Ads, Meta Ads e Pinterest Ads (`docs/05-ECOSYSTEM_MAP.md` Capítulos 5-7) de forma unificada, não módulo a módulo isoladamente.

---

## Capítulo 16 — Glossário

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
