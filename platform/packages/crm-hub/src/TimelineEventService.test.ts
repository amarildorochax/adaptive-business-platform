import { describe, expect, it } from 'vitest';
import { TimelineEventService } from './TimelineEventService';
import { FakeTimelineEventRepository } from './testing/InMemoryFakes';

describe('TimelineEventService', () => {
  it('registra eventos em ordem, todos associados ao mesmo Relationship', async () => {
    const service = new TimelineEventService(new FakeTimelineEventRepository());

    await service.record('tenant-1', 'relationship-1', 'Primeiro fato.');
    await service.record('tenant-1', 'relationship-1', 'Segundo fato.');

    const events = await service.listByRelationship('relationship-1');

    expect(events).toHaveLength(2);
    expect(events[0]?.description).toBe('Primeiro fato.');
    expect(events[1]?.description).toBe('Segundo fato.');
  });

  it('nunca expõe operação de atualização — apenas record() e listByRelationship() existem (TimelineNeverDeleted)', () => {
    const service = new TimelineEventService(new FakeTimelineEventRepository());
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(service));

    expect(methodNames).toEqual(expect.arrayContaining(['record', 'listByRelationship']));
    expect(methodNames).not.toContain('update');
    expect(methodNames).not.toContain('remove');
  });
});
