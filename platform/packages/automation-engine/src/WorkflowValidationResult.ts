/**
 * Workflow Validation Result — o resultado da verificação, pelo Workflow Validator, de que um
 * Workflow recém-construído ou editado é internamente consistente antes de permitir sua ativação:
 * toda Condition referencia um campo de dado existente, toda Action referencia uma integração ou um
 * Hub válido, e não existe ciclo lógico que produziria execução infinita (`AUTOMATION_ENGINE.md`,
 * Capítulo 7). Este artefato registra o resultado da verificação, nunca a lógica de verificação em
 * si.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export interface WorkflowValidationResult {
  /** Workflow validado. */
  readonly workflowId: string;

  /** Se toda Condition referenciada existe e é resolvível. */
  readonly conditionsResolved: boolean;

  /** Se toda Action referenciada aponta para uma integração ou um Hub válido. */
  readonly actionsResolved: boolean;

  /** Se nenhum ciclo lógico de composição foi identificado (Proteção contra loops, Capítulo 16). */
  readonly noCyclicComposition: boolean;

  /** Se o Workflow, no conjunto, está apto à ativação. */
  readonly valid: boolean;

  /** Momento da validação. */
  readonly validatedAt: Date;
}
