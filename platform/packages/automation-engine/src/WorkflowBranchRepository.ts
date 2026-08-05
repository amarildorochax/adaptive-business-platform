import type { WorkflowBranch } from './WorkflowBranch';

/** Contrato de persistência de Workflow Branch — apenas o contrato. */
export interface WorkflowBranchRepository {
  create(branch: WorkflowBranch): Promise<WorkflowBranch>;
  list(workflowId: string): Promise<WorkflowBranch[]>;
}
