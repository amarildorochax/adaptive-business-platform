# SEO — Especificação Funcional do Módulo

**Andreia AI Platform** · Growth Hub
Documentação funcional do módulo SEO — o segundo módulo do Growth Hub a ser especificado em detalhe.

Este documento é uma **especificação funcional**, não uma implementação. Relaciona-se com `docs/requirements/growth/GROWTH_HUB.md` (SEO é um dos 18 módulos ali listados) e com `docs/requirements/growth/BLOG.md` Capítulo 8, que já definiu a fronteira de responsabilidade entre Blog e SEO — este documento não contradiz aquela fronteira, apenas a aprofunda do lado do SEO.

**Legenda usada em todo o documento (três níveis, conforme pedido nesta Sprint):**
- 🟢 **Implementado** — lógica real, funcional, executável hoje.
- 🟡 **Parcial** — existe algum indício real no código (um nome declarado, um valor de enum, uma string em uma lista, um dado mockado na interface), mas sem nenhuma lógica de negócio por trás.
- ⚪ **Planejado** — não existe nenhum vestígio no código; é direção de design.

---

## Missão do módulo

O módulo SEO **não é** um conjunto de configurações. É um **Sistema Inteligente de Otimização para Busca**, cujo objetivo é aumentar Tráfego Orgânico, Autoridade, Indexação, Conversões e Receita.

---

## Nota metodológica — investigação realizada no código

Antes de escrever qualquer especificação, investiguei o repositório inteiro em busca de precedente real de SEO, cobrindo os termos explicitamente pedidos: `SEO`, `Rank Math`, `Schema`, `Metadata`, `Keyword`, `Search Console`, `Indexação`, `Google`. Os achados, sem nenhuma suposição:

| Achado | Onde | Natureza real |
|---|---|---|
| `AgentType.SEO = "seo"` | `src/core/agents/registry/AgentTypes.ts` | 🟡 Um valor de enum declarado, ao lado de `BLOG`, `PINTEREST`, `INSTAGRAM` etc. — **nunca importado em nenhum outro arquivo além do próprio barrel** (`registry/index.ts`). Não existe nenhum `SeoAgent`, nenhum `SeoAgentExecutor`, nenhum `case "seo"` em `AgentDispatcher`. |
| `"SEO Agent"` na interface | `src/components/rightpanel/RightPanel.tsx`, `src/components/AgentPanel.tsx` | 🟡 **Dado inteiramente mockado** — um array hardcoded dentro do componente React, sem `useState`, sem chamada a `AgentRegistry`, sem qualquer fonte de dado real. Em `AgentPanel.tsx`, o status exibido é literalmente a string fixa `"Online"` — não reflete nenhum agente executando de verdade. Isso é uma armadilha para quem só olhar a tela: parece que existe um SEO Agent ativo, mas é decoração. |
| `GOOGLE_ANALYZED`, `META_ANALYZED`, `PINTEREST_ANALYZED` | `src/core/events/EventTypes.ts` (grupo `// Traffic`) | 🟡 Nomes de evento declarados no catálogo — **nunca emitidos (`eventBus.emit`) nem assinados (`eventBus.subscribe`) em nenhum lugar do código.** Vocabulário reservado, sem uso. |
| `"Rank Math"` | `src/core/agents/blog/BlogAgent.ts`, array `tools` | 🟡 Já registrado em `docs/requirements/growth/BLOG.md` §7 — uma string dentro de uma lista de ferramentas declaradas do Blog Agent, sem nenhum código que efetivamente chame o plugin Rank Math. |
| `Schema`, `Metadata` (no sentido de SEO), `Keyword`, `Search Console`, `Indexação`, `sitemap`, `robots.txt`, `canonical`, `hreflang` | — | ⚪ **Nenhuma ocorrência em todo `src/`.** Nenhum vestígio, nem mesmo vocabulário reservado. |

**Conclusão da investigação:** não existe nenhuma lógica de SEO implementada. O que existe é **vocabulário parcial e dado de interface mockado** — três pontos (`AgentType.SEO`, os `*_ANALYZED` events, a entrada "SEO Agent" na UI) que sinalizam que a intenção de um módulo/agente de SEO já estava prevista desde antes desta especificação, mas nenhum deles tem uma linha de lógica de negócio por trás. Nada disso é reaproveitável como base de implementação — é, na melhor das hipóteses, um lembrete de nomenclatura a manter consistente quando a implementação real começar.

