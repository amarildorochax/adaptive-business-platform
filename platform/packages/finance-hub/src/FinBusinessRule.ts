/**
 * Finance Business Rule — o catálogo declarativo das doze Regras de negócio do domínio financeiro,
 * verificadas antes de qualquer mudança de estado relevante. Este artefato registra o catálogo, nunca
 * a lógica de verificação.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 12.
 */
export type FinBusinessRuleId =
  | "PaymentBelongsToInvoice"
  | "LedgerIsImmutable"
  | "BalanceIsDerivedFromLedger"
  | "RefundCreatesNewTransactions"
  | "SettlementNeverAltersLedger"
  | "SubscriptionGeneratesChargesButNeverProcessesPayment"
  | "RecurringBillingGeneratesNewInvoices"
  | "PaymentIntentIsNotConcludedPayment"
  | "ReconciliationNeverModifiesTransactions"
  | "CancelledInvoicePreservesHistory"
  | "WalletNeverAltersLedgerDirectly"
  | "EveryFinancialMovementProducesEvent";

export interface FinBusinessRule {
  /** Identificador da Regra. */
  readonly ruleId: FinBusinessRuleId;

  /** Descrição da Regra, conforme já fixada em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 12. */
  readonly description: string;
}
