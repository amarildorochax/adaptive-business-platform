import type { Relationship, RelationshipLifecycleStage, RelationshipPartyType, RelationshipStatus } from './Relationship';
import type { RelationshipRepository } from './RelationshipRepository';

/** Campos aceitos por `RelationshipService.create()`. */
export interface CreateRelationshipInput {
  readonly tenantId: string;
  readonly partyType: RelationshipPartyType;
  readonly partyId: string;
  readonly accountManagerId: string;
}

/**
 * RelationshipService — regra de negócio do Aggregate que estrutura todo vínculo com uma parte
 * externa (Customer, Organization, Supplier, Partner), per `CRM_DOMAIN_BLUEPRINT.md`, Capítulos 7-8.
 * Não existe implementação equivalente em `src/core/crm` nem em `src/app/features/crm` — nenhuma das
 * duas árvores legadas modela Relationship como Aggregate próprio (TECHNICAL_MIGRATION_STRATEGY.md,
 * Capítulo 18); esta classe é, portanto, construção nova sobre o contrato já Frozen, não uma
 * adaptação de lógica preexistente.
 *
 * Nunca instancia Customer, Organization, Supplier ou Partner diretamente — a decisão de qual parte
 * criar pertence a quem chama (ver CRMManager), esta classe apenas garante que todo Relationship
 * criado tenha um Account Manager único, per a regra de negócio `OwnershipIsUnique`.
 */
export class RelationshipService {
  constructor(private readonly repository: RelationshipRepository) {}

  async create(input: CreateRelationshipInput): Promise<Relationship> {
    const relationship: Relationship = {
      relationshipId: crypto.randomUUID(),
      tenantId: input.tenantId,
      partyType: input.partyType,
      partyId: input.partyId,
      status: 'Active',
      lifecycleStage: 'New',
      accountManagerId: input.accountManagerId,
      createdAt: new Date(),
    };

    return this.repository.create(relationship);
  }

  async changeStatus(relationshipId: string, status: RelationshipStatus): Promise<Relationship> {
    const existing = await this.repository.get(relationshipId);

    if (!existing) {
      throw new Error(`Relationship ${relationshipId} não encontrado.`);
    }

    return this.repository.update({ ...existing, status });
  }

  async changeLifecycleStage(
    relationshipId: string,
    lifecycleStage: RelationshipLifecycleStage,
  ): Promise<Relationship> {
    const existing = await this.repository.get(relationshipId);

    if (!existing) {
      throw new Error(`Relationship ${relationshipId} não encontrado.`);
    }

    return this.repository.update({ ...existing, lifecycleStage });
  }

  async get(relationshipId: string): Promise<Relationship | undefined> {
    return this.repository.get(relationshipId);
  }
}
