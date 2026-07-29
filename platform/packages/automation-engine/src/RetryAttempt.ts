/**
 * Retry Attempt — o registro de uma tentativa de repetição administrada pelo Retry Manager para uma
 * Action que falhou por motivo transitório, garantindo que uma falha momentânea não seja tratada
 * como falha definitiva do Workflow inteiro (`AUTOMATION_ENGINE.md`, Capítulo 7).
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export interface RetryAttempt {
  /** Identificador da tentativa. */
  readonly retryAttemptId: string;

  /** Execution Step ao qual esta tentativa se refere — ver ExecutionStep.ts. */
  readonly executionStepId: string;

  /** Número sequencial da tentativa. */
  readonly attemptNumber: number;

  /** Momento da tentativa. */
  readonly attemptedAt: Date;
}
