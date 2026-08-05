# UX-001 — Adaptive Design System, User Experience & Dashboard Modernization — Relatório

**Status:** Concluída. **Natureza:** primeira Sprint de UX/Design puro — nenhuma arquitetura, Backend, API, Manager, Repository, Service, Command, Event ou Entity foi alterada. Toda mudança é exclusivamente visual/experiencial, sobre `apps/web`.

---

## 1. Auditoria

Estado de `apps/web` antes desta Sprint: **zero CSS em todo o app** — nenhum arquivo `.css`, nenhum framework de estilo, apenas `className`s semânticos (`app-layout`, `widget-card`, `stat-card`, etc.) nunca de fato estilizados. Confirmado por busca literal — nenhum `.css`/`.scss` em `apps/web/src` antes desta Sprint. Cada página desde a FUN-001 já seguia consistentemente o mesmo esqueleto (`PageContainer > PageHeader + AsyncState > Widget(s)`), reaproveitando 5 componentes compartilhados (`PageContainer`, `PageHeader`, `AsyncState`, `WidgetCard`, `StatCard`) — a maior alavanca de consistência já disponível: estilizar esses 5 componentes propaga a nova identidade a toda a aplicação sem tocar a maioria das páginas de domínio individualmente.

Inventário do que existia:
- **Layout**: `AppLayout`/`Sidebar`/`Topbar`/`Breadcrumb` — Topbar era uma faixa estática (nome + Tenant + Identity + um botão "Sair" cru); Sidebar era uma lista de links sem ícone, sem recolher/expandir; nenhuma pesquisa, nenhuma notificação, nenhum perfil, nenhuma ação rápida.
- **Componentes**: nenhum Button/Card/Badge/Input/Select/Table/Tabs/Alert/Toast/Drawer/EmptyState/Skeleton/Progress reutilizável existia — cada `<button>`/`<input>` era cru, sem variante, sem estado visual.
- **Cores/Tipografia/Ícones**: nenhuma paleta, nenhuma fonte declarada (herdava a fonte padrão do navegador), nenhuma biblioteca de ícone.
- **Tema**: inexistente — nenhuma noção de claro/escuro.
- **Responsividade**: inexistente — nenhum breakpoint.
- **Gráficos**: nenhum em uso (nenhuma dependência de charting) — mantido assim nesta Sprint (Seção 8).

---

## 2. Estudo de Referências — Conceitos Extraídos, Nunca Cópia

Referências estudadas exclusivamente como fonte de **padrões de UX**, nunca de identidade visual/componente/ícone/layout idêntico (regra explícita desta Sprint):

| Referência | Conceito extraído (nunca a implementação/visual) |
|---|---|
| Linear | Densidade de informação alta sem poluição visual; paleta quase monocromática com um único acento de cor; Cmd+K como busca de navegação, não de dado de negócio |
| Stripe Dashboard | Hierarquia clara "KPI no topo → detalhe abaixo"; nunca mais de 4 números-chave visíveis ao mesmo tempo |
| GitHub | Sidebar persistente organizada por contexto; badges de status pequenos e discretos, nunca gritantes |
| Notion | Espaçamento generoso; tipografia como o elemento de hierarquia principal, não a cor |
| Vercel | Tema escuro como identidade primária de produto; bordas sutis (1px) em vez de sombras pesadas para separar superfícies |
| Figma | Ícones monocromáticos consistentes por biblioteca única (aqui: exclusivamente Lucide, regra explícita) |
| ClickUp / Monday | Cards de KPI com ícone semântico + valor + rótulo, nunca só um número solto |
| HubSpot | Painel de notificações como resumo de atividade real, nunca uma central de alerta genérica |

Nenhuma paleta de cor, componente, ícone ou nome de produto foi copiado — a paleta e o sistema de espaçamento desta Sprint são combinações próprias (Seção 4).

---

## 3. Filosofia Aplicada

Toda decisão de tela desta Sprint foi checada contra as perguntas obrigatórias da Sprint. Duas respostas honestas, e não fabricadas, mudaram o resultado:

