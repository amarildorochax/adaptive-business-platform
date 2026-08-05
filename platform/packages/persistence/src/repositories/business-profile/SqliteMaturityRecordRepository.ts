import type { Maturity, MaturityRecord, MaturityRecordRepository } from "@abp/business-profile";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface Row {
  profile_id: string;
  maturity: string;
  version: number;
  recorded_at: number;
}

/** Implementação real de `MaturityRecordRepository`. */
export class SqliteMaturityRecordRepository implements MaturityRecordRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(record: MaturityRecord): Promise<MaturityRecord> {
    this.db.prepare("INSERT INTO maturity_records (profile_id, maturity, version, recorded_at) VALUES (?, ?, ?, ?)").run(record.profileId, record.maturity, record.version, toMs(record.recordedAt));
    return record;
  }

  async listByProfileId(profileId: string): Promise<readonly MaturityRecord[]> {
    const rows = this.db.prepare("SELECT profile_id, maturity, version, recorded_at FROM maturity_records WHERE profile_id = ? ORDER BY id ASC").all(profileId) as unknown as Row[];

    return rows.map((row) => ({ profileId: row.profile_id, maturity: row.maturity as Maturity, version: row.version, recordedAt: fromMs(row.recorded_at) }));
  }
}
