# GROWTH HUB — Especificação Funcional

**Andreia AI Platform**
Documentação funcional do Growth Hub — o primeiro Hub a ser especificado em detalhe.

Este documento é uma **especificação funcional**, não uma implementação. O objetivo é que qualquer pessoa — desenvolvedor, novo integrante do time, ou a própria Empresa cliente — consiga entender completamente o que o Growth Hub faz, sem precisar ler código.

Relaciona-se com os documentos já existentes: `docs/PLATFORM_VISION.md` (visão geral de produto, onde o Growth Hub já foi introduzido em §3.2), `docs/02-SYSTEM_ARCHITECTURE.md` (arquitetura técnica), `docs/02A-DOMAIN_MODEL.md` (conceitos de negócio: Hub, Módulo, Campanha, Conteúdo, Publicação...), `docs/03-DASHBOARD_V2.md` (interface) e `docs/05-ECOSYSTEM_MAP.md` (fluxos que já tocam o Growth Hub: Blog, SEO, Google Ads, Meta Ads, Pinterest, AdSense).

**Legenda usada em todo o documento:**
- 🟢 **Implementado** — existe em código hoje.
- ⚪ **Planejado** — ainda não existe nenhum código; é a direção de design.

O estado real, hoje: o Growth Hub como agrupamento de negócio é inteiramente ⚪ Planejado. O único precedente de código é o **Blog**, e mesmo esse pertence à camada da aplicação atual (`src/core/agents/blog/`), não à fundação da nova plataforma. Isso é repetido ao longo do documento sempre que relevante — nunca presumido.

---

## Capítulo 1 — Visão Geral

**O que é:** o Growth Hub é o agrupamento de negócio responsável por todo o crescimento digital de uma Empresa dentro da Andreia AI Platform — tudo que faz uma Empresa ser encontrada, ganhar tráfego, converter esse tráfego em Cliente e, a partir daí, gerar receita recorrente.

Ele centraliza sete frentes que, hoje, normalmente exigem ferramentas e equipes separadas dentro de uma Empresa:

- **Conteúdo** — o que é produzido para atrair e reter audiência.
- **SEO** — como esse conteúdo é encontrado organicamente.
- **Tráfego** — o volume e a qualidade de visitantes alcançados.
- **Publicidade** — aquisição paga, quando o orgânico não é suficiente ou rápido o bastante.
- **Monetização** — como o tráfego e o conteúdo geram receita direta.
- **Conversão** — a transformação de um visitante anônimo em Lead e, depois, em Cliente.
- **Análise** — a medição de tudo o que acontece nas seis frentes anteriores, para decidir o que fazer a seguir.

**Objetivo:** permitir que uma Empresa opere crescimento digital orientado por dados e assistido por Agentes de IA, sem precisar contratar uma equipe completa de marketing digital, SEO, mídia paga e analytics para começar.

**Benefícios:**
- Redução de custo operacional de crescimento (menos trabalho manual repetitivo: pesquisa de palavra-chave, estruturação de conteúdo, publicação, distribuição).
- Consistência: o mesmo processo disciplinado (§5) roda toda vez, em vez de depender da memória de uma pessoa específica.
- Visibilidade unificada: uma Empresa vê Blog, SEO, Ads e Analytics em um único lugar (Dashboard, §8), em vez de em quatro ferramentas diferentes.

**Problemas que resolve:**
- Fragmentação — hoje, crescimento digital costuma estar espalhado entre várias ferramentas desconectadas (uma para SEO, outra para Ads, outra para Analytics), sem um fluxo único.
- Dependência de especialista — pequenas e médias empresas frequentemente não têm orçamento para manter uma equipe completa de growth; o Growth Hub reduz essa barreira de entrada com Agentes assistindo o trabalho.
- Falta de disciplina de processo — sem um fluxo definido (§5), conteúdo é produzido sem estrutura de SEO, campanhas são lançadas sem medição de retorno, etc.

---

## Capítulo 2 — Objetivos

O Growth Hub existe para gerar, de forma mensurável:

