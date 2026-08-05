import { describe, expect, it } from 'vitest';
import type { Trend } from './Trend';
import { InsightService } from './InsightService';
import { FakeInsightRepository } from './testing/InMemoryFakes';

function trend(direction: Trend['direction'], confidence: number): Trend {
  return { trendId: 'trend-1', timeSeriesId: 'timeseries-1', direction, confidence, identifiedAt: new Date() };
}

describe('InsightService', () => {
  it('nunca gera um Insight para um Trend "stable" — nenhuma anomalia observada (Insights Never Execute)', async () => {
    const service = new InsightService(new FakeInsightRepository());

    const insight = await service.identify('tenant-1', 'dataset-1', trend('stable', 0));

    expect(insight).toBeUndefined();
  });

  it('classifica severidade "high" quando a confiança é >= 0.5', async () => {
    const service = new InsightService(new FakeInsightRepository());

    const insight = await service.identify('tenant-1', 'dataset-1', trend('up', 0.8));

    expect(insight?.severity).toBe('high');
  });

  it('classifica severidade "low" quando a confiança é baixa', async () => {
    const service = new InsightService(new FakeInsightRepository());

    const insight = await service.identify('tenant-1', 'dataset-1', trend('down', 0.05));

    expect(insight?.severity).toBe('low');
  });
});
