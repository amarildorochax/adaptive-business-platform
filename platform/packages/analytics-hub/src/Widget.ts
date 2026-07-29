/**
 * Widget — a unidade visual que exibe uma Metric, um KPI ou uma Visualization específica dentro de
 * um Dashboard.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Widget {
  /** Identificador do Widget. */
  readonly widgetId: string;

  /** Dashboard ao qual este Widget pertence. */
  readonly dashboardId: string;

  /** Identificador opaco da Metric, KPI, ou Visualization exibida. */
  readonly sourceId: string;
}
