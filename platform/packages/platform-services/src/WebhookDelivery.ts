/**
 * Webhook Delivery — registro de que uma notificação externa foi recebida através de um Webhook já
 * registrado. Distinto de WebhookValidation (platform/packages/infrastructure/src/), que registra o
 * resultado de verificação de origem e assinatura.
 * Estrutura definida em INTEGRATION_CONCRETE_STRUCTURE.md.
 */
export interface WebhookDelivery {
  /** Connector que recebeu a notificação. */
  readonly connectorId: string;

  /** Tenant ao qual a notificação pertence. */
  readonly tenantId: string;

  /** Momento do recebimento. */
  readonly receivedAt: Date;
}
