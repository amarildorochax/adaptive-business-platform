/**
 * Observability Indicator — um Service Level Indicator (SLI) e o Service Level Objective (SLO)
 * definido como seu alvo de qualidade.
 * Estrutura definida em AI_OBSERVABILITY_CONCRETE_STRUCTURE.md.
 */
import type { ObservabilityMetricType } from "./ObservabilityMetric.js";

export interface ObservabilityIndicator {
  /** Identificador do indicador. */
  readonly indicatorId: string;

  /** Tipo de métrica observada por este indicador. */
  readonly metricType: ObservabilityMetricType;

  /** Alvo de qualidade (SLO) definido para este indicador. */
  readonly target: number;
}
