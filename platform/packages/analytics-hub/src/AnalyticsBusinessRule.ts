/**
 * Analytics Business Rule — o catálogo declarativo das doze Regras de negócio do domínio analítico,
 * verificadas antes de qualquer mudança de estado relevante. Este artefato registra o catálogo,
 * nunca a lógica de verificação.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 12.
 */
export type AnalyticsBusinessRuleId =
  | "NeverAltersCustomer"
  | "NeverAltersCampaign"
  | "KPIsAreDerived"
  | "ForecastNeverAltersOperation"
  | "DashboardsAreReadOnly"
  | "AnalyticsPublishesEvents"
  | "SnapshotsAreImmutable"
  | "BenchmarksPreserveHistory"
  | "InsightsNeverExecuteActions"
  | "MetricRequiresFormulaAndWindow"
  | "NeverRecalculatesForeignMetric"
  | "DatasetIsReconstructible";

export interface AnalyticsBusinessRule {
  /** Identificador da Regra. */
  readonly ruleId: AnalyticsBusinessRuleId;

  /** Descrição da Regra, conforme já fixada em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 12. */
  readonly description: string;
}
