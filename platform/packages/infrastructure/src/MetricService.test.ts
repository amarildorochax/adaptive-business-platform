import { describe, expect, it } from 'vitest';
import { MetricService } from './MetricService';
import { FakeMetricRepository } from './testing/InMemoryFakes';

describe('MetricService', () => {
  it('record exige um Correlation ID e persiste o valor observado', async () => {
    const service = new MetricService(new FakeMetricRepository());

    const metric = await service.record('pipeline.latency', 120, 'corr-1');

    expect(metric.name).toBe('pipeline.latency');
    expect(metric.value).toBe(120);
    expect(metric.correlationId).toBe('corr-1');
  });

  it('listByName retorna apenas as Metrics do nome pedido', async () => {
    const service = new MetricService(new FakeMetricRepository());
    await service.record('pipeline.latency', 100, 'corr-1');
    await service.record('pipeline.errors', 1, 'corr-1');

    const results = await service.listByName('pipeline.latency');

    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe('pipeline.latency');
  });
});
