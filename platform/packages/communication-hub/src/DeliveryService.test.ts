import { describe, expect, it } from 'vitest';
import { DeliveryService } from './DeliveryService';
import { FakeDeliveryRepository } from './testing/InMemoryFakes';

describe('DeliveryService', () => {
  it('RetryNeverAltersHistory — cada tentativa é um novo registro, o histórico anterior permanece intacto', async () => {
    const service = new DeliveryService(new FakeDeliveryRepository());

    const first = await service.recordAttempt('message-1', 'Failed');
    const retry = await service.recordAttempt('message-1', 'Delivered');

    const history = await service.listByMessage('message-1');

    expect(history).toHaveLength(2);
    expect(history[0]?.deliveryId).toBe(first.deliveryId);
    expect(history[0]?.status).toBe('Failed');
    expect(history[1]?.deliveryId).toBe(retry.deliveryId);
    expect(history[1]?.status).toBe('Delivered');
  });

  it('DeliveryRepository nunca expõe update — apenas create e listByMessage', () => {
    const service = new DeliveryService(new FakeDeliveryRepository());
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(service));

    expect(methodNames).not.toContain('update');
  });
});