- **Tráfego** — visitantes qualificados chegando aos canais da Empresa (orgânico e pago).
- **Leads** — visitantes identificados, com informação de contato capturada.
- **Vendas** — Leads convertidos em Clientes pagantes (fecha no Business Hub, mas é originado aqui).
- **Autoridade** — reconhecimento de marca e relevância em um nicho, medido por sinais como posição em buscas e engajamento.
- **Receita** — retorno financeiro direto (monetização de conteúdo, ex.: AdSense) e indireto (vendas originadas de Growth).
- **Crescimento contínuo** — o Hub não entrega um resultado pontual, e sim um ciclo que se repete e se otimiza (§5, etapa de Otimização) — cada execução informa a próxima.

Cada objetivo acima é o que orienta a priorização de qualquer funcionalidade futura deste Hub — o mesmo critério já registrado em `docs/PLATFORM_VISION.md` §1 (aumentar faturamento, reduzir trabalho operacional, melhorar decisão, aumentar produtividade da IA) se aplica aqui, com esses seis objetivos como sua tradução para o contexto de crescimento.

---

## Capítulo 3 — Estrutura

Dezoito módulos compõem o Growth Hub:

Blog · SEO · Keyword Research · Google Search Console · Google Analytics · Google Ads · Meta Ads · Pinterest · Pinterest Ads · Google AdSense · Google Business Profile · Landing Pages · Email Marketing · Social Media · YouTube · Web Stories · Performance · Conversão

| Módulo | Estado |
|---|---|
| Blog | 🟢 precedente — `src/core/agents/blog/` (aplicação atual); ⚪ como módulo do Growth Hub |
| SEO | ⚪ |
| Keyword Research | ⚪ |
| Google Search Console | ⚪ |
| Google Analytics | ⚪ |
| Google Ads | ⚪ |
| Meta Ads | ⚪ |
| Pinterest | ⚪ |
| Pinterest Ads | ⚪ |
| Google AdSense | ⚪ |
| Google Business Profile | ⚪ |
| Landing Pages | ⚪ |
| Email Marketing | ⚪ |
| Social Media | ⚪ |
| YouTube | ⚪ |
| Web Stories | ⚪ |
| Performance | ⚪ |
| Conversão | ⚪ |

Nenhum destes 18 tem hoje um módulo dedicado em `src/modules/*`. Os módulos já escaffoldados `marketing`, `communication` e `analytics` (🟢 estrutura, sem lógica — ver `docs/02-SYSTEM_ARCHITECTURE.md` §4/§6) continuam sendo os pontos de entrada mais prováveis para agrupar vários destes 18 quando a implementação começar, como já registrado em `docs/PLATFORM_VISION.md` §3.2 — mas isso é decisão de implementação futura, não deste documento.

**Nota de reconciliação:** a lista original de `docs/PLATFORM_VISION.md` §3.2 tinha 20 itens, incluindo "Bing Webmaster Tools" e "Indexação" como entradas próprias. Esta especificação usa os 18 itens definidos nesta Sprint; "Indexação" aqui é tratada como uma **etapa do fluxo** (§5), não como módulo próprio, e "Bing Webmaster Tools" fica hoje sem um módulo dedicado nesta lista — um gap a resolver explicitamente quando a implementação do SEO técnico for detalhada, para não haver contradição silenciosa entre os dois documentos.

---

## Capítulo 4 — Responsabilidades

O papel de cada módulo, em linguagem de negócio — sem falar de implementação:

- **Blog** — produzir e manter o conteúdo de longa duração da Empresa (artigos), que sustenta SEO orgânico e alimenta Distribuição para outros canais.
- **SEO** — garantir que o conteúdo produzido seja encontrado organicamente nos buscadores; cuida da estrutura técnica e editorial que antecede e sucede a publicação.
- **Keyword Research** — identificar quais termos de busca vale a pena perseguir, antes de qualquer conteúdo ser produzido.
- **Google Search Console** — trazer o dado real de como o site da Empresa está sendo indexado e encontrado pelo Google.
- **Google Analytics** — medir o comportamento de quem chega ao site (de onde veio, o que fez).
- **Google Ads** — aquisição paga em rede de busca e display do Google.
- **Meta Ads** — aquisição paga em Facebook/Instagram.
- **Pinterest** — presença orgânica em Pinterest, tipicamente redirecionando para Blog/Landing Pages.
- **Pinterest Ads** — aquisição paga em Pinterest.
- **Google AdSense** — monetização direta do tráfego do próprio conteúdo, via anúncios exibidos nele.
- **Google Business Profile** — presença e reputação local da Empresa nas buscas e mapas do Google.
- **Landing Pages** — páginas de conversão dedicadas, o destino de campanhas pagas e orgânicas.
- **Email Marketing** — retenção e reengajamento de quem já converteu em Lead, via e-mail.
- **Social Media** — presença e distribuição de conteúdo em redes sociais (fora de Pinterest, tratado à parte por ter Ads própria).
- **YouTube** — conteúdo em vídeo, com lógica de SEO própria (busca dentro do YouTube).
- **Web Stories** — formato de conteúdo curto e visual, geralmente derivado de conteúdo já existente do Blog.
- **Performance** — visão consolidada de desempenho de todos os canais pagos e orgânicos, sem ser ela mesma um canal.
- **Conversão** — a disciplina de medir e melhorar a taxa na qual visitantes viram Leads/Clientes, atravessando todos os módulos acima.

