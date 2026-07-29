/**
 * Growth Query — as treze Consultas de leitura do Growth Hub, cada uma resolvida contra um Read
 * Model já materializado.
 * Estrutura definida em `GROWTH_HUB.md`, Capítulo 11.
 */
export type GrowthQueryType =
  | "CampaignView"
  | "AudienceView"
  | "JourneyView"
  | "FunnelView"
  | "AttributionView"
  | "ConversionAnalysis"
  | "ExperimentView"
  | "CohortView"
  | "LifecycleView"
  | "RetentionAnalysis"
  | "ReferralView"
  | "GrowthDashboard"
  | "GrowthTimeline";

export interface GrowthQuery {
  /** Identificador da Query. */
  readonly queryId: string;

  /** Tipo da Query. */
  readonly type: GrowthQueryType;

  /** Momento em que a Query foi solicitada. */
  readonly requestedAt: Date;
}
