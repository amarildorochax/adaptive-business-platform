// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo workflow — o Workflow Engine
// completo (WorkflowEngine, WorkflowRegistry, WorkflowPlanner,
// WorkflowExecutor, WorkflowContext, WorkflowMetrics,
// WorkflowDefinition, WorkflowPlan, WorkflowStep, WorkflowStatus, e os
// contratos futuros WorkflowParallelism/WorkflowCondition/WorkflowLoop/
// WorkflowCompensation/WorkflowPersistenceAdapter).
//
// Consumidores fora deste módulo devem preferir `workflowEngine` —
// nunca WorkflowRegistry/WorkflowPlanner/WorkflowExecutor diretamente.

export * from './WorkflowEngine';
export * from './WorkflowRegistry';
export * from './WorkflowPlanner';
export * from './WorkflowExecutor';
export * from './WorkflowContext';
export * from './WorkflowMetrics';
export * from './WorkflowDefinition';
export * from './WorkflowPlan';
export * from './WorkflowStep';
export * from './WorkflowStatus';
export * from './WorkflowParallelism';
export * from './WorkflowCondition';
export * from './WorkflowLoop';
export * from './WorkflowCompensation';
export * from './WorkflowPersistenceAdapter';
