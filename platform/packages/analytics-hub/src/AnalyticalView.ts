/**
 * Analytical View — uma leitura específica e nomeada de um Dataset, reutilizável por múltiplos
 * Dashboard ou Report.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 4.
 */
export interface AnalyticalView {
  /** Identificador da Analytical View. */
  readonly analyticalViewId: string;

  /** Dataset ao qual esta leitura se refere. */
  readonly datasetId: string;

  /** Nome da leitura. */
  readonly name: string;
}
