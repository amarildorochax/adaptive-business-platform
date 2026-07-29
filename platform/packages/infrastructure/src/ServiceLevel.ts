/**
 * Service Level — declaração de indicador (SLI) e objetivo (SLO) de qualidade de serviço.
 * Estrutura, regras e invariantes definidas em OBSERVABILITY_CONCRETE_STRUCTURE.md.
 */
export interface ServiceLevelIndicator {
  /** Nome nomeado do indicador. */
  readonly name: string;

  /** Nome da Metric que quantifica este indicador. */
  readonly metricName: string;
}

export interface ServiceLevelObjective {
  /** Nome do ServiceLevelIndicator referenciado. */
  readonly indicator: string;

  /** Alvo numérico de qualidade para o indicador referenciado. */
  readonly target: number;
}