---

## Capítulo 1 — Visão Geral

**O que é:** o módulo SEO é o sistema responsável por decidir **o quê** e **para onde** o conteúdo da Empresa deve mirar em termos de busca orgânica — pesquisa de oportunidade, organização temática, estrutura técnica e monitoramento contínuo de resultado. Como já definido em `docs/requirements/growth/BLOG.md` §8: o SEO decide direção; módulos como o Blog decidem como o conteúdo em si é produzido e mantido dentro dessa direção.

**Objetivos:** ver Capítulo 2.

**Escopo:** pesquisa e priorização de palavras-chave, organização de conteúdo em Clusters temáticos, SEO semântico (entidades, contexto), otimização on-page (título, meta description, heading, URL, alt text, Schema), monitoramento de posição/indexação, e detecção de problemas (canibalização, conteúdo desatualizado).

**Benefícios:**
- Direção de conteúdo baseada em oportunidade real de busca, não em suposição.
- Conteúdo organizado por Cluster em vez de artigos isolados sem relação entre si — constrói autoridade temática de forma deliberada.
- Detecção precoce de problemas (canibalização, queda de posição) antes que afetem tráfego de forma significativa.

**Problemas que resolve:**
- Conteúdo produzido sem intenção de busca clara (resolvido ao acoplar Keyword Research, §4, à etapa de Palavras-chave do Ciclo de Vida do Blog).
- Concorrência interna entre os próprios conteúdos da Empresa por uma mesma palavra-chave (Canibalização, §3).
- Conteúdo publicado e esquecido, perdendo posição com o tempo sem que ninguém perceba (Conteúdo Desatualizado, §3, alimentando a etapa de Atualização do Blog).

**Limites:**
- O SEO não produz o conteúdo em si — isso é responsabilidade do Blog (e, no futuro, de outros módulos de conteúdo do Growth Hub).
- O SEO não gerencia mídia paga — Google Ads é um módulo separado, ainda que compartilhe dado de palavra-chave com o SEO.
- O SEO não decide orçamento nem aprova gasto.

---

## Capítulo 2 — Objetivos

- **Descobrir oportunidades** — identificar palavras-chave e tópicos com potencial de tráfego ainda não explorados pela Empresa.
- **Melhorar posicionamento** — subir a posição média nos resultados de busca para os termos já perseguidos.
- **Organizar conteúdos** — estruturar o catálogo de conteúdo em Clusters coerentes (§5), não uma lista solta de artigos.
- **Eliminar canibalização** — garantir que dois conteúdos da mesma Empresa não compitam entre si pela mesma palavra-chave.
- **Melhorar CTR** — aumentar a taxa de clique nos resultados de busca, via título/meta description mais eficazes.
- **Melhorar experiência** — Core Web Vitals e demais sinais técnicos que afetam tanto ranqueamento quanto a experiência real de quem visita.
- **Gerar crescimento sustentável** — resultado que se mantém e composto ao longo do tempo, não picos isolados.

---

## Capítulo 3 — Estrutura

Componentes funcionais do módulo — todos ⚪ Planejado, exceto onde indicado (ver também "Nota metodológica" acima):

| Componente | Função |
|---|---|
| **Pesquisa de Palavras-chave** | Ver Capítulo 4. |
| **Cluster de Conteúdo** | Ver Capítulo 5. |
| **Entidades** | Conceitos do mundo real associados ao conteúdo (pessoas, lugares, produtos, marcas) — base do SEO Semântico (§6). |
| **SEO Semântico** | Ver Capítulo 6. |
| **Links Internos** | Conexões entre conteúdos da própria Empresa, reforçando a estrutura de Cluster. |
| **Links Externos** | Backlinks — tanto os recebidos de terceiros (autoridade) quanto os concedidos a terceiros dentro do próprio conteúdo. |
| **Schema.org** | Dados estruturados aplicados ao conteúdo publicado, para melhorar como ele aparece na SERP (§7). |
| **Meta Tags** | Título, meta description e demais tags de cabeçalho — ver Otimização (§7). |
| **Rich Results** | Resultados enriquecidos na busca (estrelas, FAQ, receita) — consequência direta de Schema bem aplicado. |
| **Canibalização** | Detecção automática de dois conteúdos competindo pela mesma palavra-chave — requer visão sobre todo o catálogo do Blog (`docs/requirements/growth/BLOG.md` §8). |
| **Conteúdo Desatualizado** | Identificação de conteúdo com queda de performance, alimentando a etapa de Atualização do Ciclo de Vida do Blog. |
| **Oportunidades** | Lista acionável de recomendações (nova palavra-chave, novo Cluster, conteúdo a atualizar) — aparece no Dashboard (§11). |
| **Auditoria** | Verificação técnica ampla do site (erros de indexação, problemas de Schema, Core Web Vitals). |
| **Relatórios** | Consolidação periódica dos dados de Monitoramento (§10) para leitura humana. |
| **Configurações** | Parâmetros do módulo — integrações ativas (§9), frequência de auditoria, limites de alerta. |

