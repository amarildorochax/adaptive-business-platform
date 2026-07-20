# SEARCH CONSOLE — Especificação Funcional do Módulo

**Andreia AI Platform** · Growth Hub
Documentação funcional do módulo Search Console — o quarto módulo do Growth Hub a ser especificado em detalhe.

Este documento é uma **especificação funcional**, não uma implementação. Relaciona-se com `docs/requirements/growth/GROWTH_HUB.md` (Google Search Console é um dos 18 módulos ali listados) e com `docs/requirements/growth/SEO.md`/`ANALYTICS.md`, que já citam Search Console como fonte de dado.

**Legenda usada em todo o documento (três níveis):**
- 🟢 **Implementado** — lógica real, funcional, executável hoje.
- 🟡 **Parcial** — existe algum indício real no código, mas sem lógica de negócio completa por trás.
- ⚪ **Planejado** — não existe nenhum vestígio no código; é direção de design.

---

## Missão do módulo

O Search Console **não é** tratado como uma API. É o **Centro Inteligente de Monitoramento de Pesquisa**, cujo objetivo é transformar dado de busca em decisão.

---

## Capítulo 1 — Visão Geral

**O que é:** o módulo Search Console é a camada da plataforma que consome, organiza e interpreta o dado bruto do Google Search Console — a única fonte que revela, com precisão, como o Google efetivamente vê e trata o site da Empresa (o que está indexado, o que aparece em busca, com que desempenho).

**Objetivos:** monitorar Performance Orgânica (§4) e Indexação (§5), identificar Oportunidades acionáveis (§6), e alimentar SEO e Analytics com dado confiável de origem — nunca estimado.

**Escopo:** leitura e organização de Performance (impressões, cliques, CTR, posição), Cobertura de Indexação, Sitemaps, Inspeção de URL, e os sinais técnicos que o próprio Search Console expõe (Core Web Vitals, Rich Results, Schema válido/inválido).

**Benefícios:**
- Dado de origem, não estimado — diferente de Analytics (comportamento inferido), o Search Console reporta o que o Google efetivamente fez com o site.
- Detecção precoce de problema de indexação — uma página pode estar publicada e "parecer" correta sem nunca ter sido indexada; sem este módulo, isso passa despercebido.
- Base objetiva para o módulo SEO decidir prioridade (ver `docs/requirements/growth/SEO.md` §9).

**Problemas que resolve:**
- Conteúdo publicado que nunca é encontrado — porque nunca foi indexado, e ninguém percebeu (Indexação, §5).
- Palavras-chave com posição mediana (8–20) que já geram impressão mas pouco clique — oportunidade de otimização barata e óbvia, se alguém estiver olhando (Oportunidades, §6).
- Decisão de SEO baseada em suposição em vez de dado real de busca.

**Limites:**
- O Search Console não decide o que fazer com o dado — isso é papel do SEO Agent (§7) e do módulo SEO (`docs/requirements/growth/SEO.md`).
- O Search Console não mede comportamento de navegação após o clique — isso é Analytics.
- O Search Console não publica nem corrige conteúdo — apenas relata o estado observado pelo Google.

---

## Capítulo 2 — Precedentes Reais da Implementação

Antes de escrever qualquer especificação, auditei o repositório inteiro pelos termos pedidos: `Search Console`, `Google Search Console`, `Indexação`, `Index`, `Coverage`, `Coverage Issues`, `Impressions`, `Clicks`, `CTR`, `Average Position`, `Queries`, `Sitemap`, `Robots`, `Canonical`, `Schema`, `Rich Results`, `URL Inspection`, `Performance Report`, `Google`, `Indexing`. Busquei termo por termo em todo `src/`, sem presumir nada.

### 🟢 Código funcional encontrado

**Nenhum.** Não existe absolutamente nenhuma lógica funcional relacionada a Search Console em toda a base de código.

### 🟡 Estruturas existentes

Apenas um item, e genérico (não específico de Search Console):

| Achado | Onde | Natureza real |
|---|---|---|
| `GOOGLE_ANALYZED: "GOOGLE_ANALYZED"` (grupo `// Traffic`) | `src/core/events/EventTypes.ts` | Nome de evento declarado no catálogo do `EventBus` — mesmo achado já registrado em `docs/requirements/growth/SEO.md` e `ANALYTICS.md`. **Nunca emitido nem assinado.** É um nome genérico de "algo do Google foi analisado" — não é específico de Search Console (poderia igualmente servir Google Ads, Google Business Profile ou Google Analytics), então nem sequer é um precedente direto e inequívoco deste módulo. |

