import type { TimeSeries } from './TimeSeries';

/** Contrato de persistência de Time Series — apenas o contrato. `update` existe para anexar novo Snapshot à sequência já existente. */
export interface TimeSeriesRepository {
  create(timeSeries: TimeSeries): Promise<TimeSeries>;
  update(timeSeries: TimeSeries): Promise<TimeSeries>;
  findByMetric(metricId: string): Promise<TimeSeries | undefined>;
}
