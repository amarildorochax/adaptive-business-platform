import type { Opportunity, OpportunityOutcome } from './Opportunity';
import type { OpportunityRepository } from './OpportunityRepository';

/** Campos aceitos por `OpportunityService.create()`. */
export type CreateOpportunityInput = Pick<
  Opportunity,
  'tenantId' | 'title' | 'value' | 'pipelineId' | 'stageId' | 'partnerId'
>;

/**
 * OpportunityService — adaptado de `src/app/features/crm/types/Deal.ts` (forma mais rica em campo
 * de negócio já validada em UI) e de `src/core/crm/{OpportunityService.ts, OpportunityStore.ts}`
 * (forma mais rica em ciclo de vida — `outcome` tripartite com `lostReason`, já presente no
 * contrato do Blueprint). Esta classe nunca valida se `relationshipId` pertence a um Customer ou a
 * uma Organization — essa verificação exige o RelationshipRepository, e pertence ao CRMManager
 * (regra `OpportunityBelongsToCustomerOrOrganization`, já catalogada em `CRMBusinessRule.ts`).
 */
export class OpportunityService {
  constructor(private readonly repository: OpportunityRepository) {}

  async create(input: CreateOpportunityInput, relationshipId: string): Promise<Opportunity> {
    const opportunity: Opportunity = {
      opportunityId: crypto.randomUUID(),
      relationshipId,
      outcome: 'Open',
      createdAt: new Date(),
      ...input,
    };

    return this.repository.create(opportunity);
  }

  /** Move a Opportunity para um novo Stage e, quando o Pipeline chega a um resultado terminal, registra o outcome. */
  async move(
    opportunityId: string,
    stageId: string,
    outcome: OpportunityOutcome = 'Open',
    lostReason?: string,
  ): Promise<Opportunity> {
    const existing = await this.repository.get(opportunityId);

    if (!existing) {
      throw new Error(`Opportunity ${opportunityId} não encontrada.`);
    }

    const isTerminal = outcome === 'Won' || outcome === 'Lost';

    return this.repository.update({
      ...existing,
      stageId,
      outcome,
      lostReason: outcome === 'Lost' ? lostReason : undefined,
      closedAt: isTerminal ? new Date() : existing.closedAt,
    });
  }

  async get(opportunityId: string): Promise<Opportunity | undefined> {
    return this.repository.get(opportunityId);
  }

  async list(tenantId: string): Promise<readonly Opportunity[]> {
    return this.repository.list(tenantId);
  }

  async listByRelationship(relationshipId: string): Promise<readonly Opportunity[]> {
    return this.repository.listByRelationship(relationshipId);
  }
}
