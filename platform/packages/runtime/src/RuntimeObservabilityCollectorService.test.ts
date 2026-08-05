import { describe, expect, it } from 'vitest';
import { RuntimeObservabilityCollectorService } from './RuntimeObservabilityCollectorService';
import { FakeDispatchMetricRepository } from './testing/InMemoryFakes';

describe('RuntimeObservabilityCollectorService — "complementares, nunca duplicados, aos já produzidos pelo Metrics Engine do Automation Engine"', () => {
  it('record persiste uma das três DispatchMetricKind já catalogadas', async () => {
    const service = new RuntimeObservabilityCollectorService(new FakeDispatchMetricRepository());

    const metric = await service.record('DispatchLatency', 42);

    expect(metric.kind).toBe('DispatchLatency');
    expect(metric.value).toBe(42);
  });

  it('listByKind retorna apenas as métricas do mesmo tipo', async () => {
    const service = new RuntimeObservabilityCollectorService(new FakeDispatchMetricRepository());
    await service.record('DispatchVolume', 1);
    await service.record('DispatchSuccessRate', 1);

    const volumes = await service.listByKind('DispatchVolume');

    expect(volumes).toHaveLength(1);
  });
});
