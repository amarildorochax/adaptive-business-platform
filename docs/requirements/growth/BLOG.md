# BLOG — Especificação Funcional do Módulo

**Andreia AI Platform** · Growth Hub
Documentação funcional do módulo Blog — o primeiro módulo do Growth Hub a ser especificado em detalhe.

Este documento é uma **especificação funcional**, não uma implementação. Relaciona-se com `docs/requirements/growth/GROWTH_HUB.md` (Blog é um dos 18 módulos ali listados), e com `docs/PLATFORM_VISION.md` §7, `docs/05-ECOSYSTEM_MAP.md` Capítulo 3 (ambos já tinham um resumo do fluxo do Blog — este documento os aprofunda, sem contradizê-los).

**Legenda usada em todo o documento:**
- 🟢 **Implementado** — existe em código hoje.
- ⚪ **Planejado** — ainda não existe nenhum código; é a direção de design.

---

## Missão do módulo

O Blog **não é** apenas um editor de artigos. É o **CMS Inteligente orientado por IA** do Growth Hub — o núcleo responsável por Planejamento Editorial, Produção de Conteúdo, Organização, Publicação, Distribuição, Atualização, Versionamento, e pela integração com SEO, Analytics, Search Console, AdSense, Pinterest e Web Stories.

---

## Capítulo 1 — Visão Geral

**O que é:** o módulo Blog é o centro de produção de conteúdo de longa duração do Growth Hub. Diferente de um editor de texto genérico, ele é desenhado para que Agentes de IA participem de cada etapa do Ciclo de Vida de um Artigo (§5) — da ideia à atualização periódica — com supervisão humana nos pontos que exigem julgamento (aprovação, revisão editorial).

**Objetivos:** ver Capítulo 2.

**Benefícios:**
- Produção de conteúdo consistente, sem depender da disponibilidade de um redator humano para cada artigo.
- Conteúdo estruturado para SEO desde a concepção (§8), não corrigido depois de já escrito.
- Rastreabilidade completa: todo artigo carrega seu histórico (§4, §14 — Versionamento) de quem/o que produziu, revisou e atualizou.

**Problemas que resolve:**
- Blogs corporativos tipicamente param de ser atualizados porque dependem de um processo manual frágil — o módulo Blog formaliza um fluxo editorial (§4) que não depende de memória individual.
- Conteúdo produzido sem intenção de busca clara — o Ciclo de Vida (§5) força a etapa de Palavras-chave antes da Redação, nunca depois.
- Falta de manutenção de conteúdo antigo — Atualização e Monitoramento (§5) são etapas formais do ciclo, não uma tarefa esquecida.

**Escopo:** o módulo Blog cobre a produção, organização, publicação e manutenção de conteúdo em formato de artigo (incluindo suas derivações — imagem, vídeo, Web Story). Ele não substitui o módulo SEO (que cuida da estratégia de palavra-chave e da estrutura técnica mais ampla, §8) nem o módulo Analytics (que cuida da medição de todo o site, não só do Blog).

**Limites:**
- O Blog não gerencia campanhas de mídia paga (isso é papel de Google Ads/Meta Ads/Pinterest Ads, outros módulos do Growth Hub).
- O Blog não é o CRM — um Lead gerado por um artigo é processado pelo módulo CRM (Business Hub), não armazenado dentro do Blog.
- O Blog não decide orçamento ou aprova gasto — isso pertence ao Operations Hub (Aprovações) quando aplicável (ex.: impulsionar um artigo).

---

## Capítulo 2 — Objetivos

- **Gerar conteúdo** — produzir artigos de forma consistente e recorrente.
- **Organizar conteúdo** — manter uma estrutura navegável (Categorias, Tags, Calendário) em vez de uma pilha desorganizada de textos.
- **Aumentar autoridade** — construir reconhecimento de marca/expertise ao longo do tempo através de conteúdo de qualidade.
- **Gerar tráfego** — atrair visitantes através de busca orgânica e distribuição.
- **Aumentar indexação** — garantir que o que é publicado seja de fato encontrado pelos buscadores, não apenas publicado.
- **Gerar receita** — via Monetização (§9): AdSense, afiliados, produtos digitais, ou Leads/Vendas originadas do conteúdo.
- **Facilitar manutenção** — tornar barato revisar e atualizar conteúdo antigo, em vez de só produzir conteúdo novo.

