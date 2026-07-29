/**
 * Coordination Task — o estado de coordenação de uma subtarefa já planejada e distribuída, aplicando
 * Paralelismo quando não há dependência identificada, e Sincronização quando há.
 * Estrutura definida em ORCHESTRATOR_CONCRETE_STRUCTURE.md.
 */
export type CoordinationState = "Pending" | "InProgress" | "Completed" | "Cancelled";

export interface CoordinationTask {
  /** Subtarefa coordenada. */
  readonly subtaskId: string;

  /** Agente ao qual a subtarefa foi distribuída — identificador opaco, sem redefinir Agent Contract. */
  readonly agentId: string;

  /** Identificadores de subtarefa dos quais esta subtarefa depende. */
  readonly dependsOn: readonly string[];

  /** Estado atual da coordenação. */
  readonly state: CoordinationState;
}
