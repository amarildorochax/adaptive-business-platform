/**
 * Planning Result — o registro de que a etapa Planning do Pipeline de Decisão foi concluída para uma
 * solicitação, vinculando-a ao plano já decomposto pelo Planning Engine através de identificador
 * opaco, sem redefinir a estrutura do plano (Component 20) nem o estado do pipeline
 * (`DecisionPipelineState`, Component 17).
 * Artefato de integração INT-03, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, e
 * `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-03.
 */
export interface PlanningResult {
  /** Solicitação para a qual o plano foi produzido. */
  readonly requestId: string;

  /** Plano produzido — identificador opaco, sem redefinir PlanningState (Component 20). */
  readonly planId: string;

  /** Momento em que a etapa Planning foi concluída para esta solicitação. */
  readonly plannedAt: Date;
}
