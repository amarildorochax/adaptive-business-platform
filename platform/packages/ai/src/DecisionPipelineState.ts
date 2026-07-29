/**
 * Decision Pipeline State — as doze etapas do pipeline de decisão do Orchestrator, das quais nenhuma é
 * pulada ou reordenada, mesmo quando uma solicitação torna uma etapa específica trivial.
 * Estrutura definida em ORCHESTRATOR_CONCRETE_STRUCTURE.md.
 */
export type DecisionPipelineStage =
  | "Request"
  | "Intent Analysis"
  | "Context Assembly"
  | "Memory Retrieval"
  | "Capability Resolution"
  | "Planning"
  | "Execution Policy"
  | "Agent Delegation"
  | "Execution"
  | "Consolidation"
  | "Human Approval"
  | "Response";

export interface DecisionPipelineState {
  /** Solicitação em processamento pelo Orchestrator. */
  readonly requestId: string;

  /** Etapa atual do pipeline de decisão. */
  readonly stage: DecisionPipelineStage;

  /** Momento em que a solicitação entrou nesta etapa. */
  readonly enteredAt: Date;
}
