import type { BusinessClassificationRecord, BusinessClassificationRecordRepository } from "@abp/business-profile";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, orNull, orUndefined, toMs } from "../../db/sqlUtil.js";

interface Row {
  profile_id: string;
  segment: string;
  subsegment: string | null;
  version: number;
  recorded_at: number;
}

/** Implementação real de `BusinessClassificationRecordRepository` — `classification` (objeto aninhado) é achatada em `segment`/`subsegment`, nunca serializada como JSON opaco. */
export class SqliteBusinessClassificationRecordRepository implements BusinessClassificationRecordRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(record: BusinessClassificationRecord): Promise<BusinessClassificationRecord> {
    this.db
      .prepare("INSERT INTO business_classification_records (profile_id, segment, subsegment, version, recorded_at) VALUES (?, ?, ?, ?, ?)")
      .run(record.profileId, record.classification.segment, orNull(record.classification.subsegment), record.version, toMs(record.recordedAt));
    return record;
  }

  async listByProfileId(profileId: string): Promise<readonly BusinessClassificationRecord[]> {
    const rows = this.db
      .prepare("SELECT profile_id, segment, subsegment, version, recorded_at FROM business_classification_records WHERE profile_id = ? ORDER BY id ASC")
      .all(profileId) as unknown as Row[];

    return rows.map((row) => ({
      profileId: row.profile_id,
      classification: { segment: row.segment, subsegment: orUndefined(row.subsegment) },
      version: row.version,
      recordedAt: fromMs(row.recorded_at),
    }));
  }
}
