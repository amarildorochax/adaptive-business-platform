/**
 * Retry Policy — a política de nova tentativa aplicável a uma Delivery que falhou por motivo
 * transitório; cada nova tentativa produz um novo registro de Delivery, nunca sobrescrevendo o
 * anterior (Retry Never Rewrites History, Blueprint ADR-011).
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface RetryPolicy {
  /** Identificador da Retry Policy. */
  readonly retryPolicyId: string;

  /** Canal ao qual esta política se aplica. */
  readonly channelId: string;

  /** Número máximo de tentativas. */
  readonly maxAttempts: number;
}
