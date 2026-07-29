/**
 * Finance Command — os dezesseis Comandos que mudam estado dentro do Finance Hub, cada um seguindo
 * Idempotent Payments quando aplicável a operação de cobrança.
 * Estrutura definida em `FINANCE_HUB.md`, Capítulo 10.
 */
export type FinCommandType =
  | "CreateInvoice"
  | "UpdateInvoice"
  | "CancelInvoice"
  | "ApplyDiscount"
  | "AuthorizePayment"
  | "CapturePayment"
  | "FailPayment"
  | "IssueRefund"
  | "CreateSubscription"
  | "RenewSubscription"
  | "GenerateRecurringInvoice"
  | "ApplyFinancialAdjustment"
  | "RegisterSettlement"
  | "StartReconciliation"
  | "CreateReceivable"
  | "CreatePayable";

export interface FinCommand {
  /** Identificador de operação, único por execução — garante Idempotência. */
  readonly operationId: string;

  /** Tipo do Comando. */
  readonly type: FinCommandType;

  /** Momento em que o Comando foi recebido pelo Finance Manager. */
  readonly requestedAt: Date;
}
