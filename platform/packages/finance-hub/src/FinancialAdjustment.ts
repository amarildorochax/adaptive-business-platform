/**
 * Financial Adjustment — a correção manual aplicada ao estado financeiro, sempre registrada como
 * novo Ledger Entry, nunca como alteração retroativa de um Ledger Entry já existente.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface FinancialAdjustment {
  /** Identificador do Financial Adjustment. */
  readonly financialAdjustmentId: string;

  /** Financial Account à qual esta correção se aplica. */
  readonly financialAccountId: string;

  /** Ledger Entry criado por esta correção. */
  readonly ledgerEntryId: string;

  /** Motivo da correção. */
  readonly reason: string;

  /** Momento da aplicação. */
  readonly appliedAt: Date;
}
