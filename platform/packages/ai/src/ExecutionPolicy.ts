/**
 * Execution Policy — a política de execução determinada para uma subtarefa, nunca fixa por Capability
 * de forma permanente, reavaliada a cada nova subtarefa.
 * Estrutura definida em ORCHESTRATOR_CONCRETE_STRUCTURE.md.
 */
export type ExecutionPolicyKind =
  | "Read Only"
  | "Recommendation Only"
  | "Human Approval"
  | "Automatic Execution"
  | "Simulation"
  | "Dry Run";

export interface ExecutionPolicy {
  /** Subtarefa à qual esta política se aplica. */
  readonly subtaskId: string;

  /** Política determinada. */
  readonly policy: ExecutionPolicyKind;

  /** Momento da determinação. */
  readonly determinedAt: Date;
}