- **"Minha meta está sendo atingida?" / "O que a IA recomenda?"** — resposta: **não há como responder honestamente hoje.** Nenhum Manager de nenhum domínio já conectado expõe uma Entidade de meta/target, e o AI Hub ainda não está conectado ao Frontend (nenhum dado de recomendação de IA chega ao bootstrap da sessão). Fabricar uma barra de progresso ou uma sugestão de IA teria violado "nenhum dado inventado" — a mesma disciplina já aplicada desde a FUN-001. Ambas as perguntas foram **deliberadamente omitidas** do Dashboard, nomeadas aqui como lacuna real (Seção 9), não escondidas.
- **"Tenho alertas?"** — resposta: reaproveitado como "Atividade recente" (Topbar e Dashboard), usando os mesmos campos reais já carregados por `useDashboardBootstrap()` (mensagem/execução/lead mais recentes) — nenhuma Entidade de Alerta existe em nenhum Manager; esta é a mesma substituição documentada já usada desde a FUN-001 para "notificações"/"tarefas".

---

## 4. Design Tokens (`apps/web/src/styles/tokens.css`)

Toda cor/espaçamento/raio/sombra é uma variável CSS (`--color-*`/`--space-*`/`--radius-*`/`--shadow-*`) — nenhum componente desta Sprint usa um valor literal fora da escala. Tema claro é **inteiramente uma sobrescrita das mesmas variáveis** (`:root[data-theme="light"]`) — nenhuma folha de estilo duplicada por tema, nenhum componente lê a cor diretamente, apenas a variável.

### Paleta (valores do tema escuro, oficial/padrão)

| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `#6d5ef5` | Ações primárias, links ativos, foco de marca |
| `--color-secondary` | `#8b93a7` | Ações secundárias |
| `--color-success` | `#2fbd6b` | Estados positivos (Won, concluído) |
| `--color-warning` | `#f5a623` | Atenção, não bloqueante |
| `--color-danger` | `#f0473f` | Erro, ação destrutiva |
| `--color-info` | `#3d8bfd` | Informativo neutro |
| `--color-background` | `#0b0d12` | Fundo da aplicação |
| `--color-surface` | `#12141c` | Cards, painéis |
| `--color-surface-elevated` | `#1a1d27` | Dropdowns, drawers, toasts |
| `--color-border` | `#262a37` | Divisores |
| `--color-muted` | `#1a1d27` | Fundos neutros (skeleton, badge neutro) |
| `--color-text-primary` | `#f2f3f6` | Texto principal |
| `--color-text-secondary` | `#9aa1b3` | Texto de apoio |
| `--color-text-disabled` | `#565c6d` | Texto desabilitado |

Contraste verificado (WCAG, Seção 7): texto secundário sobre fundo ≈ **7.5:1** (AAA); texto branco sobre `--color-primary` ≈ **4.6:1** (AA, texto normal).

### Tipografia

Fonte oficial: **Inter** (`@fontsource/inter`, hospedada localmente — nenhuma chamada de rede em tempo de execução, zero dependência de CDN, mesma disciplina de "zero dependência externa" já aplicada desde a FUN-003).

| Estilo | Tamanho | Altura de linha | Peso |
|---|---|---|---|
| H1 | 28px | 36px | 700 |
| H2 | 22px | 30px | 600 |
| H3 | 18px | 26px | 600 |
| Body | 14px | 22px | 400 |
| Label | 13px | 18px | 500 |
| Caption | 12px | 16px | 400 |
| Button | 14px | 20px | 500 |

