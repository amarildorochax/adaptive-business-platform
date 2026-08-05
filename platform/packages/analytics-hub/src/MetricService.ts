import type { Metric } from './Metric';
import type { MetricRepository } from './MetricRepository';

/** Campos aceitos por `MetricService.create()`. */
export type CreateMetricInput = Pick<Metric, 'tenantId' | 'datasetId' | 'formula' | 'windowStart' | 'windowEnd' | 'name'>;

/**
 * MetricService — adaptado de `src/core/analytics/AnalyticsMetric.ts` (Business Analytics legado,
 * real e funcional) ao vocabulário e à forma já aprovados pelo Blueprint: o legado não modela
 * `formula`/`windowStart`/`windowEnd` (Metric Requires Formula And Window, Blueprint ADR-012) — esta
 * Sprint nunca relaxa essa exigência para acomodar o legado, apenas porta o campo prático `name`, que
 * o legado já validava em produção. Nenhuma emissão de Evento aqui — responsabilidade exclusiva de
 * AnalyticsManager.
 */
export class MetricService {
  constructor(private readonly repository: MetricRepository) {}

  async create(input: CreateMetricInput, value: number): Promise<Metric> {
    const metric: Metric = { metricId: crypto.randomUUID(), value, calculatedAt: new Date(), ...input };
    return this.repository.create(metric);
  }

  async recalculate(metricId: string, value: number): Promise<Metric> {
    const existing = await this.repository.get(metricId);

    if (!existing) {
      throw new Error(`Metric ${metricId} não encontrada.`);
    }

    return this.repository.update({ ...existing, value, calculatedAt: new Date() });
  }

  async get(metricId: string): Promise<Metric | undefined> {
    return this.repository.get(metricId);
  }

  async list(datasetId: string): Promise<readonly Metric[]> {
    return this.repository.list(datasetId);
  }
}
