import type { AnalyticalRecommendation, AnalyticalRecommendationPriority } from './AnalyticalRecommendation';
import type { AnalyticalRecommendationRepository } from './AnalyticalRecommendationRepository';
import type { Insight, InsightSeverity } from './Insight';

/**
 * AnalyticalRecommendationService — adaptado de
 * `src/core/business-intelligence/BusinessIntelligenceService.analyzeReport()` (Business Intelligence
 * Engine legado, real e funcional): "todo Insight com `severity !== 'low'` gera uma Recommendation
 * associada" — mesma regra portada aqui. `confirmed` nasce sempre `false` — exige confirmação humana
 * antes de qualquer ação (Human Oversight, Blueprint ADR-005); `confirm()` é a única forma de
 * transicioná-la. Nenhuma emissão de Evento aqui — responsabilidade exclusiva de AnalyticsManager.
 */
export class AnalyticalRecommendationService {
  constructor(private readonly repository: AnalyticalRecommendationRepository) {}

  async formulate(insight: Insight): Promise<AnalyticalRecommendation | undefined> {
    const severity: InsightSeverity = insight.severity ?? 'low';

    if (severity === 'low') {
      return undefined;
    }

    const priority: AnalyticalRecommendationPriority = severity === 'high' ? 'high' : 'medium';

    const recommendation: AnalyticalRecommendation = {
      analyticalRecommendationId: crypto.randomUUID(),
      insightId: insight.insightId,
      suggestion: `Revisar a causa da tendência associada ao Insight "${insight.title ?? insight.insightId}" antes que se agrave.`,
      title: `Investigar ${insight.title ?? insight.insightId}`,
      priority,
      confirmed: false,
      formulatedAt: new Date(),
    };

    return this.repository.create(recommendation);
  }

  async confirm(analyticalRecommendationId: string): Promise<AnalyticalRecommendation> {
    const existing = await this.repository.get(analyticalRecommendationId);

    if (!existing) {
      throw new Error(`Analytical Recommendation ${analyticalRecommendationId} não encontrada.`);
    }

    return this.repository.update({ ...existing, confirmed: true });
  }

  async listByInsight(insightId: string): Promise<readonly AnalyticalRecommendation[]> {
    return this.repository.listByInsight(insightId);
  }
}
