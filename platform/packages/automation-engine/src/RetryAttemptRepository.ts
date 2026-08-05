import type { RetryAttempt } from './RetryAttempt';

/** Contrato de persistência de Retry Attempt — apenas o contrato. Sem `update`/`remove` — cada tentativa é um registro histórico imutável. */
export interface RetryAttemptRepository {
  create(attempt: RetryAttempt): Promise<RetryAttempt>;
  list(executionStepId: string): Promise<RetryAttempt[]>;
}
