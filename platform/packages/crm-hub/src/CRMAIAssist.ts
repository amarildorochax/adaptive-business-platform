/**
 * CRM AI Assist — a integração declarativa entre o CRM Hub e o AI Core, exclusivamente através do
 * contrato externo já publicado pelo AI Hub — nunca através de nenhum dos onze componentes internos
 * do AI Core (`PHASE_5_BUSINESS_HUBS_ARCHITECTURE_DEFINITION.md`, Seção 7.1). O CRM Hub nunca
 * implementa lógica de inteligência artificial própria (`CRM_HUB.md`, Capítulo 13).
 * Nenhum tipo de `@abp/ai` é importado por este arquivo — toda referência é opaca.
 */
export type CRMAIAssistPurpose =
  | "LeadQualification"
  | "OpportunityPrioritization"
  | "ResponseSuggestion";

export interface CRMAIAssistRequest {
  /** Relationship, ou Lead, ao qual esta solicitação de assistência se refere. */
  readonly relationshipId: string;

  /** Finalidade da assistência solicitada ao AI Hub. */
  readonly purpose: CRMAIAssistPurpose;

  /** Momento da solicitação. */
  readonly requestedAt: Date;
}

export interface CRMAIAssistSuggestion {
  /** Relationship, ou Lead, ao qual esta sugestão se refere. */
  readonly relationshipId: string;

  /** Finalidade da sugestão recebida. */
  readonly purpose: CRMAIAssistPurpose;

  /** Conteúdo da sugestão — sempre recomendação, nunca decisão automática e opaca (Blueprint, Capítulo 12). */
  readonly suggestion: string;

  /** Grau de confiança associado, natureza sempre probabilística. */
  readonly confidence: number;

  /** Momento em que a sugestão foi produzida pelo AI Hub. */
  readonly producedAt: Date;
}