### Espaçamento — escala fixa, nunca um valor fora dela

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48` (px), como `--space-4` … `--space-48`.

### Bordas

`--radius-xs` 4px · `--radius-sm` 6px · `--radius-md` 8px · `--radius-lg` 12px · `--radius-xl` 16px · `--radius-full` 9999px.

### Sombras

`--shadow-xs` · `--shadow-sm` · `--shadow-md` · `--shadow-lg` · `--shadow-modal` — mais pronunciadas no tema claro (sombra é pouco perceptível sobre um fundo já escuro; separação de superfície no tema escuro vem principalmente de borda de 1px, per o padrão Vercel estudado na Seção 2).

---

## 5. Estrutura de Arquivos CSS

```
apps/web/src/styles/
  tokens.css      — variáveis (Seção 4), dois temas
  base.css        — reset, foco visível, scrollbar, .sr-only, prefers-reduced-motion
  components.css  — Button/Card/Badge/Input/Select/Alert/AsyncState/Skeleton/Progress/Tabs/Table/Drawer/Toast/Dropdown
  layout.css      — Sidebar/Topbar/Breadcrumb/PageContainer/PageHeader + breakpoints
  pages.css       — grid do Dashboard, Login, ComingSoon
  index.css       — ponto único de entrada (fontes -> tokens -> base -> componentes -> layout -> páginas), importado uma única vez em `main.tsx`