---

## Capítulo 4 — Keyword Research

Todos os subcomponentes abaixo são ⚪ Planejado:

- **Pesquisa** — descoberta de termos relevantes ao negócio da Empresa, a partir de um tema ou de uma lacuna identificada.
- **Volume** — quantas buscas um termo recebe em um período — indica potencial de tráfego.
- **Intenção** — o que quem busca aquele termo realmente quer (informação, comparação, compra) — determina que tipo de conteúdo deve ser produzido.
- **Dificuldade** — o quão competitivo é ranquear para aquele termo, dada a concorrência já posicionada.
- **Sazonalidade** — variação do volume de busca ao longo do tempo (ex.: termos que só têm relevância em determinada época).
- **Agrupamento** — organização de termos relacionados em um mesmo grupo, base para formar um Cluster (§5).
- **Priorização** — decisão de qual termo perseguir primeiro, cruzando Volume, Dificuldade e Intenção com o Objetivo de negócio (§2).

---

## Capítulo 5 — Content Clusters

⚪ Planejado por completo:

- **Páginas Pilar** — o conteúdo central e mais abrangente de um tema, ao qual todo o resto do Cluster se conecta.
- **Artigos Satélites** — conteúdos mais específicos, cada um aprofundando um subtema da Página Pilar.
- **Relacionamentos** — a malha de Links Internos (§3) entre Página Pilar e Artigos Satélites, e entre Satélites relacionados entre si.
- **Autoridade temática** — o resultado agregado de um Cluster bem construído: o buscador passa a reconhecer a Empresa como referência naquele tema como um todo, não só em um artigo isolado.

---

## Capítulo 6 — SEO Semântico

⚪ Planejado por completo:

- **Entidades** — conceitos nomeáveis (produto, marca, lugar, pessoa) que o conteúdo referencia, reconhecíveis por buscadores independentemente da palavra-chave exata usada.
- **NLP** (Processamento de Linguagem Natural) — análise do significado do conteúdo, não só das palavras literais nele.
- **Contexto** — o entendimento de que uma mesma palavra tem sentidos diferentes dependendo do que a cerca no texto.
- **LSI** (Latent Semantic Indexing) — termos semanticamente relacionados ao termo principal, usados para reforçar relevância sem repetição mecânica da mesma palavra-chave.
- **Relacionamentos** — como Entidades se conectam entre si dentro do conteúdo (ex.: um produto e a categoria à qual pertence).
- **Google Knowledge Graph** — a base de conhecimento do Google sobre Entidades reais — o SEO Semântico busca alinhamento com ela, para que o conteúdo seja interpretado corretamente, não só indexado.

---

## Capítulo 7 — Otimização

Elementos técnicos otimizados em cada conteúdo — todos ⚪ Planejado:

- **Título** — o principal sinal de relevância tanto para o buscador quanto para quem decide clicar.
- **Meta Description** — o resumo exibido na SERP, determinante para CTR (§2).
- **Heading** — hierarquia H1-H2-H3 que estrutura o conteúdo (já referenciada como "Estrutura" no Ciclo de Vida do Blog).
- **URL** — endereço limpo e descritivo do conteúdo.
- **Alt Text** — descrição textual de imagens, relevante tanto para acessibilidade quanto para indexação de imagem.
- **Imagens** — otimização de peso/formato, que afeta Core Web Vitals (§10).
- **Vídeos** — mesma lógica de otimização técnica, quando aplicável.
- **Schema** — dados estruturados aplicados ao conteúdo (§3).
- **Performance** — velocidade de carregamento e demais sinais técnicos que compõem Core Web Vitals.

