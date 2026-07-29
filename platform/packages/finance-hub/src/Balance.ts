/**
 * Balance — o saldo consolidado de uma Financial Account, sempre derivado do conjunto de Ledger
 * Entry associado a ela, nunca armazenado como valor independente que poderia divergir de seu Ledger
 * de origem (Balance Is Derived, Blueprint ADR-003).
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Balance {
  /** Financial Account à qual este Balance se refere. */
  readonly financialAccountId: string;

  /** Valor consolidado, sempre recalculável a partir do Ledger. */
  readonly amount: number;

  /** Momento do último recálculo. */
  readonly recalculatedAt: Date;
}
