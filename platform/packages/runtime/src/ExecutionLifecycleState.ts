/**
 * Execution Lifecycle State — o ciclo de vida técnico de uma execução, estritamente mais genérico
 * que o Execution já publicado pelo Automation Engine (Trigger → Conditions → Branches → Actions →
 * Retries → Timeouts → Success/Failure, `AUTOMATION_ENGINE.md`, Capítulo 8) — este ciclo hospeda
 * aquele, nunca o substitui (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 6).
 * Estrutura definida em `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 6.
 */
export type ExecutionLifecycleStage =
  | "Received"
  | "ContextEstablished"
  | "Dispatched"
  | "Running"
  | "Completed"
  | "Failed";

export interface ExecutionLifecycleState {
  /** Execution Context ao qual este estado se refere — ver ExecutionContext.ts. */
  readonly executionContextId: string;

  /** Estágio atual do ciclo de vida. */
  readonly stage: ExecutionLifecycleStage;

  /** Momento em que a execução entrou neste estágio. */
  readonly enteredAt: Date;
}
