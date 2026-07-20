# 05 — ECOSYSTEM MAP

**Andreia AI Platform**
Mapa completo do ecossistema — como todos os componentes se relacionam.

Este documento não descreve implementação — para isso, ver `docs/02-SYSTEM_ARCHITECTURE.md`. Ele descreve **funcionamento**: como a informação percorre a plataforma, de Hub em Hub, até virar resultado de negócio. Complementa `docs/PLATFORM_VISION.md` (o quê e por quê), `docs/02A-DOMAIN_MODEL.md` (os conceitos) e `docs/03-DASHBOARD_V2.md` (a interface) com o **como tudo se conecta**.

**Legenda usada em todo o documento:**
- 🟢 **Implementado** — existe em código hoje (na aplicação atual ou na fundação da nova plataforma).
- ⚪ **Planejado** — ainda não existe nenhum código; é a direção de design.

Quase todo fluxo de negócio deste documento é ⚪ Planejado — a plataforma hoje tem fundação técnica (Runtime, Pipeline, Registries) e alguns precedentes pontuais na aplicação atual (Blog, EventBus, Fila, Histórico), mas nenhum dos fluxos completos de ponta a ponta abaixo está implementado. Isso é sinalizado em cada capítulo, não escondido.

---

## Capítulo 1 — Visão Geral

A Andreia AI Platform funciona como um **Sistema Operacional Empresarial**: assim como um sistema operacional não guarda dado nenhum por si só, mas dá a todo aplicativo instalado um caminho comum para ler, processar e gravar informação, a plataforma dá a todo Hub um caminho comum para transformar um sinal do mundo real em um resultado de negócio.

Todo fluxo desta documentação — o do Blog, o do Google Ads, o do CRM — é uma instância do mesmo padrão geral:

```
Sinal                Captura              Processamento           Ação                 Resultado
(uma busca,     →    (um Módulo      →    (uma Automação     →    (um Conector     →   (Receita,
 um clique,           registra o           ou um Agente             publica, envia          decisão,
 um lead)             evento)              decide o que             ou grava algo            tempo
                                            fazer)                   fora)                    poupado)
                                                                                                  ↓
                                                                                            Dashboard
```

Nenhuma seta aqui é um barramento técnico — é o padrão conceitual que os Capítulos 3 a 9 instanciam com nomes reais (Keyword, Campanha, Lead, Cliente...). O Dashboard é sempre o ponto final: todo fluxo, de qualquer Hub, converge para lá (ver Capítulo 13).

---

## Capítulo 2 — Mapa dos Hubs

```
Business Hub
  ↓
Growth Hub
  ↓
Operations Hub
  ↓
Integration Hub
  ↓
AI Hub
  ↓
Marketplace Hub    ⚪ Planejado
  ↓
Academy Hub        ⚪ Planejado
```

**Leitura importante:** esta ordem vertical não é uma cadeia de dependência estrita — nenhum Hub "espera" o anterior terminar para funcionar. É uma ordem de camadas de responsabilidade, do mais operacional ao mais periférico:

| Hub | Responsabilidade |
|---|---|
| **Business Hub** | O núcleo operacional do dia a dia — onde Clientes, Vendas, Financeiro e Projetos realmente vivem. Todo resultado de negócio, de qualquer outro Hub, acaba refletido aqui. |
| **Growth Hub** | Alimenta o Business Hub com aquisição — tráfego, conteúdo, campanhas — que se convertem em novos Leads/Clientes. |
| **Operations Hub** | Não é visto pelo usuário final, mas sustenta todos os outros: é quem orquestra Automações e Workflows entre eles, e quem registra o que aconteceu (Auditoria, Histórico). |
| **Integration Hub** | O único portão de saída da plataforma — todo Hub que precisa falar com o mundo externo (Google, Meta, WordPress...) passa por aqui. |
| **AI Hub** | A camada de inteligência que opera *sobre* todos os Hubs anteriores — não é um Hub de dados de negócio próprio, é quem executa trabalho dentro dos outros. |
| **Marketplace Hub** ⚪ | Ecossistema de extensões de terceiros — cresce por cima de toda a base acima, sem fazer parte dela. |
| **Academy Hub** ⚪ | Treinamento e capacitação dos usuários da plataforma — o único Hub que não participa dos fluxos operacionais dos Capítulos 3–10. |

---

## Capítulo 3 — Fluxo do Blog

```
Pesquisa → Keyword → SEO → Conteúdo → Imagem → Vídeo → WordPress → Search Console → Analytics → AdSense → Dashboard → CEO Agent
```

