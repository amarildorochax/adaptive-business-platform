# ADSENSE — Especificação Funcional do Módulo

**Andreia AI Platform** · Growth Hub
Documentação funcional do módulo AdSense — o quinto módulo do Growth Hub a ser especificado em detalhe.

Este documento é uma **especificação funcional**, não uma implementação. Relaciona-se com `docs/requirements/growth/GROWTH_HUB.md` (Google AdSense é um dos 18 módulos ali listados) e com `docs/requirements/growth/BLOG.md` §9, que já citava AdSense como o canal mais direto de Monetização do conteúdo.

**Legenda usada em todo o documento (quatro níveis, conforme pedido nesta Sprint):**
- 🟢 **Implementado** — lógica real, funcional, executável hoje.
- 🟡 **Parcial** — existe estrutura real no código (uma classe, um scaffold), mas sem lógica de negócio completa por trás.
- 🔷 **Vocabulário** — existe apenas um nome, string ou valor de enum declarado — sem nenhuma estrutura ao redor, mais fraco que Parcial.
- ⚪ **Planejado** — não existe nenhum vestígio no código; é direção de design.

---

## Missão do módulo

O módulo AdSense **não é** apenas uma integração. É o **Centro Inteligente de Monetização**, cujo objetivo é transformar audiência em receita de forma sustentável.

---

## Capítulo 1 — Visão Geral

**O que é:** o módulo AdSense é a camada da plataforma responsável por conectar o tráfego gerado pelo Growth Hub (majoritariamente via Blog) à receita direta de publicidade contextual, através do Google AdSense — e por otimizar essa receita ao longo do tempo sem comprometer a experiência de quem lê o conteúdo.

**Objetivos:** medir Monetização (§4) por artigo/categoria/autor, identificar Otimização (§5) de posicionamento e conteúdo de maior retorno, e reportar tudo de forma consolidada ao Dashboard (§8) e ao módulo Financeiro (Business Hub).

**Escopo:** leitura de receita e métricas de anúncio (RPM, CTR, CPC), análise de desempenho por Página/Artigo/Categoria/Canal, gestão de Experimentos de posicionamento, e recomendação de onde investir esforço editorial para maximizar retorno.

**Benefícios:**
- Visibilidade clara de qual conteúdo efetivamente paga a produção do restante — nem todo artigo gera o mesmo retorno.
- Base objetiva para decidir onde investir esforço de Atualização (`docs/requirements/growth/BLOG.md` §4/§5): conteúdo de alto RPM merece prioridade de manutenção.
- Receita medida e consolidada automaticamente com o Financeiro, sem reconciliação manual.

**Problemas que resolve:**
- Monetização tratada como um número solto, sem relação com qual conteúdo específico a gerou.
- Decisão editorial guiada só por tráfego (Analytics) sem considerar retorno financeiro real — dois artigos com o mesmo tráfego podem ter receita muito diferente.
- Falta de disciplina de teste — sem Experimentos (§5) formais, mudanças de posicionamento de anúncio são feitas (ou não) por intuição.

**Limites:**
- O AdSense não produz conteúdo — apenas mede e recomenda com base no que o Blog já produziu.
- O AdSense não substitui o Financeiro como sistema contábil — apenas alimenta-o com o dado de receita de publicidade.
- O AdSense não decide sozinho mudanças agressivas de posicionamento que afetem experiência do usuário — isso permanece sob supervisão humana (mesmo princípio de Aprovação já aplicado a mídia paga em `docs/requirements/growth/GROWTH_HUB.md` §7).

---

## Capítulo 2 — Precedentes Reais da Implementação

Antes de escrever, auditei o repositório inteiro pelos termos pedidos: `AdSense`, `Google AdSense`, `Ads`, `Advertisement`, `Monetization`, `Revenue`, `RPM`, `CPC`, `CTR`, `Page RPM`, `Impression RPM`, `Ad Unit`, `Ad Slot`, `Publisher`, `Google`. Busquei cada termo isoladamente em todo `src/`, incluindo variações em português (`Receita`, `Monetização`) e checagem de limite de palavra para `Ads`/`Ad` (para não confundir com substrings de outras palavras).

### 🟢 Código funcional

**Nenhum.**

### 🟡 Estruturas