---

## Capítulo 3 — Estrutura

As áreas funcionais do módulo — todas ⚪ Planejado:

| Área | Função |
|---|---|
| **Painel Principal** | Visão consolidada do módulo: o que está publicado, em rascunho, em revisão, e alertas (ver §10). |
| **Artigos** | Lista de todo conteúdo já publicado. |
| **Rascunhos** | Conteúdo em produção, ainda não publicado. |
| **Calendário Editorial** | Visão temporal do que está planejado, em produção e publicado (§4). |
| **Categorias** | Agrupamento temático amplo do conteúdo. |
| **Tags** | Marcação granular, cruzando categorias. |
| **Autores** | Quem (humano ou Agente) produziu cada artigo — parte da Observabilidade (§14). |
| **Biblioteca de Imagens** | Repositório de imagens produzidas/usadas, reutilizável entre artigos. |
| **Biblioteca de Vídeos** | Mesma função, para vídeos. |
| **Templates** | Estruturas reutilizáveis de artigo (ex.: "guia comparativo", "lista", "tutorial") — ponto de entrada de personalização do Ciclo de Vida (§5), e base do Marketplace de Templates (§16). |
| **Histórico** | Registro de todas as versões e mudanças de um artigo (§14 — Versionamento). |
| **Lixeira** | Conteúdo removido, recuperável antes de exclusão definitiva. |
| **Configurações** | Parâmetros do módulo (integrações ativas, papéis padrão, frequência de revisão automática). |

---

## Capítulo 4 — Gestão Editorial

- **Planejamento** — decisão do que produzir, com base em oportunidade (Pesquisa, §5) e meta de negócio (Objetivos, §2).
- **Calendário** — visualização temporal de tudo que está planejado, em produção e já publicado — ponto único de verdade sobre "o que sai quando".
- **Prioridades** — nem todo artigo planejado tem a mesma urgência; o módulo precisa suportar reordenar o que entra em produção primeiro.
- **Status dos artigos** — todo artigo está sempre em um destes estados: Ideia, Em produção, Em revisão, Aguardando aprovação, Publicado, Desatualizado, Arquivado.
- **Fluxo editorial** — a sequência formal por onde todo artigo passa antes de publicar (ver Ciclo de Vida, §5) — nenhum artigo pula etapa.
- **Revisão** — checagem de qualidade e aderência ao Briefing antes de seguir para Aprovação.
- **Publicação** — liberação efetiva do conteúdo ao público, via Integration Hub (§7).
- **Atualização** — revisão periódica de conteúdo já publicado, disparada por Monitoramento (§5) quando performance cai.
- **Arquivamento** — remoção de circulação ativa de conteúdo que não faz mais sentido manter publicado, sem apagar seu histórico.

---

## Capítulo 5 — Ciclo de Vida de um Artigo

```
Ideia → Pesquisa → Briefing → Palavras-chave → Estrutura → Redação → Imagens → Vídeos → SEO → Revisão → Aprovação → Publicação → Distribuição → Monitoramento → Atualização → Arquivamento
```

