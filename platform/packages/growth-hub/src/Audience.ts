/**
 * Audience — o conjunto de potenciais ou atuais Clientes visado por uma ou mais Campaign, modelado
 * como conceito de Growth, nunca como lista de Customer do CRM; toda referência a Cliente é mediada
 * por Anti-Corruption Layer contra o CRM Hub, nunca por leitura direta de sua Entidade Customer
 * (Blueprint, ADR-002).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Audience {
  /** Identificador da Audience. */
  readonly audienceId: string;

  /** Tenant ao qual a Audience pertence. */
  readonly tenantId: string;

  /** Referências opacas a potenciais ou atuais Clientes — nunca uma cópia de Customer. */
  readonly memberReferenceIds: readonly string[];

  /** Momento de construção. */
  readonly builtAt: Date;

  /**
   * Alcance estimado no momento da construção. Campo prático herdado de
   * `src/core/campaign/CampaignAudience.ts` (Campaign Management legado) — mesmo precedente de
   * extensão já aplicado em `Campaign.ts` nesta Sprint.
   */
  readonly estimatedReach?: number;
}
