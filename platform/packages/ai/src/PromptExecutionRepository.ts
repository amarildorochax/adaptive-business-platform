import type { PromptExecution } from './PromptExecution';

/** Contrato de persistência de Prompt Execution — apenas o contrato. Sem `update`/`remove` — registro histórico imutável de cada composição. */
export interface PromptExecutionRepository {
  create(execution: PromptExecution): Promise<PromptExecution>;
  list(tenantId: string): Promise<PromptExecution[]>;
}