---

## Capítulo 5 — Fluxo do Growth Hub

```
Pesquisa → Planejamento → Conteúdo → SEO → Imagem → Vídeo → Publicação → Distribuição → Indexação → Monitoramento → Otimização → Monetização → Dashboard
```

Este é o fluxo **geral** do Hub — os fluxos específicos já documentados em `docs/05-ECOSYSTEM_MAP.md` (Blog, SEO, Google Ads, Meta Ads, Pinterest, AdSense) são instâncias particulares dele, não fluxos concorrentes.

| Etapa | O que acontece |
|---|---|
| **Pesquisa** | Identificação de tema/oportunidade — intenção de busca, concorrência, lacuna de conteúdo. |
| **Planejamento** | Decisão do que produzir e em qual formato (Blog, vídeo, social, Web Story), com meta associada (tráfego, lead, autoridade). |
| **Conteúdo** | Produção do material central (texto). |
| **SEO** | Estruturação técnica/editorial do conteúdo (palavra-chave alvo, hierarquia de títulos, meta descrição). |
| **Imagem** | Produção/curadoria de imagens que acompanham o conteúdo. |
| **Vídeo** | Quando aplicável, produção ou embutimento de vídeo relacionado. |
| **Publicação** | Envio ao destino real (WordPress, Social Media, YouTube — via Integration Hub, §6). |
| **Distribuição** | Propagação ativa para outros canais (e-mail, redes sociais, Pinterest) além do canal de publicação original. |
| **Indexação** | Confirmação de que buscadores encontraram e catalogaram o conteúdo publicado. |
| **Monitoramento** | Acompanhamento contínuo de posição, tráfego e engajamento depois de publicado. |
| **Otimização** | Ajuste do conteúdo/campanha com base no que o Monitoramento revelou — fecha o ciclo de melhoria contínua. |
| **Monetização** | Conversão do resultado em receita direta (AdSense) ou indireta (Lead/Venda, via Business Hub). |
| **Dashboard** | Todo o ciclo é refletido em tempo real na interface (§8). |

---

## Capítulo 6 — Integrações

Todas ⚪ Planejado — nenhuma implementada hoje.

| Integração | Participação no Growth Hub |
|---|---|
| **WordPress** | Destino de Publicação do módulo Blog. |
| **Google** | Cobre múltiplos módulos: Search Console (indexação), Analytics (medição), Ads (aquisição paga), AdSense (monetização), Business Profile (presença local). |
| **Meta** | Meta Ads (aquisição paga) e Social Media (Facebook/Instagram orgânico). |
| **Pinterest** | Pinterest (orgânico) e Pinterest Ads (pago). |
| **YouTube** | Módulo YouTube — publicação e dados de desempenho de vídeo. |
| **WhatsApp** | Ponte de Distribuição/retenção quando um Lead gerado pelo Growth Hub precisa de contato direto — uso compartilhado com o CRM do Business Hub. |
| **OpenAI / Claude / Gemini** | Provedores de IA que sustentam os Agentes deste Hub (§7) — geração de Conteúdo, análise de SEO, sugestão de otimização. Único ponto com precedente real: 🟢 `src/core/ai/AIProviderFactory.ts` já antecipa `openai` e `claude`; `src/providers/gemini/` já reserva a pasta correspondente — hoje sempre caindo em `MockAIProvider`. |
| **Microsoft** | Bing Webmaster Tools — equivalente ao Search Console do Google, para o buscador Bing. |
| **n8n / Zapier** | Pontes de automação externas, para quando um fluxo do Growth Hub precisa se conectar a uma ferramenta de terceiro que não tem Conector próprio — uso transversal, compartilhado com Operations/Marketplace Hub. |

