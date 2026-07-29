/**
 * Growth Recommendation — uma sugestão concreta de ação, derivada de um Growth Insight; sempre como
 * sugestão sujeita a confirmação humana, nunca como ação autoexecutável (Recommendations Are
 * Advisory, `GROWTH_HUB.md`, Capítulo 5).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface GrowthRecommendation {
  /** Identificador da Growth Recommendation. */
  readonly growthRecommendationId: string;

  /** Growth Insight do qual esta Recommendation deriva. */
  readonly growthInsightId: string;

  /** Descrição da ação sugerida. */
  readonly suggestion: string;

  /** Se a sugestão já foi confirmada por decisão humana ou por Regra determinística. */
  readonly confirmed: boolean;

  /** Momento da formulação. */
  readonly formulatedAt: Date;
}
