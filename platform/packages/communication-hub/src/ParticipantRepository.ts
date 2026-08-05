import type { Participant } from './Participant';

/**
 * ParticipantRepository — contrato de persistência de Participant. Interface apenas, per IMP-003,
 * Etapa 7.
 */
export interface ParticipantRepository {
  create(participant: Participant): Promise<Participant>;
  listByConversation(conversationId: string): Promise<readonly Participant[]>;
}
