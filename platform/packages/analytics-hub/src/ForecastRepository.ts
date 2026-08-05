import type { Forecast } from './Forecast';

/** Contrato de persistência de Forecast — apenas o contrato. Nunca declara `update` — Forecast Never Alters State (Blueprint ADR-004); uma nova projeção é um novo Forecast, nunca uma sobrescrita. */
export interface ForecastRepository {
  create(forecast: Forecast): Promise<Forecast>;
  listByTrend(trendId: string): Promise<Forecast[]>;
}