**Nenhuma.** Diferente do módulo Analytics (que já tem `src/modules/analytics/` completo com `IModule`), **não existe nenhum `src/modules/adsense` ou equivalente.** Este módulo não tem nem o scaffold estrutural mais básico já presente em outros módulos do Growth Hub.

### 🔷 Vocabulário

Um único item, e de relevância questionável:

| Achado | Onde | Natureza real |
|---|---|---|
| `GOOGLE_ANALYZED: "GOOGLE_ANALYZED"` (grupo `// Traffic`) | `src/core/events/EventTypes.ts` | Mesmo nome de evento genérico já registrado em `docs/requirements/growth/SEO.md`, `ANALYTICS.md` e `SEARCH_CONSOLE.md` — nunca emitido nem assinado. Aqui a atribuição é ainda mais frágil que nos três documentos anteriores: o nome sugere análise de tráfego/SEO, não publicidade contextual — **atribuí-lo ao módulo AdSense seria um estiramento maior do que já foi feito nos módulos anteriores.** Registro sua existência por completude, não como precedente real deste módulo específico. |

### ⚪ Funcionalidades inexistentes

Todo o restante, sem exceção — confirmado termo a termo:

- `AdSense`/`Adsense`/`adsense`, `Advertisement`, `Monetization`/`Monetização`, `Revenue`/`Receita`, `RPM`, `CPC`, `Ad Unit`, `Ad Slot`, `Publisher` — **zero ocorrências em todo `src/`**, nenhuma delas, nem como comentário isolado.
- `\bAds\b`/`\bAd\b` (com limite de palavra, para não capturar substrings de outras palavras) — **zero ocorrências.**
- Nenhum valor de `AgentType` correspondente (`src/core/agents/registry/AgentTypes.ts` não tem nenhum valor relacionado a AdSense ou publicidade).
- Nenhuma menção em componente visual mockado (`Sidebar.tsx`, `AgentPanel.tsx`, `RightPanel.tsx`, `KpiCards.tsx`) — nenhum deles cita AdSense, receita de anúncio ou qualquer sinônimo.
- Nenhuma pasta, arquivo, enum, mock ou componente dedicado.

### Resumo

| Categoria | Existe para AdSense? |
|---|---|
| Arquivos | Nenhum |
| Pastas | Nenhuma |
| Eventos | Nenhum específico (só o genérico `GOOGLE_ANALYZED`, de atribuição duvidosa) |
| Enums | Nenhum |
| Mocks | Nenhum |
| Componentes | Nenhum |

### Conclusão objetiva

O módulo AdSense é o que tem **menor precedente de todos os cinco módulos do Growth Hub documentados até agora** (Blog, SEO, Analytics, Search Console, AdSense). Enquanto Search Console ao menos tinha um evento genérico plausivelmente atribuível, aqui até essa atribuição é questionável. Não há absolutamente nada — nem estrutural, nem de vocabulário sólido — sobre o qual construir a implementação futura. Toda a especificação abaixo parte de folha em branco.

---

## Capítulo 3 — Estrutura

Componentes funcionais do módulo — todos ⚪ Planejado (ver Capítulo 2):

| Componente | Função |
|---|---|
| **Visão Geral** | Painel-resumo consolidado do módulo. |
| **Receita** | Ver Capítulo 4. |
| **Páginas** | Receita segmentada por página do site. |
| **Artigos** | Receita segmentada por artigo do Blog — o nível de granularidade mais acionável para decisão editorial. |
| **Blocos de anúncios** | Unidades de anúncio configuradas (Ad Units), com desempenho individual. |
| **Posicionamento** | Onde, dentro da página, cada Bloco de anúncio está posicionado — insumo direto de Otimização (§5). |
| **Categorias** | Receita agregada por categoria de conteúdo (mesmo conceito de Categoria já definido em `docs/requirements/growth/BLOG.md` §3). |
| **Canais** | Segmentação de receita por origem de tráfego (orgânico, social, direto) — cruza com Analytics. |
| **Experimentos** | Testes controlados de posicionamento/formato de anúncio, com comparação de resultado. |
| **Alertas** | Ver Capítulo 8. |
| **Oportunidades** | Recomendações acionáveis de onde ajustar para aumentar receita. |
| **Relatórios** | Consolidação periódica do dado deste módulo. |
| **Configurações** | Parâmetros do módulo — conta AdSense conectada, frequência de sincronização, limites de Alerta. |

---

## Capítulo 4 — Monetização

