import { describe, expect, it } from 'vitest';
import { WebhookDeliveryService } from './WebhookDeliveryService';
import { FakeWebhookDeliveryRepository } from './testing/InMemoryFakes';

describe('WebhookDeliveryService — processamento de notificação já recebida em um endpoint já registrado', () => {
  it('record registra o recebimento associado ao Connector e ao Tenant', async () => {
    const service = new WebhookDeliveryService(new FakeWebhookDeliveryRepository());

    const delivery = await service.record('connector-1', 'tenant-1');

    expect(delivery.connectorId).toBe('connector-1');
    expect(delivery.tenantId).toBe('tenant-1');
  });

  it('listByConnector retorna apenas as entregas do Connector pedido', async () => {
    const service = new WebhookDeliveryService(new FakeWebhookDeliveryRepository());
    await service.record('connector-1', 'tenant-1');
    await service.record('connector-2', 'tenant-1');

    const results = await service.listByConnector('connector-1');

    expect(results).toHaveLength(1);
  });
});
