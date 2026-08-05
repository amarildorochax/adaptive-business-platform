import type { TimeSeries } from './TimeSeries';
import type { TimeSeriesRepository } from './TimeSeriesRepository';

/** TimeSeriesService — nenhum precedente legado equivalente foi encontrado (o legado nunca acumula Snapshot entre múltiplas coletas — "nunca séries temporais entre múltiplas snapshots", `src/core/business-intelligence/Trend.ts`, doc-comment). Nenhuma emissão de Evento aqui — responsabilidade exclusiva de AnalyticsManager. */
export class TimeSeriesService {
  constructor(private readonly repository: TimeSeriesRepository) {}

  async append(metricId: string, snapshotId: string): Promise<TimeSeries> {
    const existing = await this.repository.findByMetric(metricId);

    if (existing) {
      return this.repository.update({ ...existing, snapshotIds: [...existing.snapshotIds, snapshotId] });
    }

    return this.repository.create({ timeSeriesId: crypto.randomUUID(), metricId, snapshotIds: [snapshotId] });
  }

  async findByMetric(metricId: string): Promise<TimeSeries | undefined> {
    return this.repository.findByMetric(metricId);
  }
}
