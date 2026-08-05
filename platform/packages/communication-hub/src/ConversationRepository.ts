import type { Conversation } from './Conversation';

/**
 * ConversationRepository — contrato de persistência de Conversation. Apenas a interface; nenhuma
 * implementação de armazenamento é fornecida por este pacote (IMP-003, Etapa 7 — mesma regra já
 * aplicada em `@abp/crm-hub` na IMP-002).
 */
export interface ConversationRepository {
  create(conversation: Conversation): Promise<Conversation>;
  update(conversation: Conversation): Promise<Conversation>;
  get(conversationId: string): Promise<Conversation | undefined>;
  list(tenantId: string): Promise<readonly Conversation[]>;
}