| Etapa | Hub / Módulo envolvido | Estado |
|---|---|---|
| Pesquisa | Growth Hub — SEO | ⚪ |
| Keyword | Growth Hub — SEO (Keyword Research) | ⚪ |
| SEO | Growth Hub — SEO (Estrutura SEO) | ⚪ |
| Conteúdo | Growth Hub — Blog (Copywriter Agent) | 🟢 precedente — `src/core/agents/blog/BlogAgent.ts` já existe na aplicação atual; nenhum equivalente na nova plataforma |
| Imagem | Growth Hub — Blog (Designer Agent) | ⚪ |
| Vídeo | Growth Hub — Blog (Designer/Publisher Agent) | ⚪ |
| WordPress | Integration Hub — Conector WordPress | ⚪ |
| Search Console | Integration Hub — Conector Google | ⚪ |
| Analytics | Integration Hub — Conector Google · Growth Hub — Analytics | ⚪ |
| AdSense | Integration Hub — Conector Google · Business Hub — Financeiro (receita) | ⚪ |
| Dashboard | Painel Direito + Widgets (ver Capítulo 13) | ⚪ |
| CEO Agent | AI Hub — visão consolidada, fecha o ciclo de decisão | ⚪ |

Este é o fluxo com a fundação de código mais próxima de existir hoje: `BlogAgentExecutor` e `BlogOutputService` (aplicação atual) já modelam a etapa de Conteúdo — o resto do fluxo (Keyword até CEO Agent) é inteiramente ⚪.

---

## Capítulo 4 — Fluxo do SEO

```
Keyword Research → SERP → Cluster → Conteúdo → Schema → Links → Search Console → Analytics → Atualização → Dashboard
```

Todo o fluxo é ⚪ Planejado. Os conceitos técnicos (SERP, Cluster, Schema, Backlinks/Links, EEAT) já estão definidos em `docs/PLATFORM_VISION.md` §9; este capítulo só ordena como eles se sucedem: pesquisa de palavra-chave → análise de concorrência na SERP → agrupamento temático em Cluster → produção de Conteúdo dentro daquele cluster → marcação com Schema → construção de Links → confirmação via Search Console → medição via Analytics → ciclo de Atualização quando a posição cai → tudo reportado no Dashboard.

---

## Capítulo 5 — Google Ads

```
Campanha → Landing Page → Conversão → CRM → Financeiro → Analytics → Dashboard
```

| Etapa | Hub | Estado |
|---|---|---|
| Campanha | Growth Hub — Google Ads (via Integration Hub) | ⚪ |
| Landing Page | Growth Hub | ⚪ |
| Conversão | Growth Hub | ⚪ |
| CRM | Business Hub — lead vira Cliente | ⚪ |
| Financeiro | Business Hub — custo de mídia registrado | ⚪ |
| Analytics | Growth Hub — retorno medido | ⚪ |
| Dashboard | Painel Direito | ⚪ |

Como já registrado em `docs/PLATFORM_VISION.md` §8: a ativação de gasto real de mídia sempre passa por um checkpoint de **Aprovação** (Operations Hub) antes de "Campanha" ir ao ar — nenhum Agente tem autonomia para gastar sem esse ponto humano.

---

## Capítulo 6 — Meta Ads

```
Campanha → Lead → CRM → WhatsApp → Venda → Financeiro → Analytics
```

Campanha (Growth Hub, via Conector Meta) gera um Lead, que entra no CRM (Business Hub); o WhatsApp (Integration Hub) é o canal de continuidade de conversa com esse Lead; quando vira Venda, o valor é registrado no Financeiro (Business Hub) e o retorno da campanha é medido de volta em Analytics (Growth Hub). Mesma regra de Aprovação de gasto do Capítulo 5 se aplica aqui.

## Capítulo 7 — Pinterest

```
Pin → Blog → Landing Page → Conversão → CRM → Analytics
```

Um Pin (Growth Hub, via Conector Pinterest) normalmente aponta para um Conteúdo já existente do Blog (Capítulo 3); de lá, o visitante segue para uma Landing Page, gera Conversão, vira registro no CRM, e o resultado é medido em Analytics — mesma cauda final dos fluxos anteriores.

## Capítulo 8 — AdSense

```
Artigo → SEO → Indexação → Tráfego → Analytics → AdSense → Receita → Financeiro → Dashboard
```

