import type { Trend } from './Trend';

/** Contrato de persistência de Trend — apenas o contrato. */
export interface TrendRepository {
  create(trend: Trend): Promise<Trend>;
  listByTimeSeries(timeSeriesId: string): Promise<Trend[]>;
}