Toda integração segue a regra arquitetural já fixada: nenhum módulo acessa uma API externa diretamente, sempre através de um Connector (`docs/02-SYSTEM_ARCHITECTURE.md` §7).

---

## Capítulo 7 — IA

Como os Agentes usarão o Growth Hub — ⚪ Planejado, nenhum Agente existe hoje:

- **CEO Agent** — consome o resultado consolidado do Hub (KPIs, §9) para decidir prioridade e orçamento de crescimento; não executa nenhuma etapa operacional do fluxo (§5) diretamente.
- **Marketing Agent** — dono do Planejamento: decide o que produzir, com que meta, e aciona os demais Agentes deste Hub.
- **SEO Agent** — executa Pesquisa e a etapa de SEO do fluxo: define palavra-chave alvo, estrutura, e monitora Indexação/posição.
- **Designer Agent** — produz Imagem e, quando aplicável, Vídeo/Web Stories.
- **Publisher Agent** — executa Publicação e Distribuição, sempre através dos Connectors do Integration Hub — e, para qualquer publicidade paga, depende de um checkpoint de Aprovação humana (Operations Hub) antes de ativar gasto real.
- **Analytics Agent** — executa Monitoramento e alimenta a etapa de Otimização com dados; é quem calcula os KPIs (§9) em tempo real.
- **CRM Agent** — recebe os Leads gerados pelo Hub e os processa no Business Hub — fronteira entre os dois Hubs.
- **Finance Agent** — registra o custo de mídia paga e a receita de Monetização, também no Business Hub — mesma fronteira.

---

## Capítulo 8 — Dashboard

Como o Growth Hub aparece na interface (`docs/03-DASHBOARD_V2.md`):

- **Sidebar** — "Growth Hub" como entrada expansível, revelando os 18 módulos ativados para o Workspace (§3) — só os que a Empresa efetivamente contratou.
- **Widgets** — um por módulo com resumo operacional imediato: ex. widget de Blog mostra "conteúdo agendado"; widget de Google Ads mostra "campanhas ativas e gasto do dia"; widget de Analytics mostra "tráfego das últimas 24h".
- **Janelas** — cada módulo, ao ser aberto para trabalho de fato (não só visão resumida), abre como Janela — pode ser movida, redimensionada, fixada, maximizada, minimizada e agrupada com outras (mesmo sistema de Janelas de `docs/03-DASHBOARD_V2.md`).
- **Painéis** — o Painel Direito do Dashboard mostra, quando o Growth Hub está em foco, Campanhas ativas e Leads recém-gerados (dado já compartilhado com o Painel Direito geral).
- **Alertas** — quedas bruscas de posição em SERP, campanha pausada por esgotamento de orçamento, erro de publicação — aparecem nas Notificações do Header/Painel Direito.
- **Indicadores** — os KPIs do Capítulo 9, exibidos de forma consolidada, tanto no Painel Direito quanto na Barra Inferior quando relevante ao runtime (ex.: fila de publicações pendentes).

---

## Capítulo 9 — KPIs

Todos ⚪ Planejado — nenhum é medido hoje.

| KPI | Definição |
|---|---|
| **Usuários** | Visitantes únicos que chegaram aos canais da Empresa em um período. |
| **Sessões** | Visitas totais, incluindo retornos do mesmo usuário. |
| **CTR** (Click-Through Rate) | Percentual de quem viu um link/anúncio e efetivamente clicou. |
| **Conversão** | Percentual de visitantes que completaram a ação desejada (virar Lead, comprar). |
| **Leads** | Quantidade de visitantes que se tornaram Lead identificado. |
| **ROI** (Return on Investment) | Retorno total gerado dividido pelo investimento total, em qualquer canal. |
| **ROAS** (Return on Ad Spend) | Receita gerada especificamente por mídia paga, dividida pelo gasto em mídia. |
| **Receita** | Valor financeiro total gerado, atribuível ao Growth Hub. |
| **RPM** (Revenue per Mille) | Receita a cada mil impressões/visualizações — relevante para Monetização (AdSense). |
| **CPC** (Custo por Clique) | Quanto custa, em média, cada clique em uma campanha paga. |
| **CPA** (Custo por Aquisição) | Quanto custa, em média, cada conversão (Lead ou Venda) obtida. |
| **CAC** (Custo de Aquisição de Cliente) | Custo total de aquisição dividido pelo número de novos Clientes — cruza com o Business Hub. |
| **LTV** (Lifetime Value) | Receita total esperada de um Cliente ao longo de todo o relacionamento — também cruza com o Business Hub. |
| **Posição média** | Posição média de ranqueamento nos resultados de busca (SERP), por palavra-chave monitorada. |
| **Impressões** | Quantas vezes um conteúdo/anúncio foi exibido, independentemente de clique. |
| **Cliques** | Quantidade absoluta de cliques recebidos. |
| **Indexação** | Percentual de páginas publicadas que já foram efetivamente indexadas pelos buscadores. |

