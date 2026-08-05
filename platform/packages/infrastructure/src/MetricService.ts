import type { CorrelationId } from "./CorrelationId.js";
import type { Metric } from "./Metric.js";
import type { MetricRepository } from "./MetricRepository.js";

/**
 * Metric Service — "quantificam o comportamento de cada componente ao longo do tempo... sustentando
 * tanto alerta automatizado quanto análise de tendência" (`NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo
 * 9). Nunca decide, ela mesma, se um Alert deve ser disparado — ver `AlertService`.
 */
export class MetricService {
  constructor(private readonly repository: MetricRepository) {}

  async record(name: string, value: number, correlationId: CorrelationId): Promise<Metric> {
    const metric: Metric = { name, value, correlationId, timestamp: new Date() };
    return this.repository.create(metric);
  }

  async listByName(name: string): Promise<readonly Metric[]> {
    return this.repository.listByName(name);
  }
}
