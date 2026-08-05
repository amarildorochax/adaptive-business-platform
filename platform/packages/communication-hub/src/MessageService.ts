import type { Message } from './Message';
import type { MessageRepository } from './MessageRepository';

/** Campos aceitos por `MessageService.create()` — nunca inclui `conversationId`, atribuído por quem orquestra (ver CommunicationManager). */
export type CreateMessageInput = Pick<Message, 'tenantId' | 'threadId' | 'channelId' | 'senderId' | 'content'>;

/**
 * MessageService — regra de negócio de Message, o Aggregate secundário sempre associado a uma
 * Conversation (regra `MessageBelongsToConversation`, já catalogada em `CommBusinessRule.ts`).
 * Inexistente em `src/core` ou `src/app` (IMP-003, Etapa 1); construído diretamente sobre o
 * contrato já existente. Não distingue, na sua própria estrutura, entre "enviar" e "receber" — a
 * diferença entre `SendMessage` e a chegada de uma Message externa é uma decisão de orquestração
 * do CommunicationManager (qual Evento publicar), nunca uma diferença na forma da Entidade em si,
 * já que Message não tem direção própria declarada no Blueprint.
 */
export class MessageService {
  constructor(private readonly repository: MessageRepository) {}

  async create(input: CreateMessageInput, conversationId: string): Promise<Message> {
    const message: Message = {
      messageId: crypto.randomUUID(),
      conversationId,
      createdAt: new Date(),
      ...input,
    };

    return this.repository.create(message);
  }

  async get(messageId: string): Promise<Message | undefined> {
    return this.repository.get(messageId);
  }

  async listByConversation(conversationId: string): Promise<readonly Message[]> {
    return this.repository.listByConversation(conversationId);
  }
}
