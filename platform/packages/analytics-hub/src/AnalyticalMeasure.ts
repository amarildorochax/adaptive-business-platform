/**
 * Analytical Measure — o valor quantitativo associado a uma combinação específica de Analytical
 * Dimension.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 4.
 */
export interface AnalyticalMeasure {
  /** Identificador da Analytical Measure. */
  readonly analyticalMeasureId: string;

  /** Analytical Dimension à qual esta medida se refere. */
  readonly analyticalDimensionId: string;

  /** Valor quantitativo. */
  readonly value: number;
}
