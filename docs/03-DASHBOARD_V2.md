# 03 — DASHBOARD V2

**Andreia AI Platform**
Visão detalhada da nova interface — ⚪ Planejado por completo.

---

## Como ler este documento

Este é um documento de **visão**, não de implementação. Não descreve componentes React, não descreve cenas Phaser, não descreve código de nenhum tipo — descreve o que a interface precisa comunicar e permitir, para orientar o design visual e a implementação futura.

A base visual atual (`src/components/dashboard/`, `src/game/scenes/OfficeScene.ts`) já existe como estrutura funcional (🟢) e é o ponto de partida real — o Dashboard V2 é a evolução dirigida dela, não uma reconstrução do zero. Isso já foi registrado em `docs/PLATFORM_VISION.md` §5 e `docs/02-SYSTEM_ARCHITECTURE.md` §3 (UI Layer); este documento aprofunda o que aqueles só resumiam.

---

## Premissa: não é uma tela, é uma Central de Operações

O Dashboard V2 não deve ser pensado como "uma página com um escritório 3D no meio". Ele deve ser pensado como uma **central de operações empresarial** — o lugar de onde o dono de uma Empresa acompanha, em tempo real, tudo que sua operação (humana + IA) está fazendo, e de onde intervém quando precisa.

Isso muda o que "sucesso" significa para o design: não é "bonito", é "dá pra saber, em segundos, o que está acontecendo agora e o que precisa da minha atenção".

---

