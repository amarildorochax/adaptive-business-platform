import type { Workflow } from './Workflow';

/** Contrato de persistência de Workflow — apenas o contrato. Sem `remove` — desativação via `status: 'Inactive'`, nunca remoção física. */
export interface WorkflowRepository {
  create(workflow: Workflow): Promise<Workflow>;
  update(workflow: Workflow): Promise<Workflow>;
  get(workflowId: string): Promise<Workflow | undefined>;
  list(tenantId: string): Promise<Workflow[]>;
}
