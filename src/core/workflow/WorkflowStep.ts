import type { WorkflowStatus } from "./WorkflowStatus";

/**
 * Uma etapa de um WorkflowDefinition — ou, depois de WorkflowPlanner
 * processá-la, de um WorkflowPlan em execução (Tarefa 03).
 *
 * Exatamente um de `agentId`/`taskType` deve estar presente — mesmo
 * princípio já usado por `OrchestrationStepRequest`
 * (`@/core/orchestrator`, inalterado): `agentId` força um Agent
 * específico; `taskType` delega a seleção ao AgentSelector interno do
 * AgentOrchestrator.
 *
 * `output` é sempre `unknown` de propósito — mesmo motivo já aplicado a
 * `ExecutionStep.result` (`@/core/orchestrator`): um WorkflowStep é
 * genérico, nunca tipado para um Agent específico.
 */
export interface WorkflowStep {
  id: string;

  /** Posição da etapa dentro do WorkflowDefinition/WorkflowPlan. */
  order: number;

  agentId?: string;

  taskType?: string;

  action: string;

  /** Instrução/objetivo desta etapa — repassado como `objective` ao AgentOrchestrator. */
  input: string;

  output?: unknown;

  status: WorkflowStatus;
}
