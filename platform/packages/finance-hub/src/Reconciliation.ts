/**
 * Reconciliation — o processo de comparação entre o registro interno do Finance e o extrato externo
 * de um Provider ou de uma conta bancária, identificando divergência quando existente; nunca modifica
 * transações — a correção exige um Financial Adjustment explícito e separado (Blueprint, Capítulo
 * 12).
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Reconciliation {
  /** Identificador da Reconciliation. */
  readonly reconciliationId: string;

  /** Tenant ao qual esta Reconciliation pertence. */
  readonly tenantId: string;

  /** Se divergência foi identificada. */
  readonly divergenceFound: boolean;

  /** Momento de conclusão. */
  readonly completedAt: Date;
}
