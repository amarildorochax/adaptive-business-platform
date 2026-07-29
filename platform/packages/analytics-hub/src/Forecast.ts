/**
 * Forecast — a projeção futura derivada de um Trend já identificado; sempre projeção sujeita a
 * incerteza explícita, nunca garantia de resultado, e nunca altera estado por si só (Forecast Never
 * Alters State, Blueprint ADR-004).
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Forecast {
  /** Identificador do Forecast. */
  readonly forecastId: string;

  /** Trend a partir do qual este Forecast foi projetado. */
  readonly trendId: string;

  /** Valor projetado. */
  readonly projectedValue: number;

  /** Grau de incerteza associado à projeção. */
  readonly uncertainty: number;

  /** Momento da projeção. */
  readonly projectedAt: Date;
}
