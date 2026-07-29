/**
 * Growth Business Rule — o catálogo declarativo das catorze Regras de negócio do domínio de
 * crescimento, verificadas antes de qualquer mudança de estado relevante. Este artefato registra o
 * catálogo, nunca a lógica de verificação.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 12.
 */
export type GrowthBusinessRuleId =
  | "CampaignsNeverAlterCustomer"
  | "ExperimentsNeverAlterLedger"
  | "GrowthPublishesEvents"
  | "ConversionsPreserveHistory"
  | "ReferralNeverCreatesCustomer"
  | "JourneyNeverSendsMessagesDirectly"
  | "GrowthNeverExecutesPayments"
  | "GrowthNeverTalksToProviders"
  | "EngagementScoreIsDerived"
  | "CohortsAreImmutableAfterClosing"
  | "AttributionNeverRetroactivelyRewritten"
  | "ExperimentRequiresConversionGoalBeforeStart"
  | "CampaignRequiresAudienceBeforeStart"
  | "GrowthInsightNeverAltersOtherDomainAutomatically";

export interface GrowthBusinessRule {
  /** Identificador da Regra. */
  readonly ruleId: GrowthBusinessRuleId;

  /** Descrição da Regra, conforme já fixada em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 12. */
  readonly description: string;
}
