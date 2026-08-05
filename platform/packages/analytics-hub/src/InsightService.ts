import type { Insight, InsightSeverity } from './Insight';
import type { InsightRepository } from './InsightRepository';
import type { Trend } from './Trend';

/**
 * InsightService — adaptado de `src/core/business-intelligence/BusinessIntelligenceService.
 * classifySeverity()` (Business Intelligence Engine legado, real e funcional): `identify` nunca gera
 * um Insight para um Trend `stable` (nenhuma anomalia observada), e classifica `severity` a partir de
 * `confidence` com os mesmos limiares já validados em produção (>= 0.5 alta, >= 0.2 média, abaixo
 * baixa). Insights Never Execute (Blueprint ADR-005) — este Service nunca aciona nenhuma ação,
 * apenas registra a constatação. Nenhuma emissão de Evento aqui — responsabilidade exclusiva de
 * AnalyticsManager.
 */
export class InsightService {
  constructor(private readonly repository: InsightRepository) {}

  async identify(tenantId: string, datasetId: string, trend: Trend): Promise<Insight | undefined> {
    if (trend.direction === 'stable') {
      return undefined;
    }

    const severity = this.classifySeverity(trend.confidence ?? 0);
    const title = `Tendência detectada: ${trend.timeSeriesId}`;
    const description = `A Time Series ${trend.timeSeriesId} está em ${trend.direction === 'up' ? 'alta' : 'baixa'} (confiança: ${((trend.confidence ?? 0) * 100).toFixed(0)}%).`;

    const insight: Insight = {
      insightId: crypto.randomUUID(),
      tenantId,
      datasetId,
      description,
      title,
      severity,
      identifiedAt: new Date(),
    };

    return this.repository.create(insight);
  }

  async get(insightId: string): Promise<Insight | undefined> {
    return this.repository.get(insightId);
  }

  async list(tenantId: string): Promise<readonly Insight[]> {
    return this.repository.list(tenantId);
  }

  private classifySeverity(confidence: number): InsightSeverity {
    if (confidence >= 0.5) return 'high';
    if (confidence >= 0.2) return 'medium';
    return 'low';
  }
}
