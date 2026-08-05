/**
 * Barrel export do pacote @abp/runtime.
 * Gerado como infraestrutura de fundação (IMP-001) — reexporta cada
 * contrato já existente neste pacote, sem alterar nenhum tipo.
 * Estendido pela IMP-013 (Runtime Core) com Repository, Service e Manager para os sete contratos já
 * existentes — nenhuma Entity nova foi criada; ver RUNTIME_CORE_MIGRATION_REPORT.md.
 */
export * from './DispatchMetric';
export * from './DispatchResult';
export * from './DispatchRetryAttempt';
export * from './DispatchTarget';
export * from './ExecutionContext';
export * from './ExecutionIsolationBoundary';
export * from './ExecutionLifecycleState';
export * from './RuntimeCoreDispatchComponent';
export * from './RuntimeResilienceObservabilityComponent';

// IMP-013 — Runtime Core
export * from './DispatcherService';
export * from './DispatchMetricRepository';
export * from './DispatchResultRepository';
export * from './DispatchRetryAttemptRepository';
export * from './DispatchTargetRepository';
export * from './ExecutionContextRepository';
export * from './ExecutionContextService';
export * from './ExecutionIsolationBoundaryRepository';
export * from './ExecutionIsolationBoundaryService';
export * from './ExecutionLifecycleService';
export * from './ExecutionLifecycleStateRepository';
export * from './RuntimeManager';
export * from './RuntimeObservabilityCollectorService';
export * from './RuntimeRetryCoordinatorService';
