import { describe, expect, it } from 'vitest';
import { SubscriptionService } from './SubscriptionService';
import { FakeSubscriptionRepository } from './testing/InMemoryFakes';

describe('SubscriptionService', () => {
  it('cria uma Subscription sempre ativa', async () => {
    const service = new SubscriptionService(new FakeSubscriptionRepository());

    const subscription = await service.create('account-1', 49.9, 30);

    expect(subscription.active).toBe(true);
  });

  it('renew falha quando a Subscription não está ativa', async () => {
    const repository = new FakeSubscriptionRepository();
    const service = new SubscriptionService(repository);
    const subscription = await service.create('account-1', 49.9, 30);
    await repository.update({ ...subscription, active: false });

    await expect(service.renew(subscription.subscriptionId)).rejects.toThrow();
  });

  it('renew mantém a Subscription ativa quando já está ativa', async () => {
    const service = new SubscriptionService(new FakeSubscriptionRepository());
    const subscription = await service.create('account-1', 49.9, 30);

    const renewed = await service.renew(subscription.subscriptionId);

    expect(renewed.active).toBe(true);
  });
});
