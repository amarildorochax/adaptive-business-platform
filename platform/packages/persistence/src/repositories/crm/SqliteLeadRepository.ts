import type { Lead, LeadRepository } from "@abp/crm-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, fromMsOrUndefined, orNull, orUndefined, toMs, toMsOrNull } from "../../db/sqlUtil.js";

interface Row {
  lead_id: string;
  tenant_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  qualified_at: number | null;
  created_at: number;
}

/** Implementação real de `LeadRepository`. */
export class SqliteLeadRepository implements LeadRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(lead: Lead): Promise<Lead> {
    this.db
      .prepare("INSERT INTO leads (lead_id, tenant_id, name, email, phone, source, qualified_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(lead.leadId, lead.tenantId, lead.name, orNull(lead.email), orNull(lead.phone), lead.source, toMsOrNull(lead.qualifiedAt), toMs(lead.createdAt));
    return lead;
  }

  async update(lead: Lead): Promise<Lead> {
    this.db
      .prepare("UPDATE leads SET tenant_id = ?, name = ?, email = ?, phone = ?, source = ?, qualified_at = ?, created_at = ? WHERE lead_id = ?")
      .run(lead.tenantId, lead.name, orNull(lead.email), orNull(lead.phone), lead.source, toMsOrNull(lead.qualifiedAt), toMs(lead.createdAt), lead.leadId);
    return lead;
  }

  async get(leadId: string): Promise<Lead | undefined> {
    const row = this.db.prepare("SELECT * FROM leads WHERE lead_id = ?").get(leadId) as unknown as Row | undefined;
    return row ? toLead(row) : undefined;
  }

  async list(tenantId: string): Promise<readonly Lead[]> {
    const rows = this.db.prepare("SELECT * FROM leads WHERE tenant_id = ?").all(tenantId) as unknown as Row[];
    return rows.map(toLead);
  }
}

function toLead(row: Row): Lead {
  return {
    leadId: row.lead_id,
    tenantId: row.tenant_id,
    name: row.name,
    email: orUndefined(row.email),
    phone: orUndefined(row.phone),
    source: row.source,
    qualifiedAt: fromMsOrUndefined(row.qualified_at),
    createdAt: fromMs(row.created_at),
  };
}
