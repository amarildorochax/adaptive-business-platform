import type { BusinessClassification } from "./BusinessClassification.js";
import type { BusinessClassificationRecord } from "./BusinessClassificationRecord.js";
import type { BusinessClassificationRecordRepository } from "./BusinessClassificationRecordRepository.js";
import type { Segment } from "./Segment.js";

/**
 * Business Classification Service — implementa o "Business Classifier", apoiado pelo catálogo do
 * "Segment Engine" (`BUSINESS_PROFILE_ENGINE.md`, Capítulo 7): "determina o Segmento e o Subsegmento
 * de uma empresa... não decide o que fazer com essa classificação — apenas a produz." O número da
 * versão é sempre calculado a partir do próprio histórico já registrado — nunca informado pelo
 * chamador (ADR-009, Profile Versioning), mesma disciplina já usada em `KnowledgeVersionService`
 * (IMP-015).
 */
export class BusinessClassificationService {
  constructor(private readonly repository: BusinessClassificationRecordRepository) {}

  async classify(profileId: string, segment: Segment, subsegment?: string): Promise<BusinessClassificationRecord> {
    const previous = await this.repository.listByProfileId(profileId);
    const classification: BusinessClassification = { segment, subsegment };
    const record: BusinessClassificationRecord = { profileId, classification, version: previous.length + 1, recordedAt: new Date() };
    return this.repository.create(record);
  }

  async current(profileId: string): Promise<BusinessClassification | undefined> {
    const records = await this.repository.listByProfileId(profileId);
    return records[records.length - 1]?.classification;
  }

  async history(profileId: string): Promise<readonly BusinessClassificationRecord[]> {
    return this.repository.listByProfileId(profileId);
  }
}
