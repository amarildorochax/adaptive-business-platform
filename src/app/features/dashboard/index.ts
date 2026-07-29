// index.ts
//
// Responsabilidade:
// Ponto único de exportação da feature Dashboard (Sprint 28) —
// `DashboardHome` (composição principal), painéis, sections, widgets,
// hooks, serviços, tipos, mocks e a camada de controllers (Sprint 29A).
// Consome exclusivamente `@/design-system` e `@/app` (shell/primitives)
// — zero import de `@/core`. Todos os dados são simulados; a
// integração real com o Core é trabalho de uma Sprint futura.

export * from './DashboardHome';
export * from './panels';
export * from './sections';
export * from './widgets';
export * from './hooks';
export * from './services';
export * from './controllers';
export * from './types';
export * from './mocks';
export * from './components';
