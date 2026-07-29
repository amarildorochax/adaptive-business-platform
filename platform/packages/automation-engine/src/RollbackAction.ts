/**
 * Rollback Action — o registro de que o Rollback Manager reverteu, quando tecnicamente possível, o
 * efeito de uma Action já executada — por exemplo, cancelar um envio ainda não entregue, ou reverter
 * uma atualização de registro —, usado tipicamente em conjunto com o Approval Engine, quando uma
 * aprovação concedida é posteriormente revogada antes da conclusão efetiva da Action
 * (`AUTOMATION_ENGINE.md`, Capítulo 7).
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export interface RollbackAction {
  /** Identificador do Rollback Action. */
  readonly rollbackActionId: string;

  /** Execution Step cujo efeito está sendo revertido — ver ExecutionStep.ts (Sprint 6.3). */
  readonly executionStepId: string;

  /** Motivo da reversão (ex.: aprovação revogada). */
  readonly reason: string;

  /** Momento da reversão. */
  readonly rolledBackAt: Date;
}