Todos ⚪ Planejado:

- **RPM** (Revenue per Mille) — receita a cada mil visualizações de página, o indicador mais geral de eficiência de monetização.
- **Page RPM** — RPM calculado especificamente por página, permitindo comparação direta entre conteúdos.
- **CTR** — taxa de clique nos anúncios exibidos.
- **CPC** — valor médio recebido por clique em anúncio.
- **Receita** — valor financeiro total gerado no período.
- **Impressões** — quantas vezes um anúncio foi exibido.
- **Cliques** — volume absoluto de cliques em anúncios.
- **Receita por artigo** — a granularidade mais acionável para decisão editorial (§3).
- **Receita por categoria** — visão agregada, útil para planejamento de pauta (`docs/requirements/growth/GROWTH_HUB.md` §5, etapa de Planejamento).
- **Receita por autor** — quando aplicável, relevante para operações com múltiplos redatores/Agentes de conteúdo.

---

## Capítulo 5 — Otimização

Todos ⚪ Planejado:

- **Conteúdo de alto RPM** — identificação do que já monetiza bem, candidato a receber mais investimento editorial (novos artigos relacionados, Atualização prioritária).
- **Conteúdo de baixo RPM** — identificação do que monetiza mal apesar de ter tráfego — pode indicar problema de posicionamento de anúncio, não necessariamente do conteúdo em si.
- **Posições de anúncios** — teste e ajuste de onde os Blocos de anúncio (§3) são exibidos na página.
- **Experimentos** — formalização do processo de teste (§3), com hipótese, duração e resultado comparável.
- **Categorias mais lucrativas** — direcionamento de Planejamento editorial (`docs/requirements/growth/GROWTH_HUB.md` §4) para os temas que já provaram gerar mais retorno.
- **Conteúdo sazonal** — identificação de padrão de receita que varia por época do ano, para antecipar produção de conteúdo relacionado antes do pico.

---

## Capítulo 6 — IA

Responsabilidades dos Agentes dentro do módulo AdSense — todos ⚪ Planejado, sem nenhum precedente (ver Capítulo 2). Somente responsabilidades, sem implementação:

- **CEO Agent** — consome Relatórios consolidados (§3) de receita para decisão de alto nível; não opera o módulo diretamente.
- **Marketing Agent** — usa Categorias mais lucrativas (§5) para redirecionar Planejamento editorial.
- **SEO Agent** — cruza Conteúdo de alto/baixo RPM (§5) com Performance orgânica (`docs/requirements/growth/SEARCH_CONSOLE.md` §4) para priorizar o que otimizar primeiro.
- **Publisher Agent** — aplica ajustes de Posicionamento (§3) definidos por um Experimento validado, no momento da publicação/atualização.
- **Analytics Agent** — cruza Receita (§4) com o restante da medição consolidada (`docs/requirements/growth/ANALYTICS.md` §4, item "Receita").
- **Finance Agent** — reconcilia Receita deste módulo com o Financeiro real (Business Hub) — mesma fronteira já descrita em `docs/requirements/growth/BLOG.md` §9.
- **Content Strategist** — papel já introduzido em `docs/requirements/growth/SEARCH_CONSOLE.md` §7: aqui, cruza Categorias mais lucrativas e Conteúdo sazonal (§5) com novas Ideias de conteúdo (`docs/requirements/growth/BLOG.md` §5).

---

## Capítulo 7 — Integrações

Todas ⚪ Planejado.

| Integração | Papel no módulo AdSense |
|---|---|
| **Blog** | Fonte do conteúdo monetizado — sem Blog, não há página para exibir anúncio. |
| **SEO** | Cruza Conteúdo de alto/baixo RPM (§5) com Performance orgânica — mais tráfego qualificado tende a significar mais receita. |
| **Analytics** | Consome Receita (§4) como uma de suas Fontes de Dados (`docs/requirements/growth/ANALYTICS.md` §4). |
| **Search Console** | Fornece dado de Impressões/Cliques orgânicos que, cruzado com Receita, ajuda a isolar o efeito de tráfego do efeito de otimização de anúncio. |
| **Google AdSense** | A própria fonte de dado — a integração central deste módulo, hoje com zero precedente de código (Capítulo 2). |
| **CRM** | Fronteira de negócio: Leads originados de conteúdo de alto RPM podem indicar sobreposição entre público que monetiza bem via anúncio e público que converte — dado cruzado, não fundido. |
| **Financeiro** | Recebe a Receita consolidada deste módulo (Business Hub) — mesma fronteira já descrita em `docs/requirements/growth/BLOG.md` §9. |
| **Google Ads** | Não é dependência funcional direta, mas informa decisão: um Bloco de anúncio ocupando espaço que poderia ser uma chamada para uma Landing Page de conversão própria é um trade-off explícito entre Monetização direta e Conversão (`docs/requirements/growth/GROWTH_HUB.md` §5). |
| **Claude / OpenAI / Gemini** | Provedores de IA que sustentam o Content Strategist e o Analytics Agent (§6) na geração de Oportunidades (§3) — mesmo precedente parcial já documentado nos módulos anteriores (`AIProviderFactory.ts`), sem nenhum uso específico deste módulo até hoje. |

