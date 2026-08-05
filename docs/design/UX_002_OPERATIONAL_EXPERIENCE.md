# UX-002 — Operational Experience Enhancement — Relatório

**Adaptive Business Platform · Documento de Design**

---

## Nota de Posicionamento Documental

Este Sprint não altera Arquitetura, Core, Persistência, HTTP API ou Frontend Infrastructure de nenhum domínio (`ERP_ARCHITECTURE.md`, `SUPPLIER_HUB.md`, `core/supplier/`, `core/http/`, todos intocados) — todo trabalho acontece exclusivamente na camada de UX (`apps/web/src/shared/`, `apps/web/src/app/layout/`, e um número deliberadamente pequeno de páginas já reais). Nenhuma funcionalidade nova foi adicionada — cada melhoria torna mais rápido, mais claro ou mais contínuo o uso de uma capacidade que já existia. Nenhuma interface de referência foi copiada — cada componente novo é desenho original desta Sprint, inspirado apenas em princípios de usabilidade já observados em ferramentas de CRM/Automação/ERP (nunca em layout, identidade visual, texto ou componente específico de nenhuma delas), mesma disciplina já exigida e já demonstrada pela UX-001.

**Escopo deliberadamente contido.** "Melhorar a experiência operacional da plataforma inteira" é, por natureza, uma superfície enorme. Em vez de uma reforma superficial e ampla (arriscando reduzir consistência e quebrar dezenas de páginas já testadas), esta Sprint aplicou uma disciplina já validada por toda a série FUN/IMP: poucos componentes novos, genuinamente reutilizáveis, aplicados a dado real onde dado real existe, com toda decisão de inclusão/exclusão documentada — nunca um princípio da Sprint "encaixado à força" onde nenhum dado real o sustentaria.

---

## 1. Melhorias Implementadas

| # | Melhoria | Princípio da Sprint | Arquivo(s) |
|---|---|---|---|
| 1 | `ProcessFlow` — fluxo visual horizontal de etapas com status real | 1. Fluxos Visuais | `shared/components/ui/ProcessFlow.tsx` (novo) |
| 2 | `LiveIndicator` + `useRecentlyChanged` — selo de "isto acabou de mudar de verdade" | 2. Demonstração em Tempo Real | `shared/components/ui/LiveIndicator.tsx`, `shared/hooks/useRecentlyChanged.ts` (novos) |
| 3 | Sidebar agrupada por categoria de negócio (Comercial/Operação/Inteligência/Plataforma) | 4. Organização Modular | `app/navigation/navEntries.ts`, `app/layout/Sidebar.tsx` |
| 4 | Breadcrumb — segmento raiz agora é um link real de volta ao Dashboard | 7. Navegação | `app/layout/Breadcrumb.tsx` |
| 5 | Ação Rápida "Novo Fornecedor" no `PageHeader` do Supplier Workspace, disponível em qualquer aba | 7. Navegação | `pages/suppliers/SupplierPage.tsx`, `pages/suppliers/CreateSupplierDrawer.tsx` (novo) |
| 6 | `ProcessFlow` aplicado à Visão Geral do Supplier Workspace (Cadastro → Contato → Operacional) | 1, 6. Fluxos Visuais, Indicadores Operacionais | `pages/suppliers/sections/OverviewSection.tsx` |
| 7 | `ProcessFlow` aplicado à Visão Geral do CRM Workspace (Leads → Qualificados → Convertidos) | 1, 6 | `pages/crm/sections/OverviewSection.tsx` |
| 8 | `LiveIndicator` na Visão Geral do Supplier Workspace, do CRM Workspace, e do `AutomationWidget` | 2, 5. Demonstração em Tempo Real, Automações Integradas | idem + `pages/dashboard/AutomationWidget.tsx` |

---

## 2. Princípios Incorporados

**1. Fluxos Visuais.** `ProcessFlow` — cadeia horizontal e conectada de etapas, cada uma com estado real (`completed`/`current`/`pending`/`blocked`). Desenho original: distinto de `Timeline` (lista vertical de estágios de uma única jornada, UX-001) e de `KanbanColumn` (quadro de arraste de Pipeline, FUN-103) — nenhum dos dois cobria o caso de "múltiplas etapas heterogêneas formando uma cadeia operacional única", exatamente os exemplos "Lead → CRM → Produto..." e "Fornecedor → Compra → Recebimento..." citados por esta Sprint. Aplicado a dois domínios reais (Capítulo 4).

