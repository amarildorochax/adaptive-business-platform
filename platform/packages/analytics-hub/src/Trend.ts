/**
 * Trend — a leitura da evolução de uma Metric ou de um KPI ao longo do tempo, derivada da Time
 * Series correspondente.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Trend {
  /** Identificador do Trend. */
  readonly trendId: string;

  /** Time Series a partir da qual este Trend foi identificado. */
  readonly timeSeriesId: string;

  /** Descrição da direção observada. */
  readonly direction: string;

  /** Momento de identificação. */
  readonly identifiedAt: Date;
}
