// index.ts
//
// Responsabilidade:
// Ponto único de exportação dos contratos da camada de integração —
// Request/Response, Paginação, Filtros, Ordenação, Metadata, Status,
// contrato de Middleware do Pipeline, políticas de Retry/Timeout/
// Circuit Breaker (Sprint 31A), além do reaproveitamento dos contratos
// de Cache/Feature Flags já criados na Sprint 29A.

export * from './CoreRequest';
export * from './CoreResponse';
export * from './Pagination';
export * from './Filters';
export * from './Sorting';
export * from './Metadata';
export * from './CoreStatus';
export * from './cache';
export * from './featureFlags';
export * from './PipelineMiddleware';
export * from './RetryPolicy';
export * from './TimeoutPolicy';
export * from './CircuitBreakerPolicy';
