import { describe, expect, it } from 'vitest';
import { ServiceLevelService } from './ServiceLevelService';
import { FakeServiceLevelIndicatorRepository, FakeServiceLevelObjectiveRepository } from './testing/InMemoryFakes';

describe('ServiceLevelService — SLI/SLO', () => {
  it('defineIndicator/defineObjective registram SLI e SLO associados por nome', async () => {
    const service = new ServiceLevelService(new FakeServiceLevelIndicatorRepository(), new FakeServiceLevelObjectiveRepository());

    await service.defineIndicator('latencia-p99', 'pipeline.latency');
    await service.defineObjective('latencia-p99', 200);

    const indicators = await service.listIndicators();
    const objectives = await service.listObjectivesFor('latencia-p99');

    expect(indicators).toHaveLength(1);
    expect(indicators[0]?.metricName).toBe('pipeline.latency');
    expect(objectives).toHaveLength(1);
    expect(objectives[0]?.target).toBe(200);
  });
});