---

## Capítulo 10 — Permissões

Papéis (`docs/02A-DOMAIN_MODEL.md`, conceito de Papéis) específicos ao contexto do Growth Hub — ⚪ Planejado, nenhum controle de acesso existe hoje:

| Papel | Acesso típico dentro do Growth Hub |
|---|---|
| **Administrador** | Acesso total ao Hub — ativa/desativa módulos, define orçamento de mídia paga, aprova gasto. |
| **Marketing** | Planeja e acompanha Campanhas e Conteúdo; não necessariamente aprova gasto de mídia paga sozinho. |
| **SEO** | Acesso de trabalho aos módulos de SEO, Keyword Research, Search Console; leitura de Analytics. |
| **Editor** | Produz e edita Conteúdo (Blog, Social Media, Web Stories); sem acesso a configuração de Ads. |
| **Analista** | Acesso de leitura a todos os módulos de medição (Analytics, Performance, Conversão, KPIs); sem permissão de publicar ou gastar. |
| **Financeiro** | Acesso de leitura a custo de mídia e receita de Monetização — sem acesso operacional ao restante do Hub. |
| **CEO** | Leitura consolidada de todos os KPIs (§9) e Dashboard (§8); aprovação final de decisões de maior impacto (ex.: orçamento de mídia). |

---

## Capítulo 11 — Roadmap

O Growth Hub, quando entrar em implementação, é dividido em sete fases:

| Fase | Foco |
|---|---|
| **Fase 1 — Infraestrutura** | Módulo Growth Hub como scaffold em `src/modules/*` (ou absorvido por `marketing`/`communication`/`analytics` já existentes), seguindo `IModule` — sem lógica de negócio, mesmo padrão disciplinado usado em `docs/02-SYSTEM_ARCHITECTURE.md`. |
| **Fase 2 — Blog** | Primeiro módulo com lógica real — já tem o maior precedente de código (`src/core/agents/blog/`) e é o fluxo mais detalhado (§5; `docs/05-ECOSYSTEM_MAP.md` Capítulo 3). |
| **Fase 3 — SEO** | Keyword Research, estrutura SEO, Search Console — depende de Blog já produzindo conteúdo para ter o que otimizar. |
| **Fase 4 — Analytics** | Google Analytics, Performance, Conversão — instrumentação de medição sobre o que Blog/SEO já produziram. |
| **Fase 5 — Ads** | Google Ads, Meta Ads, Pinterest Ads, Landing Pages — aquisição paga, que se beneficia de já ter Analytics/Conversão funcionando para medir retorno. |
| **Fase 6 — Monetização** | Google AdSense — fecha o ciclo de receita direta do conteúdo já publicado e indexado. |
| **Fase 7 — IA** | Agentes do Capítulo 7 assumindo progressivamente as etapas do fluxo (§5), começando pelas mais mecânicas (Publicação, Distribuição) até as mais estratégicas (Planejamento). |

Esta ordenação prioriza sempre o módulo que já tem o maior precedente de código ou a maior dependência de dado das fases anteriores — reflete o mesmo princípio disciplinado usado desde a fundação da plataforma (infraestrutura antes de lógica, ver `docs/02-SYSTEM_ARCHITECTURE.md`).

---

## Capítulo 12 — Melhores Práticas

Princípios arquiteturais gerais (`docs/02-SYSTEM_ARCHITECTURE.md` §13), aplicados especificamente ao Growth Hub:

