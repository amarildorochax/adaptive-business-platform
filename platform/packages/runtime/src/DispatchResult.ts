/**
 * Dispatch Result — o registro de que uma solicitação já contextualizada foi encaminhada a um
 * Dispatch Target específico, e se esse encaminhamento foi bem-sucedido
 * (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 5). Este artefato registra apenas o encaminhamento —
 * o resultado do processamento em si, uma vez alcançado o destino, permanece de responsabilidade
 * exclusiva daquele componente (Automation Engine, Business Hub, ou AI Hub).
 * Estrutura definida em `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 5.
 */
export interface DispatchResult {
  /** Identificador do Dispatch Result. */
  readonly dispatchResultId: string;

  /** Execution Context ao qual este encaminhamento se refere. */
  readonly executionContextId: string;

  /** Dispatch Target de destino. */
  readonly dispatchTargetId: string;

  /** Se o encaminhamento foi bem-sucedido — nunca o resultado do processamento em si. */
  readonly succeeded: boolean;

  /** Momento do encaminhamento. */
  readonly dispatchedAt: Date;
}
