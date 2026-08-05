import type { WebhookDelivery } from "./WebhookDelivery.js";

/** Webhook Delivery Repository — cada notificação recebida é um fato imutável; nunca `update` nem `remove`. */
export interface WebhookDeliveryRepository {
  create(delivery: WebhookDelivery): Promise<WebhookDelivery>;
  listByConnector(connectorId: string): Promise<readonly WebhookDelivery[]>;
}
