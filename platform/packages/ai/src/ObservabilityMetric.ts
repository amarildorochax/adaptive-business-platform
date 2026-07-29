/**
 * Observability Metric — os cinco tipos de métrica que quantificam o comportamento de um componente
 * de IA ao longo do tempo, e o registro declarativo de uma métrica observada.
 * Estrutura definida em AI_OBSERVABILITY_CONCRETE_STRUCTURE.md.
 */
export type ObservabilityMetricType =
  | "Volume"
  | "Latencia"
  | "TaxaDeSucesso"
  | "TaxaDeEscalacaoHumana"
  | "ConsumoDeRecurso";

export interface ObservabilityMetric {
  /** Identificador da métrica. */
  readonly metricId: string;

  /** Tipo desta métrica. */
  readonly type: ObservabilityMetricType;

  /** Valor observado. */
  readonly value: number;

  /** Tipo do componente de origem. */
  readonly componentType: string;
}