**2. Demonstração em Tempo Real.** `LiveIndicator` + `useRecentlyChanged` — um selo que só acende quando um valor real muda de fato entre dois renders (nunca um cronômetro decorativo, nunca "ao vivo" permanente). "Tudo utilizando dados reais. Nunca gerar dados fictícios" foi levado ao pé da letra: o hook não anuncia "mudança" no primeiro carregamento de um dado (isso não é uma mudança, é a primeira leitura) — só quando um valor já visto se altera.

**3. Interface Limpa.** Avaliada, não reescrita em bloco: `WidgetCard`/`KPIGrid`/`MetricCard`/espaçamento (`--space-*`) já demonstravam, desde a UX-001, hierarquia e uso de espaço em branco consistentes — nenhuma mudança de token foi necessária. `ProcessFlow`/`LiveIndicator` foram desenhados para se somarem a essa hierarquia já existente (cor semântica já definida, escala de espaçamento já existente), nunca introduzindo um segundo padrão visual concorrente.

**4. Organização Modular.** A Sidebar agora agrupa os dezenove módulos em quatro categorias de negócio (Comercial, Operação, Inteligência, Plataforma) em vez de duas categorias técnicas (ativo/planejado) — reforça visualmente a fronteira de cada módulo sem esconder o que ainda está planejado (cada item mantém seu próprio selo "Em breve"). Todos os quatro grupos continuam na mesma Sidebar contínua — o ecossistema único nunca é quebrado em telas separadas.

**5. Automações Integradas.** `AutomationWidget` (Dashboard e `/automation`) ganhou `LiveIndicator` sobre seu próprio dado real (`workflow.status`/`execution.status`, `@abp/automation-engine`, em processo) — a automação "aparece" através de um selo que acende quando ela genuinamente muda de estado, nunca um módulo isolado, nunca um evento fabricado. Ver Capítulo 8 para a limitação honesta encontrada aqui.

**6. Indicadores Operacionais.** `ProcessFlow`, aplicado a dado real de dois domínios, é em si um indicador operacional — mostra imediatamente onde a operação de Fornecedores/Leads está, incluindo um estado `blocked` genuíno (ex.: "todos os Fornecedores cadastrados estão desabilitados"), nunca fabricado.

**7. Navegação.** Breadcrumb ganhou um link real de volta ao Dashboard (antes, texto estático) — um clique a menos para sair de uma aba profunda (ex.: `/suppliers?section=contracts`). `PageHeader actions` (prop existente desde a UX-001, nunca usado por nenhuma página até esta Sprint) recebeu seu primeiro uso real: a Ação Rápida "Novo Fornecedor", acessível de qualquer aba do Supplier Workspace.

**8. Design System.** Todo componente novo entrou em `shared/components/ui/`, nenhum exclusivo de uma tela — `ProcessFlow`/`LiveIndicator` já provam reutilização real entre dois domínios (Supplier e CRM) nesta mesma Sprint, não apenas teoricamente reutilizáveis.

**9. Responsividade.** Nenhum layout independente foi criado — `ProcessFlow` usa `flex-wrap: wrap` (quebra em telas estreitas, sem media query própria, mesma técnica já usada por `.dashboard-grid`); `LiveIndicator` é `inline-flex`, flui com o texto ao redor em qualquer largura; a Sidebar reagrupada preserva integralmente o comportamento já testado de colapso/painel mobile (`sidebar--collapsed`/`sidebar--mobile-open`, nenhuma classe removida). Dark/Light Mode herdados via `--color-success`/`--color-primary`/`--color-danger`/`--color-info`, já definidos nos dois temas.