---

## Capítulo 8 — Dashboard

O que o módulo AdSense envia ao Dashboard (`docs/03-DASHBOARD_V2.md`) — ⚪ Planejado, sem nenhum precedente de UI (ver Capítulo 2):

- **Receita** — valor consolidado, com tendência (subindo/caindo).
- **RPM** — indicador de eficiência de monetização, exibido junto à Receita para dar contexto (mais Receita não é sempre bom sinal se o RPM caiu porque o tráfego cresceu mais que a receita).
- **Artigos mais lucrativos** — lista rápida, direcionando atenção editorial.
- **Alertas** — queda brusca de RPM/Receita, ou problema de conformidade com política do Google (§14) sinalizado pela conta AdSense.
- **Quedas** — conteúdos com queda relevante de receita.
- **Oportunidades** — o resultado do Capítulo 5, exibido de forma acionável.

---

## Capítulo 9 — KPIs

Todos ⚪ Planejado:

| KPI | Definição |
|---|---|
| **Receita** | Valor financeiro total gerado no período. |
| **RPM** | Receita a cada mil visualizações. |
| **Page RPM** | RPM calculado por página individual. |
| **CTR** | Taxa de clique em anúncios exibidos. |
| **CPC** | Valor médio recebido por clique. |
| **Cliques** | Volume absoluto de cliques em anúncios. |
| **Impressões** | Quantas vezes um anúncio foi exibido. |
| **Receita por artigo** | Receita atribuída a um artigo específico. |
| **Receita por categoria** | Receita agregada por categoria de conteúdo. |
| **Receita por autor** | Receita agregada por quem produziu o conteúdo. |
| **Receita mensal** | Consolidação de Receita no mês corrente. |
| **Receita anual** | Consolidação de Receita no ano corrente, base para planejamento de longo prazo. |

---

## Capítulo 10 — Permissões

Papéis específicos ao módulo AdSense — ⚪ Planejado:

| Papel | Acesso típico |
|---|---|
| **Administrador** | Acesso total — configurações, conta AdSense conectada, Experimentos. |
| **CEO** | Leitura consolidada de Receita e Relatórios (§3); não opera o módulo. |
| **Financeiro** | Leitura completa de Receita (§4, §9) — o papel mais diretamente interessado no módulo, junto ao Administrador. |
| **Marketing** | Leitura de Categorias mais lucrativas e Oportunidades (§5), para redirecionar Planejamento. |
| **SEO** | Leitura de Conteúdo de alto/baixo RPM cruzado com Performance orgânica. |
| **Analista** | Leitura ampla de todo o módulo, sem permissão de alterar configuração ou Experimentos. |

---

## Capítulo 11 — Roadmap

| Fase | Foco |
|---|---|
| **Fase 1 — Leitura de dados** | Primeira conexão real com a API do Google AdSense — ingestão bruta de Receita/RPM/Impressões/Cliques (§4). Como não há nenhum scaffold prévio (Capítulo 2), esta fase também inclui criar o módulo em si sobre `IModule`. |
| **Fase 2 — Painéis** | Visão Geral e Receita (§3) organizadas sobre o dado já ingerido. |
| **Fase 3 — Relatórios** | Consolidação periódica sobre os Painéis já funcionais. |
| **Fase 4 — Integração com Analytics** | Receita alimentando de fato as Fontes de Dados do Analytics (`docs/requirements/growth/ANALYTICS.md` §4). |
| **Fase 5 — Integração com Search Console** | Cruzamento de Receita com Performance orgânica (`docs/requirements/growth/SEARCH_CONSOLE.md` §4), habilitando Otimização (§5) de verdade. |
| **Fase 6 — IA** | Agentes (§6) assumindo Otimização e Oportunidades de forma cada vez mais autônoma, sempre com Experimentos formais antes de mudança ampla de posicionamento. |

