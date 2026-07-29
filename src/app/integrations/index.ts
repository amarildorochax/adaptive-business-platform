// index.ts
//
// Responsabilidade:
// Ponto único de exportação da Core Integration Foundation (Sprint 30)
// + Integration Pipeline & Middlewares (Sprint 31A) — contracts, types
// (ModuleId/Auth/Observability), errors, adapters (`core/`), mappers,
// providers, hooks, pipeline, context, executor, registry e middlewares.
//
// Esta é a ÚNICA porta oficial de comunicação entre o Frontend e o
// Core v1.0. Nenhum componente React deve importar `@/core`
// diretamente — toda comunicação futura passa por
// `useCoreModule`/`useCoreQuery`/`useCoreMutation`, que dependem dos
// Adapters em `core/adapters/`, que a partir desta Sprint executam
// através do Integration Pipeline (`pipeline/` + `middlewares/` +
// `executor/` + `registry/`) antes de qualquer chamada de negócio
// futura ao Core.
//
// Nota: assim como `features/` (Sprint 27A), este módulo NÃO é
// reexportado pelo barrel de topo `@/app` — é consumido via import
// profundo (`@/app/integrations`), deliberadamente, para que o
// consumo seja sempre explícito.

export * from './contracts';
export * from './types';
export * from './errors';
export * from './core';
export * from './mappers';
export * from './providers';
export * from './hooks';
export * from './utils';
export * from './context';
export * from './pipeline';
export * from './executor';
export * from './middlewares';
export * from './registry';
