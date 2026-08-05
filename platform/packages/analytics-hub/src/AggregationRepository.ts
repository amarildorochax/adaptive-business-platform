import type { Aggregation } from './Aggregation';

/** Contrato de persistência de Aggregation — apenas o contrato. */
export interface AggregationRepository {
  create(aggregation: Aggregation): Promise<Aggregation>;
  listByDataset(datasetId: string): Promise<Aggregation[]>;
}
