import type { Maturity } from "./Maturity.js";
import type { MaturityRecord } from "./MaturityRecord.js";
import type { MaturityRecordRepository } from "./MaturityRecordRepository.js";

/**
 * Business Maturity Service — implementa o "Business Maturity Engine" (`BUSINESS_PROFILE_ENGINE.md`,
 * Capítulo 7): "avalia em que estágio de maturidade operacional e digital uma empresa se encontra...
 * distinta da classificação de Segmento." Versionado de forma independente da Classificação (ADR-006,
 * Composable Profile) — nunca no mesmo registro, nunca a mesma versão.
 */
export class BusinessMaturityService {
  constructor(private readonly repository: MaturityRecordRepository) {}

  async assess(profileId: string, maturity: Maturity): Promise<MaturityRecord> {
    const previous = await this.repository.listByProfileId(profileId);
    const record: MaturityRecord = { profileId, maturity, version: previous.length + 1, recordedAt: new Date() };
    return this.repository.create(record);
  }

  async current(profileId: string): Promise<Maturity | undefined> {
    const records = await this.repository.listByProfileId(profileId);
    return records[records.length - 1]?.maturity;
  }

  async history(profileId: string): Promise<readonly MaturityRecord[]> {
    return this.repository.listByProfileId(profileId);
  }
}
