// index.ts
//
// Responsabilidade:
// Ponto único de exportação da camada de contextos do Pipeline —
// PipelineContext, RequestContext, ExecutionContext, EnvironmentContext,
// e o construtor `createPipelineContext`.
//
// Nota: `UserContext`/`anonymousUserContext` (`./UserContext.ts`, um
// reexport local de `../types/UserContext`) não são reexportados aqui
// para evitar duplicar, no barrel de topo de `@/app/integrations`, os
// mesmos nomes já exportados por `./types`. Consumidores externos devem
// importar `UserContext` de `@/app/integrations` (via `types`), não
// deste módulo.

export * from './PipelineContext';
export * from './RequestContext';
export * from './ExecutionContext';
export * from './EnvironmentContext';
export * from './createPipelineContext';