| Etapa | O que acontece | Estado |
|---|---|---|
| **Ideia** | Um tema é proposto (por um humano ou pelo Marketing Agent, a partir de uma oportunidade identificada). | ⚪ |
| **Pesquisa** | Validação da ideia: intenção de busca, concorrência, ângulo diferenciado. | ⚪ |
| **Briefing** | Documento-guia do artigo: objetivo, público, ângulo, extensão esperada. | ⚪ |
| **Palavras-chave** | Definição do termo alvo e termos relacionados (módulo SEO/Keyword Research, §8). | ⚪ |
| **Estrutura** | Esqueleto de títulos (H1-H2-H3) antes de escrever — nunca depois. | ⚪ |
| **Redação** | Produção do texto final. | 🟢 **precedente real** — `BlogAgentExecutor.execute()` (`src/core/agents/blog/executor/BlogAgentExecutor.ts`) já recebe uma `Task`, chama `AIProviderFactory.create()` e gera um artigo em Markdown de verdade, hoje usando `MockAIProvider`. Pertence à aplicação atual, não à nova plataforma; não escreve em WordPress nem persiste em disco — o resultado fica em memória (`BlogOutputService.create()`). |
| **Imagens** | Produção/curadoria de imagens do artigo. | ⚪ |
| **Vídeos** | Quando aplicável. | ⚪ |
| **SEO** | Ajuste técnico final (meta descrição, densidade de palavra-chave, links internos) — ver §8. | ⚪ |
| **Revisão** | Checagem de qualidade contra o Briefing. | ⚪ |
| **Aprovação** | Checkpoint humano antes de publicar (Operations Hub — Aprovações). | ⚪ |
| **Publicação** | Envio ao WordPress (via Integration Hub, §7). | ⚪ |
| **Distribuição** | Propagação para Pinterest, Email Marketing, Social Media. | ⚪ |
| **Monitoramento** | Acompanhamento de posição/tráfego/engajamento pós-publicação. | ⚪ |
| **Atualização** | Revisão do artigo quando Monitoramento indica queda de performance — volta o artigo a um estado anterior do ciclo (tipicamente Redação/SEO), não recomeça do zero. | ⚪ |
| **Arquivamento** | Retirada de circulação, preservando histórico. | ⚪ |

**Achado relevante para este documento:** a etapa de Redação já tem, hoje, o único trecho verdadeiramente funcional (não apenas estrutural) de todo o Ciclo de Vida — inclusive já roteado pelo `AgentDispatcher` (`agentDispatcher.dispatch("blog-agent", task)` → `blogAgentExecutor.execute(task)`, em `src/core/dispatcher/AgentDispatcher.ts`). Isso faz da Redação o candidato natural a ponto de partida quando a Fase 1/2 do Roadmap (§13) começar.

---

## Capítulo 6 — IA

Responsabilidades dos Agentes dentro do módulo Blog — ⚪ Planejado, sem implementação:

- **CEO Agent** — consome o resultado consolidado (KPIs, §11) para decidir se o investimento em Blog está de acordo com a meta de negócio; não participa de nenhuma etapa operacional do Ciclo de Vida.
- **Marketing Agent** — dono do Planejamento (§4): propõe Ideias, prioriza o Calendário Editorial.
- **SEO Agent** — executa Pesquisa, Palavras-chave, Estrutura e a etapa de SEO do Ciclo de Vida (§5, §8).
- **Redator (Copywriter) Agent** — executa Briefing e Redação. Já existe um precedente concreto e funcional para este papel: 🟢 `BlogAgent` (`src/core/agents/blog/BlogAgent.ts`) é um registro de agente real, com `tools: ["WordPress", "OpenAI", "Rank Math", "Canva"]` já declaradas — mesmo que essas ferramentas não estejam de fato conectadas (§7) hoje.
- **Designer Agent** — executa Imagens e Vídeos.
- **Publisher Agent** — executa Publicação e Distribuição, sempre por um Connector (Integration Hub, §7); depende de Aprovação humana antes de publicar.
- **Analytics Agent** — executa Monitoramento e decide quando disparar Atualização, com base nos KPIs (§11).

---

## Capítulo 7 — Integrações

Todas ⚪ Planejado, salvo indicação em contrário.

| Integração | Papel no módulo Blog |
|---|---|
| **WordPress** | Destino de Publicação — onde o artigo de fato vai ao ar. |
| **Google Search Console** | Confirma Indexação e traz dados reais de posição/impressões pós-publicação. |
| **Google Analytics** | Mede tráfego e comportamento de quem chega a um artigo. |
| **Google AdSense** | Monetização direta do tráfego do Blog (§9). |
| **Pinterest** | Canal de Distribuição — Pins apontando de volta para artigos. |
| **Web Stories** | Formato derivado, tipicamente reaproveitando conteúdo/imagens já produzidos para um artigo. |
| **YouTube** | Quando o artigo tem vídeo associado, YouTube é o canal de hospedagem/distribuição desse vídeo. |
| **Claude / OpenAI / Gemini** | Provedores de IA que sustentam Redator/SEO/Designer Agents (§6). 🟢 Precedente parcial já real: `BlogAgentExecutor` já chama `AIProviderFactory.create()`, que hoje sempre resolve para `MockAIProvider` — mas já antecipa `openai` e `claude` como opções configuráveis (`src/core/ai/AIProviderFactory.ts`). |
| **WhatsApp** | Canal de notificação/distribuição pontual (ex.: avisar um Lead sobre conteúdo relevante) — uso compartilhado com CRM. |
| **Email Marketing** | Canal de Distribuição — inclusão de artigos novos em newsletters. |

