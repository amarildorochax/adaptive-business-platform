import type { Aggregation } from './Aggregation';
import type { AggregationRepository } from './AggregationRepository';

/** AggregationService — nenhum precedente legado equivalente foi encontrado. Nenhuma emissão de Evento aqui — nenhum Evento aprovado cobre Aggregation isoladamente (ver relatório desta Sprint). */
export class AggregationService {
  constructor(private readonly repository: AggregationRepository) {}

  async process(datasetId: string): Promise<Aggregation> {
    const aggregation: Aggregation = { aggregationId: crypto.randomUUID(), datasetId, processedAt: new Date() };
    return this.repository.create(aggregation);
  }

  async listByDataset(datasetId: string): Promise<readonly Aggregation[]> {
    return this.repository.listByDataset(datasetId);
  }
}
