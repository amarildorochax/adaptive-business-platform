/**
 * Webhook Registration — registro de endpoint de recebimento de notificação externa, único por
 * Connector e por Tenant.
 * Estrutura definida em INTEGRATION_CONCRETE_STRUCTURE.md.
 */
export interface WebhookRegistration {
  /** Connector ao qual este endpoint pertence. */
  readonly connectorId: string;

  /** Tenant ao qual este endpoint pertence. */
  readonly tenantId: string;

  /** Endpoint de recebimento registrado. */
  readonly endpoint: string;
}
