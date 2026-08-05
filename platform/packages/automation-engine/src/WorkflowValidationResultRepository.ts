import type { WorkflowValidationResult } from './WorkflowValidationResult';

/** Contrato de persistência de Workflow Validation Result — apenas o contrato. `save` sempre recebe o resultado mais recente já calculado pelo `WorkflowValidationService` — este Repository nunca é a fonte de verdade da validação em si, apenas o registro de sua última execução. */
export interface WorkflowValidationResultRepository {
  save(result: WorkflowValidationResult): Promise<WorkflowValidationResult>;
  get(workflowId: string): Promise<WorkflowValidationResult | undefined>;
}
