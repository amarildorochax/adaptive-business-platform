import type { WebhookRegistration } from "./WebhookRegistration.js";

/** Webhook Registration Repository — "registro de endpoint... único por Connector e por Tenant" (Capítulo 7). */
export interface WebhookRegistrationRepository {
  create(registration: WebhookRegistration): Promise<WebhookRegistration>;
  findByConnectorAndTenant(connectorId: string, tenantId: string): Promise<WebhookRegistration | undefined>;
}
