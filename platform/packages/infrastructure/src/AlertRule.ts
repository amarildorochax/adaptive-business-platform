/**
 * Alert Rule — declaração da condição sob a qual um Alerta deveria ser considerado disparado.
 * Apenas o substrato declarativo — nenhum motor de avaliação.
 * Estrutura, regras e invariantes definidas em OBSERVABILITY_CONCRETE_STRUCTURE.md.
 */
export interface AlertRule {
  /** Nome da Metric monitorada. */
  readonly metricName: string;

  /** Limite numérico que, se ultrapassado, caracteriza o Alerta como disparado. */
  readonly threshold: number;
}
