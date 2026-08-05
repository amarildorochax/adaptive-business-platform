import type { Opportunity, OpportunityOutcome, OpportunityRepository } from "@abp/crm-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, fromMsOrUndefined, orNull, orUndefined, toMs, toMsOrNull } from "../../db/sqlUtil.js";

interface Row {
  opportunity_id: string;
  tenant_id: string;
  title: string;
  value: number;
  relationship_id: string;
  pipeline_id: string;
  stage_id: string;
  partner_id: string | null;
  outcome: string;
  lost_reason: string | null;
  created_at: number;
  closed_at: number | null;
}

/** Implementação real de `OpportunityRepository`. */
export class SqliteOpportunityRepository implements OpportunityRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(opportunity: Opportunity): Promise<Opportunity> {
    this.db
      .prepare(
        "INSERT INTO opportunities (opportunity_id, tenant_id, title, value, relationship_id, pipeline_id, stage_id, partner_id, outcome, lost_reason, created_at, closed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        opportunity.opportunityId,
        opportunity.tenantId,
        opportunity.title,
        opportunity.value,
        opportunity.relationshipId,
        opportunity.pipelineId,
        opportunity.stageId,
        orNull(opportunity.partnerId),
        opportunity.outcome,
        orNull(opportunity.lostReason),
        toMs(opportunity.createdAt),
        toMsOrNull(opportunity.closedAt),
      );
    return opportunity;
  }

  async update(opportunity: Opportunity): Promise<Opportunity> {
    this.db
      .prepare(
        "UPDATE opportunities SET tenant_id = ?, title = ?, value = ?, relationship_id = ?, pipeline_id = ?, stage_id = ?, partner_id = ?, outcome = ?, lost_reason = ?, created_at = ?, closed_at = ? WHERE opportunity_id = ?",
      )
      .run(
        opportunity.tenantId,
        opportunity.title,
        opportunity.value,
        opportunity.relationshipId,
        opportunity.pipelineId,
        opportunity.stageId,
        orNull(opportunity.partnerId),
        opportunity.outcome,
        orNull(opportunity.lostReason),
        toMs(opportunity.createdAt),
        toMsOrNull(opportunity.closedAt),
        opportunity.opportunityId,
      );
    return opportunity;
  }

  async get(opportunityId: string): Promise<Opportunity | undefined> {
    const row = this.db.prepare("SELECT * FROM opportunities WHERE opportunity_id = ?").get(opportunityId) as unknown as Row | undefined;
    return row ? toOpportunity(row) : undefined;
  }

  async list(tenantId: string): Promise<readonly Opportunity[]> {
    const rows = this.db.prepare("SELECT * FROM opportunities WHERE tenant_id = ?").all(tenantId) as unknown as Row[];
    return rows.map(toOpportunity);
  }

  async listByRelationship(relationshipId: string): Promise<readonly Opportunity[]> {
    const rows = this.db.prepare("SELECT * FROM opportunities WHERE relationship_id = ?").all(relationshipId) as unknown as Row[];
    return rows.map(toOpportunity);
  }
}

function toOpportunity(row: Row): Opportunity {
  return {
    opportunityId: row.opportunity_id,
    tenantId: row.tenant_id,
    title: row.title,
    value: row.value,
    relationshipId: row.relationship_id,
    pipelineId: row.pipeline_id,
    stageId: row.stage_id,
    partnerId: orUndefined(row.partner_id),
    outcome: row.outcome as OpportunityOutcome,
    lostReason: orUndefined(row.lost_reason),
    createdAt: fromMs(row.created_at),
    closedAt: fromMsOrUndefined(row.closed_at),
  };
}
