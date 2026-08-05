import type { AudienceSegment } from './AudienceSegment';

/**
 * Contrato de persistência de Audience Segment — apenas o contrato, per Etapa 7 (IMP-005).
 * `update` existe porque `SegmentUpdated` (o único Evento aprovado desta Entidade) representa tanto a
 * primeira composição quanto todo recálculo subsequente — ver `GrowthManager.updateSegment`.
 */
export interface AudienceSegmentRepository {
  create(segment: AudienceSegment): Promise<AudienceSegment>;
  update(segment: AudienceSegment): Promise<AudienceSegment>;
  get(audienceSegmentId: string): Promise<AudienceSegment | undefined>;
  findByCriterion(audienceId: string, criterion: string): Promise<AudienceSegment | undefined>;
  list(audienceId: string): Promise<AudienceSegment[]>;
}