Fecha o ciclo de monetização do Blog (Capítulo 3): um Artigo bem trabalhado em SEO é Indexado, gera Tráfego, medido em Analytics; o AdSense converte esse tráfego em Receita, registrada no Financeiro (Business Hub) e refletida no Dashboard.

---

## Capítulo 9 — CRM

```
Lead → Cliente → Venda → Financeiro → Analytics
```

O fluxo mais curto e mais central de todos — é onde os fluxos de Growth (Capítulos 3, 5, 6, 7) desembocam: um Lead capturado por qualquer canal de aquisição vira Cliente no CRM (Business Hub); uma Venda a esse Cliente é registrada no Financeiro (Business Hub); o resultado alimenta Analytics (Growth Hub) para medir a eficácia de quem originou aquele Lead.

---

## Capítulo 10 — Automação

```
Evento → Workflow → Fila → Executor → Histórico → Dashboard
```

| Etapa | Estado | Onde |
|---|---|---|
| Evento | 🟢 funcional (aplicação atual) | `EventBus` (`src/core/events/`) |
| Workflow | ⚪ Planejado | `WorkflowEngine` existe como estrutura (`src/core/automation/`), sem execução real |
| Fila | 🟢 funcional (aplicação atual) | `TaskQueue` (`src/core/queue/`) |
| Executor | ⚪ Planejado | nenhum "executor" de automação existe hoje — `Pipeline.execute()` é o único mecanismo de execução real da nova plataforma, e ainda não está ligado a `WorkflowEngine` |
| Histórico | 🟢 funcional (aplicação atual) | `ExecutionHistory` (`src/core/history/`) |
| Dashboard | ⚪ Planejado | Barra Inferior (ver Capítulo 13) |

Este é o único capítulo onde metade dos elos já existe de verdade — só que espalhados na aplicação atual, não ligados entre si como um fluxo único, e não conectados à nova plataforma (`src/core/automation/`, `src/core/pipeline/`).

---

## Capítulo 11 — IA

```
CEO → Marketing → SEO → Designer → Publisher → CRM → Financeiro → Analytics
```

⚪ Planejado por completo — nenhum Agente existe hoje. Este é um fluxo **de exemplo** de como os Agentes vão conversar entre si (via Agent Communication, AI Hub — `docs/02-SYSTEM_ARCHITECTURE.md` §9), não o único fluxo possível:

1. **CEO Agent** define uma diretriz de negócio (ex.: "aumentar leads de um produto específico este mês").
2. **Marketing Agent** traduz isso em um plano de campanha.
3. **SEO Agent** define palavras-chave e estrutura de conteúdo alinhadas ao plano.
4. **Designer Agent** produz os ativos visuais necessários (imagens, criativos de anúncio).
5. **Publisher Agent** publica o conteúdo/campanha nos canais definidos (via Integration Hub).
6. **CRM Agent** processa os Leads que chegam como resultado.
7. **Finance Agent** registra custo de mídia e receita associada.
8. **Analytics Agent** mede o resultado e devolve um resumo ao **CEO Agent**, fechando o ciclo.

Cada seta acima é uma troca de mensagem via **Agent Communication** — nenhum Agente chama outro diretamente; a comunicação entre Agentes segue o mesmo princípio de baixo acoplamento já aplicado entre Módulos (via evento, não chamada direta).

---

## Capítulo 12 — Integrações

Todas ⚪ Planejado — sem exceção, nenhuma integração real existe na nova plataforma.

| Integração | Módulos/Hubs que usam | Precedente já existente |
|---|---|---|
| **WordPress** | Growth Hub — Blog (publicação) | — |
| **Google** | Growth Hub — Search Console, Analytics, Google Ads, AdSense, Google Business Profile, YouTube | `AIProviderFactory` não cobre Google como provedor de IA — sem precedente |
| **Meta** | Growth Hub — Meta Ads, Social Media | — |
| **Pinterest** | Growth Hub — Pinterest, Pinterest Ads | — |
| **WhatsApp** | Business Hub — CRM (comunicação com Cliente) · AI Hub — Support Agent | — |
| **Claude** | AI Hub — AI Runtime (provedor de IA para Agentes) | 🟢 `src/core/ai/AIProviderFactory.ts` já antecipa `claude` como opção (hoje sempre cai em `MockAIProvider`) |
| **OpenAI** | AI Hub — AI Runtime | 🟢 mesmo precedente — `AIProviderFactory.ts` já antecipa `openai` |
| **Gemini** | AI Hub — AI Runtime | 🟢 `src/providers/gemini/` já reserva a pasta |
| **Microsoft** | Growth Hub — Bing Webmaster Tools | — |
| **n8n** | Operations Hub / Marketplace Hub — automação externa | — |
| **Zapier** | Operations Hub / Marketplace Hub — automação externa | — |

