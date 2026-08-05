import type { Message } from './Message';

/**
 * MessageRepository — contrato de persistência de Message. Interface apenas, per IMP-003, Etapa 7.
 * Deliberadamente sem `update` — Message é imutável após criação (Blueprint, Capítulo 7;
 * `COMMUNICATION_DOMAIN_BLUEPRINT.md`, "Message Immutability").
 */
export interface MessageRepository {
  create(message: Message): Promise<Message>;
  get(messageId: string): Promise<Message | undefined>;
  listByConversation(conversationId: string): Promise<readonly Message[]>;
}
