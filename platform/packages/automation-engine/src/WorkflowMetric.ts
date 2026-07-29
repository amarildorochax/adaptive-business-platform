/**
 * Workflow Metric — o dado operacional agregado pelo Metrics Engine sobre execução de Workflow:
 * volume, latência, taxa de sucesso e de falha por tipo de Workflow (`AUTOMATION_ENGINE.md`,
 * Capítulo 7), alimentando tanto observabilidade técnica quanto o Automation Analytics.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export type MetricKind = "Volume" | "Latency" | "SuccessRate" | "FailureRate";

export interface WorkflowMetric {
  /** Identificador da Workflow Metric. */
  readonly workflowMetricId: string;

  /** Workflow ao qual esta métrica se refere — ver Workflow.ts (Sprint 6.1). */
  readonly workflowId: string;

  /** Natureza da métrica. */
  readonly kind: MetricKind;

  /** Valor calculado. */
  readonly value: number;

  /** Momento do cálculo. */
  readonly calculatedAt: Date;
}
