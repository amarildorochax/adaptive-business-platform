// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo execution — o Execution
// Orchestrator completo (Execution, ExecutionManager, ExecutionService,
// ExecutionStore, ExecutionRequest, ExecutionPlan, ExecutionStatus,
// ExecutionMetrics, e os contratos futuros ExecutionProvider/
// SchedulerExecutionProvider/WorkflowExecutionProvider).
//
// Nota: `ExecutionPlan`/`ExecutionStatus` colidem de nome com
// `@/core/orchestrator/`, e `WorkflowExecutionProvider` colide com
// `@/core/automations/` — por isso `core/index.ts` (o barrel de topo)
// deliberadamente NÃO agrega este módulo via `export *` (ver nota em
// core/index.ts). Este barrel, porém, permanece completo — todo
// consumo real usa caminhos profundos (ex.: `@/core/execution`), nunca
// o barrel de topo `@/core`.
//
// Consumidores fora deste módulo devem preferir `execution` (fachada)
// — nunca ExecutionManager/ExecutionService/ExecutionStore diretamente.

export * from './Execution';
export * from './ExecutionManager';
export * from './ExecutionService';
export * from './ExecutionStore';
export * from './ExecutionRequest';
export * from './ExecutionPlan';
export * from './ExecutionStatus';
export * from './ExecutionMetrics';
export * from './ExecutionProvider';
export * from './SchedulerExecutionProvider';
export * from './WorkflowExecutionProvider';
