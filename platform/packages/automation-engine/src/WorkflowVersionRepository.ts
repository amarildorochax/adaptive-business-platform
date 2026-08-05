import type { WorkflowVersion } from './WorkflowVersion';

/** Contrato de persistência de Workflow Version — apenas o contrato. `update` existe apenas para marcar `supersededAt` de uma versão anterior, nunca para alterar o conteúdo já registrado de uma versão. */
export interface WorkflowVersionRepository {
  create(workflowVersion: WorkflowVersion): Promise<WorkflowVersion>;
  update(workflowVersion: WorkflowVersion): Promise<WorkflowVersion>;
  list(workflowId: string): Promise<WorkflowVersion[]>;
}