**Achado relevante:** `BlogAgent.ts` já declara `"Rank Math"` e `"Canva"` como ferramentas do agente — nenhuma das duas aparece na lista de integrações pedida para este capítulo, nem em `docs/requirements/growth/GROWTH_HUB.md` §6. Rank Math é um plugin de SEO para WordPress (seria uma extensão do Connector WordPress, não um Connector próprio) e Canva é uma ferramenta de design (candidata a novo Connector, hoje sem nenhuma menção em nenhum outro documento). Registro isso como um gap a reconciliar — não resolvido nesta Sprint, apenas anotado para não se perder.

---

## Capítulo 8 — SEO

O Blog e o módulo SEO (`docs/requirements/growth/GROWTH_HUB.md` §3-4) colaboram sem duplicar responsabilidade:

| Responsabilidade | Dono |
|---|---|
| Pesquisa de palavra-chave alvo e relacionadas | **SEO** (módulo) — o Blog consome o resultado, não o produz |
| Definição de Cluster temático (a qual grupo de conteúdo um artigo pertence) | **SEO** |
| Estrutura de títulos (H1-H2-H3) alinhada à palavra-chave | **Blog** (dentro do Ciclo de Vida, §5), usando a orientação do SEO |
| Meta descrição, densidade de palavra-chave, links internos | **Blog** — ajuste técnico feito dentro do próprio artigo |
| Schema, dados estruturados | **SEO** — aplicado sobre o artigo publicado pelo Blog |
| Monitoramento de posição/SERP | **SEO** — o Blog recebe o sinal (via Monitoramento, §5) para saber quando precisa de Atualização |
| Detecção de Canibalização (dois artigos competindo pela mesma palavra-chave) | **SEO** — precisa de visão sobre todo o catálogo de Artigos do Blog para detectar isso |

Em resumo: o SEO decide **o quê** e **para onde** o conteúdo deve mirar; o Blog decide **como** o conteúdo em si é estruturado e mantido.

---

## Capítulo 9 — Monetização

Como o Blog se conecta a cada fonte de receita — todas ⚪ Planejado:

- **AdSense** — o canal mais direto: tráfego do artigo gera impressões de anúncio, medidas de volta como receita (RPM, §11).
- **Afiliados** — links de produtos/serviços de terceiros dentro do conteúdo do artigo, com comissão sobre conversão — depende de o Ciclo de Vida (§5) suportar inserção desses links já na etapa de Redação/Revisão.
- **Produtos Digitais** — quando a própria Empresa vende algo digital (curso, e-book), o artigo funciona como canal de venda direta, geralmente via Landing Page.
- **Landing Pages** — destino de chamadas para ação dentro de um artigo, quando o objetivo não é AdSense/Afiliados, mas conversão direta.
- **Leads** — um artigo pode capturar um Lead diretamente (formulário, isca digital) sem passar por uma Landing Page separada.
- **CRM** — todo Lead gerado por qualquer um dos canais acima é processado pelo módulo CRM (Business Hub) — o Blog não armazena Lead, apenas o origina.

---

## Capítulo 10 — Dashboard

O que o módulo Blog envia para o Dashboard (`docs/03-DASHBOARD_V2.md`, `docs/requirements/growth/GROWTH_HUB.md` §8) — ⚪ Planejado:

- **Artigos publicados** — contagem e lista recente, no widget de Blog.
- **Rascunhos** — quantidade em produção, sinalizando carga de trabalho editorial.
- **Atualizações** — artigos sinalizados para revisão pelo Monitoramento.
- **Conteúdo em revisão** — o que está parado aguardando Revisão/Aprovação humana — candidato a gargalo visível.
- **Alertas** — falha de publicação, queda brusca de posição de um artigo, erro de integração (ex.: WordPress fora do ar).
- **Oportunidades** — sugestões geradas pelo SEO Agent/Marketing Agent (ex.: "cluster X sem conteúdo há 60 dias") aparecendo como recomendação acionável, não só informação passiva.

