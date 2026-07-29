/**
 * Finance AI Assist — a integração declarativa entre o Finance Hub e o AI Core, exclusivamente
 * através do contrato externo já publicado pelo AI Hub — nunca através de nenhum dos onze componentes
 * internos do AI Core (`PHASE_5_BUSINESS_HUBS_ARCHITECTURE_DEFINITION.md`, Seção 7.1). O AI Hub
 * apoia a decisão financeira, sugerindo o que merece atenção, mas nunca altera diretamente nenhum
 * estado financeiro — toda mudança sugerida exige confirmação humana explícita ou Regra
 * determinística já configurada (`FINANCE_DOMAIN_BLUEPRINT.md`, ADR-011).
 * Nenhum tipo de `@abp/ai` é importado por este arquivo — toda referência é opaca.
 */
export type FinAIAssistPurpose = "AnomalyDetection";

export interface FinAIAssistRequest {
  /** Financial Account à qual esta solicitação de assistência se refere. */
  readonly financialAccountId: string;

  /** Finalidade da assistência solicitada ao AI Hub. */
  readonly purpose: FinAIAssistPurpose;

  /** Momento da solicitação. */
  readonly requestedAt: Date;
}

export interface FinAIAssistSuggestion {
  /** Financial Account à qual esta sugestão se refere. */
  readonly financialAccountId: string;

  /** Finalidade da sugestão recebida. */
  readonly purpose: FinAIAssistPurpose;

  /** Conteúdo da sugestão — sempre recomendação, nunca mudança de estado automática. */
  readonly suggestion: string;

  /** Grau de confiança associado, natureza sempre probabilística. */
  readonly confidence: number;

  /** Se a sugestão já foi confirmada por decisão humana ou por Regra determinística configurada. */
  readonly confirmed: boolean;

  /** Momento em que a sugestão foi produzida pelo AI Hub. */
  readonly producedAt: Date;
}
