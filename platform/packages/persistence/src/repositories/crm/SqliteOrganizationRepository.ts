import type { Organization, OrganizationRepository } from "@abp/crm-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, orNull, orUndefined, toMs } from "../../db/sqlUtil.js";

interface Row {
  organization_id: string;
  tenant_id: string;
  relationship_id: string;
  name: string;
  trade_name: string | null;
  tax_id: string | null;
  segment: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  created_at: number;
}

/** Implementação real de `OrganizationRepository`. */
export class SqliteOrganizationRepository implements OrganizationRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(organization: Organization): Promise<Organization> {
    this.db
      .prepare(
        "INSERT INTO organizations (organization_id, tenant_id, relationship_id, name, trade_name, tax_id, segment, phone, email, website, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        organization.organizationId,
        organization.tenantId,
        organization.relationshipId,
        organization.name,
        orNull(organization.tradeName),
        orNull(organization.taxId),
        orNull(organization.segment),
        orNull(organization.phone),
        orNull(organization.email),
        orNull(organization.website),
        toMs(organization.createdAt),
      );
    return organization;
  }

  async update(organization: Organization): Promise<Organization> {
    this.db
      .prepare(
        "UPDATE organizations SET tenant_id = ?, relationship_id = ?, name = ?, trade_name = ?, tax_id = ?, segment = ?, phone = ?, email = ?, website = ?, created_at = ? WHERE organization_id = ?",
      )
      .run(
        organization.tenantId,
        organization.relationshipId,
        organization.name,
        orNull(organization.tradeName),
        orNull(organization.taxId),
        orNull(organization.segment),
        orNull(organization.phone),
        orNull(organization.email),
        orNull(organization.website),
        toMs(organization.createdAt),
        organization.organizationId,
      );
    return organization;
  }

  async get(organizationId: string): Promise<Organization | undefined> {
    const row = this.db.prepare("SELECT * FROM organizations WHERE organization_id = ?").get(organizationId) as unknown as Row | undefined;
    return row ? toOrganization(row) : undefined;
  }

  async list(tenantId: string): Promise<readonly Organization[]> {
    const rows = this.db.prepare("SELECT * FROM organizations WHERE tenant_id = ?").all(tenantId) as unknown as Row[];
    return rows.map(toOrganization);
  }
}

function toOrganization(row: Row): Organization {
  return {
    organizationId: row.organization_id,
    tenantId: row.tenant_id,
    relationshipId: row.relationship_id,
    name: row.name,
    tradeName: orUndefined(row.trade_name),
    taxId: orUndefined(row.tax_id),
    segment: orUndefined(row.segment),
    phone: orUndefined(row.phone),
    email: orUndefined(row.email),
    website: orUndefined(row.website),
    createdAt: fromMs(row.created_at),
  };
}
