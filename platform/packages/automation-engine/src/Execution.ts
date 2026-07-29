/**
 * Execution — o processamento de um Workflow do início ao fim, administrado pelo Execution Engine,
 * mantendo o estado de progresso de forma centralizada e persistente (Stateless Workers,
 * `AUTOMATION_ENGINE.md`, Capítulo 5).
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export type ExecutionStatus = "Running" | "Succeeded" | "Failed";

export interface Execution {
  /** Identificador da Execution. */
  readonly executionId: string;

  /** Workflow em processamento — ver Workflow.ts (Sprint 6.1). */
  readonly workflowId: string;

  /** Trigger que iniciou esta Execution — ver Trigger.ts (Sprint 6.2). */
  readonly triggerId: string;

  /** Estado atual da Execution. */
  readonly status: ExecutionStatus;

  /** Momento de início. */
  readonly startedAt: Date;

  /** Momento de conclusão, quando aplicável. */
  readonly completedAt?: Date;
}
