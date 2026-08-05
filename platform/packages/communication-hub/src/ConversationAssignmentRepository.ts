import type { ConversationAssignment } from './ConversationAssignment';

/**
 * ConversationAssignmentRepository — contrato de persistência de Conversation Assignment. Interface
 * apenas, per IMP-003, Etapa 7. `create` nunca substitui uma atribuição anterior — cada atribuição
 * (inicial ou por transferência) é um novo registro; `getCurrent` resolve qual delas é válida agora
 * (a mais recente por `assignedAt`), preservando o histórico completo de responsáveis.
 */
export interface ConversationAssignmentRepository {
  create(assignment: ConversationAssignment): Promise<ConversationAssignment>;
  getCurrent(conversationId: string): Promise<ConversationAssignment | undefined>;
  listByConversation(conversationId: string): Promise<readonly ConversationAssignment[]>;
}