```

CSS puro com Custom Properties — nenhuma dependência nova de CSS-in-JS/CSS Modules/Tailwind (avaliado e descartado: adicionaria uma ferramenta de build nova para um problema que Custom Properties já resolve sem dependência, mesma disciplina de "nunca introduzir tecnologia sem necessidade real" já aplicada em toda Sprint anterior desta série).

---

## 6. Componentes Padronizados (`shared/components/ui/`)

Novo diretório de primitivos reutilizáveis, consumidos por toda página desta Sprint em diante:

| Componente | Arquivo | Notas |
|---|---|---|
| Button | `Button.tsx` | 4 variantes (primary/secondary/ghost/danger), 2 tamanhos |
| Badge | `Badge.tsx` | 6 tons semânticos |
| Alert | `Alert.tsx` | 4 tons, ícone Lucide correspondente, `role` correto por tom |
| Field / Select | `Field.tsx` / `Select.tsx` | Label sempre associado via `htmlFor` real |
| Table | `Table.tsx` | Busca client-side, ordenação, paginação, estado vazio — pronta para a primeira lista real quando um Manager expuser Query de listagem (nenhum hoje expõe) |
| Tabs | `Tabs.tsx` | `role="tablist"`, controlado pelo pai |
| Drawer | `Drawer.tsx` | Fecha com Escape ou clique fora |
| Toast | `toast/ToastProvider.tsx` + `useToast` | Dispensa automática em 5s |
| DropdownMenu | `DropdownMenu.tsx` | Usado por Notificações/Ações Rápidas/Perfil na Topbar |
| EmptyState | `EmptyState.tsx` | Usado por `AsyncState` e por `Table` |
| Skeleton / Spinner / ProgressBar | idem | — |

`AsyncState`, `PageHeader`, `StatCard`, `WidgetCard` (já existentes desde a FUN-001) foram **restilizados sobre esses primitivos, com a mesma API pública** — nenhuma página consumidora precisou mudar sua lógica.

**Tabelas/Toasts/Drawers/Tabs foram construídos e testados, mas não forçados em nenhuma página existente hoje** — nenhum Manager de domínio ainda expõe uma lista/Query real para preencher uma tabela de verdade (mesmo achado já documentado desde a FUN-001: "a maioria dos Managers é Command-only"); inventar uma lista fake só para "usar" o componente violaria a mesma disciplina de "nunca dado inventado". Ficam prontos, testados, para a primeira Sprint funcional que expuser uma Query de listagem.

---

## 7. Layout

### Sidebar (`app/layout/Sidebar.tsx`)

Permanente, organizada por status (`Módulos` ativos / `Módulos planejados`), um ícone Lucide semântico por módulo (`navEntries.ts`, campo `icon` novo). Recolhe/expande (botão dedicado no rodapé, `aria-pressed`), preferência persistida (`core/layout/sidebarStorage.ts`, `localStorage`). Abaixo de 1024px vira um painel sobreposto (`sidebar--mobile-open`), controlado pelo botão de menu da Topbar.

`/iam`, um placeholder "Em breve" para um `IAMManager` que a FUN-100 já conectou de verdade, foi removido de `NAV_ENTRIES`/`PLANNED_DOMAINS` — mantê-lo afirmaria algo falso.

### Topbar (`app/layout/Topbar.tsx`)

- **Pesquisa Global** — filtra `NAV_ENTRIES` (navegação, nunca dado de negócio: nenhum Manager expõe busca textual ainda; buscar destinos é o equivalente honesto ao Cmd+K das referências estudadas).
- **Painel de Notificações** — reaproveita o mesmo cache de `useDashboardBootstrap()` já usado pelo Dashboard (nenhuma requisição nova) e mostra Mensagem/Execução/Lead mais recentes como "atividade recente" — nunca uma Entidade "Notification" inventada.
- **Ações Rápidas** — navegação para módulos já ativos, nenhuma ação de negócio nova.
- **Perfil** — Identity/Tenant/Papéis reais (`useAuth()`, já existente desde a FUN-100) num menu suspenso, com Logout real.
- **Alternância de tema** — Seção 8.

### Dashboard (`pages/dashboard/DashboardPage.tsx`)

Reorganizado de "sete widgets em grade plana" para: tira de KPIs (4 `StatCard`, todos sobre dado real já carregado) → "Quem precisa da minha atenção hoje?" (CRM) + "Atividade recente" lado a lado → os seis widgets restantes agrupados abaixo. Nenhum widget foi reescrito — `CRMWidget`/`BrandingWidget`/etc. são os mesmos componentes da FUN-001, apenas reorganizados na página. Nenhum gráfico foi adicionado (Seção 8).

---

## 8. Gráficos e Ícones

**Nenhuma biblioteca de gráficos foi adicionada.** A Sprint pede para "evitar excesso de gráficos" e "não utilizar gráficos quando KPIs forem suficientes" — com apenas um registro por Entidade disponível no bootstrap da sessão (nenhum Manager de Analytics/CRM expõe série temporal/agregação ainda), um gráfico real seria, na prática, um único ponto — sem valor informacional sobre um KPI já mostrado como número. Nenhuma dependência de charting foi avaliada como necessária; mantém o bundle sem esse custo (Seção 11).

**Ícones**: exclusivamente `lucide-react` — confirmado por busca, nenhuma segunda biblioteca de ícone importada em nenhum arquivo.

---

## 9. Tema Escuro/Claro

Tema escuro é o padrão oficial, **nunca condicionado a `prefers-color-scheme`** do sistema operacional (decisão explícita da Sprint) — todo usuário sem preferência salva vê o tema escuro. Alternância manual (botão na Topbar), persistida em `localStorage` (`core/theme/`, `ThemeProvider`/`useTheme`), aplicada via `data-theme` no elemento raiz — a mesma variável de CSS, nunca uma folha duplicada.

---

## 10. Responsividade

Breakpoints usados de forma consistente em `layout.css`/`pages.css`:

| Faixa | Largura | Comportamento |
|---|---|---|
| Desktop | ≥ 1024px | Sidebar fixa expandida/recolhida, grades de 2 colunas |
| Tablet/Notebook estreito | 640–1023px | Sidebar vira painel sobreposto (menu hambúrguer na Topbar), grades caem para 1 coluna |
| Mobile | < 640px | Pesquisa e meta de perfil ocultas na Topbar (ainda acessíveis via Perfil), `PageContainer` com padding reduzido |

---

## 11. Acessibilidade (WCAG)

- **Contraste** — verificado manualmente para os pares mais usados (Seção 4): texto secundário sobre fundo escuro ≈ 7.5:1 (AAA); texto branco sobre `--color-primary` ≈ 4.6:1 (AA — o par mais próximo do limite, documentado para revisão futura caso o tom de `--color-primary` mude). Nenhuma ferramenta automatizada (`axe-core`) foi adicionada nesta Sprint — decisão de escopo, não descuido; verificação manual dos pares reais de uso, nomeada como candidata futura (Seção 13).
- **Foco de teclado** — `:focus-visible` global (`base.css`), nunca `outline: none` sem substituto; `Drawer`/`DropdownMenu` fecham com Escape; `Table`/`Select` reaproveitam o foco nativo do navegador (nunca um componente customizado reimplementando semântica de `<select>`).
- **ARIA** — `role="status"`/`"alert"`/`"menu"`/`"dialog"`/`"tablist"`/`"tab"`/`"progressbar"`/`"combobox"`/`"listbox"`/`"option"` aplicados exatamente onde o padrão WAI-ARIA os define, nunca decorativos.
- **Leitura** — `.sr-only` (`base.css`) para contexto adicional nunca visível; nenhum ícone sem `aria-hidden="true"` quando puramente decorativo, nenhum ícone-só-clicável sem `aria-label`.
- **Movimento** — `prefers-reduced-motion: reduce` desativa toda animação/transição (`base.css`).

---

## 12. Performance

Bundle principal (`vite build`) passou de **373 kB → 406 kB** (gzip 112 kB → 123 kB) — acréscimo de ~9%, majoritariamente `lucide-react` (ícones importados individualmente, tree-shaken pelo Vite — nenhum ícone não usado entra no bundle) e o novo CSS (36 kB não-minificado, 6.5 kB gzip). Fontes (`@fontsource/inter`, 4 pesos) são carregadas como assets estáticos separados, nunca bloqueando o bundle JS. Nenhuma duplicação de estilo entre tema claro/escuro (mesmas variáveis, Seção 4) nem entre página e página (todas leem os mesmos 5 componentes compartilhados, Seção 1).

---

## 13. Limitações

- **"Minha meta está sendo atingida?" e "O que a IA recomenda?" não têm resposta no Dashboard** — nenhuma Entidade de meta/target existe em nenhum Manager; o AI Hub não está conectado ao Frontend. Fabricar qualquer um violaria "nenhum dado inventado" (mesma disciplina desde a FUN-001) — nomeado aqui, não escondido.
- **Nenhuma verificação automatizada de acessibilidade** (`axe-core`/Lighthouse CI) foi adicionada — contraste e ARIA foram verificados manualmente para os padrões de uso reais desta Sprint.
- **Nenhuma validação visual em navegador real** — este ambiente não tem uma ferramenta de automação de navegador (Playwright não está instalado); a validação desta Sprint foi: `pnpm build` bem-sucedido, servidor de desenvolvimento respondendo com HTML/JS/CSS corretos, e a suíte de testes (que já asserta classes/atributos/texto renderizado via `@testing-library/react` + jsdom) — mas nenhum screenshot ou inspeção visual humana foi feita. Recomendado como o próximo passo antes de um deploy real.
- **`Table`/`Tabs`/`Drawer`/`Toast` ainda sem consumidor real** — construídos e testados isoladamente; nenhuma página os usa hoje porque nenhum dado real (lista/Query) os justificaria ainda sem inventar conteúdo.
- **Cores do tema claro não passaram pela mesma verificação de contraste ponto-a-ponto que o tema escuro** — os valores foram escolhidos por escurecimento proporcional dos tons semânticos (mesma técnica usada por toda a paleta), mas apenas o tema escuro (padrão oficial) teve seus pares mais usados calculados manualmente (Seção 11).

## 14. Próximos Passos

- Verificação visual em navegador real (Playwright/manual) antes de qualquer deploy.
- `axe-core` (ou equivalente) integrado à suíte de testes para verificação automatizada de acessibilidade contínua.
- Conectar o AI Hub ao Frontend e, só então, responder "O que a IA recomenda?" no Dashboard com dado real.
- Uma Entidade de meta/target (exigiria uma Sprint de domínio — fora do escopo de uma Sprint de UX) antes de responder "Minha meta está sendo atingida?" com dado real, nunca fabricado.
- Popular `Table` com a primeira lista real assim que um Manager expuser uma Query de listagem.
- Revisar `--color-primary` no tema escuro caso um tom mais escuro seja adotado no futuro (contraste atual de texto branco sobre a cor é 4.6:1 — passa AA, mas com pouca margem).
