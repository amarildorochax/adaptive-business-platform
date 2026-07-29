/**
 * Finance Hub Component — os trinta e dois componentes internos do Finance Hub, contagem confirmada
 * sem discrepância entre a enumeração individual do Capítulo 7 e a afirmação em prosa ("Os trinta e
 * dois componentes..."), diferente dos casos já registrados para CRM Hub e Communication Hub.
 * Estrutura definida em `FINANCE_HUB.md`, Capítulo 7.
 */
export type FinanceHubComponent =
  // Orquestração
  | "Finance Manager"
  // Cobrança
  | "Invoice Manager"
  | "Billing Manager"
  | "Discount Manager"
  | "Fee Manager"
  // Pagamento
  | "Payment Manager"
  | "Payment Attempt Manager"
  | "Refund Manager"
  // Recorrência
  | "Subscription Manager"
  | "Recurring Billing Manager"
  | "Installment Manager"
  // Contabilidade
  | "Ledger Manager"
  | "Balance Manager"
  | "Wallet Manager"
  | "Transaction Manager"
  | "Financial Adjustment Manager"
  // Liquidação
  | "Settlement Manager"
  | "Reconciliation Manager"
  | "Receivable Manager"
  | "Payable Manager"
  // Suporte Transversal
  | "Currency Manager"
  | "Exchange Rate Manager"
  | "Tax Manager"
  | "Financial Document Manager"
  | "Financial History Manager"
  | "Financial Search Manager"
  | "Audit Manager"
  | "Lifecycle Manager"
  | "Configuration Manager"
  | "Notification Publisher"
  | "Event Publisher"
  | "Reporting Adapter";
