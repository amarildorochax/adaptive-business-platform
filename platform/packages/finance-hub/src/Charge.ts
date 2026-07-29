/**
 * Charge — o ato técnico de cobrança processado contra um Payment Method específico, mediado
 * exclusivamente pelo Integration Hub — o Finance Hub nunca implementa Connector próprio para
 * nenhum gateway.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Charge {
  /** Identificador do Charge. */
  readonly chargeId: string;

  /** Payment Attempt ao qual este Charge se refere. */
  readonly paymentAttemptId: string;

  /** Payment Method contra o qual o Charge foi processado. */
  readonly paymentMethodId: string;

  /** Valor cobrado. */
  readonly amount: number;
}
