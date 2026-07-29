/**
 * Scorecard — o conjunto estruturado de indicador usado para avaliação de desempenho consolidado.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Scorecard {
  /** Identificador do Scorecard. */
  readonly scorecardId: string;

  /** Tenant ao qual o Scorecard pertence. */
  readonly tenantId: string;

  /** Indicadores que compõem este Scorecard — identificadores opacos. */
  readonly indicatorIds: readonly string[];

  /** Momento do último recálculo. */
  readonly calculatedAt: Date;
}
