import type { TimelineEvent, TimelineEventRepository } from "@abp/crm-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface Row {
  timeline_event_id: string;
  tenant_id: string;
  relationship_id: string;
  description: string;
  occurred_at: number;
}

/** Implementação real de `TimelineEventRepository`. Sem `update` nem `remove` — imutável por construção (ADR-006). */
export class SqliteTimelineEventRepository implements TimelineEventRepository {
  constructor(private readonly db: DatabaseSync) {}

  async add(event: TimelineEvent): Promise<TimelineEvent> {
    this.db
      .prepare("INSERT INTO timeline_events (timeline_event_id, tenant_id, relationship_id, description, occurred_at) VALUES (?, ?, ?, ?, ?)")
      .run(event.timelineEventId, event.tenantId, event.relationshipId, event.description, toMs(event.occurredAt));
    return event;
  }

  async listByRelationship(relationshipId: string): Promise<readonly TimelineEvent[]> {
    const rows = this.db.prepare("SELECT * FROM timeline_events WHERE relationship_id = ?").all(relationshipId) as unknown as Row[];
    return rows.map((row) => ({
      timelineEventId: row.timeline_event_id,
      tenantId: row.tenant_id,
      relationshipId: row.relationship_id,
      description: row.description,
      occurredAt: fromMs(row.occurred_at),
    }));
  }
}
