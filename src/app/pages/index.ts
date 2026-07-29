// index.ts
//
// Responsabilidade:
// Ponto único de exportação de `pages/` — a camada de **composição de
// rotas** do Frontend Foundation (Sprint 27A, Correção 02). Ver
// README.md deste diretório para o contrato completo de
// responsabilidade.
//
// `NotFoundPage`/`LoadingPage`: infraestrutura de roteamento.
// `DashboardPage` (Auditoria pós-Sprint 31): primeira página de
// negócio efetivamente conectada — compõe `DashboardHome`
// (`@/app/features/dashboard`) para a rota raiz.
// `CrmPage` (Sprint 32) + `Crm*Page` (Sprint 33A): compõem a árvore de
// rotas `/crm` e seus 6 subcaminhos, cada um ligando a uma página já
// existente da feature CRM — nenhuma lógica nova aqui.

export * from './NotFoundPage';
export * from './LoadingPage';
export * from './DashboardPage';
export * from './CrmPage';
export * from './CrmOverviewPage';
export * from './CrmClientsPage';
export * from './CrmCompaniesPage';
export * from './CrmDealsPage';
export * from './CrmPipelinePage';
export * from './CrmActivitiesPage';
export * from './CrmAgendaPage';
