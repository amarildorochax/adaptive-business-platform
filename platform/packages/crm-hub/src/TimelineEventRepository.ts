import type { TimelineEvent } from './TimelineEvent';

/**
 * TimelineEventRepository — contrato de persistência de Timeline Event. Interface apenas, per
 * IMP-002, Etapa 5. Deliberadamente não expõe `update` nem `remove` — Timeline Event é imutável por
 * construção (`CRM_DOMAIN_BLUEPRINT.md`, ADR-006; regra `TimelineNeverDeleted` já catalogada em
 * `CRMBusinessRule.ts`), e nenhum contrato de repositório deveria sequer sugerir a possibilidade.
 */
export interface TimelineEventRepository {
  add(event: TimelineEvent): Promise<TimelineEvent>;
  listByRelationship(relationshipId: string): Promise<readonly TimelineEvent[]>;
}
