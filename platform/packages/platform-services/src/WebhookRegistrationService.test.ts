import { describe, expect, it } from 'vitest';
import { WebhookRegistrationService } from './WebhookRegistrationService';
import { FakeWebhookRegistrationRepository } from './testing/InMemoryFakes';

describe('WebhookRegistrationService — "registro de endpoint... único por Connector e por Tenant"', () => {
  it('register cria um endpoint associado ao Connector e ao Tenant', async () => {
    const service = new WebhookRegistrationService(new FakeWebhookRegistrationRepository());

    const registration = await service.register('connector-1', 'tenant-1', 'https://tenant-1.example.com/webhooks/connector-1');

    expect(registration.endpoint).toBe('https://tenant-1.example.com/webhooks/connector-1');
  });

  it('find nunca retorna o endpoint de outro Tenant', async () => {
    const service = new WebhookRegistrationService(new FakeWebhookRegistrationRepository());
    await service.register('connector-1', 'tenant-1', 'https://tenant-1.example.com/hook');

    expect(await service.find('connector-1', 'tenant-2')).toBeUndefined();
  });
});
