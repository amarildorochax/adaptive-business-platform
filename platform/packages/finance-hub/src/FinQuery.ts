/**
 * Finance Query — as treze Consultas de leitura do Finance Hub, cada uma resolvida contra um Read
 * Model já materializado, ainda que o Ledger permaneça a fonte de verdade contra a qual qualquer Read
 * Model pode ser revalidado (Event Sourcing Friendly).
 * Estrutura definida em `FINANCE_HUB.md`, Capítulo 11.
 */
export type FinQueryType =
  | "InvoiceView"
  | "OutstandingInvoices"
  | "PaymentView"
  | "LedgerView"
  | "BalanceView"
  | "WalletView"
  | "SubscriptionView"
  | "ReceivableView"
  | "PayableView"
  | "SettlementView"
  | "FinancialTimeline"
  | "CashPosition"
  | "FinancialDashboard";

export interface FinQuery {
  /** Identificador da Query. */
  readonly queryId: string;

  /** Tipo da Query. */
  readonly type: FinQueryType;

  /** Momento em que a Query foi solicitada. */
  readonly requestedAt: Date;
}