**10. Performance.** Nenhuma nova Query, nenhum novo cache — `ProcessFlow` computa `steps` a partir de dado já em memória (`suppliers`/`workspace`, `Array.filter`/`reduce`, custo desprezível no volume desta plataforma). `useRecentlyChanged` usa exatamente um `useRef` e um `useState`, um único `setTimeout` limpo a cada mudança — nenhum polling, nenhum `setInterval`. `LiveIndicator`'s animação CSS (`@keyframes`) roda na GPU (`opacity`/`transform`), nunca re-renderiza React; respeita `prefers-reduced-motion`.

---

## 3. Componentes Reutilizados

`WidgetCard`, `KPIGrid`, `MetricCard`, `Badge`, `Button`, `Field`, `Drawer`, `PageHeader` (`actions`, primeiro uso real), `Table`, `SectionSubNav`, `EmptyState`, `AsyncState`, `PageContainer` — todos sem alteração de contrato, exceto `PageHeader`, cujo `actions` já existia como prop opcional desde a UX-001.

---

## 4. Novos Componentes Compartilhados

**`ProcessFlow`** (`shared/components/ui/ProcessFlow.tsx`) — `steps: { id, label, status: "completed"|"current"|"pending"|"blocked", detail? }[]`. Usado por `pages/suppliers/sections/OverviewSection.tsx` (Cadastro → Contato associado → Operacional, três etapas reais derivadas de `useSuppliers`) e `pages/crm/sections/OverviewSection.tsx` (Leads → Qualificados → Convertidos, derivadas de `useCrmWorkspace`) — dois domínios genuinamente distintos, confirmando reutilização real, não apenas teórica.

**`LiveIndicator`** (`shared/components/ui/LiveIndicator.tsx`) — `label?: string`, presentacional puro. Usado em três lugares: Visão Geral do Supplier Workspace, Visão Geral do CRM Workspace, `AutomationWidget`.

**`useRecentlyChanged`** (`shared/hooks/useRecentlyChanged.ts`, primeiro arquivo de `shared/hooks/`) — `(value: unknown, windowMs = 4000) => boolean`. Genérico, sem nenhuma dependência de domínio; decide quando `LiveIndicator` deve acender, em todos os três usos acima.

---

## 5. Ganhos de Usabilidade

**Poucos cliques.** A Ação Rápida do Supplier Workspace elimina a navegação obrigatória até a aba "Fornecedores" antes de poder cadastrar um — de qualquer aba (Visão Geral, Analytics, Histórico...), um clique já abre o formulário. Breadcrumb como link elimina a necessidade de usar a Sidebar para voltar ao Dashboard a partir de uma seção profunda.

**Compreensão imediata de estado operacional.** `ProcessFlow` substitui a necessidade de somar mentalmente KPIs separados para entender "estou bem ou mal" — a cadeia visual já comunica isso em um relance, incluindo o alerta genuíno de "operação bloqueada" quando nenhum Fornecedor ativo existe.

**Confiança de que o sistema é real e vivo.** `LiveIndicator`, por só acender quando um dado genuinamente muda, evita o problema oposto de um selo "ao vivo" permanente (que rapidamente perde significado) — quando ele aparece, o usuário sabe que algo realmente aconteceu.

**Clareza de organização sem perder a sensação de ecossistema único.** A Sidebar por categoria deixa evidente que "Fornecedores"/"Compras"/"Estoque"/"Produtos" são a mesma família operacional, distinta de "CRM"/"Comunicação" (comercial) e de "Analytics"/"Automação"/"Conhecimento" (inteligência) — sem fragmentar a navegação em telas separadas.

---

## 6. Impacto na Experiência Operacional

Alinhado à Visão Estratégica desta Sprint — "a Adaptive deve competir pela experiência operacional" — as oito melhorias, tomadas em conjunto, fortalecem exatamente os seis sentimentos-alvo listados nos Princípios desta Sprint: **Empresa organizada** (Sidebar por categoria); **Operação inteligente** (`ProcessFlow`, `LiveIndicator` honesto); **Fluxo contínuo** (Breadcrumb navegável, Ação Rápida cross-aba); **Sistema integrado** (mesmos componentes reutilizados em dois domínios reais, provando que a plataforma pensa em termos de capacidades compartilhadas, não de telas isoladas); **Poucos cliques** (Capítulo 5); **Alta produtividade** (menos navegação redundante).

---

## 7. Testes

