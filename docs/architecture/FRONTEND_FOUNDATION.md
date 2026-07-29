# Frontend Foundation — Arquitetura

> Documento criado na Sprint 27A (Correção 04) para consolidar a
> arquitetura estabelecida nas Sprints 26 (Adaptive Design System) e 27
> (Frontend Foundation), antes do início da Sprint 28 (Dashboard
> Premium).

## 1. Localização e por que existe `src/app/`

O Frontend oficial da plataforma vive inteiramente sob `src/app/`, um
único diretório novo, em vez de diretórios soltos em `src/`. Isso foi
necessário porque `src/` já contém diretórios da UI legada do
"escritório" Phaser/Pixi com os mesmos nomes que o ESCOPO da Sprint 27
pedia (`src/pages`, `src/providers`, `src/shared`, `src/layout`) —
aninhar tudo sob `src/app/` elimina qualquer colisão sem exigir
renomear nada do que foi pedido.

## 2. Responsabilidade de cada diretório

| Diretório | Responsabilidade |
|---|---|
| `router/` | Definição do Data Router (`AppRouter`, `routes.tsx`, `AppRouteObject`). Único ponto que conhece a árvore de rotas completa. |
| `guards/` | `ProtectedRoute`/`PublicRoute` — contrato reutilizável de guarda de rota. Não implementam autenticação real. |
| `layouts/` | Moldura estrutural reutilizável (`AppLayout`, `AuthLayout`, `EmptyLayout`, `DashboardLayout`, `WorkspaceLayout`). Compõem o Shell; nunca conhecem `pages/` ou `features/` diretamente (usam `children`/`<Outlet/>` genéricos). |
| `shell/` | Header, Sidebar, Navigation, Breadcrumb, Workspace, Footer, ContentArea, SkipLink, ErrorBoundary, `AppShell`. A "casca" visual da aplicação. |
| `pages/` | Camada de **composição de rotas** — liga um Layout a uma ou mais Features para uma rota concreta. Ver `pages/README.md`. |
| `features/` | Um subdiretório por domínio de negócio (`crm/`, `campaign/`, `marketing/`, `finance/`, `analytics/`, `dashboard/`, `automation/`, `workflow/`, `execution/`, `notifications/`, `business-intelligence/`, `knowledge/`, `settings/`). Cada um consumirá, no futuro, a fachada pública do módulo correspondente em `@/core`. Todos intencionalmente vazios até serem conectados. |
| `providers/` | Providers globais de UI (`ThemeProvider` reexportado do Design System, `NotificationProvider`, `ToastProvider`, `DialogProvider`, `ModalProvider`, `ShortcutProvider`, compostos em `AppProviders`). |
| `contexts/` | Estado visual do Shell (`SidebarContext`, `WorkspaceContext`, `NavigationContext`, `LayoutContext`). Nunca regra de negócio. |
| `primitives/` | Camada intermediária entre os tokens do Design System e componentes compostos (`Box`, `Flex`, `Stack`, `Grid`, `Text`, `Heading`, `Surface`, `Container`, `Divider`, `Spacer`, `Icon`). |
| `navigation/` | Contrato de dado de navegação (`NavigationItem`) — nenhuma lista real de itens. |
| `shared/` | Tipos compartilhados internamente por `src/app/*` (ex.: `RouteMeta`). Camada mais baixa — não importa nenhum outro diretório de `src/app/`. |
| `assets/` | Ponto de extensão para assets estáticos reais (ainda vazio). |

## 3. Fluxo de navegação

```
main.tsx (não conectado ainda)
   └─ AppRouter (router/)
        └─ cria o Data Router a partir de appRouteObjects
             ├─ "/" → AppLayout (layouts/) → <Outlet/>
             │         └─ [futuras rotas de página, Sprint 28+]
             │              └─ pages/<Página> (composição de rotas)
             │                   └─ layouts/<Layout> + features/<domínio>
             └─ "*" → NotFoundPage (lazy + Suspense) (pages/)
```

`AppLayout`/`DashboardLayout`/etc. não sabem qual página está sendo
renderizada — apenas envolvem `children ?? <Outlet/>` com o Shell.
`pages/` é quem decide qual Layout usar e qual(is) Feature(s) compor.

## 4. Separação entre Frontend e Core

Nenhum arquivo em `src/app/` importa `@/core`. A única forma prevista
de comunicação futura é: uma `feature/<domínio>` importa a fachada
pública do módulo correspondente (ex.: `crm` de `@/core/crm`) — nunca
Manager/Service/Store diretamente, nunca API HTTP direta. Esta etapa
(Sprint 27A) valida e mantém esse isolamento (ver Correção 05, seção 6
do relatório da Sprint).

## 5. Separação entre Features e Pages

- **Feature** = domínio de negócio. Contém a lógica de UI específica de
  um domínio (ex.: lista de contatos do CRM), consumindo a fachada do
  Core correspondente. Não sabe em qual rota está montada.
- **Page** = composição de rota. Sabe qual Layout usar e quais
  Feature(s) compor para uma URL específica. Não contém lógica de
  negócio própria — apenas arruma Layout + Feature(s) na tela.

Um Dashboard, por exemplo, será uma `page` (`DashboardPage`) que usa o
`DashboardLayout` e compõe uma ou mais `features/dashboard`/`analytics`
— nunca o contrário.

## 6. Estratégia de crescimento para futuras Sprints

1. Um domínio de negócio ganha sua implementação real dentro de
   `features/<domínio>/` (componentes + hooks + estado local),
   consumindo a fachada do Core correspondente.
2. Uma `page` em `pages/` compõe essa feature com o Layout apropriado.
3. Uma rota é adicionada em `router/routes.tsx`, dentro do `children`
   da rota raiz (`/`) — sem necessidade de tocar `AppRouter`,
   `layouts/` ou `shell/`.
4. Nenhuma etapa futura deve exigir mover arquivos entre `features/` e
   `pages/`, nem recriar a estrutura de diretórios — ela já está
   completa desde a Sprint 27A.
