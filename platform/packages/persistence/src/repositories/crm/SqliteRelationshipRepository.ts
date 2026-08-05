import type { Relationship, RelationshipLifecycleStage, RelationshipPartyType, RelationshipRepository, RelationshipStatus } from "@abp/crm-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface Row {
  relationship_id: string;
  tenant_id: string;
  party_type: string;
  party_id: string;
  status: string;
  lifecycle_stage: string;
  account_manager_id: string;
  created_at: number;
}

/** Implementação real de `RelationshipRepository`. */
export class SqliteRelationshipRepository implements RelationshipRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(relationship: Relationship): Promise<Relationship> {
    this.db
      .prepare("INSERT INTO relationships (relationship_id, tenant_id, party_type, party_id, status, lifecycle_stage, account_manager_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(
        relationship.relationshipId,
        relationship.tenantId,
        relationship.partyType,
        relationship.partyId,
        relationship.status,
        relationship.lifecycleStage,
        relationship.accountManagerId,
        toMs(relationship.createdAt),
      );
    return relationship;
  }

  async update(relationship: Relationship): Promise<Relationship> {
    this.db
      .prepare("UPDATE relationships SET tenant_id = ?, party_type = ?, party_id = ?, status = ?, lifecycle_stage = ?, account_manager_id = ?, created_at = ? WHERE relationship_id = ?")
      .run(
        relationship.tenantId,
        relationship.partyType,
        relationship.partyId,
        relationship.status,
        relationship.lifecycleStage,
        relationship.accountManagerId,
        toMs(relationship.createdAt),
        relationship.relationshipId,
      );
    return relationship;
  }

  async get(relationshipId: string): Promise<Relationship | undefined> {
    const row = this.db.prepare("SELECT * FROM relationships WHERE relationship_id = ?").get(relationshipId) as unknown as Row | undefined;
    return row ? toRelationship(row) : undefined;
  }
}

function toRelationship(row: Row): Relationship {
  return {
    relationshipId: row.relationship_id,
    tenantId: row.tenant_id,
    partyType: row.party_type as RelationshipPartyType,
    partyId: row.party_id,
    status: row.status as RelationshipStatus,
    lifecycleStage: row.lifecycle_stage as RelationshipLifecycleStage,
    accountManagerId: row.account_manager_id,
    createdAt: fromMs(row.created_at),
  };
}
