/**
 * Journey — a sequência de etapas estratégicas que um Cliente percorre em relação a uma iniciativa
 * de crescimento; distinta de Conversation, que registra o conteúdo real de uma interação — Journey
 * registra a estrutura estratégica da sequência, nunca o conteúdo trocado (Blueprint, Capítulo 5).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Journey {
  /** Identificador da Journey. */
  readonly journeyId: string;

  /** Campaign à qual esta Journey se relaciona. */
  readonly campaignId: string;

  /** Touchpoints que compõem esta Journey, em ordem. */
  readonly touchpointIds: readonly string[];
}
