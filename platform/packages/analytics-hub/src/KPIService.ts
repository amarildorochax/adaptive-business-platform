import type { KPI } from './KPI';
import type { KPIRepository } from './KPIRepository';
import type { MetricRepository } from './MetricRepository';

/**
 * KPIService — nenhum precedente legado equivalente foi encontrado. `recalculate` sempre deriva o
 * valor da soma das Metric associadas — nunca aceita um valor arbitrário do chamador (KPIs Are
 * Derived, Blueprint ADR-003). Nenhuma emissão de Evento aqui — responsabilidade exclusiva de
 * AnalyticsManager.
 */
export class KPIService {
  constructor(
    private readonly repository: KPIRepository,
    private readonly metrics: MetricRepository,
  ) {}

  async create(tenantId: string, metricIds: readonly string[]): Promise<KPI> {
    const value = await this.deriveValue(metricIds);
    const kpi: KPI = { kpiId: crypto.randomUUID(), tenantId, metricIds, value, calculatedAt: new Date() };
    return this.repository.create(kpi);
  }

  async recalculate(kpiId: string): Promise<KPI> {
    const existing = await this.repository.get(kpiId);

    if (!existing) {
      throw new Error(`KPI ${kpiId} não encontrado.`);
    }

    const value = await this.deriveValue(existing.metricIds);
    return this.repository.update({ ...existing, value, calculatedAt: new Date() });
  }

  async get(kpiId: string): Promise<KPI | undefined> {
    return this.repository.get(kpiId);
  }

  private async deriveValue(metricIds: readonly string[]): Promise<number> {
    let total = 0;

    for (const metricId of metricIds) {
      const metric = await this.metrics.get(metricId);
      total += metric?.value ?? 0;
    }

    return total;
  }
}