- **Baixo acoplamento** — nenhum módulo do Growth Hub deve depender diretamente da lógica interna de outro; SEO não deve precisar saber como Blog está implementado, apenas consumir o Conteúdo que ele produz.
- **Modularidade** — uma Empresa deve poder ativar só Blog+SEO sem ser obrigada a ativar Ads; cada um dos 18 módulos (§3) é independente.
- **Eventos** — a passagem de uma etapa do fluxo (§5) para a próxima é sinalizada por evento (ex.: "conteúdo pronto" dispara a etapa de SEO), nunca por chamada direta entre módulos — mesmo princípio já fixado para o EventBus (`docs/02-SYSTEM_ARCHITECTURE.md` §10).
- **Automação** — todo o fluxo do Capítulo 5, uma vez maduro, deve ser executável como uma Automação/Workflow (Operations Hub), não uma sequência de ações manuais.
- **Observabilidade** — todo Conteúdo, Campanha e Publicação deve ser rastreável do início ao fim (quem/o que produziu, quando publicou, qual resultado teve) — sem isso, os KPIs do Capítulo 9 não são confiáveis.
- **Escalabilidade** — um 19º módulo de Growth deve poder ser adicionado seguindo o mesmo contrato dos 18 já existentes, sem exigir mudança em nenhum módulo já implementado (mesmo princípio de `IModule`, `docs/02-SYSTEM_ARCHITECTURE.md` §12).

---

## Capítulo 13 — Riscos

- **Dependência de APIs externas** — todo o Hub depende de sistemas de terceiros (Google, Meta, Pinterest...) que a plataforma não controla; uma indisponibilidade externa afeta diretamente o Growth Hub.
- **Mudanças nas plataformas** — provedores externos mudam API, regras de ranqueamento e políticas de anúncio sem aviso prévio; o Hub precisa tolerar essas mudanças sem quebrar módulos que não foram afetados.
- **Custos** — mídia paga (Ads) tem custo direto e variável; sem controle rígido de orçamento e Aprovação (Operations Hub), o risco financeiro é real.
- **Limites** — toda API externa tem limite de taxa de chamadas (rate limit); um uso mal projetado de Automação pode esgotar esse limite e paralisar o Hub inteiro.
- **Políticas** — plataformas de Ads/conteúdo têm políticas de uso que, se violadas (mesmo sem intenção, por um Agente operando de forma autônoma), podem suspender a conta da Empresa.
- **Privacidade** — dados de Leads e Clientes coletados via Growth Hub são dados pessoais e exigem tratamento cuidadoso, incluindo o que é enviado a integrações de terceiros.
- **LGPD** — toda coleta, armazenamento e uso de dado pessoal (Lead, Cliente) precisa respeitar a Lei Geral de Proteção de Dados — consentimento, finalidade declarada, direito de exclusão. Este é o risco de maior exposição legal de todo o Hub, por lidar diretamente com dado de terceiros.

---

## Capítulo 14 — Visão de Longo Prazo

Como o Growth Hub pode evoluir além do cliente piloto (JardFlores Decor):

- **Empresas** — uso individual por uma única Empresa, o cenário validado primeiro (cenário atual do roadmap, `docs/02-SYSTEM_ARCHITECTURE.md` §14, Épico K).
- **Agências** — um único operador humano gerenciando o Growth Hub de várias Empresas-cliente ao mesmo tempo, através de múltiplos Workspaces — exige visão consolidada entre Workspaces que não existe hoje em nenhum documento.
- **Franquias** — uma rede de unidades da mesma marca compartilhando estratégia de Growth Hub, mas com dados/resultados segregados por unidade (Workspace por franquia, Empresa-mãe consolidando).
- **Multiempresa** — pré-requisito técnico para os três cenários acima; corresponde diretamente ao Épico K do roadmap oficial (`docs/02-SYSTEM_ARCHITECTURE.md` §14).
- **Marketplace** — plugins de terceiros estendendo o Growth Hub com integrações ou módulos que a Andreia AI Platform não construiu nativamente (ex.: um Conector para uma rede de anúncios regional) — corresponde ao Épico J do roadmap oficial, e ao Marketplace Hub já registrado em `docs/PLATFORM_VISION.md` §3.

---

## Capítulo 15 — Glossário

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
