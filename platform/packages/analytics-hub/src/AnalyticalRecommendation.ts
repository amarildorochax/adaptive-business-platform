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
}
