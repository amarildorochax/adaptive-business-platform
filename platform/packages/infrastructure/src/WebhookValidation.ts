/**
 * Webhook Validation — registro de que um Webhook recebido foi validado quanto à origem e à assinatura
 * antes de qualquer processamento.
 * Estrutura definida em INTEGRATION_RESILIENCE_CONCRETE_STRUCTURE.md.
 */
export interface WebhookValidation {
  /** Identificador do Webhook recebido. */
  readonly webhookId: string;

  /** Se a origem do Webhook foi verificada. */
  readonly originVerified: boolean;

  /** Se a assinatura do Webhook foi verificada. */
  readonly signatureVerified: boolean;

  /** Momento do recebimento. */
  readonly receivedAt: Date;
}
