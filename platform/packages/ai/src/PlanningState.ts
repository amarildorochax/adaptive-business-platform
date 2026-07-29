/**
 * Planning State — as três etapas pré-execução do ciclo de planejamento; Execução, Acompanhamento e
 * Replanejamento pertencem ao Orchestrator e permanecem deliberadamente fora deste componente.
 * Estrutura definida em PLANNING_CONCRETE_STRUCTURE.md.
 */
export type PlanningStage = "GoalIdentified" | "Decomposed" | "DependenciesIdentified";

export interface PlanningState {
  /** Plano ao qual este estado se refere. */
  readonly planId: string;

  /** Etapa atual do ciclo de planejamento. */
  readonly stage: PlanningStage;

  /** Momento em que o plano entrou nesta etapa. */
  readonly enteredAt: Date;
}
