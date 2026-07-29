import type { Insight } from "./Insight";
import type { Recommendation } from "./Recommendation";
import type { Trend } from "./Trend";

/**
 * Armazenamento de Insight/Recommendation/Trend — exclusivamente em
 * memória (`Map`), sem persistência. Único Store desta Sprint — guarda
 * as três entidades do domínio, cada uma em seu próprio `Map`,
 * indexado por `id`.
 *
 * Responsabilidade: guardar e recuperar por identificador — nenhuma
 * análise/detecção (isso é responsabilidade de
 * BusinessIntelligenceService) e nenhuma emissão de evento (isso é
 * responsabilidade de BusinessIntelligenceManager).
 *
 * Consumido exclusivamente por BusinessIntelligenceService.
 */
export class BusinessIntelligenceStore {
  private insights = new Map<string, Insight>();

  private recommendations = new Map<string, Recommendation>();

  private trends = new Map<string, Trend>();

  /** Adiciona um novo Insight. */
  addInsight(insight: Insight): void {
    this.insights.set(insight.id, insight);
  }

  /** Retorna todos os Insight já gerados. */
  getAllInsights(): Insight[] {
    return Array.from(this.insights.values());
  }

  /** Adiciona uma nova Recommendation. */
  addRecommendation(recommendation: Recommendation): void {
    this.recommendations.set(recommendation.id, recommendation);
  }

  /** Retorna todas as Recommendation já geradas. */
  getAllRecommendations(): Recommendation[] {
    return Array.from(this.recommendations.values());
  }

  /** Adiciona um novo Trend. */
  addTrend(trend: Trend): void {
    this.trends.set(trend.id, trend);
  }

  /** Retorna todos os Trend já detectados. */
  getAllTrends(): Trend[] {
    return Array.from(this.trends.values());
  }

  /** Remove todos os dados armazenados (as três entidades). */
  clear(): void {
    this.insights.clear();
    this.recommendations.clear();
    this.trends.clear();
  }
}
