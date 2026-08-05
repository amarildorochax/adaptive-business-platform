/**
 * Direção observada de um Trend. Tipo fechado herdado de `src/core/business-intelligence/Trend.ts`
 * (Business Intelligence Engine legado, real e funcional) — o Blueprint declara `direction` apenas
 * como "descrição da direção observada", sem fechar o vocabulário; esta Sprint adota o vocabulário já
 * validado em produção pelo legado, em vez de deixar o campo como `string` livre.
 */
export type TrendDirection = 'up' | 'down' | 'stable';

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

  /** Direção observada. */
  readonly direction: TrendDirection;

  /** Momento de identificação. */
  readonly identifiedAt: Date;

  /**
   * Grau de confiança da direção observada (0 a 1), herdado de
   * `src/core/business-intelligence/Trend.ts` — não uma probabilidade estatística formal, mas a
   * mesma métrica determinística já usada em produção pelo legado (variação relativa entre a
   * primeira e a última ocorrência de uma Metric).
   */
  readonly confidence?: number;
}
