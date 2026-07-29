/**
 * Expansion Strategy — define a estratégia de como um Cliente já retido é levado a ampliar sua
 * relação comercial com a Empresa; o Growth identifica a oportunidade, mas a formalização comercial
 * de uma expansão, incluindo qualquer nova cobrança associada, permanece exclusivamente do CRM Hub
 * e do Finance Hub (Blueprint, Capítulo 5).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface ExpansionStrategy {
  /** Identificador da Expansion Strategy. */
  readonly expansionStrategyId: string;

  /** Tenant ao qual esta estratégia se aplica. */
  readonly tenantId: string;

  /** Descrição da estratégia de expansão. */
  readonly description: string;
}
