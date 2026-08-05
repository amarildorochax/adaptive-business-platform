import type { TimelineEvent } from './TimelineEvent';
import type { TimelineEventRepository } from './TimelineEventRepository';

/**
 * TimelineEventService — registra fatos imutáveis sobre um Relationship. Nenhuma implementação
 * equivalente existe em `src/core/crm` (mais próximo é `Interaction`, um conceito de Activity, não
 * de linha do tempo agregada) nem em `src/app/features/crm` (`HistoryEntry` é estruturalmente
 * equivalente, mas nunca declara imutabilidade) — per CRM_VOCABULARY_RECONCILIATION.md, Capítulo 5,
 * este é o único dos sete conceitos em escopo cuja imutabilidade por construção (ADR-006) precisa
 * ser ativamente garantida pelo código, não apenas suposta: `record()` é a única operação exposta —
 * não existe `update`, nem aqui, nem no `TimelineEventRepository`.
 */
export class TimelineEventService {
  constructor(private readonly repository: TimelineEventRepository) {}

  async record(tenantId: string, relationshipId: string, description: string): Promise<TimelineEvent> {
    const event: TimelineEvent = {
      timelineEventId: crypto.randomUUID(),
      tenantId,
      relationshipId,
      description,
      occurredAt: new Date(),
    };

    return this.repository.add(event);
  }

  async listByRelationship(relationshipId: string): Promise<readonly TimelineEvent[]> {
    return this.repository.listByRelationship(relationshipId);
  }
}
