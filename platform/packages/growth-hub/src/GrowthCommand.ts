/**
 * Growth Command — os dezesseis Comandos que mudam estado dentro do Growth Hub, cada um seguindo o
 * princípio Deterministic Growth (`GROWTH_HUB.md`, Capítulo 5) — reprocessamento nunca produz efeito
 * duplicado.
 * Estrutura definida em `GROWTH_HUB.md`, Capítulo 10.
 */
export type GrowthCommandType =
  | "CreateCampaign"
  | "StartCampaign"
  | "StopCampaign"
  | "CreateAudience"
  | "UpdateSegment"
  | "CreateJourney"
  | "StartExperiment"
  | "FinishExperiment"
  | "RegisterConversion"
  | "CalculateAttribution"
  | "CalculateEngagementScore"
  | "RegisterReferral"
  | "GenerateGrowthInsight"
  | "GenerateRecommendation"
  | "CreateInitiative"
  | "CloseOpportunity";

export interface GrowthCommand {
  /** Identificador de operação, único por execução — garante Idempotência. */
  readonly operationId: string;

  /** Tipo do Comando. */
  readonly type: GrowthCommandType;

  /** Momento em que o Comando foi recebido pelo Growth Manager. */
  readonly requestedAt: Date;
}