---

## Capítulo 12 — Dependências

| Dependência | Natureza |
|---|---|
| **Growth Hub** | O AdSense é um módulo deste Hub. |
| **Blog** | Fonte do conteúdo monetizado — dependência mais fundamental de todas. |
| **SEO** | Cruzamento de Performance orgânica com Receita (§5, §7). |
| **Analytics** | Consumidor da Receita consolidada (§7). |
| **Search Console** | Fornece dado de tráfego orgânico para isolar efeito de otimização (§7). |
| **Financeiro** | Recebe a Receita consolidada (Business Hub). |
| **Integration Hub** | Portão obrigatório para a integração externa com o Google AdSense. |
| **AI Hub** | Sustenta os Agentes do Capítulo 6. |

---

## Capítulo 13 — Melhores Práticas

- **Experiência do usuário** — otimização de receita nunca deve degradar a experiência de leitura a ponto de afastar o próprio tráfego que gera a receita — o objetivo é sustentável, não maximização de curto prazo (mesmo princípio de "SEO sustentável" já registrado em `docs/requirements/growth/SEO.md` §16).
- **Conteúdo de qualidade** — o módulo mede e recomenda, mas não deve incentivar produção de conteúdo de baixa qualidade só para gerar impressão/clique de anúncio — risco direto de violação de política (§14).
- **Observabilidade** — toda Oportunidade/Alerta (§8) deve ser rastreável até o dado bruto (artigo, categoria, período) que a originou.
- **Baixo acoplamento** — o AdSense consome Conteúdo do Blog e expõe Receita para Analytics/Financeiro via contrato, sem conhecer a implementação interna de nenhum dos dois.
- **Escalabilidade** — suportar múltiplos Blocos de anúncio e múltiplos Experimentos simultâneos sem alterar a lógica central de Monetização (§4).
- **Conformidade com políticas** — toda Otimização (§5) proposta, humana ou por Agente, precisa respeitar as políticas do Google AdSense antes de ser aplicada — violação pode suspender a monetização inteira, não só de um artigo (mesmo risco já registrado em `docs/requirements/growth/BLOG.md` §15).

---

## Capítulo 14 — Riscos

- **Mudanças nas políticas do Google** — critério de aprovação/monetização pode mudar sem aviso prévio, afetando receita já estabelecida.
- **Queda de RPM** — variação de mercado publicitário fora do controle da Empresa, que precisa ser distinguida de queda causada por decisão própria (posicionamento, qualidade de conteúdo).
- **Bloqueio de conta** — violação (mesmo não intencional, por ação de um Agente autônomo) pode suspender toda a Receita do módulo, não apenas de um artigo.
- **Dependência de receita** — se a Empresa passar a depender excessivamente de AdSense como fonte de receita, fica exposta a qualquer uma das mudanças acima sem alternativa.
- **Fraudes** — cliques inválidos (acidentais, ou de má-fé) em anúncios podem gerar penalização da conta — o módulo precisa estar ciente desse risco, mesmo sem poder preveni-lo diretamente.
- **LGPD** — anúncios contextuais frequentemente dependem de dado comportamental do visitante; mesmo cuidado de consentimento/finalidade já registrado em `docs/requirements/growth/GROWTH_HUB.md` §13.

---

## Capítulo 15 — Visão Futura

- **Otimização automática** — ajuste de Posicionamento (§3) por Experimento (§5) contínuo, sem esperar um ciclo manual de revisão.
- **Recomendações inteligentes** — Oportunidades (§3) cada vez mais específicas, mesma direção já registrada para SEO/Search Console/Analytics nos documentos anteriores.
- **Predição de receita** — projeção de Receita futura com base em tendência histórica e sazonalidade (§5), apoiando planejamento financeiro.
- **Experimentos automáticos** — o próprio módulo propondo e rodando testes de Posicionamento, com aprovação humana apenas para validar o resultado final.
- **Monetização orientada por IA** — Agentes (§6) decidindo continuamente onde investir esforço editorial com base em retorno financeiro esperado, não apenas em tráfego.

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
