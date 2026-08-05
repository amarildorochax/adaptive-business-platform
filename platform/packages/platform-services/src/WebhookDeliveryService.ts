import type { WebhookDelivery } from "./WebhookDelivery.js";
import type { WebhookDeliveryRepository } from "./WebhookDeliveryRepository.js";

/**
 * Webhook Delivery Service — implementa o lado de processamento do fluxo de entrada (Capítulo 6,
 * segundo diagrama): registra que uma notificação externa foi recebida em um endpoint já registrado.
 * Nunca verifica origem ou assinatura — essa responsabilidade pertence ao Webhook Security/
 * `WebhookValidation` (`platform/packages/infrastructure/`, Component 11), fora de escopo desta
 * Sprint por proibição explícita de dependência em `@abp/infrastructure`
 * (`INTEGRATION_CONCRETE_STRUCTURE.md`).
 */
export class WebhookDeliveryService {
  constructor(private readonly repository: WebhookDeliveryRepository) {}

  async record(connectorId: string, tenantId: string): Promise<WebhookDelivery> {
    const delivery: WebhookDelivery = { connectorId, tenantId, receivedAt: new Date() };
    return this.repository.create(delivery);
  }

  async listByConnector(connectorId: string): Promise<readonly WebhookDelivery[]> {
    return this.repository.listByConnector(connectorId);
  }
}