Vinte e três testes novos/estendidos, cobrindo cada peça nova e cada integração:

| Arquivo | Cobertura |
|---|---|
| `ProcessFlow.test.tsx` | Renderização por Step, classe de status (incluindo `blocked`), ausência de conector após a última etapa |
| `LiveIndicator.test.tsx` | Rótulo padrão e customizado |
| `useRecentlyChanged.test.tsx` | Nunca `true` no primeiro render; liga ao mudar; desliga após a janela; nunca liga se o valor não mudou |
| `navEntries.test.ts` (estendido) | Toda entrada possui `category`; Dashboard é a única em "Início" |
| `Breadcrumb.test.tsx` (estendido) | Segmento raiz é link fora da rota raiz; nunca um link na própria raiz |
| `SupplierPage.test.tsx` (estendido, +1 teste) | Ação Rápida funciona a partir de qualquer aba (testado a partir de "Analytics") |

`Sidebar.test.tsx` já validava genericamente "todo `NAV_ENTRIES` vira um link com o `href` correto" e "selo 'Em breve' apenas em planejados" — ambos continuam verdadeiros sob o novo agrupamento sem exigir alteração, confirmando que o reagrupamento é puramente visual.

---

## 8. Limitações

**Automações Integradas (Capítulo 5, item 5) é a melhoria mais limitada desta Sprint.** Nenhum evento real de automação (Lead criado → Automação inicia → IA classifica → ...) está disponível para visualização — `AutomationManager` roda em processo com dado semeado uma única vez (`staleTime: Infinity`), sem nenhuma automação real acionada durante o uso da plataforma hoje. `LiveIndicator` foi aplicado sobre o dado real já existente (`workflow.status`/`execution.status`) por integridade — nunca fabricando uma cadeia de eventos que a plataforma não produz de fato. Quando um fluxo de automação real existir (Trigger→Execução→Resultado com múltiplos eventos reais), `ProcessFlow` já está pronto para essa visualização exata — é o mesmo componente, sem nenhuma alteração necessária.

**`ProcessFlow` foi aplicado a apenas dois domínios** (Supplier, CRM) — os únicos, no estado atual da plataforma, com progressão real de múltiplas etapas facilmente observável a partir de um único hook já carregado na Visão Geral. Outros domínios (Product Hub, Inventory, Purchase, Branding, Business Profile) têm sua própria Visão Geral já madura (KPIs reais desde suas respectivas Sprints); estendê-los com `ProcessFlow` é um candidato natural de Sprint futura, não incluído aqui para preservar o escopo contido desta Sprint.

**Nenhuma reforma visual ampla de "Interface Limpa"** foi realizada — a avaliação (Capítulo 2, item 3) confirmou que a base de tokens/hierarquia já herdada da UX-001 já é consistente; uma auditoria completa de "ruído visual" página a página está fora do escopo desta Sprint.

---

## 9. Melhorias Futuras

Estender `ProcessFlow` às demais Visões Gerais já existentes (Product Hub: Catálogo → Preço → Estoque; Purchase: Fornecedor → Recebimento → Estoque, quando os dados reais permitirem).

Quando um fluxo de automação genuinamente real existir, aplicar `ProcessFlow` diretamente ao `AutomationWidget` (Trigger → Execução → Resultado), substituindo o par `<dl>` atual.

Uma segunda Ação Rápida de `PageHeader` candidata natural: "Nova Oportunidade" no CRM Workspace, mesmo padrão já validado pelo Supplier Workspace nesta Sprint.

---

## 10. Conclusão

Esta Sprint fortaleceu a experiência operacional da Adaptive Business Platform através de dois componentes novos e genuinamente reutilizáveis (`ProcessFlow`, `LiveIndicator`), já validados em dois domínios reais distintos, mais quatro melhorias de navegação/organização de baixo risco e alto alcance (Sidebar por categoria, Breadcrumb navegável, Ação Rápida). Nenhuma funcionalidade nova foi criada, nenhuma interface de referência foi copiada, nenhum dado fictício foi exibido, e nenhuma Arquitetura/Core/API/Persistência foi tocada — `pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` (687 testes) permanecem integralmente verdes.
