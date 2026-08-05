import { describe, expect, it } from 'vitest';
import { AudienceSegmentService } from './AudienceSegmentService';
import { FakeAudienceSegmentRepository } from './testing/InMemoryFakes';

describe('AudienceSegmentService', () => {
  it('recompute cria na primeira chamada para um critério', async () => {
    const service = new AudienceSegmentService(new FakeAudienceSegmentRepository());

    const segment = await service.recompute('audience-1', 'compradores-recorrentes');

    expect(segment.audienceId).toBe('audience-1');
    expect(segment.criterion).toBe('compradores-recorrentes');
  });

  it('recompute atualiza updatedAt nas chamadas seguintes, sem duplicar o Segment', async () => {
    const service = new AudienceSegmentService(new FakeAudienceSegmentRepository());

    const first = await service.recompute('audience-1', 'compradores-recorrentes');
    const second = await service.recompute('audience-1', 'compradores-recorrentes');

    expect(second.audienceSegmentId).toBe(first.audienceSegmentId);

    const all = await service.list('audience-1');
    expect(all).toHaveLength(1);
  });
});
