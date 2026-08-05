import type { MaturityRecord } from "./MaturityRecord.js";

/** Maturity Record Repository — cada versão é um fato imutável; nunca `update` nem `remove` (ADR-009). */
export interface MaturityRecordRepository {
  create(record: MaturityRecord): Promise<MaturityRecord>;
  listByProfileId(profileId: string): Promise<readonly MaturityRecord[]>;
}
