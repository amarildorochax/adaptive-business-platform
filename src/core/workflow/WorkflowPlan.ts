import type { WorkflowStep } from "./WorkflowStep";
import type { WorkflowStatus } from "./WorkflowStatus";

/**
 * Uma instância executável de uma WorkflowDefinition — produzida por
 * WorkflowPlanner a cada `WorkflowEngine.start()`, executada por
 * WorkflowExecutor.
 *
 * `steps` é sempre uma cópia independente das etapas da
 * WorkflowDefinition de origem (`definitionId`) — mutada em memória por
 * WorkflowExecutor conforme cada etapa progride; a WorkflowDefinition
 * original nunca é alterada por uma execução.
 */
export interface WorkflowPlan {
  id: string;

  /** WorkflowDefinition de origem — ver WorkflowDefinition.ts. */
  definitionId: string;

  name: string;

  steps: WorkflowStep[];

  status: WorkflowStatus;

  metadata: Record<string, unknown>;

  createdAt: Date;

  updatedAt: Date;
}
