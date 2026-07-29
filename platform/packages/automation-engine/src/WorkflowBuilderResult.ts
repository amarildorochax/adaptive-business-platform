/**
 * Workflow Builder Result — o registro de que o Workflow Builder estruturou um novo Workflow a
 * partir de sua definição, garantindo que a estrutura resultante seja bem formada antes de ser
 * submetida ao Workflow Validator.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export interface WorkflowBuilderResult {
  /** Workflow construído. */
  readonly workflowId: string;

  /** Se a estrutura resultante é bem formada, pronta para submissão ao Workflow Validator. */
  readonly wellFormed: boolean;

  /** Momento da construção. */
  readonly builtAt: Date;
}
