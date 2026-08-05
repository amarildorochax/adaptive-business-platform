import { describe, expect, it } from 'vitest';
import { KPIService } from './KPIService';
import { MetricService } from './MetricService';
import { FakeKPIRepository, FakeMetricRepository } from './testing/InMemoryFakes';

describe('KPIService', () => {
  it('deriva o valor sempre a partir das Metric associadas — nunca um valor arbitrário (KPIs Are Derived)', async () => {
    const metricRepository = new FakeMetricRepository();
    const metricService = new MetricService(metricRepository);
    const metricA = await metricService.create(
      { tenantId: 'tenant-1', datasetId: 'dataset-1', formula: 'a', windowStart: new Date(), windowEnd: new Date(), name: undefined },
      10,
    );
    const metricB = await metricService.create(
      { tenantId: 'tenant-1', datasetId: 'dataset-1', formula: 'b', windowStart: new Date(), windowEnd: new Date(), name: undefined },
      25,
    );

    const service = new KPIService(new FakeKPIRepository(), metricRepository);
    const kpi = await service.create('tenant-1', [metricA.metricId, metricB.metricId]);

    expect(kpi.value).toBe(35);
  });

  it('recalculate reflete uma mudança em uma Metric já associada', async () => {
    const metricRepository = new FakeMetricRepository();
    const metricService = new MetricService(metricRepository);
    const metric = await metricService.create(
      { tenantId: 'tenant-1', datasetId: 'dataset-1', formula: 'a', windowStart: new Date(), windowEnd: new Date(), name: undefined },
      10,
    );

    const service = new KPIService(new FakeKPIRepository(), metricRepository);
    const kpi = await service.create('tenant-1', [metric.metricId]);

    await metricService.recalculate(metric.metricId, 50);
    const recalculated = await service.recalculate(kpi.kpiId);

    expect(recalculated.value).toBe(50);
  });
});
