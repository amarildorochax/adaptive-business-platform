/**
 * Dispatch Metric — o dado agregado pelo Runtime Observability Collector sobre o encaminhamento de
 * solicitações: volume recebido, latência de Dispatch, taxa de sucesso de encaminhamento
 * (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seções 4 e 12).
 *
 * Este artefato é deliberadamente restrito ao nível de Dispatch e nunca duplica o Metrics Engine nem
 * o Automation Analytics já implementados em `@abp/automation-engine` (`WorkflowMetric.ts`,
 * `AutomationAnalyticsIndicator.ts`, Sprint 6.5): aqueles medem volume, latência e taxa de
 * sucesso/falha *por Workflow* — a execução do processo de automação em si; este mede exclusivamente
 * o ato de encaminhar uma solicitação ao seu destino, antes de qualquer processamento de domínio
 * começar. "O Runtime observa o encaminhamento; o Automation Engine observa a execução do Workflow
 * em si" (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 12).
 * Nenhum tipo de `@abp/automation-engine` é importado por este arquivo.
 * Estrutura definida em `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 12.
 */
export type DispatchMetricKind = "DispatchVolume" | "DispatchLatency" | "DispatchSuccessRate";

export interface DispatchMetric {
  /** Identificador da Dispatch Metric. */
  readonly dispatchMetricId: string;

  /** Natureza da métrica — sempre relativa ao ato de encaminhar, nunca à execução de um Workflow. */
  readonly kind: DispatchMetricKind;

  /** Valor observado. */
  readonly value: number;

  /** Momento da observação. */
  readonly observedAt: Date;
}
