import type { Metric } from './Metric';

/** Contrato de persistência de Metric — apenas o contrato. `update` existe porque `MetricCalculated` representa recálculo de uma Metric já existente, não apenas sua criação. */
export interface MetricRepository {
  create(metric: Metric): Promise<Metric>;
  update(metric: Metric): Promise<Metric>;
  get(metricId: string): Promise<Metric | undefined>;
  list(datasetId: string): Promise<Metric[]>;
}
