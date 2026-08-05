import type { Forecast } from './Forecast';
import type { ForecastRepository } from './ForecastRepository';
import type { Trend } from './Trend';

/**
 * ForecastService — nenhum precedente legado equivalente foi encontrado (`ForecastProvider.ts`,
 * `src/core/business-intelligence/`, é um contrato futuro nunca implementado, reservado para previsão
 * estatística avançada — fora do escopo desta Sprint, "Não adicionar... IA"). `project` deriva
 * `projectedValue` linearmente a partir da `direction`/`confidence` do Trend — determinístico, nunca
 * estatístico avançado. Forecast Never Alters State (Blueprint ADR-004): apenas projeta, nunca
 * modifica nenhum outro domínio. Nenhuma emissão de Evento aqui — responsabilidade exclusiva de
 * AnalyticsManager.
 */
export class ForecastService {
  constructor(private readonly repository: ForecastRepository) {}

  async project(trend: Trend, currentValue: number): Promise<Forecast> {
    const direction = trend.direction === 'up' ? 1 : trend.direction === 'down' ? -1 : 0;
    const confidence = trend.confidence ?? 0;
    const projectedValue = currentValue + currentValue * direction * confidence;
    const uncertainty = 1 - confidence;

    const forecast: Forecast = {
      forecastId: crypto.randomUUID(),
      trendId: trend.trendId,
      projectedValue,
      uncertainty,
      projectedAt: new Date(),
    };

    return this.repository.create(forecast);
  }

  async listByTrend(trendId: string): Promise<readonly Forecast[]> {
    return this.repository.listByTrend(trendId);
  }
}
