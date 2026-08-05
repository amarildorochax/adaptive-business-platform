import type { Opportunity } from './Opportunity';

/**
 * OpportunityRepository — contrato de persistência de Opportunity. Interface apenas, per IMP-002,
 * Etapa 5.
 */
export interface OpportunityRepository {
  create(opportunity: Opportunity): Promise<Opportunity>;
  update(opportunity: Opportunity): Promise<Opportunity>;
  get(opportunityId: string): Promise<Opportunity | undefined>;
  list(tenantId: string): Promise<readonly Opportunity[]>;
  listByRelationship(relationshipId: string): Promise<readonly Opportunity[]>;
}
