// routes.tsx
//
// Responsabilidade:
// Definição da árvore de rotas do AppRouter.
//
// Auditoria pós-Sprint 31: a rota raiz ("/") agora renderiza
// `DashboardPage` → `DashboardHome` (o Dashboard Premium construído nas
// Sprints 28-31A). O layout raiz passou de `AppLayout` para
// `EmptyLayout` porque `DashboardHome` já monta seu próprio Header/
// Sidebar/Footer (`panels/DashboardHeader`, `DashboardSidebar`,
// `DashboardFooter`) — usar `AppLayout` aqui duplicaria essa moldura
// com a do Shell genérico do Frontend Foundation (Sprint 27), que
// permanece disponível para outras rotas futuras que precisem dela.
//
// Sprint 32: `/crm` adicionada (`CrmPage` → `CrmHome`), como rota
// folha simples.
//
// Sprint 33A (Adaptive CRM Dashboard Integration): `/crm` passou a ser
// uma rota PAI com 7 filhas — `CrmHome` agora monta o mesmo
// Header/menu lateral global do Dashboard e renderiza a seção ativa
// via `<Outlet />`, em vez de trocar de tela por estado local. `index:
// true` (`/crm`) é o Painel; os demais caminhos usam nomes em
// Português, como pedido pelo ESCOPO.
//
// Not Found Route continua com carregamento lazy via `React.lazy`/
// `Suspense`, como exemplo de code-splitting.

import { lazy, Suspense } from 'react';
import type { AppRouteObject } from './routeTypes';
import { EmptyLayout } from '../layouts';
import { DashboardPage } from '../pages/DashboardPage';
import { CrmPage } from '../pages/CrmPage';
import { CrmOverviewPage } from '../pages/CrmOverviewPage';
import { CrmClientsPage } from '../pages/CrmClientsPage';
import { CrmCompaniesPage } from '../pages/CrmCompaniesPage';
import { CrmDealsPage } from '../pages/CrmDealsPage';
import { CrmPipelinePage } from '../pages/CrmPipelinePage';
import { CrmActivitiesPage } from '../pages/CrmActivitiesPage';
import { CrmAgendaPage } from '../pages/CrmAgendaPage';
import { LoadingPage } from '../pages/LoadingPage';

const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

export const appRouteObjects: AppRouteObject[] = [
  {
    path: '/',
    element: <EmptyLayout />,
    handle: { layout: 'empty' },
    children: [
      { index: true, element: <DashboardPage />, handle: { title: 'Dashboard' } },
      {
        path: 'crm',
        element: <CrmPage />,
        handle: { title: 'CRM' },
        children: [
          { index: true, element: <CrmOverviewPage />, handle: { title: 'CRM · Painel' } },
          { path: 'clientes', element: <CrmClientsPage />, handle: { title: 'CRM · Clientes' } },
          { path: 'empresas', element: <CrmCompaniesPage />, handle: { title: 'CRM · Empresas' } },
          { path: 'negocios', element: <CrmDealsPage />, handle: { title: 'CRM · Negócios' } },
          { path: 'pipeline', element: <CrmPipelinePage />, handle: { title: 'CRM · Pipeline' } },
          { path: 'atividades', element: <CrmActivitiesPage />, handle: { title: 'CRM · Atividades' } },
          { path: 'agenda', element: <CrmAgendaPage />, handle: { title: 'CRM · Agenda' } },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingPage />}>
        <NotFoundPage />
      </Suspense>
    ),
    handle: { title: 'Página não encontrada' },
  },
];
