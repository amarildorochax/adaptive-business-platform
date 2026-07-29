/**
 * Growth Event — os dezessete Eventos de domínio publicados pelo Growth Hub, cada um um Fato
 * consumado, publicados exclusivamente pelo Event Publisher, com ordenação garantida por Campaign e
 * por Experiment.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 10, confirmada em `GROWTH_HUB.md`,
 * Capítulo 12 ("o catálogo completo dos dezessete Eventos") — sem discrepância de contagem entre os
 * dois documentos.
 */
export type GrowthEventType =
  | "CampaignCreated"
  | "CampaignStarted"
  | "CampaignFinished"
  | "AudienceBuilt"
  | "SegmentUpdated"
  | "JourneyStarted"
  | "JourneyCompleted"
  | "ExperimentStarted"
  | "ExperimentFinished"
  | "VariantSelected"
  | "ConversionRegistered"
  | "ReferralCreated"
  | "ReferralConverted"
  | "RetentionImproved"
  | "ExpansionAchieved"
  | "GrowthInsightGenerated"
  | "GrowthRecommendationGenerated";

export interface GrowthEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: GrowthEventType;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
