import type { BusinessClassificationRecord } from "./BusinessClassificationRecord.js";

/** Business Classification Record Repository — cada versão é um fato imutável; nunca `update` nem `remove` (ADR-009). */
export interface BusinessClassificationRecordRepository {
  create(record: BusinessClassificationRecord): Promise<BusinessClassificationRecord>;
  listByProfileId(profileId: string): Promise<readonly BusinessClassificationRecord[]>;
}
