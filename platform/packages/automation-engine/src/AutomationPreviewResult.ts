/**
 * Automation Preview Result — o registro de que o Automation Preview visualizou como um Workflow se
 * comportaria diante de um cenário de entrada específico, antes de ativá-lo em produção
 * (`AUTOMATION_ENGINE.md`, Capítulo 7). Nenhum efeito colateral real é produzido pela própria
 * visualização.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export interface AutomationPreviewResult {
  /** Identificador do resultado de Preview. */
  readonly automationPreviewResultId: string;

  /** Workflow visualizado — ver Workflow.ts (Sprint 6.1). */
  readonly workflowId: string;

  /** Descrição do cenário de entrada avaliado. */
  readonly scenarioDescription: string;

  /** Descrição do comportamento previsto, sem efeito colateral real. */
  readonly predictedOutcomeDescription: string;

  /** Momento da visualização. */
  readonly previewedAt: Date;
}
