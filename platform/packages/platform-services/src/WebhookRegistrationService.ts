import type { WebhookRegistration } from "./WebhookRegistration.js";
import type { WebhookRegistrationRepository } from "./WebhookRegistrationRepository.js";

/**
 * Webhook Registration Service — implementa o "Webhook Manager" (`INTEGRATION_HUB.md`, Capítulo 7):
 * "administra o registro de endpoint de recebimento de notificação externa, único por Connector e por
 * Tenant." Nunca confundir com `WebhookDeliveryService` — este Service registra o **endpoint**;
 * aquele registra a **notificação já recebida** naquele endpoint (ver "Decisões Arquiteturais" em
 * `INTEGRATION_HUB_CORE_MIGRATION_REPORT.md`).
 */
export class WebhookRegistrationService {
  constructor(private readonly repository: WebhookRegistrationRepository) {}

  async register(connectorId: string, tenantId: string, endpoint: string): Promise<WebhookRegistration> {
    const registration: WebhookRegistration = { connectorId, tenantId, endpoint };
    return this.repository.create(registration);
  }

  async find(connectorId: string, tenantId: string): Promise<WebhookRegistration | undefined> {
    return this.repository.findByConnectorAndTenant(connectorId, tenantId);
  }
}