## Visão Geral — as áreas do Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
├───────────┬───────────────────────────────────┬─────────────┤
│           │                                   │             │
│ SIDEBAR   │         ÁREA CENTRAL               │   PAINEL    │
│ (Hubs)    │     (Escritório Virtual, ~65%)     │   DIREITO   │
│           │                                   │             │
├───────────┴───────────────────────────────────┴─────────────┤
│ BARRA INFERIOR                                                │
└─────────────────────────────────────────────────────────────┘
```

Cinco áreas fixas — Header, Sidebar, Área Central, Painel Direito, Barra Inferior — mais duas camadas que aparecem por cima quando acionadas: Janelas de módulo e Widgets.

---

## Header

A faixa superior, sempre visível, com o que identifica "onde estou" e dá acesso rápido ao que é urgente:

- **Logo** — identidade da plataforma.
- **Workspace / Empresa** — qual Workspace está ativo (relevante assim que a plataforma suportar múltiplos Workspaces/Empresas — ver `docs/02A-DOMAIN_MODEL.md`); permite trocar de Workspace sem sair da tela.
- **Pesquisa Global** — busca única que atravessa todos os Hubs/Módulos ativos (um Cliente, um Documento, uma Publicação, um Agente) — sem precisar saber de antemão em qual Módulo a coisa está.
- **Notificações** — sino com contagem do que precisa de atenção (aprovações pendentes, erros, marcos atingidos).
- **Perfil** — identidade do Usuário logado e seu Papel no Workspace atual.
- **Configurações** — acesso à Personalização (ver seção própria abaixo) e a preferências de conta.

---

## Sidebar

Navegação organizada **por Hub**, não por Módulo isolado — reflete diretamente a organização de negócio já definida em `docs/PLATFORM_VISION.md` §3:

- Business Hub
- Growth Hub
- Operations Hub
- Integration Hub
- AI Hub
- Marketplace
- Academy

Cada Hub é expansível: clicar nele revela a lista dos Módulos daquele Hub que estão **ativados para aquele Workspace** — um Hub sem nenhum módulo ativo aparece "vazio" ou minimizado, nunca com módulos fantasmas que a Empresa não contratou. Isso é a materialização visual direta do princípio de modularidade ("cada empresa usa somente os módulos que quiser").

---

## Área Central — o Escritório Virtual

O escritório continua sendo o coração visual do Dashboard, mas redimensionado: ocupa **aproximadamente 65% da largura útil da tela**, para que Painel Direito e Barra Inferior tenham espaço permanente de contexto sem precisar sobrepor o escritório.

Mudanças em relação ao escritório de hoje:

- **Agentes maiores** — cada agente ocupa mais espaço visual do que hoje, porque cada um deixa de ser um personagem genérico e passa a representar um papel reconhecível de longe.
- **Estação de trabalho por agente** — cada agente tem seu próprio espaço fixo dentro do escritório, visualmente distinto (mesa, elementos de cenário que sinalizam sua função), para os papéis já mapeados em `docs/PLATFORM_VISION.md` §6: CEO, Marketing, SEO, Designer, CRM, Financeiro, Analytics, Publisher, Support, Developer.
- **Status em tempo real** — cada estação mostra visualmente o estado do agente que a ocupa: ocioso, trabalhando, aguardando aprovação humana, com erro. Sem precisar abrir nenhum painel, o dono da Empresa deve conseguir olhar para o escritório e saber, de relance, quem está fazendo o quê.

---

## Painel Direito

Um painel **inteligente** — não fixo em um único conteúdo, mas contextual ao que está selecionado (um agente, uma tarefa, um módulo), combinado com um conjunto de blocos sempre disponíveis:

- **Tarefas** — o que está na fila de trabalho, humano ou de IA.
- **Automações** — quais automações estão ativas e o que fizeram recentemente.
- **Alertas** — o que precisa de atenção agora.
- **Fila de processamento** — trabalho em andamento, aguardando execução.
- **Integrações** — estado das Integrações ativas (conectado, com erro, reautenticação pendente).
- **Publicações** — o que foi publicado recentemente e onde.
- **Leads** — captação recente (Business/Growth).
- **Receitas** — números financeiros de alto nível, sempre visíveis.
- **Campanhas** — status das campanhas de Growth em andamento.
- **Status dos agentes** — visão em lista, complementar à visão espacial da Área Central.

---

## Barra Inferior

Uma faixa fina e densa de informação — o "status bar" da plataforma inteira, sempre visível, nunca precisa ser aberta:

- **Runtime** — saúde do `PlatformRuntime` (estado atual do ciclo de vida).
- **Fila** — quantos itens aguardando processamento.
- **Eventos** — atividade recente do EventBus (contagem/pulso, não o log inteiro).
- **Uso de CPU** — carga de processamento da plataforma.
- **Memória** — uso de memória da plataforma.
- **Jobs** — automações/workflows em execução neste momento.
- **Conectores ativos** — quantas Integrações estão conectadas e saudáveis agora.
- **Usuários online** — quem mais, além de você, está no Workspace agora.
- **Versão** — versão corrente da plataforma.

---

## Widgets

Blocos plugáveis, um por Módulo, que um Usuário pode adicionar ao seu layout (Painel Direito, ou uma área de widgets dedicada). Cada Módulo é responsável por definir o conteúdo do seu próprio widget; a lista abaixo é a primeira leva prevista:

CRM · Financeiro · Agenda · Blog · SEO · Search Console · Analytics · Google Ads · Meta Ads · Pinterest Ads · AdSense · Google Business · YouTube · Web Stories · Email · Automação · IA

Cada widget mostra um resumo operacional do seu Módulo (ex.: o widget de CRM mostra "últimos Leads"; o widget de Blog mostra "Conteúdo agendado para Publicação") — nunca a tela inteira do Módulo, que é o papel de uma Janela (próxima seção).

---

## Janelas

Quando um Usuário quer trabalhar de fato dentro de um Módulo (não só olhar um resumo em Widget), o Módulo abre como uma **Janela** dentro do Dashboard — não como navegação para uma página separada. Isso permite ter, por exemplo, CRM e Agenda abertos lado a lado.

Toda Janela suporta:

- **Mover** — reposicionar dentro da área de trabalho.
- **Redimensionar** — ajustar largura/altura livremente.
- **Fixar** — manter sempre visível, mesmo trocando de Hub na Sidebar.
- **Maximizar** — ocupar toda a área central temporariamente.
- **Minimizar** — recolher para a Barra Inferior sem fechar.
- **Agrupar** — várias Janelas podem ser agrupadas em abas dentro de um mesmo espaço, para reduzir poluição visual quando muitos Módulos estão abertos ao mesmo tempo.

---

## Personalização

Cada Usuário ajusta o Dashboard ao seu próprio jeito de trabalhar:

- **Modo Claro / Modo Escuro** — tema visual.
- **Layout compacto / Layout amplo** — densidade de informação (mais dados em menos espaço vs. mais espaço de respiro).
- **Widgets favoritos** — quais widgets aparecem por padrão ao abrir o Dashboard.
- **Painéis personalizados** — arranjos salvos de Janelas/Widgets, para alternar rapidamente entre "modo do dia a dia" e "modo de revisão financeira", por exemplo.

---

## Responsividade

O Dashboard precisa funcionar em três classes de tela, com prioridades diferentes em cada uma:

- **Desktop** — experiência completa: todas as áreas simultaneamente visíveis.
- **Notebook** — mesma experiência, com Painel Direito e Sidebar colapsáveis para dar mais espaço à Área Central quando necessário.
- **Tablet** — Área Central (Escritório) e Sidebar priorizadas; Painel Direito e Barra Inferior acessíveis sob demanda (não fixos), para não competir por um espaço de tela menor.

Uso em celular não está no escopo desta visão — a Central de Operações pressupõe uma tela grande o suficiente para múltiplas áreas simultâneas.

---

## Princípios de UX

- **Poucos cliques** — qualquer ação frequente (aprovar algo, checar um alerta, abrir um Módulo comum) deve estar a no máximo dois cliques de qualquer lugar do Dashboard.
- **Fluxos simples** — nenhuma tarefa do dia a dia deve exigir passar por mais de uma Janela para ser concluída.
- **Feedback visual** — toda ação (aprovar, publicar, ativar um módulo) tem uma confirmação visual imediata; nada é uma "caixa preta" que só se sabe se funcionou olhando em outro lugar depois.
- **Animações discretas** — movimento serve para orientar atenção (algo mudou, algo terminou), nunca para decorar; nada que atrapalhe a leitura rápida de status que é o propósito central desta interface.

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
