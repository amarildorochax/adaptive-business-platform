/**
 * Prioridade de uma Analytical Recommendation. Tipo fechado herdado de
 * `src/core/business-intelligence/Recommendation.ts` (Business Intelligence Engine legado, real e
 * funcional) — derivada da gravidade do Insight que originou a Recommendation.
 */
export type AnalyticalRecommendationPriority = 'low' | 'medium' | 'high';

/**
 * Analytical Recommendation — uma sugestão de ação derivada de um Insight, no contexto
 * exclusivamente analítico deste domínio; sempre sujeita a confirmação humana antes de qualquer ação
 * (Human Oversight, Blueprint ADR-005).
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface AnalyticalRecommendation {
  /** Identificador da Analytical Recommendation. */
  readonly analyticalRecommendationId: string;

  /** Insight do qual esta Recommendation deriva. */
  readonly insightId: string;

  /** Descrição da ação sugerida. */
  readonly suggestion: string;

  /** Se a sugestão já foi confirmada por decisão humana. */
  readonly confirmed: boolean;

  /** Momento da formulação. */
  readonly formulatedAt: Date;

  /** Título legível, herdado de `src/core/business-intelligence/Recommendation.ts`. */
  readonly title?: string;

  /** Prioridade, herdada de `src/core/business-intelligence/Recommendation.ts`. */
  readonly priority?: AnalyticalRecommendationPriority;
}
