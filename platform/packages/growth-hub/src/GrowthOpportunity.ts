/**
 * Growth Opportunity — uma oportunidade estratégica de crescimento identificada a partir de dado
 * observado.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface GrowthOpportunity {
  /** Identificador da Growth Opportunity. */
  readonly growthOpportunityId: string;

  /** Tenant ao qual esta oportunidade pertence. */
  readonly tenantId: string;

  /** Descrição da oportunidade identificada. */
  readonly description: string;

  /** Se a oportunidade já foi encerrada — por captura ou por descontinuação. */
  readonly closed: boolean;

  /** Momento de identificação. */
  readonly identifiedAt: Date;
}
