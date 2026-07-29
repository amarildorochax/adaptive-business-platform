/**
 * Finance Event — os dezenove Eventos de domínio publicados pelo Finance Hub, cada um um Fato
 * consumado, publicados exclusivamente pelo Event Publisher, com ordenação garantida por Financial
 * Account.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 10, e confirmada em `FINANCE_HUB.md`,
 * Capítulo 12 ("o catálogo completo dos dezenove Eventos") — nenhuma discrepância de contagem entre
 * os dois documentos, diferente dos casos já registrados para CRM Hub e Communication Hub.
 */
export type FinEventType =
  | "InvoiceCreated"
  | "InvoiceUpdated"
  | "InvoicePaid"
  | "InvoiceCancelled"
  | "PaymentAuthorized"
  | "PaymentCaptured"
  | "PaymentFailed"
  | "RefundIssued"
  | "SubscriptionCreated"
  | "SubscriptionRenewed"
  | "RecurringBillingExecuted"
  | "SettlementCompleted"
  | "ReconciliationCompleted"
  | "LedgerEntryCreated"
  | "WalletUpdated"
  | "BalanceUpdated"
  | "DiscountApplied"
  | "FinancialAdjustmentApplied"
  | "CurrencyUpdated";

export interface FinEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: FinEventType;

  /** Financial Account à qual este Evento se refere, quando aplicável. */
  readonly financialAccountId?: string;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