---

## Capítulo 8 — IA

Responsabilidades dos Agentes dentro do módulo SEO — todos ⚪ Planejado. **Importante:** apesar de existir uma entrada "SEO Agent" mockada na interface hoje (ver "Nota metodológica", acima), ela não corresponde a nenhuma responsabilidade real das listadas abaixo — é preciso tratá-la como não-existente para efeito de implementação.

- **CEO Agent** — consome o resultado consolidado (KPIs, §12) para decidir prioridade de investimento em SEO; não executa nenhuma etapa operacional.
- **SEO Agent** — dono da maior parte do módulo: executa Keyword Research (§4), define Clusters (§5), aplica SEO Semântico (§6) e monitora resultado (§10). É o Agente mais amplamente responsável dentro deste módulo.
- **Marketing Agent** — cruza as Oportunidades identificadas pelo SEO Agent com prioridade de negócio, decidindo o que de fato vira Ideia no Blog.
- **Redator Agent** — recebe a Estrutura e as Palavras-chave definidas pelo SEO Agent como insumo obrigatório antes de escrever (fronteira já definida em `docs/requirements/growth/BLOG.md` §8).
- **Publisher Agent** — aplica Schema e Meta Tags (§7) no momento da publicação, com base no que o SEO Agent definiu.
- **Analytics Agent** — cruza os dados de Monitoramento (§10) com o restante da medição do Growth Hub, para reportar impacto de SEO nos KPIs de negócio (tráfego, conversão, receita).

---

## Capítulo 9 — Integrações

Todas ⚪ Planejado — nenhuma implementada hoje.

| Integração | Papel no módulo SEO |
|---|---|
| **Blog** | Não é uma integração externa, mas o consumidor direto do SEO — recebe Palavras-chave e Estrutura, entrega conteúdo publicado de volta para Monitoramento. |
| **Google Search Console** | Fonte primária de dado real de indexação, posição, impressões e cliques (§10) — sem ela, o módulo não tem como medir resultado de verdade. |
| **Google Analytics** | Mede o comportamento de quem chega via busca orgânica — cruza com o dado do Search Console para entender não só "achou", mas "o que fez depois". |
| **Google Business Profile** | Relevante para SEO local — presença em buscas e mapas, com sinais próprios de otimização (diferente do SEO de conteúdo). |
| **Google Ads** | Compartilha dado de palavra-chave com o SEO (o que já performa bem pago pode indicar oportunidade orgânica, e vice-versa) — sem sobreposição de responsabilidade de execução. |
| **WordPress** | Onde as Meta Tags e o Schema (§7) são de fato aplicados ao conteúdo publicado, via o mesmo Connector já usado pelo Blog. |
| **Rank Math** | Plugin de SEO do WordPress — 🟡 já aparece como ferramenta declarada do Blog Agent (`BlogAgent.ts`), mas sem nenhuma chamada real. Seu papel funcional seria a aplicação técnica de Meta Tags/Schema dentro do próprio WordPress, possivelmente como uma extensão do Connector WordPress em vez de um Connector próprio — decisão de arquitetura ainda em aberto (mesmo gap já registrado em `docs/requirements/growth/BLOG.md` §7). |
| **Claude / OpenAI / Gemini** | Provedores de IA que sustentam o SEO Agent (§8) — mesmo precedente parcial já documentado em `docs/requirements/growth/BLOG.md` §7 (`AIProviderFactory.ts` antecipa `openai`/`claude`; `src/providers/gemini/` reserva a pasta) — nenhum uso específico de SEO nesse precedente, apenas a fundação de provedor de IA compartilhada com o Blog. |

---

## Capítulo 10 — Monitoramento

O que o módulo acompanha continuamente — ⚪ Planejado:

- **Posições** — ranqueamento de cada palavra-chave monitorada, ao longo do tempo.
- **CTR** — taxa de clique por consulta/página, vinda do Search Console.
- **Impressões** — quantas vezes o conteúdo apareceu nos resultados de busca.
- **Cliques** — volume absoluto de cliques recebidos.
- **Páginas** — desempenho por página individual do site.
- **Consultas** — os termos de busca reais que levaram tráfego (frequentemente diferentes das palavras-chave alvo originais).
- **Core Web Vitals** — métricas técnicas de performance/experiência que afetam ranqueamento.
- **Erros** — falhas de rastreamento/indexação sinalizadas pelo Search Console.
- **Cobertura** — quantas páginas do site estão de fato indexadas versus o total existente.

