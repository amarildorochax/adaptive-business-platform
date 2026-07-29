/**
 * Decision Support — a capacidade consolidada de apresentar dado, Trend, Forecast e Analytical
 * Recommendation de forma a apoiar uma decisão humana, sem jamais executar essa decisão
 * automaticamente.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface DecisionSupport {
  /** Identificador da composição de Decision Support. */
  readonly decisionSupportId: string;

  /** Indicadores relevantes — identificadores opacos. */
  readonly indicatorIds: readonly string[];

  /** Trends relevantes. */
  readonly trendIds: readonly string[];

  /** Forecasts relevantes. */
  readonly forecastIds: readonly string[];

  /** Analytical Recommendations relevantes. */
  readonly recommendationIds: readonly string[];
}
