import { describe, expect, it } from 'vitest';
import { ConversionEventService } from './ConversionEventService';
import { FakeConversionEventRepository } from './testing/InMemoryFakes';

describe('ConversionEventService', () => {
  it('register acumula histórico — nunca substitui o registro anterior', async () => {
    const service = new ConversionEventService(new FakeConversionEventRepository());

    await service.register('goal-1', 'campaign-1');
    await service.register('goal-1', 'campaign-1');

    const history = await service.listByGoal('goal-1');

    expect(history).toHaveLength(2);
  });

  it('ConversionEventRepository nunca expõe update — apenas create, get e listByGoal', () => {
    const service = new ConversionEventService(new FakeConversionEventRepository());
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(service));

    expect(methodNames).not.toContain('update');
  });
});
