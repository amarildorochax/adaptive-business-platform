import type { Execution } from './Execution';

/** Contrato de persistência de Execution — apenas o contrato. */
export interface ExecutionRepository {
  create(execution: Execution): Promise<Execution>;
  update(execution: Execution): Promise<Execution>;
  get(executionId: string): Promise<Execution | undefined>;
  list(workflowId: string): Promise<Execution[]>;
}
