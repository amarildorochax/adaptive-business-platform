/**
 * Growth Initiative — uma ação estratégica planejada para capturar uma Growth Opportunity.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface GrowthInitiative {
  /** Identificador da Growth Initiative. */
  readonly growthInitiativeId: string;

  /** Growth Opportunity que esta Initiative busca capturar. */
  readonly growthOpportunityId: string;

  /** Descrição da ação planejada. */
  readonly description: string;

  /** Momento do registro. */
  readonly registeredAt: Date;
}
