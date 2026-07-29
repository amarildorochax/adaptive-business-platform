/**
 * Communication AI Assist — a integração declarativa entre o Communication Hub e o AI Core,
 * exclusivamente através do contrato externo já publicado pelo AI Hub — nunca através de nenhum dos
 * onze componentes internos do AI Core (`PHASE_5_BUSINESS_HUBS_ARCHITECTURE_DEFINITION.md`,
 * Seção 7.1). O AI Hub decide o conteúdo da sugestão; o Communication Hub decide quando e por qual
 * Canal enviá-lo (`COMMUNICATION_HUB.md`, Capítulo 13) — nunca implementando geração de linguagem
 * própria.
 * Nenhum tipo de `@abp/ai` é importado por este arquivo — toda referência é opaca.
 */
export type CommAIAssistPurpose = "ResponseSuggestion";

export interface CommAIAssistRequest {
  /** Conversation à qual esta solicitação de assistência se refere. */
  readonly conversationId: string;

  /** Finalidade da assistência solicitada ao AI Hub. */
  readonly purpose: CommAIAssistPurpose;

  /** Momento da solicitação. */
  readonly requestedAt: Date;
}

export interface CommAIAssistSuggestion {
  /** Conversation à qual esta sugestão se refere. */
  readonly conversationId: string;

  /** Finalidade da sugestão recebida. */
  readonly purpose: CommAIAssistPurpose;

  /** Conteúdo da sugestão — sempre recomendação, nunca envio automático. */
  readonly suggestion: string;

  /** Grau de confiança associado, natureza sempre probabilística. */
  readonly confidence: number;

  /** Momento em que a sugestão foi produzida pelo AI Hub. */
  readonly producedAt: Date;
}