Todo Conector futuro segue o fluxo fixo já registrado em `docs/02-SYSTEM_ARCHITECTURE.md` §7: `Módulo → Connector → API Externa` — nenhum módulo acessa uma API externa diretamente.

---

## Capítulo 13 — Dashboard

O Dashboard (`docs/03-DASHBOARD_V2.md`) é o ponto de convergência de **todos** os Hubs — cada área dele recebe informação de um subconjunto diferente:

| Área do Dashboard | Recebe de |
|---|---|
| **Sidebar** | Todos os Hubs — navegação, não dado (mostra quais Hubs/Módulos estão ativos no Workspace) |
| **Escritório** (Área Central) | AI Hub — cada estação de trabalho representa um Agente; Business/Growth/Operations Hub — o status exibido por agente reflete o que aquele Agente está processando em seu Hub |
| **Painel Direito** | Business Hub (Leads, Receitas), Growth Hub (Campanhas), Operations Hub (Tarefas, Automações, Fila, Alertas), Integration Hub (Integrações, estado de conexão) |
| **Widgets** | Cada Módulo individualmente — um widget por Módulo ativo, de qualquer Hub |
| **Barra Inferior** | Operations Hub (Runtime, Fila, Eventos, Jobs), Integration Hub (Conectores ativos) |

Nenhuma área do Dashboard tem lógica própria — todas são visualizações de dados que já pertencem a algum Hub.

---

## Capítulo 14 — Mapa Completo

Do Usuário até a Receita, atravessando toda a plataforma:

```
Usuário
  │
  ▼
Workspace (Empresa)
  │
  ├──────────────► AI Hub ──────────────┐
  │                (Agentes executam      │
  │                 trabalho em todos      │
  │                 os Hubs abaixo)        │
  │                                        │
  ▼                                        ▼
Growth Hub                          Business Hub
(Blog, SEO, Ads,                    (CRM, Financeiro,
 Social, Email)                      Agenda, Projetos,
  │                                   Documentos, Equipe)
  │  gera Lead/Cliente                    │
  └───────────────────────────────────────┤
                                           │
                                           ▼
                                    Operations Hub
                                    (Automação, Workflow,
                                     Fila, Histórico,
                                     Aprovações)
                                           │
                                           ▼
                                    Integration Hub
                                    (Google, Meta, WordPress,
                                     WhatsApp, Claude, OpenAI,
                                     Gemini, Microsoft, n8n, Zapier)
                                           │
                                           ▼
                                     Mundo Externo
                                    (publicação, mensagem,
                                     chamada de API)
                                           │
                                           ▼
                                        Receita
                                    (Financeiro, Business Hub)
                                           │
                                           ▼
                                       Dashboard
                                  (Sidebar, Escritório,
                                   Painel Direito, Widgets,
                                   Barra Inferior)
                                           │
                                           ▼
                                        Usuário
                                 (decide, aprova, ajusta)
```

O ciclo fecha em loop: o Usuário que recebe o resultado no Dashboard é o mesmo que ajusta o Workspace, aprova a próxima Campanha ou redireciona um Agente — não é um fluxo de mão única.

---

## Capítulo 15 — KPIs por Hub

Todos ⚪ Planejado — nenhum indicador abaixo é medido hoje.

| Hub | Indicadores |
|---|---|
| **Business** | Nº de Clientes ativos · Ticket médio · Receita recorrente · Tempo médio de atendimento · Taxa de conclusão de Projetos |
| **Growth** | Tráfego orgânico · Taxa de conversão · Custo de Aquisição de Cliente (CAC) · Leads gerados por canal · Posição média em SERP · Retorno sobre investimento em Ads (ROAS) |
| **Operations** | Nº de Workflows executados · Taxa de erro/retry · Tempo médio de execução · Itens em Fila · Aprovações pendentes |
| **Integration** | Conectores ativos e saudáveis · Uptime por Integração · Erros de autenticação · Latência média de chamada externa |
| **AI** | Nº de Agentes ativos · Taxa de tarefas concluídas sem intervenção humana · Tempo médio de resposta de um Agente · Qualidade percebida (feedback humano sobre o trabalho do Agente) |

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