---

## Capítulo 11 — Dashboard

O que o módulo SEO envia ao Dashboard (`docs/03-DASHBOARD_V2.md`) — ⚪ Planejado:

- **Alertas** — queda brusca de posição, erro de indexação, problema técnico crítico (Core Web Vitals).
- **Oportunidades** — recomendações acionáveis geradas pelo SEO Agent (nova palavra-chave, Cluster incompleto, conteúdo candidato a Atualização).
- **Quedas** — conteúdos que perderam posição/tráfego recentemente.
- **Ganhos** — conteúdos que subiram de posição/tráfego recentemente — sinal de que algo está funcionando e pode ser replicado.
- **KPIs** — indicadores do Capítulo 12, exibidos de forma consolidada no widget de SEO (`docs/requirements/growth/GROWTH_HUB.md` §8).

---

## Capítulo 12 — KPIs

Todos ⚪ Planejado:

| KPI | Definição |
|---|---|
| **Impressões** | Quantas vezes o conteúdo apareceu em resultados de busca. |
| **Cliques** | Volume absoluto de cliques recebidos a partir da busca. |
| **CTR** | Percentual de impressões que viraram clique. |
| **Posição Média** | Ranqueamento médio, agregado por palavra-chave ou por período. |
| **Tráfego** | Visitantes originados especificamente de busca orgânica. |
| **Sessões** | Visitas totais originadas de busca orgânica, incluindo retornos. |
| **Conversão** | Percentual desse tráfego que completou a ação desejada. |
| **Leads** | Quantidade de Leads originados via busca orgânica. |
| **Receita** | Valor financeiro atribuível a tráfego de origem orgânica. |
| **Conteúdo atualizado** | Quantos conteúdos passaram por Atualização em um período, por sinal do SEO. |
| **Conteúdo otimizado** | Quantos conteúdos já passaram pela Otimização completa (§7) versus o total do catálogo. |
| **Palavras-chave** | Quantidade de termos ativamente monitorados/ranqueados pela Empresa. |

---

## Capítulo 13 — Permissões

Papéis específicos ao módulo SEO — ⚪ Planejado:

| Papel | Acesso típico |
|---|---|
| **Administrador** | Acesso total — configurações, integrações, papéis. |
| **SEO** | Acesso operacional completo: Keyword Research, Clusters, Otimização, Monitoramento. |
| **Marketing** | Acesso de leitura a Oportunidades e KPIs; prioriza o que vira Ideia no Blog junto com o SEO. |
| **Editor** | Consome Palavras-chave/Estrutura definidas pelo SEO (mesmo papel já descrito em `docs/requirements/growth/BLOG.md` §12); sem acesso de edição ao módulo SEO em si. |
| **Analista** | Leitura de Monitoramento, KPIs e Relatórios; sem permissão de alterar configuração. |
| **CEO** | Leitura consolidada; aprovação de mudanças de maior impacto (ex.: reestruturação de Cluster). |

---

## Capítulo 14 — Roadmap

| Fase | Foco |
|---|---|
| **Fase 1 — Pesquisa** | Keyword Research (§4) como scaffold sobre `IModule`, sem lógica de negócio — primeiro passo, porque toda etapa seguinte depende de palavra-chave definida. |
| **Fase 2 — Clusters** | Content Clusters (§5) — organização do que a Pesquisa já descobriu. |
| **Fase 3 — Otimização** | Aplicação técnica (§7) sobre conteúdo já existente no Blog. |
| **Fase 4 — Search Console** | Primeira integração real do módulo — dado de indexação/posição de verdade, fechando o loop de Monitoramento (§10). |
| **Fase 5 — Analytics** | Cruzamento com comportamento de tráfego — completa a medição de resultado. |
| **Fase 6 — IA** | SEO Agent (§8) assumindo progressivamente Pesquisa, Clusters e Monitoramento — nesta ordem, porque não há nenhum precedente real de código (diferente do Blog, cuja etapa de Redação já tem execução real) — a "Nota metodológica" no início deste documento confirma que este módulo parte de zero absoluto de lógica. |

