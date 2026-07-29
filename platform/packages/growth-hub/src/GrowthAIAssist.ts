/**
 * Growth AI Assist — a integração declarativa entre o Growth Hub e o AI Core, exclusivamente através
 * do contrato externo já publicado pelo AI Hub — nunca através de nenhum dos onze componentes
 * internos do AI Core (`PHASE_5_BUSINESS_HUBS_ARCHITECTURE_DEFINITION.md`, Seção 7.1). O AI Hub
 * apoia a decisão de crescimento, sugerindo o que merece atenção, mas nunca inicia uma Campaign,
 * nunca encerra um Experiment e nunca aplica uma Growth Recommendation diretamente — toda ação
 * sugerida exige confirmação humana explícita ou Regra determinística já configurada
 * (`GROWTH_HUB.md`, Capítulo 13; Human Oversight, `AI_HUB.md`, Capítulo 5).
 * Nenhum tipo de `@abp/ai` é importado por este arquivo — toda referência é opaca.
 */
export type GrowthAIAssistPurpose = "InsightGeneration" | "RecommendationFormulation";

export interface GrowthAIAssistRequest {
  /** Growth Metric ou Insight ao qual esta solicitação de assistência se refere — identificador opaco. */
  readonly subjectId: string;

  /** Finalidade da assistência solicitada ao AI Hub. */
  readonly purpose: GrowthAIAssistPurpose;

  /** Momento da solicitação. */
  readonly requestedAt: Date;
}

export interface GrowthAIAssistSuggestion {
  /** Identificador opaco do assunto ao qual esta sugestão se refere. */
  readonly subjectId: string;

  /** Finalidade da sugestão recebida. */
  readonly purpose: GrowthAIAssistPurpose;

  /** Conteúdo da sugestão — sempre recomendação, nunca ação automática sobre Campaign ou Experiment. */
  readonly suggestion: string;

  /** Grau de confiança associado, natureza sempre probabilística. */
  readonly confidence: number;

  /** Se a sugestão já foi confirmada por decisão humana ou por Regra determinística. */
  readonly confirmed: boolean;

  /** Momento em que a sugestão foi produzida pelo AI Hub. */
  readonly producedAt: Date;
}
