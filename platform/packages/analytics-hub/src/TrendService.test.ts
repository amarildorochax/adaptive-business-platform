import { describe, expect, it } from 'vitest';
import type { Snapshot } from './Snapshot';
import { TrendService } from './TrendService';
import { FakeTrendRepository } from './testing/InMemoryFakes';

function snapshot(value: number, recordedAt: Date): Snapshot {
  return { snapshotId: crypto.randomUUID(), indicatorId: 'metric-1', value, recordedAt };
}

describe('TrendService', () => {
  it('identifica direção "up" quando o último valor é maior que o primeiro', async () => {
    const service = new TrendService(new FakeTrendRepository());

    const trend = await service.identify('timeseries-1', [
      snapshot(10, new Date('2026-08-01')),
      snapshot(20, new Date('2026-08-02')),
    ]);

    expect(trend.direction).toBe('up');
    expect(trend.confidence).toBeGreaterThan(0);
  });

  it('identifica direção "down" quando o último valor é menor que o primeiro', async () => {
    const service = new TrendService(new FakeTrendRepository());

    const trend = await service.identify('timeseries-1', [
      snapshot(20, new Date('2026-08-01')),
      snapshot(10, new Date('2026-08-02')),
    ]);

    expect(trend.direction).toBe('down');
  });

  it('identifica direção "stable" quando o valor não muda', async () => {
    const service = new TrendService(new FakeTrendRepository());

    const trend = await service.identify('timeseries-1', [
      snapshot(10, new Date('2026-08-01')),
      snapshot(10, new Date('2026-08-02')),
    ]);

    expect(trend.direction).toBe('stable');
    expect(trend.confidence).toBe(0);
  });
});
