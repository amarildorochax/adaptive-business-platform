import type { ExecutionStep } from './ExecutionStep';

/** Contrato de persistência de Execution Step — apenas o contrato. */
export interface ExecutionStepRepository {
  create(step: ExecutionStep): Promise<ExecutionStep>;
  update(step: ExecutionStep): Promise<ExecutionStep>;
  get(executionStepId: string): Promise<ExecutionStep | undefined>;
  list(executionId: string): Promise<ExecutionStep[]>;
}
