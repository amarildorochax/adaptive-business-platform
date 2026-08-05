import type { BusinessProfileLifecycleStage, BusinessProfileLifecycleState, BusinessProfileLifecycleStateRepository } from "@abp/business-profile";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface Row {
  profile_id: string;
  stage: string;
  entered_at: number;
}

/** Implementação real de `BusinessProfileLifecycleStateRepository`. */
export class SqliteBusinessProfileLifecycleStateRepository implements BusinessProfileLifecycleStateRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(state: BusinessProfileLifecycleState): Promise<BusinessProfileLifecycleState> {
    this.db.prepare("INSERT INTO business_profile_lifecycle_states (profile_id, stage, entered_at) VALUES (?, ?, ?)").run(state.profileId, state.stage, toMs(state.enteredAt));
    return state;
  }

  async listByProfileId(profileId: string): Promise<readonly BusinessProfileLifecycleState[]> {
    const rows = this.db
      .prepare("SELECT profile_id, stage, entered_at FROM business_profile_lifecycle_states WHERE profile_id = ? ORDER BY id ASC")
      .all(profileId) as unknown as Row[];

    return rows.map((row) => ({ profileId: row.profile_id, stage: row.stage as BusinessProfileLifecycleStage, enteredAt: fromMs(row.entered_at) }));
  }
}
