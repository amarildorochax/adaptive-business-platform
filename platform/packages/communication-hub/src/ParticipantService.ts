import type { Participant, ParticipantType } from './Participant';
import type { ParticipantRepository } from './ParticipantRepository';

/**
 * ParticipantService — regra de negócio de Participant, que referencia Lead, Customer, Organization
 * ou Contact do CRM Hub (ou um Usuário interno) exclusivamente por identificador opaco
 * (`referenceId`), nunca duplicando o Domain Model de outro Hub — mesma disciplina de isolamento
 * entre Business Hubs já exigida por `PACKAGE_STRUCTURE_MANIFEST.md`, §5 ("nenhum Business Hub
 * depende de outro Business Hub"). `@abp/communication-hub` não importa `@abp/crm-hub` para
 * existir — a integração conceitual da Etapa 8 desta Sprint é inteiramente satisfeita por este
 * campo opaco, sem nenhuma dependência de pacote.
 *
 * Inexistente em `src/core` ou `src/app` (IMP-003, Etapa 1); construído diretamente sobre o
 * contrato já existente em `Participant.ts`.
 */
export class ParticipantService {
  constructor(private readonly repository: ParticipantRepository) {}

  async add(conversationId: string, type: ParticipantType, referenceId: string): Promise<Participant> {
    const participant: Participant = { conversationId, type, referenceId };
    return this.repository.create(participant);
  }

  async listByConversation(conversationId: string): Promise<readonly Participant[]> {
    return this.repository.listByConversation(conversationId);
  }
}
