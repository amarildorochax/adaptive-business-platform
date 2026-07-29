// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo execution-scheduling — o
// Execution Scheduling completo (ExecutionScheduling,
// ExecutionSchedulingManager, ExecutionSchedulingService,
// ExecutionSchedulingStore, ExecutionSchedule, ApprovalRecord,
// ExecutionSchedulingMetrics, e os contratos futuros
// SchedulerProvider/ApprovalProvider).
//
// Nota: `SchedulerProvider` colide de nome com
// `@/core/automations/SchedulerProvider.ts` — por isso `core/index.ts`
// (o barrel de topo) deliberadamente NÃO agrega este módulo via
// `export *` (ver nota em core/index.ts). Este barrel, porém,
// permanece completo — todo consumo real usa caminhos profundos (ex.:
// `@/core/execution-scheduling`), nunca o barrel de topo `@/core`.
//
// Consumidores fora deste módulo devem preferir `executionScheduling`
// (fachada) — nunca ExecutionSchedulingManager/
// ExecutionSchedulingService/ExecutionSchedulingStore diretamente.

export * from './ExecutionScheduling';
export * from './ExecutionSchedulingManager';
export * from './ExecutionSchedulingService';
export * from './ExecutionSchedulingStore';
export * from './ExecutionSchedule';
export * from './ApprovalRecord';
export * from './ExecutionSchedulingMetrics';
export * from './SchedulerProvider';
export * from './ApprovalProvider';
