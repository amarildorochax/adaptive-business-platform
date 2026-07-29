/**
 * Analytics AI Assist — a integração declarativa entre o Analytics Hub e o AI Core, exclusivamente
 * através do contrato externo já publicado pelo AI Hub — nunca através de nenhum dos onze
 * componentes internos do AI Core (`PHASE_5_BUSINESS_HUBS_ARCHITECTURE_DEFINITION.md`, Seção 7.1).
 * O AI Hub apoia a identificação de Insight, a projeção de Forecast, e a formulação de
 * Recommendation, mas nunca decide sozinho qual Insight é válido, nem executa uma Analytical
 * Recommendation diretamente — toda ação sugerida exige confirmação humana explícita
 * (`ANALYTICS_HUB.md`, Capítulo 13; Human Oversight, `AI_HUB.md`, Capítulo 5).
 * Nenhum tipo de `@abp/ai` é importado por este arquivo — toda referência é opaca.
 */
export type AnalyticsAIAssistPurpose = "InsightGeneration" | "Forecasting" | "RecommendationFormulation";

export interface AnalyticsAIAssistRequest {
  /** Dataset ao qual esta solicitação de assistência se refere. */
  readonly datasetId: string;

  /** Finalidade da assistência solicitada ao AI Hub. */
  readonly purpose: AnalyticsAIAssistPurpose;

  /** Momento da solicitação. */
  readonly requestedAt: Date;
}

export interface AnalyticsAIAssistSuggestion {
  /** Dataset ao qual esta sugestão se refere. */
  readonly datasetId: string;

  /** Finalidade da sugestão recebida. */
  readonly purpose: AnalyticsAIAssistPurpose;

  /** Conteúdo da sugestão — sempre recomendação, nunca decisão automática sobre validade. */
  readonly suggestion: string;

  /** Grau de confiança associado, natureza sempre probabilística. */
  readonly confidence: number;

  /** Se a sugestão já foi confirmada por decisão humana. */
  readonly confirmed: boolean;

  /** Momento em que a sugestão foi produzida pelo AI Hub. */
  readonly producedAt: Date;
}