---

## Capítulo 15 — Dependências

| Dependência | Natureza |
|---|---|
| **Growth Hub** | O SEO é um módulo deste Hub — depende dele para agrupamento e navegação. |
| **Blog** | Consumidor direto do SEO (§8) — sem Blog, o SEO não tem sobre o que atuar. |
| **Search Console** | Fonte primária de dado real de resultado (§9, §10). |
| **Analytics** | Complementa o dado de resultado com comportamento de tráfego. |
| **WordPress** | Onde Meta Tags/Schema são de fato aplicados (§9). |
| **Integration Hub** | Portão obrigatório para toda integração externa do Capítulo 9. |
| **AI Hub** | Sustenta o SEO Agent e os demais Agentes do Capítulo 8. |

---

## Capítulo 16 — Melhores Práticas

- **Baixo acoplamento** — o SEO não conhece a implementação interna do Blog; troca apenas Palavras-chave/Estrutura (saída) e resultado de Monitoramento (entrada), via contrato, nunca via chamada direta.
- **Eventos** — a transição de "conteúdo publicado" para "início de Monitoramento" deve ser sinalizada por evento, não por polling manual — mesmo princípio já fixado em `docs/02-SYSTEM_ARCHITECTURE.md` §10.
- **Automação** — Auditoria (§3) e Monitoramento (§10), uma vez maduros, devem rodar como Workflow recorrente (Operations Hub), não como ação manual disparada por humano.
- **Observabilidade** — toda Oportunidade e todo Alerta (§11) precisa ser rastreável até o dado bruto (Search Console/Analytics) que o originou — sem isso, o SEO Agent vira uma caixa preta pouco confiável.
- **Escalabilidade** — adicionar uma nova fonte de dado de monitoramento (ex.: Bing Webmaster Tools, já citado como gap em `docs/requirements/growth/GROWTH_HUB.md` §3) não deve exigir alterar a lógica de Clusters/Otimização já existente.
- **SEO sustentável** — o módulo deve priorizar crescimento composto e de longo prazo (Autoridade temática, §5) sobre ganhos rápidos e frágeis (ex.: práticas que arriscam penalização).

---

## Capítulo 17 — Riscos

- **Mudanças de algoritmo** — buscadores alteram critério de ranqueamento sem aviso prévio; um resultado bom hoje pode cair sem nenhuma mudança da Empresa.
- **Canibalização** — já tratado como componente do próprio módulo (§3), mas continua sendo um risco residual se a detecção falhar.
- **Conteúdo duplicado** — mesmo risco já registrado em `docs/requirements/growth/BLOG.md` §15, agravado se o SEO Semântico (§6) não identificar sobreposição entre conteúdos.
- **Dependência de APIs** — Search Console e Analytics são inteiramente externos; indisponibilidade paralisa o Monitoramento (§10).
- **Políticas do Google** — práticas consideradas manipulativas de ranqueamento podem gerar penalização manual ou algorítmica — risco direto se um Agente operar de forma agressiva sem supervisão.
- **LGPD** — dado de Analytics envolve comportamento de usuário; mesmo cuidado de consentimento/finalidade já registrado em `docs/requirements/growth/GROWTH_HUB.md` §13.

---

## Capítulo 18 — Visão Futura

- **SEO Preditivo** — antecipar queda de posição ou oportunidade de tendência antes que se torne visível no Monitoramento tradicional.
- **SEO com IA** — o SEO Agent não só executando o módulo, mas aprendendo com o resultado histórico da própria Empresa (o que já funcionou) para refinar decisões futuras — depende de Memória (`docs/02A-DOMAIN_MODEL.md`).
- **Atualização automática** — Conteúdo Desatualizado (§3) disparando diretamente uma proposta de revisão, sem esperar intervenção humana para identificar o problema.
- **Sugestões inteligentes** — Oportunidades (§11) cada vez mais específicas e priorizadas por impacto esperado, não apenas listadas.
- **Clusters automáticos** — formação de Content Clusters (§5) sugerida automaticamente a partir do catálogo existente, em vez de definida manualmente.
- **Monitoramento contínuo** — de checagem periódica para monitoramento em tempo quase real, reduzindo o tempo entre uma queda de performance e sua detecção.

---

## Capítulo 19 — Glossário

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