---

## Capítulo 11 — KPIs

Todos ⚪ Planejado:

| KPI | Definição |
|---|---|
| **Quantidade de artigos** | Total de artigos existentes, em qualquer status. |
| **Artigos publicados** | Total efetivamente ao vivo. |
| **Artigos atualizados** | Quantos passaram por uma Atualização (§5) em um período. |
| **Tempo médio de produção** | Da Ideia até a Publicação. |
| **Tempo até publicação** | Da Aprovação até a Publicação efetiva — mede atrito operacional/técnico, separado do tempo de produção de conteúdo. |
| **Visualizações** | Total de leituras de artigo. |
| **CTR** | Percentual de quem viu o artigo nos resultados de busca e clicou. |
| **Sessões** | Visitas geradas pelo conjunto de artigos. |
| **Receita** | Total atribuível ao Blog (soma de todos os canais de Monetização, §9). |
| **RPM** | Receita a cada mil visualizações — específico de AdSense. |
| **Conversões** | Quantos visitantes de artigo completaram uma ação desejada. |
| **Leads** | Quantos Leads o Blog originou. |

---

## Capítulo 12 — Permissões

Papéis específicos ao módulo Blog — ⚪ Planejado:

| Papel | Acesso típico |
|---|---|
| **Administrador** | Acesso total ao módulo — configurações, integrações, papéis. |
| **Editor** | Aprova, organiza o Calendário Editorial, decide prioridades. |
| **Redator** | Produz Briefing e Redação; não publica sozinho. |
| **SEO** | Trabalha Palavras-chave, Estrutura e a etapa de SEO (§8); acesso de leitura ao restante. |
| **Marketing** | Propõe Ideias, acompanha KPIs (§11) e Monetização (§9). |
| **Designer** | Produz Imagens/Vídeos; sem acesso a Publicação. |
| **Analista** | Leitura de KPIs e Dashboard (§10, §11); sem permissão de edição de conteúdo. |
| **CEO** | Leitura consolidada; aprovação de decisões de maior impacto (ex.: mudança de estratégia editorial). |

---

## Capítulo 13 — Roadmap

| Fase | Foco |
|---|---|
| **Fase 1 — Editor** | Infraestrutura básica de criação/edição de Artigos, Rascunhos, Categorias, Tags — scaffold sobre `IModule`, sem lógica de negócio. |
| **Fase 2 — Fluxo Editorial** | Calendário Editorial, Status dos artigos, Revisão/Aprovação (§4) — formaliza o processo antes de automatizar qualquer etapa. |
| **Fase 3 — SEO Integrado** | Palavras-chave, Estrutura, colaboração com o módulo SEO (§8). |
| **Fase 4 — Publicação** | Connector WordPress real, Distribuição (Pinterest, Email, Social) — primeira vez que o Blog toca o Integration Hub de verdade. |
| **Fase 5 — Analytics** | Search Console + Analytics reais, fechando o loop de Monitoramento (§5). |
| **Fase 6 — Monetização** | AdSense e os demais canais do Capítulo 9. |
| **Fase 7 — IA** | Agentes (§6) assumindo progressivamente as etapas do Ciclo de Vida (§5) — a Redação já tem precedente real (`BlogAgentExecutor`) e é a etapa mais madura para essa transição. |

---

## Capítulo 14 — Melhores Práticas

- **Baixo acoplamento** — o Blog não deve conhecer a implementação interna do SEO, Analytics ou CRM; consome e produz dados através de contratos, nunca de chamada direta.
- **Conteúdo reutilizável** — imagens, vídeos e templates (§3) devem poder ser reaproveitados entre artigos, evitando retrabalho.
- **Versionamento** — toda mudança em um artigo publicado gera uma nova versão rastreável (Histórico, §3), nunca uma sobrescrita silenciosa.
- **Automação** — o Ciclo de Vida (§5), uma vez maduro, deve ser executável como Workflow (Operations Hub), com checkpoints humanos só onde definidos (Aprovação).
- **Observabilidade** — todo artigo carrega quem/o que produziu cada etapa (Autores, §3) — essencial tanto para auditoria quanto para calcular corretamente os KPIs (§11).
- **Escalabilidade** — adicionar um novo Template ou uma nova Integração de Distribuição não deve exigir alterar o Ciclo de Vida (§5) em si.

