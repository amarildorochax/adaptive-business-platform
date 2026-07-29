// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo orchestrator — o Agent
// Orchestrator completo (AgentOrchestrator, ExecutionPlanner,
// ExecutionContext, OrchestratorMetrics, ExecutionPlan, ExecutionStep,
// ExecutionStatus, PromptExecutionProvider (Etapa 24A — Correção 02), e
// os contratos futuros ExecutionParallelism/ExecutionDependency/
// ExecutionControl).
//
// Nota (Etapa 24A — Correção 01): `ExecutionPriority`/`AgentCapability`
// não são mais definidos aqui — foram movidos para `@/core/catalog`
// para eliminar a dependência circular `catalog ↔ orchestrator`
// identificada na Architecture Review (Etapa 24). Continuam
// reexportados por este barrel (linhas abaixo) para que nenhum
// consumidor existente de `@/core/orchestrator` precise mudar.
//
// Nota (Etapa 24A — Correção 03): `AgentSelector` deixou de ser
// reexportado por este barrel — nenhum consumidor fora deste módulo o
// importava (verificado antes da remoção); `ExecutionPlanner`
// permanece exportado porque define, no mesmo arquivo, os tipos
// públicos `OrchestrationRequest`/`OrchestrationStepRequest`,
// necessários para chamar `AgentOrchestrator.execute()`.
//
// Consumidores fora deste módulo devem preferir `agentOrchestrator` —
// nunca ExecutionPlanner/AgentSelector diretamente.

export * from './AgentOrchestrator';
export * from './ExecutionPlanner';
export * from './ExecutionContext';
export * from './OrchestratorMetrics';
export * from './ExecutionPlan';
export * from './ExecutionStep';
export * from './ExecutionStatus';
export * from '@/core/catalog/ExecutionPriority';
export * from '@/core/catalog/AgentCapability';
export * from './PromptExecutionProvider';
export * from './ExecutionParallelism';
export * from './ExecutionDependency';
export * from './ExecutionControl';
