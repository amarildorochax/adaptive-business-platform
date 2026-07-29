/**
 * Analytics Command — os dezesseis Comandos que mudam estado dentro do Analytics Hub. Diferente dos
 * quatro Hubs anteriores, a maioria não é acionada diretamente por um Usuário humano, mas por
 * gatilho interno de atualização programada (`ANALYTICS_HUB.md`, Capítulo 10).
 * Estrutura definida em `ANALYTICS_HUB.md`, Capítulo 10.
 */
export type AnalyticsCommandType =
  | "CreateDashboard"
  | "UpdateDashboard"
  | "ArchiveDashboard"
  | "GenerateReport"
  | "PublishVisualization"
  | "CalculateMetric"
  | "CalculateKPI"
  | "RefreshDataset"
  | "RefreshAnalytics"
  | "CreateSnapshot"
  | "GenerateTrend"
  | "GenerateForecast"
  | "GenerateInsight"
  | "GenerateRecommendation"
  | "UpdateBenchmark"
  | "UpdateScorecard";

export interface AnalyticsCommand {
  /** Identificador de operação, único por execução — garante Idempotência. */
  readonly operationId: string;

  /** Tipo do Comando. */
  readonly type: AnalyticsCommandType;

  /** Momento em que o Comando foi recebido pelo Analytics Manager. */
  readonly requestedAt: Date;
}
