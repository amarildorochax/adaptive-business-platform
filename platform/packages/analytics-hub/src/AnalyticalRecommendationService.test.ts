import { describe, expect, it } from 'vitest';
import type { Insight } from './Insight';
import { AnalyticalRecommendationService } from './AnalyticalRecommendationService';
import { FakeAnalyticalRecommendationRepository } from './testing/InMemoryFakes';

function insight(severity: Insight['severity']): Insight {
  return {
    insightId: 'insight-1',
    tenantId: 'tenant-1',
    datasetId: 'dataset-1',
    description: 'desc',
    title: 'title',
    severity,
    identifiedAt: new Date(),
  };
}

describe('AnalyticalRecommendationService', () => {
  it('nunca gera uma Recommendation para um Insight de severidade "low"', async () => {
    const service = new AnalyticalRecommendationService(new FakeAnalyticalRecommendationRepository());

    const recommendation = await service.formulate(insight('low'));

    expect(recommendation).toBeUndefined();
  });

  it('gera uma Recommendation sempre não confirmada — exige confirmação humana (Human Oversight)', async () => {
    const service = new AnalyticalRecommendationService(new FakeAnalyticalRecommendationRepository());

    const recommendation = await service.formulate(insight('high'));

    expect(recommendation?.confirmed).toBe(false);
    expect(recommendation?.priority).toBe('high');
  });

  it('confirm transiciona confirmed para true', async () => {
    const service = new AnalyticalRecommendationService(new FakeAnalyticalRecommendationRepository());
    const created = await service.formulate(insight('medium'));

    const confirmed = await service.confirm(created!.analyticalRecommendationId);

    expect(confirmed.confirmed).toBe(true);
  });
});
