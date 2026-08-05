import { describe, expect, it } from 'vitest';
import { MetricService } from './MetricService';
import { FakeMetricRepository } from './testing/InMemoryFakes';

describe('MetricService', () => {
  it('cria uma Metric com fórmula e janela temporal explícitas (MetricRequiresFormulaAndWindow)', async () => {
    const service = new MetricService(new FakeMetricRepository());

    const metric = await service.create(
      {
        tenantId: 'tenant-1',
        datasetId: 'dataset-1',
        formula: 'count(orders)',
        windowStart: new Date('2026-08-01'),
        windowEnd: new Date('2026-08-31'),
        name: 'Pedidos do mês',
      },
      42,
    );

    expect(metric.formula).toBe('count(orders)');
    expect(metric.value).toBe(42);
  });

  it('recalculate atualiza o valor e o momento do cálculo, nunca duplica a Metric', async () => {
    const service = new MetricService(new FakeMetricRepository());
    const created = await service.create(
      { tenantId: 'tenant-1', datasetId: 'dataset-1', formula: 'count(orders)', windowStart: new Date(), windowEnd: new Date(), name: undefined },
      10,
    );

    const recalculated = await service.recalculate(created.metricId, 15);

    expect(recalculated.metricId).toBe(created.metricId);
    expect(recalculated.value).toBe(15);
  });
});
