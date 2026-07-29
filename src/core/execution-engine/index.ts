// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo execution-engine — o Execution
// Engine completo (ExecutionEngine, ExecutionEngineManager,
// ExecutionEngineService, ExecutionEngineStore, ExecutionRun,
// ExecutionStep, ExecutionResult, ExecutionEngineMetrics, e os
// contratos futuros WorkflowExecutorProvider/AgentExecutorProvider/
// NotificationExecutorProvider).
//
// Nota: `ExecutionStep` colide de nome com
// `@/core/orchestrator/ExecutionStep.ts` — por isso `core/index.ts` (o
// barrel de topo) deliberadamente NÃO agrega este módulo via
// `export *` (ver nota em core/index.ts). Este barrel, porém,
// permanece completo — todo consumo real usa caminhos profundos (ex.:
// `@/core/execution-engine`), nunca o barrel de topo `@/core`.
//
// Consumidores fora deste módulo devem preferir `executionEngine`
// (fachada) — nunca ExecutionEngineManager/ExecutionEngineService/
// ExecutionEngineStore diretamente.

export * from './ExecutionEngine';
export * from './ExecutionEngineManager';
export * from './ExecutionEngineService';
export * from './ExecutionEngineStore';
export * from './ExecutionRun';
export * from './ExecutionStep';
export * from './ExecutionResult';
export * from './ExecutionEngineMetrics';
export * from './WorkflowExecutorProvider';
export * from './AgentExecutorProvider';
export * from './NotificationExecutorProvider';
