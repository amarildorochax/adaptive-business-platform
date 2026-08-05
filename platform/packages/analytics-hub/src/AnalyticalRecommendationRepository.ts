import type { AnalyticalRecommendation } from './AnalyticalRecommendation';

/** Contrato de persistência de Analytical Recommendation — apenas o contrato. `update` existe apenas para marcar `confirmed`, nunca para alterar a sugestão em si. */
export interface AnalyticalRecommendationRepository {
  create(recommendation: AnalyticalRecommendation): Promise<AnalyticalRecommendation>;
  update(recommendation: AnalyticalRecommendation): Promise<AnalyticalRecommendation>;
  get(analyticalRecommendationId: string): Promise<AnalyticalRecommendation | undefined>;
  listByInsight(insightId: string): Promise<AnalyticalRecommendation[]>;
}
