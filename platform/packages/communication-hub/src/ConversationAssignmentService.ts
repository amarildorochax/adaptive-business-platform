import type { ConversationAssignment } from './ConversationAssignment';
import type { ConversationAssignmentRepository } from './ConversationAssignmentRepository';

/**
 * ConversationAssignmentService — atribuição do responsável humano por uma Conversation. Cobre
 * tanto a atribuição inicial (`AssignConversation`) quanto a transferência (`TransferConversation`)
 * com o mesmo método — ambas produzem, de forma idêntica, um novo registro de Conversation
 * Assignment; a diferença entre as duas é apenas de intenção (Command) e de contexto de chamada,
 * nunca de forma de dado, já que "toda Conversation possui, em um dado momento, exatamente um
 * Conversation Assignment válido" (Blueprint, Capítulo 7) já implica que atribuir sobre uma
 * atribuição existente é, estruturalmente, o mesmo que transferir.
 *
 * Inexistente em `src/core` ou `src/app` (IMP-003, Etapa 1); construído diretamente sobre o
 * contrato já existente.
 */
export class ConversationAssignmentService {
  constructor(private readonly repository: ConversationAssignmentRepository) {}

  async assign(conversationId: string, assigneeId: string): Promise<ConversationAssignment> {
    const assignment: ConversationAssignment = {
      conversationId,
      assigneeId,
      assignedAt: new Date(),
    };

    return this.repository.create(assignment);
  }

  async getCurrent(conversationId: string): Promise<ConversationAssignment | undefined> {
    return this.repository.getCurrent(conversationId);
  }
}
