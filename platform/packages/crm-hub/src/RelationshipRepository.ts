import type { Relationship } from './Relationship';

/**
 * RelationshipRepository — contrato de persistência de Relationship. Interface apenas, per IMP-002,
 * Etapa 5.
 */
export interface RelationshipRepository {
  create(relationship: Relationship): Promise<Relationship>;
  update(relationship: Relationship): Promise<Relationship>;
  get(relationshipId: string): Promise<Relationship | undefined>;
}
