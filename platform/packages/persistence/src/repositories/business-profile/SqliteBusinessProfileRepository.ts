import type { BusinessProfile, BusinessProfileRepository } from "@abp/business-profile";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

/** Implementação real de `BusinessProfileRepository` (`@abp/business-profile`) — nunca redefine o contrato, apenas o satisfaz contra SQLite. */
export class SqliteBusinessProfileRepository implements BusinessProfileRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(profile: BusinessProfile): Promise<BusinessProfile> {
    this.db.prepare("INSERT INTO business_profiles (profile_id, tenant_id, created_at) VALUES (?, ?, ?)").run(profile.profileId, profile.tenantId, toMs(profile.createdAt));
    return profile;
  }

  async findByTenantId(tenantId: string): Promise<BusinessProfile | undefined> {
    const row = this.db.prepare("SELECT profile_id, tenant_id, created_at FROM business_profiles WHERE tenant_id = ?").get(tenantId) as
      | { profile_id: string; tenant_id: string; created_at: number }
      | undefined;

    return row ? { profileId: row.profile_id, tenantId: row.tenant_id, createdAt: fromMs(row.created_at) } : undefined;
  }
}