---

## Capítulo 15 — Riscos

- **Conteúdo duplicado** — produção assistida por IA em escala aumenta o risco de gerar artigos muito parecidos entre si sem controle.
- **Canibalização** — dois artigos competindo pela mesma palavra-chave, prejudicando a posição de ambos (mitigado pela responsabilidade do SEO em §8).
- **Perda de indexação** — um artigo pode ser despublicado ou perder indexação por erro técnico sem ninguém notar, se o Monitoramento (§5) falhar silenciosamente.
- **Mudanças de algoritmo** — buscadores mudam critério de ranqueamento sem aviso; conteúdo antigo pode perder posição por motivo externo ao Blog.
- **Dependência de APIs** — WordPress, Search Console, Analytics são todos externos; indisponibilidade deles trava etapas do Ciclo de Vida.
- **Políticas** — violação de política de conteúdo de uma integração (ex.: AdSense) pode suspender a monetização de todo o Blog, não só de um artigo.
- **LGPD** — Leads capturados diretamente por artigo (§9) são dado pessoal e precisam do mesmo cuidado de consentimento/finalidade já registrado em `docs/requirements/growth/GROWTH_HUB.md` §13.

---

## Capítulo 16 — Visão Futura

- **Multiempresa** — cada Empresa com seu próprio catálogo de Artigos, isolado por Workspace.
- **Multisite** — uma mesma Empresa publicando o mesmo (ou variações do mesmo) conteúdo em mais de um site/domínio.
- **Multi-idioma** — o mesmo artigo, com Ciclo de Vida próprio de tradução/adaptação, em vez de uma cópia manual.
- **Marketplace de Templates** — Templates (§3) de terceiros, disponibilizados/vendidos via Marketplace Hub.
- **Marketplace de Prompts** — instruções de geração de conteúdo (usadas pelo Redator/SEO Agent) como um ativo compartilhável/comercializável.
- **Marketplace de Agentes** — versões especializadas do Redator/SEO/Designer Agent (ex.: "Redator especialista em e-commerce de moda") oferecidas por terceiros através do Marketplace Hub.

---

## Capítulo 17 — Dependências

De quais outros componentes o módulo Blog depende para funcionar por completo:

| Dependência | Natureza |
|---|---|
| **Growth Hub** | O Blog é um módulo deste Hub — depende dele para agrupamento e navegação (Sidebar, `docs/03-DASHBOARD_V2.md`). |
| **SEO** | Fornece Palavras-chave, Cluster e estratégia — sem SEO, o Blog produziria conteúdo sem direção de busca (§8). |
| **Analytics** | Fornece o dado de comportamento que alimenta Monitoramento (§5) e KPIs (§11). |
| **Search Console** | Confirma Indexação — sem isso, o Blog não sabe se um artigo publicado realmente "existe" para os buscadores. |
| **AdSense** | Necessário para a via de Monetização direta (§9). |
| **CRM** | Recebe os Leads originados pelo Blog (§9) — sem CRM, um Lead capturado não tem para onde ir. |
| **Integration Hub** | Portão obrigatório para toda integração externa do Capítulo 7 — o Blog nunca acessa WordPress/Google/Pinterest diretamente. |
| **AI Hub** | Sustenta todos os Agentes do Capítulo 6 — sem AI Runtime/Agent Runtime, os Agentes descritos não têm onde executar. |

---

## Capítulo 18 — Glossário

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

---

## Nota final — discrepância observada (não corrigida nesta Sprint)

Ao investigar o precedente real do Blog para escrever este documento, encontrei `workspace: "Andreia Rocha Floral"` hardcoded em `BlogAgent.ts` — nome diferente do cliente piloto registrado em `docs/MASTER_ROADMAP.md` ("JardFlores Decor"). Não alterei o arquivo (fora de escopo desta Sprint, que só documenta), mas registro aqui para que alguém com contexto de negócio confirme qual dos dois nomes está desatualizado.
