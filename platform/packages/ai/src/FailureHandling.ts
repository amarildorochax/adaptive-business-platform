/**
 * Failure Handling — a resolução aplicada a uma falha detectada durante o pipeline de decisão,
 * aplicação do princípio Fail Safe Coordination: diante de ambiguidade, o caminho mais conservador é
 * sempre escolhido.
 * Estrutura definida em ORCHESTRATOR_CONCRETE_STRUCTURE.md.
 */
export type FailureResolution =
  | "Retry"
  | "Fallback"
  | "DegradedContinuation"
  | "EscalatedToHuman";

export interface FailureHandling {
  /** Solicitação na qual a falha ocorreu. */
  readonly requestId: string;

  /** Resolução aplicada. */
  readonly resolution: FailureResolution;

  /** Momento em que a falha foi tratada. */
  readonly handledAt: Date;
}
