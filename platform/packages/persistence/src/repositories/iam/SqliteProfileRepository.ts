import type { Identity, Profile, ProfileRepository } from "@abp/platform-services";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface ProfileRow {
  profile_id: string;
  identity: string;
  tenant_id: string;
  role: string;
  created_at: number;
}

function toProfile(row: ProfileRow): Profile {
  return { profileId: row.profile_id, identity: row.identity, tenantId: row.tenant_id, role: row.role, createdAt: fromMs(row.created_at) };
}

/** Implementação real de `ProfileRepository` (`@abp/platform-services`) — nunca redefine o contrato, apenas o satisfaz contra SQLite. */
export class SqliteProfileRepository implements ProfileRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(profile: Profile): Promise<Profile> {
    this.db
      .prepare("INSERT INTO profiles (profile_id, identity, tenant_id, role, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(profile.profileId, profile.identity, profile.tenantId, profile.role, toMs(profile.createdAt));
    return profile;
  }

  async update(profile: Profile): Promise<Profile> {
    this.db.prepare("UPDATE profiles SET role = ? WHERE profile_id = ?").run(profile.role, profile.profileId);
    return profile;
  }

  async find(identity: Identity, tenantId: string): Promise<Profile | undefined> {
    const row = this.db.prepare("SELECT profile_id, identity, tenant_id, role, created_at FROM profiles WHERE identity = ? AND tenant_id = ?").get(identity, tenantId) as unknown as ProfileRow | undefined;
    return row ? toProfile(row) : undefined;
  }

  async listByIdentity(identity: Identity): Promise<Profile[]> {
    const rows = this.db.prepare("SELECT profile_id, identity, tenant_id, role, created_at FROM profiles WHERE identity = ? ORDER BY rowid ASC").all(identity) as unknown as ProfileRow[];
    return rows.map(toProfile);
  }
}