### ⚪ Funcionalidades inexistentes

Todo o restante — sem exceção:

- Nenhum módulo `search-console` ou equivalente em `src/modules/*` (diferente de Analytics, que já tem `src/modules/analytics/` — ver `docs/requirements/growth/ANALYTICS.md` "Nota metodológica"). Dos quatro módulos de Growth Hub documentados até agora, este é o único **sem nenhum scaffold estrutural próprio**.
- Nenhum valor de `AgentType` correspondente (`src/core/agents/registry/AgentTypes.ts` tem `BLOG`, `SEO`, `PINTEREST`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`, `CRM`, `DESIGN`, `ANALYTICS`, `AUTOMATION` — nenhum `SEARCH_CONSOLE`).
- Nenhuma menção em componente visual mockado: nem `Sidebar.tsx`, nem `AgentPanel.tsx`, nem `RightPanel.tsx` (que já mockam "Blog Agent", "SEO Agent", "Pinterest Agent", "WordPress Agent") citam Search Console em lugar nenhum.
- Nenhuma ocorrência, em nenhum arquivo, de `Coverage`, `Impressions`, `Clicks` (fora de código de UI genérico não relacionado, como `e.ctrlKey`), `Queries` (a única ocorrência de "Queries" em todo `src/` é um comentário isolado em `src/game/navigation/OfficeNavigator.ts` — sobre consultas de pathfinding do escritório virtual, **sem nenhuma relação com busca ou SEO**), `Sitemap`, `Robots`, `Canonical`, `Schema`, `Rich Results`, `URL Inspection`, `Indexing`.
- A palavra `Google` (case-insensitive) aparece em exatamente um lugar em todo `src/`: o já citado `GOOGLE_ANALYZED`.

### Mocks, eventos, componentes, enums, pastas — resumo

| Categoria | Existe para Search Console? |
|---|---|
| Mocks encontrados | Não |
| Eventos declarados | Apenas o genérico `GOOGLE_ANALYZED` (não específico) |
| Componentes visuais | Nenhum |
| Enums | Nenhum |
| Pastas | Nenhuma (`src/modules/search-console` não existe) |
| Arquivos relevantes | Nenhum além da linha já citada em `EventTypes.ts` |

### Conclusão objetiva

O módulo Search Console parte de **zero absoluto de implementação** — mais até do que o módulo SEO (que já tinha um valor de `AgentType` dedicado e uma entrada mockada na interface) e mais do que o Analytics (que já tem um módulo inteiro em `src/modules/analytics/` seguindo `IModule`). Dos quatro módulos do Growth Hub documentados nesta série (Blog, SEO, Analytics, Search Console), **este é o único sem nenhum precedente de código específico** — apenas um nome de evento genérico e ambíguo, que sequer pode ser atribuído com segurança a este módulo em vez de a outro produto do Google.

---

## Capítulo 3 — Estrutura

Componentes funcionais do módulo — todos ⚪ Planejado (ver Capítulo 2):

| Componente | Função |
|---|---|
| **Visão Geral** | Painel-resumo consolidado do módulo. |
| **Performance** | Ver Capítulo 4. |
| **Consultas** | Termos de busca reais que geraram impressão/clique — frequentemente diferentes das palavras-chave alvo definidas no módulo SEO. |
| **Páginas** | Desempenho de busca por página individual do site. |
| **Dispositivos** | Segmentação de Performance por tipo de dispositivo (desktop, mobile, tablet). |
| **Países** | Segmentação de Performance por origem geográfica da busca. |
| **Cobertura** | Ver Capítulo 5. |
| **Indexação** | Ver Capítulo 5. |
| **Sitemaps** | Envio e status dos sitemaps submetidos ao Google. |
| **Inspeção de URL** | Verificação pontual do estado de indexação de uma URL específica. |
| **Core Web Vitals** | Sinais técnicos de performance/experiência reportados pelo próprio Search Console. |
| **Rich Results** | Status de elegibilidade do conteúdo a resultados enriquecidos na SERP. |
| **Schema** | Validação de dados estruturados aplicados ao conteúdo (complementa `docs/requirements/growth/SEO.md` §3/§7, que define a aplicação — aqui é a leitura do resultado). |
| **Alertas** | Ver Capítulo 9. |
| **Oportunidades** | Ver Capítulo 6. |
| **Relatórios** | Consolidação periódica do dado deste módulo. |
| **Configurações** | Parâmetros do módulo — propriedade do Search Console conectada, frequência de sincronização. |

---

## Capítulo 4 — Performance Orgânica

Todos ⚪ Planejado:

- **Impressões** — quantas vezes uma página apareceu em resultado de busca.
- **Cliques** — quantos desses resultados foram efetivamente clicados.
- **CTR** — cliques dividido por impressões.
- **Posição Média** — ranqueamento médio, por página ou por consulta.
- **Consultas** — os termos de busca reais associados a cada impressão/clique.
- **Páginas** — o mesmo dado, agregado por página em vez de por consulta.
- **Comparações** — contraste entre períodos, para saber se a Performance está melhorando ou piorando.

---

## Capítulo 5 — Indexação

Todos ⚪ Planejado:

- **Páginas indexadas** — o que o Google efetivamente incluiu em seu índice de busca.
- **Páginas excluídas** — o que existe no site mas não está indexado, com o motivo reportado pelo Google.
- **Cobertura** — visão consolidada de indexadas versus excluídas versus com erro, sobre o total do site.
- **Erros** — falhas de rastreamento/indexação que impedem uma página de aparecer em busca.
- **Sitemaps** — status de processamento dos sitemaps enviados — um sitemap mal formado ou desatualizado é causa comum de páginas não descobertas.
- **Canonical** — verificação de que a URL canônica declarada pelo site é a mesma reconhecida pelo Google (divergência aqui é fonte comum de indexação incorreta).
- **Robots** — confirmação de que nenhuma página relevante está sendo bloqueada de indexação por engano via `robots.txt`.

---

## Capítulo 6 — Oportunidades

Todos ⚪ Planejado:

- **Páginas com alto potencial** — páginas com impressão relevante mas desempenho abaixo do esperado para sua posição.
- **CTR baixo** — páginas bem posicionadas, mas com taxa de clique abaixo da média esperada para aquela posição — geralmente indicando título/meta description fracos (`docs/requirements/growth/SEO.md` §7).
- **Posição entre 8 e 20** — a faixa clássica de "quase lá": páginas próximas da primeira página de resultados, onde um pequeno reforço de otimização ou Link (interno/externo) tem o maior potencial de retorno.
- **Conteúdo desatualizado** — cruzamento com o sinal já definido em `docs/requirements/growth/BLOG.md` §5/§8: queda de Performance aqui é um dos gatilhos de Atualização.
- **Consultas emergentes** — termos que começaram a gerar impressão recentemente, sem que a Empresa tenha produzido conteúdo dedicado a eles ainda — sinal de tendência a explorar.
- **Canibalização** — mesma responsabilidade já atribuída ao módulo SEO (`docs/requirements/growth/SEO.md` §3), aqui é o Search Console quem fornece o dado bruto (duas páginas aparecendo pela mesma Consulta) que permite a detecção.

---

## Capítulo 7 — IA

Responsabilidades dos Agentes dentro do módulo Search Console — todos ⚪ Planejado, sem nenhum precedente (ver Capítulo 2):

- **CEO Agent** — consome Relatórios consolidados (§3) para visão de alto nível; não opera o módulo diretamente.
- **SEO Agent** — o consumidor mais direto: usa Performance (§4) e Indexação (§5) como dado de origem para toda decisão já descrita em `docs/requirements/growth/SEO.md` §7.
- **Marketing Agent** — usa Oportunidades (§6) para redirecionar Planejamento (`docs/requirements/growth/GROWTH_HUB.md` §4).
- **Publisher Agent** — consulta Inspeção de URL (§3) logo após Publicação (`docs/requirements/growth/BLOG.md` §5), para confirmar que o conteúdo foi de fato submetido corretamente ao Google.
- **Analytics Agent** — cruza Performance (§4) com o restante da medição consolidada (`docs/requirements/growth/ANALYTICS.md` §4).
- **Content Strategist** — papel novo, não citado em nenhum documento anterior desta série: interpreta Oportunidades (§6) e Consultas emergentes para propor não apenas ajuste de conteúdo existente, mas novas Ideias de conteúdo (`docs/requirements/growth/BLOG.md` §5) — uma responsabilidade hoje espalhada entre Marketing e SEO Agent, que este módulo sugere merecer um papel dedicado.

---

## Capítulo 8 — Integrações

Todas ⚪ Planejado.

| Integração | Papel no módulo Search Console |
|---|---|
| **SEO** | Consumidor principal — recebe Performance e Indexação como dado de origem (§4, §5, já referenciado em `docs/requirements/growth/SEO.md` §9). |
| **Blog** | Fornece o catálogo de conteúdo publicado que o Search Console passa a monitorar; recebe de volta sinal de Indexação/Performance por artigo. |
| **Analytics** | Consome Performance consolidada como uma de suas Fontes de Dados (`docs/requirements/growth/ANALYTICS.md` §4). |
| **Google Search Console** | A própria fonte de dado — a integração central deste módulo, hoje com zero precedente de código (Capítulo 2). |
| **WordPress** | Onde Sitemaps e Canonical (§5) são de fato configurados/publicados — mesmo Connector já usado pelo Blog. |
| **Google Business Profile** | Fonte complementar para SEO local — sinais de indexação/performance própria, fora do escopo direto deste módulo, mas frequentemente correlacionada. |
| **Google Ads** | Não é uma dependência funcional deste módulo, mas compartilha o mesmo "Consultas" (§4) que, cruzado entre pago e orgânico, informa oportunidade (mesmo princípio já descrito em `docs/requirements/growth/GROWTH_HUB.md` §6). |
| **Claude / OpenAI / Gemini** | Provedores de IA que sustentam o Content Strategist e o SEO Agent (§7) na interpretação de Oportunidades — mesmo precedente parcial já documentado nos três módulos anteriores (`AIProviderFactory.ts`), sem nenhum uso específico deste módulo até hoje. |

---

## Capítulo 9 — Dashboard

O que o módulo Search Console envia ao Dashboard (`docs/03-DASHBOARD_V2.md`) — ⚪ Planejado, sem nenhum precedente de UI (ver Capítulo 2):

- **Alertas** — erro de indexação crítico, sitemap com falha de processamento, Cobertura caindo abruptamente.
- **Quedas** — páginas com queda relevante de Posição/Cliques.
- **Ganhos** — páginas com melhora relevante — sinal do que replicar.
- **Novas oportunidades** — o resultado do Capítulo 6, exibido de forma acionável.
- **Erros** — lista de problemas técnicos de indexação pendentes de correção.
- **Indexação** — visão resumida de Cobertura (§5), como indicador de saúde geral do site perante o Google.

---

## Capítulo 10 — KPIs

Todos ⚪ Planejado:

| KPI | Definição |
|---|---|
| **Impressões** | Quantas vezes o site apareceu em resultado de busca. |
| **Cliques** | Volume absoluto de cliques recebidos. |
| **CTR** | Cliques dividido por impressões. |
| **Posição Média** | Ranqueamento médio agregado. |
| **Páginas indexadas** | Total de páginas incluídas no índice do Google. |
| **Páginas excluídas** | Total de páginas fora do índice, com motivo conhecido. |
| **Cobertura** | Percentual de páginas do site que estão indexadas. |
| **Erros** | Quantidade de problemas técnicos de indexação em aberto. |
| **Core Web Vitals** | Status agregado dos sinais técnicos de performance/experiência. |
| **Consultas** | Quantidade de termos de busca distintos gerando impressão. |
| **Conteúdo recuperado** | Quantos conteúdos, antes com problema de indexação/performance, foram corrigidos e voltaram a performar. |
| **Conteúdo otimizado** | Quantos conteúdos já passaram por ação corretiva com base em Oportunidades (§6) identificadas por este módulo. |

---

## Capítulo 11 — Permissões

Papéis específicos ao módulo Search Console — ⚪ Planejado:

| Papel | Acesso típico |
|---|---|
| **Administrador** | Acesso total — configurações, propriedade conectada, sincronização. |
| **CEO** | Leitura consolidada de Relatórios (§3); não opera o módulo. |
| **SEO** | Acesso operacional completo — Performance, Indexação, Oportunidades. |
| **Marketing** | Leitura de Oportunidades e Consultas emergentes (§6), para redirecionar Planejamento. |
| **Analista** | Leitura ampla de todo o módulo, sem permissão de alterar configuração. |

---

## Capítulo 12 — Roadmap

| Fase | Foco |
|---|---|
| **Fase 1 — Leitura de dados** | Primeira conexão real com a API do Google Search Console — ingestão bruta de Performance (§4) e Cobertura (§5), sem interpretação ainda. Como não há nenhum scaffold prévio (Capítulo 2), esta fase também inclui criar o módulo em si sobre `IModule`. |
| **Fase 2 — Relatórios** | Consolidação periódica (§3) sobre o dado já ingerido. |
| **Fase 3 — Alertas** | Detecção de problema (quedas, erros de indexação) sobre os Relatórios já funcionais. |
| **Fase 4 — Integração com SEO** | Performance/Indexação alimentando de fato as decisões do módulo SEO (`docs/requirements/growth/SEO.md` §9), fechando o loop hoje só descrito em documentação. |
| **Fase 5 — Integração com Analytics** | Performance consolidada nas Fontes de Dados do Analytics (`docs/requirements/growth/ANALYTICS.md` §4). |
| **Fase 6 — IA** | SEO Agent e Content Strategist (§7) assumindo interpretação de Oportunidades (§6) de forma cada vez mais autônoma. |

---

## Capítulo 13 — Dependências

| Dependência | Natureza |
|---|---|
| **Growth Hub** | O Search Console é um módulo deste Hub. |
| **Blog** | Fornece o catálogo de conteúdo monitorado. |
| **SEO** | Consumidor principal do dado deste módulo — sem SEO, o dado coletado não vira decisão. |
| **Analytics** | Consumidor secundário, para visão consolidada (`docs/requirements/growth/ANALYTICS.md` §4). |
| **WordPress** | Onde Sitemaps/Canonical são de fato configurados. |
| **Integration Hub** | Portão obrigatório para a integração externa com o Google Search Console. |
| **AI Hub** | Sustenta os Agentes do Capítulo 7. |

---

## Capítulo 14 — Melhores Práticas

- **Baixo acoplamento** — o Search Console expõe dado via contrato para SEO/Analytics consumirem; não conhece a lógica interna de nenhum dos dois.
- **Observabilidade** — todo Alerta/Oportunidade (§6, §9) deve ser rastreável até a Consulta/Página de origem, nunca um número sem contexto.
- **Eventos** — a ingestão de novo dado deve disparar evento (mesmo princípio de `docs/requirements/growth/ANALYTICS.md` §6), nunca depender de consulta ativa constante à API do Google.
- **Automação** — sincronização periódica e geração de Relatórios (§3) devem rodar como Workflow (Operations Hub), não manualmente.
- **Escalabilidade** — suportar múltiplas propriedades do Search Console (ex.: mais de um domínio da mesma Empresa) sem alterar a lógica central do módulo.
- **Monitoramento contínuo** — a API do Google Search Console tem defasagem própria de dado (não é instantânea); o módulo precisa deixar isso explícito ao usuário, não apresentar o dado como "tempo real" quando não é.

---

## Capítulo 15 — Riscos

- **Mudanças na API** — a API do Google Search Console pode alterar formato/comportamento sem aviso prévio, quebrando ingestão.
- **Limites da API** — cota de chamadas restrita; um uso mal projetado de sincronização pode esgotar o limite disponível.
- **Dados incompletos** — o próprio Search Console omite dado de baixo volume por privacidade (consultas muito raras não aparecem individualizadas) — o módulo precisa lidar com isso sem apresentar como "zero".
- **Latência** — o dado do Search Console tem atraso natural de alguns dias; decisão baseada nele precisa considerar essa defasagem.
- **Privacidade** — mesmo dado agregado de busca pode, em casos extremos, expor intenção de usuário; tratamento cuidadoso é necessário ao cruzar com outras Fontes.
- **LGPD** — mesmo cuidado de consentimento/finalidade já registrado em `docs/requirements/growth/GROWTH_HUB.md` §13, aplicado aqui ao dado de origem de busca.

---

## Capítulo 16 — Visão Futura

- **Detecção automática de oportunidades** — Oportunidades (§6) surgindo sem que um humano precise revisar Performance manualmente.
- **Atualização automática de conteúdos** — Conteúdo desatualizado (§6) disparando diretamente uma proposta de revisão no Blog, fechando o loop sem intervenção manual.
- **Alertas inteligentes** — limites de Alerta (§9) ajustados ao padrão histórico de cada Empresa, mesma direção já registrada em `docs/requirements/growth/ANALYTICS.md` §16.
- **SEO preditivo** — antecipar queda/oportunidade antes que apareça de forma óbvia no dado — mesma visão já registrada em `docs/requirements/growth/SEO.md` §18.
- **Clusters inteligentes** — Consultas emergentes (§6) sugerindo automaticamente novos Content Clusters (`docs/requirements/growth/SEO.md` §5).
- **Monitoramento contínuo** — reduzir a defasagem natural da API (§15) através de checagem mais frequente, aproximando-se de tempo real dentro do que o Google permitir.

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
