/**
 * Execution Step — o estado individual de uma etapa dentro de uma Execution — qual já foi concluída,
 * qual está pendente —, mantido de forma centralizada e persistente pelo Execution Engine.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export type ExecutionStepStatus = "Pending" | "Completed" | "Failed";

export interface ExecutionStep {
  /** Identificador do Execution Step. */
  readonly executionStepId: string;

  /** Execution à qual esta etapa pertence. */
  readonly executionId: string;

  /** Action executada nesta etapa — ver Action.ts. */
  readonly actionId: string;

  /** Estado atual da etapa. */
  readonly status: ExecutionStepStatus;

  /** Número de tentativas já realizadas — ver RetryAttempt.ts. */
  readonly attemptCount: number;

  /** Momento de início desta etapa. */
  readonly startedAt: Date;

  /** Momento de conclusão, quando aplicável. */
  readonly completedAt?: Date;
}
