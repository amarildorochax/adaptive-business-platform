import type { Snapshot } from './Snapshot';
import type { Trend, TrendDirection } from './Trend';
import type { TrendRepository } from './TrendRepository';

/**
 * TrendService — adaptado de `src/core/business-intelligence/BusinessIntelligenceService.
 * detectTrends()` (Business Intelligence Engine legado, real e funcional): compara o primeiro e o
 * último Snapshot de uma Time Series, por `recordedAt`, para derivar `direction`/`confidence` — a
 * mesma detecção simples e determinística já validada em produção (nunca estatística avançada, nunca
 * Machine Learning). Nenhuma emissão de Evento aqui — responsabilidade exclusiva de AnalyticsManager.
 */
export class TrendService {
  constructor(private readonly repository: TrendRepository) {}

  async identify(timeSeriesId: string, snapshots: readonly Snapshot[]): Promise<Trend> {
    const sorted = [...snapshots].sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
    const first = sorted[0]?.value ?? 0;
    const last = sorted[sorted.length - 1]?.value ?? 0;
    const delta = last - first;

    const direction: TrendDirection = delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable';
    const confidence = Math.min(1, Math.abs(delta) / (Math.abs(first) || 1));

    const trend: Trend = {
      trendId: crypto.randomUUID(),
      timeSeriesId,
      direction,
      confidence,
      identifiedAt: new Date(),
    };

    return this.repository.create(trend);
  }

  async listByTimeSeries(timeSeriesId: string): Promise<readonly Trend[]> {
    return this.repository.listByTimeSeries(timeSeriesId);
  }
}
